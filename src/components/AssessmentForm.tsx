"use client";

import React, { useState, useEffect } from "react";
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Send, 
  Mic, 
  RotateCcw,
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

const STORAGE_KEY = "hustlify_draft_minimal";

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
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { title: "Contact", subtitle: "Company Profile" },
    { title: "Operations", subtitle: "Questions 1–15" },
    { title: "Sales", subtitle: "Questions 16–28" },
    { title: "Review", subtitle: "Submit" },
  ];

  if (submitSuccess) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-8 md:p-10 text-center shadow-sm">
          <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-5 text-neutral-900">
            <Check className="w-6 h-6 stroke-[2.5]" />
          </div>

          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            Assessment Received
          </h2>

          <p className="text-sm text-neutral-500 mb-6 leading-relaxed max-w-md mx-auto">
            Thank you, {formData.contactPerson || "Partner"}. Your responses for{" "}
            <span className="text-neutral-900 font-medium">{formData.companyName || "your company"}</span> have
            been securely logged and synced to our team.
          </p>

          <div className="inline-block bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2.5 mb-6 text-left">
            <div className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">Reference ID</div>
            <div className="text-sm font-mono font-semibold text-neutral-900">{submissionId}</div>
          </div>

          <p className="text-xs text-neutral-400">
            We will review your submission and reach out via {formData.email || "email"}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-16">
      
      {/* Minimal Header */}
      <header className="mb-10 text-left">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-5 h-5 rounded bg-neutral-900 text-white font-bold text-[11px] flex items-center justify-center">
            H
          </span>
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400">Hustlify</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900 mb-2.5">
          Hustlify – B2B Business Assessment Form
        </h1>

        <p className="text-xs md:text-sm text-neutral-500 leading-relaxed max-w-xl">
          This assessment form is designed to help Hustlify gain a better understanding of your business, existing operations, sales and marketing strategies, lead management processes, and organizational challenges.
        </p>
      </header>

      {/* Minimal Stepper */}
      <div className="mb-8 border-b border-neutral-200 pb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-neutral-500 font-medium">
            Step {currentStep + 1} of {steps.length}: <span className="text-neutral-900 font-semibold">{steps[currentStep].title}</span>
          </span>
          <span className="text-neutral-400 text-[11px]">
            {Math.round(((currentStep + 1) / steps.length) * 100)}%
          </span>
        </div>

        <div className="w-full bg-neutral-100 h-1 rounded-full overflow-hidden">
          <div
            className="bg-neutral-900 h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ================= STEP 0: PROFILE ================= */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-neutral-900 pb-2 border-b border-neutral-100">
              Company Profile & Point of Contact
            </h2>

            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Company Name <span className="text-neutral-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => updateField("companyName", e.target.value)}
                  placeholder="Acme Technologies"
                  className="w-full px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Contact Person & Title <span className="text-neutral-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactPerson}
                  onChange={(e) => updateField("contactPerson", e.target.value)}
                  placeholder="Sarah Jenkins (Managing Director)"
                  className="w-full px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Email Address <span className="text-neutral-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="sarah@acme.com"
                    className="w-full px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Phone / WhatsApp <span className="text-neutral-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website || ""}
                  onChange={(e) => updateField("website", e.target.value)}
                  placeholder="https://acme.com"
                  className="w-full px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 1: BUSINESS & OPERATIONS ================= */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-neutral-900 pb-2 border-b border-neutral-100">
              1. Business & Operations
            </h2>

            <div className="space-y-4">
              {/* Q1 */}
              <div>
                <label className="block text-xs font-medium text-neutral-800 mb-1">
                  1. Incentive per sale?
                </label>
                <input
                  type="text"
                  value={formData.q1_incentivePerSale}
                  onChange={(e) => updateField("q1_incentivePerSale", e.target.value)}
                  placeholder="e.g. 5% commission or $250 flat"
                  className="w-full px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                />
              </div>

              {/* Q2 */}
              <div>
                <label className="block text-xs font-medium text-neutral-800 mb-1">
                  2. Which CRM tools are you currently using?
                </label>
                <input
                  type="text"
                  value={formData.q2_currentCrmTools}
                  onChange={(e) => updateField("q2_currentCrmTools", e.target.value)}
                  placeholder="e.g. HubSpot, Zoho, Salesforce, Excel..."
                  className="w-full px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                />
              </div>

              {/* Q3 */}
              <div>
                <label className="block text-xs font-medium text-neutral-800 mb-1">
                  3. Who is your target audience?
                </label>
                <textarea
                  rows={2}
                  value={formData.q3_targetAudience}
                  onChange={(e) => updateField("q3_targetAudience", e.target.value)}
                  placeholder="e.g. Mid-market B2B software companies..."
                  className="w-full px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                />
              </div>

              {/* Q4 */}
              <div>
                <label className="block text-xs font-medium text-neutral-800 mb-1.5">
                  4. Are you marketing a product or providing a service?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Product", "Service", "Both"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField("q4_productOrService", opt)}
                      className={`py-2 px-3 rounded-md text-xs font-medium transition-colors border cursor-pointer ${
                        formData.q4_productOrService === opt
                          ? "bg-neutral-900 text-white border-neutral-900"
                          : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q5 */}
              <div>
                <label className="block text-xs font-medium text-neutral-800 mb-1">
                  5. What is the current salary structure?
                </label>
                <input
                  type="text"
                  value={formData.q5_salaryStructure}
                  onChange={(e) => updateField("q5_salaryStructure", e.target.value)}
                  placeholder="e.g. Base salary + performance bonus"
                  className="w-full px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                />
              </div>

              {/* Q6 */}
              <div>
                <label className="block text-xs font-medium text-neutral-800 mb-1">
                  6. How do you manage time and daily activities?
                </label>
                <input
                  type="text"
                  value={formData.q6_timeManagement}
                  onChange={(e) => updateField("q6_timeManagement", e.target.value)}
                  placeholder="e.g. Google Calendar, Slack standups, Asana"
                  className="w-full px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                />
              </div>

              {/* Q7 */}
              <div>
                <label className="block text-xs font-medium text-neutral-800 mb-1">
                  7. How many employee resignations occur per year?
                </label>
                <input
                  type="text"
                  value={formData.q7_employeeResignationsPerYear}
                  onChange={(e) => updateField("q7_employeeResignationsPerYear", e.target.value)}
                  placeholder="e.g. 1-2 per year"
                  className="w-full px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                />
              </div>

              {/* Q8: VOICE INPUT REQUIRED */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-neutral-900 mb-1">
                  8. What is your biggest business pain point? <span className="text-neutral-400 font-normal">(Voice Note)</span>
                </label>
                <AudioRecorder
                  questionNumber={8}
                  label="Speak about current bottlenecks or friction in your business:"
                  onRecordingComplete={(blob) => handleAudioComplete("q8", blob)}
                  onDeleteRecording={() => handleDeleteAudio("q8")}
                  existingAudioUrl={voiceUrls.q8}
                />
                <textarea
                  rows={2}
                  value={formData.q8_biggestPainPoint}
                  onChange={(e) => updateField("q8_biggestPainPoint", e.target.value)}
                  placeholder="Optional written summary or notes..."
                  className="w-full mt-2 px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                />
              </div>

              {/* Q9: VOICE INPUT REQUIRED */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-neutral-900 mb-1">
                  9. What is the primary goal of this consultation? <span className="text-neutral-400 font-normal">(Voice Note)</span>
                </label>
                <AudioRecorder
                  questionNumber={9}
                  label="Describe what a successful outcome looks like:"
                  onRecordingComplete={(blob) => handleAudioComplete("q9", blob)}
                  onDeleteRecording={() => handleDeleteAudio("q9")}
                  existingAudioUrl={voiceUrls.q9}
                />
                <textarea
                  rows={2}
                  value={formData.q9_consultationGoal}
                  onChange={(e) => updateField("q9_consultationGoal", e.target.value)}
                  placeholder="Optional written summary or notes..."
                  className="w-full mt-2 px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                />
              </div>

              {/* Q10 */}
              <div>
                <label className="block text-xs font-medium text-neutral-800 mb-1">
                  10. Can you explain your current project details?
                </label>
                <textarea
                  rows={2}
                  value={formData.q10_currentProjectDetails}
                  onChange={(e) => updateField("q10_currentProjectDetails", e.target.value)}
                  placeholder="Deliverables, scope, current milestones..."
                  className="w-full px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                />
              </div>

              {/* Q11, 12, 13 (Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-800 mb-1">
                    11. Projects onboarded?
                  </label>
                  <input
                    type="text"
                    value={formData.q11_projectsOnboarded}
                    onChange={(e) => updateField("q11_projectsOnboarded", e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-800 mb-1">
                    12. Total project volume?
                  </label>
                  <input
                    type="text"
                    value={formData.q12_totalProjectVolume}
                    onChange={(e) => updateField("q12_totalProjectVolume", e.target.value)}
                    placeholder="e.g. $50k/mo"
                    className="w-full px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-800 mb-1">
                    13. Projects completed?
                  </label>
                  <input
                    type="text"
                    value={formData.q13_projectsCompleted}
                    onChange={(e) => updateField("q13_projectsCompleted", e.target.value)}
                    placeholder="e.g. 100+"
                    className="w-full px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                  />
                </div>
              </div>

              {/* Q14: Social Links */}
              <div>
                <label className="block text-xs font-medium text-neutral-800 mb-1">
                  14. Social media links (LinkedIn, X, Instagram, Facebook, etc.)
                </label>
                <SocialLinksInput
                  links={formData.q14_socialLinks}
                  onChange={(links: SocialLink[]) => updateField("q14_socialLinks", links)}
                />
              </div>

              {/* Q15: Dashboard Reports */}
              <div>
                <label className="block text-xs font-medium text-neutral-800 mb-1.5">
                  15. Do you maintain dashboard reports?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {["Yes", "No", "In Progress", "Partially"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField("q15_dashboardReports", opt)}
                      className={`py-2 px-3 rounded-md text-xs font-medium transition-colors border cursor-pointer ${
                        formData.q15_dashboardReports === opt
                          ? "bg-neutral-900 text-white border-neutral-900"
                          : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
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

        {/* ================= STEP 2: SALES & LEADS ================= */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-neutral-900 pb-2 border-b border-neutral-100">
              2. Sales & Lead Management
            </h2>

            <div className="space-y-4">
              {/* Q16 */}
              <div>
                <label className="block text-xs font-medium text-neutral-800 mb-1">
                  16. What is your current lead conversion process?
                </label>
                <textarea
                  rows={2}
                  value={formData.q16_leadConversionProcess}
                  onChange={(e) => updateField("q16_leadConversionProcess", e.target.value)}
                  placeholder="e.g. Inbound request -> qualification -> discovery call -> proposal"
                  className="w-full px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                />
              </div>

              {/* Q17 & Q18 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-800 mb-1">
                    17. Industry / Field?
                  </label>
                  <input
                    type="text"
                    value={formData.q17_industryField}
                    onChange={(e) => updateField("q17_industryField", e.target.value)}
                    placeholder="e.g. B2B SaaS, Logistics, Healthcare"
                    className="w-full px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-800 mb-1">
                    18. Year Established?
                  </label>
                  <input
                    type="text"
                    value={formData.q18_establishedYear}
                    onChange={(e) => updateField("q18_establishedYear", e.target.value)}
                    placeholder="e.g. 2021"
                    className="w-full px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                  />
                </div>
              </div>

              {/* Q19 & Q20 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-800 mb-1">
                    19. Sales Team Size?
                  </label>
                  <input
                    type="text"
                    value={formData.q19_salesTeamSize}
                    onChange={(e) => updateField("q19_salesTeamSize", e.target.value)}
                    placeholder="e.g. 4 reps"
                    className="w-full px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-800 mb-1">
                    20. Sales Team Experience Level?
                  </label>
                  <input
                    type="text"
                    value={formData.q20_salesTeamExperience}
                    onChange={(e) => updateField("q20_salesTeamExperience", e.target.value)}
                    placeholder="e.g. 2 senior, 2 juniors"
                    className="w-full px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                  />
                </div>
              </div>

              {/* Q21 */}
              <div>
                <label className="block text-xs font-medium text-neutral-800 mb-1">
                  21. Primary lead generation sources?
                </label>
                <input
                  type="text"
                  value={formData.q21_leadGenerationSources}
                  onChange={(e) => updateField("q21_leadGenerationSources", e.target.value)}
                  placeholder="e.g. Cold outbound, Ads, Referrals, SEO"
                  className="w-full px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                />
              </div>

              {/* Q22: VOICE INPUT REQUIRED */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-neutral-900 mb-1">
                  22. What is your current sales and marketing strategy? <span className="text-neutral-400 font-normal">(Voice Note)</span>
                </label>
                <AudioRecorder
                  questionNumber={22}
                  label="Describe how you position offerings and nurture prospects:"
                  onRecordingComplete={(blob) => handleAudioComplete("q22", blob)}
                  onDeleteRecording={() => handleDeleteAudio("q22")}
                  existingAudioUrl={voiceUrls.q22}
                />
                <textarea
                  rows={2}
                  value={formData.q22_salesMarketingStrategy}
                  onChange={(e) => updateField("q22_salesMarketingStrategy", e.target.value)}
                  placeholder="Optional written summary or notes..."
                  className="w-full mt-2 px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                />
              </div>

              {/* Q23 */}
              <div>
                <label className="block text-xs font-medium text-neutral-800 mb-1.5">
                  23. Do you have a dedicated sales lead or sales head?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Yes", "No", "Looking to hire"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField("q23_dedicatedSalesLead", opt)}
                      className={`py-2 px-3 rounded-md text-xs font-medium transition-colors border cursor-pointer ${
                        formData.q23_dedicatedSalesLead === opt
                          ? "bg-neutral-900 text-white border-neutral-900"
                          : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q24 & Q25 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-800 mb-1">
                    24. Current conversion ratio per month?
                  </label>
                  <input
                    type="text"
                    value={formData.q24_monthlyConversionRatio}
                    onChange={(e) => updateField("q24_monthlyConversionRatio", e.target.value)}
                    placeholder="e.g. 8%"
                    className="w-full px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-800 mb-1">
                    25. Expected conversion ratio?
                  </label>
                  <input
                    type="text"
                    value={formData.q25_expectedConversionRatio}
                    onChange={(e) => updateField("q25_expectedConversionRatio", e.target.value)}
                    placeholder="e.g. 15%"
                    className="w-full px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                  />
                </div>
              </div>

              {/* Q26 */}
              <div>
                <label className="block text-xs font-medium text-neutral-800 mb-1">
                  26. Biggest challenges faced by your sales team?
                </label>
                <textarea
                  rows={2}
                  value={formData.q26_salesTeamChallenges}
                  onChange={(e) => updateField("q26_salesTeamChallenges", e.target.value)}
                  placeholder="e.g. Unqualified leads, slow follow-ups, manual CRM entry"
                  className="w-full px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                />
              </div>

              {/* Q27: VOICE INPUT REQUIRED */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-neutral-900 mb-1">
                  27. What is your current sales training method? <span className="text-neutral-400 font-normal">(Voice Note)</span>
                </label>
                <AudioRecorder
                  questionNumber={27}
                  label="How do you coach, review calls, and sharpen closing skills:"
                  onRecordingComplete={(blob) => handleAudioComplete("q27", blob)}
                  onDeleteRecording={() => handleDeleteAudio("q27")}
                  existingAudioUrl={voiceUrls.q27}
                />
                <textarea
                  rows={2}
                  value={formData.q27_salesTrainingMethod}
                  onChange={(e) => updateField("q27_salesTrainingMethod", e.target.value)}
                  placeholder="Optional written summary or notes..."
                  className="w-full mt-2 px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                />
              </div>

              {/* Q28 */}
              <div>
                <label className="block text-xs font-medium text-neutral-800 mb-1">
                  28. Who are all involved in sales and lead management?
                </label>
                <input
                  type="text"
                  value={formData.q28_stakeholdersInvolved}
                  onChange={(e) => updateField("q28_stakeholdersInvolved", e.target.value)}
                  placeholder="e.g. Founder, 2 Closers, 1 SDR"
                  className="w-full px-3 py-2 text-xs text-neutral-900 minimal-input rounded-md"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: REVIEW & SUBMIT ================= */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-neutral-900 pb-2 border-b border-neutral-100">
              Review & Submit
            </h2>

            <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-3 text-xs">
              <div className="font-medium text-neutral-900 pb-2 border-b border-neutral-100">
                Contact Summary
              </div>
              <div className="grid grid-cols-2 gap-3 text-neutral-600">
                <div><span className="text-neutral-400">Company:</span> {formData.companyName || "—"}</div>
                <div><span className="text-neutral-400">Contact:</span> {formData.contactPerson || "—"}</div>
                <div><span className="text-neutral-400">Email:</span> {formData.email || "—"}</div>
                <div><span className="text-neutral-400">Phone:</span> {formData.phone || "—"}</div>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-2.5 text-xs">
              <div className="font-medium text-neutral-900 pb-2 border-b border-neutral-100">
                Voice Notes Summary (4 Questions)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-600">
                <div className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                  <span>Q.8 Pain point</span>
                  <span className="font-medium text-neutral-900">{voiceUrls.q8 ? "Recorded" : "Written only"}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                  <span>Q.9 Consultation goal</span>
                  <span className="font-medium text-neutral-900">{voiceUrls.q9 ? "Recorded" : "Written only"}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                  <span>Q.22 Sales strategy</span>
                  <span className="font-medium text-neutral-900">{voiceUrls.q22 ? "Recorded" : "Written only"}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                  <span>Q.27 Sales training</span>
                  <span className="font-medium text-neutral-900">{voiceUrls.q27 ? "Recorded" : "Written only"}</span>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="pt-4 flex items-center justify-between border-t border-neutral-200">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1 transition-colors cursor-pointer py-2 px-1"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          <div>
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="py-2.5 px-5 rounded-md text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                Continue <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-2.5 px-6 rounded-md text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-white flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Submit Assessment
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Subtle Auto-save footer */}
      <footer className="mt-8 pt-4 flex items-center justify-between text-[11px] text-neutral-400">
        <span>Draft auto-saved</span>
        <button
          type="button"
          onClick={() => {
            if (confirm("Clear all answers?")) {
              localStorage.removeItem(STORAGE_KEY);
              setFormData(INITIAL_DATA);
              setVoiceBlobs({});
              setVoiceUrls({});
            }
          }}
          className="hover:text-neutral-700 transition-colors cursor-pointer"
        >
          Reset form
        </button>
      </footer>
    </div>
  );
}
