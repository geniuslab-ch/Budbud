import type { CategorieDepense, Frequence, TypeRevenu } from "@/types/budget.types";

export interface OptionFrequence {
  value: Frequence;
  label: string;
  factor: number;
}

/** Facteur de conversion vers l'équivalent mensuel. */
export const FREQUENCES: OptionFrequence[] = [
  { value: "hebdomadaire", label: "Hebdomadaire", factor: 52 / 12 },
  { value: "mensuel", label: "Mensuel", factor: 1 },
  { value: "trimestriel", label: "Trimestriel", factor: 1 / 3 },
  { value: "semestriel", label: "Semestriel", factor: 1 / 6 },
  { value: "annuel", label: "Annuel", factor: 1 / 12 },
  { value: "unique", label: "Unique", factor: 1 },
];

export const FACTOR_FREQUENCE: Record<Frequence, number> = FREQUENCES.reduce(
  (acc, f) => ({ ...acc, [f.value]: f.factor }),
  {} as Record<Frequence, number>
);

export const TYPES_REVENUS: TypeRevenu[] = [
  "Salaire",
  "Salaire conjoint",
  "Chômage",
  "AVS",
  "AI",
  "Prestations complémentaires",
  "Pension",
  "Allocations",
  "Rentes",
  "Revenus indépendants",
  "Revenus locatifs",
  "Autre",
];

export const CATEGORIES_DEPENSES: CategorieDepense[] = [
  "Logement",
  "Assurances",
  "Transport",
  "Nourriture",
  "Santé",
  "Enfants",
  "Télécommunications",
  "Impôts",
  "Crédits",
  "Loisirs",
  "Abonnements",
  "Animaux",
  "Vêtements",
  "Divers",
  "Dépenses exceptionnelles",
];

/** Catégories considérées comme des charges fixes (récurrentes et peu compressibles). */
export const CATEGORIES_FIXES = new Set<CategorieDepense>([
  "Logement",
  "Assurances",
  "Télécommunications",
  "Impôts",
  "Crédits",
  "Abonnements",
]);

export const COULEURS_CATEGORIES: Record<CategorieDepense, string> = {
  Logement: "#0f6e56",
  Assurances: "#993c1d",
  Transport: "#185fa5",
  Nourriture: "#854f0b",
  Santé: "#a32d2d",
  Enfants: "#533dab",
  Télécommunications: "#3b6d11",
  Impôts: "#72243e",
  Crédits: "#444441",
  Loisirs: "#0c447c",
  Abonnements: "#633806",
  Animaux: "#27500a",
  Vêtements: "#4a1b0c",
  Divers: "#5f5e5a",
  "Dépenses exceptionnelles": "#791f1f",
};

/** Seuil (CHF) en dessous duquel le reste à vivre par personne déclenche une alerte. */
export const RAV_MIN_PAR_PERSONNE = 600;

/** Seuils (%) du taux d'endettement. */
export const SEUIL_ENDETTEMENT_ORANGE = 25;
export const SEUIL_ENDETTEMENT_ROUGE = 33;

export const STORAGE_KEY = "budget-plus:budget-actif";
