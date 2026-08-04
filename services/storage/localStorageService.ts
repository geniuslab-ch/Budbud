import type { StorageService } from "./storageService.interface";

/**
 * Implémentation MVP : sauvegarde automatique dans le localStorage du
 * navigateur. Pour migrer vers Supabase/Firebase/PostgreSQL, créer une
 * classe respectant StorageService (ex. SupabaseStorageService) et
 * l'injecter à la place de localStorageService dans BudgetContext —
 * aucun autre fichier n'a besoin de changer.
 */
class LocalStorageService implements StorageService {
  async get<T>(cle: string): Promise<T | null> {
    if (typeof window === "undefined") return null;
    try {
      const brut = window.localStorage.getItem(cle);
      return brut ? (JSON.parse(brut) as T) : null;
    } catch (erreur) {
      console.error("Erreur de lecture du stockage local :", erreur);
      return null;
    }
  }

  async set<T>(cle: string, valeur: T): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(cle, JSON.stringify(valeur));
    } catch (erreur) {
      console.error("Erreur d'écriture du stockage local :", erreur);
    }
  }

  async remove(cle: string): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(cle);
  }
}

export const localStorageService = new LocalStorageService();
