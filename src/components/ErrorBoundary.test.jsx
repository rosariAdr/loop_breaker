// TECH01 — Tests pour ErrorBoundary
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary'

beforeEach(() => {
  // Silence les console.error attendues lors des throws en test
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

// Helper : composant qui throw au render
function ThrowingChild({ message = 'Boom' }) {
  throw new Error(message)
}

function NormalChild() {
  return <div>Normal content</div>
}

describe('ErrorBoundary — TECH01', () => {
  it('affiche les children quand aucune erreur', () => {
    render(
      <ErrorBoundary>
        <NormalChild />
      </ErrorBoundary>
    )
    expect(screen.getByText('Normal content')).toBeInTheDocument()
  })

  it('affiche le fallback UI quand un child throw', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    )
    expect(screen.getByText(/Something broke/i)).toBeInTheDocument()
  })

  it("affiche le message d'erreur (abrégé)", () => {
    render(
      <ErrorBoundary>
        <ThrowingChild message="Test crash 42" />
      </ErrorBoundary>
    )
    expect(screen.getByText(/Test crash 42/)).toBeInTheDocument()
  })

  it('affiche les boutons "Reload" et "Reset save"', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    )
    expect(screen.getByText(/Reload page/i)).toBeInTheDocument()
    expect(screen.getByText(/Reset save/i)).toBeInTheDocument()
  })

  it('clic sur "Reload page" appelle window.location.reload', () => {
    const reloadMock = vi.fn()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload: reloadMock },
    })
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    )
    fireEvent.click(screen.getByText(/Reload page/i))
    expect(reloadMock).toHaveBeenCalled()
  })

  it('clic sur "Reset save" demande confirmation puis remove + reload si OK', () => {
    const reloadMock = vi.fn()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload: reloadMock },
    })
    const confirmMock = vi.spyOn(window, 'confirm').mockReturnValue(true)
    localStorage.setItem('roguelite_save', 'fake-save-data')

    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    )
    fireEvent.click(screen.getByText(/Reset save/i))

    expect(confirmMock).toHaveBeenCalled()
    expect(localStorage.getItem('roguelite_save')).toBeNull()
    expect(reloadMock).toHaveBeenCalled()
  })

  it('clic sur "Reset save" ne supprime rien si user annule', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    localStorage.setItem('roguelite_save', 'preserved-save')

    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    )
    fireEvent.click(screen.getByText(/Reset save/i))

    expect(localStorage.getItem('roguelite_save')).toBe('preserved-save')
  })

  it('logue les erreurs via console.error (componentDidCatch)', () => {
    const errorSpy = vi.spyOn(console, 'error')
    render(
      <ErrorBoundary>
        <ThrowingChild message="Logged error" />
      </ErrorBoundary>
    )
    expect(errorSpy).toHaveBeenCalled()
  })
})
