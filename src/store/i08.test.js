// I08 — Config idle : seuil de PV d'auto-stop personnalisable.
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'

const store = () => useGameStore.getState()

describe('I08 — seuil de PV idle configurable', () => {
  beforeEach(() => {
    store().resetGame()
    localStorage.clear()
  })

  it('valeur par défaut = 0.2', () => {
    expect(store().world.idleHpThreshold).toBe(0.2)
  })

  it('setIdleHpThreshold met à jour la valeur', () => {
    store().setIdleHpThreshold(0.35)
    expect(store().world.idleHpThreshold).toBe(0.35)
  })

  it('borne la valeur entre 5% et 90%', () => {
    store().setIdleHpThreshold(2)
    expect(store().world.idleHpThreshold).toBe(0.9)
    store().setIdleHpThreshold(-1)
    expect(store().world.idleHpThreshold).toBe(0.05)
  })

  it('runIdleCombat respecte le seuil configuré (auto-stop si PV sous le seuil)', () => {
    // Prépare un idle actif sur un monstre débloqué, PV à 30%
    useGameStore.setState((s) => ({
      world: {
        ...s.world,
        isIdleActive: true,
        idleTargetMonster: 'ashwood_wolf',
        idleHpThreshold: 0.5, // seuil élevé
        monsterKillCounts: { ...s.world.monsterKillCounts, ashwood_wolf: 5 },
      },
      hero: { ...s.hero, stats: { ...s.hero.stats, hp: Math.round(s.hero.stats.maxHp * 0.3) } },
    }))
    // 30% < seuil 50% → l'idle doit se couper
    store().processIdleTick()
    expect(store().world.isIdleActive).toBe(false)
  })
})
