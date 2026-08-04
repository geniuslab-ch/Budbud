"use client";

import { useBudgetContext } from "@/context/BudgetContext";
import { RAV_MIN_PAR_PERSONNE } from "@/utils/constants";
import { formatCHF, formatPourcentage } from "@/utils/formatters";
import { StatCard } from "./StatCard";
import { AlertBanner } from "./AlertBanner";
import { ChartCamembert } from "./ChartCamembert";
import { ChartCategories } from "./ChartCategories";
import { FoyerCard } from "@/features/foyer/FoyerCard";
import { ObjectifCard } from "@/features/objectif-epargne/ObjectifCard";

export function Dashboard() {
  const { totaux, alertes } = useBudgetContext();

  return (
    <div className="flex flex-col gap-5 pb-10">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Résumé et tableau de bord</h2>
        <p className="text-sm text-slate-500">Vue d&apos;ensemble de votre budget mensuel.</p>
      </div>

      <AlertBanner alertes={alertes} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Revenus" valeur={formatCHF(totaux.totalRevenus)} tonalite="good" />
        <StatCard label="Dépenses" valeur={formatCHF(totaux.totalDepensesReel)} />
        <StatCard label="Solde" valeur={formatCHF(totaux.solde)} tonalite={totaux.solde >= 0 ? "good" : "bad"} />
        <StatCard
          label="Reste à vivre"
          valeur={formatCHF(totaux.resteAVivre)}
          sousLibelle={`${formatCHF(totaux.resteAVivreParPersonne)} / personne`}
          tonalite={totaux.resteAVivreParPersonne >= RAV_MIN_PAR_PERSONNE ? "good" : "bad"}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Taux d'endettement" valeur={formatPourcentage(totaux.tauxEndettement)} />
        <StatCard label="Taux d'épargne" valeur={formatPourcentage(totaux.tauxEpargne)} />
        <StatCard label="Dépenses fixes" valeur={formatCHF(totaux.depensesFixes)} />
        <StatCard label="Dépenses variables" valeur={formatCHF(totaux.depensesVariables)} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FoyerCard />
        <ObjectifCard />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="mb-2 font-medium text-slate-800">Répartition des dépenses</h3>
        <ChartCamembert parCategorie={totaux.parCategorie} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="mb-2 font-medium text-slate-800">Dépenses par catégorie</h3>
        <ChartCategories parCategorie={totaux.parCategorie} />
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
        <p className="font-medium text-slate-600">Évolution mensuelle</p>
        <p className="mt-1">Structure prête pour une future fonctionnalité : l&apos;historique multi-mois sera disponible en V2.</p>
      </div>
    </div>
  );
}
