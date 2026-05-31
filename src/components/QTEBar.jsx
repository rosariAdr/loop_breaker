// MAP02 — QTE Bar (Quick-Time Event)
// Barre horizontale qui balaie de gauche à droite, une zone verte au milieu.
// Clic dans la zone verte = succès. Clic hors zone ou timeout = échec.

import { useEffect, useRef, useState, useCallback } from 'react'

// ── Helpers purs (testables) ────────────────────────────────────────────────

/**
 * Vérifie si la position du curseur est dans la zone verte.
 * @param {number} cursorPct — position 0–100
 * @param {number} zoneStart — début zone 0–100
 * @param {number} zoneEnd — fin zone 0–100
 */
export function isInGreenZone(cursorPct, zoneStart, zoneEnd) {
  return cursorPct >= zoneStart && cursorPct <= zoneEnd
}

/**
 * Calcule la position du curseur à l'instant t (ms écoulés depuis start).
 * Le curseur va de 0 à 100 en `durationMs`, puis 100 à 0, etc. (ping-pong).
 */
export function cursorPositionAt(elapsedMs, durationMs) {
  const cycle = elapsedMs % (durationMs * 2)
  return cycle < durationMs
    ? (cycle / durationMs) * 100
    : 100 - ((cycle - durationMs) / durationMs) * 100
}

// ── Composant ───────────────────────────────────────────────────────────────

export default function QTEBar({
  open,
  durationMs = 1400,         // temps pour parcourir 0→100
  zoneStart = 42,             // début zone verte
  zoneEnd = 58,               // fin zone verte
  timeoutMs = 4000,           // échec automatique après ce délai
  title = 'Time it right!',
  hint = 'Click when the cursor is in the green zone',
  onSuccess,
  onFailure,
}) {
  const [cursorPct, setCursorPct] = useState(0)
  const [resolved, setResolved] = useState(false)
  const startTimeRef = useRef(null)
  const rafRef = useRef(null)
  const timeoutRef = useRef(null)

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    rafRef.current = null
    timeoutRef.current = null
  }, [])

  useEffect(() => {
    if (!open) {
      cleanup()
      setResolved(false)
      return
    }
    startTimeRef.current = performance.now()
    const tick = () => {
      const elapsed = performance.now() - startTimeRef.current
      setCursorPct(cursorPositionAt(elapsed, durationMs))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    timeoutRef.current = setTimeout(() => {
      if (!resolved) {
        setResolved(true)
        cleanup()
        onFailure?.('timeout')
      }
    }, timeoutMs)
    return cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  const handleClick = () => {
    if (resolved) return
    setResolved(true)
    cleanup()
    const elapsed = performance.now() - startTimeRef.current
    const cur = cursorPositionAt(elapsed, durationMs)
    if (isInGreenZone(cur, zoneStart, zoneEnd)) {
      onSuccess?.({ cursorPct: cur })
    } else {
      onFailure?.('missed', { cursorPct: cur })
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="qte-modal"
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.78)' }}
    >
      <div
        className="w-full max-w-md mx-4 rounded-xl p-6 anim-pop"
        style={{ background: '#0a0808', border: '1px solid #3a2818' }}
      >
        <p style={{ fontFamily: 'Cinzel, serif', fontSize: '1.05rem', color: '#d4af70', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          {title}
        </p>
        <p style={{ color: '#7a6a5a', fontSize: '0.78rem', marginBottom: '1.25rem' }}>
          {hint}
        </p>

        <div
          data-testid="qte-track"
          className="relative rounded overflow-hidden"
          style={{ height: '32px', background: '#100808', border: '1px solid #2a1810' }}
        >
          {/* Zone verte */}
          <div
            data-testid="qte-green-zone"
            className="absolute top-0 h-full"
            style={{
              left: `${zoneStart}%`,
              width: `${zoneEnd - zoneStart}%`,
              background: 'linear-gradient(180deg, rgba(128,192,64,0.4), rgba(64,160,32,0.6))',
              borderLeft: '1px solid #80c040',
              borderRight: '1px solid #80c040',
            }}
          />
          {/* Curseur */}
          <div
            data-testid="qte-cursor"
            className="absolute top-0 h-full"
            style={{
              left: `${cursorPct}%`,
              width: '3px',
              background: '#ffd060',
              boxShadow: '0 0 8px #ffd060',
              transform: 'translateX(-1.5px)',
            }}
          />
        </div>

        <button
          onClick={handleClick}
          className="w-full mt-4 py-3 rounded text-sm transition-all hover:opacity-90"
          style={{
            fontFamily: 'Cinzel, serif',
            background: '#1a1208',
            color: '#d4af70',
            border: '1px solid #5a3818',
            letterSpacing: '0.05em',
          }}
        >
          ⚡ NOW!
        </button>
      </div>
    </div>
  )
}
