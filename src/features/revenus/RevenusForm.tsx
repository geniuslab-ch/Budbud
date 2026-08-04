"use client";

import { Plus } from "lucide-react";
import { useBudgetContext } from "@/context/BudgetContext";
import { nouvelleLigneRevenu } from "@/hooks/useBudget";
import { uid } from "@/lib/utils";
import { formatCHF } from "@/utils/formatters";
import { versMensuel } from "@/services/calculations/budgetCalculator";
import { LigneRevenu } from "./LigneRevenu";
import type { LigneRevenu as TLigneRevenu } from "@/types/budget.types";

export function RevenusForm() {
  const { budget, setBudget } = useBudgetContext();
  const revenus = budget.revenus;

  const update = (id: string, patch: TLigneRevenu) =>
    setBudget((b) => ({ ...b, revenus: b.revenus.map((l) => (l.id === id ? patch : l)) }));
  const add = () => setBudget((b) => ({ ...b, revenus: [...b.revenus, nouvelleLigneRevenu()] }));
  const duplicate = (l: TLigneRevenu) =>
    setBudget((b) => ({ ...b, revenus: [...b.revenus, { ...l, id: uid() }] }));
  const remove = (id: string) =>
    setBudget((b) => ({ ...b, revenus: b.revenus.filter((l) => l.id !== id) }));

  const total = revenus.reduce((s, l) => s + versMensuel(l.montant, l.frequence), 0);

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Revenus</h2>
        <p className="text-sm text-slate-500">
          Ajoutez toutes vos sources de revenus. Le montant mensuel équivalent est calculé automatiquement.
        </p>
      </div>

      {revenus.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          Aucun revenu pour l&apos;instant. Ajoutez votre première ligne.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {revenus.map((l) => (
          <LigneRevenu
            key={l.id}
            ligne={l}
            onChange={(patch) => update(l.id, patch)}
            onDuplicate={() => duplicate(l)}
            onDelete={() => remove(l.id)}
          />
        ))}
      </div>

      <button
        onClick={add}
        className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-300 py-3 text-sm font-medium text-brand-700 hover:bg-brand-50"
      >
        <Plus size={16} /> Ajouter un revenu
      </button>

      <div className="sticky bottom-20 mt-2 rounded-xl bg-slate-900 px-4 py-3 text-white shadow-lg sm:static sm:bottom-auto">
        <p className="text-xs uppercase tracking-wide text-slate-300">Total revenus mensuels</p>
        <p className="text-xl font-semibold tabular-nums">{formatCHF(total)}</p>
      </div>
    </div>
  );
}
