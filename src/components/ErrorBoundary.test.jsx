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
      </ErrorBoundary>,
    )
    expect(screen.getByText('Normal content')).toBeInTheDocument()
  })

  it('affiche le fallback UI quand un child throw', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    )
    expect(screen.getByText(/Something broke/i)).toBeInTheDocument()
  })

  it("affiche le message d'erreur (abrégé)", () => {
    render(
      <ErrorBoundary>
        <ThrowingChild message="Test crash 42" />
      </ErrorBoundary>,
    )
    expect(screen.getByText(/Test crash 42/)).toBeInTheDocument()
  })

  it('affiche les boutons "Reload" et "Reset save"', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
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
      </ErrorBoundary>,
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
      </ErrorBoundary>,
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
      </ErrorBoundary>,
    )
    fireEvent.click(screen.getByText(/Reset save/i))

    expect(localStorage.getItem('roguelite_save')).toBe('preserved-save')
  })

  it('logue les erreurs via console.error (componentDidCatch)', () => {
    const errorSpy = vi.spyOn(console, 'error')
    render(
      <ErrorBoundary>
        <ThrowingChild message="Logged error" />
      </ErrorBoundary>,
    )
    expect(errorSpy).toHaveBeenCalled()
  })

  it('DX-ERRTRACK01 — persiste l’erreur dans le journal localStorage (Sentry-lite)', () => {
    localStorage.removeItem('lb_errors')
    render(
      <ErrorBoundary>
        <ThrowingChild message="Persisted crash" />
      </ErrorBoundary>,
    )
    const log = JSON.parse(localStorage.getItem('lb_errors') || '[]')
    expect(log.length).toBeGreaterThanOrEqual(1)
    expect(log[0].message).toMatch(/Persisted crash/)
    expect(log[0].source).toBe('react-render')
    expect(log[0].ts).toBeTruthy()
  })

  it('DX-ERRTRACK01 — propose un bouton « Copy error details »', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    )
    expect(screen.getByText(/Copy error details/i)).toBeInTheDocument()
  })
})

// LB-11 — Topbar, Breadcrumb, Sidebar, modales et toasts sont rendus hors des boundaries
// d'écran d'App.jsx : une erreur chez eux doit afficher le fallback, pas un écran blanc.
describe('LB-11 — boundary racine (main.jsx)', () => {
  let rootEl

  beforeEach(() => {
    rootEl = document.createElement('div')
    rootEl.id = 'root'
    document.body.appendChild(rootEl)
    vi.resetModules()
  })

  afterEach(() => {
    rootEl.remove()
    vi.doUnmock('../App.jsx')
    vi.doUnmock('../config')
    vi.resetModules()
  })

  it('une erreur de rendu hors des écrans affiche le fallback « Reload / Reset save »', async () => {
    // main.jsx lance aussi loadBalance au boot : sans rapport avec la boundary, on le neutralise.
    vi.doMock('../config', () => ({
      FEATURE_FLAGS: { csvBalanceLive: false },
      loadBalance: vi.fn(),
    }))
    vi.doMock('../App.jsx', () => ({
      default: function CrashingApp() {
        throw new Error('Topbar crash')
      },
    }))

    await import('../main.jsx')

    expect(await screen.findByText(/Something broke/i)).toBeInTheDocument()
    expect(screen.getByText(/Topbar crash/)).toBeInTheDocument()
    expect(screen.getByText(/Reload page/i)).toBeInTheDocument()
    expect(screen.getByText(/Reset save/i)).toBeInTheDocument()
  })
})
