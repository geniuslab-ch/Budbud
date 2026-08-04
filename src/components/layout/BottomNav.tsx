"use client";

import { Home, Wallet, ShoppingBag, PieChart, Download } from "lucide-react";
import { useBudgetContext } from "@/context/BudgetContext";
import type { EtapeParcours } from "@/types/budget.types";

const ETAPES: { key: EtapeParcours; label: string; icon: typeof Home }[] = [
  { key: "accueil", label: "Accueil", icon: Home },
  { key: "revenus", label: "Revenus", icon: Wallet },
  { key: "depenses", label: "Dépenses", icon: ShoppingBag },
  { key: "resume", label: "Résumé", icon: PieChart },
  { key: "export", label: "Export", icon: Download },
];

export function BottomNav() {
  const { etape, aller } = useBudgetContext();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl">
        {ETAPES.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => aller(key)}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs ${
              etape === key ? "text-brand-700" : "text-slate-400"
            }`}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
