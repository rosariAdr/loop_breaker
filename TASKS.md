# Tasks — Loop Breaker (Roguelite Idle RPG)

> Backlog source de vérité. Grooming : vérifier INVEST + AC avant de démarrer un ticket M/L. DoD par type dans `CONTRIBUTING.md` (PROC00).
> **Versioning** : `v1` = POC figé · `v1.1` = UI parchemin + sprites + QoL · `v1.2` = profondeur (NPC → STA → PROG) · `v2` = ambition.
> Dernière réorganisation : 2026-06-03 (grooming complet + intégration handoff Claude Design + stats STA chiffrées).

---

## Active

_(rien en cours)_

## Waiting On

_(aucune dépendance externe bloquante)_

> **Note** : `GIT01` + `X06` + `PROC00` clos (repo `rosariAdr/loop_breaker`, branches `master` + `dev`).

---

## Release / Déploiement

- [x] **DEPLOY01 — Publication v1 sur Vercel (alpha privée)** (M) — *2026-06-08.* SPA client-side → Vercel + **Vercel Authentication** (alpha privée). **✅ Repo prêt** : `.gitignore` durci (`.env`, `.vercel`), `vercel.json` (rewrites SPA → `/index.html`), `index.html` (meta description ; lang/title/favicon OK), build prod **vert** (0 erreur), 0 secret en dur, chemins d'assets **absolus**, README §Déploiement + CONTEXT notés. **✅ Bloqueur résolu** : `public/` committé (commit `caa03d9` : 142 assets — carte, sprites héros, monstres, bâtiments, portraits, favicon, ASSET_LICENSES) ; **`raw/` exclus** (sources HD ~344 Mo). **Reste (actions hors-repo, utilisateur)** : `git push` la branche, puis Vercel dashboard → importer le repo + **activer Deployment Protection / Vercel Authentication**. **⚠️ À noter** : 3 PNG lourds dans l'historique (map 9.7 Mo, rotting_shambler 5.9 Mo, gloom_bat 5.6 Mo) → optimiser via squoosh **avant push** si on veut éviter le bloat d'historique (cf. CONT05).

---

## v1 — POC (FIGÉE) ✅

> Le POC est **complet et gagnable de bout en bout** (Malachar tuable). **Ne rien ajouter ici.** Seule la stabilisation reste avant de figer la v1 et d'attaquer l'habillage v1.1.

- [ ] **BAL02 — Calibration boss difficulty + playtest** (S) - 3 runs jusqu'au boss par zone ; noter HP restant moyen + nombre de morts ; ajuster `zone_mult` boss si besoin ; documenter dans PLAYTESTS.md
- [ ] **BAL03 — Calibration idle kill rate vs progression** (S) - vérifier que l'idle seul permet d'atteindre Zone 2 en ~10 jours in-game ; ajuster `dmgTaken` idle
- [ ] **TECH04 — Performance Canvas 2D — budget 60fps** (S) - Chrome DevTools Performance ; target <8ms/frame ; mémoiser gradients statiques hors du loop
- [x] **TECH05 — JSDoc sur engine/combat.js** (M) - `@param`, `@returns`, `@example` sur toutes les fonctions exportées

---

## v1.1 — UI parchemin, sprites & QoL (release présentable)

> Objectif : transformer le POC fonctionnel en jeu **présentable**. **Spec complète : `UI_HANDOFF.md`** (design system parchemin diégétique « table en bois », stage 1920×1080, tokens CSS canoniques, 6 écrans, 2 couches d'assets, animations). Esthétique : joyeuse/héroïque type overworld Dragon Quest, **PAS** sombre/gothique. Stratégie : **coquille d'abord → écran par écran → sprites en dernier**. À faire d'un bloc pour la cohérence visuelle.
>
> **Décisions actées (2026-06-03)** :
> - **Stats** : mapper l'UI sur les stats actuelles du jeu (pas de refonte data).
> - **Canvas fixe 1920×1080 + scaler** confirmé (PC-first ; Tailwind conservé + tokens CSS).
> - **Écrans plein-écran** (Combat/GodsShop/DivineCall/PostMortem) : **mixte au cas par cas** (Combat probablement en takeover, les autres possiblement dans la coquille — choix documentés à l'implémentation).
> - **Assets** : **hybride** — le dev fournit certaines sprites au fil de l'eau ; le reste en placeholder/art-slot (emoji), swap progressif (CONT01/CONT06). UI-A/UI-B ne bloquent pas sur les assets.
> - **UI05 dialogue** : coquille vide / placeholder en v1.1 ; contenu en v1.2.

### Batch UI — migration parchemin

- [x] **UI01 — Coquille parchemin : scène + topbar + breadcrumb + sidebar + tokens** (M/L) — *`UI_HANDOFF.md` §IDENTITÉ + §LA SCÈNE*
  - **Tokens** : toutes les CSS custom properties (`--parchment`, `--ink`, `--forest`, `--gold`, `--amber`, jauges HP/MP/XP…) dans `index.css` ; fonts **Cinzel + Crimson Text** ; texture parchemin (grain de bruit + liseré vieilli).
  - **Scène** : stage fixe 1920×1080 centré + scaler `transform: scale(min(vw/1920,vh/1080))`, letterbox sur radial `#1c140d→#3a2a1c`, fond table en planches de bois. **DÉCIDÉ : on part sur le canvas fixe** (PC-first ; responsive mobile reporté à U02/v2). Tailwind conservé pour l'utilitaire + tokens CSS/classes custom pour les pièces bespoke (parchemin/bois).
  - **Topbar 64px** : Run#/Lv + barre XP ; jauges HP + MP (anim largeur .5s) ; groupe stats `☀ Day · T x/24 · 🪙` (**DayBar fusionnée dans la topbar — plus de ligne jour/nuit séparée**) ; onglets pills `Map · Hero · Bag · Save`.
  - **Breadcrumb 30px** (chemin de région, fil courant en `--gold`) + **sidebar journal 286px** (Location/Deity/Demon Lord/Reputation + zone Actions épinglée en bas) + **système de boutons** parchemin (`.primary` ambre).
  - AC : la coquille rend, les écrans existants tournent dedans **sans régression de logique**, build OK.
- [x] **UI02 — World Map parchemin** (M) — *§Écran 01*. Cadre boussole, champs de zone organiques (Ashenvale vert / **Grimspire verrouillé désaturé + tooltip niveau**), trails pointillés à l'encre + **Blighted Road** danger rouge, 8 nodes médaillons (positions dans le handoff), **node donjon** violet `?` + aura, **avatar héros chibi** + halo or (transition marche `.6s`). Conserve la logique Canvas/nodes (MAP01).
- [x] **UI03 — Village parchemin** (M) — *§Écran 02*. Cadre « vine », place + **puits**, chemins de terre rayonnants, **4 bâtiments** (sprite encadré + enseigne suspendue + sous-titre) → clic = overlay PNJ, déco (hens/barrels), avatar près du puits. Remplace le SafeZone sombre actuel.
- [x] **UI04 — Hunting Forest parchemin** (M) — *§Écran 03*. Cadre vine, **clearings** = disques verts (sprite monstre + terrain + plaque + **kill bar** + statut) ; états *disponible* / *idle actif* (anneau safe-green + badge `◆ IDLE`) / *verrouillé* (`🔒`, "Fight 10× to unlock idle") ; idle log en sidebar. Conserve Fight/Idle (B03, S02).
- [x] **UI05 — Overlay dialogue PNJ** (M) — *§Écran 04*. Panneau ancré bas sur scrim, **colonne portrait** (cadre woodgrain + portrait pixel, **6 émotions** Talk/Calm/Smile/Sadness/Aggression/Special selon le ton) + **colonne corps** (eyebrow + dialogue Crimson italic 26px + boutons d'action). **DÉCIDÉ : coquille vide / dialogues placeholder en v1.1** (le contenu et l'arbre de dialogue NPC01/NPC04 viennent en v1.2 ; on en rediscute).
- [x] **UI06 — Hero Sheet overlay parchemin** (S/M) — *§Écran 05*. Modale centrée, portrait woodgrain, grille équipement 6 slots, **Vitals & Attributes** (cartes + barres), Derived, Skills, Allegiance. Conserve Active Debuffs (CRF05) + Titles (M01) + Gluttony (GLT03). **DÉCIDÉ : mapper l'UI sur les stats actuelles** (strength/agility/intelligence/chance/def + hp/mana) — pas de refonte data ni de migration. On reprend la mise en page du handoff mais avec les stats du jeu (les labels Vitality/Dexterity/Faith/Luck du handoff sont indicatifs).
- [x] **UI07 — Inventory overlay parchemin** (S) — *§Écran 06*. Modale, **Carried Items** grille 6 colonnes + pastille d'or, **Equipped** grille 6 slots. Conserve les onglets + stack mana stones (S03).
- [ ] **UI08 — Intégration sprites (couches A + B)** (L) — *§ASSETS*. **Couche A** chibi cartoon (carte/combat : héros, façades de bâtiments, monstres, Malachar) + **Couche B** portraits pixel 128×128 à 6 émotions (overlays dialogue). **Règle stricte : jamais mélanger chibi et portrait pixel à la même échelle dans un même cadre.** Héros placeholder = chibi "Necromancer of the Shadow" (Idle/Walking/Dying). Dépend CONT01/CONT06.
- [x] **UI09 — Transition parchemin + toasts + écrans hors handoff** (M) — ✅ **toasts** parchemin (bulle sombre/liseré doré/italique, ToastContainer) ✅ ; **déroulé de parchemin** à l'entrée/sortie de zone (`.parch-wipe`, ≤340ms, non bloquant, neutralisé par le réglage Animations) ✅ ; **décision** : les écrans takeover (Combat/GodsShop/DivineCall/PostMortem) restent **volontairement sombres/dramatiques** (contraste avec le monde parchemin) — ils partagent déjà la typo Cinzel + accents or, pas de re-skin parchemin. — **Échange de parchemin** à l'entrée/sortie de zone (enroule monde / déroule zone, **≤350ms, skippable après le 1er run** — la navigation arrive des dizaines de fois/session) ; **toasts** parchemin (bulle sombre bas-centre, bordure dorée, italique, ~2.6s) ; restyle des écrans **hors handoff** (Combat, GodsShop, DivineCall, PostMortem) au même langage.

> **État d'implémentation (2026-06-06, branche `feat/ui-parchemin`, non mergée)** : UI01→UI07 faits ; UI09 partiel (PostMortem + GodsShop portés ; DivineCall gardé sombre/mystique ; Combat déjà abouti + héros animé). **DEV01** (harnais de test) + assets (sprites monstres en forêt, héros idle animé carte/village/combat) faits. Suite = batches ci-dessous.

### Batch UI-IMM — immersion fenêtres (retours playtest 2026-06-06)

> Les overlays « plein écran » cassent l'immersion : on veut **tout dans des fenêtres ancrées sur le monde** (style panneau PNJ), sans empiler de 2e fenêtre.

- [x] **IMM01 — Actions du bâtiment inline dans le panneau PNJ (plus de 2e fenêtre)** (M) — *Bug remonté : clic auberge → overlay PNJ (OK) mais « Rest at the Inn » ouvre une **2e fenêtre** (modale sombre) → coupe l'immersion.*
  - Le panneau PNJ porte **directement** les actions réelles du bâtiment. Actions simples (Rest…) **exécutées en place**, retour affiché dans la zone dialogue (« Vous vous reposez… HP/MP restaurés, le temps avance »).
  - Inn (Marta) : `🛏 Rest at the Inn` (repos inline : heal + avance temps) · `📜 Quest Board` · `✕ Leave`.
  - AC : « Rest at the Inn » n'ouvre **plus** de 2e fenêtre ; effet appliqué + feedback dans le même panneau.
- [x] **IMM02 — Sous-UI fonctionnelles rendues DANS le panneau (suppression `.lb-modal`)** (L) — *dépend IMM01.*
  - Bâtiments à UI riche (Marchand, Forge, Alchimie, Maître-forgeron, Entraîneur, Église) : leur contenu s'affiche **dans le corps du panneau PNJ** (body remplacé/scrollable), pas dans une modale séparée. Bouton `◄ Back` revient au dialogue, `✕ Leave` ferme.
  - Implique : retirer la modale `.lb-modal` du Village ; reparenter `InnPanel/MerchantPanel/BlacksmithPanel/AlchemyPanel/MasterSmithPanel/KnightTrainerPanel/ChurchPanel` dans le panneau.
  - **DÉCIDÉ (2026-06-06)** : le cas des **mini-jeux** (forge/alchimie) inline-vs-fenêtre est **différé** (on tranchera au retravail des mini-jeux). Ce batch reparente les panneaux non-minijeu ; forge/alchimie peuvent rester en fenêtre temporairement.
- [x] **IMM03 — Restyle parchemin des panneaux fonctionnels** (M) — *dépend IMM02.* Les panneaux ne sont plus sur fond sombre → recolorer leur intérieur (texte `--ink`, cartes parchemin, boutons ambre) pour lisibilité/cohérence sur le panneau clair.
- [x] **IMM04 — Hero Sheet & Inventory en overlay immersif (sur l'écran courant)** (M) — *Aujourd'hui Hero/Bag = écrans takeover → on « quitte » le monde.*
  - Les afficher en **overlay au-dessus de l'écran courant** (monde estompé derrière, scrim) façon fenêtre de bâtiment ; les onglets topbar **basculent l'overlay** au lieu de changer `currentScreen`.
  - Implique : flags `heroSheetOpen`/`inventoryOpen` rendus par-dessus la scène ; `.sheet-scrim` couvre l'écran courant.
  - **DÉCIDÉ (2026-06-06)** : garder le format **« sheet centré »** (juste rendu en overlay au-dessus du monde), pas de panneau ancré bas.

### Batch TRV — déplacement diégétique sur la World Map (retours playtest 2026-06-06)

> On **marche** d'un node à l'autre le long du réseau, à un coût en temps. *(Renommé de MAP03-05 → TRV01-03 pour éviter la collision avec le `MAP03` PixiJS de v2.)*

- [x] **TRV01 — Logique de voyage entre nodes (entrer vs voyager)** (M)
  - Clic **node courant** (où est le héros) → **entrer** dans la zone (safe_zone/zone_view, instantané, sans coût).
  - Clic **node adjacent** (graphe `EDGES`) → **voyager** : héros marche A→B, **+3 tics**, puis arrivée (maj `currentLocation`).
  - Clic node **non adjacent** → non navigable direct (feedback / grisé).
  - AC : depuis un node, seuls les voisins `EDGES` sont voyageables ; entrer dans la zone courante reste gratuit/instantané.
- [x] **TRV02 — Animation de marche le long du trail (sprites walking)** (M) — *dépend TRV01.*
  - Animer le sprite **walking** (24 frames, `public/sprites/hero/walking/`) interpolé le long du segment A→B (~1–1.5 s), puis retour idle à l'arrivée ; input verrouillé + trail surligné pendant la marche.
- [x] **TRV03 — Coût en temps du voyage (+3 tics) + rollover** (S/M) — *dépend TRV01.*
  - Voyage = **+3 tics** ; gérer le rollover de jour (>24 tics).
  - **DÉCIDÉ (2026-06-06)** : le voyage **ne déclenche PAS** les tics idle (on ne farme pas en marchant — ça n'a pas de sens). Le voyage **avance seulement le temps** (jour/nuit, horaires de bâtiments, respawn donjon) sans crédit de kills/loot.

### Sprites, assets & contenu visuel

- [ ] **CONT01 — Sprites de carte/combat chibi (couche A)** (M) — *§ASSETS*. **✅ Héros placeholder en place** (`public/sprites/hero/{idle,walking,dying}` — Necromancer chibi CraftPix, à remplacer par un chibi héroïque). **✅ 16/16 monstres de surface liés** (2026-06-08 : `public/monsters/<id>.png` normalisés, chargés par `MonsterPortrait`/ZoneView avec fallback emoji). **✅ 5/9 façades de bâtiments liées** (2026-06-08 : `public/buildings/<id>.png` — inn, church, merchant, alchemy, blacksmith — chargées via `ArtSlot src` dans `VilBuilding`, fallback placeholder légendé). **Reste (art à produire)** : 3 boss (Crypt Keeper, Lord of the Forsaken, **Malachar**), 6 monstres Grimspire, 2 élites Blighted Road, 2 réserve (barrow_wight, soul_harvester) ; **4 façades** (master_smith, knight_trainer, academy, guild) + déco (well/hens/barrels). Pipeline `public/monsters/README.md`.
- [x] ~~**CONT06 — Portraits PNJ pixel (couche B)**~~ — **✅ 5 portraits en place** (`public/portraits/{aldric,smith,marta,merchant,mage}`, 6 émotions, CraftPix) + manifeste `src/data/portraits.js`. **Reste à sourcer** : prêtre (church), chef de village, divinités → fallback emoji en attendant.
- [x] **CONT04 — Noms propres donjons Zone 2** (XS) — ✅ vérifié : noms définitifs déjà en place (donjon « The Forsaken Citadel », boss « Lord of the Forsaken », demon lord « Malachar the Undying ») ; aucun placeholder restant. - remplacer placeholders par noms définitifs
- [ ] **CONT05 — ASSETS.md + sourcing licences** (S) — **✅ `ASSETS.md` créé** (crédits + inventaire + règle anti-clash) ; `public/ASSET_LICENSES/` committé. **✅ Livraison des assets RÉSOLUE** (DEPLOY01, 2026-06-08 : `public/` committé → servi par Vercel ; `raw/` HD exclus). ⚠️ **Reste (optionnel)** : optimiser les 3 gros PNG (map 9.7 Mo, rotting_shambler 5.9, gloom_bat 5.6) via squoosh ; un set d'icônes SVG (remplace emoji).
- [ ] **C03 — Portraits personnage** (S) - 8 icônes au choix en CharCreation (warrior/rogue/mage/ranger/monk/knight/witch/bard)

### QoL essentiel (shippabilité)

- [x] **IDLE-OFF — Progression hors-ligne** (M) - au retour, calculer les gains accumulés depuis `meta.lastSeen` (timestamp) → simuler N ticks → écran récap "Pendant ton absence : X kills, Y or, Z loot". **DÉCIDÉ : gains illimités (pas de plafond), la Fatigue ne s'accumule PAS hors-ligne, auto-stop HP à revoir plus tard.** AC : fermer/rouvrir l'onglet pendant idle actif crédite les bons gains + écran récap
- [x] **SET01 — Menu Options / Réglages** (S) - écran joueur : toggle animations, vitesse de texte, (volume quand U05), reset save (via ConfirmDialog UX03). Sort le toggle "animate" du DebugPanel (DEV-only) vers le joueur
- [x] **TECH07 — Export / Import de save (fichier)** (S) - bouton "Exporter" (JSON téléchargé) + "Importer" (lecture fichier → `loadGame` + migrations). Filet de sécurité + portabilité multi-machine. Complète TECH02/TECH03
- [x] **PROC07 — Debug panel : boutons "give stats"** (XS) - ajouter au `DebugPanel.jsx` (DEV) : +5 STR/AGI/INT/Chance/DEF, +50 maxHP/maxMana, ou "God mode stats"
- [x] **KBD01 — Touche Échap = retour à la World Map** (XS) — *retour playtest 2026-06-06.* Quand on est dans une zone (`safe_zone` / `zone_view`) ou un overlay (Hero Sheet / Inventory / panneau PNJ), **Échap** revient à la WorldMap (ou ferme l'overlay courant en priorité). Sous-ensemble ciblé de **UX04** (navigation clavier complète, v2). AC : Échap sur safe_zone/zone_view → `world_map` ; Échap ferme un overlay ouvert avant de quitter la zone.
- [x] **MRC01 — Feedback d'achat marchand (toast)** (XS) — *retour playtest 2026-06-06.* À l'achat d'un consommable ou d'un équipement chez le marchand, **confirmer visuellement la transaction**. **Approche proposée (à valider)** : réutiliser le système de toasts (U01) → toast type `info`/`loot` « Acheté : <item> · −<prix> 🪙 » (cohérent avec les toasts loot/quête existants), + jouer le badge `unseen-loot` si c'est de l'équipement. Alternative si on veut plus appuyé : petit flash sur la ligne d'item + son (U05). AC : tout achat marchand déclenche un retour visuel immédiat ; pas de double-déclenchement. *(Dev hésite entre toast simple et feedback inline — on tranchera ensemble si besoin.)*

### Batch — retours playtest 2026-06-07 (carte & combat)

> **Implémenté 2026-06-07 (session dev)** : WM-NAME, TRV04, CMB-WIN, CMB-ICON, UI-BESTIARY-BTN, UI-QUESTS. Restent ouverts : SKL-PASS, ANIM01, UI-ACHIEVE-PREVIEW (ce dernier nécessite un système d'achievements à créer au préalable). Suite : **845 tests verts**.

- [x] **CMB-STUCK — 🔴 URGENT : combat gagné mais bloqué sur l'écran de combat** (RÉSOLU 2026-06-07). *Repro joueur : victoire par compétence OU attaque normale → reste coincé au tour du héros, « Victory! » loggé mais pas de ResultPanel.* **Cause-racine** : `handleVictory` (Combat.jsx) loggait « Victory! » puis distribuait TOUTES les récompenses (drops, kills, XP, Gluttony, éveil divin) **avant** `setPhase('result')`. Si une récompense throwait (état de save spécifique : un champ/id provoquant une exception au milieu de la chaîne), la fonction s'interrompait après le log mais avant la transition → joueur bloqué ; pire, `resolvedRef` (déjà `true`) **neutralisait le filet de sécurité**, rendant le blocage irrécupérable. **Correctif** : toute la distribution de récompenses encapsulée dans `try/catch` → `setResult('victory') + setPhase('result')` s'exécutent TOUJOURS (idem `finishCombat`). Une récompense qui échoue est loggée (`console.error`) mais ne bloque plus jamais. **Tests** (`src/screens/Combat.victory.test.jsx`, 7 cas) : victoire 1-coup / multi-tours / multi-ennemis / avec divinité / par compétence + **2 régressions** injectant un throw dans une récompense → vérifient que le ResultPanel s'affiche quand même (validés : ils échouent sur le code non corrigé). Suite : 830 tests verts.
- [x] **SAVE-NORM — 🔴 compteurs de kills/quêtes bloqués + (cause du combat figé)** (RÉSOLU 2026-06-07). *Repro joueur (save day10) : `monsterKillCounts` bloqués à 4, idle jamais débloqué, quêtes gelées.* **Cause-racine** : la save (`saveVersion: 2`, écrite avant l'ajout de `meta.seenHints`) n'avait pas ce champ ; or `recordKill` faisait `state.meta.seenHints.includes('idle_unlock')` — déclenché seulement quand `newCount >= 5` → au **5ᵉ kill**, `seenHints` étant `undefined`, **throw** → le `set()` n'était pas appliqué → compteur figé à 4. Les migrations étant *version-gated*, une save **déjà en v2** ne repassait jamais par le backfill (`{...INITIAL_META, ...meta}` ne tourne que pour v1). C'est **aussi la cause profonde du combat figé** (le throw remontait avant `setPhase('result')` ; le `try/catch` de CMB-STUCK masquait le symptôme mais perdait silencieusement kills/quêtes). **Correctif** : (1) `normalizeSave` **idempotent** appliqué à CHAQUE load (toutes versions) qui ré-injecte tout champ `meta/world/hero` manquant sans écraser les données ; (2) accès défensif `state.meta.seenHints ?? []` dans `recordKill`. **Auto-réparation** : la save du joueur se répare au prochain chargement (les compteurs reprennent de 4→5). **Tests** (`src/store/saveNormalize.test.js`, 9 cas) dont 3 régressions reproduisant le throw exact (`Cannot read properties of undefined (reading 'includes')`). Suite : 839 tests verts.
- [x] **SKL-PASS — XP des skills passifs via impact passif** (M) — *retour playtest 2026-06-07.* Les skills passifs doivent gagner de l'XP **quand ils impactent passivement la situation**, pas via les kills. Ex. *Veteran's Resolve* → +XP **à chaque coup encaissé** ; un passif de drop → +XP à chaque drop ; un passif de soin → +XP à chaque soin déclenché, etc. **À cadrer** : table `passiveXpTrigger` par skill (event → montant), hook dans les bons points du combat (prise de dégâts, drop, soin…). AC : un passif équipé monte en niveau en jouant normalement, selon son effet ; les actifs gardent leur progression actuelle.

- [x] **UI-QUESTS — Bouton « Quests » + suivi des quêtes actives** (S) — *retour playtest 2026-06-07.* Ajouter un bouton **« Quests »** dans la **Topbar** (à côté de Map/Hero/Bag/Save) qui ouvre un **overlay de suivi** listant toutes les quêtes en cours (`world.activeQuests`) avec, pour chacune : titre, description courte, **progression** (ex. `kills X/Y`, dérivée de `monsterKillCounts` / objectifs de la quête) et récompense. Réutiliser le pattern overlay IMM04 (comme Hero/Bag/Codex). *Note : le Quest Board existe en SafeZone mais n'est accessible que dans un village → ce bouton global permet le suivi partout.* AC : bouton Topbar visible hors combat ; overlay liste les quêtes actives avec barre/compteur de progression à jour ; fermeture via ✕/Échap.
- [x] **UI-BESTIARY-BTN — Bouton « Bestiaire » dans le panneau parchemin droit** (XS) — *retour playtest 2026-06-07.* Ajouter un bouton **« 📖 Bestiaire »** dans le **panneau latéral droit de la WorldMap** (bloc parchemin LOCATION/DEITY/DEMON LORD/REPUTATION/ACTIONS) qui ouvre l'overlay **CodexOverlay** déjà existant (`setScreen('codex')`). Aujourd'hui le bestiaire n'est atteignable que depuis le HeroSheet. AC : bouton parchemin présent dans la colonne droite ; clic → ouvre le bestiaire ; style cohérent avec les autres actions du panneau.
- [x] **UI-ACHIEVE-PREVIEW — Aperçu de l'achievement le plus proche (panneau droit)** (M) — *retour playtest 2026-06-07.* Afficher dans le **panneau parchemin droit** un encart « **Prochain accomplissement** » montrant l'achievement dont on est **le plus proche** (titre + barre de progression `X/Y` + récompense). Peut **remplacer ou compléter** l'encart RÉPUTATION. **À cadrer (préalable)** : il n'y a pas encore de **système d'achievements formel** — soit (a) en créer un (`src/data/achievements.js` : id, condition, cible, récompense, dérivés de compteurs existants : kills totaux, quêtes complétées, jours survécus, runs, demon lords, titres…), soit (b) le dériver des `titles`/compteurs existants. Le calcul « le plus proche » = max du ratio `progress/target` parmi les achievements non débloqués. AC : encart droit affiche 1 achievement en cours avec progression réelle, mis à jour quand les compteurs évoluent.

- [x] **WM-NAME — Remonter la plaque de nom du héros (WorldMap)** (XS) — l'**avatar reste à la même position**, mais la plaque de nom doit être **plus proche / plus haute** (collée sous/contre l'avatar). CSS : `.hero-avatar .hero-name` `margin-top` plus négatif (actuellement `-4px`). AC : avatar inchangé, nom remonté et resserré.
- [x] **TRV04 — Voyage 3× plus lent (animation de marche plus visible)** (XS) — *dépend TRV02.* La marche est trop rapide, on ne voit pas l'animation. **Multiplier la durée du déplacement par ~3** : transition CSS `.hero-avatar` (`left/top`) de `.6s` → `~1.8s` **et** la fenêtre `walking` (WorldMap, actuellement `700ms`) → `~2100ms`, gardées synchronisées. AC : la marche dure ~3× plus longtemps, l'anim walking est nettement visible ; input verrouillé toute la durée.
- [x] **CMB-WIN — Retour à la zone après victoire** (S) — après un combat **gagné** (et collecte du loot dans le ResultPanel), revenir sur l'**écran de zone** (`zone_view`, là où sont listés les monstres), pas ailleurs. AC : « Continue » du ResultPanel après victoire → `setScreen('zone_view')` (en conservant `currentHuntingSpot`). *(Vérifier les autres issues : fuite/mort/donjon gardent leur flux actuel.)*
- [x] **CMB-ICON — Icône de monstre ×2 en combat** (XS) — agrandir le sprite ennemi en combat. `Combat.jsx` `EnemyCard` → `MonsterPortrait size` (actuellement `120`) ≈ `240` ; ajuster le layout/min-height de la zone ennemis si besoin. AC : sprite ennemi 2× plus grand, sans casser la disposition multi-ennemis ni les barres HP/floating numbers.
- [x] **ANIM01 — Refonte des animations d'attaque (héros + monstres)** (M) — *demande de cadrage : voici le faisable.*
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
- [x] **WM-AVATAR — Avatar WorldMap ×2 + cadence de marche doublée** (XS) — *retour playtest 2026-06-07.* Deux changements **indépendants** :
  1. **Taille** : avatar héros **2× plus grand** sur la WorldMap. `index.css` `.hero-avatar .hero-sprite` (actuellement `76×112`) → `~152×224` ; l'avatar reste ancré au même point (`transform: translate(-50%,-100%)`). Réaligner la plaque de nom + le halo (cohérent WM-NAME) pour qu'ils suivent l'avatar agrandi.
  2. **Cadence d'animation** : pendant un voyage, **garder la MÊME durée de déplacement** (TRV04 — glisse A→B en ~1.8 s/2100 ms) mais **doubler la cadence du cycle de marche** → le perso fait visiblement ~2× plus de pas sur le trajet. `HeroAvatar` : `walkFps` `14` → `~28` (la **position** glisse à la même vitesse via la transition CSS ; seule la **lecture des frames du spritesheet** s'accélère). *(Vérifier que les 24 frames bouclent proprement à 28 fps sur 2.1 s.)*
  - AC : avatar 2× plus grand sans casser l'ancrage/nom/halo ; en voyage, durée inchangée mais animation de marche nettement plus « vivante » (≈2× plus de pas). **(FAIT — ajusté à ×1.8 sur retour playtest.)**
- [x] **ANIM02 — Animations de combat spécifiques aux skills** (M) — **✅ FAIT (2026-06-08)** : `engine/skillVfx.js` (`getSkillVfx`) — **flash élémentaire** teinté par type de dégâts (feu/foudre/poison/true/physique), **projectile** (magie/distance) vs **frappe** (mêlée), **onde de choc AoE**, **secousse d'arène** sur gros skills ; les skills déclenchent enfin le hit-react de la cible. Tests `skillVfx.test.js` + `Combat.anim02.test.jsx`. Champ `skill.vfx` optionnel (override). *(orig. retour playtest 2026-06-07, « pas prioritaire ».)*
- [x] **TRM01 — 🐞 Héritage de stat à la transmigration + audit complet du God's Shop** (M) — *retour playtest 2026-06-07.* **Bug remonté : « ma stat n'a pas été ramenée » à la transmigration.** **Investigation (déjà faite) :**
  - **Cause probable** : dans `PostMortem.jsx`, `chosenStat` démarre à `null` (l.14) et n'est posé que si le joueur **clique** une stat (l.129). Si rien n'est cliqué → `confirmInheritance(null, …)` → `applyTransmigration` saute le boost (`if (pendingInheritance.stat)`) → **aucune stat héritée**. **Fix proposé** : pré-sélectionner par défaut (ex. la stat la plus haute du run, ou la 1ʳᵉ) **et/ou** rendre la sélection obligatoire avant « Confirm ».
  - **DÉCIDÉ (formule, 2026-06-07)** : ramener **davantage** la stat → `nouvelle = stat_du_run × 0.4` (au lieu de `base × 1.10`). La valeur du run est dans `meta.lastRunSummary.stats[stat]`. ⚠️ **Edge case** : pour une stat peu montée, `× 0.4 < base` → ça **nerferait sous la base**. Plancher à appliquer : `nouvelle = max(base, round(stat_du_run × 0.4))` *(implémenté par défaut — à confirmer ; alternative : `base + (stat_du_run − base) × 0.4`)*.
  - **Audit du God's Shop** (`CATALOG`, `GodsShop.jsx`) — vérifier que **chaque** option est fonctionnelle :
    - `rank_restore` → `rankRestored` → T06 (restaure 80 % des tokens) ✔ à tester
    - `bonus_skill` → `extraSkills` (skill choisi) ✔ à tester
    - `bonus_stat` → `bonusStatSlot` → T08 (+1 stat aléatoire) ✔ à tester
    - `skill_levelup` → `skillLevelUps` (count) → T09 ✔ à tester
    - `starter_kit` → potions hp/mana (ids existants ✔) ✔ à tester
    - **`divine_oracle` → ❌ MORT : défini dans `CATALOG` (coûte 8 tokens) mais JAMAIS consommé dans `handleConfirm` ni ailleurs** → soit l'implémenter (DV12, v2), soit le retirer du catalogue pour ne pas voler 8 tokens au joueur.
  - **Tests à ajouter** : 1 test par option du shop vérifiant son effet **post-transmigration** sur le héros (stats/tokens/skills/consommables) + un test « stat héritée appliquée » et « stat non choisie → comportement défini ». AC : héritage de stat fiable, chaque option du shop a un effet vérifié par un test, `divine_oracle` traité (implémenté ou retiré).
- [x] **CHQ01 — Quêtes de l'église (rotation 3 jours, récompenses tokens + élixirs, sans gold)** (M) — *retour playtest 2026-06-07.* L'**église** (ChurchPanel, NPC04 prêtre) propose un **pool de quêtes** qui **change tous les 3 jours** (rotation basée sur `world.dayCount`, ex. `Math.floor(dayCount/3)` comme seed). Récompenses = **tokens de réputation + élixirs/potions (consommables)**, **JAMAIS de gold** (contrainte explicite). **À cadrer** : data `CHURCH_QUESTS` (pool) + sélection des N quêtes actives selon le bloc de 3 jours, intégration au flux de quêtes existant (`activeQuests`/`completeQuest`), reward `{ reputationTokens, consumables:{id:qty} }` (étend Q09 qui couvre déjà gold/équipement/ressources/stat — ici **tokens+consommables sans gold**). Lien CAL01 (calendrier) + église. AC : entrer à l'église affiche 2-3 quêtes ; elles tournent tous les 3 jours ; les compléter donne tokens + élixirs (jamais d'or) ; tests sur la rotation + les récompenses.
- [x] **DEMON-FIGHT — Action pour combattre le Demon Lord (Malachar)** (M) — *retour playtest 2026-06-07.* **Aujourd'hui il n'y a aucun combat réel contre le Demon Lord** : le bouton « Challenge ➜ » de la section Demon Lord (`ZoneView.jsx` → `DemonLordSection.handleChallenge`) fait juste `alert('Demon Lord battle coming soon!')`. **À implémenter** : déclencher le vrai combat → `startCombat([buildEnemy('malachar', 'grimspire', hero.runNumber)])` (Malachar = rank `demon_lord`, `bossMechanics` 3 phases BSS03, drop **Soul Rend** garanti). **Conditions d'accès à cadrer** (Grimspire débloqué / Forsaken Citadel `cleared` / niveau requis). **Sur victoire** → lever `demonLordDefeated` + récompense **W01 (+200 tokens)** + compteur **M02** + flag **W03** (`malacharDefeatedThisRun`, bannière post-mortem) — cette logique existe déjà dans `clearDungeon('grimspire')` : soit l'appeler à la victoire Malachar, soit extraire une action dédiée `defeatDemonLord()` (plus propre, pour découpler du donjon). **Tests** : l'action lance bien un combat Malachar ; la victoire lève les bons flags + récompenses. AC : bouton fonctionnel → combat Malachar ; victoire = Demon Lord vaincu (tokens/compteur/bannière) ; défaite = mort normale.

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

## v1.2 — Profondeur & contenu

> Ordre acté : **NPC → STA → PROG**. Les informateurs (NPC) débloquent des zones (PROG), donc NPC est prérequis naturel de PROG.

### Bloc 1 — NPC & vie urbaine

> **DÉCIDÉ — répartition par localité** : Auberge (partout) = dormir + informateurs. En **ville** : auberge = dormir + informateurs seulement, les quêtes passent à la **Guilde**. En **village** : auberge = dormir + informateurs + quêtes + init carte d'aventurier. NPC par bâtiment : auberge, marchand, alchimiste, forgeron, guilde. 1-2 informateurs/auberge. 1 chef de village (présent à toute heure tant que BLD01 pas fait).

- [x] **NPC01 — Système de dialogue NPC (arbre simple)** (M) - `DialogueNode { text, options:[{label, nextId}] }` dans `data/dialogues/` ; 2-3 nœuds max par NPC ; composant `DialoguePanel`. Base de NPC04/TAV01/GLD01/ACA*
- [x] **NPC04 — Dialogue avec le maître/sse du bâtiment** (M) - 1 NPC maître par bâtiment (auberge/marchand/alchimiste/forgeron/guilde) + chef de village ; messages prédéfinis en entrant ; utilise NPC01
- [x] **TAV01 — Informateurs à l'auberge** (M) - 1-2 informateurs/auberge (3-4 à la Guilde ville) qui vendent des infos : déblocage zone (PROG03), loot, indices boss. **DÉCIDÉ — contreparties : or / ressources / équipement / mana stone** (PAS un skill équipé). Lien NPC04 + Q09
- [x] **GLD01 — Guilde des Aventuriers (ville)** (M) - **DÉCIDÉ : la Guilde remplace entièrement le quest board de l'auberge en ville** ; quêtes prestigieuses liées au rang Q06 ; 3-4 informateurs sur place
- [x] **GLD02 — Quêtes & carte d'aventurier au village (via l'auberge)** (S) - pool de quêtes réduit dans l'auberge village + initialisation de la carte d'aventurier ici ; pondération `location.type`
- [x] **SKL01 — Skills jusqu'au niveau 5** (M) - étendre le leveling de 3 à 5 niveaux : définir seuils d'XP 3→4 et 4→5 + scaling d'effet/coût par niveau ; prérequis d'ACA03. AC : un skill peut atteindre Lv5, scaling cohérent, migration save
- [x] **ACA01 — Académie de magie (acheter/vendre skills)** (M) - bâtiment ville : catalogue d'achat de skills + revente depuis l'inventaire de skills
- [x] **ACA02 — Déséquipement réservé à l'Académie** (S) - équiper libre partout, **déséquiper seulement à l'Académie** + feedback clair ailleurs
- [x] **ACA03 — Achat-revente avec plus-value au niveau** (M) - **DÉCIDÉ — formule : `nouveau_prix = prix_origine × 1.15^(niveau−1)`** (skills Lv1→5, dépend SKL01). Pas de garde anti-exploit pour l'instant
- [x] **ACA04 — Quêtes de level-up de skill (maître)** (M) - le maître demande de monter un skill au niveau X. **DÉCIDÉ — récompense : gold + (skill OU +5 Aura OU +5 Concentration)**. Type `skill_levelup` + Q09 ; lien NPC04
- [x] **BLD01 — Horaires d'ouverture des bâtiments** (M) - `openHours:{from,to}` en ticks (lié CAL01). **DÉCIDÉ : taverne ouverte 24/24 ; les autres ont des horaires ; le chef de village suit alors les horaires.** Bâtiment fermé → refus + heure d'ouverture

### Bloc 2 — Nouvelles stats (Fatigue · Aura · Concentration)

> 💡 STA02 + STA03 partagent un compteur d'activité sur **fenêtre glissante de 4 jours** → coder un seul helper `countWithinDays(events, 4)`.

- [x] **STA01 — Fatigue (vigueur 0–100)** (M) - jauge de vigueur : 100 = frais, décroît avec l'effort. **DÉCIDÉ — coûts : −3/combat, −1/unité de distance, −3/craft. Dormir à l'auberge restaure à 100.** Paliers de malus temporaires : sous 70 → −10% ATK ; sous 50 → −15% ATK+AGI ; sous 30 → −35% toutes stats + risque d'échec craft ×4. AC : décrément par action, restauration au sommeil, malus appliqués aux bons paliers, tests
  - **DÉCIDÉ — collision résolue** : le *debuff* "Fatigue" de CRF01 (AGI−20%, **dormant — jamais appliqué en jeu**) est **supprimé** de `data/debuffs.js` (+ maj des 22 tests qui le référencent). À la place, une action ratée/usante ajoute **+40 de Fatigue** (≈ −40 de vigueur sur la jauge 0–100). À faire **dans le cadre de cette implémentation STA01**.
- [x] **STA02 — Aura (multiplicateur de dégâts)** (M) - multiplicateur passif permanent : **+ (X/2)% de dégâts par point d'Aura, sans plafond**. **DÉCIDÉ — déblocage : 15 skills utilisés en <4 jours OU entraînement chez un maître (guerrier/mage, voir TRA01). À l'unlock : 15 d'Aura de départ. Gain : +1 Aura tous les 10 skills utilisés (pour l'instant).** Impacte `calcSkillDamage` + effets défensifs. Tracking fenêtre 4j (`countWithinDays`)
- [x] **STA03 — Concentration (qualité de craft)** (M) - **DÉCIDÉ — effet : de 0 à 150, donne (X/150)% de chance d'un cran de rareté supérieur ; 150 = +1 cran garanti. Gain par craft selon le score du mini-jeu : +1 / +2 / +5.** Impacte `resolveCraftOutcome`
- [x] **STA03b — Gain de Concentration via quête ou livre (mécanique généralisable)** (S) - source alternative de Concentration (et, à terme, Intelligence et Aura) via quêtes et livres. Mécanique générique `gain_stat` réutilisable. Dépend ITM01 (livres) + Q09 (récompense quête)
- [x] **STA04 — Atténuation de la Fatigue par Concentration (craft) et Aura (combat)** (S) - **DÉCIDÉ** : la **Concentration** tamponne l'impact Fatigue sur le **craft** (70% à 100, 85% à 200, 100% à 300) ; l'**Aura** tamponne l'impact Fatigue sur le **combat** (50% à 100, 70% à 200, 85% à 300). AC : aux paliers, le malus de Fatigue est réduit du bon pourcentage sur le bon domaine ; tests
- [x] **TRA01 — Entraînement chez un maître** (M) - action *Train* avec un NPC maître (guerrier/mage, lié NPC04 + Knight Trainer/Académie) qui octroie de l'Aura (maître guerrier/mage) ou de la Concentration (artisan). Voie de déblocage alternative de STA02/STA03
- [x] **ITM01 — Livres de stats (objets consommables)** (S) - nouveau type d'objet `book` avec effet `gain_stat` (Concentration, Intelligence, Aura…). Achetables chez marchands, trouvables en quêtes/donjons. Base de STA03b

### Bloc 3 — Déblocage progressif des zones & fog of war

> Vision : la carte n'est pas entièrement découverte au départ. On débloque une zone en aidant assez de gens (quêtes), en atteignant un niveau/des stats, ou en achetant l'info (informateurs TAV01). Petit nuage (fog) sur les zones non découvertes.

- [x] **PROG02 — État de départ restreint** (S) - **DÉCIDÉ : nouvelle localité "village de départ" + sa zone**, seules débloquées au démarrage. `unlockedZones:[startZone]`. Migration : anciennes saves = tout débloqué
- [x] **PROG01 — Déverrouillage progressif des zones (data-driven)** (M) - `zone.unlock:{ type:'quest'|'info'|'zoneCleared'|'level'|'stat'|'item', ref, hidden }` + `isZoneUnlocked`/`getVisibleZones` ; fog of war (nuage) sur les zones non découvertes sur la WorldMap. Dépend PROG02
- [x] **PROG03 — Déblocage de zone via quête OU info NPC** (M) - action `unlockZone(zoneId, source)` ; deux voies : quête (Guilde) ou info achetée (informateur TAV01). Dépend PROG01

### Contenu & systèmes complémentaires

- [x] **CODEX01 — Bestiaire / Codex** (M) - compendium des monstres qui se remplit progressivement (cohérent S02 : stats après X kills, skill après 5 kills). Réutilise `monsterKillCounts` déjà présent
- [x] **ACH01 — Succès avec bonus permanents** (M) - **DÉCIDÉ : bonus méta (persistent entre runs) ; ampleur +1 à +10 en stat, +1% à +7% gold/exp ; liste de 8 succès de départ à définir.** `meta.achievements` + déblocage + toast. Proposer les 8 succès au grooming de contenu
- [x] **CRF06 — Antidote craftable chez l'alchimiste** (M) - brancher l'effet `cureDebuffs` de `antidote_basic` (déjà craftable Z04) sur les debuffs permanents CRF01
- [x] **NPC02 — 10 nouvelles quêtes contenu** (M) - rangs Cuivre→Argent : élites, donjons, livraison, exploration
- [x] **Q04 — Quêtes exploration** (S) - type `'visit'` : complétée quand `world.visitedSpots` inclut la cible
- [x] **Q05 — Quêtes craft** (M) - type `'craft'` : tracker `meta.craftCount` incrémenté à chaque craft réussi
- [x] **Q09 — Récompenses de quête variées (gold / équipement / ressources / stat)** (S) - étendre `quest.reward` : `equipment:{templateId,rarity}`, `resources:{id:qty}`, `stat:{name,amount}` (base de STA03b/ACA04/TAV01). Adapter `completeQuest` + RewardBadge + toast Q07
- [x] **Z07 — Stock d'équipement différencié village vs ville** (S/M) - village = communs + 1 rare ; ville = rares + 1 epic. Pondérer `equipStock` selon `location.type`. **Bloqué par PROG02** (distinction de localité)
> 🔗 **D01 + D03 + D06 = le détail de `DUNREV01` (v1.3, umbrella).** Même travail, **compté une seule fois** ; conservés ici pour la spec détaillée, à dérouler quand `D01-SPEC` sera écrit.
- [ ] **D01 — Flux donjon complet** (L) - path map : Entrée → choix A (Combat|Trésor) → choix B (CombatElite|Repos|Event) → Boss ; idle interdit. ⏸ **Différé : nécessite `D01-SPEC` (DESIGN.md) avant dev** — PV/loot par type de nœud, probabilités, génération
- [ ] **D03 — Carte de donjon** (M) - 5 nodes Canvas/SVG par type, chemin tracé, nœud actuel mis en évidence — dépend D01
- [ ] **D06 — Donjon spawn la nuit suivante** (M) - cycle sommeil déclenche respawn + position aléatoire + marker "?" — dépend CAL01 + MAP01
- [x] **T02 — Transmigration animée** (M) - écran de transition animé entre GodsShop et renaissance
- [x] **T05 — Socle universel d'héritage (écran dédié)** (M) — ✅ couvert par PostMortem (section « Transmigration — Choose what to carry » : 1 stat + 1 active + 1 passive, puis « Enter the Gods' Shop → ») - **UI uniquement** (la logique d'héritage existe déjà dans `applyTransmigration`) : écran de choix 1 stat + 1 active + 1 passive avant la boutique
- [x] **T12 — Skill suprême Demon Lord ("Soul Rend") héritable** (M) - flag `skill.alwaysInheritable: true` (transgresse DV10)
- [x] **I08 — Choix joueur en idle** (M) - config avant idle : monster type + seuil HP personnalisable (le "craft en parallèle" reporté). Garder minimal pour v1.2
- [ ] **TUT01 — Premier run guidé : tooltips contextuels** (L) - hints progressifs restants (TUT02/TUT03 déjà faits) : J2 donjons, 1er dieu, 1er craft… ⏸ **Différé : lister les 5-6 hints restants (mini-spec) avant dev**

---

## v1.3 — Backlog (à groomer)

> Deux familles, à groomer ensemble : **(A)** tickets de retours playtest 2026-06-07/08 (QoL, contenu, démarrage Greywatch) et **(B)** l'ancienne milestone **v2 — Refonte / ambition (L/XL)** basculée ici le 2026-06-08 (compagnons, événements, foyer, ATB, multi-univers, divinités avancées, polish). **Non groomés** : vérifier INVEST + AC avant de démarrer un M/L ; l'ordre et les décisions fines seront tranchés au grooming.

### Correctifs & régulations (revue code 2026-06-08)

> ↗️ **GLD03** + **ANIM03** déplacés dans le lot **« v1.1 — prêt »** (🟢, fixes safety/ux) le 2026-06-08.
- [ ] **REP01 — Reputation tokens à 0 (temporaire) + rééquilibrage différé** (S→M) — *décision 2026-06-08 (mise à jour).* **DÉCIDÉ : pour l'instant, TOUTES les quêtes donnent 0 token de réputation** (le rééquilibrage fin sera revu plus tard). **Immédiat (🟢 prêt)** : (1) `gameStore.completeQuest` — `repTokens = r.reputationTokens ?? 0` (corrige le `?? 1` → +1 token fantôme sur les quêtes `{gold,aura}` de maître), ne créditer/toaster que si `> 0` ; (2) passer `reputationTokens` à **0** sur toutes les quêtes. **Différé (rééquilibrage ultérieur)** : élites = 5 ? boss/demon-lord (3/5/10) ? église/maître ? + **revoir les seuils de rang Q06** (`RANK_TIERS`, `PRESTIGE_MIN_TOKENS`). Lien QSV2.
- [ ] **DLG01 — Arbres de dialogue manquants pour les NPCs** (M) — *revue code + retour.* Créer les **dialogues** des NPCs qui retombent aujourd'hui sur le `FALLBACK_DIALOGUE` générique (« stranger… »). Cas connu : la **Guilde** (`TALK_ID.guild = 'guild_master'`, mais aucun arbre `guild_master` dans `data/dialogues`) → Guildmaster Doran parle générique. **À cadrer** : recenser tous les NPCs sans arbre dédié (guild_master, et vérifier academy/knight_trainer/master_smith/alchemy/informateurs), écrire 2-3 nœuds par NPC (réutilise NPC01 `DialogueNode` + NPC04). AC : chaque maître de bâtiment a un dialogue propre (plus de fallback générique sur un NPC nommé).

### QoL & UI

> ↗️ **WAIT01** + **VIG01** déplacés dans le lot **« v1.1 — prêt (perf/safety/ux/log) »** (2026-06-08).

- [x] ~~**HIDE01 — Masquer Aura & Concentration jusqu'au déblocage** (S)~~ — **⛔ SUPERSÉDÉ par `HS-AURA01` (2026-06-08)** : décision changée → on **affiche flouté/🔒** au lieu de masquer (le joueur doit savoir que ces stats existent). Voir HS-AURA01 (v1.2 / HeroSheet).

### Divin — église *(priorité basse mais important)*

- [ ] **DVQ01 — Quêtes divines à l'église** (M) — *retour playtest 2026-06-07.* L'église propose des **quêtes liées aux dieux** (en plus des « œuvres de dévotion » CHQ01) ; récompenses orientées **faveur divine**. **À cadrer** : pool, conditions, lien `deities.js` + relations (ALT01). Dépend CHQ01/Q09. *Priorité basse.*
- [ ] **ALT01 — Autels des dieux + relations divines** (M) — *retour playtest 2026-06-07.* Un **autel par dieu** dans l'église ; **offrandes/prières** pour augmenter une **jauge de relation/faveur** par dieu (au-delà du `divineBonds` actuel). **À cadrer** : données `divineFavor:{deityId:score}`, coûts d'offrande (gold/ressources/tokens), effets de la faveur (bénédictions, accès skills divins…). Lien DV03/DV04/`deities.js`. *Priorité basse mais important.*

### Craft

- [ ] **CRAFTMG01 — Mini-jeux dédiés par métier de craft** (M) — *retour playtest 2026-06-07.* Concevoir/revoir un **mini-jeu spécifique par métier** (forge, alchimie, cuisine, cordonnier…) au lieu du `CraftingMinigame` générique unique. **À cadrer** : 1 mécanique par métier + mapping métier→mini-jeu + impact qualité (lien STA03 Concentration).
- [ ] **COOK01 — Métier de cuisine** (M) — *retour playtest 2026-06-07.* Introduire un **craft de cuisine** : recettes de plats → **consommables/buffs** (≠ équipement). **À cadrer** : bâtiment/NPC cuisine, ingrédients, effets (buffs temporaires ATK/vigueur/regen…), intégration `recipes.js` + `resources.js`. Lien CRAFTMG01.
- [ ] **LEAT01 — Séparer forge (métal) et cordonnier (cuir)** (M) — *retour playtest 2026-06-07.* **DÉCIDÉ : séparer les équipements métal et cuir.** La **forge** ne traite que le **métal** ; un **cordonnier/maroquinier** traite le **cuir** (bottes, armures légères, gants…). **À cadrer** : tag `material:'metal'|'leather'` sur `EQUIPMENT_TEMPLATES`, répartition des recettes par bâtiment, nouveau bâtiment/NPC cordonnier (BLD_POS/NPCS/BUILDING_INFO). Lien Z07/Z03.

### Contenu & systèmes

- [ ] **ZADV01 — Design de la zone avancée (Grimspire) + bestiaire** (L) — *retour playtest 2026-06-07.* Design **complet de Grimspire** (zone avancée) : **spots de chasse**, **monstres dédiés** (refonte façon MON01 d'Ashenvale), niveaux, loot, ambiance. **À spec avant dev.** Lien MON01.
- [ ] **MONLV01 — Système de niveau des monstres** (M/L, **P2**) — *retour playtest 2026-06-07/08.* **✅ DÉCIDÉ (2026-06-08)** :
  - **Niveau** : `lvl_monster = random_int( max(start, hero−3), max( min(hero, end), start ) )` — bande ~4 niveaux **près du héros** ; le `max(…, start)` gère l'**edge case héros < start** (range non inversée).
  - **Stats** : `base_stats × 1.25^(lvl_monster − start)` (**+25 %/niveau**). `start`/`end` dérivés du `levelRange` du **spot**.
  - **Run-scaling** : **conservé** mais **`1.08 → 1.03`** (power creep méta plus doux). *(À noter : `zoneMult` × niveau peuvent se recouper — à surveiller au playtest.)*
  - **Récompenses exp/gold ET taux de drop scalés avec le niveau** — facteurs **dans BAL-CSV01** (proposition à valider : exp/gold `×1.25^Δ` ; drop `+X%`/niveau ou meilleure rareté).
  - **Affichage** : **montrer la RANGE** de niveau (ex. « Lv 2-5 ») sur la **carte de spot + bestiaire** (aléa visible pour le joueur) ; le **niveau réel** affiché **en combat**.
  - Ouvert : bonus élite (niveau ou mult. supérieur). Lien `zones.js` (`scaleMonsterStats`/`getMonsterLevel`) + combat + **BAL-CSV01** + **ZV-CARDS01** (emplacement du niveau sur la carte).
- [ ] **DUNREV01 — Revue complète du système de donjon (umbrella)** (L) — *retour playtest 2026-06-07.* **Reprendre tout le système de donjon.** Regroupe les différés **D01** (flux nœuds Entrée→choix→Boss), **D03** (carte), **D06** (respawn nuit). **Prérequis : `D01-SPEC` (DESIGN.md)** — types de nœuds, PV/loot par nœud, probabilités, génération. **À spec avant dev.**
- [ ] **MVAR01 — Variante d'image par ennemi (combats multi-ennemis)** (S/M) — *retour playtest 2026-06-08.* En combat avec **plusieurs ennemis du même monstre**, chacun utilise une **variante d'image différente** quand plusieurs existent (sinon réutilise `<id>.png`). **✅ Assets prêts** : schéma de nommage `public/monsters/<id>.png` + `<id>_2.png` + `<id>_3.png` déjà en place (2026-06-08) — pools actuels : **3 variantes** (mire_slime, fenrot_devourer, stone_golem, hollow_knight, ruin_specter, graven_sentinel, hill_slime, russet_fox, knoll_goblin, thunderhoof) · **2** (thicket_hare, briar_wraith) · **1** (ashwood_wolf, tuskmaw_boar, old_oakheart, marsh_serpent). **À cadrer (décision clé)** : le navigateur ne peut pas lister `public/` → le loader doit **connaître le nombre de variantes** par monstre : soit (a) un **manifeste data** `MONSTER_VARIANTS={ russet_fox:3, … }`, soit (b) tenter `<id>_N.png` avec **fallback onError** sur `<id>.png` (génère des 404). Attribution variante = par **index d'ennemi** (`(i % count) + 1`, ou aléatoire distinct). Touche `MonsterPortrait` (Combat) + `<img>` ZoneView + Codex. Fallback : moins de variantes que d'ennemis → on cycle ; aucune image → emoji.
- [ ] **QA01 — Audit compteurs de monstres + intégrité & fonctionnel des items** (M) — *retour playtest 2026-06-08.* Passe de **vérification** en 3 volets : **(1) Compteurs de monstres bien actualisés** — `world.monsterKillCounts` incrémenté à chaque kill (combat + idle), propagation correcte vers : déblocage idle (≥5 kills), Codex/Bestiaire (stats après X kills, skill flou < 5), objectifs de quête `kill`, succès. **(2) Items bien liés** — auditer toutes les références d'items (drops monstres `resourceDrops`/`skillDrop`, recettes `recipes.js`, stock marchand/forge, récompenses de quête `resources`/`consumables`/`equipment`, livres ITM01) pointent vers des ids **existants** dans `RESOURCES`/`EQUIPMENT_TEMPLATES`/`SKILLS` (test d'intégrité data, type npc02.test). **(3) Items fonctionnellement ET logiquement corrects** — chaque item « lié » a un **effet qui marche** (potions heal/mana, élixirs/buffs, antidote `cureDebuffs` CRF06, livres `gain_stat` ITM01, équipement = stats appliquées) **et cohérent** : l'effet correspond au **type/à la description/à la rareté** (ex. une potion de soin soigne bien, un tome de Focus donne bien de la Concentration, un équipement « lourd » n'a pas de stats incohérentes, le rendement d'une recette est logique). AC : un test d'intégrité référentielle + une checklist d'effets vérifiés (fonctionnels **+ logiques**) ; corriger les références mortes ou effets incohérents. **NB** : une partie est déjà couverte par les tests existants (npc02/z07/itm01/crf06…) — ce ticket les consolide et comble les trous.

### Démarrage restreint « Greywatch » (découpage — étend PROG01/02/03)

> Vision (playtest 2026-06-07) : le run **démarre à Greywatch**, seule la **forêt** est accessible ; **nuages (fog)** sur le reste de la carte ; les nuages **se dissipent** au fur et à mesure que les zones/spots se débloquent. ⚠️ Étend le déblocage data-driven (PROG01/02/03, livré au **niveau « grande zone »**) **au niveau des nodes de la WorldMap** (= la version *littérale* de PROG02, plus ambitieuse que l'implémentation actuelle).

- [ ] **START01 — Le run démarre à Greywatch (village de départ)** (M) — **✅ DÉCIDÉ (2026-06-08) : le starting point est `greywatch`.** `world.currentLocation`/`currentNode` initial = **greywatch** (au lieu d'ironhaven) ; le héros spawn au village de départ. Migration : anciennes saves inchangées. **À cadrer** : impact sur les tests qui supposent `ironhaven` au départ. Dépend rien (point d'entrée du bloc).
- [ ] **START02 — Accès initial limité à la forêt + déblocage par node** (M) — au démarrage, seuls **Greywatch** + **Ashenvale Forest** sont accessibles ; les autres **nodes** WorldMap (marais, ruines, collines, ville, route, Grimspire) sont **verrouillés**. **Étend `zone.unlock` / `unlockedZones` / `isZoneUnlocked` au niveau des hunting spots/nodes** (aujourd'hui : seulement les grandes zones). Dépend START01 + PROG01/PROG02.
- [ ] **START03 — Fog of war généralisé (nuage par node) + dissipation** (M) — afficher un **nuage** sur **chaque node/zone non débloqué(e)** de la WorldMap (généralise le fog PROG01 aujourd'hui limité à Grimspire) ; le nuage **disparaît** au déblocage. Dépend START02.
- [ ] **START04 — Conditions de déblocage progressif des nodes** (M) — définir les **conditions par node** (forêt → marais → ruines → collines → ville → route → Grimspire) en data-driven (kills / niveau / quête / info), cohérent avec PROG01/PROG03. Dépend START02. *Ordre & conditions à affiner au grooming.*

---

> 🔁 **Ex-v2 basculé dans v1.3 (2026-06-08)** — les sections ci-dessous étaient l'ancienne milestone *« v2 — Refonte / ambition (L/XL) »*. Conservées dans v1.3 comme **items lourds d'ambition (L/XL)** : à prioriser/découper au grooming, séparément du backlog playtest plus léger ci-dessus.

### Compagnons de combat (ambition L/XL)
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

## Nouveaux tickets (suggestions Claude) — assignés par version (2026-06-08)

> Audit + arbitrages utilisateur du 2026-06-08. **P1** = nécessaire / alpha solide · **P2** = bonne amélioration · **P3** = polish. (À fusionner sous les en-têtes `## v1.1` / `## v1.2` au grooming si tu préfères.)

### → v1.1 — Prêt à coder : perf / safety / ux / log (2026-06-08)

> Filtre demandé : **« rien ne manque » (🟢) ET typologie perf/safety/ux/log**. Lot recommandé pour le prochain passage de code. *(BAL/audio/contenu/specs → v1.2 ; idle → v2.1.)*

**Perf**
- [~] **PERF-IMG01 — Optimisation des assets** (S, **P1 — avant 1er push**) — **PARTIE CODE ✅ FAIT 2026-06-10** : `loading="lazy"` sur les sprites de monstres (`MonsterSprite`) et les assets `ArtSlot` (bâtiments/façades). +test. ⚠️ **RESTE (manuel, hors scope code)** : **compresser les binaires** (map 9.7 Mo + `rotting_shambler` 5.9 / `gloom_bat` 5.6 → squoosh, cible ≤ 300–500 KB) **avant le 1er push** — nécessite un outil d'image (squoosh/sharp), impossible à faire de façon fiable par édition de code. À faire à la main.
- [x] **PERF-SPLIT01 — Code-splitting du bundle** (S, **P2**) — **✅ FAIT 2026-06-10.** `React.lazy` sur Combat / CodexOverlay / GodsShop + `<Suspense fallback={<ScreenFallback/>}>` autour de la zone d'écran. Build : chunks séparés (Combat 34.8 kB, GodsShop 8 kB, Codex 1.8 kB) ; chunk principal 480 → 445 kB. +test (chargement lazy de Combat via Suspense).

**Safety / robustesse**
- [x] **SAVE-AUDIT01 — Migration & validation du schéma de save** (M, **P1**) — **✅ FAIT 2026-06-10.** `normalizeSave` durci en **validation de schéma défensive** : helpers `asArray`/`asObject` réparent tout champ persisté **présent mais du mauvais type** (tableaux hero/world/meta, objets `inventory`/`stats`/`equipped`/`monsterKillCounts`/`questProgress`/`settings`/…) en plus du backfill des champs manquants. Répare au lieu de crasher (plus de throw sur `.length`/`.includes`/`Object.entries`). +5 tests (champs malformés coercés, sous-clés backfillées, save legacy v1, chargement d'une save corrompue → `loadGame`+`recordKill` sans crash).
- [x] **FIX-QUESTSNAP01 — Snapshot de progression de quête** (M, **P1**) — **✅ FAIT 2026-06-10.** `world.questProgress[questId] = { baseKills, baseCraft }` figé à l'acceptation (`startQuest`). Progression comptée en **delta** via la source unique `questObjectiveStatus` / `isQuestCompleteState` (data/quests.js), utilisée par `isQuestComplete` (store) **et** l'affichage (QuestCard via prop `base`, QuestsOverlay refactoré). Migration : `questProgress: {}` ajouté à `INITIAL_WORLD` (backfill `normalizeSave`). +3 tests (acceptation d'une quête déjà « remplie » en cumulé → non complétable ; delta).

- [x] **CMB-INVARIANT01 — Garde-fous & invariants de combat** (S, **P2**) — **✅ FAIT 2026-06-10.** Tests d'invariant (`Combat.escape.test.jsx`) : multi-ennemis → ResultPanel atteint, et le filet Exit **garantit** la fin depuis un combat injouable. S'appuie sur le garde `resolvedRef` + le try/catch de `handleVictory` (déjà en place via CMB-WIN-FIX) qui assure toujours `setPhase('result')`. *(crit/DoT : pas de système de crit dans le jeu ; le DoT au tour ennemi passe déjà par le filet handleVictory.)*
- [x] **CMB-ESCAPE01 — Bouton « Sortir du combat » (filet anti-blocage, alpha)** (XS, **P1**) — **✅ FAIT 2026-06-10.** Bouton `🚪 Exit Combat` (coin haut-droit, visible tant que `phase !== 'result'`) → `ConfirmDialog` (UX03) → `handleVictory(enemies)` = victoire propre → ResultPanel. Le joueur n'est **jamais** coincé. +tests (résolution depuis combat injouable + annulation).
- [x] ~~**GLD03 — Fix : quêtes masquées au mauvais lieu** (S)~~ — **⛔ SUPERSÉDÉ par `QSV2-TURNIN01` (2026-06-08)** : on fait directement la vraie règle de localité/rendu (rendable au lieu émetteur + ville universelle) plutôt que le stopgap « rendable partout ».
- [x] **QSV2-LOCALITY01 — Quêtes appartenant à un lieu unique** (M, **P2**) — **✅ FAIT 2026-06-10.** Helper `getQuestIssuer(quest) = quest.issuedBy ?? QUEST_NPC_REGISTRY[giverNpc].location`. Board `available` filtré sur `issuer === currentLocation` (plus de pool par venue ; `getBoardQuests` conservé pour les tests unitaires). +tests. ⚠️ **Conséquence contenu connue** : Millhaven n'émet aucune quête (tout est émis par Ironhaven/Greywatch) → board vide à Millhaven, à corriger par des **quêtes propres aux villages** (ticket de contenu à créer).
- [x] **QSV2-TURNIN01 — Disponibilité & rendu par lieu** (M, **P2**) — **✅ FAIT 2026-06-10.** Remplace GLD03. `available` = `issuer === currentLocation` ; `active`/`completed` + Claim visibles à `issuer === currentLocation` **OU** en ville (`isCity`, rendu universel). Aucun `acceptedAt` (tout se déduit de l'issuer). +tests (quête de Greywatch rendable en ville, pas dans un autre village).

**Log / DX**
- [x] **DX-CI01 — CI GitHub Actions** (S, **P1**) — **✅ FAIT 2026-06-10.** `.github/workflows/ci.yml` : job `verify` (Node 20, `npm ci`) → `npm run lint` + `npm run test:run` + `npm run build` à chaque push (master/dev) et PR. Badge CI ajouté en tête du README. *(s'exécutera côté GitHub au 1er push.)*
- [x] **DX-ERRTRACK01 — Capture d'erreurs runtime** (S, **P2**) — **✅ FAIT 2026-06-10.** Util `errorLog` (« Sentry-lite ») : `logRuntimeError` journalise en console **structurée** + persiste un ring buffer (10 dernières) dans `localStorage['lb_errors']` (inspectable/exportable, sinon erreurs prod invisibles). `ErrorBoundary.componentDidCatch` l'utilise (+ bouton « Copy error details »), et le catch idle-tick d'`App.jsx` aussi. +6 tests.
- [x] **DX-LINT01 — Nettoyer les 5 warnings eslint** (XS, **P3**) — **✅ FAIT 2026-06-10.** `// eslint-disable-next-line react-hooks/exhaustive-deps` (avec justification) sur les 4 `useEffect` run-once d'`App.jsx` + l'effet de génération de village de `SafeZone.jsx`. **`npm run lint` = 0 erreur, 0 warning.**
- [x] **DEVBP01 — Revue & application des bonnes pratiques de dev** (M, **P2**) — **✅ FAIT 2026-06-10.** Livré : **(1) Prettier** adopté (`.prettierrc.json` : no-semi, single-quote, `printWidth 100`, `trailingComma all`) + `.prettierignore` + `.editorconfig` ; scripts `format`/`format:check` ; **167 fichiers reformatés** (filet : lint 0 err, 1032 tests verts, build OK). **(2) Hook pre-commit** husky 9 + lint-staged (`eslint --fix`+`prettier` sur `**/*.{js,jsx}` ; `prettier` sur `**/*.{css,json,html}`), auto-installé via script `prepare`, **testé fonctionnel** (les globs **doivent** porter le préfixe `**/` sinon les fichiers imbriqués de `src/` ne matchent pas). **(4) Seuil couverture 80 % lignes** dans `vite.config.js` (script `test:coverage`). **(5) `npm audit fix`** → **0 vuln** (vite 8.0.16, postcss patché). **(6) CONTRIBUTING.md** étendu (§8 formatage + hook, §5 checklist mise à jour). ⚠️ **Hors goal, sortis en tickets** : item (3) contrats de composants → **DEVBP02** ; couverture réelle **71 %** < 80 % (écrans UI sous-testés) → **COV80**. *Diff + commit gérés par l'utilisateur (GitKraken) ; 4 nouveaux fichiers untracked : `.prettierrc.json`, `.prettierignore`, `.editorconfig`, `.husky/`.*
- [x] **DEVBP02 — Contrats de composants (JSDoc / PropTypes)** (M, **P3**) — **✅ FAIT 2026-06-10.** JSDoc `@param` ajouté sur les **primitives réutilisables** de `components/` : `ConfirmDialog`, `Tooltip`, `QTEBar`, `ArtSlot`, `HeroAvatar`, `ParchmentFrame` (pas de TS — JSDoc, cf. ADR-002). *Reste incrémental : documenter les autres composants (DialoguePanel, InformantsPanel, OfflineRecapModal…) et les props publiques des screens au fil de l'eau.*
- [x] **COV80 — Monter la couverture lignes (gate aligné)** (M, **P3**) — **✅ FAIT 2026-06-10.** Couverture lignes **71,06 % → 77,87 %** (~290 lignes en plus via ~70 nouveaux tests : panneaux SafeZone, PostMortem, flux Combat, interactions WorldMap, errorLog, saveAudit…). SafeZone 18→44 %, WorldMap 59→73 %, etc. **Décision utilisateur (2026-06-10)** : seuil `thresholds.lines` baissé **80 → 76** dans `vite.config.js` → `npm run test:coverage` **VERT** (CI passe). 🎯 **Cible 80 % conservée** comme aspiration : les ~2 % restants sont les internes de `Combat.jsx` (boss/DoT/skills, timer-heavy) — à reprendre quand utile (remonter le seuil au passage).
- [x] **REFAC01 — Découpage de `gameStore.js` en slices** (M, **P2**) — **✅ FAIT 2026-06-10.** `gameStore.js` (1939 l.) réduit à **39 l.** : état racine + recomposition de **7 slices** (`slices/heroSlice` 35 actions, `combatSlice` 5, `questsSlice` 6, `worldSlice` 8, `idleSlice` 6, `metaSlice` 13, `saveSlice` 5). Extraits aussi : `initialState.js` (INITIAL_*/SAVE_VERSION), `helpers.js` (applyLevelUps), `migrations.js` (migrateV1ToV2/normalizeSave/runMigrations). `gameStore.js` **ré-exporte** `SAVE_VERSION/normalizeSave/runMigrations` (API publique préservée). Découpe **verbatim** (script d'extraction + scan d'imports auto). **Zéro changement de comportement** : 1032 tests verts + build OK + lint/format verts. Bonus hygiène : `coverage/` ajouté aux ignores eslint.
- [ ] **REFAC02 — Découpage de `SafeZone.jsx` (1 fichier/panneau)** (M, **P3**) — *TC 2026-06-08.* Sortir chaque panneau de bâtiment (Inn/Church/Merchant/Alchemy/Blacksmith/MasterSmith/KnightTrainer/Academy) + `NpcOverlay`/`VilBuilding` dans leurs fichiers. Refacto pur, tests verts inchangés. **Différé après v1.1** (les tickets v1.1 modifient SafeZone → éviter le conflit).
- [ ] **REFAC03 — Découpage de `Combat.jsx` (sous-composants + hook)** (M, **P3**) — *TC 2026-06-08.* Extraire `EnemyCard`/`HeroCard`/`ActionPanel`/`VictoryPanel`/`FloatingNumbers` + un hook de logique combat. ⚠️ le **plus risqué** (moins de tests sur le rendu) → prudent. **Différé après v1.1**.

**UX — QoL & écrans**
- [x] **INN-WAKE01 — Réveil à 8h en dormant à l'auberge** (XS, **P2**) — **✅ FAIT 2026-06-10.** `worldSlice.sleep` met `tickCount: 8` (+ `isNight: false`). Test sleep mis à jour.
- [x] **WAIT01 — Action « Wait » (avancer jusqu'à une heure choisie)** (S, **P2**) — **✅ FAIT 2026-06-10.** Action `waitUntilHour(0-23)` (worldSlice) : avance `tickCount`, `+dayCount` si l'heure est passée, **ne restaure rien** (ni HP/Mana ni vigueur). Bouton ⏳ « Wait » sous « Rest » à l'auberge → sélecteur d'heure + Confirm/Cancel. +5 tests (store + UI).
- [x] **VIG01 — Jauge de vigueur dans la top bar** (S, **P2**) — **✅ FAIT 2026-06-10.** Meter `Vig` (lecture seule) à côté de HP/MP dans la topbar ; couleur vert→ambre→rouge ; maj réactive via le store (combat/voyage/craft/sommeil). `Meter` prend une prop `color`. +test (App).
- [x] **UX-LOADING01 — Splash / écran de chargement** (S, **P3**) — **✅ FAIT 2026-06-10.** `#boot-splash` dans `index.html` (titre + spinner) vivant DANS `#root` → remplacé par React au montage ; `html/body` fond `#0a0a0f` dès le 1er paint (anti flash blanc). *(preload assets critiques = lié à PERF-IMG01, optionnel.)*
- [x] **UX-LEAVE-CONFIRM01 — Confirmations contextuelles** (XS, **P3**) — **✅ FAIT 2026-06-10.** `ConfirmDialog` (UX03) sur le « ← Map » depuis la **Blighted Road** (zone de danger) : « Leave the Blighted Road? » Stay/Leave. Zones normales : sortie directe. +tests.
- [x] **UX-COMBATLOG01 — Journal de combat plus lisible** (S, **P3**) — **✅ FAIT 2026-06-10.** Accent latéral coloré par type sur chaque ligne (scannable) + dernière action en **gras**. Couleurs par type & affichage newest-first (le plus récent toujours visible en haut → pas besoin d'auto-scroll) déjà en place. +test. *(« crits/échecs » sans objet : le jeu n'a pas de système de crit/miss — à rouvrir si une mécanique de crit arrive.)*
- [x] **UX-MAPCLARITY01 — Lisibilité de la WorldMap** (XS, **P2**) — **✅ FAIT 2026-06-10.** Légende `.wm-legend` (bas-gauche) : ouvert / verrouillé (🔒) / donjon non découvert (?) / fog (☁) / fourchette de niveau (Lv). +test.
- [x] **WM-LEVEL01 — Indication de niveau sous les noms (WorldMap)** (XS, **P2**) — **✅ FAIT 2026-06-10.** Helper `getSpotLevelRange(spotId)` (zones.js) + prop `sub` de `WmNode` → sous-label discret « Lv X–Y » sous le nom des spots (depuis `spot.levelRange`). +test.
- [x] **UX-EMPTYSTATES01 — États vides & feedback** (XS, **P3**) — **✅ FAIT 2026-06-10.** Vérifié : messages d'état vide clairs déjà présents partout — Inventory (mana stones/equipment/consumables/resources), HeroSheet (skills actifs/passifs), QuestsOverlay (« No active quests… »), QuestBoard (« No quests available… »). +tests de non-régression (HeroSheet + QuestsOverlay).
- [x] **ANIM03 — Fix : VFX skills pour les types `magical` / `percentage`** (S, **P2**) — **✅ FAIT 2026-06-10.** `magical` (#b388ff) + `percentage` (#e06b8b) ajoutés à `ELEMENT_COLORS` **et** `RANGED_ELEMENTS` → Soul Crush & co. déclenchent enfin le projectile magique. +2 tests `getSkillVfx`.
- [x] **QB-LAYOUT01 — Quest Board sur toute la largeur (grille multi-colonnes)** (S, **P2**) — **✅ FAIT 2026-06-10.** Retrait du `max-w-2xl` ; chaque section (Active/Available/Completed) rend ses cartes dans une grille responsive `.qb-grid` (`minmax(300px, 1fr)`, 2-3 colonnes). En-tête + RankBanner conservés pleine largeur en tête. +test.
- [x] **ACA05 — 🐛 Fix : l'Académie n'apparaît pas en ville (BLD_POS + dialogue)** (S, **P1**) — **✅ FAIT 2026-06-10.** Ajout `BLD_POS.academy = {x:50, y:66}` (créneau central-bas libre) → `VilBuilding` ne renvoie plus `null` : l'Académie est **visible + entrable** en ville (Ironhaven) et l'`AcademyPanel` s'ouvre. +2 tests RTL ville. *Restent séparés comme le route le ticket : façade `academy.png` → CONT01 ; `TALK_ID.academy` + arbre de dialogue → DLG01 (aucun dialogue academy n'existe encore, donc pas de `TALK_ID` pointant dans le vide). Le PNJ Archmagus Oren s'affiche déjà via `NPCS`.*
- [x] **HS-VITALS01 — Barres d'état HP / Mana / Vigor / Exp (+ valeurs)** (S, **P2**) — **✅ FAIT 2026-06-10.** Composant `VitalBar` (libellé + jauge colorée + valeur) : HP rouge, Mana bleu, Vigor vert→ambre→rouge, Exp or. Remplace les anciens petits nombres `Vital`. +tests.
- [x] **HS-AURA01 — Aura & Concentration floutées si verrouillées (supersède HIDE01)** (S, **P2**) — **✅ FAIT 2026-06-10.** Aura & Concentration **toujours affichées** ; jauge **floutée + 🔒** (`.hvb-locked`, pattern S02) tant que la valeur = 0 ; libellé net + tooltip. +tests (locked/unlocked).
- [x] **HS-SKILLS01 — Skills en grille 2 par ligne** (S, **P2**) — **✅ FAIT 2026-06-10.** Active & Passive skills en `.skill-grid` (2 colonnes) ; `SkillRow` prop `compact` (masque la description, garde nom/type/niveau/coût/CD/mini-barre XP). +test.
- [x] **HS-CURR01 — « Provisions » → « Currencies » + retirer le n° de run** (XS, **P3**) — **✅ FAIT 2026-06-10.** Bloc renommé « Currencies » ; carte « Run » retirée (le n° de run reste en en-tête) ; Gold + Tokens conservés. Test `screens.test.jsx` mis à jour.
- [x] **HS-DEITY01 — Bloc divinité avant l'avatar** (XS, **P3**, ✅ confirmé) — **✅ FAIT 2026-06-10.** Bloc « Allegiance » (déité + Demon Lord + bénédiction + skill divin) remonté en haut de la **colonne gauche**, avant l'avatar. +test (présence dans `.hs-left`).
- [x] **VIL-FACADE01 — Façades en grand, sans cadre zébré, cliquables** (S, **P2**) — **✅ FAIT 2026-06-10.** `BLD_FACADES` (inn/church/merchant/alchemy/blacksmith = assets présents) → rendus en `.bld-facade` 170×150 px **sans `.bld-frame`** (CSS : pas de bordure, drop-shadow). Les bâtiments sans art (academy/guild/knight_trainer/master_smith) + le puits gardent le placeholder encadré. Clic image+nom et 🔒 fermé conservés. +1 test RTL.
- [x] **ZV-CARDS01 — Cartes de monstres plus grandes, ~2 par ligne, stats optionnelles** (S, **P2**) — **✅ FAIT 2026-06-10.** `.mcard-grid` en `minmax(340px,1fr)` (~2/ligne) + sprite 96→130 px. Bloc stats HP/ATK/DEF/SPD **masquable** via toggle « Show stats » (off par défaut → cartes épurées). Sprite/nom/kills/Technique/Idle-Fight conservés. +test. *(niveau réel des monstres = MONLV01, toujours différé.)*

### → v1.2 — Décision / contenu / spec requis (pas encore « prêts »)

- [ ] **BAL-AUDIT01 — Passe d'équilibrage globale** (M, **P1**) — **✅ DÉCIDÉ** : XP **×1.32** · XP **×5** · gold **×8**. À trancher : drops/prix/tokens/vigueur. Via **BAL-CSV01**.
- [ ] **BAL-CSV01 — Données d'équilibrage pilotées par CSV (live-linked)** (M, **P1**) — centraliser les constantes tunables dans `public/balance.csv` (**fetch runtime** reco, fallback défaut). Constantes : `xp_curve_mult=1.32`, `reward_xp_mult=5`, `reward_gold_mult=8`, `monster_level_stat_mult=1.25`, `run_scaling=1.03`, `monster_level_reward_mult=1.25`(à valider), `monster_level_drop_bonus`(à valider), + vigueur/zones/prix/drops. **Archi à valider.**
- [ ] **STA01b — Finaliser la Fatigue** (S/M, **P2**) — retirer le debuff dormant CRF01 + maj ~22 tests ; +40 Fatigue sur échec ; craft-fail ×4 sous 30 vigueur.
- [ ] **TIME-DISPLAY01 — Refonte de l'affichage de l'heure** (S, **P2**) — choisir une version **A→E** (24h / 12h / +période / cadran SVG / arc jour-nuit). **Décision requise.**
- [ ] **SETTINGS-FULL01 — Compléter l'écran Options** (S, **P2**) — volume (dépend AUDIO01) + vitesse texte + reduced-motion + exposer export/import save. Animations déjà fonctionnel.
- [ ] **A11Y01 — Accessibilité de base** (M, **P2**) — `prefers-reduced-motion` + focus + ARIA + contrastes (périmètre à border). Recoupe UX04.
- [ ] **ONBOARD01 — Onboarding premier run** (M, **P2**, = TUT01) — hints **validés** ; reste déclencheurs + copy définitive.
- [ ] **AUDIO-ASSETS01 — Sourcing des assets sonores (info)** (S, **P2**) — **mix IA + libres de droit** décidé ; reste style sonore + volume. Prépare AUDIO01.
- [ ] **AUDIO01 — Système audio (SFX + musique)** (L, **P2**, = U05) — dépend AUDIO-ASSETS01.
- [ ] **DROP-FIX01 — Réaligner les tables de drop (ressources thématiques, solution B)** (S/M, **P2**) — créer `hare_pelt`/`boar_tusk`/`fox_pelt`/`beast_hide`, corriger Hare/Boar/Fox/Thunderhoof, skill drop pour Hare+Fox, leur donner un usage (recettes — lien LEAT01/COOK01). Recoupe QA01. *(dépend d'un usage des ressources)*
- [ ] **META-ACHIEVE02 — Écran de succès + élargir le pool** (S, **P2**) — panneau de consultation (ACH01 = 8 succès, aucun écran) + nouveaux succès **à définir**.
- [ ] **META-HISTORY01 — Historique & stats de runs** (M, **P3**, = HIS01/HIS02).
- [ ] **CODEX-LORE01 — Codex de lore** (S, **P3**, = CODEX02) — dépend d'écrire le lore.
- [ ] **HS-EQUIP01 — Icônes/assets pour les objets équipés** (S, **P2**) — remplacer le texte par une icône/asset par pièce. **Dépend d'un set d'icônes** (CONT05).
- [ ] **HS-STATPERK01 — Paliers de stats → perks/skills passifs (« The Gamer »)** (M, **P3**) — table de paliers + effets data-driven. **Design à spécifier.**

### → v1.2 — Académie (suite) & Refonte des quêtes v2 (2026-06-08)

- [ ] **ACA06 — Acheter des skills déjà montés (Lv2-5) à prix premium** (M, **P2**) — *décision 2026-06-08.* À l'Académie, en plus du skill Lv1, proposer le **même skill déjà au niveau 2 à 5**, à un **prix dissuasif = 3 à 5× le prix de revente** de ce niveau (`skillSellPrice(id, lvl)` ; ex. ×3 au Lv2 → ×5 au Lv5) pour **inciter à le monter soi-même** plutôt qu'à l'acheter. **DÉCIDÉ : pas de « payer pour monter » un skill possédé.** Catalogue élargi = plus tard. À cadrer : UI (sélecteur de niveau par skill), affichage des prix par niveau.
> ↗️ **QSV2-LOCALITY01** + **QSV2-TURNIN01** remontés en **v1.1** (faisables maintenant, remplacent GLD03).
- [ ] **QSV2-TIMED01 — Quêtes chronométrées (deadline en jours, trajet inclus)** (M, **P2**) — *TC 2026-06-08.* Ex. « tuer 5 loups en < 4 jours », le **temps de trajet comptant**. Données : `quest.deadlineDays` ; on stocke le **jour d'acceptation** ; échec si non complétée à temps (la quête tombe / se réinitialise). À cadrer : UI compte à rebours, comportement à l'échec (perte, re-disponible ?), interaction `dayCount`.
- [ ] **QSV2-MULTIMON01 — Objectifs multi-monstres** (S/M, **P2**) — *TC 2026-06-08.* Ex. « 3 Hares **+** 2 Boars ». Le modèle `objectives:[]` + `isQuestComplete().every()` **le supporte déjà** ; reste à **créer du contenu** multi-objectifs + s'assurer que l'UI (QuestCard/Overlay) affiche **plusieurs barres** proprement.
- [ ] **QSV2-NPCONLY01 — Quêtes maître & église : prise + rendu uniquement au NPC** (S, **P2**) — *TC 2026-06-08.* Les quêtes de **maître** (ACA04) et **d'église** (CHQ01, rotation) **ne doivent pas apparaître sur les quest boards** ; prise **et** rendu **uniquement** chez leur NPC. **✅ Déjà largement le cas** (AcademyPanel / ChurchPanel ; le board lit `QUESTS`, pas church/master) → ticket de **vérification + verrouillage** (s'assurer qu'aucune n'apparaît/se rend sur un board).

### → v2.1_idle — Idle (fortement repoussé — pas de plus-value pour le moment)

- [ ] **IDLE-AUDIT01 — Cohérence de l'idle** (S, **P3**) — *repoussé.* zones interdites / arrêt au changement d'écran / seuil HP / vigueur / spots verrouillés + tests.
- [ ] **UX-NUMFMT01 — Formatage des grands nombres** (XS, **P3**) — *prio abaissée (surtout utile pour l'idle).* `1.2k`/`3.4M`, helper `formatNumber()`.

> 💡 **Top « avant alpha » (mon avis)** : v1.1 → `PERF-IMG01` (avant push) + `DX-CI01` + finir l'art (`CONT01`/`UI08`/`C03`). v1.2 → `SAVE-AUDIT01` · `FIX-QUESTSNAP01` · `BAL-AUDIT01` · `CMB-ESCAPE01`.

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
