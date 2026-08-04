"use client";

import { useBudgetContext } from "@/context/BudgetContext";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Accueil } from "@/features/accueil/Accueil";
import { RevenusForm } from "@/features/revenus/RevenusForm";
import { DepensesForm } from "@/features/depenses/DepensesForm";
import { Dashboard } from "@/features/dashboard/Dashboard";
import { ExportPanel } from "@/features/export/ExportPanel";
import { ExpertPanel } from "@/features/expert/ExpertPanel";

export default function Page() {
  const { etape, modeExpert } = useBudgetContext();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-5">
        {etape === "accueil" && <Accueil />}
        {etape === "revenus" && <RevenusForm />}
        {etape === "depenses" && <DepensesForm />}
        {etape === "resume" && <Dashboard />}
        {etape === "export" && <ExportPanel />}
      </main>

      <BottomNav />

      {modeExpert && <ExpertPanel />}
    </div>
  );
}
