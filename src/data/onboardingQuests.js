// QONBOARD01 — Chaîne de quêtes d'ONBOARDING (« Premières fois »), Map 1 (Greywatch).
//
// Chaîne PARALLÈLE à la quête principale (MQ) : elle enseigne les mécaniques de base une par
// une (tuer, s'équiper, se protéger, prier, servir l'église, brasser une potion). Chaque quête
// porte `track:'onboarding'` et se séquence via `requires` (id de la quête précédente) — même
// mécanisme de chaînage que MAIN_QUESTS (`requires`/`completedQuests`), mais SANS `isMainQuest`
// (elle vit dans sa propre section du board, pas dans la Main Quest). La première (`requires:null`)
// est disponible d'entrée ; les suivantes se débloquent à la complétion de la précédente.
//
// Standalone : n'importe RIEN de quests.js → quests.js peut l'agréger sans cycle.
//
// QOBJ-TYPES01 — utilise les nouveaux types d'objectifs non-combat : `equip`, `pray`,
// `accept_deed`, `craft` filtré par `outputKind`.

// Donneur des quêtes d'onboarding = Elder Moira (greywatch_elder), déjà définie dans
// QUEST_NPCS (quests.js). Pas de PNJ dédié : la chaîne se distingue par track:'onboarding'.
export const ONBOARDING_QUEST_NPC = {}

export const ONBOARDING_QUESTS = {
  // 1 — Premier combat : apprendre à tuer.
  onb_first_edge: {
    id: 'onb_first_edge',
    name: 'The First Edge',
    description: 'Elder Moira sends you to cut your teeth on the wolves of Ashenvale Forest.',
    giverNpc: 'greywatch_elder',
    issuedBy: 'greywatch',
    track: 'onboarding',
    requires: null,
    flavorText: '"Every adventurer starts with a first edge. Go — and come back in one piece."',
    objectives: [
      {
        id: 'kill_wolves',
        type: 'kill',
        monsterId: 'ashwood_wolf',
        count: 3,
        label: 'Kill 3 Ashwood Wolves',
      },
    ],
    reward: {
      gold: 20,
      reputationTokens: 0,
      equipment: { templateId: 'worn_iron_dagger', rarity: 'common' }, // arme de départ (vieille dague en fer)
    },
  },

  // 2 — S'équiper : apprendre à porter une arme.
  onb_well_armed: {
    id: 'onb_well_armed',
    name: 'Well Armed',
    description: 'A blade left in your pack is no blade at all. Equip your weapon.',
    giverNpc: 'greywatch_elder',
    issuedBy: 'greywatch',
    track: 'onboarding',
    requires: 'onb_first_edge',
    flavorText: '"A weapon is meant to be worn, not admired. Hang it on your belt."',
    objectives: [
      {
        id: 'equip_weapon',
        type: 'equip',
        category: 'weapon',
        label: 'Equip a weapon',
      },
    ],
    reward: {
      gold: 20,
      reputationTokens: 0,
    },
  },

  // 3 — Se protéger : chasse + collecte, puis récompense armure de tête.
  onb_cover_up: {
    id: 'onb_cover_up',
    name: 'Cover Up',
    description: 'Hunt the fire hares and bring back a pelt — enough to cover your head.',
    giverNpc: 'greywatch_elder',
    issuedBy: 'greywatch',
    track: 'onboarding',
    requires: 'onb_well_armed',
    flavorText: '"A bare head in battle is one head short by morning."',
    objectives: [
      {
        id: 'kill_hares',
        type: 'kill',
        monsterId: 'thicket_hare',
        count: 5,
        label: 'Kill 5 Fire Hares',
      },
      {
        id: 'collect_pelt',
        type: 'collect',
        resourceId: 'hare_pelt',
        count: 1,
        label: 'Collect 1 Hare Pelt',
      },
    ],
    reward: {
      gold: 15,
      reputationTokens: 0,
      equipment: { templateId: 'iron_helm', rarity: 'common' }, // casque de départ
    },
  },

  // 4 — Prier : découvrir l'église.
  onb_recueillement: {
    id: 'onb_recueillement',
    name: 'A Moment of Prayer',
    description: 'Stop by the church and bow before the Old Gods.',
    giverNpc: 'greywatch_elder',
    issuedBy: 'greywatch',
    track: 'onboarding',
    requires: 'onb_cover_up',
    flavorText: '"Iron guards the body; prayer guards the rest. Go kneel."',
    objectives: [
      {
        id: 'pray_once',
        type: 'pray',
        count: 1,
        label: 'Pray at the church (×1)',
      },
    ],
    reward: {
      gold: 10,
      reputationTokens: 0,
    },
  },

  // 5 — Servir : accepter un acte de dévotion.
  onb_devotion: {
    id: 'onb_devotion',
    name: 'Duty of Devotion',
    description: 'Accept an act of devotion from Brother Caelum.',
    giverNpc: 'greywatch_elder',
    issuedBy: 'greywatch',
    track: 'onboarding',
    requires: 'onb_recueillement',
    flavorText: '"Praying is good. Serving is better. Take a deed from the Church board."',
    objectives: [
      {
        id: 'accept_deed',
        type: 'accept_deed',
        count: 1,
        label: 'Accept an act of devotion (×1)',
      },
    ],
    reward: {
      gold: 15,
      reputationTokens: 0,
    },
  },

  // 6 — Brasser : premier craft de consommable.
  onb_first_brew: {
    id: 'onb_first_brew',
    name: 'First Brew',
    description: 'At the alchemy workshop, brew your first potion.',
    giverNpc: 'greywatch_elder',
    issuedBy: 'greywatch',
    track: 'onboarding',
    requires: 'onb_devotion',
    flavorText:
      '"An adventurer without a potion is an adventurer in a hurry to die. To the cauldron!"',
    objectives: [
      {
        id: 'brew_potion',
        type: 'craft',
        count: 1,
        outputKind: 'consumable',
        label: 'Brew 1 potion (consumable)',
      },
    ],
    reward: {
      gold: 0,
      reputationTokens: 0,
      consumables: { hp_potion_small: 2 }, // 2 petites potions de soin
    },
  },
}

// Ordre de la chaîne (pour la progression / le « next »).
export const ONBOARDING_QUEST_ORDER = [
  'onb_first_edge',
  'onb_well_armed',
  'onb_cover_up',
  'onb_recueillement',
  'onb_devotion',
  'onb_first_brew',
]

/** Étape suivante de la chaîne d'onboarding après `questId` (ou null si fin/inconnu). */
export function nextOnboardingQuest(questId) {
  const i = ONBOARDING_QUEST_ORDER.indexOf(questId)
  return i >= 0 && i + 1 < ONBOARDING_QUEST_ORDER.length ? ONBOARDING_QUEST_ORDER[i + 1] : null
}
