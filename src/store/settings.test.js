// SET01 — Tests des réglages joueur
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'

describe('SET01 — settings', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame()
    localStorage.clear()
  })

  it('animations activées par défaut', () => {
    expect(useGameStore.getState().meta.settings.animations).toBe(true)
  })

  it('setSetting modifie un réglage', () => {
    useGameStore.getState().setSetting('animations', false)
    expect(useGameStore.getState().meta.settings.animations).toBe(false)
  })

  it('le réglage persiste via export/import (round-trip)', () => {
    useGameStore.getState().setSetting('animations', false)
    const json = useGameStore.getState().exportSave()
    useGameStore.getState().resetGame()
    expect(useGameStore.getState().meta.settings.animations).toBe(true)
    useGameStore.getState().importSave(json)
    expect(useGameStore.getState().meta.settings.animations).toBe(false)
  })
})
