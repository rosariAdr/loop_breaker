# ASSETS — Loop Breaker (crédits, licences, inventaire)

> Source de vérité pour chaque asset visuel : origine, licence, attribution, usage. Lié au ticket **CONT05**. Voir `UI_HANDOFF.md §ASSETS` pour la stratégie (2 couches : chibi carte/combat + portraits pixel dialogue).

## Licence & livraison

Les sprites ci-dessous viennent de **CraftPix** (packs *Free*). Licence : <https://craftpix.net/file-licenses/>.
- ✅ Utilisables dans un jeu gratuit **ou** commercial.
- ❌ Interdiction de **redistribuer / revendre les assets bruts** en tant qu'assets.
- ✅ **Mitigation en place** : tout `public/` est **gitignoré** (`.gitignore` l.52) → les assets restent **local-only**, **jamais committés** dans le repo public. Le problème de redistribution est donc **évité d'office**.
- ⚠️ **Contrepartie** : les assets n'étant pas dans le repo, il faudra les **fournir séparément** pour un build/déploiement (script de copie, release séparée, ou store privé). À traiter à la mise en prod.
- Ce sont des **placeholders v0/v1** de toute façon (cf. héros ci-dessous) ; le set final pourra être CC0/sourcé proprement.

Licences brutes archivées dans `public/ASSET_LICENSES/` (local-only également).

## Couche A — Sprites chibi (carte / combat)

| Asset | Fichiers | Source | Statut |
|---|---|---|---|
| **Héros** (placeholder) | `public/sprites/hero/{idle,walking,dying}/NN.png` | CraftPix — *Chibi Necromancer of the Shadow* (variant 1) | ⚠️ **Placeholder** : rend plus sinistre qu'héroïque → à remplacer par un chibi héroïque lumineux **sans toucher au layout**. Mapping : `idle` = repos/carte, `walking` = déplacement entre nodes, `dying` = mort en combat. |
| Façades de bâtiments | — | à sourcer (même famille chibi) | ❌ manquant (emoji/art-slot) |
| Monstres (18/23) | `public/monsters/` (5 existants) | à sourcer | ❌ partiel |
| Boss Malachar | — | à sourcer | ❌ manquant |
| Déco (well/hens/barrels) | — | à sourcer | ❌ manquant |

## Couche B — Portraits pixel (dialogue UNIQUEMENT, 128×128, 6 émotions)

Dossiers `public/portraits/<rôle>/{talk,calm,smile,sadness,aggression,special}.png`. Manifeste : `src/data/portraits.js`.

| Rôle (folder) | Pack d'origine | Personnage de jeu |
|---|---|---|
| `aldric` | NPC_1 (barbu blanc) | Sir Aldric — maître guerrier |
| `smith` | NPC_2 (chauve roux) | Forgeron / Master Smith |
| `marta` | NPC_3 (rousse) | Marta — aubergiste |
| `merchant` | NPC_4 (brun) | Marchand / maître de Guilde |
| `mage` | Queen (elfe noire) | Maître mage (Académie) / PNJ spécial |

**Encore à sourcer (couche B)** : prêtre (church), chef de village, divinités → fallback emoji en attendant.

## Règle d'or (anti-clash)
**Jamais** un sprite chibi (couche A) et un portrait pixel (couche B) dans le même cadre à la même échelle. Portraits = overlays de dialogue ; chibis = carte / combat.

## Polices
Cinzel + Crimson Text (Google Fonts).

## Icônes
Emoji en stand-in (⚔ 🛡 🪙 🌙 🛏 🍺 ⛪ 🎪 🔒 ☀ ⚡ ✦) → remplacer par un set SVG (ex. game-icons.net, CC BY) recoloré à la palette.
