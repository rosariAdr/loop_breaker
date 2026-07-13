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

// PNJ donneur dédié (mentor des recrues à Greywatch). Réutilise le lieu de départ.
export const ONBOARDING_QUEST_NPC = {
  greywatch_mentor: {
    id: 'greywatch_mentor',
    name: 'Serjeant Bryn',
    title: 'Veteran of the Greywatch Watch',
    location: 'greywatch',
    sigil: '🎓',
  },
}

export const ONBOARDING_QUESTS = {
  // 1 — Premier combat : apprendre à tuer.
  onb_first_edge: {
    id: 'onb_first_edge',
    name: 'Le premier tranchant',
    description: "Bryn t'envoie faire tes armes sur les loups de la forêt d'Ashenvale.",
    giverNpc: 'greywatch_mentor',
    issuedBy: 'greywatch',
    track: 'onboarding',
    requires: null,
    flavorText:
      '"Tout aventurier commence par un premier tranchant. Va, et reviens en un seul morceau."',
    objectives: [
      {
        id: 'kill_wolves',
        type: 'kill',
        monsterId: 'ashwood_wolf',
        count: 3,
        label: 'Tuer 3 Ashwood Wolves',
      },
    ],
    reward: {
      gold: 20,
      reputationTokens: 0,
      equipment: { templateId: 'iron_sword', rarity: 'common' }, // arme de départ (épée basique)
    },
  },

  // 2 — S'équiper : apprendre à porter une arme.
  onb_well_armed: {
    id: 'onb_well_armed',
    name: 'Bien armé',
    description: 'Une lame au sac ne sert à rien. Équipe ton arme.',
    giverNpc: 'greywatch_mentor',
    issuedBy: 'greywatch',
    track: 'onboarding',
    requires: 'onb_first_edge',
    flavorText: '"Une arme, ça se porte, pas ça se contemple. Passe-la à la ceinture."',
    objectives: [
      {
        id: 'equip_weapon',
        type: 'equip',
        category: 'weapon',
        label: 'Équiper une arme',
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
    name: 'Se couvrir',
    description: 'Chasse les lièvres de feu et rapporte leur peau — de quoi te couvrir la tête.',
    giverNpc: 'greywatch_mentor',
    issuedBy: 'greywatch',
    track: 'onboarding',
    requires: 'onb_well_armed',
    flavorText: '"Une tête nue au combat, c\'est une tête de moins le lendemain."',
    objectives: [
      {
        id: 'kill_hares',
        type: 'kill',
        monsterId: 'thicket_hare',
        count: 5,
        label: 'Tuer 5 Fire Hares',
      },
      {
        id: 'collect_pelt',
        type: 'collect',
        resourceId: 'hare_pelt',
        count: 1,
        label: 'Récupérer 1 Hare Pelt',
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
    name: 'Recueillement',
    description: "Passe à l'église et recueille-toi devant les Anciens Dieux.",
    giverNpc: 'greywatch_mentor',
    issuedBy: 'greywatch',
    track: 'onboarding',
    requires: 'onb_cover_up',
    flavorText: '"Le fer garde le corps ; la prière garde le reste. Va t\'agenouiller."',
    objectives: [
      {
        id: 'pray_once',
        type: 'pray',
        count: 1,
        label: "Prier à l'église (×1)",
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
    name: 'Devoir de dévotion',
    description: 'Accepte un acte de dévotion auprès de Frère Caelum.',
    giverNpc: 'greywatch_mentor',
    issuedBy: 'greywatch',
    track: 'onboarding',
    requires: 'onb_recueillement',
    flavorText:
      "\"Prier, c'est bien. Servir, c'est mieux. Prends une œuvre au tableau de l'Église.\"",
    objectives: [
      {
        id: 'accept_deed',
        type: 'accept_deed',
        count: 1,
        label: 'Accepter un acte de dévotion (×1)',
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
    name: 'Première décoction',
    description: "À l'atelier d'alchimie, brasse ta première potion.",
    giverNpc: 'greywatch_mentor',
    issuedBy: 'greywatch',
    track: 'onboarding',
    requires: 'onb_devotion',
    flavorText: '"Un aventurier sans potion, c\'est un aventurier pressé de mourir. Au chaudron !"',
    objectives: [
      {
        id: 'brew_potion',
        type: 'craft',
        count: 1,
        outputKind: 'consumable',
        label: 'Brasser 1 potion (consommable)',
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
