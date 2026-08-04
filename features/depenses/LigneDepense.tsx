"use client";

import { Copy, Trash2 } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FREQUENCES } from "@/utils/constants";
import type { LigneDepense as TLigneDepense } from "@/types/budget.types";

interface Props {
  ligne: TLigneDepense;
  onChange: (ligne: TLigneDepense) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function LigneDepense({ ligne, onChange, onDuplicate, onDelete }: Props) {
  return (
    <div className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-12 sm:items-end sm:gap-3">
      <Field label="Nom" className="sm:col-span-3">
        <Input
          value={ligne.nom}
          onChange={(e) => onChange({ ...ligne, nom: e.target.value })}
          placeholder="Ex : Loyer"
        />
      </Field>
      <Field label="Prévu (CHF)" className="sm:col-span-2">
        <Input
          type="number"
          min="0"
          inputMode="decimal"
          value={ligne.montant}
          onChange={(e) => onChange({ ...ligne, montant: e.target.value === "" ? "" : Number(e.target.value) })}
          placeholder="0"
        />
      </Field>
      <Field label="Réel (CHF)" className="sm:col-span-2">
        <Input
          type="number"
          min="0"
          inputMode="decimal"
          value={ligne.budgetReel ?? ""}
          onChange={(e) => onChange({ ...ligne, budgetReel: e.target.value === "" ? "" : Number(e.target.value) })}
          placeholder="="
        />
      </Field>
      <Field label="Fréquence" className="sm:col-span-3">
        <Select
          value={ligne.frequence}
          onChange={(e) => onChange({ ...ligne, frequence: e.target.value as TLigneDepense["frequence"] })}
        >
          {FREQUENCES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </Select>
      </Field>
      <div className="flex gap-2 sm:col-span-2 sm:justify-end">
        <button
          aria-label="Dupliquer"
          onClick={onDuplicate}
          className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
        >
          <Copy size={16} />
        </button>
        <button
          aria-label="Supprimer"
          onClick={onDelete}
          className="rounded-lg border border-slate-200 p-2 text-rose-500 hover:bg-rose-50"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <Field label="Commentaire (optionnel)" className="sm:col-span-12">
        <Input
          value={ligne.commentaire ?? ""}
          onChange={(e) => onChange({ ...ligne, commentaire: e.target.value })}
          placeholder="Précision…"
        />
      </Field>
    </div>
  );
}
