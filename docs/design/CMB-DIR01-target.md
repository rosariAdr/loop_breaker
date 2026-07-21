# CMB-DIR01 — Maquette cible annotée (direction A « Le rang »)

> **Statut** : ✅ validée par Adrian le 2026-07-21. Ce document est le **livrable de clôture** du ticket
> (AC : ≥2 directions proposées ✅, 1 validée ✅, maquette cible annotée archivée dans `docs/` ✅).
>
> - **Maquette interactive** : `docs/design/CMB-DIR01-mockups.html` (bascules zone × rencontre × groupe).
> - **Analyse de références** : `docs/design/CMB-DIR01-references.md`.
> - **Kit de composants** : `design/combat/` → poussé dans le Design System (`components/combat/`).
> - **Assets requis** : `docs/ASSET_PROMPTS.md` §11 (🔴 bloquant).

---

## 1. Le plan de l'écran (1920 × 1080)

```
┌────────────────────────────────────────────────────────────┐  0
│  TurnBand — 110 px                                         │
│  ◈◈◈◈◈◈◈ Act→Next                    Ashenvale · Lv 1-8    │
├────────────────────────────────────────────────────────────┤  110
│  ArenaBackdrop (peinture du spot + calque élite)           │
│                                                            │
│   party (gauche)                    ennemis (droite)       │  570 px
│   ▓ ▓ ▓ ▓                                ▓ ▓ ▓             │  (52,8 %)
│   ▬▬ ▬▬ ▬▬ ▬▬                            ▬▬ ▬▬ ▬▬          │
├──────────────────────┬─────────────────────────────────────┤  680
│ ActiveCharacter      │ ActionGrid                          │
│ 420 px               │   ribbon (une ligne)                │  400 px
│ portrait + nom/classe├──────────┬──────────────────────────┤  (37 %)
│ HP / MP              │ verbes   │ skills : nom · mp · rank │
│ STR AGI INT          │ 150 px   │ 2 colonnes               │
│ DEF CRIT SPD         │          │                          │
└──────────────────────┴──────────┴──────────────────────────┘  1080
```

Proportions vérifiées en rendu : **arène 52,8 %**, **console 37 %**, bandeau 10,2 %. Ce sont les ratios de
Darkest Dungeon à ±2 points, et ils tiennent en 1 héros comme en 4 personnages.

---

## 2. Les six règles, et où elles atterrissent

| Règle (phase 1) | Composant qui la porte | Vérifiable comment |
|---|---|---|
| **R1** — opposition latérale | `.lb-cbt-arena` + 2 × `.lb-cbt-line` | les deux camps se font face, plus d'empilement vertical |
| **R2** — console à taille fixe | `.lb-cbt-console` (`height: 40em`, `flex: none`) | changer de verbe ne déplace rien ; le bloc reste monté au tour ennemi |
| **R3** — chiffres pendant la décision | `ActiveCharacter` (stats) + `ActionGrid` (mp + rank) | 6 stats visibles en permanence ; aucun aller-retour Hero Sheet |
| **R4** — un groupe, pas un héros | `.lb-cbt-line` (n enfants) + `TurnBand` (n entrées) | bascule 1 ↔ 4 dans la maquette : composition inchangée |
| **R5** — la couleur du cadre code le camp | `Combatant` (`--ally` or / `--foe` rouge / `aria-pressed` ambre) | aucun libellé « ennemi » dans tout l'écran |
| **R6** — une seule zone de texte | `.lb-cbt-ribbon` | pas de tooltip flottant au-dessus de l'arène |

---

## 3. Les décisions à ne pas redéfaire

**La bascule chaude ne concerne QUE le combat.** GodsShop, DivineCall et PostMortem restent sombres : ce sont
des écrans d'après-mort, le registre y est justifié. Le combat rejoint la palette parchemin/forêt/or déjà en
place ; Cinzel et l'or sont conservés.

**L'élite est un traitement, pas une seconde peinture.** Même plaque + calque d'ambiance (ciel assombri,
braises, vignette rouge) → **5 illustrations au lieu de 10**, contraste validé une seule fois, et repeindre un
spot reste possible plus tard sans rien casser. La composition change aussi : **3 adversaires alignés →
1 adversaire surdimensionné**.

**Les barres de vie restent au sol**, mais avec plaque opaque + liseré clair. Sans ça elles se perdaient sur
une illustration — elles ne tenaient que grâce à l'ancien fond neutre. Testé sur Ashenvale (clair) et Hollow
Crypt (sombre).

**Piège d'unités.** Tout l'intérieur du plateau est en `em`, avec `font-size: calc(100cqw / 192)` sur
`.lb-cbt-stage` (1em = 10 px à 1920). ⚠️ **Une boîte ne doit jamais porter à la fois une `font-size` et une
`width`/`height` en em** : la longueur se résout contre sa propre police. La `font-size` va sur un `<span>`
interne. Ce bug a coûté un débordement de 3× sur les figurines pendant la maquette — le commentaire est dans
`combat.css`.

---

## 4. Ce que ça donne comme travail

Aucun de ces tickets n'est créé ici : ils sont **dérivés** de la maquette et à instruire dans TASKS.md.

| Cible | Ce que la maquette fournit | Dépend de |
|---|---|---|
| **CMB-ATB02** — timeline visible | `TurnBand` complet (markup, styles, contrat de props) | CMB-ATB01 (moteur) |
| **CMB-INT01** — intents chiffrés | `Combatant.intent` — fourchette affichée, crit jamais signalé | CMB-ATB02 |
| **CMB-COST01** — grille de coûts | `ActionGrid` affiche déjà mp + rank ; **les rangs sont des placeholders** | validation Excel |
| **Refonte `Combat.jsx`** | plan complet : passer de l'empilement vertical à `TurnBand / arène latérale / console` | les 5 fonds §11 |
| **ASSET-ARENA01** *(nouveau)* | 5 fonds peints — prompts prêts dans `ASSET_PROMPTS` §11 | 🔴 **bloque la livraison de l'écran** |

**Le chemin critique n'est pas le code, ce sont les 5 illustrations.** C'était l'argument le plus fort de la
direction A de ne pas être asset-gated ; l'ajout des fonds peints le lui retire. À arbitrer : générer les
5 fonds d'abord, ou livrer la refonte avec les dégradés CSS en attendant (l'écran est fonctionnel sans, il est
juste moins « glamour » — soit exactement le reproche d'origine).

---

## 5. Ce qui reste ouvert

1. **CMB-COST01 non actée** — les rangs (×0.7 / ×1.0 / ×1.5) affichés sont des placeholders. Si la grille
   change beaucoup, la colonne de rangs peut devoir être relue (largeur, seuils de couleur).
2. **Où vivent les intents en multi-cibles** — un intent par ennemi fonctionne à 3 adversaires ; à 6 il faudra
   probablement les regrouper dans la timeline. Non tranché, pas bloquant avant CMB-INT01.
3. **Sprites (CONT01)** — les figurines sont des écussons à initiale. La composition est calibrée sur des
   corps de 8,6 × 11,4 em (élite 14 × 18,4) : c'est la contrainte à donner au sourcing.
