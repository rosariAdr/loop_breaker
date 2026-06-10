// BSS01/02/03 — Tests des mécaniques de boss
import { describe, it, expect } from 'vitest'
import {
  getMalacharPhase,
  getCryptKeeperEnrage,
  rollCursedStrike,
  getBossMechanicType,
  CURSED_STRIKE_EFFECT,
} from './bossMechanics'

describe('BSS03 — getMalacharPhase', () => {
  it('phase 1 au-dessus de 60% HP', () => {
    const p = getMalacharPhase(1.0)
    expect(p.phase).toBe(1)
    expect(p.atkMult).toBe(1.0)
    expect(p.soulDrainPct).toBe(0)
  })
  it('phase 2 à ≤60% (Rage +50% ATK)', () => {
    const p = getMalacharPhase(0.6)
    expect(p.phase).toBe(2)
    expect(p.atkMult).toBe(1.5)
    expect(p.healImmune).toBe(true)
  })
  it('phase 3 à ≤30% (Soul Drain 15%)', () => {
    const p = getMalacharPhase(0.3)
    expect(p.phase).toBe(3)
    expect(p.soulDrainPct).toBeCloseTo(0.15)
    expect(p.atkMult).toBe(1.5)
  })
  it('transitions aux bornes exactes', () => {
    expect(getMalacharPhase(0.61).phase).toBe(1)
    expect(getMalacharPhase(0.31).phase).toBe(2)
  })
})

describe('BSS01 — getCryptKeeperEnrage', () => {
  it('pas d’enrage au-dessus de 50% HP', () => {
    expect(getCryptKeeperEnrage(0.8, false).trigger).toBe(false)
    expect(getCryptKeeperEnrage(0.8, false).atkMult).toBe(1.0)
  })
  it('déclenche l’enrage à ≤50% (une fois)', () => {
    const e = getCryptKeeperEnrage(0.5, false)
    expect(e.trigger).toBe(true)
    expect(e.atkMult).toBe(1.4)
  })
  it('ne re-déclenche pas si déjà enragé mais garde le bonus', () => {
    const e = getCryptKeeperEnrage(0.3, true)
    expect(e.trigger).toBe(false)
    expect(e.atkMult).toBe(1.4)
  })
})

describe('BSS02 — rollCursedStrike', () => {
  it('vrai si rng < chance', () => {
    expect(rollCursedStrike(0.4, () => 0.1)).toBe(true)
    expect(rollCursedStrike(0.4, () => 0.9)).toBe(false)
  })
  it('CURSED_STRIKE_EFFECT réduit la STR de 20% sur 2 tours', () => {
    expect(CURSED_STRIKE_EFFECT).toMatchObject({ type: 'atk_down', duration: 2, reduction: 0.2 })
  })
})

describe('getBossMechanicType', () => {
  it('retourne le type ou null', () => {
    expect(getBossMechanicType({ bossMechanics: { type: 'phases' } })).toBe('phases')
    expect(getBossMechanicType({})).toBeNull()
    expect(getBossMechanicType(null)).toBeNull()
  })
})
