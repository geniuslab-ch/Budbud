export type Frequence =
  | "hebdomadaire"
  | "mensuel"
  | "trimestriel"
  | "semestriel"
  | "annuel"
  | "unique";

export type TypeRevenu =
  | "Salaire"
  | "Salaire conjoint"
  | "Chômage"
  | "AVS"
  | "AI"
  | "Prestations complémentaires"
  | "Pension"
  | "Allocations"
  | "Rentes"
  | "Revenus indépendants"
  | "Revenus locatifs"
  | "Autre";

export type CategorieDepense =
  | "Logement"
  | "Assurances"
  | "Transport"
  | "Nourriture"
  | "Santé"
  | "Enfants"
  | "Télécommunications"
  | "Impôts"
  | "Crédits"
  | "Loisirs"
  | "Abonnements"
  | "Animaux"
  | "Vêtements"
  | "Divers"
  | "Dépenses exceptionnelles";

export interface LigneBudget {
  id: string;
  nom: string;
  montant: number | "";
  frequence: Frequence;
  commentaire?: string;
}

export type LigneRevenu = LigneBudget;

export interface LigneDepense extends LigneBudget {
  budgetReel?: number | "";
}

export type DepensesParCategorie = Record<CategorieDepense, LigneDepense[]>;

export interface Foyer {
  adultes: number | "";
  enfants: number | "";
}

export interface NoteExpert {
  commentaires: string;
  objectifs: string;
  recommandations: string;
  planAction: string;
}

export interface Budget {
  nom: string;
  revenus: LigneRevenu[];
  depenses: DepensesParCategorie;
  foyer: Foyer;
  objectifEpargne: number | "";
  expertNotes: NoteExpert;
}

export interface BudgetTotaux {
  totalRevenus: number;
  totalDepensesPrevu: number;
  totalDepensesReel: number;
  ecartTotal: number;
  solde: number;
  resteAVivre: number;
  resteAVivreParPersonne: number;
  tauxEndettement: number;
  tauxEpargne: number;
  depensesFixes: number;
  depensesVariables: number;
  totalCredits: number;
  parCategorie: Record<CategorieDepense, number>;
}

export type NiveauAlerte = "rouge" | "orange";

export interface Alerte {
  niveau: NiveauAlerte;
  texte: string;
}

export type EtapeParcours =
  | "accueil"
  | "revenus"
  | "depenses"
  | "resume"
  | "export";
