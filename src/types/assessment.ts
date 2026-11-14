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
  // Contact & Company Profile (Step 0)
  contactPerson: string;
  designation: string;
  companyName: string;
  businessLocation: string;
  email: string;
  phone: string;
  website: string;
  q18_establishedYear: string;
  businessDescription: string;

  // Section 2: Products & Services
  productsServicesOffered: string;
  q4_productOrService: 'Product' | 'Service' | 'Both' | '';
  q3_targetAudience: string;
  approximatePriceRange: string;
  competitorDifferentiation: string;

  // Section 7: Business Operations & Customer Management
  customerEnquiriesFollowup: string;
  q2_currentCrmTools: string;
  deliveryMethod: string;
  customerSupportHandling: string;
  q15_dashboardReports: 'Yes' | 'No' | 'In Progress' | 'Partially' | '';
  q10_currentProjectDetails: string;
  q11_projectsOnboarded: string;
  q12_totalProjectVolume: string;
  q13_projectsCompleted: string;

  // Section 6: Sales Performance
  monthlyCustomerSalesVolume: string;
  averageTransactionValue: string;
  achievingSalesTargets: 'Yes' | 'No' | 'Partially' | '';
  salesPerformanceDifficulties: string;
  q24_monthlyConversionRatio: string;
  q25_expectedConversionRatio: string;
  q1_incentivePerSale: string;
  q5_salaryStructure: string;
  q7_employeeResignationsPerYear: string;

  // Section 4 & 5: Sales Department & Marketing
  q19_salesTeamSize: string;
  q20_salesTeamExperience: string;
  salesTeamManagement: string;
  salesChannels: string;
  q26_salesTeamChallenges: string;
  q23_dedicatedSalesLead: 'Yes' | 'No' | 'Looking to hire' | '';
  q22_salesMarketingStrategy: string; // Voice + Text
  q22_voiceUrl?: string;
  paidAdvertising: string;
  q21_leadGenerationSources: string;
  marketingChallenges: string;
  q14_socialLinks: SocialLink[];

  // Section 8: Leadership, Team & Management
  q28_stakeholdersInvolved: string;
  q27_salesTrainingMethod: string; // Voice + Text
  q27_voiceUrl?: string;
  employeePerformanceEvaluation: string;
  teamManagementChallenges: string;

  // Section 3 & 9: Business Objectives & Consultation Expectations
  primaryBusinessGoals: string;
  areasToImprove: string;
  q8_biggestPainPoint: string; // Voice + Text (Three biggest problems)
  q8_voiceUrl?: string;
  q9_consultationGoal: string; // Voice + Text
  q9_voiceUrl?: string;
  expectedOutcome: string;
  expectedTurnover: string;
  departmentNeedingImprovement: string;
  specificProblemsToInvestigate: string;
  additionalNotes: string;

  // Legacy field
  q16_leadConversionProcess?: string;
  q17_industryField?: string;
}

export interface SubmissionRecord extends AssessmentFormData {
  id: string;
  submittedAt: string;
  status: 'new' | 'reviewed' | 'contacted';
}

