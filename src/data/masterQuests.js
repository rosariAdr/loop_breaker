// ACA04 — Quêtes de level-up de skill (données par un maître : Académie / entraîneur).
//
// Le maître demande de monter un skill au niveau X. Objectif de type `skill_levelup`.
// Récompense (décidée) : gold + (skill OU +5 Aura OU +5 Concentration) — variété Q09.
//
// Standalone (n'importe RIEN de quests.js) → quests.js peut l'importer sans cycle.

export const MASTER_QUEST_NPC = {
  academy_master: {
    id: 'academy_master',
    name: 'Archmagister Vael',
    title: 'Master of the Academy',
    location: 'ironhaven',
    sigil: '✦',
  },
}

export const MASTER_QUESTS = {
  master_sharpen_strike: {
    id: 'master_sharpen_strike',
    name: 'Sharpen the Blade',
    description: 'Drill Counter Strike until the riposte is second nature.',
    giverNpc: 'academy_master',
    isMasterQuest: true,
    flavorText: '"A technique half-learned is a wound waiting to happen. Master it."',
    objectives: [
      {
        id: 'lvl_counter',
        type: 'skill_levelup',
        skillId: 'counter_strike',
        targetLevel: 2,
        label: 'Raise Counter Strike to Lv2',
      },
    ],
    reward: { gold: 80, aura: 5 },
  },

  master_focus_cleave: {
    id: 'master_focus_cleave',
    name: 'The Focused Swing',
    description: 'Refine Cleave into a single, deliberate arc.',
    giverNpc: 'academy_master',
    isMasterQuest: true,
    flavorText: '"Power without focus is noise. Show me focus."',
    objectives: [
      {
        id: 'lvl_cleave',
        type: 'skill_levelup',
        skillId: 'cleave',
        targetLevel: 2,
        label: 'Raise Cleave to Lv2',
      },
    ],
    reward: { gold: 100, concentration: 5 },
  },

  master_temper_resolve: {
    id: 'master_temper_resolve',
    name: 'Temper the Will',
    description: "Strengthen Veteran's Resolve through hardship.",
    giverNpc: 'academy_master',
    isMasterQuest: true,
    flavorText: '"The body breaks where the will is soft. Temper yours."',
    objectives: [
      {
        id: 'lvl_resolve',
        type: 'skill_levelup',
        skillId: 'veterans_resolve',
        targetLevel: 2,
        label: "Raise Veteran's Resolve to Lv2",
      },
    ],
    reward: { gold: 90, skill: { skillId: 'battle_focus', level: 1 } },
  },
}
