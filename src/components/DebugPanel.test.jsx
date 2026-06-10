// PROC06 — Tests DebugPanel
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import DebugPanel from './DebugPanel'
import { useGameStore } from '../store/gameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('DebugPanel — PROC06', () => {
  // En mode test, import.meta.env.DEV est true (vitest = dev par défaut)
  it("n'affiche rien tant que le panel n'est pas ouvert (pas de Ctrl+Shift+D)", () => {
    render(<DebugPanel />)
    expect(screen.queryByTestId('debug-panel')).toBeNull()
  })

  it("s'ouvre au Ctrl+Shift+D", () => {
    render(<DebugPanel />)
    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: true })
    expect(screen.getByTestId('debug-panel')).toBeInTheDocument()
  })

  it('se ferme au 2e Ctrl+Shift+D (toggle)', () => {
    render(<DebugPanel />)
    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: true })
    expect(screen.getByTestId('debug-panel')).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: true })
    expect(screen.queryByTestId('debug-panel')).toBeNull()
  })

  it("ne s'ouvre PAS sans Shift", () => {
    render(<DebugPanel />)
    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: false })
    expect(screen.queryByTestId('debug-panel')).toBeNull()
  })

  it("la commande '+1000 gold' ajoute de l'or", () => {
    render(<DebugPanel />)
    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: true })
    const before = useGameStore.getState().hero.inventory.gold
    fireEvent.click(screen.getByText('+1000 gold'))
    expect(useGameStore.getState().hero.inventory.gold).toBe(before + 1000)
  })

  it("la commande '+50 tokens' ajoute des tokens", () => {
    render(<DebugPanel />)
    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: true })
    fireEvent.click(screen.getByText('+50 tokens'))
    expect(useGameStore.getState().hero.reputationTokens).toBeGreaterThanOrEqual(50)
  })

  it("la commande 'Force Ignareth' set la divinité", () => {
    render(<DebugPanel />)
    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: true })
    fireEvent.click(screen.getByText('Force Ignareth'))
    expect(useGameStore.getState().hero.deity).toBe('ignareth')
  })

  it("la commande 'Kill Malachar' lève demonLordDefeated", () => {
    render(<DebugPanel />)
    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: true })
    fireEvent.click(screen.getByText('Kill Malachar'))
    expect(useGameStore.getState().world.demonLordDefeated).toBe(true)
  })

  it('bouton ✕ ferme le panel', () => {
    render(<DebugPanel />)
    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: true })
    fireEvent.click(screen.getByText('✕'))
    expect(screen.queryByTestId('debug-panel')).toBeNull()
  })
})
