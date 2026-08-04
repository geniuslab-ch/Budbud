"use client";

import { useRef } from "react";
import { FileJson, FileSpreadsheet, FileDown, Upload } from "lucide-react";
import { useBudgetContext } from "@/context/BudgetContext";
import { exporterJson } from "@/services/export/exportJson";
import { exporterExcel } from "@/services/export/exportExcel";
import { exporterPdf } from "@/services/export/exportPdf";
import { budgetSchema } from "@/utils/validation";

export function ExportPanel() {
  const { budget, totaux, remplacerBudget } = useBudgetContext();
  const fichierRef = useRef<HTMLInputElement>(null);

  const importerJson = async (fichier: File) => {
    try {
      const texte = await fichier.text();
      const donnees = budgetSchema.parse(JSON.parse(texte));
      remplacerBudget(donnees);
    } catch (erreur) {
      console.error(erreur);
      alert("Le fichier JSON n'est pas un budget valide.");
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Export</h2>
        <p className="text-sm text-slate-500">
          Exportez votre budget pour l&apos;imprimer, le modifier ou le restaurer plus tard.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          onClick={() => exporterPdf(budget, totaux)}
          className="flex flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-brand-300 hover:bg-brand-50/50"
        >
          <FileDown size={20} className="text-brand-700" />
          <span className="text-sm font-medium text-slate-800">PDF imprimable</span>
          <span className="text-xs text-slate-500">Télécharge un PDF prêt à imprimer ou à partager.</span>
        </button>

        <button
          onClick={() => exporterExcel(budget, totaux)}
          className="flex flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-brand-300 hover:bg-brand-50/50"
        >
          <FileSpreadsheet size={20} className="text-brand-700" />
          <span className="text-sm font-medium text-slate-800">Excel (.xlsx)</span>
          <span className="text-xs text-slate-500">Fichier entièrement modifiable, avec revenus, dépenses et résumé.</span>
        </button>

        <button
          onClick={() => exporterJson(budget)}
          className="flex flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-brand-300 hover:bg-brand-50/50"
        >
          <FileJson size={20} className="text-brand-700" />
          <span className="text-sm font-medium text-slate-800">JSON</span>
          <span className="text-xs text-slate-500">Permet de restaurer ce budget plus tard, ou de le transmettre à un expert.</span>
        </button>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Upload size={16} /> Restaurer un budget depuis un fichier JSON
        </div>
        <input
          ref={fichierRef}
          type="file"
          accept="application/json"
          className="mt-2 text-sm"
          onChange={(e) => {
            const fichier = e.target.files?.[0];
            if (fichier) importerJson(fichier);
          }}
        />
      </div>
    </div>
  );
}
