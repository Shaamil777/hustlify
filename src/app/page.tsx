import AssessmentForm from "@/components/AssessmentForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-200/60 flex items-center justify-center p-2 sm:p-4 lg:p-8 antialiased selection:bg-emerald-500/20 selection:text-emerald-900">
      <div className="w-full flex items-center justify-center">
        <AssessmentForm />
      </div>
    </main>
  );
}
