// SET01 — Menu Options / Réglages joueur (parchemin).
import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import ConfirmDialog from './ConfirmDialog'

export default function SettingsModal({ onClose }) {
  const animations = useGameStore((s) => s.meta.settings?.animations ?? true)
  const tutorials = useGameStore((s) => s.meta.settings?.tutorials ?? true)
  const setSetting = useGameStore((s) => s.setSetting)
  const resetGame = useGameStore((s) => s.resetGame)
  const [pendingReset, setPendingReset] = useState(false)

  return (
    <>
      <div className="sheet-scrim" style={{ zIndex: 95 }} onClick={onClose}>
        <div
          className="sheet"
          style={{ width: 460, maxWidth: '92%' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sheet-hd">
            <div className="sh-title">
              Options<span className="sh-meta">Settings</span>
            </div>
            <div className="sheet-x" onClick={onClose}>
              ✕
            </div>
          </div>
          <div
            style={{
              padding: 26,
              color: 'var(--ink)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div className="set-row">
              <div>
                <div className="inv-name" style={{ fontSize: 15 }}>
                  Animations
                </div>
                <div className="inv-sub">UI &amp; combat animations / transitions</div>
              </div>
              <button
                className={`set-toggle ${animations ? 'on' : ''}`}
                role="switch"
                aria-checked={animations}
                aria-label="Toggle animations"
                onClick={() => setSetting('animations', !animations)}
              >
                <span className="set-knob" />
              </button>
            </div>

            {/* ONB01 — tutoriel contextuel (tips one-shot) */}
            <div className="set-row">
              <div>
                <div className="inv-name" style={{ fontSize: 15 }}>
                  Tutorial hints
                </div>
                <div className="inv-sub">One-time tips on your first key actions</div>
              </div>
              <button
                className={`set-toggle ${tutorials ? 'on' : ''}`}
                role="switch"
                aria-checked={tutorials}
                aria-label="Toggle tutorial hints"
                onClick={() => setSetting('tutorials', !tutorials)}
              >
                <span className="set-knob" />
              </button>
            </div>

            <div className="sb-divider" />

            <div className="set-row">
              <div>
                <div className="inv-name" style={{ fontSize: 15, color: 'var(--danger)' }}>
                  Reset save
                </div>
                <div className="inv-sub">Delete all progress (hero, world, meta)</div>
              </div>
              <button
                className="inv-btn sell"
                style={{ width: 'auto' }}
                onClick={() => setPendingReset(true)}
              >
                ↺ Reset…
              </button>
            </div>

            <p className="inv-sub" style={{ marginTop: 4 }}>
              Text speed &amp; sound volume arrive with the dialogue &amp; audio systems.
            </p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={pendingReset}
        title="Reset all progress?"
        message="Your entire save will be deleted: hero, world, meta. This cannot be undone."
        confirmLabel="Reset everything"
        cancelLabel="Keep my save"
        variant="destructive"
        onConfirm={() => {
          resetGame()
          setPendingReset(false)
          onClose()
        }}
        onCancel={() => setPendingReset(false)}
      />
    </>
  )
}
