"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { CATEGORIES_DEPENSES, COULEURS_CATEGORIES } from "@/utils/constants";
import { formatCHF } from "@/utils/formatters";
import type { CategorieDepense } from "@/types/budget.types";

export function ChartCamembert({ parCategorie }: { parCategorie: Record<CategorieDepense, number> }) {
  const donnees = CATEGORIES_DEPENSES.map((c) => ({
    name: c,
    value: Math.round(parCategorie[c] ?? 0),
    color: COULEURS_CATEGORIES[c],
  })).filter((d) => d.value > 0);

  if (donnees.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">Ajoutez des dépenses pour voir la répartition.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={donnees} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} innerRadius={55}>
          {donnees.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number) => formatCHF(v)} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
