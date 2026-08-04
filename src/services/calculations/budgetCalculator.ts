import type { Budget, BudgetTotaux, Alerte, CategorieDepense, Frequence } from "@/types/budget.types";
import {
  CATEGORIES_DEPENSES,
  CATEGORIES_FIXES,
  FACTOR_FREQUENCE,
  RAV_MIN_PAR_PERSONNE,
  SEUIL_ENDETTEMENT_ORANGE,
  SEUIL_ENDETTEMENT_ROUGE,
} from "@/utils/constants";
import { versNombre } from "@/utils/formatters";

/** Convertit un montant, quelle que soit sa fréquence, en équivalent mensuel. */
export function versMensuel(montant: number | "", frequence: Frequence): number {
  return versNombre(montant) * (FACTOR_FREQUENCE[frequence] ?? 1);
}

/**
 * Calcule l'ensemble des totaux et ratios d'un budget : revenus, dépenses
 * (prévu/réel), solde, reste à vivre, taux d'endettement, taux d'épargne,
 * répartition fixes/variables et répartition par catégorie.
 */
export function calculerTotaux(budget: Budget): BudgetTotaux {
  const totalRevenus = budget.revenus.reduce(
    (somme, ligne) => somme + versMensuel(ligne.montant, ligne.frequence),
    0
  );

  let totalDepensesPrevu = 0;
  let totalDepensesReel = 0;
  let depensesFixes = 0;
  let depensesVariables = 0;
  let totalCredits = 0;

  const parCategorie = {} as Record<CategorieDepense, number>;

  for (const categorie of CATEGORIES_DEPENSES) {
    const lignes = budget.depenses[categorie] ?? [];
    let sousTotalReel = 0;

    for (const ligne of lignes) {
      const prevu = versMensuel(ligne.montant, ligne.frequence);
      const montantReel =
        ligne.budgetReel !== undefined && ligne.budgetReel !== ""
          ? ligne.budgetReel
          : ligne.montant;
      const reel = versMensuel(montantReel, ligne.frequence);

      totalDepensesPrevu += prevu;
      totalDepensesReel += reel;
      sousTotalReel += reel;

      if (CATEGORIES_FIXES.has(categorie)) {
        depensesFixes += reel;
      } else {
        depensesVariables += reel;
      }
      if (categorie === "Crédits") totalCredits += reel;
    }

    parCategorie[categorie] = sousTotalReel;
  }

  const ecartTotal = totalDepensesReel - totalDepensesPrevu;
  const solde = totalRevenus - totalDepensesReel;
  const resteAVivre = solde;

  const personnes = Math.max(
    1,
    versNombre(budget.foyer.adultes) + versNombre(budget.foyer.enfants)
  );
  const resteAVivreParPersonne = resteAVivre / personnes;

  const tauxEndettement = totalRevenus > 0 ? (totalCredits / totalRevenus) * 100 : 0;
  const tauxEpargne =
    totalRevenus > 0 && solde > 0 ? (solde / totalRevenus) * 100 : 0;

  return {
    totalRevenus,
    totalDepensesPrevu,
    totalDepensesReel,
    ecartTotal,
    solde,
    resteAVivre,
    resteAVivreParPersonne,
    tauxEndettement,
    tauxEpargne,
    depensesFixes,
    depensesVariables,
    totalCredits,
    parCategorie,
  };
}

/** Dérive la liste des alertes actives à partir des totaux calculés. */
export function calculerAlertes(totaux: BudgetTotaux): Alerte[] {
  const alertes: Alerte[] = [];

  if (totaux.solde < 0) {
    alertes.push({
      niveau: "rouge",
      texte: "Le budget est négatif : les dépenses dépassent les revenus.",
    });
  }

  if (totaux.tauxEndettement > SEUIL_ENDETTEMENT_ROUGE) {
    alertes.push({
      niveau: "rouge",
      texte: `Taux d'endettement élevé (${Math.round(totaux.tauxEndettement)}%), au-delà du seuil de ${SEUIL_ENDETTEMENT_ROUGE}%.`,
    });
  } else if (totaux.tauxEndettement > SEUIL_ENDETTEMENT_ORANGE) {
    alertes.push({
      niveau: "orange",
      texte: `Taux d'endettement à surveiller (${Math.round(totaux.tauxEndettement)}%).`,
    });
  }

  if (totaux.ecartTotal > 0) {
    alertes.push({
      niveau: "orange",
      texte: `Les dépenses réelles dépassent le budget prévu de ${Math.round(totaux.ecartTotal)} CHF.`,
    });
  }

  if (totaux.solde >= 0 && totaux.resteAVivreParPersonne < RAV_MIN_PAR_PERSONNE) {
    alertes.push({
      niveau: "orange",
      texte: `Reste à vivre faible : ${Math.round(totaux.resteAVivreParPersonne)} CHF par personne.`,
    });
  }

  return alertes;
}
