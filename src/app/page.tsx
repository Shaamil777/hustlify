import AssessmentForm from "@/components/AssessmentForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 flex flex-col justify-center">
      {/* No navbar as requested - direct split layout form */}
      <AssessmentForm />
    </main>
  );
}
