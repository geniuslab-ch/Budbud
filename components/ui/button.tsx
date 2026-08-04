import * as React from "react";
import { cn } from "@/lib/utils";

type Variante = "primary" | "secondary" | "ghost" | "danger";
type Taille = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  taille?: Taille;
}

const styleVariante: Record<Variante, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100",
  danger: "border border-rose-200 bg-white text-rose-600 hover:bg-rose-50",
};

const styleTaille: Record<Taille, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variante = "secondary", taille = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        styleVariante[variante],
        styleTaille[taille],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
