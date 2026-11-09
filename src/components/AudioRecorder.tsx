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
  label = "Record your response (up to 3 minutes)",
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
        "Microphone access denied. Please grant microphone access in your browser."
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
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;
        ctx.fillStyle = "#171717";
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
    <div className="mt-2.5 p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/70">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-neutral-700 flex items-center gap-1.5">
          <Mic className="w-3.5 h-3.5 text-neutral-900" />
          Voice note
        </span>
        <span className="text-[11px] text-neutral-400 font-normal">
          {label}
        </span>
      </div>

      {permissionError && (
        <div className="flex items-center gap-2 p-2.5 mb-2.5 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-md">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{permissionError}</span>
        </div>
      )}

      {/* Case 1: Recording in progress */}
      {isRecording && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-3 py-2 bg-white rounded-md border border-neutral-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="font-medium text-neutral-800">Recording...</span>
            </div>
            <span className="font-mono text-neutral-600">
              {formatTime(recordingTime)} / 3:00
            </span>
          </div>

          <div className="h-9 w-full bg-white rounded-md border border-neutral-200 flex items-center justify-center px-2">
            <canvas ref={canvasRef} width={280} height={32} className="w-full h-7" />
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="w-full py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Square className="w-3 h-3 fill-white" />
            Finish Recording
          </button>
        </div>
      )}

      {/* Case 2: Audio recorded & ready */}
      {!isRecording && audioUrl && (
        <div className="space-y-2">
          <audio
            ref={audioPlayerRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleAudioEnded}
            onLoadedMetadata={handleTimeUpdate}
            className="hidden"
          />

          <div className="p-2.5 bg-white rounded-md border border-neutral-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-neutral-800 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Audio recorded
              </span>
              <span className="text-neutral-500 font-mono text-[11px]">
                {formatTime(currentTime)} / {formatTime(audioDuration || recordingTime)}
              </span>
            </div>

            {/* Playback progress bar */}
            <div
              className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden cursor-pointer"
              onClick={(e) => {
                if (!audioPlayerRef.current || !audioDuration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const clickPos = (e.clientX - rect.left) / rect.width;
                audioPlayerRef.current.currentTime = clickPos * audioDuration;
              }}
            >
              <div
                className="bg-neutral-900 h-full rounded-full transition-all duration-100"
                style={{
                  width: `${audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0}%`,
                }}
              />
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={togglePlay}
                className="flex-1 py-1.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-medium rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3 h-3 fill-neutral-800" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-neutral-800" /> Play
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="py-1.5 px-2.5 text-neutral-500 hover:text-rose-600 text-xs font-normal flex items-center gap-1 transition-colors cursor-pointer"
                title="Delete and re-record"
              >
                <RotateCcw className="w-3 h-3" />
                Re-record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Case 3: Idle state */}
      {!isRecording && !audioUrl && (
        <button
          type="button"
          onClick={startRecording}
          className="w-full py-2 px-3 bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs font-medium rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xl shadow-neutral-100"
        >
          <Mic className="w-3.5 h-3.5 text-neutral-600" />
          Click to record voice note
        </button>
      )}
    </div>
  );
}
