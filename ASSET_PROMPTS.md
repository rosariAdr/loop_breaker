# Loop Breaker — Plan d'assets & prompts de génération

> **Fichier maître** : étude des assets à produire + **prompts prêts à coller** + reco par asset
> (🟢 **Gemini** / 🟣 **autre IA** / 🟠 **à sourcer** / ⚪ **ni l'un ni l'autre**).
> Les **monstres** (§4) ont chacun un **prompt complet prêt à copier-coller**. (`public/monsters/README.md` reste un guide secondaire.)
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

**Bloc style (commun) :**
```
A single charming medieval-fantasy village building, front 3/4 view, storybook
Ghibli-meets-Dragon-Quest style, warm inviting colors, hand-painted look. Isolated on a
flat neutral light background (easy to cut out). No text, no UI, no border, no ground scene.
```
**Sujets :**
- `inn` — *a cozy timber-framed inn, hanging tavern sign with a foaming mug, warm glowing windows, thatched roof, welcoming door.*
- `merchant` — *a quaint merchant's shop with a striped awning, crates and barrels of goods by the door, a hanging sign with a coin and scale.*
- `blacksmith` — *a stone-and-timber blacksmith forge with a glowing furnace, an anvil out front, a hammer-and-anvil sign, smoke from the chimney.*
- `alchemy` — *a crooked alchemist's hut, bubbling colorful potion bottles in the window, drying herbs, a mortar-and-pestle sign, a wisp of green smoke.*
- `church` — *a small stone chapel with a modest bell tower, a stained-glass window, a wooden holy symbol over the door, warm candlelight inside.*
- *(v1.2)* `guild` — *an imposing adventurers' guild hall, banners, a crossed-swords crest sign, a bounty notice board by the door.*
- *(v1.2)* `academy` — *a scholarly mage's academy tower, glowing arcane runes, tall arched windows, a star-and-eye sigil sign.*

---

## 7) 🟢 DÉCO VILLAGE (Gemini)

> **Reco : 🟢 Gemini.** Petits props isolés, même style village, fond neutre. `public/deco/<id>.png`. Bloc style = idem §6 (remplacer « building » par « small prop »).
- `well` — *a charming round stone village well with a little wooden roof, bucket and rope.*
- `barrels` — *a small stack of wooden barrels and crates.*
- `hens` — *two or three plump cute hens pecking the ground.*
- `signpost` — *a wooden village signpost with blank directional planks.*
- `market_stall` — *a colorful little market stall with an awning and produce baskets.*
- `lantern_post` — *a wrought-iron lantern post with a warm glowing flame.*
- `hay_cart` — *a small wooden hay cart with bales.*

---

## 8) 🟢 DIVINITÉS — key art (Gemini)

> **Reco : 🟢 Gemini** (illustration épique, plus dramatique que les figurines). Affichées au **DivineCall**. `public/deities/<id>.png`. Fond neutre OU aura mystique détourable.

**Bloc style :**
```
Epic divine deity key-art, dramatic painterly illustration, awe-inspiring, glowing aura,
centered bust/figure, isolated on a simple dark atmospheric background. No text, no UI.
```
- `ignareth` *(chaotique, feu/ruine)* — *Ignareth, a towering god of fire and ruin, wreathed in living flame, molten cracked skin, a burning crown, fierce and awe-inspiring, orange-red glow.*
- `sylvara` *(loyale, nature/vie)* — *Sylvara, a serene goddess of nature and life, antlered, robed in living vines and leaves, soft radiant green glow, gentle and graceful.*
- `voltaris` *(chaotique, foudre/action)* — *Voltaris, a dynamic god of storm and action, crackling with lightning, a stormcloud mantle, fierce energetic stance, electric-blue glow.*

---

## 9) 🟠/🟣 PORTRAITS PNJ MANQUANTS (prêtre, chef de village)

> Les 5 portraits existants sont des **pixel-portraits 128² à 6 émotions** (CraftPix). Pour **matcher exactement**, **🟠 sourcer le même pack** est le plus sûr (la règle anti-clash d'`ASSETS.md` interdit de mélanger les styles).
> Alternative **🟣 IA pixel-art** (plus dur à matcher) : générer les 6 émotions (talk/calm/smile/sadness/aggression/special) dans un style pixel-portrait identique.
- `priest` (church) — *an elderly kind priest in white-and-gold robes, serene wise face.*
- `elder` (chef de village) — *a weathered village elder, grey beard, simple tunic, kindly wise expression.*

---

## 10) 🟢 CHARACTER-SELECT — 8 classes (C03, Gemini)

> **Reco : 🟢 Gemini.** Portraits-bustes héroïques, même chaleur Ghibli×DQ. `public/charselect/<id>.png`, fond neutre détourable. Bloc style = portrait héroïque charmant, buste, fond neutre.
- `warrior` — brave warrior with sword and shield, determined grin.
- `rogue` — sly hooded rogue with daggers, smirking.
- `mage` — young mage with a glowing staff, curious eyes.
- `ranger` — keen ranger with a bow and green hooded cloak.
- `monk` — calm martial monk in simple robes, focused.
- `knight` — noble knight in polished plate, visor up.
- `witch` — whimsical witch with a pointed hat and spellbook.
- `bard` — charismatic bard with a lute, winking.

---

## 11) 🟢 FONDS D'ARÈNE (optionnel, Gemini)

> Actuellement dégradés CSS (suffisants). Polish optionnel : 1 illustration de fond par spot. `public/arenas/<spot>.png`, format paysage. Bloc style = `atmospheric background illustration, painterly, slight depth-of-field, no characters`.
- `ashenvale_forest` — sunlit ancient forest clearing, warm green.
- `thornmarsh` — misty fetid swamp, murky green-brown, hanging vines.
- `crumbled_ruins` — broken overgrown ancient stone ruins, melancholic.
- `wildmere_hills` — rolling verdant hills under a wide sky.
- `blighted_road` — cursed blighted wasteland road, red-tinged, ominous.
- `grimspire` — dark volcanic citadel approach, purple-black, foreboding.

---

## 12) ⚪ ICÔNES UI & OBJETS (PAS d'IA)

> **Reco : ⚪ `game-icons.net` (CC BY 3.0)** — set cohérent, recolorable à la palette parchemin (`--ink`, `--gold`, `--amber-deep`). **Pas de génération IA** (vectoriel, cohérence d'un set).
- **UI** : remplacer les emoji `⚔ 🛡 🪙 🌙 🛏 🍺 ⛪ 🎪 🔒 ☀ ⚡ ✦ 📖 🎒 📜`.
- **Objets/équipement** : armes (épée/hache/dague/bâton), armures (casque/plastron/bottes), potions, **mana stones**, ressources. (Optionnel 🟣 IA si on veut un rendu peint plutôt que des icônes plates.)

---

## 13) Workflow Gemini (rappel)

1. Coller `[bloc technique] + [bloc style/tier] + [descriptif du sujet]`.
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
