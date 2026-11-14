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
  AlertCircle,
  FileText,
  ShieldCheck,
  Info
} from "lucide-react";
import confetti from "canvas-confetti";
import AudioRecorder from "./AudioRecorder";
import SocialLinksInput from "./SocialLinksInput";
import { AssessmentFormData, SocialLink } from "@/types/assessment";

const INITIAL_DATA: AssessmentFormData = {
  // Step 0: Contact & Company Profile
  contactPerson: "",
  designation: "",
  companyName: "",
  businessLocation: "",
  email: "",
  phone: "",
  website: "",
  q17_industryField: "",
  q18_establishedYear: "",
  businessDescription: "",

  // Step 1: Products & Services
  productsServicesOffered: "",
  q4_productOrService: "",
  q3_targetAudience: "",
  approximatePriceRange: "",
  competitorDifferentiation: "",

  // Step 1: Business Operations & Customer Management
  customerEnquiriesFollowup: "",
  q2_currentCrmTools: "",
  deliveryMethod: "",
  customerSupportHandling: "",
  q15_dashboardReports: "",
  q10_currentProjectDetails: "",
  q11_projectsOnboarded: "",
  q12_totalProjectVolume: "",
  q13_projectsCompleted: "",

  // Step 1: Sales Performance
  monthlyCustomerSalesVolume: "",
  averageTransactionValue: "",
  achievingSalesTargets: "",
  salesPerformanceDifficulties: "",
  q24_monthlyConversionRatio: "",
  q25_expectedConversionRatio: "",
  q1_incentivePerSale: "",
  q5_salaryStructure: "",
  q7_employeeResignationsPerYear: "",

  // Step 2: Sales Department & Marketing
  q19_salesTeamSize: "",
  q20_salesTeamExperience: "",
  salesTeamManagement: "",
  salesChannels: "",
  q26_salesTeamChallenges: "",
  q23_dedicatedSalesLead: "",
  q22_salesMarketingStrategy: "",
  paidAdvertising: "",
  q21_leadGenerationSources: "",
  marketingChallenges: "",
  q14_socialLinks: [
    { id: "1", platform: "website", url: "" },
  ],

  // Step 2: Leadership, Team & Management
  q28_stakeholdersInvolved: "",
  q27_salesTrainingMethod: "",
  employeePerformanceEvaluation: "",
  teamManagementChallenges: "",

  // Step 2: Business Objectives
  primaryBusinessGoals: "",
  areasToImprove: "",

  // Step 3: Challenges, Expectations & Consultation
  q8_biggestPainPoint: "",
  departmentNeedingImprovement: "",
  specificProblemsToInvestigate: "",
  q9_consultationGoal: "",
  expectedOutcome: "",
  expectedTurnover: "",
  additionalNotes: "",

  // Legacy field
  q16_leadConversionProcess: "",
};

const STORAGE_KEY = "hustlify_draft_corporate_v3";

export default function AssessmentForm() {
  const [formData, setFormData] = useState<AssessmentFormData>(INITIAL_DATA);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string>("");

  const [voiceBlobs, setVoiceBloBlobs] = useState<{
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

  const [stepError, setStepError] = useState<string | null>(null);

  const updateField = (field: keyof AssessmentFormData, value: unknown) => {
    setStepError(null);
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const validateCurrentStep = (step: number): boolean => {
    setStepError(null);

    // ==========================================
    // STEP 0 VALIDATION (Company Overview)
    // ==========================================
    if (step === 0) {
      if (!formData.contactPerson?.trim()) {
        setStepError("Please provide the Contact Person name.");
        return false;
      }
      if (!formData.designation?.trim()) {
        setStepError("Please provide your Designation / Job Title.");
        return false;
      }
      if (!formData.companyName?.trim()) {
        setStepError("Please provide your Official Company / Organization Name.");
        return false;
      }
      if (!formData.q17_industryField?.trim()) {
        setStepError("Please provide your Industry / Field.");
        return false;
      }
      if (!formData.businessLocation?.trim()) {
        setStepError("Please provide your Business Location (City / Region / Country).");
        return false;
      }
      if (!formData.email?.trim() || !formData.email.includes("@")) {
        setStepError("Please provide a valid Business Email Address.");
        return false;
      }
      if (!formData.phone?.trim()) {
        setStepError("Please provide your Phone / WhatsApp Number.");
        return false;
      }
      if (!formData.website?.trim()) {
        setStepError("Please provide your Website or Official Social Media Page.");
        return false;
      }
      if (!formData.q18_establishedYear?.trim()) {
        setStepError("Please provide the Year of Establishment.");
        return false;
      }
      if (!formData.businessDescription?.trim()) {
        setStepError("Please provide a Brief Description of your Business.");
        return false;
      }
      return true;
    }

    // ==========================================
    // STEP 1 VALIDATION (Products, Operations & Sales Performance)
    // ==========================================
    if (step === 1) {
      // Products & Services
      if (!formData.productsServicesOffered?.trim()) {
        setStepError("Please specify what Products or Services your company offers.");
        return false;
      }
      if (!formData.q4_productOrService) {
        setStepError("Please select whether you offer Product, Service, or Both.");
        return false;
      }
      if (!formData.q3_targetAudience?.trim()) {
        setStepError("Please specify who your primary target customers are.");
        return false;
      }
      if (!formData.approximatePriceRange?.trim()) {
        setStepError("Please provide your Approximate Price Range.");
        return false;
      }
      if (!formData.competitorDifferentiation?.trim()) {
        setStepError("Please specify what makes your offering different from competitors.");
        return false;
      }

      // Operations & Customer Management
      if (!formData.customerEnquiriesFollowup?.trim()) {
        setStepError("Please explain how you manage customer enquiries and follow-ups.");
        return false;
      }
      if (!formData.q2_currentCrmTools?.trim()) {
        setStepError("Please provide current CRM tools or how you manage sales activities.");
        return false;
      }
      if (!formData.deliveryMethod?.trim()) {
        setStepError("Please describe how products or services are delivered to customers.");
        return false;
      }
      if (!formData.customerSupportHandling?.trim()) {
        setStepError("Please describe how you handle customer support, complaints and after-sales service.");
        return false;
      }
      if (!formData.q15_dashboardReports) {
        setStepError("Please select an option for Dashboard Reports.");
        return false;
      }
      if (!formData.q10_currentProjectDetails?.trim()) {
        setStepError("Please describe current project / operational details.");
        return false;
      }
      if (!formData.q11_projectsOnboarded?.trim()) {
        setStepError("Please specify projects or clients onboarded.");
        return false;
      }
      if (!formData.q12_totalProjectVolume?.trim()) {
        setStepError("Please specify total project or revenue volume.");
        return false;
      }
      if (!formData.q13_projectsCompleted?.trim()) {
        setStepError("Please specify projects completed to date.");
        return false;
      }

      // Sales Performance
      if (!formData.monthlyCustomerSalesVolume?.trim()) {
        setStepError("Please specify approximately how many customers or sales you generate monthly.");
        return false;
      }
      if (!formData.averageTransactionValue?.trim()) {
        setStepError("Please provide your approximate average transaction value.");
        return false;
      }
      if (!formData.achievingSalesTargets) {
        setStepError("Please select whether you are achieving your expected sales targets.");
        return false;
      }
      if (!formData.salesPerformanceDifficulties?.trim()) {
        setStepError("Please describe the main difficulties preventing better sales performance.");
        return false;
      }
      if (!formData.q24_monthlyConversionRatio?.trim()) {
        setStepError("Please specify your current monthly conversion ratio.");
        return false;
      }
      if (!formData.q25_expectedConversionRatio?.trim()) {
        setStepError("Please specify your expected conversion ratio.");
        return false;
      }
      if (!formData.q1_incentivePerSale?.trim()) {
        setStepError("Please specify incentive or commission per sale.");
        return false;
      }
      if (!formData.q5_salaryStructure?.trim()) {
        setStepError("Please provide your sales salary structure.");
        return false;
      }
      if (!formData.q7_employeeResignationsPerYear?.trim()) {
        setStepError("Please provide employee resignations per year.");
        return false;
      }
      return true;
    }

    // ==========================================
    // STEP 2 VALIDATION (Sales Dept, Marketing, Leadership & Objectives)
    // ==========================================
    if (step === 2) {
      // Sales Department
      if (!formData.q19_salesTeamSize?.trim()) {
        setStepError("Please specify if you have a sales team and approximately how many people.");
        return false;
      }
      if (!formData.q23_dedicatedSalesLead) {
        setStepError("Please select whether you have a dedicated sales lead/head.");
        return false;
      }
      if (!formData.q20_salesTeamExperience?.trim()) {
        setStepError("Please describe your sales team experience level.");
        return false;
      }
      if (!formData.salesTeamManagement?.trim()) {
        setStepError("Please explain how your sales team is managed.");
        return false;
      }
      if (!formData.salesChannels?.trim()) {
        setStepError("Please specify what sales channels you currently use.");
        return false;
      }
      if (!formData.q26_salesTeamChallenges?.trim()) {
        setStepError("Please describe your biggest sales-related challenges.");
        return false;
      }
      if (!formData.q16_leadConversionProcess?.trim()) {
        setStepError("Please describe your current lead conversion process.");
        return false;
      }

      // Marketing & Lead Generation
      if (!voiceBlobs.q22 && !formData.q22_salesMarketingStrategy?.trim()) {
        setStepError("Please provide a voice note or written response for how you attract customers & marketing channels.");
        return false;
      }
      if (!formData.paidAdvertising?.trim()) {
        setStepError("Please answer if you use paid advertising (and details/spend).");
        return false;
      }
      if (!formData.q21_leadGenerationSources?.trim()) {
        setStepError("Please specify where most of your customer enquiries come from.");
        return false;
      }
      if (!formData.marketingChallenges?.trim()) {
        setStepError("Please describe your major marketing challenges.");
        return false;
      }
      const validLinks = (formData.q14_socialLinks || []).filter((l) => l.url && l.url.trim().length > 0);
      if (validLinks.length === 0) {
        setStepError("Please provide at least one official website or social media link.");
        return false;
      }

      // Leadership, Team & Management
      if (!formData.q28_stakeholdersInvolved?.trim()) {
        setStepError("Please specify who manages your sales and marketing departments.");
        return false;
      }
      if (!voiceBlobs.q27 && !formData.q27_salesTrainingMethod?.trim()) {
        setStepError("Please provide a voice note or written response for regular employee training.");
        return false;
      }
      if (!formData.employeePerformanceEvaluation?.trim()) {
        setStepError("Please describe how you evaluate employee performance.");
        return false;
      }
      if (!formData.teamManagementChallenges?.trim()) {
        setStepError("Please describe your biggest team-management or operational challenges.");
        return false;
      }

      // Business Objectives
      if (!formData.primaryBusinessGoals?.trim()) {
        setStepError("Please state your primary business goals and major growth objectives.");
        return false;
      }
      if (!formData.areasToImprove?.trim()) {
        setStepError("Please specify which areas of the business you most want to improve.");
        return false;
      }
      return true;
    }

    // ==========================================
    // STEP 3 VALIDATION (Challenges, Expectations & Final Review)
    // ==========================================
    if (step === 3) {
      if (!voiceBlobs.q8 && !formData.q8_biggestPainPoint?.trim()) {
        setStepError("Please provide a voice note or text for the 3 biggest problems affecting your business.");
        return false;
      }
      if (!formData.departmentNeedingImprovement?.trim()) {
        setStepError("Please specify which department you believe needs the most improvement.");
        return false;
      }
      if (!formData.specificProblemsToInvestigate?.trim()) {
        setStepError("Please specify what specific problems you would like Hustlify to investigate.");
        return false;
      }
      if (!voiceBlobs.q9 && !formData.q9_consultationGoal?.trim()) {
        setStepError("Please provide a voice note or text for your primary consultation goal.");
        return false;
      }
      if (!formData.expectedOutcome?.trim()) {
        setStepError("Please specify what outcomes you expect from our business consultation.");
        return false;
      }
      if (!formData.expectedTurnover?.trim()) {
        setStepError("Please specify your expected turnover / revenue growth after consultation.");
        return false;
      }
      if (!formData.additionalNotes?.trim()) {
        setStepError("Please enter additional notes or type 'N/A' if none.");
        return false;
      }
      return true;
    }

    return true;
  };

  const handleContinue = () => {
    if (validateCurrentStep(currentStep)) {
      setStepError(null);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep <= currentStep) {
      setStepError(null);
      setCurrentStep(targetStep);
      return;
    }
    if (validateCurrentStep(currentStep)) {
      setStepError(null);
      setCurrentStep(targetStep);
    }
  };

  const handleAudioComplete = (question: "q8" | "q9" | "q22" | "q27", blob: Blob) => {
    const previewUrl = URL.createObjectURL(blob);
    setVoiceBloBlobs((prev) => ({ ...prev, [question]: blob }));
    setVoiceUrls((prev) => ({ ...prev, [question]: previewUrl }));
  };

  const handleDeleteAudio = (question: "q8" | "q9" | "q22" | "q27") => {
    setVoiceBloBlobs((prev) => {
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
    if (!validateCurrentStep(0)) { setCurrentStep(0); return; }
    if (!validateCurrentStep(1)) { setCurrentStep(1); return; }
    if (!validateCurrentStep(2)) { setCurrentStep(2); return; }
    if (!validateCurrentStep(3)) { setCurrentStep(3); return; }

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
      title: "Company Overview",
      desc: "Company info, location & profile",
      icon: Building2,
    },
    {
      id: 1,
      stepNumber: "02",
      title: "Products & Operations",
      desc: "Offerings, CRM & performance",
      icon: Briefcase,
    },
    {
      id: 2,
      stepNumber: "03",
      title: "Marketing & Strategy",
      desc: "Lead gen, team & objectives",
      icon: Rocket,
    },
    {
      id: 3,
      stepNumber: "04",
      title: "Challenges & Review",
      desc: "Expectations, notes & submission",
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
          Thank you, <span className="font-semibold text-slate-900">{formData.contactPerson || "Partner"}</span>. Your corporate consultation discovery form for{" "}
          <span className="font-semibold text-emerald-700">{formData.companyName || "your company"}</span> has been recorded and synced to our team.
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
        
        <div className="space-y-7 relative z-10">
          <div className="flex flex-col items-center justify-center text-center">
            <img
              src="/logo.png"
              alt="Hustlify Logo"
              className="h-14 sm:h-16 lg:h-[72px] w-auto object-contain mx-auto drop-shadow-sm"
            />
            <div className="text-xs text-white font-semibold tracking-wide mt-2.5">
              Hustlify Sales School Pvt. Ltd. | Corporate Consultation
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
                  onClick={() => handleStepClick(s.id)}
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
            <a href="mailto:hustlify.in@gmail.com" className="flex items-start gap-3 text-white hover:text-emerald-100 transition-colors">
              <Mail className="w-4 h-4 text-emerald-200 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold block text-white text-[11px]">Chat to our team</span>
                <span className="text-emerald-100/90 text-xs font-medium">hustlify.in@gmail.com</span>
              </div>
            </a>

            <a href="tel:+919048643334" className="flex items-start gap-3 text-white hover:text-emerald-100 transition-colors">
              <Phone className="w-4 h-4 text-emerald-200 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold block text-white text-[11px]">Consultation inquiries</span>
                <span className="text-emerald-100/90 text-xs font-medium">+91 9048643334</span>
              </div>
            </a>
          </div>

          <div className="flex items-center justify-end pt-2 border-t border-white/10 text-emerald-200">
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
          RIGHT PANEL: CLEAN, BALANCED FORM CARD
      ========================================================================= */}
      <main className="flex-1 p-6 sm:p-9 lg:p-12 flex flex-col justify-between overflow-y-auto max-h-[900px] bg-white">
        <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
          
          {/* Header on right panel */}
          <div className="space-y-2 border-b border-slate-100 pb-5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {currentStep === 0 && "1. Company Overview"}
              {currentStep === 1 && "2. Products, Operations & Sales Performance"}
              {currentStep === 2 && "3. Marketing, Sales Department & Strategy"}
              {currentStep === 3 && "4. Business Challenges, Expectations & Review"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {currentStep === 0 && "Official company profile, leadership designation, contact details and business background."}
              {currentStep === 1 && "Products or services offered, pricing, delivery, customer enquiry handling, and sales metrics."}
              {currentStep === 2 && "Sales team management, channels, lead generation sources, paid advertising, and employee training."}
              {currentStep === 3 && "Key operational bottlenecks, consultation goals, expected outcomes, and final verification."}
            </p>
          </div>

          {/* =====================================================================
              STEP 0 FIELDS: 1. COMPANY OVERVIEW
          ===================================================================== */}
          {currentStep === 0 && (
            <div className="space-y-6">
              {/* Instructions Banner from Document */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <Info className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-emerald-900 leading-relaxed">
                  <span className="font-bold">Instructions:</span> Approximate answers are acceptable where exact figures are unavailable. You may attach notes or provide extra details in the review section if needed. All fields marked with <span className="text-emerald-700 font-bold">*</span> are mandatory.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Contact Person */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Contact Person Name <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => updateField("contactPerson", e.target.value)}
                    placeholder="e.g. David Ross"
                    className="w-full px-4 py-3 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Designation / Job Title <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => updateField("designation", e.target.value)}
                    placeholder="e.g. Managing Director / Founder / Head of Sales"
                    className="w-full px-4 py-3 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Official Company Name <span className="text-emerald-600 font-bold">*</span>
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

                {/* Industry / Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Industry / Business Field <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.q17_industryField}
                    onChange={(e) => updateField("q17_industryField", e.target.value)}
                    placeholder="e.g. B2B SaaS, Manufacturing, Logistics, Healthcare"
                    className="w-full px-4 py-3 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Business Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Business Location <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.businessLocation}
                    onChange={(e) => updateField("businessLocation", e.target.value)}
                    placeholder="e.g. Dubai, UAE / Bangalore, India / London, UK"
                    className="w-full px-4 py-3 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Year of Establishment */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Year of Establishment <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.q18_establishedYear}
                    onChange={(e) => updateField("q18_establishedYear", e.target.value)}
                    placeholder="e.g. 2019"
                    className="w-full px-4 py-3 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Email Address <span className="text-emerald-600 font-bold">*</span>
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

                {/* Phone / WhatsApp */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Phone / WhatsApp Number <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Website or Official Social Media Page */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Website or Official Social Media Page <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    placeholder="https://company.com or https://linkedin.com/company/..."
                    className="w-full px-4 py-3 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Brief description of business */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Brief Description of Your Business <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.businessDescription}
                    onChange={(e) => updateField("businessDescription", e.target.value)}
                    placeholder="Briefly describe what your business does, your market positioning, and your core business model..."
                    className="w-full px-4 py-3 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              STEP 1 FIELDS: 2. PRODUCTS & SERVICES, OPERATIONS & PERFORMANCE
          ===================================================================== */}
          {currentStep === 1 && (
            <div className="space-y-6">
              
              {/* --- SECTION 2: PRODUCTS & SERVICES --- */}
              <div className="pb-2 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">2</span>
                  Products & Services
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Products or Services Offered */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    What products or services does your company offer? <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.productsServicesOffered}
                    onChange={(e) => updateField("productsServicesOffered", e.target.value)}
                    placeholder="List the key products, services, packages, or solutions you deliver to clients..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Offering Classification */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-2">
                    Primary Offering Type <span className="text-emerald-600 font-bold">*</span>
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

                {/* Approximate Price Range */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    What is the approximate price range? <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.approximatePriceRange}
                    onChange={(e) => updateField("approximatePriceRange", e.target.value)}
                    placeholder="e.g. $500 – $5,000 per project / $2,000 monthly retainer"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Primary Target Customers */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Who are your primary target customers? <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.q3_targetAudience}
                    onChange={(e) => updateField("q3_targetAudience", e.target.value)}
                    placeholder="e.g. Mid-sized B2B manufacturing firms, e-commerce brands with 50+ staff..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Competitor Differentiation */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    What makes your offering different from competitors? <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.competitorDifferentiation}
                    onChange={(e) => updateField("competitorDifferentiation", e.target.value)}
                    placeholder="Your unique value proposition, proprietary technology, speed of delivery, specialized domain experience..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>
              </div>

              {/* --- SECTION 7: BUSINESS OPERATIONS & CUSTOMER MANAGEMENT --- */}
              <div className="pt-4 pb-2 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">7</span>
                  Business Operations & Customer Management
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Customer enquiries and follow-ups */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    How do you manage customer enquiries and follow-ups? <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.customerEnquiriesFollowup}
                    onChange={(e) => updateField("customerEnquiriesFollowup", e.target.value)}
                    placeholder="e.g. Daily manual WhatsApp follow-ups, CRM sequence, spreadsheet logging..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* CRM Tools */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    How do you manage sales activities & customer info? (CRM) <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.q2_currentCrmTools}
                    onChange={(e) => updateField("q2_currentCrmTools", e.target.value)}
                    placeholder="e.g. HubSpot, Zoho, Salesforce, Notion, Excel sheets"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Dashboard Reports */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-2">
                    Do you use active dashboard reports? <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {["Yes", "No", "In Progress", "Partially"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updateField("q15_dashboardReports", opt)}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
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

                {/* Delivery Method */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    How are products or services delivered to customers? <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.deliveryMethod}
                    onChange={(e) => updateField("deliveryMethod", e.target.value)}
                    placeholder="e.g. Direct logistics, digital onboarding, cloud access"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Customer Support Handling */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    How do you handle support, complaints & after-sales service? <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerSupportHandling}
                    onChange={(e) => updateField("customerSupportHandling", e.target.value)}
                    placeholder="e.g. Dedicated support manager, ticket system, phone line"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Project Details */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Current project / client details <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.q10_currentProjectDetails}
                    onChange={(e) => updateField("q10_currentProjectDetails", e.target.value)}
                    placeholder="Scope, deliverables, and typical project lifecycle..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Onboarded, Volume, Completed */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Projects / Clients Onboarded <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.q11_projectsOnboarded}
                    onChange={(e) => updateField("q11_projectsOnboarded", e.target.value)}
                    placeholder="e.g. 15 active accounts"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Total Volume / Run Rate <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.q12_totalProjectVolume}
                    onChange={(e) => updateField("q12_totalProjectVolume", e.target.value)}
                    placeholder="e.g. $60,000 / month"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Total Projects Completed to date <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.q13_projectsCompleted}
                    onChange={(e) => updateField("q13_projectsCompleted", e.target.value)}
                    placeholder="e.g. 120+ projects delivered"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>
              </div>

              {/* --- SECTION 6: SALES PERFORMANCE --- */}
              <div className="pt-4 pb-2 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">6</span>
                  Sales Performance
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Monthly Customers/Sales */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Monthly Customers / Sales Generated <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.monthlyCustomerSalesVolume}
                    onChange={(e) => updateField("monthlyCustomerSalesVolume", e.target.value)}
                    placeholder="e.g. 20 - 25 new clients / month"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Average Transaction Value */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Approximate Average Transaction Value <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.averageTransactionValue}
                    onChange={(e) => updateField("averageTransactionValue", e.target.value)}
                    placeholder="e.g. $1,800 per deal"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Achieving Targets */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-2">
                    Are you achieving expected sales targets? <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Yes", "No", "Partially"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updateField("achievingSalesTargets", opt)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                          formData.achievingSalesTargets === opt
                            ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monthly & Expected Conversion */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Current Monthly Conversion Ratio (%) <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.q24_monthlyConversionRatio}
                    onChange={(e) => updateField("q24_monthlyConversionRatio", e.target.value)}
                    placeholder="e.g. 6%"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Expected Conversion */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Expected Target Conversion Ratio (%) <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.q25_expectedConversionRatio}
                    onChange={(e) => updateField("q25_expectedConversionRatio", e.target.value)}
                    placeholder="e.g. 15% - 20%"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Incentive per Sale */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Incentive / Commission per Sale <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.q1_incentivePerSale}
                    onChange={(e) => updateField("q1_incentivePerSale", e.target.value)}
                    placeholder="e.g. 5% commission or $200 fixed bonus"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Salary Structure */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Sales Team Salary Structure <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.q5_salaryStructure}
                    onChange={(e) => updateField("q5_salaryStructure", e.target.value)}
                    placeholder="e.g. Base salary + tiered performance bonuses"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Resignations */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Employee Resignations per Year <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.q7_employeeResignationsPerYear}
                    onChange={(e) => updateField("q7_employeeResignationsPerYear", e.target.value)}
                    placeholder="e.g. 1-2 per year"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Difficulties preventing better performance */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    What are the main difficulties preventing better sales performance? <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.salesPerformanceDifficulties}
                    onChange={(e) => updateField("salesPerformanceDifficulties", e.target.value)}
                    placeholder="e.g. Low deal sizes, long sales cycles, inconsistent prospecting, poor objection handling..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>
              </div>

            </div>
          )}

          {/* =====================================================================
              STEP 2 FIELDS: 4. SALES DEPT, 5. MARKETING, 8. LEADERSHIP & 3. OBJECTIVES
          ===================================================================== */}
          {currentStep === 2 && (
            <div className="space-y-6">

              {/* --- SECTION 4: SALES DEPARTMENT --- */}
              <div className="pb-2 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">4</span>
                  Sales Department
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Sales Team Size */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Do you have a dedicated sales team? How many people? <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.q19_salesTeamSize}
                    onChange={(e) => updateField("q19_salesTeamSize", e.target.value)}
                    placeholder="e.g. Yes, 4 closers + 2 SDRs (or No, founder-led)"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Dedicated Sales Lead */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-2">
                    Dedicated Sales Lead / Head? <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Yes", "No", "Looking to hire"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updateField("q23_dedicatedSalesLead", opt)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
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

                {/* Sales Team Experience */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Sales Team Experience Level <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.q20_salesTeamExperience}
                    onChange={(e) => updateField("q20_salesTeamExperience", e.target.value)}
                    placeholder="e.g. 2 senior reps (5+ years), 2 juniors"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Sales Channels Used */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    What sales channels do you currently use? <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.salesChannels}
                    onChange={(e) => updateField("salesChannels", e.target.value)}
                    placeholder="e.g. Direct outbound calls, WhatsApp, LinkedIn, field sales, webinars"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Sales Team Management */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    How is your sales team managed? <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.salesTeamManagement}
                    onChange={(e) => updateField("salesTeamManagement", e.target.value)}
                    placeholder="e.g. Daily morning standup, weekly target reviews, pipeline auditing, commission tracking..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Biggest Sales-related challenges */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    What are your biggest sales-related challenges? <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.q26_salesTeamChallenges}
                    onChange={(e) => updateField("q26_salesTeamChallenges", e.target.value)}
                    placeholder="e.g. Objections on price, reps giving discounts too quickly, ghosting after proposals..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Lead conversion process */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Current lead conversion process / pipeline stages <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.q16_leadConversionProcess}
                    onChange={(e) => updateField("q16_leadConversionProcess", e.target.value)}
                    placeholder="e.g. Inbound enquiry -> qualification call -> pitch demo -> proposal -> closing"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>
              </div>

              {/* --- SECTION 5: MARKETING & LEAD GENERATION --- */}
              <div className="pt-4 pb-2 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">5</span>
                  Marketing & Lead Generation
                </h3>
              </div>

              <div className="space-y-5">
                {/* Q22: Strategic Voice Note Question */}
                <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80">
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    How do you currently attract customers, and which marketing channels do you use? <span className="text-emerald-700 font-semibold">(Voice Note or Text)</span> <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <AudioRecorder
                    questionNumber={22}
                    label="Speak openly about your marketing channels, lead flow, and positioning strategy:"
                    onRecordingComplete={(blob) => handleAudioComplete("q22", blob)}
                    onDeleteRecording={() => handleDeleteAudio("q22")}
                    existingAudioUrl={voiceUrls.q22}
                  />
                  <textarea
                    rows={2}
                    value={formData.q22_salesMarketingStrategy}
                    onChange={(e) => updateField("q22_salesMarketingStrategy", e.target.value)}
                    placeholder="Type written response if not recording audio..."
                    className="w-full mt-2.5 px-3.5 py-2 text-xs text-slate-900 split-input rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Paid Advertising */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Do you use paid advertising? <span className="text-emerald-600 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.paidAdvertising}
                      onChange={(e) => updateField("paidAdvertising", e.target.value)}
                      placeholder="e.g. Yes, Meta & Google Ads ($2,000/mo) or No, 100% organic"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                    />
                  </div>

                  {/* Where enquiries come from */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Where do most customer enquiries come from? <span className="text-emerald-600 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.q21_leadGenerationSources}
                      onChange={(e) => updateField("q21_leadGenerationSources", e.target.value)}
                      placeholder="e.g. Instagram DMs, Referrals, Google Search, LinkedIn"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                    />
                  </div>

                  {/* Major Marketing Challenges */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      What are your major marketing challenges? <span className="text-emerald-600 font-bold">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={formData.marketingChallenges}
                      onChange={(e) => updateField("marketingChallenges", e.target.value)}
                      placeholder="e.g. High cost per lead, low-intent inquiries, inconsistent lead volume, weak brand awareness..."
                      className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                    />
                  </div>

                  {/* Social media links */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Website & Official Social Media Links <span className="text-emerald-600 font-bold">*</span>
                    </label>
                    <SocialLinksInput
                      links={formData.q14_socialLinks}
                      onChange={(links: SocialLink[]) => updateField("q14_socialLinks", links)}
                    />
                  </div>
                </div>
              </div>

              {/* --- SECTION 8: LEADERSHIP, TEAM & MANAGEMENT --- */}
              <div className="pt-4 pb-2 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">8</span>
                  Leadership, Team & Management
                </h3>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Who manages your sales and marketing departments? <span className="text-emerald-600 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.q28_stakeholdersInvolved}
                      onChange={(e) => updateField("q28_stakeholdersInvolved", e.target.value)}
                      placeholder="e.g. Founder directly / VP of Sales / External Agency"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                    />
                  </div>
                </div>

                {/* Q27: Employee Training Voice Note */}
                <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80">
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Do you provide regular employee training? What is your method? <span className="text-emerald-700 font-semibold">(Voice Note or Text)</span> <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <AudioRecorder
                    questionNumber={27}
                    label="Describe your onboarding, pitch practice, call reviews, or sales coaching:"
                    onRecordingComplete={(blob) => handleAudioComplete("q27", blob)}
                    onDeleteRecording={() => handleDeleteAudio("q27")}
                    existingAudioUrl={voiceUrls.q27}
                  />
                  <textarea
                    rows={2}
                    value={formData.q27_salesTrainingMethod}
                    onChange={(e) => updateField("q27_salesTrainingMethod", e.target.value)}
                    placeholder="Type written response if not recording audio..."
                    className="w-full mt-2.5 px-3.5 py-2 text-xs text-slate-900 split-input rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      How do you evaluate employee performance? <span className="text-emerald-600 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.employeePerformanceEvaluation}
                      onChange={(e) => updateField("employeePerformanceEvaluation", e.target.value)}
                      placeholder="e.g. Monthly revenue quota, call volume KPIs, deal conversion scorecards"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Biggest team-management / operational challenges? <span className="text-emerald-600 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.teamManagementChallenges}
                      onChange={(e) => updateField("teamManagementChallenges", e.target.value)}
                      placeholder="e.g. Motivation, high turnover, accountability, onboarding speed"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* --- SECTION 3: BUSINESS OBJECTIVES --- */}
              <div className="pt-4 pb-2 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">3</span>
                  Business Objectives
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Primary business goals and major growth objectives? <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.primaryBusinessGoals}
                    onChange={(e) => updateField("primaryBusinessGoals", e.target.value)}
                    placeholder="e.g. Scale from $30k to $100k/mo, expand into GCC/US market, build scalable sales machine..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Which areas of the business do you most want to improve? <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.areasToImprove}
                    onChange={(e) => updateField("areasToImprove", e.target.value)}
                    placeholder="e.g. Closing efficiency, predictable lead generation, sales leadership structure..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>
              </div>

            </div>
          )}

          {/* =====================================================================
              STEP 3 FIELDS: 9. CHALLENGES, CONSULTATION EXPECTATIONS & REVIEW
          ===================================================================== */}
          {currentStep === 3 && (
            <div className="space-y-6">

              {/* --- SECTION 9: BUSINESS CHALLENGES & CONSULTATION EXPECTATIONS --- */}
              <div className="pb-2 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">9</span>
                  Business Challenges & Consultation Expectations
                </h3>
              </div>

              {/* Q8: 3 Biggest Problems Voice Note */}
              <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80">
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  What are the three biggest problems currently affecting your business? <span className="text-emerald-700 font-semibold">(Voice Note or Text)</span> <span className="text-emerald-600 font-bold">*</span>
                </label>
                <AudioRecorder
                  questionNumber={8}
                  label="Speak openly about your 3 biggest operational, sales, or growth bottlenecks:"
                  onRecordingComplete={(blob) => handleAudioComplete("q8", blob)}
                  onDeleteRecording={() => handleDeleteAudio("q8")}
                  existingAudioUrl={voiceUrls.q8}
                />
                <textarea
                  rows={2}
                  value={formData.q8_biggestPainPoint}
                  onChange={(e) => updateField("q8_biggestPainPoint", e.target.value)}
                  placeholder="Type written response if not recording audio..."
                  className="w-full mt-2.5 px-3.5 py-2 text-xs text-slate-900 split-input rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Department needing most improvement */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Which department do you believe needs the most improvement? <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.departmentNeedingImprovement}
                    onChange={(e) => updateField("departmentNeedingImprovement", e.target.value)}
                    placeholder="e.g. Inbound Sales, Outbound Prospecting, Operations, Customer Success"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Expected Turnover */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Expected Turnover / Revenue Growth After Consultation <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.expectedTurnover}
                    onChange={(e) => updateField("expectedTurnover", e.target.value)}
                    placeholder="e.g. 2x revenue growth / $150k monthly target"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>

                {/* Specific problems to investigate */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    What specific problems would you like Hustlify to investigate? <span className="text-emerald-600 font-bold">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.specificProblemsToInvestigate}
                    onChange={(e) => updateField("specificProblemsToInvestigate", e.target.value)}
                    placeholder="e.g. Deal leakage at proposal stage, SDR compensation model, pipeline audit, pitch restructuring..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                  />
                </div>
              </div>

              {/* Q9: Primary Consultation Goal Voice Note */}
              <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80">
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  What outcomes do you expect from our business consultation? <span className="text-emerald-700 font-semibold">(Voice Note or Text)</span> <span className="text-emerald-600 font-bold">*</span>
                </label>
                <AudioRecorder
                  questionNumber={9}
                  label="Describe what a completely successful consulting engagement looks like:"
                  onRecordingComplete={(blob) => handleAudioComplete("q9", blob)}
                  onDeleteRecording={() => handleDeleteAudio("q9")}
                  existingAudioUrl={voiceUrls.q9}
                />
                <textarea
                  rows={2}
                  value={formData.q9_consultationGoal}
                  onChange={(e) => updateField("q9_consultationGoal", e.target.value)}
                  placeholder="Type written response if not recording audio..."
                  className="w-full mt-2.5 px-3.5 py-2 text-xs text-slate-900 split-input rounded-xl"
                />
              </div>

              {/* Expected outcome detailed */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Key Deliverables / Expected Consultation Outcomes <span className="text-emerald-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.expectedOutcome}
                  onChange={(e) => updateField("expectedOutcome", e.target.value)}
                  placeholder="e.g. High-converting sales script, CRM workflow automation, executive audit report"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                />
              </div>

              {/* Additional Information / Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Additional Information / Notes <span className="text-emerald-600 font-bold">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.additionalNotes}
                  onChange={(e) => updateField("additionalNotes", e.target.value)}
                  placeholder="Any extra context, team availability, or urgent priorities (type 'N/A' if none)..."
                  className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 split-input rounded-xl"
                />
              </div>

              {/* Confidentiality and Document Scope from Document */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-900">Confidentiality and document scope:</span> This form is for initial consultation discovery. You do not need to prepare financial statements, CRM exports, marketing reports or other detailed internal documents at this stage. Hustlify&apos;s R&amp;D team may request specific supporting information later if it is necessary for the detailed business audit.
                </div>
              </div>

              {/* Overview & Voice Status Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Contact & Company Summary
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                  <div><span className="text-slate-400 font-medium">Company:</span> {formData.companyName || "Not provided"}</div>
                  <div><span className="text-slate-400 font-medium">Contact:</span> {formData.contactPerson} ({formData.designation})</div>
                  <div><span className="text-slate-400 font-medium">Email:</span> {formData.email}</div>
                  <div><span className="text-slate-400 font-medium">Phone:</span> {formData.phone}</div>
                </div>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-emerald-950 text-xs uppercase tracking-wider">
                    Voice Notes Status
                  </h3>
                  <span className="text-[11px] text-emerald-700 font-semibold">4 Strategic Recordings</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">Q.8 3 Biggest Problems</div>
                      <div className="text-[11px] text-slate-500">{voiceUrls.q8 ? "Voice recorded" : "Written response"}</div>
                    </div>
                    {voiceUrls.q8 ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Voice Ready</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">Text</span>
                    )}
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">Q.9 Consultation Goals</div>
                      <div className="text-[11px] text-slate-500">{voiceUrls.q9 ? "Voice recorded" : "Written response"}</div>
                    </div>
                    {voiceUrls.q9 ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Voice Ready</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">Text</span>
                    )}
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">Q.22 Marketing Channels</div>
                      <div className="text-[11px] text-slate-500">{voiceUrls.q22 ? "Voice recorded" : "Written response"}</div>
                    </div>
                    {voiceUrls.q22 ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Voice Ready</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">Text</span>
                    )}
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">Q.27 Employee Training</div>
                      <div className="text-[11px] text-slate-500">{voiceUrls.q27 ? "Voice recorded" : "Written response"}</div>
                    </div>
                    {voiceUrls.q27 ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Voice Ready</span>
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

          {stepError && (
            <div className="flex items-center gap-2.5 p-3.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl shadow-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span className="font-semibold">{stepError}</span>
            </div>
          )}

          {/* =====================================================================
              BOTTOM ACTION BUTTONS
          ===================================================================== */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setStepError(null);
                  setCurrentStep((prev) => prev - 1);
                }}
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
                  onClick={handleContinue}
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
                      <Send className="w-4 h-4" /> Submit Consultation Discovery
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
                setVoiceBloBlobs({});
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
