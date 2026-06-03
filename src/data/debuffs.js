// CRF01 — Debuffs (malus passifs temporaires, mesurés en jours)
// Appliqués surtout par les ratés de crafting (CRF02/CRF03). Réduisent une stat
// du héros tant qu'ils sont actifs. La plupart durent 7 jours ; certains ratés
// catastrophiques posent un debuff PERMANENT (à soigner via antidote — CRF06).
//
// Structure d'un debuff actif sur le héros (hero.activeDebuffs[]) :
// { debuffId, permanent: bool, duration: { type: 'days', remaining: N | null } }

export const DEBUFFS = {
  burnt_hands: {
    id: 'burnt_hands',
    name: 'Burnt Hands',
    icon: '🔥',
    stat: 'strength',
    reduction: 0.10, // STR −10%
    description: 'Scorched hands from a botched forging. Strength is reduced.',
  },
  poisoned: {
    id: 'poisoned',
    name: 'Poisoned',
    icon: '🤢',
    stat: 'maxHp',
    reduction: 0.15, // HPmax −15%
    description: 'Toxic fumes linger in your blood. Maximum HP is reduced.',
  },
  fatigue: {
    id: 'fatigue',
    name: 'Fatigue',
    icon: '😩',
    stat: 'agility',
    reduction: 0.20, // AGI −20%
    description: 'Exhaustion dulls your reflexes. Agility is reduced.',
  },
  black_smoke: {
    id: 'black_smoke',
    name: 'Black Smoke',
    icon: '💨',
    stat: 'chance',
    reduction: 0.25, // Chance −25%
    description: 'A cloud of ill omen clings to you. Luck is reduced.',
  },
}

export function getDebuff(id) {
  return DEBUFFS[id] ?? null
}
