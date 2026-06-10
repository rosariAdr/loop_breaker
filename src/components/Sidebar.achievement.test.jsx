// UI-ACHIEVE-PREVIEW — l'encart « Next Achievement » du panneau droit.
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Sidebar } from './parchment'

afterEach(cleanup)

const base = {
  location: 'Ironhaven',
  zone: 'Ashenvale',
  deity: null,
  demonLord: 'Malachar',
  tokens: 3,
}

describe('UI-ACHIEVE-PREVIEW', () => {
  it("affiche l'accomplissement le plus proche (nom + progression + barre)", () => {
    render(
      <Sidebar
        {...base}
        nextAchievement={{
          id: 'monster_hunter',
          name: 'Monster Hunter',
          desc: 'Defeat 50 monsters.',
          current: 40,
          target: 50,
          pct: 0.8,
          reward: { stat: { name: 'strength', amount: 2 } },
        }}
      />,
    )
    expect(screen.getByTestId('next-achievement')).toBeInTheDocument()
    expect(screen.getByText('Monster Hunter')).toBeInTheDocument()
    expect(screen.getByText(/40\/50/)).toBeInTheDocument()
    const bar = screen.getByRole('progressbar', { name: /Monster Hunter/ })
    expect(bar.getAttribute('aria-valuenow')).toBe('40')
    expect(bar.getAttribute('aria-valuemax')).toBe('50')
  })

  it('aucun encart si nextAchievement est null (tous débloqués)', () => {
    render(<Sidebar {...base} nextAchievement={null} />)
    expect(screen.queryByTestId('next-achievement')).toBeNull()
  })
})
