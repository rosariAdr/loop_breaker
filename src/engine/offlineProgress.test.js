// IDLE-OFF — Tests du moteur de progression hors-ligne
import { describe, it, expect } from 'vitest'
import { elapsedIdleTicks, canGrind, computeOfflineGains, IDLE_TICK_MS } from './offlineProgress'

const MONSTER = {
  name: 'Ashwood Wolf',
  baseStats: { hp: 40, atk: 8, def: 4 },
  goldReward: { min: 4, max: 8 },
  expReward: 10,
  resourceDrops: [{ resourceId: 'wolf_pelt', chance: 0.5, qty: { min: 1, max: 3 } }],
}

describe('IDLE-OFF — elapsedIdleTicks', () => {
  it('compte les ticks entiers écoulés', () => {
    expect(elapsedIdleTicks(0, 10 * IDLE_TICK_MS)).toBe(10)
    expect(elapsedIdleTicks(1000, 1000 + 5 * IDLE_TICK_MS + 500)).toBe(5) // tronqué
  })
  it('renvoie 0 si pas de temps écoulé ou args manquants', () => {
    expect(elapsedIdleTicks(1000, 1000)).toBe(0)
    expect(elapsedIdleTicks(2000, 1000)).toBe(0)
    expect(elapsedIdleTicks(null, 5000)).toBe(0)
  })
})

describe('IDLE-OFF — canGrind', () => {
  it('vrai si dégâts nets > 0', () => {
    expect(canGrind({ stats: { strength: 8 } }, MONSTER)).toBe(true)
  })
  it('faux si trop faible', () => {
    expect(canGrind({ stats: { strength: 2 } }, MONSTER)).toBe(false) // 2 - floor(4/2)=0
  })
})

describe('IDLE-OFF — computeOfflineGains', () => {
  it('kills = ticks ; gold/xp proportionnels', () => {
    const g = computeOfflineGains({ monster: MONSTER, ticks: 100, chance: 5 })
    expect(g.kills).toBe(100)
    expect(g.gold).toBe(Math.round(100 * 6)) // avg(4,8)=6
    expect(g.xp).toBe(1000) // 100 × 10
  })
  it('ressources en valeur espérée (chance × qty moyenne)', () => {
    const g = computeOfflineGains({ monster: MONSTER, ticks: 100, chance: 5 })
    // p=0.5, avgQty=2 → 100 × 0.5 × 2 = 100
    expect(g.resources.wolf_pelt).toBe(100)
  })
  it('le bonus de Chance augmente les drops', () => {
    const low = computeOfflineGains({ monster: MONSTER, ticks: 1000, chance: 5 })
    const high = computeOfflineGains({ monster: MONSTER, ticks: 1000, chance: 105 })
    expect(high.resources.wolf_pelt).toBeGreaterThan(low.resources.wolf_pelt)
  })
  it('0 gains pour 0 tick ou monstre absent', () => {
    expect(computeOfflineGains({ monster: MONSTER, ticks: 0 })).toEqual({
      kills: 0,
      gold: 0,
      xp: 0,
      resources: {},
    })
    expect(computeOfflineGains({ monster: null, ticks: 100 })).toEqual({
      kills: 0,
      gold: 0,
      xp: 0,
      resources: {},
    })
  })
})
