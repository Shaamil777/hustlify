import AssessmentForm from "@/components/AssessmentForm";
import Link from "next/link";
import { Lock, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      {/* Mini top notification bar */}
      <nav className="bg-[#0b0f19] text-slate-300 text-[11px] font-medium py-2 px-4 border-b border-slate-800">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-medium">Hustlify B2B Assessment & Diagnostic Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Confidential Client Review
            </span>
            <Link
              href="/admin"
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold underline underline-offset-2"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Access</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Assessment Form */}
      <div className="flex-1">
        <AssessmentForm />
      </div>

      {/* Dark Footer Band */}
      <footer className="bg-[#090d16] text-slate-400 py-8 px-4 text-xs border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              H
            </div>
            <span className="text-slate-200 font-semibold tracking-wide">
              Hustlify Consulting
            </span>
          </div>

          <div className="text-center sm:text-right text-slate-500">
            © {new Date().getFullYear()} Hustlify Consulting Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
