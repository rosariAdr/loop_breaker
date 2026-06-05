# CONTEXT — Roguelite Idle RPG ("Loop Breaker")

> **Comment utiliser ce fichier** : copier-coller (ou attacher) dans une conversation Claude Chat ou Claude Code pour reprendre le projet. Self-contained — un Claude sans contexte peut le lire en 5 min et comprendre l'état complet. **Mettre à jour à chaque fin de session.** Backlog détaillé : `TASKS.md`. Historique : `CHANGELOG.md`. Specs de design : `DESIGN.md`.

**Dernière mise à jour : 2026-06-01** — après les Batches M, P, N, O (branche `feat/batch_MtoR`).

---

## 1. Pitch

**Roguelite Idle RPG dark-medieval avec transmigration entre univers.**

- Le héros meurt souvent. À chaque mort, il choisit ce qu'il emporte (1 stat + 1 skill actif + 1 skill passif) et renaît dans un nouveau monde via la **Boutique des Dieux**.
- Loop principal : explorer une zone → combattre des monstres → gagner XP/loot → finir un donjon (boss) → mourir → transmigrer → recommencer plus fort.
- 4 univers prévus (medieval fantasy, wushu, tower, post-apo Hokuto No Ken). **POC actuel : medieval fantasy uniquement**.
- Public : joueur PC, sessions de 10-30 min, progression méta entre les runs.
- **État : POC complet et gagnable de bout en bout.** La win condition (tuer le Demon Lord Malachar) est implémentée. Pré-alpha solo dev.

---

## 2. Stack & comment lancer

- React 19 + Vite 8 + Zustand 5 + TailwindCSS 4 + Vitest 4 + React Testing Library
- **JavaScript pur (pas de TypeScript)** — choix du dev (voir ADR-002)
- Windows 10, dev local

```bash
npm install           # une fois
npm run dev           # localhost:5173
npm test              # vitest watch (TDD)
npm run test:run      # vitest single run (CI / fin de session)
npm run build         # dist/ — vérifier avant tout merge
npm run lint          # ESLint check
```

**État technique (2026-06-01)** :
- **729 tests** dans **29 fichiers**, durée ~7s — tous verts
- Build prod : **~415 KB JS / ~117 KB gzipped**
- ESLint : **0 erreur**, 4 warnings intentionnels (`react-hooks/exhaustive-deps` sur les `useEffect` run-once de `App.jsx`)

---

## 3. Architecture (carte des fichiers)

```
src/
├── App.jsx                     # Routeur d'écrans + NavBar + DayBar + intercepts modales (DivineCall, LevelUp…)
│                               # + <ToastContainer/> + <DebugPanel/> (DEV) + wrapper anim-screen-fade (U04)
├── main.jsx                    # Entry Vite
├── index.css                   # Tailwind + animations (.anim-shake/-flash/-pop/-float, screen-fade-in, hero-attack)
├── data/                       # Données pures, immuables — aucun state React
│   ├── monsters.js             # 23 entrées dont 3 boss (Crypt Keeper, Lord of the Forsaken, Malachar) + bossMechanics
│   ├── skills.js               # 31 skills (dont 4 divins, soul_rend suprême, reckless_blow B10, gluttony passif O)
│   ├── deities.js              # 3 divinités (Ignareth/Sylvara/Voltaris) + applyDeityBlessing + checkXxxAwakening + DIVINE_RELATIONS + ACTIVE_DEITIES
│   ├── quests.js               # 8 quêtes + 3 NPCs
│   ├── equipment.js            # Templates (9) + RARITY_TIERS/RARITY_CONFIG + canCraft + createEquipmentInstance
│   ├── resources.js            # Drops + 8 consommables (potions, rations, antidote) + RARITY_COLORS
│   ├── zones.js                # ZONES (3) + huntingSpots + scaleMonsterStats + ZONE_ORDER + getMonsterLevel (B12)
│   ├── debuffs.js              # [CRF01] 4 debuffs passifs (Burnt Hands/Poisoned/Fatigue/Black Smoke)
│   ├── recipes.js              # [Z04/Z06] ALCHEMY_RECIPES (6) + MASTER_RECIPES (5 Rare/Epic)
│   └── titles.js               # [M01] TITLES permanents (first_steps, demon_lord_slayer, malachar_bane)
├── engine/                     # Logique pure sans état React — tout testable sans mock
│   ├── combat.js               # damage/skills/coûts, drops, buildEnemy, generateEnemies (B03), enemyAI, awakening,
│   │                           # B05 statuts (tickStatusEffects/applyStatusEffect/getEffectiveStats/canHeal/isStunned),
│   │                           # B10 getStatSacrifice, B12 isEnemyTooStrong, getEnemyCount
│   ├── bossMechanics.js        # [N] getMalacharPhase (BSS03), getCryptKeeperEnrage (BSS01), rollCursedStrike (BSS02)
│   └── gluttony.js             # [O] rollGluttonyProc, pickGluttonyStat, gluttonyAbsorbAmount, isGluttonyReady, hasGluttony
├── store/
│   ├── gameStore.js            # Zustand principal : { hero, world, meta, currentScreen, activeCombat, ... }
│   │                           # 60+ actions + saveGame/loadGame avec migration (runMigrations, SAVE_VERSION=2)
│   └── toastStore.js           # [U01] Store Zustand séparé pour les toasts (8 types, auto-dismiss)
├── screens/
│   ├── WorldMap.jsx / WorldMapCanvas (MAP01 Canvas 2D, rAF, DPR-aware) + QTE déplacement (MAP02)
│   ├── ZoneView.jsx            # Liste monstres, Fight (generateEnemies B03) / Idle (5 kills), SkillDropPreview (S02)
│   ├── Combat.jsx              # Arène multi-ennemis : statuts B05, bossMechanics, Gluttony (proc/assassinat + modal), debuffs
│   ├── HeroSheet.jsx           # Stats + équipement + skills + Active Debuffs (CRF05) + Titles (M01) + Gluttony (GLT03)
│   ├── Inventory.jsx           # Mana Stones (stack S03) / Equipment / Consumables / Resources
│   ├── SafeZone.jsx            # Inn / Church / Merchant / Blacksmith / **Alchemist (Z04)** / **Master Smith (Z06)** / Knight Trainer
│   ├── QuestBoard.jsx          # Active/Available/Completed + barres (Q02) + rang aventurier (Q06)
│   ├── PostMortem.jsx / GodsShop.jsx / DivineCall.jsx / CharacterCreation.jsx / LevelUpModal.jsx
├── components/
│   ├── ErrorBoundary.jsx (TECH01) · Tooltip.jsx (UX01) · ConfirmDialog.jsx (UX03)
│   ├── QTEBar.jsx (MAP02) · CraftingMinigame.jsx (CRF02/03) · ToastContainer.jsx (U01) · DebugPanel.jsx (PROC06, DEV)
├── utils/
│   ├── manaStones.js (S03) · debuffs.js (CRF01) · crafting.js (CRF04 : scoreToTier/resolveCraftOutcome/alchemyQuantity)
└── test/setup.js               # Mock localStorage + RTL globals

public/monsters/                # PNG portraits (5/23 + fallback emoji) + README pipeline

racine/
├── TASKS.md          # Backlog source de vérité (milestones v1/v1.1/v1.5/v2 + Done)
├── CONTRIBUTING.md   # DoD par type, workflow Git, conventions, règle save, checklist fin de session
├── CHANGELOG.md      # Historique (Keep a Changelog + SemVer) — [Unreleased] = Batches A→O
├── DESIGN.md         # Specs de design validées (§B05-SPEC effets de statut)
├── PLAYTESTS.md      # Journal de playtest structuré (PROC05)
├── balance/combat_stats.csv + drops_summary.csv (PROC04) · scripts/generate-balance-csv.mjs
├── README.md         # ⚠️ encore le template Vite par défaut — à remplir (pitch + setup)
└── package.json · vite.config.js · eslint.config.js
```

### Conventions de nommage
| Élément | Convention | Exemple |
|---|---|---|
| Composant React | PascalCase | `HeroCard.jsx`, `CraftingMinigame.jsx` |
| Action Zustand | camelCase verbe+objet | `acceptDeity`, `absorbGluttony`, `addHeroDebuff` |
| Constante data | SCREAMING_SNAKE_CASE | `ALCHEMY_RECIPES`, `RARITY_CONFIG` |
| Fonction engine | camelCase verbe+objet | `getMalacharPhase`, `tickStatusEffects` |
| ID en data | snake_case | `ashwood_wolf`, `reckless_blow` |
| ID ticket | PREFIXE + numéro | `BSS03`, `GLT02`, `CRF04` |

---

## 4. Systèmes de jeu — état détaillé

### WorldMap — carte illustrée & coordonnées des nodes (UI02)
- Le fond de la WorldMap est une **carte illustrée** : `public/map/eldenmoor.png` (16:9, `object-fit: cover`), avec un voile sombre radial léger par-dessus pour le contraste. *(asset local-only — `public/` gitignoré.)*
- **Les positions des 9 lieux sont en COORDONNÉES RELATIVES (%)** du conteneur de carte (table `POS` dans `src/screens/WorldMap.jsx`), calées sur l'illustration. Le scaler 1920×1080 étant uniforme, les % restent alignés à toute échelle.
- **Si la carte de fond est remplacée**, il suffit de réajuster **ce seul tableau de 9 coordonnées** — aucune autre logique n'est impactée (navigation, déblocages, héros, trails dérivent tous de `POS` + du graphe d'adjacence `EDGES`).

  | Lieu | x% | y% | | Lieu | x% | y% |
  |---|---|---|---|---|---|---|
  | Greywatch | 13 | 16 | | Thornmarsh | 34 | 79 |
  | Ashenvale Forest | 43 | 16 | | Barrow Hills | 49 | 86 |
  | Millhaven | 41 | 41 | | Hollow Crypt (donjon) | 64 | 81 |
  | Ironhaven | 60 | 56 | | Grimspire (locked) | 90 | 45 |
  | Crumbled Ruins | 17 | 55 | | | | |

- **Trails** : tracés selon le **graphe d'adjacence** `EDGES` (source de vérité, indépendant des chemins dessinés sur l'image), en SVG à coordonnées %. La Blighted Road (Ironhaven → Grimspire) reste un liseré rouge avec QTE.
- **Marqueurs** : discrets (anneau + plaque de nom) pour ne pas masquer l'illustration ; états préservés — locked (désaturé + cadenas), donjon (glow violet pulsant), safe (halo vert ville / sage village).

### Combat (tour par tour)
- **Implémenté** : multi-ennemis 1-3 (B03, count par zone/rang), attaque + skills + items + flee, animations, floating numbers, cooldown overlay, ciblage.
- **Effets de statut (B05)** : poison/burn (DoT), stun (saut de tour), slow + *_down (modificateurs de stats) ; max 2 actifs ; icônes sur cartes ; burn bloque le soin. Moteur pur dans `combat.js`.
- **Mécaniques de boss (N, version allégée)** : Malachar 3 phases (Rage +50% ATK, Soul Drain) ; Crypt Keeper enrage à 50% ; Lord of the Forsaken Cursed Strike (STR−20%). **Fidélité complète différée → BSS01b / BSS02b** (invocation réelle de 2 adds, armure régénérante).
- **Sacrifice de stat (B10)** : `cost.stat_sacrifice` (skill `reckless_blow`).
- **Manque** : ATB (B06, v2), combat à la Pokémon multi-cartes raffiné (U09).

### Skills
- 6 actifs max / 4 passifs max. 3 niveaux. Stack des doublons (S03), contenant cosmétique par univers (S06), aperçu skills ennemis (S02). 31 skills dont gluttony (passif suprême).

### Idle
- 5 kills → idle débloqué. Tick 3s. Auto-désactivation HP<20%. Toasts (I04). **B12** : combat manuel forcé si monstre trop fort (niveau > hero+5).
- **Manque** : choix joueur avant idle (I08).

### Crafting & artisans (Batch P)
- **Debuffs passifs (CRF01)** : 4 debuffs (jours), décrément au sommeil, réduction de stats en combat, affichage HeroSheet (CRF05).
- **Mini-jeux (CRF02/03)** : alchimie (dosage) + forge (3 frappes) → `scoreToTier` → `resolveCraftOutcome` (parfait +2 rareté … catastrophe = debuff permanent).
- **Bâtiments** : Alchimiste (Z04, 6 potions, qualité=quantité) + Maître forgeron (Z06, 5 Rare/Epic, spawn 10% village).
- **Manque** : CRF06 (antidote qui soigne les debuffs — `antidote_basic` existe déjà, reste à brancher `cureDebuffs`), Q05 (quêtes craft).

### Quêtes
- 8 quêtes, 3 NPCs, barres de progression (Q02), rang aventurier (Q06).
- **Manque** : types `visit`/`craft` (Q04/Q05), 10 nouvelles quêtes (NPC02), système de dialogue NPC (NPC01).

### Divinités
- **3 actives** : Ignareth (20 victoires/5j, +15% STR), Sylvara (85% HP × 8, regen), Voltaris (5 victoires <30% HP, +20% AGI). Conditions cachées (ADR-006). Fidélité inter-run (DV03), refus = run solo (DV07).
- **Manque** : aura divine visuelle (DV05), relations dynamiques (DV11/DV12, v2).

### Transmigration & Boutique des Dieux
- `heroDeath` → PostMortem → héritage → GodsShop → `applyTransmigration` → Run N+1. Économie tokens calibrée (BAL01).
- **GLT01** : les `meta.permanentStatBoosts` (Gluttony) sont réinjectés à chaque transmigration.
- **Manque** : transmigration animée (T02), socle universel écran dédié (T05), Soul Rend toujours-héritable (T12).

### Win condition (Batch O — BOUCLÉE)
- **Malachar the Undying** (Demon Lord, Grimspire) : combat 3 phases (BSS03) → drop **Soul Rend** garanti + **200 tokens** (W01) + titres permanents **Demon Lord Slayer / Malachar's Bane** (T13). Ressuscite après 4 transmigrations.
- **Gluttony (GLT01-04)** : passif d'absorption permanente de stats (proc 10% / cooldown 5j ; assassinat = garanti + choix de la stat).

### Titres permanents (M01)
- `meta.titlesEarned` (persistent entre runs), action `awardTitle`, affichage HeroSheet.

### Inventory / Equipment / Calendar / Donjons / Save
- 4 slots équipement, mana stones, resources, consumables. Calendrier 24 ticks/jour, sleep (restore + spawn donjons + **tick debuffs CRF01**), church pray (1 tick CAL01).
- Donjons : `world.dungeons[zoneId] = { active, cleared, position, discovered }`, loot exclusif (D04), warp sortie (D05), idle interdit (D07). **Manque** : flux 5 salles path map (D01), carte donjon (D03), respawn nuit (D06).
- Save : localStorage `roguelite_save`, migration robuste (`runMigrations`, SAVE_VERSION=2). **Règle non négociable** : tout champ `INITIAL_*` → ligne de migration + test.

---

## 5. Contenu actuel

| Élément | Quantité | Détails |
|---|---|---|
| Zones | 3 | Ashenvale (4 spots) + Blighted Road + Grimspire |
| Spots de chasse | 6 | + levelRange par spot (utilisé par B12) |
| Monstres / boss | 23 | dont Crypt Keeper, Lord of the Forsaken, Malachar (+ bossMechanics) |
| Skills | 31 | dont 4 divins, soul_rend (suprême), reckless_blow (sacrifice), gluttony (passif) |
| Divinités actives | 3 | Ignareth / Sylvara / Voltaris |
| Debuffs passifs | 4 | Burnt Hands / Poisoned / Fatigue / Black Smoke (CRF01) |
| Recettes | 6 + 5 + ~10 | alchimie (Z04) + maître forgeron (Z06) + forge de base |
| Consommables | 8 | hp/mana small+medium, stamina_ration, elixir_minor, mana_crystal, antidote_basic |
| Titres permanents | 3 | first_steps, demon_lord_slayer, malachar_bane |
| Articles boutique | 6 | rank_restore, bonus_skill, bonus_stat, skill_levelup, starter_kit, oracle |
| Portraits monstres | 5/23 | reste en fallback emoji |

---

## 6. Tests (729 total, 29 fichiers, ~7s)

```
engine/        combat.test.js · bossMechanics.test.js · gluttony.test.js
store/         gameStore.test.js · toastStore.test.js
utils/         crafting.test.js · debuffs.test.js · manaStones.test.js
data/          deities · quests · equipment · resources · containers · recipes (.test.js)
screens/       Combat · DivineCall · GodsShop · QuestBoard · WorldMapCanvas · ZoneView · screens (.test.jsx)
components/    ErrorBoundary · Tooltip · ConfirmDialog · QTEBar · CraftingMinigame · ToastContainer · DebugPanel (.test.jsx)
racine/        scenarios.test.js (parties simulées + BAL01)
```

**Politique** : feature M/L = test unitaire + test fonctionnel store (+ scénario si boucle) ; feature UI = smoke RTL + flux critique ; bug fix = test de régression AVANT le fix. Cible : ~90% sur `engine/` et actions `gameStore.js`. Les mini-jeux/Canvas/rAF sont testés via leurs **helpers purs** (le rendu en smoke).

---

## 7. Done — historique des batches

- **v0** (16) + **v0.1 polish** (6) + **v0.1 mégabatch** (16) — avril 2026 : base jouable.
- **Batch A+B** : robustesse (Error Boundaries, save versioning), calendrier, quêtes UI.
- **Batch C+D** : UX/tooltips, WorldMap Canvas 2D, QTE.
- **Batch E+F** : donjons (loot exclusif, warp), balance tokens, win condition (Malachar counter).
- **Batch G+H+I+J+L** : cleanup v0.1, système de toasts, tutorial hints, skills polish, Voltaris (3e divinité).
- **Batch M** (combat) : effets de statut (B05), sacrifice de stat (B10), combat forcé idle (B12), multi-ennemis (B03).
- **Batch P** (crafting) : debuffs (CRF01), mini-jeux (CRF02/03), rareté (CRF04), affichage (CRF05), alchimiste (Z04), maître forgeron (Z06).
- **Batch N** (boss & titres) : titres permanents (M01, T13), mécaniques boss allégées (BSS01/02/03).
- **Batch O** (POC bouclé) : Gluttony (GLT01-04) + Malachar POC (W01).

> Détail ticket par ticket : section **Done** de `TASKS.md`. Git : `feat/batch_MtoR` — **M+P+N committés** ; **Batch O encore en working tree (à committer)**. Avant ces batches, `dev` était à jour via les PR A→L.

---

## 8. Prochaines étapes (roadmap par milestones)

> `TASKS.md` a été réorganisé (2026-06-03) en **milestones versionnés** : `v1` (POC figé) → `v1.1` (présentable) → `v1.5` (profondeur) → `v2` (ambition). Ce §8 en est le résumé ; le détail (AC, estimations, dépendances, décisions chiffrées) est dans `TASKS.md`.

### 🅰️ v1 — Stabilisation avant de figer le POC
Le POC est **complet et gagnable**. Reste : **BAL02** (difficulté boss + playtest), **BAL03** (rythme idle), **TECH04** (60fps Canvas), **TECH05** (JSDoc engine). Voir `PLAYTESTS.md`.

### 🅱️ v1.1 — UI parchemin, sprites & QoL (rendre présentable)
Gros chantier visuel — **spec complète dans `UI_HANDOFF.md`** (design system "parchemin" diégétique type Dragon Quest, stage 1920×1080, tokens CSS canoniques, 6 écrans, 2 couches d'assets, animations). À faire d'un bloc pour la cohérence :
- **UI01-09** : design system + shell, puis WorldMap / SafeZone / ZoneView / NPC overlay / HeroSheet / Inventory restylés, sprites en dernier (absorbe les anciens U06/U08-U12).
- **Assets** : CONT01 (portraits monstres), CONT05 (ASSETS.md + licences), C03 (portraits perso).
- **QoL** : IDLE-OFF (progression hors-ligne), SET01 (menu options), TECH07 (export/import save), PROC07 (debug give-stats).

### 🅲️ v1.5 — Profondeur & contenu (ordre acté : NPC → STA → PROG)
- **Bloc NPC & vie urbaine** : NPC01/NPC04 (dialogue), TAV01 (informateurs), GLD01/GLD02 (guilde ville / quêtes village), SKL01 (skills jusqu'à Lv5), ACA01-04 (Académie), BLD01 (horaires, taverne 24/7). **Décisions chiffrées dans TASKS (blocs `DÉCIDÉ`).**
- **Bloc nouvelles stats** : STA01 Fatigue/vigueur (paliers de malus), STA02 Aura (multiplicateur de dégâts), STA03 Concentration (qualité craft), + STA03b/STA04/TRA01/ITM01. **Formules actées dans TASKS.** ⚠️ Collision de nom "Fatigue" (stat STA01 vs debuff CRF01) à régler.
- **Bloc progression** : PROG01-03 (déblocage progressif des zones + fog of war, départ restreint).
- **Contenu complémentaire** : CODEX01 (bestiaire), ACH01 (succès à bonus méta), CRF06 (antidote cure), NPC02/Q04/Q05/Q09 (quêtes), D01/D03/D06 (donjons complets), T02/T05/T12 (transmigration), Z07, I08, TUT01.

### 🅳️ v2 — Refonte / ambition
Compagnons (CMP01-09), événements aléatoires (EVT01-03), Foyer (HOME01a/b/c), ATB combat (B06), WorldMap PixiJS (MAP03), **fidélité boss complète (BSS01b/BSS02b)**, multi-univers (X08/X09), divinités avancées (DV05/11/12), historique runs (HIS01/02), SFX (U05), responsive (U02), feature flags, codex de lore.

> **Pour planifier avec Claude Chat** : attacher `TASKS.md` (backlog complet, milestones + décisions) + ce CONTEXT.md.

---

## 9. Décisions actées (game design)

### Décisions historiques (toujours valides)
- **T07** → T07b : sélection skill bonus dans GodsShop (skills des runs précédents, fallback Zone 1).
- **D01 — Flux donjon** : path map (Entrée → choix → Boss, 5 nœuds). *(Pas encore implémenté — voir §8.)*
- **U01 — Toasts** : store Zustand dédié, pas de lib. ✅ fait.
- **Multi-univers (X08, v2)** : `currentUniverse` + `universeHistory[]`, data namespaced `src/data/universes/{id}/`.
- **Économie tokens (BAL01)** : run typique ~7-8 tokens ; coûts révisés (starter_kit 5, skill_levelup 12, rank_restore 25, skill/stat_bonus 50, oracle 8).
- **Fin du POC après Malachar** : transport + titre + Gluttony. ✅ implémenté (Batch O).
- **Combat balance** : EN ATTENTE PLAYTEST (BAL02) — hypothèse : boss Lv3 nécessitent skill divin + équipement rare.

### Décisions de grooming "Vie urbaine" + stats (2026-06-01 → 06-03)
Toutes chiffrées dans `TASKS.md` (blocs `DÉCIDÉ` du milestone **v1.5**) : répartition auberge/guilde, contreparties informateurs (mana stone), formule ACA03 (`prix×1.15^(n−1)`), Fatigue (coûts −3/combat… + paliers), Aura (+X/2% dégâts/point, unlock 15 skills/<4j), Concentration (0-150 → chance de cran de rareté), STA04 (atténuation croisée), etc.

### Boss mechanics (Batch N) : version allégée actée
Les 3 boss ont une mécanique **réelle mais simplifiée** ; la fidélité lourde est tracée (BSS01b/BSS02b). Choix assumé pour boucler le POC vite (demande du dev).

---

## 10. Processus de développement

### Git
```
master (stable, taggué) ← dev (intégration) ← feat/ID (features M/L)
```
Convention : `type(scope): description` (feat/fix/test/refactor/chore/docs/style/perf). **Pas de footer co-authoring** (préférence dev). Après merge `dev → master`, fast-forward `dev`. Le dev commite lui-même via GitKraken — Claude **ne commite pas**, il propose le message.

### Checklist fin de session (obligatoire)
```
□ npm run test:run → vert    □ npm run build → OK    □ npm run lint → OK
□ TASKS.md (Done + date)     □ CONTEXT.md (si système)    □ CHANGELOG.md
□ Pas de console.log oublié
```

### Definition of Done — résumé
| Type | Minimum |
|---|---|
| Feature gameplay | Code + test unitaire + test fonctionnel + migration save si besoin |
| Feature UI | Code + smoke test RTL + pas de régression |
| Bug fix | Test de régression AVANT le fix + vérif vieille save |
| Refacto | Tests existants verts + bundle stable |
| Contenu data | Données + test de structure + compteurs CONTEXT.md |

### Règle save (non négociable)
Tout champ ajouté dans `INITIAL_*` → migration `loadGame()`/`runMigrations` + test de régression + (si schéma) incrément `saveVersion`.

### Workflow d'investigation
Quand le dev demande d'**analyser**, ne pas corriger directement. Regrouper bugs+features avant d'implémenter. Ne pas inventer de décisions de game design — demander.

---

## 11. Architecture Decision Records (ADR)

- **ADR-001** : Canvas 2D pour WorldMap (v0.1), PixiJS prévu en v2. ✅ Canvas fait.
- **ADR-002** : JavaScript pur, pas TypeScript. Mitigation : tests + JSDoc sur `engine/`.
- **ADR-003** : Zustand (pas Context/Redux). `gameStore` + `toastStore` séparés.
- **ADR-004** : localStorage pour save (pas de backend), versionée. Révisable en v2.
- **ADR-005** : Path map pour donjons (5 nœuds, choix tactiques). *(À implémenter — D01.)*
- **ADR-006** : Conditions d'éveil divin cachées (pas de jauge). Tests garantissent un boolean.
- **ADR-007** : Compagnons à personnalité dynamique (traits contextuels, followProbability formule). *(v1, à venir.)*
- **ADR-008** : Effets de statut data-driven (`statusEffect` sur les skills), moteur pur dans `combat.js`, max 2 actifs. Spec : `DESIGN.md §B05-SPEC`.
- **ADR-009** : Mini-jeux de crafting = composant `CraftingMinigame` (2 modes), scoring pur (`utils/crafting.js`) — testable sans timing.

---

## 12. Liens utiles dans le repo

- **`TASKS.md`** — backlog source de vérité (milestones v1 / v1.1 / v1.5 / v2 + Done) ⭐ le plus important pour planifier
- **`CONTRIBUTING.md`** — workflow Git, DoD, conventions, règle save, checklist
- **`CHANGELOG.md`** — historique (Keep a Changelog + SemVer)
- **`DESIGN.md`** — specs de design validées (§B05-SPEC)
- **`UI_HANDOFF.md`** — spec complète du design system UI parchemin (v1.1) : tokens, 6 écrans, assets, animations
- **`PLAYTESTS.md`** — journal de playtest (PROC05) pour BAL02/BAL03
- **`balance/*.csv`** + `scripts/generate-balance-csv.mjs` — équilibrage
- **`public/monsters/README.md`** — pipeline portraits

---

## 13. Suggestions de questions à poser à Claude Chat/Code

1. *"Voici CONTEXT.md + TASKS.md. Aide-moi à groomer le cluster 'Vie urbaine' (Q+R) : tranche les `⚠️ à chiffrer` restants et propose un découpage en batches implémentables."*
2. *"Le POC est bouclé (Malachar tuable). Quelle est la prochaine feature qui maximise le ressenti de jeu : compagnons (CMP), événements (EVT), ou la refonte UI (U08-U12) ? Argumente."*
3. *"Design en détail STA02 (Aura) et STA01 (Fatigue) : formules, seuils de déblocage, malus, intégration dans calcSkillDamage."*
4. *"Audit l'économie de tokens (BAL01) avec Gluttony + W01 (+200 tokens Malachar) maintenant en jeu. Le ratio tient-il ?"*
5. *"Prépare une grille de playtest (BAL02) pour valider la difficulté des 3 boss avec leurs nouvelles mécaniques (phases Malachar, enrage, Cursed Strike)."*
6. *"Faut-il monter BSS01b/BSS02b (fidélité boss complète) en priorité, ou laisser la version allégée et avancer sur le contenu ?"*
