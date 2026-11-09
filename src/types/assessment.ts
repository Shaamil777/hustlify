export interface SocialLink {
  id: string;
  platform: 'linkedin' | 'x' | 'instagram' | 'facebook' | 'youtube' | 'website' | 'other';
  url: string;
}

export interface VoiceNoteData {
  audioBlob?: Blob;
  audioUrl?: string;
  duration?: number;
  recordedAt?: string;
}

export interface AssessmentFormData {
  // Contact & Company Profile
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  website?: string;

  // Section 1: Business & Operations
  q1_incentivePerSale: string;
  q2_currentCrmTools: string;
  q3_targetAudience: string;
  q4_productOrService: 'Product' | 'Service' | 'Both' | '';
  q5_salaryStructure: string;
  q6_timeManagement: string;
  q7_employeeResignationsPerYear: string;
  q8_biggestPainPoint: string; // Voice + Text
  q8_voiceUrl?: string;
  q9_consultationGoal: string; // Voice + Text
  q9_voiceUrl?: string;
  q10_currentProjectDetails: string;
  q11_projectsOnboarded: string;
  q12_totalProjectVolume: string;
  q13_projectsCompleted: string;
  q14_socialLinks: SocialLink[];
  q15_dashboardReports: 'Yes' | 'No' | 'In Progress' | 'Partially' | '';

  // Section 2: Sales & Lead Management
  q16_leadConversionProcess: string;
  q17_industryField: string;
  q18_establishedYear: string;
  q19_salesTeamSize: string;
  q20_salesTeamExperience: string;
  q21_leadGenerationSources: string;
  q22_salesMarketingStrategy: string; // Voice + Text
  q22_voiceUrl?: string;
  q23_dedicatedSalesLead: 'Yes' | 'No' | 'Looking to hire' | '';
  q24_monthlyConversionRatio: string;
  q25_expectedConversionRatio: string;
  q26_salesTeamChallenges: string;
  q27_salesTrainingMethod: string; // Voice + Text
  q27_voiceUrl?: string;
  q28_stakeholdersInvolved: string;
}

export interface SubmissionRecord extends AssessmentFormData {
  id: string;
  submittedAt: string;
  status: 'new' | 'reviewed' | 'contacted';
}

