import type { Budget } from "@/types/budget.types";
import { telechargerBlob } from "./telecharger";

/** Exporte le budget complet en JSON, pour le sauvegarder ou le restaurer plus tard. */
export function exporterJson(budget: Budget): void {
  const nomFichier = `${budget.nom || "budget"}.json`;
  telechargerBlob(JSON.stringify(budget, null, 2), nomFichier, "application/json");
}
