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
  Building2, 
  Calendar, 
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
      if (!res.ok) {
        throw new Error("Invalid admin passcode");
      }
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
      "ID",
      "Date",
      "Company Name",
      "Contact Person",
      "Email",
      "Phone",
      "Website",
      "Q1 Incentive",
      "Q2 Current CRM",
      "Q3 Target Audience",
      "Q4 Product or Service",
      "Q5 Salary Structure",
      "Q6 Time Management",
      "Q7 Resignations/Year",
      "Q8 Biggest Pain Point",
      "Q8 Voice URL",
      "Q9 Consultation Goal",
      "Q9 Voice URL",
      "Q10 Current Projects",
      "Q11 Projects Onboarded",
      "Q12 Project Volume",
      "Q13 Projects Completed",
      "Q14 Social Links",
      "Q15 Dashboard Reports",
      "Q16 Lead Conversion Process",
      "Q17 Industry",
      "Q18 Established Year",
      "Q19 Sales Team Size",
      "Q20 Sales Team Experience",
      "Q21 Lead Gen Sources",
      "Q22 Sales Strategy",
      "Q22 Voice URL",
      "Q23 Sales Lead",
      "Q24 Monthly Conversion %",
      "Q25 Expected Conversion %",
      "Q26 Sales Challenges",
      "Q27 Sales Training Method",
      "Q27 Voice URL",
      "Q28 Stakeholders Involved"
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
      `"${(s.q6_timeManagement || "").replace(/"/g, '""')}"`,
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
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
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
      s.q17_industryField?.toLowerCase().includes(q) ||
      s.id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Admin Nav */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Return to Public Assessment Form"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="font-extrabold text-slate-900 text-base">Hustlify Hub</span>
              <span className="text-[10px] text-indigo-700 font-bold ml-2 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100">
                Admin Console
              </span>
            </div>
          </div>

          {isAuthenticated && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={exportCSV}
                className="py-2 px-3.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {!isAuthenticated ? (
          <div className="max-w-sm mx-auto my-16">
            <div className="card-executive p-8 rounded-3xl text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-7 h-7" />
              </div>

              <div>
                <h1 className="text-xl font-extrabold text-slate-900">Administrator Portal</h1>
                <p className="text-xs text-slate-500 mt-1">Enter your admin passcode to listen to voice notes and review responses</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3 pt-2">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Passcode (default: admin123)"
                  className="w-full px-4 py-3 text-xs text-slate-800 input-executive rounded-xl text-center font-mono tracking-widest"
                  autoFocus
                />

                {authError && (
                  <p className="text-xs text-rose-600 font-semibold">{authError}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  Unlock Admin Hub
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card-executive p-5 rounded-2xl">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Submissions</div>
                <div className="text-3xl font-extrabold text-slate-900 mt-1">{submissions.length}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Responses recorded</div>
              </div>

              <div className="card-executive p-5 rounded-2xl">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Voice Notes Captured</div>
                <div className="text-3xl font-extrabold text-indigo-600 mt-1">
                  {submissions.reduce(
                    (acc, s) =>
                      acc +
                      (s.q8_voiceUrl ? 1 : 0) +
                      (s.q9_voiceUrl ? 1 : 0) +
                      (s.q22_voiceUrl ? 1 : 0) +
                      (s.q27_voiceUrl ? 1 : 0),
                    0
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Across Q8, Q9, Q22, Q27</div>
              </div>

              <div className="card-executive p-5 rounded-2xl">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Google Sheets Status</div>
                <div className="text-3xl font-extrabold text-emerald-600 mt-1">Connected</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Auto-appends new rows</div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company, contact person, email, or industry..."
                className="w-full pl-11 pr-4 py-3 text-xs text-slate-800 input-executive rounded-2xl shadow-sm"
              />
            </div>

            {/* Submissions List */}
            {filtered.length === 0 ? (
              <div className="card-executive p-12 rounded-3xl text-center space-y-3">
                <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">No submissions found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery ? "No entries match your search criteria." : "Complete the assessment form on the homepage to see entries populate here."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((item) => {
                  const isExpanded = expandedId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="card-executive rounded-2xl overflow-hidden transition-all"
                    >
                      <div
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-black text-base flex items-center justify-center flex-shrink-0 shadow-sm">
                            {item.companyName ? item.companyName.charAt(0).toUpperCase() : "B"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-base text-slate-900">{item.companyName || "Unnamed Company"}</span>
                              <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded-full bg-slate-100 font-bold">
                                {item.id}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                              <span>{item.contactPerson} ({item.email})</span>
                              <span>•</span>
                              <span>{item.phone}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-3 text-xs">
                          <div className="flex items-center gap-1.5">
                            {item.q8_voiceUrl && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-800 font-bold flex items-center gap-1">
                                <Mic className="w-2.5 h-2.5 text-indigo-600" /> Q8
                              </span>
                            )}
                            {item.q9_voiceUrl && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-800 font-bold flex items-center gap-1">
                                <Mic className="w-2.5 h-2.5 text-indigo-600" /> Q9
                              </span>
                            )}
                            {item.q22_voiceUrl && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-800 font-bold flex items-center gap-1">
                                <Mic className="w-2.5 h-2.5 text-indigo-600" /> Q22
                              </span>
                            )}
                            {item.q27_voiceUrl && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-800 font-bold flex items-center gap-1">
                                <Mic className="w-2.5 h-2.5 text-indigo-600" /> Q27
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(item.submittedAt).toLocaleDateString()}
                          </div>

                          <div className="text-slate-400">
                            {isExpanded ? <ChevronUp className="w-5 h-5 text-indigo-600" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-slate-200 p-6 bg-slate-50/60 space-y-6 text-xs">
                          {/* Audio Player Section */}
                          <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-3">
                            <h4 className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                              <Mic className="w-4 h-4 text-indigo-600" /> Recorded Voice Notes
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* Q8 */}
                              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 shadow-sm">
                                <div className="font-bold text-slate-800">Q.8 Biggest Business Pain Point</div>
                                <div className="text-[11px] text-slate-500 italic">
                                  {item.q8_biggestPainPoint ? `"${item.q8_biggestPainPoint}"` : "No written notes"}
                                </div>
                                {item.q8_voiceUrl ? (
                                  <button
                                    type="button"
                                    onClick={() => playAudio(item.q8_voiceUrl!)}
                                    className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                                  >
                                    {activeAudioUrl === item.q8_voiceUrl && isPlaying ? (
                                      <>
                                        <Pause className="w-3.5 h-3.5 fill-white" /> Pause Audio
                                      </>
                                    ) : (
                                      <>
                                        <Play className="w-3.5 h-3.5 fill-white" /> Play Voice Note (Q8)
                                      </>
                                    )}
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-slate-400">No voice note uploaded</span>
                                )}
                              </div>

                              {/* Q9 */}
                              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 shadow-sm">
                                <div className="font-bold text-slate-800">Q.9 Primary Consultation Goal</div>
                                <div className="text-[11px] text-slate-500 italic">
                                  {item.q9_consultationGoal ? `"${item.q9_consultationGoal}"` : "No written notes"}
                                </div>
                                {item.q9_voiceUrl ? (
                                  <button
                                    type="button"
                                    onClick={() => playAudio(item.q9_voiceUrl!)}
                                    className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                                  >
                                    {activeAudioUrl === item.q9_voiceUrl && isPlaying ? (
                                      <>
                                        <Pause className="w-3.5 h-3.5 fill-white" /> Pause Audio
                                      </>
                                    ) : (
                                      <>
                                        <Play className="w-3.5 h-3.5 fill-white" /> Play Voice Note (Q9)
                                      </>
                                    )}
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-slate-400">No voice note uploaded</span>
                                )}
                              </div>

                              {/* Q22 */}
                              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 shadow-sm">
                                <div className="font-bold text-slate-800">Q.22 Sales & Marketing Strategy</div>
                                <div className="text-[11px] text-slate-500 italic">
                                  {item.q22_salesMarketingStrategy ? `"${item.q22_salesMarketingStrategy}"` : "No written notes"}
                                </div>
                                {item.q22_voiceUrl ? (
                                  <button
                                    type="button"
                                    onClick={() => playAudio(item.q22_voiceUrl!)}
                                    className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                                  >
                                    {activeAudioUrl === item.q22_voiceUrl && isPlaying ? (
                                      <>
                                        <Pause className="w-3.5 h-3.5 fill-white" /> Pause Audio
                                      </>
                                    ) : (
                                      <>
                                        <Play className="w-3.5 h-3.5 fill-white" /> Play Voice Note (Q22)
                                      </>
                                    )}
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-slate-400">No voice note uploaded</span>
                                )}
                              </div>

                              {/* Q27 */}
                              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 shadow-sm">
                                <div className="font-bold text-slate-800">Q.27 Sales Training Method</div>
                                <div className="text-[11px] text-slate-500 italic">
                                  {item.q27_salesTrainingMethod ? `"${item.q27_salesTrainingMethod}"` : "No written notes"}
                                </div>
                                {item.q27_voiceUrl ? (
                                  <button
                                    type="button"
                                    onClick={() => playAudio(item.q27_voiceUrl!)}
                                    className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                                  >
                                    {activeAudioUrl === item.q27_voiceUrl && isPlaying ? (
                                      <>
                                        <Pause className="w-3.5 h-3.5 fill-white" /> Pause Audio
                                      </>
                                    ) : (
                                      <>
                                        <Play className="w-3.5 h-3.5 fill-white" /> Play Voice Note (Q27)
                                      </>
                                    )}
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-slate-400">No voice note uploaded</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Full Question Breakdown */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2.5">
                              <div className="font-extrabold text-slate-900 text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
                                Section 1: Business & Operations
                              </div>
                              <div className="space-y-1.5 text-slate-700">
                                <div><strong className="text-slate-400 font-semibold">1. Incentive per sale:</strong> {item.q1_incentivePerSale || "—"}</div>
                                <div><strong className="text-slate-400 font-semibold">2. Current CRM:</strong> {item.q2_currentCrmTools || "—"}</div>
                                <div><strong className="text-slate-400 font-semibold">3. Target Audience:</strong> {item.q3_targetAudience || "—"}</div>
                                <div><strong className="text-slate-400 font-semibold">4. Product / Service:</strong> {item.q4_productOrService || "—"}</div>
                                <div><strong className="text-slate-400 font-semibold">5. Salary Structure:</strong> {item.q5_salaryStructure || "—"}</div>
                                <div><strong className="text-slate-400 font-semibold">6. Time Management:</strong> {item.q6_timeManagement || "—"}</div>
                                <div><strong className="text-slate-400 font-semibold">7. Resignations/Year:</strong> {item.q7_employeeResignationsPerYear || "—"}</div>
                                <div><strong className="text-slate-400 font-semibold">10. Project Details:</strong> {item.q10_currentProjectDetails || "—"}</div>
                                <div><strong className="text-slate-400 font-semibold">11. Projects Onboarded:</strong> {item.q11_projectsOnboarded || "—"}</div>
                                <div><strong className="text-slate-400 font-semibold">12. Total Project Volume:</strong> {item.q12_totalProjectVolume || "—"}</div>
                                <div><strong className="text-slate-400 font-semibold">13. Projects Completed:</strong> {item.q13_projectsCompleted || "—"}</div>
                                <div><strong className="text-slate-400 font-semibold">15. Dashboard Reports:</strong> {item.q15_dashboardReports || "—"}</div>
                                <div>
                                  <strong className="text-slate-400 font-semibold">14. Social Media Links:</strong>
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {(item.q14_socialLinks || []).map((l, idx) => (
                                      <a
                                        key={idx}
                                        href={l.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                                      >
                                        {l.platform}: {l.url} <ExternalLink className="w-2.5 h-2.5" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2.5">
                              <div className="font-extrabold text-slate-900 text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
                                Section 2: Sales & Lead Management
                              </div>
                              <div className="space-y-1.5 text-slate-700">
                                <div><strong className="text-slate-400 font-semibold">16. Lead Conversion Process:</strong> {item.q16_leadConversionProcess || "—"}</div>
                                <div><strong className="text-slate-400 font-semibold">17. Industry / Field:</strong> {item.q17_industryField || "—"}</div>
                                <div><strong className="text-slate-400 font-semibold">18. Year Established:</strong> {item.q18_establishedYear || "—"}</div>
                                <div><strong className="text-slate-400 font-semibold">19. Sales Team Size:</strong> {item.q19_salesTeamSize || "—"}</div>
                                <div><strong className="text-slate-400 font-semibold">20. Team Experience:</strong> {item.q20_salesTeamExperience || "—"}</div>
                                <div><strong className="text-slate-400 font-semibold">21. Lead Generation Sources:</strong> {item.q21_leadGenerationSources || "—"}</div>
                                <div><strong className="text-slate-400 font-semibold">23. Dedicated Sales Lead:</strong> {item.q23_dedicatedSalesLead || "—"}</div>
                                <div><strong className="text-slate-400 font-semibold">24. Monthly Conversion %:</strong> {item.q24_monthlyConversionRatio || "—"}</div>
                                <div><strong className="text-slate-400 font-semibold">25. Expected Conversion %:</strong> {item.q25_expectedConversionRatio || "—"}</div>
                                <div><strong className="text-slate-400 font-semibold">26. Team Challenges:</strong> {item.q26_salesTeamChallenges || "—"}</div>
                                <div><strong className="text-slate-400 font-semibold">28. Stakeholders:</strong> {item.q28_stakeholdersInvolved || "—"}</div>
                              </div>
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
