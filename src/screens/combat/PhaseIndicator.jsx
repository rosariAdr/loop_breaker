// ── Indicateur de phase ────────────────────────────────────────────────────────
export default function PhaseIndicator({ phase, turnCount }) {
  const isEnemy = phase === 'enemy'
  return (
    <div
      className="flex items-center gap-2.5 px-5 py-2 rounded-full"
      style={{
        background: isEnemy ? '#1c0808' : '#081408',
        border: `1px solid ${isEnemy ? '#5a1c1c' : '#1c4a1c'}`,
        boxShadow: isEnemy ? '0 0 16px rgba(192,48,48,0.15)' : '0 0 16px rgba(48,192,48,0.12)',
        transition: 'all 0.3s ease',
        minWidth: '160px',
        justifyContent: 'center',
      }}
    >
      <span
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{
          background: isEnemy ? '#e04040' : '#40d060',
          boxShadow: isEnemy ? '0 0 8px #e04040' : '0 0 8px #40d060',
          animation: 'pulse 1.2s infinite',
        }}
      />
      <span
        style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '0.78rem',
          color: isEnemy ? '#e06050' : '#60d070',
          letterSpacing: '0.08em',
        }}
      >
        {isEnemy ? 'Enemy Turn' : 'Your Turn'}
        <span
          style={{ color: isEnemy ? '#6a3028' : '#2a6038', marginLeft: '6px', fontSize: '0.7rem' }}
        >
          T{turnCount}
        </span>
      </span>
    </div>
  )
}
