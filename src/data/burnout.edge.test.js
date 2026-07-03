// BURN01/BURN02/BURN-G1 — burnout de monotonie (pur) : cas limites / branches manquantes.
import { describe, it, expect } from 'vitest'
import {
  BURNOUT,
  ACTION_TYPES,
  actionCountsInWindow,
  evaluateBurnout,
  getBurnoutMalus,
  appendAction,
} from './burnout'

const many = (type, n, day = 1) => Array.from({ length: n }, () => ({ type, day }))

describe('BURN edge — actionCountsInWindow', () => {
  it('exclut une action pile à windowDays (borne stricte < windowDays)', () => {
    // currentDay - day = 4 = windowDays → exclu (strict <)
    expect(actionCountsInWindow([{ type: 'combat', day: 1 }], 5)).toEqual({})
    // currentDay - day = 3 < 4 → inclus
    expect(actionCountsInWindow([{ type: 'combat', day: 1 }], 4)).toEqual({ combat: 1 })
  })

  it('une action sans day utilise ?? 0', () => {
    // day manquant → 0 ; currentDay 3 → 3 - 0 = 3 < 4 → inclus
    expect(actionCountsInWindow([{ type: 'combat' }], 3)).toEqual({ combat: 1 })
    // currentDay 4 → 4 - 0 = 4 = windowDays → exclu
    expect(actionCountsInWindow([{ type: 'combat' }], 4)).toEqual({})
  })

  it('respecte un windowDays custom', () => {
    const log = [
      { type: 'combat', day: 1 },
      { type: 'combat', day: 5 },
      { type: 'combat', day: 9 },
    ]
    // window 1 : seul day 10-9=1 est exclu (1 = window), day 9 exclu, aucune ancienne
    expect(actionCountsInWindow(log, 10, 1)).toEqual({})
    // window 2 : day 9 (10-9=1 < 2) inclus, day 5/1 exclus
    expect(actionCountsInWindow(log, 10, 2)).toEqual({ combat: 1 })
    // window 100 : tout inclus
    expect(actionCountsInWindow(log, 10, 100)).toEqual({ combat: 3 })
  })

  it('log par défaut vide → objet vide', () => {
    expect(actionCountsInWindow()).toEqual({})
    expect(actionCountsInWindow(undefined, 5)).toEqual({})
  })

  it('currentDay par défaut = 1', () => {
    expect(actionCountsInWindow([{ type: 'combat', day: 1 }])).toEqual({ combat: 1 })
    // day 0 avec currentDay défaut 1 → 1 - 0 = 1 < 4 → inclus
    expect(actionCountsInWindow([{ type: 'combat', day: 0 }])).toEqual({ combat: 1 })
  })
})

describe('BURN edge — evaluateBurnout', () => {
  it('≥2 types distincts (même sous seuil) → null (variété exempte)', () => {
    expect(evaluateBurnout([...many('combat', 6), { type: 'craft', day: 1 }], 1)).toBeNull()
    expect(
      evaluateBurnout(
        [
          { type: 'combat', day: 1 },
          { type: 'travel', day: 1 },
        ],
        1,
      ),
    ).toBeNull()
  })

  it('type mappé combat au seuil exact (6) → { type, stat: aura, malus: 0.1, day }', () => {
    expect(evaluateBurnout(many('combat', 6), 3)).toEqual({
      type: 'combat',
      stat: 'aura',
      malus: 0.1,
      day: 3,
    })
  })

  it('type mappé craft au-dessus du seuil → concentration', () => {
    expect(evaluateBurnout(many('craft', 8), 2)).toEqual({
      type: 'craft',
      stat: 'concentration',
      malus: 0.1,
      day: 2,
    })
  })

  it('type mappé sous le seuil (5) → null', () => {
    expect(evaluateBurnout(many('combat', 5), 1)).toBeNull()
    expect(evaluateBurnout(many('craft', 5), 1)).toBeNull()
  })

  it('type NON mappé (rest/travel/collect) même très au-dessus du seuil → null', () => {
    expect(evaluateBurnout(many('rest', 50), 1)).toBeNull()
    expect(evaluateBurnout(many('travel', 20), 1)).toBeNull()
    expect(evaluateBurnout(many('collect', 12), 1)).toBeNull()
  })

  it('log vide / défauts → null', () => {
    expect(evaluateBurnout()).toBeNull()
    expect(evaluateBurnout([], 5)).toBeNull()
  })

  it('actions hors fenêtre ne comptent pas pour le seuil', () => {
    // 6 combats mais tous au day 1, currentDay 10 → hors fenêtre → pas de burnout
    expect(evaluateBurnout(many('combat', 6, 1), 10)).toBeNull()
  })
})

describe('BURN edge — appendAction', () => {
  it('world null → day défaut 1', () => {
    const res = appendAction(null, 'combat')
    expect(res.actionLog).toEqual([{ type: 'combat', day: 1 }])
    expect(res.burnout).toBeNull()
  })

  it('world undefined → day défaut 1', () => {
    const res = appendAction(undefined, 'craft')
    expect(res.actionLog).toEqual([{ type: 'craft', day: 1 }])
  })

  it('drop les entrées plus vieilles que la fenêtre', () => {
    const world = {
      dayCount: 10,
      actionLog: [
        { type: 'combat', day: 1 }, // 10-1=9 ≥ 4 → droppé
        { type: 'combat', day: 8 }, // 10-8=2 < 4 → gardé
      ],
    }
    const res = appendAction(world, 'combat')
    // gardés : day 8 + le nouveau day 10 ; le day 1 est droppé
    expect(res.actionLog).toEqual([
      { type: 'combat', day: 8 },
      { type: 'combat', day: 10 },
    ])
  })

  it('recompute burnout via evaluateBurnout (déclenche à la 6e action même jour)', () => {
    let world = { dayCount: 1, actionLog: [] }
    for (let i = 0; i < 5; i++) world = { ...world, ...appendAction(world, 'combat') }
    expect(world.burnout).toBeNull() // 5 < seuil
    world = { ...world, ...appendAction(world, 'combat') }
    expect(world.burnout).toMatchObject({ type: 'combat', stat: 'aura', malus: 0.1, day: 1 })
    expect(world.actionLog).toHaveLength(6)
  })

  it('variété dans le log → burnout null malgré ≥6 d’un type', () => {
    let world = { dayCount: 1, actionLog: [{ type: 'rest', day: 1 }] }
    for (let i = 0; i < 6; i++) world = { ...world, ...appendAction(world, 'combat') }
    expect(world.burnout).toBeNull() // rest + combat = 2 types
  })

  it('cap -200 : un très gros log ne crashe pas et est borné à 200', () => {
    const big = Array.from({ length: 500 }, () => ({ type: 'combat', day: 1 }))
    const world = { dayCount: 1, actionLog: big }
    const res = appendAction(world, 'combat')
    expect(res.actionLog).toHaveLength(200)
    // toutes dans la fenêtre (day 1, currentDay 1) et un seul type → burnout aura
    expect(res.burnout).toMatchObject({ stat: 'aura' })
  })

  it('actionLog absent sur world → part de []', () => {
    const res = appendAction({ dayCount: 5 }, 'combat')
    expect(res.actionLog).toEqual([{ type: 'combat', day: 5 }])
  })
})

describe('BURN edge — getBurnoutMalus', () => {
  it('pas de burnout → 0', () => {
    expect(getBurnoutMalus({ dayCount: 1 }, 'aura')).toBe(0)
    expect(getBurnoutMalus({ dayCount: 1, burnout: null }, 'aura')).toBe(0)
    expect(getBurnoutMalus(null, 'aura')).toBe(0)
    expect(getBurnoutMalus(undefined, 'aura')).toBe(0)
  })

  it('burnout d’un stat différent → 0', () => {
    const w = { dayCount: 1, burnout: { stat: 'aura', malus: 0.1, day: 1 } }
    expect(getBurnoutMalus(w, 'concentration')).toBe(0)
  })

  it('burnout expiré (age ≥ durationDays=1) → 0', () => {
    const w = { dayCount: 2, burnout: { stat: 'aura', malus: 0.1, day: 1 } }
    expect(getBurnoutMalus(w, 'aura')).toBe(0)
    // très vieux aussi → 0
    expect(
      getBurnoutMalus({ dayCount: 10, burnout: { stat: 'aura', malus: 0.1, day: 1 } }, 'aura'),
    ).toBe(0)
  })

  it('burnout frais correspondant (age 0 < 1) → malus 0.1', () => {
    const w = { dayCount: 1, burnout: { stat: 'aura', malus: 0.1, day: 1 } }
    expect(getBurnoutMalus(w, 'aura')).toBe(0.1)
  })

  it('dayCount absent → défaut 1, burnout.day absent → défaut 0 → age 1 ≥ 1 → expiré', () => {
    // dayCount défaut 1, day défaut 0 → 1 - 0 = 1 ≥ durationDays → 0
    expect(getBurnoutMalus({ burnout: { stat: 'aura', malus: 0.1 } }, 'aura')).toBe(0)
  })
})

describe('BURN edge — constantes exportées', () => {
  it('ACTION_TYPES contient les 5 types', () => {
    expect(ACTION_TYPES).toEqual(['combat', 'craft', 'rest', 'collect', 'travel'])
  })
})
