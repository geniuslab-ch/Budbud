"use client";

import { Target } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useBudgetContext } from "@/context/BudgetContext";
import { formatCHF, formatPourcentage, versNombre } from "@/utils/formatters";

export function ObjectifCard() {
  const { budget, setBudget, totaux } = useBudgetContext();
  const cible = versNombre(budget.objectifEpargne);
  const atteint = Math.max(0, totaux.solde);
  const pourcentage = cible > 0 ? Math.min(100, (atteint / cible) * 100) : 0;
  const resteNecessaire = Math.max(0, cible - atteint);

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <Target size={18} className="text-slate-500" />
        <CardTitle>Objectif d&apos;épargne mensuel</CardTitle>
      </div>
      <Field label="Montant cible (CHF)">
        <Input
          type="number"
          min="0"
          value={budget.objectifEpargne}
          onChange={(e) => setBudget((b) => ({ ...b, objectifEpargne: e.target.value === "" ? "" : Number(e.target.value) }))}
          placeholder="Ex : 300"
        />
      </Field>
      {cible > 0 && (
        <div className="mt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-brand-600" style={{ width: `${pourcentage}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>
              Atteint : {formatCHF(atteint)} ({formatPourcentage(pourcentage)})
            </span>
            <span>Reste : {formatCHF(resteNecessaire)}</span>
          </div>
        </div>
      )}
    </Card>
  );
}
