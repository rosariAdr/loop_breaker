# CONTEXT — Roguelite Idle RPG ("Loop Breaker")

> **Comment utiliser ce fichier** : copier-coller (ou attacher) dans une conversation Claude Chat ou Claude Code pour reprendre le projet. Self-contained — un Claude sans contexte peut le lire en 5 min et comprendre l'état complet. **Mettre à jour à chaque fin de session.** Backlog détaillé : `TASKS.md`. Historique : `docs/CHANGELOG.md`. Specs de design : `docs/DESIGN.md`. *(Toute la doc est dans `docs/` — REORG01.)*

**Dernière mise à jour : 2026-07-03** (audit docs) — v1.2 clôturée, en cours v1.31 → v1.33 (branche `feat/v1.33_progression`). Store refactoré en slices (`REFAC01`).

---

## 1. Pitch

**Roguelite Idle RPG dark-medieval avec transmigration entre univers.**

- Le héros meurt souvent. À chaque mort, il choisit ce qu'il emporte (1 stat + 1 skill actif + 1 skill passif) et renaît dans un nouveau monde via la **Boutique des Dieux**.
- Loop principal : explorer une zone → combattre des monstres → gagner XP/loot → finir un donjon (boss) → mourir → transmigrer → recommencer plus fort.
- 4 univers prévus (medieval fantasy, wushu, tower, post-apo Hokuto No Ken). **POC actuel : medieval fantasy uniquement**.
- Public : joueur PC, sessions de 10-30 min, progression méta entre les runs.
- **État : jouable de bout en bout** (win condition — tuer le Demon Lord Malachar — implémentée). **v1 → v1.43 clôturées** (quêtes, skills-drops, progression, Tech/DX/Balance, Équipement & Craft unifié, Maîtres & mentors, UI critique, onboarding) ; **release `0.2.0` (2026-07-20)** = première `master` taggée. Pré-alpha solo dev.

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

**Hébergement v1 (DEPLOY01)** : **Vercel + Vercel Authentication** (alpha **privée**). SPA 100 % client-side (pas de backend ; saves `localStorage`). Routing SPA via `vercel.json` (rewrites → `/index.html`). Réglages : preset Vite · build `npm run build` · output `dist`. ✅ **`public/` est committé** (DEPLOY01) → assets servis par Vercel (`raw/` HD exclus). Le **durcissement réel** (backend, autorité serveur, comptes/rôles, anti-triche) est repoussé à une version ultérieure (cf. `SEC02`) — l'alpha privée s'appuie uniquement sur l'auth Vercel.

**État technique (2026-07-20, release 0.2.0)** :
- **2044 tests** dans **178 fichiers** — tous verts (`npx vitest run`) ; couverture lignes **84.83 %** (seuil ≥ 70 %). *(NB : un compte antérieur ~3437 était gonflé par un worktree résiduel `.claude/` doublonné — corrigé via DX-LINTIGNORE01.)*
- Build prod : **~570 KB JS / ~160 KB gzipped** (code-split : chunks Combat/GodsShop/Codex lazy)
- ESLint : **0 erreur** (`.claude/**` ignoré), quelques warnings intentionnels (`react-hooks/exhaustive-deps` sur des `useEffect` run-once)
- **Milestones livrés** : v1 (POC), v1.1 (UI parchemin + sprites + QoL), v1.2 (NPC→STA→PROG), **v1.31→1.33 (quêtes / skills-drops / progression)**, **v1.34 (Tech/DX/Balance)**, **v1.42 (Équipement & Craft — recettes unifiées `craftRecipes.js`)**, **v1.43 (Maîtres & mentors + itinérants)**, **UI critique (UI11/UI12)**, **onboarding**. **DEPLOY01** : repo prêt pour Vercel (alpha privée), `public/` committé. Reste backlog v1.41 (donjon), combat ATB (v1.44), design + univers.

---

## 3. Architecture (carte des fichiers)

```
src/
├── App.jsx                     # Routeur d'écrans + NavBar + DayBar + intercepts modales (DivineCall, LevelUp…)
│                               # + <ToastContainer/> + <DebugPanel/> (DEV) + wrapper anim-screen-fade (U04)
├── main.jsx                    # Entry Vite
├── index.css                   # Tailwind + animations (.anim-shake/-flash/-pop/-float, screen-fade-in, hero-attack)
├── data/                       # Données pures, immuables — aucun state React
│   ├── monsters.js             # bestiaire MON01 (4 spots Ashenvale × 4 dont 1 élite) + 3 boss + Grimspire + réserve
│   ├── skills.js               # skills actifs/passifs/divins (soul_rend suprême, gluttony) + techniques de bestiaire (MON01)
│   ├── deities.js              # 3 divinités (Ignareth/Sylvara/Voltaris) + applyDeityBlessing + checkXxxAwakening + DIVINE_RELATIONS + ACTIVE_DEITIES
│   ├── quests.js               # board + registre dynamique (getQuestById/isQuestCompleteState/questProgress)
│   │                           # + mainQuests.js (chaîne mq01→06, elite_turnin), churchQuests.js (CHQ01), masterQuests.js (ACA04), informants.js (TAV01), academy.js (ACA01), dialogues.js, hints.js
│   ├── equipment.js            # Templates (9) + RARITY_TIERS/RARITY_CONFIG + canCraft + createEquipmentInstance
│   ├── resources.js            # Drops + 8 consommables (potions, rations, antidote) + RARITY_COLORS
│   ├── zones.js                # ZONES + huntingSpots + node-locking (isNodeUnlocked/START_OPEN_NODES/getLocationType — PROG/START) + scaleMonsterStats + ZONE_ORDER
│   ├── debuffs.js              # [CRF01] 4 debuffs passifs (Burnt Hands/Poisoned/Fatigue/Black Smoke)
│   ├── recipes.js              # [Z04/Z06] ALCHEMY_RECIPES (6) + MASTER_RECIPES (5 Rare/Epic)
│   └── titles.js               # [M01] TITLES permanents (first_steps, demon_lord_slayer, malachar_bane)
├── engine/                     # Logique pure sans état React — tout testable sans mock
│   ├── combat.js               # damage/skills/coûts, drops, buildEnemy, generateEnemies (B03), enemyAI, awakening,
│   │                           # B05 statuts (tickStatusEffects/applyStatusEffect/getEffectiveStats/canHeal/isStunned),
│   │                           # B10 getStatSacrifice, B12 isEnemyTooStrong, getEnemyCount
│   ├── bossMechanics.js        # [N] getMalacharPhase (BSS03), getCryptKeeperEnrage (BSS01), rollCursedStrike (BSS02)
│   └── gluttony.js             # [O] rollGluttonyProc, pickGluttonyStat, gluttonyAbsorbAmount, isGluttonyReady, hasGluttony
├── store/                      # REFAC01 — Zustand découpé en slices
│   ├── gameStore.js            # compose les slices → { hero, world, meta, currentScreen, activeCombat, ... }
│   ├── slices/                 # heroSlice · worldSlice · metaSlice · combatSlice · questsSlice · idleSlice · saveSlice
│   ├── initialState.js         # INITIAL_HERO / INITIAL_WORLD / INITIAL_META + SAVE_VERSION
│   ├── migrations.js           # runMigrations / normalizeSave (backfill idempotent, anti-piège node FIX-START01, SAVE_VERSION=2)
│   ├── helpers.js              # utilitaires partagés entre slices
│   └── toastStore.js           # [U01] Store Zustand séparé pour les toasts (auto-dismiss)
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

public/monsters/                # PNG figurines (16/16 surface liés + boss en emoji) + README pipeline
public/buildings/               # façades (5/9 liées : inn/church/merchant/alchemy/blacksmith)

racine/
├── README.md          # Pitch, setup, déploiement
├── CONTEXT.md         # ⭐ ce fichier (état complet du projet)
├── TASKS.md           # Backlog source de vérité (milestones v1/v1.1/v1.2/v1.3/v1.4 + Done)
├── docs/              # 📁 toute la doc déplacée ici (REORG01) :
│   ├── CONTRIBUTING.md   # DoD par type, workflow Git, conventions, règle save, checklist
│   ├── CHANGELOG.md      # Historique (Keep a Changelog + SemVer)
│   ├── DESIGN.md         # Specs de design validées (§B05-SPEC effets de statut)
│   ├── PLAYTESTS.md      # Journal de playtest · ASSETS.md · ASSET_PROMPTS.md · UI_HANDOFF.md · CHAT_CONTEXT.md · balance/
├── balance/combat_stats.csv + drops_summary.csv (PROC04) + dashboard.html · scripts/*.mjs|.py
└── package.json · vite.config.js · eslint.config.js · vercel.json
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
- Le fond de la WorldMap est une **carte illustrée** : `public/map/eldenmoor.png` (16:9, `object-fit: cover`), avec un voile sombre radial léger par-dessus pour le contraste. *(committé — DEPLOY01 ; seules les sources `raw/` HD restent gitignorées.)*
- **Les positions des 9 lieux sont en COORDONNÉES RELATIVES (%)** du conteneur de carte (table `POS` dans `src/screens/WorldMap.jsx`), calées sur l'illustration. Le scaler 1920×1080 étant uniforme, les % restent alignés à toute échelle.
- **Si la carte de fond est remplacée**, il suffit de réajuster **ce seul tableau de 9 coordonnées** — aucune autre logique n'est impactée (navigation, déblocages, héros, trails dérivent tous de `POS` + du graphe d'adjacence `EDGES`).

  | Lieu | x% | y% | | Lieu | x% | y% |
  |---|---|---|---|---|---|---|
  | Greywatch | 13 | 16 | | Thornmarsh | 34 | 79 |
  | Ashenvale Forest | 43 | 16 | | Wildmere Hills | 51 | 89 |
  | Millhaven | 41 | 41 | | Hollow Crypt (donjon) | 68 | 83 |
  | Ironhaven | 60 | 56 | | Grimspire (locked) | 90 | 45 |
  | Crumbled Ruins | 21 | 59 | | | | |

  > Note : le fond utilise `background-size: 100% 100%` (l'image **remplit** le conteneur, pas `cover`) → les % de `POS` correspondent **1:1 à l'image**, alignés quel que soit le ratio. Léger étirement vertical (~10%) assumé sur la carte dessinée.

- **Trails** : tracés selon le **graphe d'adjacence** `EDGES` (source de vérité, indépendant des chemins dessinés sur l'image), en SVG à coordonnées %. La Blighted Road (Ironhaven → Grimspire) reste un liseré rouge avec QTE.
- **Marqueurs** : discrets (anneau + plaque de nom) pour ne pas masquer l'illustration ; états préservés — locked (désaturé + cadenas), donjon (glow violet pulsant), safe (halo vert ville / sage village).

### Combat (tour par tour)
- **Implémenté** : multi-ennemis 1-3 (B03, count par zone/rang), attaque + skills + items + flee, animations, floating numbers, cooldown overlay, ciblage.
- **Effets de statut (B05)** : poison/burn (DoT), stun (saut de tour), slow + *_down (modificateurs de stats) ; max 2 actifs ; icônes sur cartes ; burn bloque le soin. Moteur pur dans `combat.js`.
- **Mécaniques de boss (N, version allégée)** : Malachar 3 phases (Rage +50% ATK, Soul Drain) ; Crypt Keeper enrage à 50% ; Lord of the Forsaken Cursed Strike (STR−20%). **Fidélité complète différée → BSS01b / BSS02b** (invocation réelle de 2 adds, armure régénérante).
- **Sacrifice de stat (B10)** : `cost.stat_sacrifice` (skill `reckless_blow`).
- **Manque** : ATB (B06, v2), combat à la Pokémon multi-cartes raffiné (U09).

### Skills
- 6 actifs max / 4 passifs max. 3 niveaux. Stack des doublons (S03), contenant cosmétique par univers (S06), aperçu skills ennemis (S02). **50 skills** (dont 6 divins) dont gluttony (passif suprême).

### Idle
- 5 kills → idle débloqué. Tick 3s. **I08** : seuil de PV d'auto-stop configurable (20/35/50 %). Toasts (I04). **B12** : combat manuel forcé si monstre trop fort (niveau > hero+5).

### Crafting & artisans (Batch P)
- **Debuffs passifs (CRF01)** : 4 debuffs (jours), décrément au sommeil, réduction de stats en combat, affichage HeroSheet (CRF05).
- **Mini-jeux (CRF02/03)** : alchimie (dosage) + forge (3 frappes) → `scoreToTier` → `resolveCraftOutcome` (parfait +2 rareté … catastrophe = debuff permanent).
- **Bâtiments** : Alchimiste (Z04, 6 potions, qualité=quantité) + Maître forgeron (Z06, 5 Rare/Epic, spawn 10% village).
- **CRF06** : `antidote_basic` soigne les debuffs (`cureDebuffs` branché). **Concentration** (STA03) module la qualité de craft. Quêtes craft (Q05) branchées.

### Quêtes (v1.2 + v1.31)
- **Board venue-aware** : ville = **Guilde** (quêtes prestigieuses gardées par le rang Q06) ; village = **notice board** réduit + carte d'aventurier (GLD01/02). Registre dynamique `getQuestById` (board + église + maître + principale).
- **Types d'objectif** : `kill` / `level` / `visit` (Q04) / `craft` (Q05) / `skill_levelup` (ACA04) / `elite_turnin`. Progression comptée **en delta** via snapshot à l'acceptation (`world.questProgress`, FIX-QUESTSNAP01).
- **Chaîne de quête principale** (MQ-CHAIN01) : `mainQuests.js` mq01→mq06 (Greywatch → Millhaven → Ironhaven) ; chaque palier `unlocks` des nodes (= condition du node-locking START04). Dialogue NPC (NPC01) + informateurs (TAV01).
- **Quêtes d'église** en rotation 3 jours (CHQ01, tokens + consommables), **quêtes de maître** (ACA04), **10 quêtes de contenu** (NPC02).
- **À venir** : distinguer visuellement la quête principale (MQUI01), toast de progrès (QTOAST01), quêtes chronométrées (QSV2-TIMED01).

### Divinités
- **3 actives** : Ignareth (20 victoires/5j, +15% STR), Sylvara (85% HP × 8, regen), Voltaris (5 victoires <30% HP, +20% AGI). Conditions cachées (ADR-006). Fidélité inter-run (DV03), refus = run solo (DV07).
- **Manque** : aura divine visuelle (DV05), relations dynamiques (DV11/DV12, v2).

### Transmigration & Boutique des Dieux
- `heroDeath` → PostMortem → héritage → GodsShop → `applyTransmigration` → Run N+1. Économie tokens calibrée (BAL01).
- **GLT01** : les `meta.permanentStatBoosts` (Gluttony) sont réinjectés à chaque transmigration.
- **T02** transmigration animée (écran de renaissance), **T05** choix d'héritage (PostMortem : 1 stat + 1 actif + 1 passif), **T12** Soul Rend `alwaysInheritable`.

### Win condition (Batch O — BOUCLÉE)
- **Malachar the Undying** (Demon Lord, Grimspire) : combat 3 phases (BSS03) → drop **Soul Rend** garanti + **200 tokens** (W01) + titres permanents **Demon Lord Slayer / Malachar's Bane** (T13). Ressuscite après 4 transmigrations.
- **Gluttony (GLT01-04)** : passif d'absorption permanente de stats (proc 10% / cooldown 5j ; assassinat = garanti + choix de la stat).

### Titres permanents (M01)
- `meta.titlesEarned` (persistent entre runs), action `awardTitle`, affichage HeroSheet.

### Inventory / Equipment / Calendar / Donjons / Save
- 4 slots équipement, mana stones, resources, consumables. Calendrier 24 ticks/jour, sleep (restore + spawn donjons + **tick debuffs CRF01**), church pray (1 tick CAL01).
- Donjons : `world.dungeons[zoneId] = { active, cleared, position, discovered }`, loot exclusif (D04), warp sortie (D05), idle interdit (D07). **Manque** : flux 5 salles path map (D01), carte donjon (D03), respawn nuit (D06).
- Save : localStorage `roguelite_save`, migration robuste (`runMigrations`/`normalizeSave` dans `store/migrations.js`, SAVE_VERSION=2). **Règle non négociable** : tout champ `INITIAL_*` → ligne de migration + test.

### Stats de tension (STA — v1.2)
- **Vigueur** (STA01, 0-100) : décroît à l'effort, restaurée au sommeil, malus par palier. **Aura** (STA02) : multiplicateur de dégâts permanent, débloquée à l'usage (masquée avant). **Concentration** (STA03) : qualité de craft. Atténuation Fatigue par Aura/Concentration (STA04). Livres de stats (ITM01), entraînement chez un maître (TRA01).

### Vie urbaine (v1.2)
- **Académie de magie** (ACA01-04) : acheter/revendre des skills (plus-value ACA03), déséquipement réservé (ACA02), skills jusqu'au **Lv5** (SKL01), quêtes de maître (ACA04). **Guilde** en ville (GLD01/02). **Équipement par lieu** (Z07 : village = communs + 1 rare / ville = rares + 1 epic). Horaires de bâtiments (BLD01) + déblocage progressif (BLDUNL01, stub).

### Progression de zones & fog (PROG / START — v1.2 → v1.33)
- **Zones** débloquées data-driven (`isZoneUnlocked`, `world.unlockedZones`) : conditions niveau/kills + déblocage explicite via quête/info (`unlockZone`). **Node-locking** (START01-04) : le run **démarre à Greywatch**, seuls les nodes ouverts (`START_OPEN_NODES` + `world.unlockedNodes`, écrits par la chaîne MQ) sont accessibles ; **fog** sur le reste de la carte. Anti-piège save (`normalizeSave` relocalise un héros bloqué sur un node verrouillé, FIX-START01).

### VFX de combat par skill (ANIM02/03)
- Rendu dérivé du type de dégât + portée (`engine/skillVfx.js` `getSkillVfx`) : flash élémentaire teinté, projectile (magie/distance) vs frappe (mêlée), onde AoE, secousse d'arène.

---

## 5. Contenu actuel

| Élément | Quantité | Détails |
|---|---|---|
| Zones | 3 | Ashenvale (4 spots) + Blighted Road + Grimspire |
| Spots de chasse | 4 (surface) | Ashenvale : ashenvale_forest / thornmarsh / crumbled_ruins / wildmere_hills. Propriété unique par lieu (`SPOT_OWNER`, QSV2-SPOTOWNER01). + levelRange par spot |
| Monstres / boss | 29 | dont Crypt Keeper, Lord of the Forsaken, Malachar (+ bossMechanics). **MON01** : bestiaire de surface (4 spots × 4 dont 1 élite) ; réserve `reserve:true` exclue de `MONSTERS_BY_SPOT/_ZONE` |
| Skills | **50** | dont **6 divins**, soul_rend (suprême), reckless_blow (sacrifice), gluttony (passif) + techniques de bestiaire ; `sourceMonster` réconciliés (FIX-SRCMON01) |
| Divinités actives | 3 | Ignareth / Sylvara / Voltaris |
| Debuffs passifs | 4 | Burnt Hands / Poisoned / Fatigue / Black Smoke (CRF01) |
| Recettes | **`craftRecipes.js` (source unique)** | 21 recettes autorées + variantes de forge dérivées des templates (`ALL_CRAFT_RECIPES` ≈ 39) ; tous les ingrédients droppables (FIX-CRAFTSRC01) |
| Consommables | 8 + 3 tomes | hp/mana small+medium, stamina_ration, elixir_minor, mana_crystal, antidote_basic ; tomes de stats vendus en ville (QA-BOOKS01) |
| Titres permanents | 4 | first_steps, demon_lord_slayer, malachar_bane (+ 1) |
| Articles boutique | 6 | rank_restore, bonus_skill, bonus_stat, skill_levelup, starter_kit, oracle |
| Assets liés | 16/16 monstres surface · 5/9 bâtiments | figurines `public/monsters/<id>.png` (+ variantes `_2/_3`), façades `public/buildings/` ; boss/Grimspire + portraits PNJ en emoji/placeholder fallback |

---

## 6. Tests (2044 total, 178 fichiers)

> Aperçu non exhaustif ci-dessous (le nombre de fichiers a beaucoup augmenté avec v1.2/v1.3 : quêtes église/maître/principale, PROG/START, STA, VFX, migrations, slices…).

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
- **v1.1** (UI parchemin + sprites + QoL) et **v1.2** (NPC → STA → PROG : quêtes église/maître/contenu, Guilde, Académie, équip. par lieu, VFX skills, transmigration) — **clôturées 2026-06-14**.
- **MON01** (bestiaire de surface refondu) · **DEPLOY01** (Vercel, `public/` committé) · **REFAC01** (store découpé en slices).
- **v1.31** (quêtes + chaîne MQ) · **v1.32** (skills/drops) · **v1.33** (progression : node-locking START01-04, fog) — **en cours**.

> Détail ticket par ticket : section **Done** de `TASKS.md`. Planning par épiques : table « 🗺 Plan de release » de `TASKS.md`.

---

## 8. Prochaines étapes (roadmap par milestones)

> **Réorg épic-first (2026-06-20)** : `TASKS.md` planifie désormais par **épiques** — la version est portée par l'épique (table « 🗺 Plan de release »), pas par le ticket. **v1 / v1.1 / v1.2 clôturées** ; **en cours** v1.31 (quêtes/chaîne MQ) → v1.32 (skills/drops) → v1.33 (progression/node-locking). **Backlog** : v1.4 (donjon), v1.5+ (monde, divin, compagnons, UI/UX, méta…), gelé (Map 2), v2/v3 (ambition). Les sous-sections 🅰️/🅱️/🅲️ ci-dessous sont **historiques** (v1/v1.1/v1.5 : la plupart livrées) ; le détail à jour est dans `TASKS.md`.

### 🅰️ v1 — Stabilisation avant de figer le POC
Le POC est **complet et gagnable**. Reste : **BAL02** (difficulté boss + playtest), **BAL03** (rythme idle), **TECH04** (60fps Canvas), **TECH05** (JSDoc engine). Voir `docs/PLAYTESTS.md`.

### 🅱️ v1.1 — UI parchemin, sprites & QoL (rendre présentable)
Gros chantier visuel — **spec complète dans `docs/UI_HANDOFF.md`** (design system "parchemin" diégétique type Dragon Quest, stage 1920×1080, tokens CSS canoniques, 6 écrans, 2 couches d'assets, animations). À faire d'un bloc pour la cohérence :
- **UI01-09** : design system + shell, puis WorldMap / SafeZone / ZoneView / NPC overlay / HeroSheet / Inventory restylés, sprites en dernier (absorbe les anciens U06/U08-U12).
- **Assets** : CONT01 (portraits monstres), CONT05 (`docs/ASSETS.md` + licences), C03 (portraits perso).
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
□ TASKS.md (Done + date)     □ CONTEXT.md (si système)    □ docs/CHANGELOG.md
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
- **ADR-008** : Effets de statut data-driven (`statusEffect` sur les skills), moteur pur dans `combat.js`, max 2 actifs. Spec : `docs/DESIGN.md §B05-SPEC`.
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
