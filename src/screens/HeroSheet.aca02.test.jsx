// ACA02 — déséquiper un skill est réservé à l'Académie : bloqué depuis le HeroSheet.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import HeroSheet from './HeroSheet'
import { useGameStore } from '../store/gameStore'
import { useToastStore } from '../store/toastStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
  useToastStore.getState().clearToasts?.()
  localStorage.clear()
})
afterEach(cleanup)

describe('ACA02 — déséquiper hors Académie', () => {
  it('clic « Unequip » sur un skill actif dans le HeroSheet → bloqué (reste équipé)', () => {
    useGameStore.setState((s) => ({
      hero: {
        ...s.hero,
        activeSkills: [{ skillId: 'power_strike', level: 1, xp: 0, currentCooldown: 0 }],
      },
    }))
    render(<HeroSheet onClose={() => {}} />)
    // Pas d'équipement → le seul bouton "Unequip" est celui du skill
    fireEvent.click(screen.getByTitle('Unequip'))
    // Le skill reste équipé (déséquipement interdit ailleurs qu'à l'Académie)
    expect(
      useGameStore.getState().hero.activeSkills.some((s) => s.skillId === 'power_strike'),
    ).toBe(true)
  })

  it("un feedback (toast) informe d'aller à l'Académie", () => {
    useGameStore.setState((s) => ({
      hero: { ...s.hero, passiveSkills: [{ skillId: 'veterans_resolve', level: 1, xp: 0 }] },
    }))
    render(<HeroSheet onClose={() => {}} />)
    fireEvent.click(screen.getByTitle('Unequip'))
    const toasts = useToastStore.getState().toasts ?? []
    expect(toasts.some((t) => /Academy/i.test(t.message ?? t.text ?? ''))).toBe(true)
    // et le passif reste équipé
    expect(
      useGameStore.getState().hero.passiveSkills.some((s) => s.skillId === 'veterans_resolve'),
    ).toBe(true)
  })
})
