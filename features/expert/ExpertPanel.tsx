"use client";

import { MessageSquare, X } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useBudgetContext } from "@/context/BudgetContext";
import type { NoteExpert } from "@/types/budget.types";

export function ExpertPanel() {
  const { budget, setBudget, panneauExpertOuvert, setPanneauExpertOuvert } = useBudgetContext();

  if (!panneauExpertOuvert) return null;

  const update = (champ: keyof NoteExpert, valeur: string) =>
    setBudget((b) => ({ ...b, expertNotes: { ...b.expertNotes, [champ]: valeur } }));

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-black/30"
      onClick={() => setPanneauExpertOuvert(false)}
    >
      <div
        className="flex h-full w-full max-w-sm flex-col gap-4 overflow-y-auto bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-brand-700" />
            <h3 className="font-semibold text-slate-900">Mode expert</h3>
          </div>
          <button
            onClick={() => setPanneauExpertOuvert(false)}
            aria-label="Fermer"
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Ces notes sont réservées au professionnel et ne sont jamais visibles dans le mode particulier.
        </p>

        <Field label="Commentaires">
          <Textarea rows={3} value={budget.expertNotes.commentaires} onChange={(e) => update("commentaires", e.target.value)} />
        </Field>
        <Field label="Objectifs">
          <Textarea rows={3} value={budget.expertNotes.objectifs} onChange={(e) => update("objectifs", e.target.value)} />
        </Field>
        <Field label="Recommandations">
          <Textarea rows={3} value={budget.expertNotes.recommandations} onChange={(e) => update("recommandations", e.target.value)} />
        </Field>
        <Field label="Plan d'action">
          <Textarea rows={3} value={budget.expertNotes.planAction} onChange={(e) => update("planAction", e.target.value)} />
        </Field>
      </div>
    </div>
  );
}
