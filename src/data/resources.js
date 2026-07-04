// Ressources du jeu — drops des monstres, utilisées pour le craft et le commerce
//
// RES01 — Modèle de données ressource. Chaque ressource de collecte/craft porte :
//   { id, name, rarityTier, dropRate, sources[], uses[] } (+ champs historiques :
//   description, zone, rarity (vocab loot pour RARITY_COLORS), sellPrice, category…).
//   - `rarityTier` : classe de collecte ('common' | 'rare' | 'junk' | 'boss' | 'consumable').
//     ⚠️ distinct de `rarity` (vocab loot commun/uncommon/rare/epic/legendary, lu par
//     RARITY_COLORS et l'inventaire) et de RARITY_TIERS (équipement, equipment.js).
//   - `dropRate` : taux de drop nominal (source de vérité = monster.resourceDrops.chance ;
//     ce champ documente la valeur attendue et est vérifié par les tests d'intégrité).
//   - `sources` : ids de monstres qui droppent la ressource (⊆ MONSTERS ; testé).
//   - `uses` : à quoi elle sert — 'craft' (input de recette), 'sell' (revente seule), etc.
//
// RES-G1 — bande de drop commune : 40-65 %, PAS de scaling par zone/run.
// RES-TIER01 — taux des drops rares de craft, tier-based (cf. TIER01 : monster.tier) :
//   T1 → aucun rare ; T2 → 15 % ; T3 → 7.5 %.

// Bande de drop des ressources COMMUNES (RES-G1). Bornes inclusives, pas de scaling.
export const COMMON_DROP_BAND = { min: 0.4, max: 0.65 }

// Taux de drop des ressources RARES de craft par tier de monstre (RES-TIER01).
// T1 n'a pas de drop rare (null). Utilisé par RES02 pour câbler les taux rares.
export const RARE_DROP_RATE_BY_TIER = { T1: null, T2: 0.15, T3: 0.075 }

export const RESOURCES = {
  // ── Ressources — Ashenvale ────────────────────────────────────────────
  bat_wing: {
    id: 'bat_wing',
    name: 'Bat Wing',
    description: 'A leathery wing from a Gloom Bat. Thin as parchment.',
    zone: 'ashenvale',
    rarity: 'common',
    rarityTier: 'common',
    sellPrice: 2,
    dropRate: null, // monstre source retiré (MON01) — conservé pour recettes existantes
    sources: [],
    uses: ['craft', 'sell'],
  },
  wolf_fang: {
    id: 'wolf_fang',
    name: 'Wolf Fang',
    description: 'A sharp fang from an Ashwood Wolf.',
    zone: 'ashenvale',
    rarity: 'common',
    rarityTier: 'common',
    sellPrice: 2,
    dropRate: 0.55, // ashwood_wolf (T2) — commun
    sources: ['ashwood_wolf'],
    uses: ['craft', 'sell'], // RES-G2 — ingrédient swift_boots (common)
  },
  wolf_pelt: {
    id: 'wolf_pelt',
    name: 'Wolf Pelt',
    description: 'Rough grey fur from an Ashwood Wolf.',
    zone: 'ashenvale',
    rarity: 'common',
    rarityTier: 'common',
    sellPrice: 4,
    // DROP-FIX01 — recanonisé sur le VRAI loup (ashwood_wolf). Avant : thicket_hare/russet_fox
    // (incohérent) droppaient wolf_pelt ; ils droppent désormais hare_pelt / fox_pelt.
    dropRate: 0.55, // ashwood_wolf (T2) — commun secondaire (cuir)
    sources: ['ashwood_wolf'],
    uses: ['craft', 'sell'],
  },
  // DROP-FIX01 — pelts thématiques du petit gibier (cuir/cuisine). Remplacent le wolf_pelt
  // que le lièvre et le renard droppaient à tort. Câblés dans LEATHER_RECIPES / COOKING_RECIPES.
  hare_pelt: {
    id: 'hare_pelt',
    name: 'Hare Pelt',
    description: 'Soft, singed fur from a Fire Hare. Light and supple.',
    zone: 'ashenvale',
    rarity: 'common',
    rarityTier: 'common',
    sellPrice: 3,
    dropRate: 0.6, // thicket_hare (T1) — commun thématique (DROP-FIX01)
    sources: ['thicket_hare'],
    uses: ['craft', 'sell'],
  },
  fox_pelt: {
    id: 'fox_pelt',
    name: 'Fox Pelt',
    description: 'A russet pelt from a Russet Fox. Prized by tanners for its warmth.',
    zone: 'ashenvale',
    rarity: 'common',
    rarityTier: 'common',
    sellPrice: 4,
    dropRate: 0.6, // russet_fox (T1) — commun thématique (DROP-FIX01)
    sources: ['russet_fox'],
    uses: ['craft', 'sell'],
  },
  beast_hide: {
    id: 'beast_hide',
    name: 'Beast Hide',
    description: 'A thick, storm-scarred hide from Thunderhoof. Tough leatherworking stock.',
    zone: 'ashenvale',
    rarity: 'uncommon',
    rarityTier: 'common',
    sellPrice: 7,
    dropRate: 0.8, // thunderhoof (élite) — drop de cuir signature (DROP-FIX01)
    sources: ['thunderhoof'],
    uses: ['craft', 'sell'],
  },
  // FIX-BOAR-DROP01 — ressources thématiques du Tuskmaw Boar (ne droppe plus des parts de loup).
  boar_tusk: {
    id: 'boar_tusk',
    name: 'Boar Tusk',
    description: 'A thick, curved tusk from a Tuskmaw Boar.',
    zone: 'ashenvale',
    rarity: 'common',
    rarityTier: 'common',
    sellPrice: 3,
    dropRate: 0.6, // tuskmaw_boar (T3) — commun thématique (FIX-BOAR-DROP01)
    sources: ['tuskmaw_boar'],
    uses: ['craft', 'sell'], // DROP-FIX01 — ingrédient COOKING (défense → viande de gibier)
  },
  boar_hide: {
    id: 'boar_hide',
    name: 'Boar Hide',
    description: 'Coarse, bristly hide from a Tuskmaw Boar.',
    zone: 'ashenvale',
    rarity: 'common',
    rarityTier: 'common',
    sellPrice: 5,
    dropRate: 0.5, // tuskmaw_boar (T3) — commun secondaire
    sources: ['tuskmaw_boar'],
    uses: ['craft', 'sell'], // DROP-FIX01 — ingrédient LEATHER (cuir épais)
  },
  rotten_flesh: {
    id: 'rotten_flesh',
    name: 'Rotten Flesh',
    description: 'Decayed flesh scavenged from marsh and hill slimes. Smells terrible.',
    zone: 'ashenvale',
    rarity: 'common',
    rarityTier: 'common',
    sellPrice: 1,
    dropRate: 0.55, // mire_slime (T3) + hill_slime (T2) — commun
    sources: ['mire_slime', 'hill_slime'],
    uses: ['craft', 'sell'], // RES-G2 — ingrédient cursed_greaves (common)
  },
  bone_fragment: {
    id: 'bone_fragment',
    name: 'Bone Fragment',
    description: 'A cracked bone fragment.',
    zone: 'ashenvale',
    rarity: 'common',
    rarityTier: 'common',
    sellPrice: 2,
    dropRate: 0.5, // knoll_goblin (T3) — commun (bone_fragment)
    sources: ['knoll_goblin'],
    uses: ['craft', 'sell'], // RES-G2 — ingrédient bone_staff / iron_helm / bone_plate
  },
  ectoplasm: {
    id: 'ectoplasm',
    name: 'Ectoplasm',
    description: 'Ghostly residue left by wraiths and specters.',
    zone: 'ashenvale',
    rarity: 'uncommon',
    rarityTier: 'common',
    sellPrice: 6,
    dropRate: 0.6, // briar_wraith (T1) + ruin_specter (T2) — commun
    sources: ['briar_wraith', 'ruin_specter'],
    uses: ['craft', 'sell'],
  },
  briar_thorn: {
    id: 'briar_thorn',
    name: 'Briar Thorn',
    description: 'A thorny fragment with residual magic.',
    zone: 'ashenvale',
    rarity: 'common',
    rarityTier: 'common',
    sellPrice: 3,
    dropRate: null, // droppé par l'élite old_oakheart (secondaire) — hors RES02
    sources: ['old_oakheart'],
    uses: ['craft', 'sell'],
  },
  stone_shard: {
    id: 'stone_shard',
    name: 'Stone Shard',
    description: 'A rough shard of enchanted stone.',
    zone: 'ashenvale',
    rarity: 'common',
    rarityTier: 'common',
    sellPrice: 2,
    dropRate: 0.65, // stone_golem (T1) — commun
    sources: ['stone_golem'],
    uses: ['craft', 'sell'], // BIJOU01 — ingrédient iron_pendant / band_of_fortune (bijoutier)
  },
  earth_crystal: {
    id: 'earth_crystal',
    name: 'Earth Crystal',
    description: 'A crystallized earth gem with faint magical properties.',
    zone: 'ashenvale',
    rarity: 'uncommon',
    rarityTier: 'common',
    sellPrice: 12,
    dropRate: null, // drop secondaire de l'élite old_oakheart — hors RES02
    sources: ['old_oakheart'],
    uses: ['sell'],
  },
  serpent_scale: {
    id: 'serpent_scale',
    name: 'Serpent Scale',
    description: 'A shimmering scale from a Marsh Serpent.',
    zone: 'ashenvale',
    rarity: 'common',
    rarityTier: 'common',
    sellPrice: 4,
    dropRate: 0.55, // marsh_serpent (T2) — commun
    sources: ['marsh_serpent'],
    uses: ['craft', 'sell'],
  },
  marsh_venom: {
    id: 'marsh_venom',
    name: 'Marsh Venom',
    description: 'Concentrated venom from a Marsh Serpent. Used in alchemy.',
    zone: 'ashenvale',
    rarity: 'uncommon',
    rarityTier: 'rare', // RES02 — drop rare tier-based de marsh_serpent (T2)
    sellPrice: 10,
    dropRate: 0.15, // marsh_serpent (T2) — rare (RES-TIER01)
    sources: ['marsh_serpent'],
    uses: ['craft', 'sell'],
  },
  rusted_iron: {
    id: 'rusted_iron',
    name: 'Rusted Iron',
    description: "Corroded iron from a Hollow Knight's armor.",
    zone: 'ashenvale',
    rarity: 'common',
    rarityTier: 'common',
    sellPrice: 3,
    dropRate: 0.55, // hollow_knight (T3) — commun (rusted_iron)
    sources: ['hollow_knight'],
    uses: ['craft', 'sell'], // RES-G2 — ingrédient iron_sword / iron_helm / leather_armor / cursed_greaves
  },
  hollow_shard: {
    id: 'hollow_shard',
    name: 'Hollow Shard',
    description: 'A dark shard containing residual soul energy.',
    zone: 'ashenvale',
    rarity: 'uncommon',
    rarityTier: 'rare', // RES02 — drop rare tier-based de hollow_knight (T3)
    sellPrice: 8,
    dropRate: 0.075, // hollow_knight (T3) — rare (RES-TIER01)
    sources: ['hollow_knight'],
    uses: ['craft', 'sell'],
  },

  // ── Ressources — Blighted Road ────────────────────────────────────────
  cursed_steel: {
    id: 'cursed_steel',
    name: 'Cursed Steel',
    description: 'Dark steel imbued with a powerful curse.',
    zone: 'blighted_road',
    rarity: 'rare',
    rarityTier: 'rare',
    sellPrice: 25,
    dropRate: 0.9, // cursed_warlord (élite) — drop signature (cursed_steel)
    sources: ['cursed_warlord'],
    uses: ['craft', 'sell'], // RES-G2 — ingrédient iron_sword / cursed_greaves
  },
  warlord_crest: {
    id: 'warlord_crest',
    name: 'Warlord Crest',
    description: 'The crest of a Cursed Warlord. A mark of fearsome power.',
    zone: 'blighted_road',
    rarity: 'rare',
    rarityTier: 'rare',
    sellPrice: 40,
    dropRate: 0.5, // cursed_warlord (élite)
    sources: ['cursed_warlord'],
    uses: ['craft', 'sell'], // RES-G2 — ingrédient iron_sword / cursed_greaves (epic/legendary)
  },
  giant_bone: {
    id: 'giant_bone',
    name: 'Giant Bone',
    description: 'A massive bone from a Bone Colossus.',
    zone: 'blighted_road',
    rarity: 'uncommon',
    rarityTier: 'common',
    sellPrice: 15,
    dropRate: 0.9, // bone_colossus (élite)
    sources: ['bone_colossus'],
    uses: ['craft', 'sell'], // RES-G2 — ingrédient bone_plate (rare/epic/legendary)
  },
  colossus_marrow: {
    id: 'colossus_marrow',
    name: 'Colossus Marrow',
    description: 'Rare marrow with regenerative properties.',
    zone: 'blighted_road',
    rarity: 'rare',
    rarityTier: 'rare',
    sellPrice: 35,
    dropRate: 0.4, // bone_colossus (élite)
    sources: ['bone_colossus'],
    uses: ['craft', 'sell'],
  },

  // ── Ressources — Grimspire ────────────────────────────────────────────
  grimstone: {
    id: 'grimstone',
    name: 'Grimstone',
    description: 'A dense dark stone found only in Grimspire.',
    zone: 'grimspire',
    rarity: 'uncommon',
    rarityTier: 'common',
    sellPrice: 10,
    dropRate: 0.6, // grimstone_troll (T1) — commun
    sources: ['grimstone_troll'],
    uses: ['craft', 'sell'],
  },
  troll_blood: {
    id: 'troll_blood',
    name: 'Troll Blood',
    description: 'The regenerative blood of a Grimstone Troll. Useful in alchemy.',
    zone: 'grimspire',
    rarity: 'uncommon',
    rarityTier: 'common',
    sellPrice: 14,
    dropRate: null, // input de craft (recette forgeron) — plus droppé directement (RES02 → grimstone commun)
    sources: [],
    uses: ['craft'],
  },
  cursed_armor_shard: {
    id: 'cursed_armor_shard',
    name: 'Cursed Armor Shard',
    description: 'A shard of darkly enchanted armor.',
    zone: 'grimspire',
    rarity: 'uncommon',
    rarityTier: 'common',
    sellPrice: 12,
    dropRate: 0.6, // cursed_sentinel (T2) — commun
    sources: ['cursed_sentinel'],
    uses: ['craft', 'sell'], // RES-G2 — ingrédient iron_helm / cursed_greaves
  },
  dark_essence: {
    id: 'dark_essence',
    name: 'Dark Essence',
    description: 'Concentrated dark magic in liquid form.',
    zone: 'grimspire',
    rarity: 'rare',
    rarityTier: 'rare', // RES02 — drop rare tier-based de cursed_sentinel (T2)
    sellPrice: 30,
    dropRate: 0.15, // cursed_sentinel (T2) — rare (RES-TIER01)
    sources: ['cursed_sentinel'],
    uses: ['craft', 'sell'], // RES-G2 — ingrédient serpent_dagger / iron_helm / swift_boots / cursed_greaves (epic/legendary)
  },
  shadow_fur: {
    id: 'shadow_fur',
    name: 'Shadow Fur',
    description: 'Fur that seems to absorb light.',
    zone: 'grimspire',
    rarity: 'uncommon',
    rarityTier: 'common',
    sellPrice: 11,
    dropRate: 0.55, // abyssal_hound (T1) — commun
    sources: ['abyssal_hound'],
    uses: ['craft', 'sell'], // RES-G2 — ingrédient leather_armor / swift_boots (epic/legendary)
  },
  void_fang: {
    id: 'void_fang',
    name: 'Void Fang',
    description: 'A fang that phased between dimensions.',
    zone: 'grimspire',
    rarity: 'rare',
    rarityTier: 'rare',
    sellPrice: 28,
    dropRate: null, // input de craft (serpent_dagger) — plus droppé directement (RES02 → shadow_fur commun)
    sources: [],
    uses: ['craft'],
  },
  wyvern_scale: {
    id: 'wyvern_scale',
    name: 'Wyvern Scale',
    description: 'A tough scale from a Wyvern Scout.',
    zone: 'grimspire',
    rarity: 'uncommon',
    rarityTier: 'common',
    sellPrice: 14,
    dropRate: 0.6, // wyvern_scout (T3) — commun
    sources: ['wyvern_scout'],
    uses: ['craft', 'sell'], // RES-G2 — ingrédient leather_armor (epic/legendary)
  },
  wyvern_talon: {
    id: 'wyvern_talon',
    name: 'Wyvern Talon',
    description: 'A razor-sharp talon.',
    zone: 'grimspire',
    rarity: 'rare',
    rarityTier: 'rare', // RES02 — drop rare tier-based de wyvern_scout (T3)
    sellPrice: 25,
    dropRate: 0.075, // wyvern_scout (T3) — rare (RES-TIER01)
    sources: ['wyvern_scout'],
    uses: ['craft', 'sell'], // RES-G2 — ingrédient serpent_dagger (epic/legendary)
  },
  plague_herb: {
    id: 'plague_herb',
    name: 'Plague Herb',
    description: 'A corrupted herb with toxic properties. Handle with care.',
    zone: 'grimspire',
    rarity: 'uncommon',
    rarityTier: 'common',
    sellPrice: 10,
    dropRate: 0.55, // plague_monk (T2) — commun
    sources: ['plague_monk'],
    uses: ['craft', 'sell'],
  },
  corrupted_scroll: {
    id: 'corrupted_scroll',
    name: 'Corrupted Scroll',
    description: 'A scroll filled with dark incantations.',
    zone: 'grimspire',
    rarity: 'rare',
    rarityTier: 'rare', // RES02 — drop rare tier-based de plague_monk (T2)
    sellPrice: 35,
    dropRate: 0.15, // plague_monk (T2) — rare (RES-TIER01)
    sources: ['plague_monk'],
    uses: ['sell'],
  },
  spectral_iron: {
    id: 'spectral_iron',
    name: 'Spectral Iron',
    description: 'Iron that exists between the physical and spirit world.',
    zone: 'grimspire',
    rarity: 'rare',
    rarityTier: 'common', // commun de son monstre (iron_wraith T3) malgré la rareté loot élevée
    sellPrice: 30,
    dropRate: 0.6, // iron_wraith (T3) — commun (spectral_iron)
    sources: ['iron_wraith'],
    uses: ['craft', 'sell'], // RES-G2 — ingrédient wraith_crown (rare/epic/legendary)
  },
  wraith_essence: {
    id: 'wraith_essence',
    name: 'Wraith Essence',
    description: 'Pure spiritual energy distilled from an Iron Wraith.',
    zone: 'grimspire',
    rarity: 'rare',
    rarityTier: 'rare', // RES02 — drop rare tier-based d'iron_wraith (T3)
    sellPrice: 40,
    dropRate: 0.075, // iron_wraith (T3) — rare (RES-TIER01)
    sources: ['iron_wraith'],
    uses: ['craft', 'sell'],
  },

  // ── RES02 / RES-TIER01 — Drops RARES de craft tier-based ──────────────────────
  // Inputs de recettes (distincts de l'équipement), droppés par les monstres T2/T3
  // à taux tier-based (T2 @15 %, T3 @7.5 %). Un rare thématique par monstre T2/T3
  // qui n'avait pas déjà de rare existant (marsh_venom, hollow_shard, dark_essence…).
  wolf_alpha_fang: {
    id: 'wolf_alpha_fang',
    name: 'Alpha Fang',
    description: 'The prized fang of a pack alpha. Coveted by weaponsmiths.',
    zone: 'ashenvale',
    rarity: 'rare',
    rarityTier: 'rare',
    sellPrice: 18,
    dropRate: 0.15, // ashwood_wolf (T2)
    sources: ['ashwood_wolf'],
    uses: ['craft', 'sell'],
  },
  ironhide_plate: {
    id: 'ironhide_plate',
    name: 'Ironhide Plate',
    description: 'A slab of hide so thick it turns blades. Prized by leatherworkers.',
    zone: 'ashenvale',
    rarity: 'rare',
    rarityTier: 'rare',
    sellPrice: 22,
    dropRate: 0.075, // tuskmaw_boar (T3)
    sources: ['tuskmaw_boar'],
    uses: ['craft', 'sell'],
  },
  caustic_core: {
    id: 'caustic_core',
    name: 'Caustic Core',
    description: 'The acidic heart of a mire slime. Bubbles and hisses.',
    zone: 'ashenvale',
    rarity: 'rare',
    rarityTier: 'rare',
    sellPrice: 20,
    dropRate: 0.075, // mire_slime (T3)
    sources: ['mire_slime'],
    uses: ['craft', 'sell'],
  },
  spectral_residue: {
    id: 'spectral_residue',
    name: 'Spectral Residue',
    description: 'Condensed spectral matter left where a specter faded.',
    zone: 'ashenvale',
    rarity: 'rare',
    rarityTier: 'rare',
    sellPrice: 16,
    dropRate: 0.15, // ruin_specter (T2)
    sources: ['ruin_specter'],
    uses: ['craft', 'sell'],
  },
  verdant_ichor: {
    id: 'verdant_ichor',
    name: 'Verdant Ichor',
    description: 'Vital green sap that flows through hill slimes. Alchemically potent.',
    zone: 'ashenvale',
    rarity: 'rare',
    rarityTier: 'rare',
    sellPrice: 19,
    dropRate: 0.15, // hill_slime (T2)
    sources: ['hill_slime'],
    uses: ['craft', 'sell'],
  },
  goblin_warpaint: {
    id: 'goblin_warpaint',
    name: 'Goblin Warpaint',
    description: 'A pot of pungent war-paint. Its pigments never fade.',
    zone: 'ashenvale',
    rarity: 'rare',
    rarityTier: 'rare',
    sellPrice: 17,
    dropRate: 0.075, // knoll_goblin (T3)
    sources: ['knoll_goblin'],
    uses: ['craft', 'sell'],
  },

  // ── RES04 — Ressources « junk » (revente seule) ───────────────────────────────
  // Aucun autre usage (ni craft, ni consommable) : uniquement vendables au marchand.
  // Non droppées pour l'instant (sources: []) — câblage éventuel à un vendeur/DROP-FIX01.
  rotting_hide: {
    id: 'rotting_hide',
    name: 'Rotting Hide',
    description: 'A putrid, half-decayed hide. Worthless except to a desperate tanner.',
    zone: 'ashenvale',
    rarity: 'common',
    rarityTier: 'junk',
    sellPrice: 1,
    dropRate: null,
    sources: [],
    uses: ['sell'],
  },
  grave_stone: {
    id: 'grave_stone',
    name: 'Grave Stone',
    description: 'A chipped fragment of a headstone. Grim, but a collector might pay.',
    zone: 'ashenvale',
    rarity: 'common',
    rarityTier: 'junk',
    sellPrice: 2,
    dropRate: null,
    sources: [],
    uses: ['sell'],
  },
  goblin_trinket: {
    id: 'goblin_trinket',
    name: 'Goblin Trinket',
    description: 'A worthless bauble a goblin thought valuable. Sells for a pittance.',
    zone: 'ashenvale',
    rarity: 'common',
    rarityTier: 'junk',
    sellPrice: 3,
    dropRate: null,
    sources: [],
    uses: ['sell'],
  },

  // ── Ressources de boss ────────────────────────────────────────────────
  crypt_seal: {
    id: 'crypt_seal',
    name: 'Crypt Seal',
    description: 'The ancient seal that kept the Crypt Keeper bound.',
    zone: 'ashenvale',
    rarity: 'epic',
    rarityTier: 'boss',
    sellPrice: 100,
    dropRate: 1.0, // hollow_crypt_boss — garanti
    sources: ['hollow_crypt_boss'],
    uses: ['sell'],
    category: 'dungeon_seal', // D04 — monnaie alternative future
  },
  ancient_bone: {
    id: 'ancient_bone',
    name: 'Ancient Bone',
    description: 'A bone from a being that lived thousands of years ago.',
    zone: 'ashenvale',
    rarity: 'rare',
    rarityTier: 'boss',
    sellPrice: 50,
    dropRate: null, // drop d'élites/boss (fenrot, graven, thunderhoof, crypt boss, réserve)
    sources: ['fenrot_devourer', 'graven_sentinel', 'thunderhoof', 'hollow_crypt_boss'],
    uses: ['craft', 'sell'],
  },
  cursed_gem: {
    id: 'cursed_gem',
    name: 'Cursed Gem',
    description: 'A gem containing a trapped curse.',
    zone: 'ashenvale',
    rarity: 'epic',
    rarityTier: 'boss',
    sellPrice: 80,
    dropRate: null, // drop d'élite/boss (graven_sentinel, hollow_crypt_boss)
    sources: ['graven_sentinel', 'hollow_crypt_boss'],
    uses: ['craft', 'sell'],
  },
  forsaken_seal: {
    id: 'forsaken_seal',
    name: 'Forsaken Seal',
    description: "The seal of the Forsaken Citadel's lord.",
    zone: 'grimspire',
    rarity: 'epic',
    rarityTier: 'boss',
    sellPrice: 250,
    dropRate: 1.0, // forsaken_citadel_boss — garanti
    sources: ['forsaken_citadel_boss'],
    uses: ['craft', 'sell'], // RES-G2 — ingrédient bone_plate (legendary)
    category: 'dungeon_seal', // D04
  },
  void_crystal: {
    id: 'void_crystal',
    name: 'Void Crystal',
    description: 'A crystal formed from concentrated void energy.',
    zone: 'grimspire',
    rarity: 'epic',
    rarityTier: 'boss',
    sellPrice: 200,
    dropRate: 1.0, // forsaken_citadel_boss + malachar — garanti
    sources: ['forsaken_citadel_boss', 'malachar'],
    uses: ['craft', 'sell'], // RES-G2 — ingrédient legendary (iron_sword / bone_staff / iron_helm / leather_armor)
  },
  dark_lord_relic: {
    id: 'dark_lord_relic',
    name: 'Dark Lord Relic',
    description: 'A relic of immense dark power.',
    zone: 'grimspire',
    rarity: 'legendary',
    rarityTier: 'boss',
    sellPrice: 500,
    dropRate: 0.4, // forsaken_citadel_boss
    sources: ['forsaken_citadel_boss'],
    uses: ['sell'],
  },
  demon_lord_heart: {
    id: 'demon_lord_heart',
    name: "Malachar's Heart",
    description: 'The still-beating heart of Malachar the Undying. Pulsates with terrible power.',
    zone: 'grimspire',
    rarity: 'legendary',
    rarityTier: 'boss',
    sellPrice: 2000,
    dropRate: 1.0, // malachar — garanti
    sources: ['malachar'],
    uses: ['sell'],
    category: 'dungeon_seal', // D04 — relique ultime (sceau Demon Lord)
  },

  // ── Consommables (achetables chez le marchand) ────────────────────────
  hp_potion_small: {
    id: 'hp_potion_small',
    name: 'Minor Healing Potion',
    description: 'Restores 30% of max HP.',
    rarity: 'common',
    sellPrice: 5,
    buyPrice: 12,
    effect: { type: 'heal_percent', value: 0.3 },
    isConsumable: true,
  },
  hp_potion_medium: {
    id: 'hp_potion_medium',
    name: 'Healing Potion',
    description: 'Restores 60% of max HP.',
    rarity: 'uncommon',
    sellPrice: 12,
    buyPrice: 28,
    effect: { type: 'heal_percent', value: 0.6 },
    isConsumable: true,
  },
  mana_potion_small: {
    id: 'mana_potion_small',
    name: 'Minor Mana Potion',
    description: 'Restores 30% of max Mana.',
    rarity: 'common',
    sellPrice: 5,
    buyPrice: 12,
    effect: { type: 'mana_restore_percent', value: 0.3 },
    isConsumable: true,
  },
  mana_potion_medium: {
    id: 'mana_potion_medium',
    name: 'Mana Potion',
    description: 'Restores 60% of max Mana.',
    rarity: 'uncommon',
    sellPrice: 12,
    buyPrice: 28,
    effect: { type: 'mana_restore_percent', value: 0.6 },
    isConsumable: true,
  },

  // ── Z02 — Consommables additionnels du marchand ──────────────────────────
  stamina_ration: {
    id: 'stamina_ration',
    name: 'Stamina Ration',
    description: 'A hearty meal. Restores 25% HP and 25% Mana.',
    rarity: 'common',
    sellPrice: 6,
    buyPrice: 16,
    effect: { type: 'restore_both', value: 0.25 },
    isConsumable: true,
  },
  elixir_minor: {
    id: 'elixir_minor',
    name: 'Minor Elixir',
    description: 'A potent brew. Restores 50% HP and 50% Mana.',
    rarity: 'uncommon',
    sellPrice: 18,
    buyPrice: 42,
    effect: { type: 'restore_both', value: 0.5 },
    isConsumable: true,
  },
  mana_crystal: {
    id: 'mana_crystal',
    name: 'Mana Crystal',
    description: 'A condensed shard of arcane energy. Fully restores Mana.',
    rarity: 'rare',
    sellPrice: 30,
    buyPrice: 70,
    effect: { type: 'mana_restore_percent', value: 1.0 },
    isConsumable: true,
  },
  antidote_basic: {
    id: 'antidote_basic',
    name: 'Basic Antidote',
    description: 'Cleanses minor afflictions. Restores 15% HP and clears light debuffs.',
    rarity: 'common',
    sellPrice: 4,
    buyPrice: 10,
    effect: { type: 'heal_percent', value: 0.15, cureDebuffs: true },
    isConsumable: true,
  },

  // ── ITM01 — Livres de stats (consommables `gain_stat`) ──────────────────────
  tome_of_focus: {
    id: 'tome_of_focus',
    name: 'Tome of Focus',
    category: 'book',
    description: 'Studying it sharpens your crafting focus. +10 Concentration.',
    rarity: 'uncommon',
    sellPrice: 30,
    buyPrice: 90,
    effect: { type: 'gain_stat', stat: 'concentration', amount: 10 },
    isConsumable: true,
    isBook: true,
  },
  tome_of_might: {
    id: 'tome_of_might',
    name: 'Tome of Might',
    category: 'book',
    description: 'Forbidden techniques flow into you. +5 Aura.',
    rarity: 'rare',
    sellPrice: 50,
    buyPrice: 150,
    effect: { type: 'gain_stat', stat: 'aura', amount: 5 },
    isConsumable: true,
    isBook: true,
  },
  tome_of_wisdom: {
    id: 'tome_of_wisdom',
    name: 'Tome of Wisdom',
    category: 'book',
    description: 'Ancient knowledge permanently sharpens your mind. +1 Intelligence.',
    rarity: 'rare',
    sellPrice: 60,
    buyPrice: 180,
    effect: { type: 'gain_stat', stat: 'intelligence', amount: 1 },
    isConsumable: true,
    isBook: true,
  },
}

// RES01 — Backfill du `rarityTier` des consommables (achats marchand / livres) : ils ne
// sont pas des drops de collecte, on les classe 'consumable' pour homogénéiser la forme
// (chaque ressource porte un rarityTier). N'écrase jamais un rarityTier déjà défini.
for (const res of Object.values(RESOURCES)) {
  if (res.isConsumable && res.rarityTier === undefined) res.rarityTier = 'consumable'
}

export const RARITY_COLORS = {
  common: '#9ca3af',
  uncommon: '#4ade80',
  rare: '#60a5fa',
  epic: '#c084fc',
  legendary: '#fbbf24',
}
