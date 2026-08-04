import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Budget, BudgetTotaux } from "@/types/budget.types";
import { CATEGORIES_DEPENSES } from "@/utils/constants";
import { formatCHF, formatDate, formatPourcentage, versNombre } from "@/utils/formatters";

/** Génère et télécharge un PDF imprimable résumant le budget. */
export function exporterPdf(budget: Budget, totaux: BudgetTotaux): void {
  const doc = new jsPDF();
  const margeGauche = 14;
  let y = 18;

  doc.setFontSize(18);
  doc.setTextColor(15, 110, 86);
  doc.text(budget.nom || "Budget", margeGauche, y);

  doc.setFontSize(10);
  doc.setTextColor(100);
  y += 6;
  doc.text(`Généré le ${formatDate()}`, margeGauche, y);

  y += 8;
  doc.setFontSize(13);
  doc.setTextColor(20);
  doc.text("Résumé", margeGauche, y);

  autoTable(doc, {
    startY: y + 3,
    head: [["Indicateur", "Valeur"]],
    body: [
      ["Total revenus", formatCHF(totaux.totalRevenus)],
      ["Total dépenses (réel)", formatCHF(totaux.totalDepensesReel)],
      ["Solde", formatCHF(totaux.solde)],
      ["Reste à vivre / personne", formatCHF(totaux.resteAVivreParPersonne)],
      ["Taux d'endettement", formatPourcentage(totaux.tauxEndettement)],
      ["Taux d'épargne", formatPourcentage(totaux.tauxEpargne)],
    ],
    theme: "grid",
    headStyles: { fillColor: [15, 110, 86] },
    styles: { fontSize: 9 },
    margin: { left: margeGauche },
  });

  // @ts-expect-error - lastAutoTable est ajouté dynamiquement par jspdf-autotable
  y = doc.lastAutoTable.finalY + 10;

  if (budget.revenus.length > 0) {
    doc.setFontSize(13);
    doc.text("Revenus", margeGauche, y);
    autoTable(doc, {
      startY: y + 3,
      head: [["Nom", "Montant", "Fréquence"]],
      body: budget.revenus.map((l) => [l.nom || "—", formatCHF(versNombre(l.montant)), l.frequence]),
      theme: "striped",
      headStyles: { fillColor: [15, 110, 86] },
      styles: { fontSize: 9 },
      margin: { left: margeGauche },
    });
    // @ts-expect-error - lastAutoTable est ajouté dynamiquement par jspdf-autotable
    y = doc.lastAutoTable.finalY + 10;
  }

  for (const categorie of CATEGORIES_DEPENSES) {
    const lignes = budget.depenses[categorie] ?? [];
    if (lignes.length === 0) continue;

    if (y > 260) {
      doc.addPage();
      y = 18;
    }

    doc.setFontSize(12);
    doc.setTextColor(15, 110, 86);
    doc.text(categorie, margeGauche, y);

    autoTable(doc, {
      startY: y + 3,
      head: [["Nom", "Prévu", "Réel", "Fréquence"]],
      body: lignes.map((l) => [
        l.nom || "—",
        formatCHF(versNombre(l.montant)),
        formatCHF(versNombre(l.budgetReel !== "" && l.budgetReel !== undefined ? l.budgetReel : l.montant)),
        l.frequence,
      ]),
      theme: "striped",
      headStyles: { fillColor: [90, 90, 90] },
      styles: { fontSize: 9 },
      margin: { left: margeGauche },
    });
    // @ts-expect-error - lastAutoTable est ajouté dynamiquement par jspdf-autotable
    y = doc.lastAutoTable.finalY + 10;
  }

  doc.save(`${budget.nom || "budget"}.pdf`);
}
