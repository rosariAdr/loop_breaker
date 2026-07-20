# Loop Breaker — Plan d'assets & prompts de génération

> **Fichier maître** : étude des assets à produire + **prompts prêts à coller** + reco par asset
> (🟢 **Gemini** / 🟣 **autre IA** / 🟠 **à sourcer** / ⚪ **ni l'un ni l'autre**).
> **Chaque asset (§4 à §13) a son propre prompt COMPLET prêt à copier-coller** (style + cadrage + sujet + technique déjà assemblés) — un bloc = un asset. **Ce fichier est la source unique** (pas de doc annexe).
> Rappel : depuis **DEPLOY01 (2026-07)**, `public/` est **committé** (assets servis par Vercel) ; seules les **sources HD** `public/monsters/raw/` + `public/buildings/raw/` restent gitignorées (backups local-only).

---

## 1) État actuel (ce qui existe déjà)

> **État vérifié sur `dev` le 2026-07-19** (assets committés dans `public/`).

| Asset | En place | Reste à générer *(🟢 Gemini sauf mention)* |
|---|---|---|
| **Monstres** — illustration §4 | **17 / 29** (style peint) | **12** : `barrow_wight`, `soul_harvester`, `cursed_warlord`, `bone_colossus`, **Grimspire (6)**, `hollow_crypt_boss`, `forsaken_citadel_boss` |
| **Façades bâtiments** — §6 | **7 / 9** | **2** : `guild`, `academy` |
| **PNJ village en vignette** — §7 | ❌ | **3** : `well_elder_m`, `well_elder_f`, `aldric_tree` |
| **Divinités** (DivineCall) — §8 | ❌ | **3** : `ignareth`, `sylvara`, `voltaris` |
| **Character-select** — §10 | ❌ | **8** classes |
| **Carte + médaillons donjon** — §12 | ❌ | **5** : `crypt_map` + `room_combat/rest/treasure/boss` |
| **Déco props** — §7 | ❌ | **5** *(option)* : `barrels`, `hens`, `market_stall`, `lantern_post`, `hay_cart` — (`well`/`signpost` remplacés par les vignettes) |
| **Fonds d'arène combat** — §11 | dégradés CSS | **6** *(option, polish)* |
| **Portraits PNJ** (pixel 128² × 6 émotions) — §9 | **5** (aldric, smith, marta, merchant, mage) | prêtre + doyen → 🟠 **à sourcer (CraftPix), pas Gemini** |
| **Héros** (sprites idle/walk/dying) — §5 | placeholder en place | 🟠 **à sourcer**, pas Gemini |
| **Carte monde** | `map/eldenmoor.png` ✅ | — |
| **Icônes UI / objets** — §13 | emoji | ⚪ **game-icons.net**, pas Gemini |

---

## 2) Priorisation globale

> Priorisation du **reste à produire** (le déjà-fait est retiré). Chaque lot pointe vers le § qui contient les **prompts complets** prêts à coller.

| Prio | Lot **restant** 🟢 Gemini | Nb | Prompts |
|---|---|---|---|
| **P1** | Monstres manquants : Réserve (2) · Blighted Road (2) · **Grimspire (6)** · 2 boss (Crypt Keeper, Lord of the Forsaken) | 12 | §4 |
| **P1** | Façades `guild` + `academy` | 2 | §6 |
| **P2** | Vignettes village : puits+doyen, puits+doyenne, Aldric | 3 | §7 |
| **P2** | 3 divinités (DivineCall) | 3 | §8 |
| **P3** | Character-select (8 classes) | 8 | §10 |
| **P3** | Carte de donjon + 4 médaillons de salle | 5 | §12 |
| **P4** *(option)* | Déco props (5) + fonds d'arène (6) | 11 | §7 / §11 |
| **hors Gemini** | Héros (pack), portraits prêtre/doyen (pack), icônes UI | — | §5 / §9 / §13 |

> **Total 🟢 Gemini prioritaire (P1→P3) = 33 assets** · +11 optionnels (P4).
> ⏳ **Grimspire** : les 6 prompts sont prêts en variante **« chaleureux assombri »** ; la décision « bascule menaçante » est reportée → si tu génères maintenant, ce sera la version actuelle.

---

## 3) Conventions techniques (communes)

- **PNG**, généré en **1024²**, exporté à la taille cible. **Props / façades / médaillons** : fond plat neutre → **détouré** (rembg / remove.bg / Photopea). **Monstres (§4)** *(depuis 2026-07-03)* : illustration à **fond d'ambiance peint → PAS de détourage** (le sujet est déjà cadré 1:1, générable direct en 512²).
- **Nommage exact** indiqué par asset. Emplacements : `public/monsters/`, `public/sprites/hero/`, `public/buildings/`, `public/portraits/`, `public/deities/`, etc.
- **Astuce cohérence** : générer 1 asset satisfaisant par lot, puis le **fournir en image de référence** pour les suivants (« même style que cette image »). Même modèle/mêmes réglages par lot.

---

## 4) 🟢 MONSTRES — illustration « carte de bestiaire » (Gemini)

> **Reco : 🟢 Gemini 2.5 Flash Image (« Nano Banana »)** — excellent en cohérence inter-images. Format **illustration peinte façon carte de bestiaire JRPG** : sujet centré 1:1 posé sur un **petit patch de sol thématisé** avec un **fond d'ambiance flou peint** (lueur d'habitat, particules, runes). Nomme `<id>.png`, dépose dans `public/monsters/`, **512² final**.

**Règle de style (revue 2026-07-03 — d'après captures de référence) :**
- **Style commun** : *Stylized fantasy adventure illustration, painterly digital art* — think **Studio Ghibli meets a JRPG bestiary card**. Ce n'est **plus** une figurine résine 3D : c'est une **illustration 2D peinte**.
- **Monstres normaux (`common`)** → ambiance **chaleureuse** (« vibrant warm colors », *Joyful and adventurous, never grimdark*), petit patch de sol + lueur selon l'**habitat**.
- **Élites / boss / demon lord** → **même format illustration + patch/lueur d'habitat**, mais ambiance **sombre et dramatique**, ton **menaçant** (on retire « joyful, never grimdark »).
- **Fond d'ambiance peint et intégré** → **PAS de détourage** (le flou d'habitat fait partie de l'illustration). *(≠ des façades/props §6-§7 qui, eux, restent sur fond neutre détourable.)*
- Chaque bloc se termine par **`Render : …`** (le sujet) puis **`Format : PNG, 512×512`**, exactement comme les prompts de référence.

Chaque bloc ci-dessous est un **prompt complet prêt à copier-coller** (style + composition + sujet déjà assemblés). 💡 Cohérence : génère un 1ᵉʳ monstre par ambiance (1 normal + 1 menaçant), puis fournis-le en **image de référence** pour les suivants.

### 🌲 Ashenvale Forest — Lv 1-8 *(décor : sol forestier moussu, feuilles d'automne)*

**`ashwood_wolf.png`** — Ashwood Wolf *(normal)*
```
Stylized fantasy adventure illustration, painterly digital art with vibrant warm colors and a touch of magical atmosphere. Slightly cartoonish but expressive — think Studio Ghibli meets a JRPG bestiary card. The creature is centered in a square 1:1 composition, standing on a small round patch of mossy forest floor with fallen autumn leaves and a little twig, with drifting leaves and glowing pollen motes and faint glowing runes swirling in the dappled air, and a soft blurred sunlit-forest glow framing the subject. Soft rim-light catches the silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Joyful and adventurous tone, never grimdark.
Render : An Ashwood Wolf — a sleek silver-grey forest wolf with warm amber eyes and slightly tousled fur, in an alert mid-step prowl with ears forward and a friendly-fierce expression.
Format : PNG, 512×512
```
**`thicket_hare.png`** — Thicket Hare *(normal)*
```
Stylized fantasy adventure illustration, painterly digital art with vibrant warm colors and a touch of magical atmosphere. Slightly cartoonish but expressive — think Studio Ghibli meets a JRPG bestiary card. The creature is centered in a square 1:1 composition, standing on a small round patch of mossy forest floor with fallen autumn leaves and a little twig, with drifting leaves and glowing pollen motes and faint glowing runes swirling in the dappled air, and a soft blurred sunlit-forest glow framing the subject. Soft rim-light catches the silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Joyful and adventurous tone, never grimdark.
Render : A Thicket Hare — a plump brown woodland hare with oversized alert ears and big round bright eyes, perched up on its hind legs with a twitching nose, harmless and cute.
Format : PNG, 512×512
```
**`tuskmaw_boar.png`** — Tuskmaw Boar *(normal)*
```
Stylized fantasy adventure illustration, painterly digital art with vibrant warm colors and a touch of magical atmosphere. Slightly cartoonish but expressive — think Studio Ghibli meets a JRPG bestiary card. The creature is centered in a square 1:1 composition, standing on a small round patch of mossy forest floor with fallen autumn leaves and a little twig, with drifting leaves and glowing pollen motes and faint glowing runes swirling in the dappled air, and a soft blurred sunlit-forest glow framing the subject. Soft rim-light catches the silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Joyful and adventurous tone, never grimdark.
Render : A Tuskmaw Boar — a stocky bristly wild boar with thick hide, curved ivory tusks and a broad wet snout, hooves planted and head lowered ready to charge, grumpy but rounded.
Format : PNG, 512×512
```
**`old_oakheart.png`** — Old Oakheart *(élite — style menaçant)*
```
Stylized fantasy adventure illustration, painterly digital art with rich dramatic colors and a dark magical atmosphere. Slightly cartoonish but expressive, imposing and menacing — think Studio Ghibli meets a JRPG boss bestiary card. The creature is centered in a square 1:1 composition, standing on a small round patch of shadowed forest floor with gnarled roots and dead leaves, with drifting dark leaves and dim glowing spore-motes and faint glowing runes swirling in the murky air, and a soft blurred brooding shadowed-forest glow framing the subject. Strong rim-light catches the menacing silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Menacing, dramatic and imposing tone.
Render : Old Oakheart — an ancient towering oak treant with a gnarled bark-skin face and deep-set glowing eyes, massive limb-branches wreathed in moss and brambles, rooted gnarled feet, weathered and imposing.
Format : PNG, 512×512
```

### 🌿 Thornmarsh — Lv 6-14 *(décor : marais, eau trouble, roseaux, nénuphar)*

**`marsh_serpent.png`** — Marsh Serpent *(normal)*
```
Stylized fantasy adventure illustration, painterly digital art with vibrant warm colors and a touch of magical atmosphere. Slightly cartoonish but expressive — think Studio Ghibli meets a JRPG bestiary card. The creature is centered in a square 1:1 composition, standing on a small round patch of murky swamp ground with dark water, reeds and a lily pad, with drifting fireflies and pale wisps of marsh mist and faint glowing runes curling in the air, and a soft blurred hazy misty-swamp glow framing the subject. Soft rim-light catches the silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Joyful and adventurous tone, never grimdark.
Render : A Marsh Serpent — a coiled green-and-gold marsh serpent rising to strike, with glistening wet scales, a forked tongue and slit golden eyes, sleek and sinuous.
Format : PNG, 512×512
```
**`briar_wraith.png`** — Briar Wraith *(normal)*
```
Stylized fantasy adventure illustration, painterly digital art with vibrant warm colors and a touch of magical atmosphere. Slightly cartoonish but expressive — think Studio Ghibli meets a JRPG bestiary card. The creature is centered in a square 1:1 composition, standing on a small round patch of murky swamp ground with dark water, reeds and a lily pad, with drifting fireflies and pale wisps of marsh mist and faint glowing runes curling in the air, and a soft blurred hazy misty-swamp glow framing the subject. Soft rim-light catches the silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Joyful and adventurous tone, never grimdark.
Render : A Briar Wraith — a tattered thorn-wreathed wraith of living briar and torn grey cloth, with a faint hollow softly-glowing face and vines and thorns curling around a wispy ghostly body, eerie but stylized.
Format : PNG, 512×512
```
**`mire_slime.png`** — Mire Slime *(normal)*
```
Stylized fantasy adventure illustration, painterly digital art with vibrant warm colors and a touch of magical atmosphere. Slightly cartoonish but expressive — think Studio Ghibli meets a JRPG bestiary card. The creature is centered in a square 1:1 composition, standing on a small round patch of murky swamp ground with dark water, reeds and a lily pad, with drifting fireflies and pale wisps of marsh mist and faint glowing runes curling in the air, and a soft blurred hazy misty-swamp glow framing the subject. Soft rim-light catches the silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Joyful and adventurous tone, never grimdark.
Render : A Mire Slime — a translucent murky-green gelatinous slime blob with a glossy wet surface, a few bubbles and tiny bits of swamp debris suspended inside, with simple cute eyes and one little pseudopod.
Format : PNG, 512×512
```
**`fenrot_devourer.png`** — Fenrot Devourer *(élite — style menaçant)*
```
Stylized fantasy adventure illustration, painterly digital art with rich dramatic colors and a dark magical atmosphere. Slightly cartoonish but expressive, imposing and menacing — think Studio Ghibli meets a JRPG boss bestiary card. The creature is centered in a square 1:1 composition, standing on a small round patch of fetid bog with black water, dead reeds and bones, with drifting flies and putrid green vapor and faint glowing runes curling in the air, and a soft blurred sickly murky-swamp gloom glow framing the subject. Strong rim-light catches the menacing silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Menacing, dramatic and imposing tone.
Render : The Fenrot Devourer — a hulking rotting marsh beast, part crocodile part wolf, with a slavering oversized maw lined with jagged teeth and a mottled diseased hide dripping bog filth, predatory and vicious.
Format : PNG, 512×512
```

### 🏚 Crumbled Ruins — Lv 12-20 *(décor : dalles antiques fissurées, gravats)*

**`stone_golem.png`** — Stone Golem *(normal)*
```
Stylized fantasy adventure illustration, painterly digital art with vibrant warm colors and a touch of magical atmosphere. Slightly cartoonish but expressive — think Studio Ghibli meets a JRPG bestiary card. The creature is centered in a square 1:1 composition, standing on a small round patch of cracked ancient flagstones and rubble, with drifting motes of dust and faint glowing carved runes swirling in the air, and a soft blurred sunlit-ruins glow framing the subject. Soft rim-light catches the silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Joyful and adventurous tone, never grimdark.
Render : A Stone Golem — a chunky humanoid golem built of cracked mossy ruin-stones and ancient masonry, with glowing rune-light along its chest seams and heavy blocky fists, sturdy and stoic.
Format : PNG, 512×512
```
**`hollow_knight.png`** — Hollow Knight *(normal)*
```
Stylized fantasy adventure illustration, painterly digital art with vibrant warm colors and a touch of magical atmosphere. Slightly cartoonish but expressive — think Studio Ghibli meets a JRPG bestiary card. The creature is centered in a square 1:1 composition, standing on a small round patch of cracked ancient flagstones and rubble, with drifting motes of dust and faint glowing carved runes swirling in the air, and a soft blurred sunlit-ruins glow framing the subject. Soft rim-light catches the silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Joyful and adventurous tone, never grimdark.
Render : A Hollow Knight — an empty suit of tarnished medieval armor animated by a faint ghost-light inside the helm, holding a notched longsword, hollow, silent and a touch eerie.
Format : PNG, 512×512
```
**`ruin_specter.png`** — Ruin Specter *(normal)*
```
Stylized fantasy adventure illustration, painterly digital art with vibrant warm colors and a touch of magical atmosphere. Slightly cartoonish but expressive — think Studio Ghibli meets a JRPG bestiary card. The creature is centered in a square 1:1 composition, standing on a small round patch of cracked ancient flagstones and rubble, with drifting motes of dust and faint glowing carved runes swirling in the air, and a soft blurred sunlit-ruins glow framing the subject. Soft rim-light catches the silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Joyful and adventurous tone, never grimdark.
Render : A Ruin Specter — a wispy translucent spectre drifting upright, a faintly glowing pale-blue form with a sorrowful elongated face and trailing ethereal tatters, melancholic and ghostly.
Format : PNG, 512×512
```
**`graven_sentinel.png`** — Graven Sentinel *(élite — style menaçant)*
```
Stylized fantasy adventure illustration, painterly digital art with rich dramatic colors and a dark magical atmosphere. Slightly cartoonish but expressive, imposing and menacing — think Studio Ghibli meets a JRPG boss bestiary card. The creature is centered in a square 1:1 composition, standing on a small round patch of cracked ancient flagstones and grave rubble, with drifting dust and dark motes and faint glowing carved runes swirling in the air, and a soft blurred shadowed ruins glow framing the subject. Strong rim-light catches the menacing silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Menacing, dramatic and imposing tone.
Render : The Graven Sentinel — a towering grave-warden in heavy weathered funerary armor and a tattered burial cloak, a helm shaped like a tomb death-mask, wielding a massive ceremonial greatsword, with a cold merciless gaze, grim and imposing.
Format : PNG, 512×512
```

### ⛰ Wildmere Hills — Lv 18-26 *(décor : sommet herbeux, fleurs sauvages)*

**`hill_slime.png`** — Hill Slime *(normal)*
```
Stylized fantasy adventure illustration, painterly digital art with vibrant warm colors and a touch of magical atmosphere. Slightly cartoonish but expressive — think Studio Ghibli meets a JRPG bestiary card. The creature is centered in a square 1:1 composition, standing on a small round grassy hilltop patch dotted with wildflowers and clover, with drifting petals and dandelion seeds swirling in a breeze, faint glowing runes in the curling air, and a soft bright blurred open-sky-and-hills glow framing the subject. Soft rim-light catches the silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Joyful and adventurous tone, never grimdark.
Render : A Hill Slime — a rounded mossy-green hillside slime with a glossy surface, tufts of grass and a few tiny wildflowers growing on its back, cheerful simple eyes, bouncy and friendly.
Format : PNG, 512×512
```
**`russet_fox.png`** — Russet Fox *(normal)*
```
Stylized fantasy adventure illustration, painterly digital art with vibrant warm colors and a touch of magical atmosphere. Slightly cartoonish but expressive — think Studio Ghibli meets a JRPG bestiary card. The creature is centered in a square 1:1 composition, standing on a small round grassy hilltop patch dotted with wildflowers and clover, with drifting petals and dandelion seeds swirling in a breeze, faint glowing runes in the curling air, and a soft bright blurred open-sky-and-hills glow framing the subject. Soft rim-light catches the silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Joyful and adventurous tone, never grimdark.
Render : A Russet Fox — a lithe russet-red fox with a bushy white-tipped tail and sharp clever eyes, caught mid-leap, playful, quick and elegant.
Format : PNG, 512×512
```
**`knoll_goblin.png`** — Knoll Goblin *(normal)*
```
Stylized fantasy adventure illustration, painterly digital art with vibrant warm colors and a touch of magical atmosphere. Slightly cartoonish but expressive — think Studio Ghibli meets a JRPG bestiary card. The creature is centered in a square 1:1 composition, standing on a small round grassy hilltop patch dotted with wildflowers and clover, with drifting petals and dandelion seeds swirling in a breeze, faint glowing runes in the curling air, and a soft bright blurred open-sky-and-hills glow framing the subject. Soft rim-light catches the silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Joyful and adventurous tone, never grimdark.
Render : A Knoll Goblin — a scrappy green-skinned goblin in patchwork leather and a crude dented helmet, gripping a jagged shiv with a sly toothy grin, hunched, wiry and mischievous.
Format : PNG, 512×512
```
**`thunderhoof.png`** — Thunderhoof *(élite — style menaçant)*
```
Stylized fantasy adventure illustration, painterly digital art with rich dramatic colors and a dark magical atmosphere. Slightly cartoonish but expressive, imposing and menacing — think Studio Ghibli meets a JRPG boss bestiary card. The creature is centered in a square 1:1 composition, standing on a small round storm-battered grassy hilltop patch with wind-flattened grass, with drifting torn grass and crackling blue sparks and faint glowing runes in the gusting air, and a soft blurred brooding storm-sky glow framing the subject. Strong rim-light catches the menacing silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Menacing, dramatic and imposing tone.
Render : The Thunderhoof — a massive battle-scarred bison-bull with a storm-grey hide, cracked horns crackling with faint blue lightning, steam snorting from its nostrils and hooves striking sparks, powerful and brutal.
Format : PNG, 512×512
```

### 💀 Réserve *(hors surface — usage futur donjon)*

**`barrow_wight.png`** — Barrow Wight *(normal — ton légèrement spooky)*
```
Stylized fantasy adventure illustration, painterly digital art with vibrant warm colors and a touch of magical atmosphere. Slightly cartoonish but expressive — think Studio Ghibli meets a JRPG bestiary card. The creature is centered in a square 1:1 composition, standing on a small round patch of grave dirt with a cracked mossy tombstone, with drifting dust and pale wisps and faint glowing runes swirling in the air, and a soft blurred hazy barrow glow framing the subject. Soft rim-light catches the silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Adventurous tone with a slightly spooky edge, never grimdark.
Render : A Barrow Wight — a desiccated undead wight wrapped in ancient rotted grave-cloth, with sunken softly-glowing eye-sockets, clutching a rusted burial blade, gaunt and eerie but stylized.
Format : PNG, 512×512
```
**`soul_harvester.png`** — Soul Harvester *(élite — style menaçant)*
```
Stylized fantasy adventure illustration, painterly digital art with rich dramatic colors and a dark magical atmosphere. Slightly cartoonish but expressive, imposing and menacing — think Studio Ghibli meets a JRPG boss bestiary card. The creature is centered in a square 1:1 composition, standing on a small round patch of grave dirt with cracked tombstones and scattered bones, with drifting pale captured souls and grave-dust and faint glowing runes swirling in the air, and a soft blurred cold ghostly-crypt gloom glow framing the subject. Strong rim-light catches the menacing silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Menacing, dramatic and imposing tone.
Render : The Soul Harvester — a tall cloaked reaper-like figure wreathed in shadow, skeletal hands gripping a curved soul-scythe, a swirl of small glowing captured souls orbiting it and a faceless dark hood, sinister and cruel.
Format : PNG, 512×512
```

### 💀 The Blighted Road *(élites — style menaçant)*

**`cursed_warlord.png`** — Cursed Warlord *(élite)*
```
Stylized fantasy adventure illustration, painterly digital art with rich dramatic colors and a dark magical atmosphere. Slightly cartoonish but expressive, imposing and menacing — think Studio Ghibli meets a JRPG boss bestiary card. The creature is centered in a square 1:1 composition, standing on a small round patch of cracked blighted earth strewn with ash and bone, with drifting ash and dark embers and faint glowing runes swirling in the tainted air, and a soft blurred sickly red-tinged blight glow framing the subject. Strong rim-light catches the menacing silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Menacing, dramatic and imposing tone.
Render : The Cursed Warlord — a hulking armored warlord clad in blackened cursed plate etched with red glowing runes, wielding a massive jagged cursed blade, with a tattered war-banner cape and a helm with burning eye-slits, brutal and menacing.
Format : PNG, 512×512
```
**`bone_colossus.png`** — Bone Colossus *(élite)*
```
Stylized fantasy adventure illustration, painterly digital art with rich dramatic colors and a dark magical atmosphere. Slightly cartoonish but expressive, imposing and menacing — think Studio Ghibli meets a JRPG boss bestiary card. The creature is centered in a square 1:1 composition, standing on a small round patch of cracked blighted earth strewn with ash and bone, with drifting ash and dark embers and faint glowing runes swirling in the tainted air, and a soft blurred sickly red-tinged blight glow framing the subject. Strong rim-light catches the menacing silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Menacing, dramatic and imposing tone.
Render : The Bone Colossus — a gigantic colossus assembled from countless fused bones and skulls, a towering skeletal frame with necrotic light glowing in its ribcage and massive bone fists, monstrous and dreadful.
Format : PNG, 512×512
```

### 🌋 Grimspire — Lv 21+ *(décor : pierre volcanique sombre fissurée, braises)*

> Communs `common` mais **zone sombre/fin de jeu** → on garde l'ambiance chaleureuse mais avec un **« darker volcanic cast »** (palette assombrie, ton grave sans être franchement menaçant). *(Cf. décision §16 : on peut les passer en variante menaçante comme les élites si tu préfères.)*

**`grimstone_troll.png`** — Grimstone Troll *(normal)*
```
Stylized fantasy adventure illustration, painterly digital art with vibrant warm colors given a darker volcanic cast and a touch of ominous magical atmosphere. Slightly cartoonish but expressive — think Studio Ghibli meets a JRPG bestiary card. The creature is centered in a square 1:1 composition, standing on a small round patch of dark cracked volcanic stone with faint glowing embers, with drifting sparks and floating embers and faint glowing runes swirling in the smoky air, and a soft blurred ember-lit volcanic glow framing the subject. Soft rim-light catches the silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Adventurous but grave tone, never fully grimdark.
Render : A Grimstone Troll — a massive lumbering troll with craggy grey grimstone skin and mossy growths, small mean eyes, long arms ending in heavy claws and slowly regenerating gashes, brutish.
Format : PNG, 512×512
```
**`cursed_sentinel.png`** — Cursed Sentinel *(normal)*
```
Stylized fantasy adventure illustration, painterly digital art with vibrant warm colors given a darker volcanic cast and a touch of ominous magical atmosphere. Slightly cartoonish but expressive — think Studio Ghibli meets a JRPG bestiary card. The creature is centered in a square 1:1 composition, standing on a small round patch of dark cracked volcanic stone with faint glowing embers, with drifting sparks and floating embers and faint glowing runes swirling in the smoky air, and a soft blurred ember-lit volcanic glow framing the subject. Soft rim-light catches the silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Adventurous but grave tone, never fully grimdark.
Render : A Cursed Sentinel — an animated suit of ornate cursed dark-iron armor with a faint purple soul-glow, holding a tower shield and a spiked mace, standing rigid in eternal guard.
Format : PNG, 512×512
```
**`abyssal_hound.png`** — Abyssal Hound *(normal)*
```
Stylized fantasy adventure illustration, painterly digital art with vibrant warm colors given a darker volcanic cast and a touch of ominous magical atmosphere. Slightly cartoonish but expressive — think Studio Ghibli meets a JRPG bestiary card. The creature is centered in a square 1:1 composition, standing on a small round patch of dark cracked volcanic stone with faint glowing embers, with drifting sparks and floating embers and faint glowing runes swirling in the smoky air, and a soft blurred ember-lit volcanic glow framing the subject. Soft rim-light catches the silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Adventurous but grave tone, never fully grimdark.
Render : An Abyssal Hound — a sleek black six-eyed hound of the abyss with smoking shadowy fur and glowing void-fangs, in a low predatory stance, fierce.
Format : PNG, 512×512
```
**`wyvern_scout.png`** — Wyvern Scout *(normal)*
```
Stylized fantasy adventure illustration, painterly digital art with vibrant warm colors given a darker volcanic cast and a touch of ominous magical atmosphere. Slightly cartoonish but expressive — think Studio Ghibli meets a JRPG bestiary card. The creature is centered in a square 1:1 composition, standing on a small round patch of dark cracked volcanic stone with faint glowing embers, with drifting sparks and floating embers and faint glowing runes swirling in the smoky air, and a soft blurred ember-lit volcanic glow framing the subject. Soft rim-light catches the silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Adventurous but grave tone, never fully grimdark.
Render : A Wyvern Scout — a lean winged wyvern with leathery membrane wings spread wide, a barbed whipping tail and sharp reptilian eyes, perched and alert.
Format : PNG, 512×512
```
**`plague_monk.png`** — Plague Monk *(normal)*
```
Stylized fantasy adventure illustration, painterly digital art with vibrant warm colors given a darker volcanic cast and a touch of ominous magical atmosphere. Slightly cartoonish but expressive — think Studio Ghibli meets a JRPG bestiary card. The creature is centered in a square 1:1 composition, standing on a small round patch of dark cracked volcanic stone with faint glowing embers, with drifting sparks and floating embers and faint glowing runes swirling in the smoky air, and a soft blurred ember-lit volcanic glow framing the subject. Soft rim-light catches the silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Adventurous but grave tone, never fully grimdark.
Render : A Plague Monk — a gaunt hooded monk in stained plague-robes, clutching a smoking censer that trails toxic green vapor, with sickly grey skin and fanatical glowing eyes.
Format : PNG, 512×512
```
**`iron_wraith.png`** — Iron Wraith *(normal)*
```
Stylized fantasy adventure illustration, painterly digital art with vibrant warm colors given a darker volcanic cast and a touch of ominous magical atmosphere. Slightly cartoonish but expressive — think Studio Ghibli meets a JRPG bestiary card. The creature is centered in a square 1:1 composition, standing on a small round patch of dark cracked volcanic stone with faint glowing embers, with drifting sparks and floating embers and faint glowing runes swirling in the smoky air, and a soft blurred ember-lit volcanic glow framing the subject. Soft rim-light catches the silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Adventurous but grave tone, never fully grimdark.
Render : An Iron Wraith — a spectral wraith fused with floating jagged shards of spectral iron around a glowing core, with ghostly metal tatters swirling, cold and eerie.
Format : PNG, 512×512
```

### 👑 Boss & Demon Lord *(style illustration menaçant)*

**`hollow_crypt_boss.png`** — The Crypt Keeper *(boss)*
```
Stylized fantasy adventure illustration, painterly digital art with rich dramatic colors and a dark magical atmosphere. Slightly cartoonish but expressive, imposing and menacing — think Studio Ghibli meets a JRPG boss bestiary card. The creature is centered in a square 1:1 composition, standing on a small round patch of cracked crypt flagstones scattered with bones, with drifting grave-dust and necrotic wisps and faint glowing runes swirling in the air, and a soft blurred cold necrotic crypt glow framing the subject. Strong rim-light catches the menacing silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Menacing, dramatic and regal tone.
Render : The Crypt Keeper — a towering undead crypt-lord in a tattered hooded death-shroud over ancient bone-armor, a crowned skeletal skull face with burning eye-sockets, wielding a long necrotic staff-scythe and commanding the dead, terrifying and regal.
Format : PNG, 512×512
```
**`forsaken_citadel_boss.png`** — Lord of the Forsaken *(boss)*
```
Stylized fantasy adventure illustration, painterly digital art with rich dramatic colors and a dark magical atmosphere. Slightly cartoonish but expressive, imposing and menacing — think Studio Ghibli meets a JRPG boss bestiary card. The creature is centered in a square 1:1 composition, standing on a small round patch of blackened citadel stone and cursed ash, with drifting embers and dark motes and faint glowing runes swirling in the air, and a soft blurred brooding void-fire glow framing the subject. Strong rim-light catches the menacing silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Menacing, dramatic and imposing tone.
Render : The Lord of the Forsaken — a dread armored sovereign in towering blackened spiked plate over a regenerating cursed-iron carapace, with a tattered dark royal cape, twin cruel blades and a malevolent crowned helm with void-fire eyes, imposing and merciless.
Format : PNG, 512×512
```
**`malachar.png`** — Malachar the Undying *(demon lord — final boss)*
```
Stylized fantasy adventure illustration, painterly digital art with rich dramatic colors and an overwhelming dark magical atmosphere. Slightly cartoonish but expressive, colossal and terrifying — think Studio Ghibli meets a JRPG final-boss bestiary card. The creature is centered in a square 1:1 composition, standing on a small round patch of scorched cracked ground veined with glowing necrotic embers, with swirling dark flame and violet cinders and faint glowing runes spiralling in the air, and a soft blurred overwhelming violet-and-ember dread glow framing the subject. Strong rim-light catches the towering menacing silhouette, a tiny sparkle accent in a corner. No text, no UI elements, no borders. Menacing, dramatic and awe-inspiring tone, an epic final-boss centerpiece.
Render : Malachar the Undying — a colossal demon-lord wreathed in dark flame and necrotic energy, an immense horned skull-crowned figure in shattered god-killer armor with eyes of cold violet fire, radiating overwhelming dread.
Format : PNG, 512×512
```

---

## 5) 🟠 HÉROS — sprites animés (À SOURCER, pas Gemini)

**Reco : 🟠 SOURCER un pack.** L'IA image **ne sait pas** garder le même personnage identique **frame par frame** → un spritesheet animé (idle/walking/dying) est à prendre dans un pack.
- Chercher un **chibi héros héroïque lumineux** (itch.io / CraftPix « Tiny Hero » / LPC) respectant le **layout actuel** : `public/sprites/hero/{idle,walking,dying}/NN.png`.
- Garder la **même structure de dossiers** (idle ~18f, walking ~24f, dying ~15f) → swap sans toucher au code.
- *(Alternative IA ambitieuse : générer 1 design de référence chez Gemini, puis le faire animer par un pipeline sprite dédié — mais le sourcing reste le plus fiable.)*

---

## 6) 🟢 FAÇADES DE BÂTIMENTS (Gemini)

> **Reco : 🟢 Gemini.** Style **village médiéval-fantaisie chaleureux (Ghibli × Dragon Quest)**, cohérent avec la carte parchemin. **Prompt concis** (cf. captures validées), vue de face 3/4, **fond neutre à détourer**, `Format : PNG, généré 1024²`. Emplacement : `public/buildings/<id>.png`.

Chaque bloc est un **prompt complet prêt à copier-coller**.

**`inn.png`** — The Hearth Inn
```
A single charming cozy timber-framed medieval-fantasy village inn, with a hanging wooden tavern sign shaped like a foaming ale mug, warm glowing amber windows, a worn thatched roof, a stone chimney with a wisp of smoke and a welcoming arched door. Front 3/4 view, storybook Ghibli-meets-Dragon-Quest style, warm inviting colors, hand-painted look. Isolated on a flat neutral light background (easy to cut out). No text, no UI, no border, no ground scene.
Format : PNG, généré 1024², fond neutre à détourer
```
**`merchant.png`** — Merchant's Shop
```
A single charming medieval-fantasy merchant's shop, with a quaint timber-and-plaster shopfront, a striped red-and-cream awning, an open stall window, crates and barrels of colorful goods stacked by the door and a hanging sign showing a gold coin and a weighing scale. Front 3/4 view, storybook Ghibli-meets-Dragon-Quest style, warm inviting colors, hand-painted look. Isolated on a flat neutral light background (easy to cut out). No text, no UI, no border, no ground scene.
Format : PNG, généré 1024², fond neutre à détourer
```
**`blacksmith.png`** — Blacksmith's Forge
```
A single charming medieval-fantasy blacksmith's forge, with a sturdy stone-and-timber smithy, a glowing orange furnace visible inside, an anvil and hammer out front, a tall stone chimney puffing smoke and a hanging sign shaped like a hammer crossed over an anvil. Front 3/4 view, storybook Ghibli-meets-Dragon-Quest style, warm inviting colors, hand-painted look. Isolated on a flat neutral light background (easy to cut out). No text, no UI, no border, no ground scene.
Format : PNG, généré 1024², fond neutre à détourer
```
**`alchemy.png`** — Alchemy Workshop
```
A single charming medieval-fantasy alchemist's hut, with a slightly crooked timber hut, bubbling colorful potion bottles glowing in the window, bunches of drying herbs hanging under the eaves, a hanging sign shaped like a mortar and pestle and a thin wisp of green smoke from a crooked chimney. Front 3/4 view, storybook Ghibli-meets-Dragon-Quest style, warm inviting colors, hand-painted look. Isolated on a flat neutral light background (easy to cut out). No text, no UI, no border, no ground scene.
Format : PNG, généré 1024², fond neutre à détourer
```
**`church.png`** — Church of the Old Gods
```
A single charming small stone medieval-fantasy chapel, with a modest bell tower and a hanging bell, a round stained-glass window glowing with warm candlelight, a simple wooden holy symbol over an arched door and a slate roof. Front 3/4 view, storybook Ghibli-meets-Dragon-Quest style, warm inviting reverent colors, hand-painted look. Isolated on a flat neutral light background (easy to cut out). No text, no UI, no border, no ground scene.
Format : PNG, généré 1024², fond neutre à détourer
```
**`master_smith.png`** — Master Smith *(forge améliorée, rare)*
```
A single charming medieval-fantasy master smith's workshop, with a grand upgraded forge of fine stone and dark timber, a large bright glowing furnace, an ornate anvil and masterwork weapons displayed on a rack out front, a tall chimney throwing bright sparks and a hanging sign shaped like a crowned hammer-and-anvil. Front 3/4 view, storybook Ghibli-meets-Dragon-Quest style, warm rich colors, hand-painted look. Isolated on a flat neutral light background (easy to cut out). No text, no UI, no border, no ground scene.
Format : PNG, généré 1024², fond neutre à détourer
```
**`knight_trainer.png`** — Knight Trainer
```
A single charming medieval-fantasy knight trainer's hall, with a sturdy timber-and-stone training hall, a small fenced sparring yard, a weapon rack and a straw practice dummy out front, a heraldic shield mounted above the door, fluttering banners and a hanging sign shaped like a crossed sword and shield. Front 3/4 view, storybook Ghibli-meets-Dragon-Quest style, warm inviting colors, hand-painted look. Isolated on a flat neutral light background (easy to cut out). No text, no UI, no border, no ground scene.
Format : PNG, généré 1024², fond neutre à détourer
```
**`guild.png`** — Adventurers' Guild
```
A single charming medieval-fantasy adventurers' guild hall, with an imposing two-storey timber-and-stone hall, colorful pennant banners, a large hanging sign bearing a crossed-swords crest, a bounty notice board beside a heavy double door and a peaked roof. Front 3/4 view, storybook Ghibli-meets-Dragon-Quest style, warm inviting colors, hand-painted look. Isolated on a flat neutral light background (easy to cut out). No text, no UI, no border, no ground scene.
Format : PNG, généré 1024², fond neutre à détourer
```
**`academy.png`** — Academy of Magic
```
A single charming medieval-fantasy mage's academy, with a slender scholarly stone tower, tall arched windows glowing with soft arcane light, faint blue runes etched along the stone, a conical tiled roof topped with a small observatory dome and a hanging sign bearing a star-and-eye sigil. Front 3/4 view, storybook Ghibli-meets-Dragon-Quest style, warm inviting colors with a touch of arcane blue, hand-painted look. Isolated on a flat neutral light background (easy to cut out). No text, no UI, no border, no ground scene.
Format : PNG, généré 1024², fond neutre à détourer
```

---

## 7) 🟢 DÉCO VILLAGE (Gemini)

> **Reco : 🟢 Gemini.** Petits props isolés, **même style village concis** que §6, **fond neutre à détourer**, `Format : PNG, généré 1024²`. `public/deco/<id>.png`. Chaque bloc est un **prompt complet prêt à copier-coller**.

**`well.png`** — Puits
```
A single small medieval-fantasy village prop — a charming round stone wishing-well with a little peaked wooden roof, a hanging bucket on a rope and a few mossy stones. Storybook Ghibli-meets-Dragon-Quest style, warm hand-painted look. Isolated on a flat neutral light background (easy to cut out). No text, no UI, no border, no ground scene.
Format : PNG, généré 1024², fond neutre à détourer
```
**`barrels.png`** — Tonneaux
```
A single small medieval-fantasy village prop — a small tidy stack of iron-banded wooden barrels and a crate with a little burlap sack leaning against them. Storybook Ghibli-meets-Dragon-Quest style, warm hand-painted look. Isolated on a flat neutral light background (easy to cut out). No text, no UI, no border, no ground scene.
Format : PNG, généré 1024², fond neutre à détourer
```
**`hens.png`** — Poules
```
A single small medieval-fantasy village prop — two or three plump cute brown-and-white hens pecking and clucking together, charming and rounded. Storybook Ghibli-meets-Dragon-Quest style, warm hand-painted look. Isolated on a flat neutral light background (easy to cut out). No text, no UI, no border, no ground scene.
Format : PNG, généré 1024², fond neutre à détourer
```
**`signpost.png`** — Panneau
```
A single small medieval-fantasy village prop — a weathered wooden signpost with two or three blank directional planks pointing different ways, slightly leaning. Storybook Ghibli-meets-Dragon-Quest style, warm hand-painted look. Isolated on a flat neutral light background (easy to cut out). No text, no UI, no border, no ground scene.
Format : PNG, généré 1024², fond neutre à détourer
```
**`market_stall.png`** — Étal de marché
```
A single small medieval-fantasy village prop — a colorful little market stall with a striped awning and woven baskets of bright produce (fruit, vegetables, bread) on the counter. Storybook Ghibli-meets-Dragon-Quest style, warm hand-painted look. Isolated on a flat neutral light background (easy to cut out). No text, no UI, no border, no ground scene.
Format : PNG, généré 1024², fond neutre à détourer
```
**`lantern_post.png`** — Lampadaire
```
A single small medieval-fantasy village prop — a wrought-iron lantern post with a glass lantern holding a warm glowing flame and a little curl of decorative ironwork at the top. Storybook Ghibli-meets-Dragon-Quest style, warm hand-painted look. Isolated on a flat neutral light background (easy to cut out). No text, no UI, no border, no ground scene.
Format : PNG, généré 1024², fond neutre à détourer
```
**`hay_cart.png`** — Charrette de foin
```
A single small medieval-fantasy village prop — a small wooden hay cart with two large wheels, loaded with golden hay bales and a pitchfork resting against the side. Storybook Ghibli-meets-Dragon-Quest style, warm hand-painted look. Isolated on a flat neutral light background (easy to cut out). No text, no UI, no border, no ground scene.
Format : PNG, généré 1024², fond neutre à détourer
```

### 🧓 Puits & PNJ de village en vignette *(illustrations détourables — style bâtiment concis)*

> **Reco : 🟢 Gemini.** Vignettes **personnage / centre de village** dans le **même style concis que les façades §6** (cf. captures de réf. : *Ghibli-meets-Dragon-Quest, warm inviting colors, hand-painted, fond neutre à détourer*). Emplacement proposé : **`public/village/<id>.png`** (nouveau dossier).
> - **`well_elder_m` / `well_elder_f`** = **hub du village** (puits + **panneau directionnel** + **doyen/doyenne**). Ils **enrichissent/remplacent** `deco/well.png` + `deco/signpost.png` au centre (cf. placeholder `vil-well` dans `SafeZone.jsx`, où siège le doyen — trigger `elder_dialogue`). Génère les **2 variantes**.
> - **`aldric_tree`** : **fournir `portraits/aldric` en image de référence** pour garder son visage (barbu blanc) cohérent — Aldric = *Sir Aldric, Knight Trainer*.

**`well_elder_m.png`** — Puits + panneau + **doyen** (vieil homme)
```
A single charming medieval-fantasy village-square scene — a round stone wishing-well with a little peaked wooden roof and a hanging bucket on a rope, right next to a weathered wooden directional signpost with a few blank planks pointing different ways, and a kindly old village elder — a white-bearded man in a simple brown robe with a small medallion of office — sitting and resting on the well's stone rim, relaxed and welcoming. Front 3/4 view, storybook Ghibli-meets-Dragon-Quest style, warm inviting colors, hand-painted look. Isolated on a flat neutral light background (easy to cut out). No text, no UI, no border, no ground scene.
Format : PNG, généré 1024², fond neutre à détourer
```
**`well_elder_f.png`** — Puits + panneau + **doyenne** (vieille femme)
```
A single charming medieval-fantasy village-square scene — a round stone wishing-well with a little peaked wooden roof and a hanging bucket on a rope, right next to a weathered wooden directional signpost with a few blank planks pointing different ways, and a kindly old village elder — a grey-haired woman in a simple long dress and a knitted shawl with a small medallion of office — sitting and resting on the well's stone rim, relaxed and welcoming. Front 3/4 view, storybook Ghibli-meets-Dragon-Quest style, warm inviting colors, hand-painted look. Isolated on a flat neutral light background (easy to cut out). No text, no UI, no border, no ground scene.
Format : PNG, généré 1024², fond neutre à détourer
```
**`aldric_tree.png`** — Sir Aldric qui « chill » sous son arbre *(réf. visage : `portraits/aldric`)*
```
A single charming medieval-fantasy character vignette — Sir Aldric, a burly white-bearded veteran knight-trainer, relaxing and lounging back on a big fallen tree trunk beside a leafy tree, legs comfortably crossed and at ease, a single polished piece of plate armor (a breastplate with one pauldron) propped on the ground next to him, content and good-humored. Keep his head, face and white beard consistent with the provided Aldric reference portrait. Front 3/4 view, storybook Ghibli-meets-Dragon-Quest style, warm inviting colors, hand-painted look. Isolated on a flat neutral light background (easy to cut out). No text, no UI, no border, no ground scene.
Format : PNG, généré 1024², fond neutre à détourer
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

## 12) 🟢 CARTE DE DONJON — fond + médaillons de salle (DUN-ART01, Gemini)

> Le **DungeonView** (D03 / DUN-ART01) rend la **chaîne de 9 salles** (Combat 1/2/4/6/7 · Repos 3/8 · Trésor 5 · Boss 9). Comme la WorldMap, le moteur **place les nœuds en coordonnées %** et **trace le chemin en SVG** → on a besoin de **(A) un fond de donjon SANS salles dessinées** + **(B) un jeu de médaillons par type de salle**. Les états *courante / franchie / à venir* sont gérés **en CSS** (glow doré / ✓ / désaturation + 🔒) → **pas d'asset d'état**. Style : **cartographie parchemin-et-encre** cohérente avec `eldenmoor.png`, mais en **intérieur de crypte/caverne** (palette plus sombre, chaude aux bougies). Emplacement : `public/dungeon/`.

**(A) — Fond de carte** *(image pleine, paysage 16:9, pas de détourage)*

**`crypt_map.png`** — Fond de donjon (crypte)
```
An aged parchment cartography map illustration of the interior of a medieval-fantasy crypt-dungeon, drawn in ink and warm sepia wash as if sketched by an adventurer — a cross-section of carved stone chambers, vaulted corridors, cracked flagstones, cobwebs, scattered bones, dripping stalactites and the faint glow of distant torchlight, with plenty of empty open floor space where chambers would sit. Hand-drawn treasure-map style: ink linework, subtle aged-paper texture, soft candle-warm highlights, a darker shadowy vignette around the edges. IMPORTANT: do NOT draw any room markers, icons, numbers, dots, labels or a marked path — leave the chambers as empty readable spaces so markers can be overlaid later in-engine. Atmospheric, immersive, painterly storybook tone. Landscape 16:9 composition, full-bleed background. No text, no watermark, no UI, no border, no grid.
```

**(B) — Médaillons de salle** *(jeu cohérent, fond neutre détourable, ~256² final, `room_<type>.png`)*

> Un seul **état neutre** par type. Génère-les **en lot** (1ᵉʳ médaillon validé → fourni en référence pour les 3 autres) pour un rendu homogène. Le **chemin** reliant les salles est tracé en SVG par le moteur (comme les trails de la WorldMap) → pas d'asset de chemin.

**`room_combat.png`** — Salle de combat
```
A single circular game-map node medallion — a carved stone-and-bronze seal with a thin engraved gold rim, bearing a clear emblem of two crossed swords at its center. Aged parchment-and-ink cartography style matching an old fantasy treasure map, warm sepia and gold tones with subtle stone texture, hand-painted look, easily readable at small size. Centered, perfectly circular token, isolated on a perfectly flat evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border, no extra props.
```
**`room_rest.png`** — Salle de repos
```
A single circular game-map node medallion — a carved stone-and-bronze seal with a thin engraved gold rim, bearing a clear emblem of a small warm campfire with a bedroll at its center. Aged parchment-and-ink cartography style matching an old fantasy treasure map, warm sepia and gold tones with subtle stone texture, hand-painted look, easily readable at small size. Centered, perfectly circular token, isolated on a perfectly flat evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border, no extra props.
```
**`room_treasure.png`** — Salle au trésor
```
A single circular game-map node medallion — a carved stone-and-bronze seal with a thin engraved gold rim, bearing a clear emblem of a closed treasure chest with a glint of gold at its center. Aged parchment-and-ink cartography style matching an old fantasy treasure map, warm sepia and gold tones with subtle stone texture, hand-painted look, easily readable at small size. Centered, perfectly circular token, isolated on a perfectly flat evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border, no extra props.
```
**`room_boss.png`** — Salle de boss
```
A single circular game-map node medallion — a carved stone-and-bronze seal with a thin engraved gold rim, bearing a clear menacing emblem of a horned skull wearing a small crown at its center. Aged parchment-and-ink cartography style matching an old fantasy treasure map but slightly darker and more ominous, deep sepia with red-gold accents and subtle stone texture, hand-painted look, easily readable at small size. Centered, perfectly circular token, isolated on a perfectly flat evenly-lit neutral light-grey background so it is easy to cut out afterwards. No text, no watermark, no UI, no border, no extra props.
```

> 💡 Variante : si tu préfères des marqueurs **plats** plutôt que peints, les 4 emblèmes (épées croisées / feu de camp / coffre / crâne couronné) existent sur **game-icons.net** (CC BY) — recolore-les à la palette parchemin (`--ink`/`--gold`) et pose-les sur un anneau commun (§13).

---

## 13) ⚪ ICÔNES UI & OBJETS (PAS d'IA)

> **Reco : ⚪ `game-icons.net` (CC BY 3.0)** — set cohérent, recolorable à la palette parchemin (`--ink`, `--gold`, `--amber-deep`). **Pas de génération IA** (vectoriel, cohérence d'un set).
- **UI** : remplacer les emoji `⚔ 🛡 🪙 🌙 🛏 🍺 ⛪ 🎪 🔒 ☀ ⚡ ✦ 📖 🎒 📜`.
- **Objets/équipement** : armes (épée/hache/dague/bâton), armures (casque/plastron/bottes), potions, **mana stones**, ressources. (Optionnel 🟣 IA si on veut un rendu peint plutôt que des icônes plates.)

---

## 15) Workflow Gemini (rappel)

1. Copier-coller **le prompt complet de l'asset** (chaque bloc §4-§13 est déjà prêt, rien à assembler).
2. Générer en **1024²** (ou directement **512²** pour les monstres §4).
3. **Détourage** : ⚠️ **uniquement props / façades / médaillons** (fond neutre → rembg → PNG transparent). **Monstres §4 : PAS de détourage** — le fond d'ambiance peint fait partie de l'illustration.
4. Recadrer/redimensionner à la cible, **nommer exactement**, déposer dans le bon dossier `public/…`.
5. **Cohérence** : 1ʳᵉ image satisfaisante → réutilisée en **référence** pour le reste du lot.

> Outils : 🟢 **Gemini 2.5 Flash Image** (abonnement dispo, fort en cohérence) · alternatives 🟣 **Google Imagen/ImageFX**, Midjourney (plus beau, cohérence plus dure). Détourage : **rembg** (local, gratuit) / remove.bg / Photopea.

---

## ✅ Décisions actées

### Révision 2026-07-03 — monstres passés en **illustration peinte** (d'après captures de référence)
Le style **figurine 3D / résine sur fond gris détourable est abandonné pour les monstres (§4)** au profit d'une **illustration 2D peinte façon carte de bestiaire** (Ghibli × JRPG) : sujet 1:1 sur un petit patch de sol + **fond d'ambiance flou peint**.
1. **Style** : ✅ *painterly digital art*, plus de « collectible 3D figurine / resin ». *(Reflété §4.)*
2. **Socle → patch** : ✅ le « display base » de figurine devient un **petit patch de sol thématisé habitat** intégré à la scène. *(Reflété.)*
3. **Fond** : ✅ **fond d'ambiance peint, PAS de détourage** pour les monstres. Les **props / façades / médaillons** (§6-§7, §12B) restent en **fond neutre détouré**. *(Reflété §3/§15.)*
4. **Normaux vs élites/boss** : ✅ normaux = ambiance chaleureuse *« joyful, never grimdark »* ; **élites / boss / demon lord = même format mais ambiance sombre / menaçante** (on retire la ligne joyeuse). *(Reflété.)*
5. **Fin de prompt** : ✅ ajout des lignes **`Render : …`** + **`Format : PNG, 512×512`**, comme sur les captures. *(Reflété.)*
6. **Doc annexe supprimée** : `public/monsters/README.md` (ancienne direction « figurine sur socle ») est **abandonné** — inutile, jamais créé, et remplacé par ce fichier comme **source unique**.

### 2026-06-07 (historique — partiellement remplacé par la révision ci-dessus)
4. **Tiers Grimspire** : ⏳ les 6 communs Grimspire restent en **ambiance chaleureuse assombrie** (opener « darker volcanic cast » du §4). Si tu les veux franchement **menaçants** (comme les élites), dis-le et je bascule les 6.
5. **Façades / portraits** : ✅ **on garde le mix** illustration (bâtiments, divinités, char-select) + pixel (portraits PNJ de dialogue) — la règle anti-clash n'interdit que de les mélanger **au même cadre/échelle**, ce qui n'est pas le cas (écrans différents).
