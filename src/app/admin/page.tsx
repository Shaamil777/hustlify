"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Lock, 
  Search, 
  Download, 
  ExternalLink, 
  Play, 
  Pause, 
  ChevronDown, 
  ChevronUp, 
  Mic, 
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
      "ID", "Date", "Company", "Contact", "Email", "Phone", "Website",
      "Q1 Incentive", "Q2 CRM", "Q3 Audience", "Q4 Offering", "Q5 Salary", "Expected Outcome", "Expected Turnover",
      "Q7 Resignations/Yr", "Q8 Pain Point", "Q8 Voice URL", "Q9 Goal", "Q9 Voice URL",
      "Q10 Projects", "Q11 Onboarded", "Q12 Volume", "Q13 Completed", "Q14 Social Links",
      "Q15 Dashboards", "Q16 Conversion Process", "Q17 Industry", "Q18 Established",
      "Q19 Sales Team Size", "Q20 Experience", "Q21 Lead Gen", "Q22 Sales Strategy",
      "Q22 Voice URL", "Q23 Sales Lead", "Q24 Monthly Conv %", "Q25 Expected Conv %",
      "Q26 Challenges", "Q27 Training Method", "Q27 Voice URL", "Q28 Stakeholders"
    ];

    const rows = submissions.map((s) => [
      s.id,
      new Date(s.submittedAt).toLocaleDateString(),
      `"${(s.companyName || "").replace(/"/g, '""')}"`,
      `"${(s.contactPerson || "").replace(/"/g, '""')}"`,
      s.email,
      s.phone,
      s.website || "",
      `"${(s.q1_incentivePerSale || "").replace(/"/g, '""')}"`,
      `"${(s.q2_currentCrmTools || "").replace(/"/g, '""')}"`,
      `"${(s.q3_targetAudience || "").replace(/"/g, '""')}"`,
      s.q4_productOrService,
      `"${(s.q5_salaryStructure || "").replace(/"/g, '""')}"`,
      `"${(s.expectedOutcome || "").replace(/"/g, '""')}"`,
      `"${(s.expectedTurnover || "").replace(/"/g, '""')}"`,
      s.q7_employeeResignationsPerYear,
      `"${(s.q8_biggestPainPoint || "").replace(/"/g, '""')}"`,
      s.q8_voiceUrl || "",
      `"${(s.q9_consultationGoal || "").replace(/"/g, '""')}"`,
      s.q9_voiceUrl || "",
      `"${(s.q10_currentProjectDetails || "").replace(/"/g, '""')}"`,
      s.q11_projectsOnboarded,
      s.q12_totalProjectVolume,
      s.q13_projectsCompleted,
      `"${(s.q14_socialLinks || []).map((l) => `${l.platform}: ${l.url}`).join(" | ")}"`,
      s.q15_dashboardReports,
      `"${(s.q16_leadConversionProcess || "").replace(/"/g, '""')}"`,
      `"${(s.q17_industryField || "").replace(/"/g, '""')}"`,
      s.q18_establishedYear,
      s.q19_salesTeamSize,
      `"${(s.q20_salesTeamExperience || "").replace(/"/g, '""')}"`,
      `"${(s.q21_leadGenerationSources || "").replace(/"/g, '""')}"`,
      `"${(s.q22_salesMarketingStrategy || "").replace(/"/g, '""')}"`,
      s.q22_voiceUrl || "",
      s.q23_dedicatedSalesLead,
      s.q24_monthlyConversionRatio,
      s.q25_expectedConversionRatio,
      `"${(s.q26_salesTeamChallenges || "").replace(/"/g, '""')}"`,
      `"${(s.q27_salesTrainingMethod || "").replace(/"/g, '""')}"`,
      s.q27_voiceUrl || "",
      `"${(s.q28_stakeholdersInvolved || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `hustlify_assessments_${new Date().toISOString().slice(0, 10)}.csv`);
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
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-neutral-500 hover:text-neutral-900 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Form
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="font-semibold text-neutral-900">Admin</span>
          </div>

          {isAuthenticated && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={exportCSV}
                className="text-neutral-600 hover:text-neutral-900 flex items-center gap-1 font-medium cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
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
      <main className="max-w-4xl mx-auto px-4 py-8">
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
                placeholder="Search..."
                className="px-2.5 py-1.5 text-xs text-neutral-900 minimal-input rounded w-48"
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
                          <span className="text-neutral-400 font-normal ml-2">({item.contactPerson})</span>
                          <div className="text-[11px] text-neutral-400 mt-0.5">{item.email} • {item.phone}</div>
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
                            <div className="font-medium text-neutral-700">Voice Notes</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {/* Q8 */}
                              <div className="p-2.5 bg-white border border-neutral-200 rounded space-y-1">
                                <div className="font-medium text-neutral-800">Q.8 Pain point</div>
                                <div className="text-[11px] text-neutral-500 italic">{item.q8_biggestPainPoint || "No text"}</div>
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
                                <div className="font-medium text-neutral-800">Q.9 Consultation Goal</div>
                                <div className="text-[11px] text-neutral-500 italic">{item.q9_consultationGoal || "No text"}</div>
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
                                <div className="font-medium text-neutral-800">Q.22 Sales Strategy</div>
                                <div className="text-[11px] text-neutral-500 italic">{item.q22_salesMarketingStrategy || "No text"}</div>
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
                                <div className="font-medium text-neutral-800">Q.27 Sales Training Method</div>
                                <div className="text-[11px] text-neutral-500 italic">{item.q27_salesTrainingMethod || "No text"}</div>
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

                          {/* Full Q & A */}
                          <div className="space-y-1.5 text-neutral-600 pt-2 border-t border-neutral-200">
                            <div><strong className="text-neutral-900 font-medium">Q1 Incentive:</strong> {item.q1_incentivePerSale || "—"}</div>
                            <div><strong className="text-neutral-900 font-medium">Q2 CRM:</strong> {item.q2_currentCrmTools || "—"}</div>
                            <div><strong className="text-neutral-900 font-medium">Q3 Target Audience:</strong> {item.q3_targetAudience || "—"}</div>
                            <div><strong className="text-neutral-900 font-medium">Q4 Offering:</strong> {item.q4_productOrService || "—"}</div>
                            <div><strong className="text-neutral-900 font-medium">Q5 Salary:</strong> {item.q5_salaryStructure || "—"}</div>
                            <div><strong className="text-neutral-900 font-medium">Expected Outcome:</strong> {item.expectedOutcome || "—"}</div>
                            <div><strong className="text-neutral-900 font-medium">Expected Turnover:</strong> {item.expectedTurnover || "—"}</div>
                            <div><strong className="text-neutral-900 font-medium">Q7 Resignations/Yr:</strong> {item.q7_employeeResignationsPerYear || "—"}</div>
                            <div><strong className="text-neutral-900 font-medium">Q10 Projects:</strong> {item.q10_currentProjectDetails || "—"}</div>
                            <div><strong className="text-neutral-900 font-medium">Q11 Onboarded:</strong> {item.q11_projectsOnboarded || "—"}</div>
                            <div><strong className="text-neutral-900 font-medium">Q12 Volume:</strong> {item.q12_totalProjectVolume || "—"}</div>
                            <div><strong className="text-neutral-900 font-medium">Q13 Completed:</strong> {item.q13_projectsCompleted || "—"}</div>
                            <div><strong className="text-neutral-900 font-medium">Q15 Dashboards:</strong> {item.q15_dashboardReports || "—"}</div>
                            <div><strong className="text-neutral-900 font-medium">Q16 Lead Conversion:</strong> {item.q16_leadConversionProcess || "—"}</div>
                            <div><strong className="text-neutral-900 font-medium">Q17 Industry:</strong> {item.q17_industryField || "—"}</div>
                            <div><strong className="text-neutral-900 font-medium">Q18 Established:</strong> {item.q18_establishedYear || "—"}</div>
                            <div><strong className="text-neutral-900 font-medium">Q19 Team Size:</strong> {item.q19_salesTeamSize || "—"}</div>
                            <div><strong className="text-neutral-900 font-medium">Q20 Experience:</strong> {item.q20_salesTeamExperience || "—"}</div>
                            <div><strong className="text-neutral-900 font-medium">Q21 Lead Gen:</strong> {item.q21_leadGenerationSources || "—"}</div>
                            <div><strong className="text-neutral-900 font-medium">Q23 Sales Lead:</strong> {item.q23_dedicatedSalesLead || "—"}</div>
                            <div><strong className="text-neutral-900 font-medium">Q24 Monthly Conv %:</strong> {item.q24_monthlyConversionRatio || "—"}</div>
                            <div><strong className="text-neutral-900 font-medium">Q25 Expected Conv %:</strong> {item.q25_expectedConversionRatio || "—"}</div>
                            <div><strong className="text-neutral-900 font-medium">Q26 Challenges:</strong> {item.q26_salesTeamChallenges || "—"}</div>
                            <div><strong className="text-neutral-900 font-medium">Q28 Stakeholders:</strong> {item.q28_stakeholdersInvolved || "—"}</div>
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
