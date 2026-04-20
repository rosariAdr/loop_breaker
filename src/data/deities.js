// Les divinités du jeu
// POC : 2 divinités actives — Ignareth et Sylvara
// Les conditions d'éveil sont TOUJOURS cachées au joueur.

export const DEITIES = {
  ignareth: {
    id: 'ignareth',
    name: 'Ignareth',
    title: 'Lord of War and Fire',
    domain: ['war', 'fire'],
    alignment: 'chaotic',
    universe: 'medieval_fantasy',
    description: 'A fierce deity who favors the bold and the relentless. He takes notice of those who seek battle without hesitation.',
    color: '#c04040',
    sigil: '🔥',

    // Condition d'éveil — CACHÉE au joueur
    // Vérifiée en silence par le moteur de jeu
    awakeningCondition: {
      type: 'battles_in_days',
      battles: 20,
      days: 5,
      description: 'Win 20 battles within 5 in-game days',
    },

    // Bénédiction passive permanente (active dès l'éveil)
    blessing: {
      id: 'ignareth_blessing',
      name: "Ignareth's Blessing",
      description: 'The War God watches over you. Permanently increases Strength by 15%.',
      effect: { stat: 'strength', multiplier: 0.15 },
    },

    // Deux skills divins au choix lors de l'éveil
    divineSkillOptions: ['inferno_strike', 'battle_fury'],

    // Dialogues
    callMessage: "I have watched you, mortal. You do not flinch. You do not hesitate. Every battle, you threw yourself forward without regard for your own flesh. This... pleases me. I am Ignareth, Lord of War and Flame. Will you carry my fire into this world?",
    acceptMessage: "Then burn, warrior. Burn bright. Let your enemies know the name of my chosen.",
    refuseMessage: "...So be it. Walk your path alone. But do not forget — my fire still watches you.",
  },

  sylvara: {
    id: 'sylvara',
    name: 'Sylvara',
    title: 'Voice of Nature and Calm',
    domain: ['nature', 'calm', 'rest'],
    alignment: 'lawful',
    universe: 'medieval_fantasy',
    description: 'A serene deity who values preparation, patience, and respect for life. She takes notice of those who enter battle whole, never broken.',
    color: '#80c040',
    sigil: '🌿',

    // Condition d'éveil — CACHÉE au joueur
    awakeningCondition: {
      type: 'enter_combat_full_hp',
      times: 8,
      hpThreshold: 0.85, // 85% HP minimum
      consecutive: true,
      description: 'Enter combat with 85%+ HP, 8 times in a row',
    },

    // Bénédiction passive permanente
    blessing: {
      id: 'sylvara_blessing',
      name: "Sylvara's Blessing",
      description: 'Nature flows through you. Regenerate 2% max HP per action tick.',
      effect: { type: 'hp_regen_per_tick', value: 0.02 },
    },

    // Deux skills divins au choix
    divineSkillOptions: ['natures_veil', 'healing_bloom'],

    // Dialogues
    callMessage: "You come to me whole, mortal. Again and again, you have faced the darkness without letting it break you first. You understand what so many forget — that strength begins before the first blow. I am Sylvara. Will you walk under my canopy?",
    acceptMessage: "Then grow, child. Roots deep, branches wide. Let nothing uproot you.",
    refuseMessage: "The forest does not mourn those who leave it. Return if you change your mind.",
  },
}

// Divinités disponibles dans le POC
export const ACTIVE_DEITIES = ['ignareth', 'sylvara']

// Relations inter-divines : score symétrique -10 à +10
// Paliers : Ennemi (-10/-6) | Rival (-5/-1) | Neutre (0) | Allié (1/5) | Allié fort (6/10)
export const DIVINE_RELATIONS = {
  ignareth_sylvara: -3, // Rival — le feu et la nature s'opposent, mais se respectent
}

// Utilitaire : récupérer le score de relation entre deux dieux
export function getDivineRelation(deityIdA, deityIdB) {
  const key1 = `${deityIdA}_${deityIdB}`
  const key2 = `${deityIdB}_${deityIdA}`
  return DIVINE_RELATIONS[key1] ?? DIVINE_RELATIONS[key2] ?? 0
}

// Utilitaire : obtenir le palier de relation
export function getRelationTier(score) {
  if (score <= -6) return { label: 'Enemy', color: '#c04040' }
  if (score <= -1) return { label: 'Rival', color: '#c08040' }
  if (score === 0) return { label: 'Neutral', color: '#808080' }
  if (score <= 5) return { label: 'Allied', color: '#4080c0' }
  return { label: 'Strong Ally', color: '#40c080' }
}

// Vérifier la condition d'éveil d'Ignareth
export function checkIgnarethAwakening(worldState) {
  const { battleLog } = worldState
  if (!battleLog || battleLog.length < 20) return false

  // Chercher 20 victoires dans les 5 derniers jours in-game
  const currentDay = worldState.dayCount
  const recentWins = battleLog.filter(
    (entry) => entry.type === 'victory' && entry.day >= currentDay - 5
  )
  return recentWins.length >= 20
}

// Vérifier la condition d'éveil de Sylvara
export function checkSylvaraAwakening(worldState) {
  const { combatEntryLog } = worldState
  if (!combatEntryLog || combatEntryLog.length < 8) return false

  // Les 8 dernières entrées en combat doivent avoir été à 85%+ HP
  const lastEight = combatEntryLog.slice(-8)
  return lastEight.every((entry) => entry.hpPercent >= 0.85)
}
