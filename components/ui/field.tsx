import * as React from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  className?: string;
  erreur?: string;
  children: React.ReactNode;
}

/** Enveloppe un champ de formulaire avec son libellé et son erreur de validation. */
export function Field({ label, className, erreur, children }: FieldProps) {
  return (
    <label className={cn("flex flex-col gap-1", className)}>
      <span className="text-xs font-medium text-slate-500">{label}</span>
      {children}
      {erreur && <span className="text-xs text-rose-600">{erreur}</span>}
    </label>
  );
}
