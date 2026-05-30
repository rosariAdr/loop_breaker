# Tasks — Roguelite Idle RPG

> Roadmap source : `ROADMAP.csv` (60 items). Ici = vue exploitable au jour le jour.
> Grooming : vérifier INVEST + AC avant de démarrer un ticket M/L. DoD par type dans `CONTRIBUTING.md` (PROC00).

---

## Active

_(rien en cours)_

## Waiting On

_(aucune dépendance externe bloquante)_

> **Note** : `GIT01` + `X06` ont été clos en parallèle de PROC00 (repo créé sur GitHub `rosariAdr/loop_breaker`, branches `master` + `dev`, première PR mergée).

---

## Someday

### v0.1 — P1 : Stabilité & fondations (à faire en premier)

#### Process & Git

#### Robustesse technique
> ✅ TECH01, TECH02, X02 → fait dans Batch A+B (2026-05-04, voir Done)

#### UX critique
- [ ] **UX03 — Confirmation avant actions destructives** (XS)
  - Modal de confirmation avant : vendre un item rare (rarity ≥ Epic), reset de save, abandon de quête
  - AC : modal présent pour les 3 cas, bouton Annuler fonctionnel, pas de confirmation pour Common/Uncommon

#### Balance
- [ ] **BAL01 — Calibration économie tokens** (S)
  - Simuler un run typique dans `scenarios.test.js` et vérifier le ratio tokens gagnés / coûts boutique
  - Coûts cibles : starter_kit=5, skill_levelup=12, rank_restore=25, skill_bonus=50, stat_bonus=50, oracle=8
  - AC : simulation présente, ratio validé (run moyen = 1 article, run excellent = 2-3), CONTEXT.md §9G mis à jour

---

### v0.1 — P2 : Améliorations rapides (XS/S/M)

#### Carte & déplacement
- [ ] **MAP01 — WorldMap Canvas 2D** (M) - migrer WorldMap.jsx de SVG statique vers Canvas 2D natif (useRef + useEffect + requestAnimationFrame) : héros animé (lerp 0.04), click-to-move, safe zones glow, route animée dashoffset, marker "?" donjon, particles au clic de destination
- [ ] **MAP02 — QTE mini-jeu de déplacement** (M) - barre qui avance automatiquement, clic dans zone verte = déplacement rapide, raté = déplacement normal + coût énergie ; déclenché sur traversée Blighted Road
- [ ] **B13 — Keyframe hero-attack sur tour du joueur** (XS) - `@keyframes hero-attack` : translateX(+18px) puis retour 300ms, déclenchée quand le joueur confirme Attack ou Skill

#### Calendrier (fusion I05 + I06 + I07)
> ✅ CAL01 → fait dans Batch A+B (2026-05-04, voir Done)

#### Quêtes & UI
> ✅ Q02 + Q06 → fait dans Batch A+B (2026-05-04, voir Done)
- [ ] **Q07 — Animation récompense quête** (S) - flash mana stone + toast (dépend U01)
- [ ] **U03 — Vérifier fonts Cinzel** (XS) - valider rendu Chrome + Firefox ; fallback `serif` si Google Fonts indisponible
- [ ] **UX01 — Tooltips sur les stats du héros** (S) - hover sur STR/AGI/INT/Chance/HP/Mana → popover expliquant l'effet en jeu
- [ ] **UX02 — Comparaison équipement au survol** (S) - dans Inventory > Equipment, hover sur un item non équipé → diff avec équipé actuel (↑↓ par stat)
- [ ] **UX05 — Badge "nouveau loot" dans NavBar** (XS) - point rouge sur icône Bag si item non consulté depuis le dernier combat

#### Marchands & bâtiments
- [ ] **Z02 — Marchand : plus de consommables** (S) - compléter : antidote_basic, stamina_ration, elixir_minor, mana_crystal
- [ ] **Z03 — Forge : recettes lisibles** (S) - griser ingrédients manquants avec quantité disponible/requise

#### Donjons
- [ ] **D02 — Découverte donjon** (S) - cliquer '?' sur la carte révèle le nom + niveau recommandé
- [ ] **D04 — Loot donjon exclusif** (S) - seals/reliques garantis sur le boss (type `dungeon_seal`, non vendable, utilisable comme monnaie alternative en boutique)
- [ ] **D05 — Warp à la sortie après complétion** (S) - héros warpé hors donjon à la mort du boss, dungeon cleared, position reset à l'entrée de zone
- [ ] **D07 — Idle interdit dans donjons** (XS) - test : aucun toggle idle accessible en `currentScreen === 'dungeon'`

#### Combat
> ✅ B11 → fait dans Batch A+B (2026-05-04, voir Done)
- [ ] **PROC06 — Debug/cheat panel dev** (S) - accessible via `Ctrl+Shift+D` en `import.meta.env.DEV` uniquement ; commandes : give_item, add_tokens, force_deity, skip_day, set_run_count, kill_malachar

#### Process
- [ ] **PROC04 — Balance spreadsheet combat** (S) - Google Sheets ou CSV versionné : stats monstres × zone_mult × run_count → HP/ATK résultants ; mis à jour à chaque changement de scaling
- [ ] **PROC05 — Playtest log structuré** (XS) - fichier `PLAYTESTS.md` : date, durée, run N, jusqu'où, observations, bugs notés, ressenti général

#### Win condition & méta
- [ ] **T04 — Malachar counter résurrection** (S) - incrémenter `meta.demonLordResurrectionCounter` à chaque transmigration post-kill Malachar, reset à 0 quand il respawn après 4 boucles
  > W02 fusionné ici
- [ ] **W03 — Transport vers le prochain monde après kill Malachar** (S) - transport direct ; même socle d'héritage (1 stat + 1 active + 1 passive + boutique) ; bonus automatiques : titre "Slayer of Eldenmoor" + skill Gluttony hors slots (dépend M01 + GLT01)
- [ ] **T13 — Titre permanent Demon Lord Slayer** (S) - affiché sur HeroSheet, persistant entre runs (dépend M01)
- [ ] **M02 — Compteur Demon Lords kills** (XS) - tracker `meta.demonLordKills: { [universeId]: N }` pour win condition globale
> ✅ TECH03 → fait dans Batch A+B (2026-05-04, voir Done)

---

### v1 — Contenu & profondeur (M/L)

#### Tutorial & onboarding
- [ ] **TUT01 — Premier run guidé : tooltips contextuels** (L) - système de tooltips progressifs via flags `meta.seenHints[]` : J1→expliquer idle, J2→donjons, 1ère mort→transmigration, 1er dieu→divine call ; dismissable, jamais réaffichés
- [ ] **TUT02 — Hint idle unlock** (XS) - 1ère fois que le kill count atteint 10 sur un mob → toast "Idle combat unlocked for this enemy type!"
- [ ] **TUT03 — Hint transmigration (1ère mort)** (S) - surbrillance PostMortem au run 1 avec explications sur les 3 choix d'héritage ; flag `meta.firstDeathSeen`

#### Boss unique mechanics
- [ ] **BSS01 — Crypt Keeper : mécanique invocation** (M) - à 50% HP, invoque 2 Skeleton Adds (HP faible, interrompent les skills si non tués en 2 tours) ; pas de loot sur les Adds
- [ ] **BSS02 — Lord of the Forsaken : armure régénérante** (M) - couche d'armure (DEF +30%) se régénère chaque 3 tours ; skill "Cursed Strike" inflige STR−20% pendant 2 tours
- [ ] **BSS03 — Malachar : combat 3 phases** (L) - Phase 1 normal → Phase 2 à 60% HP (Rage +50% ATK, immunité soins) → Phase 3 à 30% HP (Soul Drain : vole 15% HP max/tour) ; drop Soul Rend garanti

#### Événements aléatoires
- [ ] **EVT01 — Framework événements aléatoires** (L) - `triggerZoneEvent(zoneId, dayCount)` : probabilité par zone + cooldown 3 jours min ; types : merchant_visit, ambush, treasure_chest, divine_omen, refugee
- [ ] **EVT02 — Événements de zone implémentés** (M) - 5 événements : marchand errant, embuscade, coffre piégé (loot ou trap CRF01), omen divin, réfugié (recrutement compagnon) — dépend EVT01

#### Personnage
- [ ] **C03 — Portraits personnage** (S) - 8 icônes au choix en CharCreation (warrior/rogue/mage/ranger/monk/knight/witch/bard)

#### Combat — mécanique
- [ ] **B03 — Multi-ennemis 1-3** (M) - rank-based count : zone1=1-2, zone2=1-3, élites=1, boss=1 ; layout Pokémon côté ennemi (1-3 cards) ; ciblage au choix
- [ ] **B05-SPEC — Design doc effets de statut** (S) - définir avant B05 : Poison (X dmg/tour N tours), Stun (skip 1 tour), Burn (X fire dmg/tour + no heal), Slow (−50% AGI N tours) ; valeurs par niveau ; interactions ; doc dans `DESIGN.md`
- [ ] **B05 — Effets de statut** (L) - Poison/Stun/Burn/Slow, max 2 actifs, icônes sur EnemyCard et HeroCard — dépend B05-SPEC
- [ ] **B10 — Sacrifice de stat (skills rares)** (M) - implémenter `cost.stat_sacrifice` : réduction dans `applySkillCost`, affichage sur bouton skill, test récupération si temporaire
- [ ] **B12 — Combat manuel forcé en idle** (S) - si `enemy.level > hero.level + 5` → stop idle + déclenchement combat manuel + toast warning

#### Compagnons de combat
- [ ] **CMP01 — Structure données Companion + traits** (S) - objet `companion` : id/name/traits{loyal,stubborn,cowardly,reckless,prudent}/relationScore(−10→+10)/daysKnown/stats/skills/alive/universeOfMeeting
- [ ] **CMP02 — Génération aléatoire traits à la rencontre** (M) - pondérés par contexte : donjon→cowardly+0.3, taverne→loyal+0.2, disciple allié→loyal+0.3, Zone 2+→reckless+0.2+stubborn+0.2 ; random dans fourchettes [0.1–0.9]
- [ ] **CMP03 — followProbability() dans combat.js** (M) - formule : `base(dominantTrait) + relationScore×0.04 − cowardly×riskLevel + daysKnown>10?0.08:0` ; clampé 0.05–0.95 ; tests sur 5 profils
- [ ] **CMP04 — CompanionCard en combat** (M) - card HP/mana visible, action en cours affichée, réponse textuelle selon trait dominant (5 pools de phrases par trait)
- [ ] **CMP05 — Interface conseil joueur (3s)** (L) - fenêtre flottante sur le tour du compagnon : 3s pour envoyer un conseil ; réponse textuelle contextuelle ; sans conseil → companionAI() seul
- [ ] **CMP06 — Recrutement compagnon SafeZone + donjon** (M) - taverne (coût gold) + survivants dans salles Event de donjon ; max 1 compagnon actif
- [ ] **CMP07 — Permadeath + message narratif** (S) - mort = permanent ; relationScore ≥ 7 → message spécial ; transmigration → "resté dans cet univers"
- [ ] **CMP08 — Easter egg relation ≥ 9** (S) - compagnon laisse un item ou skill dans la boutique des dieux au run suivant
- [ ] **CMP09 — Évolution relationScore** (S) - +1 conseil suivi+survie, +2 soin, +3 protection à 0HP, −1 conseil ignoré+blessure, −3 fuite, −1 dieu ennemi, +1 par 5 jours ensemble ; tests pour chaque cas

#### Skill Gluttony
- [ ] **GLT01 — Skill Gluttony structure + logique passive** (M) - passive permanente ; cooldown 5 jours ; auto onKill 10% chance ; absorbe 10% d'une stat aléatoire du monstre de façon permanente ; stocké dans `meta.permanentStatBoosts`
- [ ] **GLT02 — Assassinat one-shot detection + player choice** (M) - détection : kill en 1 action depuis HP max (flag `enemyUntouched`) ; si assassinat → 100% garanti + joueur choisit quelle stat
- [ ] **GLT03 — Cooldown 5 jours + affichage HeroSheet** (S) - tracker `meta.gluttonyLastUsed` ; "Gluttony ready" / "X days remaining"
- [ ] **GLT04 — Absorption log** (XS) - toast type `gluttony` + entry battleLog "Gluttony — Absorbed +2 STR from Ashwood Wolf"

#### Mini-jeux de crafting
- [ ] **CRF01 — Debuff passif temporaire (7 jours)** (S) - structure `duration: { type: 'days', remaining: N }` ; exemples : "Burnt Hands" STR−10%, "Poisoned" HPmax−15%, "Fatigue" AGI−20%, "Black Smoke" Chance−25%
- [ ] **CRF02 — Mini-jeu alchimie : dosage de liquide** (M) - tube se remplit automatiquement, joueur stoppe dans zone cible ; parfait=+2 rarity, bon=+1, neutre=normal, raté=null+debuff 7j, catastrophe=null+debuff 7j sévère+passif négatif permanent
- [ ] **CRF03 — Mini-jeu forge : martelage rythmique** (M) - curseur pendule, 3 frappes dans zone verte ; même barème que CRF02
- [ ] **CRF04 — Rareté craft selon score mini-jeu** (S) - connecter score à `createEquipmentInstance` — dépend CRF02 ou CRF03
- [ ] **CRF05 — Affichage debuffs actifs HeroSheet** (S) - section "Active Debuffs" : icône + nom + durée ; permanents marqués "Cure needed"
- [ ] **CRF06 — Antidote craftable chez l'alchimiste** (M) - recette `antidote_minor` dans ALCHEMY_RECIPES, supprime 1 passif négatif permanent — dépend Z04

#### Skills
- [ ] **S02 — Aperçu skills ennemis** (M) - flou < 5 kills, révélé après ; dans ZoneView au hover
- [ ] **S03 — Stack mana stones doublons** (S) - `Map<skillId, {count, stone}>` au lieu d'array
- [ ] **S06 — Contenant cosmétique selon univers** (S) - champ `container: 'mana_stone'|'manuscript'|'chip'` ; affiché dans InventoryCard ; mécanique identique
- [ ] **T07b — UI sélection skill bonus (pool = skills découverts)** (M) - remplacer `power_strike` hardcodé : sélection dans GodsShop parmi skills des runs précédents ; fallback run 1 = 3 skills Zone 1

#### Quêtes
- [ ] **NPC02 — 10 nouvelles quêtes contenu** (M) - couvrir rangs Cuivre→Argent : élites, donjons, livraison, exploration
- [ ] **Q04 — Quêtes exploration** (S) - type `'visit'` : compléter quand `world.visitedSpots` inclut la cible
- [ ] **Q05 — Quêtes craft** (M) - type `'craft'` : tracker `meta.craftCount` incrémenté à chaque craft réussi

#### Bâtiments
- [ ] **Z04 — Alchimiste** (M) - ALCHEMY_RECIPES (6 recettes de base) ; NPC dialogue simple — prérequis CRF02 + CRF06
- [ ] **Z06 — Maître forgeron** (M) - MASTER_RECIPES (5 recettes Rare/Epic) ; tirage 10% à la génération du village
- [ ] **NPC01 — Système de dialogue NPC (arbre simple)** (M) - `DialogueNode { text, options: [{label, nextId}] }` dans `data/dialogues/` ; 2-3 nœuds max par NPC

#### Donjons
- [ ] **D01 — Flux donjon complet** (L) - path map : Entrée → choix A (Combat|Trésor) → choix B (CombatElite|Repos|Event) → Boss ; transitions inter-salles ; idle interdit
- [ ] **D03 — Carte de donjon** (M) - 5 nodes Canvas/SVG par type, chemin tracé, nœud actuel mis en évidence
- [ ] **D06 — Donjon spawn la nuit suivante** (M) - cycle sommeil déclenche respawn + position aléatoire + marker "?" — dépend CAL01 + MAP01

#### Divinités
- [ ] **DV03 — Fidélité inter-run** (M) - au retour dans le même univers, dieu précédent se souvient → pré-sélection dans DivineCall avec message de reconnaissance
- [ ] **DV04 — Voltaris implémenté** (M) - Foudre+Action, Chaotique ; awakening : 5 combats <30% HP ; blessing +20% AGI ; "Chain Lightning" + "Overclock" ; relations : Ignareth+6, Sylvara−4
- [ ] **DV07 — Refus de divinité = run solo** (M) - bouton "Refuse" dans DivineCall + flag `hero.soloRun: true` + bonus T11 à la transmigration

#### Transmigration & boutique
- [ ] **T02 — Transmigration animée** (M) - écran de transition animé entre GodsShop et renaissance
- [ ] **T05 — Socle universel d'héritage** (M) - écran obligatoire avant GodsShop : choisir 1 stat + 1 active + 1 passive
- [ ] **T12 — Skill suprême Demon Lord ("Soul Rend")** (M) - héritable sans condition ; flag `skill.alwaysInheritable: true`

#### Idle & UI
- [ ] **I04 — Toast loot idle** (S) - dépend U01
- [ ] **I08 — Choix joueur en idle** (M) - config avant lancer idle : zone, monster type, craft en parallèle, seuil HP personnalisable
- [ ] **U01 — Système de toasts global** (M) - `toastStore.js` Zustand : `{ toasts, addToast(msg, type, duration), removeToast(id) }` ; types : loot/levelup/quest/divine/gluttony/warning/error ; `<ToastContainer>` dans App.jsx ; débloque Q07, I04
- [ ] **U04 — Transitions écrans** (S) - fade 150ms entre tous les `currentScreen` changes
- [ ] **U06 — Décor WorldMap Canvas 2D** (M) - arbres/marais/ruines dessinés programmatiquement (positions seedées) — dépend MAP01
- [ ] **U08 — Vue Carte = écran principal** (M) - WorldMap Canvas 2D comme home, zones cliquables — dépend MAP01
- [ ] **U09 — Combat à la Pokémon (1 à 3 ennemis)** (M) - hero bottom-left + ennemis top-right 1-3 cards, barres HP/mana, ciblage — dépend B03
- [ ] **U10 — Post-mortem complet** (M) - cause, zone, jour, niveau, skills+niveaux, stats, meilleure action, kills totaux, tokens gagnés, temps de run
- [ ] **U11 — Boutique des dieux (écran à part entière)** (L) - thème "entre deux mondes" ; passage obligé entre PostMortem et renaissance
- [ ] **U12 — Divine Call event (full-screen interrupt)** (M) - apparition dieu, message lore, choix 2 skills, Accept/Refuse, non dismissable

#### Balance & technique
- [ ] **BAL02 — Calibration boss difficulty + playtest** (S) - 3 runs jusqu'au boss par zone ; noter HP restant moyen, nombre de morts ; ajuster zone_mult boss si besoin ; documenter dans PLAYTESTS.md
- [ ] **BAL03 — Calibration idle kill rate vs progression** (S) - vérifier que l'idle seul permet d'atteindre Zone 2 en ~10 jours in-game
- [ ] **TECH04 — Performance Canvas 2D — budget 60fps** (S) - Chrome DevTools Performance ; target <8ms/frame ; mémoiser gradients statiques hors du loop
- [ ] **TECH05 — JSDoc sur engine/combat.js** (M) - `@param`, `@returns`, `@example` sur toutes les fonctions exportées

#### Contenu
- [ ] **CONT01 — Portraits monstres restants** (S) - 18/23 PNG manquants via pipeline `public/monsters/README.md` ; priorité : 6 monstres Ashenvale communs
- [ ] **CONT04 — Noms propres donjons Zone 2** (XS) - remplacer placeholders par noms définitifs

#### Win condition & méta
- [ ] **W01 — Demon Lord Malachar (POC)** (L) - boss final Zone 2 ; mécaniques BSS03 ; drop Soul Rend + 200 tokens + titre — dépend BSS03 + GLT01 + M01
- [ ] **M01 — Système de titres permanents** (S) - `meta.titles: string[]` + affichage HeroSheet

---

### v2 — Refonte / ambition (L/XL)

#### Carte
- [ ] **MAP03 — Migration WorldMap vers PixiJS v8** (L) - remplacer Canvas 2D (MAP01) par PixiJS : `npm install pixi.js @pixi/react` ; Sprite héros + effets WebGL (glow, bloom, shaders) ; Zustand reste source de vérité ; ~6-8h — dépend MAP01

#### Combat
- [ ] **B06 — ATB (Active Time Battle)** (XL) - refonte complète moteur combat : barre de vitesse par acteur, action quand pleine, interruptions possibles

#### Historique & stats
- [ ] **HIS01 — Historique des runs** (M) - liste N derniers runs : cause de mort, zone max, boss tués, durée, tokens ; stocké dans `meta.runHistory[]`
- [ ] **HIS02 — Statistiques globales meta** (S) - total kills par type, temps joué, Demon Lords tués, compagnons perdus, skills uniques découverts

#### Événements
- [ ] **EVT03 — Événements nocturnes** (M) - pendant le sommeil : rêve divin (indice éveil), vol ressources (relation divine négative), vision du futur (preview donjon) — dépend EVT01

#### UI
- [ ] **U02 — Responsive mobile** (L) - layout <768px, touch events, Canvas 2D scaled
- [ ] **U05 — SFX combat** (L) - Web Audio API : attaque, skill, mort, level-up, divine call
- [ ] **UX04 — Navigation clavier complète** (M) - Tab + Entrée + Echap sur tous les écrans ; combat jouable sans souris

#### Divinités
- [ ] **DV05 — Aura divine visuelle** (S) - border colorée sur HeroCard selon divinité active
- [ ] **DV11 — Relations inter-divines −10/+10** (L) - matrice symétrique `DIVINE_RELATIONS[idA][idB]` ; actions joueur font bouger les scores
- [ ] **DV12 — Oracle divin (boutique)** (S) - révèle le score de relation pour le prochain univers (8 tokens) — dépend DV11

#### Multi-univers
- [ ] **X08 — Architecture multi-univers** (L) - `currentUniverse` + `universeHistory[]` dans save ; data namespaced dans `src/data/universes/{id}/` ; WorldMap switche selon univers
- [ ] **X09 — Règle de rotation (fenêtre glissante)** (M) - `forbidden = {actuel, précédent}` ; pool = 2 restants ; pondération par ancienneté — dépend X08

#### Technique & process
- [ ] **TECH06 — Feature flags** (M) - objet `FEATURE_FLAGS` dans `config.js` : activer/désactiver features sans recompiler
- [ ] **NPC03 — NPCs récurrents avec mémoire** (M) - NPCs se souviennent du rang aventurier + divinité actuelle → dialogues différents au retour

#### Contenu
- [ ] **CONT02 — Descriptions lore par zone** (XS) - flavor text dans le header ZoneView (3-4 lignes narratives par zone)
- [ ] **CONT03 — Flavor text sur les skills** (XS) - champ `lore: string` dans skill templates, affiché en italique dans InventoryCard

---

## Done

### v0.1 — Batch A+B : Robustesse + Calendar + Quest UI (2026-05-04)

**8 tickets, +63 tests (322 → 385), TDD strict, 0 commit (branche `feat/batch_AB` pour review GitKraken)**

#### Batch A — Robustesse technique
- [x] ~~**TECH01** — React Error Boundaries~~ (2026-05-04)
  - Nouveau `src/components/ErrorBoundary.jsx` (class component, seul moyen en React) wrappé autour de `<main>` dans App.jsx.
  - Fallback UI : message d'erreur abrégé + boutons "Reload page" et "Reset save (last resort)" avec confirm().
  - 8 tests dans `ErrorBoundary.test.jsx` (rendu normal, throw → fallback, message affiché, reload, reset save avec/sans confirm, log via componentDidCatch).
  - eslint.config.js : override `react-refresh/only-export-components: off` pour ce fichier (incompat class components).
- [x] ~~**TECH02** — Save schema versioning~~ (2026-05-04)
  - Constante exportée `SAVE_VERSION = 2` en haut de `gameStore.js`.
  - Helper `runMigrations(save)` exporté + `migrateV1ToV2(save)` interne séquentiel.
  - `saveGame` inclut `saveVersion` dans le JSON. `loadGame` lit la version et applique les migrations en chaîne.
  - 5 tests dédiés (saveVersion écrit, constant exportée, legacy v1 sans saveVersion, save explicite v1 → v2, runMigrations testable directement).
- [x] ~~**X02** — Tests migration saves (battery)~~ (2026-05-04)
  - 18 tests anti-régression dans `gameStore.test.js` couvrant `inventory.equipment/manaStones/consumables/resources` absents, `equipped`, `activeSkills/passiveSkills`, `battleLog/combatEntryLog/titles`, `world.completedQuests=0` (legacy number), `world.dungeons/monsterKillCounts`, `meta.divineBonds`, save vide, hero/world/meta absent.
  - Pattern factorisé `buildSaveMissing(path, value)` pour faciliter l'ajout de tests futurs.
- [x] ~~**TECH03** — localStorage quota warning~~ (2026-05-04)
  - Try/catch autour de `localStorage.setItem` dans `saveGame`. Sur erreur (`QuotaExceededError` ou autre) : `console.error` + flag `saveQuotaExceeded: true` dans le store.
  - Flag reset à `false` au prochain save réussi et au `resetGame`.
  - 4 tests : flag par défaut, mock setItem qui throw, succès reset, resetGame reset.

#### Batch B — Calendar + Quêtes UI
- [x] ~~**CAL01** — Cycle jour/nuit complet~~ (2026-05-04)
  - Nouvelle action `prayAtChurch()` dans gameStore.js : restaure 40% HP/Mana ET consomme 1 tick (avec rollover jour si tickCount=23).
  - `ChurchPanel` (SafeZone.jsx) utilise `prayAtChurch` au lieu de `healHero`+`restoreHeroMana`. Sous-titre "Restores 40% HP & Mana · costs 1 tick".
  - 4 tests CAL01 + complément test cycle 24 ticks.
- [x] ~~**Q02** — Barres de progression visuelles~~ (2026-05-04)
  - Dans `QuestBoard.jsx` chaque objectif affiche maintenant : ligne texte `(current/target)` + barre `<div role="progressbar">` en dessous (gold sur dark, vert quand complété).
  - 4 tests : présence des barres, `aria-valuenow` correct, saturation à valuemax si over-kill, pas de barre sur quêtes complétées.
- [x] ~~**Q06** — Rang aventurier dans Quest Board~~ (2026-05-04)
  - Helper `getRankInfo(tokens)` exporté + constante `RANK_TIERS` (Copper 0-9, Silver 10-29, Gold 30-69, Platinum 70-149, Diamond 150+).
  - Composant `<RankBanner>` affiché en haut de QuestBoard : tier coloré + barre de progression vers le tier suivant + label "X/Y to next tier" ou "MAX".
  - 14 tests : seuils tiers, edge cases (négatif/undefined), rendu UI avec aria, MAX label.
- [x] ~~**B11** — Boss : fuite désactivée~~ (2026-05-04)
  - Tab "Flee" disabled (déjà existant) + ajout d'un `title="Cannot flee from a boss"` (tooltip natif) + `cursor: not-allowed`.
  - 5 tests explicites dans `Combat.test.jsx` : tab disabled sur boss/elite/demon_lord, tooltip présent, tab actif sur common.

#### Cleanup lint
- 2 erreurs `Unused eslint-disable directive` retirées (gameStore.js + ErrorBoundary.jsx)
- Override `eslint.config.js` pour autoriser exports non-composants dans `ErrorBoundary.jsx` et `QuestBoard.jsx`

### v0.1 — Process & socle développement (2026-04-25)

- [x] ~~**GIT01** — Setup Git + stratégie de branches~~ (2026-04-25)
  - Repo créé sur GitHub : `rosariAdr/loop_breaker`
  - Branches : `master` (stable, taggable) et `dev` (intégration)
  - `.gitignore` correct (node_modules, dist, .claude/, public/monsters/*.png)
- [x] ~~**X06** — Push initial sur GitHub~~ (2026-04-25)
  - PR #1 `dev → master` mergée — 30+ fichiers source + 322 tests + docs
  - Convention de commits adoptée dès ce premier commit (`chore: initial codebase import — v0.1.2`)
- [x] ~~**PROC00** — Socle de développement~~ (2026-04-25)
  - `CONTRIBUTING.md` (~280 lignes) : workflow Git, convention commits, DoD par type, conventions code, checklist fin de session, règle save, process PR, règle de sync `dev` ↔ `master`
  - `CHANGELOG.md` : Keep a Changelog + SemVer ; entrées rétroactives v0.0.1 / v0.0.2 / v0.1.0 / v0.1.1 / v0.1.2 + section [Unreleased]
  - `balance/combat_stats.csv` (115 lignes : 23 monstres × 5 niveaux de scaling) + `scripts/generate-balance-csv.mjs` pour régénérer après modif data
  - `CONTEXT.md` §3, §10 et §12 mis à jour (main → master, références PROC00)
  - AC : `npm run test:run` + `npm run build` + `npm run lint` verts ; checklist appliquée sur le commit de clôture

### v0 — Base jouable (clôturée — avril 2026)

- [x] ~~**C01** — Écran création de personnage~~ (2026-04-22)
  - `CharacterCreation.jsx` + flag `heroNamed` + `renameHero` action
- [x] ~~**C02** — Level up modal~~ (2026-04-22)
  - `LevelUpModal.jsx` + `pendingLevelUp` state + intercept dans App.jsx
- [x] ~~**B01** — Animations de combat~~ (2026-04-22)
  - Keyframes `shake`, `flash-hit`, `pop-in`, `pulse`, `float-up` dans `index.css`
- [x] ~~**B04** — Déséquiper skill~~ (2026-04-20)
  - Actions `unequipActiveSkill` / `unequipPassiveSkill` + bouton ✕ dans HeroSheet
- [x] ~~**S01** — Skill divin utilisable en combat~~ (2026-04-22)
  - `acceptDeity` pousse maintenant dans `activeSkills`
- [x] ~~**Q01** — Écran Quest Board dédié~~ (2026-04-20)
  - `QuestBoard.jsx` + case dans App.jsx + accès depuis InnPanel
- [x] ~~**Z01** — Auberge → Quest Board~~ (2026-04-22)
  - Bouton dans `InnPanel` de SafeZone
- [x] ~~**I01 + I02** — HP perdus en idle + auto-retour HP < 20%~~ (2026-04-20)
  - Damage calculé dans `processIdleTick` + auto-désactivation idle
- [x] ~~**I03** — Barre jour/nuit permanente~~ (2026-04-22)
  - Composant `DayBar` entre NavBar et main
- [x] ~~**DV02** — Skill divin → slot actif~~ (2026-04-22)
  - `acceptDeity` merge dans `activeSkills` (respecte limite de 6)
- [x] ~~**T01** — Cause de mort précise~~ (2026-04-22)
  - `finishCombat(outcome, cause)` + `enemy.name` passé à `heroDeath()`
- [x] ~~**U07** — Jetons réputation dans NavBar~~ (2026-04-22)
  - `🪙 {reputationTokens}` affiché conditionnellement
- [x] ~~**X01** — Scaling difficulté~~ (2026-04-04)
  - `buildEnemy()` utilise `scaleMonsterStats()` (zone_mult × 1.08^run)
- [x] ~~**X03** — Reset sauvegarde en jeu~~ (2026-04-22)
  - Bouton "↺ New Run" dans `PostMortem.jsx`
- [x] ~~**X04** — Try/catch sur processIdleTick~~ (2026-04-22)
  - Wrapper dans l'interval de App.jsx
- [x] ~~**X07** — Tests automatisés~~ (2026-04-23)
  - **173 tests** Vitest (88 initiaux + 60 unitaires + 24 scénarios + 1 fix)

### Bug-fixes UI (2026-04-23)

- [x] ~~**Crash écran noir au clic sur "Bag"**~~ - migration `loadGame` étendue : tous les champs `inventory.*`, `equipped`, `activeSkills`, `passiveSkills`, `battleLog`, `combatEntryLog`, `titles` garantis.
- [x] ~~**HeroSheet largeur 50%**~~ - retiré le `max-w-2xl`
- [x] ~~**Inventory > Skills hint**~~ - texte "← Click a mana stone to see equip options"
- [x] ~~**Tests UI complets**~~ - `screens.test.jsx` 47 tests (smoke + nav + layouts + flows)

### v0.1 — Mégabatch progression : Skills + Divin + Boutique (2026-04-24)

**16 tickets, +57 tests (319 total)**

- [x] ~~**S04**~~ Notif level-up skill — `recentSkillLevelUps` + floating doré
- [x] ~~**S05**~~ Cooldown visuel — overlay + compteur centré
- [x] ~~**S07**~~ Réduction coût/niveau — `getScaledSkillCost(template, level)`
- [x] ~~**B09**~~ Coût HP skills — `canUseSkill` + `applySkillCost` + tests
- [x] ~~**DV01**~~ Logger Ignareth — `window.__DEITY_DEBUG`
- [x] ~~**DV06**~~ Conditions masquées anti-régression — tests boolean only
- [x] ~~**DV08**~~ Blessing passive auto — `applyDeityBlessing` dans `acceptDeity`
- [x] ~~**DV09**~~ Conditions Sylvara — tests (5 tests)
- [x] ~~**DV10**~~ Héritage Lv 2+ — `isDivineSkillInheritable` dans PostMortem
- [x] ~~**T03**~~ Catalogue boutique complet — 6 articles CATALOG
- [x] ~~**T06**~~ Rank restoration — 80% tokens run précédent
- [x] ~~**T07**~~ Bonus skill — default power_strike (T07b = UI sélection, v1)
- [x] ~~**T08**~~ Bonus stat — +1 stat choisie ou random
- [x] ~~**T09**~~ Skill level up — `skillLevelUps: N` capé à 3
- [x] ~~**T10**~~ Starter kit — 3× HP + 3× Mana potions
- [x] ~~**T11**~~ Compensation solo — +1 lv si `deity === null`

### v0.1 — Polish combat + contenu quêtes (2026-04-23)

- [x] ~~**B02**~~ Flash ennemi sur attaque — `attackingEnemyId` + `.anim-flash`
- [x] ~~**B07**~~ Dégâts flottants — `FloatingNumbers` 4 types + cleanup 800ms
- [x] ~~**B08**~~ Résumé combat — `combatStats` (dmgDealt/dmgTaken/manaSpent/kills)
- [x] ~~**Q03**~~ Quêtes boss donjon — silence_the_crypt, storm_the_citadel, end_the_demon
- [x] ~~**Q08**~~ NPCs donneurs multiples — sir_aldric, ironhaven_captain, greywatch_elder
- [x] ~~**Z05**~~ Église soin partiel — `ChurchPanel` 40% HP/Mana
- [x] ~~**Tests étendus**~~ — **208 tests** (+35), RTL installé
