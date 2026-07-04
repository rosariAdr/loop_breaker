// ── Composants utilitaires partagés des panneaux SafeZone ──────────────────────

export function Panel({ title, onBack, children }) {
  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          style={{ color: 'var(--ink-soft)', fontSize: '0.82rem', fontFamily: 'Cinzel, serif' }}
        >
          ← Back
        </button>
        <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--amber-deep)', fontSize: '1rem' }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}

export function InfoLine({ label, value }) {
  return (
    <div
      className="flex justify-between items-center py-1 border-b"
      style={{ borderColor: 'var(--parchment-shadow)' }}
    >
      <span style={{ color: 'var(--ink-soft)', fontSize: '0.82rem', fontFamily: 'Cinzel, serif' }}>
        {label}
      </span>
      <span style={{ color: 'var(--amber-deep)', fontSize: '0.85rem' }}>{value}</span>
    </div>
  )
}
