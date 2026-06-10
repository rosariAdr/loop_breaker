// Combat v1.1 — CMB-ESCAPE01 (filet anti-blocage) + CMB-INVARIANT01 (la fin est toujours
// atteignable) + UX-COMBATLOG01 (accent coloré du journal).
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

function makeEnemy(over = {}) {
  return {
    id: 'ashwood_wolf_0',
    monsterId: 'ashwood_wolf',
    name: 'Test Wolf',
    stats: { hp: 80, atk: 5, def: 4, spd: 10 },
    currentHp: 80,
    rank: 'common',
    expReward: 15,
    ...over,
  }
}
function setHero(over = {}) {
  useGameStore.setState((s) => ({
    hero: { ...s.hero, stats: { ...s.hero.stats, hp: 500, maxHp: 500, ...over.stats } },
  }))
}

describe('CMB-ESCAPE01 — filet anti-blocage « Exit Combat »', () => {
  it('résout un combat INJOUABLE (ennemi quasi invincible) en victoire propre', async () => {
    setHero({ stats: { strength: 1 } })
    // def 999 → l'attaque de base ne peut pas tuer : sans filet, on serait coincé.
    useGameStore
      .getState()
      .startCombat([makeEnemy({ stats: { hp: 9999, atk: 1, def: 999, spd: 1 }, currentHp: 9999 })])
    render(<Combat />)
    expect(screen.getByTestId('combat-escape')).toBeInTheDocument()
    await act(async () => {
      screen.getByTestId('combat-escape').click() // ouvre la confirmation
    })
    await act(async () => {
      screen.getByText(/Exit \(count as win\)/i).click() // confirme
      vi.advanceTimersByTime(600)
    })
    expect(screen.queryByText(/Continue/i)).toBeTruthy() // ResultPanel atteint
  })

  it('« Keep fighting » annule : on reste en combat', async () => {
    setHero({ stats: { strength: 1 } })
    useGameStore.getState().startCombat([makeEnemy()])
    render(<Combat />)
    await act(async () => {
      screen.getByTestId('combat-escape').click()
    })
    await act(async () => {
      screen.getByText(/Keep fighting/i).click()
    })
    expect(screen.queryByText(/Continue/i)).toBeNull() // pas de résultat
    expect(screen.getByText(/Basic Attack/i)).toBeInTheDocument() // toujours en combat
  })
})

describe('CMB-INVARIANT01 — l’écran de fin est toujours atteignable', () => {
  it('multi-ennemis tués → ResultPanel (pas de blocage sur le dernier kill)', async () => {
    setHero({ stats: { strength: 999 } })
    useGameStore.getState().startCombat([
      makeEnemy({ id: 'w0', stats: { hp: 1, atk: 5, def: 0, spd: 10 }, currentHp: 1 }),
      makeEnemy({
        id: 'w1',
        name: 'W2',
        stats: { hp: 1, atk: 5, def: 0, spd: 10 },
        currentHp: 1,
      }),
    ])
    render(<Combat />)
    for (let i = 0; i < 6 && !screen.queryByText(/Continue/i); i++) {
      const btn = screen.queryByText(/Basic Attack/i)
      if (!btn) break
      await act(async () => {
        btn.click()
        vi.advanceTimersByTime(2500)
      })
    }
    expect(screen.queryByText(/Continue/i)).toBeTruthy()
  })

  it('le filet Exit garantit la fin même quand ce n’est plus jouable', async () => {
    setHero({ stats: { strength: 1 } })
    useGameStore
      .getState()
      .startCombat([makeEnemy({ stats: { hp: 9999, atk: 0, def: 999, spd: 1 }, currentHp: 9999 })])
    render(<Combat />)
    await act(async () => {
      screen.getByTestId('combat-escape').click()
    })
    await act(async () => {
      screen.getByText(/Exit \(count as win\)/i).click()
      vi.advanceTimersByTime(600)
    })
    expect(screen.queryByText(/Continue/i)).toBeTruthy()
  })
})

describe('UX-COMBATLOG01 — lisibilité du journal', () => {
  it('les lignes du journal ont un accent latéral coloré ; la plus récente est en gras', async () => {
    setHero({ stats: { strength: 999 } })
    useGameStore
      .getState()
      .startCombat([makeEnemy({ stats: { hp: 1, atk: 5, def: 0, spd: 10 }, currentHp: 1 })])
    const { container } = render(<Combat />)
    await act(async () => {
      screen.getByText(/Basic Attack/i).click()
      vi.advanceTimersByTime(600)
    })
    const lines = container.querySelectorAll('.overflow-y-auto p')
    expect(lines.length).toBeGreaterThanOrEqual(1)
    expect(lines[0].style.borderLeft).toMatch(/solid/)
    expect(lines[0].style.fontWeight).toBe('600') // dernière action = en gras
  })
})
