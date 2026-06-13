# Contributing — Roguelite Idle RPG

Ce document définit le **workflow de développement**, la **Definition of Done** par type de ticket, les **conventions de code** et la **checklist obligatoire** de fin de session.

> Pour tout contexte produit/game design : voir `CONTEXT.md`.
> Pour le backlog : voir `TASKS.md`.

---

## 1. Setup

```bash
git clone https://github.com/rosariAdr/loop_breaker.git
cd loop_breaker
npm install
npm run dev      # localhost:5173
```

Stack : React 19 + Vite 8 + Zustand 5 + TailwindCSS 4 + Vitest 4 + React Testing Library. **JavaScript pur** (pas de TypeScript).

---

## 2. Workflow Git

### Stratégie de branches

```
master  ← stable, taggué (v0.1.0, v0.1.1, …) — uniquement via PR depuis dev
  │
  └── dev  ← intégration continue — uniquement via PR depuis feat/*
        │
        └── feat/<TICKET_ID>  ← features M/L (ex: feat/MAP01, feat/PROC00)
        └── fix/<DESCRIPTION>  ← bug fixes hors planning (ex: fix/inventory-crash)
        └── chore/<DESCRIPTION>  ← maintenance, docs, deps
```

**Règles** :
- Pas de commit direct sur `master` ni sur `dev`. Tout passe par PR.
- Une PR = un ticket (ou un batch cohérent de tickets XS/S liés).
- Squash merge depuis `feat/*` vers `dev`. Rebase ou merge classique de `dev` vers `master`.
- `master` est taggué à chaque release : `git tag v0.1.3 && git push --tags`.

### Règle de synchronisation `dev` ↔ `master` (à ne pas oublier)

**Après chaque merge `dev → master`**, il FAUT resynchroniser `dev` avec `master`, sinon les prochaines `feat/*` créées depuis `dev` seront en retard d'un commit de merge.

```bash
git checkout dev
git merge --ff-only master    # fast-forward dev sur master
git push origin dev            # propager côté remote
```

Dans **GitKraken** :
1. Switch sur `dev`
2. Clic droit sur `master` → **"Fast-forward dev to here"** (ou "Merge master into dev")
3. **Push** `dev` vers origin

Le check qui doit passer : `git log --oneline master..dev` doit être vide.

> **Symptôme si tu oublies** : ta nouvelle `feat/<ID>` apparaît "1 commit behind master" dans GitKraken alors que tu viens de la créer. C'est normal mais ça pollue les diffs et complique les rebases.

### Convention de commits

Format : `type(scope): description courte` (Conventional Commits).

| Type | Quand l'utiliser |
|---|---|
| `feat` | Nouvelle fonctionnalité visible pour le joueur |
| `fix` | Correction de bug |
| `test` | Ajout/modif de tests sans changement de code prod |
| `refactor` | Restructuration sans changement de comportement |
| `chore` | Maintenance, deps, gitignore, scripts |
| `docs` | Documentation seule (README, CONTRIBUTING, CHANGELOG, JSDoc) |
| `style` | Formatage, espaces (rien sur la logique) |
| `perf` | Optimisation de performance |

**Scopes courants** : `combat`, `store`, `quests`, `deities`, `ui`, `save`, `tests`, `proc`, `balance`.

**Exemples** :
```
feat(combat): floating damage numbers + combat stats summary
fix(save): crash on Bag click when inventory.equipment missing
test(deities): cover applyDeityBlessing edge cases
refactor(store): extract applyLevelUps as pure helper
chore(deps): bump vitest to 4.1.4
docs(readme): add monster portrait generation guide
```

**Co-authoring avec Claude** : non utilisé sur ce projet (préférence du dev). Si tu veux l'activer plus tard, ajouter en pied de commit :
```
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

## 3. Definition of Done (DoD) par type de ticket

Avant de fermer un ticket, vérifier que **tous** les critères du type s'appliquent.

### 🎮 Feature gameplay (M/L)
- [ ] Code implémenté avec le pattern existant (Zustand action + screen + helper engine si pur)
- [ ] **Test unitaire** (logique pure dans `engine/` ou helper isolé)
- [ ] **Test fonctionnel** (action store dans `gameStore.test.js`)
- [ ] **Scénario de jeu** (`scenarios.test.js`) si la feature s'intègre dans une boucle
- [ ] Migration save si ajout de champ dans `INITIAL_*` (cf. §6 règle save)
- [ ] `CONTEXT.md` mis à jour (compteurs, état système)
- [ ] Build + lint verts

### 🎨 Feature UI (S/M)
- [ ] Composant respecte le style Tailwind + tokens couleur (gold `#d4af70`, dark `#0a0a0f`, …)
- [ ] **Smoke test RTL** (`screens.test.jsx` ou fichier dédié)
- [ ] Pas de régression sur les écrans voisins (vérifier nav + layouts)
- [ ] Screenshot (annexé à la PR ou dans `docs/screenshots/`)
- [ ] Accessibilité minimum : `alt` sur `<img>`, contraste OK

### 🐛 Bug fix
- [ ] **Test de régression écrit AVANT le fix** (TDD strict)
- [ ] Vérification sur **vieille save** si bug touche l'état persisté
- [ ] Stack trace originale notée dans le commit message si pertinent
- [ ] Tests passent verts après le fix

### ♻️ Refactor
- [ ] Tests existants verts (zéro modification de comportement attendu)
- [ ] Bundle size stable (vérifier `npm run build`, ±5% acceptable)
- [ ] Pas de nouvelle dépendance sans justification
- [ ] CHANGELOG.md noté en `### Changed`

### 📊 Contenu data (XS/S)
- [ ] Données ajoutées dans le fichier `data/` correspondant
- [ ] **Test de structure** dans `data/<x>.test.js` (champs requis présents, IDs uniques, références valides)
- [ ] `CONTEXT.md` §5 (compteurs) mis à jour
- [ ] Nommage `snake_case` pour les IDs

### 📝 Process / docs
- [ ] Markdown lisible (titres `##`, listes, blocs code)
- [ ] Liens internes valides (chemins relatifs corrects)
- [ ] CHANGELOG.md mis à jour si impact workflow

---

## 4. Conventions de code

### Nommage

| Élément | Convention | Exemple |
|---|---|---|
| Composant React | `PascalCase` | `CombatScreen.jsx`, `HeroCard.jsx` |
| Hook custom | `camelCase` avec préfixe `use` | `useGameStore`, `useFloatingNumbers` |
| Action Zustand | `camelCase` verbe + objet | `acceptDeity`, `heroDeath`, `gainSkillXp` |
| Constante data | `SCREAMING_SNAKE_CASE` | `DIVINE_RELATIONS`, `RARITY_CONFIG` |
| Fonction engine | `camelCase` verbe + objet | `calcBaseDamage`, `buildEnemy` |
| ID en data (skillId, monsterId) | `snake_case` | `ashwood_wolf`, `inferno_strike` |
| ID de ticket | Préfixe + numéro | `MAP01`, `CMP03`, `GLT02`, `PROC00` |

### Organisation des imports

Ordre dans chaque fichier :
1. Imports React (`useState`, `useEffect`, …)
2. Imports lib externes (Zustand, etc.)
3. Imports data (`../data/skills`)
4. Imports engine (`../engine/combat`)
5. Imports store (`../store/gameStore`)
6. Imports composants (`./ChildComponent`)

Pas de mix CSS modules / inline. Le projet utilise **Tailwind utility classes** + **inline `style={{}}` pour les couleurs/animations dynamiques**.

### Architecture

- **`data/`** : données pures, immuables, aucun state React
- **`engine/`** : logique pure, fonctions exportées, **100% testable sans mock**
- **`store/`** : Zustand global state + actions
- **`screens/`** : composants d'écrans, peuvent lire le store
- **`components/`** : composants réutilisables (à créer si besoin)
- **`test/setup.js`** : globals + mocks (jsdom, localStorage, RTL extends)

**Règle d'or** : la logique métier va dans `engine/`. Les screens orchestrent, les actions store mutent l'état.

### Tests

- **Engine** (logique pure) : `*.test.js` à côté du fichier source
- **Store actions** : `gameStore.test.js`
- **Scénarios** (multi-actions, simulent une partie) : `scenarios.test.js`
- **UI** (rendu, navigation, flow utilisateur) : `*.test.jsx` avec RTL

**Politique de couverture** :
- Engine : viser 90% (logique testable sans coût)
- Store actions : 80% minimum (chaque action a au moins 1 test)
- UI : smoke test obligatoire, flux critiques testés (équipement, combat, transmigration, accept deity)

**Pattern d'un test** :
```js
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
  localStorage.clear()
})

describe('myAction', () => {
  it('décrit le comportement attendu', () => {
    useGameStore.getState().myAction(arg)
    expect(useGameStore.getState().hero.field).toBe(expected)
  })
})
```

---

## 5. Checklist obligatoire de fin de session

Avant chaque commit qui clôt une session de travail :

```
□ npm run test:run        → vert (1000+ tests passent)
□ npm run build           → OK (build prod sans erreur)
□ npm run lint            → OK (0 erreur ; warnings exhaustive-deps connus tolérés)
□ npm run format:check    → OK (sinon `npm run format` ; normalement déjà fait par le hook)
□ TASKS.md                → ticket déplacé en Done avec date
□ CONTEXT.md              → compteurs/sections mis à jour si feature impactante
□ CHANGELOG.md            → entrée [Unreleased] enrichie
□ Pas de console.log oublié dans le code prod
□ Pas de fichier de test/debug commité accidentellement
□ git status              → working tree clean après commit
```

Si tu interromps la session sans clôturer, **commit "WIP"** sur la branche feature avec préfixe `wip:` (sera squashé à la PR).

---

## 6. Règle save (non négociable)

Tout champ ajouté dans `INITIAL_HERO`, `INITIAL_WORLD` ou `INITIAL_META` doit déclencher :

1. **Migration dans `loadGame()`** — garantir une valeur par défaut pour les vieilles saves
2. **Test de régression** dans `gameStore.test.js` (section "Migration save")
3. **Incrément `saveVersion`** dans le JSON sauvegardé (à introduire avec TECH02)

Pattern :
```js
// gameStore.js — loadGame
const migratedHero = {
  ...INITIAL_HERO,            // socle complet (anti-crash sur tout nouveau champ)
  ...hero,                    // valeurs préservées de la save
  newField: hero.newField ?? defaultValue,  // ajout explicite
}
```

```js
// gameStore.test.js — section régression
it('migration : ajoute newField avec valeur par défaut si absent', () => {
  const oldSave = { hero: { ...INITIAL_HERO }, world: …, meta: … }
  delete oldSave.hero.newField
  localStorage.setItem('roguelite_save', JSON.stringify(oldSave))
  useGameStore.getState().loadGame()
  expect(useGameStore.getState().hero.newField).toBe(defaultValue)
})
```

**Bug à anticiper** : si tu ajoutes un champ tableau (`activeSkills: []`) ou objet (`equipped: {}`), une vieille save qui ne l'a pas crash sur `.length` ou `.weapon`. Toujours utiliser `Array.isArray(...)` ou la fusion `{ ...defaultObj, ...savedObj }`.

---

## 7. Process de Pull Request

### Pour `feat/<ID>` → `dev`

1. Push la branche : `git push -u origin feat/<ID>`
2. Ouvrir la PR sur GitHub : base `dev`, compare `feat/<ID>`
3. **Title** : `<TYPE>(<scope>): <description>` (même convention que les commits)
4. **Description** :
   - Lien vers le ticket dans TASKS.md
   - Liste des changements clés
   - Comment tester (étapes manuelles)
   - Screenshots si UI
5. **Auto-review** : relire le diff dans GitHub avant de merger
6. **Squash merge** vers `dev`

### Pour `dev` → `master` (release)

1. Vérifier que `dev` a une suite de features cohérente (pas un mix incomplet)
2. Mettre à jour `CHANGELOG.md` : déplacer `[Unreleased]` vers `[v0.X.Y] - YYYY-MM-DD`
3. Ouvrir la PR `dev` → `master`
4. Merge classique (préserve l'historique)
5. Tag : `git tag v0.X.Y && git push --tags`

---

## 8. Outils & raccourcis

### Scripts npm

```bash
npm run dev            # Dev server avec HMR
npm test               # Vitest watch (TDD)
npm run test:run       # Vitest single run (CI / fin de session)
npm run test:coverage  # Vitest single run + rapport de couverture (seuil 80% lignes)
npm run build          # Build prod (vérifier avant merge)
npm run lint           # ESLint check
npm run format         # Prettier --write (reformate tout le repo)
npm run format:check   # Prettier --check (échoue si un fichier n'est pas formaté)
npm run preview        # Preview du build prod
```

### Formatage automatique (Prettier + EditorConfig) — DEVBP01

Le projet utilise **Prettier** comme unique source de vérité du formatage. La config est dans
`.prettierrc.json` (no semicolons, single quotes, `printWidth: 100`, `trailingComma: all`).
ESLint ne gère **plus** le formatage : `eslint-config-prettier` (dernier de `eslint.config.js`)
désactive toute règle de style conflictuelle. ESLint reste responsable de la **qualité** (bugs,
hooks, imports inutilisés), Prettier de la **mise en forme**.

`.editorconfig` aligne les éditeurs (UTF-8, LF, indentation 2 espaces, newline finale). `.prettierignore`
exclut le build, les assets, et les docs à mise en forme manuelle (`*.md`, `*.txt`, `*.csv` — tableaux
ASCII de `TASKS.md` à préserver).

> Ne reformate jamais à la main : laisse `npm run format` (ou le hook pre-commit) s'en charger.

### Hook pre-commit (husky + lint-staged) — DEVBP01

Un hook **pre-commit** (`.husky/pre-commit`) lance **lint-staged** sur les fichiers _stagés_ uniquement :

| Fichiers stagés | Actions |
|---|---|
| `**/*.{js,jsx}` | `eslint --fix` puis `prettier --write` |
| `**/*.{css,json,html}` | `prettier --write` |

Le hook s'installe automatiquement via le script `prepare` (`husky`) au `npm install`. Si les hooks
ne se déclenchent pas après un clone, relancer `npm run prepare`. Les fichiers corrigés sont
re-stagés automatiquement avant le commit. Le hook ne lance **pas** la suite de tests (trop lent par
commit) — `npm run test:run` reste à la checklist de fin de session (§5) et/ou en CI.

### GitKraken (workflow recommandé)

- **Créer une feature branch** : clic droit sur `dev` → "Branch from here..." → `feat/<ID>`
- **Stage** : panneau droit, cocher les fichiers (ou "Stage all")
- **Commit** : message en bas, bouton "Commit"
- **Push** : bouton Push en haut (premier push : "-u origin <branch>")
- **PR** : GitKraken propose un lien direct vers GitHub après push

### Gemini Nano Banana 2 (génération de portraits monstres)

Voir `public/monsters/README.md` pour le master prompt et les 23 descriptions de monstres.

---

## 9. Décisions architecturales (ADRs)

Les décisions structurantes sont documentées dans **`CONTEXT.md` §11**. Avant de proposer une refonte majeure (changement de framework, refonte d'un système), créer un nouvel ADR avec :
- Date
- Problème ou choix à arbitrer
- Options considérées
- Décision retenue
- Conséquences

---

## 10. Ressources

- `TASKS.md` — backlog source de vérité
- `CONTEXT.md` — état du projet, ADRs, processus condensé
- `CHANGELOG.md` — historique versions
- `ROADMAP.csv` — liste originale 60 items (lecture seule, archive)
- `balance/combat_stats.csv` — stats monstres calculées (×zone × run scaling)
- `public/monsters/README.md` — guide génération portraits

---

## Questions ouvertes / à formaliser

- **Branche `release/*`** ? Pour stabiliser une version avant merge master. Pas mis en place pour le moment (équipe solo, friction inutile).
- **Automatisation** ? Pas de CI GitHub Actions pour l'instant (ticket DX-CI01). À considérer en v1 si le projet grossit (`npm run lint` + `npm run test:run` + `npm run build` à chaque PR).
- ~~**Pré-commit hook** ?~~ ✅ Fait (DEVBP01) : `husky` + `lint-staged` installés, hook pre-commit actif (eslint --fix + prettier sur les fichiers stagés). Voir §8.
