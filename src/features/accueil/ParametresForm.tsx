"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useBudgetContext } from "@/context/BudgetContext";
import { parametresSchema, type ParametresFormValues } from "@/utils/validation";
import { versNombre } from "@/utils/formatters";

/**
 * Petit formulaire de paramètres (nom du budget, foyer, objectif d'épargne)
 * démontrant l'usage de React Hook Form + Zod pour la validation. Les
 * listes de lignes (revenus/dépenses), elles, restent en état contrôlé
 * simple : leur structure dynamique se prête mieux à cette approche.
 */
export function ParametresForm() {
  const { budget, setBudget } = useBudgetContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParametresFormValues>({
    resolver: zodResolver(parametresSchema),
    defaultValues: {
      nom: budget.nom,
      adultes: versNombre(budget.foyer.adultes) || 1,
      enfants: versNombre(budget.foyer.enfants),
      objectifEpargne: versNombre(budget.objectifEpargne),
    },
  });

  const onSubmit = (valeurs: ParametresFormValues) => {
    setBudget((b) => ({
      ...b,
      nom: valeurs.nom,
      foyer: { adultes: valeurs.adultes, enfants: valeurs.enfants },
      objectifEpargne: valeurs.objectifEpargne ?? "",
    }));
  };

  // Pas de bouton "Enregistrer" : la validation Zod s'exécute et le budget
  // se met à jour dès qu'un champ perd le focus (onBlur ci-dessous).
  return (
    <form onBlur={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Field label="Nom du budget" erreur={errors.nom?.message} className="sm:col-span-3">
        <Input {...register("nom")} placeholder="Ex : Budget de Marie" />
      </Field>
      <Field label="Adultes dans le foyer" erreur={errors.adultes?.message}>
        <Input type="number" min="0" {...register("adultes")} />
      </Field>
      <Field label="Enfants dans le foyer" erreur={errors.enfants?.message}>
        <Input type="number" min="0" {...register("enfants")} />
      </Field>
      <Field label="Objectif d'épargne (CHF)" erreur={errors.objectifEpargne?.message}>
        <Input type="number" min="0" {...register("objectifEpargne")} placeholder="Ex : 300" />
      </Field>
    </form>
  );
}
