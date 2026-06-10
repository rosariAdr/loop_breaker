// IDLE-OFF — récap des gains accumulés hors-ligne (affiché au retour).
import { useGameStore } from '../store/gameStore'
import { RESOURCES } from '../data/resources'

export default function OfflineRecapModal() {
  const summary = useGameStore((s) => s.meta.offlineSummary)
  const clear = useGameStore((s) => s.clearOfflineSummary)
  if (!summary) return null

  const res = Object.entries(summary.resources || {})

  return (
    <div className="sheet-scrim" style={{ zIndex: 90 }} onClick={clear}>
      <div
        className="sheet"
        style={{ width: 480, maxWidth: '92%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-hd">
          <div className="sh-title">
            While you were away<span className="sh-meta">Idle progress</span>
          </div>
        </div>
        <div style={{ padding: 26, color: 'var(--ink)' }}>
          <p className="inv-sub" style={{ marginBottom: 16 }}>
            Your hunt against {summary.monsterName} continued in your absence.
          </p>
          <div className="derived" style={{ marginBottom: res.length ? 18 : 0 }}>
            <div className="dv">
              <div className="dv-num">{summary.kills}</div>
              <div className="dv-lbl">Kills</div>
            </div>
            <div className="dv">
              <div className="dv-num" style={{ color: 'var(--gold)' }}>
                {summary.gold}
              </div>
              <div className="dv-lbl">Gold</div>
            </div>
            <div className="dv">
              <div className="dv-num">{summary.xp}</div>
              <div className="dv-lbl">XP</div>
            </div>
          </div>
          {res.length > 0 && (
            <>
              <div className="pb-title">Loot</div>
              <div className="hs-titles">
                {res.map(([id, qty]) => (
                  <span key={id} className="hs-title-chip legacy">
                    {RESOURCES[id]?.name ?? id} ×{qty}
                  </span>
                ))}
              </div>
            </>
          )}
          <button className="pbtn primary wide" style={{ marginTop: 22 }} onClick={clear}>
            Collect
          </button>
        </div>
      </div>
    </div>
  )
}
