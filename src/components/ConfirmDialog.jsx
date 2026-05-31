// UX03 — Modal de confirmation pour actions destructives
// Pattern : <ConfirmDialog open={x} onConfirm={...} onCancel={...} ... />

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'destructive', // 'destructive' (red) | 'warn' (orange) | 'info' (gold)
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  const palette = {
    destructive: { border: '#5a1818', accent: '#c04040', confirmBg: '#1a0808', confirmColor: '#e06060' },
    warn:        { border: '#5a4818', accent: '#c08040', confirmBg: '#1a1408', confirmColor: '#e0a050' },
    info:        { border: '#5a3818', accent: '#d4af70', confirmBg: '#1a1208', confirmColor: '#d4af70' },
  }[variant] ?? { border: '#5a3818', accent: '#d4af70', confirmBg: '#1a1208', confirmColor: '#d4af70' }

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="confirm-dialog"
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.78)' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm mx-4 rounded-xl p-6 anim-pop"
        style={{ background: '#0a0808', border: `1px solid ${palette.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <p
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '1.05rem',
            color: palette.accent,
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
          }}
        >
          {title}
        </p>
        {message && (
          <p style={{ color: '#8a7a6a', fontSize: '0.82rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            {message}
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded text-sm transition-all hover:opacity-90"
            style={{
              fontFamily: 'Cinzel, serif',
              background: '#0f0c08',
              color: '#6a5a4a',
              border: '1px solid #2a2018',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded text-sm transition-all hover:opacity-90"
            style={{
              fontFamily: 'Cinzel, serif',
              background: palette.confirmBg,
              color: palette.confirmColor,
              border: `1px solid ${palette.border}`,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
