# Budget+

MVP d'application suisse de gestion de budget mensuel, pour particuliers et
professionnels de l'accompagnement budgétaire (assistants sociaux, conseillers
financiers, experts en prévention).

Construit avec Next.js 14 (App Router), React, TypeScript, Tailwind CSS,
React Hook Form + Zod, Recharts, SheetJS et jsPDF.

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # build de production
npm run start   # servir le build
npm run typecheck
npm run lint
```

## Fonctionnalités du MVP

- Parcours mobile-first : Accueil → Revenus → Dépenses → Résumé → Export (< 5 min)
- Revenus (12 types suisses standards) et dépenses (15 catégories repliables),
  lignes illimitées, modifiables / duplicables / supprimables
- Conversion automatique de toute fréquence (hebdomadaire, mensuelle,
  trimestrielle, semestrielle, annuelle, unique) en équivalent mensuel
- Suivi budget prévu / réel par ligne de dépense, avec calcul de l'écart
- Tableau de bord : 4 indicateurs principaux, taux d'endettement, taux
  d'épargne, dépenses fixes/variables, camembert et histogramme
- Alertes automatiques (vert / orange / rouge) : budget négatif, endettement
  élevé, dépassement de budget, reste à vivre faible
- Foyer (adultes / enfants) avec reste à vivre par personne
- Objectif d'épargne mensuel avec barre de progression
- Mode expert : panneau latéral (commentaires, objectifs, recommandations,
  plan d'action), invisible en mode particulier
- Export PDF (jsPDF, prêt à imprimer), Excel (.xlsx, entièrement modifiable),
  JSON (restaurable, avec validation Zod à l'import)
- Sauvegarde automatique dans le navigateur (localStorage), derrière une
  interface `StorageService` remplaçable

Pas de comptes utilisateurs, pas d'authentification, pas de paiement, pas de
synchronisation cloud — volontairement, pour ce MVP.

## Architecture

```
budget-plus/
├─ app/
│  ├─ layout.tsx          # Layout racine, injecte le BudgetProvider
│  ├─ page.tsx             # Orchestre le parcours (stepper)
│  └─ globals.css
├─ src/
│  ├─ components/
│  │  ├─ ui/                # Primitives (Button, Card, Input, Select, Textarea, Field)
│  │  └─ layout/            # Header, BottomNav
│  ├─ features/
│  │  ├─ accueil/           # Accueil.tsx, ParametresForm.tsx (React Hook Form + Zod)
│  │  ├─ revenus/           # RevenusForm.tsx, LigneRevenu.tsx
│  │  ├─ depenses/          # DepensesForm.tsx, CategorieCard.tsx, LigneDepense.tsx
│  │  ├─ dashboard/         # Dashboard.tsx, StatCard, AlertBanner, ChartCamembert, ChartCategories
│  │  ├─ foyer/FoyerCard.tsx
│  │  ├─ objectif-epargne/ObjectifCard.tsx
│  │  ├─ expert/ExpertPanel.tsx
│  │  └─ export/ExportPanel.tsx
│  ├─ context/
│  │  └─ BudgetContext.tsx  # État global, sauvegarde auto, calculs mémoïsés
│  ├─ hooks/
│  │  ├─ useBudget.ts       # Fabriques (budget vide, nouvelle ligne…)
│  │  └─ useAutoSave.ts     # Sauvegarde anti-rebond via StorageService
│  ├─ services/
│  │  ├─ calculations/budgetCalculator.ts  # Totaux, ratios, alertes
│  │  ├─ storage/           # Interface StorageService + localStorageService
│  │  └─ export/            # exportJson, exportExcel (SheetJS), exportPdf (jsPDF)
│  ├─ types/budget.types.ts # Modèle de données TypeScript
│  ├─ utils/
│  │  ├─ constants.ts       # Catégories, fréquences, seuils d'alerte
│  │  ├─ formatters.ts      # CHF, %, dates
│  │  └─ validation.ts      # Schémas Zod (import JSON, formulaire paramètres)
│  └─ lib/utils.ts          # cn() helper, uid()
```

### Logique métier centralisée

Tous les calculs (conversion de fréquence, totaux, taux d'endettement, taux
d'épargne, alertes) vivent dans `src/services/calculations/budgetCalculator.ts`.
Les composants restent purement présentationnels et consomment `totaux` /
`alertes` depuis `useBudgetContext()`.

### Couche de stockage remplaçable

`src/services/storage/storageService.interface.ts` définit le contrat
(`get`, `set`, `remove`). Le MVP l'implémente avec `localStorage`
(`localStorageService.ts`). Pour passer à Supabase, Firebase ou PostgreSQL :

1. Créer `supabaseStorageService.ts` (ou équivalent) respectant `StorageService`.
2. Remplacer l'import dans `src/context/BudgetContext.tsx`.

Aucun composant ni feature n'a besoin d'être modifié.

## Roadmap

**MVP** (ce dépôt) — parcours complet, calculs, alertes, dashboard, export,
mode expert, sans compte ni paiement.

**V2** — connexion utilisateur, historique multi-mois, synchronisation cloud
(bascule de `localStorageService` vers un service cloud), comparaison des
mois, suivi des objectifs dans le temps.

**V3** — IA d'analyse budgétaire, suggestions automatiques, détection des
dépenses anormales, prévisions financières, assistant conversationnel,
coaching budgétaire.

## Déploiement

Projet 100% statique côté client (aucune route API requise pour le MVP) :
compatible Vercel, Netlify, ou tout hébergeur de site statique après
`npm run build`.
