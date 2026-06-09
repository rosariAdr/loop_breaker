# Monster Art — Guide de génération (figurines 3D sur socle)

> Ce dossier contient les portraits des monstres affichés en combat + bestiaire.
> Tant qu'un fichier est manquant, le jeu affiche un emoji fallback (le combat reste fonctionnel).
> **Direction artistique 2026-06-07** : chaque monstre est une **figurine 3D de collection posée sur un socle**, sur un **fond neutre facile à détourer**.

## 📁 Convention (technique)

- **Format** : PNG.
- **Génération** : 1024×1024 (détail figurine) → **export final 512×512** (le jeu rend en 120–256 px).
- **Nom** : `<monster_id>.png` exactement (snake_case — voir la liste plus bas).
- **Emplacement** : `public/monsters/<monster_id>.png`.
- **Fond** : généré sur fond plat neutre → **détourer** ensuite (rembg / remove.bg / Photopea) pour obtenir un PNG à fond transparent.
- Le loader `MonsterPortrait` (`src/screens/Combat.jsx`) charge automatiquement chaque image au combat.

---

## 🎨 Deux tiers de style (selon le rang du monstre)

| Tier | Rangs concernés | Direction |
|---|---|---|
| **A — « Charme »** | `common` (monstres normaux) | **Entre Studio Ghibli et Dragon Quest** : figurine expressive et attachante, silhouettes rondes lisibles (esprit Toriyama) + chaleur/douceur Ghibli, couleurs vives et chaudes, « mignon-féroce », jamais glauque. |
| **B — « Cruel »** | `elite`, `boss`, `demon_lord` | **Plus réaliste, cruel, menaçant** : figurine au sculpt détaillé, textures réalistes, proportions intimidantes, palette plus sombre et dramatique, présence inquiétante. |

> Le **format figurine reste identique** dans les deux tiers ; seul le **rendu** (charme vs cruel) change.

### 🧱 Bloc technique COMMUN — à coller en tête de **chaque** prompt

```
Premium collectible 3D figurine / painted statuette of [SUJET], standing on a small
round sculpted display base (socle). Studio product shot: soft three-point lighting,
gentle rim light, subtle contact shadow under the base. The figure is centered in a
1:1 square composition, slight 3/4 front angle, full body AND base fully visible.
Isolated on a perfectly flat, evenly-lit neutral seamless background (solid light grey,
no gradient, no scenery, no props) so it is EASY to cut out / chroma-key. Clean crisp
silhouette, high detail. No text, no watermark, no UI, no border.
```

### 🅰 Bloc STYLE — Tier A (monstres normaux)

```
Art style: a charming collectible figure halfway between Studio Ghibli warmth and a
Dragon Quest / Akira Toriyama bestiary — rounded readable shapes, expressive face,
vivid warm colors, friendly-fierce and adventurous tone, hand-painted resin look.
Never grimdark.
```

### 🅱 Bloc STYLE — Tier B (élites, boss, demon lord)

```
Art style: a high-end realistic collectible statue — detailed sculpt, realistic
textures and materials, intimidating proportions, darker dramatic palette, menacing
and cruel presence. Cinematic, fierce, imposing — a villain centerpiece figure.
```

**Recette d'un prompt = `[BLOC TECHNIQUE]` + `[BLOC STYLE A ou B]` + `[DESCRIPTION DU MONSTRE]`** (les 3 ci-dessous).

> 💡 **Cohérence du set** : génère un premier monstre satisfaisant, puis **fournis-le comme image de référence** pour les suivants (« même style de figurine que cette image »). Génère chaque tier dans une même session/mêmes réglages.

---

## 🗺️ Prompts par monstre (roster actuel — post-MON01)

> Tier indiqué entre crochets. Préfixe chaque description du bloc technique + bloc style correspondant.

### Ashenvale Forest — Lv 1-8

- **`ashwood_wolf.png`** — Ashwood Wolf · **[A]**
  > a sleek silver-grey forest wolf with warm amber eyes and slightly tousled fur, mid-step in an alert prowl, ears forward, friendly-fierce expression.
- **`thicket_hare.png`** — Thicket Hare · **[A]**
  > a plump brown woodland hare with oversized alert ears and big round bright eyes, perched up on its hind legs, twitching nose, harmless and cute.
- **`tuskmaw_boar.png`** — Tuskmaw Boar · **[A]**
  > a stocky bristly wild boar with thick hide, curved ivory tusks and a broad wet snout, hooves planted, head lowered ready to charge, grumpy but rounded.
- **`old_oakheart.png`** — Old Oakheart · **[B — élite]**
  > an ancient towering oak treant, gnarled bark-skin face with deep-set glowing eyes, massive limb-branches wreathed in moss and brambles, rooted feet — weathered, imposing and slightly menacing.

### Thornmarsh — Lv 6-14

- **`marsh_serpent.png`** — Marsh Serpent · **[A]**
  > a coiled green-and-gold marsh serpent rising to strike, glistening wet scales, forked tongue out, slit golden eyes, sleek and sinuous.
- **`briar_wraith.png`** — Briar Wraith · **[A]**
  > a tattered thorn-wreathed wraith of living briar and torn grey cloth, a faint hollow softly-glowing face, vines and thorns curling around a wispy ghostly body, eerie but stylized.
- **`mire_slime.png`** — Mire Slime · **[A]**
  > a translucent murky-green gelatinous slime blob, glossy wet surface, a few bubbles and tiny bits of swamp debris suspended inside, simple cute eyes and a little pseudopod.
- **`fenrot_devourer.png`** — Fenrot Devourer · **[B — élite]**
  > a hulking rotting marsh beast, part crocodile part wolf, slavering oversized maw lined with jagged teeth, mottled diseased hide dripping bog filth, predatory and vicious.

### Crumbled Ruins — Lv 12-20

- **`stone_golem.png`** — Stone Golem · **[A]**
  > a chunky humanoid golem built of cracked mossy ruin-stones and ancient masonry, glowing rune-light along its chest seams, heavy blocky fists, sturdy and stoic.
- **`hollow_knight.png`** — Hollow Knight · **[A]**
  > an empty suit of tarnished medieval armor animated by a faint ghost-light inside the helm, holding a notched longsword, hollow, silent and a touch eerie.
- **`ruin_specter.png`** — Ruin Specter · **[A]**
  > a wispy translucent spectre drifting upright, faintly glowing pale-blue form, a sorrowful elongated face, trailing ethereal tatters, melancholic and ghostly.
- **`graven_sentinel.png`** — Graven Sentinel · **[B — élite]**
  > a towering grave-warden in heavy weathered funerary armor and a tattered burial cloak, helm shaped like a tomb death-mask, wielding a massive ceremonial greatsword, cold merciless gaze — grim and imposing.

### Wildmere Hills — Lv 18-26

- **`hill_slime.png`** — Hill Slime · **[A]**
  > a rounded mossy-green hillside slime, glossy surface, tufts of grass and a few tiny wildflowers growing on its back, cheerful simple eyes, bouncy and friendly.
- **`russet_fox.png`** — Russet Fox · **[A]**
  > a lithe russet-red fox with a bushy white-tipped tail, sharp clever eyes, caught mid-leap, playful, quick and elegant.
- **`knoll_goblin.png`** — Knoll Goblin · **[A]**
  > a scrappy green-skinned goblin in patchwork leather and a crude dented helmet, gripping a jagged shiv, sly toothy grin, hunched and wiry, mischievous.
- **`thunderhoof.png`** — Thunderhoof · **[B — élite]**
  > a massive battle-scarred bison-bull with storm-grey hide, cracked horns crackling with faint blue lightning, steam snorting from its nostrils, hooves striking sparks — powerful and brutal.

### Réserve (hors surface — usage futur donjon)

- **`barrow_wight.png`** — Barrow Wight · **[A — spooky léger]**
  > a desiccated undead barrow-wight wrapped in ancient rotted grave-cloth, sunken softly-glowing eye-sockets, clutching a rusted burial blade, gaunt and eerie but stylized.
- **`soul_harvester.png`** — Soul Harvester · **[B — élite]**
  > a tall cloaked reaper-like soul harvester wreathed in shadow, skeletal hands gripping a curved soul-scythe, a swirl of small glowing captured souls orbiting it, a faceless dark hood — sinister and cruel.

### The Blighted Road (élites)

- **`cursed_warlord.png`** — Cursed Warlord · **[B — élite]**
  > a hulking armored warlord clad in blackened cursed plate etched with red glowing runes, wielding a massive jagged cursed blade, a tattered war-banner cape, helm with burning eye-slits — brutal and menacing.
- **`bone_colossus.png`** — Bone Colossus · **[B — élite]**
  > a gigantic colossus assembled from countless fused bones and skulls, a towering skeletal frame, necrotic light glowing in its ribcage, massive bone fists — monstrous and dreadful.

### Grimspire — Lv 21+

- **`grimstone_troll.png`** — Grimstone Troll · **[A — sombre]**
  > a massive lumbering troll with craggy grey grimstone skin, mossy growths, small mean eyes, long arms ending in heavy claws, slowly regenerating gashes, brutish.
- **`cursed_sentinel.png`** — Cursed Sentinel · **[A — sombre]**
  > an animated suit of ornate cursed dark-iron armor with a faint purple soul-glow, a tower shield and a spiked mace, standing rigid in eternal guard.
- **`abyssal_hound.png`** — Abyssal Hound · **[A — sombre]**
  > a sleek black six-eyed hound of the abyss, smoking shadowy fur, glowing void-fangs, low predatory stance, fierce.
- **`wyvern_scout.png`** — Wyvern Scout · **[A — sombre]**
  > a lean winged wyvern scout, leathery membrane wings spread wide, a barbed whipping tail, sharp reptilian eyes, perched and alert.
- **`plague_monk.png`** — Plague Monk · **[A — sombre]**
  > a gaunt hooded monk in stained plague-robes, clutching a smoking censer trailing toxic green vapor, sickly grey skin, fanatical glowing eyes.
- **`iron_wraith.png`** — Iron Wraith · **[A — sombre]**
  > a spectral wraith fused with floating jagged shards of spectral iron, a glowing core, ghostly metal tatters swirling around it, cold and eerie.

### Boss (donjons + demon lord)

- **`hollow_crypt_boss.png`** — The Crypt Keeper · **[B — boss]**
  > a towering undead crypt-lord in a tattered hooded death-shroud over ancient bone-armor, a crowned skeletal skull face with burning eye-sockets, wielding a long necrotic staff-scythe, commanding the dead — terrifying and regal.
- **`forsaken_citadel_boss.png`** — Lord of the Forsaken · **[B — boss]**
  > a dread armored sovereign of the forsaken in towering blackened spiked plate over a regenerating cursed-iron carapace, a tattered dark royal cape, twin cruel blades, a malevolent crowned helm with void-fire eyes — imposing and merciless.
- **`malachar.png`** — Malachar the Undying · **[B — demon lord, final boss]**
  > Malachar the Undying, a colossal demon-lord wreathed in dark flame and necrotic energy, an immense horned skull-crowned figure in shattered god-killer armor, eyes of cold violet fire, radiating overwhelming dread — an epic, realistic, cruel final-boss centerpiece statue.

---

## ✂️ Détourage & export

1. Générer (1024², fond gris neutre).
2. Détourer le fond → PNG transparent (**rembg** local, ou remove.bg / Photopea).
   *(Le **socle fait partie de la figurine** : on le garde — voir question ouverte ci-dessous.)*
3. Recadrer carré, redimensionner **512×512**, nommer `<monster_id>.png`, déposer dans `public/monsters/`.
4. Le jeu charge l'image automatiquement (fallback emoji si absente).

## ✅ Ordre de priorité (génération)

1. **P0** — Ashenvale Forest (4) — vus dès la 1ʳᵉ heure.
2. **P1** — Thornmarsh + Crumbled Ruins + Wildmere Hills (12) — fin de zone 1.
3. **P1** — Boss : Crypt Keeper, Lord of the Forsaken, **Malachar**.
4. **P2** — Grimspire (6) + Blighted Road (2) + Réserve (2).

---

## ❓ Questions ouvertes (à trancher avant de lancer la génération)

1. **Socle en combat ?** La figurine-sur-socle est parfaite pour un **bestiaire** (carte de collection), mais en **combat** le `MonsterPortrait` attend une créature qui remplit le carré — un socle peut paraître bizarre. → On garde **figurine + socle partout**, ou **créature seule** (socle coupé) pour le combat et figurine complète pour le bestiaire ?
2. **Type de socle** : socle **neutre uniforme** (pierre ronde, même pour tous → meilleure cohérence + détourage facile), ou **socle thématique** par zone (terre/forêt, marais, ruines…) ? *(Recommandé : neutre uniforme.)*
3. **Fond** : fond gris neutre + détourage en post-prod (fiable), ou tenter le **fond transparent directement** depuis Gemini (moins fiable) ?
4. **Résolution** : 1024² source → 512² final, ça te va ? (ou tu veux garder du 1024 pour un futur zoom bestiaire ?)
5. **Frontière des tiers** : OK pour `common` = Tier A (charme) et `elite/boss/demon_lord` = Tier B (cruel) ? Et les **communs de Grimspire** : je les ai mis en **Tier A « sombre »** (charme assombri) — tu préfères les basculer en Tier B ?
