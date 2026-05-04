# CONTEXT — Roguelite Idle RPG

> **Comment utiliser ce fichier** : copier-coller (ou attacher) dans une conversation Claude Chat ou Claude Code pour reprendre le projet. Self-contained — un Claude sans contexte peut le lire en 5 min et comprendre l'état complet du projet. **Mettre à jour à chaque fin de session.**

---

## 1. Pitch

**Roguelite Idle RPG dark-medieval avec transmigration entre univers.**

- Le héros meurt souvent. À chaque mort, il choisit ce qu'il emporte (1 stat + 1 skill actif + 1 skill passif) et renaît dans un nouveau monde via la **Boutique des Dieux**.
- Loop principal : explorer une zone → combattre des monstres → gagner XP/loot → finir un donjon (boss) → mourir → transmigrer → recommencer plus fort.
- 4 univers prévus (medieval fantasy, wushu, tower, post-apo Hokuto No Ken). **POC actuel : medieval fantasy uniquement**.
- Public : joueur PC, sessions de 10-30 min, progression méta entre les runs.
- État : **v0 + v0.1 jouables de bout en bout**. Pré-alpha solo dev.

---

## 2. Stack & comment lancer

- React 19 + Vite 8 + Zustand 5 + TailwindCSS 4
- **JavaScript pur (pas de TypeScript)** — choix du dev
- Windows 10, dev local

```bash
npm install           # une fois
npm run dev           # localhost:5173
npm test              # vitest watch (TDD)
npm run test:run      # vitest single run (CI / fin de session)
npm run build         # dist/ — vérifier avant tout merge
npm run lint          # ESLint check
```

**État technique** :
- 322 tests dans 7 fichiers, durée ~3s
- Build prod : ~360 KB JS / ~100 KB gzipped
- ESLint configuré, pas d'erreur, pas de warning bloquant

---

## 3. Architecture (carte des fichiers)

```
src/
├── App.jsx                     # Routeur d'écrans + NavBar + DayBar + intercepts modales
├── main.jsx                    # Entry Vite
├── index.css                   # Tailwind + animations CSS (.anim-shake, .anim-flash, .anim-pop, .anim-float)
├── data/                       # Données pures, immuables — aucun state React
│   ├── monsters.js             # 23 monstres + 3 boss (Crypt Keeper, Lord of the Forsaken, Malachar)
│   ├── skills.js               # ~30 skills + levelBonuses + isDivineSkillInheritable()
│   ├── deities.js              # 2 divinités + applyDeityBlessing + checkXxxAwakening + DIVINE_RELATIONS
│   ├── quests.js               # 8 quêtes + 3 NPCs (sir_aldric, ironhaven_captain, greywatch_elder)
│   ├── equipment.js            # Templates équipement + crafting (canCraft, createEquipmentInstance, RARITY_CONFIG)
│   ├── resources.js            # Drops + RARITY_COLORS + potions
│   └── zones.js                # Zones + scaleMonsterStats(baseStats, zoneId, runCount)
├── engine/                     # Logique pure sans état React — tout testable sans mock
│   └── combat.js               # calcBaseDamage, calcSkillDamage, getScaledSkillCost, applySkillCost,
│                               # canUseSkill, calcDrops, buildEnemy, generateEnemies, enemyAI,
│                               # checkAwakeningConditions, isDefeated, calcExpGain, applyStatusEffects
├── store/
│   └── gameStore.js            # Zustand : { hero, world, meta, currentScreen, activeCombat,
│                               # pendingDivineCall, pendingLevelUp, recentSkillLevelUps }
│                               # + 50+ actions + saveGame/loadGame avec migration robuste (saveVersion: N)
├── screens/
│   ├── WorldMap.jsx            # Carte SVG (→ Canvas 2D avec MAP01)
│   ├── ZoneView.jsx            # Liste monstres, Fight / Idle (5 kills requis)
│   ├── Combat.jsx              # Arène : EnemyCard + HeroCard + ActionPanel + FloatingNumbers + CombatLog
│   ├── HeroSheet.jsx           # Stats + équipement (4 slots) + skills équipés
│   ├── Inventory.jsx           # 4 onglets : Mana Stones / Equipment / Consumables / Resources
│   ├── SafeZone.jsx            # Inn / Church / Merchant / Blacksmith / Knight Trainer
│   ├── QuestBoard.jsx          # Active / Available / Completed, NPC par carte
│   ├── PostMortem.jsx          # Cause mort + héritage (DV10 filtre divin Lv 1)
│   ├── GodsShop.jsx            # 6 articles boutique des dieux
│   ├── DivineCall.jsx          # Modal full-screen éveil divin
│   ├── CharacterCreation.jsx   # Run #1 : input nom
│   └── LevelUpModal.jsx        # Choix +1 stat à chaque level-up
└── test/setup.js               # Mock localStorage + RTL globals

public/
├── monsters/                   # PNG portraits (5/23 + fallback emoji)
│   └── README.md               # Guide génération portraits Gemini Nano Banana 2
├── favicon.svg
└── icons.svg

racine/
├── TASKS.md                    # Backlog source de vérité
├── ROADMAP.csv                 # Liste originale 60 items (lecture seule)
├── CONTRIBUTING.md             # [à créer — PROC00] DoD, workflow, conventions
├── CHANGELOG.md                # [à créer — PROC00] Historique versions
├── DESIGN.md                   # [à créer — PROC00] ADRs, décisions actées
├── PLAYTESTS.md                # [à créer — PROC00] Journal playtest
├── balance/combat_stats.csv    # [à créer — PROC00] Stats monstres × scaling
├── README.md                   # Vide — à remplir (pitch + setup + screenshot)
├── package.json
├── vite.config.js              # vitest globals + jsdom + setupFiles
└── eslint.config.js
```

### Conventions de nommage
| Élément | Convention | Exemple |
|---|---|---|
| Composant React | PascalCase | `CombatScreen.jsx`, `HeroCard.jsx` |
| Action Zustand | camelCase verbe+objet | `acceptDeity`, `heroDeath`, `gainSkillXp` |
| Constante data | SCREAMING_SNAKE_CASE | `DIVINE_RELATIONS`, `RARITY_CONFIG` |
| Fonction engine | camelCase verbe+objet | `calcBaseDamage`, `buildEnemy` |
| ID en data | snake_case | `ashwood_wolf`, `inferno_strike` |
| ID ticket | PREFIXE + numéro | `MAP01`, `CMP03`, `GLT02` |

---

## 4. Systèmes de jeu — état détaillé

### Combat (tour par tour)
- **Implémenté** : 1v1, attaque basique + skills + items + flee, animations CSS, floating damage numbers (4 types), ResultPanel étendu, Cooldown overlay visuel, MonsterPortrait avec fallback emoji.
- **Manque** : multi-ennemis 1-3 (B03, v1), boss mechanics uniques (BSS01-03, v1), effets de statut (B05, v1), ATB (B06, v2).

### Skills
- **Système** : 6 actifs max / 4 passifs max. 3 niveaux (Lv1/Lv2/Lv3). Up à 20 puis 50 uses cumulés.
- **Implémenté** : XP tracking, level-up notif, cooldown visuel, coût scalé, unequip, isDivineSkillInheritable.
- **Manque** : aperçu skills ennemis (S02), stack doublons (S03), contenant cosmétique par univers (S06).

### Idle
- **Système** : 5 kills → idle débloqué. Tick toutes les 3s. Auto-désactivation si HP < 20%.
- **Manque** : toast loot (I04), choix joueur (I08), calendrier 24 ticks/jour validé (CAL01).

### Quêtes
- **Système** : `objectives` (type: `kill`|`level`) + `reward`. 3 NPCs.
- **Implémenté** : 8 quêtes, accept/complete, progression texte.
- **Manque** : barres progression (Q02), types `visit`/`craft` (Q04/Q05), 10 nouvelles quêtes (NPC02).

### Divinités
- **Système** : conditions cachées (DV06 ✓), check fin de combat. Acceptation = blessing + skill divin.
- **Implémenté** : Ignareth (20 victoires en 5 jours), Sylvara (85% HP × 8 fois), applyDeityBlessing, héritage Lv 2+ filtré.
- **Manque** : Voltaris (DV04), refus=run solo (DV07), fidélité inter-run (DV03).

### Transmigration & Boutique des Dieux
- **Flow** : `heroDeath` → PostMortem → `confirmInheritance` → GodsShop → `applyTransmigration` → Run N+1.
- **Implémenté** : cause précise (T01), catalogue 6 articles (T03), T06-T11 (économie boutique complète).
- **Manque** : transmigration animée (T02), socle universel écran dédié (T05), Soul Rend héritable (T12).

### Win condition
- **Malachar the Undying** : boss Demon Lord en Zone 2. Tuer Malachar → transport direct vers prochain univers + titre "Slayer of Eldenmoor" + skill Gluttony (absorption stats). Malachar ressuscite après 4 transmigrations si pas tués tous les 4 Demon Lords à la suite.
- **Manque** : boss implémenté (W01), écran post-kill (W03), Gluttony (GLT01-04).

### Inventory + Equipment
- 4 slots équipement (weapon/helmet/armor/boots), mana stones, resources, consumables.
- Migration `loadGame` robuste — tous les champs garantis.

### Calendar
- 24 ticks/jour. Sleep restore HP/MP 100% + spawn donjons. Church pray restore 40% HP/Mana.
- DayBar permanente (I03 ✓). Coût église en tick manquant (CAL01).

### Donjons
- Schema : `world.dungeons[zoneId] = { active, cleared, position, discovered }`.
- Manque : flux 5 salles path map (D01), warp sortie (D05), loot exclusif (D04), carte (D03).

### Save / Migration
- localStorage `roguelite_save`, JSON.stringify({hero, world, meta, saveVersion}).
- Auto-save toutes les 30s. Migration robuste dans `loadGame`.
- **Règle** : tout champ ajouté dans `INITIAL_*` → migration dans loadGame + test de régression.

---

## 5. Contenu actuel

| Élément | Quantité | Détails |
|---|---|---|
| Zones | 3 | Ashenvale (4 spots) + Blighted Road + Grimspire |
| Spots de chasse | 6 | ashenvale_forest, thornmarsh, crumbled_ruins, barrow_hills, blighted_road, grimspire |
| Monstres | 23 | dont 1 elite (soul_harvester) + 2 elites Blighted Road |
| Boss | 3 | Crypt Keeper, Lord of the Forsaken, Malachar the Undying |
| Skills | ~30 | dont 4 divins + 1 suprême (soul_rend) |
| Quêtes | 8 | 3 sir_aldric, 3 ironhaven_captain, 2 greywatch_elder |
| Divinités actives | 2 | Ignareth (war/fire, +15% str), Sylvara (nature/calm, regen) |
| Divinités designées | 3 | + Voltaris (foudre/action, +20% AGI), Hepharion (forge/artisanat), Aqualis (eau/continuité) |
| Articles boutique | 6 | rank_restore(40), bonus_skill(80), bonus_stat(80), skill_levelup(20), starter_kit(10), oracle(15) |
| Recettes craft | ~10 | weapons + armor à la forge |
| Potions | 4 | hp/mana small/medium |
| Portraits monstres | 5/23 | ashwood_wolf, briar_wraith, gloom_bat, marsh_serpent, rotting_shambler |

---

## 6. Tests (322 total, 7 fichiers, ~3s)

```
src/engine/combat.test.js         #  54 tests : damage, drops, scaling, getScaledSkillCost
src/store/gameStore.test.js       # 143 tests : actions, migration, S04/DV08/T06-T11/DV10
src/scenarios.test.js             #  27 tests : parties simulées bout en bout
src/data/quests.test.js           #  14 tests : QUESTS + QUEST_NPCS
src/data/deities.test.js          #  22 tests : conditions éveil, applyDeityBlessing, DV06
src/screens/Combat.test.jsx       #  13 tests : rendu, animations, stats combat
src/screens/screens.test.jsx      #  49 tests : smoke + nav + layouts + flows
```

**Politique de tests** :
- Feature M/L = test unitaire + test fonctionnel store + scénario si boucle de jeu
- Feature UI = smoke test RTL + flux critique
- Bug fix = test de régression écrit AVANT le fix
- Objectif couverture : ~90% sur engine/combat.js et actions gameStore.js

---

## 7. Done so far

### v0 — Base jouable (16 tickets, avril 2026)
C01, C02, B01, B04, S01, Q01, Z01, I01+I02, I03, DV02, T01, U07, X01, X03, X04, X07

### v0.1 polish (6 tickets, 2026-04-23)
B02, B07, B08, Q03, Q08, Z05

### v0.1 mégabatch (16 tickets, 2026-04-24)
S04, S05, S07, B09, DV01, DV06, DV08, DV09, DV10, T03, T06, T07, T08, T09, T10, T11

---

## 8. Pending (depuis TASKS.md)

### v0.1 — P1 urgents
PROC00 (socle dev), PROC01-03 (DoD/CHANGELOG/commits), GIT01+X06 (Git), TECH01 (Error Boundaries), TECH02 (save versioning), UX03 (confirmations), BAL01 (tokens calibration), MAP01 (Canvas 2D), MAP02 (QTE), B13 (hero-attack), CAL01 (cycle jour/nuit), T04+W03 (Malachar), T13 (titre), M02 (compteur DL kills)

### v1 — Contenu & profondeur
BSS01-03, TUT01-03, EVT01-02, CMP01-09, GLT01-04, CRF01-06, B03/B05/B10/B12, S02/S03/S06, T07b, Q04/Q05/NPC02, Z04/Z06/NPC01, D01/D03/D06, DV03/DV04/DV07, T02/T05/T12, I04/I08, U01/U04/U06/U08/U09/U10/U11/U12, BAL02/BAL03, TECH04, PROC04-06, CONT01/CONT04, W01, M01

### v2 — Ambition
MAP03 (PixiJS), B06 (ATB), HIS01/HIS02, EVT03, UX04, TECH05/TECH06, U02/U05, DV05/DV11/DV12, X08/X09, NPC03, CONT02/CONT03

---

## 9. Décisions actées (anciennes "en suspens")

### A. T07 — Bonus skill pool → ACTÉ
Ticket T07b (v1) : UI sélection dans GodsShop affichant les skills des runs précédents. Fallback run 1 = 3 skills basiques Zone 1. En attendant : power_strike par défaut.

### B. DV04 — Voltaris → ACTÉ
Foudre+Action, Chaotique. Awakening : 5 victoires <30% HP. Blessing +20% AGI. Skills : "Chain Lightning" (120% INT, rebond 2 ennemis) / "Overclock" (+80% vitesse 2T). Relations : Ignareth+6, Sylvara−4.

### C. D01 — Flux donjon → ACTÉ
**Path map** : Entrée → choix A (Combat|Trésor) → choix B (CombatElite|Repos|Event) → Boss. 5 nœuds dont boss fixe en fin.

### D. U01 — Toasts → ACTÉ
**Zustand store dédié** `toastStore.js`. Pas de lib externe. `<ToastContainer>` dans App.jsx.

### E. Multi-univers (X08) → ACTÉ (v2)
`currentUniverse` + `universeHistory[]` dans save. Data namespaced `src/data/universes/{id}/`. Shared : equipment, resources, quests.

### F. Combat balance → EN ATTENTE PLAYTEST
Hypothèse : boss Lv3 nécessitent skill divin + équipement rare. À valider via BAL02 (playtest structuré).

### G. Économie tokens → ACTÉ (BAL01)
Run typique ~8 tokens. Coûts révisés : starter_kit=5, skill_levelup=12, rank_restore=25, skill/stat_bonus=50, oracle=8.

### H. Fin du POC après Malachar → ACTÉ
Transport direct vers prochain univers + titre "Slayer of Eldenmoor" + Gluttony. Même mécanique d'héritage. Malachar ressuscite après 4 boucles. W03 = screen "to be continued" (ticket v0.1).

### I. Cosmétiques monstres → EN ATTENTE
Pipeline documenté dans `public/monsters/README.md`. Priorité : 6 monstres Ashenvale communs d'abord. Pas d'illustrateur freelance avant v1.

---

## 10. Processus de développement

> Référence complète : ticket **PROC00** dans TASKS.md. Ce qui suit est le condensé opérationnel.

### Git
```
main (stable, taggué) ← dev (intégration) ← feat/ID (features M/L)
```
Convention commits : `type(scope): description` — types : feat/fix/test/refactor/chore/docs/style/perf

### Checklist fin de session (obligatoire)
```
□ npm run test:run → vert
□ npm run build → OK
□ npm run lint → OK
□ TASKS.md mis à jour (Done avec date)
□ CONTEXT.md mis à jour si nouveau système
□ CHANGELOG.md mis à jour
□ git commit + push
□ Pas de console.log oublié
```

### Definition of Done — résumé
| Type | Minimum requis |
|---|---|
| Feature gameplay | Code + test unitaire + test fonctionnel + migration save si besoin |
| Feature UI | Code + smoke test RTL + pas de régression |
| Bug fix | Test de régression AVANT le fix + vérif vieille save |
| Refacto | Tests existants verts + bundle stable |
| Contenu data | Données + test de structure + CONTEXT.md compteurs |

### Règle save (non négociable)
Tout champ ajouté dans `INITIAL_*` → migration dans `loadGame()` + test de régression + incrément `saveVersion`.

### Session Claude Code — prompt de démarrage
```
Voici l'état de mon roguelite [CONTEXT.md joint].
Je veux travailler sur [TICKET_ID] : [titre].
Stack : React 19 + Vite + Zustand + TailwindCSS + Vitest. JS pur, pas de TS.
Commence par écrire les tests (TDD), puis implémente.
```

---

## 11. Architecture Decision Records (ADR)

### ADR-001 : Canvas 2D pour WorldMap v0.1, PixiJS pour v2
**Date** : 2026-05 · **Statut** : Actée
SVG statique insuffisant pour animations. Canvas 2D natif (0 dépendance) pour POC. Migration PixiJS (@pixi/react) en v2 pour effets WebGL.

### ADR-002 : JavaScript pur, pas TypeScript
**Date** : 2026-03 · **Statut** : Actée
Préférence dev. Mitigation : tests comme filet de sécurité, JSDoc sur fonctions engine/ critiques.

### ADR-003 : Zustand plutôt que Context/Redux
**Date** : 2026-03 · **Statut** : Actée
API simple, pas de Provider, serializable. 50+ actions dans `gameStore.js`. toastStore séparé pour v1.

### ADR-004 : localStorage pour save (pas de backend)
**Date** : 2026-03 · **Statut** : Actée, révisable en v2
POC 100% client-side. Quota 5MB suffisant. Save versionée (`saveVersion: N`) pour migrations. Migration vers backend si mode multijoueur.

### ADR-005 : Path map pour donjons (pas linéaire)
**Date** : 2026-05 · **Statut** : Actée
5 nœuds avec choix tactiques. Types : Combat/Trésor/Repos/Event/Boss. Plus intéressant qu'une succession linéaire sans choix.

### ADR-006 : Conditions d'éveil divin cachées (pas de jauge visible)
**Date** : 2026-04 · **Statut** : Actée
Le joueur ne voit pas les conditions — le dieu "choisit" le héros par ses actions. Plus immersif, cohérent avec le lore. Anti-régression : tests vérifient que checkXxxAwakening ne retourne qu'un boolean.

### ADR-007 : Compagnons avec personnalité dynamique (traits contextuels)
**Date** : 2026-05 · **Statut** : Actée (v1)
Traits pondérés par contexte de recrutement + score de relation. followProbability() = formule, pas valeur fixe. Permadeath à la transmigration — narrativement cohérent.

---

## 12. Liens utiles dans le repo

- **`TASKS.md`** — backlog source de vérité (Active / Waiting On / Someday / Done)
- **`ROADMAP.csv`** — liste originale 60 items (lecture seule)
- **`CONTRIBUTING.md`** — [à créer PROC00] workflow Git, conventions code, DoD
- **`CHANGELOG.md`** — [à créer PROC00] historique versions
- **`DESIGN.md`** — [à créer PROC00] ADRs détaillés, décisions game design
- **`PLAYTESTS.md`** — [à créer PROC00] journal de playtest structuré
- **`balance/combat_stats.csv`** — [à créer PROC00] stats monstres × scaling
- **`public/monsters/README.md`** — guide génération portraits (Gemini + remove.bg)
- **`vite.config.js`** — config vitest (jsdom, globals, setupFiles)

---

## 13. Suggestions de questions à poser à Claude Chat/Code

1. *"Voici l'état de mon roguelite (CONTEXT.md joint). Aide-moi à arbitrer quoi faire dans la prochaine session de 3-4h pour maximiser le ressenti de jeu."*
2. *"Je veux implémenter MAP01 (Canvas 2D WorldMap). Voici CONTEXT.md. Commence par les tests, puis implémente le composant."*
3. *"Audit l'économie de tokens avec les nouveaux coûts actés (BAL01). Simule 3 types de runs et vérifie que le ratio est bon."*
4. *"Design BSS03 (Malachar 3 phases) en détail : valeurs HP par phase, patterns d'attaque, conditions de transition."*
5. *"Le crash X vient de se produire. Voici la stack trace. Écris d'abord le test de régression qui le reproduit, puis fix-le."*
6. *"Je prépare une session de playtest. Génère une grille d'observation structurée pour valider BAL02 (boss difficulty)."*
