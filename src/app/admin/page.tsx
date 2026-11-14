"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Download, 
  Play, 
  Pause, 
  ChevronDown, 
  ChevronUp, 
  LogOut, 
  ArrowLeft
} from "lucide-react";
import { SubmissionRecord } from "@/types/assessment";

export default function AdminPage() {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeAudioUrl, setActiveAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("hustlify_admin_key");
    if (saved) {
      fetchSubmissions(saved);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSubmissions(passcode);
  };

  const fetchSubmissions = async (key: string) => {
    setAuthError("");
    try {
      const res = await fetch(`/api/admin/submissions?key=${encodeURIComponent(key)}`);
      if (!res.ok) throw new Error("Invalid passcode");
      const data = await res.json();
      setSubmissions(data.submissions || []);
      setIsAuthenticated(true);
      sessionStorage.setItem("hustlify_admin_key", key);
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Access denied");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("hustlify_admin_key");
    setIsAuthenticated(false);
    setPasscode("");
  };

  const playAudio = (url: string) => {
    if (activeAudioUrl === url && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setActiveAudioUrl(url);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(console.error);
      }
    }
  };

  const exportCSV = () => {
    if (submissions.length === 0) return;

    const headers = [
      "ID", "Date", "Company", "Contact Person", "Designation", "Industry", "Location", "Email", "Phone", "Website", "Year Established", "Description",
      "Products/Services", "Offering Type", "Target Customers", "Price Range", "Differentiation",
      "Primary Goals", "Areas to Improve",
      "Sales Team Size", "Dedicated Lead", "Team Experience", "Team Management", "Sales Channels", "Sales Challenges", "Conversion Process",
      "Marketing Strategy (Text)", "Marketing Voice URL", "Paid Advertising", "Enquiry Sources", "Marketing Challenges", "Social Links",
      "Monthly Customers/Sales", "Avg Transaction Value", "Achieving Targets", "Sales Difficulties", "Monthly Conv %", "Expected Conv %", "Incentive per Sale", "Salary Structure", "Resignations/Yr",
      "Enquiries & Followup", "CRM Tools", "Delivery Method", "Customer Support", "Dashboard Reports", "Project Details", "Onboarded", "Total Volume", "Completed",
      "Who Manages Sales/Mktg", "Training Method (Text)", "Training Voice URL", "Performance Evaluation", "Team Challenges",
      "Three Biggest Problems (Text)", "Problems Voice URL", "Department to Improve", "Problems to Investigate", "Consultation Goal (Text)", "Goal Voice URL", "Expected Outcome", "Expected Turnover", "Additional Notes"
    ];

    const rows = submissions.map((s) => [
      s.id,
      new Date(s.submittedAt).toLocaleDateString(),
      `"${(s.companyName || "").replace(/"/g, '""')}"`,
      `"${(s.contactPerson || "").replace(/"/g, '""')}"`,
      `"${(s.designation || "").replace(/"/g, '""')}"`,
      `"${(s.q17_industryField || "").replace(/"/g, '""')}"`,
      `"${(s.businessLocation || "").replace(/"/g, '""')}"`,
      s.email,
      s.phone,
      s.website || "",
      s.q18_establishedYear || "",
      `"${(s.businessDescription || "").replace(/"/g, '""')}"`,

      `"${(s.productsServicesOffered || "").replace(/"/g, '""')}"`,
      s.q4_productOrService || "",
      `"${(s.q3_targetAudience || "").replace(/"/g, '""')}"`,
      `"${(s.approximatePriceRange || "").replace(/"/g, '""')}"`,
      `"${(s.competitorDifferentiation || "").replace(/"/g, '""')}"`,

      `"${(s.primaryBusinessGoals || "").replace(/"/g, '""')}"`,
      `"${(s.areasToImprove || "").replace(/"/g, '""')}"`,

      `"${(s.q19_salesTeamSize || "").replace(/"/g, '""')}"`,
      s.q23_dedicatedSalesLead || "",
      `"${(s.q20_salesTeamExperience || "").replace(/"/g, '""')}"`,
      `"${(s.salesTeamManagement || "").replace(/"/g, '""')}"`,
      `"${(s.salesChannels || "").replace(/"/g, '""')}"`,
      `"${(s.q26_salesTeamChallenges || "").replace(/"/g, '""')}"`,
      `"${(s.q16_leadConversionProcess || "").replace(/"/g, '""')}"`,

      `"${(s.q22_salesMarketingStrategy || "").replace(/"/g, '""')}"`,
      s.q22_voiceUrl || "",
      `"${(s.paidAdvertising || "").replace(/"/g, '""')}"`,
      `"${(s.q21_leadGenerationSources || "").replace(/"/g, '""')}"`,
      `"${(s.marketingChallenges || "").replace(/"/g, '""')}"`,
      `"${(s.q14_socialLinks || []).map((l) => `${l.platform}: ${l.url}`).join(" | ")}"`,

      `"${(s.monthlyCustomerSalesVolume || "").replace(/"/g, '""')}"`,
      `"${(s.averageTransactionValue || "").replace(/"/g, '""')}"`,
      s.achievingSalesTargets || "",
      `"${(s.salesPerformanceDifficulties || "").replace(/"/g, '""')}"`,
      s.q24_monthlyConversionRatio || "",
      s.q25_expectedConversionRatio || "",
      `"${(s.q1_incentivePerSale || "").replace(/"/g, '""')}"`,
      `"${(s.q5_salaryStructure || "").replace(/"/g, '""')}"`,
      s.q7_employeeResignationsPerYear || "",

      `"${(s.customerEnquiriesFollowup || "").replace(/"/g, '""')}"`,
      `"${(s.q2_currentCrmTools || "").replace(/"/g, '""')}"`,
      `"${(s.deliveryMethod || "").replace(/"/g, '""')}"`,
      `"${(s.customerSupportHandling || "").replace(/"/g, '""')}"`,
      s.q15_dashboardReports || "",
      `"${(s.q10_currentProjectDetails || "").replace(/"/g, '""')}"`,
      s.q11_projectsOnboarded || "",
      s.q12_totalProjectVolume || "",
      s.q13_projectsCompleted || "",

      `"${(s.q28_stakeholdersInvolved || "").replace(/"/g, '""')}"`,
      `"${(s.q27_salesTrainingMethod || "").replace(/"/g, '""')}"`,
      s.q27_voiceUrl || "",
      `"${(s.employeePerformanceEvaluation || "").replace(/"/g, '""')}"`,
      `"${(s.teamManagementChallenges || "").replace(/"/g, '""')}"`,

      `"${(s.q8_biggestPainPoint || "").replace(/"/g, '""')}"`,
      s.q8_voiceUrl || "",
      `"${(s.departmentNeedingImprovement || "").replace(/"/g, '""')}"`,
      `"${(s.specificProblemsToInvestigate || "").replace(/"/g, '""')}"`,
      `"${(s.q9_consultationGoal || "").replace(/"/g, '""')}"`,
      s.q9_voiceUrl || "",
      `"${(s.expectedOutcome || "").replace(/"/g, '""')}"`,
      `"${(s.expectedTurnover || "").replace(/"/g, '""')}"`,
      `"${(s.additionalNotes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `hustlify_consultation_assessments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = submissions.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.companyName?.toLowerCase().includes(q) ||
      s.contactPerson?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900">
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />

      {/* Admin Nav */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-neutral-500 hover:text-neutral-900 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Form
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="font-semibold text-neutral-900">Corporate Assessment Admin</span>
          </div>

          {isAuthenticated && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={exportCSV}
                className="text-neutral-600 hover:text-neutral-900 flex items-center gap-1 font-medium cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export All to CSV
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="text-neutral-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Exit
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {!isAuthenticated ? (
          <div className="max-w-xs mx-auto my-16 bg-white border border-neutral-200 rounded-lg p-6 shadow-sm text-center">
            <h1 className="text-sm font-semibold text-neutral-900 mb-1">Admin Access</h1>
            <p className="text-xs text-neutral-400 mb-4">Enter passcode to view submissions</p>

            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Passcode (default: admin123)"
                className="w-full px-3 py-2 text-xs text-neutral-900 minimal-input rounded text-center font-mono"
                autoFocus
              />
              {authError && <p className="text-xs text-rose-600">{authError}</p>}
              <button
                type="submit"
                className="w-full py-2 px-3 rounded text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-white transition-colors cursor-pointer"
              >
                Unlock
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500 font-medium">
                {submissions.length} Total Submissions
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company, contact, id..."
                className="px-2.5 py-1.5 text-xs text-neutral-900 minimal-input rounded w-56"
              />
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-lg p-8 text-center text-xs text-neutral-400">
                No submissions found.
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((item) => {
                  const isExpanded = expandedId === item.id;
                  return (
                    <div key={item.id} className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                      <div
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-neutral-50 text-xs"
                      >
                        <div>
                          <span className="font-semibold text-neutral-900">{item.companyName || "Unnamed"}</span>
                          <span className="text-neutral-400 font-normal ml-2">({item.contactPerson} - {item.designation || "N/A"})</span>
                          <div className="text-[11px] text-neutral-400 mt-0.5">{item.email} • {item.phone} • {item.businessLocation || "N/A"}</div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-neutral-400 font-mono text-[11px]">{item.id}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 space-y-4 text-xs">
                          {/* Audio playback buttons */}
                          <div className="space-y-2">
                            <div className="font-medium text-neutral-700">Strategic Voice Notes</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {/* Q8 */}
                              <div className="p-2.5 bg-white border border-neutral-200 rounded space-y-1">
                                <div className="font-medium text-neutral-800">Q8. Three Biggest Problems</div>
                                <div className="text-[11px] text-neutral-500 italic">{item.q8_biggestPainPoint || "No text provided"}</div>
                                {item.q8_voiceUrl && (
                                  <button
                                    type="button"
                                    onClick={() => playAudio(item.q8_voiceUrl!)}
                                    className="mt-1 py-1 px-2.5 bg-neutral-900 text-white rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                                  >
                                    {activeAudioUrl === item.q8_voiceUrl && isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                    Play Audio (Q8)
                                  </button>
                                )}
                              </div>

                              {/* Q9 */}
                              <div className="p-2.5 bg-white border border-neutral-200 rounded space-y-1">
                                <div className="font-medium text-neutral-800">Q9. Consultation Goals & Outcomes</div>
                                <div className="text-[11px] text-neutral-500 italic">{item.q9_consultationGoal || "No text provided"}</div>
                                {item.q9_voiceUrl && (
                                  <button
                                    type="button"
                                    onClick={() => playAudio(item.q9_voiceUrl!)}
                                    className="mt-1 py-1 px-2.5 bg-neutral-900 text-white rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                                  >
                                    {activeAudioUrl === item.q9_voiceUrl && isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                    Play Audio (Q9)
                                  </button>
                                )}
                              </div>

                              {/* Q22 */}
                              <div className="p-2.5 bg-white border border-neutral-200 rounded space-y-1">
                                <div className="font-medium text-neutral-800">Q22. Customer Attraction & Marketing</div>
                                <div className="text-[11px] text-neutral-500 italic">{item.q22_salesMarketingStrategy || "No text provided"}</div>
                                {item.q22_voiceUrl && (
                                  <button
                                    type="button"
                                    onClick={() => playAudio(item.q22_voiceUrl!)}
                                    className="mt-1 py-1 px-2.5 bg-neutral-900 text-white rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                                  >
                                    {activeAudioUrl === item.q22_voiceUrl && isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                    Play Audio (Q22)
                                  </button>
                                )}
                              </div>

                              {/* Q27 */}
                              <div className="p-2.5 bg-white border border-neutral-200 rounded space-y-1">
                                <div className="font-medium text-neutral-800">Q27. Regular Employee Training</div>
                                <div className="text-[11px] text-neutral-500 italic">{item.q27_salesTrainingMethod || "No text provided"}</div>
                                {item.q27_voiceUrl && (
                                  <button
                                    type="button"
                                    onClick={() => playAudio(item.q27_voiceUrl!)}
                                    className="mt-1 py-1 px-2.5 bg-neutral-900 text-white rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                                  >
                                    {activeAudioUrl === item.q27_voiceUrl && isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                    Play Audio (Q27)
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Full Q & A breakdown */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-neutral-200 text-neutral-600">
                            <div className="space-y-1.5">
                              <div><strong className="text-neutral-900 font-medium">Company Overview:</strong> {item.businessDescription || "—"}</div>
                              <div><strong className="text-neutral-900 font-medium">Products/Services Offered:</strong> {item.productsServicesOffered || "—"}</div>
                              <div><strong className="text-neutral-900 font-medium">Offering Type:</strong> {item.q4_productOrService || "—"}</div>
                              <div><strong className="text-neutral-900 font-medium">Target Customers:</strong> {item.q3_targetAudience || "—"}</div>
                              <div><strong className="text-neutral-900 font-medium">Price Range:</strong> {item.approximatePriceRange || "—"}</div>
                              <div><strong className="text-neutral-900 font-medium">Differentiation:</strong> {item.competitorDifferentiation || "—"}</div>
                              <div><strong className="text-neutral-900 font-medium">Primary Goals:</strong> {item.primaryBusinessGoals || "—"}</div>
                              <div><strong className="text-neutral-900 font-medium">Areas to Improve:</strong> {item.areasToImprove || "—"}</div>
                              <div><strong className="text-neutral-900 font-medium">Sales Team Size:</strong> {item.q19_salesTeamSize || "—"}</div>
                              <div><strong className="text-neutral-900 font-medium">Dedicated Lead:</strong> {item.q23_dedicatedSalesLead || "—"}</div>
                              <div><strong className="text-neutral-900 font-medium">Sales Channels:</strong> {item.salesChannels || "—"}</div>
                              <div><strong className="text-neutral-900 font-medium">Sales Challenges:</strong> {item.q26_salesTeamChallenges || "—"}</div>
                              <div><strong className="text-neutral-900 font-medium">Paid Advertising:</strong> {item.paidAdvertising || "—"}</div>
                            </div>

                            <div className="space-y-1.5">
                              <div><strong className="text-neutral-900 font-medium">Lead Gen Sources:</strong> {item.q21_leadGenerationSources || "—"}</div>
                              <div><strong className="text-neutral-900 font-medium">Marketing Challenges:</strong> {item.marketingChallenges || "—"}</div>
                              <div><strong className="text-neutral-900 font-medium">Monthly Customers/Sales:</strong> {item.monthlyCustomerSalesVolume || "—"}</div>
                              <div><strong className="text-neutral-900 font-medium">Avg Transaction Value:</strong> {item.averageTransactionValue || "—"}</div>
                              <div><strong className="text-neutral-900 font-medium">Achieving Targets:</strong> {item.achievingSalesTargets || "—"}</div>
                              <div><strong className="text-neutral-900 font-medium">Sales Difficulties:</strong> {item.salesPerformanceDifficulties || "—"}</div>
                              <div><strong className="text-neutral-900 font-medium">CRM Tools:</strong> {item.q2_currentCrmTools || "—"}</div>
                              <div><strong className="text-neutral-900 font-medium">Delivery Method:</strong> {item.deliveryMethod || "—"}</div>
                              <div><strong className="text-neutral-900 font-medium">Customer Support:</strong> {item.customerSupportHandling || "—"}</div>
                              <div><strong className="text-neutral-900 font-medium">Expected Outcome:</strong> {item.expectedOutcome || "—"}</div>
                              <div><strong className="text-neutral-900 font-medium">Expected Turnover:</strong> {item.expectedTurnover || "—"}</div>
                              <div><strong className="text-neutral-900 font-medium">Dept Needing Improvement:</strong> {item.departmentNeedingImprovement || "—"}</div>
                              <div><strong className="text-neutral-900 font-medium">Specific Problems:</strong> {item.specificProblemsToInvestigate || "—"}</div>
                              <div><strong className="text-neutral-900 font-medium">Additional Notes:</strong> {item.additionalNotes || "—"}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
