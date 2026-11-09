"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, RotateCcw, AlertCircle, Check } from "lucide-react";

interface AudioRecorderProps {
  questionNumber: number;
  label?: string;
  onRecordingComplete: (blob: Blob, duration: number) => void;
  onDeleteRecording: () => void;
  existingAudioUrl?: string;
}

export default function AudioRecorder({
  questionNumber,
  label = "Record your voice response (up to 3 mins)",
  onRecordingComplete,
  onDeleteRecording,
  existingAudioUrl,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudioUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (existingAudioUrl) {
      setAudioUrl(existingAudioUrl);
    }
  }, [existingAudioUrl]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const startRecording = async () => {
    setPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioCtx();
        const analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 64;
        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;

        drawWaveform();
      } catch (e) {
        console.warn("Waveform not supported:", e);
      }

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(audioBlob, recordingTime);

        stream.getTracks().forEach((track) => track.stop());

        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
          audioContextRef.current.close().catch(() => {});
        }
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 179) {
            stopRecording();
            return 180;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: unknown) {
      console.error("Microphone access error:", err);
      setPermissionError(
        "Microphone access denied. Please grant microphone permissions in your browser."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, "#2563eb");
        gradient.addColorStop(1, "#38bdf8");

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
      }
    };
    render();
  };

  const togglePlay = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioPlayerRef.current) {
      setCurrentTime(audioPlayerRef.current.currentTime);
      setAudioDuration(audioPlayerRef.current.duration || 0);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleDelete = () => {
    if (audioUrl && audioUrl.startsWith("blob:")) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setAudioDuration(0);
    setRecordingTime(0);
    onDeleteRecording();
  };

  return (
    <div className="mt-3 p-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50/80 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
          <Mic className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          Voice Note Required (Q.{questionNumber})
        </span>
        <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100/70 px-2.5 py-0.5 rounded-full">
          Max 3 mins
        </span>
      </div>

      <p className="text-xs text-slate-600 mb-3">{label}</p>

      {permissionError && (
        <div className="flex items-center gap-2 p-3 mb-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
          <span>{permissionError}</span>
        </div>
      )}

      {/* Case 1: Recording in progress */}
      {isRecording && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900 text-white rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-semibold text-rose-400">Recording live...</span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-200">
              {formatTime(recordingTime)} / 3:00
            </span>
          </div>

          <div className="relative h-12 w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center px-2 shadow-inner">
            <canvas ref={canvasRef} width={280} height={40} className="w-full h-10" />
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 transition-all cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-white" />
            Stop & Save Voice Recording
          </button>
        </div>
      )}

      {/* Case 2: Audio recorded & ready for preview */}
      {!isRecording && audioUrl && (
        <div className="space-y-3">
          <audio
            ref={audioPlayerRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleAudioEnded}
            onLoadedMetadata={handleTimeUpdate}
            className="hidden"
          />

          <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <Check className="w-4 h-4 text-emerald-600" />
                Voice Note Captured
              </span>
              <span className="text-slate-500 font-mono text-[11px]">
                {formatTime(currentTime)} / {formatTime(audioDuration || recordingTime)}
              </span>
            </div>

            {/* Playback progress bar */}
            <div
              className="w-full bg-slate-100 h-2 rounded-full overflow-hidden cursor-pointer"
              onClick={(e) => {
                if (!audioPlayerRef.current || !audioDuration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const clickPos = (e.clientX - rect.left) / rect.width;
                audioPlayerRef.current.currentTime = clickPos * audioDuration;
              }}
            >
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-100"
                style={{
                  width: `${audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0}%`,
                }}
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={togglePlay}
                className="flex-1 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 border border-indigo-200 transition-colors cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-indigo-900" /> Pause Preview
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-indigo-900" /> Play Voice Note
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="py-2 px-3 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
                title="Delete and re-record"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Re-record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Case 3: Idle / Ready to record */}
      {!isRecording && !audioUrl && (
        <button
          type="button"
          onClick={startRecording}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer group"
        >
          <Mic className="w-4 h-4 text-blue-200 group-hover:scale-110 transition-transform" />
          Click to Record Voice Note
        </button>
      )}
    </div>
  );
}
