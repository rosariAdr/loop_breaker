// Tous les skills du jeu
// Les skills droppables viennent des monstres.
// Les skills divins sont obtenus via l'éveil d'une divinité.
//
// Structure d'un skill :
// {
//   id, name, description,
//   type: 'active' | 'passive',
//   cost: { mana, hp, stat_sacrifice },
//   cooldown,           // en tours (0 = pas de cooldown)
//   effect: {},         // données brutes utilisées par le moteur de combat
//   level: 1,           // niveau actuel (1 par défaut à la création)
//   xpToNext: [20, 50], // XP requis pour passer au niveau 2, puis 3
//   sourceMonster,      // id du monstre source (null pour les skills divins)
//   container,          // 'mana_stone' | 'divine' | 'supreme'
//   inheritable,        // true par défaut ; false pour les skills divins non évolués
// }

export const SKILLS = {
  // ── Skills de monstres communs (Ashenvale) ───────────────────────────

  savage_bite: {
    id: 'savage_bite',
    name: 'Savage Bite',
    description: 'A ferocious bite that tears through flesh. Deals physical damage.',
    type: 'active',
    cost: { mana: 15, hp: 0, stat_sacrifice: null },
    cooldown: 2,
    effect: {
      damage: { type: 'physical', multiplier: 1.4 }, // 140% STR
    },
    xpToNext: [20, 50],
    sourceMonster: 'ashwood_wolf',
    container: 'mana_stone',
    inheritable: true,
    levelBonuses: {
      2: { multiplierBonus: 0.30, costReduction: 0.10 },
      3: { multiplierBonus: 0.60, costReduction: 0.20 },
    },
  },

  putrid_slam: {
    id: 'putrid_slam',
    name: 'Putrid Slam',
    description: 'A rotting fist slam that poisons the target for 2 turns.',
    type: 'active',
    cost: { mana: 12, hp: 0, stat_sacrifice: null },
    cooldown: 3,
    effect: {
      damage: { type: 'physical', multiplier: 1.2 },
      statusEffect: { type: 'poison', duration: 2, tickDamage: 5 },
    },
    xpToNext: [20, 50],
    sourceMonster: 'rotting_shambler',
    container: 'mana_stone',
    inheritable: true,
    levelBonuses: {
      2: { multiplierBonus: 0.30, costReduction: 0.10, tickDamageBonus: 3 },
      3: { multiplierBonus: 0.60, costReduction: 0.20, tickDamageBonus: 6 },
    },
  },

  spectral_veil: {
    id: 'spectral_veil',
    name: 'Spectral Veil',
    description: 'Passive ghostly aura that grants a 15% chance to dodge attacks.',
    type: 'passive',
    cost: { mana: 0, hp: 0, stat_sacrifice: null },
    cooldown: 0,
    effect: {
      dodgeChance: 0.15,
    },
    xpToNext: [20, 50],
    sourceMonster: 'briar_wraith',
    container: 'mana_stone',
    inheritable: true,
    levelBonuses: {
      2: { dodgeBonus: 0.08 },
      3: { dodgeBonus: 0.16 },
    },
  },

  stone_skin: {
    id: 'stone_skin',
    name: 'Stone Skin',
    description: 'Passive stone-hard skin that permanently reduces incoming damage by 10%.',
    type: 'passive',
    cost: { mana: 0, hp: 0, stat_sacrifice: null },
    cooldown: 0,
    effect: {
      damageReduction: 0.10,
    },
    xpToNext: [20, 50],
    sourceMonster: 'stone_golem',
    container: 'mana_stone',
    inheritable: true,
    levelBonuses: {
      2: { reductionBonus: 0.08 },
      3: { reductionBonus: 0.16 },
    },
  },

  venom_bite: {
    id: 'venom_bite',
    name: 'Venom Bite',
    description: 'A venomous strike that deals damage and inflicts poison for 3 turns.',
    type: 'active',
    cost: { mana: 18, hp: 0, stat_sacrifice: null },
    cooldown: 3,
    effect: {
      damage: { type: 'physical', multiplier: 1.1 },
      statusEffect: { type: 'poison', duration: 3, tickDamage: 8 },
    },
    xpToNext: [20, 50],
    sourceMonster: 'marsh_serpent',
    container: 'mana_stone',
    inheritable: true,
    levelBonuses: {
      2: { multiplierBonus: 0.30, costReduction: 0.10, tickDamageBonus: 4 },
      3: { multiplierBonus: 0.60, costReduction: 0.20, tickDamageBonus: 8 },
    },
  },

  iron_resolve: {
    id: 'iron_resolve',
    name: 'Iron Resolve',
    description: 'Passive ironclad will that permanently increases DEF by 20%.',
    type: 'passive',
    cost: { mana: 0, hp: 0, stat_sacrifice: null },
    cooldown: 0,
    effect: {
      defBonus: 0.20,
    },
    xpToNext: [20, 50],
    sourceMonster: 'hollow_knight',
    container: 'mana_stone',
    inheritable: true,
    levelBonuses: {
      2: { defBonusBonus: 0.10 },
      3: { defBonusBonus: 0.20 },
    },
  },

  // ── Skills de Sir Aldric (entraîneur de Millhaven) ───────────────────

  power_strike: {
    id: 'power_strike',
    name: 'Power Strike',
    description: 'A focused blow that channels your full strength. Deals 160% STR as physical damage.',
    type: 'active',
    cost: { mana: 20, hp: 0, stat_sacrifice: null },
    cooldown: 2,
    effect: {
      damage: { type: 'physical', multiplier: 1.6 },
    },
    xpToNext: [20, 50],
    sourceMonster: null,
    container: 'mana_stone',
    inheritable: true,
    levelBonuses: {
      2: { multiplierBonus: 0.30, costReduction: 0.10 },
      3: { multiplierBonus: 0.60, costReduction: 0.20 },
    },
  },

  shield_stance: {
    id: 'shield_stance',
    name: 'Shield Stance',
    description: 'Adopt a defensive stance, increasing your DEF by 50% for 2 turns.',
    type: 'active',
    cost: { mana: 15, hp: 0, stat_sacrifice: null },
    cooldown: 3,
    effect: {
      selfBuff: { stat: 'def', multiplier: 0.50, duration: 2 },
    },
    xpToNext: [20, 50],
    sourceMonster: null,
    container: 'mana_stone',
    inheritable: true,
    levelBonuses: {
      2: { buffBonus: 0.20, costReduction: 0.10 },
      3: { buffBonus: 0.40, costReduction: 0.20 },
    },
  },

  battle_focus: {
    id: 'battle_focus',
    name: 'Battle Focus',
    description: 'Passive veteran focus that permanently increases STR by 15%.',
    type: 'passive',
    cost: { mana: 0, hp: 0, stat_sacrifice: null },
    cooldown: 0,
    effect: {
      strBonus: 0.15,
    },
    xpToNext: [20, 50],
    sourceMonster: null,
    container: 'mana_stone',
    inheritable: true,
    levelBonuses: {
      2: { strBonusBonus: 0.10 },
      3: { strBonusBonus: 0.20 },
    },
  },

  counter_strike: {
    id: 'counter_strike',
    name: 'Counter Strike',
    description: 'Enter a ready stance for 3 turns. Each time you are hit, 35% chance to counter for 80% ATK.',
    type: 'active',
    cost: { mana: 18, hp: 0, stat_sacrifice: null },
    cooldown: 4,
    effect: {
      selfBuff: { type: 'counter_stance', counterChance: 0.35, counterMultiplier: 0.80, duration: 3 },
    },
    xpToNext: [20, 50],
    sourceMonster: null,
    container: 'mana_stone',
    inheritable: true,
    levelBonuses: {
      2: { counterChanceBonus: 0.10, costReduction: 0.10 },
      3: { counterChanceBonus: 0.20, costReduction: 0.20 },
    },
  },

  veterans_resolve: {
    id: 'veterans_resolve',
    name: "Veteran's Resolve",
    description: "Passive hardened constitution that permanently increases max HP by 20%.",
    type: 'passive',
    cost: { mana: 0, hp: 0, stat_sacrifice: null },
    cooldown: 0,
    effect: {
      maxHpBonus: 0.20,
    },
    xpToNext: [20, 50],
    sourceMonster: null,
    container: 'mana_stone',
    inheritable: true,
    levelBonuses: {
      2: { maxHpBonusBonus: 0.10 },
      3: { maxHpBonusBonus: 0.20 },
    },
  },

  cleave: {
    id: 'cleave',
    name: 'Cleave',
    description: 'A wide sweeping slash that hits all enemies for 80% STR as physical damage.',
    type: 'active',
    cost: { mana: 25, hp: 0, stat_sacrifice: null },
    cooldown: 3,
    effect: {
      damage: { type: 'physical', multiplier: 0.8 },
      aoe: true,
    },
    xpToNext: [20, 50],
    sourceMonster: null,
    container: 'mana_stone',
    inheritable: true,
    levelBonuses: {
      2: { multiplierBonus: 0.20, costReduction: 0.10 },
      3: { multiplierBonus: 0.40, costReduction: 0.20 },
    },
  },

  // ── Skills élites (Blighted Road) ────────────────────────────────────

  cursed_blade: {
    id: 'cursed_blade',
    name: 'Cursed Blade',
    description: 'A cursed slash that deals heavy physical damage and reduces enemy DEF for 2 turns.',
    type: 'active',
    cost: { mana: 25, hp: 0, stat_sacrifice: null },
    cooldown: 3,
    effect: {
      damage: { type: 'physical', multiplier: 1.8 },
      statusEffect: { type: 'defense_break', duration: 2, reduction: 0.25 },
    },
    xpToNext: [20, 50],
    sourceMonster: 'cursed_warlord',
    container: 'mana_stone',
    inheritable: true,
    levelBonuses: {
      2: { multiplierBonus: 0.30, costReduction: 0.10 },
      3: { multiplierBonus: 0.60, costReduction: 0.20 },
    },
  },

  bone_crush: {
    id: 'bone_crush',
    name: 'Bone Crush',
    description: 'A devastating crushing blow that deals massive physical damage.',
    type: 'active',
    cost: { mana: 30, hp: 0, stat_sacrifice: null },
    cooldown: 4,
    effect: {
      damage: { type: 'physical', multiplier: 2.2 },
    },
    xpToNext: [20, 50],
    sourceMonster: 'bone_colossus',
    container: 'mana_stone',
    inheritable: true,
    levelBonuses: {
      2: { multiplierBonus: 0.30, costReduction: 0.10 },
      3: { multiplierBonus: 0.60, costReduction: 0.20 },
    },
  },

  // ── Skills de monstres communs (Grimspire) ───────────────────────────

  troll_regeneration: {
    id: 'troll_regeneration',
    name: 'Troll Regeneration',
    description: 'Passive regeneration that restores 3% max HP at the start of each turn.',
    type: 'passive',
    cost: { mana: 0, hp: 0, stat_sacrifice: null },
    cooldown: 0,
    effect: {
      regenPerTurn: 0.03,
    },
    xpToNext: [20, 50],
    sourceMonster: 'grimstone_troll',
    container: 'mana_stone',
    inheritable: true,
    levelBonuses: {
      2: { regenBonus: 0.02 },
      3: { regenBonus: 0.04 },
    },
  },

  sentinel_watch: {
    id: 'sentinel_watch',
    name: 'Sentinel Watch',
    description: 'Passive vigilance that grants a 20% chance to counter-attack when hit.',
    type: 'passive',
    cost: { mana: 0, hp: 0, stat_sacrifice: null },
    cooldown: 0,
    effect: {
      counterChance: 0.20,
      counterMultiplier: 0.50,
    },
    xpToNext: [20, 50],
    sourceMonster: 'cursed_sentinel',
    container: 'mana_stone',
    inheritable: true,
    levelBonuses: {
      2: { counterChanceBonus: 0.10 },
      3: { counterChanceBonus: 0.20 },
    },
  },

  abyss_howl: {
    id: 'abyss_howl',
    name: 'Abyss Howl',
    description: 'A terrifying howl that reduces all enemies ATK by 20% for 3 turns.',
    type: 'active',
    cost: { mana: 22, hp: 0, stat_sacrifice: null },
    cooldown: 4,
    effect: {
      aoe: true,
      statusEffect: { type: 'atk_down', duration: 3, reduction: 0.20 },
    },
    xpToNext: [20, 50],
    sourceMonster: 'abyssal_hound',
    container: 'mana_stone',
    inheritable: true,
    levelBonuses: {
      2: { reductionBonus: 0.10, costReduction: 0.10 },
      3: { reductionBonus: 0.20, costReduction: 0.20 },
    },
  },

  wing_gust: {
    id: 'wing_gust',
    name: 'Wing Gust',
    description: 'A powerful wing strike that deals magic damage to all enemies.',
    type: 'active',
    cost: { mana: 28, hp: 0, stat_sacrifice: null },
    cooldown: 3,
    effect: {
      damage: { type: 'magical', multiplier: 1.3 },
      aoe: true,
    },
    xpToNext: [20, 50],
    sourceMonster: 'wyvern_scout',
    container: 'mana_stone',
    inheritable: true,
    levelBonuses: {
      2: { multiplierBonus: 0.30, costReduction: 0.10 },
      3: { multiplierBonus: 0.60, costReduction: 0.20 },
    },
  },

  plague_aura: {
    id: 'plague_aura',
    name: 'Plague Aura',
    description: 'Passive plague aura that poisons all attackers for 1 turn when hit.',
    type: 'passive',
    cost: { mana: 0, hp: 0, stat_sacrifice: null },
    cooldown: 0,
    effect: {
      onHitPoison: { duration: 1, tickDamage: 10 },
    },
    xpToNext: [20, 50],
    sourceMonster: 'plague_monk',
    container: 'mana_stone',
    inheritable: true,
    levelBonuses: {
      2: { tickDamageBonus: 5 },
      3: { tickDamageBonus: 10 },
    },
  },

  iron_shroud: {
    id: 'iron_shroud',
    name: 'Iron Shroud',
    description: 'Active iron shroud that absorbs the next attack completely (1 turn).',
    type: 'active',
    cost: { mana: 20, hp: 0, stat_sacrifice: null },
    cooldown: 5,
    effect: {
      shield: { type: 'absorb_next', duration: 1 },
    },
    xpToNext: [20, 50],
    sourceMonster: 'iron_wraith',
    container: 'mana_stone',
    inheritable: true,
    levelBonuses: {
      2: { costReduction: 0.10, cooldownReduction: 1 },
      3: { costReduction: 0.20, cooldownReduction: 1 },
    },
  },

  // ── Skills de boss donjons ────────────────────────────────────────────

  soul_crush: {
    id: 'soul_crush',
    name: 'Soul Crush',
    description: 'A devastating soul-rending attack dealing heavy magical damage and reducing max HP by 10% for 3 turns.',
    type: 'active',
    cost: { mana: 40, hp: 10, stat_sacrifice: null },
    cooldown: 4,
    effect: {
      damage: { type: 'magical', multiplier: 2.5 },
      statusEffect: { type: 'max_hp_reduction', duration: 3, reduction: 0.10 },
    },
    xpToNext: [20, 50],
    sourceMonster: 'hollow_crypt_boss',
    container: 'mana_stone',
    inheritable: true,
    levelBonuses: {
      2: { multiplierBonus: 0.30, costReduction: 0.10 },
      3: { multiplierBonus: 0.60, costReduction: 0.20 },
    },
  },

  forsaken_curse: {
    id: 'forsaken_curse',
    name: 'Forsaken Curse',
    description: 'A dark curse that halves all enemy stats for 2 turns.',
    type: 'active',
    cost: { mana: 50, hp: 0, stat_sacrifice: null },
    cooldown: 5,
    effect: {
      aoe: true,
      statusEffect: { type: 'all_stats_down', duration: 2, reduction: 0.50 },
    },
    xpToNext: [20, 50],
    sourceMonster: 'forsaken_citadel_boss',
    container: 'mana_stone',
    inheritable: true,
    levelBonuses: {
      2: { costReduction: 0.10, durationBonus: 1 },
      3: { costReduction: 0.20, durationBonus: 1 },
    },
  },

  // ── Skills divins — Ignareth ──────────────────────────────────────────

  inferno_strike: {
    id: 'inferno_strike',
    name: 'Inferno Strike',
    description: 'A blazing strike empowered by Ignareth. Deals 150% STR as fire damage.',
    type: 'active',
    cost: { mana: 30, hp: 0, stat_sacrifice: null },
    cooldown: 3,
    effect: {
      damage: { type: 'fire', multiplier: 1.5, baseStat: 'strength' },
    },
    xpToNext: [20, 50],
    sourceMonster: null,
    container: 'divine',
    inheritable: false, // héritable uniquement si niveau 2+
    levelBonuses: {
      2: { multiplierBonus: 0.30, costReduction: 0.10 },
      3: { multiplierBonus: 0.60, costReduction: 0.20 },
    },
  },

  battle_fury: {
    id: 'battle_fury',
    name: 'Battle Fury',
    description: "Ignareth's war blessing. Increases ATK by 50% for 3 turns.",
    type: 'active',
    cost: { mana: 0, hp: 20, stat_sacrifice: null },
    cooldown: 5,
    effect: {
      selfBuff: { stat: 'atk', multiplier: 0.50, duration: 3 },
    },
    xpToNext: [20, 50],
    sourceMonster: null,
    container: 'divine',
    inheritable: false,
    levelBonuses: {
      2: { buffBonus: 0.20, costReduction: 0.10 },
      3: { buffBonus: 0.40, costReduction: 0.20 },
    },
  },

  // ── Skills divins — Sylvara ───────────────────────────────────────────

  natures_veil: {
    id: 'natures_veil',
    name: "Nature's Veil",
    description: "Sylvara's protective veil. Reduces all incoming damage by 40% for 2 turns.",
    type: 'active',
    cost: { mana: 25, hp: 0, stat_sacrifice: null },
    cooldown: 4,
    effect: {
      selfBuff: { type: 'damage_reduction', value: 0.40, duration: 2 },
    },
    xpToNext: [20, 50],
    sourceMonster: null,
    container: 'divine',
    inheritable: false,
    levelBonuses: {
      2: { reductionBonus: 0.15, costReduction: 0.10 },
      3: { reductionBonus: 0.30, costReduction: 0.20 },
    },
  },

  healing_bloom: {
    id: 'healing_bloom',
    name: 'Healing Bloom',
    description: "Nature's gift from Sylvara. Restores 30% of max HP.",
    type: 'active',
    cost: { mana: 35, hp: 0, stat_sacrifice: null },
    cooldown: 5,
    effect: {
      heal: { type: 'percentage', value: 0.30 },
    },
    xpToNext: [20, 50],
    sourceMonster: null,
    container: 'divine',
    inheritable: false,
    levelBonuses: {
      2: { healBonus: 0.15, costReduction: 0.10 },
      3: { healBonus: 0.30, costReduction: 0.20 },
    },
  },

  // ── Skills divins — Voltaris (DV04) ───────────────────────────────────
  chain_lightning: {
    id: 'chain_lightning',
    name: 'Chain Lightning',
    description: "Voltaris's bolt. Deals 120% INT and arcs to a second enemy.",
    type: 'active',
    cost: { mana: 28, hp: 0, stat_sacrifice: null },
    cooldown: 3,
    effect: {
      damage: { type: 'lightning', multiplier: 1.2, baseStat: 'intelligence' },
      aoe: true, // arc vers les autres ennemis
    },
    xpToNext: [20, 50],
    sourceMonster: null,
    container: 'divine',
    inheritable: false,
    levelBonuses: {
      2: { multiplierBonus: 0.30, costReduction: 0.10 },
      3: { multiplierBonus: 0.60, costReduction: 0.20 },
    },
  },
  overclock: {
    id: 'overclock',
    name: 'Overclock',
    description: "Voltaris's gift of momentum. +80% speed for 2 turns.",
    type: 'active',
    cost: { mana: 25, hp: 0, stat_sacrifice: null },
    cooldown: 4,
    effect: {
      selfBuff: { stat: 'agility', multiplier: 0.80, duration: 2 },
    },
    xpToNext: [20, 50],
    sourceMonster: null,
    container: 'divine',
    inheritable: false,
    levelBonuses: {
      2: { buffBonus: 0.20, costReduction: 0.10 },
      3: { buffBonus: 0.40, costReduction: 0.20 },
    },
  },

  // ── Skill suprême — Demon Lord ────────────────────────────────────────

  soul_rend: {
    id: 'soul_rend',
    name: 'Soul Rend',
    description: "Malachar's supreme technique. Tears the enemy's soul, dealing 300% INT as true damage that ignores all defenses.",
    type: 'active',
    cost: { mana: 60, hp: 30, stat_sacrifice: null },
    cooldown: 5,
    effect: {
      damage: { type: 'true', multiplier: 3.0, baseStat: 'intelligence' },
      ignoresDefense: true,
    },
    xpToNext: [20, 50],
    sourceMonster: 'malachar',
    container: 'supreme',
    inheritable: true, // toujours héritable, transgresse la règle normale
    levelBonuses: {
      2: { multiplierBonus: 0.50, costReduction: 0.10 },
      3: { multiplierBonus: 1.00, costReduction: 0.20 },
    },
  },
}

// Utilitaire : calculer les stats d'un skill selon son niveau actuel
export function getSkillStats(skillId, level) {
  const base = SKILLS[skillId]
  if (!base) return null
  if (level === 1) return { ...base }

  const bonuses = base.levelBonuses[level] || {}
  return { ...base, _levelBonuses: bonuses, level }
}

// Vérifier si un skill divin est héritable
export function isDivineSkillInheritable(skill) {
  if (skill.container !== 'divine') return skill.inheritable
  return skill.level >= 2
}
