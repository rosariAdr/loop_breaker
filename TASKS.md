# Tasks — Loop Breaker (Roguelite Idle RPG)

> Backlog source de vérité. Grooming : vérifier INVEST + AC avant de démarrer un ticket M/L. DoD par type dans `docs/CONTRIBUTING.md` (PROC00).
> ## 🧭 Système de suivi (PRIO-SYS01, 2026-06-19)
> **4 axes orthogonaux par ticket** — un vocabulaire chacun, jamais mélangés. Le **statut** (Now / À groomer / Bloqué / Done) = la **position dans le document**, pas un tag.
>
> | Axe | Valeurs | Répond à |
> |---|---|---|
> | **Taille** | `XS` · `S` · `M` · `L` · `XL` | effort |
> | **Priorité** | `P1` (critique) · `P2` (nécessaire à la prochaine release) · `P3` (important) · `P4` (confort) · `P5` (lointain) — *échelle 1-5, **découplée** de la maturité* | ça compte combien |
> | **Maturité** | 🟢 Ready (spec claire, codable) · 🟡 Groom (décision ouverte, question inscrite) · ✂️ Split (à découper) · ⛔ Blocked (dépendance) | codable maintenant ? |
> | **Milestone** | **porté par l'épique**, pas par le ticket → table **« 🗺 Plan de release »** | ça sort quand |
>
> **Épic = préfixe de l'ID** (`VQ02`→épic VQ, `RES01`→RES…). **Les tickets ouverts sont groupés par épique** (§« Backlog par épique ») ; la version d'une épique se lit dans la table **« 🗺 Plan de release »**.
> **Ligne canonique** : `- [ ] **ID — Titre** · M · P2 · 🟢 — description courte. ⟶ renvois` *(3 axes ; **pas** de tag de version sur la ligne)*.
> **Cocher** : `- [ ]` à faire · `[x]` fait · `[~]` partiel. **Périmètre d'une release/épique** = table « 🗺 Plan de release » + la section d'épique correspondante.
>
> **🗺 Planning = épiques (depuis 2026-06-20)** : la **version est portée par l'épique**, pas par le ticket. Une release `v1.X` = un ensemble d'épiques ; chaque épique = une **sous-version `v1.Xy`** (= 1 lot de commits, cf. `docs/CONTRIBUTING.md` §2). Tout est dans la table **« 🗺 Plan de release »** (versions ↔ épiques + dépendances) et le **« Backlog par épique »** (tickets). **Replanifier = déplacer une épique** dans la table, aux dépendances près — les tickets ne changent pas.
> - **Livrés** : `v1` / `v1.1` / `v1.2` (§Done + sections historiques) ; détail inline `[x]` dans §« Archive — détail par version ».
> - **Gelé** : épique « Embuscade & Map 2 » (⛔ tant que Map 2 fermée). **Ambition résiduelle** = `v2` (ATB, PixiJS, boss fidélité). **Lointain** = `v3`.
>
> **Mapping ancien→nouveau** (si un vieux tag traîne dans l'archive) : `P0→P1` · `P1→P2` · `P2→P3/P4` · `P3→P5` · `READY→🟢` · `GROOM/GROOMED→🟡` · `SPLIT→✂️` · `BLOCKED→⛔`.
> Réorg. : 2026-06-13 (B1 housekeeping) · 2026-06-19 (PRIO-SYS01 : axes prio/maturité/milestone séparés, prio 1-5) · **2026-06-20 (épic-first : milestone porté par l'épique, dédup des 7 doublons, tickets groupés par épique + table « Plan de release »)** · **2026-07-19 (review audit `reviews/review-2026-07-19.xlsx`, 32 décisions : épiques BUG_AUDIT-0717 + RELEASE-0.2.0 + COMBAT-ATB (B06 supersédé) + 7 épiques contenu (PACT/VOW/NEM/ECHO/WTHR/SOUL/CULT) + 2 épiques UNIV ; grille de recette `docs/TEST_SCENARIOS.md` = gate release).**

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

## v1 — POC (FIGÉE) ✅ — CLÔTURÉE (2026-06-14)

> Le POC est **complet et gagnable de bout en bout** (Malachar tuable). **Version clôturée le 2026-06-14** : les tâches de stabilisation encore ouvertes (BAL02, BAL03, TECH04) ont été **déplacées en v1.3** (relocalisées 2026-06-20). Ne rien ajouter ici.

- [x] **TECH05 — JSDoc sur engine/combat.js** (M) - `@param`, `@returns`, `@example` sur toutes les fonctions exportées

---

## v1.1 — UI parchemin, sprites & QoL (release présentable) — CLÔTURÉE (2026-06-14)

> **Version clôturée le 2026-06-14.** Les 4 tickets encore ouverts (tous liés aux **assets/art**) ont été **déplacés en v1.2** : `UI08`, `CONT01`, `CONT05`, `C03`.
>
> Objectif (historique) : transformer le POC fonctionnel en jeu **présentable**. **Spec complète : `UI_HANDOFF.md`** (design system parchemin diégétique « table en bois », stage 1920×1080, tokens CSS canoniques, 6 écrans, 2 couches d'assets, animations). Esthétique : joyeuse/héroïque type overworld Dragon Quest, **PAS** sombre/gothique. Stratégie : **coquille d'abord → écran par écran → sprites en dernier**. À faire d'un bloc pour la cohérence visuelle.
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
> ↪ **UI08 · CONT01 · CONT05 · C03** déplacés en **v1.3** (clôture v1.1, 2026-06-14 ; relocalisés 2026-06-20).
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

- [x] ~~**CONT06 — Portraits PNJ pixel (couche B)**~~ — **✅ 5 portraits en place** (`public/portraits/{aldric,smith,marta,merchant,mage}`, 6 émotions, CraftPix) + manifeste `src/data/portraits.js`. **Reste à sourcer** : prêtre (church), chef de village, divinités → fallback emoji en attendant.
- [x] **CONT04 — Noms propres donjons Zone 2** (XS) — ✅ vérifié : noms définitifs déjà en place (donjon « The Forsaken Citadel », boss « Lord of the Forsaken », demon lord « Malachar the Undying ») ; aucun placeholder restant. - remplacer placeholders par noms définitifs

### QoL essentiel (shippabilité)

- [x] **IDLE-OFF — Progression hors-ligne** (M) - au retour, calculer les gains accumulés depuis `meta.lastSeen` (timestamp) → simuler N ticks → écran récap "Pendant ton absence : X kills, Y or, Z loot". **DÉCIDÉ : gains illimités (pas de plafond), la Fatigue ne s'accumule PAS hors-ligne, auto-stop HP à revoir plus tard.** AC : fermer/rouvrir l'onglet pendant idle actif crédite les bons gains + écran récap
- [x] **SET01 — Menu Options / Réglages** (S) - écran joueur : toggle animations, vitesse de texte, (volume quand AUDIO01), reset save (via ConfirmDialog UX03). Sort le toggle "animate" du DebugPanel (DEV-only) vers le joueur
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
- [x] **T02 — Transmigration animée** (M) - écran de transition animé entre GodsShop et renaissance
- [x] **T05 — Socle universel d'héritage (écran dédié)** (M) — ✅ couvert par PostMortem (section « Transmigration — Choose what to carry » : 1 stat + 1 active + 1 passive, puis « Enter the Gods' Shop → ») - **UI uniquement** (la logique d'héritage existe déjà dans `applyTransmigration`) : écran de choix 1 stat + 1 active + 1 passive avant la boutique
- [x] **T12 — Skill suprême Demon Lord ("Soul Rend") héritable** (M) - flag `skill.alwaysInheritable: true` (transgresse DV10)
- [x] **I08 — Choix joueur en idle** (M) - config avant idle : monster type + seuil HP personnalisable (le "craft en parallèle" reporté). Garder minimal pour v1.2

---

## 🗺 Plan de release (version → épique)

> **La version est portée par l'ÉPIQUE, pas par le ticket.** Pour replanifier : déplacer une épique d'une ligne à l'autre de cette table (aux dépendances près) — les tickets ne changent pas. L'ordre des épiques d'une version = l'ordre des commits `v1.xy` (1 lot/épique ; `v1.x(y+1)` = passe de bugfix avant release). Détails du schéma : `docs/CONTRIBUTING.md`.
> **L'ordre des lignes = ordre d'exécution** (re-priorisé 2026-07-06) ; les n° de sous-version restent des **étiquettes historiques** (pas re-numérotées). `▲` = avancée · `▼` = reculée à cette date.

| Sous-version | Épique | Dépendances / bloqueurs |
|---|---|---|
| **v1.35 (urgent)** | **🔴 URGENT — UI critique (3)** : carte 3:2 (UI12 P1) + église 1-clic (UI11) + tests (TST-UI) | **aucune** — UI12/UI11 🟢 Ready ; à shipper **avant le reste** |
| **v1.35x (bugfix)** | **🐞 BUG_AUDIT-0717 — Correctifs audit & tests fonctionnels (10)** | audit 2026-07-17 (causes racines documentées) ; les P2 font partie du train 0.2.0 |
| **v1.36 (release)** | **🚀 RELEASE-0.2.0 — Gate de release master (5)** | après URGENT + P2 bugfix ; **recette `docs/TEST_SCENARIOS.md` 10/10 = sine qua non** ; se clôt par merge + tag v0.2.0 + Vercel Auth |
| v1.2x (bugfix) | BUG_v1.2 — Correctifs playthrough (1 ouvert · 2 faits) | passe de bugfix v1.2 ; à shipper tôt |
| v1.31 | Quêtes (18) | MQ-CHAIN01 ✓ (fait) |
| v1.31x (bugfix) | BUG_v1.31 — Correctifs playthrough (9) | passe de bugfix Quêtes (retours 2026-06-20) |
| v1.32 | Skills (drops) (11) | MON01 ✓ ; `skills.js` = 44 skills (élite/SKD déjà codés) |
| v1.33 | Progression & stats (19) | ✅ implémenté (19/19 ; tests + build OK, 2026-07-03) · recette BEST02 → v1.42 |
| v1.33x (bugfix) | BUG_v1.33 — Correctifs playthrough (Hero Sheet v2) (1) | passe de bugfix v1.33 (retours 2026-07-03) |
| v1.34 | Tech / DX / Balance (9) | 🔨 batchs 1-5 mergés dev 2026-07-04 (6/9 : BAL-CSV01, TECH06, QA01, COV-COMBAT01, REFAC03, REFAC02) · reste TECH04, BAL02/03 (playtest) |
| v1.42 | Équipement & Craft (37) | 🔨 batchs 1-6 mergés dev 2026-07-04 (20/37 : ressources/tiers/drops + équip/sets/slots + craft KNOWN/MULTI/RARITY/G2/G3 + templates bijoux/gants ; **recettes unifiées `craftRecipes.js` source unique, shims retirés, qualité hybride branchée runtime**) · reste CRAFT-GRADE/TOOL01/LOC01 (plomberie prête), professions (buildings/NPC cordonnier/bijoutier/cuisine), CRAFTMG01 (mini-jeux + UI découverte), EQDROP/ENCH |
| v1.43 | Maîtres & mentors (12) | ✅ livré 12/12 (batchs 1-4) mergé dev 2026-07-04 · MST01-09 + décisions G1-3 + itinérants (MST08) · SKD-ICE01 + statut `frozen` · **board itinérant local** (un-lieu/4j, décision #3, batch 6) · ⚠️ à réconcilier : Aldric `location='greywatch'` vs bâtiment `knight_trainer` à Millhaven (fallback Church en place) |
| **v1.44 (nouveau 2026-07-19)** | **⚔ COMBAT-ATB — Sablier de Guerre + Frappes du Destin (9 · proto ✅)** | ex-B06 sorti de v2 ; proto joué → intents validés avec RNG/crits cachés ; **CMB-DIR01 (maquettes) + CMB-COST01 (grille de coûts) avant le moteur** ; CMB-QTE01 ⟶ CRAFTMG-ENGINE01 (v1.42) |
| **v1.52 ▲** | **Divin (5)** — *avancé 2026-07-06 : prochain lot de contenu (aucun bloqueur asset)* | DVQ01 ⟶ ALT01 (même épique) ; DVQ01 dépend CHQ01/Q09 (Quêtes ✓) |
| **v1.53 (nouveau)** | **VOW — Vœux divins de run (3)** | avec le Divin (divineBonds/ALT01) ; vœu = contrainte passive ≠ quête divine DVQ01 |
| **v1.54 (nouveau)** | **PACT — Pactes de transmigration (4)** | articulation META02 à acter (PACT = payer plus, META02 = acheter plus) |
| **v1.55 (nouveau)** | **NEM — Némésis (3)** | ⟶ lastRunSummary, scaling élite, titres M01 |
| **v1.56 (nouveau)** | **ECHO — Échos du prédécesseur (4)** | sprite héros définitif (CONT01) aide ; auto-équilibrant |
| v1.61 | Compagnons (12) | CMP06 ⟶ EVT02 (v1.62) |
| v1.62 | Événements, explo & NPC (8) | — |
| v1.71 | UI / UX & a11y (8) | *3 tickets urgents sortis → épique « 🔴 URGENT » (2026-07-06)* ; SETTINGS-FULL01 (volume) ⟶ AUDIO01 (v1.91) |
| v1.72 | Idle & planification (10) | IDLE-CRAFT/PLAN ⟶ Craft (v1.42) |
| **v1.41 ▼** | **Donjon (7)** — *reculé 2026-07-06 : asset-gated (fond de donjon + médaillons de salle, cf. DUN-ART01)* | spec 9 salles : voir Archive §v1.4 |
| **v1.51 ▼** | **Monde & carte (11)** — *reculé 2026-07-06 : assets bâtiments en préparation (BLDUNL/WMAP06)* | MONLV01 ⟶ BAL-CSV01 (v1.34) |
| **v1.57 (nouveau)** | **WTHR — Météo par zone (3)** | *pas prioritaire (décision 2026-07-19)* ; **cohérence jour-à-jour voire saisonnière requise** → grooming WTHR-G1 avec Adrian avant dev |
| v1.81 | Méta / prestige (7) | REP-REBAL01 ⟶ ENCH (v1.42) |
| **v1.83 (nouveau)** | **SOUL — Reliques liées à l'âme (3)** | **gate : accessible après 3 runs dans le même univers** (décision 2026-07-19) ; réconcilier META02 avant d'ouvrir |
| v1.82 | Assets, art & lore (9) | CODEX ⟶ CONT02/03 (même épique) ; HS-EQUIP01 ⟶ icônes |
| **v1.84 (nouveau)** | **CULT — Le Cercle des Éveillés (4)** | *pas prioritaire ; visible mid/end-game seulement (décision 2026-07-19)* ; coût écriture — périmètre v1 : 1 PNJ, 3 services |
| v1.91 | Audio, game-feel & cycle nuit (14) | NSKL ⟶ cycle nuit DN (même épique) |
| v1.92 | Multivers & Foyer (5) | — |
| **v1.95 (nouveau)** | **UNIV-WUSHU — Univers 2 : wushu (4)** | ⟶ X08/X09 (v1.92) ; ⚠️ « univers rouge » dicté — interprétation wushu à confirmer |
| **v1.96 (nouveau)** | **UNIV-TOWER — Univers 3 : la Tour (4)** | ⟶ X08/X09 ; seul chantier moteur = rendu vertical de la carte |
| v1.93 | Intégration finale (gate) (5) | dépend de TOUTES (migration/QA/balance globale) ; SEC02 post-alpha |
| v1.94 (infra) | Backend & données (Supabase) (8) | post-alpha ; **SUPA-CODEGEN01 remplace la boucle Excel** (sortable plus tôt) ; recoupe SEC02 |
| gelé | Embuscade & Map 2 (12) | ⛔ BLOQUÉ : Map 2 gelée — à dégeler avant dev |
| v2 | Ambition résiduelle (4) | gros chantiers L/XL (ATB, PixiJS, boss fidélité) |
| v3 | Lointain (1) | — |

---

## Backlog par épique (ouvert)

> Tickets ouverts groupés par épique. **Plus de tag `· vX.Y` sur la ligne** : la version se lit dans la table « Plan de release » ci-dessus. Ligne canonique : `**ID — Titre** · Taille · P<1-5> · 🟢/🟡/✂️/⛔ — desc. ⟶ renvois`.

### 🔴 URGENT — UI critique (map 3:2 + église 1-clic)
> **Épique urgente** (découpée de v1.71, 2026-07-06) : les 3 tickets UI **prêts + prioritaires**, sortis pour shipper **avant le reste** (1 passe de commits courte). Ordre : **UI12** (P1) → **UI11** (P2) → **TST-UI** (P2, garde-fou). Le reste de l'ex-v1.71 (UI10, options, a11y) reste dans « UI / UX & a11y ».

- [x] **UI12 — World Map : carte en bande 3:2 stable (fin du rendu « boîte » ~4:3)** · S/M · **P1** · ✅ — **FAIT 2026-07-19 (branche `feat/v1.35_ui_critique`)** : wrapper `.wm-band` (flex centré, `container-type:size`, colonne panneau réservée par padding-right 302px) + `.wm-map` en **`aspect-ratio: 3/2` forcé** (`width: min(100cqw, 150cqh)`) — ratio stable à TOUTE taille de fenêtre par construction ; `background-size 100% 100%` et coords `POS` intouchés. **Vérifié runtime** : ratio 1.500 exact, marqueur Greywatch à 13 %/16 % pile (zéro décalage), pas de chevauchement panneau. +5 tests structure (`WorldMap.ui12.test.jsx`) ; suite **3428 verte**, build OK. — ✅ **DÉCIDÉ (2026-07-06, urgent) : Option A — bande cinématique 3:2.** **Contexte** *(retour test 2026-07-05)* : la carte illustrée est perçue **trop carrée/haute (~« 5:4 »)**. Diagnostic mesuré : l'art source `eldenmoor.png` est en **2752×1536 ≈ 16:9**, mais `.wm-bg` l'**étire** via `background-size: 100% 100%` et le **panneau de droite rogne** la partie droite → la carte *visible* tombe à **~1.32 (≈ 4:3)** ; en prime la **largeur du canvas suit la fenêtre** (`.lb-canvas` + scaler `min(vw/1920, vh/1080)`, `App.jsx:92`) → ratio **instable** selon la fenêtre. **Objectif** : carte visible en **3:2 stable**, sans déformer l'art ni décaler les marqueurs.
  - **✅ Approche retenue — A (Bande cinématique)** : `.wm-map` devient une **boîte 3:2 centrée verticalement** (marges bois haut/bas via le stage), le panneau (`.sidebar`) aligné sur la même hauteur. **Garder `background-size: 100% 100%`** → les coords `POS` (en % de `.wm-map`) **restent alignées** → **zéro régression** marqueurs/héros/légende ; art un peu moins étiré qu'aujourd'hui. **3:2 = cadrage de la carte dans le stage 16:9 existant → compatible UI10** (pas de refonte du ratio global).
  - **Alternatives écartées** : **B** (panneau slim ~286→200px, carte élargie) — carte plus grande mais panneau serré à retoucher ; **C** (`background-size: cover`, art non déformé) — le plus net **mais** recadre → coords `POS` à recaler (⟶ WMAP08) et casse l'invariant `100% 100%` (cf. commentaire `index.css` ~L3009). *Aperçu visuel des 4 rendus : artifact « wm-ratio-previews » (2026-07-06).*
  - **Scope** : `src/index.css` `.wm-map` (~L3004) → boîte **3:2 centrée** (`aspect-ratio` + marges auto, largeur bornée pour ne pas passer sous le panneau) ; `.sidebar` (~L914) aligné en hauteur sur la bande ; **ne pas** toucher `background-size` de `.wm-bg` ni les `POS` ; stage/scaler (`App.jsx:92`) reste 16:9. Vérifier **1366×768** et **1920×1080**.
  - **AC** : (a) carte visible = **3:2 (±2 %)** sur 1366×768 **et** 1920×1080, ratio **stable** entre les deux ; (b) **aucun décalage** des marqueurs / héros / légende (coords `POS` inchangées) ; (c) marges bois symétriques haut/bas + panneau aligné sur la bande ; (d) **0 test rouge** (+ 1 test de non-régression layout). ⟶ **UI10** (v1.71), **TST-UI**.
- [x] **UI11 — Refonte panneau NPC Église : accès direct en 1 clic [POC B split 2 colonnes]** · M · P2 · ✅ — **FAIT 2026-07-19 (branche `feat/v1.35_ui_critique`)** : `openBuilding('church')` ouvre directement le mode panneau (plus d'intro) ; colonne gauche = portrait + **Talk** (NpcOverlay `showSideTalk`, prioritaire sur le panneau, fermeture → retour au panneau) + **bloc Pray** (`ChurchPrayBlock`, disabled « Already at full strength ») ; colonne droite = Acts of Devotion (badge compte + timer) + quote + **QuestCard `parchment`** (nouvelle palette claire bg #e8d4a0 / liseré #c89432, scrollable) + MasterBoard + ✕ Leave ; HP/MP retirés. **Bonus : FIX-QUESTPROG02 corrigé au passage** (prop `base` sur les cartes actives église + MasterBoard). **9 tests AC** (`ChurchPanel.ui11.test.jsx`) + 3 fichiers de tests migrés au flux 1-clic ; suite **3437 verte**, build OK. — *(spec d'origine conservée ci-dessous)* — **Contexte** : l'interaction actuelle demande **2 clics** (intro NPC → « Enter the Church ») avant les fonctionnalités ; le HP/MP du panneau est **redondant** avec la top bar ; les quest cards en **fond noir** cassent l'esthétique parchemin. **Objectif (POC B validé en session)** : un seul render **split deux colonnes** dès le 1er clic bâtiment.
  - **Colonne gauche (~200px)** : portrait NPC compact + nom/rôle + bouton **Talk** + séparateur + section **Pray** (bouton + hint d'état).
  - **Colonne droite (flex)** : titre « Acts of Devotion » + badge count + timer + quote NPC + liste de **quest cards scrollable** + bouton **× Leave**.
  - Supprimer l'affichage **HP/MP** du panneau (top bar suffit). Quest cards en couleurs chaudes (bg `#e8d4a0`, border-left 3px `#c89432`, texte `#2c1a0a`) — retirer le fond noir.
  - **⚠️ Actions à NE PAS régresser** : **Talk** (overlay dialogue, bouton dédié col. gauche) · **Enter Church** (logique métier absorbée dans le panneau direct — vérifier triggers) · **Leave/Fermer** (ferme + repositionne le héros sur la carte) · **Pray disabled** (« Already at full strength » si HP/MP pleins) · **Pray active** (restauration HP/MP si blessé) · **Accept quest** (ajout au journal) · **Cooldown quêtes** (« New deeds in X days » affiché et bloquant).
  - **Scope** : identifier le composant Church (`src/screens/` — *cf. `SafeZone.jsx` ChurchPanel* / `src/components/`) ; fusionner les deux états (intro + détail) en un seul render split-B dès le 1er clic ; reparenter « Talk » sous le portrait ; remplacer classes CSS quest cards (noir → amber/parchemin) ; retirer le render conditionnel HP/MP ; lancer la suite NPC avant merge.
  - **AC** : (a) 1 clic bâtiment → panneau split B immédiat ; (b) Talk fonctionnel (overlay dialogue) ; (c) HP/MP absent ; (d) quest cards thème parchemin ; (e) Pray disabled/active selon l'état réel ; (f) Accept quest OK (journal MAJ) ; (g) cooldown respecté/affiché ; (h) **0 test rouge** sur la suite existante (~1161+). **Lié à** : TST-UI, et les chantiers église **DVQ01** (quêtes divines, v1.52) / **ALT01** (autels, v1.52).
- [ ] **TST-UI — Tests de non-régression UI (couverture cible ≥ 70 %)** · S · P2 · 🟢 — **Contexte** : couverture actuelle ~**76 %** ; UI12 (layout carte) et UI11 (panneau Église) touchent du layout et des composants Église → risque de régression. **Objectif** : maintenir la couverture **> 70 %** sur l'épique urgente (UI12 + UI11) via des tests ciblés.
  - **UI12 — Layout carte** : `.wm-map` = bande **3:2 centrée** ; ratio **stable** entre 1366×768 et 1920×1080 ; **aucun décalage** des marqueurs (`POS` en % inchangées) ; pas de débordement.
  - **UI11 — Church Panel** : 1 clic bâtiment → render split B ; col. gauche présente portrait + Talk + section Pray ; Talk → overlay dialogue visible ; Pray disabled si HP/MP pleins, actif si blessé ; HP/MP non rendus ; Accept quest → journal MAJ ; cooldown « New deeds in X days » affiché/bloquant ; quest cards = classes parchemin présentes, fond noir absent.
  - **Commande** : `npm run test:run -- --coverage`. **AC** : (a) couverture globale ≥ 70 % après merge UI12+UI11 ; (b) ≥ 1 test par ticket corrigé ; (c) 0 test existant cassé.

### 🐞 BUG_AUDIT-0717 — Correctifs audit & tests fonctionnels (2026-07-17)
> Bugs et observations de l'audit complet du 2026-07-17 (tests techniques + session de jeu réelle + scan d'intégrité data). Causes racines documentées dans `reviews/rapport-2026-07-19.md` §3. Créée via review 2026-07-19 (A01-A13). Règle bug (CONTRIBUTING §3) : **test de régression écrit AVANT le fix**. Statu quo acté : compteur tokens GodsShop (snapshot au mount, cas debug uniquement — pas de ticket).

- [x] **FIX-I18N01 — Tout le contenu joueur en anglais (purge du français)** · M · P2 · ✅ — **FAIT 2026-07-19** : onboardingQuests (6 quêtes : noms/descriptions/flavors/labels), ranks.js (Iron→Supreme), statMilestones (5 labels), sets.js (2 descriptions), codexRules (échelle de rangs), QuestBoard (« First Steps » + chip « +N rank »), Inventory (« vs equipped »). +9 tests mis à jour + **garde-fou `i18nGuard.test.js`** (8 tests : scan anti-accents des champs visibles de 7 registres). Suite **3423 verte**, lint OK, vérifié runtime. — ✅ **DÉCIDÉ (2026-07-19) : le jeu est 100 % anglais.** Fichiers identifiés (grep accents sur champs name/label/desc/dialogue hors tests) : `onboardingQuests.js` (36 occurrences — « Le premier tranchant »/« Bien armé », dialogues Bryn, « Premières fois »), `ranks.js` (**noms de rangs FR** : Fer/Argent/Orichalque/Émeraude/Suprême…), `statMilestones.js`, `mainQuests.js`, `combat/useCombat.js`, `WorldMap.jsx`, + chip « +N rang » (QuestBoard). **Hors scope** : commentaires de code FR (convention repo), docs. AC : aucune chaîne FR visible joueur ; test d'intégrité anti-accents sur les champs UI des data ; 0 test cassé. ⟶ QONBOARD01, REL-TRAIN01.
- [ ] **FIX-CRAFTSRC01 — Ingrédients sans source (bat_wing / void_fang / troll_blood)** · S · P2 · 🟢 — 3 ingrédients `sources:[]` (droppés par personne, vendus nulle part) rendent incraftables : 2 recettes alchimie (bat_wing), master_serpent_dagger + variantes forge serpent_dagger/swift_boots/hunters_grips (void_fang), master_cursed_greaves (troll_blood). ✅ **DÉCIDÉ (2026-07-19) : recentrer les recettes sur des ingrédients droppables et EXISTANTS** (substitution — option b ; pas de nouveaux drops). **Hors scope** : rééquilibrage des taux. AC : chaque recette a tous ses ingrédients obtenables ; test d'intégrité « obtainable ». ⟶ QA01, craftRecipes.js.
- [ ] **FIX-DIVSKILL01 — healing_bloom (divin) retiré de la vente Académie** · XS · P2 · 🟢 — `healing_bloom` est `container:'divine'` (option de Sylvara) mais figure dans `ACADEMY_CATALOG` (academy.js:13, 200 or) alors que le catalogue et masters.js excluent les divins de la vente. Fix : retrait simple. AC : aucun skill `divine` au catalogue ; test. ⟶ ADR-006 (esprit).
- [ ] **FIX-ALDRIC01 — Réconciliation Aldric : un seul lieu** · M · P2 · 🟢 — ✅ **DÉCIDÉ (2026-07-19) : option (a) — Aldric 100 % Greywatch ; le `knight_trainer` de Millhaven passe à un NOUVEAU PNJ dédié.** État vérifié : data canonique Greywatch (masters/quests/masterQuests) MAIS bâtiment+panel « Knight of Millhaven » (KnightTrainerPanel.jsx:90), dialogues, buildingUnlocks à Millhaven — et le MasterBoard y affiche Elyndra. AC : Aldric rencontré à un seul endroit ; nouveau PNJ Millhaven (nom/dialogue/portrait fallback) ; tests SafeZone/masters à jour. Solde la note « ⚠️ à réconcilier » de v1.43. ⟶ MST05.
- [ ] **FIX-PLURAL01 — Pluralisation des noms de monstres (quêtes générées)** · S · P3 · 🟢 — cause racine : `villageQuests.js` lignes 92/101/149-150, pluriel naïf `name+'s'` → « Cull the Ashwood **Wolfs** » (Greywatch), « Russet **Foxs** » (Ironhaven). Fix data-driven : champ optionnel `namePlural` (ashwood_wolf→Wolves, russet_fox→Foxes ; future-proof thunderhoof/bone_colossus) + helper `monsterPlural` (2 l.) + 4 call sites. Risque save : nul (ids stables). **Hors scope** : pluriels des ressources. AC : plus aucun pluriel fautif ; micro-test data. ⟶ VQ02.
- [ ] **FIX-LVLQUEUE01 — Modal Level Up unique, cumulé et reportable** · S/M · P3 · 🟢 — cause racine : `pendingLevelUp` = simple compteur (heroSlice.js:519, App.jsx:205) ; chaque événement XP (victoire, CHAQUE remise de quête) rouvre un modal → 3 d'affilée observés (Lv2→Lv5→Lv6). ✅ **DÉCIDÉ (2026-07-19)** : (1) coalescer en **un seul modal** qui **affiche clairement le nombre de niveaux gagnés** et donne **autant de choix de stats que de niveaux** ; (2) bouton **« Do it later »** → les points de stat non attribués sont stockés et **assignables plus tard depuis le HeroSheet** (badge « N points à attribuer »). Migration save (`pendingStatPoints`). AC : rafale combat + 2 turn-ins = 1 modal « +N levels » ; report → HeroSheet permet d'attribuer ; tests. ⟶ HeroSheet, LevelUpModal.
- [ ] **FIX-SRCMON01 — Réconcilier 4 `sourceMonster` contradictoires + quasi-doublon stone_skin/stoneskin** · S · P3 · 🟢 — `stone_skin` (skills.js:117) revendique stone_golem qui droppe `stoneskin` (l.1037) ; `venom_bite` vs `venom_strike` (marsh_serpent) ; `spectral_veil` vs `thorn_lash` (briar_wraith) ; `iron_resolve` vs `cursed_cleave` (hollow_knight ; vraie source = barrow_wight en réserve). Fix : trancher chaque paire (fusion/re-sourcing) + **test de réciprocité** sourceMonster ↔ skillDrop. AC : chaque sourceMonster = vrai drop ; 0 quasi-doublon non assumé. ⟶ SKD-E1, Codex.
- [ ] **FIX-TOPBAR01 — Onglets Quests/Hero/Bag/Save rognés hors du fond topbar (investigation)** · S · P3 · 🟢 — observé 2026-07-17 à viewport inhabituel (990×438, scale ~0.40) : fond `.topbar` ~991 px design (shrink-to-fit centré) et `.tb-tabs` débordant ~40 px → zone cliquable amputée. **Reproduire d'abord en 16:9** (1366×768 / 1920×1080) pour qualifier bug réel vs artefact de ratio. Fix probable : `.topbar` pleine largeur du canvas ou min-width. AC : onglets entièrement dans le fond et cliquables aux 2 résolutions + test layout. ⟶ UI10, UI12, TST-UI.
- [ ] **DX-LINTIGNORE01 — ESLint ignore `.claude/` + purge du worktree résiduel** · XS · P3 · 🟢 — `npm run lint` échoue (7 erreurs react-refresh) à cause du worktree résiduel `.claude/worktrees/jovial-gagarin-7b4347` — branche **très en retard** sur dev (confirmé 2026-07-19), suppression sans risque (`git worktree remove` + prune). + `ignores: ['.claude/**']` dans eslint.config.js. AC : lint vert repo entier.
- [ ] **FIX-ZONELIST01 — Purger `ZONES.ashenvale.monsters` (liste morte pré-MON01)** · XS · P4 · 🟢 — zones.js:15-28 : 4 ids inexistants (rotting_shambler, gloom_bat, bog_shambler, grave_knight) + 2 réserve ; aucun consommateur runtime, mais piège futur. Fix : supprimer ou dériver de MONSTERS_BY_ZONE + test anti-ids-morts. AC : plus aucun id mort dans zones.js.

### 🚀 RELEASE-0.2.0 — Gate de release master
> Épique **process** en amont (review 2026-07-19, B01-B06) : matérialise « ce qui manque pour pousser en master ». **La release est prononcée quand** : épique URGENT livrée + P2 de BUG_AUDIT-0717 verts + FIX-QUESTPROG02 + QSV2-DROPDUP01/QSRC-TEST01 + checklist technique verte + **grille `docs/TEST_SCENARIOS.md` 10/10** (sine qua non).

- [ ] **REL-CHANGELOG01 — Rattrapage CHANGELOG + coupe `[Unreleased]` → `[0.2.0]`** · S · P2 · 🟢 — documenter v1.34 (batchs 1-6, REFAC02/03, +122 tests), v1.42 (9 slots/sets, craft unifié), v1.43 (maîtres/itinérants/frozen), SPOT_OWNER, outillage ; puis couper `[Unreleased]` en version datée **en purgeant les sections déjà dans master** (jamais redécoupées aux merges précédents). AC : CHANGELOG = delta réel master..dev ; version 0.2.0 datée prête pour le tag.
- [ ] **REL-CONTEXT01 — Refresh CONTEXT.md (systèmes + compteurs §5)** · S · P2 · 🟢 — intégrer craft unifié (source unique `craftRecipes.js`), statut frozen, REFAC02/03, SPOT_OWNER, maîtres/itinérants/board local ; compteurs réels : **50 skills (6 divins), 4 spots, 39 recettes, 4 titres, 3415 tests / 301 fichiers**, bundle ~149 KB gz. AC : un Claude sans contexte retrouve l'état exact du jeu.
- [ ] **REL-TRAIN01 — Merge `feat/onboarding_quests` dans le train 0.2.0** · XS · P2 · 🟢 — ✅ **DÉCIDÉ (2026-07-19) : embarquer.** La branche (QOBJ-TYPES01 + QONBOARD01, commit propre rebasé, testée en live 2026-07-17) merge dans dev **après FIX-I18N01** (le contenu est en FR). AC : mergée, suite verte.
- [ ] **TEST-SCEN01 — Recette fonctionnelle = gate sine qua non** · S · P2 · 🟢 — grille `docs/TEST_SCENARIOS.md` créée (10 scénarios S1-S10 ; S1/S8/S9 partiels verts au 17/07). (1) Amender CONTRIBUTING §7 : étape « recette fonctionnelle — les 10 scénarios déroulés et cochés (date+commit) avant toute PR dev→master » ; (2) première passe complète 10/10 sur le train 0.2.0 (restent S2-S5, S7, S10 + compléments). AC : gate documentée + passe 10/10 archivée dans le fichier.
- [ ] **REL-TAG01 — Bump 0.2.0 + PR dev→master + tag + resync** · XS · P2 · 🟢 — package.json 0.0.0→0.2.0 ; PR dev→master (merge classique) ; `git tag v0.2.0` + push --tags ; resync dev (`--ff-only`) ; vérif `git log master..dev` vide. **Inaugure « master stable taggué »** (0 tag à ce jour). Puis actions hors-repo DEPLOY01 : push + import Vercel + **Vercel Authentication**. AC : tag posé, dev resynchronisé, alpha privée accessible.

### BUG_v1.2 — Correctifs de playthrough (épic `FIX-`)
> Bugs remontés en playthrough sur le contenu v1.2. Règle de session : chaque fix embarque ses tests de régression.

- [x] **FIX-QUESTPROG02 — Église : quête active affiche le cumul de kills (5/5) après acceptation** · S · P2 · ✅ — **FAIT 2026-07-19 (avec UI11)** : prop `base={world.questProgress?.[q.id] ?? {}}` passée aux QuestCard actives de l'Église **et** du MasterBoard (homogénéité) ; test de régression dans `ChurchPanel.ui11.test.jsx` (5 kills préalables → 0/N à l'acceptation, pas 5/5). — 🐞 *retour playthrough 2026-06-14.* À l'église (`ChurchPanel`, `SafeZone.jsx` ~l.708), accepter une quête kill (« Thin the Wolf Pack ») l'affiche aussitôt **5/5 ✓** : la `QuestCard` **active** ne reçoit pas le snapshot `base` → progression = `killCounts − 0` = cumul (même classe que FIX-QUESTPROG01, côté panneau église). **PAS un exploit** : `startQuest` crée bien le snapshot et `isQuestCompleteState` utilise le delta → la quête n'est pas réellement complétable, c'est un bug d'**affichage**. **Fix** : passer `base={world.questProgress?.[q.id] ?? {}}` à la `QuestCard` active de l'église (comme `QuestBoard` l.149) ; idem par cohérence sur la `QuestCard` active des quêtes de maître (Académie, ~l.2059 — objectifs `skill_levelup` non impactés mais homogénéité). + **test de régression** (église : kill active → delta, pas cumul). ⟶ FIX-QUESTPROG01, FIX-QUESTSNAP01.
- ↪ **HSV2-01** (avatar invisible sur le Hero Sheet) est aussi un bug v1.2 — traité dans l'épique « Refonte Hero Sheet » avec la refonte, donc gardé là-bas.
- [x] **FIX-QUESTPROG01 — Board : quête non acceptée affichait le cumul (5/5)** · S · 🐞 — corrigé 2026-06-14 : `QuestCard` affiche 0 pour les objectifs delta (kill/craft) tant que la quête n'est pas active ; +4 tests (`QuestBoard.questprog.test.jsx`). Suite 1161✓.
- [x] **FIX-START01 — Héros piégé sur un node verrouillé (ne démarrait pas à Greywatch)** · S · 🐞 — corrigé 2026-06-14 : anti-piège dans `normalizeSave` (relocalisation Greywatch si node verrouillé) + fallbacks `ironhaven`→`greywatch` ; +3 tests. Suite 1157✓.

### v1.31 — Quêtes ✅ (livré 2026-06-20)
> ⟶ MQ-CHAIN01 ✓. **18/18 tickets faits** : re-domiciliation par adjacence + sous-correctifs (CHQ-LOC01, MQ-TURNIN-SIG01) · module `villageQuests.js` (pools générés par adjacence, rotation, level-gate, comptes par localité) · objectif `collect` · multi-objectifs · quêtes chronométrées · verrou maître/église · badge ⚔ quête principale · toasts de progrès. Suite **1199 verte**, lint/build OK.

- [x] **QSV2-ADJ-AUDIT01 — Audit d'adjacence des quêtes + re-domiciliation** · M · P2 · ✅ — **FAIT 2026-06-20 (C1)** : test d'intégrité `questAdjacency.test.js` + re-domiciliation (Aldric→Greywatch ; bog/ruins/scout/graven→Millhaven ; explore_hills/clear_marsh→Ironhaven ; Storm/End/Fenrot `mapTier:2`) + **CHQ-LOC01** (église filtrée par lieu) + **MQ-TURNIN-SIG01** (provenance turn-in) ; 1175 tests verts. — *audit 2026-06-19 (croisement `worldGraph.EDGES` × `MONSTERS_BY_SPOT` × `resourceDrops` × `giverNpc.location`).* **Constat** : la **majorité des quêtes secondaires** (hors spine MQ) ciblent des monstres/drops de **zones NON adjacentes** à leur lieu émetteur (`getQuestIssuer`) — séquelle de quêtes *legacy* rattachées à 3-4 donneurs fourre-tout, antérieures au node-locking (B6). Ce ticket **documente les écarts** et fixe la **re-domiciliation cible** ; il sert de **spec data** à VQ02 (moteur) + VQ03/04/05 (pools par localité) + VQ07 (givers).
  - **Adjacence de référence (spots voisins par localité, Map 1)** : **Greywatch** = {`ashenvale_forest` 1-8}. **Millhaven** = {`ashenvale_forest` 1-8, `crumbled_ruins` 12-22, `thornmarsh` 20-30}. **Ironhaven** = {`thornmarsh` 20-30, `wildmere_hills` 6-14, `crypt`(donjon)}.
  - **Règle posée** : une quête **non-spine** ne doit cibler (kill / collect / visit / elite_turnin) que des monstres ou drops d'un **spot adjacent à son émetteur**. Le **spine MQ** est exempté (il route vers l'avant via `unlocks`), mais doit éviter de surfacer des cibles **Map 2**.
  - **Violations — Greywatch (émetteur greywatch_elder)** : `bog_purge` (mire_slime → thornmarsh), `ruins_cleanse` (ruin_specter+hollow_knight → crumbled_ruins), `nc_scout_marsh` (visit thornmarsh), `nc_explore_hills` (visit wildmere + **unlock Grimspire** depuis le village de départ !), `nc_fenrot_elite` (fenrot → thornmarsh **+ `mapTier:2`**). *Seuls `mq01`/`mq02` sont conformes.*
  - **Violations — Ironhaven (émetteurs sir_aldric / ironhaven_captain / merchant_pell)** : `first_blood` (wolves → forest, **doublon mq01**), `nc_thin_the_boars` (boar → forest), `nc_oakheart_elite` (oakheart → forest, **doublon mq02**), `nc_graven_elite` (graven → crumbled_ruins = zone Millhaven), `mq06` (graven → crumbled_ruins), `nc_deliver_ruins` (visit crumbled_ruins), **`storm_the_citadel` + `end_the_demon` = boss Map 2 surfacés à Ironhaven**. *Conformes : `clear_the_marsh`, `nc_thunderhoof_elite`, `silence_the_crypt`.*
  - **Violations — Millhaven** : `mq04` (thunderhoof → wildmere, zone Ironhaven) — toléré (spine). **Aucune quête secondaire** (village creux → cible n°1 de VQ04).
  - **Problème donneur** : `sir_aldric` est titré « Knight of Millhaven » mais `location: ironhaven`, et porte des quêtes d'intro ciblant la forêt → **relocaliser à Greywatch** (ou créer des givers dédiés VQ07). Besoin d'un émetteur Millhaven pour le pool secondaire (réutiliser `millhaven_elder`/Warden Halric). *(Aldric ne devient pas qu'un donneur relocalisé : il prend le rôle de **maître martial** — épique v1.43 Maîtres, `MST05`.)*
  - **Re-domiciliation cible (proposition à valider)** : `first_blood`/`proof_of_worth`/`nc_thin_the_boars`/`nc_oakheart_elite` → **Greywatch** ; `ruins_cleanse`/`nc_graven_elite`/`nc_deliver_ruins` → **Millhaven** ; `bog_purge`/`nc_scout_marsh` → **Millhaven ou Ironhaven** (thornmarsh adj. aux deux) ; `nc_explore_hills` (visit wildmere) → **Ironhaven** ; `clear_the_marsh`/`nc_thunderhoof_elite`/`silence_the_crypt` → **rester Ironhaven** ; `storm_the_citadel`/`end_the_demon`/`nc_fenrot_elite` → **Map 2 (Stonehaven)** / **gelés** tant que Map 2 fermée. **Doublons** `first_blood`↔`mq01` et `nc_oakheart_elite`↔`mq02` : trancher (retirer la legacy, ou la garder comme variante « répétable » sans l'arme signature).
  - **Sous-correctif A — `CHQ-LOC01` (église globale, S)** : `church_caelum.location='any'` + `getActiveChurchQuests(dayCount)` **non filtré par lieu** → les **mêmes 2 quêtes** s'affichent partout. Le pool (forêt+ruins+marais) est calibré pour **Millhaven** : à Greywatch 5/6 sont hors adjacence (peut demander de purger le marais L20-30). **Fix** : filtrer le pool d'église par les spots adjacents à `currentLocation` avant la rotation (sous-ensemble du pool global).
  - **Sous-correctif B — `MQ-TURNIN-SIG01` (turn-in non signature, S)** : `questObjectiveStatus(elite_turnin)` ne vérifie **que la possession** de `resourceId`, pas sa **provenance** ; or `earth_crystal` (Oakheart) tombe aussi de stone_golem/hill_slime, `ancient_bone` (Thunderhoof) de fenrot/graven/Crypt Keeper, `cursed_gem` (Graven, 15%) de Crypt Keeper (50%). → on « valide l'élite » en farmant ailleurs. **Fix** : soit une **ressource signature unique par élite** (RES02), soit conserver l'item rare mais lier la complétion à un **compteur de kill de l'élite** ; la branche *arme signature* reste l'alternative voulue.
  - **AC** : (1) **test d'intégrité** — pour chaque quête `!isMainQuest`, toute cible kill/collect/visit pointe vers un monstre/drop d'un spot **adjacent** à `getQuestIssuer(quest)` (sinon le test liste l'écart) ; (2) aucune quête non gelée ne cible une zone **Map 2** ; (3) église : les quêtes proposées à un lieu ⊂ ses spots adjacents ; (4) doublons legacy/spine tranchés. **Lien** : VQ01-07 (ce ticket = leur contenu data), MQUI01, REP01, RES02, START04/MQ-CHAIN01.
- [x] **VQ01 — Modèle de données quête** · S · P2 · 🟢 — `type` kill/collect/visit, `target`, `count`, `giver`, `rewards`, `sourceZone`, `difficultyTier`.
- [x] **VQ02 — Moteur d'adjacence** · M · P2 · 🟢 — pool village = union des monstres/ressources des zones adjacentes.
- [x] **VQ03 — Pool Greywatch** · S · P2 · 🟢 — Ashenvale, tier facile (8 quêtes).
- [x] **VQ04 — Pool Millhaven** · S · P2 · 🟢 — Ashenvale (difficile) + Barrow Hills + Crumbled Ruins.
- [x] **VQ05 — Pool Ironhaven** · S · P2 · 🟢 — Crumbled Ruins (difficile) + Thornmarsh + Goblin Cave.
- [x] **VQ07 — Câblage givers** · S · P2 · 🟢 — Marta / Elder / Blacksmith / Priest.
- [x] **VQ06 — Rotation du board** · S · P3 · 🟢 — N actives (**nombre défini par VQ-G4**), refresh /3 jours (seed `dayCount`). ⟶ GLD02, VQ-G4.
- [x] **VQ-G1 — Tokens des quêtes de village** · XS · P3 · 🟢 — ✅ **DÉCIDÉ (2026-06-20)** : **seules les quêtes ciblant un élite** donnent des reputation tokens ; les quêtes communes de village = **gold / ressources / équipement, 0 token** (cohérent REP01). ⟶ REP01, VQ-G3.
- [x] **VQ-G2 — Tracking collect** · XS · P3 · 🟢 — ✅ **DÉCIDÉ (2026-06-20)** : **track après acceptation** via le snapshot `questProgress` (baseline figée à l'acceptation, delta ensuite ; cohérent FIX-QUESTSNAP01).
- [x] **VQ-G3 — Quêtes d'élite** · XS · P3 · 🟢 — ✅ **DÉCIDÉ (2026-06-20)** : **level-gate** — une quête ciblant un élite n'entre dans le pool que si le héros atteint le niveau requis (seuil = bas de la `levelRange` du spot de l'élite, à caler). ⟶ VQ-G1 (tokens), MONLV01.
- [x] **VQ-G4 — Nb de quêtes actives (par localité + paliers de niveau)** · XS · P3 · 🟢 — ✅ **DÉCIDÉ (2026-06-20)** : base **village = 3**, **ville/Guilde = 6** ; **+1 quête par palier de 5 niveaux de héros**, plafonné à **6 en village** / **12 en ville**. (ex. village : 3 → 4 @Lv5 → 5 @Lv10 → 6 @Lv15 cap ; ville : 6 → 7 @Lv5 → … → 12 @Lv30 cap). ⟶ VQ06.
- [x] **VQ-G5 — Board ville : Guilde uniquement** · XS · P3 · 🟢 — ✅ **DÉCIDÉ (2026-06-20)** : en **ville**, board de quêtes = **la Guilde uniquement** (pas de board d'auberge séparé ; acté GLD01). Pool « Final Outpost » = **gelé** (Map 2). ⟶ GLD01.
- [x] **QSV2-MULTIMON01 — Objectifs multi-monstres** · S/M · P3 · 🟢 — *TC 2026-06-08.* Ex. « 3 Hares **+** 2 Boars ». Le modèle `objectives:[]` + `isQuestComplete().every()` **le supporte déjà** ; reste à **créer du contenu** multi-objectifs + s'assurer que l'UI (QuestCard/Overlay) affiche **plusieurs barres** proprement. ✅ **Ready (2026-06-20)** : AC = ≥3 quêtes multi-objectifs + barres multiples rendues.
- [x] **QSV2-TIMED01 — Quêtes chronométrées (deadline en jours, trajet inclus)** · M · P3 · 🟢 — *TC 2026-06-08.* Ex. « tuer 5 loups en < 4 jours », le **temps de trajet comptant**. Données : `quest.deadlineDays` ; on stocke le **jour d'acceptation**. ✅ **DÉCIDÉ (2026-06-20)** : à l'expiration → **échec + redevient disponible** à la prochaine rotation du board (pas de pénalité, pas de perte définitive). AC : compte à rebours (jours) à l'UI, trajet décompté, échec → re-pool, interaction `dayCount`.
- [x] **QSV2-NPCONLY01 — Quêtes maître & église : prise + rendu uniquement au NPC** · S · P3 · 🟢 — *TC 2026-06-08.* ✅ **Ready (2026-06-20)** : tâche de **vérif + verrou** (test : aucune quête maître/église ne s'affiche ni ne se rend sur un board). Les quêtes de **maître** (ACA04) et **d'église** (CHQ01, rotation) **ne doivent pas apparaître sur les quest boards** ; prise **et** rendu **uniquement** chez leur NPC. **✅ Déjà largement le cas** (AcademyPanel / ChurchPanel ; le board lit `QUESTS`, pas church/master) → ticket de **vérification + verrouillage** (s'assurer qu'aucune n'apparaît/se rend sur un board).
- [x] **MQUI01 — Distinguer visuellement la quête principale (board + tracker)** · S/M · P3 · 🟢 — *retour playthrough 2026-06-14.* La chaîne principale (`mainQuests.js`, mq01→mq06) est bien **surfacée et fonctionnelle** (board du lieu émetteur, gating `isMainQuestAvailable`, `getQuestById` la résout, complétion OK), mais **rien ne la distingue** d'une quête secondaire : `QuestCard` n'affiche aucun marqueur pour `isMainQuest` → le joueur ne « voit » pas de quête principale (ex. « The Waking » mq01 ressemble à une commission de village). **À faire** : (1) **badge** « ⚔ Quête principale » sur `QuestCard` quand `quest.isMainQuest` (couleur dédiée, distincte du ⚜ prestige) ; (2) **section/tri dédié** en tête du board (« Quête principale » avant Active/Available) ; (3) **épingler l'étape MQ courante** en tête du tracker `Quests` (overlay) avec le « next » de la chaîne (`nextMainQuest`). AC : sur le board de Greywatch au démarrage, la quête principale est immédiatement identifiable ; après acceptation/complétion elle reste mise en avant (section active/épinglée) ; tests de rendu (badge présent si `isMainQuest`, absent sinon). UX uniquement — aucune logique de chaîne à changer. Lien B6/MQ-CHAIN01. ✅ **Ready (2026-06-20)** : badge **⚔** couleur dédiée (≠ ⚜ prestige) + section en tête de board + épingle dans le tracker.
- [x] **QTOAST01 — Pop-up de progrès de quête (toast latéral)** · S · P3 · 🟢 — *retour playthrough 2026-06-14.* Quand une action fait avancer un objectif d'une **quête active** (kill comptabilisé, craft, visite…), afficher une **petite pop-up sur le bas-côté** : « *Quête X : Tuer des loups 3/5* » (et « ✓ Objectif terminé / Quête prête à rendre » au palier). ✅ **DÉCIDÉ (2026-06-20)** : réutiliser `toastStore` (type `quest`) ; **throttle** (~1 toast / objectif / 2 s) + **regroupement en idle** ; **quêtes actives uniquement** ; déclenché sur l'incrément (combat + idle). Lien Q07 + tracker `Quests`. Données via snapshot `questProgress` (delta).

### BUG_v1.31 — Correctifs de playthrough (Quêtes)
> Retours playthrough 2026-06-20 (branche v1.31). Règle bug (CONTRIBUTING §3) : **test de régression écrit AVANT le fix**.

- [x] **FIX-QCARD-COLLECT01 — QuestCard (board) ignore l'objectif `collect` → `0/1` + Claim/barre incohérents** · S · P2 · 🟢 ✅ (fait — QuestCard branché sur `questObjectiveStatus` via prop `objectiveStatus` + flag `accepted` ; 3 tests régression) — 🐞 *cc board vs Quests overlay.* Le `QuestCard` du board **recalcule la progression en local** (switch kill/level/visit/craft/skill_levelup) **sans le type `collect`** → un objectif collect s'affiche **`0/1`** (target défaut = 1), barre figée ; or la Quests overlay (via `questObjectiveStatus`) montre **`2/5`** et `isQuestComplete` (store) valide → **le bouton Claim apparaît alors que l'affichage n'est pas rempli**. **Fix** : brancher le `QuestCard` sur la **source unique `questObjectiveStatus(quest, state)`** (déjà utilisée par l'overlay) au lieu du calcul dupliqué. Résout le **décalage board↔overlay** (#3) ET le **Claim/barre incohérents** (#4). AC : collect affiché `x/5` et suivi ; barre = progression réelle ; Claim seulement si réellement complet ; **test de régression** (collect 2/5 → carte board `2/5` sans Claim ; 5/5 → Claim). ⟶ VQ-G2, QTOAST01.
- [x] **FIX-QXP01 — Les quêtes n'octroient aucune XP de héros (bonus « première fois »)** · M · P2 · 🟡 ✅ (fait — `questXpReward`/`defaultQuestXp` + octroi `gainExp` dans `completeQuest`, 1ère fois plein / repeat ×0.25, chip XP ; **valeurs Excel injectées via `questBalance.js`** ; 3 tests) — 🐞 *retour playthrough.* Le schéma `reward` (gold / skill / consumables / resources / equipment / stat / aura / concentration) **n'inclut pas d'XP de héros** → compléter une quête ne fait pas progresser le niveau. **Fix** : ajouter un champ **`xp`** au reward, l'octroyer dans `claimQuest` (`questsSlice`) via **`gainExp(amount)`** (`heroSlice:477`, gère le level-up via `applyLevelUps`), et l'afficher (toast + carte, ex. `+X XP`). **Bonus première fois** : si `quest.id` ∉ `world.completedQuests` → XP plein (ou `xpFirstTime`) ; re-complétions (quêtes de village répétables) → XP réduite (ex. ×0.25). Renseigner des valeurs `xp` sur toutes les quêtes, échelonnées sur le niveau recommandé. AC : claim d'une quête neuve octroie l'XP (peut level-up) ; re-claim répétable → XP réduite ; toast/carte affichent l'XP ; **tests** (grant, first-time vs repeat, level-up). ⟶ VQ-G1, `gainExp`, `completedQuests`.
- [x] **FIX-QRANK01 — Les quêtes ne font pas progresser le rang d'aventurier + refonte de l'échelle (10 paliers)** · L · P2 · 🟡 ✅ (fait — `src/data/ranks.js` : 10 paliers Aluminium→Suprême + compteur dédié `hero.rankPoints` (migration héritée) ; octroi dans `completeQuest` (1ère fois plein / repeat ×0.25) ; overlay `questBalance.js` (valeurs Excel) + défaut par tier pour le village ; RankBanner sur `rankPoints` ; gate Guilde relabel « (réputation) » ; codex MàJ ; 6 tests + tests rang réécrits) — 🐞/refonte *cc board (Rank Copper 0/10).* Le rang (`RANK_TIERS`, `QuestBoard.jsx:21` — Copper/Silver/Gold/Platinum/Diamond) est piloté par **`reputationTokens`**, octroyés quasi-uniquement par les chasses d'élite ; **les quêtes normales donnent `reputationTokens: 0`** → finir 8 quêtes ne fait **aucune** progression de rang. **Demande** : chaque quête octroie **1 à 10 points selon sa difficulté**, et remplacer l'échelle par **10 paliers** : Aluminium → Fer → Bronze → Argent → Orichalque → Or → Platine → Émeraude → Diamant → Suprême. **Décidé** : compteur cumulatif dédié **`rankPoints`** (jamais dépensé), **distinct** des `reputationTokens` (monnaie dépensable à la Boutique des Dieux) — évite que dépenser des tokens fasse baisser le rang. **Gate Guilde décidé** : reste sur `reputationTokens` (relabel du « Silver rank » trompeur) — le rang devient une progression via quêtes, les tokens restent la monnaie/gate des commissions. **En attente** : valeurs `rankPoints` de l'Excel (calage des seuils des 10 paliers) avant implémentation en une passe. **Touchpoints** : extraire `RANK_TIERS` → `src/data/ranks.js` (10 paliers + seuils), nouveau compteur `rankPoints` (+ migration save), octroi dans `claimQuest` par difficulté (champ `rankPoints`/dérivé du niveau reco), re-mapper les gates (`PRESTIGE_MIN_TOKENS` / « Requires 10 🪙 (Silver rank) », lock The Old Oak Walks) sur la nouvelle échelle, MàJ `codexRules` (texte des rangs). AC : compléter une quête ajoute des points de rang ; barre « X/Y to <next> » suit ; 10 paliers ; gates remappés ; migration save ; tests (octroi par difficulté, passage de palier, gate). ⟶ FIX-QXP01 (même point d'octroi `claimQuest`), GodsShop.
- [x] **FIX-CHURCH-DRY01 — L'église s'assèche : aucune nouvelle quête après un cycle (one-shot + CHQ-LOC01 trop strict)** · M · P2 · 🟡 ✅ (fait — deeds répétables par bloc via `world.churchDeeds` + `getAvailableChurchDeeds` + min-pool CHQ-LOC02 ; 4 tests) — 🐞 *cc Day 9→12, full cycle sans nouvelle quête.* L'UI « 🕯 Acts of Devotion » promet « New deeds in X days » (rotation /3 j) mais **aucun nouvel acte n'apparaît après le cycle**. Double cause : (1) **one-shot permanent** — `available = rotating.filter(q => !completedIds.includes(q.id))` (`SafeZone.jsx:642`) exclut définitivement toute quête d'église déjà faite → la rotation ne peut jamais re-proposer un acte ; (2) **CHQ-LOC01 trop strict** — à Greywatch (seul spot voisin `ashenvale_forest`), le pool église filtré = **1 quête** (`church_thin_the_pack`), les 5 autres ciblant thornmarsh/crumbled_ruins → assèchement définitif malgré le décompte. **Fix (reco)** : rendre les actes de dévotion **répétables par cycle** (suivre la complétion **par bloc de rotation**, pas dans `completedQuests` permanent) → chaque nouveau bloc /3 j ré-offre des deeds ; ET assouplir CHQ-LOC01 (rayon 2 sauts, garantie de pool minimum par lieu, ou église non géo-gatée) pour ne pas affamer un village à 1 spot. AC : après un cycle, de nouveaux actes apparaissent à Greywatch ; le décompte reflète l'arrivée réelle ; tests (ré-offre après cycle + pool min garanti par lieu). ⟶ CHQ-LOC01, `churchRotationBlock`.
- [x] **FIX-QTOAST-DUR01 — Toasts de progrès de quête un poil plus persistants (+1 s)** · XS · P3 · 🟢 ✅ (fait — `combatSlice` 3000/2200 → 4000/3200 ms ; test durée) — 🐞 *retour playthrough (#1).* Les pop-ups de progrès (QTOAST01, `combatSlice.recordKill`) disparaissent trop vite. Allonger d'~1 s : progrès **2200→3200 ms**, « done » **3000→4000 ms**. AC : durée allongée ; throttle/anti-spam inchangé.
- [x] **FIX-QCOMPLETED-COLLAPSE01 — Replier les quêtes terminées du board** · S · P3 · 🟢 ✅ (fait — `CollapsibleSection` repliée par défaut ; 2 tests + maj test board) — 🐞 *cc board (#5).* Les quêtes déjà validées encombrent le board. Les regrouper dans une section **« Completed » repliable** (repliée par défaut). AC : toggle collapse, repliée par défaut ; Active/Available inchangées ; test de rendu (section présente + repliée).
- [x] **FIX-BOAR-DROP01 — Tuskmaw Boar droppe des parts de loup (`wolf_fang`/`wolf_pelt`)** · S · P3 · 🟡 ✅ (fait — `boar_tusk`/`boar_hide` créés + reciblage ; 2 tests) — 🐞 *cc combat (#6).* `tuskmaw_boar.resourceDrops` = `wolf_fang` + `wolf_pelt` (thématiquement faux sur un sanglier). Re-cibler vers une ressource cohérente (`boar_tusk`/`boar_hide` à créer). **⟶ recoupe DROP-FIX01 (v1.42)** (Hare/Boar/Fox/Thunderhoof) — corriger ici (quick) ou déléguer à DROP-FIX01. AC : plus de parts de loup sur le sanglier ; ressource cohérente + usage (recette/junk) ; test de structure des drops.
- [x] **QUI-QOBJ-STYLE01 — Prototypes de style pour la condition d'objectif (couleur/taille)** · S · P4 · 🟡 ✅ (fait — hybride retenu : libellé 14px/500 + compteur en pastille colorée par état ; appliqué QuestCard + QuestsOverlay, palettes sombre/parchemin ; tests UI mis à jour)
- [ ] **VQ-DEDUP01 — Quêtes de village dupliquées entre lieux adjacents (chevauchement d'adjacence)** · M · P3 · 🟢 — *investigation playthrough 2026-07-02.* Les quêtes de village sont générées par **adjacence de spots** (`generateVillageQuestPool` = union des spots voisins) ; un spot partagé par 2 lieux crée des quêtes **identiques à des lieux différents** → **16 cibles dupliquées** : Millhaven (carrefour du graphe) duplique **100 %** des quêtes `ashenvale_forest` de Greywatch **et** `thornmarsh` d'Ironhaven (son seul contenu propre = `crumbled_ruins`). Conséquences : pool Millhaven surdimensionné (**25** vs fenêtre board **3-6** → quêtes rarement vues), **double-dip** (même contenu jouable à 2 villages), **contradiction avec QSV2-LOCALITY01** (« villages d'une même zone = quêtes distinctes »). ✅ **DÉCIDÉ (2026-07-11, TC)** : **propriétaire unique par spot** (pools **disjoints**), **dérivé de la carte** (`worldGraph.EDGES` + niveau du spot) → plus aucun doublon inter-village ; le sourcing des quêtes se fait sur *« les monstres/drops du spot possédé par le lieu »*. **Ownership retenu** : `ashenvale_forest`→**Greywatch** · `crumbled_ruins`→**Millhaven** · `wildmere_hills`→**Ironhaven** · **`thornmarsh`→Ironhaven** *(spot fin-de-Map-1 L20-30 → ville finale ; sous-décision à confirmer)*. Découpé en **QSV2-SPOTOWNER01** (carte `SPOT_OWNER` + `generateVillageQuestPool` en pools disjoints) + **QSV2-DROPDUP01** (retrait des quêtes legacy doublonnées) + **QSV2-QSRC-TEST01** (test disjonction/sourcing). AC : chaque spot alimente 1 seul lieu ; 0 doublon inter-village ; test. *N'affecte pas l'export monstres (aucune duplication : 29 monstres, 0 doublon, non-surface = Map 2/réserve en onglets séparés).* ⟶ QSV2-ADJ-AUDIT01, QSV2-LOCALITY01.
- [x] **QSV2-SPOTOWNER01 — Propriété unique de spot = source du sourcing des quêtes (carte-dérivée)** · M · P3 · ✅ — **FAIT 2026-07-11 (loop)** : `SPOT_OWNER` (ashenvale_forest→greywatch · crumbled_ruins→millhaven · thornmarsh+wildmere_hills→ironhaven) + `ownedSpots()` ; `generateVillageQuestPool` source les spots **possédés** → pools **disjoints** (fin du double-dip) ; +4 tests (owner unique/adjacent/disjoint/Greywatch non vide). Suite 1941✓, lint/build OK. — *impl. de VQ-DEDUP01.* Poser une table data **`SPOT_OWNER`** (1 seul lieu par spot de chasse, **dérivée du graphe `worldGraph.EDGES`** + niveau du spot) = **source de vérité** du « quels monstres/drops appartiennent à ce lieu » (via `MONSTERS_BY_SPOT`). `generateVillageQuestPool(location)` ne prend plus l'**union** des spots voisins mais **uniquement les spots possédés** → pools **disjoints**, fin du double-dip. Réutilisable par le filtre église (CHQ-LOC01) et tout sourcing futur (VQ02). AC : mapping complet (chaque spot de surface a 1 owner) ; `generateVillageQuestPool` consomme `SPOT_OWNER`. ⟶ VQ-DEDUP01, QSV2-LOCALITY01, MONSTERS_BY_SPOT.
- [ ] **QSV2-DROPDUP01 — Retirer les quêtes legacy doublonnées** · S · **P2** · 🟢 — *P3→P2 (2026-07-19) : doublon First Blood ↔ mq01 **confirmé à l'écran** au board de Greywatch — rejoint le train 0.2.0.* ✅ **DÉCIDÉ (2026-07-11) : drop.** Post-re-domiciliation, `first_blood` (5× ashwood_wolf) **duplique `mq01`** et `nc_oakheart_elite` (Old Oakheart) **duplique `mq02`** au **même** village (Greywatch). Les **supprimer** de `quests.js` (+ registre `QUEST_NPC_REGISTRY`/résolution) ; **migration save** (une quête retirée encore `active`/`completed` ne doit pas casser `getQuestById`/le board — filtrer les ids inconnus) ; test de régression. *(`proof_of_worth` « atteindre Lv3 » : conservée — pas un doublon de cible.)* ⟶ QSV2-ADJ-AUDIT01, MST03.
- [ ] **QSV2-QSRC-TEST01 — Test de sourcing & disjonction des quêtes** · S · **P2** · 🟢 — *P3→P2 (2026-07-19) : train 0.2.0 avec DROPDUP01.* — étendre `questAdjacency.test.js` : (1) **disjonction** — aucun spot n'alimente 2 lieux (via `SPOT_OWNER`) ; (2) **0 doublon inter-village** — deux lieux ne proposent jamais la même cible ; (3) **sourcing** — toute quête de village cible un monstre/drop d'un spot **possédé** par son émetteur ; (4) les quêtes hand-authored restent conformes (test d'adjacence existant vert). ⟶ QSV2-SPOTOWNER01, QSV2-DROPDUP01.

### v1.32 — Skills (drops) ✅ (livré 2026-06-20)
> ⟶ MON01 ✓. **11/11 tickets faits** : `skillDropType` refondu en `physical_active`/`magic_active` (dérivé `getSkillDropType`, source de vérité) · `ember_burst`/`fox_fire` créés (Fire Hare/Russet Fox, feu+Burn) · `plague_maw`→magic · mapping `getSkillDropMap` (SKD07) · doc physical/magic (DESIGN.md) · achat premium Lv2-5 à l'Académie (ACA06) · audit `skd.test.js` (46 skills, orphelin `putrid_slam` corrigé). Suite **1213 verte**, lint/build OK.

- [x] **SKD01 — Refactor `skillDropType`** · M · P3 · 🟢 — `active`→`physical_active`|`magic_active` (garder `passive`/`none`) ; maj `MONSTERS` + logique combat/héritage. ⟶ MON01.
- [x] **SKD07 — Mapping des 16 skill drops** · S · P3 · 🟢 — table physique/magique/passif/élite par zone.
- [x] **SKD02 — Rethème Thicket Hare → Fire Hare** · S · P3 · 🟢 — rename id + ASSET_PROMPTS.md + regen asset (lapin de feu).
- [x] **SKD03 — Skill `ember_burst`** · S · P3 · 🟢 — magic_active, drop Fire Hare ; 12 mana, CD 2, 1.0×INT feu + 20% Burn.
- [x] **SKD04 — Skill `fox_fire`** · S · P3 · 🟢 — magic_active, drop Russet Fox ; 18 mana, CD 3, 1.2×INT feu + 30% Burn.
- [x] **SKD05 — Passif `caustic_coat`** · S · P3 · 🟢 — Mire Slime ; retour acide 15% en mêlée + debuff Corroded (−DEF, stack 5).
- [x] **SKD06 — `bramble_slam`** · S · P3 · 🟢 — Oakheart (élite physical_active AoE) ; 16 mana, CD 4, 1.1×ATK cible / 0.6× autres, 30% Thorned DoT.
- [x] **SKD-G1 — Stats des skills d'élite** · S · P3 · 🟢 — ✅ **Audit (2026-06-20)** : `tomb_judgment` (stun 1t, 1.7×), `plague_maw` (poison 3t, 1.4×), `trample_charge` (1.8×) **déjà codés** dans `skills.js`. Reste : **reclasser `plague_maw` en `magic`** (typage Fenrot=magic ; actuellement `damage.type:'physical'`) ; confirmer si `trample_charge` doit gagner un effet (AoE/charge). ⟶ SKD01, SKD-E1.
- [x] **SKD-G2 — Doc design physical/magic** · S · P3 · 🟢 — formaliser physical (renfort corps / multi-coups / infusion / charge / contre) vs magic (élémentaire / âme-ombre / illusion / bouclier). ✅ **DÉCIDÉ (2026-06-20)** : doc dans `DESIGN.md` (§Skills) ; AC = chaque catégorie définie + 1-2 exemples tirés des 44 skills existants. Tâche de rédaction, codable.
- [x] **ACA06 — Acheter des skills déjà montés (Lv2-5) à prix premium** · M · P3 · 🟢 — *décision 2026-06-08.* À l'Académie, en plus du skill Lv1, proposer le **même skill déjà au niveau 2 à 5**, à un **prix dissuasif = 3 à 5× le prix de revente** de ce niveau (`skillSellPrice(id, lvl)` ; ex. ×3 au Lv2 → ×5 au Lv5) pour **inciter à le monter soi-même** plutôt qu'à l'acheter. **DÉCIDÉ : pas de « payer pour monter » un skill possédé.** Catalogue élargi = plus tard. ✅ **DÉCIDÉ (2026-06-20)** : UI = **sélecteur de niveau (Lv1-5) par skill** dans le catalogue Académie ; prix par niveau via `skillSellPrice(id, lvl)` (×3 au Lv2 → ×5 au Lv5).
- [x] **SKD-E1 — Revue de `skills.js` (44 skills)** · L · P3 · 🟢 — ✅ **DÉBLOQUÉ (2026-06-20)** : `src/data/skills.js` accessible = **44 skills** (≠ 27 annoncés). **Audit initial** : `ember_burst`/`fox_fire` (SKD03/04) **absents → à créer** ; tous les autres SKD + élites (`bramble_slam`, `cursed_cleave`, `soul_chill`, `tomb_judgment`, `venom_strike`, `thorn_lash`, `plague_maw`, `cheap_shot`, `trample_charge`, `thick_hide`, `stoneskin`, `caustic_coat`, `mossy_hide`) **déjà codés**. Revue par catégorie : (a) cohérence `type`/`effect.damage.type` (ex. `plague_maw` physical→magic) ; (b) doublons (`savage_bite` vs `rending_bite` du loup — MON01) ; (c) équilibrage multiplicateurs/coûts/CD ; (d) `inheritable`/`container` corrects. AC : 1 test d'intégrité (chaque `sourceMonster` existe, types cohérents) + corrections. ⟶ SKD01, SKD-G1.

### v1.33 — Progression & stats

- [x] **HSV2-01 — Avatar : fix affichage + remontée en tête de colonne** · S · P2 · 🟢 — 🐞 *retour playthrough 2026-06-14.* L'avatar (`<img src={HERO_SPRITE}>` dans `.hs-portrait`) **ne s'affiche plus** (slot effondré / sprite non rendu — à diagnostiquer) **et** doit être **remonté au-dessus du bloc Allégeance** (HS-DEITY01 avait remonté le bloc divin avant l'avatar → inverser). AC : avatar visible en haut de la colonne gauche au chargement ; **test de régression** (présence de l'`<img>` avatar + ordre avant Allégeance).
- [x] **HSV2-02 — Vitalité : barres de longueur uniforme** · XS · P2 · 🟢 — HP / Mana / Vigueur / XP : tous les `VitalBar` ont la **même longueur** (track pleine largeur, remplissage en %). Test de rendu.
- [x] **HSV2-03 — Aura & Concentration : déplacées dans les attributs + masquées si verrouillées** · S · P2 · 🟢 — sortir Aura/Concentration du bloc **vitalité** (haut) → les placer **en bas du bloc attributs** ; tant que `locked` (aura ≤ 0 / concentration ≤ 0) : **barre floutée + nom masqué** (« ??? » / 🔒), affichage normal au déblocage. Test : verrouillé = nom masqué ; débloqué = nom + valeur.
- [x] **HSV2-04 — Attributs : barres uniformes + jalons tous les 35 pts** · S · P2 · 🟢 — **DÉCIDÉ : jalons tous les 35 points.** Attributs (FOR/AGI/INT/CHA/DÉF) en barres **de longueur égale** avec des **repères (ticks) tous les 35 pts** (paliers franchis marqués « on »). Pour l'instant **visuel/placeholder** — le sens gameplay vient avec HSV2-06. AC : ticks à 35/70/105… alignés, barres uniformes ; test de rendu (nb de ticks selon la valeur).
- [x] **HSV2-05 — Skills : retirer l'affichage du cooldown** · XS · P2 · 🟢 — sur `SkillRow` (actifs + divin), **supprimer l'info CD** (« CD 3t ») ; garder Lv + coût MP/HP. AC : plus aucune mention de cooldown ; test de non-régression (pas de « CD » rendu).
- [x] **HSV2-06 — Jalons branchés sur de vrais paliers de skill** · M · P5 · 🟢 — donner un **sens gameplay** aux jalons HSV2-04 : à chaque palier d'attribut (35 pts), débloquer un bonus passif data-driven. ✅ **DÉCIDÉ (proposé, 2026-06-20)** : consomme la table `STAT_MILESTONES` (cf. HS-STATPERK01) ; HSV2-06 = **câbler** la table aux jalons visuels HSV2-04 (palier « on » = bonus actif). ⟶ HS-STATPERK01, HSV2-04.
- [x] **STA01b — Finaliser la Fatigue** · S/M · P3 · 🟢 — retirer le debuff dormant CRF01 + maj ~22 tests ; +40 Fatigue sur échec ; craft-fail ×4 sous 30 vigueur. ✅ **Ready (2026-06-20)** : spec complète (3 tâches concrètes), codable.
- [x] **TITLE-DISP01 — Titre au-dessus du nom** · S · P3 · 🟢 — afficher le titre actif au-dessus du nom (carte + combat), en plus du HeroSheet (M01).
- [x] **TITLE-BUF01 — Buffs de titre** · S · P3 · 🟢 — `statBuffs` sur les données de titre + application aux stats dérivées.
- [x] **TITLE-G1 — Actif vs cumul** · XS · P3 · 🟢 — ✅ **DÉCIDÉ (2026-06-20)** : **un seul titre actif** à la fois (affiché au-dessus du nom + son `statBuffs`), choisi par le joueur ; les autres restent **gagnés** (listés au HeroSheet) mais inactifs. Barème de buffs par titre dans `data/titles.js`. ⟶ TITLE-DISP01, TITLE-BUF01.
- [x] **BURN01 — Tracker de variété d'actions** · M · P3 · 🟢 — fenêtre glissante (combat/craft/repos/collecte/voyage) ; réutilise `countWithinDays`.
- [x] **BURN02 — Malus de monotonie** · M · P3 · 🟢 — sur-combat → **−Aura** temp ; sur-craft → **−Concentration** temp ; exempt si **≥2 activités** planifiées. *(pas de mitigation par palier de stat.)*
- [x] **BURN-G1 — Chiffrage** · S · P3 · 🟢 — ✅ **DÉCIDÉ (proposé, 2026-06-20)** : fenêtre **4 jours** (`countWithinDays`) ; seuil = **≥6 actions du même type** sans variété ; malus **−10% Aura** (sur-combat) / **−10% Concentration** (sur-craft), durée **1 jour** ; **exempt si ≥2 activités** distinctes dans la fenêtre. Anti-spirale : le burnout **n'alimente pas** la Fatigue (axes séparés, cf. STA04). ⟶ BURN01, BURN02, STA04.
- [x] **BEST01 — Paliers de kills → bonus permanents** · M · P3 · 🟢 — ✅ **DÉCIDÉ (proposé, 2026-06-20)** : par espèce — **10 kills** → +5% dégâts contre elle ; **50** → +10% dégâts + stats complètes au Codex ; **100** → +5% taux de drop de l'espèce + entrée « maîtrisée ». Bonus méta (persistent), data-driven. ⟶ CODEX01, BEST02.
- [x] **BEST02 — Lore & recettes via Codex** · S · P3 · 🟢 — ✅ **DÉCIDÉ (2026-06-20)** : compléter une entrée (palier 100 kills, BEST01) débloque son **lore** + une **recette** liée à ses drops. ⟶ BEST01, recipes.js. ⚠️ **v1.33 = lore livré** (affiché au Codex à la maîtrise) ; la partie **recette reportée à v1.42** (système de recettes non encore construit).
- [x] **BEST03 — Succès de complétion de zone** · S · P4 · 🟢 — ✅ **DÉCIDÉ (2026-06-20)** : compléter **toutes les entrées de bestiaire d'une zone** → **titre** dédié + petit bonus permanent (ex. +2% dégâts dans la zone). ⟶ BEST01, M01/titles.
- [x] **ACHIEVE-SYS01 — Système d'achievements formel** · M · P3 · 🟢 — `src/data/achievements.js` (id, condition, cible, récompense) ; prérequis de UI-ACHIEVE-PREVIEW. ⚠️ **`achievements.js` existe déjà (ACH01)** — vérifier le delta plutôt que recréer.
- [x] **META-ACHIEVE02 — Écran de succès + élargir le pool** · S · P3 · 🟢 — ✅ **DÉCIDÉ (2026-06-20)** : (1) **écran de consultation** (overlay, pattern Codex/IMM04) listant les 8 succès ACH01 + progression ; (2) **pool élargi** (proposés) : « 1000 kills », « 10 Demon Lords », « survivre 30 jours », « 50 quêtes », « 1 set complet » — bonus méta façon ACH01. ⟶ ACH01, ACHIEVE-SYS01.
- [x] **HS-STATPERK01 — Paliers de stats → perks/skills passifs (« The Gamer »)** · M · P5 · 🟢 — ✅ **DÉCIDÉ (proposé, 2026-06-20)** : table `STAT_MILESTONES` data-driven, **1 palier / 35 pts** par attribut — FOR +3% dég. phys · AGI +3% vitesse/esquive · INT +3% dég. magiques · CHANCE +2% drop/crit · DÉF +3% réduction (cumulatifs). = **source de vérité** consommée par HSV2-06. ⟶ HSV2-04, HSV2-06.

### BUG_v1.33 — Correctifs de playthrough (Progression & stats)
> Retours playthrough 2026-07-03 (branche v1.33). Règle bug (CONTRIBUTING §3) : **test de régression écrit AVANT le fix**.

- [ ] **FIX-HSBARS01 — Hero Sheet : longueurs de barres homogènes par groupe + Aura/Concentration dans la grille des stats** · S · P3 · 🟢 — 🐞 *retour playthrough 2026-07-03 (Lv 7).* Finition de HSV2-02/03/04 : trois familles de barres cohabitent avec des largeurs de track incohérentes. (1) **4 vitales** (HP/Mana/Vigueur/Exp — `VitalBar`/`.hvb-bar`, `HeroSheet.jsx:220-255`) → même longueur de track. (2) **5 attributs** (FOR/AGI/INT/CHANCE/DÉF — `.attr-grid`/`.ar-bar`, l.256-294) → tracks identiques entre les 2 colonnes de la grille (la valeur `.ar-val` et les ticks `.ar-ticks` ne doivent pas rogner la largeur du track). (3) **Aura & Concentration** (l.295-314) sont rendues en `VitalBar` **pleine largeur** → visuellement décalées ; les **rattacher à la grille des attributs** (même gabarit de barre que les 5 stats, à la suite de DÉF) en conservant l'état verrouillé (flou + 🔒 + « ??? »). **Fix (reco)** : sortir Aura/Concentration de `VitalBar` pour un rendu type `.attr-row` (ou variant partagé) ; figer `.hvb-bar` (vitales) et `.ar-bar` (stats) chacun sur une largeur de track fixe intra-famille (indépendante de la valeur/des ticks à droite). AC : dans chaque famille les tracks ont la même largeur ; Aura/Concentration alignées sur la grille des stats (verrouillées = flou + 🔒 + « ??? ») ; **test de rendu** (largeurs de track égales par famille + Aura/Conc. rendues dans la grille des attributs). ⟶ HSV2-02, HSV2-03, HSV2-04.

### v1.34 — Tech / DX / Balance

- [x] **BAL-CSV01 — Données d'équilibrage pilotées par CSV (live-linked)** · M · P2 · 🟢 — centraliser les constantes tunables dans `public/balance.csv` (**fetch runtime** reco, fallback défaut). Constantes : `xp_curve_mult=1.32`, `reward_xp_mult=5`, `reward_gold_mult=8`, `monster_level_stat_mult=1.25`, `run_scaling=1.03`, `monster_level_reward_mult=1.25`(à valider), `monster_level_drop_bonus`(à valider), + vigueur/zones/prix/drops. ✅ **DÉCIDÉ (2026-06-20)** : archi = `public/balance.csv` **fetché au runtime** au boot → objet `BALANCE` en mémoire ; **fallback = défauts en dur** (jeu jouable si fetch échoue/offline). AC : éditer le CSV change l'équilibrage **sans rebuild** ; fallback testé.
- [ ] **BAL02 — Calibration boss difficulty + playtest** · S · P2 · 🟢 — 3 runs jusqu'au boss par zone ; noter HP restant moyen + nombre de morts ; ajuster `zone_mult` boss si besoin ; documenter dans PLAYTESTS.md.
- [ ] **BAL03 — Calibration idle kill rate vs progression** · S · P2 · 🟢 — vérifier que l'idle seul permet d'atteindre Zone 2 en ~10 jours in-game ; ajuster `dmgTaken` idle.
- [x] **QA01 — Audit compteurs de monstres + intégrité & fonctionnel des items** · M · P3 · 🟢 — *retour playtest 2026-06-08.* ✅ **Ready (2026-06-20)** : 3 volets + AC déjà spécifiés, codable (test d'intégrité référentielle + checklist d'effets). Passe de **vérification** en 3 volets : **(1) Compteurs de monstres bien actualisés** — `world.monsterKillCounts` incrémenté à chaque kill (combat + idle), propagation correcte vers : déblocage idle (≥5 kills), Codex/Bestiaire (stats après X kills, skill flou < 5), objectifs de quête `kill`, succès. **(2) Items bien liés** — auditer toutes les références d'items (drops monstres `resourceDrops`/`skillDrop`, recettes `recipes.js`, stock marchand/forge, récompenses de quête `resources`/`consumables`/`equipment`, livres ITM01) pointent vers des ids **existants** dans `RESOURCES`/`EQUIPMENT_TEMPLATES`/`SKILLS` (test d'intégrité data, type npc02.test). **(3) Items fonctionnellement ET logiquement corrects** — chaque item « lié » a un **effet qui marche** (potions heal/mana, élixirs/buffs, antidote `cureDebuffs` CRF06, livres `gain_stat` ITM01, équipement = stats appliquées) **et cohérent** : l'effet correspond au **type/à la description/à la rareté** (ex. une potion de soin soigne bien, un tome de Focus donne bien de la Concentration, un équipement « lourd » n'a pas de stats incohérentes, le rendement d'une recette est logique). AC : un test d'intégrité référentielle + une checklist d'effets vérifiés (fonctionnels **+ logiques**) ; corriger les références mortes ou effets incohérents. **NB** : une partie est déjà couverte par les tests existants (npc02/z07/itm01/crf06…) — ce ticket les consolide et comble les trous.
- [x] **COV-COMBAT01 — Couverture de test approfondie de `Combat.jsx`** · M · P3 · 🟢 — *TC 2026-06-10 (demande utilisateur).* Le cœur du jeu (`Combat.jsx`, ~1900 l.) est sous-testé (~66 % lignes) : c'est la zone la plus risquée et la moins couverte. Construire une **vraie suite de tests Combat** couvrant : tous les **types d'effet de skill** (physical/magical/heal/buff/debuff/percentage/DoT/AoE/multi-cibles), les **mécaniques de boss** (phases, enrage, soul drain, summon — `bossMechanics`), la **gluttony/assassinat** (GLT02), les **passifs** en combat, l'**aura/vigueur** appliquées aux dégâts, la **fuite** (succès/échec), la **défaite** (heroDeath → post-mortem), et les **invariants de fin** (jamais coincé). Pattern : fake timers + `startCombat` + `act`/`advanceTimers` (cf. `Combat.victory.test.jsx`). 🎯 **Cible : remonter `Combat.jsx` à ≥ 85 %** → couverture globale ≥ 80 %, puis **remonter `thresholds.lines` de 76 à 80** dans `vite.config.js`. Reprend la dette laissée par COV80.
- [ ] **QA-BOOKS01 — Les livres `tome_of_*` ne sont vendus/donnés nulle part** · XS · P4 · 🟢 — *remonté par QA01, 2026-07-04.* Les 3 `tome_of_*` ont un `buyPrice` mais n'apparaissent dans **aucun stock de marchand ni récompense de quête** (seulement utilisables via `useBook`) → contenu mort. Les ajouter à un stock marchand / une récompense de quête (ou décider de les retirer). ⟶ QA01, ITM01.
- [ ] **TECH04 — Performance Canvas 2D — budget 60fps** · S · P3 · 🟢 — Chrome DevTools Performance ; target <8ms/frame ; mémoiser gradients statiques hors du loop.
- [x] **TECH06 — Feature flags** · M · P3 · 🟢 — `FEATURE_FLAGS` dans `config.js` : activer/désactiver des features sans recompiler. ✅ **Ready (2026-06-20)** : AC = objet `FEATURE_FLAGS` exporté + ≥1 feature gardée par un flag + test.
- [x] **REFAC02 — Découpage de `SafeZone.jsx` (1 fichier/panneau)** · M · P5 · 🟢 — *TC 2026-06-08.* Sortir chaque panneau de bâtiment (Inn/Church/Merchant/Alchemy/Blacksmith/MasterSmith/KnightTrainer/Academy) + `NpcOverlay`/`VilBuilding` dans leurs fichiers. Refacto pur, tests verts inchangés. ✅ **Ready (2026-06-20)** : v1.1 livré → plus de conflit. ⚠️ coordonner si UI11 (Church) est en cours sur la même branche.
- [x] **REFAC03 — Découpage de `Combat.jsx` (sous-composants + hook)** · M · P5 · 🟢 — *TC 2026-06-08.* Extraire `EnemyCard`/`HeroCard`/`ActionPanel`/`VictoryPanel`/`FloatingNumbers` + un hook de logique combat. ⚠️ le **plus risqué** (moins de tests sur le rendu). ✅ **Ready (2026-06-20)** : à faire **après COV-COMBAT01** (filet de tests d'abord). Ordonné ainsi dans l'épique.

### v1.41 — Donjon
> **▼ RECULÉE (2026-07-06)** — asset-gated (fond de donjon + médaillons de salle, cf. DUN-ART01) ; replanifiée après Idle. Cf. table « Plan de release ».
> ⟶ spec 9 salles : voir Archive §v1.4

- [ ] **D01-SPEC — Spécifier le flux de donjon (DESIGN.md)** · M · P3 · 🟢 — formaliser la chaîne 9 salles ci-dessus en data : `dungeon.rooms[]` (type + index), **PV/loot par type de salle**, contenu du coffre (salle 5), effet de repos (salles 3/8), boss (salle 9 — loot exclusif) ; règle : salle N+1 débloquée à la résolution de N. **Débloque D01/D03/D06/DUNREV01.**
- [ ] **DUN-MODEL01 — Modèle de données « donjon à salles »** · M · P3 · 🟢 — `dungeon = { mapId, rooms: [{ index, type:'combat'|'rest'|'treasure'|'boss', cleared }], currentRoom }` + migration save ; remplace le donjon « one-shot » actuel. Dépend D01-SPEC.
- [ ] **D01 — Flux donjon complet** · L · P3 · 🟢 — implémente la chaîne **9 salles** (Combat 1/2/4/6/7 · Repos 3/8 · Trésor 5 · Boss 9), salle N+1 ouverte à la résolution de N, idle interdit. ✅ **Ready** : structure décidée (Archive §v1.4) ; **séquencé après D01-SPEC + DUN-MODEL01**.
- [ ] **D03 — Carte de donjon** · M · P3 · 🟢 — carte des 9 salles (nodes par type, chemin, salle courante) — après D01. ✅ **Ready** (rendu de base ; le rendu graphique riche = DUN-ART01).
- [ ] **DUN-ART01 — Carte graphique du donjon (9 salles)** · M · P3 · 🟡 — rendu **graphique** de la chaîne de salles (≠ simples formes géométriques) : salle courante en évidence, salles franchies / à venir, icône par type. Affine **D03**. 🎨 **Bloqueur = asset** (fond de donjon + icônes de salle à générer — **prompts prêts : `docs/ASSET_PROMPTS.md §12`** : `crypt_map` + 4 médaillons `room_*`) ; câblage spec'd, prêt dès l'asset dispo. *(À déposer dans `public/` — désormais committé + servi par Vercel depuis DEPLOY01.)*
- [ ] **D06 — Donjon spawn la nuit suivante** · M · P3 · 🟢 — cycle sommeil → respawn + position aléatoire + marker "?" (CAL01 ✓, MAP01 ✓). ✅ **Ready** : après le flux donjon.
- [ ] **DUNREV01 — Revue complète du système de donjon (umbrella)** · L · P3 · 🟢 — **= chapeau de l'épique v1.41** (D01-SPEC → DUN-MODEL01 → D01 → D03 → DUN-ART01 → D06). Pas de travail séparé : se clôt quand les tickets de l'épique sont faits. ✅ **Ready** (suivi).

### v1.42 — Équipement & Craft
> ⟶ ordre interne : RES/TIER → craft/métiers → équip/sets/slots

- [x] **RES01 — Modèle de données ressource** · S · P3 · 🟢 — `{id, name, rarityTier, dropRate, sources[], uses[]}`.
- [x] **RES02 — Drops commun + rare par monstre** · M · P3 · 🟢 — 1 commune (collecte) + 1 rare par monstre (~32 ressources) ; **taux rares = tier-based** (cf. RES-TIER01).
- [x] **RES03 — Câblage ressources → recettes** · M · P3 · 🟢 — inputs alchimie / forge / cuir / bijou.
- [x] **RES04 — Ressources « junk » vendeur** · XS · P3 · 🟢 — `rotting_hide`, `grave_stone`, `goblin_trinket` : valeur de revente seule.
- [x] **RES-G1 — Bande commune + scaling** · S · P3 · 🟢 — ✅ **DÉCIDÉ** : commune **40-65%**, **pas de scaling** par zone/run (simple) ; rares déjà tier-based (RES-TIER01).
- [x] **RES-G2 — Audit recettes existantes** · S · P3 · 🟢 — ✅ **Ready** : vérifier la cohérence des ids (ex. CRF06 antidote ↔ `venom_gland`) ; test d'intégrité. ⟶ STA03, recipes, QA01.
- [x] **TIER01 — Champ `tier` (T1/T2/T3)** · S · P3 · 🟢 — classer les 3 monstres normaux de chaque zone par puissance.
- [x] **RES-TIER01 — Item rare de craft tier-based** · S · P3 · 🟢 — input de recettes, **distinct de l'équipement** : T2 @15%, T3 @7.5% (T1 aucun).
- [x] **DROP-FIX01 — Réaligner les tables de drop (ressources thématiques, solution B)** · S/M · P3 · 🟢 — créer `hare_pelt`/`boar_tusk`/`fox_pelt`/`beast_hide`, corriger Hare/Boar/Fox/Thunderhoof, skill drop pour Hare+Fox, + **usages** (recettes LEAT/COOK). ✅ **Ready** : séquencé après RES03 (usages). Recoupe QA01.
- [ ] **CRAFT-GRADE01 — Grades de craft par métier** · M · P3 · 🟢 — progression par profession débloquant ses recettes. *(remplace l'idée de « niveau » global `CRAFT-LVL01`, jamais entré dans TASKS.md.)*
- [x] **CRAFT-KNOWN01 — Recettes connues vs à découvrir** · S · P3 · 🟢 — connues = débloquées par grade/livre ; découvrables = assemblage libre.
- [x] **CRAFT-MULTI01 — Plusieurs recettes → même objet** · M · P3 · 🟢 — `itemId` cible + N combinaisons valides.
- [x] **CRAFT-RARITY01 — Recette → taux de rareté** · S · P3 · 🟢 — chaque combinaison porte sa table de qualité.
- [ ] **CRAFT-TOOL01 — Outils de craft par métier** · M · P3 · 🟢 — équipables, +taux de succès **et** +chance de rareté, spécifiques à la profession.
- [ ] **CRAFT-LOC01 — Plafond de rareté par lieu** · M · P3 · 🟢 — forgeron **village** (Greywatch/Millhaven) → normal+rare ; **ville** (Ironhaven) → normal→épique ; sup. + recettes via quête. ⟶ PROG02, LEAT01. ⚠️ **conflit Z06** (cf. CRAFT-LOC-G1).
- [ ] **CRAFT-LOC-G1 — Exception maître forgeron** · S · P3 · 🟢 — ✅ **DÉCIDÉ** : **Z06** (maître forgeron, spawn village) = **exception assumée** au plafond village (CRAFT-LOC01) — sa présence **relève le plafond local** (rare→épique) ; l'axe **grade** reste indépendant. ⟶ CRAFT-LOC01, Z06.
- [ ] **CRAFT-QUEST01 — Quêtes de craft** · S · P3 · 🟢 — récompensent des outils (et/ou Concentration).
- [ ] **CRAFTMG01 — Mini-jeux dédiés par métier de craft (umbrella)** · M · P3 · 🟢 — *retour playtest 2026-06-07.* ✅ **DÉCIDÉ** : 1 mini-jeu/métier — forge=frappe rythmée, alchimie=jauge (existant), cuisine=timing/feu, cordonnier=précision, bijou=alignement ; **mapping métier→mini-jeu** ; score → qualité via Concentration (STA03). ✅ **Design forge VALIDÉ (proto jouable v2, 2026-07-12)** : primitive « point brillant + anneau de timing » ; silhouette & chemin de frappe **par pièce** ; sortie = ±1 cran (CRAFT-G3). **Découpé** → CRAFTMG-ENGINE01 / CRAFTMG-FORGE01 / CRAFTMG-SHAPE01 / CRAFTMG-AUTO01. Variantes cordonnier/bijou/cuisine = tickets ultérieurs.
- [ ] **CRAFTMG-ENGINE01 — Moteur `MiniGame` partagé (composant + logique pure)** · M · P3 · 🟢 — primitive « point + anneau de timing » : composant React (`useRef` canvas + boucle rAF, calqué sur le proto) + **logique pure testable** (spawn / classement Parfait-Bien-Mou-Raté / score). Entrées = Concentration (élargit les fenêtres, STA03) + grade de métier (resserre, +gain parfait) + plafond de lieu (CRAFT-LOC01). **Sortie = ±1 cran borné** injecté dans `resolveHybridCraftOutcome` (CRAFT-G3), pas la rareté entière. Expose un hook `autoResolve`. Réutilisable par tous les métiers. ⟶ CRAFT-G3, CRAFTMG-FORGE01.
- [ ] **CRAFTMG-FORGE01 — Variante forge (chaleur + frappe)** · M · P3 · 🟢 — barre de **chaleur** qui refroidit (jaune→rouge→gris) = fenêtre de jeu ; frappe le point au bon endroit/rythme ; branchée dans les panneaux **Blacksmith/MasterSmith** (SafeZone) à la place de l'appel direct à `resolveHybridCraftOutcome`. Rendu Canvas ~ tel quel depuis le proto. ⟶ CRAFTMG-ENGINE01, CRAFTMG-SHAPE01.
- [ ] **CRAFTMG-SHAPE01 — Silhouette & chemin de frappe par équipement (`forgeShape`)** · S · P3 · 🟢 — table data `forgeShape` par **catégorie/pièce** (arme/bouclier/heaume/cuirasse/gantelets/grèves…) = une silhouette `draw()` + une fonction `spot()` échantillonnant le chemin (linéaire=épée, arc=heaume, rivets=bouclier) → le mini-jeu **varie selon l'équipement crafté**. *Option* : rendre le **sprite `no_bg` (ART-EQUIP01) teinté par la chaleur** au lieu de la silhouette dessinée. ⟶ CRAFTMG-FORGE01, ART-EQUIP01, EQUIPMENT_TEMPLATES.
- [ ] **CRAFTMG-AUTO01 — Auto-forge basé sur l'historique de la pièce** · M · P3 · 🟢 — *demande 2026-07-12.* l'**Auto-forge** (idle / accessibilité) ne donne plus un résultat plat mais dérive du **skill démontré** sur CETTE pièce : persister `meta.craftSkill[itemId]` = { plays, réussite moyenne } mis à jour à chaque mini-jeu **manuel** ; l'auto-forge calcule son ±cran depuis cet historique (plus de parties + meilleure réussite → meilleur auto). + **migration save**. ⟶ CRAFTMG-ENGINE01, A11Y01.
- [ ] **CRAFT-DISC01 — Craft expérimental (découverte)** · M · P3 · 🟢 — assembler librement des ingrédients hors recette connue. ✅ **Ready** : après CRAFT-KNOWN01 ; mécanique = CRAFT-G2.
- [x] **CRAFT-G2 — Mécanique de découverte** · S · P3 · 🟢 — ✅ **DÉCIDÉ** : N slots libres ; succès → **recette apprise** ; échec → **perte de 50%** des ingrédients ; indices via livres/grade. ⟶ CRAFT-DISC01, CRAFTMG01.
- [x] **CRAFT-G3 — Pondération qualité** · S · P3 · 🟢 — ✅ **DÉCIDÉ** : rareté = base recette × (1 + Concentration/150) × bonus outil, **bornée par le plafond du lieu** (CRAFT-LOC01) ; score mini-jeu = ±1 cran. ⟶ STA03.
- [ ] **LEAT01 — Séparer forge (métal) et cordonnier (cuir)** · M · P3 · 🟢 — *retour playtest 2026-06-07.* **DÉCIDÉ : séparer les équipements métal et cuir.** La **forge** ne traite que le **métal** ; un **cordonnier/maroquinier** traite le **cuir** (bottes, armures légères, gants…). **À cadrer** : tag `material:'metal'|'leather'` sur `EQUIPMENT_TEMPLATES`, répartition des recettes par bâtiment, nouveau bâtiment/NPC cordonnier (BLD_POS/NPCS/BUILDING_INFO). Lien Z07/Z03.
- [ ] **BIJOU01 — Métier bijoutier** · M · P3 · 🟢 — 5ᵉ profession (bagues/amulettes), alimente les nouveaux slots ; pattern LEAT01.
- [ ] **BIJOU-BLD01 — Bâtiment + NPC bijoutier** · M · P3 · 🟢 — BLD_POS / NPCS / BUILDING_INFO ; prérequis de BIJOU01.
- [ ] **COOK01 — Métier de cuisine** · M · P3 · 🟢 — *retour playtest 2026-06-07.* Craft de cuisine : recettes de plats → **consommables/buffs** (≠ équipement). ✅ **DÉCIDÉ** : bâtiment + NPC cuisine ; plats = **buffs temporaires** (ATK/vigueur/regen) ; ingrédients = viandes/herbes (drops) ; intègre `recipes.js`/`resources.js`. Lien CRAFTMG01, LEAT01.
- [x] **SLOT01 — Étendre `equipped` 6 → 9 slots** · M · P3 · 🟢 — + amulette/2 bagues/arme secondaire + **migration save** ; armes : 2M = 2 slots ; 1M + (bouclier OU 2ᵉ arme OU vide). *(synergies arme↔skill plus tard.)*
- [x] **SLOT02 — Onglet « Équipement » dans l'inventaire** · S · P3 · 🟢 — étendre la grille Equipped de UI07 (plutôt que surcharger le HeroSheet UI06).
- [x] **EQP01 — Bonus de set d'équipement** · M · P3 · 🟢 — **DÉCIDÉ : système technique seul** (`equipment.set` + `getSetBonus`, sets de 3 à 6 pièces) ; contenu des sets plus tard. **→ contenu fourni par SET-CONTENT01 + modèle de bonus par SET-G1** (backlog design 2026-06-08 ; étendre 6→9 pièces, cf. SLOT01).
- [x] **SET-CONTENT01 — Contenu des sets** · M · P3 · 🟢 — sets de zone (3 normaux + arme élite = 4 pièces) **+ sets au max de slots** (jusqu'à 9) en haut-level ou craftables ; renseigne `equipment.set`. ⟶ **EQP01** (système technique existant).
- [x] **SET-G1 — Modèle de bonus de set** · S · P3 · 🟢 — bonus = **% du stat fourni par les pièces** : 2→+5%, 3→+12-14%, 4→+20% (étendre 5→9) ; 1-3 stats/set ; chaque pièce = stat fixe (ex. 5-9 STR). ⟶ EQP01.
- [x] **SET-UI01 — Affichage des bonus de set actifs** · S · P3 · 🟢 — pièces 2/3/4… + bonus appliqués (HeroSheet / onglet Équipement).
- [ ] **EQDROP01b — Drops d'équipement tier-based** · M · P3 · 🟢 — pièce de set : **T1 @15% · T2 @7.5% · T3 @3% · élite @10%** ; l'élite droppe l'**arme signature = 4ᵉ pièce de set**. ✅ **taux validés (2026-07-12, TC)** — modifie les taux de drop d'équipement, assumé.
- [ ] **EQDROP-G1 — Pool d'équipement** · S · P3 · 🟢 — ✅ **DÉCIDÉ** : pool par **zone × tier × rareté**, lié EQUIPMENT_TEMPLATES + Z07.
- [ ] **ENCH01 — Renforcement +N** · M · P4 · 🟢 — améliorer une pièce par paliers via matériaux, plafond selon rareté.
- [ ] **ENCH02 — Risque d'échec** · M · P4 · 🟢 — ✅ **DÉCIDÉ** : échec = **pas d'amélioration** (sans perte) aux paliers bas ; **rétrogradation** possible aux paliers hauts, **atténuée par pierres de protection**. ⟶ ENCH01.
- [ ] **SOCKET01 — Sertir des mana stones** · M · P4 · 🟢 — emplacements sur l'équipement, bonus stat/élémentaire ; réutilise l'inventaire de pierres.
- [ ] **UX-COMPARE-EXT01 — Comparaison équipement étendue** · S · P3 · 🟢 — étendre UX02 (6 slots) aux nouveaux slots (bagues/amulette).

### v1.43 — Maîtres & mentors
> Système de **maître** (mentor) : on s'engage auprès d'un maître via une **quête d'initiation** ; l'engagement est **permanent** ; **seul le maître engagé** donne des quêtes à **récompense skill**. Plusieurs maîtres à focus distinct (martial / arcane / feu / glace / berserker), dont des **itinérants**. Étend `masterQuests.js`/ACA04 + NPC05. ⟶ v1.31 (relocalisation Aldric + rework des rewards), v1.32 (skills).

- [x] **MST01 — Modèle de données « maître » + engagement** · M · P3 · 🟡 — `MASTERS` (id, name, title, `location` ou `itinerant:true`, `focus` martial/arcane/feu/glace/berserker…, `initiationQuestId`, `skillQuestPool[]`) + état d'engagement du héros (`masterId`, **immuable** une fois posé) + **migration save**. Portée run/méta = **MST-G1**. ⟶ MST02, masterQuests.js.
- [x] **MST02 — Quête d'initiation + verrou d'engagement** · M · P3 · 🟡 — chaque maître porte une **quête d'initiation** ; la valider **engage définitivement** le héros (`setMaster`, non modifiable). Tant qu'aucune initiation validée : les quêtes de maître restent **verrouillées**. Forme du verrou (engagement forcé au maître de départ vs choix libre, 1ʳᵉ initiation = lock) = **MST-G1**. ⟶ MST01, ONBOARD01.
- [x] **MST03 — Skills en récompense = exclusifs au maître** · M · P3 · 🟡 — **retirer les `reward.skill` des quêtes non-maître** (`first_blood`→counter_strike, `clear_the_marsh`→cleave, `silence_the_crypt`→soul_crush, `nc_graven_elite`→power_strike, etc.) et les **rerouter** via les quêtes du maître ; **rebalance** des récompenses libérées (gold/ressources/tokens). ⟶ QSV2-ADJ-AUDIT01, REP-REBAL01, BAL-CSV01, quests.js.
- [x] **MST04 — UI maître (panneau + gating)** · S · P3 · 🟡 — état « pas de maître / maître = X » ; quêtes de maître grisées + tooltip tant que non initié ; un seul maître engagé visible. Réutilise le pattern feedback verrouillé (BLDUNL05). ⟶ MST02.
- [x] **MST05 — Sir Aldric → Greywatch, maître martial** · S · P3 · 🟢 — relocaliser `sir_aldric` à **Greywatch** (vient de QSV2-ADJ-AUDIT01) ; **nouveau titre** (MST-G2) ; rôle = **maître martial** (épée/garde), porteur de la **quête d'initiation de départ**. ⟶ QSV2-ADJ-AUDIT01, MST01, MST02, MST-G2.
- [x] **MST06 — Maître mage à Millhaven** · S · P3 · 🟡 — « Ancien mage de la cour royale » ; focus **arcane** ; PNJ + quête d'initiation + pool de skills. ⟶ MST01, MST09.
- [x] **MST07 — 2 maîtres à Ironhaven** · S/M · P3 · 🟡 — 2 maîtres en ville (focus à définir) + initiations + pools. **Décision** : l'un = l'**Académie** (`academy_master`/Archmagister Vael, ACA04) recyclé, ou 2 maîtres distincts de l'Académie ? (cf. MST-G3). ⟶ ACA04, MST01, MST09.
- [x] **MST08 — Maîtres itinérants (feu / glace / berserker)** · M · P3 · 🟡 — maîtres **de passage** à focus marqué (**magie de feu**, **magie de glace**, **berserker** ; extensible) ; apparition aléatoire (Guilde / route / événement) ; initiation possible si non encore engagé. **Fusionne/étend NPC05.** ⚠️ focus **glace bloqué contenu** tant que SKD-ICE01 n'est pas fait (pool vide). ⟶ NPC05, EVT01, MST01, SKD-ICE01.
- [x] **SKD-ICE01 — Créer des skills de glace (élément `ice`)** · S · P3 · 🟢 — *remonté à l'intégration v1.43, 2026-07-04.* Aucun skill d'élément `ice` dans `skills.js` (Soul Chill est physique) → `MASTER_SKILL_POOLS.glace` est vide et un **maître de glace (MST08) ne peut donner aucune récompense de skill**. Créer ≥3 skills magiques de glace (ex. éclat/blizzard/gel + statut Frozen/slow) cohérents avec le typage `magic:ice` (via `getSkillDropType`), puis remplir le pool `glace`. **Prérequis de MST08.** ⟶ MST08, MST09, skills.js, SKD-E1.
- [x] **MST09 — Pools de skills par discipline** · M · P3 · 🟡 — table de skills-récompense par focus (martial / arcane / feu / glace / berserker…) puisée dans les 44 skills, cohérence physical/magic (SKD). ⟶ SKD-E1, skills.js.
- [x] **MST-G1 — Modèle d'engagement (fork central)** · XS · P3 · 🟡 — trancher : **(a)** engagement **forcé** au maître de départ (Aldric) via la 1ʳᵉ quête, ou **(b)** **choix libre** parmi tous les maîtres, la 1ʳᵉ initiation faisant verrou ? + **portée** : lié au **run** (re-choix à chaque transmigration) ou **méta** (à vie) ? Détermine MST01/02/05/08.
- [x] **MST-G2 — Titre de Sir Aldric** · XS · P3 · 🟡 — choisir : « Chevalier déchu » / « Chevalier retraité » / « Membre d'honneur du Royal Knighthood ». ⟶ MST05.
- [x] **MST-G3 — Articulation Maîtres ↔ Académie** · XS · P3 · 🟡 — l'**Académie** (ACA01-06) **vend/monte** des skills contre or ; les **maîtres** donnent des skills **via quêtes** (exclusif). Confirmer la coexistence sans doublon + sort de `academy_master`/Vael (maître d'Ironhaven ou PNJ Académie distinct ?). ⟶ ACA01-06, MST07.

### ⚔ COMBAT-ATB — Sablier de Guerre + Frappes du Destin (v1.44)
> **Créée 2026-07-19** (review C01-C02) — supersède **B06** (ATB, ex-v2). Directions actées : **ATB à timeline visible** (type FFX/CTB — l'AGI se lit : héros lent = 2 portraits ennemis consécutifs dans la file) + **QTE 1-input** (type Mario RPG/Sea of Stars, grammaire déjà établie par forge/alchimie). Recherche complète : `reviews/rapport-2026-07-19.md` §6. **Garde-fous actés** : mode Attente par défaut (temps figé au tour du héros ; temps réel = auto uniquement) ; jamais de QTE sur l'attaque de base, 1 input max par skill ; tout contenu finissable à 0 % de timings réussis ; fenêtre de timing = stat d'équipement (type Shadow Hearts) ; manuel ≈ +25-40 % max vs idle (simuler les 2 modes au balance-check) ; tick déterministe simulable en idle (file d'événements, pas d'horloge). Chaque cran est shippable seul.

- [x] **PROTO-INT01 — Prototype jetable « Intentions & Ripostes » + aperçu timeline** · S · P3 · ✅ — **FAIT + VERDICT RENDU 2026-07-19** : maquette interactive livrée (artifact, hors codebase) et jouée par Adrian. **Verdict** : timeline + intents chiffrés = ✅ validés avec conditions (→ CMB-INT01) ; Garde = ✅ intéressante ; coûts d'action à quantifier proprement (→ CMB-COST01) ; présentation graphique à retravailler (→ CMB-DIR01).
- [ ] **CMB-ATB01 — Moteur de jauges ATB + ranks d'action** · M · P3 · 🟢 — jauges par entité (héros + ennemis) remplies selon AGI, tick logique déterministe ; chaque action porte un **rank** (coût en tempo : attaque rapide = prochain tour tôt, gros skill = repoussé) ; remplace le `calcTurnOrder` actuel dans le moteur pur (`engine/combat.js`), testable sans UI. AC : ordre de tours dérivé des vitesses ; slow/frozen mappés sur la vitesse/gel de jauge ; tests moteur.
- [ ] **CMB-ATB02 — Timeline visible (bandeau 5-7 portraits)** · M · P3 · 🟢 — bandeau des prochains tours au-dessus de l'arène, recalculé en direct ; en manuel, la prévision se met à jour **avant validation** de l'action ; l'enrage de boss accélère visiblement sa jauge. C'est le cran qui rend l'AGI stratégique. AC : héros lent → 2 portraits ennemis consécutifs visibles ; le choix d'un skill lourd décale la file à l'écran ; tests de rendu. ⟶ CMB-ATB01.
- [ ] **CMB-QTE01 — Timing bars sur les skills (1 input)** · M · P3 · 🟢 — widget de timing partagé extrait/réutilisé du moteur mini-jeu forge (**CRAFTMG-ENGINE01**, v1.42 — même primitive) ; réussi = +30-40 % dégâts / statut garanti ; raté ou idle = effet normal ; fenêtre élargie par équipement/bénédictions (stat de build). Jamais sur l'attaque de base. AC : bonus appliqué via multiplicateur passé à `calcSkillDamage` ; option « timing auto-réussi » (accessibilité) ; tests. ⟶ CRAFTMG-ENGINE01, CMB-ATB01.
- [ ] **CMB-INT01 — Intents chiffrés (avec RNG, crits jamais télégraphiés)** · S · P3 · 🟢 — ✅ **VALIDÉ POST-PROTO (2026-07-19) avec 2 conditions de design** : (a) **RNG affiché en fourchette** — l'intent annonce « ⚔ 6-9 », le jet réel se fait au moment du coup (pas de valeur exacte télégraphiée) ; (b) **les coups critiques ne sont JAMAIS annoncés** — un coup affiché 6-9 peut critiquer (×2) et tuer : assumé, ça fait partie du jeu. L'ennemi affiche son prochain coup au-dessus de sa carte + dans la timeline ; l'IA décide un tour en avance (déplacement d'appel — l'auto l'ignore). AC : chaque ennemi télégraphie en fourchette ; crit jamais signalé (ni couleur ni icône) ; patterns data (2-3 comportements/monstre). ⟶ CMB-ATB02, CMB-COST01, monsters.js.
- [ ] **CMB-COST01 — Grille de coûts d'action (préparation vs immédiat, en tours & AGI)** · S · P3 · 🟡 — *demande 2026-07-19 (retour proto).* **Quantifier CHAQUE action** du combat dans une table data unique `ACTION_COSTS` : (a) **type** — `immédiate` (résolue au tour, ex. attaque rapide, Garde) vs `préparation` (occupe N tics de timeline avant résolution, visible dans le bandeau — ex. frappe lourde, gros sorts, skills de zone) ; (b) **coût en tempo** — rank multiplicateur du délai de re-jeu (rapide 0.7 · normal 1.0 · lourd 1.5-2.0) ; (c) **seuils d'AGI** — combien d'AGI il faut pour « doubler » un ennemi de vitesse X (formule délai = K/AGI à caler), et l'AGI minimum pour ne jamais subir 2 tours consécutifs d'un monstre de son niveau. Livrable : table chiffrée par action existante (attaque, chaque catégorie de skill, Garde, objets, fuite) + formule documentée dans DESIGN.md ; **chiffrage à valider ensemble** (Excel/BAL-CSV01) avant câblage dans CMB-ATB01. **Hors scope** : l'implémentation moteur (CMB-ATB01) et l'UI (CMB-ATB02). AC : chaque action du jeu a un type + un rank + une justification ; la formule AGI→tours est vérifiable par 3 exemples chiffrés ; validée en review. ⟶ CMB-ATB01, CMB-INT01, BAL-CSV01.
- [ ] **CMB-DIR01 — Direction artistique & présentation du combat (maquettes avant code)** · S/M · P3 · 🟡 — *demande 2026-07-19 : le combat actuel « pas glamour, pas assez stratégique » visuellement.* Passe de design AVANT toute implémentation ATB, en 3 temps : (1) **recherche de références** (Claude) — analyse visuelle des meilleurs combats 2D tour par tour (Slay the Spire, Sea of Stars, Octopath, Darkest Dungeon II, Chained Echoes…) : composition de l'arène, lisibilité timeline/intents, feedback des coups ; (2) **exemples d'Adrian** — captures/jeux qu'il aime, versées au moodboard ; (3) **maquettes itératives en artifacts** (pattern wm-ratio-previews / proto forge : on tranche sur du visible) → **livrable = maquette cible validée** de l'écran de combat (arène + timeline + intents + actions), déclinable ensuite en tickets d'implémentation + prompts assets Gemini (fonds d'arène, cadres, VFX — manifeste asset_forge). **Hors scope** : tout code de jeu ; les sprites de monstres (CONT01). Contrainte : rester cohérent avec l'identité « takeover sombre + Cinzel + or » actée en UI09, ou la faire évoluer explicitement. AC : ≥2 directions proposées, 1 validée par Adrian, maquette cible annotée archivée dans docs/. ⟶ CMB-ATB02, UI09, asset_forge, ART-EQUIP01.
- [ ] **CMB-BREAK01 — Bouclier / break solo** · M · P3 · 🟢 — points de bouclier + 1-2 faiblesses affichées par ennemi ; frapper la faiblesse réduit ; à 0 → **Break** : l'ennemi saute son prochain tour **dans la timeline** + prend +50 % dégâts. Le bouclier ne décroît jamais tout seul (anti-idle par construction). AC : break visible dans la file ; l'idle breake « par accident » ; tests. ⟶ CMB-ATB02, CMB-INT01.
- [ ] **CMB-FOCUS01 — Garde qui banque (Focus)** · S/M · P3 · 🟢 — action « Garde » : −50 % dégâts subis + 1 point de **Focus** (max 3), dépensable pour amplifier un skill (×1-×3). Pas de dette négative (Bravely allégé). AC : boucle « il télégraphie → Garde → il est breaké → décharge ×3 » jouable ; l'IA idle utilise la Garde sur un preset simple ; tests. ⟶ CMB-BREAK01.
- *(v2, hors épique : cancel de fenêtre de cast type Grandia sur élites/boss ; turn bonuses de case type Trails.)*

### v1.51 — Monde & carte
> **▼ RECULÉE (2026-07-06)** — assets bâtiments en préparation (déblocages BLDUNL + carte WMAP06) ; replanifiée après Idle. Cf. table « Plan de release ».
> ⟶ MONLV01 ⟶ BAL-CSV01 (v1.34)

- [ ] **MONLV01 — Système de niveau des monstres** · M/L · P3 · 🟢 — *retour playtest 2026-06-07/08.* **✅ DÉCIDÉ (2026-06-08)** — formule complète ci-dessous, reste = câbler `zones.js`/combat + afficher la range :
  - **Niveau** : `lvl_monster = random_int( max(start, hero−3), max( min(hero, end), start ) )` — bande ~4 niveaux **près du héros** ; le `max(…, start)` gère l'**edge case héros < start** (range non inversée).
  - **Stats** : `base_stats × 1.25^(lvl_monster − start)` (**+25 %/niveau**). `start`/`end` dérivés du `levelRange` du **spot**.
  - **Run-scaling** : **conservé** mais **`1.08 → 1.03`** (power creep méta plus doux). *(À noter : `zoneMult` × niveau peuvent se recouper — à surveiller au playtest.)*
  - **Récompenses exp/gold ET taux de drop scalés avec le niveau** — facteurs **dans BAL-CSV01** (proposition à valider : exp/gold `×1.25^Δ` ; drop `+X%`/niveau ou meilleure rareté).
  - **Affichage** : **montrer la RANGE** de niveau (ex. « Lv 2-5 ») sur la **carte de spot + bestiaire** (aléa visible pour le joueur) ; le **niveau réel** affiché **en combat**.
  - Ouvert : bonus élite (niveau ou mult. supérieur). Lien `zones.js` (`scaleMonsterStats`/`getMonsterLevel`) + combat + **BAL-CSV01** + **ZV-CARDS01** (emplacement du niveau sur la carte).
- [ ] **WMAP06 — Asset Map 1** · M · P3 · 🟢 — génération Nano Banana (prompt cartographie parchemin, réf `eldenmoor.png`) + chemins tracés.
- [ ] **WMAP08 — Recalibrage `POS`** · S · P3 · 🟢 — coordonnées % des nodes sur les 2 illustrations.
- [ ] **WMAP-G1 — Re-leveling Barrow Hills** · XS · P3 · 🟢 — ✅ **DÉCIDÉ** : Barrow Hills passe **mid-game** (stats inchangées) ; ressenti à valider au playtest (BAL). ⟶ WMAP02.
- [ ] **WMAP-G2 — Bestiaire Thornmarsh Lv 20-30** · XS · P3 · 🟢 — ✅ **Ready** : vérifier la formule de scaling sur la range Lv 20-30 (test). ⟶ MONLV01.
- [ ] **WMAP-G3 — Nommage assets** · XS · P3 · 🟢 — ✅ **DÉCIDÉ** : `eldenmoor_map1.png` / `draconic_frontier_map2.png`.
- [~] **BLDUNL02 — Déblocage progressif des bâtiments** · M · P2 · 🟢 — modèle + plumbing + feedback livrés (BLDUNL01/05) ; deps MQ-CHAIN01/START01 **livrées** ✓. ✅ **DÉCIDÉ** : au départ Greywatch, **auberge + marchand ouverts** ; **forge/alchimie** via quête forgeron/alchimiste (BQ-GW1/2) ; **académie + guilde** via arrivée en ville (BLDUNL03/04). Reste = câbler `unlockBuilding(id)` aux triggers (data `trigger:'elder_dialogue'|'master_quest'`). ⟶ MQ-CHAIN01, START01.
- [~] **BLDUNL03 — Académie via quête** · S · P2 · 🟢 — ✅ **DÉCIDÉ** : académie **verrouillée jusqu'à l'arrivée en ville** (déblocage via BQ-IH1 ; `trigger:'arrival_city'`, `unlockBuilding('academy')`). Câblage prêt. ⟶ BLDUNL02.
- [~] **BLDUNL04 — Guilde via quête** · S · P2 · 🟢 — ✅ **DÉCIDÉ** : Guilde **verrouillée jusqu'à l'arrivée en ville** (déblocage via BQ-IH2 ; `unlockBuilding('guild')`). Idem BLDUNL03. ⟶ GLD01, BLDUNL02.
- [ ] **ZADV01 — Design de la zone avancée (Grimspire) + bestiaire** · L · P3 · 🟢 — *retour playtest 2026-06-07.* Design **complet de Grimspire** : **spots de chasse**, **monstres dédiés** (façon MON01), niveaux, loot, ambiance. ✅ **Ready** : livrable = **doc de design** dans `DESIGN.md` (tâche de spec, codable). ⚠️ Grimspire = Map 2 (gelée) → spec maintenant, implé après dégel. Lien MON01.
- [ ] **ZONE-NAMING01 — Nettoyage des ids de zone** · S · P3 · 🟢 — cohérence `crumbled_ruins` / `draconic_supra_metal_rock` après restructuration ; pas de référence morte.

### v1.52 — Divin
> **▲ AVANCÉE (2026-07-06)** — prochain lot de contenu après le craft (aucun bloqueur asset). Cf. table « Plan de release ».
> ⟶ DVQ01 ⟶ ALT01 (même épique)

- [ ] **DV05 — Aura divine visuelle** · S · P3 · 🟢 — border colorée sur HeroCard selon divinité active. ✅ **Ready** : couleur par dieu (`deities.js`), CSS.
- [ ] **ALT01 — Autels des dieux + relations divines** · M · P3 · 🟢 — *retour playtest 2026-06-07.* Un **autel par dieu** dans l'église ; **offrandes/prières** ↑ une **jauge de faveur** par dieu (au-delà de `divineBonds`). ✅ **DÉCIDÉ** : données `divineFavor:{deityId:score}` ; offrandes (gold/ressources/tokens) ↑ faveur ; effets = **paliers de bénédiction** + accès skills divins. Lien DV03/DV04/`deities.js`.
- [ ] **DVQ01 — Quêtes divines à l'église** · M · P3 · 🟢 — *retour playtest 2026-06-07.* L'église propose des **quêtes liées aux dieux** (≠ « œuvres de dévotion » CHQ01) ; récompenses = **faveur divine**. ✅ **DÉCIDÉ** : pool par dieu, récompenses faveur (ALT01) + tokens, conditions par dieu. **Après ALT01.** Dépend CHQ01/Q09.
- [ ] **DV11 — Relations inter-divines −10/+10** · L · P3 · 🟢 — matrice symétrique `DIVINE_RELATIONS[idA][idB]` ; les actions du joueur font bouger les scores. ✅ **Ready** : spec claire.
- [ ] **DV12 — Oracle divin (boutique)** · S · P3 · 🟢 — révèle le score de relation pour le prochain univers (8 tokens) — après DV11. ✅ **Ready**.

### VOW — Vœux divins de run (v1.53)
> **Validée 2026-07-19** (review D02). Serment en début de run (Divine Call ou autel) : « je ne fuirai jamais », « aucun achat marchand », « Malachar avant J15 »… Tenu jusqu'à la mort → prime tokens/faveur ; rompu → léger malus de relation divine. Le vœu = **contrainte passive** (≠ objectif actif DVQ01). Alimente REP-REBAL01 (sources de tokens).

- [ ] **VOW01 — Data vœux + conditions trackées** · S · P3 · 🟢 — table de vœux (id, condition, prime, malus) ; chaque vœu = un hook sur un compteur existant (fuites, achats, dayCount…). AC : ≥5 vœux, tracking fiable, tests.
- [ ] **VOW02 — UI serment + suivi** · S · P3 · 🟢 — proposition au Divine Call/autel ; vœu actif affiché en sidebar (état tenu/rompu). ⟶ ALT01.
- [ ] **VOW03 — Résolution à la mort** · S · P3 · 🟢 — au PostMortem : tenu = prime (tokens/faveur), rompu = malus divineBonds ; affiché dans le résumé de run. + tests. ⟶ VOW01.

### PACT — Pactes de transmigration à double tranchant (v1.54)
> **Validée 2026-07-19** (review D01). Au PostMortem, le dieu passeur propose d'hériter **plus** (2ᵉ stat, une pièce d'équipement, un stock de ressources) contre une **malédiction d'âme** au run suivant (80 % HP max, vigueur qui décroît plus vite, prix +20 %…). Négocier son héritage au lieu de le subir. ⚠️ Articulation **META02** à acter avant dev : PACT = *payer* plus, META02 = *acheter* plus.

- [ ] **PACT01 — Data des pactes** · S · P3 · 🟢 — offre + malédiction + poids de tirage ; malédictions = variante « durée du run » du système de debuffs CRF01. AC : ≥4 pactes équilibrables via BAL-CSV01.
- [ ] **PACT02 — UI PostMortem (3ᵉ volet « Pactes »)** · S · P3 · 🟢 — proposition après le choix d'héritage standard ; refus toujours possible. ⟶ T05.
- [ ] **PACT03 — Application au run suivant** · M · P3 · 🟢 — la malédiction s'applique à la renaissance (applyTransmigration) + migration save + tests (dont « refus = aucun effet »).
- [ ] **PACT-G1 — Cumul** · XS · P3 · 🟡 — trancher : 1 pacte max par transmigration (reco) ou cumulables ?

### NEM — Némésis : le monde se souvient de tes morts (v1.55)
> **Validée 2026-07-19** (review D03). Le monstre qui te tue réapparaît au run suivant dans son spot en **élite nommée** (« Vieux-Croc, Tueur de <héros> », +niveaux, aura) ; le tuer rend une part de ce qu'il avait pris (tokens bonus) + titre « Vengeance ». **1 némésis actif max**, généré depuis `lastRunSummary.causeOfDeath` ; expire après 2 runs.

- [ ] **NEM01 — Capture + génération** · M · P3 · 🟢 — capture de la cause de mort (gérer morts hors-combat : pas de némésis) → buildEnemy élite nommé (nommage procédural simple : épithète + « Tueur de <nom> »). AC : 1 seul actif ; scaling élite ; tests.
- [ ] **NEM02 — Rendu** · S · P3 · 🟢 — badge sur la carte de spot + carte de combat nommée avec aura. ⟶ ZoneView, EnemyCard.
- [ ] **NEM03 — Récompenses + expiration** · S · P3 · 🟢 — tokens bonus + titre « Vengeance » (M01) ; expiration après 2 runs sans kill ; tests. ⟶ titles.js.

### ECHO — Échos du prédécesseur : ta tombe, ton fantôme (v1.56)
> **Validée 2026-07-19** (review D04). Le lieu de ta mort porte une **tombe** au run suivant : se recueillir = petit bonus (ou objet perdu) ; profaner = invoquer l'**Écho** — ton ancien héros (stats/skills du run précédent) à combattre pour un héritage bonus. Auto-équilibrant : run fort = défi fort.

- [ ] **ECHO01 — Persistance lieu + loadout de mort** · S · P3 · 🟢 — stocker node + stats + skills au heroDeath (meta) + migration save.
- [ ] **ECHO02 — Tombe : marqueur + recueillement** · S · P3 · 🟢 — marqueur WorldMap sur le node ; interaction « se recueillir » (bonus one-shot). ⟶ worldGraph.
- [ ] **ECHO03 — Combat d'Écho** · M · P3 · 🟢 — `buildEchoEnemy` depuis le loadout stocké (IA : usage basique des skills équipés) + récompense d'héritage bonus ; tests. ⟶ engine/combat.
- [ ] **ECHO-G1 — Cadrage** · XS · P3 · 🟡 — fréquence (chaque mort ? 1 tombe max ?), scaling, drop exact.

### WTHR — Météo par zone (v1.57)
> **Validée 2026-07-19** (review D05) — **pas prioritaire** (décision Adrian). ⚠️ **Exigence actée : la météo doit être COHÉRENTE de jour en jour, voire de saison en saison** (pas un tirage indépendant quotidien) → **grooming WTHR-G1 avec Adrian avant tout dev**.

- [ ] **WTHR-G1 — Modèle de cohérence temporelle** · S · P3 · 🟡 — **à groomer ensemble** : chaînes de Markov jour→jour (une pluie dure 1-3 jours) ? saisons (cycle de N jours modulant les probabilités) ? impact sur PLAN01/cycle nuit DN. Livrable : modèle chiffré validé.
- [ ] **WTHR01 — Data météo + tirage cohérent** · M · P3 · ⛔ — 3-4 météos par zone, 1 effet chacune, tirage seedé **selon le modèle WTHR-G1** (déterministe, rejouable). ⟶ WTHR-G1, dayCount.
- [ ] **WTHR02 — Effets branchés** · S · P3 · ⛔ — modificateurs combat/idle/drops (réutilise statuts B05 + tables de drops). Petits et lisibles. ⟶ WTHR01.
- [ ] **WTHR03 — UI** · S · P3 · ⛔ — icône sur la zone (carte + header ZoneView) + tooltip effet. ⟶ WTHR01.

### v1.61 — Compagnons
> ⟶ CMP06 ⟶ EVT02 (v1.62)

- [ ] **CMP01 — Structure données Companion + traits** · S · P3 · 🟢 — `companion` : traits{loyal,stubborn,cowardly,reckless,prudent}/relationScore(−10→+10)/daysKnown/stats/skills/alive/universeOfMeeting
- [ ] **CMP02 — Génération aléatoire traits à la rencontre** · M · P3 · 🟢 — pondérés par contexte : donjon→cowardly+0.3, taverne→loyal+0.2, disciple allié→loyal+0.3, Zone 2+→reckless+0.2 ; random [0.1–0.9]
- [ ] **CMP03 — followProbability() dans combat.js** · M · P3 · 🟢 — `base(dominantTrait) + relationScore×0.04 − cowardly×riskLevel + daysKnown>10?0.08:0` ; clampé 0.05–0.95
- [ ] **CMP04 — CompanionCard en combat** · M · P3 · 🟢 — HP/mana, action en cours, réponse textuelle selon trait (5 pools de phrases)
- [ ] **CMP05 — Interface conseil joueur (3s)** · L · P3 · 🟢 — fenêtre flottante au tour du compagnon ; sans conseil → companionAI() seul
- [ ] **CMP06 — Recrutement compagnon SafeZone + donjon** · M · P3 · 🟢 — **taverne (gold)** + réfugié via événement (EVT02) ; max 1 actif. ⚠️ le donjon v1.41 (9 salles) **n'a pas de salle Event** → recrutement en donjon reporté (ou via boss/trésor). Recoupe EVT02.
- [ ] **CMP07 — Permadeath + message narratif** · S · P3 · 🟢 — relationScore ≥ 7 → message spécial ; transmigration → "resté dans cet univers"
- [ ] **CMP08 — Easter egg relation ≥ 9** · S · P3 · 🟢 — laisse un item ou skill dans la boutique des dieux au run suivant
- [ ] **CMP09 — Évolution relationScore** · S · P3 · 🟢 — +1 conseil suivi+survie, +2 soin, +3 protection à 0HP, −1 ignoré+blessure, −3 fuite, −1 dieu ennemi, +1/5 jours
- [ ] **COMP01 — Familier d'assistance** · L · P4 · 🟢 — aide combat/idle, barre de vie + **slot dédié** (distinct des compagnons CMP). ✅ **Ready** : slot + IA d'assistance.
- [ ] **COMP02 — Apprivoisement** · XL · P4 · 🟢 — capturer des créatures vaincues comme familier. ✅ **DÉCIDÉ (proposé)** : après victoire vs bête non-élite à bas HP, chance ∝ Chance de capture, consomme un `taming_lure`. ⟶ COMP01.
- [ ] **COMP03 — Progression du familier** · L · P4 · 🟢 — niveaux/évolutions/compétences du familier. ✅ **Ready** : XP au combat → paliers d'évolution. ⟶ COMP01.

### v1.62 — Événements, explo & NPC

- [ ] **EVT01 — Framework événements aléatoires** · L · P3 · 🟢 — `triggerZoneEvent(zoneId, dayCount)` : proba par zone + cooldown 3j min ; types merchant_visit/ambush/treasure_chest/divine_omen/refugee
- [ ] **EVT02 — Événements de zone implémentés** · M · P3 · 🟢 — 5 événements (marchand errant, embuscade, coffre piégé, omen divin, réfugié→CMP06) — dépend EVT01
- [ ] **EVT03 — Événements nocturnes** · M · P3 · 🟢 — au sommeil : rêve divin (indice éveil), vol ressources (relation divine −), vision (preview donjon) — après EVT01 ; déclencheur = sommeil (CAL01 ✓).
- [ ] **EXPL01 — Nodes cachés** · M · P4 · 🟢 — révélés par dissipation du fog ou indice d'informateur.
- [ ] **EXPL02 — Événements de route non-combat** · M · P4 · 🟢 — marchand ambulant, sanctuaire, voyageur.
- [ ] **EXPL03 — Coffres / trésors de zone** · S · P4 · 🟢 — découverte unique, loot/ressources rares.
- [ ] **NPC03 — NPCs récurrents avec mémoire** · M · P3 · 🟢 — se souviennent du rang aventurier + divinité → dialogues différents au retour
- [ ] **NPC05 — Maître itinérant à la Guilde** · M · P3 · 🟢 — maître de passage proposant entraînement/quêtes ponctuels (lié TRA01/GLD01)

### v1.71 — UI / UX & a11y
> ⟶ SETTINGS-FULL01 (volume) ⟶ AUDIO01 (v1.91)

- [ ] **UI10 — Refonte du format d'affichage : passage en 16:9** · S/M · P4 · 🟡 — **Contexte** : le layout est perçu comme une **boîte fixe (~750×580 px)** centrée sur fond noir, quasi 1:1 et non-responsive ; l'espace écran large (laptop/desktop) est mal exploité. **Objectif** : adopter un ratio standard — **Option A `16:9`** (widescreen, **à préférer**) ou Option B `3:4` (portrait, si centrage village/donjon). **Scope** : conteneur principal (`src/screens/` ou layout racine) px fixe → ratio CSS (`aspect-ratio: 16/9`) ; Map + zones (village/donjon) + HUD s'adaptent (flex/grid ou viewBox SVG) ; vérifier **1366×768** et **1920×1080** (mobile hors scope) ; **ne pas casser les sprites/bâtiments positionnés en absolu** sur la carte. **AC** : (a) zone de jeu ≥ **80 %** de la largeur du viewport sur 1366px ; (b) ratio maintenu **sans déformation** des sprites ; (c) **0 régression visuelle** sur les écrans déjà fonctionnels. **Lié à** : TST-UI (épique urgente). **⚠️ Note de grooming (réconciliation requise)** : v1.1 a acté un **stage fixe 1920×1080 + scaler** `transform: scale(min(vw/1920,vh/1080))` (déjà 16:9, cf. UI01 parchemin) et **responsive renvoyé à `U02`/v2** → clarifier l'écart entre « boîte ~750×580 » observée et le stage théorique avant de coder (régression du scaler ? écran hors-coquille ?). **⟶ recoupe UI12** (bande 3:2 de la carte, déjà tranchée dans l'épique urgente).
- [ ] **TIME-DISPLAY01 — Refonte de l'affichage de l'heure** · S · P3 · 🟡 — choisir une version **A→E** (24h / 12h / +période / cadran SVG / arc jour-nuit). **Décision requise.**
- [ ] **SETTINGS-FULL01 — Compléter l'écran Options** · S · P3 · 🟡 — volume (dépend AUDIO01) + vitesse texte + reduced-motion + exposer export/import save. Animations déjà fonctionnel.
- [ ] **A11Y01 — Accessibilité de base** · M · P3 · 🟡 — `prefers-reduced-motion` + focus + ARIA + contrastes (périmètre à border). Recoupe UX04.
- [ ] **UX04 — Navigation clavier complète** · M · P3 · 🟡 — Tab + Entrée + Echap sur tous les écrans ; combat jouable sans souris
- [ ] **U02 — Responsive mobile** · L · P3 · 🟡 — layout <768px, touch events, Canvas 2D scaled
- [ ] **ONBOARD01 — Onboarding premier run (tooltips contextuels)** · M · P3 · 🟡 — *fusionne l'ex-TUT01.* Réutilise le framework `triggerHint` (ONB01 ✓). Hints **validés** ; reste : **lister les 5-6 hints restants** (J2 donjons, 1er dieu, 1er craft…) + déclencheurs + copy définitive. (TUT02/TUT03 déjà livrés.)
- [~] **QOBJ-TYPES01 — Nouveaux types d'objectif de quête (actions non-combat)** · M · P3 · 🟢 — **[~] 2026-07-19 : implémenté sur `feat/onboarding_quests`, testé en live le 2026-07-17** (objectif `equip` validé en jeu) ; restent FIX-I18N01 (contenu FR) + merge dev (REL-TRAIN01). — *demande 2026-07-12.* Ajouter les objectifs nécessaires aux quêtes d'onboarding « premières actions » : **`pray`** (prier au sanctuaire), **`accept_deed`** (accepter un acte de dévotion / quête temporaire d'église), **`equip`** (équiper une pièce d'une catégorie donnée), + **filtre de catégorie sur `craft`** (« fabriquer une **potion** » ≠ n'importe quel craft). Chacun : compteur/flag d'état (`world.prayerCount`, `meta.firstEquip`…), complétion dans `isQuestCompleteState`/`questObjectiveStatus` (l.543, + snapshot delta si cumulatif), label UI, test. Prérequis de QONBOARD01. ⟶ QONBOARD01, quests.js, ChurchPanel, AlchemyPanel.
- [~] **QONBOARD01 — Chaîne de quêtes d'onboarding (« Les premiers pas », Greywatch)** · M · P3 · 🟢 — **[~] 2026-07-19 : implémenté sur `feat/onboarding_quests` (`onboardingQuests.js`, track « Premières fois »), chaîne testée en live le 2026-07-17** (maillons 1-2 déroulés) ; restent FIX-I18N01 + merge dev (REL-TRAIN01). — *demande 2026-07-12.* Ligne de quêtes principales qui **enseigne les premières actions** + **octroie les premiers items** — complément *quête-driven* des tooltips ONBOARD01. Proposé : (1) **Le premier tranchant** — tuer 3 Ashwood Wolves → **1ʳᵉ arme** (épée courte / dague) ; (2) **Bien armé** — `equip` l'arme → gold ; (3) **Se couvrir** — chasser 5 Thicket Hares + collecter des peaux → **1ᵉʳ casque** ; (4) **Recueillement** — `pray` au sanctuaire → bénédiction ; (5) **Devoir de dévotion** — `accept_deed` (1ʳᵉ quête temporaire d'église) → gold ; (6) **Première décoction** — `craft` (potion) chez l'alchimiste → potions de soin ; (+ « premiers X » : voyage, vente marchand, 1er skill…). **Chaîne PARALLÈLE** à la trame principale (MQ) : contenu dans un **fichier dédié `onboardingQuests.js`** (miroir de `mainQuests.js`/`churchQuests.js`/`masterQuests.js` — l'archi sépare déjà les collections), séquencée **indépendamment**, agrégée dans `QUESTS`, + **flag `track:'onboarding'`** → **section distincte « Premières fois »** sur le board (court en parallèle sans s'entremêler aux quêtes principales). Récompenses/counts à caler. ⚠️ **prérequis QOBJ-TYPES01**. ⟶ QOBJ-TYPES01, ONBOARD01, mainQuests.js (pattern de collection).
- [ ] **SKILL-DESC01 — Skills : description courte + effet chiffré selon les stats (Hero Sheet + combat)** · M · P3 · 🟡 — *remonté au playtest v1.33 (2026-07-03).* Dans la liste des skills du Hero Sheet (`SkillRow compact`, `.skill-grid` 2 col.), **HS-SKILLS01 a volontairement masqué la description** pour la compacité → un skill n'affiche que nom/type/niveau/coût. Demande : (a) **description rapide** de ce que fait le skill — au survol (tooltip) ou en ligne dépliable, **sans casser la grille 2 colonnes** ; (b) **effet chiffré fonction des stats** du héros — dégâts estimés (multiplicateur × FOR/INT + Aura), % de soin, DoT/statut — via un formateur réutilisable lisant `skills.js` (`effect.damage`, `heal`, effets de statut). Le divin `Healing Bloom` affiche déjà « Restores 30% of max HP » (modèle à généraliser). **Reco** : helper pur `describeSkillEffect(template, heroStats)` → chaîne lisible, **réutilisable dans les boutons de skill en combat** (`Combat.jsx`). AC : chaque skill du Hero Sheet expose sa description (tooltip/dépli) + une ligne d'effet chiffrée reflétant les stats courantes ; grille 2 col. préservée ; tests (formateur : dégâts / soin / DoT ; rendu tooltip). ⟶ HS-SKILLS01, SKD-E1, SKL01, `skills.js`.

### v1.72 — Idle & planification
> ⟶ IDLE-CRAFT/PLAN ⟶ Craft (v1.42)

- [ ] **IDLE-AUDIT01 — Cohérence de l'idle** · S · P5 · 🟡 — *repoussé.* zones interdites / arrêt au changement d'écran / seuil HP / vigueur / spots verrouillés + tests.
- [ ] **IDLE-SAFE01 — Sécurité idle** · M · P3 · 🟢 — auto-stop HP + auto-fuite réglables ; gestion de la **mort pendant l'idle** (embuscade) ; récap offline gère la mort. ⟶ QOL01, IDLE-OFF.
- [ ] **IDLE-INT01 — Interactions idle (résolu)** · S · P3 · 🟢 — idle de nuit → **drops nocturnes obtenus** ; embuscade en idle → **risque de mort** ; burnout exempté si ≥2 activités.
- [ ] **IDLE-CRAFT01 — Idle généralisé au craft** · M · P3 · 🟢 — une recette craftée 5× peut être produite automatiquement en idle.
- [ ] **PLAN01 — Écran de planification (auberge/foyer)** · M · P3 · 🟢 — choisir zone de combat / objet à forger / type de potion / chaussure-ceinture / bijou ; **conseils contextuels** (« danger ! », « risqué… »).
- [ ] **PLAN02 — Prérequis ≥3 activités** · S · P3 · 🟡 — au moins 3 parmi combat/forge/potion/cordonnier/bijoutier pour que la planification ait un intérêt.
- [ ] **QOL01 — Contrôle de vitesse + auto-battle** · M · P4 · 🟢 — ×1/×2/×4 + seuils HP/mana, fuite auto. ⟶ IDLE-SAFE01.
- [ ] **QOL02 — Multi-slots de sauvegarde + export/import** · S · P4 · 🟢 — JSON.
- [ ] **QOL03 — Raccourcis clavier remappables** · S · P4 · 🟢 — actions fréquentes.
- [ ] **UX-NUMFMT01 — Formatage des grands nombres** · XS · P5 · 🟡 — *prio abaissée (surtout utile pour l'idle).* `1.2k`/`3.4M`, helper `formatNumber()`.

### v1.81 — Méta / prestige
> ⟶ REP-REBAL01 ⟶ ENCH (v1.42)

- [ ] **META01 — Arbre méta persistant** · L · P4 · 🟡 — bonus globaux durables entre transmigrations (monnaie méta).
- [ ] **META02 — Choix de carryover étendus** · M · P4 · 🟡 — sélectionner skills/stats/ressources à conserver.
- [ ] **META03 — Modificateurs NG+** · M · P4 · 🟡 — modificateurs optionnels (plus durs / plus de loot) selon les runs.
- [ ] **HIS01 — Historique des runs** · M · P3 · 🟡 — N derniers runs : cause de mort, zone max, boss tués, durée, tokens ; `meta.runHistory[]`
- [ ] **HIS02 — Statistiques globales meta** · S · P3 · 🟡 — total kills/type, temps joué, Demon Lords tués, compagnons perdus, skills uniques
- [ ] **REP-REBAL01 — Rééquilibrage des tokens** · M · P4 · 🟡 — débloquer **REP01** avec les nouveaux puits (Gods' Shop méta, enchantement) et sources (quêtes principales). **Trois points à trancher (relevés en B2 le 2026-06-13)** : **(a) rang = solde dépensable** — `getRankInfo(hero.reputationTokens)` calcule le rang sur la monnaie *dépensable* → acheter au Gods' Shop fait *baisser* le rang. Décider : compteur **cumulatif séparé** (`lifetimeReputationTokens`) pour le rang vs solde pour les achats ? **(b) seuils inatteignables** — v1 ne donne que **20 tokens** (4 élites × 5) hors Malachar ; `RANK_TIERS` Gold 30 / Plat 70 / Diam 150 et la prestige à `PRESTIGE_MIN_TOKENS=10` sont à recaler sur la vraie courbe d'offre (ou ajouter des sources : quêtes principales MQ-CHAIN, donjon v1.4). **(c) sources à 0** — confirmer si église / maîtres de bâtiment / boss de zone restent à 0 token (défaut actuel) ou en octroient.
- [ ] **PERMSTAT01 — Items de stats définitives** · M · P4 · 🟡 — craftables, coût en ingrédients **très rares OU en grande quantité** ; étend ITM01. *Non prioritaire.*

### SOUL — Reliques liées à l'âme (v1.83)
> **Validée 2026-07-19** (review D06). Lier **une** pièce d'équipement à l'âme (rituel forge+église : matériau rare + tokens + mini-jeu réussi, **1 slot d'âme**) → elle traverse la transmigration. Donne au craft v1.42 sa finalité méta. ✅ **DÉCIDÉ (2026-07-19) : accessible seulement après 3 runs dans le même univers** (gate). ⚠️ Réconcilier **META02** avant d'ouvrir : SOUL = voie *craft/mérite*, META02 = voie *boutique*.

- [ ] **SOUL01 — Flag `soulbound` + persistance** · M · P3 · 🟢 — persistance à la transmigration + **gate 3 runs même univers** (`meta.universeHistory`/runNumber) + migration save + tests. ⟶ applyTransmigration, X08.
- [ ] **SOUL02 — Rituel de liaison** · S · P3 · 🟢 — UI (forge/église) + coût (matériau rare + tokens + mini-jeu CRAFTMG réussi). ⟶ Z06, CRAFTMG01.
- [ ] **SOUL-G1 — Périmètre** · XS · P3 · 🟡 — 1 slot ? arme seulement ? interaction avec le choix d'héritage T05 (consomme un slot ou non) ; frontière META02.

### v1.82 — Assets, art & lore
> ⟶ CODEX ⟶ CONT02/03 (même épique) ; HS-EQUIP01 ⟶ icônes

- [ ] **CONT01 — Sprites de carte/combat chibi (couche A)** · M · P3 · 🟡 — *§ASSETS*. **✅ Héros placeholder en place** (`public/sprites/hero/{idle,walking,dying}` — Necromancer chibi CraftPix, à remplacer par un chibi héroïque). **✅ 16/16 monstres de surface liés** (2026-06-08 : `public/monsters/<id>.png` normalisés, chargés par `MonsterPortrait`/ZoneView avec fallback emoji). **✅ 5/9 façades de bâtiments liées** (2026-06-08 : `public/buildings/<id>.png` — inn, church, merchant, alchemy, blacksmith — chargées via `ArtSlot src` dans `VilBuilding`, fallback placeholder légendé). **Reste (art à produire)** : 3 boss (Crypt Keeper, Lord of the Forsaken, **Malachar**), 6 monstres Grimspire, 2 élites Blighted Road, 2 réserve (barrow_wight, soul_harvester) ; **4 façades** (master_smith, knight_trainer, academy, guild) + déco (well/hens/barrels). Pipeline `public/monsters/README.md`.
- [ ] **UI08 — Intégration sprites (couches A + B)** · L · P3 · 🟡 — *§ASSETS*. **Couche A** chibi cartoon (carte/combat : héros, façades de bâtiments, monstres, Malachar) + **Couche B** portraits pixel 128×128 à 6 émotions (overlays dialogue). **Règle stricte : jamais mélanger chibi et portrait pixel à la même échelle dans un même cadre.** Héros placeholder = chibi "Necromancer of the Shadow" (Idle/Walking/Dying). Dépend CONT01/CONT06.
- [ ] **C03 — Portraits personnage** · S · P4 · 🟡 — 8 icônes au choix en CharCreation (warrior/rogue/mage/ranger/monk/knight/witch/bard).
- [ ] **CONT05 — ASSETS.md + sourcing licences** · S · P4 · 🟢 — **✅ `ASSETS.md` créé** (crédits + inventaire + règle anti-clash) ; `public/ASSET_LICENSES/` committé. **✅ Livraison des assets RÉSOLUE** (DEPLOY01, 2026-06-08 : `public/` committé → servi par Vercel ; `raw/` HD exclus). ⚠️ **Reste (optionnel)** : optimiser les 3 gros PNG (map 9.7 Mo, rotting_shambler 5.9, gloom_bat 5.6) via squoosh ; un set d'icônes SVG (remplace emoji).
- [ ] **MVAR01 — Variante d'image par ennemi (combats multi-ennemis)** · S/M · P3 · 🟡 — *retour playtest 2026-06-08.* En combat avec **plusieurs ennemis du même monstre**, chacun utilise une **variante d'image différente** quand plusieurs existent (sinon réutilise `<id>.png`). **✅ Assets prêts** : schéma de nommage `public/monsters/<id>.png` + `<id>_2.png` + `<id>_3.png` déjà en place (2026-06-08) — pools actuels : **3 variantes** (mire_slime, fenrot_devourer, stone_golem, hollow_knight, ruin_specter, graven_sentinel, hill_slime, russet_fox, knoll_goblin, thunderhoof) · **2** (thicket_hare, briar_wraith) · **1** (ashwood_wolf, tuskmaw_boar, old_oakheart, marsh_serpent). **À cadrer (décision clé)** : le navigateur ne peut pas lister `public/` → le loader doit **connaître le nombre de variantes** par monstre : soit (a) un **manifeste data** `MONSTER_VARIANTS={ russet_fox:3, … }`, soit (b) tenter `<id>_N.png` avec **fallback onError** sur `<id>.png` (génère des 404). Attribution variante = par **index d'ennemi** (`(i % count) + 1`, ou aléatoire distinct). Touche `MonsterPortrait` (Combat) + `<img>` ZoneView + Codex. Fallback : moins de variantes que d'ennemis → on cycle ; aucune image → emoji.
- [ ] **HS-EQUIP01 — Icônes/assets pour les objets équipés** · S · P3 · 🟡 — remplacer le texte par une icône/asset par pièce. **Dépend d'un set d'icônes** (CONT05). *(couvert/étendu par ART-EQUIP01.)*
- [ ] **ART-EQUIP01 — Images Gemini pour tout l'équipement (craftable + droppable)** · L · P3 · 🟡 — *demande 2026-07-12.* Générer via **Gemini (Nano Banana)** les visuels de **toutes** les pièces d'équipement (forgeables **et** droppables) : ajouter les prompts au **manifeste asset_forge**, générer en `with_bg`/`no_bg`, puis brancher un champ `sprite` sur `EQUIPMENT_TEMPLATES` + affichage (inventaire, boutique, HeroSheet, **forge** via CRAFTMG-SHAPE01). ⚠️ Pollinations jugé insuffisant → **Gemini** (cf. mémoire décision assets). Périmètre = `asset_forge/` + champ+affichage côté jeu. ⟶ asset_forge, HS-EQUIP01, CRAFTMG-SHAPE01, EQUIPMENT_TEMPLATES.
- [ ] **CONT02 — Descriptions lore par zone** · XS · P3 · 🟡 — flavor text dans le header ZoneView (3-4 lignes/zone)
- [ ] **CONT03 — Flavor text sur les skills** · XS · P3 · 🟡 — champ `lore` dans les skill templates, affiché en italique InventoryCard
- [ ] **CODEX02 — Codex de lore** · S · P3 · 🟡 — écran consultable regroupant le flavor text — dépend CONT02/CONT03

### CULT — Le Cercle des Éveillés (v1.84)
> **Validée 2026-07-19** (review D07) — **pas prioritaire ; visible seulement en mid/end-game** (décision Adrian). Société discrète qui **sait** que le héros boucle : dialogues qui traversent les runs, sanctuaire qui monte en grade avec les morts, services méta. Colonne narrative de la boucle. **Périmètre v1 cadré : 1 PNJ, 3 services, 5 dialogues.** Risque : coût écriture (solo dev).

- [ ] **CULT01 — PNJ + mémoire trans-run** · M · P4 · 🟢 — 1 PNJ (ermite), dialogues par paliers de runs (`meta.deathCount`/runNumber) ; **gate d'apparition mid-game** (à caler : rang ? runs ? zone 2 ?). ⟶ NPC01, dialogues.js.
- [ ] **CULT02 — 3 services méta** · M · P4 · 🟢 — re-roll d'une option du Gods' Shop · indice de condition d'éveil divin (payant — respecte ADR-006 : indice, jamais la condition brute) · contrat spécial. Puits de tokens. ⟶ GodsShop, deities.
- [ ] **CULT03 — Progression du sanctuaire** · S · P4 · 🟢 — paliers par nombre de runs/morts, débloquant les services. ⟶ CULT01.
- [ ] **CULT-G1 — Cadrage lore + écriture** · S · P4 · 🟡 — ton, nom de la faction, 5 dialogues v1 ; périmètre end-game (services de fin de partie ?).

### v1.91 — Audio, game-feel & cycle nuit
> ⟶ NSKL ⟶ cycle nuit DN (même épique)

- [ ] **AUDIO-ASSETS01 — Sourcing des assets sonores (info)** · S · P3 · 🟡 — **mix IA + libres de droit** décidé ; reste style sonore + volume. Prépare AUDIO01.
- [ ] **AUDIO01 — Système audio (SFX + musique)** · L · P3 · 🟡 — *fusionne l'ex-U05.* Web Audio API ; SFX : attaque, skill, mort, level-up, divine call, déroulé parchemin ; musique par zone (cf. FEEL02). Dépend AUDIO-ASSETS01.
- [ ] **FEEL01 — SFX par action** · M · P4 · 🟢 — coup, craft, loot, level-up.
- [ ] **FEEL02 — Musique par zone & jour/nuit** · M · P4 · 🟢 — ambiance médiévale fantasy.
- [ ] **FEEL03 — Juice visuel** · M · P4 · 🟢 — screen-shake, particules de loot, transitions ; lien DN02.
- [ ] **DN01 — Indicateur visuel jour/nuit** · S · P4 · 🟢 — code couleur + icône ☀/🌙 dérivés du tic.
- [ ] **DN02 — Animation d'incrément de temps** · S · P4 · 🟢 — feedback à chaque tic.
- [ ] **DN03 — Variantes de map jour/nuit** · M · P4 · 🟢 — assets soir/nuit + bascule (4 illustrations avec les 2 maps).
- [ ] **DN-G1 — Cadrage jour/nuit** · S · P4 · 🟡 — seuils (tics = nuit), capacités par monstre, barème de bonus ; liens EVT03 + AMB.
- [ ] **DN04 — Capacités nocturnes des monstres** · M · P4 · 🟡 — skills/buffs actifs uniquement la nuit.
- [ ] **DN05 — Récompenses majorées la nuit** · S · P4 · 🟡 — loot/exp/or bonus, contrepartie de la difficulté.
- [ ] **NSKL01 — Drop de skill rare nocturne** · M · P4 · 🟢 — 5% sur **n'importe quel** monstre d'une zone, **uniquement la nuit** ; flag `nightRareSkill` + état nuit.
- [ ] **NSKL02 — 6 skills rares nocturnes** · M · P4 · 🟡 — 1 par zone (Ashenvale, Barrow Hills, Crumbled Ruins, Thornmarsh, Veteran's, Draconic).
- [ ] **NSKL-G1 — Balance** · S · P4 · 🟡 — puissance « assez bon », interaction drops normaux, héritabilité (T12), Codex.

### v1.92 — Multivers & Foyer

- [ ] **X08 — Architecture multi-univers** · L · P3 · 🟡 — `currentUniverse` + `universeHistory[]` ; data namespaced `src/data/universes/{id}/` ; WorldMap switche selon univers. **Prérequis des épiques UNIV-WUSHU (v1.95) / UNIV-TOWER (v1.96)** — reste en v1.92 pour l'instant, à re-prioriser quand Map 1 sera stabilisée (décision 2026-07-19).
- [ ] **X09 — Règle de rotation (fenêtre glissante)** · M · P3 · 🟡 — `forbidden = {actuel, précédent}` ; pool = 2 restants ; pondération par ancienneté — dépend X08
- [ ] **HOME01a — Achat du foyer + emplacement sur la map du village** · M · P3 · 🟡 — acheter une maison ; nouveau node "foyer" dans le village ; question méta : persiste-t-il entre transmigrations ?
- [ ] **HOME01b — Lit (dormir chez soi)** · S · P3 · 🟡 — dormir au foyer = équivalent auberge (restaure vigueur/HP/mana, avance le jour)
- [ ] **HOME01c — Coffre de stockage** · M · P3 · 🟡 — stocker items/équipement/ressources ; déplacer inventaire ↔ coffre ; persistance à décider (run vs méta)

### UNIV-WUSHU — Univers 2 : monde wushu (v1.95)
> **Validée 2026-07-19** (review E01). 2ᵉ univers du pitch (medieval fantasy ✓ → **wushu** → tour → post-apo). ⚠️ **À confirmer** : la dictée disait « univers rouge » — interprété wushu. Prérequis : **X08** (architecture multi-univers) + X09 (rotation). Les contenants de skills par univers existent déjà (S06 : Manuscripts).

- [ ] **UNIV-WU-DESIGN01 — Doc de design de l'univers** · M · P4 · 🟡 — zones/sectes, bestiaire, skills = techniques internes/externes, « divinités » locales (ancêtres/immortels), déclinaison des systèmes (craft = alchimie taoïste, maîtres = écoles). Livrable : section DESIGN.md. 
- [ ] **UNIV-WU-DATA01 — Namespace data** · L · P4 · ⛔ — `src/data/universes/wushu/` (monstres, zones, quêtes, équipement) selon l'archi X08. ⟶ X08.
- [ ] **UNIV-WU-MAP01 — Carte + POS** · M · P4 · ⛔ — illustration + graphe de nodes + coordonnées. 🎨 asset Gemini. ⟶ UNIV-WU-DESIGN01.
- [ ] **UNIV-WU-ART01 — Assets** · L · P4 · ⛔ — bestiaire + bâtiments + portraits via manifeste asset_forge. 🎨. ⟶ UNIV-WU-DESIGN01.

### UNIV-TOWER — Univers 3 : la Tour (v1.96)
> **Validée 2026-07-19** (review E02). Type *Tower of God* : structure **verticale** — étages = zones, gardiens d'étage = boss de palier, montée = progression, épreuves d'étage. Seul vrai chantier moteur : le **rendu vertical de la carte** (POS en colonne, EDGES verticaux) — le reste est du contenu namespacé. Data chips (S06) déjà prévus. Prérequis : X08/X09.

- [ ] **UNIV-TW-DESIGN01 — Doc de design** · M · P4 · 🟡 — étages, gardiens, économie des épreuves, skills « contrats ». Livrable : section DESIGN.md.
- [ ] **UNIV-TW-DATA01 — Namespace data** · L · P4 · ⛔ — `src/data/universes/tower/`. ⟶ X08.
- [ ] **UNIV-TW-MAP01 — Rendu vertical de la carte** · M/L · P4 · ⛔ — adaptation WorldMap (coupe de tour, étages empilés, scroll vertical). ⟶ UNIV-TW-DESIGN01.
- [ ] **UNIV-TW-ART01 — Assets** · L · P4 · ⛔ — étages + gardiens + ambiance. 🎨. ⟶ UNIV-TW-DESIGN01.

### v1.93 — Intégration finale (gate)
> ⟶ dépend de TOUTES (migration/QA/balance globale) ; SEC02 post-alpha

- [ ] **MIGRATE-EXT01 — Migration de save étendue** · M · P3 · 🟢 — `loadGame` couvre `tier`, `equipment.set`, slots étendus, `titleBuffs`, `building.unlock`, état burnout, `nightSkill`.
- [ ] **QA-EXT01 — Étendre l'audit d'intégrité** · S · P3 · 🟢 — **QA01** couvre les nouveaux ids : sets, tiers, ressources craft, skills nocturnes, bijoux. ⟶ QA01.
- [ ] **BAL-INTEG01 — Intégrer les nouveaux drops au balancing** · M · P3 · 🟢 — items rares tier, équipement, pièces de set, skills nocturnes dans BAL-CSV01 + courbe d'économie.
- [ ] **BAL-AUDIT01 — Passe d'équilibrage globale** · M · P2 · 🟡 — **✅ DÉCIDÉ** : XP **×1.32** · XP **×5** · gold **×8**. À trancher : drops/prix/tokens/vigueur. Via **BAL-CSV01**.
- [ ] **SEC02 — Durcissement sécurité (post-alpha)** · L · P4 · 🟡 — backend / autorité serveur, comptes & rôles, validation server-side des saves, anti-triche. **Référencé par DEPLOY01** : l'alpha privée ne s'appuie aujourd'hui que sur **Vercel Authentication** (pas d'autorité serveur). À cadrer : périmètre minimal d'un vrai compte joueur + ce qui doit passer côté serveur.

### v1.94 — Backend & données (Supabase)
> Contexte : app **100 % client-side** (Vite/React, saves `localStorage`, Vercel statique) ; 25 modules statiques dans `src/data/`, **aucun backend** aujourd'hui. **Principe d'archi** : le CONTENU (monstres/quêtes/skills/balance) reste **bundlé** (offline, latence nulle, versionné atomiquement avec le code) — **jamais de fetch runtime** (un décalage DB↔shapes du code = bugs). Supabase sert de : (1) **source de vérité éditable + génération build-time** des `src/data` (remplace la boucle Excel), (2) **saves cloud + Auth**, (3) télémétrie de playtest. L'anon key est **publique par design** → la sécurité repose sur **RLS**, pas sur le secret. ⟶ recoupe la data de balance (Excel Quêtes/Monstres) + SEC02 (autorité serveur post-alpha).

- [ ] **SUPA-ADR01 — ADR : périmètre DB vs bundle** · S · P3 · 🟡 — trancher + documenter (`docs/adr/`) : le contenu est **généré au build** (pas de fetch runtime) ; Supabase = source de vérité + saves + télémétrie. Justif : offline-first, cohérence data↔shapes, coût/latence. AC : ADR écrit + périmètre validé (fondation des autres tickets).
- [ ] **SUPA-SETUP01 — Projet Supabase + client + env** · S · P3 · 🟡 — créer le projet ; ajouter `@supabase/supabase-js` ; `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` (env Vercel, **jamais committées**) ; `src/lib/supabase.js` **lazy + no-op si env absente** → l'app reste 100 % jouable offline. AC : client init, env documentée, 0 secret committé, app OK sans env. ⟶ SUPA-ADR01.
- [ ] **SUPA-SCHEMA01 — Schéma SQL des tables de contenu** · M · P3 · 🟡 — modéliser les shapes de `src/data` : `monsters` (+ `resource_drops`, `skill_drops`), `skills`, `resources`, `quests` (+ `quest_objectives`, `quest_rewards`), `zones`/`spots`, `recipes`, `equipment`… (migrations SQL versionnées). AC : tables + relations + contraintes, revue vs shapes JS. ⟶ SUPA-SETUP01.
- [ ] **SUPA-SEED01 — Import initial des données actuelles** · M · P3 · 🟡 — script one-shot : charger les `src/data/*.js` courants dans les tables (bootstrap de la source de vérité). AC : **round-trip vérifié** (DB → data régénérée == data d'origine). ⟶ SUPA-SCHEMA01.
- [ ] **SUPA-CODEGEN01 — Génération build-time de `src/data` depuis Supabase** · L · P2 · 🟡 — `scripts/gen-data.mjs` + `npm run data:sync` : pull des tables → génère les modules `src/data` (ou un bundle JSON importé), en **prebuild/CI**. **Remplace la boucle Excel** (balance éditée en DB → regen → commit/deploy). Déterministe (diff-clean sans changement). AC : `data:sync` régénère à l'identique ; suite verte sur data générée ; flux documenté. ⟶ SUPA-SEED01, Excel balance (Quêtes/Monstres), FIX-QXP01/QRANK01 (valeurs).
- [ ] **SUPA-SAVES01 — Saves cloud + Auth** · L · P3 · 🟡 — Supabase Auth (email/OAuth) + table `saves` (**RLS par user**) ; `saveSlice` écrit `localStorage` **et** cloud ; au load, merge (timestamp / latest-wins) ; respect de `SAVE_VERSION`. AC : save cross-device ; fallback offline localStorage ; RLS verrouillée (chacun ne lit/écrit **que** ses saves) ; tests. ⟶ SUPA-SETUP01, SEC02.
- [ ] **SUPA-TELEMETRY01 — Télémétrie de playtest (opt-in)** · M · P4 · 🟡 — events (morts, quêtes finies, rang, métriques de balance) → table `events` (batch, **opt-in**, 0 PII). Alimente l'équilibrage (BAL-*). AC : flux d'events + opt-out + note vie privée. ⟶ SUPA-SETUP01, BAL-AUDIT01.
- [ ] **SUPA-ADMIN01 — Édition du contenu : Studio vs mini-admin** · M · P4 · ✂️ — build-vs-buy : **Supabase Studio** (éditeur de tables gratuit) suffit-il pour éditer la balance, ou faut-il une petite page admin dédiée ? AC : voie d'édition documentée → CODEGEN. ⟶ SUPA-CODEGEN01. *(à découper selon la décision.)*

### gelé — Embuscade & Map 2
> ⟶ ⛔ BLOQUÉ : Map 2 gelée — à dégeler avant dev

- [ ] **WMAP03 — Zone Draconic Supra Metal Rock** · S · P4 · 🟢 — rethème zone haute Map 2 (id `draconic_supra_metal_rock`).
- [ ] **WMAP07 — Asset Map 2** · M · P4 · 🟢 — génération Nano Banana (variante hostile) + chemins orange.
- [ ] **WMAP09 — Transition inter-map** · M · P4 · ✂️ — UI + state de bascule Thornmarsh ↔ Veteran's Playground.
- [ ] **AMB01 — Champ `ambush` sur edges Map 2** · S · P4 · 🟢 — `{baseChance, eliteChance}`.
- [ ] **AMB02 — Roll par tick** · M · P4 · 🟢 — `taux = max(15%, baseChance − floor(sumStats/30) × 1%)` (plancher **15%**).
- [ ] **AMB03 — Sous-roll élite** · S · P4 · 🟢 — 10% que l'embuscade soit un élite.
- [ ] **AMB04 — Surprise** · S · P4 · 🟢 — l'agresseur joue en premier.
- [ ] **AMB05 — Fuite pénalisée** · S · P4 · 🟢 — +1 tick.
- [ ] **AMB06 — Spawn haut de range** · XS · P4 · 🟢 — l'agresseur spawn en haut de la level range de la zone source.
- [ ] **AMB07 — Taux de base par route** · XS · P4 · 🟢 — 30→50% selon l'edge Map 2.
- [ ] **AMB-G1 — Map 2 seulement ?** · XS · P4 · 🟡 — extension future à Map 1 ?
- [ ] **AMB-G2 — Définition `sum_stats`** · XS · P4 · 🟡 — STR+AGI+INT+DEF+Chance ?

### v2 — Ambition résiduelle
> ⟶ gros chantiers L/XL (ATB, PixiJS, boss fidélité)

- [x] ~~**B06 — ATB (Active Time Battle)**~~ · XL — **⛔ SUPERSÉDÉ (2026-07-19) → épique ⚔ COMBAT-ATB (v1.44)** : directions actées (ATB timeline visible + QTE), découpé en PROTO-INT01 + CMB-ATB01/02 + CMB-QTE01 + CMB-INT01 + CMB-BREAK01 + CMB-FOCUS01.
- [ ] **MAP03 — Migration WorldMap vers PixiJS v8** · L · P3 · 🟡 — `pixi.js` + `@pixi/react` ; Sprite héros + effets WebGL (glow/bloom/shaders) ; Zustand reste source de vérité — dépend UI02
- [ ] **BSS01b — Crypt Keeper : vraie invocation de Skeleton Adds** · M · P3 · 🟡 — 2 entités séparées (HP faible, interrompent les skills si non tuées en 2 tours, pas de loot). Stand-in actuel = enrage +40% ATK
- [ ] **BSS02b — Lord of the Forsaken : couche d'armure régénérante** · M · P3 · 🟡 — DEF +30% régénérée tous les 3 tours. Stand-in actuel = Cursed Strike seul

### v3 — Lointain

- [ ] **ECO-DYN01 (SUG-E4) — Économie dynamique** · L · P5 · 🟡 — *référencée à l'index, non détaillée dans la session* : prix marchands/offres réactifs à l'activité du joueur. **À spécifier.**

---

## Archive — détail par version (historique)

> Ancien découpage par version, conservé pour les **notes de design** (spec donjon 9 salles, décisions verrouillées, détail MQ-CHAIN, etc.) et les tickets **`[x]` inline** non encore consolidés dans `## Done`. **Plus aucun ticket ouvert ici** — ils vivent dans « Backlog par épique » ci-dessus. Headers rétrogradés d'un niveau.

### Plan d'exécution — batches lançables (2026-06-13) — *historique, superséd. par « 🗺 Plan de release »*

> Regroupements cohérents prêts à « lancer » (1 batch = 1 session de code focalisée). Ordre = dépendances + priorité. **🟢** lançable tout de suite · **🟡** mini-grooming/décision d'abord · **🎨** art (tu génères, je câble).

- **B1 ✅ Housekeeping & docs** (M · doc/tech) — REORG01 · DOC-SYNC01 · CHANGELOG-CATCHUP01 · TASK-HIST01. **Fait 2026-06-13.**
- **B2 ✅ Régulations & correctifs** — REP01 · DLG01. **Fait 2026-06-13.**
- **B3 ✅ Tests & QoL rapides** — TEST-COV01 · IDLE-MASTERY01 · VIG01 · HIDE01→HS-AURA01. **Fait 2026-06-13.**
- **B4 ✅ Déblocage des bâtiments** — BLDUNL01 + BLDUNL05 livrés ; BLDUNL02/03/04 = stub+FLAG (désormais en v1.51). **Fait 2026-06-13.**
- **B5 ✅ Chaîne de quêtes Map 1** — MQ-CHAIN01 · MQ-ELITETURN01. **Fait 2026-06-14.**
- **B6 ✅ Démarrage Greywatch + fog** — START01/02/03/04 + MQ sur board Doyen. **Fait 2026-06-14.**
- **B7 ✅ Onboarding / tutoriel** — ONB01 · ONB03 · ONB02. **Fait 2026-06-13/14.**
- **B-ART 🎨 → épique Assets v1.82** (CONT01 · UI08 · C03). **B-DON 🟡 → v1.41 Donjon** (D01-SPEC → … → D06).


> Deux familles, à groomer ensemble : **(A)** tickets de retours playtest 2026-06-07/08 (QoL, contenu, démarrage Greywatch) et **(B)** l'ancienne milestone **v2 — Refonte / ambition (L/XL)** basculée ici le 2026-06-08 (compagnons, événements, foyer, ATB, multi-univers, divinités avancées, polish). **Non groomés** : vérifier INVEST + AC avant de démarrer un M/L ; l'ordre et les décisions fines seront tranchés au grooming.

#### Reliquats v1 / v1.1 / v1.2 (relocalisés 2026-06-20, à trier)

> Tickets restés ouverts dans des milestones clôturés (v1 POC, v1.1 UI parchemin, v1.2 Profondeur) → rapatriés ici en attendant le re-tri par version/épic. Priorités converties selon l'échelle CONTRIBUTING (provisoires, à ré-arbitrer au périmètre de release).


#### Correctifs & régulations (revue code 2026-06-08)

> ↗️ **GLD03** + **ANIM03** déplacés dans le lot **« v1.1 — prêt »** (🟢, fixes safety/ux) le 2026-06-08.
- [x] **REP01 — Régulation des reputation tokens (0 / 5 élites)** (S→M) — *décidé 2026-06-08, **implémenté 2026-06-13 (B2)**.* **Règle appliquée : toute quête donne 0 token SAUF les 4 quêtes « kill-élite » = 5 tokens chacune** (`nc_oakheart_elite`, `nc_fenrot_elite`, `nc_graven_elite`, `nc_thunderhoof_elite`). Malachar (+200) reste une source à part (kill du demon-lord). **Fait** : (1) `questsSlice.completeQuest` — `repTokens = r.reputationTokens ?? 0` (corrige le `?? 1` → +1 token fantôme sur les quêtes `{gold,aura}` de maître), crédit/toast uniquement si `> 0` ; (2) `reputationTokens` mis à **0** partout (`quests.js`, `churchQuests.js`), puis **5** sur les 4 élites ; (3) ~13 tests d'économie migrés (`gameStore.test`, `churchQuests.test`, `scenarios.test` dont les sims BAL01 réécrites à la nouvelle règle). **⚠️ Reporté à REP-REBAL01** (décisions design, non tranchées ici) : (a) **le rang est calculé sur le solde *dépensable*** `reputationTokens` (`getRankInfo` dans QuestBoard) → **dépenser au Gods' Shop fait *baisser* le rang** ; (b) avec 20 tokens earnable max en v1 (4 élites) **Gold (30) / Platinum (70) / Diamond (150) deviennent inatteignables hors kill de Malachar (+200)** — Silver (10, = 2 élites) est le plafond pré-endgame ; (c) tokens église/maître/boss-de-zone restent à 0 (défaut appliqué). Lien QSV2, **REP-REBAL01**.
- [x] **DLG01 — Arbres de dialogue manquants pour les NPCs** (M) — *revue code + retour, **implémenté 2026-06-13 (B2)**.* **5 PNJ nommés** retombaient sur le `FALLBACK_DIALOGUE` générique (« stranger… ») : `guild_master` (Guildmaster Doran — `TALK_ID.guild` pointait dessus mais l'arbre n'existait pas) + `master_smith`/`knight_trainer`/`alchemy`/`academy` (absents de `TALK_ID` → `getDialogue(undefined)`). **Fait** : 5 arbres `DialogueNode` ajoutés (`guild_master` 3 nœuds, les 4 autres 2 nœuds, voix propre à chaque PNJ : Doran/Master Hollis/Sir Aldric/Vesna/Archmagus Oren) ; le mapping bâtiment→dialogue est **centralisé** dans `data/dialogues.js` (`BUILDING_DIALOGUE_ID`, source unique consommée par `SafeZone.TALK_ID`) ; tests DLG01 (chaque bâtiment mappé résout vers un arbre dédié ≠ FALLBACK). **Audit** : les **informateurs** (TAV01 « Ask around / Informants ») utilisent le **panneau de rumeurs**, pas le système `DialogueNode` → hors périmètre (pas de fallback générique). AC atteinte : plus aucun PNJ nommé ne parle générique.

#### QoL & UI

> ↗️ **WAIT01** + **VIG01** déplacés dans le lot **« v1.1 — prêt (perf/safety/ux/log) »** (2026-06-08).

- [x] ~~**HIDE01 — Masquer Aura & Concentration jusqu'au déblocage** (S)~~ — **⛔ SUPERSÉDÉ par `HS-AURA01` (2026-06-08)** : décision changée → on **affiche flouté/🔒** au lieu de masquer (le joueur doit savoir que ces stats existent). Voir HS-AURA01 (v1.2 / HeroSheet).

#### UI & QoL — session Chat 2026-06-19 (format 16:9 + panneau Église)

> Lot issu de la session de design 2026-06-19 (fichier `Downloads/TASKS.md`). **⚠️ Renumérotation au merge** : les IDs source `UI01`/`UI02` entraient en collision avec les `UI01`/`UI02` **déjà livrés** (coquille parchemin + World Map, v1.1) → renommés **`UI10`/`UI11`** ; `TST-UI` conservé. Cible : **v1.3**. Stack rappel : React 19 · Vite 8 · Zustand 5 · Tailwind 4 · Vitest 4 · JS pur.


#### Divin — église *(priorité basse mais important)*


#### Craft


#### Contenu & systèmes


#### Refonte Hero Sheet (V2 — maquette validée 2026-06-14)

> Direction **V2** (barres uniformes + jalons) validée sur maquette. Toutes UX du même écran (`HeroSheet.jsx`) — peuvent être livrées ensemble ou en petits lots. Règle de session : **chaque fix de bug embarque ses tests de régression**.


#### Démarrage restreint « Greywatch » (découpage — étend PROG01/02/03)

> Vision (playtest 2026-06-07) : le run **démarre à Greywatch**, seule la **forêt** est accessible ; **nuages (fog)** sur le reste de la carte ; les nuages **se dissipent** au fur et à mesure que les zones/spots se débloquent. ⚠️ Étend le déblocage data-driven (PROG01/02/03, livré au **niveau « grande zone »**) **au niveau des nodes de la WorldMap** (= la version *littérale* de PROG02, plus ambitieuse que l'implémentation actuelle).

- [x] **START01 — Le run démarre à Greywatch (village de départ)** (M) — **fait 2026-06-14 (B6).** `INITIAL_WORLD.currentLocation`/`currentNode` = **greywatch**. Fallout corrigé : tests QuestBoard/screens qui supposaient ironhaven (ville) placent désormais explicitement le héros en ville ; `travel.test` assertion par défaut mise à jour.
- [x] **START02 — Accès initial limité à la forêt + déblocage par node** (M) — **fait 2026-06-14 (B6).** Helper `isNodeUnlocked(nodeId, world)` + `START_OPEN_NODES = ['greywatch','ashenvale_forest']` (zones.js) ; sélecteur store `isNodeUnlocked`. WorldMap : `WmNode locked` (clic bloqué + 🔒) sur tout node ashenvale non débloqué. Tests `start02.test.js`.
- [x] **START03 — Fog of war généralisé (nuage par node) + dissipation** (M) — **fait 2026-06-14 (B6).** `.wm-fog` (nuage ☁) rendu sur chaque node ashenvale verrouillé (`data-testid=fog-node-<id>`), disparaît au déblocage (réactif à `world.unlockedNodes`). Réutilise le pattern fog PROG01/Grimspire.
- [x] **START04 — Conditions de déblocage progressif des nodes** (M) — **fait 2026-06-14 (B6) via MQ-CHAIN01.** Les conditions = le spine : compléter un palier MQ écrit ses `unlocks` (localités/spots) dans `world.unlockedNodes`, que `isNodeUnlocked` consomme. **Surfaçage** : la chaîne MQ est postée sur le board du Doyen (`QuestBoard`, gated `isMainQuestAvailable`) → le déblocage est jouable. Tests `start02.test.js` (mq02 ouvre Millhaven) + `QuestBoard.mq.test.jsx`.

---

> 🔁 **Ex-v2 basculé dans v1.3 (2026-06-08)** — les sections ci-dessous étaient l'ancienne milestone *« v2 — Refonte / ambition (L/XL) »*. Conservées dans v1.3 comme **items lourds d'ambition (L/XL)** : à prioriser/découper au grooming, séparément du backlog playtest plus léger ci-dessus.

#### Compagnons de combat (ambition L/XL)

#### Événements aléatoires

#### Foyer (HOME01 éclaté)

#### Combat & moteur

#### Boss — fidélité complète (versions allégées faites en Batch N)

#### Multi-univers

#### Divinités avancées

#### Profondeur & polish

---

### Nouveaux tickets (suggestions Claude) — assignés par version (2026-06-08)

> Audit + arbitrages utilisateur du 2026-06-08. **P1** = nécessaire / alpha solide · **P2** = bonne amélioration · **P3** = polish. (À fusionner sous les en-têtes `## v1.1` / `## v1.2` au grooming si tu préfères.)

#### → v1.1 — Prêt à coder : perf / safety / ux / log (2026-06-08)

> Filtre demandé : **« rien ne manque » (🟢) ET typologie perf/safety/ux/log**. Lot recommandé pour le prochain passage de code. *(BAL/audio/contenu/specs → v1.2 ; idle → v2.1.)*

**Perf**
- [x] **PERF-IMG01 — Lazy-loading des images (code)** (S, **P2**) — **✅ FAIT 2026-06-10.** `loading="lazy"` sur les sprites de monstres (`MonsterSprite`) et les assets `ArtSlot` (bâtiments/façades). +test. *(Scindé : la compression binaire des assets — qui n'est pas du code — est sortie dans le ticket asset/manuel **PERF-IMG02** ci-dessous, hors lot « Prêt à coder ».)*
- [x] **PERF-IMG02 — Compression des assets binaires (MANUEL — asset)** (S, **P1**) — **✅ FAIT 2026-06-10 (utilisateur, via iLoveIMG).** Gros binaires (map 9,7 Mo + `rotting_shambler`/`gloom_bat`) compressés avant le 1er push.
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

#### → v1.2 — Décision / contenu / spec requis (pas encore « prêts »)


#### → v1.2 — Académie (suite) & Refonte des quêtes v2 (2026-06-08)

> ↗️ **QSV2-LOCALITY01** + **QSV2-TURNIN01** remontés en **v1.1** (faisables maintenant, remplacent GLD03).

#### → v2.1_idle — Idle (fortement repoussé — pas de plus-value pour le moment)


> 💡 **Top « avant alpha » (mon avis)** : v1.1 → `PERF-IMG01` (avant push) + `DX-CI01` + finir l'art (`CONT01`/`UI08`/`C03`). v1.2 → `SAVE-AUDIT01` · `FIX-QUESTSNAP01` · `BAL-AUDIT01` · `CMB-ESCAPE01`.

---

### v1.4 — Donjon : chaîne de salles (à designer)

> **DÉCIDÉ (2026-06-13) — structure du donjon.** On entre dans une **map de donjon** = **9 salles en chaîne**, franchies **une par une** (linéaire) :
> - **Combat** (la plupart) — salles **1, 2, 4, 6, 7**.
> - **Repos** (repos instantané, ~plein PV/Mana) — salles **3 et 8**.
> - **Trésor** (coffre) — salle **5**.
> - **Boss** — salle **9** (warp de sortie + loot exclusif).
>
> Idle interdit (D07 ✅). Cette section **porte en v1.4** les tickets donjon existants : **D01** (flux, relocalisé v1.3), **D03** (carte, v1.3), **D06** (respawn, v1.3), **DUNREV01** (umbrella, v1.3).


---

### Backlog design consolidé — session 2026-06-08 (à groomer)

> ~80 tickets issus d'une session de design (`TASKS_additions.md` — **fusionné puis supprimé le 2026-06-20**, redondant avec ce backlog). **Map 1 figée**, **Map 2 gelée** (à activer après un test propre de Map 1). Statut inline : **READY** (spec claire) · **GROOM** (décision ouverte — question inscrite) · **SPLIT** (à découper) · **BLOCKED**. Renvois ⟶.
>
> ⚠️ **Renommages anti-collision** (IDs déjà pris/livrés ici) : skill-drops `SKL0x`→**`SKD0x`** (SKL01 = « Skills Lv5 » livré) · restructuration map `MAP0x`→**`WMAP0x`** (MAP01/02 = Canvas/QTE livrés) · tutoriel SUG-E7 `TUT0x`→**`ONB0x`** (TUT01 existant + TUT02/03 livrés).
> **Décisions verrouillées (mémo)** : idle à **5×** (combat+craft) · bijoutier = métier complet · burnout (sur-combat→−Aura / sur-craft→−Concentration, exempt si ≥2 activités, **pas** de mitigation par palier) · sets : élite = 4ᵉ pièce = arme signature, jusqu'à 9 slots · drops équip. **T1 15% / T2 7.5% / T3 3% / élite 10%** · item rare de craft **distinct** (T2 15% / T3 7.5%) · **9 slots** (ceinture reportée) · Concentration = qualité globale, grades+outils = par métier.

#### v1 — Cœur & onboarding (Map 1)

> **Reconciliation START01-04** : déjà présents (bloc « Démarrage restreint Greywatch », v1.3) — **ne pas recréer**. Clarifs de session : **START03** = le « nuage » fog par node (non posé) ; **START04** = **résolu par MQ-CHAIN01** (le chaînage de quêtes EST la condition de déblocage). *(notes ajoutées sur START03/START04.)*

**Remontés en v1 — must-do alpha (2026-06-13, décision utilisateur)**
> Doc/housekeeping à jour + assets + perf-push + tweak idle : à traiter pour/autour de l'alpha. *(Les 4 tickets assets + PERF-IMG01 gardent leur détail/statut dans `## v1.1` ; ici = priorité v1.)*
- [x] **REORG01 — Réorganisation des fichiers racine + docs** (M · P1) — créer `docs/` et y déplacer les `.md` non-essentiels (DESIGN, PLAYTESTS, ASSETS, ASSET_PROMPTS, UI_HANDOFF, CONTRIBUTING, CHANGELOG) en gardant **README + CONTEXT + TASKS** à la racine ; **supprimer `TASKS_additions.md`** (fusionné) ; ranger les artefacts épars (`ROADMAP.csv`, `PLAYTEST_WATCHLIST.txt`, `dashboard.html`, `process_assets.py`, `scripts/`) ; **retirer le fichier parasite `772`** ; **compléter `.gitignore`** (`.venv/`, `coverage/`, `__pycache__`). MAJ des liens internes. AC : racine épurée, aucun lien mort.
- [x] **DOC-SYNC01 — Aligner README + CONTEXT (état & compteurs)** (S · P1) — corriger les valeurs périmées (« 729 tests / 29 fichiers » → réel via `npm run test:run`), l'état des milestones (v1.1/v1.2 **livrés**, DEPLOY01), les notes d'assets (monstres + façades liés). AC : aucun chiffre/état faux.
- [x] **CHANGELOG-CATCHUP01 — Reprise d'historique CHANGELOG** (S · P1) — documenter le **v1.2** entier (CHQ01, GLD01-02, PROG01-03, ACA04, NPC02, I08, T12, Z07, ANIM02/03, T02, UI09, façades, GLD03) + **DEPLOY01** + PERF/SAVE/CI ; `[Unreleased]` arrêté à MON01 + UI v1.1.
- [x] **TASK-HIST01 — Reconcilier le journal « Done » + ROADMAP.csv** (S · P1) — basculer dans `## Done` (ou archiver) les tickets v1.1/v1.2 `[x]` inline absents du log ; aligner `ROADMAP.csv`. AC : un ticket livré apparaît une seule fois.
- [x] **TEST-COV01 — Couverture de tests des écrans récents** (S · P1) — **fait 2026-06-13 (B3).** Nouveau `SafeZone.cov.test.jsx` (4 tests) : **ChurchPanel** rendu reflète la **rotation CHQ01** (pool du jour + bloc suivant ≠) ; **AcademyPanel** affiche les **« Trials of Mastery »** (ACA04) + une épreuve dispo ; **VilBuilding** rend bien le **chemin de repli** (`.bld-frame` pour les bâtiments hors façade, coexistant avec `.bld-facade`). **Déjà couverts (vérifié, pas de doublon)** : **Guild/venue ville vs village** → `gld.test.jsx` + `quests.locality.test.jsx` ; **flux e2e PROG** (kill → quête → équip → level-up) → `scenarios.test.js` (scénario 1) ; smoke d'ouverture de tous les panneaux → `SafeZone.panels.test.jsx`. AC atteinte : chaque écran/flux récent a ≥1 test.
- [x] **IDLE-MASTERY01 — Seuil de maîtrise idle à 5×** (S · P1) — **fait 2026-06-13 (B3).** Constat : le seuil **combat est déjà à 5** (depuis le refacto store : `idleSlice.toggleIdle` + `ZoneView`), et **plus aucun texte « Fight 10× »** n'existe (le board affiche « N/5 kills »). Le **10 résiduel** (`WorldMap` « .../10 kills or Lv 3 ») est un **déblocage de zone** (Blighted Road), pas la maîtrise idle → laissé tel quel. **Pas de mécanique d'idle-craft** : `craftCount` n'est qu'un compteur de quêtes (Q05), il n'y a rien à unifier côté craft. **Livré** : extraction d'une **constante unique** `IDLE_MASTERY_KILLS = 5` (`idleSlice`), consommée par `ZoneView` (gate + barre + label) et aliasée par `SKILL_REVEAL_THRESHOLD` (S02, même 5×) → fin des nombres magiques dupliqués ; +2 tests de non-dérive (valeur = 5, frontière seuil-1/seuil).
- ↪ **PERF-IMG01** (S · **P1 — avant push**) — compresser les 3 gros PNG (map 9.7 Mo, rotting_shambler 5.9, gloom_bat 5.6 → squoosh) avant le 1er push *(code lazy-load déjà fait)*. **Checkbox/statut : §v1.1 Perf.**
- ↪ **CONT01** (M · P1) — finir l'art restant (3 boss dont Malachar, 6 monstres Grimspire, 2 élites route, 2 réserve, 4 façades). **Checkbox/statut : §v1.1.**
- ↪ **UI08** (L · P1) — câblage chibi (carte/combat) + portraits pixel (dialogue). **Checkbox/statut : §v1.1.**
- ↪ **CONT05** (S · P2) — optimiser gros PNG + set d'icônes SVG. **Checkbox/statut : §v1.1.**
- ↪ **C03** (S · P2) — 8 portraits perso en CharCreation. **Checkbox/statut : §v1.1.**

**Onboarding / progression Map 1**
- [x] **BLDUNL01 — Modèle `building.unlock`** (S · READY) — **fait 2026-06-13 (B4).** Modèle data-driven `data/buildingUnlocks.js` (`BUILDING_UNLOCKS` : `default`/`trigger`/`lockedReason` par bâtiment) + helper pur `isBuildingUnlocked(id, locks)`. État runtime dans `world.buildingLocks` (ids verrouillés). Store (`worldSlice`) : sélecteur `isBuildingUnlocked(id)` + actions `lockBuilding`/`unlockBuilding`. Tests `bldunl01.test.jsx`.
- [x] **BLDUNL05 — Feedback bâtiment verrouillé** (S · READY) — **fait 2026-06-13 (B4).** `VilBuilding` rend l'état verrouillé (grisé + 🔒 + `title`=raison) ; `openBuilding` refuse l'entrée + toast la raison (prime sur l'horaire BLD01). Testé (rendu `.bld-locked` + refus + toast). *Cohérence fog START03 : à raccorder en B6.*
- [x] **MQ-CHAIN01 — Chaîne de quêtes Map 1** (L) — **fait 2026-06-14 (B5a+B5b).** **Data** : `data/mainQuests.js` (MQ01-06, Doyens Elder Moira / Warden Halric*(nouveau)* / Captain Vaern ; `requires` chaînage + `unlocks` localités/spots + `mqStep` + `nextMainQuest`), enregistré dans `getQuestById`/`QUEST_NPC_REGISTRY`. **Flux** : sélecteur `isMainQuestAvailable(id)` (gate par prérequis) ; à la complétion d'un palier → `unlocks` appliqués dans `world.unlockedNodes` ; ONB02 câblé (`MQ_TUTORIAL_HINTS` + `triggerHint` à l'acceptation). Tests `mainQuests.test.js` + `mqchain.test.js`. **résout START04** (les conditions = le spine). ⚠️ **Reste pour B6** : surfacer les MQ chez le Doyen (UI) + faire consommer `world.unlockedNodes` par le gating/fog (START02/03). **Différé** : MQ03/MQ05 objectifs simplifiés (seuil de niveau, dépendaient de TIER01) ; quêtes de bâtiment BQ-* (avec BLDUNL02) ; Map 2 (MQ07-10) gelé.
- [x] **MQ-ELITETURN01 — Type de quête « élite » (remise)** (M) — *décision 2026-06-14, **fait B5a+B5b**.* Objectif `elite_turnin` (3× item rare de l'élite **OU** son arme) + résolveur : **consomme** les items rendus (ou retire l'arme rendue) et **escalade la rareté** de l'arme signature (`meta.eliteTurnins` → rare→epic→legendary…). 3 armes signature créées (Oakheart/Thunderhoof/Graven). `nc_fenrot_elite` reclassé **Map 2** (`mapTier:2` + filtre `getBoardQuests`). **Distinct des `nc_*_elite`** (placeholder de reward conservé). ⚠️ **Follow-up** : le mécanisme d'escalade est prêt mais MQ02/04/06 sont **one-time** (chaîne) → une quête de remise **répétable** (pour réellement farmer le +1 rareté) reste à créer.

> **MQ-CHAIN01 — détail (Map 1)** — *Greywatch* : `MQ01` L'éveil (Doyen → Auberge + Ashenvale Forest, kit+tuto) · `BQ-GW1` Le feu de la forge (Forgeron, 5× minerai → Forge, ressources monstres+tuto) · `BQ-GW2` Remèdes des bois (Alchimiste, 5× herbe → Alchimie) · *(Marchand ouvert d'office)* · `MQ02` La route de Millhaven (Doyen, 3× rare **Old Oakheart** OU arme → **Millhaven**, arme d'Oakheart ou +1 rareté). *Millhaven* : `MQ03` Nouveaux horizons (2× équip. **T1/T2 Ashenvale** → **Barrow Hills + Crumbled Ruins**, or + carte d'aventurier) · `BQ-MH1` Cuir et lanières (Cordonnier, 5× cuir → **Cordonnier**) · `BQ-MH2` Éclats et gemmes (Bijoutier, 5× gemme → **Bijoutier**) · `MQ04` Les portes d'Ironhaven (3× rare **Thunderhoof** OU arme → **Ironhaven**). *Ironhaven* : `MQ05` La cité de fer (2× équip. T1/T2 → marché ville) · `BQ-IH1` L'épreuve de l'Académie (→ **Académie**, tome de skill) · `BQ-IH2` La Guilde (→ **Guilde**, rang+tokens) · `MQ06` Au-delà du marais (3× rare **Graven Sentinel** OU arme → **Thornmarsh**). *Map 2 (gelé)* : `MQ07` Veteran's Playground · `MQ08` Final Outpost · `MQ09` Draconic + Vampire Castle · `MQ10` Demon Lord (élite réservé : Fenrot Devourer).

- [x] **ONB01 — Tutoriel contextuel** (M · READY) — **fait 2026-06-13 (B7).** Framework générique : registre `data/hints.js` (copie centralisée), action `triggerHint(id)` (one-shot via `meta.seenHints`, dédupliquée, **désactivable** par `meta.settings.tutorials` + toggle dans `SettingsModal`). Câblé aux 1ères occurrences : **idle_unlock** (recordKill au seuil — l'ancien hint TUT02 hardcodé est désormais routé par le framework), **first_quest** (startQuest), **first_levelup** (gainExp), **first_craft** (incrementCraftCount), **transmigration** (heroDeath). Tests `onb01.test.js`. *(absorbe l'ancien `TUT01` « Premier run guidé ».)*
- [x] **ONB02 — Chaîne MQ = fil tuto** (M) — stub posé en B7, **câblé en B5b (2026-06-14)** : `MQ_TUTORIAL_HINTS` rempli (mq02/04/06 → `mq_elite_turnin`, mq03 → `mq_new_region`) + hints ajoutés dans `data/hints.js` ; `questsSlice.startQuest` déclenche `triggerHint(getMqTutorialHint(mqStep))` à l'acceptation d'un palier principal. Testé (`mqchain.test.js`).
- [x] **ONB03 — Panneau d'aide / codex de règles** (S · READY) — **fait 2026-06-13 (B7).** Second onglet **« Rules »** dans le `CodexOverlay` (à côté de Bestiary), alimenté par `data/codexRules.js` : sections Stats, Vigor & Fatigue, Idle Mastery, Reputation & Ranks, Divinities, Transmigration. Tests dans `CodexOverlay.test.jsx`.

#### v1.x — Systèmes

**A — Skill drops physical/magic/passive** *(`SKL`→`SKD`)*

**B — Ressources droppées & tiers**

**C — Quêtes de village (adjacence)** *(pool distinct du spine MQ-CHAIN01)*

**D — Restructuration WorldMap** *(`MAP`→`WMAP`. Niveaux : Ashenvale 1-8 · Barrow Hills 6-14 · Crumbled Ruins 12-22 · Thornmarsh 20-30 · Veteran's 28-38 · Draconic 36-50)*
- [x] **WMAP01 — `worldGraph` v2** (M) — 2 conteneurs (`MAPS.map1`/`map2`), nodes typés (village/city/spot/dungeon), helpers `getMap`/`getNodeMap`, vue agrégée `ALL_NODES`/`ALL_EDGES`/`DUNGEON_NODES`. Rétro-compat : `NODES`/`EDGES`/`POS`/`areAdjacent`/`neighborsOf` === Map 1.
- [x] **WMAP02 — Nouvelles `levelRange` par zone** (S) — barème appliqué : Ashenvale `[1,8]` · Barrow Hills (`wildmere_hills`) `[6,14]` · Crumbled Ruins `[12,22]` · Thornmarsh `[20,30]`. `mapId` posé sur ashenvale=`map1` / grimspire=`map2` / blighted_road=`bridge`.
- [x] **WMAP04 — `EDGES` v2** (S) — Map 1 : 8 edges (inchangés) ; Map 2 : 5 edges (squelette) ; `MAP_BRIDGE` = `ironhaven→stonehaven`.
- [x] **WMAP05 — Re-mapping donjons** (S) — `goblin_cave` (frozen) près d'Ironhaven sur Map 1 ; `vampire_castle` (frozen) + `demon_lord` sur Map 2.

**G — Artisanat créatif & métiers étendus** *(gating 3 axes : Concentration STA03 · grade par métier · outils par métier · plafond par lieu)*

**I — Monotonie / burnout** *(distinct de la Fatigue STA01 : burnout = manque de variété)*

**J — Titres (affichage + buffs)**

**K — Équipement : drops, tiers, sets, slots** *(9 slots : casque, armure, gants, bottes, amulette, 2 bagues, arme principale, arme secondaire ; ceinture reportée)*

**L — Idle & planification**
- [x] **IDLE-MASTERY01** — *remonté en **v1*** ; **fait 2026-06-13 (B3)** — combat déjà à 5×, constante `IDLE_MASTERY_KILLS` extraite, pas d'idle-craft à unifier. Détail dans la section v1.

**Transverses**

> *(Housekeeping — REORG01/DOC-SYNC01/CHANGELOG-CATCHUP01/TASK-HIST01/TEST-COV01 **remontés en v1** ; D01-SPEC déplacé en **v1.4 Donjon**.)*

**SUG-E2 — Maîtrise du bestiaire**

#### v1.9 — Polish (game feel)


#### v2 — Ambition

**E — Embuscade (voyage, Map 2 ; s'applique aussi en idle → IDLE-INT01)**

**D — WorldMap (Map 2)**

**H — Cycle jour/nuit (complet)**

**G — Stats définitives**

**Transverses (v2)**

**SUG-E1 — Enchantement & sertissage**

**SUG-E5 — Profondeur méta / prestige**

**SUG-E6 — Compagnon / familier**

**SUG-E9 — Exploration & secrets de map**

**SUG-E10 — QoL & accessibilité**

**SUG-E2 — Bestiaire (v2)**

#### v3 — Lointain


---

## Done

> **TASK-HIST01 (2026-06-13)** : le détail par ticket des milestones ci-dessous reste **coché `[x]` inline** dans leurs sections (`## v1.1`, `## MON01`, `## v1.2`) = source de vérité unique ; ici on n'inscrit que le **niveau milestone** (on ne duplique pas les 75 tickets). `docs/ROADMAP.csv` (tracker hérité early-planning, périmé vs TASKS.md) a été **supprimé le 2026-07-03** — TASKS.md est l'unique source de vérité (récupérable via l'historique git si besoin).

### v1.2 — Profondeur & contenu (NPC → STA → PROG) (2026-06-08 → 13)
- **STA01-04** (Vigueur/Aura/Concentration + atténuations), **ITM01** (livres), **TRA01** (entraînement). **ACA01-04** (Académie, achat/revente, skills Lv5, quêtes de maître). **CHQ01** (quêtes église rotation 3j), **NPC02** (10 quêtes contenu), **Q04/Q05/Q09** (types & récompenses de quête). **GLD01/02** (Guilde + venue). **PROG01/02/03** (déblocage zones data-driven + fog + unlockZone). **Z07** (équip. par lieu). **CODEX01**, **ACH01**, **I08**, **BLD01**. **ANIM02/03** (VFX skills), **T02/T05/T12/TRM01** (transmigration). **CRF06** (antidote). *(détail `[x]` dans `## v1.2`.)*
- **MON01** — refonte bestiaire de surface (4 spots Ashenvale, 16 monstres, figurines liées) + correctifs combat/save. *(détail `[x]` dans `## MON01`.)*

### DEPLOY01 — Préparation Vercel (alpha privée) (2026-06-08)
- `vercel.json` (SPA routing), `.gitignore` durci, `index.html` meta, README §Déploiement + CONTEXT. **`public/` committé** (assets servis ; `raw/` HD exclus). **PERF-IMG01** (partiel, lazy-load) · **PERF-SPLIT01** (code-split) · **SAVE-AUDIT01** (validation schéma save) · **DX-CI01** (CI GitHub Actions). Façades liées (5/9), `ArtSlot` fallback, transition parchemin (UI09), correctifs review (GLD03, ANIM03).

### REORG01 / DOC-SYNC01 / CHANGELOG-CATCHUP01 (B1, 2026-06-13)
- Docs déplacés dans `docs/` (root = README/CONTEXT/TASKS) ; `.gitignore` complété (`.venv/`, `__pycache__`) ; README/CONTEXT compteurs à jour (729→1101 tests) ; CHANGELOG rattrapé (v1.2 + DEPLOY01).

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
