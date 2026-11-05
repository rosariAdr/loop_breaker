# Loop Breaker — Contexte portable (pour Claude chat hors-local)

> **But** : fichier auto-suffisant à coller dans un chat Claude pour travailler **hors du repo** sur le **grooming**, la **génération d'images**, le **design de contenu**. Reflète l'état au **2026-06-20**.
> **Source de vérité réelle** = le repo (`TASKS.md`, `docs/CONTRIBUTING.md`, `src/data/*`). Ce fichier en est un instantané condensé — en cas de doute, le repo prime.
>
> 🕒 **Mise à jour (2026-07-03)** — Livrés depuis le 2026-06-20 et **non reflétés dans le corps ci-dessous** : chaîne de **quête principale** (MQ-CHAIN01, mq01→mq06), **verrouillage de nodes + fog** de la carte (START01-04, départ Greywatch), **déblocage progressif des zones** (PROG01-03), refactor du store en **slices** (REFAC01 : `store/slices/*`), **déploiement Vercel** (DEPLOY01, `public/` committé), correctifs de quêtes (snapshot FIX-QUESTSNAP01, affichage FIX-QUESTPROG01/02), **VFX de skills** (ANIM02/03). Refonte **Hero Sheet V2** encore au stade ticket (HSV2-01→06). Compteurs à jour : **1268 tests / 123 fichiers**.

---

## 1. Le jeu en bref

Roguelite **idle RPG** médiéval-fantasy, jouable au tour par tour, avec **transmigration** (renaissance entre runs, héritage partiel) et un **Demon Lord** (Malachar) comme win-condition.
**Stack** : React 19 · Vite 8 · Zustand 5 · TailwindCSS 4 · Vitest 4 — **JavaScript pur** (pas de TS). UI « parchemin diégétique » (stage 1920×1080).

Boucle : explorer une **WorldMap** de nodes → entrer dans un **spot de chasse** (combat manuel ou idle) → looter ressources/skills/équipement → **villages/ville** (quêtes, craft, dieux) → **donjons** → **transmigrer**.

---

## 2. Modèle de suivi (épic-first) — IMPORTANT

La **version est portée par l'ÉPIQUE, pas par le ticket**. Trois couches :
```
Version (release)  ──planifie──>  Épique  ──contient──>  Tickets
```
- **Replanifier** = déplacer une épique d'une version à l'autre (table « Plan de release ») — **les tickets ne changent pas**, aux dépendances près.
- **4 axes par ticket** : **Taille** (XS/S/M/L/XL) · **Priorité** (P1 critique → P5 lointain) · **Maturité** (🟢 Ready / 🟡 Groom / ✂️ Split / ⛔ Blocked). Le milestone **n'est pas** sur la ligne.
- **Ligne canonique** : `- [ ] **ID — Titre** · Taille · P<1-5> · 🟢/🟡 — description. ⟶ renvois`
- **Commits** : 1 épique = 1 lot = sous-version `v1.Xy` (`y` = rang de l'épique) ; branche `feat/v1.Xy-<epic>` ; `v1.X(y+1)` = passe de bugfix avant release.
- **Grooming** d'un ticket = vérifier INVEST + AC, **trancher les questions ouvertes** (les graver `✅ DÉCIDÉ : …`) → passer 🟡 → 🟢. Laisser 🟡/⛔ seulement sur un vrai bloqueur (asset à générer, dépendance non levée), **avec la raison inscrite**.

---

## 3. Plan de release (version → épique)

| Sous-ver | Épique | Maturité | Bloqueurs |
|---|---|---|---|
| **v1.31** | Quêtes (VQ, QSV2, MQUI, QTOAST) | ✅ groomée | — |
| **v1.32** | Skills (SKD, ACA06) | ✅ groomée | — (`skills.js` = 44 skills, lus) |
| **v1.33** | Progression & stats (HSV2, STA, TITLE, BURN, BEST, ACHIEVE) | ✅ groomée | — |
| **v1.34** | Tech / DX / Balance (BAL-CSV, QA01, COV, TECH, REFAC) | ✅ groomée | — |
| **v1.41** | Donjon (D, DUN, DUNREV) | ✅ groomée | DUN-ART01 🟡 = **asset** |
| **v1.42** | Équipement & Craft (RES, TIER, CRAFT, LEAT, BIJOU, COOK, SET, SLOT, EQDROP, ENCH, SOCKET) | ✅ groomée | — |
| **v1.51** | Monde & carte (WMAP, MONLV, ZADV, BLDUNL, ZONE-NAMING) | ✅ groomée | assets carte (WMAP06/08) |
| **v1.52** | Divin (DV, ALT, DVQ) | ✅ groomée | — |
| **v1.61** | Compagnons (CMP, COMP) | ✅ groomée | — |
| **v1.62** | Événements, explo & NPC (EVT, EXPL, NPC) | ✅ groomée | — |
| v1.71 | UI / UX & a11y (UI, UX, A11Y, TIME-DISPLAY, SETTINGS, TUT/ONBOARD) | ⏳ à groomer | — |
| v1.72 | Idle & planification (IDLE, PLAN, QOL) | ⏳ à groomer | — |
| v1.81 | Méta / prestige (META, HIS, REP-REBAL, PERMSTAT) | ⏳ à groomer | — |
| v1.82 | Assets, art & lore (CONT, C03, UI08, HS-EQUIP, MVAR, CODEX) | ⏳ à groomer | **assets** |
| v1.91 | Audio, game-feel & nuit (AUDIO, FEEL, DN, U05, NSKL) | ⏳ à groomer | assets audio |
| v1.92 | Multivers & Foyer (X08/09, HOME) | ⏳ à groomer | — |
| v1.93 | Intégration finale (MIGRATE-EXT, QA-EXT, BAL-INTEG, BAL-AUDIT, SEC02) | ⏳ à groomer | dépend de tout |
| gelé | Embuscade & Map 2 (AMB, WMAP Map 2) | ⛔ gelé | **Map 2 fermée** |
| v2 / v3 | Ambition résiduelle (B06 ATB, MAP03 PixiJS, BSS boss) / Lointain (ECO-DYN) | — | — |

**v1.3 → v1.6 = groomées** (137 tickets, tous 🟢 sauf DUN-ART01). **Reste à groomer : v1.71 → v1.93.**

---

## 4. Données de jeu par région (monstres · drops ressources % · drop skill %)

> `skillDropType` interne (active/passive) **jamais affiché** en UI : seul le **nom** du skill l'est (après 5 kills). Élites en **gras**. Probas = par kill.

### 🗺 Map 1 — Ashenvale (« Eldenmoor ») · départ
Villages : **Greywatch** (départ), **Millhaven** · Ville : **Ironhaven** · Donjon : **The Hollow Crypt** (boss Crypt Keeper).

**Ashenvale Forest** — Lv 1-8 (adjacent Greywatch)
| Monstre | Rang | Ressources (%) | Skill drop |
|---|---|---|---|
| Ashwood Wolf | common | wolf_fang 70% (1-2) · wolf_pelt 40% | Savage Bite 10% |
| Thicket Hare | common | wolf_pelt 80% (1-2) · wolf_fang 30% | — |
| Tuskmaw Boar | common | wolf_fang 70% (1-2) · wolf_pelt 50% (1-2) | Thick Hide (passif) 10% |
| **Old Oakheart** | **élite** | briar_thorn 85% (1-3) · earth_crystal 30% | Bramble Slam 18% |

**Wildmere Hills** (ex-Barrow Hills) — Lv 6-14
| Monstre | Rang | Ressources (%) | Skill drop |
|---|---|---|---|
| Hill Slime | common | rotten_flesh 60% (1-2) · earth_crystal 30% | Mossy Hide (passif) 10% |
| Russet Fox | common | wolf_pelt 80% (1-2) · wolf_fang 40% | — |
| Knoll Goblin | common | rusted_iron 60% (1-2) · bone_fragment 40% (1-2) | Cheap Shot 10% |
| **Thunderhoof** | **élite** | wolf_pelt 80% (1-3) · ancient_bone 50% (1-2) | Trample Charge 18% |

**Crumbled Ruins** — Lv 12-22
| Monstre | Rang | Ressources (%) | Skill drop |
|---|---|---|---|
| Stone Golem | common | stone_shard 75% (2-4) · earth_crystal 20% | Stoneskin (passif) 10% |
| Hollow Knight | common | rusted_iron 70% (1-2) · hollow_shard 25% | Cursed Cleave 10% |
| Ruin Specter | common | ectoplasm 80% (1-3) · hollow_shard 35% (1-2) | Soul Chill 12% |
| **Graven Sentinel** | **élite** | rusted_iron 80% (1-3) · ancient_bone 50% (1-2) · cursed_gem 15% | Tomb Judgment 18% |

**Thornmarsh** — Lv 20-30 (zone tardive Map 1)
| Monstre | Rang | Ressources (%) | Skill drop |
|---|---|---|---|
| Marsh Serpent | common | serpent_scale 65% (1-3) · marsh_venom 30% | Venom Strike 10% |
| Briar Wraith | common | ectoplasm 60% (1-2) · briar_thorn 45% (1-3) | Thorn Lash 10% |
| Mire Slime | common | marsh_venom 70% (1-2) · rotten_flesh 50% (1-2) | Caustic Coat (passif) 10% |
| **Fenrot Devourer** | **élite** ⚠️ Map 2 | marsh_venom 85% (1-3) · ancient_bone 40% (1-2) | Plague Maw 18% |

### 🌉 The Blighted Road — Lv 15-30 · pont (idle interdit, zoneMult 1.8)
| Monstre | Rang | Ressources (%) | Skill drop |
|---|---|---|---|
| **Cursed Warlord** | élite | cursed_steel 90% (1-2) · warlord_crest 50% | Cursed Blade 17.5% |
| **Bone Colossus** | élite | giant_bone 90% (2-4) · colossus_marrow 40% | Bone Crush 17.5% |

### 🗺 Map 2 — Grimspire (« Draconic Frontier ») · GELÉE · Lv 28-50 (zoneMult 2.5)
Ville **Stonehaven** · villages Duskreach / Ashfall Post · donjon **The Forsaken Citadel** · Demon Lord **Malachar**.
| Monstre | Rang | Ressources (%) | Skill drop |
|---|---|---|---|
| Grimstone Troll | common | grimstone 75% (1-3) · troll_blood 35% | Troll Regeneration (passif) 10% |
| Cursed Sentinel | common | cursed_armor_shard 70% · dark_essence 25% | Sentinel Watch (passif) 10% |
| Abyssal Hound | common | shadow_fur 65% · void_fang 30% | Abyss Howl 10% |
| Wyvern Scout | common | wyvern_scale 70% (1-3) · wyvern_talon 30% | Wing Gust 10% |
| Plague Monk | common | plague_herb 60% (1-3) · corrupted_scroll 20% | Plague Aura (passif) 10% |
| Iron Wraith | common | spectral_iron 65% · wraith_essence 25% | Iron Shroud 10% |

### 👑 Boss & Demon Lord
| Boss | Lieu | Drops garantis / rares | Skill drop |
|---|---|---|---|
| The Crypt Keeper | Hollow Crypt (Ashenvale) | crypt_seal 100% · ancient_bone 100% (2-4) · cursed_gem 50% | Soul Crush 60% |
| Lord of the Forsaken | Forsaken Citadel (Grimspire) | forsaken_seal 100% · void_crystal 100% (1-2) · dark_lord_relic 40% | Forsaken Curse 60% |
| **Malachar the Undying** | Grimspire Depths | demon_lord_heart 100% · void_crystal 100% (5-10) | **Soul Rend 100%** (suprême) — 3 phases, ressuscite après 4 transmigrations |

**Réserve (jamais spawn surface, usage futur donjons)** : Barrow Wight · Soul Harvester.

---

## 5. Quêtes par région

**Économie tokens (REP01)** : presque tout = **0 token** ; SEULES les 4 quêtes kill-élite donnent **5 tokens** (`nc_oakheart_elite`, `nc_fenrot_elite`, `nc_graven_elite`, `nc_thunderhoof_elite`). Malachar = +200.

### Quête principale (spine MQ-CHAIN01)
`mq01` Cull 5 Ashwood Wolves (Greywatch) → `mq02` remise Oakheart (×3 earth_crystal **ou** oakheart_branch) → **ouvre Millhaven** → `mq03` atteindre Lv4 → **ouvre Wildmere + Ruins** → `mq04` remise Thunderhoof (×3 ancient_bone) → **ouvre Ironhaven** → `mq05` atteindre Lv6 → `mq06` remise Graven (×3 cursed_gem) → **ouvre Thornmarsh**. (Donneurs : Elder Moira / Warden Halric / Captain Vaern.)

### Greywatch (Elder Moira)
bog_purge (4 Mire Slime) · ruins_cleanse (3 Specter + 2 Hollow Knight) · nc_scout_marsh (visite Thornmarsh) · nc_explore_hills (visite Wildmere → **débloque Grimspire**) · nc_fenrot_elite (élite, ⚠️ Map 2 gelée).
⚠️ **Audit adjacence (QSV2-ADJ-AUDIT01)** : plusieurs de ces quêtes ciblent des zones **non adjacentes** à Greywatch → re-domiciliation prévue (VQ).

### Millhaven
Aucune quête secondaire (village « creux » → cible n°1 de VQ04).

### Ironhaven (ville)
- **Sir Aldric** : first_blood (5 Wolf) · proof_of_worth (Lv3) · clear_the_marsh (3 Serpent) · nc_thin_the_boars (4 Boar) · **nc_oakheart_elite** (5 tk, leather_armor rare).
- **Captain Vaern** : silence_the_crypt (Crypt Keeper) · storm_the_citadel (Lord Forsaken) · end_the_demon (Malachar) · **nc_graven_elite** (5 tk) · **nc_thunderhoof_elite** (5 tk, iron_helm rare).
- **Pell le Marchand** : nc_deliver_ruins (visite) · nc_forge_offering (craft 3) · nc_artisans_trial (craft 5, bone_plate epic).

### Église (Brother Caelum, n'importe quel lieu) — rotation 2 quêtes / 3 jours
cleanse_specters · calm_marsh · banish_wraiths · break_knights · thin_the_pack · purge_slimes. **Récompenses = consommables seulement (jamais d'or).**

### Académie (ACA04) — quêtes de maître (`masterQuests.js`) : monter un skill au niveau X.

---

## 6. Génération d'images — assets manquants (par priorité de production)

**Règle anti-clash (stricte)** : ne jamais mélanger **chibi cartoon (couche A** — carte/combat) et **portrait pixel 128×128 (couche B** — dialogues) à la même échelle dans un même cadre. Style : joyeux/héroïque type overworld Dragon Quest (PAS sombre/gothique pour la couche monde). Prompts détaillés : `docs/ASSET_PROMPTS.md`. Pipeline : `public/monsters/README.md`. Nommage : `public/monsters/<id>.png` (+ `<id>_2.png`/`_3.png` pour variantes MVAR01).

**Couche A — chibi (carte/combat)** :
- **Boss** : Crypt Keeper, Lord of the Forsaken, **Malachar** (3).
- **Monstres Grimspire** (6) : grimstone_troll, cursed_sentinel, abyssal_hound, wyvern_scout, plague_monk, iron_wraith.
- **Élites Blighted Road** (2) : cursed_warlord, bone_colossus.
- **Réserve** (2) : barrow_wight, soul_harvester.
- **Façades de bâtiments** (4) : master_smith, knight_trainer, academy, guild + **déco** (well/hens/barrels).
- *(✅ déjà liés : 16 monstres de surface + 5 façades inn/church/merchant/alchemy/blacksmith + héros placeholder.)*

**Couche B — portraits pixel** : prêtre (church), chef de village, divinités. *(✅ déjà : aldric, smith, marta, merchant, mage.)*

**Cartes (WMAP)** : Map 1 `eldenmoor_map1.png` (WMAP06) · Map 2 `draconic_frontier_map2.png` (WMAP07).

**Donjon (DUN-ART01)** : fond de donjon + icônes de salle (combat / repos / trésor / boss) pour la chaîne 9 salles.

**Personnage (C03)** : 8 icônes de création (warrior / rogue / mage / ranger / monk / knight / witch / bard).

**Variantes (MVAR01)** : 2-3 variantes d'image par monstre pour les combats multi-ennemis (schéma `<id>_N.png`).

---

## 7. Protocole de travail hors-local (à demander au chat)

- **Grooming** : « groome l'épique <v1.7x> — pour chaque 🟡, propose une décision (format `✅ DÉCIDÉ`) et passe 🟢 ; flag les vrais bloqueurs ». Me ramener les lignes canoniques mises à jour à recopier dans `TASKS.md`.
- **Images** : « rédige les prompts (façon `ASSET_PROMPTS.md`) pour <liste d'assets §6> », style chibi héroïque, fond transparent, cohérent avec l'existant.
- **Design de contenu** : utiliser §4/§5 comme base (monstres, drops, quêtes) pour proposer du contenu équilibré (ex. nouvelles quêtes VQ adjacentes, recettes de craft, sets d'équipement).
