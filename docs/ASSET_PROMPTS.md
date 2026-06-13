# Loop Breaker — Plan d'assets & prompts de génération

> **Fichier maître** : étude des assets à produire + **prompts prêts à coller** + reco par asset
> (🟢 **Gemini** / 🟣 **autre IA** / 🟠 **à sourcer** / ⚪ **ni l'un ni l'autre**).
> **Chaque asset (§4 à §11) a son propre prompt COMPLET prêt à copier-coller** (style + cadrage + sujet + technique déjà assemblés) — un bloc = un asset. (`public/monsters/README.md` reste un guide secondaire.)
> Rappel : `public/` est **gitignoré** → les assets restent local-only ; ce plan, lui, est committé.

---

## 1) État actuel (ce qui existe déjà)

| Asset | En place | Manquant / à refaire |
|---|---|---|
| **Héros** (sprites carte/combat) | idle (18f) + walking (24f) + dying (15f) | ⚠️ placeholder « Necromancer » (rend sinistre) → à remplacer par un chibi héroïque |
| **Monstres** (illustrations combat) | 5 (dont 2 supprimés par MON01 : rotting_shambler, gloom_bat) | **~24** valides (post-MON01) dont 2 boss + Malachar |
| **Portraits PNJ** (dialogue, pixel 128² × 6 émotions) | 5 (aldric, smith, marta, merchant, mage) | prêtre, chef de village, **3 divinités** |
| **Carte monde** | `eldenmoor.png` ✅ | — |
| **Façades bâtiments** | ❌ (emoji/slot) | inn, merchant, blacksmith, alchemy, church (+ guild/academy v1.2) |
| **Déco village** | ❌ | puits, poules, tonneaux, panneau, étal… |
| **Fonds d'arène combat** | dégradés CSS | optionnel : illustration par spot |
| **Character-select** | ❌ | 8 classes (C03) |
| **Icônes UI / objets** | emoji | set SVG cohérent |

---

## 2) Priorisation globale

| Prio | Lot | Reco |
|---|---|---|
| **P0** | Monstres **Ashenvale Forest** (4) + **héros héroïque** | 🟢 Gemini / 🟠 source |
| **P1** | Monstres Thornmarsh + Crumbled Ruins + Wildmere Hills (12) + **3 boss** (Crypt Keeper, Lord of the Forsaken, **Malachar**) | 🟢 Gemini |
| **P1** | Façades des 5 bâtiments + puits | 🟢 Gemini |
| **P2** | Monstres Grimspire (6) + Blighted Road (2) + réserve (2) | 🟢 Gemini |
| **P2** | 3 divinités (DivineCall) + déco village | 🟢 Gemini |
| **P3** | Character-select (8), fonds d'arène, portraits prêtre/chef | 🟢 Gemini / 🟠 source |
| **P3** | Icônes UI & objets | ⚪ game-icons.net (CC BY) |

---

## 3) Conventions techniques (communes)

- **PNG**, généré en **1024²**, exporté à la taille cible, **fond plat neutre → détouré** (rembg / remove.bg / Photopea).
- **Nommage exact** indiqué par asset. Emplacements : `public/monsters/`, `public/sprites/hero/`, `public/buildings/`, `public/portraits/`, `public/deities/`, etc.
- **Astuce cohérence** : générer 1 asset satisfaisant par lot, puis le **fournir en image de référence** pour les suivants (« même style que cette image »). Même modèle/mêmes réglages par lot.

---

## 4) 🟢 MONSTRES — figurines 3D sur socle (Gemini)

> Direction complète + 29 prompts détaillés dans `public/monsters/README.md`. **Reco : 🟢 Gemini 2.5 Flash Image (« Nano Banana »)** — excellent en cohérence inter-images. Format **figurine 3D de collection sur socle**, fond neutre détourable, 512² final.

**Règle de format (décidée 2026-06-07) :**
- **Monstres normaux (`common`)** → **figurine + socle thématique** (style « Charme » Ghibli × Dragon Quest). Le **socle est thématisé selon l'habitat** du monstre.
- **Élites / boss / demon lord** → **figurine SEULE, sans socle** (style « Cruel » réaliste, menaçant).
- Tous : **fond gris neutre uni** → on **détoure ensuite** (rembg). *(Gemini n'est pas fiable en transparent direct.)*

> **Reco : 🟢 Gemini 2.5 Flash Image (« Nano Banana »)**. Génère en **1024²**, nomme `<id>.png`, dépose dans `public/monsters/`, détoure, exporte en **512²**. 💡 Cohérence : génère un 1ᵉʳ monstre par style, puis fournis-le en **image de référence** pour les suivants.

Chaque bloc ci-dessous est un **prompt complet prêt à copier-coller** (style + cadrage + sujet déjà assemblés).

### 🌲 Ashenvale Forest — Lv 1-8 *(socle : sol forestier moussu, feuilles d'automne)*

**`ashwood_wolf.png`** — Ashwood Wolf *(normal)*
```
Premium collectible 3D figurine / painted statuette of an Ashwood Wolf — a sleek silver-grey forest wolf with warm amber eyes and slightly tousled fur, in an alert mid-step prowl with ears forward and a friendly-fierce expression — standing on a small round sculpted display base themed as a mossy forest floor with fallen autumn leaves and a little twig. Art style: a charming collectible figure halfway between Studio Ghibli warmth and a Dragon Quest / Akira Toriyama bestiary — rounded readable shapes, expressive face, vivid warm colors, friendly-fierce adventurous tone, hand-painted resin look, never grimdark. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow under the base. Centered 1:1 square composition, slight 3/4 front angle, the full figure and its base fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```
**`thicket_hare.png`** — Thicket Hare *(normal)*
```
Premium collectible 3D figurine / painted statuette of a Thicket Hare — a plump brown woodland hare with oversized alert ears and big round bright eyes, perched up on its hind legs with a twitching nose, harmless and cute — standing on a small round sculpted display base themed as a mossy forest floor with fallen autumn leaves and a little twig. Art style: a charming collectible figure halfway between Studio Ghibli warmth and a Dragon Quest / Akira Toriyama bestiary — rounded readable shapes, expressive face, vivid warm colors, friendly-fierce adventurous tone, hand-painted resin look, never grimdark. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow under the base. Centered 1:1 square composition, slight 3/4 front angle, the full figure and its base fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```
**`tuskmaw_boar.png`** — Tuskmaw Boar *(normal)*
```
Premium collectible 3D figurine / painted statuette of a Tuskmaw Boar — a stocky bristly wild boar with thick hide, curved ivory tusks and a broad wet snout, hooves planted and head lowered ready to charge, grumpy but rounded — standing on a small round sculpted display base themed as a mossy forest floor with fallen autumn leaves and a little twig. Art style: a charming collectible figure halfway between Studio Ghibli warmth and a Dragon Quest / Akira Toriyama bestiary — rounded readable shapes, expressive face, vivid warm colors, friendly-fierce adventurous tone, hand-painted resin look, never grimdark. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow under the base. Centered 1:1 square composition, slight 3/4 front angle, the full figure and its base fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```
**`old_oakheart.png`** — Old Oakheart *(élite — figurine seule, sans socle)*
```
Premium collectible 3D figurine / painted statue of Old Oakheart — an ancient towering oak treant with a gnarled bark-skin face and deep-set glowing eyes, massive limb-branches wreathed in moss and brambles, rooted gnarled feet, weathered and imposing — a full standing figure with NO display base, figure only. Art style: a high-end realistic collectible statue — detailed sculpt, realistic bark and moss textures, intimidating proportions, darker dramatic palette, menacing and ominous presence, cinematic and imposing. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow on the ground. Centered 1:1 square composition, slight 3/4 front angle, the full figure fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```

### 🌿 Thornmarsh — Lv 6-14 *(socle : marais, eau trouble, roseaux, nénuphar)*

**`marsh_serpent.png`** — Marsh Serpent *(normal)*
```
Premium collectible 3D figurine / painted statuette of a Marsh Serpent — a coiled green-and-gold marsh serpent rising to strike, with glistening wet scales, a forked tongue and slit golden eyes, sleek and sinuous — standing on a small round sculpted display base themed as a murky swamp with dark water, reeds and a lily pad. Art style: a charming collectible figure halfway between Studio Ghibli warmth and a Dragon Quest / Akira Toriyama bestiary — rounded readable shapes, expressive face, vivid warm colors, friendly-fierce adventurous tone, hand-painted resin look, never grimdark. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow under the base. Centered 1:1 square composition, slight 3/4 front angle, the full figure and its base fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```
**`briar_wraith.png`** — Briar Wraith *(normal)*
```
Premium collectible 3D figurine / painted statuette of a Briar Wraith — a tattered thorn-wreathed wraith of living briar and torn grey cloth, with a faint hollow softly-glowing face and vines and thorns curling around a wispy ghostly body, eerie but stylized — standing on a small round sculpted display base themed as a murky swamp with dark water, reeds and a lily pad. Art style: a charming collectible figure halfway between Studio Ghibli warmth and a Dragon Quest / Akira Toriyama bestiary — rounded readable shapes, expressive face, vivid warm colors, friendly-fierce adventurous tone, hand-painted resin look, never grimdark. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow under the base. Centered 1:1 square composition, slight 3/4 front angle, the full figure and its base fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```
**`mire_slime.png`** — Mire Slime *(normal)*
```
Premium collectible 3D figurine / painted statuette of a Mire Slime — a translucent murky-green gelatinous slime blob with a glossy wet surface, a few bubbles and tiny bits of swamp debris suspended inside, with simple cute eyes and one little pseudopod — standing on a small round sculpted display base themed as a murky swamp with dark water, reeds and a lily pad. Art style: a charming collectible figure halfway between Studio Ghibli warmth and a Dragon Quest / Akira Toriyama bestiary — rounded readable shapes, expressive face, vivid warm colors, friendly-fierce adventurous tone, hand-painted resin look, never grimdark. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow under the base. Centered 1:1 square composition, slight 3/4 front angle, the full figure and its base fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```
**`fenrot_devourer.png`** — Fenrot Devourer *(élite — figurine seule, sans socle)*
```
Premium collectible 3D figurine / painted statue of the Fenrot Devourer — a hulking rotting marsh beast, part crocodile part wolf, with a slavering oversized maw lined with jagged teeth and a mottled diseased hide dripping bog filth, predatory and vicious — a full standing figure with NO display base, figure only. Art style: a high-end realistic collectible statue — detailed sculpt, realistic wet diseased-hide textures, intimidating proportions, darker dramatic palette, menacing and cruel presence, cinematic and fierce. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow on the ground. Centered 1:1 square composition, slight 3/4 front angle, the full figure fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```

### 🏚 Crumbled Ruins — Lv 12-20 *(socle : dalles antiques fissurées, gravats)*

**`stone_golem.png`** — Stone Golem *(normal)*
```
Premium collectible 3D figurine / painted statuette of a Stone Golem — a chunky humanoid golem built of cracked mossy ruin-stones and ancient masonry, with glowing rune-light along its chest seams and heavy blocky fists, sturdy and stoic — standing on a small round sculpted display base themed as cracked ancient flagstones and rubble. Art style: a charming collectible figure halfway between Studio Ghibli warmth and a Dragon Quest / Akira Toriyama bestiary — rounded readable shapes, expressive face, vivid warm colors, friendly-fierce adventurous tone, hand-painted resin look, never grimdark. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow under the base. Centered 1:1 square composition, slight 3/4 front angle, the full figure and its base fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```
**`hollow_knight.png`** — Hollow Knight *(normal)*
```
Premium collectible 3D figurine / painted statuette of a Hollow Knight — an empty suit of tarnished medieval armor animated by a faint ghost-light inside the helm, holding a notched longsword, hollow, silent and a touch eerie — standing on a small round sculpted display base themed as cracked ancient flagstones and rubble. Art style: a charming collectible figure halfway between Studio Ghibli warmth and a Dragon Quest / Akira Toriyama bestiary — rounded readable shapes, expressive face, vivid warm colors, friendly-fierce adventurous tone, hand-painted resin look, never grimdark. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow under the base. Centered 1:1 square composition, slight 3/4 front angle, the full figure and its base fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```
**`ruin_specter.png`** — Ruin Specter *(normal)*
```
Premium collectible 3D figurine / painted statuette of a Ruin Specter — a wispy translucent spectre drifting upright, a faintly glowing pale-blue form with a sorrowful elongated face and trailing ethereal tatters, melancholic and ghostly — standing on a small round sculpted display base themed as cracked ancient flagstones and rubble. Art style: a charming collectible figure halfway between Studio Ghibli warmth and a Dragon Quest / Akira Toriyama bestiary — rounded readable shapes, expressive face, vivid warm colors, friendly-fierce adventurous tone, hand-painted resin look, never grimdark. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow under the base. Centered 1:1 square composition, slight 3/4 front angle, the full figure and its base fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```
**`graven_sentinel.png`** — Graven Sentinel *(élite — figurine seule, sans socle)*
```
Premium collectible 3D figurine / painted statue of a Graven Sentinel — a towering grave-warden in heavy weathered funerary armor and a tattered burial cloak, a helm shaped like a tomb death-mask, wielding a massive ceremonial greatsword, with a cold merciless gaze, grim and imposing — a full standing figure with NO display base, figure only. Art style: a high-end realistic collectible statue — detailed sculpt, realistic weathered-metal and stone textures, intimidating proportions, darker dramatic palette, menacing and cruel presence, cinematic and imposing. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow on the ground. Centered 1:1 square composition, slight 3/4 front angle, the full figure fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```

### ⛰ Wildmere Hills — Lv 18-26 *(socle : sommet herbeux, fleurs sauvages)*

**`hill_slime.png`** — Hill Slime *(normal)*
```
Premium collectible 3D figurine / painted statuette of a Hill Slime — a rounded mossy-green hillside slime with a glossy surface, tufts of grass and a few tiny wildflowers growing on its back, with cheerful simple eyes, bouncy and friendly — standing on a small round sculpted display base themed as a grassy hilltop dotted with wildflowers. Art style: a charming collectible figure halfway between Studio Ghibli warmth and a Dragon Quest / Akira Toriyama bestiary — rounded readable shapes, expressive face, vivid warm colors, friendly-fierce adventurous tone, hand-painted resin look, never grimdark. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow under the base. Centered 1:1 square composition, slight 3/4 front angle, the full figure and its base fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```
**`russet_fox.png`** — Russet Fox *(normal)*
```
Premium collectible 3D figurine / painted statuette of a Russet Fox — a lithe russet-red fox with a bushy white-tipped tail and sharp clever eyes, caught mid-leap, playful, quick and elegant — standing on a small round sculpted display base themed as a grassy hilltop dotted with wildflowers. Art style: a charming collectible figure halfway between Studio Ghibli warmth and a Dragon Quest / Akira Toriyama bestiary — rounded readable shapes, expressive face, vivid warm colors, friendly-fierce adventurous tone, hand-painted resin look, never grimdark. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow under the base. Centered 1:1 square composition, slight 3/4 front angle, the full figure and its base fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```
**`knoll_goblin.png`** — Knoll Goblin *(normal)*
```
Premium collectible 3D figurine / painted statuette of a Knoll Goblin — a scrappy green-skinned goblin in patchwork leather and a crude dented helmet, gripping a jagged shiv with a sly toothy grin, hunched, wiry and mischievous — standing on a small round sculpted display base themed as a grassy hilltop dotted with wildflowers. Art style: a charming collectible figure halfway between Studio Ghibli warmth and a Dragon Quest / Akira Toriyama bestiary — rounded readable shapes, expressive face, vivid warm colors, friendly-fierce adventurous tone, hand-painted resin look, never grimdark. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow under the base. Centered 1:1 square composition, slight 3/4 front angle, the full figure and its base fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```
**`thunderhoof.png`** — Thunderhoof *(élite — figurine seule, sans socle)*
```
Premium collectible 3D figurine / painted statue of the Thunderhoof — a massive battle-scarred bison-bull with a storm-grey hide, cracked horns crackling with faint blue lightning, steam snorting from its nostrils and hooves striking sparks, powerful and brutal — a full standing figure with NO display base, figure only. Art style: a high-end realistic collectible statue — detailed sculpt, realistic fur and horn textures, intimidating proportions, darker dramatic palette, menacing and fierce presence, cinematic and imposing. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow on the ground. Centered 1:1 square composition, slight 3/4 front angle, the full figure fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```

### 💀 Réserve *(hors surface — usage futur donjon)*

**`barrow_wight.png`** — Barrow Wight *(normal — figurine + socle)*
```
Premium collectible 3D figurine / painted statuette of a Barrow Wight — a desiccated undead wight wrapped in ancient rotted grave-cloth, with sunken softly-glowing eye-sockets, clutching a rusted burial blade, gaunt and eerie but stylized — standing on a small round sculpted display base themed as grave dirt with a cracked mossy tombstone. Art style: a charming collectible figure halfway between Studio Ghibli warmth and a Dragon Quest / Akira Toriyama bestiary — rounded readable shapes, expressive face, vivid colors with a slightly spooky tone, hand-painted resin look, never grimdark. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow under the base. Centered 1:1 square composition, slight 3/4 front angle, the full figure and its base fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```
**`soul_harvester.png`** — Soul Harvester *(élite — figurine seule, sans socle)*
```
Premium collectible 3D figurine / painted statue of a Soul Harvester — a tall cloaked reaper-like figure wreathed in shadow, skeletal hands gripping a curved soul-scythe, a swirl of small glowing captured souls orbiting it and a faceless dark hood, sinister and cruel — a full standing figure with NO display base, figure only. Art style: a high-end realistic collectible statue — detailed sculpt, realistic cloth and bone textures, intimidating proportions, darker dramatic palette, menacing and cruel presence, cinematic and fierce. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow on the ground. Centered 1:1 square composition, slight 3/4 front angle, the full figure fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```

### 💀 The Blighted Road *(élites — figurine seule, sans socle)*

**`cursed_warlord.png`** — Cursed Warlord *(élite)*
```
Premium collectible 3D figurine / painted statue of a Cursed Warlord — a hulking armored warlord clad in blackened cursed plate etched with red glowing runes, wielding a massive jagged cursed blade, with a tattered war-banner cape and a helm with burning eye-slits, brutal and menacing — a full standing figure with NO display base, figure only. Art style: a high-end realistic collectible statue — detailed sculpt, realistic dark-metal textures, intimidating proportions, darker dramatic palette, menacing and cruel presence, cinematic and imposing. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow on the ground. Centered 1:1 square composition, slight 3/4 front angle, the full figure fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```
**`bone_colossus.png`** — Bone Colossus *(élite)*
```
Premium collectible 3D figurine / painted statue of a Bone Colossus — a gigantic colossus assembled from countless fused bones and skulls, a towering skeletal frame with necrotic light glowing in its ribcage and massive bone fists, monstrous and dreadful — a full standing figure with NO display base, figure only. Art style: a high-end realistic collectible statue — detailed sculpt, realistic bone textures, intimidating colossal proportions, darker dramatic palette, menacing and dreadful presence, cinematic and imposing. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow on the ground. Centered 1:1 square composition, slight 3/4 front angle, the full figure fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```

### 🌋 Grimspire — Lv 21+ *(socle : pierre volcanique sombre fissurée, braises)*

> Communs `common` → **Tier A « sombre »** (charme, palette plus grave) + socle. *(Cf. décision §16 : on peut les passer en Tier B cruel si tu préfères.)*

**`grimstone_troll.png`** — Grimstone Troll *(normal)*
```
Premium collectible 3D figurine / painted statuette of a Grimstone Troll — a massive lumbering troll with craggy grey grimstone skin and mossy growths, small mean eyes, long arms ending in heavy claws and slowly regenerating gashes, brutish — standing on a small round sculpted display base themed as dark cracked volcanic stone with faint glowing embers. Art style: a charming collectible figure between Studio Ghibli warmth and a Dragon Quest / Toriyama bestiary but with a darker, grimmer palette to match a volcanic realm — rounded readable shapes, expressive, hand-painted resin look. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow under the base. Centered 1:1 square composition, slight 3/4 front angle, the full figure and its base fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```
**`cursed_sentinel.png`** — Cursed Sentinel *(normal)*
```
Premium collectible 3D figurine / painted statuette of a Cursed Sentinel — an animated suit of ornate cursed dark-iron armor with a faint purple soul-glow, holding a tower shield and a spiked mace, standing rigid in eternal guard — standing on a small round sculpted display base themed as dark cracked volcanic stone with faint glowing embers. Art style: a charming collectible figure between Studio Ghibli warmth and a Dragon Quest / Toriyama bestiary but with a darker, grimmer palette to match a volcanic realm — rounded readable shapes, expressive, hand-painted resin look. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow under the base. Centered 1:1 square composition, slight 3/4 front angle, the full figure and its base fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```
**`abyssal_hound.png`** — Abyssal Hound *(normal)*
```
Premium collectible 3D figurine / painted statuette of an Abyssal Hound — a sleek black six-eyed hound of the abyss with smoking shadowy fur and glowing void-fangs, in a low predatory stance, fierce — standing on a small round sculpted display base themed as dark cracked volcanic stone with faint glowing embers. Art style: a charming collectible figure between Studio Ghibli warmth and a Dragon Quest / Toriyama bestiary but with a darker, grimmer palette to match a volcanic realm — rounded readable shapes, expressive, hand-painted resin look. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow under the base. Centered 1:1 square composition, slight 3/4 front angle, the full figure and its base fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```
**`wyvern_scout.png`** — Wyvern Scout *(normal)*
```
Premium collectible 3D figurine / painted statuette of a Wyvern Scout — a lean winged wyvern with leathery membrane wings spread wide, a barbed whipping tail and sharp reptilian eyes, perched and alert — standing on a small round sculpted display base themed as dark cracked volcanic stone with faint glowing embers. Art style: a charming collectible figure between Studio Ghibli warmth and a Dragon Quest / Toriyama bestiary but with a darker, grimmer palette to match a volcanic realm — rounded readable shapes, expressive, hand-painted resin look. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow under the base. Centered 1:1 square composition, slight 3/4 front angle, the full figure and its base fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```
**`plague_monk.png`** — Plague Monk *(normal)*
```
Premium collectible 3D figurine / painted statuette of a Plague Monk — a gaunt hooded monk in stained plague-robes, clutching a smoking censer that trails toxic green vapor, with sickly grey skin and fanatical glowing eyes — standing on a small round sculpted display base themed as dark cracked volcanic stone with faint glowing embers. Art style: a charming collectible figure between Studio Ghibli warmth and a Dragon Quest / Toriyama bestiary but with a darker, grimmer palette to match a volcanic realm — rounded readable shapes, expressive, hand-painted resin look. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow under the base. Centered 1:1 square composition, slight 3/4 front angle, the full figure and its base fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```
**`iron_wraith.png`** — Iron Wraith *(normal)*
```
Premium collectible 3D figurine / painted statuette of an Iron Wraith — a spectral wraith fused with floating jagged shards of spectral iron around a glowing core, with ghostly metal tatters swirling, cold and eerie — standing on a small round sculpted display base themed as dark cracked volcanic stone with faint glowing embers. Art style: a charming collectible figure between Studio Ghibli warmth and a Dragon Quest / Toriyama bestiary but with a darker, grimmer palette to match a volcanic realm — rounded readable shapes, expressive, hand-painted resin look. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow under the base. Centered 1:1 square composition, slight 3/4 front angle, the full figure and its base fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```

### 👑 Boss & Demon Lord *(figurine seule, sans socle, style cruel)*

**`hollow_crypt_boss.png`** — The Crypt Keeper *(boss)*
```
Premium collectible 3D figurine / painted statue of The Crypt Keeper — a towering undead crypt-lord in a tattered hooded death-shroud over ancient bone-armor, a crowned skeletal skull face with burning eye-sockets, wielding a long necrotic staff-scythe and commanding the dead, terrifying and regal — a full standing figure with NO display base, figure only. Art style: a high-end realistic collectible statue — detailed sculpt, realistic bone and cloth textures, intimidating proportions, darker dramatic palette, menacing and regal presence, cinematic and imposing. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow on the ground. Centered 1:1 square composition, slight 3/4 front angle, the full figure fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```
**`forsaken_citadel_boss.png`** — Lord of the Forsaken *(boss)*
```
Premium collectible 3D figurine / painted statue of the Lord of the Forsaken — a dread armored sovereign in towering blackened spiked plate over a regenerating cursed-iron carapace, with a tattered dark royal cape, twin cruel blades and a malevolent crowned helm with void-fire eyes, imposing and merciless — a full standing figure with NO display base, figure only. Art style: a high-end realistic collectible statue — detailed sculpt, realistic dark-metal and cloth textures, intimidating proportions, darker dramatic palette, menacing and cruel presence, cinematic and imposing. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow on the ground. Centered 1:1 square composition, slight 3/4 front angle, the full figure fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```
**`malachar.png`** — Malachar the Undying *(demon lord — final boss)*
```
Premium collectible 3D figurine / painted statue of Malachar the Undying, a colossal demon-lord wreathed in dark flame and necrotic energy, an immense horned skull-crowned figure in shattered god-killer armor with eyes of cold violet fire, radiating overwhelming dread — an epic final-boss centerpiece, a full standing figure with NO display base, figure only. Art style: a high-end realistic collectible statue — extremely detailed sculpt, realistic textures, towering intimidating proportions, dark dramatic palette with violet and ember accents, terrifying and cruel, cinematic and awe-inspiring. Studio product shot: soft three-point lighting, gentle rim light, subtle contact shadow on the ground. Centered 1:1 square composition, slight 3/4 front angle, the full figure fully visible. Isolated on a perfectly flat, evenly-lit neutral seamless light-grey background, no gradient, no scenery, no extra props, so it is easy to cut out afterwards. Crisp clean silhouette, high detail. No text, no watermark, no UI, no border.
```

---

## 5) 🟠 HÉROS — sprites animés (À SOURCER, pas Gemini)

**Reco : 🟠 SOURCER un pack.** L'IA image **ne sait pas** garder le même personnage identique **frame par frame** → un spritesheet animé (idle/walking/dying) est à prendre dans un pack.
- Chercher un **chibi héros héroïque lumineux** (itch.io / CraftPix « Tiny Hero » / LPC) respectant le **layout actuel** : `public/sprites/hero/{idle,walking,dying}/NN.png`.
- Garder la **même structure de dossiers** (idle ~18f, walking ~24f, dying ~15f) → swap sans toucher au code.
- *(Alternative IA ambitieuse : générer 1 design de référence chez Gemini, puis le faire animer par un pipeline sprite dédié — mais le sourcing reste le plus fiable.)*

---

## 6) 🟢 FAÇADES DE BÂTIMENTS (Gemini)

> **Reco : 🟢 Gemini.** Style **village médiéval-fantaisie chaleureux (Ghibli × Dragon Quest)**, cohérent avec la carte parchemin. Vue de face 3/4, fond neutre détourable. Emplacement : `public/buildings/<id>.png`.

Chaque bloc est un **prompt complet prêt à copier-coller**.

**`inn.png`** — The Hearth Inn
```
A single charming medieval-fantasy village inn — a cozy two-storey timber-framed inn with a hanging wooden tavern sign shaped like a foaming ale mug, warm glowing amber windows, a worn thatched roof, a stone chimney with a thin wisp of smoke, and a welcoming arched wooden door. Front 3/4 view, storybook style halfway between Studio Ghibli warmth and Dragon Quest, warm inviting colors, hand-painted look, the whole building centered and fully visible. Isolated on a perfectly flat, evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border, no ground scenery, no extra props.
```
**`merchant.png`** — Merchant's Shop
```
A single charming medieval-fantasy merchant's shop — a quaint timber-and-plaster shopfront with a striped red-and-cream awning, an open stall window, crates and barrels of colorful goods stacked by the door, and a hanging sign showing a gold coin and a weighing scale. Front 3/4 view, storybook style halfway between Studio Ghibli warmth and Dragon Quest, warm inviting colors, hand-painted look, the whole building centered and fully visible. Isolated on a perfectly flat, evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border, no ground scenery, no extra props.
```
**`blacksmith.png`** — Blacksmith's Forge
```
A single charming medieval-fantasy blacksmith's forge — a sturdy stone-and-timber smithy with a glowing orange furnace visible inside, an anvil with a hammer out front, a tall stone chimney puffing smoke, and a hanging sign shaped like a hammer crossed over an anvil. Front 3/4 view, storybook style halfway between Studio Ghibli warmth and Dragon Quest, warm inviting colors, hand-painted look, the whole building centered and fully visible. Isolated on a perfectly flat, evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border, no ground scenery, no extra props.
```
**`alchemy.png`** — Alchemy Workshop
```
A single charming medieval-fantasy alchemist's hut — a slightly crooked timber hut with bubbling colorful potion bottles glowing in the window, bunches of drying herbs hanging under the eaves, a hanging sign shaped like a mortar and pestle, and a thin wisp of green smoke from a crooked chimney. Front 3/4 view, storybook style halfway between Studio Ghibli warmth and Dragon Quest, warm inviting colors, hand-painted look, the whole building centered and fully visible. Isolated on a perfectly flat, evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border, no ground scenery, no extra props.
```
**`church.png`** — Church of the Old Gods
```
A single charming medieval-fantasy stone chapel — a modest grey-stone church with a small bell tower and a hanging bell, a round stained-glass window glowing with warm candlelight, a simple wooden holy symbol mounted over an arched door, and a slate roof. Front 3/4 view, storybook style halfway between Studio Ghibli warmth and Dragon Quest, warm inviting reverent colors, hand-painted look, the whole building centered and fully visible. Isolated on a perfectly flat, evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border, no ground scenery, no extra props.
```
**`master_smith.png`** — Master Smith *(forge améliorée, rare)*
```
A single charming medieval-fantasy master smith's workshop — a grand upgraded forge of fine stone and dark timber with a large bright glowing furnace, an ornate anvil and masterwork weapons displayed on a rack out front, a tall chimney throwing bright sparks, and a hanging sign shaped like a crowned hammer-and-anvil. Front 3/4 view, storybook style halfway between Studio Ghibli warmth and Dragon Quest, warm rich colors, hand-painted look, the whole building centered and fully visible. Isolated on a perfectly flat, evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border, no ground scenery, no extra props.
```
**`knight_trainer.png`** — Knight Trainer
```
A single charming medieval-fantasy knight trainer's hall — a sturdy timber-and-stone training hall with a small fenced sparring yard, a weapon rack and a straw practice dummy out front, a heraldic shield mounted above the door, fluttering banners, and a hanging sign shaped like a crossed sword and shield. Front 3/4 view, storybook style halfway between Studio Ghibli warmth and Dragon Quest, warm inviting colors, hand-painted look, the whole building centered and fully visible. Isolated on a perfectly flat, evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border, no ground scenery, no extra props.
```
**`guild.png`** — Adventurers' Guild
```
A single charming medieval-fantasy adventurers' guild hall — an imposing two-storey timber-and-stone hall hung with colorful pennant banners, a large hanging sign bearing a crossed-swords crest, a bounty notice board beside a heavy double door, and a peaked roof. Front 3/4 view, storybook style halfway between Studio Ghibli warmth and Dragon Quest, warm inviting colors, hand-painted look, the whole building centered and fully visible. Isolated on a perfectly flat, evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border, no ground scenery, no extra props.
```
**`academy.png`** — Academy of Magic
```
A single charming medieval-fantasy mage's academy — a slender scholarly stone tower with tall arched windows glowing with soft arcane light, faint blue runes etched along the stone, a conical tiled roof topped with a small observatory dome, and a hanging sign bearing a star-and-eye sigil. Front 3/4 view, storybook style halfway between Studio Ghibli warmth and Dragon Quest, warm inviting colors with a touch of arcane blue, hand-painted look, the whole building centered and fully visible. Isolated on a perfectly flat, evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border, no ground scenery, no extra props.
```

---

## 7) 🟢 DÉCO VILLAGE (Gemini)

> **Reco : 🟢 Gemini.** Petits props isolés, même style village, fond neutre. `public/deco/<id>.png`. Chaque bloc est un **prompt complet prêt à copier-coller**.

**`well.png`** — Puits
```
A single small medieval-fantasy village prop — a charming round stone wishing-well with a little peaked wooden roof, a hanging bucket on a rope, and a few mossy stones. Storybook style halfway between Studio Ghibli warmth and Dragon Quest, warm hand-painted look, centered and fully visible. Isolated on a perfectly flat, evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border, no ground scenery.
```
**`barrels.png`** — Tonneaux
```
A single small medieval-fantasy village prop — a small tidy stack of wooden barrels and a crate, iron-banded, with a little burlap sack leaning against them. Storybook style halfway between Studio Ghibli warmth and Dragon Quest, warm hand-painted look, centered and fully visible. Isolated on a perfectly flat, evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border, no ground scenery.
```
**`hens.png`** — Poules
```
A single small medieval-fantasy village prop — two or three plump cute brown-and-white hens pecking and clucking together. Storybook style halfway between Studio Ghibli warmth and Dragon Quest, warm hand-painted look, charming and rounded, centered and fully visible. Isolated on a perfectly flat, evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border, no ground scenery.
```
**`signpost.png`** — Panneau
```
A single small medieval-fantasy village prop — a weathered wooden signpost with two or three blank directional planks pointing different ways, slightly leaning. Storybook style halfway between Studio Ghibli warmth and Dragon Quest, warm hand-painted look, centered and fully visible. Isolated on a perfectly flat, evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border, no ground scenery.
```
**`market_stall.png`** — Étal de marché
```
A single small medieval-fantasy village prop — a colorful little market stall with a striped awning and woven baskets of bright produce (fruit, vegetables, bread) on the counter. Storybook style halfway between Studio Ghibli warmth and Dragon Quest, warm hand-painted look, centered and fully visible. Isolated on a perfectly flat, evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border, no ground scenery.
```
**`lantern_post.png`** — Lampadaire
```
A single small medieval-fantasy village prop — a wrought-iron lantern post with a glass lantern holding a warm glowing flame, a little curl of decorative ironwork at the top. Storybook style halfway between Studio Ghibli warmth and Dragon Quest, warm hand-painted look, centered and fully visible. Isolated on a perfectly flat, evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border, no ground scenery.
```
**`hay_cart.png`** — Charrette de foin
```
A single small medieval-fantasy village prop — a small wooden hay cart with two large wheels, loaded with golden hay bales and a pitchfork resting against the side. Storybook style halfway between Studio Ghibli warmth and Dragon Quest, warm hand-painted look, centered and fully visible. Isolated on a perfectly flat, evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border, no ground scenery.
```

---

## 8) 🟢 DIVINITÉS — key art (Gemini)

> **Reco : 🟢 Gemini** (illustration épique, plus dramatique que les figurines). Affichées au **DivineCall**. `public/deities/<id>.png`. Fond neutre OU aura mystique détourable.

Chaque bloc est un **prompt complet prêt à copier-coller**.

**`ignareth.png`** — Ignareth *(chaotique, feu/ruine)*
```
Epic divine deity key-art of Ignareth, a towering god of fire and ruin — wreathed in living flame with molten cracked skin glowing from within, a crown of burning embers, fierce and awe-inspiring, radiating an intense orange-red glow. Dramatic painterly illustration, cinematic and majestic, centered bust-to-waist figure, isolated on a simple dark atmospheric background with a subtle fiery aura. No text, no watermark, no UI, no border.
```
**`sylvara.png`** — Sylvara *(loyale, nature/vie)*
```
Epic divine deity key-art of Sylvara, a serene goddess of nature and life — antlered, robed in living vines and leaves with small blossoms, a soft radiant green glow, gentle and graceful, eyes full of quiet wisdom. Dramatic painterly illustration, cinematic and luminous, centered bust-to-waist figure, isolated on a simple dark atmospheric background with a subtle verdant aura. No text, no watermark, no UI, no border.
```
**`voltaris.png`** — Voltaris *(chaotique, foudre/action)*
```
Epic divine deity key-art of Voltaris, a dynamic god of storm and action — crackling with arcs of lightning, a swirling stormcloud mantle around his shoulders, a fierce energetic stance, radiating an electric-blue glow. Dramatic painterly illustration, cinematic and powerful, centered bust-to-waist figure, isolated on a simple dark atmospheric background with a subtle stormy aura. No text, no watermark, no UI, no border.
```

---

## 9) 🟠/🟣 PORTRAITS PNJ MANQUANTS (prêtre, chef de village)

> Les 5 portraits existants sont des **pixel-portraits 128² à 6 émotions** (CraftPix). Pour **matcher exactement**, **🟠 sourcer le même pack** est le plus sûr (la règle anti-clash d'`ASSETS.md` interdit de mélanger les styles).
> Alternative **🟣 IA pixel-art** (plus dur à matcher) : générer les **6 émotions** par PNJ. Chaque bloc est un **prompt complet** ; génère-le 6 fois en remplaçant `[EMOTION]` par : **talk · calm · smile · sadness · aggression · special**. Fichiers : `public/portraits/<role>/<emotion>.png`.

**`portraits/priest/<emotion>.png`** — Prêtre (church)
```
A 128x128 pixel-art RPG dialogue portrait of an elderly kind priest — white-and-gold clerical robes, a serene wise weathered face, soft white hair and a short beard — showing a clear [EMOTION] expression. Retro 16-bit JRPG portrait style, clean limited palette, crisp readable pixels, centered head-and-shoulders bust facing slightly forward, plain flat solid-color background. No text, no watermark, no UI, no border.
```
**`portraits/elder/<emotion>.png`** — Chef de village
```
A 128x128 pixel-art RPG dialogue portrait of a weathered village elder — a long grey beard, kindly wise eyes, a simple brown tunic and a small medallion of office — showing a clear [EMOTION] expression. Retro 16-bit JRPG portrait style, clean limited palette, crisp readable pixels, centered head-and-shoulders bust facing slightly forward, plain flat solid-color background. No text, no watermark, no UI, no border.
```

---

## 10) 🟢 CHARACTER-SELECT — 8 classes (C03, Gemini)

> **Reco : 🟢 Gemini.** Portraits-bustes héroïques, même chaleur Ghibli×DQ. `public/charselect/<id>.png`, fond neutre détourable. Chaque bloc est un **prompt complet prêt à copier-coller**.

**`warrior.png`** — Guerrier
```
A charming heroic character portrait bust of a brave warrior — holding a sword and a sturdy shield, light armor, a determined confident grin. Storybook style halfway between Studio Ghibli warmth and Dragon Quest, warm vivid colors, hand-painted look, expressive and adventurous, centered head-and-shoulders bust, slight 3/4 angle. Isolated on a perfectly flat, evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border.
```
**`rogue.png`** — Voleur
```
A charming heroic character portrait bust of a sly hooded rogue — twin daggers, a dark leather hood and cloak, a clever smirk and quick eyes. Storybook style halfway between Studio Ghibli warmth and Dragon Quest, warm vivid colors, hand-painted look, expressive and adventurous, centered head-and-shoulders bust, slight 3/4 angle. Isolated on a perfectly flat, evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border.
```
**`mage.png`** — Mage
```
A charming heroic character portrait bust of a young mage — holding a staff topped with a glowing crystal, a blue-and-gold robe, curious bright eyes. Storybook style halfway between Studio Ghibli warmth and Dragon Quest, warm vivid colors, hand-painted look, expressive and adventurous, centered head-and-shoulders bust, slight 3/4 angle. Isolated on a perfectly flat, evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border.
```
**`ranger.png`** — Rôdeur
```
A charming heroic character portrait bust of a keen ranger — a longbow over the shoulder, a green hooded cloak, sharp focused eyes scanning ahead. Storybook style halfway between Studio Ghibli warmth and Dragon Quest, warm vivid colors, hand-painted look, expressive and adventurous, centered head-and-shoulders bust, slight 3/4 angle. Isolated on a perfectly flat, evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border.
```
**`monk.png`** — Moine
```
A charming heroic character portrait bust of a calm martial monk — simple earth-toned robes, hands wrapped, a serene focused expression, a shaven or topknot hairstyle. Storybook style halfway between Studio Ghibli warmth and Dragon Quest, warm vivid colors, hand-painted look, expressive and adventurous, centered head-and-shoulders bust, slight 3/4 angle. Isolated on a perfectly flat, evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border.
```
**`knight.png`** — Chevalier
```
A charming heroic character portrait bust of a noble knight — polished plate armor with a tabard, the visor raised to reveal a steadfast brave face. Storybook style halfway between Studio Ghibli warmth and Dragon Quest, warm vivid colors, hand-painted look, expressive and adventurous, centered head-and-shoulders bust, slight 3/4 angle. Isolated on a perfectly flat, evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border.
```
**`witch.png`** — Sorcière
```
A charming heroic character portrait bust of a whimsical witch — a wide pointed hat, a spellbook tucked under one arm, a mischievous knowing smile and bright eyes. Storybook style halfway between Studio Ghibli warmth and Dragon Quest, warm vivid colors, hand-painted look, expressive and adventurous, centered head-and-shoulders bust, slight 3/4 angle. Isolated on a perfectly flat, evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border.
```
**`bard.png`** — Barde
```
A charming heroic character portrait bust of a charismatic bard — a lute held ready, a feathered cap and colorful traveling clothes, a playful wink and a confident grin. Storybook style halfway between Studio Ghibli warmth and Dragon Quest, warm vivid colors, hand-painted look, expressive and adventurous, centered head-and-shoulders bust, slight 3/4 angle. Isolated on a perfectly flat, evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border.
```

---

## 11) 🟢 FONDS D'ARÈNE (optionnel, Gemini)

> Actuellement dégradés CSS (suffisants). Polish optionnel : 1 illustration de fond par spot. `public/arenas/<spot>.png`, **format paysage 16:9**. Chaque bloc est un **prompt complet prêt à copier-coller** *(fond pleine image — pas de détourage)*.

**`ashenvale_forest.png`**
```
An atmospheric medieval-fantasy combat background illustration of a sunlit ancient forest clearing — tall mossy trees, dappled warm-green light, drifting leaves and soft shafts of sun, painterly storybook style with gentle depth-of-field, no characters, no creatures, empty scene, landscape 16:9 composition. No text, no watermark, no UI, no border.
```
**`thornmarsh.png`**
```
An atmospheric medieval-fantasy combat background illustration of a misty fetid swamp — murky green-brown water, twisted trees with hanging vines, low fog and dead reeds, eerie muted palette, painterly storybook style with gentle depth-of-field, no characters, no creatures, empty scene, landscape 16:9 composition. No text, no watermark, no UI, no border.
```
**`crumbled_ruins.png`**
```
An atmospheric medieval-fantasy combat background illustration of broken overgrown ancient stone ruins — toppled pillars and cracked flagstones reclaimed by moss and ivy, a melancholic grey-green palette and soft hazy light, painterly storybook style with gentle depth-of-field, no characters, no creatures, empty scene, landscape 16:9 composition. No text, no watermark, no UI, no border.
```
**`wildmere_hills.png`**
```
An atmospheric medieval-fantasy combat background illustration of rolling verdant hills under a wide bright sky — wildflowers, scattered boulders and a distant tree line, warm sunny greens, painterly storybook style with gentle depth-of-field, no characters, no creatures, empty scene, landscape 16:9 composition. No text, no watermark, no UI, no border.
```
**`blighted_road.png`**
```
An atmospheric medieval-fantasy combat background illustration of a cursed blighted wasteland road — cracked dead earth, withered black trees, a sickly red-tinged sky and drifting ash, ominous and desolate, painterly storybook style with gentle depth-of-field, no characters, no creatures, empty scene, landscape 16:9 composition. No text, no watermark, no UI, no border.
```
**`grimspire.png`**
```
An atmospheric medieval-fantasy combat background illustration of a dark volcanic citadel approach — jagged black basalt cliffs, rivers of distant glowing lava, a brooding purple-black sky with embers, foreboding and grim, painterly storybook style with gentle depth-of-field, no characters, no creatures, empty scene, landscape 16:9 composition. No text, no watermark, no UI, no border.
```

---

## 12) ⚪ ICÔNES UI & OBJETS (PAS d'IA)

> **Reco : ⚪ `game-icons.net` (CC BY 3.0)** — set cohérent, recolorable à la palette parchemin (`--ink`, `--gold`, `--amber-deep`). **Pas de génération IA** (vectoriel, cohérence d'un set).
- **UI** : remplacer les emoji `⚔ 🛡 🪙 🌙 🛏 🍺 ⛪ 🎪 🔒 ☀ ⚡ ✦ 📖 🎒 📜`.
- **Objets/équipement** : armes (épée/hache/dague/bâton), armures (casque/plastron/bottes), potions, **mana stones**, ressources. (Optionnel 🟣 IA si on veut un rendu peint plutôt que des icônes plates.)

---

## 13) Workflow Gemini (rappel)

1. Copier-coller **le prompt complet de l'asset** (chaque bloc §4-§11 est déjà prêt, rien à assembler).
2. Générer en **1024²**, fond plat neutre.
3. **Détourer** (rembg) → PNG transparent.
4. Recadrer/redimensionner à la cible, **nommer exactement**, déposer dans le bon dossier `public/…`.
5. **Cohérence** : 1ʳᵉ image satisfaisante → réutilisée en **référence** pour le reste du lot.

> Outils : 🟢 **Gemini 2.5 Flash Image** (abonnement dispo, fort en cohérence) · alternatives 🟣 **Google Imagen/ImageFX**, Midjourney (plus beau, cohérence plus dure). Détourage : **rembg** (local, gratuit) / remove.bg / Photopea.

---

## ✅ Décisions actées (2026-06-07)
1. **Socle** : ✅ **figurine + socle pour les monstres normaux** ; **figurine seule (sans socle) pour les élites/boss/demon lord**. *(Reflété dans les prompts ci-dessus.)*
2. **Socle thématique** : ✅ **oui** — le socle des normaux est **thématisé selon l'habitat** (forêt / marais / ruines / collines / Grimspire / barrow). *(Reflété.)*
3. **Fond** : ✅ **fond neutre gris + détourage ensuite** (rembg) — pas de transparent direct (Gemini peu fiable là-dessus). *(Reflété.)*
4. **Tiers Grimspire** : ⏳ **par défaut Tier A « sombre »** (charme à palette grave + socle volcanique), comme dans les prompts. **Explication** : les monstres de Grimspire sont de **rang `common`** (donc logiquement Tier A « charme »), mais la **zone est sombre/fin de jeu** → je leur ai mis un charme **assombri**. Si tu les veux plutôt **réalistes/cruels (Tier B, sans socle)** comme les élites, dis-le et je bascule les 6.
5. **Façades / portraits** : ✅ **on garde le mix** illustration (bâtiments, divinités, char-select) + pixel (portraits PNJ de dialogue) — la règle anti-clash n'interdit que de les mélanger **au même cadre/échelle**, ce qui n'est pas le cas (écrans différents).
