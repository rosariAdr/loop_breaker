// ANIM02 — VFX de combat propres aux skills (câblage CSS dans Combat).
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

function setupCombatWithSkill(skillId) {
  useGameStore.setState((s) => ({
    hero: {
      ...s.hero,
      stats: { ...s.hero.stats, mana: 300, maxMana: 300, hp: 500, maxHp: 500 },
      activeSkills: [{ skillId, level: 1, xp: 0, currentCooldown: 0 }],
    },
  }))
  const enemy = {
    id: 'ashwood_wolf_0', monsterId: 'ashwood_wolf', name: 'Test Wolf',
    stats: { hp: 300, atk: 5, def: 4, spd: 10 }, currentHp: 300, rank: 'common', expReward: 15,
  }
  useGameStore.getState().startCombat([enemy])
}

function castSkill(skillName) {
  // onglet Skills puis bouton du skill
  act(() => { screen.getByText('Skills').click() })
  act(() => { screen.getByText(skillName).click() })
}

describe('ANIM02 — VFX skill en combat', () => {
  it('skill mêlée (Power Strike) → flash élémentaire + frappe (skill-slash)', () => {
    setupCombatWithSkill('power_strike')
    render(<Combat />)
    castSkill('Power Strike')
    expect(document.querySelector('[data-testid="skill-flash"]')).not.toBeNull()
    expect(document.querySelector('[data-testid="skill-slash"]')).not.toBeNull()
    // la cible réagit aussi
    expect(document.querySelector('.anim-hit-react')).not.toBeNull()
  })

  it('skill à distance (Chain Lightning) → projectile (skill-orb)', () => {
    setupCombatWithSkill('chain_lightning')
    render(<Combat />)
    castSkill('Chain Lightning')
    expect(document.querySelector('[data-testid="skill-flash"]')).not.toBeNull()
    expect(document.querySelector('[data-testid="skill-orb"]')).not.toBeNull()
  })

  it('le VFX disparaît une fois l\'animation terminée (~520ms)', () => {
    setupCombatWithSkill('power_strike')
    render(<Combat />)
    castSkill('Power Strike')
    expect(document.querySelector('[data-testid="skill-flash"]')).not.toBeNull()
    act(() => { vi.advanceTimersByTime(560) })
    expect(document.querySelector('[data-testid="skill-flash"]')).toBeNull()
  })
})
