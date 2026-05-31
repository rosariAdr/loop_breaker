// S02 — Tests aperçu skills ennemis (flou < 5 kills)
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import ZoneView from './ZoneView'
import { useGameStore } from '../store/gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
  // Positionner sur un spot de chasse Ashenvale (contient ashwood_wolf qui droppe savage_bite)
  useGameStore.setState(state => ({
    world: { ...state.world, currentZone: 'ashenvale', currentHuntingSpot: 'ashenvale_forest' },
  }))
  localStorage.clear()
})

afterEach(cleanup)

describe('S02 — SkillDropPreview', () => {
  it("affiche un aperçu de skill pour chaque monstre avec skillDrop", () => {
    render(<ZoneView />)
    const previews = screen.getAllByTestId('skill-drop-preview')
    expect(previews.length).toBeGreaterThanOrEqual(1)
  })

  it("skill caché (████) tant que killCount < 5", () => {
    render(<ZoneView />)
    // 0 kill → tous les noms sont masqués
    const names = screen.getAllByTestId('skill-drop-name')
    expect(names.every(n => n.textContent.includes('█'))).toBe(true)
  })

  it("skill révélé après 5 kills", () => {
    useGameStore.setState(state => ({
      world: { ...state.world, monsterKillCounts: { ashwood_wolf: 5 } },
    }))
    render(<ZoneView />)
    // savage_bite est le skill drop d'ashwood_wolf
    expect(screen.getByText('Savage Bite')).toBeInTheDocument()
  })

  it("le skill révélé n'est plus flouté (filter none)", () => {
    useGameStore.setState(state => ({
      world: { ...state.world, monsterKillCounts: { ashwood_wolf: 5 } },
    }))
    render(<ZoneView />)
    const revealed = screen.getByText('Savage Bite')
    expect(revealed.style.filter).toBe('none')
  })

  it("le skill non révélé est flouté (blur)", () => {
    render(<ZoneView />)
    const names = screen.getAllByTestId('skill-drop-name')
    expect(names[0].style.filter).toMatch(/blur/)
  })
})
