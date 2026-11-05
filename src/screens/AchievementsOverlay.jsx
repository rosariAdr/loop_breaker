// META-ACHIEVE02 — Écran de consultation des accomplissements (pattern Codex).
// Liste les succès ACH01 + progression + récompense méta.
import { useGameStore } from '../store/gameStore'
import { ACHIEVEMENTS, getAchievementStats } from '../data/achievements'

export default function AchievementsOverlay({ onClose }) {
  const state = useGameStore()
  const setScreen = useGameStore((s) => s.setScreen)
  const back = onClose ?? (() => setScreen('world_map'))
  const stats = getAchievementStats(state)
  const earned = state.meta?.achievements ?? []
  const list = Object.values(ACHIEVEMENTS)
  const unlockedCount = list.filter((a) => earned.includes(a.id)).length

  return (
    <div className="sheet-scrim" onClick={back}>
      <div
        className="sheet"
        style={{ width: 720, maxWidth: '94%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-hd">
          <div className="sh-title">
            🏆 Achievements
            <span className="sh-meta">
              {unlockedCount} / {list.length} unlocked
            </span>
          </div>
          <div className="sheet-x" onClick={back}>
            ✕
          </div>
        </div>
        <div
          className="sheet-body"
          style={{ display: 'block', overflowY: 'auto' }}
          data-testid="achievements-list"
        >
          {list.map((a) => {
            const done = earned.includes(a.id)
            const cur = Math.min(stats[a.metric] ?? 0, a.target)
            const pct = a.target > 0 ? Math.min(1, (stats[a.metric] ?? 0) / a.target) : 0
            return (
              <div
                key={a.id}
                data-testid={`ach-${a.id}`}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  padding: '10px 4px',
                  borderBottom: '1px solid var(--parchment-shadow)',
                  opacity: done ? 1 : 0.9,
                }}
              >
                <span style={{ fontSize: 20 }}>{done ? '🏆' : '🔒'}</span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-head)',
                      color: done ? 'var(--gold)' : 'var(--ink)',
                    }}
                  >
                    {a.name}
                    {done && <span data-testid={`ach-done-${a.id}`}> ✓</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{a.desc}</div>
                  <div
                    style={{
                      height: 5,
                      background: 'rgba(61,43,31,.18)',
                      borderRadius: 4,
                      overflow: 'hidden',
                      marginTop: 4,
                    }}
                  >
                    <i
                      style={{
                        display: 'block',
                        height: '100%',
                        width: `${pct * 100}%`,
                        background: done ? 'var(--forest-deep)' : 'var(--amber)',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>
                    {cur} / {a.target}
                    {a.reward?.stat ? ` · +${a.reward.stat.amount} ${a.reward.stat.name}` : ''}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
