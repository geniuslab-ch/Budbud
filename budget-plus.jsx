import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Home, Wallet, ShoppingBag, PieChart as PieIcon, Download, User, Plus,
  Trash2, Copy, ChevronDown, ChevronUp, X, AlertTriangle, CheckCircle2,
  FileJson, FileSpreadsheet, Printer, Users, Target, MessageSquare,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend,
} from "recharts";
import * as XLSX from "xlsx";

/* ------------------------------------------------------------------ */
/* Constantes                                                          */
/* ------------------------------------------------------------------ */

const FREQUENCES = [
  { value: "hebdomadaire", label: "Hebdomadaire", factor: 52 / 12 },
  { value: "mensuel", label: "Mensuel", factor: 1 },
  { value: "trimestriel", label: "Trimestriel", factor: 1 / 3 },
  { value: "semestriel", label: "Semestriel", factor: 1 / 6 },
  { value: "annuel", label: "Annuel", factor: 1 / 12 },
  { value: "unique", label: "Unique", factor: 1 },
];

const FACTOR = Object.fromEntries(FREQUENCES.map((f) => [f.value, f.factor]));

const TYPES_REVENUS = [
  "Salaire", "Salaire conjoint", "Chômage", "AVS", "AI",
  "Prestations complémentaires", "Pension", "Allocations", "Rentes",
  "Revenus indépendants", "Revenus locatifs", "Autre",
];

const CATEGORIES_DEPENSES = [
  "Logement", "Assurances", "Transport", "Nourriture", "Santé", "Enfants",
  "Télécommunications", "Impôts", "Crédits", "Loisirs", "Abonnements",
  "Animaux", "Vêtements", "Divers", "Dépenses exceptionnelles",
];

const CATEGORIES_FIXES = new Set([
  "Logement", "Assurances", "Télécommunications", "Impôts", "Crédits", "Abonnements",
]);

const COULEURS_CATEGORIES = [
  "#0f6e56", "#993c1d", "#185fa5", "#854f0b", "#a32d2d", "#533dab",
  "#3b6d11", "#72243e", "#444441", "#0c447c", "#633806", "#27500a",
  "#4a1b0c", "#5f5e5a", "#791f1f",
];

const RAV_MIN_PAR_PERSONNE = 600; // CHF, seuil d'alerte "reste à vivre" faible

/* ------------------------------------------------------------------ */
/* Utils                                                                */
/* ------------------------------------------------------------------ */

const uid = () => Math.random().toString(36).slice(2, 10);

const chf = (n) =>
  new Intl.NumberFormat("fr-CH", { style: "currency", currency: "CHF", maximumFractionDigits: 0 }).format(
    Math.round(n || 0)
  );

const pct = (n) => `${Math.round(n || 0)}%`;

const toMensuel = (montant, frequence) => (Number(montant) || 0) * (FACTOR[frequence] ?? 1);

function nouvelleLigneRevenu(nom = "") {
  return { id: uid(), nom, montant: "", frequence: "mensuel", commentaire: "" };
}

function nouvelleLigneDepense(nom = "") {
  return { id: uid(), nom, montant: "", budgetReel: "", frequence: "mensuel", commentaire: "" };
}

function budgetVide() {
  return {
    nom: "Mon budget",
    revenus: [],
    depenses: Object.fromEntries(CATEGORIES_DEPENSES.map((c) => [c, []])),
    foyer: { adultes: 1, enfants: 0 },
    objectifEpargne: "",
    expertNotes: { commentaires: "", objectifs: "", recommandations: "", planAction: "" },
  };
}

/* ------------------------------------------------------------------ */
/* Calculs                                                              */
/* ------------------------------------------------------------------ */

function calculerTotaux(budget) {
  const totalRevenus = budget.revenus.reduce(
    (s, l) => s + toMensuel(l.montant, l.frequence), 0
  );

  let totalDepensesPrevu = 0;
  let totalDepensesReel = 0;
  let depensesFixes = 0;
  let depensesVariables = 0;
  let totalCredits = 0;
  const parCategorie = {};

  CATEGORIES_DEPENSES.forEach((cat) => {
    const lignes = budget.depenses[cat] || [];
    let sousTotalReel = 0;
    lignes.forEach((l) => {
      const prevu = toMensuel(l.montant, l.frequence);
      const reel = l.budgetReel !== "" && l.budgetReel != null
        ? toMensuel(l.budgetReel, l.frequence)
        : prevu;
      totalDepensesPrevu += prevu;
      totalDepensesReel += reel;
      sousTotalReel += reel;
      if (CATEGORIES_FIXES.has(cat)) depensesFixes += reel; else depensesVariables += reel;
      if (cat === "Crédits") totalCredits += reel;
    });
    parCategorie[cat] = sousTotalReel;
  });

  const ecartTotal = totalDepensesReel - totalDepensesPrevu;
  const solde = totalRevenus - totalDepensesReel;
  const resteAVivre = solde;
  const personnes = Math.max(1, (Number(budget.foyer.adultes) || 0) + (Number(budget.foyer.enfants) || 0));
  const resteAVivreParPersonne = resteAVivre / personnes;
  const tauxEndettement = totalRevenus > 0 ? (totalCredits / totalRevenus) * 100 : 0;
  const tauxEpargne = totalRevenus > 0 && solde > 0 ? (solde / totalRevenus) * 100 : 0;

  return {
    totalRevenus, totalDepensesPrevu, totalDepensesReel, ecartTotal,
    solde, resteAVivre, resteAVivreParPersonne, tauxEndettement, tauxEpargne,
    depensesFixes, depensesVariables, parCategorie, totalCredits,
  };
}

function calculerAlertes(totaux) {
  const alertes = [];
  if (totaux.solde < 0) {
    alertes.push({ niveau: "rouge", texte: "Le budget est négatif : les dépenses dépassent les revenus." });
  }
  if (totaux.tauxEndettement > 33) {
    alertes.push({ niveau: "rouge", texte: `Taux d'endettement élevé (${pct(totaux.tauxEndettement)}), au-delà du seuil de 33%.` });
  } else if (totaux.tauxEndettement > 25) {
    alertes.push({ niveau: "orange", texte: `Taux d'endettement à surveiller (${pct(totaux.tauxEndettement)}).` });
  }
  if (totaux.ecartTotal > 0) {
    alertes.push({ niveau: "orange", texte: `Les dépenses réelles dépassent le budget prévu de ${chf(totaux.ecartTotal)}.` });
  }
  if (totaux.solde >= 0 && totaux.resteAVivreParPersonne < RAV_MIN_PAR_PERSONNE) {
    alertes.push({ niveau: "orange", texte: `Reste à vivre faible : ${chf(totaux.resteAVivreParPersonne)} par personne.` });
  }
  return alertes;
}

/* ------------------------------------------------------------------ */
/* Composants génériques                                               */
/* ------------------------------------------------------------------ */

function Champ({ label, children, className = "" }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100";

function StatCard({ label, value, sub, tone = "neutral" }) {
  const tones = {
    neutral: "bg-white border-slate-200 text-slate-900",
    good: "bg-emerald-50 border-emerald-200 text-emerald-900",
    bad: "bg-rose-50 border-rose-200 text-rose-900",
  };
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${tones[tone]}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function AlertBanner({ alertes }) {
  if (alertes.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <CheckCircle2 size={18} className="shrink-0" />
        Aucune alerte : le budget est équilibré.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {alertes.map((a, i) => (
        <div
          key={i}
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
            a.niveau === "rouge"
              ? "border-rose-200 bg-rose-50 text-rose-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          <AlertTriangle size={18} className="shrink-0" />
          {a.texte}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ligne (revenu / dépense)                                            */
/* ------------------------------------------------------------------ */

function LigneRevenuRow({ ligne, onChange, onDuplicate, onDelete }) {
  return (
    <div className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-12 sm:items-end sm:gap-3">
      <Champ label="Type" className="sm:col-span-4">
        <select
          className={inputCls}
          value={ligne.nom}
          onChange={(e) => onChange({ ...ligne, nom: e.target.value })}
        >
          <option value="">Choisir…</option>
          {TYPES_REVENUS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </Champ>
      <Champ label="Montant (CHF)" className="sm:col-span-3">
        <input
          type="number" min="0" inputMode="decimal" className={inputCls}
          value={ligne.montant}
          onChange={(e) => onChange({ ...ligne, montant: e.target.value })}
          placeholder="0"
        />
      </Champ>
      <Champ label="Fréquence" className="sm:col-span-3">
        <select
          className={inputCls}
          value={ligne.frequence}
          onChange={(e) => onChange({ ...ligne, frequence: e.target.value })}
        >
          {FREQUENCES.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </Champ>
      <div className="flex gap-2 sm:col-span-2 sm:justify-end">
        <button
          aria-label="Dupliquer" onClick={onDuplicate}
          className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
        >
          <Copy size={16} />
        </button>
        <button
          aria-label="Supprimer" onClick={onDelete}
          className="rounded-lg border border-slate-200 p-2 text-rose-500 hover:bg-rose-50"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <Champ label="Commentaire (optionnel)" className="sm:col-span-12">
        <input
          className={inputCls} value={ligne.commentaire}
          onChange={(e) => onChange({ ...ligne, commentaire: e.target.value })}
          placeholder="Précision…"
        />
      </Champ>
    </div>
  );
}

function LigneDepenseRow({ ligne, onChange, onDuplicate, onDelete }) {
  return (
    <div className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-12 sm:items-end sm:gap-3">
      <Champ label="Nom" className="sm:col-span-3">
        <input
          className={inputCls} value={ligne.nom}
          onChange={(e) => onChange({ ...ligne, nom: e.target.value })}
          placeholder="Ex : Loyer"
        />
      </Champ>
      <Champ label="Prévu (CHF)" className="sm:col-span-2">
        <input
          type="number" min="0" inputMode="decimal" className={inputCls}
          value={ligne.montant}
          onChange={(e) => onChange({ ...ligne, montant: e.target.value })}
          placeholder="0"
        />
      </Champ>
      <Champ label="Réel (CHF)" className="sm:col-span-2">
        <input
          type="number" min="0" inputMode="decimal" className={inputCls}
          value={ligne.budgetReel}
          onChange={(e) => onChange({ ...ligne, budgetReel: e.target.value })}
          placeholder="="
        />
      </Champ>
      <Champ label="Fréquence" className="sm:col-span-3">
        <select
          className={inputCls} value={ligne.frequence}
          onChange={(e) => onChange({ ...ligne, frequence: e.target.value })}
        >
          {FREQUENCES.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </Champ>
      <div className="flex gap-2 sm:col-span-2 sm:justify-end">
        <button
          aria-label="Dupliquer" onClick={onDuplicate}
          className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
        >
          <Copy size={16} />
        </button>
        <button
          aria-label="Supprimer" onClick={onDelete}
          className="rounded-lg border border-slate-200 p-2 text-rose-500 hover:bg-rose-50"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <Champ label="Commentaire (optionnel)" className="sm:col-span-12">
        <input
          className={inputCls} value={ligne.commentaire}
          onChange={(e) => onChange({ ...ligne, commentaire: e.target.value })}
          placeholder="Précision…"
        />
      </Champ>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Étape : Revenus                                                     */
/* ------------------------------------------------------------------ */

function EtapeRevenus({ budget, setBudget }) {
  const revenus = budget.revenus;

  const update = (id, patch) =>
    setBudget((b) => ({ ...b, revenus: b.revenus.map((l) => (l.id === id ? patch : l)) }));
  const add = () => setBudget((b) => ({ ...b, revenus: [...b.revenus, nouvelleLigneRevenu()] }));
  const duplicate = (l) => setBudget((b) => ({ ...b, revenus: [...b.revenus, { ...l, id: uid() }] }));
  const remove = (id) => setBudget((b) => ({ ...b, revenus: b.revenus.filter((l) => l.id !== id) }));

  const total = revenus.reduce((s, l) => s + toMensuel(l.montant, l.frequence), 0);

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Revenus</h2>
        <p className="text-sm text-slate-500">Ajoutez toutes vos sources de revenus. Le montant mensuel équivalent est calculé automatiquement.</p>
      </div>

      {revenus.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          Aucun revenu pour l'instant. Ajoutez votre première ligne.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {revenus.map((l) => (
          <LigneRevenuRow
            key={l.id} ligne={l}
            onChange={(patch) => update(l.id, patch)}
            onDuplicate={() => duplicate(l)}
            onDelete={() => remove(l.id)}
          />
        ))}
      </div>

      <button
        onClick={add}
        className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-teal-300 py-3 text-sm font-medium text-teal-700 hover:bg-teal-50"
      >
        <Plus size={16} /> Ajouter un revenu
      </button>

      <div className="sticky bottom-20 mt-2 rounded-xl bg-slate-900 px-4 py-3 text-white shadow-lg sm:static sm:bottom-auto">
        <p className="text-xs uppercase tracking-wide text-slate-300">Total revenus mensuels</p>
        <p className="text-xl font-semibold tabular-nums">{chf(total)}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Étape : Dépenses                                                    */
/* ------------------------------------------------------------------ */

function CategorieCard({ categorie, lignes, ouverte, onToggle, onUpdate, onAdd, onDuplicate, onDelete }) {
  const total = lignes.reduce((s, l) => {
    const reel = l.budgetReel !== "" && l.budgetReel != null ? l.budgetReel : l.montant;
    return s + toMensuel(reel, l.frequence);
  }, 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-800">{categorie}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{lignes.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tabular-nums text-slate-700">{chf(total)}</span>
          {ouverte ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {ouverte && (
        <div className="flex flex-col gap-3 border-t border-slate-100 p-3">
          {lignes.map((l) => (
            <LigneDepenseRow
              key={l.id} ligne={l}
              onChange={(patch) => onUpdate(l.id, patch)}
              onDuplicate={() => onDuplicate(l)}
              onDelete={() => onDelete(l.id)}
            />
          ))}
          <button
            onClick={onAdd}
            className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <Plus size={14} /> Ajouter une ligne
          </button>
        </div>
      )}
    </div>
  );
}

function EtapeDepenses({ budget, setBudget }) {
  const [ouvertes, setOuvertes] = useState(() => new Set());

  const toggle = (cat) =>
    setOuvertes((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });

  const update = (cat, id, patch) =>
    setBudget((b) => ({
      ...b,
      depenses: { ...b.depenses, [cat]: b.depenses[cat].map((l) => (l.id === id ? patch : l)) },
    }));
  const add = (cat) =>
    setBudget((b) => ({ ...b, depenses: { ...b.depenses, [cat]: [...b.depenses[cat], nouvelleLigneDepense()] } }));
  const duplicate = (cat, l) =>
    setBudget((b) => ({ ...b, depenses: { ...b.depenses, [cat]: [...b.depenses[cat], { ...l, id: uid() }] } }));
  const remove = (cat, id) =>
    setBudget((b) => ({ ...b, depenses: { ...b.depenses, [cat]: b.depenses[cat].filter((l) => l.id !== id) } }));

  const totaux = useMemo(() => calculerTotaux(budget), [budget]);

  return (
    <div className="flex flex-col gap-3 pb-24">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Dépenses</h2>
        <p className="text-sm text-slate-500">Ouvrez une catégorie pour ajouter vos lignes de dépenses, avec budget prévu et réel.</p>
      </div>

      {CATEGORIES_DEPENSES.map((cat) => (
        <CategorieCard
          key={cat} categorie={cat} lignes={budget.depenses[cat] || []}
          ouverte={ouvertes.has(cat)} onToggle={() => toggle(cat)}
          onUpdate={(id, patch) => update(cat, id, patch)}
          onAdd={() => add(cat)}
          onDuplicate={(l) => duplicate(cat, l)}
          onDelete={(id) => remove(cat, id)}
        />
      ))}

      <div className="sticky bottom-20 mt-2 rounded-xl bg-slate-900 px-4 py-3 text-white shadow-lg sm:static sm:bottom-auto">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300">Total dépenses (réel)</span>
          <span className="text-xl font-semibold tabular-nums">{chf(totaux.totalDepensesReel)}</span>
        </div>
        {totaux.ecartTotal !== 0 && (
          <p className={`mt-1 text-xs ${totaux.ecartTotal > 0 ? "text-amber-300" : "text-emerald-300"}`}>
            Écart vs budget prévu : {totaux.ecartTotal > 0 ? "+" : ""}{chf(totaux.ecartTotal)}
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Étape : Résumé / Dashboard                                          */
/* ------------------------------------------------------------------ */

function CamembertDepenses({ parCategorie }) {
  const data = CATEGORIES_DEPENSES.map((c, i) => ({ name: c, value: Math.round(parCategorie[c] || 0), color: COULEURS_CATEGORIES[i] }))
    .filter((d) => d.value > 0);

  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">Ajoutez des dépenses pour voir la répartition.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} innerRadius={55}>
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Pie>
        <Tooltip formatter={(v) => chf(v)} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function HistogrammeCategories({ parCategorie }) {
  const data = CATEGORIES_DEPENSES.map((c) => ({ name: c, montant: Math.round(parCategorie[c] || 0) }))
    .filter((d) => d.montant > 0)
    .sort((a, b) => b.montant - a.montant);

  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">Aucune dépense enregistrée.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 34)}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
        <XAxis type="number" tickFormatter={(v) => chf(v)} fontSize={11} />
        <YAxis type="category" dataKey="name" width={120} fontSize={11} />
        <Tooltip formatter={(v) => chf(v)} />
        <Bar dataKey="montant" fill="#0f6e56" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function FoyerCard({ foyer, setBudget, totaux }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <Users size={18} className="text-slate-500" />
        <h3 className="font-medium text-slate-800">Foyer</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Champ label="Adultes">
          <input
            type="number" min="0" className={inputCls} value={foyer.adultes}
            onChange={(e) => setBudget((b) => ({ ...b, foyer: { ...b.foyer, adultes: e.target.value } }))}
          />
        </Champ>
        <Champ label="Enfants">
          <input
            type="number" min="0" className={inputCls} value={foyer.enfants}
            onChange={(e) => setBudget((b) => ({ ...b, foyer: { ...b.foyer, enfants: e.target.value } }))}
          />
        </Champ>
      </div>
      <p className="mt-3 text-sm text-slate-600">
        Reste à vivre par personne : <span className="font-semibold text-slate-900">{chf(totaux.resteAVivreParPersonne)}</span>
      </p>
    </div>
  );
}

function ObjectifCard({ objectifEpargne, setBudget, solde }) {
  const cible = Number(objectifEpargne) || 0;
  const atteint = Math.max(0, solde);
  const pourcentage = cible > 0 ? Math.min(100, (atteint / cible) * 100) : 0;
  const resteNecessaire = Math.max(0, cible - atteint);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <Target size={18} className="text-slate-500" />
        <h3 className="font-medium text-slate-800">Objectif d'épargne mensuel</h3>
      </div>
      <Champ label="Montant cible (CHF)">
        <input
          type="number" min="0" className={inputCls} value={objectifEpargne}
          onChange={(e) => setBudget((b) => ({ ...b, objectifEpargne: e.target.value }))}
          placeholder="Ex : 300"
        />
      </Champ>
      {cible > 0 && (
        <div className="mt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-teal-600" style={{ width: `${pourcentage}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>Atteint : {chf(atteint)} ({pct(pourcentage)})</span>
            <span>Reste : {chf(resteNecessaire)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function EtapeResume({ budget, setBudget }) {
  const totaux = useMemo(() => calculerTotaux(budget), [budget]);
  const alertes = useMemo(() => calculerAlertes(totaux), [totaux]);

  return (
    <div className="flex flex-col gap-5 pb-10">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Résumé et tableau de bord</h2>
        <p className="text-sm text-slate-500">Vue d'ensemble de votre budget mensuel.</p>
      </div>

      <AlertBanner alertes={alertes} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Revenus" value={chf(totaux.totalRevenus)} tone="good" />
        <StatCard label="Dépenses" value={chf(totaux.totalDepensesReel)} tone="neutral" />
        <StatCard
          label="Solde"
          value={chf(totaux.solde)}
          tone={totaux.solde >= 0 ? "good" : "bad"}
        />
        <StatCard
          label="Reste à vivre"
          value={chf(totaux.resteAVivre)}
          sub={`${chf(totaux.resteAVivreParPersonne)} / personne`}
          tone={totaux.resteAVivreParPersonne >= RAV_MIN_PAR_PERSONNE ? "good" : "bad"}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Taux d'endettement" value={pct(totaux.tauxEndettement)} />
        <StatCard label="Taux d'épargne" value={pct(totaux.tauxEpargne)} />
        <StatCard label="Dépenses fixes" value={chf(totaux.depensesFixes)} />
        <StatCard label="Dépenses variables" value={chf(totaux.depensesVariables)} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FoyerCard foyer={budget.foyer} setBudget={setBudget} totaux={totaux} />
        <ObjectifCard objectifEpargne={budget.objectifEpargne} setBudget={setBudget} solde={totaux.solde} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="mb-2 font-medium text-slate-800">Répartition des dépenses</h3>
        <CamembertDepenses parCategorie={totaux.parCategorie} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="mb-2 font-medium text-slate-800">Dépenses par catégorie</h3>
        <HistogrammeCategories parCategorie={totaux.parCategorie} />
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
        <p className="font-medium text-slate-600">Évolution mensuelle</p>
        <p className="mt-1">Structure prête pour une future fonctionnalité : l'historique multi-mois sera disponible en V2.</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Étape : Accueil                                                     */
/* ------------------------------------------------------------------ */

function EtapeAccueil({ budget, setBudget, aller }) {
  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="rounded-3xl bg-gradient-to-br from-teal-700 to-teal-900 p-6 text-white">
        <p className="text-xs font-medium uppercase tracking-wide text-teal-200">Budget+</p>
        <h1 className="mt-1 text-2xl font-semibold">Construisez votre budget en moins de 5 minutes</h1>
        <p className="mt-2 text-sm text-teal-100">
          Revenus, dépenses, solde, alertes : tout est calculé automatiquement. Vos données restent sur cet appareil.
        </p>
        <button
          onClick={() => aller("revenus")}
          className="mt-4 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-teal-800 hover:bg-teal-50"
        >
          Commencer
        </button>
      </div>

      <div>
        <Champ label="Nom du budget">
          <input
            className={inputCls} value={budget.nom}
            onChange={(e) => setBudget((b) => ({ ...b, nom: e.target.value }))}
            placeholder="Ex : Budget de Marie"
          />
        </Champ>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {[
          { key: "revenus", icon: Wallet, label: "Revenus", desc: "Vos entrées d'argent" },
          { key: "depenses", icon: ShoppingBag, label: "Dépenses", desc: "Vos charges par catégorie" },
          { key: "resume", icon: PieIcon, label: "Résumé", desc: "Solde, alertes, graphiques" },
          { key: "export", icon: Download, label: "Export", desc: "PDF, Excel, JSON" },
        ].map(({ key, icon: Icon, label, desc }) => (
          <button
            key={key} onClick={() => aller(key)}
            className="flex flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-teal-300 hover:bg-teal-50/50"
          >
            <Icon size={20} className="text-teal-700" />
            <span className="text-sm font-medium text-slate-800">{label}</span>
            <span className="text-xs text-slate-500">{desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Étape : Export                                                      */
/* ------------------------------------------------------------------ */

function telechargerBlob(contenu, nomFichier, type) {
  const blob = new Blob([contenu], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomFichier;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exporterJson(budget) {
  telechargerBlob(JSON.stringify(budget, null, 2), `${budget.nom || "budget"}.json`, "application/json");
}

function exporterExcel(budget, totaux) {
  const wb = XLSX.utils.book_new();

  const revenusRows = budget.revenus.map((l) => ({
    Nom: l.nom, "Montant": Number(l.montant) || 0, Fréquence: l.frequence,
    "Équivalent mensuel": Math.round(toMensuel(l.montant, l.frequence)), Commentaire: l.commentaire || "",
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(revenusRows), "Revenus");

  const depensesRows = [];
  CATEGORIES_DEPENSES.forEach((cat) => {
    (budget.depenses[cat] || []).forEach((l) => {
      depensesRows.push({
        Catégorie: cat, Nom: l.nom, Prévu: Number(l.montant) || 0,
        Réel: l.budgetReel !== "" ? Number(l.budgetReel) : Number(l.montant) || 0,
        Fréquence: l.frequence,
        "Équivalent mensuel (réel)": Math.round(toMensuel(l.budgetReel !== "" ? l.budgetReel : l.montant, l.frequence)),
        Commentaire: l.commentaire || "",
      });
    });
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(depensesRows), "Dépenses");

  const resumeRows = [
    { Indicateur: "Total revenus", Valeur: Math.round(totaux.totalRevenus) },
    { Indicateur: "Total dépenses (réel)", Valeur: Math.round(totaux.totalDepensesReel) },
    { Indicateur: "Solde", Valeur: Math.round(totaux.solde) },
    { Indicateur: "Reste à vivre / personne", Valeur: Math.round(totaux.resteAVivreParPersonne) },
    { Indicateur: "Taux d'endettement (%)", Valeur: Math.round(totaux.tauxEndettement) },
    { Indicateur: "Taux d'épargne (%)", Valeur: Math.round(totaux.tauxEpargne) },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumeRows), "Résumé");

  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  telechargerBlob(out, `${budget.nom || "budget"}.xlsx`, "application/octet-stream");
}

function imprimerPdf(budget, totaux) {
  const w = window.open("", "_blank");
  if (!w) return;
  const ligneHtml = (l, reel) => `<tr><td>${l.nom}</td><td>${chf(l.montant)}</td>${reel ? `<td>${chf(l.budgetReel !== "" ? l.budgetReel : l.montant)}</td>` : ""}<td>${l.frequence}</td></tr>`;
  const revenusHtml = budget.revenus.map((l) => ligneHtml(l, false)).join("");
  const depensesHtml = CATEGORIES_DEPENSES.map((cat) => {
    const lignes = budget.depenses[cat] || [];
    if (lignes.length === 0) return "";
    return `<h3>${cat}</h3><table><tr><th>Nom</th><th>Prévu</th><th>Réel</th><th>Fréquence</th></tr>${lignes.map((l) => ligneHtml(l, true)).join("")}</table>`;
  }).join("");

  w.document.write(`
    <html><head><title>${budget.nom}</title>
    <style>
      body{font-family:Arial,sans-serif;color:#1e293b;padding:24px;}
      h1{margin-bottom:4px;} h2{margin-top:28px;border-bottom:2px solid #0f6e56;padding-bottom:4px;}
      h3{margin-top:16px;margin-bottom:4px;color:#0f6e56;}
      table{width:100%;border-collapse:collapse;margin-bottom:8px;font-size:13px;}
      th,td{border:1px solid #e2e8f0;padding:6px 8px;text-align:left;}
      .totaux{display:flex;gap:16px;flex-wrap:wrap;margin-top:12px;}
      .stat{border:1px solid #e2e8f0;border-radius:8px;padding:10px 14px;}
      .stat b{display:block;font-size:16px;}
    </style></head><body>
    <h1>${budget.nom}</h1>
    <p>Généré le ${new Date().toLocaleDateString("fr-CH")}</p>
    <h2>Résumé</h2>
    <div class="totaux">
      <div class="stat">Revenus<b>${chf(totaux.totalRevenus)}</b></div>
      <div class="stat">Dépenses<b>${chf(totaux.totalDepensesReel)}</b></div>
      <div class="stat">Solde<b>${chf(totaux.solde)}</b></div>
      <div class="stat">Reste à vivre / pers.<b>${chf(totaux.resteAVivreParPersonne)}</b></div>
      <div class="stat">Taux d'endettement<b>${pct(totaux.tauxEndettement)}</b></div>
    </div>
    <h2>Revenus</h2>
    <table><tr><th>Nom</th><th>Montant</th><th>Fréquence</th></tr>${revenusHtml}</table>
    <h2>Dépenses</h2>
    ${depensesHtml}
    </body></html>
  `);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
}

function EtapeExport({ budget, totaux }) {
  return (
    <div className="flex flex-col gap-4 pb-10">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Export</h2>
        <p className="text-sm text-slate-500">Exportez votre budget pour l'imprimer, le modifier ou le restaurer plus tard.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          onClick={() => imprimerPdf(budget, totaux)}
          className="flex flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-teal-300 hover:bg-teal-50/50"
        >
          <Printer size={20} className="text-teal-700" />
          <span className="text-sm font-medium text-slate-800">PDF imprimable</span>
          <span className="text-xs text-slate-500">Ouvre un aperçu prêt à imprimer ou enregistrer en PDF.</span>
        </button>

        <button
          onClick={() => exporterExcel(budget, totaux)}
          className="flex flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-teal-300 hover:bg-teal-50/50"
        >
          <FileSpreadsheet size={20} className="text-teal-700" />
          <span className="text-sm font-medium text-slate-800">Excel (.xlsx)</span>
          <span className="text-xs text-slate-500">Fichier entièrement modifiable, avec revenus, dépenses et résumé.</span>
        </button>

        <button
          onClick={() => exporterJson(budget)}
          className="flex flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-teal-300 hover:bg-teal-50/50"
        >
          <FileJson size={20} className="text-teal-700" />
          <span className="text-sm font-medium text-slate-800">JSON</span>
          <span className="text-xs text-slate-500">Permet de restaurer ce budget plus tard, ou de le transmettre à un expert.</span>
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Panneau expert                                                      */
/* ------------------------------------------------------------------ */

function ExpertPanel({ ouvert, onClose, notes, setBudget }) {
  if (!ouvert) return null;
  const update = (champ, valeur) =>
    setBudget((b) => ({ ...b, expertNotes: { ...b.expertNotes, [champ]: valeur } }));

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-sm flex-col gap-4 overflow-y-auto bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-teal-700" />
            <h3 className="font-semibold text-slate-900">Mode expert</h3>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Ces notes sont réservées au professionnel et ne sont jamais visibles dans le mode particulier.
        </p>

        <Champ label="Commentaires">
          <textarea rows={3} className={inputCls} value={notes.commentaires}
            onChange={(e) => update("commentaires", e.target.value)} />
        </Champ>
        <Champ label="Objectifs">
          <textarea rows={3} className={inputCls} value={notes.objectifs}
            onChange={(e) => update("objectifs", e.target.value)} />
        </Champ>
        <Champ label="Recommandations">
          <textarea rows={3} className={inputCls} value={notes.recommandations}
            onChange={(e) => update("recommandations", e.target.value)} />
        </Champ>
        <Champ label="Plan d'action">
          <textarea rows={3} className={inputCls} value={notes.planAction}
            onChange={(e) => update("planAction", e.target.value)} />
        </Champ>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

const ETAPES = [
  { key: "accueil", label: "Accueil", icon: Home },
  { key: "revenus", label: "Revenus", icon: Wallet },
  { key: "depenses", label: "Dépenses", icon: ShoppingBag },
  { key: "resume", label: "Résumé", icon: PieIcon },
  { key: "export", label: "Export", icon: Download },
];

function BottomNav({ etape, aller }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl">
        {ETAPES.map(({ key, label, icon: Icon }) => (
          <button
            key={key} onClick={() => aller(key)}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs ${
              etape === key ? "text-teal-700" : "text-slate-400"
            }`}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                  */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "budget-plus-data";

export default function App() {
  const [budget, setBudget] = useState(budgetVide());
  const [etape, setEtape] = useState("accueil");
  const [modeExpert, setModeExpert] = useState(false);
  const [panneauExpertOuvert, setPanneauExpertOuvert] = useState(false);
  const [statutSauvegarde, setStatutSauvegarde] = useState("idle");
  const chargeRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage?.get(STORAGE_KEY, false);
        if (res?.value) {
          const data = JSON.parse(res.value);
          setBudget((b) => ({ ...budgetVide(), ...data }));
        }
      } catch (e) {
        // pas de budget sauvegardé encore
      } finally {
        chargeRef.current = true;
      }
    })();
  }, []);

  useEffect(() => {
    if (!chargeRef.current) return;
    setStatutSauvegarde("saving");
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        await window.storage?.set(STORAGE_KEY, JSON.stringify(budget), false);
        setStatutSauvegarde("saved");
      } catch (e) {
        setStatutSauvegarde("error");
      }
    }, 500);
    return () => clearTimeout(timerRef.current);
  }, [budget]);

  const totaux = useMemo(() => calculerTotaux(budget), [budget]);

  const aller = useCallback((key) => {
    setEtape(key);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-sm font-bold text-white">B+</div>
            <span className="font-semibold text-slate-800">Budget+</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-400 sm:inline">
              {statutSauvegarde === "saving" ? "Sauvegarde…" : statutSauvegarde === "saved" ? "Sauvegardé" : ""}
            </span>
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox" checked={modeExpert}
                onChange={(e) => { setModeExpert(e.target.checked); if (e.target.checked) setPanneauExpertOuvert(true); }}
                className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
              />
              Mode expert
            </label>
            {modeExpert && (
              <button
                onClick={() => setPanneauExpertOuvert(true)}
                aria-label="Ouvrir le panneau expert"
                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
              >
                <User size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5">
        {etape === "accueil" && <EtapeAccueil budget={budget} setBudget={setBudget} aller={aller} />}
        {etape === "revenus" && <EtapeRevenus budget={budget} setBudget={setBudget} />}
        {etape === "depenses" && <EtapeDepenses budget={budget} setBudget={setBudget} />}
        {etape === "resume" && <EtapeResume budget={budget} setBudget={setBudget} />}
        {etape === "export" && <EtapeExport budget={budget} totaux={totaux} />}
      </main>

      <BottomNav etape={etape} aller={aller} />

      {modeExpert && (
        <ExpertPanel
          ouvert={panneauExpertOuvert}
          onClose={() => setPanneauExpertOuvert(false)}
          notes={budget.expertNotes}
          setBudget={setBudget}
        />
      )}
    </div>
  );
}
