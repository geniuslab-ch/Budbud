/**
 * Interface de la couche de persistance. Le MVP l'implémente avec
 * localStorage (voir localStorageService.ts), mais toute implémentation
 * respectant ce contrat (Supabase, Firebase, PostgreSQL via une API REST…)
 * peut la remplacer sans modifier les composants ou les hooks qui l'utilisent.
 */
export interface StorageService {
  get<T>(cle: string): Promise<T | null>;
  set<T>(cle: string, valeur: T): Promise<void>;
  remove(cle: string): Promise<void>;
}
