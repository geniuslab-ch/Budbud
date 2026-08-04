import * as XLSX from "xlsx";
import type { Budget, BudgetTotaux } from "@/types/budget.types";
import { CATEGORIES_DEPENSES } from "@/utils/constants";
import { versMensuel } from "@/services/calculations/budgetCalculator";
import { versNombre } from "@/utils/formatters";
import { telechargerBlob } from "./telecharger";

/** Exporte le budget en fichier Excel (.xlsx) entièrement modifiable, à 3 feuilles. */
export function exporterExcel(budget: Budget, totaux: BudgetTotaux): void {
  const classeur = XLSX.utils.book_new();

  const lignesRevenus = budget.revenus.map((ligne) => ({
    Nom: ligne.nom,
    Montant: versNombre(ligne.montant),
    Fréquence: ligne.frequence,
    "Équivalent mensuel": Math.round(versMensuel(ligne.montant, ligne.frequence)),
    Commentaire: ligne.commentaire ?? "",
  }));
  XLSX.utils.book_append_sheet(classeur, XLSX.utils.json_to_sheet(lignesRevenus), "Revenus");

  const lignesDepenses: Record<string, string | number>[] = [];
  for (const categorie of CATEGORIES_DEPENSES) {
    for (const ligne of budget.depenses[categorie] ?? []) {
      const montantReel = ligne.budgetReel !== undefined && ligne.budgetReel !== "" ? ligne.budgetReel : ligne.montant;
      lignesDepenses.push({
        Catégorie: categorie,
        Nom: ligne.nom,
        Prévu: versNombre(ligne.montant),
        Réel: versNombre(montantReel),
        Fréquence: ligne.frequence,
        "Équivalent mensuel (réel)": Math.round(versMensuel(montantReel, ligne.frequence)),
        Commentaire: ligne.commentaire ?? "",
      });
    }
  }
  XLSX.utils.book_append_sheet(classeur, XLSX.utils.json_to_sheet(lignesDepenses), "Dépenses");

  const lignesResume = [
    { Indicateur: "Total revenus", "Valeur (CHF/%)": Math.round(totaux.totalRevenus) },
    { Indicateur: "Total dépenses (réel)", "Valeur (CHF/%)": Math.round(totaux.totalDepensesReel) },
    { Indicateur: "Écart prévu / réel", "Valeur (CHF/%)": Math.round(totaux.ecartTotal) },
    { Indicateur: "Solde", "Valeur (CHF/%)": Math.round(totaux.solde) },
    { Indicateur: "Reste à vivre / personne", "Valeur (CHF/%)": Math.round(totaux.resteAVivreParPersonne) },
    { Indicateur: "Taux d'endettement (%)", "Valeur (CHF/%)": Math.round(totaux.tauxEndettement) },
    { Indicateur: "Taux d'épargne (%)", "Valeur (CHF/%)": Math.round(totaux.tauxEpargne) },
    { Indicateur: "Dépenses fixes", "Valeur (CHF/%)": Math.round(totaux.depensesFixes) },
    { Indicateur: "Dépenses variables", "Valeur (CHF/%)": Math.round(totaux.depensesVariables) },
  ];
  XLSX.utils.book_append_sheet(classeur, XLSX.utils.json_to_sheet(lignesResume), "Résumé");

  const donnees = XLSX.write(classeur, { bookType: "xlsx", type: "array" });
  telechargerBlob(donnees, `${budget.nom || "budget"}.xlsx`, "application/octet-stream");
}
