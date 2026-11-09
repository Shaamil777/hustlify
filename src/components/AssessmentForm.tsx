"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Briefcase, 
  Rocket, 
  CheckCircle2, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Send, 
  Mail, 
  Phone, 
  Sparkles, 
  AlertCircle,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Youtube
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

const STORAGE_KEY = "hustlify_draft_split_v2";

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
        setFormData((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch {}
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

  const handleAudioComplete = (question: "q8" | "q9" | "q22" | "q27", blob: Blob) => {
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

    const res = await fetch("/api/upload", { method: "POST", body: data });
    if (!res.ok) throw new Error(`Failed to upload ${fieldName}`);
    const json = await res.json();
    return json.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const uploadedUrls: Record<string, string> = {};

      if (voiceBlobs.q8) uploadedUrls.q8_voiceUrl = await uploadAudioBlob(voiceBlobs.q8, "q8_pain_point");
      if (voiceBlobs.q9) uploadedUrls.q9_voiceUrl = await uploadAudioBlob(voiceBlobs.q9, "q9_consultation_goal");
      if (voiceBlobs.q22) uploadedUrls.q22_voiceUrl = await uploadAudioBlob(voiceBlobs.q22, "q22_sales_strategy");
      if (voiceBlobs.q27) uploadedUrls.q27_voiceUrl = await uploadAudioBlob(voiceBlobs.q27, "q27_sales_training");

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
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      } catch {}
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      id: 0,
      stepNumber: "01",
      title: "Company Profile",
      desc: "Contact details & company info",
      icon: Building2,
    },
    {
      id: 1,
      stepNumber: "02",
      title: "Business & Operations",
      desc: "Questions 1–15 & voice notes",
      icon: Briefcase,
    },
    {
      id: 2,
      stepNumber: "03",
      title: "Sales & Lead Mgmt",
      desc: "Questions 16–28 & strategy",
      icon: Rocket,
    },
    {
      id: 3,
      stepNumber: "04",
      title: "Review & Submit",
      desc: "Verify answers & recordings",
      icon: CheckCircle2,
    },
  ];

  if (submitSuccess) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-14 text-center max-w-xl mx-auto shadow-2xl">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Assessment Received!
        </h2>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Thank you, <span className="font-semibold text-slate-900">{formData.contactPerson || "Partner"}</span>. Your business assessment and voice notes for{" "}
          <span className="font-semibold text-emerald-700">{formData.companyName || "your company"}</span> have been logged and synced to our team.
        </p>

        <div className="inline-block bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 mb-6 text-left">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Reference ID</div>
          <div className="text-lg font-mono font-bold text-emerald-700">{submissionId}</div>
        </div>

        <p className="text-xs text-slate-400">
          Our senior consultants will review your responses and connect via {formData.email || "email"} shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl xl:max-w-7xl w-full mx-auto bg-white rounded-3xl lg:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(15,23,42,0.14)] border border-slate-200/80 overflow-hidden flex flex-col lg:flex-row items-stretch min-h-[740px]">
      
      {/* =========================================================================
          LEFT PANEL: EMERALD GREEN GRADIENT WITH BRAND LOGO & STEP SELECTOR
      ========================================================================= */}
      <aside className="w-full lg:w-[380px] xl:w-[420px] emerald-hero-gradient text-white p-7 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden flex-shrink-0">
        
        {/* Top: Brand Logo placed in the exact position as the reference image */}
        <div className="space-y-7 relative z-10">
          <div className="flex flex-col items-center justify-center text-center">
            {/* Hustlify Brand Logo centered with white text */}
            <img
              src="/logo.png"
              alt="Hustlify Logo"
              className="h-14 sm:h-16 lg:h-[72px] w-auto object-contain mx-auto drop-shadow-sm"
            />
            <div className="text-xs text-white font-semibold tracking-wide mt-2.5">
              B2B Business Assessment & Strategy
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="pt-1">
            <div className="flex items-center justify-between text-[11px] text-emerald-200/90 font-medium mb-1.5 px-1">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Completed</span>
            </div>
            <div className="h-1.5 w-full bg-emerald-950/40 rounded-full overflow-hidden border border-emerald-400/20">
              <div
                className="h-full bg-emerald-300 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="space-y-2.5 pt-1">
            <div className="text-[11px] font-semibold tracking-wider uppercase text-emerald-200/80 px-1 pb-0.5">
              Assessment Steps
            </div>

            {steps.map((s) => {
              const isActive = currentStep === s.id;
              const isPast = currentStep > s.id;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentStep(s.id)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer flex items-center gap-3.5 group relative ${
                    isActive
                      ? "bg-white text-emerald-950 font-bold shadow-xl shadow-emerald-950/20 translate-x-1 border border-white"
                      : "bg-white/10 hover:bg-white/15 text-white/90 border border-white/10"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      isActive
                        ? "bg-emerald-600 text-white"
                        : isPast
                        ? "bg-emerald-400/20 text-emerald-200 border border-emerald-300/30"
                        : "bg-white/10 text-emerald-200"
                    }`}
                  >
                    {isPast ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <span className="text-xs font-mono font-bold">{s.stepNumber}</span>
                    )}
                  </div>

                  <div className="overflow-hidden flex-1">
                    <div className="text-xs sm:text-sm font-semibold truncate leading-tight">
                      {s.title}
                    </div>
                    <div
                      className={`text-[11px] truncate mt-0.5 font-normal ${
                        isActive ? "text-emerald-800" : "text-emerald-200/70"
                      }`}
                    >
                      {s.desc}
                    </div>
                  </div>

                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Contact / Help Info */}
        <div className="mt-8 pt-6 border-t border-white/15 space-y-4 relative z-10 text-xs">
          <div className="space-y-3">
            <a href="mailto:consult@hustlify.com" className="flex items-start gap-3 text-white hover:text-emerald-100 transition-colors">
              <Mail className="w-4 h-4 text-emerald-200 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold block text-white text-[11px]">Chat to our team</span>
                <span className="text-emerald-100/80 text-[11px]">consult@hustlify.com</span>
              </div>
            </a>

            <a href="tel:+15550192834" className="flex items-start gap-3 text-white hover:text-emerald-100 transition-colors">
              <Phone className="w-4 h-4 text-emerald-200 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold block text-white text-[11px]">Consultation inquiries</span>
                <span className="text-emerald-100/80 text-[11px]">+1 (555) 019-2834</span>
              </div>
            </a>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-emerald-200">
            <div className="flex items-center gap-3">
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="Twitter / X">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="YouTube">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="https://hustlify.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="Website">
                <Globe className="w-4 h-4" />
              </a>
            </div>

            <a
              href="/admin"
              className="text-[11px] text-emerald-200/90 hover:text-white transition-colors font-medium flex items-center gap-1"
              title="Internal Admin Portal"
            >
              <span>Admin</span>
              <ChevronRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          RIGHT PANEL: CLEAN, BALANCED FORM CARD (MATCHING UNTITLED UI STYLE)
      ========================================================================= */}
      <main className="flex-1 p-6 sm:p-9 lg:p-12 flex flex-col justify-between overflow-y-auto max-h-[900px] bg-white">
        <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
          
          {/* Header on right panel (Untitled UI style) */}
          <div className="space-y-2 border-b border-slate-100 pb-5">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {currentStep === 0 && "Got goals? We've got the expertise. Let's team up."}
              {currentStep === 1 && "1. Business & Operations Assessment"}
              {currentStep === 2 && "2. Sales & Lead Management"}
              {currentStep === 3 && "Review Your Responses"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {currentStep === 0 && "Tell us more about yourself, your organization, and what you've got in mind."}
              {currentStep === 1 && "Help Hustlify gain a better understanding of existing operations, sales workflows, and organizational friction (Questions 1–15)."}
              {currentStep === 2 && "Detail your acquisition pipeline, conversion rates, and sales leadership mechanics (Questions 16–28)."}
              {currentStep === 3 && "Review all answers and verify recorded voice notes before final submission."}
            </p>
          </div>

          {/* =====================================================================
              STEP 0 FIELDS: COMPANY & CONTACT INFO (Clean 2-Column Grid)
          ===================================================================== */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Your Name & Designation <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => updateField("contactPerson", e.target.value)}
                    placeholder="e.g. David Ross (Managing Director)"
                    className="w-full px-4 py-3 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Company / Organization Name <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => updateField("companyName", e.target.value)}
                    placeholder="e.g. Acme Enterprise Ltd."
                    className="w-full px-4 py-3 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Business Email Address <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="david@company.com"
                    className="w-full px-4 py-3 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Phone / WhatsApp Number <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Company Website
                  </label>
                  <input
                    type="url"
                    value={formData.website || ""}
                    onChange={(e) => updateField("website", e.target.value)}
                    placeholder="https://acme.com"
                    className="w-full px-4 py-3 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              STEP 1 FIELDS: 1. BUSINESS & OPERATIONS (Q1 - Q15)
          ===================================================================== */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Q1 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    1. Incentive per sale?
                  </label>
                  <input
                    type="text"
                    value={formData.q1_incentivePerSale}
                    onChange={(e) => updateField("q1_incentivePerSale", e.target.value)}
                    placeholder="e.g. 5% commission or $250 flat"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Q2 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    2. Current CRM tools in use?
                  </label>
                  <input
                    type="text"
                    value={formData.q2_currentCrmTools}
                    onChange={(e) => updateField("q2_currentCrmTools", e.target.value)}
                    placeholder="e.g. HubSpot, Zoho, Salesforce, Notion, Excel..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Q3 */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    3. Who is your target audience?
                  </label>
                  <textarea
                    rows={2}
                    value={formData.q3_targetAudience}
                    onChange={(e) => updateField("q3_targetAudience", e.target.value)}
                    placeholder="e.g. Mid-sized B2B software founders, logistics companies..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Q4 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-2">
                    4. Product or service?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Product", "Service", "Both"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updateField("q4_productOrService", opt)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                          formData.q4_productOrService === opt
                            ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q5 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    5. Salary structure?
                  </label>
                  <input
                    type="text"
                    value={formData.q5_salaryStructure}
                    onChange={(e) => updateField("q5_salaryStructure", e.target.value)}
                    placeholder="e.g. Base salary + commission tiers"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Q6 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    6. Time & daily activities management?
                  </label>
                  <input
                    type="text"
                    value={formData.q6_timeManagement}
                    onChange={(e) => updateField("q6_timeManagement", e.target.value)}
                    placeholder="e.g. Google Calendar, Slack standups, Asana"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Q7 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    7. Employee resignations per year?
                  </label>
                  <input
                    type="text"
                    value={formData.q7_employeeResignationsPerYear}
                    onChange={(e) => updateField("q7_employeeResignationsPerYear", e.target.value)}
                    placeholder="e.g. 1-2 per year"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Q8: VOICE INPUT REQUIRED (Full Width) */}
                <div className="sm:col-span-2 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80">
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    8. What is your biggest business pain point? <span className="text-emerald-700 font-semibold">(Voice Note)</span>
                  </label>
                  <AudioRecorder
                    questionNumber={8}
                    label="Speak openly about operational bottlenecks, revenue leaks, or delays:"
                    onRecordingComplete={(blob) => handleAudioComplete("q8", blob)}
                    onDeleteRecording={() => handleDeleteAudio("q8")}
                    existingAudioUrl={voiceUrls.q8}
                  />
                  <textarea
                    rows={2}
                    value={formData.q8_biggestPainPoint}
                    onChange={(e) => updateField("q8_biggestPainPoint", e.target.value)}
                    placeholder="Optional written summary or notes..."
                    className="w-full mt-2.5 px-3.5 py-2 text-xs text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Q9: VOICE INPUT REQUIRED (Full Width) */}
                <div className="sm:col-span-2 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80">
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    9. What is the primary goal of this consultation? <span className="text-emerald-700 font-semibold">(Voice Note)</span>
                  </label>
                  <AudioRecorder
                    questionNumber={9}
                    label="Describe what a completely successful outcome looks like:"
                    onRecordingComplete={(blob) => handleAudioComplete("q9", blob)}
                    onDeleteRecording={() => handleDeleteAudio("q9")}
                    existingAudioUrl={voiceUrls.q9}
                  />
                  <textarea
                    rows={2}
                    value={formData.q9_consultationGoal}
                    onChange={(e) => updateField("q9_consultationGoal", e.target.value)}
                    placeholder="Optional written summary or notes..."
                    className="w-full mt-2.5 px-3.5 py-2 text-xs text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Q10 */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    10. Current project details?
                  </label>
                  <textarea
                    rows={2}
                    value={formData.q10_currentProjectDetails}
                    onChange={(e) => updateField("q10_currentProjectDetails", e.target.value)}
                    placeholder="Scope, deliverables, and current milestones..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Q11, 12, 13 (Grid) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    11. Projects onboarded?
                  </label>
                  <input
                    type="text"
                    value={formData.q11_projectsOnboarded}
                    onChange={(e) => updateField("q11_projectsOnboarded", e.target.value)}
                    placeholder="e.g. 15 clients"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    12. Total volume?
                  </label>
                  <input
                    type="text"
                    value={formData.q12_totalProjectVolume}
                    onChange={(e) => updateField("q12_totalProjectVolume", e.target.value)}
                    placeholder="e.g. $60k / mo"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    13. Projects completed?
                  </label>
                  <input
                    type="text"
                    value={formData.q13_projectsCompleted}
                    onChange={(e) => updateField("q13_projectsCompleted", e.target.value)}
                    placeholder="e.g. 100+"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Q15: Dashboard Reports */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-2">
                    15. Dashboard reports?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Yes", "No", "In Progress", "Partially"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updateField("q15_dashboardReports", opt)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                          formData.q15_dashboardReports === opt
                            ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q14: Social Links (Full Width) */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    14. Social media links (LinkedIn, X, Instagram, Facebook, etc.)
                  </label>
                  <SocialLinksInput
                    links={formData.q14_socialLinks}
                    onChange={(links: SocialLink[]) => updateField("q14_socialLinks", links)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              STEP 2 FIELDS: 2. SALES & LEAD MANAGEMENT (Q16 - Q28)
          ===================================================================== */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Q16 (Full Width) */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    16. What is your current lead conversion process?
                  </label>
                  <textarea
                    rows={2}
                    value={formData.q16_leadConversionProcess}
                    onChange={(e) => updateField("q16_leadConversionProcess", e.target.value)}
                    placeholder="e.g. Inbound form -> qualification call -> discovery demo -> contract"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Q17 & Q18 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    17. Industry / Field?
                  </label>
                  <input
                    type="text"
                    value={formData.q17_industryField}
                    onChange={(e) => updateField("q17_industryField", e.target.value)}
                    placeholder="e.g. B2B SaaS, Logistics, Consulting"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    18. Year Established?
                  </label>
                  <input
                    type="text"
                    value={formData.q18_establishedYear}
                    onChange={(e) => updateField("q18_establishedYear", e.target.value)}
                    placeholder="e.g. 2021"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Q19 & Q20 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    19. Sales Team Size?
                  </label>
                  <input
                    type="text"
                    value={formData.q19_salesTeamSize}
                    onChange={(e) => updateField("q19_salesTeamSize", e.target.value)}
                    placeholder="e.g. 4 closers + 2 SDRs"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    20. Sales Team Experience Level?
                  </label>
                  <input
                    type="text"
                    value={formData.q20_salesTeamExperience}
                    onChange={(e) => updateField("q20_salesTeamExperience", e.target.value)}
                    placeholder="e.g. 2 senior reps (5+ yrs), 2 juniors"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Q21 (Full Width) */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    21. Primary lead generation sources?
                  </label>
                  <input
                    type="text"
                    value={formData.q21_leadGenerationSources}
                    onChange={(e) => updateField("q21_leadGenerationSources", e.target.value)}
                    placeholder="e.g. LinkedIn Outbound, Ads, SEO, Word of mouth"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Q22: VOICE INPUT REQUIRED (Full Width) */}
                <div className="sm:col-span-2 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80">
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    22. What is your current sales and marketing strategy? <span className="text-emerald-700 font-semibold">(Voice Note)</span>
                  </label>
                  <AudioRecorder
                    questionNumber={22}
                    label="Describe how you position offerings, generate pipeline, and close deals:"
                    onRecordingComplete={(blob) => handleAudioComplete("q22", blob)}
                    onDeleteRecording={() => handleDeleteAudio("q22")}
                    existingAudioUrl={voiceUrls.q22}
                  />
                  <textarea
                    rows={2}
                    value={formData.q22_salesMarketingStrategy}
                    onChange={(e) => updateField("q22_salesMarketingStrategy", e.target.value)}
                    placeholder="Optional written summary or notes..."
                    className="w-full mt-2.5 px-3.5 py-2 text-xs text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Q23 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-2">
                    23. Dedicated sales lead or head?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Yes", "No", "Looking"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updateField("q23_dedicatedSalesLead", opt)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                          formData.q23_dedicatedSalesLead === opt
                            ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q24 & Q25 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    24. Current conversion ratio per month?
                  </label>
                  <input
                    type="text"
                    value={formData.q24_monthlyConversionRatio}
                    onChange={(e) => updateField("q24_monthlyConversionRatio", e.target.value)}
                    placeholder="e.g. 8%"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    25. Expected conversion ratio?
                  </label>
                  <input
                    type="text"
                    value={formData.q25_expectedConversionRatio}
                    onChange={(e) => updateField("q25_expectedConversionRatio", e.target.value)}
                    placeholder="e.g. 15% - 20%"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Q26 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    26. Biggest team challenges?
                  </label>
                  <input
                    type="text"
                    value={formData.q26_salesTeamChallenges}
                    onChange={(e) => updateField("q26_salesTeamChallenges", e.target.value)}
                    placeholder="e.g. Unqualified leads, slow follow-ups"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Q27: VOICE INPUT REQUIRED (Full Width) */}
                <div className="sm:col-span-2 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80">
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    27. What is your current sales training method? <span className="text-emerald-700 font-semibold">(Voice Note)</span>
                  </label>
                  <AudioRecorder
                    questionNumber={27}
                    label="How do you onboard new sales reps, review calls, and sharpen objection handling:"
                    onRecordingComplete={(blob) => handleAudioComplete("q27", blob)}
                    onDeleteRecording={() => handleDeleteAudio("q27")}
                    existingAudioUrl={voiceUrls.q27}
                  />
                  <textarea
                    rows={2}
                    value={formData.q27_salesTrainingMethod}
                    onChange={(e) => updateField("q27_salesTrainingMethod", e.target.value)}
                    placeholder="Optional written summary or notes..."
                    className="w-full mt-2.5 px-3.5 py-2 text-xs text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Q28 (Full Width) */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    28. Who are all involved in sales and lead management?
                  </label>
                  <input
                    type="text"
                    value={formData.q28_stakeholdersInvolved}
                    onChange={(e) => updateField("q28_stakeholdersInvolved", e.target.value)}
                    placeholder="e.g. Founder, 2 Closers, 1 SDR, Marketing agency"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              STEP 3 FIELDS: REVIEW & VERIFICATION
          ===================================================================== */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                  <div><span className="text-slate-400 font-medium">Company:</span> {formData.companyName || "Not provided"}</div>
                  <div><span className="text-slate-400 font-medium">Contact:</span> {formData.contactPerson || "Not provided"}</div>
                  <div><span className="text-slate-400 font-medium">Email:</span> {formData.email || "Not provided"}</div>
                  <div><span className="text-slate-400 font-medium">Phone:</span> {formData.phone || "Not provided"}</div>
                </div>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-emerald-950 text-xs uppercase tracking-wider">
                    Voice Recordings Status
                  </h3>
                  <span className="text-[11px] text-emerald-700 font-semibold">4 Strategic Questions</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">Q.8 Pain point</div>
                      <div className="text-[11px] text-slate-500">{voiceUrls.q8 ? "Recorded" : "Written only"}</div>
                    </div>
                    {voiceUrls.q8 ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Ready</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">Text</span>
                    )}
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">Q.9 Consultation goal</div>
                      <div className="text-[11px] text-slate-500">{voiceUrls.q9 ? "Recorded" : "Written only"}</div>
                    </div>
                    {voiceUrls.q9 ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Ready</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">Text</span>
                    )}
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">Q.22 Sales strategy</div>
                      <div className="text-[11px] text-slate-500">{voiceUrls.q22 ? "Recorded" : "Written only"}</div>
                    </div>
                    {voiceUrls.q22 ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Ready</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">Text</span>
                    )}
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">Q.27 Sales training</div>
                      <div className="text-[11px] text-slate-500">{voiceUrls.q27 ? "Recorded" : "Written only"}</div>
                    </div>
                    {voiceUrls.q27 ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Ready</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">Text</span>
                    )}
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              BOTTOM ACTION BUTTON (MATCHING UNTITLED UI "LET'S GET STARTED" PILL)
          ===================================================================== */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="py-3 px-5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
            ) : (
              <div />
            )}

            <div className={currentStep === 0 ? "w-full sm:w-auto" : ""}>
              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  className="w-full sm:w-auto py-3.5 px-8 rounded-full text-xs sm:text-sm font-bold bg-slate-950 hover:bg-slate-800 text-white shadow-xl shadow-slate-950/15 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  Continue to {steps[currentStep + 1].title} <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto py-4 px-10 rounded-full text-xs sm:text-sm font-extrabold bg-slate-950 hover:bg-slate-800 text-white shadow-xl shadow-slate-950/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Uploading & Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Let&apos;s get started! (Submit)
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Minimal draft reset */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Draft auto-saved in browser</span>
          <button
            type="button"
            onClick={() => {
              if (confirm("Reset and clear all answers?")) {
                localStorage.removeItem(STORAGE_KEY);
                setFormData(INITIAL_DATA);
                setVoiceBlobs({});
                setVoiceUrls({});
              }
            }}
            className="hover:text-rose-600 transition-colors underline cursor-pointer"
          >
            Clear form draft
          </button>
        </div>
      </main>
    </div>
  );
}
