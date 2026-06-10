// Définition des zones du monde médiéval fantasy

import { MONSTERS } from './monsters'

export const ZONES = {
  ashenvale: {
    id: 'ashenvale',
    name: 'Ashenvale',
    description:
      'Ancient forests shrouded in ash and mist. Ruins of a forgotten civilization hide among the twisted trees.',
    levelRange: [1, 26],
    zoneMult: 1.0,
    monsters: [
      'ashwood_wolf',
      'rotting_shambler',
      'gloom_bat',
      'marsh_serpent',
      'briar_wraith',
      'bog_shambler',
      'stone_golem',
      'hollow_knight',
      'ruin_specter',
      'barrow_wight',
      'grave_knight',
      'soul_harvester',
    ],
    // ── Spots de chasse (4 zones distinctes) ──────────────────────────
    huntingSpots: [
      {
        id: 'ashenvale_forest',
        name: 'Ashenvale Forest',
        icon: '🌲',
        description: 'Ancient woodland filled with wolves and wandering spirits.',
        levelRange: [1, 8],
        monsters: ['ashwood_wolf', 'thicket_hare', 'tuskmaw_boar', 'old_oakheart'],
        mapPos: { x: 28, y: 18 }, // % dans le conteneur de carte
      },
      {
        id: 'thornmarsh',
        name: 'Thornmarsh',
        icon: '🌿',
        description: 'A fetid swamp where serpents and wraiths lure travelers to their doom.',
        levelRange: [6, 14],
        monsters: ['marsh_serpent', 'briar_wraith', 'mire_slime', 'fenrot_devourer'],
        mapPos: { x: 10, y: 52 },
      },
      {
        id: 'crumbled_ruins',
        name: 'Crumbled Ruins',
        icon: '🏚',
        description: 'Shattered remnants of a lost civilization, haunted by golems and specters.',
        levelRange: [12, 20],
        monsters: ['stone_golem', 'hollow_knight', 'ruin_specter', 'graven_sentinel'],
        mapPos: { x: 65, y: 22 },
      },
      {
        id: 'wildmere_hills',
        name: 'Wildmere Hills',
        icon: '⛰',
        description: 'Verdant hills teeming with wild beasts and roaming creatures.',
        levelRange: [18, 26],
        monsters: ['hill_slime', 'russet_fox', 'knoll_goblin', 'thunderhoof'],
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
      buildings: ['inn', 'church', 'merchant', 'alchemy', 'blacksmith', 'academy', 'guild'], // GLD01
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
          { id: 'alchemy', chance: 0.4 },
          { id: 'blacksmith', chance: 0.2 },
          { id: 'master_smith', chance: 0.1 }, // Z06 — maître forgeron, rare
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
          { id: 'alchemy', chance: 0.4 },
          { id: 'blacksmith', chance: 0.2 },
          { id: 'master_smith', chance: 0.1 }, // Z06 — maître forgeron, rare
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
    // PROG01 — déblocage data-driven (conditions en OU ; visible mais voilée tant que verrouillée)
    unlock: {
      hidden: false,
      conditions: [
        { type: 'level', value: 3 },
        { type: 'kills', zone: 'ashenvale', value: 10 },
      ],
    },
  },

  grimspire: {
    id: 'grimspire',
    name: 'Grimspire',
    description:
      'Ancient cursed mountains and fortresses. The air itself feels heavy with dark magic.',
    levelRange: [21, 40],
    zoneMult: 2.5,
    monsters: [
      'grimstone_troll',
      'cursed_sentinel',
      'abyssal_hound',
      'wyvern_scout',
      'plague_monk',
      'iron_wraith',
    ],
    // PROG01 — déblocage data-driven (niveau 8 OU 40 kills d'Ashenvale, OU déblocage explicite PROG03)
    unlock: {
      hidden: false,
      conditions: [
        { type: 'level', value: 8 },
        { type: 'kills', zone: 'ashenvale', value: 40 },
      ],
    },
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
      buildings: ['inn', 'church', 'merchant', 'alchemy', 'blacksmith', 'academy', 'guild'], // GLD01
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
          { id: 'alchemy', chance: 0.4 },
          { id: 'blacksmith', chance: 0.2 },
          { id: 'master_smith', chance: 0.1 }, // Z06 — maître forgeron, rare
        ],
      },
      {
        id: 'ashfall_post',
        name: 'Ashfall Post',
        type: 'village',
        buildings: ['inn', 'church'],
        optionalBuildings: [
          { id: 'merchant', chance: 0.65 },
          { id: 'alchemy', chance: 0.4 },
          { id: 'blacksmith', chance: 0.2 },
          { id: 'master_smith', chance: 0.1 }, // Z06 — maître forgeron, rare
        ],
      },
    ],
  },
}

// Z07 — Type de localité courante (ville vs village), d'après la zone + currentLocation.
export function getLocationType(world) {
  const zone = ZONES[world?.currentZone]
  if (!zone) return 'village'
  if (zone.city?.id === world.currentLocation) return 'city'
  return 'village'
}

// Ordre des zones sur la carte (pour la navigation)
export const ZONE_ORDER = ['ashenvale', 'blighted_road', 'grimspire']

// PROG02 — zone de départ : seule débloquée d'office au démarrage d'un nouveau run.
export const START_ZONE = 'ashenvale'

// Total de kills d'une zone (réutilisé par les conditions de déblocage 'kills').
function killsInZone(world, zoneId) {
  return Object.entries(world?.monsterKillCounts ?? {})
    .filter(([id]) => MONSTERS[id]?.zone === zoneId)
    .reduce((sum, [, n]) => sum + n, 0)
}

/**
 * PROG01 — Une zone est-elle débloquée ? (data-driven)
 * - pas de `unlock` → toujours ouverte (zone de départ).
 * - présente dans `world.unlockedZones` → débloquée explicitement (PROG03 : quête/info).
 * - sinon : au moins une condition d'auto-déblocage satisfaite (niveau / kills / stat / zoneCleared).
 * @param {string} zoneId
 * @param {{world?:object, hero?:object}} state - accepte { world, hero }.
 */
export function isZoneUnlocked(zoneId, state = {}) {
  const zone = ZONES[zoneId]
  if (!zone) return false
  if (!zone.unlock) return true
  const world = state.world ?? state
  const hero = state.hero ?? {}
  if ((world?.unlockedZones ?? []).includes(zoneId)) return true
  return (zone.unlock.conditions ?? []).some((c) => {
    if (c.type === 'level') return (hero.level ?? 0) >= c.value
    if (c.type === 'kills') return killsInZone(world, c.zone ?? START_ZONE) >= c.value
    if (c.type === 'stat') return (hero.stats?.[c.stat] ?? 0) >= c.value
    if (c.type === 'zoneCleared') return (world?.clearedZones ?? []).includes(c.ref)
    return false
  })
}

/**
 * PROG01 — Zones visibles sur la carte : toutes les non-cachées + celles débloquées.
 * Une zone `unlock.hidden` reste invisible (fog total) tant qu'elle n'est pas débloquée.
 */
export function getVisibleZones(state = {}) {
  return ZONE_ORDER.filter((id) => {
    const zone = ZONES[id]
    if (!zone?.unlock) return true
    if (!zone.unlock.hidden) return true
    return isZoneUnlocked(id, state)
  })
}

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
    const spot = zone.huntingSpots?.find((s) => s.id === monster.huntingSpot)
    if (spot?.levelRange) return spot.levelRange[0]
  }
  const zone = ZONES[monster.zone]
  if (zone?.levelRange) return zone.levelRange[0]
  return 1
}
