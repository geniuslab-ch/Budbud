"use client";

import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { formatCHF } from "@/utils/formatters";
import { versMensuel } from "@/services/calculations/budgetCalculator";
import { LigneDepense } from "./LigneDepense";
import type { CategorieDepense, LigneDepense as TLigneDepense } from "@/types/budget.types";

interface Props {
  categorie: CategorieDepense;
  lignes: TLigneDepense[];
  ouverte: boolean;
  onToggle: () => void;
  onUpdate: (id: string, patch: TLigneDepense) => void;
  onAdd: () => void;
  onDuplicate: (ligne: TLigneDepense) => void;
  onDelete: (id: string) => void;
}

export function CategorieCard({
  categorie,
  lignes,
  ouverte,
  onToggle,
  onUpdate,
  onAdd,
  onDuplicate,
  onDelete,
}: Props) {
  const total = lignes.reduce((s, l) => {
    const reel = l.budgetReel !== "" && l.budgetReel != null ? l.budgetReel : l.montant;
    return s + versMensuel(reel, l.frequence);
  }, 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <button onClick={onToggle} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-800">{categorie}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{lignes.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tabular-nums text-slate-700">{formatCHF(total)}</span>
          {ouverte ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {ouverte && (
        <div className="flex flex-col gap-3 border-t border-slate-100 p-3">
          {lignes.map((l) => (
            <LigneDepense
              key={l.id}
              ligne={l}
              onChange={(patch) => onUpdate(l.id, patch)}
              onDuplicate={() => onDuplicate(l)}
              onDelete={() => onDelete(l.id)}
            />
          ))}
          <button
            onClick={onAdd}
            className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <Plus size={14} /> Ajouter une ligne
          </button>
        </div>
      )}
    </div>
  );
}
