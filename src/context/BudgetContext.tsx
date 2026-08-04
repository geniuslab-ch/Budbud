"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Budget, BudgetTotaux, Alerte, EtapeParcours } from "@/types/budget.types";
import { budgetVide } from "@/hooks/useBudget";
import { calculerAlertes, calculerTotaux } from "@/services/calculations/budgetCalculator";
import { localStorageService } from "@/services/storage/localStorageService";
import { useAutoSave, type StatutSauvegarde } from "@/hooks/useAutoSave";
import { STORAGE_KEY } from "@/utils/constants";

interface BudgetContextValue {
  budget: Budget;
  setBudget: React.Dispatch<React.SetStateAction<Budget>>;
  totaux: BudgetTotaux;
  alertes: Alerte[];
  etape: EtapeParcours;
  aller: (etape: EtapeParcours) => void;
  modeExpert: boolean;
  setModeExpert: (actif: boolean) => void;
  panneauExpertOuvert: boolean;
  setPanneauExpertOuvert: (ouvert: boolean) => void;
  statutSauvegarde: StatutSauvegarde;
  remplacerBudget: (nouveau: Budget) => void;
}

const BudgetContext = createContext<BudgetContextValue | null>(null);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [budget, setBudget] = useState<Budget>(budgetVide());
  const [etape, setEtape] = useState<EtapeParcours>("accueil");
  const [modeExpert, setModeExpert] = useState(false);
  const [panneauExpertOuvert, setPanneauExpertOuvert] = useState(false);
  const [pret, setPret] = useState(false);
  const chargeUneFois = useRef(false);

  // Chargement initial depuis le stockage local.
  useEffect(() => {
    if (chargeUneFois.current) return;
    chargeUneFois.current = true;
    (async () => {
      const donnees = await localStorageService.get<Budget>(STORAGE_KEY);
      if (donnees) setBudget((b) => ({ ...budgetVide(), ...donnees }));
      setPret(true);
    })();
  }, []);

  const statutSauvegarde = useAutoSave(localStorageService, STORAGE_KEY, budget, pret);

  const totaux = useMemo(() => calculerTotaux(budget), [budget]);
  const alertes = useMemo(() => calculerAlertes(totaux), [totaux]);

  const aller = (nouvelleEtape: EtapeParcours) => {
    setEtape(nouvelleEtape);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remplacerBudget = (nouveau: Budget) => setBudget(nouveau);

  const valeur: BudgetContextValue = {
    budget,
    setBudget,
    totaux,
    alertes,
    etape,
    aller,
    modeExpert,
    setModeExpert,
    panneauExpertOuvert,
    setPanneauExpertOuvert,
    statutSauvegarde,
    remplacerBudget,
  };

  return <BudgetContext.Provider value={valeur}>{children}</BudgetContext.Provider>;
}

export function useBudgetContext(): BudgetContextValue {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error("useBudgetContext doit être utilisé à l'intérieur de <BudgetProvider>.");
  return ctx;
}
