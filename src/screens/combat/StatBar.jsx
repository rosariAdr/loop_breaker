// ── Barre de stat (HP / MP) du héros ─────────────────────────────────────────
export default function StatBar({ value, max, color, label, width = 160, flash = false }) {
  const pct = Math.max(0, Math.min(1, value / max))
  const isLow = pct < 0.25
  return (
    <div className="flex items-center gap-2 mb-2">
      <span
        style={{
          color: '#6a5a4a',
          fontSize: '0.7rem',
          width: '20px',
          fontFamily: 'Cinzel, serif',
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div
        className="rounded overflow-hidden flex-shrink-0"
        style={{ width, height: '10px', background: '#1a1410' }}
      >
        <div
          className="h-full rounded transition-all duration-300"
          style={{
            width: `${pct * 100}%`,
            background:
              flash && label === 'HP' ? '#ff2020' : isLow && label === 'HP' ? '#ff3030' : color,
            boxShadow: pct > 0 ? `0 0 8px ${color}70` : 'none',
          }}
        />
      </div>
      <span
        style={{
          color: isLow && label === 'HP' ? '#c06060' : '#6a5a4a',
          fontSize: '0.7rem',
          minWidth: '58px',
          flexShrink: 0,
        }}
      >
        {value}/{max}
      </span>
    </div>
  )
}
