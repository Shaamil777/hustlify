import AssessmentForm from "@/components/AssessmentForm";

export default function Home() {
  return (
    <main className="min-h-screen page-ambient-bg flex items-center justify-center py-6 sm:py-10 px-3 sm:px-6 lg:px-8 antialiased selection:bg-emerald-500/20 selection:text-emerald-900">
      <div className="w-full flex items-center justify-center">
        <AssessmentForm />
      </div>
    </main>
  );
}
