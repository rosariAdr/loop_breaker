// MAP02 — Tests QTEBar (helpers purs + smoke composant)
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import QTEBar, { isInGreenZone, cursorPositionAt } from './QTEBar'

beforeEach(() => {
  vi.useFakeTimers()
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0)
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

// ── Helpers purs ─────────────────────────────────────────────────────────────
describe('isInGreenZone', () => {
  it('dans la zone → true', () => {
    expect(isInGreenZone(50, 42, 58)).toBe(true)
  })
  it('avant la zone → false', () => {
    expect(isInGreenZone(40, 42, 58)).toBe(false)
  })
  it('après la zone → false', () => {
    expect(isInGreenZone(60, 42, 58)).toBe(false)
  })
  it('exactement sur la borne de début → true (inclusif)', () => {
    expect(isInGreenZone(42, 42, 58)).toBe(true)
  })
  it('exactement sur la borne de fin → true (inclusif)', () => {
    expect(isInGreenZone(58, 42, 58)).toBe(true)
  })
})

describe('cursorPositionAt — ping-pong', () => {
  it('t=0 → 0%', () => {
    expect(cursorPositionAt(0, 1000)).toBe(0)
  })
  it('t=500ms (durée 1000) → 50%', () => {
    expect(cursorPositionAt(500, 1000)).toBe(50)
  })
  it('t=1000ms → 100% (arrivée)', () => {
    expect(cursorPositionAt(1000, 1000)).toBe(100)
  })
  it('t=1500ms (mi-retour) → 50%', () => {
    expect(cursorPositionAt(1500, 1000)).toBe(50)
  })
  it('t=2000ms (cycle complet) → 0%', () => {
    expect(cursorPositionAt(2000, 1000)).toBe(0)
  })
  it('t=2500ms → 50% (nouveau aller)', () => {
    expect(cursorPositionAt(2500, 1000)).toBe(50)
  })
})

// ── Smoke tests composant ────────────────────────────────────────────────────
describe('QTEBar — composant', () => {
  it('ne rend rien si open=false', () => {
    render(<QTEBar open={false} onSuccess={() => {}} onFailure={() => {}} />)
    expect(screen.queryByTestId('qte-modal')).toBeNull()
  })

  it('rend la modal, le track, la zone verte et le curseur si open=true', () => {
    render(<QTEBar open={true} onSuccess={() => {}} onFailure={() => {}} />)
    expect(screen.getByTestId('qte-modal')).toBeInTheDocument()
    expect(screen.getByTestId('qte-track')).toBeInTheDocument()
    expect(screen.getByTestId('qte-green-zone')).toBeInTheDocument()
    expect(screen.getByTestId('qte-cursor')).toBeInTheDocument()
  })

  it('affiche le bouton NOW', () => {
    render(<QTEBar open={true} onSuccess={() => {}} onFailure={() => {}} />)
    expect(screen.getByText(/NOW/i)).toBeInTheDocument()
  })

  it('position de la zone verte = props (zoneStart, zoneEnd)', () => {
    render(
      <QTEBar open={true} zoneStart={30} zoneEnd={50} onSuccess={() => {}} onFailure={() => {}} />,
    )
    const zone = screen.getByTestId('qte-green-zone')
    expect(zone.style.left).toBe('30%')
    expect(zone.style.width).toBe('20%') // 50 - 30
  })

  it('appel sur le bouton NOW déclenche success OU failure (selon cursor)', () => {
    const onSuccess = vi.fn()
    const onFailure = vi.fn()
    render(<QTEBar open={true} onSuccess={onSuccess} onFailure={onFailure} />)
    fireEvent.click(screen.getByText(/NOW/i))
    // Au moment T=0 le curseur est à 0% → hors zone (42-58) → failure
    expect(onFailure).toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('après resolution, click supplémentaire = no-op', () => {
    const onSuccess = vi.fn()
    const onFailure = vi.fn()
    render(<QTEBar open={true} onSuccess={onSuccess} onFailure={onFailure} />)
    fireEvent.click(screen.getByText(/NOW/i))
    fireEvent.click(screen.getByText(/NOW/i))
    // Resté à 1 appel chacun max
    const total = onSuccess.mock.calls.length + onFailure.mock.calls.length
    expect(total).toBe(1)
  })

  it("timeout déclenche onFailure('timeout') après timeoutMs", () => {
    const onFailure = vi.fn()
    render(<QTEBar open={true} timeoutMs={1000} onSuccess={() => {}} onFailure={onFailure} />)
    act(() => {
      vi.advanceTimersByTime(1100)
    })
    expect(onFailure).toHaveBeenCalledWith('timeout')
  })

  it('title et hint personnalisables', () => {
    render(
      <QTEBar
        open={true}
        title="Cross the road"
        hint="Be quick"
        onSuccess={() => {}}
        onFailure={() => {}}
      />,
    )
    expect(screen.getByText('Cross the road')).toBeInTheDocument()
    expect(screen.getByText('Be quick')).toBeInTheDocument()
  })
})
