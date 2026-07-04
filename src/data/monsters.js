// Tous les monstres du jeu
// baseStats sont les stats au run 0, zone_mult est appliqué via la formule de scaling
// huntingSpot : sous-zone Ashenvale ('ashenvale_forest' | 'thornmarsh' | 'crumbled_ruins' | 'wildmere_hills')
//
// MON01/SKD01 — champ `skillDropType: 'physical_active' | 'magic_active' | 'passive' | 'none'`
//   (INTERNE : drop + bestiaire). Doit rester cohérent avec `getSkillDropType` (source de vérité,
//   dérivée du skill droppé) : active → physical_active si dégâts physiques, sinon magic_active.
//   'none' → pas de skillDrop. ⚠️ L'UI n'affiche JAMAIS la classe : seulement le NOM du skill (S02).
// MON01 — `reserve: true` → monstre conservé en données mais HORS surface (jamais spawn ;
//   exclu de MONSTERS_BY_SPOT / MONSTERS_BY_ZONE), réservé à un usage futur (donjons).

import { SKILLS } from './skills'

export const MONSTERS = {
  // ── Ashenvale Forest (lv 1-8) ───────────────────────────────────────
  ashwood_wolf: {
    id: 'ashwood_wolf',
    name: 'Ashwood Wolf',
    zone: 'ashenvale',
    huntingSpot: 'ashenvale_forest',
    rank: 'common',
    tier: 'T2', // TIER01 — puissance intermédiaire du spot ashenvale_forest
    baseStats: { hp: 40, atk: 8, def: 3, spd: 12 },
    expReward: 15,
    goldReward: { min: 1, max: 3 },
    skillDropType: 'physical_active',
    skillDrop: { chance: 0.1, skillId: 'savage_bite' },
    // RES02 — 1 commun (wolf_fang) + 1 rare tier-based T2@15% (wolf_alpha_fang).
    // DROP-FIX01 — wolf_pelt recanonisé ici (le VRAI loup), retiré du lièvre/renard.
    resourceDrops: [
      { resourceId: 'wolf_fang', chance: 0.55, qty: { min: 1, max: 2 } },
      { resourceId: 'wolf_pelt', chance: 0.55, qty: { min: 1, max: 2 } },
      { resourceId: 'wolf_alpha_fang', chance: 0.15, qty: { min: 1, max: 1 } },
    ],
  },

  thicket_hare: {
    id: 'thicket_hare',
    name: 'Fire Hare', // SKD02 — rethème (id 'thicket_hare' conservé : pas de cascade saves/refs)
    zone: 'ashenvale',
    huntingSpot: 'ashenvale_forest',
    rank: 'common',
    tier: 'T1', // TIER01 — le plus faible du spot ashenvale_forest
    baseStats: { hp: 22, atk: 4, def: 1, spd: 22 },
    expReward: 10,
    goldReward: { min: 1, max: 2 },
    skillDropType: 'magic_active', // SKD03 — drop ember_burst (feu)
    skillDrop: { chance: 0.1, skillId: 'ember_burst' },
    // RES02 — T1 : 1 commun seul (pas de rare, RES-TIER01).
    // DROP-FIX01 — droppe hare_pelt (cuir/cuisine) au lieu de wolf_pelt (incohérent).
    resourceDrops: [{ resourceId: 'hare_pelt', chance: 0.6, qty: { min: 1, max: 2 } }],
  },

  tuskmaw_boar: {
    id: 'tuskmaw_boar',
    name: 'Tuskmaw Boar',
    zone: 'ashenvale',
    huntingSpot: 'ashenvale_forest',
    rank: 'common',
    tier: 'T3', // TIER01 — le plus puissant du spot ashenvale_forest
    baseStats: { hp: 55, atk: 11, def: 6, spd: 7 },
    expReward: 20,
    goldReward: { min: 2, max: 4 },
    skillDropType: 'passive',
    skillDrop: { chance: 0.1, skillId: 'thick_hide' },
    // RES02 — communs thématiques (boar_tusk + boar_hide, cf. FIX-BOAR-DROP01) + 1 rare
    // tier-based T3@7.5% (ironhide_plate). DROP-FIX01 affinera le thème plus tard.
    resourceDrops: [
      { resourceId: 'boar_tusk', chance: 0.6, qty: { min: 1, max: 2 } },
      { resourceId: 'boar_hide', chance: 0.5, qty: { min: 1, max: 2 } },
      { resourceId: 'ironhide_plate', chance: 0.075, qty: { min: 1, max: 1 } },
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
    skillDropType: 'physical_active',
    skillDrop: { chance: 0.18, skillId: 'bramble_slam' },
    resourceDrops: [
      { resourceId: 'briar_thorn', chance: 0.85, qty: { min: 1, max: 3 } },
      { resourceId: 'earth_crystal', chance: 0.3, qty: { min: 1, max: 1 } },
    ],
  },

  // ── Thornmarsh (lv 6-14) ─────────────────────────────────────────────
  marsh_serpent: {
    id: 'marsh_serpent',
    name: 'Marsh Serpent',
    zone: 'ashenvale',
    huntingSpot: 'thornmarsh',
    rank: 'common',
    tier: 'T2', // TIER01 — puissance intermédiaire du spot thornmarsh
    baseStats: { hp: 50, atk: 11, def: 4, spd: 10 },
    expReward: 22,
    goldReward: { min: 1, max: 4 },
    skillDropType: 'physical_active',
    skillDrop: { chance: 0.1, skillId: 'venom_strike' },
    // RES02 — 1 commun (serpent_scale) + 1 rare tier-based T2@15% (marsh_venom)
    resourceDrops: [
      { resourceId: 'serpent_scale', chance: 0.55, qty: { min: 1, max: 3 } },
      { resourceId: 'marsh_venom', chance: 0.15, qty: { min: 1, max: 1 } },
    ],
  },

  briar_wraith: {
    id: 'briar_wraith',
    name: 'Briar Wraith',
    zone: 'ashenvale',
    huntingSpot: 'thornmarsh',
    rank: 'common',
    tier: 'T1', // TIER01 — le plus faible du spot thornmarsh
    baseStats: { hp: 35, atk: 10, def: 2, spd: 14 },
    expReward: 20,
    goldReward: { min: 2, max: 4 },
    skillDropType: 'physical_active',
    skillDrop: { chance: 0.1, skillId: 'thorn_lash' },
    // RES02 — T1 : 1 commun seul (ectoplasm ; pas de rare, RES-TIER01).
    resourceDrops: [{ resourceId: 'ectoplasm', chance: 0.6, qty: { min: 1, max: 2 } }],
  },

  mire_slime: {
    id: 'mire_slime',
    name: 'Mire Slime',
    zone: 'ashenvale',
    huntingSpot: 'thornmarsh',
    rank: 'common',
    tier: 'T3', // TIER01 — le plus puissant du spot thornmarsh
    baseStats: { hp: 70, atk: 8, def: 6, spd: 5 },
    expReward: 26,
    goldReward: { min: 2, max: 5 },
    skillDropType: 'passive',
    skillDrop: { chance: 0.1, skillId: 'caustic_coat' },
    // RES02 — 1 commun (rotten_flesh) + 1 rare tier-based T3@7.5% (caustic_core)
    resourceDrops: [
      { resourceId: 'rotten_flesh', chance: 0.55, qty: { min: 1, max: 2 } },
      { resourceId: 'caustic_core', chance: 0.075, qty: { min: 1, max: 1 } },
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
    skillDropType: 'magic_active',
    skillDrop: { chance: 0.18, skillId: 'plague_maw' },
    resourceDrops: [
      { resourceId: 'marsh_venom', chance: 0.85, qty: { min: 1, max: 3 } },
      { resourceId: 'ancient_bone', chance: 0.4, qty: { min: 1, max: 2 } },
    ],
  },

  // ── Crumbled Ruins (lv 12-20) ────────────────────────────────────────
  stone_golem: {
    id: 'stone_golem',
    name: 'Stone Golem',
    zone: 'ashenvale',
    huntingSpot: 'crumbled_ruins',
    rank: 'common',
    tier: 'T1', // TIER01 — le plus faible du spot crumbled_ruins
    baseStats: { hp: 100, atk: 12, def: 15, spd: 4 },
    expReward: 30,
    goldReward: { min: 2, max: 5 },
    skillDropType: 'passive',
    skillDrop: { chance: 0.1, skillId: 'stoneskin' },
    // RES02 — T1 : 1 commun seul (stone_shard ; pas de rare, RES-TIER01).
    resourceDrops: [{ resourceId: 'stone_shard', chance: 0.65, qty: { min: 2, max: 4 } }],
  },

  hollow_knight: {
    id: 'hollow_knight',
    name: 'Hollow Knight',
    zone: 'ashenvale',
    huntingSpot: 'crumbled_ruins',
    rank: 'common',
    tier: 'T3', // TIER01 — le plus puissant du spot crumbled_ruins
    baseStats: { hp: 80, atk: 14, def: 10, spd: 8 },
    expReward: 35,
    goldReward: { min: 3, max: 7 },
    skillDropType: 'physical_active',
    skillDrop: { chance: 0.1, skillId: 'cursed_cleave' },
    // RES02 — 1 commun (rusted_iron) + 1 rare tier-based T3@7.5% (hollow_shard)
    resourceDrops: [
      { resourceId: 'rusted_iron', chance: 0.55, qty: { min: 1, max: 2 } },
      { resourceId: 'hollow_shard', chance: 0.075, qty: { min: 1, max: 1 } },
    ],
  },

  ruin_specter: {
    id: 'ruin_specter',
    name: 'Ruin Specter',
    zone: 'ashenvale',
    huntingSpot: 'crumbled_ruins',
    rank: 'common',
    tier: 'T2', // TIER01 — puissance intermédiaire du spot crumbled_ruins
    baseStats: { hp: 45, atk: 16, def: 3, spd: 16 },
    expReward: 32,
    goldReward: { min: 3, max: 6 },
    skillDropType: 'physical_active',
    skillDrop: { chance: 0.12, skillId: 'soul_chill' },
    // RES02 — 1 commun (ectoplasm) + 1 rare tier-based T2@15% (spectral_residue)
    resourceDrops: [
      { resourceId: 'ectoplasm', chance: 0.6, qty: { min: 1, max: 3 } },
      { resourceId: 'spectral_residue', chance: 0.15, qty: { min: 1, max: 1 } },
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
    skillDropType: 'physical_active',
    skillDrop: { chance: 0.18, skillId: 'tomb_judgment' },
    resourceDrops: [
      { resourceId: 'rusted_iron', chance: 0.8, qty: { min: 1, max: 3 } },
      { resourceId: 'ancient_bone', chance: 0.5, qty: { min: 1, max: 2 } },
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
    tier: 'T2', // TIER01 — puissance intermédiaire du spot wildmere_hills
    baseStats: { hp: 90, atk: 16, def: 10, spd: 6 },
    expReward: 50,
    goldReward: { min: 5, max: 10 },
    skillDropType: 'passive',
    skillDrop: { chance: 0.1, skillId: 'mossy_hide' },
    // RES02 — 1 commun (rotten_flesh) + 1 rare tier-based T2@15% (verdant_ichor)
    resourceDrops: [
      { resourceId: 'rotten_flesh', chance: 0.55, qty: { min: 1, max: 2 } },
      { resourceId: 'verdant_ichor', chance: 0.15, qty: { min: 1, max: 1 } },
    ],
  },

  russet_fox: {
    id: 'russet_fox',
    name: 'Russet Fox',
    zone: 'ashenvale',
    huntingSpot: 'wildmere_hills',
    rank: 'common',
    tier: 'T1', // TIER01 — le plus faible du spot wildmere_hills
    baseStats: { hp: 60, atk: 18, def: 6, spd: 20 },
    expReward: 45,
    goldReward: { min: 4, max: 8 },
    skillDropType: 'magic_active', // SKD04 — drop fox_fire (feu spectral)
    skillDrop: { chance: 0.1, skillId: 'fox_fire' },
    // RES02 — T1 : 1 commun seul (pas de rare, RES-TIER01).
    // DROP-FIX01 — droppe fox_pelt (cuir/cuisine) au lieu de wolf_pelt (incohérent).
    resourceDrops: [{ resourceId: 'fox_pelt', chance: 0.6, qty: { min: 1, max: 2 } }],
  },

  knoll_goblin: {
    id: 'knoll_goblin',
    name: 'Knoll Goblin',
    zone: 'ashenvale',
    huntingSpot: 'wildmere_hills',
    rank: 'common',
    tier: 'T3', // TIER01 — le plus puissant du spot wildmere_hills
    baseStats: { hp: 85, atk: 20, def: 8, spd: 12 },
    expReward: 55,
    goldReward: { min: 6, max: 12 },
    skillDropType: 'physical_active',
    skillDrop: { chance: 0.1, skillId: 'cheap_shot' },
    // RES02 — 1 commun (bone_fragment) + 1 rare tier-based T3@7.5% (goblin_warpaint)
    resourceDrops: [
      { resourceId: 'bone_fragment', chance: 0.5, qty: { min: 1, max: 2 } },
      { resourceId: 'goblin_warpaint', chance: 0.075, qty: { min: 1, max: 1 } },
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
    skillDropType: 'physical_active',
    skillDrop: { chance: 0.18, skillId: 'trample_charge' },
    // DROP-FIX01 — beast_hide (cuir signature d'élite) remplace le wolf_pelt (thématique bête).
    resourceDrops: [
      { resourceId: 'beast_hide', chance: 0.8, qty: { min: 1, max: 3 } },
      { resourceId: 'ancient_bone', chance: 0.5, qty: { min: 1, max: 2 } },
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
    skillDrop: { chance: 0.1, skillId: 'iron_resolve' },
    resourceDrops: [
      { resourceId: 'bone_fragment', chance: 0.8, qty: { min: 1, max: 3 } },
      { resourceId: 'ancient_bone', chance: 0.3, qty: { min: 1, max: 1 } },
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
    skillDropType: 'magic_active',
    skillDrop: { chance: 0.2, skillId: 'soul_crush' },
    resourceDrops: [
      { resourceId: 'ectoplasm', chance: 0.9, qty: { min: 2, max: 4 } },
      { resourceId: 'ancient_bone', chance: 0.6, qty: { min: 1, max: 2 } },
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
    skillDropType: 'physical_active',
    skillDrop: { chance: 0.175, skillId: 'cursed_blade' },
    resourceDrops: [
      { resourceId: 'cursed_steel', chance: 0.9, qty: { min: 1, max: 2 } },
      { resourceId: 'warlord_crest', chance: 0.5, qty: { min: 1, max: 1 } },
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
    skillDropType: 'physical_active',
    skillDrop: { chance: 0.175, skillId: 'bone_crush' },
    resourceDrops: [
      { resourceId: 'giant_bone', chance: 0.9, qty: { min: 2, max: 4 } },
      { resourceId: 'colossus_marrow', chance: 0.4, qty: { min: 1, max: 1 } },
    ],
  },

  // ── Zone 2 : Grimspire ───────────────────────────────────────────────
  grimstone_troll: {
    id: 'grimstone_troll',
    name: 'Grimstone Troll',
    zone: 'grimspire',
    rank: 'common',
    tier: 'T1', // TIER01 — Grimspire, bande de puissance basse
    baseStats: { hp: 180, atk: 28, def: 20, spd: 6 },
    expReward: 80,
    goldReward: { min: 6, max: 12 },
    skillDropType: 'passive',
    skillDrop: { chance: 0.1, skillId: 'troll_regeneration' },
    // RES02 — T1 : 1 commun seul (grimstone ; pas de rare, RES-TIER01).
    resourceDrops: [{ resourceId: 'grimstone', chance: 0.6, qty: { min: 1, max: 3 } }],
  },

  cursed_sentinel: {
    id: 'cursed_sentinel',
    name: 'Cursed Sentinel',
    zone: 'grimspire',
    rank: 'common',
    tier: 'T2', // TIER01 — Grimspire, bande de puissance intermédiaire
    baseStats: { hp: 150, atk: 32, def: 25, spd: 9 },
    expReward: 90,
    goldReward: { min: 8, max: 15 },
    skillDropType: 'passive',
    skillDrop: { chance: 0.1, skillId: 'sentinel_watch' },
    // RES02 — 1 commun (cursed_armor_shard) + 1 rare tier-based T2@15% (dark_essence)
    resourceDrops: [
      { resourceId: 'cursed_armor_shard', chance: 0.6, qty: { min: 1, max: 2 } },
      { resourceId: 'dark_essence', chance: 0.15, qty: { min: 1, max: 1 } },
    ],
  },

  abyssal_hound: {
    id: 'abyssal_hound',
    name: 'Abyssal Hound',
    zone: 'grimspire',
    rank: 'common',
    tier: 'T1', // TIER01 — Grimspire, bande de puissance basse
    baseStats: { hp: 130, atk: 35, def: 12, spd: 18 },
    expReward: 85,
    goldReward: { min: 5, max: 10 },
    skillDropType: 'magic_active',
    skillDrop: { chance: 0.1, skillId: 'abyss_howl' },
    // RES02 — T1 : 1 commun seul (shadow_fur ; pas de rare, RES-TIER01).
    resourceDrops: [{ resourceId: 'shadow_fur', chance: 0.55, qty: { min: 1, max: 2 } }],
  },

  wyvern_scout: {
    id: 'wyvern_scout',
    name: 'Wyvern Scout',
    zone: 'grimspire',
    rank: 'common',
    tier: 'T3', // TIER01 — Grimspire, bande de puissance haute
    baseStats: { hp: 160, atk: 30, def: 15, spd: 16 },
    expReward: 95,
    goldReward: { min: 8, max: 18 },
    skillDropType: 'magic_active',
    skillDrop: { chance: 0.1, skillId: 'wing_gust' },
    // RES02 — 1 commun (wyvern_scale) + 1 rare tier-based T3@7.5% (wyvern_talon)
    resourceDrops: [
      { resourceId: 'wyvern_scale', chance: 0.6, qty: { min: 1, max: 3 } },
      { resourceId: 'wyvern_talon', chance: 0.075, qty: { min: 1, max: 1 } },
    ],
  },

  plague_monk: {
    id: 'plague_monk',
    name: 'Plague Monk',
    zone: 'grimspire',
    rank: 'common',
    tier: 'T2', // TIER01 — Grimspire, bande de puissance intermédiaire
    baseStats: { hp: 120, atk: 28, def: 10, spd: 11 },
    expReward: 88,
    goldReward: { min: 6, max: 14 },
    skillDropType: 'passive',
    skillDrop: { chance: 0.1, skillId: 'plague_aura' },
    // RES02 — 1 commun (plague_herb) + 1 rare tier-based T2@15% (corrupted_scroll)
    resourceDrops: [
      { resourceId: 'plague_herb', chance: 0.55, qty: { min: 1, max: 3 } },
      { resourceId: 'corrupted_scroll', chance: 0.15, qty: { min: 1, max: 1 } },
    ],
  },

  iron_wraith: {
    id: 'iron_wraith',
    name: 'Iron Wraith',
    zone: 'grimspire',
    rank: 'common',
    tier: 'T3', // TIER01 — Grimspire, bande de puissance haute
    baseStats: { hp: 140, atk: 33, def: 8, spd: 15 },
    expReward: 92,
    goldReward: { min: 7, max: 16 },
    skillDropType: 'magic_active',
    skillDrop: { chance: 0.1, skillId: 'iron_shroud' },
    // RES02 — 1 commun (spectral_iron) + 1 rare tier-based T3@7.5% (wraith_essence)
    resourceDrops: [
      { resourceId: 'spectral_iron', chance: 0.6, qty: { min: 1, max: 2 } },
      { resourceId: 'wraith_essence', chance: 0.075, qty: { min: 1, max: 1 } },
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
    skillDropType: 'magic_active',
    skillDrop: { chance: 0.6, skillId: 'soul_crush' },
    resourceDrops: [
      { resourceId: 'crypt_seal', chance: 1.0, qty: { min: 1, max: 1 } },
      { resourceId: 'ancient_bone', chance: 1.0, qty: { min: 2, max: 4 } },
      { resourceId: 'cursed_gem', chance: 0.5, qty: { min: 1, max: 1 } },
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
    skillDropType: 'magic_active',
    skillDrop: { chance: 0.6, skillId: 'forsaken_curse' },
    resourceDrops: [
      { resourceId: 'forsaken_seal', chance: 1.0, qty: { min: 1, max: 1 } },
      { resourceId: 'void_crystal', chance: 1.0, qty: { min: 1, max: 2 } },
      { resourceId: 'dark_lord_relic', chance: 0.4, qty: { min: 1, max: 1 } },
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
    skillDropType: 'magic_active',
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

// SKD01 — classe de drop de skill DÉRIVÉE du skill droppé (source de vérité unique).
// active → physical_active (dégâts physiques) | magic_active (magie/élément/true/sans dégâts) ;
// passive ; none (pas de skillDrop). Sert au bestiaire + au mapping SKD07.
export function getSkillDropType(monster) {
  const sid = monster?.skillDrop?.skillId
  const skill = sid ? SKILLS[sid] : null
  if (!skill) return 'none'
  if (skill.type === 'passive') return 'passive'
  return skill.effect?.damage?.type === 'physical' ? 'physical_active' : 'magic_active'
}

// MON01 — monstres en réserve (hors surface, jamais spawn ; usage futur donjons)
export const MONSTERS_RESERVE = Object.keys(MONSTERS).filter((id) => MONSTERS[id].reserve)

// Monstres par zone principale (pour unlock + idle indicator) — exclut la réserve
export const MONSTERS_BY_ZONE = {
  ashenvale: [
    'ashwood_wolf',
    'thicket_hare',
    'tuskmaw_boar',
    'old_oakheart',
    'marsh_serpent',
    'briar_wraith',
    'mire_slime',
    'fenrot_devourer',
    'stone_golem',
    'hollow_knight',
    'ruin_specter',
    'graven_sentinel',
    'hill_slime',
    'russet_fox',
    'knoll_goblin',
    'thunderhoof',
  ],
  blighted_road: ['cursed_warlord', 'bone_colossus'],
  grimspire: [
    'grimstone_troll',
    'cursed_sentinel',
    'abyssal_hound',
    'wyvern_scout',
    'plague_monk',
    'iron_wraith',
  ],
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

// SKD07 — Table des drops de skill par zone : { zone: [{ monsterId, skillId, class, elite }] }.
// `class` dérivé par getSkillDropType (physical_active | magic_active | passive). Sert au
// design/équilibrage (répartition physique/magique/passif/élite) + au bestiaire.
export function getSkillDropMap() {
  const map = {}
  for (const [zone, ids] of Object.entries(MONSTERS_BY_ZONE)) {
    map[zone] = ids
      .map((id) => MONSTERS[id])
      .filter((m) => m?.skillDrop)
      .map((m) => ({
        monsterId: m.id,
        skillId: m.skillDrop.skillId,
        class: getSkillDropType(m),
        elite: m.rank === 'elite',
      }))
  }
  return map
}
