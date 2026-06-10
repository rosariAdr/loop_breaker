// TECH01 — React Error Boundary
// Catch les erreurs de rendu de l'arbre React. Affiche un fallback UI au lieu
// de laisser un écran blanc. Permet à l'utilisateur de recharger ou reset son save.
//
// Note : les Error Boundaries DOIVENT être des class components — React n'expose pas
// de hook équivalent (pas de useErrorBoundary natif). La règle react-refresh est
// désactivée pour ce fichier dans eslint.config.js.

import { Component } from 'react'
import { logRuntimeError } from '../utils/errorLog'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
    this.entry = null
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // DX-ERRTRACK01 — log structuré + persistance localStorage (Sentry-lite) pour l'alpha,
    // sinon une erreur de rendu en prod reste invisible.
    this.entry = logRuntimeError(error, {
      source: 'react-render',
      componentStack: info?.componentStack ? String(info.componentStack).slice(0, 2000) : null,
    })
  }

  handleCopyDetails = () => {
    const details = JSON.stringify(
      this.entry ?? { message: this.state.error?.message ?? 'Unknown error' },
      null,
      2,
    )
    try {
      navigator.clipboard?.writeText(details)
    } catch {
      // presse-papiers indisponible — pas grave
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleResetSave = () => {
    const ok = window.confirm(
      'This will delete your saved game. Are you sure? This action cannot be undone.',
    )
    if (!ok) return
    try {
      localStorage.removeItem('roguelite_save')
    } catch {
      // ignore — already lost
    }
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const message = this.state.error?.message ?? 'Unknown error'
    // Abréger le message si trop long pour rester lisible
    const shortMsg = message.length > 240 ? `${message.slice(0, 240)}…` : message

    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen px-6 py-10"
        style={{ background: 'radial-gradient(ellipse at top, #1a0a0a 0%, #0a0a0f 60%)' }}
      >
        <div
          className="max-w-lg w-full p-8 rounded-xl text-center"
          style={{ background: '#0f0606', border: '1px solid #4a1818' }}
        >
          <p
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '1.6rem',
              color: '#e04040',
              letterSpacing: '0.08em',
              marginBottom: '0.5rem',
            }}
          >
            ☠ Something broke
          </p>
          <p
            style={{
              color: '#7a4040',
              fontSize: '0.85rem',
              fontStyle: 'italic',
              marginBottom: '1.5rem',
            }}
          >
            An unexpected error occurred. Your save is still on disk — try reloading first.
          </p>

          <div
            className="text-left p-3 rounded mb-6 overflow-auto"
            style={{
              background: '#0a0404',
              border: '1px solid #2a0808',
              maxHeight: '160px',
              fontFamily: 'monospace',
              fontSize: '0.78rem',
              color: '#c08080',
            }}
          >
            {shortMsg}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={this.handleReload}
              className="w-full py-3 rounded transition-all hover:opacity-90"
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '0.9rem',
                background: '#1a1208',
                color: '#d4af70',
                border: '1px solid #5a3818',
              }}
            >
              ↻ Reload page
            </button>

            <button
              onClick={this.handleResetSave}
              className="w-full py-2 rounded text-xs transition-all hover:opacity-90"
              style={{
                fontFamily: 'Cinzel, serif',
                background: 'transparent',
                color: '#5a2a2a',
                border: '1px solid #2a1010',
              }}
            >
              ⚠ Reset save (last resort)
            </button>

            {/* DX-ERRTRACK01 — copier le rapport d'erreur structuré (pour le signaler) */}
            <button
              onClick={this.handleCopyDetails}
              className="w-full py-2 rounded text-xs transition-all hover:opacity-90"
              style={{
                fontFamily: 'Cinzel, serif',
                background: 'transparent',
                color: '#5a4a3a',
                border: '1px solid #2a2018',
              }}
            >
              ⧉ Copy error details
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary
