import AssessmentForm from "@/components/AssessmentForm";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 flex flex-col justify-between selection:bg-neutral-200">
      {/* Minimal Top Header */}
      <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900 tracking-tight">Hustlify</span>
            <span className="text-neutral-400">/</span>
            <span className="text-neutral-500">Assessment</span>
          </div>

          <Link
            href="/admin"
            className="text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Admin
          </Link>
        </div>
      </header>

      {/* Main Assessment Form */}
      <main className="flex-1">
        <AssessmentForm />
      </main>

      {/* Bare Minimal Footer */}
      <footer className="border-t border-neutral-200 bg-white py-6 text-center text-[11px] text-neutral-400">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Hustlify Consulting</span>
          <span>Confidential Assessment</span>
        </div>
      </footer>
    </div>
  );
}
