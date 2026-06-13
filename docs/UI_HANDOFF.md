# Prompt Claude Design — Loop Breaker (système UI complet)

> Colle ce document entier dans Claude Design. Il est autonome. Génère les écrans comme un seul système de design cohérent. Si l'outil propose d'y aller écran par écran, commence par l'**Écran 01 (World Map)** — il établit le système dont héritent les autres.
>
> ⚠️ Les textes entre guillemets, les labels d'interface (`Run #1`, `ASHENVALE FOREST`, `Map/Hero/Bag/Save`, etc.), les valeurs de couleurs et les noms de fichiers d'assets sont **du contenu littéral** : garde-les exactement tels quels (le jeu est en anglais).

---

## PROJET

**Loop Breaker** — un **RPG idle roguelite** PC-first (canevas fixe **1920×1080**), univers médiéval-fantasy. Un héros qui renaît explore une **carte du royaume dessinée à la main**, entre dans des zones (villages, forêts de chasse, donjons), parle à des PNJ, gère une fiche de héros & un inventaire, et lance des **boucles "auto-chasse" idle** qui farment XP/loot. Le héros meurt souvent et transmigre entre les mondes en conservant un peu de puissance à chaque fois ; le but est de briser le cycle en tuant le Demon Lord.

**Esthétique :** joyeuse, héroïque, empreinte de nature — énergie **overworld de Dragon Quest** (soleil chaud, verts luxuriants, aventure), PAS sombre/gothique. Toute l'interface est une **carte sur parchemin vieilli, diégétique, posée sur une table en bois** : le HUD est en bois sculpté, les panneaux sont des parchemins/registres, les lieux sont des médaillons à l'encre.

---

## IDENTITÉ VISUELLE (tokens canoniques)

**Couleurs (CSS custom properties) :**
```
--parchment:        #F2E0B6   papier carte vieilli — fond principal
--parchment-2:      #EAD49C   pli secondaire
--parchment-shadow: #C9A96E   bords, bordures, profondeur
--scroll-paper:     #F6E8C4   parchemin plus clair pour panneaux scroll/fiches
--ink:              #3D2B1F   tout le texte, les contours
--ink-soft:         #5C4632   texte secondaire
--forest:           #4A7C2F   Ashenvale / nature
--forest-deep:      #2D5216   arbres denses, bordures vertes
--gold:             #D4A017   halo du héros, accents, XP
--sky:              #7DB9DE   eau, mana
--danger:           #C0392B   blight, verrouillé, HP, demon lord
--stone:            #9B9080   Grimspire, désactivé/verrouillé
--amber:            #E8A020   boutons, CTA (haut du dégradé)
--amber-deep:       #B97A12   bordures/actif des boutons, labels eyebrow
--safe-green:       #50C050   villes sûres, idle actif
--sage:             #70A070   villages
--dungeon:          #7B3FA0   mystère des donjons
--parchment-dark:   #8B6914   accents bois topbar/sidebar
--wood:             #3D2B1F   base planche topbar
--wood-2:           #5A3E29   reflet planche topbar
```
Jauges — HP `#e05a4c→#C0392B` ; MP `#a4d2ee→#7DB9DE` ; XP `#f0c64a→#D4A017`.
Fond de scène (letterbox derrière le canevas) : radial `#1c140d → #3a2a1c`.

**Typographie :**
- `Cinzel` (fallback Georgia, serif) — titres, labels, boutons, chiffres. Graisses 400/600/700/800/900.
- `Crimson Text` (fallback Georgia, serif) — corps, flavor text, dialogues. 400/600 + italiques.
- Styles : titres de zone 42–46px ; dialogue PNJ 26px italique ; titres de fiche 26px (800) ; valeurs sidebar 17px ; labels de section 9–11px MAJUSCULES espacées (`.14em`), couleur `--ink-soft` ou `--amber-deep`.

**Texture :** le parchemin a un léger grain de bruit fractal (fusion multiply, ~0.5) + un liseré vieilli (ombre interne or/brun ~0.55). Approxime avec un overlay de bruit + une ombre interne.

**Rayons / bordures / élévation :** boutons 7px ; médaillons/nodes 50% ; panneaux/fiches 8px ; cartes 12px. Médaillons & bâtiments `3px solid var(--ink)` ; panneaux `1.5–3px solid var(--parchment-shadow)` ; cadre boussole `3px double var(--ink)`. Boutons : bord inférieur dur empilé `0 2px 0 rgba(61,43,31,.25)` + ombre douce `0 3px 6px rgba(61,43,31,.18)`. Fiches : ombre lourde `0 24px 70px rgba(0,0,0,.55)` + `inset 0 0 0 6px rgba(242,224,182,.5)`.

---

## LA SCÈNE (coquille partagée — chaque écran)

Canevas fixe **1920×1080** centré dans une scène sombre plein écran, mis à l'échelle avec `transform: scale(min(vw/1920, vh/1080))` pour toujours tenir, en letterbox sur le fond radial sombre. Fond du canevas = **table en planches de bois** (dégradé de planches vertical + vignette de bord). Couches, du plus haut au plus bas en z :

1. **Topbar** (hauteur 64px) — HUD en bois en haut.
2. **Bandeau breadcrumb** (hauteur 30px) — chemin de région sur une planche plus sombre.
3. **Zone carte** — une feuille de parchemin encastrée sur la table (`left/right 22px ; top 100px ; bottom 22px`) ; contient l'écran courant.
4. **Sidebar droite** — un panneau parchemin/journal flottant sur la droite de la carte (`top 96px ; right 26px ; bottom 26px ; width 286px`).
5. **Overlays** — dialogue PNJ, Hero Sheet, Inventory, toast (z le plus élevé).

### Topbar (layout unifié)
Barre en planche de bois, 64px, texte `#F2E0B6`. Groupes séparés par de fins séparateurs verticaux. De gauche à droite :
1. **Run/Niveau** — `Run #1 · Lv 1` (Cinzel 10px majuscules) au-dessus d'une fine barre XP dorée 120×8px.
2. **Jauge HP** + **Jauge MP** — chacune 150px : label + ligne `value/max` au-dessus d'une piste arrondie 13px (rayon 7px, ombre interne, remplissage dégradé ; HP rouge, MP bleu). Le remplissage anime sa largeur `.5s`.
3. spacer flex.
4. **Groupe stats** — `☀ Day 1` · `T 0/24` (compteur de tour) · `🪙 0` (jetons). Icônes 15px ; valeurs Cinzel 600 14px. **(La DayBar est fusionnée ici — pas de ligne jour/nuit séparée.)**
5. **Onglets** — pills `Map · Hero · Bag · Save`. Inactif : fond sombre translucide, texte parchemin. Actif : remplissage dégradé ambre, texte sombre, halo ambre doux. `Map` revient au monde & ferme les overlays ; `Hero`/`Bag` ouvrent les overlays ; `Save` déclenche un toast.

### Breadcrumb
Bande de bois plus sombre 30px. Gauche : chemin de région en Cinzel 11px majuscules `.12em`, `#F2E0B6`, séparé par `›` (atténué) ; le fil courant est en `--gold`. Droite : une ligne décorative "corde" en pointillés. Par écran :
- Monde : `Eldenmoor › Ironhaven`
- Village : `Eldenmoor › Ashenvale › Millhaven`
- Forêt : `Eldenmoor › Ashenvale › Ashenvale Forest`

### Sidebar droite / journal (style "scroll" par défaut)
Panneau journal 286px, papier `--scroll-paper`, montants en bois roulés en haut & en bas. Champs : clé en Cinzel 9px majuscules `.16em` amber-deep, valeur en Crimson 17px.
- **Location** — ex. `Ironhaven · Ashenvale`.
- **Deity** — `No deity chosen` (italique atténué).
- **Demon Lord** — `⚡ Malachar the Undying` (rouge danger).
- **Reputation** — `🪙 0 tokens`.
- **(Forêt uniquement) Idle Log** — sous un séparateur : liste de lignes `◆ Wolf defeated · +2g · hide` (◆ vert forêt, mot de gain en amber-deep) ; plus récent en haut, plafonné à 6 ; les nouvelles entrées apparaissent en fondu+glissé.
- **Actions** (épinglé en bas) — pile verticale de boutons parchemin pleine largeur ; le principal utilise le dégradé ambre. Varie par écran.

### Boutons (labels parchemin diégétiques)
Cinzel 600 14px ; padding 10×16 ; rayon 7px ; `1.5px solid var(--amber-deep)` ; fond dégradé parchemin ; ombre basse dure. Survol : soulèvement `-1px`, éclaircissement. Actif : enfoncement `+1px`. `.primary` : dégradé amber→amber-deep, texte sombre. Emoji/icône + label.

---

## ÉCRAN 01 — WORLD MAP (Eldenmoor)

Carte du royaume sur parchemin, entourée d'un **cadre boussole** décoratif (double-filet fin + fioritures d'angle à l'encre).

**Champs de zone** — grosses taches de couleur organiques aux bords doux teintant les régions :
- **Ashenvale** (vert) : environ `left 60 top 150 w 940 h 800`. Label `ASHENVALE · Lv 1–20` (Cinzel 800, 30px, forest-deep) vers le haut-gauche. Ellipses de brume blanche floue, lente dérive horizontale.
- **Grimspire** (verrouillé, gris) : environ `left 1180 top 250 w 420 h 470`. Label `Grimspire 🔒` + `Level 21+` (gris stone). Survol → tooltip `⚠ Grimspire — Reach Level 21 to unlock`. Entièrement désaturé.

**Trails** — courbes à l'encre en pointillés reliant les nodes (`stroke-dasharray 2 9`, encre, opacité .65). La **Blighted Road** vers Grimspire est un **trail de danger rouge** avec un marqueur `💀` + label `The Blighted Road` + chip `⚠ Reach level 15 to unlock`.

**Nodes de carte** — médaillons de lieu (`translate(-50%,-50%)` aux x/y). Chaque node = un médaillon circulaire (remplissage parchemin, `3px solid --ink`, reflet radial, ombre portée) contenant le **sprite** du lieu, avec une **plaque de nom** en dessous (Cinzel 700 13px sur chip papier translucide) et un **tag** italique optionnel (11px, coloré). Tailles : major 92px, town 72px, spot 60px. Survol : scale 1.05, soulèvement, z augmenté. Les nodes sûrs ont un anneau de halo coloré (ville vert, village sage). Les huit nodes d'Ashenvale :

| Node | Taille | Pos (x,y) | Tag | Au clic |
|---|---|---|---|---|
| **Ironhaven** | major | 360,600 | Major City · safe (halo or) | Définir base + toast |
| **Millhaven** | town | 560,800 | Village · safe | → écran Village |
| **Greywatch** | town | 230,380 | Village · safe | → écran Village |
| **Ashenvale Forest** | spot | 640,470 | Hunting · Lv 1–8 | → écran Forêt |
| **Thornmarsh** | spot | 800,720 | Hunting · Lv 4–10 | → écran Forêt |
| **Crumbled Ruins** | spot | 470,250 | Hunting · Lv 6–12 | → écran Forêt |
| **Barrow Hills** | spot | 880,360 | Hunting · Lv 8–14 | → écran Forêt |
| **The Hollow Crypt** | spot (donjon) | 720,200 | ? Dungeon discovered | Tooltip au survol |

**Node donjon** — médaillon violet avec un grand glyphe `?` + aura pulsante derrière. Tooltip au survol : `A mysterious portal hums with dark energy…`.

**Nodes verrouillés** — en niveaux de gris, badge `🔒` en haut-droite, `cursor: not-allowed`.

**Avatar du héros** — se tient au node de base (Ironhaven) : le **sprite chibi du héros** (~38×56) avec une **ellipse de halo doré** pulsante en dessous + plaque de nom `Kael`. Se déplace entre les nodes via une transition `left/top .6s` (marche).

**Actions sidebar (monde) :** `🌙 Sleep` (principal → toast, avance d'un jour, restaure HP/MP), `⚔ Hero Sheet`, `🎒 Inventory`.

---

## ÉCRAN 02 — VILLAGE (Millhaven)

Un parchemin de zone qui **se déroule** tandis que le parchemin du monde se referme (monde faiblement visible derrière). Le cadre décoratif passe à **vine** (botanique) ici. Bouton retour `← Map` en haut-gauche ; en-tête centré `MILLHAVEN` + `Village · Ashenvale` (italique).

- **Place du village** — grande ellipse de terre (radial `#cdb079→#b8975f`, ombre interne) centrée ~`725,470`, avec un sprite de **puits (well)** au milieu.
- **Chemins de terre** — traits beige épais (16px) arrondis rayonnant du puits vers chaque bâtiment.
- **Bâtiments** — `translate(-50%,-50%)` : un **sprite** de bâtiment encadré (`3px solid --ink`, rayon 8px) + une **enseigne en bois suspendue** (dégradé or-brun, texte clair, icône + nom) + un sous-titre italique. Survol : scale 1.04, soulèvement. Clic → overlay PNJ de ce bâtiment.

| Bâtiment | Pos | Icône | Sous-titre | PNJ |
|---|---|---|---|---|
| **The Hearth Inn** | 470,320 | 🍺 | Marta, Innkeeper | inn |
| **Church of the Old Gods** | 980,320 | ⛪ | Choose a deity | church |
| **Sir Aldric** | 470,720 | ⚔ | Knight Trainer | knight |
| **Merchant's Stall** | 980,720 | 🎪 | Wares & supplies | merchant |

- Sprites décoratifs : `hens` (~620,560), `barrels` (~840,540).
- **Avatar du héros** se tient près du puits (~725,420).
- **Actions sidebar (village) :** `🛏 Sleep at Inn` (principal → ouvre l'overlay PNJ de l'auberge), `⚔ Hero Sheet`, `🎒 Inventory`.

---

## ÉCRAN 03 — FORÊT DE CHASSE (Ashenvale Forest)

Parchemin de zone, cadre vine, bouton retour, en-tête centré `ASHENVALE FOREST` (42px) + sous-titre flavor `Ancient woodland filled with wolves and wandering spirits. · Rec. Lv 1–8`. Lavis de sol vert doux + brume dérivante.

**Clearings** (stations d'auto-chasse idle) — chacune = un **disque vert** circulaire (~168×132, `3px solid --forest-deep`, remplissage radial vert) avec un **sprite de monstre** (en haut) + un détail rond de **terrain**, une **plaque de label** en dessous, une **barre de progression de kills** (130×8, forest→safe-green), et une ligne de statut. États :
- **Disponible** — cliquable ; affiche `kills/killMax`.
- **Idle actif** — anneau de halo safe-green + badge pulsant `◆ IDLE` (en haut-droite). La boucle d'auto-chasse en cours.
- **Verrouillé** — en niveaux de gris, badge `🔒`, statut `Fight 10× to unlock idle`.

| Clearing | Pos | Monstre | Terrain | Kills | État | Drop |
|---|---|---|---|---|---|---|
| **Ashwood Wolves** | 420,580 | wolf | dense trees | 10/10 | disponible | hide |
| **Mistveil Shamblers** | 760,560 | shambler | misty hollow | 4/10 | verrouillé | ectoplasm |
| **Hollow Bats** | 1080,600 | bat | rocky cave | 0/10 | verrouillé | wing |

Cliquer une clearing déverrouillée la bascule en actif (une seule à la fois). En actif, un tick se déclenche toutes les ~2.2s : +1 kill, `+1–3g` XP, ~40% jeton, et prépose une ligne à l'Idle Log. **Avatar du héros** se tient à l'entrée de la forêt (~160,560).

**Sidebar (forêt) :** section Idle Log ; actions `🌙 Sleep` (principal), `⚔ Hero Sheet`.

---

## ÉCRAN 04 — OVERLAY DE DIALOGUE PNJ (ex. Marta, the Hearth Inn)

Panneau de dialogue ancré en bas sur un scrim sombre (`rgba(20,12,6,.6)`). Le scrim apparaît en fondu ; le panneau glisse vers le haut. Cliquer le scrim ferme.

**Panneau** — ~1180×392, papier `--scroll-paper`, bords à montants roulés à gauche & à droite, 30px au-dessus du bas. Deux colonnes :
- **Colonne portrait** (~340px) — un **cadre de portrait à bordure woodgrain** épais contenant le **sprite de portrait** du PNJ, avec le **nom** du PNJ (Cinzel 700 20px) + label de **rôle** en dessous.
- **Colonne corps** — un **eyebrow** (`{name} — {role}`, amber-deep majuscules), le **dialogue** en grand Crimson italique (26px, guillemets courbes), et une rangée de boutons d'action (principal en premier) + `✕ Close`.

| PNJ | Nom · Rôle | Dialogue | Actions |
|---|---|---|---|
| **inn** | Marta · Innkeeper | "Welcome, traveler. Weary bones find rest here, and the ale's not bad either." | 🛏 Rest · 📜 Quest Board · 💬 Talk |
| **church** | Brother Caelum · Cleric | "The Old Gods still listen, child. Pledge your heart, and their favor shall guide your blade." | 🙏 Choose a Deity · 💬 Talk |
| **knight** | Sir Aldric · Knight Trainer | "So you'd learn the blade? Steel is patient, lad. Train, and I'll make a hero of you yet." | ⚔ Train · 📜 Skills · 💬 Talk |
| **merchant** | Goodwife Pell · Merchant | "Fresh from the road! Potions, blades, trinkets — all fairly priced, I swear it on me cart." | 🎒 Buy · 🪙 Sell · 💬 Talk |

Le portrait doit pouvoir **changer d'émotion** selon le ton du dialogue (Talk/Calm/Smile/Sadness/Aggression/Special).

---

## ÉCRAN 05 — OVERLAY HERO SHEET

Fiche modale centrée (~1240px de large, max-height 880px) sur scrim ; s'ouvre via l'onglet `Hero`. Papier `--scroll-paper`, bordure 3px parchment-shadow + anneau papier interne 6px, ombre lourde. En-tête : titre `Kael` + méta `Wanderer · Run #1 · Level 1` ; `✕` fermer (rouge danger au survol). Deux colonnes :

**Gauche (~340px) :**
- **Portrait** — sprite de héros encadré woodgrain, haut (~300px).
- **Equipment** — label de section + grille 2 colonnes de 6 slots (Weapon / Off-hand / Head / Body / Hands / Trinket), chacun une cellule 64px + nom de l'item (vide = `— empty —` italique atténué). Exemple : Weapon `iron shortsword`, Off-hand `wooden shield`, Body `leather jerkin` ; le reste vide.

**Droite (blocs de section, chacun avec un `.pb-title` amber-deep souligné) :**
- **Vitals & Attributes** — trois cartes de stats dérivées (100/100 Health rouge, 60/60 Mana bleu, 30/100 Experience) puis une grille d'attributs 2 colonnes : nom (Cinzel 600 14px) + barre fine (valeur/12, amber→gold) + valeur. Valeurs : Strength 8, Vitality 9, Dexterity 6, Intellect 5, Faith 3, Luck 4.
- **Derived** — quatre cartes : Attack 14, Defense 11, Speed 7, Crit 5%.
- **Skills** — lignes `.skill` (tuile icône + nom + desc italique) : Cleave `⚔ A heavy overhead strike.`, Guard `🛡 Brace to halve incoming damage.`, et une ligne verrouillée `✦ — Unlocks at Level 4.` (grisée).
- **Allegiance** — Deity `No deity chosen` (atténué) + Demon Lord `⚡ Malachar the Undying` (danger).

---

## ÉCRAN 06 — OVERLAY INVENTORY

Fiche centrée (~1080px de large) sur scrim ; s'ouvre via l'onglet `Bag`. En-tête : `Inventory` + méta `Knapsack · 6 / 24 slots used` ; `✕` fermer. Deux colonnes :

**Gauche — Carried Items :** barre d'outils avec label `Carried Items` + une **pastille d'or** (`🪙 124 gold`, dégradé ambre). En dessous, une **grille de sac 6 colonnes** de cellules carrées (1:1, rayon 8px, remplissage parchemin, ombre interne). Cellules remplies : sprite d'item + badge de **quantité** (bas-droite, Cinzel 700) + nom de l'item en légende dessous. Cellules vides : bordure pointillée + remplissage léger. Items exemples : Health Potion ×3, Mana Draught ×1, Wolf Hide ×5, Iron Ore ×2, Rusted Key ×1, Bread ×4 ; le reste vide (24 au total).

**Droite — Equipped** (~300px) : la même grille d'équipement 6 slots que la Hero Sheet, mêmes items exemples.

---

## ASSETS — sprites réels (remplacer les placeholders)

Le jeu mélange **deux couches visuelles cohérentes**, séparées par contexte :

**Couche A — chibi cartoon (contour épais), pour les sprites de carte & de combat :**
- **Avatar du héros** (placeholder v0/v1) = le sprite chibi **"Necromancer of the Shadow"** — une petite figure encapuchonnée sombre avec les séquences d'animation **Idle Blinking / Walking / Dying**. Utilise Idle au repos/sur la carte, Walking lors du déplacement entre nodes, Dying à la mort en combat. *(Placeholder : il rend plus sinistre qu'héroïque ; il sera remplacé plus tard par un chibi héroïque plus lumineux sans changer le layout. Traite le slot du héros comme ~38×56 sur la carte, plus grand en combat / portrait ~300px de haut sur la Hero Sheet.)*
- La même famille chibi est le style cible pour les **sprites de carte/combat restants à sourcer** (ennemis, façades de bâtiments, well/hens/barrels, boss Malachar).

**Couche B — portraits pixel-art semi-réalistes (128×128, 6 émotions chacun : Talk/Calm/Sadness/Smile/Aggression/Special), utilisés UNIQUEMENT dans les overlays de dialogue (Écran 04), encadrés par le cadre woodgrain pour que le style se lise comme un "gros plan de personnage" intentionnel :**
- `NPC_1` — homme âgé barbu aux cheveux blancs → **Sir Aldric, Knight Trainer / maître guerrier**.
- `NPC_2` — chauve, barbe rousse, costaud → **Forgeron / Master Smith**.
- `NPC_3` — femme aux cheveux auburn → **Marta, Innkeeper** (ou Alchimiste).
- `NPC_4` — homme plus jeune aux cheveux sombres → **Marchand / maître de Guilde**.
- `Queen` — elfe noire, cornue, royale (6 émotions) → **maître mage (Académie)** ou PNJ d'histoire spécial / avatar de divinité.
- Le portrait change d'émotion selon le ton du dialogue.

**Règle stricte :** ne jamais placer un sprite chibi (Couche A) et un portrait pixel (Couche B) dans le même cadre à la même échelle. Les portraits vivent dans les overlays de dialogue ; les sprites chibi vivent sur la carte / en combat.

**Encore à sourcer (même famille chibi, pour la cohérence) :** un vrai héros chibi héroïque (pour remplacer le nécromancien), les façades de bâtiments, les sprites de monstres restants, le boss Malachar, et les portraits pour le prêtre / l'alchimiste / le chef de village / les divinités non couverts ci-dessus.

**Icônes :** les emoji sont acceptables comme stand-ins rapides (⚔ 🛡 🪙 🌙 🛏 🍺 ⛪ 🎪 🔒 ☀ ⚡ ✦) ; à remplacer plus tard par un vrai set d'icônes (ex. SVG game-icons.net recolorés à la palette).

**Polices :** Cinzel + Crimson Text (Google Fonts).

---

## ANIMATIONS / INTERACTIONS

| Élément | Animation | Spec |
|---|---|---|
| Ajustement scène | `transform: scale()` | ajuste 1920×1080 au viewport au chargement/redim |
| Remplissage HP/MP/XP | largeur | `.5s cubic-bezier(.4,.8,.4,1)` |
| Survol node/bâtiment | scale + soulèvement | `transform .14s ease` |
| Déplacement avatar héros (marche) | left/top | `.6s cubic-bezier(.4,.8,.4,1)` |
| Halo héros / badge idle | pulse | boucle 2.4s / 1.8s |
| Aura donjon | scale+fade | boucle 2.2s |
| Brume | dérive horizontale | boucle 8s |
| Échange de parchemin (entrée/sortie de zone) | enroule le monde + déroule la zone | **≤350ms**, même sens aux deux niveaux (vertical, haut→bas) |
| Entrée scrim / panneau / fiche | fondu / glissé-haut | scrim `.2–.25s`, panneau/fiche `.3–.35s` (utilise un fill mode pour que les overlays ne restent jamais transparents) |
| Entrée Idle Log | fondu + glissé | `.4s` |

**Navigation :** clic sur un node de carte → entrer Village/Forêt (échange de parchemin) ; `← Map` ou onglet `Map` → monde. Clic sur un bâtiment → overlay de dialogue PNJ. Bascule d'une clearing de forêt → démarre/arrête l'auto-chasse. Sleep/Rest → avance d'un jour, reset le tour, restaure HP/MP. Toasts : bulle sombre en bas-centre, bordure dorée, italique, auto-dismiss ~2.6s.

**Note budget :** garde l'animation d'échange de parchemin skippable après le premier run (second clic / Espace) — la navigation se produit des dizaines de fois par session.

---

## À FAIRE / À ÉVITER

**À faire :** parchemin & bois chaleureux ; couches chibi + portrait pixel gardées séparées ; états de survol clairs ; verrouillé = désaturé + cadenas + tooltip ; le breadcrumb montre toujours la position ; HP/MP toujours dans la topbar.

**À éviter :** fonds noir pur ou sombre `#0a0a0f` ; UI plate style Material ; néon/sci-fi ; nodes surchargés ; mélanger sprites chibi et portraits pixel à la même échelle dans un même cadre.
