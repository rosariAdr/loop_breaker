# CMB-DIR01 — Phase 1 : analyse de références (combat 2D tour par tour)

> **Ticket** : `CMB-DIR01` (épique v1.44 ⚔ COMBAT-ATB) — *direction artistique & présentation du combat, maquettes avant code*.
> **Phase 1/4** : références. Phase 2 (exemples d'Adrian) fournie en parallèle → intégrée ci-dessous.
> **Déclencheur** (review 2026-07-19) : le combat actuel est jugé « pas glamour, pas assez stratégique » visuellement.
> **Hors scope** : tout code de jeu, les sprites de monstres (CONT01).

Ce document n'est pas un catalogue de jolis écrans : c'est l'extraction des **règles de composition**
transférables à notre écran de combat, à partir des deux références retenues par Adrian. Il sert de base
argumentée aux 2 directions maquettées en phase 3.

**Références écartées** : Octopath Traveler (rejetée par Adrian), Slay the Spire (deck-builder — pas de
party, grammaire d'action trop différente), Sea of Stars (utile seulement sur les QTE, traité en CMB-QTE01).

---

## 1. Darkest Dungeon — l'architecture de l'information

Ce que la capture montre, en s'en tenant à la composition :

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│      ▓ ▓ ▓ ▓                          ▓ ▓ ▓ ▓                    │  arène latérale :
│     [4 héros en rang]      ⟷      [4 ennemis en rang]            │  2 lignes qui se font face
│     ▁▁▁ ▁▁▁ ▁▁▁ ▁▁▁                ▁▁▁ ▁▁▁ ▁▁▁ ▁▁▁              │  barres de vie AU SOL
├───────────────────────────────────┬──────────────────────────────┤
│ ◧ WILMA — Grave Robber            │                              │
│   [◨][◨][◨][◨][◨][◨][✕]           │      carte du donjon         │
│ ─────────────────────────         │                              │
│ ♥ 20.0/20.0   ⚡ 10.0/100          │                              │
│ ACC 90  CRIT 10%  DMG 4-7         │                              │
│ DODGE 10  PROT 0%  SPD 4          │                              │
│ [équipement] [babioles]           │                              │
└───────────────────────────────────┴──────────────────────────────┘
```

**Ce qu'Adrian retient** : le placement des ennemis, la disposition des skills et des actions, les stats du
personnage joué.

Les trois règles qui font marcher ça :

**① Le rang est une donnée de jeu, pas une mise en page.** Les 4 héros sont alignés en profondeur ; la
position détermine quels skills sont utilisables et qui est atteignable. La conséquence de composition est
que l'arène est **latérale** — deux lignes qui se font face — et non verticale. Chez nous, l'AGI joue le
rôle que le rang joue là-bas ; mais la leçon reste : *l'arène doit rendre lisible la relation entre les deux
camps*, pas les empiler.

**② Les barres de vie vivent au sol, pas dans des panneaux.** Une barre segmentée fine sous chaque figurine,
claire côté héros, rouge côté ennemi. Zéro encadrement. On lit l'état de 8 combattants d'un seul balayage
horizontal, sans jamais quitter l'arène des yeux. C'est le contraire d'une carte par ennemi avec son cadre
et son titre.

**③ Les stats du personnage actif restent affichées pendant qu'on choisit.** ACC / CRIT / DMG / DODGE / PROT /
SPD sont là, en colonne monospace, en permanence. C'est **ça** qui donne la sensation « stratégique » : la
décision se prend avec les chiffres sous les yeux, jamais de mémoire ni en allant les chercher ailleurs.
Notre écran actuel oblige à sortir vers la Hero Sheet — c'est probablement la première cause du ressenti
« pas assez stratégique ».

**À ne pas importer** : la palette (désaturée, quasi monochrome, rouge sang) et la densité — Darkest Dungeon
assume un écran chargé et anxiogène. C'est exactement l'inverse de la direction voulue (§3).

---

## 2. Chained Echoes — la lisibilité du tempo

```
┌──────────────────────────────────────────────────────────────────┐
│ ◆◇◇◇ No Battle Effect          ╭─────────────────────────────╮   │
│                                │ (◉)(◉)(◉)(◉)(◉)(◉)(◉)        │   │  ← file des tours
│                                │  Act  Next                  │   │     HAUT-DROITE
│        ▓ ▓ ▓            ▓ ▓    ╰─────────────────────────────╯   │
│      [ennemis]        [party]                                    │  décor réel, pas d'arène abstraite
│                                                                  │
├─ « Strong phys Atk (one or all)… » ──────────────────────────────┤  ← ruban de description
│ Attack  │ Yoko Giri  10 │ Deathblow      10 │      ┌──────────┐  │
│ Skills ▸│ Windslash  10 │ Shadowstep     10 │      │◧ HP 0080 │  │
│ Items  ▸│ Provoke    10 │ Counter Stance 10 │      │◧ HP 0060 │  │  ← statut party
│ Defend  │ ---           │ ---               │      │◧ HP 0070 │  │     BAS-DROITE
└─────────┴───────────────┴───────────────────┘      └──────────┘  │
```

**Ce qu'Adrian retient** : la disposition des personnages, la disposition de la fenêtre des actions, et la
vision des tours de chacun en haut à droite.

**① La file des tours en haut à droite, en portraits encadrés.** ~7 entrées, héros et ennemis mélangés,
distingués par la **couleur du cadre** (rouge = ennemi, chaud/or = héros) et non par un libellé. Deux
marqueurs seulement : `Act` (celui qui joue) et `Next`. C'est la solution la plus économique que j'aie vue
au problème exact de CMB-ATB02 : elle tient dans un coin, elle se relit en un coup d'œil, et elle supporte
un nombre variable de combattants. Le coin haut-droite est aussi le bon endroit chez nous : il n'entre en
concurrence ni avec l'arène (centre) ni avec les actions (bas).

**② La fenêtre d'action est une grille à 2 niveaux, jamais un empilement.** Colonne 1 = les 4 verbes
permanents (Attack / Skills / Items / Defend), colonnes 2-3 = le contenu du verbe sélectionné, avec le
**coût aligné à droite** de chaque ligne. Le bloc a une **taille fixe** : passer de « Attack » à « Skills »
ne fait pas bouger la mise en page. Et au-dessus, un **ruban d'une ligne** décrit le skill survolé — c'est
lui qui remplace les tooltips flottants. Pour nous, cette colonne de coût alignée est directement le bon
support pour la grille `ACTION_COSTS` de CMB-COST01 (type immédiate/préparation + rank de tempo).

**③ Le statut de la party est un tableau numérique compact, séparé de l'arène.** 4 lignes portrait + HP + TP
en chiffres, en bas à droite. Pas de barres : des nombres. Contrairement à Darkest Dungeon, l'info de groupe
n'est pas au sol — parce que les personnages sont posés sur un **décor réel** et non sur une scène abstraite,
donc y coller des barres salirait l'image.

**④ La palette est exactement la cible.** Lumière du jour, verts de végétation, bois, pierre chaude, or
saturé, ciel. Le combat n'est pas une pièce sombre : c'est une clairière. C'est ce qui rend l'écran
« léger » alors qu'il affiche autant d'informations que Darkest Dungeon.

---

## 3. La bascule de direction artistique (décision à acter)

Adrian, phase 2 : *« heroic medieval fantasy donc assez léger, magic, centré nature et courage, des couleurs
plus chaudes que sombres — un peu en contraire avec ce qu'on avait jusque maintenant »*.

C'est une **évolution explicite de UI09**, que le ticket autorisait (« rester cohérent avec l'identité
takeover sombre + Cinzel + or, **ou la faire évoluer explicitement** »). Il faut donc l'acter.

Bonne nouvelle : ce n'est pas une refonte, c'est une **réconciliation**. Les tokens chauds existent déjà et
servent tout le reste du jeu — c'est uniquement le registre « takeover sombre » qui est en écart :

| Registre | Tokens actuels | Statut |
|---|---|---|
| Monde (carte, village, zones) | `--parchment #f2e0b6` · `--forest #4a7c2f` · `--wood #3d2b1f` · `--amber #e8a020` · `--gold #d4a017` · `--sky #7db9de` · `--sage #70a070` | ✅ déjà la cible |
| Takeover (Combat, GodsShop, DivineCall, PostMortem) | `--color-bg #0a0a0f` · `--color-surface #161210` | ⚠️ à faire évoluer |

Autrement dit : le combat ne quitte pas l'identité du jeu, **il la rejoint**. Cinzel + or restent (ils sont
déjà chauds et « heroic medieval »), c'est le fond quasi-noir et la dominante rouge sang qui sautent au
profit de bois, pierre chaude, feuillage et lumière.

**Ce que ça implique pour les maquettes** :

- Fond d'arène = un **lieu éclairé** (lisière de forêt, cour de pierre, clairière), pas un vide noir. Prompts
  assets Gemini à dériver (manifeste `asset_forge`).
- La **magie** est une source de lumière chaude dans l'image (VFX ambre/or/vert), pas un néon froid sur fond noir.
- Le **courage** se lit dans la posture et l'échelle des figurines — héros lisibles, pas des silhouettes.
- Contraste à surveiller : sur fond clair, les barres de vie et les intents doivent rester lisibles. C'est
  le risque technique n°1 de la bascule, à valider en maquette et pas en théorie.
- ⚠️ **Portée à trancher** (question ouverte, §6) : est-ce que la bascule concerne *le seul écran de combat*,
  ou aussi les 3 autres takeover (GodsShop, DivineCall, PostMortem) ? Le Divin a été explicitement gardé
  « sombre/mystique » en UI09.

---

## 4. Ce que les deux références disent ensemble

Les recoupements sont les règles les plus solides — chacune est confirmée par deux jeux qui n'ont ni le même
genre, ni la même palette, ni le même moteur.

| # | Règle | DD | CE | Notre écart actuel |
|---|---|---|---|---|
| R1 | **Opposition latérale**, jamais verticale — les deux camps se font face | ✅ | ✅ | ❌ ennemis en haut / héros en bas |
| R2 | **Zone d'action à taille fixe et toujours réservée** — aucun saut de mise en page | ✅ | ✅ | ❌ `ActionPanel` monté/démonté selon la phase |
| R3 | **Les chiffres de décision sont visibles pendant la décision** (stats, coûts) | ✅ stats | ✅ coûts | ❌ il faut sortir vers la Hero Sheet |
| R4 | **Le camp allié est un groupe**, pas un individu — la place est prévue dès le départ | ✅ 4 | ✅ 4 | ❌ `HeroCard` unique, centré |
| R5 | **Codage par la couleur du cadre**, pas par du texte (ami/ennemi/actif) | ✅ | ✅ | ~ partiel |
| R6 | **Une seule zone de texte narratif**, en bande — pas de tooltips flottants qui masquent l'arène | ✅ | ✅ | ~ `CombatLog` en pied |

**R4 est le point le plus structurant.** Adrian le formule directement : *« comme au futur on parlait d'avoir
des compagnons, ça pourrait être utile de penser l'UI pour plusieurs personnages »*. C'est juste, et c'est
peu coûteux **maintenant** : réserver 3-4 emplacements alliés dans la composition ne change presque rien à
l'écran solo (le héros occupe l'emplacement 1), alors que rétro-adapter une composition centrée sur un
personnage unique obligerait à tout redessiner à l'arrivée de v1.61. **Les deux directions de phase 3 seront
donc maquettées en 1 héros ET en 4 personnages**, pour vérifier que la composition tient dans les deux cas.

---

## 5. Diagnostic de l'écran actuel

Lecture de [`src/screens/Combat.jsx`](../../src/screens/Combat.jsx) (structure, pas rendu) :

```
[bouton fuite]
├─ ennemis .............. flex justify-center, gap-10        ← empilement vertical (viole R1)
├─ séparateur VS + PhaseIndicator
├─ HeroCard .............. flex justify-center, 1 seul       ← solo câblé en dur (viole R4)
├─ ActionPanel ........... monté SI phase==='player'         ← saut de layout (viole R2)
└─ CombatLog
```

Quatre constats, par ordre d'impact :

1. **L'empilement vertical gaspille le 16:9.** Sur un stage 1920×1080, ennemis-en-haut/héros-en-bas laisse
   d'immenses marges latérales vides et écrase la hauteur utile. C'est la principale raison pour laquelle
   l'écran ne « fait pas bataille ».
2. **Aucune file de tours n'existe** — normal, c'est l'objet de CMB-ATB02, mais ça signifie que la place
   doit être réservée dès la maquette, pas ajoutée après.
3. **Aucun chiffre de décision à l'écran** (R3). C'est le levier le moins cher et le plus rentable sur le
   ressenti « stratégique » : afficher SPD/CRIT/DMG et le coût des actions ne demande aucun moteur.
4. **`ActionPanel` conditionnel** : l'écran change de hauteur entre le tour du joueur et celui de l'ennemi.

À conserver, en revanche : `EnemyCard` sait déjà porter sélection, hit, attaque, VFX et nombres flottants ;
l'onde AoE et le shake d'arène existent. Le feedback de coup n'est pas à réinventer — c'est la **composition**
qui est en cause, pas les effets.

---

## 6. Ce que je maquette en phase 3

Deux directions qui appliquent toutes deux R1-R6 et la palette chaude, mais qui tranchent **différemment le
compromis lisibilité / spectacle** :

**Direction A — « Le rang »** *(héritage Darkest Dungeon)*
Arène latérale, party à gauche en ligne, ennemis à droite, barres de vie au sol. Bandeau de tours horizontal
en haut. Bloc du personnage actif en bas à gauche avec **ses stats en permanence**. Pari : la densité
d'information maximale, on assume un écran « tableau de bord ».

**Direction B — « La clairière »** *(héritage Chained Echoes)*
Arène posée sur un décor réel et lumineux, party à droite, ennemis à gauche. File des tours en **portraits
encadrés en haut à droite**. Fenêtre d'action en grille 2 niveaux en bas à gauche avec coûts alignés, ruban
de description au-dessus, statut de la party en tableau numérique en bas à droite. Pari : l'image d'abord,
l'information en périphérie.

Les deux seront livrées **cliquables, à l'échelle réelle 1920×1080**, en variante 1 héros et 4 personnages,
avec des valeurs de coûts marquées comme provisoires tant que CMB-COST01 n'est pas actée.

---

## 7. Questions ouvertes (à trancher avec les maquettes, pas avant)

1. **Portée de la bascule chaude** — combat seul, ou les 4 écrans takeover ? (DivineCall a été délibérément
   gardé sombre/mystique en UI09.)
2. **Barres au sol (DD) ou tableau numérique (CE)** pour l'état des alliés ? Dépend du fond : sur un décor
   dessiné et clair, les barres au sol salissent — c'est justement pour ça que CE ne les met pas.
3. **Où vivent les intents ennemis** (CMB-INT01) : ancrés sur la carte de l'ennemi, dans la file des tours,
   ou les deux ? Les deux références télégraphient peu — c'est le point où on n'a pas de modèle à copier et
   où la maquette devra vraiment décider.
4. **CMB-COST01** n'est pas actée : les coûts affichés en maquette sont des placeholders. Si la grille change
   beaucoup, la colonne de coûts peut devoir être relue.

---

*Phase 1 close. Phase 2 (exemples Adrian) intégrée : Darkest Dungeon + Chained Echoes, captures dans
`design/reference/screenshots/combat/`. Prochaine étape : phase 3 — les 2 directions en artifacts.*
