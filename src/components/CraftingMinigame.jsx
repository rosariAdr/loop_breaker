// CRF02 / CRF03 — Mini-jeu de crafting (modal).
// mode 'forge'   : curseur horizontal ping-pong, 3 frappes dans la zone verte (CRF03)
// mode 'alchemy' : jauge qui monte/descend, 1 arrêt dans la zone cible (CRF02)
// À la fin : onComplete({ accuracy, tier }) où tier vient de scoreToTier (CRF04).

import { useEffect, useRef, useState, useCallback } from 'react'
import { cursorPositionAt } from './QTEBar'
import { hitAccuracy, averageAccuracy, scoreToTier } from '../utils/crafting'

const TARGET_CENTER = 50
const HALF_WIDTH = 25 // zone tolérée ~25–75

export default function CraftingMinigame({
  open,
  mode = 'forge',
  durationMs = 1200,
  strikes = 3,
  title,
  hint,
  onComplete,
  onCancel,
}) {
  const [cursorPct, setCursorPct] = useState(0)
  const [hits, setHits] = useState([])
  const [resolved, setResolved] = useState(false)
  const startRef = useRef(null)
  const rafRef = useRef(null)

  const totalStrikes = mode === 'alchemy' ? 1 : strikes
  const isVertical = mode === 'alchemy'

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }, [])

  useEffect(() => {
    if (!open) {
      cleanup()
      setHits([])
      setResolved(false)
      setCursorPct(0)
      return
    }
    startRef.current = performance.now()
    const tick = () => {
      const elapsed = performance.now() - startRef.current
      setCursorPct(cursorPositionAt(elapsed, durationMs))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  const finish = (allHits) => {
    setResolved(true)
    cleanup()
    const accuracy = averageAccuracy(allHits)
    onComplete?.({ accuracy, tier: scoreToTier(accuracy) })
  }

  const handleStrike = () => {
    if (resolved) return
    const elapsed = performance.now() - startRef.current
    const cur = cursorPositionAt(elapsed, durationMs)
    const acc = hitAccuracy(cur, TARGET_CENTER, HALF_WIDTH)
    const next = [...hits, acc]
    if (next.length >= totalStrikes) finish(next)
    else setHits(next)
  }

  const zoneStart = TARGET_CENTER - HALF_WIDTH
  const zoneSize = HALF_WIDTH * 2
  const buttonLabel = mode === 'alchemy' ? '⚗️ STOP' : `🔨 STRIKE (${hits.length}/${totalStrikes})`

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="crafting-minigame"
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.8)' }}
    >
      <div
        className="w-full max-w-md mx-4 rounded-xl p-6 anim-pop"
        style={{ background: '#0a0808', border: '1px solid #3a2818' }}
      >
        <p
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '1.05rem',
            color: '#d4af70',
            letterSpacing: '0.05em',
            marginBottom: '0.4rem',
          }}
        >
          {title ??
            (mode === 'alchemy' ? 'Alchemy — Stop in the zone' : 'Forge — Strike the green zone')}
        </p>
        <p style={{ color: '#7a6a5a', fontSize: '0.78rem', marginBottom: '1.1rem' }}>
          {hint ??
            (mode === 'alchemy'
              ? 'Stop the liquid in the target band. Closer to center = better.'
              : 'Land 3 strikes in the green zone. Closer to center = better.')}
        </p>

        {/* Piste */}
        <div
          data-testid="minigame-track"
          className="relative rounded overflow-hidden"
          style={
            isVertical
              ? {
                  width: '40px',
                  height: '180px',
                  margin: '0 auto',
                  background: '#100808',
                  border: '1px solid #2a1810',
                }
              : { height: '32px', background: '#100808', border: '1px solid #2a1810' }
          }
        >
          {/* Zone cible */}
          <div
            className="absolute"
            style={
              isVertical
                ? {
                    bottom: `${zoneStart}%`,
                    height: `${zoneSize}%`,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(0deg, rgba(128,192,64,0.4), rgba(64,160,32,0.6))',
                    borderTop: '1px solid #80c040',
                    borderBottom: '1px solid #80c040',
                  }
                : {
                    left: `${zoneStart}%`,
                    width: `${zoneSize}%`,
                    top: 0,
                    height: '100%',
                    background:
                      'linear-gradient(180deg, rgba(128,192,64,0.4), rgba(64,160,32,0.6))',
                    borderLeft: '1px solid #80c040',
                    borderRight: '1px solid #80c040',
                  }
            }
          />
          {/* Curseur */}
          <div
            data-testid="minigame-cursor"
            className="absolute"
            style={
              isVertical
                ? {
                    bottom: `${cursorPct}%`,
                    height: '3px',
                    left: 0,
                    right: 0,
                    background: '#ffd060',
                    boxShadow: '0 0 8px #ffd060',
                  }
                : {
                    left: `${cursorPct}%`,
                    width: '3px',
                    top: 0,
                    height: '100%',
                    background: '#ffd060',
                    boxShadow: '0 0 8px #ffd060',
                    transform: 'translateX(-1.5px)',
                  }
            }
          />
        </div>

        <button
          onClick={handleStrike}
          data-testid="minigame-action"
          className="w-full mt-4 py-3 rounded text-sm transition-all hover:opacity-90"
          style={{
            fontFamily: 'Cinzel, serif',
            background: '#1a1208',
            color: '#d4af70',
            border: '1px solid #5a3818',
            letterSpacing: '0.05em',
          }}
        >
          {buttonLabel}
        </button>
        {onCancel && (
          <button
            onClick={() => {
              cleanup()
              onCancel()
            }}
            className="w-full mt-2 py-1.5 rounded text-xs"
            style={{ color: '#6a5a4a', fontFamily: 'Cinzel, serif' }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
