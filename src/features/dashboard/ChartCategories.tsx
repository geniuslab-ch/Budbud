"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { CATEGORIES_DEPENSES } from "@/utils/constants";
import { formatCHF } from "@/utils/formatters";
import type { CategorieDepense } from "@/types/budget.types";

export function ChartCategories({ parCategorie }: { parCategorie: Record<CategorieDepense, number> }) {
  const donnees = CATEGORIES_DEPENSES.map((c) => ({ name: c, montant: Math.round(parCategorie[c] ?? 0) }))
    .filter((d) => d.montant > 0)
    .sort((a, b) => b.montant - a.montant);

  if (donnees.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">Aucune dépense enregistrée.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, donnees.length * 34)}>
      <BarChart data={donnees} layout="vertical" margin={{ left: 10, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
        <XAxis type="number" tickFormatter={(v) => formatCHF(v)} fontSize={11} />
        <YAxis type="category" dataKey="name" width={120} fontSize={11} />
        <Tooltip formatter={(v: number) => formatCHF(v)} />
        <Bar dataKey="montant" fill="#0f6e56" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
