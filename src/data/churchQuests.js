// CHQ01 — Quêtes de l'église (rotation tous les 3 jours).
//
// L'église propose un petit pool de quêtes "pieuses" qui change tous les 3 jours.
// Récompenses : tokens de réputation + élixirs/potions (consommables) — JAMAIS de gold
// (contrainte de design explicite). Le reward shape `{ reputationTokens, consumables }`
// étend Q09 (déjà : gold/équipement/ressources/stat) ; ici tokens + consommables sans or.
//
// Standalone (n'importe RIEN de quests.js) → quests.js peut l'importer sans cycle.

// NPC donneur (le prêtre déjà présent dans SafeZone : Brother Caelum)
export const CHURCH_QUEST_NPC = {
  church_caelum: {
    id: 'church_caelum',
    name: 'Brother Caelum',
    title: 'Cleric of the Old Gods',
    location: 'any',
    sigil: '🙏',
  },
}

// Pool de quêtes de l'église. Objectifs réutilisant les types existants
// (kill / visit / craft / level) ; récompenses = tokens + consommables, sans or.
export const CHURCH_QUESTS = {
  church_cleanse_specters: {
    id: 'church_cleanse_specters',
    name: 'Cleanse the Restless',
    description: 'The specters of the Crumbled Ruins know no peace. Lay them to rest.',
    giverNpc: 'church_caelum',
    isChurchQuest: true,
    flavorText: '"A soul that cannot rest is a wound upon the world. Close it."',
    objectives: [
      {
        id: 'kill_specters',
        type: 'kill',
        monsterId: 'ruin_specter',
        count: 3,
        label: 'Lay Ruin Specters to rest',
      },
    ],
    reward: { reputationTokens: 2, consumables: { elixir_minor: 2 } },
  },

  church_calm_marsh: {
    id: 'church_calm_marsh',
    name: 'Mercy for the Lost',
    description: 'Pilgrims vanish on the Thornmarsh road. Drive back the serpents that hunt them.',
    giverNpc: 'church_caelum',
    isChurchQuest: true,
    flavorText: '"They came seeking blessing and found fangs. Make the road safe again."',
    objectives: [
      {
        id: 'kill_serpents',
        type: 'kill',
        monsterId: 'marsh_serpent',
        count: 3,
        label: 'Slay Marsh Serpents',
      },
    ],
    reward: { reputationTokens: 2, consumables: { hp_potion_medium: 2 } },
  },

  church_banish_wraiths: {
    id: 'church_banish_wraiths',
    name: 'Banish the Briar Wraiths',
    description: 'Cursed spirits cling to the bramble. Sanctify the thornmarsh.',
    giverNpc: 'church_caelum',
    isChurchQuest: true,
    flavorText: '"Where faith fails, the wraith feeds. Restore the people\'s courage."',
    objectives: [
      {
        id: 'kill_wraiths',
        type: 'kill',
        monsterId: 'briar_wraith',
        count: 3,
        label: 'Banish Briar Wraiths',
      },
    ],
    reward: { reputationTokens: 2, consumables: { antidote_basic: 2, mana_potion_medium: 1 } },
  },

  church_break_knights: {
    id: 'church_break_knights',
    name: 'Shatter the Hollow Watch',
    description: 'Hollow knights guard a desecrated shrine. Break their vigil.',
    giverNpc: 'church_caelum',
    isChurchQuest: true,
    flavorText: '"That shrine was ours once. Take it back, blow by blow."',
    objectives: [
      {
        id: 'kill_knights',
        type: 'kill',
        monsterId: 'hollow_knight',
        count: 2,
        label: 'Destroy Hollow Knights',
      },
    ],
    reward: { reputationTokens: 3, consumables: { mana_crystal: 1 } },
  },

  church_thin_the_pack: {
    id: 'church_thin_the_pack',
    name: 'Thin the Wolf Pack',
    description: 'Wolves harry the faithful on their way to prayer. Cull the pack.',
    giverNpc: 'church_caelum',
    isChurchQuest: true,
    flavorText: '"Even a shepherd must sometimes raise the staff. Go."',
    objectives: [
      {
        id: 'kill_wolves',
        type: 'kill',
        monsterId: 'ashwood_wolf',
        count: 5,
        label: 'Cull Ashwood Wolves',
      },
    ],
    reward: { reputationTokens: 1, consumables: { stamina_ration: 3 } },
  },

  church_purge_slimes: {
    id: 'church_purge_slimes',
    name: 'Purge the Rot',
    description: 'Mire slimes spread blight near the holy well. Purge them.',
    giverNpc: 'church_caelum',
    isChurchQuest: true,
    flavorText: '"The well must run clean, or the village sickens. Cleanse it."',
    objectives: [
      {
        id: 'kill_slimes',
        type: 'kill',
        monsterId: 'mire_slime',
        count: 4,
        label: 'Purge Mire Slimes',
      },
    ],
    reward: { reputationTokens: 2, consumables: { elixir_minor: 1, hp_potion_medium: 1 } },
  },
}

// CHURCH_ROTATION_DAYS — la sélection change tous les 3 jours.
export const CHURCH_ROTATION_DAYS = 3
// Nombre de quêtes proposées simultanément.
export const CHURCH_ACTIVE_COUNT = 2

/**
 * Bloc de rotation courant : change tous les CHURCH_ROTATION_DAYS jours.
 * Ex. dayCount 1-2 → 0, 3-5 → 1, 6-8 → 2 (seed `Math.floor(dayCount/3)`).
 */
export function churchRotationBlock(dayCount = 1) {
  return Math.floor((dayCount ?? 1) / CHURCH_ROTATION_DAYS)
}

/**
 * Quêtes de l'église actives pour la journée donnée (fenêtre glissante de N quêtes
 * dans le pool, avançant d'un bloc tous les 3 jours). Déterministe (pas d'alea).
 */
export function getActiveChurchQuests(dayCount = 1, count = CHURCH_ACTIVE_COUNT) {
  const pool = Object.values(CHURCH_QUESTS)
  if (pool.length === 0) return []
  const n = Math.min(count, pool.length)
  const start = (churchRotationBlock(dayCount) * n) % pool.length
  const out = []
  for (let i = 0; i < n; i++) {
    out.push(pool[(start + i) % pool.length])
  }
  return out
}
