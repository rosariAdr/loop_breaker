# Loop Breaker — Roguelite Idle RPG

Un **Roguelite Idle RPG dark-medieval** avec transmigration entre univers. Le héros meurt souvent ; à chaque mort il choisit ce qu'il emporte (1 stat + 1 skill actif + 1 skill passif) et renaît dans un nouveau monde via la **Boutique des Dieux**.

> **État : POC complet et gagnable de bout en bout** (la win condition — tuer le Demon Lord Malachar — est implémentée). Pré-alpha, solo dev.

## Stack

React 19 · Vite 8 · Zustand 5 · TailwindCSS 4 · Vitest 4 — **JavaScript pur (pas de TypeScript)**.

## Démarrer

```bash
npm install
npm run dev        # http://localhost:5173
npm run test:run   # 729 tests (~7s)
npm run build      # dist/
npm run lint
```

## Boucle de jeu

Explorer une zone → combattre (tour par tour, skills, effets de statut) → loot/XP → finir un donjon (boss) → mourir → transmigrer (héritage + Boutique des Dieux) → recommencer plus fort. Idle déblocable, crafting via mini-jeux (alchimie/forge), 3 divinités aux conditions d'éveil cachées, skill signature **Gluttony** (absorption permanente de stats).

## Documentation (à lire dans cet ordre)

| Fichier | Rôle |
|---|---|
| **[CONTEXT.md](CONTEXT.md)** | ⭐ État complet du projet, architecture, systèmes, prochaines étapes. Le point d'entrée. |
| **[TASKS.md](TASKS.md)** | Backlog source de vérité (À trier / Someday v0.1/v1/v2 / Done). |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | Workflow Git, Definition of Done, conventions, règle de migration des saves. |
| **[CHANGELOG.md](CHANGELOG.md)** | Historique des versions (Keep a Changelog + SemVer). |
| **[DESIGN.md](DESIGN.md)** | Specs de game design validées (effets de statut, etc.). |
| **[PLAYTESTS.md](PLAYTESTS.md)** | Journal de playtest structuré. |

## Déploiement (Vercel — alpha privée)

Loop Breaker est une **SPA 100 % client-side** (React + Vite, pas de backend, saves en `localStorage`).

**Réglages Vercel (dashboard) :**

| Réglage | Valeur |
|---|---|
| Framework preset | **Vite** |
| Install command | `npm install` |
| Build command | `npm run build` (→ `vite build`) |
| Output directory | `dist` |

- **Routing SPA** : `vercel.json` réécrit toutes les routes vers `/index.html` (pas de 404 au refresh / sur les deep links).
- **Alpha PRIVÉE** : activer **Vercel Authentication** dans le dashboard (Settings → Deployment Protection) pour restreindre l'accès. Le durcissement réel (backend, autorité serveur, comptes/rôles) est repoussé à plus tard (cf. `SEC02`).
- **Secrets** : ⚠️ **ne JAMAIS committer de secret** — tout le bundle est public côté client. Une variable destinée au client doit être préfixée `VITE_` et déclarée dans Vercel → Settings → Environment Variables. (À ce jour : aucune variable d'env requise.)

> ⚠️ **Assets (`public/`) — prérequis avant un déploiement avec visuels.** Le dossier `public/` (carte, sprites héros, monstres, bâtiments, favicon) est **gitignoré** (taille + licences) → il **n'est pas dans le repo**, donc un build Vercel servirait l'app **sans ces visuels** (la carte et l'avatar n'ont pas de fallback ; monstres/bâtiments/portraits retombent sur emoji/placeholder). Le `npm run build` local fonctionne car `public/` existe en local. **Décision à prendre avant la 1re mise en ligne** : (a) committer tout/partie de `public/` (optimiser d'abord les PNG lourds via squoosh, vérifier les licences — OK pour une alpha privée), ou (b) prévoir une livraison d'assets séparée. Cf. `CONT05`.

## Architecture (résumé)

- `src/data/` — données pures immuables (monstres, skills, zones, équipement, recettes, debuffs, titres).
- `src/engine/` — logique pure testable sans React (combat, mécaniques de boss, gluttony).
- `src/store/` — Zustand (`gameStore` principal + `toastStore`), avec save/migration localStorage.
- `src/screens/` + `src/components/` — UI React.
- `src/**/*.test.*` — 729 tests (TDD).

Voir **CONTEXT.md §3** pour la carte des fichiers détaillée.
