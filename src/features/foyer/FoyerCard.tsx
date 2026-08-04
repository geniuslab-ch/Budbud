"use client";

import { Users } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useBudgetContext } from "@/context/BudgetContext";
import { formatCHF } from "@/utils/formatters";

export function FoyerCard() {
  const { budget, setBudget, totaux } = useBudgetContext();

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <Users size={18} className="text-slate-500" />
        <CardTitle>Foyer</CardTitle>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Adultes">
          <Input
            type="number"
            min="0"
            value={budget.foyer.adultes}
            onChange={(e) =>
              setBudget((b) => ({
                ...b,
                foyer: { ...b.foyer, adultes: e.target.value === "" ? "" : Number(e.target.value) },
              }))
            }
          />
        </Field>
        <Field label="Enfants">
          <Input
            type="number"
            min="0"
            value={budget.foyer.enfants}
            onChange={(e) =>
              setBudget((b) => ({
                ...b,
                foyer: { ...b.foyer, enfants: e.target.value === "" ? "" : Number(e.target.value) },
              }))
            }
          />
        </Field>
      </div>
      <p className="mt-3 text-sm text-slate-600">
        Reste à vivre par personne :{" "}
        <span className="font-semibold text-slate-900">{formatCHF(totaux.resteAVivreParPersonne)}</span>
      </p>
    </Card>
  );
}
