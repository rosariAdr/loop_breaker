import { FLOATING_COLORS } from './constants'

// ── B07 — Nombres flottants ──────────────────────────────────────────────────
export default function FloatingNumbers({ numbers }) {
  if (!numbers || numbers.length === 0) return null
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
      {numbers.map((n, i) => {
        const style = FLOATING_COLORS[n.type] ?? FLOATING_COLORS.damage
        return (
          <span
            key={n.id}
            className="absolute anim-float"
            style={{
              top: '10%',
              left: `${42 + (i % 3) * 8}%`, // légère offset pour éviter l'overlap
              fontFamily: 'Cinzel, serif',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: style.color,
              textShadow: `0 0 6px ${style.color}80, 0 2px 4px #000`,
              whiteSpace: 'nowrap',
            }}
          >
            {style.prefix}
            {n.amount}
          </span>
        )
      })}
    </div>
  )
}
