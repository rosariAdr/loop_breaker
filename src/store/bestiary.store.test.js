// BEST01/BEST03 — intégration store : compteur persistant + titre de complétion de zone.
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { MONSTERS_BY_ZONE, MONSTERS } from '../data/monsters'

const s = () => useGameStore.getState()
beforeEach(() => {
  s().resetGame()
  localStorage.clear()
})

describe('BEST01 — compteur de bestiaire persistant (méta)', () => {
  it('recordKill incrémente meta.bestiaryKills', () => {
    s().recordKill('ashwood_wolf')
    s().recordKill('ashwood_wolf')
    expect(s().meta.bestiaryKills.ashwood_wolf).toBe(2)
  })
})

describe('BEST03 — titre de complétion de zone', () => {
  it("maîtriser toutes les espèces de surface d'Ashenvale → titre ashenvale_warden", () => {
    const species = MONSTERS_BY_ZONE.ashenvale.filter((id) => !MONSTERS[id]?.reserve)
    const kills = {}
    species.forEach((id) => (kills[id] = 100))
    useGameStore.setState((st) => ({ meta: { ...st.meta, bestiaryKills: kills } }))
    s().recordKill('ashwood_wolf') // déclenche la vérif de complétion de zone
    expect(s().meta.titlesEarned).toContain('ashenvale_warden')
  })

  it('bestiaire incomplet → pas de titre', () => {
    s().recordKill('ashwood_wolf')
    expect(s().meta.titlesEarned).not.toContain('ashenvale_warden')
  })
})
