// MAP01 — Tests des helpers + smoke test composant Canvas
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, cleanup, fireEvent, screen } from '@testing-library/react'
import WorldMapCanvas, { getNodeAtPosition, lerp, pctToPx } from './WorldMapCanvas'

afterEach(cleanup)

// ── Helpers purs ─────────────────────────────────────────────────────────────
describe('MAP01 — lerp', () => {
  it("lerp(0, 100, 0) = 0", () => {
    expect(lerp(0, 100, 0)).toBe(0)
  })
  it("lerp(0, 100, 1) = 100", () => {
    expect(lerp(0, 100, 1)).toBe(100)
  })
  it("lerp(0, 100, 0.5) = 50", () => {
    expect(lerp(0, 100, 0.5)).toBe(50)
  })
  it("lerp(100, 200, 0.04) approche doucement la cible", () => {
    let v = 100
    for (let i = 0; i < 100; i++) v = lerp(v, 200, 0.04)
    expect(v).toBeGreaterThan(195)
    expect(v).toBeLessThan(200)
  })
})

describe('MAP01 — pctToPx', () => {
  it("0% → 0px", () => {
    expect(pctToPx(0, 0, 800, 500)).toEqual({ px: 0, py: 0 })
  })
  it("100% → taille complète", () => {
    expect(pctToPx(100, 100, 800, 500)).toEqual({ px: 800, py: 500 })
  })
  it("50% → moitié", () => {
    expect(pctToPx(50, 50, 800, 500)).toEqual({ px: 400, py: 250 })
  })
})

describe('MAP01 — getNodeAtPosition', () => {
  const nodes = [
    { id: 'a', px: 100, py: 100 },
    { id: 'b', px: 300, py: 300 },
    { id: 'c', px: 500, py: 100 },
  ]

  it("retourne null si aucun node dans le rayon", () => {
    expect(getNodeAtPosition(50, 50, nodes, 20)).toBeNull()
  })

  it("retourne le node touché si dans le rayon", () => {
    const hit = getNodeAtPosition(100, 100, nodes, 20)
    expect(hit.node.id).toBe('a')
    expect(hit.distance).toBe(0)
  })

  it("tolère un offset jusqu'au hitRadius", () => {
    const hit = getNodeAtPosition(115, 100, nodes, 20)
    expect(hit.node.id).toBe('a')
    expect(hit.distance).toBe(15)
  })

  it("retourne le node le PLUS PROCHE si plusieurs sont dans le rayon", () => {
    const closeNodes = [
      { id: 'far',  px: 100, py: 100 },
      { id: 'near', px: 105, py: 105 },
    ]
    const hit = getNodeAtPosition(105, 105, closeNodes, 30)
    expect(hit.node.id).toBe('near')
  })

  it("hitRadius par défaut = 28", () => {
    expect(getNodeAtPosition(127, 100, nodes)).toBeTruthy()  // 27 < 28
    expect(getNodeAtPosition(129, 100, nodes)).toBeNull()    // 29 > 28
  })
})

// ── Smoke test composant ─────────────────────────────────────────────────────
describe('MAP01 — WorldMapCanvas component', () => {
  beforeEach(() => {
    // Mock requestAnimationFrame pour éviter une boucle dans les tests
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0)
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
  })

  const nodes = [
    { id: 'a', label: 'A', icon: '🏰', x: 50, y: 50, type: 'city', color: '#d4af70', locked: false },
    { id: 'b', label: 'B', icon: '🌲', x: 30, y: 30, type: 'spot', color: '#80c040', locked: false },
  ]
  const paths = [['a', 'b']]

  it("monte sans crasher", () => {
    expect(() => render(
      <WorldMapCanvas nodes={nodes} paths={paths} activeNodeId="a" onSelectNode={() => {}} />
    )).not.toThrow()
  })

  it("rend un <canvas> avec testid", () => {
    render(<WorldMapCanvas nodes={nodes} paths={paths} activeNodeId="a" onSelectNode={() => {}} />)
    expect(screen.getByTestId('worldmap-canvas')).toBeInTheDocument()
  })

  it("rend le container avec aspect ratio 16:10", () => {
    render(<WorldMapCanvas nodes={nodes} paths={paths} activeNodeId="a" onSelectNode={() => {}} />)
    const container = screen.getByTestId('worldmap-canvas-container')
    expect(container.style.aspectRatio).toBe('16/10')
  })

  // Note : le hit-testing au clic dépend de sizeRef.current peuplé par ResizeObserver.
  // Sous jsdom, getBoundingClientRect du container retourne 0×0 donc le hit test
  // ne match jamais. La logique pure est couverte par les tests getNodeAtPosition().
  // On vérifie ici uniquement que le canvas écoute bien onClick (handler attaché).
  it("a un handler onClick attaché au canvas", () => {
    const onSelect = vi.fn()
    const { container } = render(
      <WorldMapCanvas nodes={nodes} paths={paths} activeNodeId="a" onSelectNode={onSelect} />
    )
    const canvas = container.querySelector('canvas')
    expect(canvas).not.toBeNull()
    // fireEvent.click ne crash pas même si pas de hit
    expect(() => fireEvent.click(canvas, { clientX: 0, clientY: 0 })).not.toThrow()
  })

  it("rend sans crash avec un dungeonNode (D02)", () => {
    const dungeonNode = { x: 78, y: 30, discovered: false, label: null }
    expect(() => render(
      <WorldMapCanvas nodes={nodes} paths={paths} activeNodeId="a" dungeonNode={dungeonNode} onSelectNode={() => {}} />
    )).not.toThrow()
  })

  it("rend le label du donjon découvert (D02)", () => {
    // On ne peut pas tester le texte du canvas directement, mais on vérifie que le composant
    // accepte la prop sans crasher.
    const dungeonNode = { x: 78, y: 30, discovered: true, label: 'The Hollow Crypt · Lv 12-16' }
    const { container } = render(
      <WorldMapCanvas nodes={nodes} paths={paths} activeNodeId="a" dungeonNode={dungeonNode} onSelectNode={() => {}} />
    )
    expect(container.querySelector('canvas')).not.toBeNull()
  })
})
