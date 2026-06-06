// TECH07 — Tests export / import de save
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'

describe('TECH07 — export/import save', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame()
    localStorage.clear()
  })

  it('exportSave produit un JSON valide (hero/world/meta/saveVersion)', () => {
    const parsed = JSON.parse(useGameStore.getState().exportSave())
    expect(parsed.hero).toBeTruthy()
    expect(parsed.world).toBeTruthy()
    expect(parsed.meta).toBeTruthy()
    expect(parsed.saveVersion).toBeDefined()
  })

  it('round-trip : importSave restaure un état exporté', () => {
    useGameStore.getState().addGold(777)
    useGameStore.setState((s) => ({ hero: { ...s.hero, runNumber: 9 } }))
    const json = useGameStore.getState().exportSave()

    useGameStore.getState().resetGame()
    expect(useGameStore.getState().hero.inventory.gold).not.toBe(777)

    const ok = useGameStore.getState().importSave(json)
    expect(ok).toBe(true)
    expect(useGameStore.getState().hero.inventory.gold).toBe(777)
    expect(useGameStore.getState().hero.runNumber).toBe(9)
  })

  it('importSave rejette un JSON invalide ou incomplet', () => {
    expect(useGameStore.getState().importSave('not json')).toBe(false)
    expect(useGameStore.getState().importSave('{"foo":1}')).toBe(false)
  })
})
