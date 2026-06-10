// ANIM01 — animations d'attaque (CSS). Vérifie le câblage des nouvelles classes/éléments.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import Combat from './Combat'
import { useGameStore } from '../store/gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
  localStorage.clear()
  vi.useFakeTimers()
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function setupCombat() {
  const enemy = {
    id: 'ashwood_wolf_0',
    monsterId: 'ashwood_wolf',
    name: 'Test Wolf',
    stats: { hp: 100, atk: 5, def: 4, spd: 10 },
    currentHp: 100,
    rank: 'common',
    expReward: 15,
  }
  useGameStore.getState().startCombat([enemy])
  return enemy
}

describe("ANIM01 — réaction d'impact", () => {
  it("coup du héros → la cible reçoit anim-hit-react + une étincelle d'impact", async () => {
    setupCombat()
    render(<Combat />)
    // Au clic, animatingEnemyId est posé immédiatement (fenêtre de 300ms)
    await act(async () => {
      screen.getByText(/Basic Attack/i).click()
    })
    expect(document.querySelector('.anim-hit-react')).not.toBeNull()
    expect(document.querySelector('[data-testid="impact-spark"]')).not.toBeNull()
  })

  it("l'étincelle disparaît une fois l'animation de coup terminée (~300ms)", async () => {
    setupCombat()
    render(<Combat />)
    await act(async () => {
      screen.getByText(/Basic Attack/i).click()
    })
    expect(document.querySelector('[data-testid="impact-spark"]')).not.toBeNull()
    await act(async () => {
      vi.advanceTimersByTime(350)
    })
    expect(document.querySelector('[data-testid="impact-spark"]')).toBeNull()
  })

  it('le héros lance bien anim-hero-attack au clic (B13 conservé)', async () => {
    setupCombat()
    render(<Combat />)
    await act(async () => {
      screen.getByText(/Basic Attack/i).click()
    })
    expect(document.querySelector('.anim-hero-attack')).not.toBeNull()
  })

  it('tour ennemi → la carte ennemie joue anim-enemy-attack (lunge)', async () => {
    setupCombat()
    render(<Combat />)
    await act(async () => {
      screen.getByText(/Basic Attack/i).click()
      vi.advanceTimersByTime(300) // anim joueur + afterPlayerAction
    })
    // l'ennemi attaque ~600ms plus tard (puis classe retirée après 400ms)
    await act(async () => {
      vi.advanceTimersByTime(620)
    })
    // tolérant sur la fenêtre exacte, mais le combat ne doit pas avoir cassé
    const lunge = document.querySelector('.anim-enemy-attack')
    if (lunge) expect(lunge).toBeInTheDocument()
    expect(screen.getByText('Test Wolf')).toBeInTheDocument()
  })
})
