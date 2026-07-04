import { STATUS_META } from './constants'

// B05 — petite rangée d'icônes d'effets actifs (cartes ennemi/héros)
export default function StatusIcons({ effects = [] }) {
  if (!effects || effects.length === 0) return null
  return (
    <div className="flex gap-1 justify-center" data-testid="status-icons">
      {effects.map((e) => {
        const meta = STATUS_META[e.type] ?? { icon: '❓', label: e.type }
        return (
          <span
            key={e.id ?? e.type}
            title={`${meta.label} · ${e.duration} turn${e.duration > 1 ? 's' : ''}`}
            style={{ fontSize: '0.8rem', lineHeight: 1 }}
          >
            {meta.icon}
            <span style={{ fontSize: '0.55rem', color: '#8a7a6a', marginLeft: '1px' }}>
              {e.duration}
            </span>
          </span>
        )
      })}
    </div>
  )
}
