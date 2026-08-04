import { useEffect, useRef, useState } from "react";
import type { StorageService } from "@/services/storage/storageService.interface";

export type StatutSauvegarde = "idle" | "saving" | "saved" | "error";

/**
 * Sauvegarde automatiquement `valeur` sous `cle` via le StorageService fourni,
 * avec un léger anti-rebond pour éviter d'écrire à chaque frappe.
 */
export function useAutoSave<T>(
  storage: StorageService,
  cle: string,
  valeur: T,
  pret: boolean,
  delaiMs = 500
): StatutSauvegarde {
  const [statut, setStatut] = useState<StatutSauvegarde>("idle");
  const minuteur = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!pret) return;
    setStatut("saving");
    clearTimeout(minuteur.current);
    minuteur.current = setTimeout(async () => {
      try {
        await storage.set(cle, valeur);
        setStatut("saved");
      } catch {
        setStatut("error");
      }
    }, delaiMs);
    return () => clearTimeout(minuteur.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valeur, pret]);

  return statut;
}
