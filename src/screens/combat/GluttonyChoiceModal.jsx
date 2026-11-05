import { MONSTERS } from '../../data/monsters'
import { GLUTTONY_STATS } from '../../engine/gluttony'

// ── GLT02 — Modal de choix Gluttony (assassinat) ──────────────────────────────
export default function GluttonyChoiceModal({ monsterId, onChoose }) {
  const monster = MONSTERS[monsterId]
  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="gluttony-choice"
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.82)' }}
    >
      <div
        className="w-full max-w-sm mx-4 rounded-xl p-6 anim-pop"
        style={{ background: '#120808', border: '1px solid #6a3020' }}
      >
        <p
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '1.1rem',
            color: '#e08060',
            letterSpacing: '0.05em',
            marginBottom: '0.3rem',
          }}
        >
          👹 Gluttony — Assassination!
        </p>
        <p style={{ color: '#9a7060', fontSize: '0.8rem', marginBottom: '1.1rem' }}>
          You devour the essence of {monster?.name ?? 'the slain foe'}. Choose a stat to absorb —
          permanently.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {GLUTTONY_STATS.map((stat) => (
            <button
              key={stat}
              data-testid={`gluttony-stat-${stat}`}
              onClick={() => onChoose(stat)}
              className="py-2.5 rounded text-sm transition-all hover:opacity-90"
              style={{
                fontFamily: 'Cinzel, serif',
                background: '#1a0c08',
                color: '#e0a070',
                border: '1px solid #6a3020',
                textTransform: 'capitalize',
              }}
            >
              {stat}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
