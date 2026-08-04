"use client";

import { Wallet, ShoppingBag, PieChart, Download } from "lucide-react";
import { useBudgetContext } from "@/context/BudgetContext";
import { ParametresForm } from "./ParametresForm";
import type { EtapeParcours } from "@/types/budget.types";

const RACCOURCIS: { key: EtapeParcours; label: string; description: string; icon: typeof Wallet }[] = [
  { key: "revenus", label: "Revenus", description: "Vos entrées d'argent", icon: Wallet },
  { key: "depenses", label: "Dépenses", description: "Vos charges par catégorie", icon: ShoppingBag },
  { key: "resume", label: "Résumé", description: "Solde, alertes, graphiques", icon: PieChart },
  { key: "export", label: "Export", description: "PDF, Excel, JSON", icon: Download },
];

export function Accueil() {
  const { budget, aller } = useBudgetContext();

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-200">Budget+</p>
        <h1 className="mt-1 text-2xl font-semibold">Construisez votre budget en moins de 5 minutes</h1>
        <p className="mt-2 text-sm text-brand-100">
          Revenus, dépenses, solde, alertes : tout est calculé automatiquement. Vos données restent sur cet appareil.
        </p>
        <button
          onClick={() => aller("revenus")}
          className="mt-4 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-50"
        >
          Commencer
        </button>
      </div>

      <ParametresForm />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {RACCOURCIS.map(({ key, label, description, icon: Icon }) => (
          <button
            key={key}
            onClick={() => aller(key)}
            className="flex flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-brand-300 hover:bg-brand-50/50"
          >
            <Icon size={20} className="text-brand-700" />
            <span className="text-sm font-medium text-slate-800">{label}</span>
            <span className="text-xs text-slate-500">{description}</span>
          </button>
        ))}
      </div>

      {budget.revenus.length === 0 && (
        <p className="text-center text-xs text-slate-400">
          Astuce : commencez par l&apos;étape Revenus, puis Dépenses — le résumé se met à jour automatiquement.
        </p>
      )}
    </div>
  );
}
