// Campaign access chain. Keep MQ01–06 IDs stable for existing saves.
export const MAIN_QUEST_NPC = {
  millhaven_elder: {
    id: 'millhaven_elder',
    name: 'Warden Halric',
    title: 'Warden of Millhaven',
    location: 'millhaven',
    sigil: '🛡',
  },
}

export const MAIN_QUESTS = {
  mq01_waking: {
    id: 'mq01_waking',
    name: 'The Hunting Journal',
    description:
      'Moira teaches you to read the wolves. Five victories establish your first automatic hunting routine. Return to Greywatch to unlock idle.',
    giverNpc: 'greywatch_elder',
    issuedBy: 'greywatch',
    isMainQuest: true,
    mqStep: 'mq01',
    requires: null,
    unlocks: {},
    flavorText: '“Learn their rhythm. What you understand, you can repeat.”',
    objectives: [
      {
        id: 'kill_ashwood_wolf',
        type: 'kill',
        monsterId: 'ashwood_wolf',
        count: 5,
        cumulative: true,
        label: 'Master the Ashwood Wolves (5 victories)',
      },
    ],
    reward: {
      gold: 60,
      reputationTokens: 0,
      consumables: {
        hp_potion_small: 2,
        stamina_ration: 1,
      },
      idleUnlock: true,
    },
  },
  mq02_millhaven_road: {
    id: 'mq02_millhaven_road',
    name: 'The Road to Millhaven',
    description:
      'Defeat Old Oakheart to secure the road to Millhaven. Victory is proof enough; no rare drops are required.',
    giverNpc: 'greywatch_elder',
    issuedBy: 'greywatch',
    isMainQuest: true,
    mqStep: 'mq02',
    requires: 'mq01_waking',
    unlocks: {
      locations: ['millhaven'],
    },
    flavorText: '"None pass while the Old Oak walks. Bring me proof it walks no more."',
    objectives: [
      {
        id: 'kill_old_oakheart',
        type: 'kill',
        monsterId: 'old_oakheart',
        count: 1,
        cumulative: true,
        label: 'Defeat Old Oakheart',
      },
    ],
    reward: {
      gold: 120,
      reputationTokens: 0,
      equipment: {
        templateId: 'oakheart_branch',
        rarity: 'rare',
      },
    },
  },
  mq03_new_horizons: {
    id: 'mq03_new_horizons',
    name: 'New Horizons',
    description:
      'Halric opens the paths to the hills and ruins. Scout the ruins, then return with your report.',
    giverNpc: 'millhaven_elder',
    issuedBy: 'millhaven',
    isMainQuest: true,
    mqStep: 'mq03',
    requires: 'mq02_millhaven_road',
    unlocks: {},
    flavorText: '“A route is only safe once someone has walked it.”',
    objectives: [
      {
        id: 'scout_ruins',
        type: 'visit',
        spotId: 'crumbled_ruins',
        label: 'Scout Crumbled Ruins',
      },
    ],
    reward: {
      gold: 90,
      reputationTokens: 0,
      consumables: {
        hp_potion_small: 3,
      },
    },
    acceptUnlocks: {
      spots: ['wildmere_hills', 'crumbled_ruins'],
    },
  },
  mq04_ironhaven_gates: {
    id: 'mq04_ironhaven_gates',
    name: 'The Gates of Ironhaven',
    description:
      'Defeat Thunderhoof in Wildmere Hills to secure the patrol route to Ironhaven. No rare drops are required.',
    giverNpc: 'millhaven_elder',
    issuedBy: 'millhaven',
    isMainQuest: true,
    mqStep: 'mq04',
    requires: 'mq03_new_horizons',
    unlocks: {
      locations: ['ironhaven'],
    },
    flavorText:
      '"Ironhaven shuts its gates while Thunderhoof runs free. End it, and they open for you."',
    objectives: [
      {
        id: 'kill_thunderhoof',
        type: 'kill',
        monsterId: 'thunderhoof',
        count: 1,
        cumulative: true,
        label: 'Defeat Thunderhoof',
      },
    ],
    reward: {
      gold: 160,
      reputationTokens: 0,
      equipment: {
        templateId: 'thunderhoof_maul',
        rarity: 'rare',
      },
    },
  },
  mq05_iron_city: {
    id: 'mq05_iron_city',
    name: 'The Iron City',
    description:
      'Give Vaern Halric’s report. The Sentinel still bars the marsh road: learn how to break its guard.',
    giverNpc: 'ironhaven_captain',
    issuedBy: 'ironhaven',
    isMainQuest: true,
    mqStep: 'mq05',
    requires: 'mq04_ironhaven_gates',
    unlocks: {},
    flavorText: '“Win once and you survive. Win again and we can plan a patrol.”',
    objectives: [
      {
        id: 'patrol_report',
        type: 'event',
        eventId: 'patrol_report',
        label: 'Discuss Halric’s patrol report with Captain Vaern',
      },
    ],
    reward: {
      gold: 140,
      reputationTokens: 0,
    },
    reportEvent: 'patrol_report',
  },
  mq06_beyond_marsh: {
    id: 'mq06_beyond_marsh',
    name: 'Beyond the Marsh',
    description:
      'Activate the Sentinel Trial in Crumbled Ruins. Two consecutive manual victories grant a guaranteed orb. Bring it to Vaern to open Thornmarsh.',
    giverNpc: 'ironhaven_captain',
    issuedBy: 'ironhaven',
    isMainQuest: true,
    mqStep: 'mq06',
    requires: 'mq05_iron_city',
    unlocks: {
      spots: ['thornmarsh'],
    },
    flavorText: '"A thousand years it has stood watch. Make it kneel, and the marsh is ours."',
    objectives: [
      {
        id: 'sentinel_orb',
        type: 'resource',
        resourceId: 'sentinel_orb',
        count: 1,
        consume: true,
        label: 'Complete the Sentinel Trial (2 manual victories) and bring its orb',
      },
    ],
    reward: {
      gold: 180,
      reputationTokens: 0,
      equipment: {
        templateId: 'graven_edge',
        rarity: 'rare',
      },
    },
  },
  mq07_marsh_circuit: {
    id: 'mq07_marsh_circuit',
    name: 'A Circuit Through the Reeds',
    requires: 'mq06_beyond_marsh',
    objectives: [
      {
        id: 'visit_marsh',
        type: 'visit',
        spotId: 'thornmarsh',
        label: 'Explore Thornmarsh',
      },
      {
        id: 'kill_marsh_serpent',
        type: 'kill',
        monsterId: 'marsh_serpent',
        count: 3,
        cumulative: false,
        label: 'Defeat 3 Marsh Serpents',
      },
      {
        id: 'kill_briar_wraith',
        type: 'kill',
        monsterId: 'briar_wraith',
        count: 1,
        cumulative: false,
        label: 'Defeat a Briar Wraith after the serpent patrol',
        afterObjective: 'kill_marsh_serpent',
      },
    ],
    unlocks: {
      spots: ['crypt'],
    },
    description:
      'Chart the marsh: defeat three serpents, then a Briar Wraith. Their retreat reveals the entrance to Hollow Crypt.',
    flavorText:
      'Chart the marsh: defeat three serpents, then a Briar Wraith. Their retreat reveals the entrance to Hollow Crypt.',
    giverNpc: 'ironhaven_captain',
    issuedBy: 'ironhaven',
    isMainQuest: true,
    mqStep: 'mq07',
    reward: {
      gold: 180,
    },
  },
  mq08_crypt_master: {
    id: 'mq08_crypt_master',
    name: 'The Master of the Crypt',
    requires: 'mq07_marsh_circuit',
    objectives: [
      {
        id: 'crypt_cleared',
        type: 'event',
        eventId: 'crypt_cleared',
        label: 'Defeat the Crypt Keeper and clear Hollow Crypt',
      },
    ],
    unlocks: {},
    description:
      'Silence the Crypt Keeper. Without its false signals, patrols can reach the Blighted Road.',
    flavorText:
      'Silence the Crypt Keeper. Without its false signals, patrols can reach the Blighted Road.',
    giverNpc: 'ironhaven_captain',
    issuedBy: 'ironhaven',
    isMainQuest: true,
    mqStep: 'mq08',
    reward: {
      gold: 220,
      unlockZone: 'blighted_road',
    },
  },
  mq09_crossing: {
    id: 'mq09_crossing',
    name: 'Through the Blighted Road',
    requires: 'mq08_crypt_master',
    objectives: [
      {
        id: 'road_crossed',
        type: 'event',
        eventId: 'road_crossed',
        label: 'Cross the Blighted Road from Ironhaven',
      },
    ],
    unlocks: {},
    description:
      'Cross the cursed road from Ironhaven. Even a costly crossing reveals the way to Grimspire.',
    flavorText:
      'Cross the cursed road from Ironhaven. Even a costly crossing reveals the way to Grimspire.',
    giverNpc: 'ironhaven_captain',
    issuedBy: 'ironhaven',
    isMainQuest: true,
    mqStep: 'mq09',
    reward: {
      gold: 200,
      unlockZone: 'grimspire',
    },
  },
  mq10_forsaken_citadel: {
    id: 'mq10_forsaken_citadel',
    name: 'The Forsaken Citadel',
    requires: 'mq09_crossing',
    objectives: [
      {
        id: 'citadel_cleared',
        type: 'event',
        eventId: 'citadel_cleared',
        label: 'Defeat the Lord of the Forsaken',
      },
    ],
    unlocks: {},
    description:
      'Vaern commissions you before departure: break the citadel’s command so the final route can open.',
    flavorText:
      'Vaern commissions you before departure: break the citadel’s command so the final route can open.',
    giverNpc: 'ironhaven_captain',
    issuedBy: 'ironhaven',
    isMainQuest: true,
    mqStep: 'mq10',
    reward: {
      gold: 180,
    },
    remote: true,
  },
  mq11_last_obstacle: {
    id: 'mq11_last_obstacle',
    name: 'The Last Obstacle',
    requires: 'mq10_forsaken_citadel',
    objectives: [
      {
        id: 'malachar_defeated',
        type: 'event',
        eventId: 'malachar_defeated',
        label: 'Defeat Malachar the Undying',
      },
    ],
    unlocks: {},
    description:
      'The routes are mapped and the hunting routines proven. Defeat Malachar and end the siege of Eldenmoor.',
    flavorText:
      'The routes are mapped and the hunting routines proven. Defeat Malachar and end the siege of Eldenmoor.',
    giverNpc: 'ironhaven_captain',
    issuedBy: 'ironhaven',
    isMainQuest: true,
    mqStep: 'mq11',
    reward: {
      gold: 300,
    },
    remote: true,
  },
}

export const MAIN_QUEST_ORDER = [
  'mq01_waking',
  'mq02_millhaven_road',
  'mq03_new_horizons',
  'mq04_ironhaven_gates',
  'mq05_iron_city',
  'mq06_beyond_marsh',
  'mq07_marsh_circuit',
  'mq08_crypt_master',
  'mq09_crossing',
  'mq10_forsaken_citadel',
  'mq11_last_obstacle',
]

export function nextMainQuest(questId) {
  const i = MAIN_QUEST_ORDER.indexOf(questId)
  return i >= 0 ? (MAIN_QUEST_ORDER[i + 1] ?? null) : null
}
