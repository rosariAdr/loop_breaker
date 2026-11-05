import { LOG_COLORS } from './constants'

// ── Log de combat ─────────────────────────────────────────────────────────────
export default function CombatLog({ log }) {
  return (
    <div
      className="mx-4 mb-3 rounded-xl overflow-hidden"
      style={{ background: '#05050a', border: '1px solid #181428' }}
    >
      <div className="px-3 py-1 border-b" style={{ borderColor: '#181428', background: '#080810' }}>
        <span
          style={{
            color: '#3a3058',
            fontSize: '0.62rem',
            fontFamily: 'Cinzel, serif',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Combat Log
        </span>
      </div>
      <div className="px-4 py-2.5 overflow-y-auto" style={{ maxHeight: '160px' }}>
        {log.length === 0 && (
          <p style={{ color: '#2a2038', fontSize: '0.82rem', fontStyle: 'italic' }}>
            Awaiting action...
          </p>
        )}
        {log.map((entry, i) => (
          <p
            key={entry.id}
            style={{
              fontSize: '0.82rem',
              color: LOG_COLORS[entry.type] ?? LOG_COLORS.info,
              marginBottom: '0.25rem',
              opacity: i === 0 ? 1 : Math.max(0.3, 1 - i * 0.08),
              lineHeight: '1.4',
              transition: 'opacity 0.3s ease',
              // UX-COMBATLOG01 — accent latéral coloré par type (scannable) + dernière action en gras
              borderLeft: `3px solid ${LOG_COLORS[entry.type] ?? LOG_COLORS.info}`,
              paddingLeft: '7px',
              fontWeight: i === 0 ? 600 : 400,
            }}
          >
            {entry.text}
          </p>
        ))}
      </div>
    </div>
  )
}
