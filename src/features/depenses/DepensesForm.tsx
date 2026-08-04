"use client";

import { useState } from "react";
import { useBudgetContext } from "@/context/BudgetContext";
import { nouvelleLigneDepense } from "@/hooks/useBudget";
import { uid } from "@/lib/utils";
import { CATEGORIES_DEPENSES } from "@/utils/constants";
import { formatCHF } from "@/utils/formatters";
import { CategorieCard } from "./CategorieCard";
import type { CategorieDepense, LigneDepense as TLigneDepense } from "@/types/budget.types";

export function DepensesForm() {
  const { budget, setBudget, totaux } = useBudgetContext();
  const [ouvertes, setOuvertes] = useState<Set<CategorieDepense>>(new Set());

  const toggle = (cat: CategorieDepense) =>
    setOuvertes((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });

  const update = (cat: CategorieDepense, id: string, patch: TLigneDepense) =>
    setBudget((b) => ({
      ...b,
      depenses: { ...b.depenses, [cat]: b.depenses[cat].map((l) => (l.id === id ? patch : l)) },
    }));
  const add = (cat: CategorieDepense) =>
    setBudget((b) => ({ ...b, depenses: { ...b.depenses, [cat]: [...b.depenses[cat], nouvelleLigneDepense()] } }));
  const duplicate = (cat: CategorieDepense, l: TLigneDepense) =>
    setBudget((b) => ({ ...b, depenses: { ...b.depenses, [cat]: [...b.depenses[cat], { ...l, id: uid() }] } }));
  const remove = (cat: CategorieDepense, id: string) =>
    setBudget((b) => ({ ...b, depenses: { ...b.depenses, [cat]: b.depenses[cat].filter((l) => l.id !== id) } }));

  return (
    <div className="flex flex-col gap-3 pb-24">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Dépenses</h2>
        <p className="text-sm text-slate-500">
          Ouvrez une catégorie pour ajouter vos lignes de dépenses, avec budget prévu et réel.
        </p>
      </div>

      {CATEGORIES_DEPENSES.map((cat) => (
        <CategorieCard
          key={cat}
          categorie={cat}
          lignes={budget.depenses[cat] ?? []}
          ouverte={ouvertes.has(cat)}
          onToggle={() => toggle(cat)}
          onUpdate={(id, patch) => update(cat, id, patch)}
          onAdd={() => add(cat)}
          onDuplicate={(l) => duplicate(cat, l)}
          onDelete={(id) => remove(cat, id)}
        />
      ))}

      <div className="sticky bottom-20 mt-2 rounded-xl bg-slate-900 px-4 py-3 text-white shadow-lg sm:static sm:bottom-auto">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300">Total dépenses (réel)</span>
          <span className="text-xl font-semibold tabular-nums">{formatCHF(totaux.totalDepensesReel)}</span>
        </div>
        {totaux.ecartTotal !== 0 && (
          <p className={`mt-1 text-xs ${totaux.ecartTotal > 0 ? "text-amber-300" : "text-emerald-300"}`}>
            Écart vs budget prévu : {totaux.ecartTotal > 0 ? "+" : ""}
            {formatCHF(totaux.ecartTotal)}
          </p>
        )}
      </div>
    </div>
  );
}
