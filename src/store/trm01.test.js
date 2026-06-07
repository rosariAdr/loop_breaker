// TRM01 — Héritage de stat à la transmigration + audit des options du God's Shop.
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { CATALOG } from '../screens/GodsShop'

const store = () => useGameStore.getState()

// Pose un pendingInheritance + lastRunSummary minimal pour pouvoir transmigrer.
function primeTransmig({ stat = 'strength', runStats = {}, activeSkill = null, passiveSkill = null, prevTokens = 0, deity = 'sylvara' } = {}) {
  useGameStore.setState((s) => ({
    hero: { ...s.hero, deity, reputationTokens: prevTokens },
    meta: {
      ...s.meta,
      pendingInheritance: { stat, activeSkill, passiveSkill, bonuses: [] },
      lastRunSummary: { ...(s.meta.lastRunSummary ?? {}), stats: runStats, reputationTokens: prevTokens },
    },
  }))
}

describe('TRM01 — héritage de stat (formule × 0.4, plancher = base)', () => {
  beforeEach(() => { store().resetGame(); localStorage.clear() })

  it('stat bien montée → héritée = round(valeur_run × 0.4)', () => {
    const base = store().hero.stats.strength
    primeTransmig({ stat: 'strength', runStats: { strength: 100 } })
    store().applyTransmigration({})
    expect(store().hero.stats.strength).toBe(Math.max(base, Math.round(100 * 0.4))) // 40
  })

  it('plancher : une stat peu montée ne descend jamais sous la base', () => {
    const base = store().hero.stats.strength
    primeTransmig({ stat: 'strength', runStats: { strength: base } }) // round(base*0.4) < base
    store().applyTransmigration({})
    expect(store().hero.stats.strength).toBe(base)
  })

  it('sans lastRunSummary → retombe sur la base (pas de crash)', () => {
    const base = store().hero.stats.agility
    useGameStore.setState((s) => ({
      meta: { ...s.meta, pendingInheritance: { stat: 'agility', activeSkill: null, passiveSkill: null, bonuses: [] }, lastRunSummary: null },
    }))
    store().applyTransmigration({})
    expect(store().hero.stats.agility).toBe(base)
  })
})

describe('TRM01 — audit des options du God\'s Shop (effet réel)', () => {
  beforeEach(() => { store().resetGame(); localStorage.clear() })

  it('rank_restore → 80% des tokens restaurés', () => {
    primeTransmig({ runStats: { strength: 20 }, prevTokens: 10 })
    store().applyTransmigration({ rankRestored: true })
    expect(store().hero.reputationTokens).toBe(8) // round(10 * 0.8)
  })

  it('sans rank_restore → tokens repartent à 0', () => {
    primeTransmig({ runStats: { strength: 20 }, prevTokens: 10 })
    store().applyTransmigration({})
    expect(store().hero.reputationTokens).toBe(0)
  })

  it('bonus_skill → le skill choisi est ajouté aux skills actifs', () => {
    primeTransmig({ runStats: { strength: 20 } })
    store().applyTransmigration({ extraSkills: [{ type: 'active', skillId: 'power_strike', level: 1, xp: 0 }] })
    expect(store().hero.activeSkills.some((s) => s.skillId === 'power_strike')).toBe(true)
  })

  it('bonus_stat → +1 sur la stat ciblée (override déterministe)', () => {
    const base = store().hero.stats.agility
    primeTransmig({ stat: 'strength', runStats: { strength: 20 } })
    store().applyTransmigration({ bonusStatSlot: true, bonusStat: 'agility' })
    expect(store().hero.stats.agility).toBe(base + 1)
  })

  it('skill_levelup → augmente le niveau du skill actif hérité', () => {
    primeTransmig({ stat: 'strength', runStats: { strength: 20 }, activeSkill: { skillId: 'savage_bite', level: 1, xp: 0 } })
    store().applyTransmigration({ skillLevelUps: 1 }) // deity posé → pas de bonus solo
    const sk = store().hero.activeSkills.find((s) => s.skillId === 'savage_bite')
    expect(sk.level).toBe(2)
  })
})

describe('TRM01 — divine_oracle neutralisé (option morte)', () => {
  it('divine_oracle marqué comingSoon dans le CATALOG (non achetable)', () => {
    const oracle = CATALOG.find((i) => i.id === 'divine_oracle')
    expect(oracle).toBeDefined()
    expect(oracle.comingSoon).toBe(true)
  })
})
