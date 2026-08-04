import { z } from "zod";
import { CATEGORIES_DEPENSES } from "@/utils/constants";

const frequenceSchema = z.enum([
  "hebdomadaire",
  "mensuel",
  "trimestriel",
  "semestriel",
  "annuel",
  "unique",
]);

const montantSchema = z.union([z.number().nonnegative(), z.literal("")]);

export const ligneRevenuSchema = z.object({
  id: z.string(),
  nom: z.string(),
  montant: montantSchema,
  frequence: frequenceSchema,
  commentaire: z.string().optional(),
});

export const ligneDepenseSchema = ligneRevenuSchema.extend({
  budgetReel: montantSchema.optional(),
});

export const foyerSchema = z.object({
  adultes: z.union([z.number().min(0), z.literal("")]),
  enfants: z.union([z.number().min(0), z.literal("")]),
});

export const noteExpertSchema = z.object({
  commentaires: z.string(),
  objectifs: z.string(),
  recommandations: z.string(),
  planAction: z.string(),
});

const depensesSchema = z.object(
  Object.fromEntries(CATEGORIES_DEPENSES.map((c) => [c, z.array(ligneDepenseSchema)])) as Record<
    (typeof CATEGORIES_DEPENSES)[number],
    z.ZodArray<typeof ligneDepenseSchema>
  >
);

/** Schéma complet d'un budget — utilisé pour valider un fichier JSON importé. */
export const budgetSchema = z.object({
  nom: z.string(),
  revenus: z.array(ligneRevenuSchema),
  depenses: depensesSchema,
  foyer: foyerSchema,
  objectifEpargne: montantSchema,
  expertNotes: noteExpertSchema,
});

/** Schéma du petit formulaire "Paramètres" (RHF + Zod) : nom, foyer, objectif d'épargne. */
export const parametresSchema = z.object({
  nom: z.string().min(1, "Le nom du budget est requis."),
  adultes: z.coerce.number().min(0, "Doit être positif ou nul.").default(1),
  enfants: z.coerce.number().min(0, "Doit être positif ou nul.").default(0),
  objectifEpargne: z.coerce.number().min(0, "Doit être positif ou nul.").optional(),
});

export type ParametresFormValues = z.infer<typeof parametresSchema>;
