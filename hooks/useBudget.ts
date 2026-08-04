import { uid } from "@/lib/utils";
import { CATEGORIES_DEPENSES } from "@/utils/constants";
import type { Budget, DepensesParCategorie, LigneDepense, LigneRevenu } from "@/types/budget.types";

/** Construit un budget vide, avec toutes les catégories de dépenses initialisées. */
export function budgetVide(): Budget {
  return {
    nom: "Mon budget",
    revenus: [],
    depenses: Object.fromEntries(
      CATEGORIES_DEPENSES.map((c) => [c, []])
    ) as unknown as DepensesParCategorie,
    foyer: { adultes: 1, enfants: 0 },
    objectifEpargne: "",
    expertNotes: {
      commentaires: "",
      objectifs: "",
      recommandations: "",
      planAction: "",
    },
  };
}

export function nouvelleLigneRevenu(nom = ""): LigneRevenu {
  return { id: uid(), nom, montant: "", frequence: "mensuel", commentaire: "" };
}

export function nouvelleLigneDepense(nom = ""): LigneDepense {
  return { id: uid(), nom, montant: "", budgetReel: "", frequence: "mensuel", commentaire: "" };
}
