// Tous les monstres du jeu
// baseStats sont les stats au run 0, zone_mult est appliqué via la formule de scaling
// huntingSpot : sous-zone Ashenvale ('ashenvale_forest' | 'thornmarsh' | 'crumbled_ruins' | 'wildmere_hills')
//
// MON01 — champ `skillDropType: 'active' | 'passive' | 'none'` (INTERNE : drop + bestiaire).
//   'active'/'passive' → lègue un mana stone du skill `skillDrop.skillId` (cohérent avec SKILLS[id].type).
//   'none' → pas de skillDrop, pas de mana stone de technique.
//   ⚠️ L'UI n'affiche JAMAIS actif/passif : seulement le NOM du skill (après le seuil de kills S02).
// MON01 — `reserve: true` → monstre conservé en données mais HORS surface (jamais spawn ;
//   exclu de MONSTERS_BY_SPOT / MONSTERS_BY_ZONE), réservé à un usage futur (donjons).

export const MONSTERS = {
  // ── Ashenvale Forest (lv 1-8) ───────────────────────────────────────
  ashwood_wolf: {
    id: 'ashwood_wolf',
    name: 'Ashwood Wolf',
    zone: 'ashenvale',
    huntingSpot: 'ashenvale_forest',
    rank: 'common',
    baseStats: { hp: 40, atk: 8, def: 3, spd: 12 },
    expReward: 15,
    goldReward: { min: 1, max: 3 },
    skillDropType: 'active',
    skillDrop: { chance: 0.10, skillId: 'savage_bite' },
    resourceDrops: [
      { resourceId: 'wolf_fang', chance: 0.70, qty: { min: 1, max: 2 } },
      { resourceId: 'wolf_pelt', chance: 0.40, qty: { min: 1, max: 1 } },
    ],
  },

  thicket_hare: {
    id: 'thicket_hare',
    name: 'Thicket Hare',
    zone: 'ashenvale',
    huntingSpot: 'ashenvale_forest',
    rank: 'common',
    baseStats: { hp: 22, atk: 4, def: 1, spd: 22 },
    expReward: 10,
    goldReward: { min: 1, max: 2 },
    skillDropType: 'none',
    resourceDrops: [
      { resourceId: 'wolf_pelt', chance: 0.80, qty: { min: 1, max: 2 } },
      { resourceId: 'wolf_fang', chance: 0.30, qty: { min: 1, max: 1 } },
    ],
  },

  tuskmaw_boar: {
    id: 'tuskmaw_boar',
    name: 'Tuskmaw Boar',
    zone: 'ashenvale',
    huntingSpot: 'ashenvale_forest',
    rank: 'common',
    baseStats: { hp: 55, atk: 11, def: 6, spd: 7 },
    expReward: 20,
    goldReward: { min: 2, max: 4 },
    skillDropType: 'passive',
    skillDrop: { chance: 0.10, skillId: 'thick_hide' },
    resourceDrops: [
      { resourceId: 'wolf_fang', chance: 0.70, qty: { min: 1, max: 2 } },
      { resourceId: 'wolf_pelt', chance: 0.50, qty: { min: 1, max: 2 } },
    ],
  },

  old_oakheart: {
    id: 'old_oakheart',
    name: 'Old Oakheart',
    zone: 'ashenvale',
    huntingSpot: 'ashenvale_forest',
    rank: 'elite',
    baseStats: { hp: 160, atk: 22, def: 14, spd: 6 },
    expReward: 70,
    goldReward: { min: 8, max: 16 },
    skillDropType: 'active',
    skillDrop: { chance: 0.18, skillId: 'bramble_slam' },
    resourceDrops: [
      { resourceId: 'briar_thorn', chance: 0.85, qty: { min: 1, max: 3 } },
      { resourceId: 'earth_crystal', chance: 0.30, qty: { min: 1, max: 1 } },
    ],
  },

  // ── Thornmarsh (lv 6-14) ─────────────────────────────────────────────
  marsh_serpent: {
    id: 'marsh_serpent',
    name: 'Marsh Serpent',
    zone: 'ashenvale',
    huntingSpot: 'thornmarsh',
    rank: 'common',
    baseStats: { hp: 50, atk: 11, def: 4, spd: 10 },
    expReward: 22,
    goldReward: { min: 1, max: 4 },
    skillDropType: 'active',
    skillDrop: { chance: 0.10, skillId: 'venom_strike' },
    resourceDrops: [
      { resourceId: 'serpent_scale', chance: 0.65, qty: { min: 1, max: 3 } },
      { resourceId: 'marsh_venom', chance: 0.30, qty: { min: 1, max: 1 } },
    ],
  },

  briar_wraith: {
    id: 'briar_wraith',
    name: 'Briar Wraith',
    zone: 'ashenvale',
    huntingSpot: 'thornmarsh',
    rank: 'common',
    baseStats: { hp: 35, atk: 10, def: 2, spd: 14 },
    expReward: 20,
    goldReward: { min: 2, max: 4 },
    skillDropType: 'active',
    skillDrop: { chance: 0.10, skillId: 'thorn_lash' },
    resourceDrops: [
      { resourceId: 'ectoplasm', chance: 0.60, qty: { min: 1, max: 2 } },
      { resourceId: 'briar_thorn', chance: 0.45, qty: { min: 1, max: 3 } },
    ],
  },

  mire_slime: {
    id: 'mire_slime',
    name: 'Mire Slime',
    zone: 'ashenvale',
    huntingSpot: 'thornmarsh',
    rank: 'common',
    baseStats: { hp: 70, atk: 8, def: 6, spd: 5 },
    expReward: 26,
    goldReward: { min: 2, max: 5 },
    skillDropType: 'passive',
    skillDrop: { chance: 0.10, skillId: 'caustic_coat' },
    resourceDrops: [
      { resourceId: 'marsh_venom', chance: 0.70, qty: { min: 1, max: 2 } },
      { resourceId: 'rotten_flesh', chance: 0.50, qty: { min: 1, max: 2 } },
    ],
  },

  fenrot_devourer: {
    id: 'fenrot_devourer',
    name: 'Fenrot Devourer',
    zone: 'ashenvale',
    huntingSpot: 'thornmarsh',
    rank: 'elite',
    baseStats: { hp: 175, atk: 21, def: 12, spd: 6 },
    expReward: 90,
    goldReward: { min: 10, max: 20 },
    skillDropType: 'active',
    skillDrop: { chance: 0.18, skillId: 'plague_maw' },
    resourceDrops: [
      { resourceId: 'marsh_venom', chance: 0.85, qty: { min: 1, max: 3 } },
      { resourceId: 'ancient_bone', chance: 0.40, qty: { min: 1, max: 2 } },
    ],
  },

  // ── Crumbled Ruins (lv 12-20) ────────────────────────────────────────
  stone_golem: {
    id: 'stone_golem',
    name: 'Stone Golem',
    zone: 'ashenvale',
    huntingSpot: 'crumbled_ruins',
    rank: 'common',
    baseStats: { hp: 100, atk: 12, def: 15, spd: 4 },
    expReward: 30,
    goldReward: { min: 2, max: 5 },
    skillDropType: 'passive',
    skillDrop: { chance: 0.10, skillId: 'stoneskin' },
    resourceDrops: [
      { resourceId: 'stone_shard', chance: 0.75, qty: { min: 2, max: 4 } },
      { resourceId: 'earth_crystal', chance: 0.20, qty: { min: 1, max: 1 } },
    ],
  },

  hollow_knight: {
    id: 'hollow_knight',
    name: 'Hollow Knight',
    zone: 'ashenvale',
    huntingSpot: 'crumbled_ruins',
    rank: 'common',
    baseStats: { hp: 80, atk: 14, def: 10, spd: 8 },
    expReward: 35,
    goldReward: { min: 3, max: 7 },
    skillDropType: 'active',
    skillDrop: { chance: 0.10, skillId: 'cursed_cleave' },
    resourceDrops: [
      { resourceId: 'rusted_iron', chance: 0.70, qty: { min: 1, max: 2 } },
      { resourceId: 'hollow_shard', chance: 0.25, qty: { min: 1, max: 1 } },
    ],
  },

  ruin_specter: {
    id: 'ruin_specter',
    name: 'Ruin Specter',
    zone: 'ashenvale',
    huntingSpot: 'crumbled_ruins',
    rank: 'common',
    baseStats: { hp: 45, atk: 16, def: 3, spd: 16 },
    expReward: 32,
    goldReward: { min: 3, max: 6 },
    skillDropType: 'active',
    skillDrop: { chance: 0.12, skillId: 'soul_chill' },
    resourceDrops: [
      { resourceId: 'ectoplasm', chance: 0.80, qty: { min: 1, max: 3 } },
      { resourceId: 'hollow_shard', chance: 0.35, qty: { min: 1, max: 2 } },
    ],
  },

  graven_sentinel: {
    id: 'graven_sentinel',
    name: 'Graven Sentinel',
    zone: 'ashenvale',
    huntingSpot: 'crumbled_ruins',
    rank: 'elite',
    baseStats: { hp: 190, atk: 24, def: 16, spd: 7 },
    expReward: 110,
    goldReward: { min: 12, max: 24 },
    skillDropType: 'active',
    skillDrop: { chance: 0.18, skillId: 'tomb_judgment' },
    resourceDrops: [
      { resourceId: 'rusted_iron', chance: 0.80, qty: { min: 1, max: 3 } },
      { resourceId: 'ancient_bone', chance: 0.50, qty: { min: 1, max: 2 } },
      { resourceId: 'cursed_gem', chance: 0.15, qty: { min: 1, max: 1 } },
    ],
  },

  // ── Wildmere Hills (lv 18-26) ────────────────────────────────────────
  hill_slime: {
    id: 'hill_slime',
    name: 'Hill Slime',
    zone: 'ashenvale',
    huntingSpot: 'wildmere_hills',
    rank: 'common',
    baseStats: { hp: 90, atk: 16, def: 10, spd: 6 },
    expReward: 50,
    goldReward: { min: 5, max: 10 },
    skillDropType: 'passive',
    skillDrop: { chance: 0.10, skillId: 'mossy_hide' },
    resourceDrops: [
      { resourceId: 'rotten_flesh', chance: 0.60, qty: { min: 1, max: 2 } },
      { resourceId: 'earth_crystal', chance: 0.30, qty: { min: 1, max: 1 } },
    ],
  },

  russet_fox: {
    id: 'russet_fox',
    name: 'Russet Fox',
    zone: 'ashenvale',
    huntingSpot: 'wildmere_hills',
    rank: 'common',
    baseStats: { hp: 60, atk: 18, def: 6, spd: 20 },
    expReward: 45,
    goldReward: { min: 4, max: 8 },
    skillDropType: 'none',
    resourceDrops: [
      { resourceId: 'wolf_pelt', chance: 0.80, qty: { min: 1, max: 2 } },
      { resourceId: 'wolf_fang', chance: 0.40, qty: { min: 1, max: 1 } },
    ],
  },

  knoll_goblin: {
    id: 'knoll_goblin',
    name: 'Knoll Goblin',
    zone: 'ashenvale',
    huntingSpot: 'wildmere_hills',
    rank: 'common',
    baseStats: { hp: 85, atk: 20, def: 8, spd: 12 },
    expReward: 55,
    goldReward: { min: 6, max: 12 },
    skillDropType: 'active',
    skillDrop: { chance: 0.10, skillId: 'cheap_shot' },
    resourceDrops: [
      { resourceId: 'rusted_iron', chance: 0.60, qty: { min: 1, max: 2 } },
      { resourceId: 'bone_fragment', chance: 0.40, qty: { min: 1, max: 2 } },
    ],
  },

  thunderhoof: {
    id: 'thunderhoof',
    name: 'Thunderhoof',
    zone: 'ashenvale',
    huntingSpot: 'wildmere_hills',
    rank: 'elite',
    baseStats: { hp: 210, atk: 28, def: 12, spd: 14 },
    expReward: 130,
    goldReward: { min: 15, max: 30 },
    skillDropType: 'active',
    skillDrop: { chance: 0.18, skillId: 'trample_charge' },
    resourceDrops: [
      { resourceId: 'wolf_pelt', chance: 0.80, qty: { min: 1, max: 3 } },
      { resourceId: 'ancient_bone', chance: 0.50, qty: { min: 1, max: 2 } },
    ],
  },

  // ── RÉSERVE (MON01) — gardés en données, JAMAIS spawn en surface ──────
  // Réutilisation future (Hollow Crypt / Grimspire). Exclus de MONSTERS_BY_SPOT/_ZONE.
  barrow_wight: {
    id: 'barrow_wight',
    name: 'Barrow Wight',
    zone: 'ashenvale',
    huntingSpot: null,
    reserve: true,
    rank: 'common',
    baseStats: { hp: 90, atk: 18, def: 8, spd: 9 },
    expReward: 45,
    goldReward: { min: 4, max: 8 },
    skillDropType: 'passive',
    skillDrop: { chance: 0.10, skillId: 'iron_resolve' },
    resourceDrops: [
      { resourceId: 'bone_fragment', chance: 0.80, qty: { min: 1, max: 3 } },
      { resourceId: 'ancient_bone', chance: 0.30, qty: { min: 1, max: 1 } },
    ],
  },

  soul_harvester: {
    id: 'soul_harvester',
    name: 'Soul Harvester',
    zone: 'ashenvale',
    huntingSpot: null,
    reserve: true,
    rank: 'elite',
    baseStats: { hp: 200, atk: 28, def: 12, spd: 12 },
    expReward: 100,
    goldReward: { min: 10, max: 20 },
    skillDropType: 'active',
    skillDrop: { chance: 0.20, skillId: 'soul_crush' },
    resourceDrops: [
      { resourceId: 'ectoplasm', chance: 0.90, qty: { min: 2, max: 4 } },
      { resourceId: 'ancient_bone', chance: 0.60, qty: { min: 1, max: 2 } },
    ],
  },

  // ── Route : The Blighted Road (élites) ──────────────────────────────
  cursed_warlord: {
    id: 'cursed_warlord',
    name: 'Cursed Warlord',
    zone: 'blighted_road',
    rank: 'elite',
    baseStats: { hp: 250, atk: 30, def: 18, spd: 10 },
    expReward: 120,
    goldReward: { min: 15, max: 30 },
    skillDropType: 'active',
    skillDrop: { chance: 0.175, skillId: 'cursed_blade' },
    resourceDrops: [
      { resourceId: 'cursed_steel', chance: 0.90, qty: { min: 1, max: 2 } },
      { resourceId: 'warlord_crest', chance: 0.50, qty: { min: 1, max: 1 } },
    ],
  },

  bone_colossus: {
    id: 'bone_colossus',
    name: 'Bone Colossus',
    zone: 'blighted_road',
    rank: 'elite',
    baseStats: { hp: 350, atk: 25, def: 28, spd: 5 },
    expReward: 140,
    goldReward: { min: 20, max: 35 },
    skillDropType: 'active',
    skillDrop: { chance: 0.175, skillId: 'bone_crush' },
    resourceDrops: [
      { resourceId: 'giant_bone', chance: 0.90, qty: { min: 2, max: 4 } },
      { resourceId: 'colossus_marrow', chance: 0.40, qty: { min: 1, max: 1 } },
    ],
  },

  // ── Zone 2 : Grimspire ───────────────────────────────────────────────
  grimstone_troll: {
    id: 'grimstone_troll',
    name: 'Grimstone Troll',
    zone: 'grimspire',
    rank: 'common',
    baseStats: { hp: 180, atk: 28, def: 20, spd: 6 },
    expReward: 80,
    goldReward: { min: 6, max: 12 },
    skillDropType: 'passive',
    skillDrop: { chance: 0.10, skillId: 'troll_regeneration' },
    resourceDrops: [
      { resourceId: 'grimstone', chance: 0.75, qty: { min: 1, max: 3 } },
      { resourceId: 'troll_blood', chance: 0.35, qty: { min: 1, max: 2 } },
    ],
  },

  cursed_sentinel: {
    id: 'cursed_sentinel',
    name: 'Cursed Sentinel',
    zone: 'grimspire',
    rank: 'common',
    baseStats: { hp: 150, atk: 32, def: 25, spd: 9 },
    expReward: 90,
    goldReward: { min: 8, max: 15 },
    skillDropType: 'passive',
    skillDrop: { chance: 0.10, skillId: 'sentinel_watch' },
    resourceDrops: [
      { resourceId: 'cursed_armor_shard', chance: 0.70, qty: { min: 1, max: 2 } },
      { resourceId: 'dark_essence', chance: 0.25, qty: { min: 1, max: 1 } },
    ],
  },

  abyssal_hound: {
    id: 'abyssal_hound',
    name: 'Abyssal Hound',
    zone: 'grimspire',
    rank: 'common',
    baseStats: { hp: 130, atk: 35, def: 12, spd: 18 },
    expReward: 85,
    goldReward: { min: 5, max: 10 },
    skillDropType: 'active',
    skillDrop: { chance: 0.10, skillId: 'abyss_howl' },
    resourceDrops: [
      { resourceId: 'shadow_fur', chance: 0.65, qty: { min: 1, max: 2 } },
      { resourceId: 'void_fang', chance: 0.30, qty: { min: 1, max: 1 } },
    ],
  },

  wyvern_scout: {
    id: 'wyvern_scout',
    name: 'Wyvern Scout',
    zone: 'grimspire',
    rank: 'common',
    baseStats: { hp: 160, atk: 30, def: 15, spd: 16 },
    expReward: 95,
    goldReward: { min: 8, max: 18 },
    skillDropType: 'active',
    skillDrop: { chance: 0.10, skillId: 'wing_gust' },
    resourceDrops: [
      { resourceId: 'wyvern_scale', chance: 0.70, qty: { min: 1, max: 3 } },
      { resourceId: 'wyvern_talon', chance: 0.30, qty: { min: 1, max: 1 } },
    ],
  },

  plague_monk: {
    id: 'plague_monk',
    name: 'Plague Monk',
    zone: 'grimspire',
    rank: 'common',
    baseStats: { hp: 120, atk: 28, def: 10, spd: 11 },
    expReward: 88,
    goldReward: { min: 6, max: 14 },
    skillDropType: 'passive',
    skillDrop: { chance: 0.10, skillId: 'plague_aura' },
    resourceDrops: [
      { resourceId: 'plague_herb', chance: 0.60, qty: { min: 1, max: 3 } },
      { resourceId: 'corrupted_scroll', chance: 0.20, qty: { min: 1, max: 1 } },
    ],
  },

  iron_wraith: {
    id: 'iron_wraith',
    name: 'Iron Wraith',
    zone: 'grimspire',
    rank: 'common',
    baseStats: { hp: 140, atk: 33, def: 8, spd: 15 },
    expReward: 92,
    goldReward: { min: 7, max: 16 },
    skillDropType: 'active',
    skillDrop: { chance: 0.10, skillId: 'iron_shroud' },
    resourceDrops: [
      { resourceId: 'spectral_iron', chance: 0.65, qty: { min: 1, max: 2 } },
      { resourceId: 'wraith_essence', chance: 0.25, qty: { min: 1, max: 1 } },
    ],
  },

  // ── Boss donjons ─────────────────────────────────────────────────────
  hollow_crypt_boss: {
    id: 'hollow_crypt_boss',
    name: 'The Crypt Keeper',
    zone: 'ashenvale',
    rank: 'boss',
    baseStats: { hp: 400, atk: 22, def: 14, spd: 8 },
    expReward: 300,
    goldReward: { min: 30, max: 60 },
    skillDropType: 'active',
    skillDrop: { chance: 0.60, skillId: 'soul_crush' },
    resourceDrops: [
      { resourceId: 'crypt_seal', chance: 1.0, qty: { min: 1, max: 1 } },
      { resourceId: 'ancient_bone', chance: 1.0, qty: { min: 2, max: 4 } },
      { resourceId: 'cursed_gem', chance: 0.50, qty: { min: 1, max: 1 } },
    ],
    // BSS01 (léger) — enrage à 50% HP (stand-in invocation ; BSS01b = vraie invocation de 2 adds)
    bossMechanics: { type: 'enrage', triggerHp: 0.5 },
  },

  forsaken_citadel_boss: {
    id: 'forsaken_citadel_boss',
    name: 'Lord of the Forsaken',
    zone: 'grimspire',
    rank: 'boss',
    baseStats: { hp: 900, atk: 48, def: 35, spd: 11 },
    expReward: 700,
    goldReward: { min: 80, max: 150 },
    skillDropType: 'active',
    skillDrop: { chance: 0.60, skillId: 'forsaken_curse' },
    resourceDrops: [
      { resourceId: 'forsaken_seal', chance: 1.0, qty: { min: 1, max: 1 } },
      { resourceId: 'void_crystal', chance: 1.0, qty: { min: 1, max: 2 } },
      { resourceId: 'dark_lord_relic', chance: 0.40, qty: { min: 1, max: 1 } },
    ],
    // BSS02 (léger) — Cursed Strike (STR−20%, 2 tours) ; BSS02b = couche d'armure régénérante
    bossMechanics: { type: 'cursed_strike', chance: 0.4 },
  },

  // ── Demon Lord ────────────────────────────────────────────────────────
  malachar: {
    id: 'malachar',
    name: 'Malachar the Undying',
    zone: 'grimspire',
    rank: 'demon_lord',
    baseStats: { hp: 3000, atk: 90, def: 60, spd: 14 },
    expReward: 5000,
    goldReward: { min: 500, max: 1000 },
    skillDropType: 'active',
    skillDrop: { chance: 1.0, skillId: 'soul_rend' }, // skill suprême unique
    resourceDrops: [
      { resourceId: 'demon_lord_heart', chance: 1.0, qty: { min: 1, max: 1 } },
      { resourceId: 'void_crystal', chance: 1.0, qty: { min: 5, max: 10 } },
    ],
    isBoss: true,
    isDemonLord: true,
    resurrectionCycles: 4, // ressuscite après 4 transmigrations
    // BSS03 — combat en 3 phases (cf. engine/bossMechanics.getMalacharPhase)
    bossMechanics: { type: 'phases' },
  },
}

// MON01 — monstres en réserve (hors surface, jamais spawn ; usage futur donjons)
export const MONSTERS_RESERVE = Object.keys(MONSTERS).filter((id) => MONSTERS[id].reserve)

// Monstres par zone principale (pour unlock + idle indicator) — exclut la réserve
export const MONSTERS_BY_ZONE = {
  ashenvale: [
    'ashwood_wolf', 'thicket_hare', 'tuskmaw_boar', 'old_oakheart',
    'marsh_serpent', 'briar_wraith', 'mire_slime', 'fenrot_devourer',
    'stone_golem', 'hollow_knight', 'ruin_specter', 'graven_sentinel',
    'hill_slime', 'russet_fox', 'knoll_goblin', 'thunderhoof',
  ],
  blighted_road: ['cursed_warlord', 'bone_colossus'],
  grimspire: ['grimstone_troll', 'cursed_sentinel', 'abyssal_hound', 'wyvern_scout', 'plague_monk', 'iron_wraith'],
}

// Monstres par spot de chasse Ashenvale (4 clearings de surface) — exclut la réserve
export const MONSTERS_BY_SPOT = {
  ashenvale_forest: ['ashwood_wolf', 'thicket_hare', 'tuskmaw_boar', 'old_oakheart'],
  thornmarsh: ['marsh_serpent', 'briar_wraith', 'mire_slime', 'fenrot_devourer'],
  crumbled_ruins: ['stone_golem', 'hollow_knight', 'ruin_specter', 'graven_sentinel'],
  wildmere_hills: ['hill_slime', 'russet_fox', 'knoll_goblin', 'thunderhoof'],
}

export const DUNGEON_BOSSES = {
  hollow_crypt: 'hollow_crypt_boss',
  forsaken_citadel: 'forsaken_citadel_boss',
}
