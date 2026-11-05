# ASSETS — Loop Breaker (crédits, licences, inventaire)

> Source de vérité pour chaque asset visuel : origine, licence, attribution, usage. Lié au ticket **CONT05**. Voir `UI_HANDOFF.md §ASSETS` pour la stratégie (2 couches : chibi carte/combat + portraits pixel dialogue).

## Licence & livraison

Les sprites ci-dessous viennent de **CraftPix** (packs *Free*). Licence : <https://craftpix.net/file-licenses/>.
- ✅ Utilisables dans un jeu gratuit **ou** commercial.
- ❌ Interdiction de **redistribuer / revendre les assets bruts** en tant qu'assets.
- **Livraison (DEPLOY01, 2026-07)** : `public/` est désormais **committé** (carte, sprites héros, monstres, bâtiments, portraits, favicon) → assets **servis par Vercel**. Seules les **sources HD** `public/monsters/raw/` + `public/buildings/raw/` restent gitignorées (backups locaux ~344 Mo, jamais servis). Repo **privé** + alpha **privée** → l'usage in-game reste conforme à la licence CraftPix (un repo privé n'est pas une redistribution d'assets bruts). ⚠️ **Avant tout passage en repo/déploiement PUBLIC** : re-vérifier chaque licence et envisager de retirer les assets tiers du repo.
- Ce sont des **placeholders v0/v1** de toute façon (cf. héros ci-dessous) ; le set final pourra être CC0/sourcé proprement.

Licences brutes archivées dans `public/ASSET_LICENSES/` (committé avec les assets).

## Couche A — Sprites chibi (carte / combat)

| Asset | Fichiers | Source | Statut |
|---|---|---|---|
| **Héros** (placeholder) | `public/sprites/hero/{idle,walking,dying}/NN.png` | CraftPix — *Chibi Necromancer of the Shadow* (variant 1) | ⚠️ **Placeholder** : rend plus sinistre qu'héroïque → à remplacer par un chibi héroïque lumineux **sans toucher au layout**. Mapping : `idle` = repos/carte, `walking` = déplacement entre nodes, `dying` = mort en combat. |
| Façades de bâtiments | `public/buildings/<id>.png` | générées (figurines) | ✅ **5/9 liées** (inn/church/merchant/alchemy/blacksmith) ; reste master_smith/knight_trainer/academy/guild → placeholder légendé |
| Monstres de surface | `public/monsters/<id>.png` (+ variantes `_2/_3`) | générées (figurines sur socle) | ✅ **16/16 liés** (via `MonsterPortrait`, fallback emoji) |
| Boss / Grimspire / réserve | — | à sourcer | ❌ emoji fallback |
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
