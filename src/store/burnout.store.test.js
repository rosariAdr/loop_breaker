// BURN — intégration store (kills / repos / logAction alimentent le journal + burnout).
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'

const s = () => useGameStore.getState()
beforeEach(() => {
  s().resetGame()
  localStorage.clear()
})

describe('BURN — intégration store', () => {
  it('6 kills consécutifs (même journée) → burnout aura', () => {
    for (let i = 0; i < 6; i++) s().recordKill('ashwood_wolf')
    expect(s().world.burnout?.stat).toBe('aura')
    expect(s().world.actionLog.filter((a) => a.type === 'combat').length).toBe(6)
  })

  it('variété (kills + repos) → pas de burnout', () => {
    for (let i = 0; i < 6; i++) s().recordKill('ashwood_wolf')
    s().sleep() // ajoute une action « rest » → ≥2 activités
    expect(s().world.burnout).toBeNull()
  })

  it('logAction public alimente le journal', () => {
    s().logAction('collect')
    expect(s().world.actionLog.some((a) => a.type === 'collect')).toBe(true)
  })
})
