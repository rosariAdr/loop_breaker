// REFAC03 — constantes partagées extraites de Combat.jsx (refacto pur, aucun changement de valeur).

// B05 — icône + libellé par type d'effet de statut (cf. DESIGN.md §B05-SPEC)
export const STATUS_META = {
  poison: { icon: '🟢', label: 'Poison' },
  burn: { icon: '🔥', label: 'Burn' },
  stun: { icon: '💫', label: 'Stun' },
  frozen: { icon: '🧊', label: 'Frozen' }, // SKD-ICE01/FROZEN — skin glace de stun (saute-tour)
  slow: { icon: '🐌', label: 'Slow' },
  defense_break: { icon: '🛡️', label: 'Defense Break' },
  atk_down: { icon: '⬇️', label: 'Attack Down' },
  max_hp_reduction: { icon: '💔', label: 'Max HP Down' },
  all_stats_down: { icon: '🌀', label: 'All Stats Down' },
}

// Emoji par type de monstre
export const MONSTER_EMOJI = {
  ashwood_wolf: '🐺',
  // MON01 — bestiaire de surface refondu
  thicket_hare: '🐇',
  tuskmaw_boar: '🐗',
  old_oakheart: '🌳',
  mire_slime: '🫧',
  fenrot_devourer: '🐊',
  graven_sentinel: '⚔️',
  hill_slime: '🟩',
  russet_fox: '🦊',
  knoll_goblin: '👺',
  thunderhoof: '🦬',
  // anciens (réserve / supprimés — fallback conservé)
  rotting_shambler: '🧟',
  gloom_bat: '🦇',
  marsh_serpent: '🐍',
  briar_wraith: '👻',
  bog_shambler: '🧌',
  stone_golem: '🗿',
  hollow_knight: '🤺',
  ruin_specter: '💀',
  barrow_wight: '☠️',
  grave_knight: '⚔️',
  soul_harvester: '👁️',
  cursed_warlord: '👹',
  bone_colossus: '🦴',
  grimstone_troll: '🧌',
  cursed_sentinel: '🛡️',
  abyssal_hound: '🐕',
  wyvern_scout: '🐉',
  plague_monk: '☣️',
  iron_wraith: '⚙️',
  hollow_crypt_boss: '💀',
  forsaken_citadel_boss: '👑',
  malachar: '😈',
  default: '👹',
}

// Gradient d'arène par spot de chasse
export const ARENA_BACKGROUNDS = {
  ashenvale_forest: 'radial-gradient(ellipse at 50% 0%, #0a1208 0%, #070d08 60%, #050808 100%)',
  thornmarsh: 'radial-gradient(ellipse at 50% 0%, #08100e 0%, #060c0a 60%, #060808 100%)',
  crumbled_ruins: 'radial-gradient(ellipse at 50% 0%, #100a12 0%, #0c0810 60%, #080808 100%)',
  wildmere_hills: 'radial-gradient(ellipse at 50% 0%, #0a1008 0%, #081008 60%, #060806 100%)',
  blighted_road: 'radial-gradient(ellipse at 50% 0%, #160808 0%, #100606 60%, #080606 100%)',
  grimspire: 'radial-gradient(ellipse at 50% 0%, #100812 0%, #0c0810 60%, #080608 100%)',
  default: 'radial-gradient(ellipse at 50% 0%, #0a0810 0%, #080808 60%, #060608 100%)',
}

export const RANK_BADGE = {
  elite: { label: 'ELITE', color: '#ffb84d', bg: '#2a1400', border: '#6a3800' },
  boss: { label: 'BOSS', color: '#e080ff', bg: '#200828', border: '#602090' },
  demon_lord: { label: 'DEMON LORD', color: '#ff5050', bg: '#2a0808', border: '#882020' },
}

// B07 — couleurs / préfixe des nombres flottants
export const FLOATING_COLORS = {
  damage: { color: '#ff6040', prefix: '-' },
  skill: { color: '#c084fc', prefix: '-' },
  heal: { color: '#40d080', prefix: '+' },
  mana: { color: '#40a0f0', prefix: '+' },
  levelup: { color: '#f0c040', prefix: '✦ ' }, // S04
}

// UX-COMBATLOG01 — couleur du log par type d'entrée
export const LOG_COLORS = {
  victory: '#80d040',
  defeat: '#e04040',
  player: '#d4af70',
  enemy: '#d06040',
  skill: '#c084fc',
  heal: '#40c880',
  drop: '#f0d060',
  mana: '#40a0f0',
  system: '#708070',
  info: '#6a5a4a',
  levelup: '#f0c040', // S04
}

// B05 — construit l'instance d'effet à appliquer depuis le template d'un skill,
// en intégrant les bonus de niveau (tickDamageBonus, etc.).
export function buildStatusEffectInstance(statusEffect, level = 1, levelBonuses = {}) {
  // SKL01 — anti-régression au-delà du dernier palier défini (skills jusqu'à Lv5)
  const _defined = Object.keys(levelBonuses).map(Number)
  const _lvKey = _defined.length && level > Math.max(..._defined) ? Math.max(..._defined) : level
  const bonus = levelBonuses[_lvKey] ?? {}
  return {
    id: `${statusEffect.type}_${Date.now()}_${Math.random()}`,
    type: statusEffect.type,
    duration: statusEffect.duration + (bonus.durationBonus ?? 0),
    ...(statusEffect.tickDamage != null && {
      tickDamage: statusEffect.tickDamage + (bonus.tickDamageBonus ?? 0),
    }),
    ...(statusEffect.reduction != null && {
      reduction: statusEffect.reduction + (bonus.reductionBonus ?? 0),
    }),
  }
}
