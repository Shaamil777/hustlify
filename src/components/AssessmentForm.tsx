"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Briefcase, 
  Rocket, 
  Mic, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Sparkles, 
  Save, 
  Send, 
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import confetti from "canvas-confetti";
import AudioRecorder from "./AudioRecorder";
import SocialLinksInput from "./SocialLinksInput";
import { AssessmentFormData, SocialLink } from "@/types/assessment";

const INITIAL_DATA: AssessmentFormData = {
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  website: "",

  q1_incentivePerSale: "",
  q2_currentCrmTools: "",
  q3_targetAudience: "",
  q4_productOrService: "",
  q5_salaryStructure: "",
  q6_timeManagement: "",
  q7_employeeResignationsPerYear: "",
  q8_biggestPainPoint: "",
  q9_consultationGoal: "",
  q10_currentProjectDetails: "",
  q11_projectsOnboarded: "",
  q12_totalProjectVolume: "",
  q13_projectsCompleted: "",
  q14_socialLinks: [
    { id: "1", platform: "linkedin", url: "" },
    { id: "2", platform: "website", url: "" },
  ],
  q15_dashboardReports: "",

  q16_leadConversionProcess: "",
  q17_industryField: "",
  q18_establishedYear: "",
  q19_salesTeamSize: "",
  q20_salesTeamExperience: "",
  q21_leadGenerationSources: "",
  q22_salesMarketingStrategy: "",
  q23_dedicatedSalesLead: "",
  q24_monthlyConversionRatio: "",
  q25_expectedConversionRatio: "",
  q26_salesTeamChallenges: "",
  q27_salesTrainingMethod: "",
  q28_stakeholdersInvolved: "",
};

const STORAGE_KEY = "hustlify_assessment_draft_v3";

export default function AssessmentForm() {
  const [formData, setFormData] = useState<AssessmentFormData>(INITIAL_DATA);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string>("");

  const [voiceBlobs, setVoiceBlobs] = useState<{
    q8?: Blob;
    q9?: Blob;
    q22?: Blob;
    q27?: Blob;
  }>({});

  const [voiceUrls, setVoiceUrls] = useState<{
    q8?: string;
    q9?: string;
    q22?: string;
    q27?: string;
  }>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn("Could not load draft", e);
    }
  }, []);

  const updateField = (field: keyof AssessmentFormData, value: unknown) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleAudioComplete = (
    question: "q8" | "q9" | "q22" | "q27",
    blob: Blob
  ) => {
    const previewUrl = URL.createObjectURL(blob);
    setVoiceBlobs((prev) => ({ ...prev, [question]: blob }));
    setVoiceUrls((prev) => ({ ...prev, [question]: previewUrl }));
  };

  const handleDeleteAudio = (question: "q8" | "q9" | "q22" | "q27") => {
    setVoiceBlobs((prev) => {
      const updated = { ...prev };
      delete updated[question];
      return updated;
    });
    setVoiceUrls((prev) => {
      const updated = { ...prev };
      if (updated[question] && updated[question]?.startsWith("blob:")) {
        URL.revokeObjectURL(updated[question]!);
      }
      delete updated[question];
      return updated;
    });
  };

  const uploadAudioBlob = async (blob: Blob, fieldName: string): Promise<string> => {
    const data = new FormData();
    data.append("file", blob, `${fieldName}_${Date.now()}.webm`);
    data.append("field", fieldName);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: data,
    });

    if (!res.ok) {
      throw new Error(`Failed to upload ${fieldName} audio`);
    }

    const json = await res.json();
    return json.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const uploadedUrls: Record<string, string> = {};

      if (voiceBlobs.q8) {
        uploadedUrls.q8_voiceUrl = await uploadAudioBlob(voiceBlobs.q8, "q8_pain_point");
      }
      if (voiceBlobs.q9) {
        uploadedUrls.q9_voiceUrl = await uploadAudioBlob(voiceBlobs.q9, "q9_consultation_goal");
      }
      if (voiceBlobs.q22) {
        uploadedUrls.q22_voiceUrl = await uploadAudioBlob(voiceBlobs.q22, "q22_sales_strategy");
      }
      if (voiceBlobs.q27) {
        uploadedUrls.q27_voiceUrl = await uploadAudioBlob(voiceBlobs.q27, "q27_sales_training");
      }

      const payload: AssessmentFormData = {
        ...formData,
        q8_voiceUrl: uploadedUrls.q8_voiceUrl || formData.q8_voiceUrl,
        q9_voiceUrl: uploadedUrls.q9_voiceUrl || formData.q9_voiceUrl,
        q22_voiceUrl: uploadedUrls.q22_voiceUrl || formData.q22_voiceUrl,
        q27_voiceUrl: uploadedUrls.q27_voiceUrl || formData.q27_voiceUrl,
      };

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit assessment");
      }

      const result = await res.json();
      setSubmissionId(result.id || "HT-" + Math.floor(100000 + Math.random() * 900000));
      setSubmitSuccess(true);
      localStorage.removeItem(STORAGE_KEY);

      try {
        confetti({
          particleCount: 110,
          spread: 85,
          origin: { y: 0.6 },
          colors: ["#3b82f6", "#6366f1", "#06b6d4", "#10b981"],
        });
      } catch {}
    } catch (err: unknown) {
      console.error("Submission failed:", err);
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const navCategories = [
    {
      index: 0,
      title: "Company Profile",
      subtitle: "Contact & Info",
      icon: Building2,
    },
    {
      index: 1,
      title: "Business & Ops",
      subtitle: "Questions 1–15",
      icon: Briefcase,
    },
    {
      index: 2,
      title: "Sales & Leads",
      subtitle: "Questions 16–28",
      icon: Rocket,
    },
    {
      index: 3,
      title: "Review & Voice",
      subtitle: "Check & Submit",
      icon: Mic,
    },
  ];

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="card-executive p-8 md:p-12 rounded-3xl text-center relative overflow-hidden shadow-2xl border border-indigo-100">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-indigo-100">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 mb-4 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Assessment Successfully Received
          </span>

          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">
            Thank you, {formData.contactPerson || "Partner"}!
          </h2>

          <p className="text-sm text-slate-600 max-w-lg mx-auto mb-8 leading-relaxed">
            Your assessment answers and audio notes for{" "}
            <span className="text-indigo-600 font-bold">{formData.companyName || "your company"}</span> have
            been securely logged and synced to our team&apos;s Google Sheet.
          </p>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block mb-8 text-left">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
              Assessment Reference ID
            </div>
            <div className="text-xl font-mono font-bold text-indigo-600">{submissionId}</div>
          </div>

          <div className="text-xs text-slate-500 max-w-md mx-auto pt-4 border-t border-slate-200">
            Our B2B consulting specialists will review your requirements and reach out via {formData.email || "email"}.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* =========================================================================
          HERO EXECUTIVE BANNER (MIDNIGHT NAVY & SLATE INDIGO)
      ========================================================================= */}
      <section className="hero-executive-gradient pt-12 pb-28 md:pb-32 px-4 text-white text-center relative shadow-xl">
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          
          {/* Logo Placeholder slot (Ready for image logo) */}
          <div className="inline-flex items-center justify-center gap-2.5 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-sm mb-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-black flex items-center justify-center text-sm shadow-sm">
              H
            </div>
            {/* When you have the logo image file, you can replace this with: <img src="/logo.png" alt="Hustlify Logo" className="h-7 w-auto object-contain" /> */}
            <span className="font-bold tracking-tight text-white text-base">HUSTLIFY</span>
            <span className="text-[11px] font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full">
              B2B Consulting
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-sm">
            Hustlify – B2B Business Assessment Form
          </h1>

          <p className="text-xs md:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            This assessment form is designed to help Hustlify gain a better understanding of your business, existing operations, sales and marketing strategies, lead management processes, and organizational challenges.
          </p>
        </div>
      </section>

      {/* =========================================================================
          FLOATING CATEGORY CARDS (OVERLAPPING THE HEADER SEAM)
      ========================================================================= */}
      <div className="max-w-4xl mx-auto px-4 -mt-14 md:-mt-16 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {navCategories.map((cat) => {
            const Icon = cat.icon;
            const isActive = currentStep === cat.index;

            return (
              <button
                key={cat.index}
                type="button"
                onClick={() => setCurrentStep(cat.index)}
                className={`nav-executive-card p-4 md:p-5 rounded-2xl md:rounded-3xl text-center relative transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isActive
                    ? "bg-white shadow-2xl shadow-indigo-900/15 border-2 border-indigo-600 text-slate-900"
                    : "bg-white/95 backdrop-blur-sm border border-slate-200/90 text-slate-600 hover:text-slate-900 shadow-md"
                }`}
              >
                {/* Active pointer */}
                {isActive && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-indigo-600 rotate-45" />
                )}

                <div
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-2.5 transition-colors ${
                    isActive
                      ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/25"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon className="w-6 h-6 md:w-7 md:h-7" />
                </div>

                <div className="font-bold text-xs md:text-sm text-slate-900 truncate w-full">
                  {cat.title}
                </div>
                <div className="text-[11px] text-slate-400 font-medium truncate w-full mt-0.5">
                  {cat.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          BODY QUESTIONS CONTAINER
      ========================================================================= */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* =====================================================================
              STEP 0: COMPANY & CONTACT INFO
          ===================================================================== */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="text-center md:text-left mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center justify-center md:justify-start gap-2">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                  Company Profile & Point of Contact
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Tell us about your organization and how our senior consultants can connect with you.
                </p>
              </div>

              <div className="card-executive p-6 md:p-8 rounded-3xl space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Company / Organization Name <span className="text-indigo-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => updateField("companyName", e.target.value)}
                      placeholder="e.g. Nexus Enterprise Ltd."
                      className="w-full px-4 py-3 text-xs text-slate-800 input-executive rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Contact Person & Designation <span className="text-indigo-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactPerson}
                      onChange={(e) => updateField("contactPerson", e.target.value)}
                      placeholder="e.g. David Ross (Managing Director)"
                      className="w-full px-4 py-3 text-xs text-slate-800 input-executive rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Official Email Address <span className="text-indigo-600">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="david@nexus.com"
                      className="w-full px-4 py-3 text-xs text-slate-800 input-executive rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Phone / WhatsApp Number <span className="text-indigo-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+1 (555) 234-5678"
                      className="w-full px-4 py-3 text-xs text-slate-800 input-executive rounded-xl"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Company Website
                    </label>
                    <input
                      type="url"
                      value={formData.website || ""}
                      onChange={(e) => updateField("website", e.target.value)}
                      placeholder="https://nexus.com"
                      className="w-full px-4 py-3 text-xs text-slate-800 input-executive rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              STEP 1: SECTION 1 (BUSINESS & OPERATIONS - Q1 TO Q15)
          ===================================================================== */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center md:text-left mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
                  Section 1 of 2
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center justify-center md:justify-start gap-2">
                  <Briefcase className="w-6 h-6 text-indigo-600" />
                  Business & Operations (Questions 1 – 15)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Answer the operational questions below. Questions 8 and 9 feature voice recording inputs.
                </p>
              </div>

              {/* Questions as Individual Elevated Cards */}
              <div className="space-y-4">
                
                {/* Q1 */}
                <div className="card-executive p-5 md:p-6 rounded-2xl">
                  <div className="flex items-start justify-between gap-3">
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      1. Incentive per sale?
                    </label>
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      1
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.q1_incentivePerSale}
                    onChange={(e) => updateField("q1_incentivePerSale", e.target.value)}
                    placeholder="e.g. 5% commission per closed contract or $300 flat bonus"
                    className="w-full px-4 py-2.5 text-xs text-slate-800 input-executive rounded-xl"
                  />
                </div>

                {/* Q2 */}
                <div className="card-executive p-5 md:p-6 rounded-2xl">
                  <div className="flex items-start justify-between gap-3">
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      2. Which CRM tools are you currently using?
                    </label>
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      2
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.q2_currentCrmTools}
                    onChange={(e) => updateField("q2_currentCrmTools", e.target.value)}
                    placeholder="e.g. HubSpot, Zoho CRM, Salesforce, Pipedrive, or Excel"
                    className="w-full px-4 py-2.5 text-xs text-slate-800 input-executive rounded-xl"
                  />
                </div>

                {/* Q3 */}
                <div className="card-executive p-5 md:p-6 rounded-2xl">
                  <div className="flex items-start justify-between gap-3">
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      3. Who is your target audience?
                    </label>
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      3
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={formData.q3_targetAudience}
                    onChange={(e) => updateField("q3_targetAudience", e.target.value)}
                    placeholder="e.g. B2B enterprise tech buyers, real estate agency owners, dentists..."
                    className="w-full px-4 py-2.5 text-xs text-slate-800 input-executive rounded-xl"
                  />
                </div>

                {/* Q4 */}
                <div className="card-executive p-5 md:p-6 rounded-2xl">
                  <div className="flex items-start justify-between gap-3">
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      4. Are you marketing a product or providing a service?
                    </label>
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      4
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {["Product", "Service", "Both"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updateField("q4_productOrService", opt)}
                        className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          formData.q4_productOrService === opt
                            ? "bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-600/20"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q5 */}
                <div className="card-executive p-5 md:p-6 rounded-2xl">
                  <div className="flex items-start justify-between gap-3">
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      5. What is the current salary structure?
                    </label>
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      5
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.q5_salaryStructure}
                    onChange={(e) => updateField("q5_salaryStructure", e.target.value)}
                    placeholder="e.g. Fixed base salary + variable commission tier, or contract retainer"
                    className="w-full px-4 py-2.5 text-xs text-slate-800 input-executive rounded-xl"
                  />
                </div>

                {/* Q6 */}
                <div className="card-executive p-5 md:p-6 rounded-2xl">
                  <div className="flex items-start justify-between gap-3">
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      6. How do you manage time and daily activities?
                    </label>
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      6
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.q6_timeManagement}
                    onChange={(e) => updateField("q6_timeManagement", e.target.value)}
                    placeholder="e.g. Google Calendar time blocking, Slack standups, ClickUp, Asana"
                    className="w-full px-4 py-2.5 text-xs text-slate-800 input-executive rounded-xl"
                  />
                </div>

                {/* Q7 */}
                <div className="card-executive p-5 md:p-6 rounded-2xl">
                  <div className="flex items-start justify-between gap-3">
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      7. How many employee resignations occur per year?
                    </label>
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      7
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.q7_employeeResignationsPerYear}
                    onChange={(e) => updateField("q7_employeeResignationsPerYear", e.target.value)}
                    placeholder="e.g. 1-2 per year (< 8% turnover)"
                    className="w-full px-4 py-2.5 text-xs text-slate-800 input-executive rounded-xl"
                  />
                </div>

                {/* Q8: VOICE INPUT REQUIRED */}
                <div className="card-executive p-5 md:p-6 rounded-2xl border-2 border-indigo-200 bg-gradient-to-b from-white to-indigo-50/20">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-indigo-100 text-indigo-800">
                          🎙️ Voice Recording Required
                        </span>
                      </div>
                      <label className="block text-sm font-bold text-slate-900 mt-1 mb-1">
                        8. What is your biggest business pain point?
                      </label>
                      <p className="text-xs text-slate-500">
                        Speak candidly about bottlenecks, revenue leaks, or friction in your workflows.
                      </p>
                    </div>
                    <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                      8
                    </span>
                  </div>

                  <AudioRecorder
                    questionNumber={8}
                    label="Record a voice note describing your biggest business pain point:"
                    onRecordingComplete={(blob) => handleAudioComplete("q8", blob)}
                    onDeleteRecording={() => handleDeleteAudio("q8")}
                    existingAudioUrl={voiceUrls.q8}
                  />

                  <div className="mt-3">
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Optional written summary / notes:
                    </label>
                    <textarea
                      rows={2}
                      value={formData.q8_biggestPainPoint}
                      onChange={(e) => updateField("q8_biggestPainPoint", e.target.value)}
                      placeholder="Add key highlights or bullet points here..."
                      className="w-full px-4 py-2 text-xs text-slate-800 input-executive rounded-xl"
                    />
                  </div>
                </div>

                {/* Q9: VOICE INPUT REQUIRED */}
                <div className="card-executive p-5 md:p-6 rounded-2xl border-2 border-indigo-200 bg-gradient-to-b from-white to-indigo-50/20">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-indigo-100 text-indigo-800">
                          🎙️ Voice Recording Required
                        </span>
                      </div>
                      <label className="block text-sm font-bold text-slate-900 mt-1 mb-1">
                        9. What is the primary goal of this consultation?
                      </label>
                      <p className="text-xs text-slate-500">
                        What does a 10/10 outcome look like for your business after this assessment?
                      </p>
                    </div>
                    <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                      9
                    </span>
                  </div>

                  <AudioRecorder
                    questionNumber={9}
                    label="Record your primary consultation goals and expected outcomes:"
                    onRecordingComplete={(blob) => handleAudioComplete("q9", blob)}
                    onDeleteRecording={() => handleDeleteAudio("q9")}
                    existingAudioUrl={voiceUrls.q9}
                  />

                  <div className="mt-3">
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Optional written summary / notes:
                    </label>
                    <textarea
                      rows={2}
                      value={formData.q9_consultationGoal}
                      onChange={(e) => updateField("q9_consultationGoal", e.target.value)}
                      placeholder="Key targets, metrics, or timeline..."
                      className="w-full px-4 py-2 text-xs text-slate-800 input-executive rounded-xl"
                    />
                  </div>
                </div>

                {/* Q10 */}
                <div className="card-executive p-5 md:p-6 rounded-2xl">
                  <div className="flex items-start justify-between gap-3">
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      10. Can you explain your current project details?
                    </label>
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      10
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={formData.q10_currentProjectDetails}
                    onChange={(e) => updateField("q10_currentProjectDetails", e.target.value)}
                    placeholder="Active projects, deliverables, client commitments..."
                    className="w-full px-4 py-2.5 text-xs text-slate-800 input-executive rounded-xl"
                  />
                </div>

                {/* Q11, 12, 13 (Grid) */}
                <div className="card-executive p-5 md:p-6 rounded-2xl space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Project Volume & Delivery Stats
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        11. Projects onboarded?
                      </label>
                      <input
                        type="text"
                        value={formData.q11_projectsOnboarded}
                        onChange={(e) => updateField("q11_projectsOnboarded", e.target.value)}
                        placeholder="e.g. 18 clients"
                        className="w-full px-3.5 py-2 text-xs text-slate-800 input-executive rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        12. Total project volume?
                      </label>
                      <input
                        type="text"
                        value={formData.q12_totalProjectVolume}
                        onChange={(e) => updateField("q12_totalProjectVolume", e.target.value)}
                        placeholder="e.g. $80,000 / mo"
                        className="w-full px-3.5 py-2 text-xs text-slate-800 input-executive rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        13. Projects completed?
                      </label>
                      <input
                        type="text"
                        value={formData.q13_projectsCompleted}
                        onChange={(e) => updateField("q13_projectsCompleted", e.target.value)}
                        placeholder="e.g. 140+ projects"
                        className="w-full px-3.5 py-2 text-xs text-slate-800 input-executive rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Q14: Social Media Links */}
                <div className="card-executive p-5 md:p-6 rounded-2xl">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <label className="block text-sm font-bold text-slate-900">
                        14. Can you share your social media links?
                      </label>
                      <p className="text-xs text-slate-500">
                        Add links for LinkedIn, X/Twitter, Instagram, Facebook, YouTube, or your website.
                      </p>
                    </div>
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      14
                    </span>
                  </div>
                  <SocialLinksInput
                    links={formData.q14_socialLinks}
                    onChange={(links: SocialLink[]) => updateField("q14_socialLinks", links)}
                  />
                </div>

                {/* Q15: Dashboard Reports */}
                <div className="card-executive p-5 md:p-6 rounded-2xl">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <label className="block text-sm font-bold text-slate-900">
                      15. Do you maintain dashboard reports?
                    </label>
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      15
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Yes", "No", "In Progress", "Partially"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updateField("q15_dashboardReports", opt)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          formData.q15_dashboardReports === opt
                            ? "bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-600/20"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              STEP 2: SECTION 2 (SALES & LEAD MANAGEMENT - Q16 TO Q28)
          ===================================================================== */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center md:text-left mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
                  Section 2 of 2
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center justify-center md:justify-start gap-2">
                  <Rocket className="w-6 h-6 text-indigo-600" />
                  Sales & Lead Management (Questions 16 – 28)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Detail your customer acquisition mechanics. Questions 22 and 27 feature voice recording inputs.
                </p>
              </div>

              <div className="space-y-4">
                {/* Q16 */}
                <div className="card-executive p-5 md:p-6 rounded-2xl">
                  <div className="flex items-start justify-between gap-3">
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      16. What is your current lead conversion process?
                    </label>
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      16
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={formData.q16_leadConversionProcess}
                    onChange={(e) => updateField("q16_leadConversionProcess", e.target.value)}
                    placeholder="e.g. Inbound inquiry -> automated qualifying email -> Discovery Zoom call -> Proposal -> Contract"
                    className="w-full px-4 py-2.5 text-xs text-slate-800 input-executive rounded-xl"
                  />
                </div>

                {/* Q17 & Q18 */}
                <div className="card-executive p-5 md:p-6 rounded-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        17. Industry / Field?
                      </label>
                      <input
                        type="text"
                        value={formData.q17_industryField}
                        onChange={(e) => updateField("q17_industryField", e.target.value)}
                        placeholder="e.g. B2B SaaS, Logistics, Marketing..."
                        className="w-full px-3.5 py-2 text-xs text-slate-800 input-executive rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        18. Year Established?
                      </label>
                      <input
                        type="text"
                        value={formData.q18_establishedYear}
                        onChange={(e) => updateField("q18_establishedYear", e.target.value)}
                        placeholder="e.g. 2020"
                        className="w-full px-3.5 py-2 text-xs text-slate-800 input-executive rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Q19 & Q20 */}
                <div className="card-executive p-5 md:p-6 rounded-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        19. Sales Team Size?
                      </label>
                      <input
                        type="text"
                        value={formData.q19_salesTeamSize}
                        onChange={(e) => updateField("q19_salesTeamSize", e.target.value)}
                        placeholder="e.g. 5 closers + 2 SDRs"
                        className="w-full px-3.5 py-2 text-xs text-slate-800 input-executive rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        20. Team Experience Level?
                      </label>
                      <input
                        type="text"
                        value={formData.q20_salesTeamExperience}
                        onChange={(e) => updateField("q20_salesTeamExperience", e.target.value)}
                        placeholder="e.g. 2 senior reps (5+ yrs), 3 juniors"
                        className="w-full px-3.5 py-2 text-xs text-slate-800 input-executive rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Q21 */}
                <div className="card-executive p-5 md:p-6 rounded-2xl">
                  <div className="flex items-start justify-between gap-3">
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      21. Primary lead generation sources?
                    </label>
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      21
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.q21_leadGenerationSources}
                    onChange={(e) => updateField("q21_leadGenerationSources", e.target.value)}
                    placeholder="e.g. LinkedIn Outbound, Meta Ads, SEO, Word-of-Mouth, Partner Referrals"
                    className="w-full px-4 py-2.5 text-xs text-slate-800 input-executive rounded-xl"
                  />
                </div>

                {/* Q22: VOICE INPUT REQUIRED */}
                <div className="card-executive p-5 md:p-6 rounded-2xl border-2 border-indigo-200 bg-gradient-to-b from-white to-indigo-50/20">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-indigo-100 text-indigo-800">
                          🎙️ Voice Recording Required
                        </span>
                      </div>
                      <label className="block text-sm font-bold text-slate-900 mt-1 mb-1">
                        22. What is your current sales and marketing strategy?
                      </label>
                      <p className="text-xs text-slate-500">
                        Describe how you position offerings, build pipeline, and guide buyers to signature.
                      </p>
                    </div>
                    <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                      22
                    </span>
                  </div>

                  <AudioRecorder
                    questionNumber={22}
                    label="Record a voice note about your sales and marketing strategy:"
                    onRecordingComplete={(blob) => handleAudioComplete("q22", blob)}
                    onDeleteRecording={() => handleDeleteAudio("q22")}
                    existingAudioUrl={voiceUrls.q22}
                  />

                  <div className="mt-3">
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Optional written summary / notes:
                    </label>
                    <textarea
                      rows={2}
                      value={formData.q22_salesMarketingStrategy}
                      onChange={(e) => updateField("q22_salesMarketingStrategy", e.target.value)}
                      placeholder="Target accounts, messaging angles, ad campaigns..."
                      className="w-full px-4 py-2 text-xs text-slate-800 input-executive rounded-xl"
                    />
                  </div>
                </div>

                {/* Q23 */}
                <div className="card-executive p-5 md:p-6 rounded-2xl">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <label className="block text-sm font-bold text-slate-900">
                      23. Do you have a dedicated sales lead or sales head?
                    </label>
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      23
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {["Yes", "No", "Looking to hire"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updateField("q23_dedicatedSalesLead", opt)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          formData.q23_dedicatedSalesLead === opt
                            ? "bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-600/20"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q24 & Q25 */}
                <div className="card-executive p-5 md:p-6 rounded-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        24. Current conversion ratio per month?
                      </label>
                      <input
                        type="text"
                        value={formData.q24_monthlyConversionRatio}
                        onChange={(e) => updateField("q24_monthlyConversionRatio", e.target.value)}
                        placeholder="e.g. 7% (7 deals per 100 discovery calls)"
                        className="w-full px-3.5 py-2 text-xs text-slate-800 input-executive rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        25. Expected conversion ratio?
                      </label>
                      <input
                        type="text"
                        value={formData.q25_expectedConversionRatio}
                        onChange={(e) => updateField("q25_expectedConversionRatio", e.target.value)}
                        placeholder="e.g. 15% - 20%"
                        className="w-full px-3.5 py-2 text-xs text-slate-800 input-executive rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Q26 */}
                <div className="card-executive p-5 md:p-6 rounded-2xl">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <label className="block text-sm font-bold text-slate-900">
                      26. What are the biggest challenges faced by your sales team?
                    </label>
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      26
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={formData.q26_salesTeamChallenges}
                    onChange={(e) => updateField("q26_salesTeamChallenges", e.target.value)}
                    placeholder="e.g. Inconsistent lead flow, slow prospect response times, manual spreadsheet updates..."
                    className="w-full px-4 py-2.5 text-xs text-slate-800 input-executive rounded-xl"
                  />
                </div>

                {/* Q27: VOICE INPUT REQUIRED */}
                <div className="card-executive p-5 md:p-6 rounded-2xl border-2 border-indigo-200 bg-gradient-to-b from-white to-indigo-50/20">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-indigo-100 text-indigo-800">
                          🎙️ Voice Recording Required
                        </span>
                      </div>
                      <label className="block text-sm font-bold text-slate-900 mt-1 mb-1">
                        27. What is your current sales training method?
                      </label>
                      <p className="text-xs text-slate-500">
                        How do you onboard new reps, review sales recordings, and sharpen closing skills?
                      </p>
                    </div>
                    <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                      27
                    </span>
                  </div>

                  <AudioRecorder
                    questionNumber={27}
                    label="Record a voice note about your sales training method:"
                    onRecordingComplete={(blob) => handleAudioComplete("q27", blob)}
                    onDeleteRecording={() => handleDeleteAudio("q27")}
                    existingAudioUrl={voiceUrls.q27}
                  />

                  <div className="mt-3">
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Optional written summary / notes:
                    </label>
                    <textarea
                      rows={2}
                      value={formData.q27_salesTrainingMethod}
                      onChange={(e) => updateField("q27_salesTrainingMethod", e.target.value)}
                      placeholder="Script playbooks, weekly call reviews, roleplay sessions..."
                      className="w-full px-4 py-2 text-xs text-slate-800 input-executive rounded-xl"
                    />
                  </div>
                </div>

                {/* Q28 */}
                <div className="card-executive p-5 md:p-6 rounded-2xl">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <label className="block text-sm font-bold text-slate-900">
                      28. Who are all involved in this sales and lead management?
                    </label>
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      28
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.q28_stakeholdersInvolved}
                    onChange={(e) => updateField("q28_stakeholdersInvolved", e.target.value)}
                    placeholder="e.g. Founder, Head of Growth, 3 Account Executives, External Agency"
                    className="w-full px-4 py-2.5 text-xs text-slate-800 input-executive rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              STEP 3: REVIEW & VOICE NOTES VERIFICATION
          ===================================================================== */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center md:text-left mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center justify-center md:justify-start gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  Review Answers & Submit Assessment
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Double check your core information and verify that all 4 voice recordings are captured.
                </p>
              </div>

              {/* Profile Card */}
              <div className="card-executive p-6 rounded-2xl space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Client Profile
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Company:</span>
                    <span className="font-bold text-slate-800">{formData.companyName || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Contact:</span>
                    <span className="font-bold text-slate-800">{formData.contactPerson || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Email:</span>
                    <span className="font-bold text-slate-800">{formData.email || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Phone:</span>
                    <span className="font-bold text-slate-800">{formData.phone || "Not provided"}</span>
                  </div>
                </div>
              </div>

              {/* Voice Notes Checklist */}
              <div className="card-executive p-6 rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50/60 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <Mic className="w-4 h-4 text-indigo-600" />
                    Voice Recordings Status
                  </span>
                  <span className="text-xs text-slate-500">4 Key Strategic Questions</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <div>
                      <div className="font-bold text-slate-800">Q.8 Biggest Pain Point</div>
                      <div className="text-[11px] text-slate-500">
                        {voiceUrls.q8 ? "Audio ready" : formData.q8_biggestPainPoint ? "Written summary only" : "Pending"}
                      </div>
                    </div>
                    {voiceUrls.q8 ? (
                      <span className="px-2.5 py-1 text-[11px] rounded-full bg-emerald-100 text-emerald-800 font-bold">Captured</span>
                    ) : (
                      <span className="px-2.5 py-1 text-[11px] rounded-full bg-indigo-50 text-indigo-800 font-bold">Text Only</span>
                    )}
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <div>
                      <div className="font-bold text-slate-800">Q.9 Consultation Goal</div>
                      <div className="text-[11px] text-slate-500">
                        {voiceUrls.q9 ? "Audio ready" : formData.q9_consultationGoal ? "Written summary only" : "Pending"}
                      </div>
                    </div>
                    {voiceUrls.q9 ? (
                      <span className="px-2.5 py-1 text-[11px] rounded-full bg-emerald-100 text-emerald-800 font-bold">Captured</span>
                    ) : (
                      <span className="px-2.5 py-1 text-[11px] rounded-full bg-indigo-50 text-indigo-800 font-bold">Text Only</span>
                    )}
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <div>
                      <div className="font-bold text-slate-800">Q.22 Sales Strategy</div>
                      <div className="text-[11px] text-slate-500">
                        {voiceUrls.q22 ? "Audio ready" : formData.q22_salesMarketingStrategy ? "Written summary only" : "Pending"}
                      </div>
                    </div>
                    {voiceUrls.q22 ? (
                      <span className="px-2.5 py-1 text-[11px] rounded-full bg-emerald-100 text-emerald-800 font-bold">Captured</span>
                    ) : (
                      <span className="px-2.5 py-1 text-[11px] rounded-full bg-indigo-50 text-indigo-800 font-bold">Text Only</span>
                    )}
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <div>
                      <div className="font-bold text-slate-800">Q.27 Sales Training Method</div>
                      <div className="text-[11px] text-slate-500">
                        {voiceUrls.q27 ? "Audio ready" : formData.q27_salesTrainingMethod ? "Written summary only" : "Pending"}
                      </div>
                    </div>
                    {voiceUrls.q27 ? (
                      <span className="px-2.5 py-1 text-[11px] rounded-full bg-emerald-100 text-emerald-800 font-bold">Captured</span>
                    ) : (
                      <span className="px-2.5 py-1 text-[11px] rounded-full bg-indigo-50 text-indigo-800 font-bold">Text Only</span>
                    )}
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                  <span>{submitError}</span>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              NAVIGATION BOTTOM ACTION BAR
          ===================================================================== */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="w-full sm:w-auto py-3 px-6 rounded-2xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous Step
              </button>
            ) : (
              <div />
            )}

            <div className="w-full sm:w-auto">
              {currentStep < navCategories.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  className="w-full sm:w-auto py-3.5 px-8 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  Save & Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto py-4 px-10 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:opacity-95 shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Uploading Voice Notes & Syncing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Submit Assessment
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Footer Draft status */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2 border-t border-slate-200 pt-4">
          <span className="flex items-center gap-1.5">
            <Save className="w-3.5 h-3.5 text-slate-400" />
            Your draft progress is auto-saved locally in your browser.
          </span>
          <button
            type="button"
            onClick={() => {
              if (confirm("Reset and clear all saved answers?")) {
                localStorage.removeItem(STORAGE_KEY);
                setFormData(INITIAL_DATA);
                setVoiceBlobs({});
                setVoiceUrls({});
              }
            }}
            className="hover:text-rose-500 transition-colors underline cursor-pointer"
          >
            Clear draft answers
          </button>
        </div>
      </main>
    </div>
  );
}
