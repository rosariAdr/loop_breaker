// BURN01/BURN02/BURN-G1 — burnout de monotonie (pur).
import { describe, it, expect } from 'vitest'
import {
  BURNOUT,
  actionCountsInWindow,
  evaluateBurnout,
  getBurnoutMalus,
  appendAction,
} from './burnout'

const many = (type, n, day = 1) => Array.from({ length: n }, () => ({ type, day }))

describe('BURN — burnout', () => {
  it('chiffrage BURN-G1', () => {
    expect(BURNOUT).toMatchObject({ windowDays: 4, threshold: 6, malus: 0.1, durationDays: 1 })
  })

  it('actionCountsInWindow : compte par type, exclut hors fenêtre', () => {
    expect(actionCountsInWindow([...many('combat', 2), { type: 'rest', day: 2 }], 3)).toEqual({
      combat: 2,
      rest: 1,
    })
    expect(actionCountsInWindow([{ type: 'combat', day: 1 }], 6)).toEqual({})
  })

  it('≥6 combats sans variété → malus aura ; ≥6 crafts → concentration', () => {
    expect(evaluateBurnout(many('combat', 6), 1)).toMatchObject({ stat: 'aura', malus: 0.1 })
    expect(evaluateBurnout(many('craft', 6), 1)?.stat).toBe('concentration')
  })

  it('exempt dès ≥2 activités distinctes', () => {
    expect(evaluateBurnout([...many('combat', 6), { type: 'rest', day: 1 }], 1)).toBeNull()
  })

  it('sous le seuil → pas de burnout', () => {
    expect(evaluateBurnout(many('combat', 5), 1)).toBeNull()
  })

  it('getBurnoutMalus : actif le jour même, expiré après la durée', () => {
    const w = { dayCount: 1, burnout: { stat: 'aura', malus: 0.1, day: 1 } }
    expect(getBurnoutMalus(w, 'aura')).toBe(0.1)
    expect(getBurnoutMalus(w, 'concentration')).toBe(0)
    expect(
      getBurnoutMalus({ dayCount: 2, burnout: { stat: 'aura', malus: 0.1, day: 1 } }, 'aura'),
    ).toBe(0)
    expect(getBurnoutMalus({ dayCount: 1, burnout: null }, 'aura')).toBe(0)
  })

  it('appendAction : ajoute, borne à la fenêtre et recalcule', () => {
    let world = { dayCount: 1, actionLog: [] }
    for (let i = 0; i < 6; i++) world = { ...world, ...appendAction(world, 'combat') }
    expect(world.actionLog).toHaveLength(6)
    expect(world.burnout?.stat).toBe('aura')
  })
})
