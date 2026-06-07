import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { MONSTERS } from '../data/monsters'
import QTEBar from '../components/QTEBar'
import { HeroAvatar } from '../components/parchment'
import { POS, NODES, EDGES, areAdjacent } from '../data/worldGraph'

const HERO_SPRITE = '/sprites/hero/idle/00.png'

// Marqueur discret (anneau + plaque de nom) — n'occulte pas l'illustration
function WmNode({ id, name, glow, locked, dungeon, tag, onClick, onHover }) {
  const pos = POS[id]
  return (
    <div
      className={`wm-node ${locked ? 'locked' : ''} ${dungeon ? 'dungeon' : ''}`}
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      onClick={() => { if (!locked && onClick) onClick() }}
      onMouseEnter={() => onHover && onHover(true)}
      onMouseLeave={() => onHover && onHover(false)}
    >
      <div className={`wm-marker ${glow ? 'glow-' + glow : ''}`}>
        {dungeon ? <span className="wm-q">?</span> : <span className="wm-dot" />}
        {locked && <span className="wm-lock">🔒</span>}
      </div>
      {name && <div className="wm-name">{name}</div>}
      {tag && <div className="wm-tag" style={{ color: tag.color }}>{tag.text}</div>}
    </div>
  )
}

export default function WorldMap() {
  const { world, hero, setScreen, discoverDungeon, travelTo } = useGameStore()
  const [tip, setTip] = useState(null)
  const [qteOpen, setQteOpen] = useState(false)
  const [walking, setWalking] = useState(false) // TRV02 — animation de marche pendant un voyage

  const totalAshenvaleKills = Object.entries(world.monsterKillCounts)
    .filter(([id]) => MONSTERS[id]?.zone === 'ashenvale')
    .reduce((sum, [, n]) => sum + n, 0)
  const blightedUnlocked = totalAshenvaleKills >= 10 || hero.level >= 3
  const grimspireUnlocked = hero.level >= 8 || totalAshenvaleKills >= 40

  // TRV01 — position du héros sur la carte (fallback pour les saves sans currentNode)
  const heroNode = world.currentNode ?? world.currentHuntingSpot ?? world.currentLocation ?? 'ironhaven'
  const heroPos = POS[heroNode] ?? POS.ironhaven

  const goSafe = (id) => {
    useGameStore.setState(s => ({ world: { ...s.world, currentZone: 'ashenvale', currentLocation: id, currentHuntingSpot: null, currentNode: id } }))
    setScreen('safe_zone')
  }
  const goHunt = (id) => {
    useGameStore.setState(s => ({ world: { ...s.world, currentZone: 'ashenvale', currentHuntingSpot: id, currentNode: id } }))
    setScreen('zone_view')
  }
  // TRV01 — clic node : entrer (node courant) · voyager (adjacent, +3 tics) · bloqué (sinon)
  const onNode = (node) => {
    if (walking) return // TRV02 — input verrouillé pendant la marche
    if (node.id === heroNode) {
      if (node.kind === 'city' || node.kind === 'village') goSafe(node.id)
      else if (node.kind === 'spot') goHunt(node.id)
    } else if (areAdjacent(heroNode, node.id)) {
      // TRV02 — marche animée : le héros glisse A→B (transition CSS) en jouant les
      // frames walking, puis arrivée (travelTo applique la position + le coût de tics).
      setWalking(true)
      travelTo(node.id)
      // TRV04 — voyage ~3× plus lent (synchronisé avec la transition CSS .hero-avatar 1.8s)
      // pour rendre l'animation de marche bien visible.
      setTimeout(() => setWalking(false), 2100)
    } else {
      const p = POS[node.id]
      setTip(p ? { x: p.x, y: p.y - 8, text: 'Too far — travel via connected paths first.' } : null)
    }
  }

  const dungeon = world.dungeons?.ashenvale
  const onCrypt = () => { if (!dungeon?.discovered) discoverDungeon('ashenvale') }

  const enterBlighted = () => {
    useGameStore.setState(s => ({ world: { ...s.world, currentZone: 'blighted_road', currentHuntingSpot: null } }))
    setScreen('zone_view')
  }
  const onQteSuccess = () => { setQteOpen(false); enterBlighted() }
  const onQteFailure = () => {
    setQteOpen(false)
    useGameStore.setState(s => ({ hero: { ...s.hero, stats: { ...s.hero.stats, hp: Math.max(1, s.hero.stats.hp - Math.round(s.hero.stats.maxHp * 0.05)) } } }))
    enterBlighted()
  }
  const onGrimspire = () => {
    if (!grimspireUnlocked) return
    useGameStore.setState(s => ({ world: { ...s.world, currentZone: 'grimspire', currentHuntingSpot: null } }))
    setScreen('zone_view')
  }

  const linePct = (a, b, props) => {
    const na = POS[a], nb = POS[b]
    return <line key={`${a}-${b}`} x1={`${na.x}%`} y1={`${na.y}%`} x2={`${nb.x}%`} y2={`${nb.y}%`} {...props} />
  }

  return (
    <div className="wm-map fill">
      {/* Fond : carte illustrée + voile sombre léger */}
      <div className="wm-bg" />
      <div className="wm-overlay" />

      {/* Trails (coordonnées % via SVG) — sous les marqueurs */}
      <svg className="wm-trails">
        {EDGES.map(([a, b]) => linePct(a, b, { stroke: 'var(--ink)', strokeWidth: 2.5, strokeDasharray: '2 7', strokeLinecap: 'round', opacity: 0.5 }))}
        {/* Blighted Road : Ironhaven → Grimspire (liseré rouge) */}
        {linePct('ironhaven', 'grimspire', { stroke: 'var(--danger)', strokeWidth: 3, strokeDasharray: '3 6', strokeLinecap: 'round', opacity: grimspireUnlocked ? 0.4 : 0.8 })}
      </svg>

      {/* Nodes */}
      {NODES.map(n => <WmNode key={n.id} {...n} onClick={() => onNode(n)} />)}

      {/* Donjon */}
      {dungeon?.active && (
        <WmNode
          id="crypt" dungeon name={dungeon.discovered ? 'The Hollow Crypt' : ''}
          tag={dungeon.discovered ? { text: 'Lv 12–16', color: 'var(--dungeon)' } : null}
          onClick={onCrypt}
          onHover={(on) => setTip(on ? { x: POS.crypt.x, y: POS.crypt.y - 8, text: 'A mysterious portal hums with dark energy…' } : null)}
        />
      )}

      {/* Grimspire (locked) — marqueur overlay sur les montagnes */}
      <WmNode
        id="grimspire" name="Grimspire" locked={!grimspireUnlocked}
        glow={grimspireUnlocked ? 'amber' : undefined}
        tag={{ text: grimspireUnlocked ? 'Lv 21–40' : 'Lv 8+ to unlock', color: grimspireUnlocked ? 'var(--ink-soft)' : 'var(--stone)' }}
        onClick={grimspireUnlocked ? onGrimspire : undefined}
        onHover={(on) => !grimspireUnlocked && setTip(on ? { x: POS.grimspire.x, y: POS.grimspire.y - 8, text: '⚠ Grimspire — Reach Level 8 to unlock' } : null)}
      />

      {/* Blighted Road — chip cliquable (QTE) */}
      <div
        className="wm-blighted"
        style={{ left: '74%', top: '52%', cursor: blightedUnlocked ? 'pointer' : 'default' }}
        onClick={() => blightedUnlocked && setQteOpen(true)}
      >
        <div className="wm-blighted-label">{blightedUnlocked ? '⚔' : '💀'} The Blighted Road</div>
        <div className="wm-blighted-chip">
          {blightedUnlocked ? 'Cross the road' : `${totalAshenvaleKills}/10 kills or Lv 3`}
        </div>
      </div>

      {/* Héros (légèrement au-dessus du node courant) */}
      <HeroAvatar x={`${heroPos.x}%`} y={`${heroPos.y - 1.5}%`} name={hero.name} src={HERO_SPRITE} walking={walking} />

      {/* Tooltip */}
      {tip && <div className="lb-tip" style={{ left: `${tip.x}%`, top: `${tip.y}%` }}>{tip.text}</div>}

      <QTEBar
        open={qteOpen}
        title="⚠ Cross the Blighted Road"
        hint="Time your dash through the cursed mist. Hit NOW when the cursor is in the green zone."
        durationMs={1400} zoneStart={42} zoneEnd={58} timeoutMs={5000}
        onSuccess={onQteSuccess} onFailure={onQteFailure}
      />
    </div>
  )
}
