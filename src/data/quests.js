// Quêtes du jeu
// Objectives: { type: 'kill', monsterId, count } | { type: 'level', targetLevel }
// Rewards: { skill: { skillId, level }, gold, reputationTokens }

// ── NPCs donneurs (Q08) ──────────────────────────────────────────────────────
export const QUEST_NPCS = {
  sir_aldric: {
    id: 'sir_aldric',
    name: 'Sir Aldric',
    title: 'Knight of Millhaven',
    location: 'ironhaven',
    sigil: '⚔',
  },
  ironhaven_captain: {
    id: 'ironhaven_captain',
    name: 'Captain Vaern',
    title: 'Captain of the Ironhaven Guard',
    location: 'ironhaven',
    sigil: '🛡',
  },
  greywatch_elder: {
    id: 'greywatch_elder',
    name: 'Elder Moira',
    title: 'Elder of Greywatch Village',
    location: 'greywatch',
    sigil: '🌿',
  },
}

export const QUESTS = {
  // ── Sir Aldric (existantes) ────────────────────────────────────────────────
  first_blood: {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Prove your worth by hunting down Ashwood Wolves in the forest.',
    giverNpc: 'sir_aldric',
    flavorText: '"The wolves grow bold. Show them what fear looks like."',
    objectives: [
      { id: 'kill_wolves', type: 'kill', monsterId: 'ashwood_wolf', count: 5, label: 'Kill Ashwood Wolves' },
    ],
    reward: {
      skill: { skillId: 'counter_strike', level: 1 },
      gold: 50,
      reputationTokens: 1,
    },
  },

  proof_of_worth: {
    id: 'proof_of_worth',
    name: 'Proof of Worth',
    description: 'Grow strong enough to earn Sir Aldric\'s respect.',
    giverNpc: 'sir_aldric',
    flavorText: '"Strength is earned through trials. Return when you have grown."',
    objectives: [
      { id: 'reach_level', type: 'level', targetLevel: 3, label: 'Reach Level 3' },
    ],
    reward: {
      skill: { skillId: 'veterans_resolve', level: 1 },
      gold: 30,
      reputationTokens: 1,
    },
  },

  clear_the_marsh: {
    id: 'clear_the_marsh',
    name: 'Clear the Marsh',
    description: 'Travelers have been disappearing near the Thornmarsh. End the serpent threat.',
    giverNpc: 'sir_aldric',
    flavorText: '"Three merchants lost this week alone. The marsh must be cleansed."',
    objectives: [
      { id: 'kill_serpents', type: 'kill', monsterId: 'marsh_serpent', count: 3, label: 'Kill Marsh Serpents' },
    ],
    reward: {
      skill: { skillId: 'cleave', level: 1 },
      gold: 80,
      reputationTokens: 2,
    },
  },

  // ── Q03 — Quêtes boss donjon (Captain Vaern) ──────────────────────────────
  silence_the_crypt: {
    id: 'silence_the_crypt',
    name: 'Silence the Crypt',
    description: 'End the Crypt Keeper who commands the hollow dead of Ashenvale.',
    giverNpc: 'ironhaven_captain',
    flavorText: '"Our scouts have not returned. The crypt must fall, or no one is safe."',
    objectives: [
      { id: 'kill_crypt_keeper', type: 'kill', monsterId: 'hollow_crypt_boss', count: 1, label: 'Slay the Crypt Keeper' },
    ],
    reward: {
      skill: { skillId: 'soul_crush', level: 1 },
      gold: 200,
      reputationTokens: 3,
    },
  },

  storm_the_citadel: {
    id: 'storm_the_citadel',
    name: 'Storm the Citadel',
    description: 'The Lord of the Forsaken rules Grimspire. Break his reign.',
    giverNpc: 'ironhaven_captain',
    flavorText: '"No army has taken the Citadel. A lone hero might. Go — prove us wrong."',
    objectives: [
      { id: 'kill_forsaken_lord', type: 'kill', monsterId: 'forsaken_citadel_boss', count: 1, label: 'Slay the Lord of the Forsaken' },
    ],
    reward: {
      skill: { skillId: 'forsaken_curse', level: 1 },
      gold: 450,
      reputationTokens: 5,
    },
  },

  end_the_demon: {
    id: 'end_the_demon',
    name: 'End the Demon',
    description: 'Malachar the Undying cannot die. But perhaps you can.',
    giverNpc: 'ironhaven_captain',
    flavorText: '"Four champions have tried. None returned. Yet here you stand."',
    objectives: [
      { id: 'kill_malachar', type: 'kill', monsterId: 'malachar', count: 1, label: 'Slay Malachar' },
    ],
    reward: {
      gold: 1000,
      reputationTokens: 10,
    },
  },

  // ── Q08 — Greywatch Elder (marais / ruines) ───────────────────────────────
  bog_purge: {
    id: 'bog_purge',
    name: 'Bog Purge',
    description: 'The Mire Slimes spread rot through the marsh. Cull their numbers.',
    giverNpc: 'greywatch_elder',
    flavorText: '"My grandson fell last harvest. Do this, and the village remembers you."',
    objectives: [
      // MON01 — re-ciblé depuis bog_shambler (retiré du Thornmarsh) vers mire_slime.
      { id: 'kill_mire_slimes', type: 'kill', monsterId: 'mire_slime', count: 4, label: 'Kill Mire Slimes' },
    ],
    reward: {
      gold: 120,
      reputationTokens: 2,
    },
  },

  ruins_cleanse: {
    id: 'ruins_cleanse',
    name: 'Cleanse the Ruins',
    description: 'Ancient specters haunt the Crumbled Ruins. End their restless watch.',
    giverNpc: 'greywatch_elder',
    flavorText: '"The dead do not rest here. They remember. They hunger."',
    objectives: [
      { id: 'kill_ruin_specters', type: 'kill', monsterId: 'ruin_specter', count: 3, label: 'Kill Ruin Specters' },
      { id: 'kill_hollow_knights', type: 'kill', monsterId: 'hollow_knight', count: 2, label: 'Kill Hollow Knights' },
    ],
    reward: {
      gold: 180,
      reputationTokens: 3,
    },
  },
}
