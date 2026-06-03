// Définition des zones du monde médiéval fantasy

import { MONSTERS } from './monsters'

export const ZONES = {
  ashenvale: {
    id: 'ashenvale',
    name: 'Ashenvale',
    description: 'Ancient forests shrouded in ash and mist. Ruins of a forgotten civilization hide among the twisted trees.',
    levelRange: [1, 26],
    zoneMult: 1.0,
    monsters: ['ashwood_wolf', 'rotting_shambler', 'gloom_bat', 'marsh_serpent', 'briar_wraith', 'bog_shambler', 'stone_golem', 'hollow_knight', 'ruin_specter', 'barrow_wight', 'grave_knight', 'soul_harvester'],
    // ── Spots de chasse (4 zones distinctes) ──────────────────────────
    huntingSpots: [
      {
        id: 'ashenvale_forest',
        name: 'Ashenvale Forest',
        icon: '🌲',
        description: 'Ancient woodland filled with wolves and wandering spirits.',
        levelRange: [1, 8],
        monsters: ['ashwood_wolf', 'rotting_shambler', 'gloom_bat'],
        mapPos: { x: 28, y: 18 }, // % dans le conteneur de carte
      },
      {
        id: 'thornmarsh',
        name: 'Thornmarsh',
        icon: '🌿',
        description: 'A fetid swamp where serpents and wraiths lure travelers to their doom.',
        levelRange: [6, 14],
        monsters: ['marsh_serpent', 'briar_wraith', 'bog_shambler'],
        mapPos: { x: 10, y: 52 },
      },
      {
        id: 'crumbled_ruins',
        name: 'Crumbled Ruins',
        icon: '🏚',
        description: 'Shattered remnants of a lost civilization, haunted by golems and specters.',
        levelRange: [12, 20],
        monsters: ['stone_golem', 'hollow_knight', 'ruin_specter'],
        mapPos: { x: 65, y: 22 },
      },
      {
        id: 'barrow_hills',
        name: 'Barrow Hills',
        icon: '⛰',
        description: 'Ancient burial mounds where the restless dead claw their way to the surface.',
        levelRange: [18, 26],
        monsters: ['barrow_wight', 'grave_knight', 'soul_harvester'],
        mapPos: { x: 40, y: 72 },
      },
    ],
    dungeon: {
      id: 'hollow_crypt',
      name: 'The Hollow Crypt',
      bossId: 'hollow_crypt_boss',
      rooms: 5,
      type: 'one_shot',
    },
    city: {
      id: 'ironhaven',
      name: 'Ironhaven',
      type: 'city',
      mapPos: { x: 44, y: 52 },
      buildings: ['inn', 'church', 'merchant', 'alchemy', 'blacksmith'],
      masterBlacksmithChance: 0.025,
    },
    villages: [
      {
        id: 'millhaven',
        name: 'Millhaven',
        type: 'village',
        mapPos: { x: 16, y: 32 },
        buildings: ['inn', 'church', 'knight_trainer'], // Sir Aldric est ici
        optionalBuildings: [
          { id: 'merchant', chance: 0.65 },
          { id: 'alchemy', chance: 0.40 },
          { id: 'blacksmith', chance: 0.20 },
          { id: 'master_smith', chance: 0.10 }, // Z06 — maître forgeron, rare
        ],
      },
      {
        id: 'greywatch',
        name: 'Greywatch',
        type: 'village',
        mapPos: { x: 62, y: 68 },
        buildings: ['inn', 'church'],
        optionalBuildings: [
          { id: 'merchant', chance: 0.65 },
          { id: 'alchemy', chance: 0.40 },
          { id: 'blacksmith', chance: 0.20 },
          { id: 'master_smith', chance: 0.10 }, // Z06 — maître forgeron, rare
        ],
      },
    ],
  },

  blighted_road: {
    id: 'blighted_road',
    name: 'The Blighted Road',
    description: 'A cursed path between Ashenvale and Grimspire. Few dare to travel it alone.',
    levelRange: [15, 30],
    zoneMult: 1.8,
    monsters: ['cursed_warlord', 'bone_colossus'],
    idleAllowed: false, // pas d'idle sur la route
    dungeon: null,
    city: null,
    villages: [],
  },

  grimspire: {
    id: 'grimspire',
    name: 'Grimspire',
    description: 'Ancient cursed mountains and fortresses. The air itself feels heavy with dark magic.',
    levelRange: [21, 40],
    zoneMult: 2.5,
    monsters: ['grimstone_troll', 'cursed_sentinel', 'abyssal_hound', 'wyvern_scout', 'plague_monk', 'iron_wraith'],
    dungeon: {
      id: 'forsaken_citadel',
      name: 'The Forsaken Citadel',
      bossId: 'forsaken_citadel_boss',
      rooms: 5,
      type: 'one_shot',
    },
    demonLord: {
      id: 'malachar',
      name: 'Malachar the Undying',
      location: 'Grimspire Depths',
    },
    city: {
      id: 'stonehaven',
      name: 'Stonehaven',
      type: 'city',
      buildings: ['inn', 'church', 'merchant', 'alchemy', 'blacksmith'],
      masterBlacksmithChance: 0.025,
    },
    villages: [
      {
        id: 'duskreach',
        name: 'Duskreach',
        type: 'village',
        buildings: ['inn', 'church'],
        optionalBuildings: [
          { id: 'merchant', chance: 0.65 },
          { id: 'alchemy', chance: 0.40 },
          { id: 'blacksmith', chance: 0.20 },
          { id: 'master_smith', chance: 0.10 }, // Z06 — maître forgeron, rare
        ],
      },
      {
        id: 'ashfall_post',
        name: 'Ashfall Post',
        type: 'village',
        buildings: ['inn', 'church'],
        optionalBuildings: [
          { id: 'merchant', chance: 0.65 },
          { id: 'alchemy', chance: 0.40 },
          { id: 'blacksmith', chance: 0.20 },
          { id: 'master_smith', chance: 0.10 }, // Z06 — maître forgeron, rare
        ],
      },
    ],
  },
}

// Ordre des zones sur la carte (pour la navigation)
export const ZONE_ORDER = ['ashenvale', 'blighted_road', 'grimspire']

// Multiplicateurs de zone pour le scaling de difficulté
export const ZONE_MULTS = {
  ashenvale: 1.0,
  blighted_road: 1.8,
  grimspire: 2.5,
  dungeon_boss: 3.5,
  demon_lord: 6.0,
}

// Calcule les stats d'un monstre selon la zone et le run actuel
export function scaleMonsterStats(baseStats, zoneId, runCount) {
  const mult = ZONE_MULTS[zoneId] ?? 1.0
  const runScale = Math.pow(1.08, Math.min(runCount, 25))
  const scale = mult * runScale

  return {
    hp: Math.round(baseStats.hp * scale),
    atk: Math.round(baseStats.atk * scale),
    def: Math.round(baseStats.def * scale),
    spd: baseStats.spd, // la vitesse ne scale pas
  }
}

// B12 — Niveau nominal d'un monstre, dérivé du levelRange (min) de son spot de chasse.
// Sert à juger si un ennemi est trop fort pour l'idle. Retourne 1 par défaut.
export function getMonsterLevel(monsterId) {
  const monster = MONSTERS[monsterId]
  if (!monster) return 1
  for (const zone of Object.values(ZONES)) {
    const spot = zone.huntingSpots?.find(s => s.id === monster.huntingSpot)
    if (spot?.levelRange) return spot.levelRange[0]
  }
  const zone = ZONES[monster.zone]
  if (zone?.levelRange) return zone.levelRange[0]
  return 1
}
