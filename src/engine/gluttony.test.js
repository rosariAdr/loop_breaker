// GLT01-04 — Tests du moteur Gluttony
import { describe, it, expect } from 'vitest'
import {
  rollGluttonyProc,
  pickGluttonyStat,
  gluttonyAbsorbAmount,
  isGluttonyReady,
  gluttonyDaysRemaining,
  hasGluttony,
  GLUTTONY_STATS,
} from './gluttony'

describe('GLT01 — rollGluttonyProc', () => {
  it('proc si rng < 0.10', () => {
    expect(rollGluttonyProc(() => 0.05)).toBe(true)
    expect(rollGluttonyProc(() => 0.5)).toBe(false)
  })
})

describe('GLT01 — pickGluttonyStat', () => {
  it('retourne une stat valide', () => {
    expect(GLUTTONY_STATS).toContain(pickGluttonyStat(() => 0))
    expect(GLUTTONY_STATS).toContain(pickGluttonyStat(() => 0.99))
  })
})

describe('GLT01 — gluttonyAbsorbAmount', () => {
  it('10% de l’atk du monstre, min 1', () => {
    expect(gluttonyAbsorbAmount({ baseStats: { atk: 22 } })).toBe(2)
    expect(gluttonyAbsorbAmount({ baseStats: { atk: 90 } })).toBe(9)
    expect(gluttonyAbsorbAmount({ baseStats: { atk: 3 } })).toBe(1) // min 1
    expect(gluttonyAbsorbAmount(null)).toBe(1)
  })
})

describe('GLT03 — cooldown', () => {
  it('prête si jamais utilisée', () => {
    expect(isGluttonyReady(10, null)).toBe(true)
    expect(gluttonyDaysRemaining(10, null)).toBe(0)
  })
  it('en cooldown pendant 5 jours', () => {
    expect(isGluttonyReady(12, 10)).toBe(false)  // 2 jours écoulés
    expect(gluttonyDaysRemaining(12, 10)).toBe(3)
    expect(isGluttonyReady(15, 10)).toBe(true)   // 5 jours écoulés
    expect(gluttonyDaysRemaining(15, 10)).toBe(0)
  })
})

describe('hasGluttony', () => {
  it('détecte le passif équipé', () => {
    expect(hasGluttony([{ skillId: 'gluttony' }])).toBe(true)
    expect(hasGluttony([{ skillId: 'stone_skin' }])).toBe(false)
    expect(hasGluttony([])).toBe(false)
  })
})
