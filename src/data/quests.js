// Quêtes du jeu
// Objectives: { type: 'kill', monsterId, count } | { type: 'level', targetLevel }
// Rewards: { skill: { skillId, level }, gold }

export const QUESTS = {
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
}
