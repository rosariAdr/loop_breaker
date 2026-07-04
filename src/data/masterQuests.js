// ACA04 — Quêtes de level-up de skill (données par un maître : Académie / entraîneur).
//
// Le maître demande de monter un skill au niveau X. Objectif de type `skill_levelup`.
// Récompense (décidée) : gold + (skill OU +5 Aura OU +5 Concentration) — variété Q09.
//
// MST03 — Les skills « de récompense » sont désormais EXCLUSIFS aux maîtres : les quêtes
// ordinaires (quests.js) ne donnent plus de skill. Les skills reroutés sont attribués ici :
//   martial  : counter_strike, cleave, power_strike, veterans_resolve (maître Aldric)
//   arcane   : soul_crush, forsaken_curse (maîtres mage — MST06 Millhaven, MST07 Vael)
//
// Standalone (n'importe RIEN de quests.js) → quests.js peut l'importer sans cycle.

export const MASTER_QUEST_NPC = {
  // MST05 — Aldric (maître martial) : donneur des quêtes de maîtrise martiale.
  sir_aldric: {
    id: 'sir_aldric',
    name: 'Sir Aldric',
    title: "Membre d'honneur du Royal Knighthood",
    location: 'greywatch',
    sigil: '⚔',
  },
  // MST07 — Archmagister Vael : maître ARCANE d'Ironhaven (recyclé academy_master).
  // Il garde le catalogue payant de l'Académie ET devient un maître dont les quêtes
  // récompensent des skills du pool arcane que la boutique ne vend pas.
  academy_master: {
    id: 'academy_master',
    name: 'Archmagister Vael',
    title: 'Master of the Academy',
    location: 'ironhaven',
    sigil: '✦',
  },
  // MST06 — Maître mage de Millhaven : « Ancien mage de la cour royale », focus arcane.
  court_mage: {
    id: 'court_mage',
    name: 'Magister Elyndra',
    title: 'Ancien mage de la cour royale',
    location: 'millhaven',
    sigil: '❂',
  },
  // MST07 — Maître physique (berserker) d'Ironhaven : distinct de Vael.
  pit_master: {
    id: 'pit_master',
    name: 'Bulgar the Unbroken',
    title: 'Master of the Iron Pit',
    location: 'ironhaven',
    sigil: '☠',
  },
}

export const MASTER_QUESTS = {
  // ══════════════════════════════════════════════════════════════════════════
  // MAÎTRE MARTIAL — Sir Aldric (Greywatch)
  // ══════════════════════════════════════════════════════════════════════════

  // ── MST02/MST05 — Quête d'INITIATION (Sir Aldric, maître martial) ────────────
  // Valider cette quête ENGAGE le héros auprès d'Aldric (setMaster côté store) et
  // verrouille l'engagement pour tout le run (MST-G1). Choix libre : rien n'oblige à la
  // prendre — mais tant qu'AUCUNE initiation n'est validée, les quêtes de maître restent
  // verrouillées. Objectif d'entrée simple (preuve de valeur) cohérent avec Aldric.
  // MST03 — récompense un skill martial exclusif (counter_strike, retiré de first_blood).
  master_init_aldric: {
    id: 'master_init_aldric',
    name: 'The Knight’s Trial',
    description: 'Prove your resolve to Sir Aldric to be taken as his student.',
    giverNpc: 'sir_aldric', // Aldric (maître martial de Greywatch, câblé en QUEST_NPCS)
    isMasterQuest: true,
    isInitiation: true, // MST02 — sa complétion appelle setMaster(masterId)
    masterId: 'sir_aldric', // maître engagé quand validée
    flavorText: '"The Knighthood does not take the untested. Show me your steel."',
    objectives: [
      {
        id: 'init_prove',
        type: 'kill',
        monsterId: 'ashwood_wolf',
        count: 3,
        label: 'Slay Ashwood Wolves',
      },
    ],
    // MST03 — counter_strike (reroutée de first_blood) : le geste fondateur du chevalier.
    reward: { gold: 60, aura: 5, skill: { skillId: 'counter_strike', level: 1 } },
  },

  master_sharpen_strike: {
    id: 'master_sharpen_strike',
    name: 'Sharpen the Blade',
    description: 'Drill Counter Strike until the riposte is second nature.',
    giverNpc: 'sir_aldric',
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
    // MST03 — cleave (reroutée de clear_the_marsh) : la 2e technique martiale du maître.
    reward: { gold: 80, skill: { skillId: 'cleave', level: 1 } },
  },

  master_focus_cleave: {
    id: 'master_focus_cleave',
    name: 'The Focused Swing',
    description: 'Refine Cleave into a single, deliberate arc.',
    giverNpc: 'sir_aldric',
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
    // MST03 — power_strike (reroutée de nc_graven_elite) : le coup lourd du chevalier.
    reward: { gold: 100, concentration: 5, skill: { skillId: 'power_strike', level: 1 } },
  },

  master_temper_resolve: {
    id: 'master_temper_resolve',
    name: 'Temper the Will',
    description: 'Strengthen Power Strike through hardship.',
    giverNpc: 'sir_aldric',
    isMasterQuest: true,
    flavorText: '"The body breaks where the will is soft. Temper yours."',
    objectives: [
      {
        id: 'lvl_resolve',
        type: 'skill_levelup',
        skillId: 'power_strike',
        targetLevel: 2,
        label: 'Raise Power Strike to Lv2',
      },
    ],
    // MST03 — veterans_resolve (reroutée de proof_of_worth) : le passif d'endurance martiale.
    reward: { gold: 90, skill: { skillId: 'veterans_resolve', level: 1 } },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MAÎTRE ARCANE — Archmagister Vael (Ironhaven, Académie) — MST07
  // ══════════════════════════════════════════════════════════════════════════

  // Initiation arcane : Vael garde son catalogue payant, mais devient un maître dont
  // les quêtes récompensent des skills arcanes exclusifs (hors boutique).
  master_init_vael: {
    id: 'master_init_vael',
    name: 'The Archmagister’s Test',
    description: 'Prove your grasp of the arcane to Archmagister Vael to study under him.',
    giverNpc: 'academy_master',
    isMasterQuest: true,
    isInitiation: true,
    masterId: 'academy_master',
    flavorText: '"The Academy sells techniques to any purse. Mastery, I give only to the worthy."',
    objectives: [
      {
        id: 'vael_prove',
        type: 'kill',
        monsterId: 'marsh_serpent',
        count: 3,
        label: 'Slay Marsh Serpents',
      },
    ],
    // Skill arcane exclusif (hors ACADEMY_CATALOG) : contrôle magique de départ.
    reward: { gold: 90, aura: 5, skill: { skillId: 'abyss_howl', level: 1 } },
  },

  master_arcane_pulse: {
    id: 'master_arcane_pulse',
    name: 'Channel the Gust',
    description: 'Sharpen Abyss Howl into a weapon of pure will.',
    giverNpc: 'academy_master',
    isMasterQuest: true,
    flavorText: '"Sound is force. Bend it, and even the void answers."',
    objectives: [
      {
        id: 'lvl_abyss',
        type: 'skill_levelup',
        skillId: 'abyss_howl',
        targetLevel: 2,
        label: 'Raise Abyss Howl to Lv2',
      },
    ],
    // Skill arcane AoE (hors boutique).
    reward: { gold: 120, concentration: 5, skill: { skillId: 'wing_gust', level: 1 } },
  },

  master_soul_rend: {
    id: 'master_soul_rend',
    name: 'Rend the Soul',
    description: 'Only a disciplined mind can wield Wing Gust — then take the next step.',
    giverNpc: 'academy_master',
    isMasterQuest: true,
    flavorText: '"To crush a soul, you must first have mastered your own."',
    objectives: [
      {
        id: 'lvl_wing',
        type: 'skill_levelup',
        skillId: 'wing_gust',
        targetLevel: 2,
        label: 'Raise Wing Gust to Lv2',
      },
    ],
    // MST03 — soul_crush (reroutée de silence_the_crypt) : magie lourde, exclusive au maître.
    reward: { gold: 160, skill: { skillId: 'soul_crush', level: 1 } },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MAÎTRE ARCANE — Magister Elyndra (Millhaven) — MST06
  // ══════════════════════════════════════════════════════════════════════════

  master_init_elyndra: {
    id: 'master_init_elyndra',
    name: 'The Court Mage’s Wager',
    description: 'Show Magister Elyndra you can survive the marsh, and she will teach you.',
    giverNpc: 'court_mage',
    isMasterQuest: true,
    isInitiation: true,
    masterId: 'court_mage',
    flavorText: '"The court is ash now. Its magic is not. Prove you can carry it."',
    objectives: [
      {
        id: 'elyndra_prove',
        type: 'kill',
        monsterId: 'mire_slime',
        count: 4,
        label: 'Slay Mire Slimes',
      },
    ],
    // Skill arcane exclusif : poison magique de départ (hors boutique).
    reward: { gold: 90, aura: 5, skill: { skillId: 'plague_maw', level: 1 } },
  },

  master_court_venom: {
    id: 'master_court_venom',
    name: 'The Festering Word',
    description: 'Deepen your command of Plague Maw as the court mages once did.',
    giverNpc: 'court_mage',
    isMasterQuest: true,
    flavorText: '"Rot is patient. So was the court. Learn its patience."',
    objectives: [
      {
        id: 'lvl_plague',
        type: 'skill_levelup',
        skillId: 'plague_maw',
        targetLevel: 2,
        label: 'Raise Plague Maw to Lv2',
      },
    ],
    reward: { gold: 130, concentration: 5, skill: { skillId: 'abyss_howl', level: 1 } },
  },

  master_court_curse: {
    id: 'master_court_curse',
    name: 'The Forsaken Rite',
    description: 'Master Abyss Howl, and Elyndra will trust you with the court’s darkest rite.',
    giverNpc: 'court_mage',
    isMasterQuest: true,
    flavorText: '"They called it forbidden. I call it necessary. You will call it yours."',
    objectives: [
      {
        id: 'lvl_abyss_c',
        type: 'skill_levelup',
        skillId: 'abyss_howl',
        targetLevel: 2,
        label: 'Raise Abyss Howl to Lv2',
      },
    ],
    // MST03 — forsaken_curse (reroutée de storm_the_citadel) : contrôle magique de boss, exclusif.
    reward: { gold: 200, skill: { skillId: 'forsaken_curse', level: 1 } },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MAÎTRE PHYSIQUE (BERSERKER) — Bulgar the Unbroken (Ironhaven) — MST07
  // ══════════════════════════════════════════════════════════════════════════

  master_init_bulgar: {
    id: 'master_init_bulgar',
    name: 'The Iron Pit',
    description: 'Bulgar respects only those who spill blood in the pit. Give him a show.',
    giverNpc: 'pit_master',
    isMasterQuest: true,
    isInitiation: true,
    masterId: 'pit_master',
    flavorText: '"No forms. No mercy. Break something, and we\'ll talk."',
    objectives: [
      {
        id: 'bulgar_prove',
        type: 'kill',
        monsterId: 'hollow_knight',
        count: 3,
        label: 'Slay Hollow Knights',
      },
    ],
    // Skill berserker exclusif (hors boutique) : gros coup brut de départ.
    reward: { gold: 90, aura: 5, skill: { skillId: 'trample_charge', level: 1 } },
  },

  master_pit_frenzy: {
    id: 'master_pit_frenzy',
    name: 'No Retreat',
    description: 'Bulgar wants Trample Charge honed into a stampede.',
    giverNpc: 'pit_master',
    isMasterQuest: true,
    flavorText: '"Slower means dead. Hit harder. Hit again."',
    objectives: [
      {
        id: 'lvl_trample',
        type: 'skill_levelup',
        skillId: 'trample_charge',
        targetLevel: 2,
        label: 'Raise Trample Charge to Lv2',
      },
    ],
    reward: { gold: 130, concentration: 5, skill: { skillId: 'bone_crush', level: 1 } },
  },

  master_pit_reckless: {
    id: 'master_pit_reckless',
    name: 'Everything at Once',
    description: 'Master Bone Crush, and Bulgar will teach you the blow that spares nothing.',
    giverNpc: 'pit_master',
    isMasterQuest: true,
    flavorText: '"Guard? Guard is for cowards. Give me everything or give me nothing."',
    objectives: [
      {
        id: 'lvl_bone',
        type: 'skill_levelup',
        skillId: 'bone_crush',
        targetLevel: 2,
        label: 'Raise Bone Crush to Lv2',
      },
    ],
    // Skill berserker exclusif : le coup sacrificiel.
    reward: { gold: 180, skill: { skillId: 'reckless_blow', level: 1 } },
  },
}
