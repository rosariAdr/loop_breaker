# Changelog

All notable changes to **Loop Breaker** (Roguelite Idle RPG) are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Changed (Batch UI v1.1 — Design « parchemin », en cours)
- **UI01** — Shell parchemin : canvas fixe 1920×1080 mis à l'échelle (`--lb-scale`), topbar bois (HP/MP/run/XP/day/tokens + onglets), breadcrumb, sidebar/journal partagés
- **UI02** — WorldMap : carte illustrée en fond (`public/map/eldenmoor.png`), nodes en marqueurs discrets (%), trails SVG par graphe d'adjacence, Blighted Road + QTE
- **UI03** — Village (SafeZone) : carte parchemin (place + puits + chemins + bâtiments façon référence), panneaux de bâtiment fonctionnels en modale sombre par-dessus
- **UI04** — Forêt (ZoneView) : décor parchemin, monstres en cartes-clairières (killbar, idle/fight, aperçu de skill drop conservé), journal idle en panneau parchemin ; header dissocié (Map / titre / desc espacés)
- **UI06** — Hero Sheet : layout sheet parchemin 2 colonnes (portrait + équipement | vitals + attributs + skills + allégeance) ; debuffs/gluttony/titres conservés
- **UI05** — Dialogue PNJ à l'entrée des bâtiments du village : portrait pixel (couche B : marta/smith/aldric/merchant/mage) + réplique + action → ouvre le panneau fonctionnel (Back ramène au dialogue)
- **UI07** — Inventory : sheet parchemin à onglets (mana stones / équipement / consommables / ressources), cartes + panneaux détail recolorés ; equip/sell/diff/confirm intacts
- **UI09 (partiel)** — écrans takeover (mode plein écran dramatique, choix « Mixte ») :
  - **PostMortem** : parchemin « chronique de l'âme » sur fond ténébreux (récap + transmigration), bannière Malachar conservée
  - **GodsShop** : boutique divine polie (violet éthéré premium, fond takeover partagé)
  - **DivineCall** : conservé en sombre/mystique thématisé par dieu (déjà conforme à l'esthétique takeover)
- Avatar héros chibi affiché ×2 (sprite 76×112, halo 80×20) **+ idle animé** (18 frames, ~9 fps, préchargées) sur WorldMap & Village
- **DEV01** — Harnais de test : bouton flottant `⚙ DEV` + panneau Navigate (sauts d'écran) / Triggers (combat, appel divin, mort→PostMortem, boutique) / Cheats — permet de tester tous les écrans sans jouer le run
- **Assets** — sprites chibi des monstres sur les cartes-clairières de la forêt (Combat les utilisait déjà)
- *Combat : déjà une UI sombre/dramatique aboutie et sur-thème (Cinzel, accents gold/violet) — pas de refonte nécessaire ; polish ciblé si besoin*

### Added (Batch O — Gluttony & Malachar, POC bouclé)
- **GLT01** — Skill passif Gluttony : absorption permanente de stats (proc 10%, cooldown 5j), réappliquée à chaque run
- **GLT02** — Assassinat (kill en 1 coup depuis HP max) → absorption garantie + choix de la stat (modal)
- **GLT03** — Statut Gluttony sur HeroSheet (Ready / jours restants)
- **GLT04** — Toast d'absorption (type `gluttony`)
- **W01** — Malachar POC : phases + Soul Rend garanti + 200 tokens + titres → **win condition bouclée**

### Added (Batch N — Boss mechanics & titres)
- **M01** — Titres permanents (`meta.titlesEarned`) : registre, `awardTitle`, affichage HeroSheet
- **T13** — Titre "Demon Lord Slayer" (+ "Malachar's Bane") gagné en tuant le Demon Lord
- **BSS03** — Malachar en 3 phases (Rage +50% ATK, Soul Drain 15% maxHP/tour)
- **BSS01** *(léger)* — Crypt Keeper : enrage +40% ATK à 50% HP (vraie invocation → BSS01b backlog)
- **BSS02** *(léger)* — Lord of the Forsaken : Cursed Strike STR−20% (armure régénérante → BSS02b backlog)

### Added (Batch P — Crafting & artisans)
- **CRF01** — Debuffs passifs temporaires (Burnt Hands/Poisoned/Fatigue/Black Smoke), décrément au sommeil, réduction de stats en combat
- **CRF02/CRF03** — Mini-jeux de crafting (alchimie : dosage ; forge : 3 frappes rythmées) — composant `CraftingMinigame`
- **CRF04** — Issue du craft selon le score : rareté +2/+1/base, ou raté/catastrophe avec debuff
- **CRF05** — Section "Active Debuffs" sur HeroSheet (durée / "Cure needed")
- **Z04** — Alchimiste : 6 recettes de potions, brassage via mini-jeu (qualité = quantité)
- **Z06** — Maître forgeron : 5 recettes Rare/Epic, mini-jeu forge, spawn 10% au village

### Added (Batch M — Profondeur de combat)
- **B05-SPEC** — `DESIGN.md` : spec complète des effets de statut (DoT/contrôle/stat, plafond 2, interactions, valeurs par niveau)
- **B05** — Effets de statut opérationnels en combat : poison/burn (DoT), stun (saut de tour), slow/defense_break/atk_down/max_hp_reduction/all_stats_down (modificateurs de stats). Icônes d'effets actifs sur les cartes ennemi/héros. Moteur pur : `tickStatusEffects`, `applyStatusEffect`, `getEffectiveStats`, `canHeal`, `isStunned`
- **B10** — Sacrifice de stat (`cost.stat_sacrifice`) + skill `reckless_blow` (220% STR contre −3 AGI). Permanent persisté, temporaire récupéré au combat suivant
- **B12** — Combat manuel forcé quand un monstre idle dépasse le niveau du héros de +5 (`getMonsterLevel`, `isEnemyTooStrong`)
- **B03** — Multi-ennemis 1-3 selon zone/rang (`getEnemyCount`/`generateEnemies`), branché dans ZoneView

### Fixed (Batch M)
- `applyStatusEffects` était défini mais jamais appelé — les effets de statut étaient inertes en combat
- Skills de pur debuff (`abyss_howl`, `forsaken_curse`) provoquaient un soft-lock du combat (animation jamais relâchée)

### Added (Batch G — Fermeture v0.1)
- **Z02** — 4 consommables marchand (`stamina_ration`, `elixir_minor`, `mana_crystal`, `antidote_basic`) + effet `restore_both` (HP+Mana)
- **Z03** — Forge : ingrédients manquants grisés + message de blocage explicite + tests `canCraft`
- **PROC04** — `balance/drops_summary.csv` (gold/exp/skill drop/resource drops par monstre)
- **PROC05** — `PLAYTESTS.md` template structuré
- **PROC06** — `DebugPanel.jsx` (Ctrl+Shift+D, DEV only, 17 commandes cheat)

### Added (Batch H — Toasts)
- **U01** — `toastStore.js` Zustand + `ToastContainer.jsx` (8 types, auto-dismiss, overlay bas-droit)
- **Q07** — Toast récompense de quête à `completeQuest`
- **I04** — Toasts `levelup` + `warning` sur événements idle marquants

### Added (Batch I — Transitions + Tutorial)
- **U04** — `@keyframes screen-fade-in` 150ms + wrapper `key={currentScreen}`
- **TUT02** — Hint idle unlock (toast au 5e kill, flag `meta.seenHints`)
- **TUT03** — Hint première transmigration dans PostMortem (`meta.firstDeathSeen` + action `markFirstDeathSeen`)

### Added (Batch J — Skills polish)
- **S02** — `SkillDropPreview` : skill droppable flouté tant que < 5 kills (ZoneView)
- **S03** — `utils/manaStones.js` (`groupManaStones`/`removeOneManaStone`) + badge ×N
- **S06** — `data/containers.js` (`getSkillContainer` cosmétique par univers)
- **T07b** — `getBonusSkillPool` + sélecteur skill bonus dans GodsShop

### Added (Batch L — Divinités v1)
- **DV04** — Voltaris (3e divinité, Foudre+Action) : `checkVoltarisAwakening`, blessing +20% AGI, skills `chain_lightning` + `overclock`, relations Ignareth +6 / Sylvara -4
- **DV03** — Fidélité inter-run : bannière de reconnaissance dans DivineCall
- **DV07** — Refus = run solo (`hero.soloRun` → bonus T11 garanti)

### Fixed (Batch J)
- Bug latent equip-skill : `equipActiveSkill`/`equipPassiveSkill` retiraient TOUTES les copies d'un skill (filter par skillId) → corrigé via `removeOneManaStone` (une seule) + refus de doublon en slot

### Changed (Batch G→L)
- `endCombat` battleLog enrichi avec `hpPercent` (pour Voltaris)
- `INITIAL_HERO.soloRun: false`, `INITIAL_META.seenHints: []`, `firstDeathSeen: false` ajoutés
- eslint overrides étendus pour GodsShop/ZoneView (helpers co-exportés)

### Added (Batch E — Donjons + Balance)
- **D02** — Marker '?' du donjon cliquable dans WorldMapCanvas → `discoverDungeon` au 1er clic + label révélé "The Hollow Crypt · Lv 12-16"
- **D04** — Field `category: 'dungeon_seal'` sur `crypt_seal`, `forsaken_seal`, `demon_lord_heart` (monnaie alternative future). Tests : drops garantis chance 1.0 sur les 3 boss
- **D05** — `clearDungeon(zoneId)` warpe le hero vers la city de la zone, reset `currentHuntingSpot/isIdleActive/idleTargetMonster`
- **D07** — `toggleIdle` refuse sur zones `idleAllowed: false` (Blighted Road) + `currentScreen === 'dungeon'` (anticipation D01)
- **BAL01** — Coûts CATALOG révisés : starter_kit 10→5, oracle 15→8, skill_levelup 20→12, rank_restore 40→25, bonus_skill/stat 80→50. 5 scénarios simulant runs rapide/moyen/excellent/légendaire.

### Added (Batch F — Win Condition)
- **T04+W02** — `world.demonLordResurrectionCounter` incrémenté à chaque transmigration post-kill Malachar. Quand counter atteint 4 → Malachar respawn (donjon grimspire reset, defeated=false). Constante `RESURRECTION_CYCLES = 4`.
- **M02** — `meta.demonLordKills` migré de `0` (number) à `{}` (object indexé par `universeId`) — préparation X08 multi-univers. `clearDungeon('grimspire')` incrémente `meta.demonLordKills.medieval_fantasy`.
- **W03** — Flag `meta.malacharDefeatedThisRun` levé par `clearDungeon('grimspire')`, reset par `applyTransmigration`. Écran "to be continued" overlay dans PostMortem si flag levé (titre "Slayer of Eldenmoor" + bouton "Continue to Transmigration →").

### Changed (Batch E+F)
- `eslint.config.js` : override `react-refresh` pour `GodsShop.jsx` (export CATALOG pour BAL01)
- `INITIAL_META.demonLordKills` : `0` → `{}` (breaking interne, migration save couverte par TECH02)
- `INITIAL_META.malacharDefeatedThisRun: false` ajouté

### Added (Batch C — UX & Tooltips)
- **UX01** — `<Tooltip>` réutilisable (hover/focus/click) appliqué sur stats héros (HeroSheet) avec descriptions in-game
- **UX02** — Diff comparée équipement : `↑+N` vert / `↓-N` rouge / `—` neutre par stat dans Inventory > Equipment + "vs équipé : <nom>"
- **UX03** — `<ConfirmDialog>` réutilisable (variants destructive/warn/info) appliqué sur Sell rare (rarity ≥ epic), Reset save (PostMortem), Abandon de quête (QuestBoard + action store `abandonQuest`)
- **UX05** — Badge "nouveau loot" dans NavBar > Bag : flag store `unseenLoot` levé par `addResource`/`addEquipmentToInventory`/`addSkillToInventory`, reset au mount d'Inventory
- **U03** — `<link rel="preconnect">` Google Fonts dans index.html + font stacks étendus (Cinzel/Trajan Pro/Georgia fallback chain)
- **B13** — `@keyframes hero-attack` (translateX +18px ping-pong 300ms) déclenchée par handleAttack/handleUseSkill dans Combat.jsx

### Added (Batch D — WorldMap Canvas 2D + QTE)
- **MAP01** — `src/screens/WorldMapCanvas.jsx` : Canvas 2D natif avec requestAnimationFrame loop + ResizeObserver DPR-aware. Helpers purs exportés `lerp`, `pctToPx`, `getNodeAtPosition`. Features : nodes cliquables, paths animés dashoffset, héros lerp 0.04 vers nodeId actif, marker "?" donjon, particles au clic, hover cursor pointer
- **MAP02** — `src/components/QTEBar.jsx` : modal QTE avec barre ping-pong + zone verte + bouton NOW. Helpers purs `isInGreenZone`, `cursorPositionAt`. Intégré pour traverser Blighted Road : succès = entrée immédiate, échec = entrée + coût -5% maxHp

### Added (Batch A — Robustness)
- **TECH01** — `<ErrorBoundary>` class component dans `src/components/` ; wrappé autour de `<main>` dans App.jsx ; fallback UI avec boutons "Reload page" et "Reset save (last resort)"
- **TECH02** — Save schema versioning : constante exportée `SAVE_VERSION = 2`, helper `runMigrations(save)` exporté et `migrateV1ToV2(save)` interne ; `saveGame` inclut `saveVersion`, `loadGame` lit la version et applique migrations en chaîne
- **X02** — Battery anti-régression migration saves : 18 tests dans `gameStore.test.js` couvrant tous les champs `inventory.*`, `equipped`, `activeSkills/passiveSkills`, `battleLog/combatEntryLog/titles`, `world.*`, `meta.divineBonds`, save vide, etc.
- **TECH03** — localStorage quota warning : try/catch dans `saveGame`, flag `saveQuotaExceeded` dans le store, reset au prochain save réussi ou `resetGame`

### Added (Batch B — Calendar + Quest UI)
- **CAL01** — Action `prayAtChurch()` : restaure 40% HP/Mana ET consomme 1 tick (rollover jour si tickCount=23) ; ChurchPanel utilise désormais cette action
- **Q02** — Barres de progression visuelles dans QuestBoard : chaque objectif a maintenant une `<div role="progressbar">` sous le texte `(current/target)` (gold avant complétion, vert quand done)
- **Q06** — Rang aventurier dans QuestBoard : helper exporté `getRankInfo(tokens)` + composant `<RankBanner>` avec 5 tiers (Copper/Silver/Gold/Platinum/Diamond) + barre vers prochain tier

### Fixed
- **B11** — Boss : tab Flee disabled vérifié pour `boss/elite/demon_lord` + tooltip natif "Cannot flee from a boss" + cursor not-allowed + 5 tests explicites

### Added (PROC00 — précédente)
- **PROC00** — Socle de développement : `CONTRIBUTING.md`, `CHANGELOG.md`, `balance/combat_stats.csv`
- Convention de commits Conventional Commits (`type(scope): description`)
- Stratégie de branches `master` ← `dev` ← `feat/<ID>`
- Definition of Done formalisée par type de ticket

### Changed
- `CONTEXT.md` §3 : alignement sur `master` (au lieu de `main`) suite au choix de naming GitHub
- `eslint.config.js` : override `react-refresh/only-export-components: off` pour `src/components/ErrorBoundary.jsx` (class component obligatoire) et `src/screens/QuestBoard.jsx` (helpers co-exportés)

---

## [0.1.2] — 2026-04-25

### Added
- **Infra portraits monstres** : `MonsterPortrait` component dans `Combat.jsx` avec fallback emoji si PNG manquant
- Dossier `public/monsters/` avec guide complet (`README.md`) pour génération via Gemini Nano Banana 2
- 5 portraits initiaux : `ashwood_wolf`, `briar_wraith`, `gloom_bat`, `marsh_serpent`, `rotting_shambler` (gitignored le temps d'optimiser)
- Hint UX dans `Inventory > Skills` tab : *"← Click a mana stone to see equip options"* pour la découvrabilité

### Fixed
- **Crash écran noir au clic sur "Bag"** — vieille save sans `inventory.equipment` ni `hero.equipped` faisait planter `Inventory.jsx` (`Cannot read 'length' of undefined`). Migration `loadGame` étendue : tous les champs `inventory.*`, `equipped`, `activeSkills`, `passiveSkills`, `battleLog`, `combatEntryLog`, `titles` sont maintenant garantis. Inclut une migration rétroactive DV02 (push `divineSkill` dans `activeSkills` si absent).
- **HeroSheet sur la moitié de la page** — retiré le `max-w-2xl` qui capait la largeur du contenu principal à 672 px.

### Tests
- 322 tests (+9 anti-régression migration vieille save)
- Test rendu Inventory avec save dépourvue de `inventory.equipment`
- Test bascule vers emoji après event `error` sur `<img>` MonsterPortrait

---

## [0.1.1] — 2026-04-24

### Added
- **Mégabatch progression** (16 tickets sur la boucle skills + divin + boutique) :
  - `S04` Notif level-up skill — `recentSkillLevelUps` + floating doré "✦ Lv X" + log entry
  - `S05` Cooldown visuel — overlay sombre + grand compteur centré + label `turn(s)`
  - `S07` Réduction de coût par niveau — `getScaledSkillCost(template, level)` exporté de `engine/combat.js`. Lv 2 = -10 % mana, Lv 3 = -20 %.
  - `B09` Coût HP des skills — `canUseSkill` + `applySkillCost` + tests
  - `DV01` Logger Ignareth — debug via `window.__DEITY_DEBUG = true`
  - `DV06` Conditions cachées — anti-régression : tests vérifient que les helpers ne renvoient qu'un boolean
  - `DV08` Bénédiction passive auto — `applyDeityBlessing(stats, deityId)` appliquée à `acceptDeity`. Ignareth +15 % strength immédiat.
  - `DV09` Conditions Sylvara — tests anti-régression (85 % HP × 8 entrées consécutives)
  - `DV10` Héritage skill divin Lv 2+ — `PostMortem.jsx` filtre via `isDivineSkillInheritable`
  - `T03` Boutique : catalogue complet (6 articles)
  - `T06` Rank restoration — restaure 80 % des reputation tokens du run précédent
  - `T07` Bonus skill — power_strike Lv 1 actif offert (placeholder, T07b prévu en v1 pour UI sélection)
  - `T08` Bonus stat — +1 sur stat choisie ou random parmi 5
  - `T09` Skill level up — `skillLevelUps: N` ajoute N niveau au skill hérité, capé à 3
  - `T10` Starter kit — 3 × HP potion + 3 × Mana potion à la transmigration
  - `T11` Compensation solo — détecte `state.hero.deity === null` au moment de la transmigration → +1 niveau gratuit sur chaque skill hérité

### Changed
- `applyTransmigration(shopPurchases = {})` — signature étendue avec arg optionnel par défaut `{}`
- `applyTransmigration` préserve désormais `name` et `heroNamed` à travers les runs (plus besoin de retaper le nom à chaque transmigration)
- `resetGame` et `applyTransmigration` nettoient `recentSkillLevelUps` et `pendingLevelUp`

### Tests
- 319 tests (+57)
- `data/deities.test.js` (NEW) — 22 tests : conditions éveil + `applyDeityBlessing` + DV06 anti-régression
- `engine/combat.test.js` (+8) — `getScaledSkillCost` (6) + `applySkillCost` Lv 2/Lv 3 (2)
- `gameStore.test.js` (+27) — S04 (7) + DV08 (3) + T06–T11 (10) + DV10 (4) + helper setupInheritance + correction tests legacy

---

## [0.1.0] — 2026-04-23

### Added — Polish combat + contenu quêtes
- `B02` Flash ennemi sur attaque — state `attackingEnemyId` + classe `.anim-flash`
- `B07` Dégâts flottants — `FloatingNumbers` 4 types (damage/skill/heal/mana) + auto-cleanup 800 ms
- `B08` Résumé combat amélioré — state `combatStats` (`dmgDealt`, `dmgTaken`, `manaSpent`, `kills`) affichés dans `ResultPanel`
- `Q03` Quêtes boss donjon — 3 nouvelles quêtes : `silence_the_crypt` (200g + 3 🪙 + soul_crush), `storm_the_citadel` (450g + 5 🪙 + forsaken_curse), `end_the_demon` (1000g + 10 🪙 pour Malachar)
- `Q08` NPCs donneurs multiples — export `QUEST_NPCS` (sir_aldric, ironhaven_captain, greywatch_elder) + 2 nouvelles quêtes greywatch_elder (`bog_purge`, `ruins_cleanse`) + NPC affiché sur chaque QuestCard

### Confirmed (ticket déjà fait avant ouverture)
- `Z05` Église soin partiel — `ChurchPanel` existant restaure 40 % HP/Mana

### Tests
- 262 tests (+45)
- `data/quests.test.js` (NEW) — 14 tests : structure QUESTS + QUEST_NPCS + Q03 + Q08
- `screens/Combat.test.jsx` (NEW, via RTL) — 8 tests : rendu + B02 + B07 + B08
- `scenarios.test.js` (+3) — boss run, 3 NPCs en parallèle, tracking
- React Testing Library installée : `@testing-library/react`, `@testing-library/jest-dom`

---

## [0.0.2] — 2026-04-22

### Added — Base v0 jouable
- `C01` Écran création de personnage — `CharacterCreation.jsx` + flag `heroNamed` + action `renameHero`
- `C02` Level up modal — `LevelUpModal.jsx` + state `pendingLevelUp` + intercept dans `App.jsx`
- `B01` Animations de combat — keyframes `shake`, `flash-hit`, `pop-in`, `pulse`, `float-up` dans `index.css` + classes `.anim-*`
- `S01` Skill divin utilisable en combat — `acceptDeity` pousse maintenant le `divineSkill` dans `activeSkills`
- `Z01` Auberge → Quest Board — bouton dans `InnPanel` de `SafeZone`
- `I03` Barre jour/nuit permanente — composant `DayBar` entre `NavBar` et `main`
- `DV02` Skill divin → slot actif — `acceptDeity` merge dans `activeSkills` (respecte limite de 6)
- `T01` Cause de mort précise — `finishCombat(outcome, cause)` + `enemy.name` passé à `heroDeath()`
- `U07` Jetons réputation dans NavBar — `🪙 {reputationTokens}` affiché conditionnellement
- `X03` Reset sauvegarde en jeu — bouton "↺ New Run" dans `PostMortem.jsx`
- `X04` Try/catch sur `processIdleTick` — wrapper dans l'interval de `App.jsx`

### Changed
- `applyTransmigration` reset le monde (nouveau jour 1)
- `gainExp` accumule `pendingLevelUp` pour modale ultérieure

---

## [0.0.1] — 2026-04-04 — 2026-04-20

### Added — Scaffolding & fondations
- Stack initiale : React 19 + Vite 8 + Zustand 5 + TailwindCSS 4 + Vitest 4
- Store Zustand `gameStore.js` avec architecture `{ hero, world, meta }`
- Engine de combat `combat.js` : `calcBaseDamage`, `calcSkillDamage`, `calcDrops`, `buildEnemy`, `enemyAI`, `checkAwakeningConditions`, `isDefeated`, `calcExpGain`
- Données : 23 monstres + 3 boss (Crypt Keeper, Lord of the Forsaken, Malachar), 30+ skills, 8 quêtes, 2 divinités (Ignareth, Sylvara), équipement + crafting, ressources, zones
- Écrans : `WorldMap`, `ZoneView`, `Combat`, `HeroSheet`, `Inventory`, `SafeZone`, `QuestBoard`, `PostMortem`, `GodsShop`, `DivineCall`
- Sauvegarde locale via `localStorage` clé `roguelite_save` + auto-save toutes les 30 s
- Système de quêtes : `objectives` (`type: 'kill' | 'level'`) + `reward`
- `B04` Déséquiper skill — actions `unequipActiveSkill` / `unequipPassiveSkill` + bouton ✕ dans HeroSheet
- `Q01` Écran Quest Board dédié — `QuestBoard.jsx` + case dans `App.jsx`
- `I01 + I02` HP perdus en idle + auto-retour HP < 20 % — damage calculé dans `processIdleTick`
- `X01` Scaling difficulté — `buildEnemy()` utilise `scaleMonsterStats()` (`zone_mult × 1.08^run`)
- `X07` Tests automatisés — 173 tests Vitest répartis sur 3 fichiers (`combat.test.js`, `gameStore.test.js`, `scenarios.test.js`)

---

## Version notation

- `[Unreleased]` regroupe les changements en cours sur `dev` non encore mergés vers `master`.
- À chaque release : déplacer le bloc `[Unreleased]` vers `[X.Y.Z] — YYYY-MM-DD`, vider la section, tagger `master` (`git tag vX.Y.Z`).
- Schéma SemVer :
  - **MAJOR** (1.0.0) : sortie publique du POC, breaking changes pour les saves, multi-univers
  - **MINOR** (0.X.0) : nouvelle feature visible joueur, batch d'améliorations majeures
  - **PATCH** (0.0.X) : bug fix, polish, doc, refacto interne
