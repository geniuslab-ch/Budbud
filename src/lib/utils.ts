import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Fusionne intelligemment des classes Tailwind conditionnelles. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Génère un identifiant court, suffisant pour des clés React locales. */
export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
