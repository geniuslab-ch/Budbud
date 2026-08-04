import { cn } from "@/lib/utils";

type Tonalite = "neutral" | "good" | "bad";

interface Props {
  label: string;
  valeur: string;
  sousLibelle?: string;
  tonalite?: Tonalite;
}

const styleTonalite: Record<Tonalite, string> = {
  neutral: "bg-white border-slate-200 text-slate-900",
  good: "bg-emerald-50 border-emerald-200 text-emerald-900",
  bad: "bg-rose-50 border-rose-200 text-rose-900",
};

export function StatCard({ label, valeur, sousLibelle, tonalite = "neutral" }: Props) {
  return (
    <div className={cn("rounded-2xl border p-4 shadow-sm", styleTonalite[tonalite])}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{valeur}</p>
      {sousLibelle && <p className="mt-0.5 text-xs text-slate-500">{sousLibelle}</p>}
    </div>
  );
}
