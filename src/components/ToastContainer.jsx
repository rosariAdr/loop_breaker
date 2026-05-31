// U01 — Conteneur de toasts (overlay bas-droit)
// Rendu réactif depuis useToastStore. Monté une fois dans App.jsx.

import { useToastStore } from '../store/toastStore'

const TYPE_STYLE = {
  loot:     { icon: '💎', color: '#80c040', border: '#304820', bg: '#0f1808' },
  levelup:  { icon: '✦',  color: '#60d0ff', border: '#1060b0', bg: '#08182a' },
  quest:    { icon: '📜', color: '#d4af70', border: '#5a4010', bg: '#1c1408' },
  divine:   { icon: '✦',  color: '#c084fc', border: '#4030a8', bg: '#1a0f28' },
  gluttony: { icon: '👹', color: '#e08060', border: '#6a3020', bg: '#1a0808' },
  warning:  { icon: '⚠',  color: '#e0a050', border: '#6a4818', bg: '#1a1408' },
  error:    { icon: '✕',  color: '#e04040', border: '#5a2020', bg: '#1a0808' },
  info:     { icon: 'ℹ',  color: '#a0a0c0', border: '#2a2a4a', bg: '#0a0a14' },
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div
      data-testid="toast-container"
      className="fixed flex flex-col gap-2 z-[150] pointer-events-none"
      style={{ bottom: '16px', right: '16px', maxWidth: '320px' }}
    >
      {toasts.map((toast) => {
        const style = TYPE_STYLE[toast.type] ?? TYPE_STYLE.info
        return (
          <div
            key={toast.id}
            data-testid="toast"
            role="status"
            onClick={() => removeToast(toast.id)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg anim-pop pointer-events-auto cursor-pointer"
            style={{
              background: style.bg,
              border: `1px solid ${style.border}`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            }}
          >
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{style.icon}</span>
            <span
              style={{
                fontFamily: 'Crimson Text, serif',
                fontSize: '0.82rem',
                color: style.color,
                lineHeight: 1.3,
              }}
            >
              {toast.message}
            </span>
          </div>
        )
      })}
    </div>
  )
}
