// MQ-CHAIN01 — Chaîne de quêtes principale, Map 1 (zone ashenvale).
// Spine narratif Greywatch → Millhaven → Ironhaven (toutes des localités d'ashenvale).
// Le chaînage EST la condition de déblocage des nodes (résout START04) : chaque MQ
// porte `requires` (MQ précédent) + `unlocks` (localités / hunting spots à ouvrir).
// Le moteur de progression (appliquer `unlocks`, garder l'ordre) est câblé en B5b.
//
// MQ-ELITETURN01 — MQ02/04/06 sont des « remises d'élite » : objectif = 3× l'item
// rare de l'élite OU son arme signature ; récompense = l'arme signature (rare).
// Le +1 rareté à la 2ᵉ remise + la consommation des items sont gérés en B5b.
//
// ⚠️ FLAGS B5a :
//  • Donneurs « Doyen » : Greywatch = greywatch_elder (Elder Moira, existant) ;
//    Millhaven = millhaven_elder (NOUVEAU, ci-dessous) ; Ironhaven = ironhaven_captain
//    (réutilisé, faute d'« elder » dédié). À confirmer au grooming.
//  • MQ03/MQ05 : l'objectif d'origine « 2× équip. T1/T2 » dépend de TIER01 (non fait)
//    → simplifié en seuil de niveau (soft-gate) en attendant. Signalé par `simplified`.
//  • Quêtes de bâtiment du spine (BQ-GW/MH/IH) : non incluses ici (recouvrent BLDUNL02
//    + bâtiments cordonnier/bijoutier absents) → à traiter avec BLDUNL02.

// PNJ donneur ajouté pour Millhaven (les autres réutilisent QUEST_NPCS).
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
  // ── Greywatch ──────────────────────────────────────────────────────────────
  mq01_waking: {
    id: 'mq01_waking',
    name: 'The Waking',
    description: 'Elder Moira asks you to thin the wolves prowling Ashenvale Forest.',
    giverNpc: 'greywatch_elder',
    issuedBy: 'greywatch',
    isMainQuest: true,
    mqStep: 'mq01',
    requires: null,
    unlocks: {}, // la forêt est déjà ouverte — quête d'introduction
    flavorText: '"Wake up, traveler. The forest is no place to sleep, and the wolves are hungry."',
    objectives: [
      {
        id: 'kill_wolves',
        type: 'kill',
        monsterId: 'ashwood_wolf',
        count: 5,
        label: 'Cull the Ashwood Wolves',
      },
    ],
    reward: {
      gold: 60,
      reputationTokens: 0,
      consumables: { hp_potion_small: 2, stamina_ration: 1 },
    },
  },

  mq02_millhaven_road: {
    id: 'mq02_millhaven_road',
    name: 'The Road to Millhaven',
    description: 'Old Oakheart blocks the road west. Fell it, and the way to Millhaven opens.',
    giverNpc: 'greywatch_elder',
    issuedBy: 'greywatch',
    isMainQuest: true,
    mqStep: 'mq02',
    requires: 'mq01_waking',
    unlocks: { locations: ['millhaven'] },
    flavorText: '"None pass while the Old Oak walks. Bring me proof it walks no more."',
    objectives: [
      {
        id: 'turnin_oakheart',
        type: 'elite_turnin',
        eliteId: 'old_oakheart',
        resourceId: 'earth_crystal',
        count: 3,
        weaponTemplateId: 'oakheart_branch',
        label: 'Turn in 3× Earth Crystal (Old Oakheart) or its branch',
      },
    ],
    reward: {
      gold: 120,
      reputationTokens: 0,
      equipment: { templateId: 'oakheart_branch', rarity: 'rare' },
    },
  },

  // ── Millhaven ──────────────────────────────────────────────────────────────
  mq03_new_horizons: {
    id: 'mq03_new_horizons',
    name: 'New Horizons',
    description: 'Warden Halric needs the outer wilds scouted before the road can push on.',
    giverNpc: 'millhaven_elder',
    issuedBy: 'millhaven',
    isMainQuest: true,
    mqStep: 'mq03',
    requires: 'mq02_millhaven_road',
    unlocks: { spots: ['wildmere_hills', 'crumbled_ruins'] },
    simplified: 'TIER01', // objectif d'origine « 2× équip T1/T2 » → seuil de niveau en attendant
    flavorText: '"Grow a little harder before the hills and the ruins test you. They will."',
    objectives: [{ id: 'reach_l4', type: 'level', targetLevel: 4, label: 'Reach Level 4' }],
    reward: { gold: 90, reputationTokens: 0, consumables: { hp_potion_small: 3 } },
  },

  mq04_ironhaven_gates: {
    id: 'mq04_ironhaven_gates',
    name: 'The Gates of Ironhaven',
    description: 'Thunderhoof scatters every patrol on the Wildmere road. Bring it down.',
    giverNpc: 'millhaven_elder',
    issuedBy: 'millhaven',
    isMainQuest: true,
    mqStep: 'mq04',
    requires: 'mq03_new_horizons',
    unlocks: { locations: ['ironhaven'] },
    flavorText:
      '"Ironhaven shuts its gates while Thunderhoof runs free. End it, and they open for you."',
    objectives: [
      {
        id: 'turnin_thunderhoof',
        type: 'elite_turnin',
        eliteId: 'thunderhoof',
        resourceId: 'ancient_bone',
        count: 3,
        weaponTemplateId: 'thunderhoof_maul',
        label: 'Turn in 3× Ancient Bone (Thunderhoof) or its maul',
      },
    ],
    reward: {
      gold: 160,
      reputationTokens: 0,
      equipment: { templateId: 'thunderhoof_maul', rarity: 'rare' },
    },
  },

  // ── Ironhaven ──────────────────────────────────────────────────────────────
  mq05_iron_city: {
    id: 'mq05_iron_city',
    name: 'The Iron City',
    description: 'Captain Vaern wants you battle-ready before the marsh campaign.',
    giverNpc: 'ironhaven_captain',
    issuedBy: 'ironhaven',
    isMainQuest: true,
    mqStep: 'mq05',
    requires: 'mq04_ironhaven_gates',
    unlocks: {}, // le marché de la ville est déjà accessible
    simplified: 'TIER01',
    flavorText: '"The marsh eats the unready. Prove you are not, and I will point you to it."',
    objectives: [{ id: 'reach_l6', type: 'level', targetLevel: 6, label: 'Reach Level 6' }],
    reward: { gold: 140, reputationTokens: 0 },
  },

  mq06_beyond_marsh: {
    id: 'mq06_beyond_marsh',
    name: 'Beyond the Marsh',
    description:
      'The Graven Sentinel guards the ruins. Shatter it and open the way to the Thornmarsh.',
    giverNpc: 'ironhaven_captain',
    issuedBy: 'ironhaven',
    isMainQuest: true,
    mqStep: 'mq06',
    requires: 'mq05_iron_city',
    unlocks: { spots: ['thornmarsh'] },
    flavorText: '"A thousand years it has stood watch. Make it kneel, and the marsh is ours."',
    objectives: [
      {
        id: 'turnin_graven',
        type: 'elite_turnin',
        eliteId: 'graven_sentinel',
        resourceId: 'cursed_gem',
        count: 3,
        weaponTemplateId: 'graven_edge',
        label: 'Turn in 3× Cursed Gem (Graven Sentinel) or its edge',
      },
    ],
    reward: {
      gold: 180,
      reputationTokens: 0,
      equipment: { templateId: 'graven_edge', rarity: 'rare' },
    },
  },
}

// Ordre du spine (pour la progression / le « next » côté flux B5b).
export const MAIN_QUEST_ORDER = [
  'mq01_waking',
  'mq02_millhaven_road',
  'mq03_new_horizons',
  'mq04_ironhaven_gates',
  'mq05_iron_city',
  'mq06_beyond_marsh',
]

/** Étape suivante du spine après `questId` (ou null si fin/inconnu). */
export function nextMainQuest(questId) {
  const i = MAIN_QUEST_ORDER.indexOf(questId)
  return i >= 0 && i + 1 < MAIN_QUEST_ORDER.length ? MAIN_QUEST_ORDER[i + 1] : null
}
