/** Formate un montant en francs suisses, arrondi à l'unité. */
export function formatCHF(valeur: number | undefined | null): string {
  return new Intl.NumberFormat("fr-CH", {
    style: "currency",
    currency: "CHF",
    maximumFractionDigits: 0,
  }).format(Math.round(valeur ?? 0));
}

/** Formate un pourcentage arrondi. */
export function formatPourcentage(valeur: number | undefined | null): string {
  return `${Math.round(valeur ?? 0)}%`;
}

/** Formate une date au format suisse (jj.mm.aaaa). */
export function formatDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("fr-CH").format(date);
}

/** Convertit une valeur de champ contrôlé ("" | number) en nombre sûr. */
export function versNombre(valeur: number | "" | undefined | null): number {
  return typeof valeur === "number" && !Number.isNaN(valeur) ? valeur : 0;
}
