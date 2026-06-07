# Tasks — Loop Breaker (Roguelite Idle RPG)

> Backlog source de vérité. Grooming : vérifier INVEST + AC avant de démarrer un ticket M/L. DoD par type dans `CONTRIBUTING.md` (PROC00).
> **Versioning** : `v1` = POC figé · `v1.1` = UI parchemin + sprites + QoL · `v1.5` = profondeur (NPC → STA → PROG) · `v2` = ambition.
> Dernière réorganisation : 2026-06-03 (grooming complet + intégration handoff Claude Design + stats STA chiffrées).

---

## Active

_(rien en cours)_

## Waiting On

_(aucune dépendance externe bloquante)_

> **Note** : `GIT01` + `X06` + `PROC00` clos (repo `rosariAdr/loop_breaker`, branches `master` + `dev`).

---

## v1 — POC (FIGÉE) ✅

> Le POC est **complet et gagnable de bout en bout** (Malachar tuable). **Ne rien ajouter ici.** Seule la stabilisation reste avant de figer la v1 et d'attaquer l'habillage v1.1.

- [ ] **BAL02 — Calibration boss difficulty + playtest** (S) - 3 runs jusqu'au boss par zone ; noter HP restant moyen + nombre de morts ; ajuster `zone_mult` boss si besoin ; documenter dans PLAYTESTS.md
- [ ] **BAL03 — Calibration idle kill rate vs progression** (S) - vérifier que l'idle seul permet d'atteindre Zone 2 en ~10 jours in-game ; ajuster `dmgTaken` idle
- [ ] **TECH04 — Performance Canvas 2D — budget 60fps** (S) - Chrome DevTools Performance ; target <8ms/frame ; mémoiser gradients statiques hors du loop
- [ ] **TECH05 — JSDoc sur engine/combat.js** (M) - `@param`, `@returns`, `@example` sur toutes les fonctions exportées

---

## v1.1 — UI parchemin, sprites & QoL (release présentable)

> Objectif : transformer le POC fonctionnel en jeu **présentable**. **Spec complète : `UI_HANDOFF.md`** (design system parchemin diégétique « table en bois », stage 1920×1080, tokens CSS canoniques, 6 écrans, 2 couches d'assets, animations). Esthétique : joyeuse/héroïque type overworld Dragon Quest, **PAS** sombre/gothique. Stratégie : **coquille d'abord → écran par écran → sprites en dernier**. À faire d'un bloc pour la cohérence visuelle.
>
> **Décisions actées (2026-06-03)** :
> - **Stats** : mapper l'UI sur les stats actuelles du jeu (pas de refonte data).
> - **Canvas fixe 1920×1080 + scaler** confirmé (PC-first ; Tailwind conservé + tokens CSS).
> - **Écrans plein-écran** (Combat/GodsShop/DivineCall/PostMortem) : **mixte au cas par cas** (Combat probablement en takeover, les autres possiblement dans la coquille — choix documentés à l'implémentation).
> - **Assets** : **hybride** — le dev fournit certaines sprites au fil de l'eau ; le reste en placeholder/art-slot (emoji), swap progressif (CONT01/CONT06). UI-A/UI-B ne bloquent pas sur les assets.
> - **UI05 dialogue** : coquille vide / placeholder en v1.1 ; contenu en v1.5.

### Batch UI — migration parchemin

- [ ] **UI01 — Coquille parchemin : scène + topbar + breadcrumb + sidebar + tokens** (M/L) — *`UI_HANDOFF.md` §IDENTITÉ + §LA SCÈNE*
  - **Tokens** : toutes les CSS custom properties (`--parchment`, `--ink`, `--forest`, `--gold`, `--amber`, jauges HP/MP/XP…) dans `index.css` ; fonts **Cinzel + Crimson Text** ; texture parchemin (grain de bruit + liseré vieilli).
  - **Scène** : stage fixe 1920×1080 centré + scaler `transform: scale(min(vw/1920,vh/1080))`, letterbox sur radial `#1c140d→#3a2a1c`, fond table en planches de bois. **DÉCIDÉ : on part sur le canvas fixe** (PC-first ; responsive mobile reporté à U02/v2). Tailwind conservé pour l'utilitaire + tokens CSS/classes custom pour les pièces bespoke (parchemin/bois).
  - **Topbar 64px** : Run#/Lv + barre XP ; jauges HP + MP (anim largeur .5s) ; groupe stats `☀ Day · T x/24 · 🪙` (**DayBar fusionnée dans la topbar — plus de ligne jour/nuit séparée**) ; onglets pills `Map · Hero · Bag · Save`.
  - **Breadcrumb 30px** (chemin de région, fil courant en `--gold`) + **sidebar journal 286px** (Location/Deity/Demon Lord/Reputation + zone Actions épinglée en bas) + **système de boutons** parchemin (`.primary` ambre).
  - AC : la coquille rend, les écrans existants tournent dedans **sans régression de logique**, build OK.
- [ ] **UI02 — World Map parchemin** (M) — *§Écran 01*. Cadre boussole, champs de zone organiques (Ashenvale vert / **Grimspire verrouillé désaturé + tooltip niveau**), trails pointillés à l'encre + **Blighted Road** danger rouge, 8 nodes médaillons (positions dans le handoff), **node donjon** violet `?` + aura, **avatar héros chibi** + halo or (transition marche `.6s`). Conserve la logique Canvas/nodes (MAP01).
- [ ] **UI03 — Village parchemin** (M) — *§Écran 02*. Cadre « vine », place + **puits**, chemins de terre rayonnants, **4 bâtiments** (sprite encadré + enseigne suspendue + sous-titre) → clic = overlay PNJ, déco (hens/barrels), avatar près du puits. Remplace le SafeZone sombre actuel.
- [ ] **UI04 — Hunting Forest parchemin** (M) — *§Écran 03*. Cadre vine, **clearings** = disques verts (sprite monstre + terrain + plaque + **kill bar** + statut) ; états *disponible* / *idle actif* (anneau safe-green + badge `◆ IDLE`) / *verrouillé* (`🔒`, "Fight 10× to unlock idle") ; idle log en sidebar. Conserve Fight/Idle (B03, S02).
- [ ] **UI05 — Overlay dialogue PNJ** (M) — *§Écran 04*. Panneau ancré bas sur scrim, **colonne portrait** (cadre woodgrain + portrait pixel, **6 émotions** Talk/Calm/Smile/Sadness/Aggression/Special selon le ton) + **colonne corps** (eyebrow + dialogue Crimson italic 26px + boutons d'action). **DÉCIDÉ : coquille vide / dialogues placeholder en v1.1** (le contenu et l'arbre de dialogue NPC01/NPC04 viennent en v1.5 ; on en rediscute).
- [ ] **UI06 — Hero Sheet overlay parchemin** (S/M) — *§Écran 05*. Modale centrée, portrait woodgrain, grille équipement 6 slots, **Vitals & Attributes** (cartes + barres), Derived, Skills, Allegiance. Conserve Active Debuffs (CRF05) + Titles (M01) + Gluttony (GLT03). **DÉCIDÉ : mapper l'UI sur les stats actuelles** (strength/agility/intelligence/chance/def + hp/mana) — pas de refonte data ni de migration. On reprend la mise en page du handoff mais avec les stats du jeu (les labels Vitality/Dexterity/Faith/Luck du handoff sont indicatifs).
- [ ] **UI07 — Inventory overlay parchemin** (S) — *§Écran 06*. Modale, **Carried Items** grille 6 colonnes + pastille d'or, **Equipped** grille 6 slots. Conserve les onglets + stack mana stones (S03).
- [ ] **UI08 — Intégration sprites (couches A + B)** (L) — *§ASSETS*. **Couche A** chibi cartoon (carte/combat : héros, façades de bâtiments, monstres, Malachar) + **Couche B** portraits pixel 128×128 à 6 émotions (overlays dialogue). **Règle stricte : jamais mélanger chibi et portrait pixel à la même échelle dans un même cadre.** Héros placeholder = chibi "Necromancer of the Shadow" (Idle/Walking/Dying). Dépend CONT01/CONT06.
- [ ] **UI09 — Transition parchemin + toasts + écrans hors handoff** (M) — **Échange de parchemin** à l'entrée/sortie de zone (enroule monde / déroule zone, **≤350ms, skippable après le 1er run** — la navigation arrive des dizaines de fois/session) ; **toasts** parchemin (bulle sombre bas-centre, bordure dorée, italique, ~2.6s) ; restyle des écrans **hors handoff** (Combat, GodsShop, DivineCall, PostMortem) au même langage.

> **État d'implémentation (2026-06-06, branche `feat/ui-parchemin`, non mergée)** : UI01→UI07 faits ; UI09 partiel (PostMortem + GodsShop portés ; DivineCall gardé sombre/mystique ; Combat déjà abouti + héros animé). **DEV01** (harnais de test) + assets (sprites monstres en forêt, héros idle animé carte/village/combat) faits. Suite = batches ci-dessous.

### Batch UI-IMM — immersion fenêtres (retours playtest 2026-06-06)

> Les overlays « plein écran » cassent l'immersion : on veut **tout dans des fenêtres ancrées sur le monde** (style panneau PNJ), sans empiler de 2e fenêtre.

- [ ] **IMM01 — Actions du bâtiment inline dans le panneau PNJ (plus de 2e fenêtre)** (M) — *Bug remonté : clic auberge → overlay PNJ (OK) mais « Rest at the Inn » ouvre une **2e fenêtre** (modale sombre) → coupe l'immersion.*
  - Le panneau PNJ porte **directement** les actions réelles du bâtiment. Actions simples (Rest…) **exécutées en place**, retour affiché dans la zone dialogue (« Vous vous reposez… HP/MP restaurés, le temps avance »).
  - Inn (Marta) : `🛏 Rest at the Inn` (repos inline : heal + avance temps) · `📜 Quest Board` · `✕ Leave`.
  - AC : « Rest at the Inn » n'ouvre **plus** de 2e fenêtre ; effet appliqué + feedback dans le même panneau.
- [ ] **IMM02 — Sous-UI fonctionnelles rendues DANS le panneau (suppression `.lb-modal`)** (L) — *dépend IMM01.*
  - Bâtiments à UI riche (Marchand, Forge, Alchimie, Maître-forgeron, Entraîneur, Église) : leur contenu s'affiche **dans le corps du panneau PNJ** (body remplacé/scrollable), pas dans une modale séparée. Bouton `◄ Back` revient au dialogue, `✕ Leave` ferme.
  - Implique : retirer la modale `.lb-modal` du Village ; reparenter `InnPanel/MerchantPanel/BlacksmithPanel/AlchemyPanel/MasterSmithPanel/KnightTrainerPanel/ChurchPanel` dans le panneau.
  - **DÉCIDÉ (2026-06-06)** : le cas des **mini-jeux** (forge/alchimie) inline-vs-fenêtre est **différé** (on tranchera au retravail des mini-jeux). Ce batch reparente les panneaux non-minijeu ; forge/alchimie peuvent rester en fenêtre temporairement.
- [ ] **IMM03 — Restyle parchemin des panneaux fonctionnels** (M) — *dépend IMM02.* Les panneaux ne sont plus sur fond sombre → recolorer leur intérieur (texte `--ink`, cartes parchemin, boutons ambre) pour lisibilité/cohérence sur le panneau clair.
- [ ] **IMM04 — Hero Sheet & Inventory en overlay immersif (sur l'écran courant)** (M) — *Aujourd'hui Hero/Bag = écrans takeover → on « quitte » le monde.*
  - Les afficher en **overlay au-dessus de l'écran courant** (monde estompé derrière, scrim) façon fenêtre de bâtiment ; les onglets topbar **basculent l'overlay** au lieu de changer `currentScreen`.
  - Implique : flags `heroSheetOpen`/`inventoryOpen` rendus par-dessus la scène ; `.sheet-scrim` couvre l'écran courant.
  - **DÉCIDÉ (2026-06-06)** : garder le format **« sheet centré »** (juste rendu en overlay au-dessus du monde), pas de panneau ancré bas.

### Batch TRV — déplacement diégétique sur la World Map (retours playtest 2026-06-06)

> On **marche** d'un node à l'autre le long du réseau, à un coût en temps. *(Renommé de MAP03-05 → TRV01-03 pour éviter la collision avec le `MAP03` PixiJS de v2.)*

- [ ] **TRV01 — Logique de voyage entre nodes (entrer vs voyager)** (M)
  - Clic **node courant** (où est le héros) → **entrer** dans la zone (safe_zone/zone_view, instantané, sans coût).
  - Clic **node adjacent** (graphe `EDGES`) → **voyager** : héros marche A→B, **+3 tics**, puis arrivée (maj `currentLocation`).
  - Clic node **non adjacent** → non navigable direct (feedback / grisé).
  - AC : depuis un node, seuls les voisins `EDGES` sont voyageables ; entrer dans la zone courante reste gratuit/instantané.
- [ ] **TRV02 — Animation de marche le long du trail (sprites walking)** (M) — *dépend TRV01.*
  - Animer le sprite **walking** (24 frames, `public/sprites/hero/walking/`) interpolé le long du segment A→B (~1–1.5 s), puis retour idle à l'arrivée ; input verrouillé + trail surligné pendant la marche.
- [ ] **TRV03 — Coût en temps du voyage (+3 tics) + rollover** (S/M) — *dépend TRV01.*
  - Voyage = **+3 tics** ; gérer le rollover de jour (>24 tics).
  - **DÉCIDÉ (2026-06-06)** : le voyage **ne déclenche PAS** les tics idle (on ne farme pas en marchant — ça n'a pas de sens). Le voyage **avance seulement le temps** (jour/nuit, horaires de bâtiments, respawn donjon) sans crédit de kills/loot.

### Sprites, assets & contenu visuel

- [ ] **CONT01 — Sprites de carte/combat chibi (couche A)** (M) — *§ASSETS*. **✅ Héros placeholder en place** (`public/sprites/hero/{idle,walking,dying}` — Necromancer chibi CraftPix, à remplacer par un chibi héroïque). **Reste** : façades de bâtiments, **18/23 monstres**, **boss Malachar**, déco (well/hens/barrels). Pipeline `public/monsters/README.md`.
- [x] ~~**CONT06 — Portraits PNJ pixel (couche B)**~~ — **✅ 5 portraits en place** (`public/portraits/{aldric,smith,marta,merchant,mage}`, 6 émotions, CraftPix) + manifeste `src/data/portraits.js`. **Reste à sourcer** : prêtre (church), chef de village, divinités → fallback emoji en attendant.
- [ ] **CONT04 — Noms propres donjons Zone 2** (XS) - remplacer placeholders par noms définitifs
- [ ] **CONT05 — ASSETS.md + sourcing licences** (S) — **✅ `ASSETS.md` créé** (crédits + inventaire + règle anti-clash). Assets **gitignorés (local-only)** → pas de problème de redistribution. ⚠️ **Reste** : prévoir la **livraison des assets au déploiement** (script de copie / release séparée, car absents du repo) + un set d'icônes SVG (remplace emoji).
- [ ] **C03 — Portraits personnage** (S) - 8 icônes au choix en CharCreation (warrior/rogue/mage/ranger/monk/knight/witch/bard)

### QoL essentiel (shippabilité)

- [ ] **IDLE-OFF — Progression hors-ligne** (M) - au retour, calculer les gains accumulés depuis `meta.lastSeen` (timestamp) → simuler N ticks → écran récap "Pendant ton absence : X kills, Y or, Z loot". **DÉCIDÉ : gains illimités (pas de plafond), la Fatigue ne s'accumule PAS hors-ligne, auto-stop HP à revoir plus tard.** AC : fermer/rouvrir l'onglet pendant idle actif crédite les bons gains + écran récap
- [ ] **SET01 — Menu Options / Réglages** (S) - écran joueur : toggle animations, vitesse de texte, (volume quand U05), reset save (via ConfirmDialog UX03). Sort le toggle "animate" du DebugPanel (DEV-only) vers le joueur
- [ ] **TECH07 — Export / Import de save (fichier)** (S) - bouton "Exporter" (JSON téléchargé) + "Importer" (lecture fichier → `loadGame` + migrations). Filet de sécurité + portabilité multi-machine. Complète TECH02/TECH03
- [ ] **PROC07 — Debug panel : boutons "give stats"** (XS) - ajouter au `DebugPanel.jsx` (DEV) : +5 STR/AGI/INT/Chance/DEF, +50 maxHP/maxMana, ou "God mode stats"
- [ ] **KBD01 — Touche Échap = retour à la World Map** (XS) — *retour playtest 2026-06-06.* Quand on est dans une zone (`safe_zone` / `zone_view`) ou un overlay (Hero Sheet / Inventory / panneau PNJ), **Échap** revient à la WorldMap (ou ferme l'overlay courant en priorité). Sous-ensemble ciblé de **UX04** (navigation clavier complète, v2). AC : Échap sur safe_zone/zone_view → `world_map` ; Échap ferme un overlay ouvert avant de quitter la zone.
- [ ] **MRC01 — Feedback d'achat marchand (toast)** (XS) — *retour playtest 2026-06-06.* À l'achat d'un consommable ou d'un équipement chez le marchand, **confirmer visuellement la transaction**. **Approche proposée (à valider)** : réutiliser le système de toasts (U01) → toast type `info`/`loot` « Acheté : <item> · −<prix> 🪙 » (cohérent avec les toasts loot/quête existants), + jouer le badge `unseen-loot` si c'est de l'équipement. Alternative si on veut plus appuyé : petit flash sur la ligne d'item + son (U05). AC : tout achat marchand déclenche un retour visuel immédiat ; pas de double-déclenchement. *(Dev hésite entre toast simple et feedback inline — on tranchera ensemble si besoin.)*

### Batch — retours playtest 2026-06-07 (carte & combat)

> **Implémenté 2026-06-07 (session dev)** : WM-NAME, TRV04, CMB-WIN, CMB-ICON, UI-BESTIARY-BTN, UI-QUESTS. Restent ouverts : SKL-PASS, ANIM01, UI-ACHIEVE-PREVIEW (ce dernier nécessite un système d'achievements à créer au préalable). Suite : **845 tests verts**.

- [x] **CMB-STUCK — 🔴 URGENT : combat gagné mais bloqué sur l'écran de combat** (RÉSOLU 2026-06-07). *Repro joueur : victoire par compétence OU attaque normale → reste coincé au tour du héros, « Victory! » loggé mais pas de ResultPanel.* **Cause-racine** : `handleVictory` (Combat.jsx) loggait « Victory! » puis distribuait TOUTES les récompenses (drops, kills, XP, Gluttony, éveil divin) **avant** `setPhase('result')`. Si une récompense throwait (état de save spécifique : un champ/id provoquant une exception au milieu de la chaîne), la fonction s'interrompait après le log mais avant la transition → joueur bloqué ; pire, `resolvedRef` (déjà `true`) **neutralisait le filet de sécurité**, rendant le blocage irrécupérable. **Correctif** : toute la distribution de récompenses encapsulée dans `try/catch` → `setResult('victory') + setPhase('result')` s'exécutent TOUJOURS (idem `finishCombat`). Une récompense qui échoue est loggée (`console.error`) mais ne bloque plus jamais. **Tests** (`src/screens/Combat.victory.test.jsx`, 7 cas) : victoire 1-coup / multi-tours / multi-ennemis / avec divinité / par compétence + **2 régressions** injectant un throw dans une récompense → vérifient que le ResultPanel s'affiche quand même (validés : ils échouent sur le code non corrigé). Suite : 830 tests verts.
- [x] **SAVE-NORM — 🔴 compteurs de kills/quêtes bloqués + (cause du combat figé)** (RÉSOLU 2026-06-07). *Repro joueur (save day10) : `monsterKillCounts` bloqués à 4, idle jamais débloqué, quêtes gelées.* **Cause-racine** : la save (`saveVersion: 2`, écrite avant l'ajout de `meta.seenHints`) n'avait pas ce champ ; or `recordKill` faisait `state.meta.seenHints.includes('idle_unlock')` — déclenché seulement quand `newCount >= 5` → au **5ᵉ kill**, `seenHints` étant `undefined`, **throw** → le `set()` n'était pas appliqué → compteur figé à 4. Les migrations étant *version-gated*, une save **déjà en v2** ne repassait jamais par le backfill (`{...INITIAL_META, ...meta}` ne tourne que pour v1). C'est **aussi la cause profonde du combat figé** (le throw remontait avant `setPhase('result')` ; le `try/catch` de CMB-STUCK masquait le symptôme mais perdait silencieusement kills/quêtes). **Correctif** : (1) `normalizeSave` **idempotent** appliqué à CHAQUE load (toutes versions) qui ré-injecte tout champ `meta/world/hero` manquant sans écraser les données ; (2) accès défensif `state.meta.seenHints ?? []` dans `recordKill`. **Auto-réparation** : la save du joueur se répare au prochain chargement (les compteurs reprennent de 4→5). **Tests** (`src/store/saveNormalize.test.js`, 9 cas) dont 3 régressions reproduisant le throw exact (`Cannot read properties of undefined (reading 'includes')`). Suite : 839 tests verts.
- [ ] **SKL-PASS — XP des skills passifs via impact passif** (M) — *retour playtest 2026-06-07.* Les skills passifs doivent gagner de l'XP **quand ils impactent passivement la situation**, pas via les kills. Ex. *Veteran's Resolve* → +XP **à chaque coup encaissé** ; un passif de drop → +XP à chaque drop ; un passif de soin → +XP à chaque soin déclenché, etc. **À cadrer** : table `passiveXpTrigger` par skill (event → montant), hook dans les bons points du combat (prise de dégâts, drop, soin…). AC : un passif équipé monte en niveau en jouant normalement, selon son effet ; les actifs gardent leur progression actuelle.

- [x] **UI-QUESTS — Bouton « Quests » + suivi des quêtes actives** (S) — *retour playtest 2026-06-07.* Ajouter un bouton **« Quests »** dans la **Topbar** (à côté de Map/Hero/Bag/Save) qui ouvre un **overlay de suivi** listant toutes les quêtes en cours (`world.activeQuests`) avec, pour chacune : titre, description courte, **progression** (ex. `kills X/Y`, dérivée de `monsterKillCounts` / objectifs de la quête) et récompense. Réutiliser le pattern overlay IMM04 (comme Hero/Bag/Codex). *Note : le Quest Board existe en SafeZone mais n'est accessible que dans un village → ce bouton global permet le suivi partout.* AC : bouton Topbar visible hors combat ; overlay liste les quêtes actives avec barre/compteur de progression à jour ; fermeture via ✕/Échap.
- [x] **UI-BESTIARY-BTN — Bouton « Bestiaire » dans le panneau parchemin droit** (XS) — *retour playtest 2026-06-07.* Ajouter un bouton **« 📖 Bestiaire »** dans le **panneau latéral droit de la WorldMap** (bloc parchemin LOCATION/DEITY/DEMON LORD/REPUTATION/ACTIONS) qui ouvre l'overlay **CodexOverlay** déjà existant (`setScreen('codex')`). Aujourd'hui le bestiaire n'est atteignable que depuis le HeroSheet. AC : bouton parchemin présent dans la colonne droite ; clic → ouvre le bestiaire ; style cohérent avec les autres actions du panneau.
- [ ] **UI-ACHIEVE-PREVIEW — Aperçu de l'achievement le plus proche (panneau droit)** (M) — *retour playtest 2026-06-07.* Afficher dans le **panneau parchemin droit** un encart « **Prochain accomplissement** » montrant l'achievement dont on est **le plus proche** (titre + barre de progression `X/Y` + récompense). Peut **remplacer ou compléter** l'encart RÉPUTATION. **À cadrer (préalable)** : il n'y a pas encore de **système d'achievements formel** — soit (a) en créer un (`src/data/achievements.js` : id, condition, cible, récompense, dérivés de compteurs existants : kills totaux, quêtes complétées, jours survécus, runs, demon lords, titres…), soit (b) le dériver des `titles`/compteurs existants. Le calcul « le plus proche » = max du ratio `progress/target` parmi les achievements non débloqués. AC : encart droit affiche 1 achievement en cours avec progression réelle, mis à jour quand les compteurs évoluent.

- [x] **WM-NAME — Remonter la plaque de nom du héros (WorldMap)** (XS) — l'**avatar reste à la même position**, mais la plaque de nom doit être **plus proche / plus haute** (collée sous/contre l'avatar). CSS : `.hero-avatar .hero-name` `margin-top` plus négatif (actuellement `-4px`). AC : avatar inchangé, nom remonté et resserré.
- [x] **TRV04 — Voyage 3× plus lent (animation de marche plus visible)** (XS) — *dépend TRV02.* La marche est trop rapide, on ne voit pas l'animation. **Multiplier la durée du déplacement par ~3** : transition CSS `.hero-avatar` (`left/top`) de `.6s` → `~1.8s` **et** la fenêtre `walking` (WorldMap, actuellement `700ms`) → `~2100ms`, gardées synchronisées. AC : la marche dure ~3× plus longtemps, l'anim walking est nettement visible ; input verrouillé toute la durée.
- [x] **CMB-WIN — Retour à la zone après victoire** (S) — après un combat **gagné** (et collecte du loot dans le ResultPanel), revenir sur l'**écran de zone** (`zone_view`, là où sont listés les monstres), pas ailleurs. AC : « Continue » du ResultPanel après victoire → `setScreen('zone_view')` (en conservant `currentHuntingSpot`). *(Vérifier les autres issues : fuite/mort/donjon gardent leur flux actuel.)*
- [x] **CMB-ICON — Icône de monstre ×2 en combat** (XS) — agrandir le sprite ennemi en combat. `Combat.jsx` `EnemyCard` → `MonsterPortrait size` (actuellement `120`) ≈ `240` ; ajuster le layout/min-height de la zone ennemis si besoin. AC : sprite ennemi 2× plus grand, sans casser la disposition multi-ennemis ni les barres HP/floating numbers.
- [ ] **ANIM01 — Refonte des animations d'attaque (héros + monstres)** (M) — *demande de cadrage : voici le faisable.*
  - **État actuel** : héros = keyframe `anim-hero-attack` (translateX +18px ping-pong 300ms, B13) sur un sprite idle statique ; monstres = flash `attackingEnemyId` (B02) + hit-flash + floating numbers, sprite PNG statique.
  - **Faisable SANS nouveaux assets (CSS/transform sur les sprites existants)** — *recommandé pour ce ticket* :
    - **Lunge + recoil** : l'attaquant amorce (léger retrait/anticipation) → frappe rapide vers la cible (héros → droite, ennemi → vers le héros) → retour amorti (easing « overshoot » pour le poids).
    - **Réaction à l'impact** : la cible recule/tremble + hit-flash (teinte rouge) + « scale-punch » (1.0→1.12→1.0).
    - **Étincelle d'impact** : burst CSS (radial-gradient en étoile/flash) spawné sur la cible à l'impact, fade ~250ms. Aucun asset.
    - **Screen shake** léger sur gros coups / crits (translate de l'arène de quelques px).
    - **Flash élémentaire** : couleur du flash selon le type de dégâts du skill (feu=orange, glace=bleu…).
    - **Projectile** pour les skills à distance/magie : orbe CSS qui voyage attaquant→cible avant l'impact.
    - **Timing/easing** : anticipation + overshoot pour donner du poids (vs translation linéaire actuelle).
  - **Faisable AVEC nouveaux assets (différé)** : frames d'attaque par entité (spritesheets héros + monstres) → animation image par image. Nécessite de l'art (extension CONT01).
  - AC : attaque héros et attaque ennemie ont chacune un cycle lisible (windup → strike → impact → settle) + retour d'impact sur la cible ; pas de régression des dégâts/floating numbers/hit-flash existants.

---

## MON01 — Refonte du bestiaire de surface (4 spots d'Ashenvale)

- [x] **MON01 — Refonte bestiaire de surface + champ `skillDropType`** (L) — ✅ RÉALISÉ 2026-06-07 (skills+monsters+zones+worldGraph+Combat+quests+normalizeSave ; 19 tests MON01/remap ; 864 tests verts ; docs CONTEXT/CHANGELOG à jour). — *spec joueur 2026-06-07.* Commit : `feat(MON01): refonte bestiaire de surface + skillDropType`.

  **Contexte / fichiers.** Données : `src/data/monsters.js` (`MONSTERS`, dérivés `MONSTERS_BY_SPOT` / `MONSTERS_BY_ZONE`), `src/data/skills.js` (`SKILLS`), `src/data/zones.js` (spots + `levelRange`). Modèle actuel d'un monstre : `{ id, name, zone:'ashenvale', huntingSpot, rank, baseStats:{hp,atk,def,spd}, expReward, goldReward:{min,max}, skillDrop:{chance,skillId}, resourceDrops:[{resourceId,chance,qty:{min,max}}] }`. Les **4 « zones » de la spec = les 4 `huntingSpot`** : `ashenvale_forest` (Lv 1-8) · `thornmarsh` (Lv 6-14) · `crumbled_ruins` (Lv 12-20) · `barrow_hills` (Lv 18-26). Consommateurs : `ZoneView` (cartes de clearing, via `MONSTERS_BY_SPOT`), `CodexOverlay` (bestiaire, via `MONSTERS_BY_ZONE` + révélation S02/`SKILL_REVEAL=5`), `Combat` (`generateEnemies`/`buildEnemy`, map `MONSTER_EMOJI`, `ARENA_BACKGROUNDS`), idle, quêtes.

  ### Roster final par spot (stats = `baseStats`)
  | Spot | Monstre (id suggéré) | Rang | HP | ATK | DEF | SPD | `skillDropType` → skill |
  |---|---|---|---|---|---|---|---|
  | **ashenvale_forest** (1-8) | Ashwood Wolf `ashwood_wolf` | normal | 40 | 8 | 3 | 12 | active → **Rending Bite** |
  | | Thicket Hare `thicket_hare` | normal | 22 | 4 | 1 | 22 | none |
  | | Tuskmaw Boar `tuskmaw_boar` | normal | 55 | 11 | 6 | 7 | passive → **Thick Hide** |
  | | Old Oakheart `old_oakheart` | **elite** | 160 | 22 | 14 | 6 | active → **Bramble Slam** |
  | **crumbled_ruins** (12-20) | Stone Golem `stone_golem` | normal | 100 | 12 | 15 | 4 | passive → **Stoneskin** |
  | | Hollow Knight `hollow_knight` | normal | 80 | 14 | 10 | 8 | active → **Cursed Cleave** |
  | | Ruin Specter `ruin_specter` | normal | 45 | 16 | 3 | 16 | active → **Soul Chill** |
  | | Graven Sentinel `graven_sentinel` *(= ex-Grave Knight, déplacé + renommé)* | **elite** | 190 | 24 | 16 | 7 | active → **Tomb Judgment** |
  | **thornmarsh** (6-14) | Marsh Serpent `marsh_serpent` | normal | 50 | 11 | 4 | 10 | active → **Venom Strike** |
  | | Briar Wraith `briar_wraith` | normal | 35 | 10 | 2 | 14 | active → **Thorn Lash** |
  | | Mire Slime `mire_slime` | normal | 70 | 8 | 6 | 5 | passive → **Caustic Coat** |
  | | Fenrot Devourer `fenrot_devourer` | **elite** | 175 | 21 | 12 | 6 | active → **Plague Maw** |
  | **barrow_hills** → **Wildmere Hills** (18-26) | Hill Slime `hill_slime` | normal | 90 | 16 | 10 | 6 | passive → **Mossy Hide** |
  | | Russet Fox `russet_fox` | normal | 60 | 18 | 6 | 20 | none |
  | | Knoll Goblin `knoll_goblin` | normal | 85 | 20 | 8 | 12 | active → **Cheap Shot** |
  | | Thunderhoof `thunderhoof` | **elite** | 210 | 28 | 12 | 14 | active → **Trample Charge** |

  **Retraits surface** : Rotting Shambler, Gloom Bat (ashenvale_forest) ; Bog Shambler (thornmarsh) ; Barrow Wight, Grave Knight, Soul Harvester (barrow_hills). **Réserve** (gardés en données, hors surface, pour Hollow Crypt/Grimspire) : **Barrow Wight** + **Soul Harvester** → flag `reserve: true` (ou `huntingSpot:'reserve'`) et **exclus de `MONSTERS_BY_SPOT`** pour ne jamais spawn (`generateEnemies` part de `MONSTERS_BY_SPOT[spot]`). Grave Knight → **devient** Graven Sentinel dans crumbled_ruins. Rotting Shambler / Gloom Bat / Bog Shambler → supprimés OU mis en réserve (décider ; voir ⚠️ quête ci-dessous).

  ### Modèle de données
  - Ajouter **`skillDropType: 'active' | 'passive' | 'none'`** sur chaque monstre (champ **interne** : drop + bestiaire).
  - `active`/`passive` → le monstre lègue un **mana stone** du skill nommé (S03 — stacking des doublons). `skillDrop = { chance, skillId }` pointe sur ce skill.
  - `none` → **pas** de `skillDrop`, pas de mana stone de technique.
  - **Créer les skills manquants** dans `skills.js` (14 nommés) avec effet cohérent : `type:'active'` = technique de combat (dégâts/debuff/contrôle, `cost`, `cooldown`) ; `type:'passive'` = bonus permanent (+DEF / regen / résistance). **Réconcilier avec l'existant** (`savage_bite`, `venom_bite`, `cleave`, `counter_strike`…) : réutiliser un id existant adapté plutôt que dupliquer, OU créer le nouveau (ex. `rending_bite`). Garder `skillDropType` cohérent avec `SKILLS[id].type`.

  ### Règle UI (IMPORTANTE)
  - Clearing card (`ZoneView`) **et** Bestiaire (`CodexOverlay`) affichent le **NOM du skill** après le seuil de kills existant (ligne « Technique », comme aujourd'hui `✦ {skillName}` / flou < 5 kills S02), mais **JAMAIS** « actif/passif ». `skillDropType` n'est **jamais** exposé comme label UI.
  - Monstres `skillDropType:'none'` → **aucune** ligne Technique.

  ### ⚠️ Dépendances / risques à traiter (sinon casse)
  1. **Quête `bog_purge`** (`src/data/quests.js`) cible `bog_shambler` (retiré de thornmarsh) → **re-cibler** vers un monstre restant du marais (ex. `mire_slime`) **ou** garder `bog_shambler` en réserve + adapter. Sinon quête incomplétable.
  2. **Test `CodexOverlay.test.jsx`** attend « Savage Bite » révélé sur `ashwood_wolf` à 5 kills → à mettre à jour si le skill du loup devient « Rending Bite ».
  3. **Zone `barrow_hills`** : ne renommer que le **`name`** d'affichage → « Wildmere Hills » + description « Verdant hills teeming with wild beasts and roaming creatures. ». **Garder l'`id` `barrow_hills`** (sinon cascade sur `huntingSpot`, saves `currentHuntingSpot`, `ARENA_BACKGROUNDS`, B12). Décision à acter dans le ticket.
  4. **`MONSTER_EMOJI`** (`Combat.jsx`) + `ARENA_BACKGROUNDS` : ajouter une entrée fallback pour chaque **nouvel id**.
  5. **`expReward` / `goldReward` / `resourceDrops`** : non fournis par la spec pour les **nouveaux** monstres → définir des valeurs cohérentes avec le `levelRange` du spot (s'appuyer sur B12 + la courbe existante / `PROC04` balance spreadsheet). Définir aussi les ressources de craft associées (`resources.js`) si de nouvelles apparaissent.
  6. **`CodexOverlay`** groupe par `MONSTERS_BY_ZONE` (tout = `ashenvale`) → envisager un regroupement par **`huntingSpot`** pour lisibilité des 4 sous-zones (optionnel, à confirmer).
  7. Vérifier toute autre référence directe aux ids retirés/renommés (idle `idleTargetMonster`, `recordKill`/`monsterKillCounts`, `dataHelpers`, `scenarios.test.js`, debug panel).

  ### Équilibrage
  - Vérifier que les courbes HP/ATK collent aux `levelRange` recommandés des spots (élites ~2-4× un normal du même spot ; SPD cohérent avec l'ordre de jeu). Mettre à jour le **balance spreadsheet** (PROC04) si présent.

  ### Docs
  - Mettre à jour `CONTEXT.md` (roster par spot + champ `skillDropType` + règle « ne pas exposer actif/passif en UI ») et `CHANGELOG.md`. *(⚠️ vérifier l'existence de ces fichiers — sinon créer ; la doc actuelle vit dans `DESIGN.md`/`ASSETS.md`/`UI_HANDOFF.md`.)*

  ### Tests
  - MàJ/ajout : data monstres (roster par spot, présence `skillDropType`, réserve exclue de `MONSTERS_BY_SPOT`), drops/mana stones, `CodexOverlay` (noms de skills révélés, **aucun** label actif/passif, `none` sans ligne Technique), quêtes impactées, idle, helpers/scénarios. **Aucun test cassé.**

  ### Livrable / AC
  - Roster refondu sur les 4 spots ; zone affichée « Wildmere Hills » ; `skillDropType` en place sur tous les monstres ; 14 skills créés/réconciliés ; UI affiche le **nom** du skill **sans** révéler actif/passif ; `none` sans ligne Technique ; Barrow Wight + Soul Harvester isolés en réserve (jamais spawn surface) ; quête `bog_purge` re-ciblée ; tests verts ; docs à jour. Commit `feat(MON01): refonte bestiaire de surface + skillDropType`.

---

## v1.5 — Profondeur & contenu

> Ordre acté : **NPC → STA → PROG**. Les informateurs (NPC) débloquent des zones (PROG), donc NPC est prérequis naturel de PROG.

### Bloc 1 — NPC & vie urbaine

> **DÉCIDÉ — répartition par localité** : Auberge (partout) = dormir + informateurs. En **ville** : auberge = dormir + informateurs seulement, les quêtes passent à la **Guilde**. En **village** : auberge = dormir + informateurs + quêtes + init carte d'aventurier. NPC par bâtiment : auberge, marchand, alchimiste, forgeron, guilde. 1-2 informateurs/auberge. 1 chef de village (présent à toute heure tant que BLD01 pas fait).

- [ ] **NPC01 — Système de dialogue NPC (arbre simple)** (M) - `DialogueNode { text, options:[{label, nextId}] }` dans `data/dialogues/` ; 2-3 nœuds max par NPC ; composant `DialoguePanel`. Base de NPC04/TAV01/GLD01/ACA*
- [ ] **NPC04 — Dialogue avec le maître/sse du bâtiment** (M) - 1 NPC maître par bâtiment (auberge/marchand/alchimiste/forgeron/guilde) + chef de village ; messages prédéfinis en entrant ; utilise NPC01
- [ ] **TAV01 — Informateurs à l'auberge** (M) - 1-2 informateurs/auberge (3-4 à la Guilde ville) qui vendent des infos : déblocage zone (PROG03), loot, indices boss. **DÉCIDÉ — contreparties : or / ressources / équipement / mana stone** (PAS un skill équipé). Lien NPC04 + Q09
- [ ] **GLD01 — Guilde des Aventuriers (ville)** (M) - **DÉCIDÉ : la Guilde remplace entièrement le quest board de l'auberge en ville** ; quêtes prestigieuses liées au rang Q06 ; 3-4 informateurs sur place
- [ ] **GLD02 — Quêtes & carte d'aventurier au village (via l'auberge)** (S) - pool de quêtes réduit dans l'auberge village + initialisation de la carte d'aventurier ici ; pondération `location.type`
- [ ] **SKL01 — Skills jusqu'au niveau 5** (M) - étendre le leveling de 3 à 5 niveaux : définir seuils d'XP 3→4 et 4→5 + scaling d'effet/coût par niveau ; prérequis d'ACA03. AC : un skill peut atteindre Lv5, scaling cohérent, migration save
- [ ] **ACA01 — Académie de magie (acheter/vendre skills)** (M) - bâtiment ville : catalogue d'achat de skills + revente depuis l'inventaire de skills
- [ ] **ACA02 — Déséquipement réservé à l'Académie** (S) - équiper libre partout, **déséquiper seulement à l'Académie** + feedback clair ailleurs
- [ ] **ACA03 — Achat-revente avec plus-value au niveau** (M) - **DÉCIDÉ — formule : `nouveau_prix = prix_origine × 1.15^(niveau−1)`** (skills Lv1→5, dépend SKL01). Pas de garde anti-exploit pour l'instant
- [ ] **ACA04 — Quêtes de level-up de skill (maître)** (M) - le maître demande de monter un skill au niveau X. **DÉCIDÉ — récompense : gold + (skill OU +5 Aura OU +5 Concentration)**. Type `skill_levelup` + Q09 ; lien NPC04
- [ ] **BLD01 — Horaires d'ouverture des bâtiments** (M) - `openHours:{from,to}` en ticks (lié CAL01). **DÉCIDÉ : taverne ouverte 24/24 ; les autres ont des horaires ; le chef de village suit alors les horaires.** Bâtiment fermé → refus + heure d'ouverture

### Bloc 2 — Nouvelles stats (Fatigue · Aura · Concentration)

> 💡 STA02 + STA03 partagent un compteur d'activité sur **fenêtre glissante de 4 jours** → coder un seul helper `countWithinDays(events, 4)`.

- [ ] **STA01 — Fatigue (vigueur 0–100)** (M) - jauge de vigueur : 100 = frais, décroît avec l'effort. **DÉCIDÉ — coûts : −3/combat, −1/unité de distance, −3/craft. Dormir à l'auberge restaure à 100.** Paliers de malus temporaires : sous 70 → −10% ATK ; sous 50 → −15% ATK+AGI ; sous 30 → −35% toutes stats + risque d'échec craft ×4. AC : décrément par action, restauration au sommeil, malus appliqués aux bons paliers, tests
  - **DÉCIDÉ — collision résolue** : le *debuff* "Fatigue" de CRF01 (AGI−20%, **dormant — jamais appliqué en jeu**) est **supprimé** de `data/debuffs.js` (+ maj des 22 tests qui le référencent). À la place, une action ratée/usante ajoute **+40 de Fatigue** (≈ −40 de vigueur sur la jauge 0–100). À faire **dans le cadre de cette implémentation STA01**.
- [ ] **STA02 — Aura (multiplicateur de dégâts)** (M) - multiplicateur passif permanent : **+ (X/2)% de dégâts par point d'Aura, sans plafond**. **DÉCIDÉ — déblocage : 15 skills utilisés en <4 jours OU entraînement chez un maître (guerrier/mage, voir TRA01). À l'unlock : 15 d'Aura de départ. Gain : +1 Aura tous les 10 skills utilisés (pour l'instant).** Impacte `calcSkillDamage` + effets défensifs. Tracking fenêtre 4j (`countWithinDays`)
- [ ] **STA03 — Concentration (qualité de craft)** (M) - **DÉCIDÉ — effet : de 0 à 150, donne (X/150)% de chance d'un cran de rareté supérieur ; 150 = +1 cran garanti. Gain par craft selon le score du mini-jeu : +1 / +2 / +5.** Impacte `resolveCraftOutcome`
- [ ] **STA03b — Gain de Concentration via quête ou livre (mécanique généralisable)** (S) - source alternative de Concentration (et, à terme, Intelligence et Aura) via quêtes et livres. Mécanique générique `gain_stat` réutilisable. Dépend ITM01 (livres) + Q09 (récompense quête)
- [ ] **STA04 — Atténuation de la Fatigue par Concentration (craft) et Aura (combat)** (S) - **DÉCIDÉ** : la **Concentration** tamponne l'impact Fatigue sur le **craft** (70% à 100, 85% à 200, 100% à 300) ; l'**Aura** tamponne l'impact Fatigue sur le **combat** (50% à 100, 70% à 200, 85% à 300). AC : aux paliers, le malus de Fatigue est réduit du bon pourcentage sur le bon domaine ; tests
- [ ] **TRA01 — Entraînement chez un maître** (M) - action *Train* avec un NPC maître (guerrier/mage, lié NPC04 + Knight Trainer/Académie) qui octroie de l'Aura (maître guerrier/mage) ou de la Concentration (artisan). Voie de déblocage alternative de STA02/STA03
- [ ] **ITM01 — Livres de stats (objets consommables)** (S) - nouveau type d'objet `book` avec effet `gain_stat` (Concentration, Intelligence, Aura…). Achetables chez marchands, trouvables en quêtes/donjons. Base de STA03b

### Bloc 3 — Déblocage progressif des zones & fog of war

> Vision : la carte n'est pas entièrement découverte au départ. On débloque une zone en aidant assez de gens (quêtes), en atteignant un niveau/des stats, ou en achetant l'info (informateurs TAV01). Petit nuage (fog) sur les zones non découvertes.

- [ ] **PROG02 — État de départ restreint** (S) - **DÉCIDÉ : nouvelle localité "village de départ" + sa zone**, seules débloquées au démarrage. `unlockedZones:[startZone]`. Migration : anciennes saves = tout débloqué
- [ ] **PROG01 — Déverrouillage progressif des zones (data-driven)** (M) - `zone.unlock:{ type:'quest'|'info'|'zoneCleared'|'level'|'stat'|'item', ref, hidden }` + `isZoneUnlocked`/`getVisibleZones` ; fog of war (nuage) sur les zones non découvertes sur la WorldMap. Dépend PROG02
- [ ] **PROG03 — Déblocage de zone via quête OU info NPC** (M) - action `unlockZone(zoneId, source)` ; deux voies : quête (Guilde) ou info achetée (informateur TAV01). Dépend PROG01

### Contenu & systèmes complémentaires

- [ ] **CODEX01 — Bestiaire / Codex** (M) - compendium des monstres qui se remplit progressivement (cohérent S02 : stats après X kills, skill après 5 kills). Réutilise `monsterKillCounts` déjà présent
- [ ] **ACH01 — Succès avec bonus permanents** (M) - **DÉCIDÉ : bonus méta (persistent entre runs) ; ampleur +1 à +10 en stat, +1% à +7% gold/exp ; liste de 8 succès de départ à définir.** `meta.achievements` + déblocage + toast. Proposer les 8 succès au grooming de contenu
- [ ] **CRF06 — Antidote craftable chez l'alchimiste** (M) - brancher l'effet `cureDebuffs` de `antidote_basic` (déjà craftable Z04) sur les debuffs permanents CRF01
- [ ] **NPC02 — 10 nouvelles quêtes contenu** (M) - rangs Cuivre→Argent : élites, donjons, livraison, exploration
- [ ] **Q04 — Quêtes exploration** (S) - type `'visit'` : complétée quand `world.visitedSpots` inclut la cible
- [ ] **Q05 — Quêtes craft** (M) - type `'craft'` : tracker `meta.craftCount` incrémenté à chaque craft réussi
- [ ] **Q09 — Récompenses de quête variées (gold / équipement / ressources / stat)** (S) - étendre `quest.reward` : `equipment:{templateId,rarity}`, `resources:{id:qty}`, `stat:{name,amount}` (base de STA03b/ACA04/TAV01). Adapter `completeQuest` + RewardBadge + toast Q07
- [ ] **Z07 — Stock d'équipement différencié village vs ville** (S/M) - village = communs + 1 rare ; ville = rares + 1 epic. Pondérer `equipStock` selon `location.type`. **Bloqué par PROG02** (distinction de localité)
- [ ] **D01 — Flux donjon complet** (L) - path map : Entrée → choix A (Combat|Trésor) → choix B (CombatElite|Repos|Event) → Boss ; idle interdit. ⏸ **Différé : nécessite `D01-SPEC` (DESIGN.md) avant dev** — PV/loot par type de nœud, probabilités, génération
- [ ] **D03 — Carte de donjon** (M) - 5 nodes Canvas/SVG par type, chemin tracé, nœud actuel mis en évidence — dépend D01
- [ ] **D06 — Donjon spawn la nuit suivante** (M) - cycle sommeil déclenche respawn + position aléatoire + marker "?" — dépend CAL01 + MAP01
- [ ] **T02 — Transmigration animée** (M) - écran de transition animé entre GodsShop et renaissance
- [ ] **T05 — Socle universel d'héritage (écran dédié)** (M) - **UI uniquement** (la logique d'héritage existe déjà dans `applyTransmigration`) : écran de choix 1 stat + 1 active + 1 passive avant la boutique
- [ ] **T12 — Skill suprême Demon Lord ("Soul Rend") héritable** (M) - flag `skill.alwaysInheritable: true` (transgresse DV10)
- [ ] **I08 — Choix joueur en idle** (M) - config avant idle : monster type + seuil HP personnalisable (le "craft en parallèle" reporté). Garder minimal pour v1.5
- [ ] **TUT01 — Premier run guidé : tooltips contextuels** (L) - hints progressifs restants (TUT02/TUT03 déjà faits) : J2 donjons, 1er dieu, 1er craft… ⏸ **Différé : lister les 5-6 hints restants (mini-spec) avant dev**

---

## v2 — Refonte / ambition (L/XL)

### Compagnons de combat
- [ ] **CMP01 — Structure données Companion + traits** (S) - `companion` : traits{loyal,stubborn,cowardly,reckless,prudent}/relationScore(−10→+10)/daysKnown/stats/skills/alive/universeOfMeeting
- [ ] **CMP02 — Génération aléatoire traits à la rencontre** (M) - pondérés par contexte : donjon→cowardly+0.3, taverne→loyal+0.2, disciple allié→loyal+0.3, Zone 2+→reckless+0.2 ; random [0.1–0.9]
- [ ] **CMP03 — followProbability() dans combat.js** (M) - `base(dominantTrait) + relationScore×0.04 − cowardly×riskLevel + daysKnown>10?0.08:0` ; clampé 0.05–0.95
- [ ] **CMP04 — CompanionCard en combat** (M) - HP/mana, action en cours, réponse textuelle selon trait (5 pools de phrases)
- [ ] **CMP05 — Interface conseil joueur (3s)** (L) - fenêtre flottante au tour du compagnon ; sans conseil → companionAI() seul
- [ ] **CMP06 — Recrutement compagnon SafeZone + donjon** (M) - taverne (gold) + survivants en salle Event ; max 1 actif. Recoupe EVT02 (réfugié)
- [ ] **CMP07 — Permadeath + message narratif** (S) - relationScore ≥ 7 → message spécial ; transmigration → "resté dans cet univers"
- [ ] **CMP08 — Easter egg relation ≥ 9** (S) - laisse un item ou skill dans la boutique des dieux au run suivant
- [ ] **CMP09 — Évolution relationScore** (S) - +1 conseil suivi+survie, +2 soin, +3 protection à 0HP, −1 ignoré+blessure, −3 fuite, −1 dieu ennemi, +1/5 jours

### Événements aléatoires
- [ ] **EVT01 — Framework événements aléatoires** (L) - `triggerZoneEvent(zoneId, dayCount)` : proba par zone + cooldown 3j min ; types merchant_visit/ambush/treasure_chest/divine_omen/refugee
- [ ] **EVT02 — Événements de zone implémentés** (M) - 5 événements (marchand errant, embuscade, coffre piégé, omen divin, réfugié→CMP06) — dépend EVT01
- [ ] **EVT03 — Événements nocturnes** (M) - au sommeil : rêve divin (indice éveil), vol ressources (relation divine −), vision (preview donjon) — dépend EVT01

### Foyer (HOME01 éclaté)
- [ ] **HOME01a — Achat du foyer + emplacement sur la map du village** (M) - acheter une maison ; nouveau node "foyer" dans le village ; question méta : persiste-t-il entre transmigrations ?
- [ ] **HOME01b — Lit (dormir chez soi)** (S) - dormir au foyer = équivalent auberge (restaure vigueur/HP/mana, avance le jour)
- [ ] **HOME01c — Coffre de stockage** (M) - stocker items/équipement/ressources ; déplacer inventaire ↔ coffre ; persistance à décider (run vs méta)

### Combat & moteur
- [ ] **B06 — ATB (Active Time Battle)** (XL) - refonte moteur combat : barre de vitesse par acteur, action quand pleine, interruptions
- [ ] **MAP03 — Migration WorldMap vers PixiJS v8** (L) - `pixi.js` + `@pixi/react` ; Sprite héros + effets WebGL (glow/bloom/shaders) ; Zustand reste source de vérité — dépend UI02

### Boss — fidélité complète (versions allégées faites en Batch N)
- [ ] **BSS01b — Crypt Keeper : vraie invocation de Skeleton Adds** (M) - 2 entités séparées (HP faible, interrompent les skills si non tuées en 2 tours, pas de loot). Stand-in actuel = enrage +40% ATK
- [ ] **BSS02b — Lord of the Forsaken : couche d'armure régénérante** (M) - DEF +30% régénérée tous les 3 tours. Stand-in actuel = Cursed Strike seul

### Multi-univers
- [ ] **X08 — Architecture multi-univers** (L) - `currentUniverse` + `universeHistory[]` ; data namespaced `src/data/universes/{id}/` ; WorldMap switche selon univers
- [ ] **X09 — Règle de rotation (fenêtre glissante)** (M) - `forbidden = {actuel, précédent}` ; pool = 2 restants ; pondération par ancienneté — dépend X08

### Divinités avancées
- [ ] **DV05 — Aura divine visuelle** (S) - border colorée sur HeroCard selon divinité active
- [ ] **DV11 — Relations inter-divines −10/+10** (L) - matrice symétrique `DIVINE_RELATIONS[idA][idB]` ; actions joueur font bouger les scores
- [ ] **DV12 — Oracle divin (boutique)** (S) - révèle le score de relation pour le prochain univers (8 tokens) — dépend DV11

### Profondeur & polish
- [ ] **EQP01 — Bonus de set d'équipement** (M) - **DÉCIDÉ : système technique seul** (`equipment.set` + `getSetBonus`, sets de 3 à 6 pièces) ; contenu des sets plus tard
- [ ] **CODEX02 — Codex de lore** (S) - écran consultable regroupant le flavor text — dépend CONT02/CONT03
- [ ] **HIS01 — Historique des runs** (M) - N derniers runs : cause de mort, zone max, boss tués, durée, tokens ; `meta.runHistory[]`
- [ ] **HIS02 — Statistiques globales meta** (S) - total kills/type, temps joué, Demon Lords tués, compagnons perdus, skills uniques
- [ ] **NPC03 — NPCs récurrents avec mémoire** (M) - se souviennent du rang aventurier + divinité → dialogues différents au retour
- [ ] **NPC05 — Maître itinérant à la Guilde** (M) - maître de passage proposant entraînement/quêtes ponctuels (lié TRA01/GLD01)
- [ ] **TECH06 — Feature flags** (M) - `FEATURE_FLAGS` dans `config.js` : activer/désactiver des features sans recompiler
- [ ] **CONT02 — Descriptions lore par zone** (XS) - flavor text dans le header ZoneView (3-4 lignes/zone)
- [ ] **CONT03 — Flavor text sur les skills** (XS) - champ `lore` dans les skill templates, affiché en italique InventoryCard
- [ ] **U02 — Responsive mobile** (L) - layout <768px, touch events, Canvas 2D scaled
- [ ] **U05 — SFX combat + ambiance** (L) - Web Audio API : attaque, skill, mort, level-up, divine call, déroulement parchmin
- [ ] **UX04 — Navigation clavier complète** (M) - Tab + Entrée + Echap sur tous les écrans ; combat jouable sans souris

---

## Done

### v1 — Batch O : Gluttony & Malachar (POC bouclé) (2026-06-01, uncommitted)

**5 tickets, +11 tests (718 → 729), branche `feat/batch_MtoR`**

- [x] ~~**GLT01** — Gluttony structure + passif~~ (M) — skill passif `gluttony` (suprême, non héritable) + `engine/gluttony.js` (proc 10%, cooldown 5j, absorb 10% atk). Absorption stockée dans `meta.permanentStatBoosts`, **réappliquée à chaque run** (transmigration). Action `absorbGluttony`. Proc hooké dans `handleVictory`.
- [x] ~~**GLT02** — Assassinat + choix joueur~~ (M) — détection kill en 1 coup depuis HP max (`assassinatedRef` dans handleAttack/handleUseSkill) → garanti + modal `GluttonyChoiceModal` (le joueur choisit la stat).
- [x] ~~**GLT03** — Cooldown + affichage HeroSheet~~ (S) — `meta.gluttonyLastUsed` + section "Gluttony" sur HeroSheet ("Ready" / "Xd remaining").
- [x] ~~**GLT04** — Absorption log~~ (XS) — toast type `gluttony` "Absorbed +N STAT from <monster>".
- [x] ~~**W01** — Demon Lord Malachar (POC)~~ (L) — boucle de victoire complète : phases BSS03 + drop Soul Rend garanti + **+200 tokens** + titres permanents (T13). **Win condition du POC bouclée.** Engine `gluttony.test.js` (6 tests) + store (5 tests).

---

### v1 — Batch N : Boss mechanics & titres (2026-06-01, uncommitted)

**5 tickets, +15 tests (703 → 718), branche `feat/batch_MtoR`** — boss en **version allégée** (fidélité complète : BSS01b/BSS02b en backlog)

- [x] ~~**M01** — Titres permanents~~ (S) — `data/titles.js` (registre) + action `awardTitle` (dédup + toast) + affichage permanent sur HeroSheet (icône + tooltip) depuis `meta.titlesEarned`. 3 tests.
- [x] ~~**T13** — Demon Lord Slayer~~ (S) — tuer le Demon Lord (`clearDungeon('grimspire')`) attribue `demon_lord_slayer` + `malachar_bane`, persistants entre runs. 2 tests.
- [x] ~~**BSS03** — Malachar 3 phases~~ (L) — `engine/bossMechanics.getMalacharPhase` : P1 normal → P2 ≤60% (Rage +50% ATK) → P3 ≤30% (Soul Drain 15% maxHP/tour). Intégré dans `Combat.jsx` (atkMult, soul drain, log de transition de phase). 4 tests.
- [x] ~~**BSS01** — Crypt Keeper~~ (M, **léger**) — enrage unique +40% ATK à ≤50% HP (`getCryptKeeperEnrage`) en stand-in de l'invocation. Vraie invocation de 2 adds → **BSS01b** (backlog).
- [x] ~~**BSS02** — Lord of the Forsaken~~ (M, **léger**) — Cursed Strike (STR−20%, 2 tours via statuts B05, `rollCursedStrike`/`CURSED_STRIKE_EFFECT`) ; l'attaque du héros utilise sa Force effective. Armure régénérante → **BSS02b** (backlog).
- Boss data : `bossMechanics` sur les 3 boss + copié par `buildEnemy`. Engine `bossMechanics.test.js` (10 tests).

---

### v1 — Batch P : Crafting & artisans (2026-05-31, uncommitted)

**7 tickets, +53 tests (650 → 703), branche `feat/batch_MtoR`**

- [x] ~~**CRF01** — Debuff passif temporaire~~ (S) — `data/debuffs.js` (4 debuffs : Burnt Hands/Poisoned/Fatigue/Black Smoke) + `utils/debuffs.js` (makeDebuff/addDebuff/tickDebuffsOneDay/getDebuffStatModifiers/applyDebuffsToStats). `hero.activeDebuffs` + migration, action `addHeroDebuff`, tick au sommeil (jours), réduction des stats en combat. 22 tests.
- [x] ~~**CRF04** — Rareté selon score~~ (S) — `utils/crafting.js` : `scoreToTier`, `bumpRarity`, `resolveCraftOutcome` (parfait +2 / bon +1 / neutre / raté+debuff / catastrophe+permanent), `hitAccuracy`/`averageAccuracy`, `alchemyQuantity`. 16 tests.
- [x] ~~**CRF02 / CRF03** — Mini-jeux~~ (M) — `components/CraftingMinigame.jsx` : mode `alchemy` (jauge montante, 1 arrêt) + mode `forge` (3 frappes ping-pong). Branché : forge → BlacksmithPanel & MasterSmith, alchimie → AlchemyPanel. 6 tests.
- [x] ~~**CRF05** — Debuffs sur HeroSheet~~ (S) — section "Active Debuffs" (durée restante / "Cure needed"). 3 tests.
- [x] ~~**Z04** — Alchimiste~~ (M) — `ALCHEMY_RECIPES` (6 potions), AlchemyPanel réel : brassage via mini-jeu → quantité (parfait 3 / bon 2 / neutre 1) ou Poisoned (raté 7j / catastrophe permanent).
- [x] ~~**Z06** — Maître forgeron~~ (M) — `MASTER_RECIPES` (5 Rare/Epic), MasterSmithPanel + mini-jeu forge + issue CRF04. Spawn 10% à la génération du village. 7 tests (recipes).

---

### v1 — Batch M : Profondeur de combat (2026-05-31, uncommitted)

**5 tickets, +46 tests (604 → 650), branche `feat/batch_MtoR`**

- [x] ~~**B05-SPEC** — Design doc effets de statut~~ — `DESIGN.md` créé (§B05-SPEC : catégories DoT/contrôle/stat, modèle de données, plafond 2, interactions, valeurs par niveau, API moteur, mapping icônes).
- [x] ~~**B05** — Effets de statut~~ (L) — moteur (`combat.js`) : `tickStatusEffects` (DoT + flags skipTurn/noHeal + expiration des durées), `applyStatusEffect` (plafond 2 + refresh même type), `getEffectiveStats` (réductions multiplicatives slow/defense_break/atk_down/all_stats_down…), `canHeal`, `isStunned` — **23 tests**. Câblage `Combat.jsx` : skills du héros appliquent leur statut aux ennemis (DoT + debuffs purs `abyss_howl`/`forsaken_curse`), DoT/stun tickés en début de tour ennemi, DEF/ATK effectives en combat, **icônes de statut** sur EnemyCard + HeroCard, garde `canHeal` (burn bloque le soin). **Bug corrigé** : `applyStatusEffects` existait mais n'était jamais appelé (statuts morts en combat) ; debuffs purs soft-lockaient le combat.
- [x] ~~**B10** — Sacrifice de stat~~ (M) — `cost.stat_sacrifice: { stat, amount, permanent }` appliqué dans `applySkillCost` + `getStatSacrifice`. Nouveau skill `reckless_blow` (220% STR, sacrifie 3 AGI temporairement). Persistance au store si `permanent` ; le temporaire se récupère au combat suivant. Affichage `−3 AGI` sur le bouton skill. 6 tests.
- [x] ~~**B12** — Combat manuel forcé en idle~~ (S) — `getMonsterLevel` (dérivé du `levelRange` du spot) + `isEnemyTooStrong(lvl, hero, gap=5)`. Dans `processIdleTick` : si l'ennemi dépasse hero+5, idle stoppé + toast warning + combat manuel forcé (`activeCombat` + écran combat). 7 tests (engine + store).
- [x] ~~**B03** — Multi-ennemis 1-3~~ (M) — `getEnemyCount(monster, zone, rng)` : élite/boss → 1, zone 1 → 1-2, zone 2+ → 1-3. `generateEnemies` refait + branché dans `ZoneView` (remplace le `buildEnemy` solo). Layout multi-cartes + ciblage déjà en place dans `Combat.jsx`. 10 tests.

---

### v0.1/v1 — Batch G+H+I+J+L : Cleanup + Toasts + Tutorial + Skills + Divinités (2026-05-04, uncommitted)

**18 tickets, +143 tests (461 → 604), branche `feat/batch_AB`**

#### Batch G — Fermeture v0.1
- [x] ~~**Z02** — Marchand : 4 consommables~~ — `stamina_ration`, `elixir_minor`, `mana_crystal`, `antidote_basic` + effet `restore_both` (HP+Mana) géré dans Combat.
- [x] ~~**Z03** — Forge recettes lisibles~~ — ingrédients manquants grisés (opacity) + message de blocage explicite + tests `canCraft` (nouveau `equipment.test.js`).
- [x] ~~**PROC04** — Balance CSV enrichi~~ — second CSV `balance/drops_summary.csv` (gold/exp/skill drop/resource drops par monstre).
- [x] ~~**PROC05** — Playtest log~~ — `PLAYTESTS.md` template + méthodo + grille d'observation.
- [x] ~~**PROC06** — Debug panel dev~~ — `DebugPanel.jsx` (Ctrl+Shift+D, DEV only via `import.meta.env.DEV`), 17 commandes cheat. 9 tests.

#### Batch H — Toasts (U01 fondation)
- [x] ~~**U01** — Système de toasts global~~ — `toastStore.js` Zustand séparé (`addToast`/`removeToast`/`clearToasts`, 8 types, auto-dismiss). `ToastContainer.jsx` overlay bas-droit. 16 tests.
- [x] ~~**Q07** — Toast récompense quête~~ — `completeQuest` pousse un toast `quest` avec gold/tokens/skill.
- [x] ~~**I04** — Toast loot idle~~ — toasts `levelup` (level-up idle) + `warning` (HP bas) dans `processIdleTick`, non-spammy.

#### Batch I — Transitions + Tutorial
- [x] ~~**U04** — Transitions écrans~~ — `@keyframes screen-fade-in` 150ms + wrapper `key={currentScreen}` dans App.
- [x] ~~**TUT02** — Hint idle unlock~~ — toast au 5e kill d'un mob + flag `meta.seenHints` (affiché une seule fois).
- [x] ~~**TUT03** — Hint transmigration~~ — box explicatif + surbrillance dans PostMortem au 1er run (`meta.firstDeathSeen`), action `markFirstDeathSeen`.

#### Batch J — Skills polish
- [x] ~~**S02** — Aperçu skills ennemis~~ — `SkillDropPreview` dans ZoneView : skill droppable flouté (blur) tant que < 5 kills, révélé après. Nouveau `ZoneView.test.jsx`.
- [x] ~~**S03** — Stack mana stones doublons~~ — `utils/manaStones.js` (`groupManaStones`/`removeOneManaStone`) + badge ×N dans Inventory. **Fix bug latent** : `equipActiveSkill`/`equipPassiveSkill` ne retiraient toutes les copies (filter) → maintenant une seule + refus de doublon en slot.
- [x] ~~**S06** — Contenant cosmétique~~ — `data/containers.js` (`getSkillContainer` par univers : Mana Stones/Manuscripts/Data Chips/Fragments). Label dynamique dans Inventory.
- [x] ~~**T07b** — UI sélection skill bonus~~ — `getBonusSkillPool(lastRunSummary)` (skills du run précédent ou fallback 3 Zone 1) + sélecteur dans GodsShop, remplace `power_strike` hardcodé.

#### Batch L — Divinités v1
- [x] ~~**DV04** — Voltaris~~ — 3e divinité (Foudre+Action, Chaotique). Awakening : 5 victoires sous 30% HP (`checkVoltarisAwakening` + `hpPercent` ajouté à `endCombat` battleLog). Blessing +20% AGI. Skills `chain_lightning` (120% INT, AoE) + `overclock` (+80% spd 2T). Relations Ignareth +6, Sylvara -4. 12 tests.
- [x] ~~**DV03** — Fidélité inter-run~~ — bannière "X remembers you" dans DivineCall si `meta.divineBonds[universe] === deity.id`. Nouveau `DivineCall.test.jsx`.
- [x] ~~**DV07** — Refus = run solo~~ — `refuseDeity` lève `hero.soloRun`, garantit le bonus T11 (+1 lvl skills) à la transmigration même si une divinité existait.

#### Tests étendus
- 604 tests total (+143 vs E+F), 23 fichiers (+9)
- Nouveaux : `equipment.test.js`, `DebugPanel.test.jsx`, `toastStore.test.js`, `ToastContainer.test.jsx`, `manaStones.test.js`, `containers.test.js`, `ZoneView.test.jsx`, `GodsShop.test.jsx`, `DivineCall.test.jsx`

#### Cleanup
- Override `eslint.config.js` pour GodsShop/ZoneView (helpers co-exportés)
- Fix bug equip-skill (retirait toutes les copies)

### v0.1 — Batch E+F : Donjons + Balance + Win Condition (2026-05-04, uncommitted)

**8 tickets, +36 tests (461 → 497), branche `feat/batch_AB` (review GitKraken, push différé)**

#### Batch E — Donjons + Balance
- [x] ~~**D02** — Découverte donjon (clic '?' sur Canvas)~~ (2026-05-04)
  - Marker '?' dans WorldMapCanvas devient cliquable via node virtuel `__dungeon__` injecté dans le hit-test.
  - 1er clic → `discoverDungeon('ashenvale')` → marker passe à '!' + label révélé "The Hollow Crypt · Lv 12-16".
  - 2 tests render dans WorldMapCanvas.test.jsx.
- [x] ~~**D04** — Loot donjon exclusif~~ (2026-05-04)
  - Field `category: 'dungeon_seal'` ajouté à `crypt_seal`, `forsaken_seal`, `demon_lord_heart` (monnaie alternative future).
  - 6 tests dans `combat.test.js` : drops garantis (chance 1.0) sur les 3 boss + skill drop garanti malachar.
  - 5 tests structure dans nouveau `data/resources.test.js`.
- [x] ~~**D05** — Warp à la sortie après complétion~~ (2026-05-04)
  - `clearDungeon(zoneId)` warpe désormais le hero vers la city de la zone (`ironhaven` pour ashenvale, `stonehaven` pour grimspire).
  - Reset `currentHuntingSpot`, `isIdleActive`, `idleTargetMonster` à la complétion.
  - 3 tests dédiés.
- [x] ~~**D07** — Idle interdit dans donjons~~ (2026-05-04)
  - `toggleIdle` refuse l'activation si :
    - La zone courante a `idleAllowed === false` (cas Blighted Road, depuis ZONES data).
    - `currentScreen === 'dungeon'` (anticipation D01).
  - Import `ZONES` ajouté dans gameStore.js. 3 tests dédiés.
- [x] ~~**BAL01** — Calibration économie tokens~~ (2026-05-04)
  - Coûts CATALOG révisés : starter_kit 10→5, oracle 15→8, skill_levelup 20→12, rank_restore 40→25, bonus_skill/stat 80→50.
  - 5 scénarios dans `scenarios.test.js` : run rapide (1 quête → 1 token), moyen (3 quêtes → 4 tokens), excellent (3+boss → 7 tokens), légendaire (8 quêtes + Malachar → 18+ tokens) + vérif que CATALOG utilise les bons coûts.
  - Cible validée : run moyen achète 0-1 article, légendaire 2-3 articles cumulés.

#### Batch F — Win Condition
- [x] ~~**T04 + W02** — Malachar counter résurrection~~ (2026-05-04)
  - `applyTransmigration` incrémente `world.demonLordResurrectionCounter` à chaque transmigration tant que `demonLordDefeated === true`.
  - Quand counter atteint 4 (constante `RESURRECTION_CYCLES`) : Malachar respawn (counter=0, defeated=false, donjon grimspire reset cleared/discovered).
  - 5 tests : compteur reste à 0 sans kill, incrément après kill, respawn après 4 transmigrations, re-kill post-respawn, flag malacharDefeatedThisRun reset.
- [x] ~~**M02** — Compteur Demon Lords kills~~ (2026-05-04)
  - `meta.demonLordKills` passé de `0` (number) à `{}` (object indexé par `universeId`) — préparation X08 multi-univers.
  - `clearDungeon('grimspire')` incrémente `meta.demonLordKills.medieval_fantasy`.
  - Migration legacy : test existant adapté.
  - 3 tests : init à 0, incréments multiples, ashenvale ne compte pas.
- [x] ~~**W03** — Transport prochain monde (version minimale)~~ (2026-05-04)
  - Flag `meta.malacharDefeatedThisRun` levé par `clearDungeon('grimspire')`, reset par `applyTransmigration`.
  - Écran dramatique "MALACHAR THE UNDYING ... has fallen" dans PostMortem (overlay si flag levé), avec titre "Slayer of Eldenmoor", texte "To be continued.", bouton "Continue to Transmigration →" qui bascule vers le post-mortem normal.
  - 3 tests : affichage si flag, absence si pas killed, dismiss → flow normal.

#### Tests étendus
- 497 tests total (+36 vs Batch C+D), 14 fichiers (+1 `data/resources.test.js`)
- Tests M02 + D05 + T04/W02 + W03 + BAL01 + D04 + D07

#### Cleanup
- 2 erreurs lint résolues : `median` unused (scenarios), override `react-refresh` pour GodsShop.jsx (CATALOG exporté pour BAL01)
- Test legacy `clearDungeon grimspire` adapté à la nouvelle structure object (M02)

### v0.1 — Batch C+D : UX/Tooltips + WorldMap Canvas + QTE (2026-05-04, uncommitted)

**8 tickets, +77 tests (385 → 462), branche `feat/batch_AB` (review GitKraken, push différé)**

#### Batch C — UX & Tooltips
- [x] ~~**UX01** — Tooltips stats héros~~ (2026-05-04)
  - `src/components/Tooltip.jsx` (composant réutilisable hover/focus/click) + `Tooltip.test.jsx` (9 tests).
  - Appliqué dans `HeroSheet.jsx` sur chaque StatRow avec descriptions in-game (`STAT_TOOLTIPS`).
  - Curseur `help` + border-bottom pointillée sur les stats avec tooltip.
- [x] ~~**UX02** — Comparaison équipement~~ (2026-05-04)
  - Diff `↑+N` (vert) / `↓-N` (rouge) / `—` (gris) par stat dans le panneau détail Inventory > Equipment.
  - Affiche "vs équipé : Iron Sword" pour contexte. 5 tests dédiés.
- [x] ~~**UX03** — Confirmations destructives~~ (2026-05-04)
  - `src/components/ConfirmDialog.jsx` réutilisable (3 variants : destructive/warn/info) + 8 tests.
  - Appliqué sur 3 actions : Sell item rare (rarity ≥ epic), Reset save (PostMortem ↺), Abandon de quête (QuestBoard, bouton "Abandon" + action store `abandonQuest`).
  - 3 tests `abandonQuest` + 3 tests UI flow Reset complet/annulation.
- [x] ~~**UX05** — Badge "nouveau loot" NavBar~~ (2026-05-04)
  - Flag store `unseenLoot` levé par `addResource`/`addEquipmentToInventory`/`addSkillToInventory` (PAS par `addGold`/`addConsumable`).
  - Action `markLootAsSeen` appelée au mount d'Inventory via `useEffect`.
  - Badge point rouge avec glow dans NavBar > Bag tab. 8 tests store + 4 tests UI.
- [x] ~~**U03** — Fonts Cinzel resilientes~~ (2026-05-04)
  - `<link rel="preconnect">` Google Fonts dans index.html (réduit FOIT/FOUT).
  - Font stacks étendus : `'Cinzel', 'Trajan Pro', Georgia, ...serif` (fallback robuste).
- [x] ~~**B13** — Keyframe hero-attack~~ (2026-05-04)
  - `@keyframes hero-attack` (translateX +18px ping-pong 300ms) dans `index.css`.
  - State `heroAttackAnim` dans Combat.jsx, déclenché par handleAttack et handleUseSkill. Classe `.anim-hero-attack` sur HeroCard. 2 tests.

#### Batch D — Carte Canvas 2D
- [x] ~~**MAP01** — WorldMap Canvas 2D~~ (2026-05-04)
  - Nouveau `src/screens/WorldMapCanvas.jsx` — composant Canvas avec requestAnimationFrame loop + ResizeObserver pour DPR/responsive.
  - Helpers purs exportés : `lerp(a, b, t)`, `pctToPx(pctX, pctY, w, h)`, `getNodeAtPosition(x, y, nodes, hitRadius)` — 13 tests unitaires.
  - Features : nodes cliquables (city/spot/village), paths animés (dashoffset), héros lerp 0.04 vers nodeId actif, marker "?" donjon (couleur selon `discovered`), particles dorées au clic destination, cursor pointer sur hover.
  - WorldMap.jsx refactoré : SVG/HTML supprimé (HuntNode, LocationNode, CharacterMarker, NODE_POSITIONS, getSpotIdleMonsters), remplacé par `<WorldMapCanvas>` qui prend les nodes en props.
  - 3 smoke tests RTL : monte, canvas présent, aspect-ratio 16:10, onClick handler attaché.
- [x] ~~**MAP02** — QTE mini-jeu déplacement~~ (2026-05-04)
  - Nouveau `src/components/QTEBar.jsx` — modal full-screen avec barre ping-pong + zone verte + bouton NOW.
  - Helpers purs : `isInGreenZone(cursor, start, end)`, `cursorPositionAt(elapsed, duration)` (11 tests).
  - Intégré dans WorldMap pour traverser Blighted Road : succès = entrée immédiate, échec/timeout = entrée mais coût -5% maxHp.
  - 8 smoke tests composant : rendu, position zone, NOW success/failure, timeout, no-op après resolution.

#### Tests étendus
- 461 tests total (+77 vs Batch A+B), 13 fichiers (+4)
- Nouveaux fichiers tests : `Tooltip.test.jsx` (9), `ConfirmDialog.test.jsx` (8), `WorldMapCanvas.test.jsx` (16), `QTEBar.test.jsx` (19)
- Tests UX05 / UX02 / UX03 / B13 ajoutés dans `screens.test.jsx`, `gameStore.test.js`, `Combat.test.jsx`

#### Cleanup
- 2 erreurs lint `react-refresh` résolues via overrides ciblés dans `eslint.config.js` pour `WorldMapCanvas.jsx` + `QTEBar.jsx` (helpers purs co-exportés)
- Refactor `draw` rAF self-reference → boucle `loop` séparée (évite `react-hooks/immutability`)
- Variable `nodesById` morte retirée

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
