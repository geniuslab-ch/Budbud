"use client";

import { User } from "lucide-react";
import { useBudgetContext } from "@/context/BudgetContext";

export function Header() {
  const { modeExpert, setModeExpert, setPanneauExpertOuvert, statutSauvegarde } = useBudgetContext();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            B+
          </div>
          <span className="font-semibold text-slate-800">Budget+</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-slate-400 sm:inline">
            {statutSauvegarde === "saving" ? "Sauvegarde…" : statutSauvegarde === "saved" ? "Sauvegardé" : ""}
          </span>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={modeExpert}
              onChange={(e) => {
                setModeExpert(e.target.checked);
                if (e.target.checked) setPanneauExpertOuvert(true);
              }}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            Mode expert
          </label>
          {modeExpert && (
            <button
              onClick={() => setPanneauExpertOuvert(true)}
              aria-label="Ouvrir le panneau expert"
              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
            >
              <User size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
