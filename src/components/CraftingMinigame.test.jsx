// CRF02 / CRF03 — Tests du composant mini-jeu de crafting
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import CraftingMinigame from './CraftingMinigame'

afterEach(cleanup)

describe('CraftingMinigame', () => {
  it('ne rend rien si fermé', () => {
    render(<CraftingMinigame open={false} mode="forge" onComplete={() => {}} />)
    expect(screen.queryByTestId('crafting-minigame')).toBeNull()
  })

  it('rend la piste et le bouton quand ouvert', () => {
    render(<CraftingMinigame open mode="forge" onComplete={() => {}} />)
    expect(screen.getByTestId('crafting-minigame')).toBeInTheDocument()
    expect(screen.getByTestId('minigame-track')).toBeInTheDocument()
    expect(screen.getByTestId('minigame-action')).toBeInTheDocument()
  })

  it('forge : 3 frappes déclenchent onComplete une fois avec un tier', () => {
    const onComplete = vi.fn()
    render(<CraftingMinigame open mode="forge" strikes={3} onComplete={onComplete} />)
    const btn = screen.getByTestId('minigame-action')
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(onComplete).not.toHaveBeenCalled()
    fireEvent.click(btn)
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete.mock.calls[0][0]).toHaveProperty('tier')
    expect(onComplete.mock.calls[0][0]).toHaveProperty('accuracy')
  })

  it('alchimie : 1 arrêt déclenche onComplete', () => {
    const onComplete = vi.fn()
    render(<CraftingMinigame open mode="alchemy" onComplete={onComplete} />)
    fireEvent.click(screen.getByTestId('minigame-action'))
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('le label forge affiche le compteur de frappes', () => {
    render(<CraftingMinigame open mode="forge" strikes={3} onComplete={() => {}} />)
    expect(screen.getByTestId('minigame-action').textContent).toMatch(/0\/3/)
  })
})
