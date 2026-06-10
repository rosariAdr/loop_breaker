// MAP01 — WorldMap Canvas 2D
// Migration depuis le SVG statique vers Canvas avec : héros lerp, click-to-move,
// safe zones glow, routes animées (dashoffset), marker "?" donjon, particles au clic.

import { useEffect, useRef, useState, useCallback } from 'react'

// ── Helpers PURES (testables sans DOM) ──────────────────────────────────────

// Trouve le node le plus proche d'un point (x, y) en pixels.
// Retourne { node, distance } ou null si aucun n'est dans le rayon hitRadius (en px).
export function getNodeAtPosition(x, y, nodes, hitRadius = 28) {
  let best = null
  for (const node of nodes) {
    const dx = x - node.px
    const dy = y - node.py
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist <= hitRadius && (!best || dist < best.distance)) {
      best = { node, distance: dist }
    }
  }
  return best
}

// Lerp scalar : interpolation linéaire entre a et b avec facteur t.
export function lerp(a, b, t) {
  return a + (b - a) * t
}

// Conversion % → pixels selon la taille du canvas. Retourne {px, py}.
export function pctToPx(pctX, pctY, width, height) {
  return { px: (pctX / 100) * width, py: (pctY / 100) * height }
}

// ── Composant Canvas principal ──────────────────────────────────────────────

export default function WorldMapCanvas({
  nodes, // [{ id, label, sublabel, x, y, type, color, locked }]
  paths, // [[fromId, toId], ...]
  activeNodeId,
  dungeonNode, // { x, y, discovered } | null
  onSelectNode, // (node) => void
}) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const rafRef = useRef(null)
  const heroPosRef = useRef({ x: 0, y: 0, initialized: false })
  const targetIdRef = useRef(activeNodeId)
  const particlesRef = useRef([]) // [{x, y, vx, vy, life, maxLife}]
  const dashOffsetRef = useRef(0)
  const sizeRef = useRef({ width: 780, height: 488 }) // 16:10

  const [hoveredNodeId, setHoveredNodeId] = useState(null)

  // Update target lerp si activeNodeId change
  useEffect(() => {
    targetIdRef.current = activeNodeId
  }, [activeNodeId])

  // ── Boucle rAF + draw ─────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = sizeRef.current
    const dpr = window.devicePixelRatio || 1

    // Reset transform + clear
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    // Background gradient
    const grad = ctx.createRadialGradient(
      width * 0.4,
      height * 0.4,
      0,
      width * 0.5,
      height * 0.5,
      Math.max(width, height) * 0.7,
    )
    grad.addColorStop(0, '#111208')
    grad.addColorStop(0.6, '#0a0c08')
    grad.addColorStop(1, '#080a06')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)

    // Grille de fond subtile
    ctx.fillStyle = 'rgba(26, 24, 16, 0.4)'
    for (let gx = 14; gx < width; gx += 28) {
      for (let gy = 14; gy < height; gy += 28) {
        ctx.beginPath()
        ctx.arc(gx, gy, 1, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // ── Routes (lignes pointillées animées) ──
    const placedNodes = nodes.map((n) => ({ ...n, ...pctToPx(n.x, n.y, width, height) }))
    const placedById = Object.fromEntries(placedNodes.map((n) => [n.id, n]))

    dashOffsetRef.current = (dashOffsetRef.current + 0.4) % 16
    ctx.strokeStyle = '#2a2518'
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 4])
    ctx.lineDashOffset = -dashOffsetRef.current
    for (const [a, b] of paths) {
      const na = placedById[a]
      const nb = placedById[b]
      if (!na || !nb) continue
      ctx.beginPath()
      ctx.moveTo(na.px, na.py)
      ctx.lineTo(nb.px, nb.py)
      ctx.stroke()
    }
    ctx.setLineDash([])

    // ── Marker donjon "?" / "!" (toujours cliquable) ──
    if (dungeonNode) {
      const dx = (dungeonNode.x / 100) * width
      const dy = (dungeonNode.y / 100) * height
      const isHov = hoveredNodeId === '__dungeon__'
      ctx.beginPath()
      ctx.arc(dx, dy, isHov ? 16 : 14, 0, Math.PI * 2)
      ctx.fillStyle = dungeonNode.discovered ? '#3a1818' : '#1a0a0a'
      ctx.fill()
      ctx.strokeStyle = dungeonNode.discovered ? '#8a4030' : '#4a2818'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.fillStyle = dungeonNode.discovered ? '#e08060' : '#6a4828'
      ctx.font = 'bold 16px Cinzel, serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(dungeonNode.discovered ? '!' : '?', dx, dy + 1)
      // Label sous le marker quand découvert
      if (dungeonNode.discovered && dungeonNode.label) {
        ctx.font = '10px Cinzel, serif'
        ctx.fillStyle = '#8a4030'
        ctx.textBaseline = 'top'
        ctx.fillText(dungeonNode.label, dx, dy + 18)
      }
    }

    // ── Nodes (cercles colorés + glow si actif) ──
    for (const node of placedNodes) {
      const isActive = node.id === activeNodeId
      const isHovered = node.id === hoveredNodeId
      const isLocked = node.locked

      // Glow si actif (radial)
      if (isActive) {
        const glow = ctx.createRadialGradient(node.px, node.py, 0, node.px, node.py, 32)
        glow.addColorStop(0, `${node.color}50`)
        glow.addColorStop(1, `${node.color}00`)
        ctx.fillStyle = glow
        ctx.fillRect(node.px - 32, node.py - 32, 64, 64)
      }

      // Cercle principal
      ctx.beginPath()
      ctx.arc(node.px, node.py, isHovered ? 20 : 18, 0, Math.PI * 2)
      ctx.fillStyle = isActive ? '#1a2010' : '#101008'
      ctx.fill()
      ctx.strokeStyle = isLocked ? '#1a1410' : isActive ? node.color : '#3a3020'
      ctx.lineWidth = 2
      ctx.stroke()

      // Icône emoji centrée
      ctx.font = '18px serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = isLocked ? '#3a3020' : '#d4af70'
      ctx.fillText(node.icon ?? '•', node.px, node.py + 1)

      // Label sous le node
      ctx.font = '10px Cinzel, serif'
      ctx.fillStyle = isActive ? node.color : isLocked ? '#3a3020' : '#6a5a3a'
      ctx.textBaseline = 'top'
      ctx.fillText(node.label, node.px, node.py + 24)
      if (node.sublabel) {
        ctx.font = 'italic 8px Crimson Text, serif'
        ctx.fillStyle = '#4a3a2a'
        ctx.fillText(node.sublabel, node.px, node.py + 36)
      }
    }

    // ── Héros : lerp vers position cible ──
    const target = placedById[targetIdRef.current]
    if (target) {
      const hp = heroPosRef.current
      if (!hp.initialized) {
        hp.x = target.px
        hp.y = target.py
        hp.initialized = true
      } else {
        hp.x = lerp(hp.x, target.px, 0.04)
        hp.y = lerp(hp.y, target.py, 0.04)
      }

      // Pulse halo
      const pulse = (Math.sin(performance.now() * 0.005) + 1) * 0.5
      ctx.beginPath()
      ctx.arc(hp.x, hp.y - 14, 10 + pulse * 2, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(192,64,64,${0.3 + pulse * 0.2})`
      ctx.fill()
      ctx.beginPath()
      ctx.arc(hp.x, hp.y - 14, 7, 0, Math.PI * 2)
      ctx.fillStyle = '#c04040'
      ctx.fill()
      ctx.strokeStyle = '#ff6060'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.font = 'bold 9px Cinzel, serif'
      ctx.fillStyle = '#1a0808'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('⚔', hp.x, hp.y - 14)
    }

    // ── Particles (destination click) ──
    const alive = []
    for (const p of particlesRef.current) {
      p.life -= 1
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.05 // gravité légère
      if (p.life > 0) alive.push(p)
      const alpha = p.life / p.maxLife
      ctx.beginPath()
      ctx.arc(p.x, p.y, 2 + alpha, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(212,175,112,${alpha * 0.8})`
      ctx.fill()
    }
    particlesRef.current = alive
  }, [nodes, paths, activeNodeId, dungeonNode, hoveredNodeId])

  // ── Setup canvas + ResizeObserver ─────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      const rect = container.getBoundingClientRect()
      const w = rect.width
      const h = w * (10 / 16) // ratio 16:10
      sizeRef.current = { width: w, height: h }
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    }

    resize()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
    if (ro) ro.observe(container)

    // Boucle d'animation : draw() à chaque frame
    const loop = () => {
      draw()
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (ro) ro.disconnect()
    }
  }, [draw])

  // ── Gestion des interactions ──────────────────────────────────────────────
  const getMousePos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  // D02 — Construit la liste augmentée avec le marker donjon (id virtuel '__dungeon__')
  const getClickableNodes = (width, height) => {
    const placed = nodes.map((n) => ({ ...n, ...pctToPx(n.x, n.y, width, height) }))
    if (dungeonNode) {
      placed.push({
        id: '__dungeon__',
        type: 'dungeon',
        x: dungeonNode.x,
        y: dungeonNode.y,
        ...pctToPx(dungeonNode.x, dungeonNode.y, width, height),
        locked: false,
      })
    }
    return placed
  }

  const handleClick = (e) => {
    const { width, height } = sizeRef.current
    const { x, y } = getMousePos(e)
    const clickables = getClickableNodes(width, height)
    const hit = getNodeAtPosition(x, y, clickables)
    if (hit && !hit.node.locked) {
      // Particles au point de destination
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2
        const speed = 0.8 + Math.random() * 1.2
        particlesRef.current.push({
          x: hit.node.px,
          y: hit.node.py,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5,
          life: 35,
          maxLife: 35,
        })
      }
      onSelectNode?.(hit.node)
    }
  }

  const handleMouseMove = (e) => {
    const { width, height } = sizeRef.current
    const { x, y } = getMousePos(e)
    const clickables = getClickableNodes(width, height)
    const hit = getNodeAtPosition(x, y, clickables)
    setHoveredNodeId(hit?.node.id ?? null)
    if (canvasRef.current) {
      canvasRef.current.style.cursor = hit && !hit.node.locked ? 'pointer' : 'default'
    }
  }

  return (
    <div
      ref={containerRef}
      data-testid="worldmap-canvas-container"
      className="relative rounded-lg overflow-hidden"
      style={{
        border: '1px solid #2a2818',
        width: '100%',
        maxWidth: '780px',
        aspectRatio: '16/10',
      }}
    >
      <canvas
        ref={canvasRef}
        data-testid="worldmap-canvas"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredNodeId(null)}
      />
      {/* Label région en overlay */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '8px',
          left: '12px',
          fontSize: '0.65rem',
          color: '#3a3020',
          fontFamily: 'Cinzel, serif',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        Ashenvale Region
      </div>
    </div>
  )
}
