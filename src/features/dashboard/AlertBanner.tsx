import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Alerte } from "@/types/budget.types";

export function AlertBanner({ alertes }: { alertes: Alerte[] }) {
  if (alertes.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <CheckCircle2 size={18} className="shrink-0" />
        Aucune alerte : le budget est équilibré.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {alertes.map((a, i) => (
        <div
          key={i}
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
            a.niveau === "rouge" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          <AlertTriangle size={18} className="shrink-0" />
          {a.texte}
        </div>
      ))}
    </div>
  );
}
