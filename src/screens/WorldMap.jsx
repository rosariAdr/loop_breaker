import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { MONSTERS } from '../data/monsters'
import QTEBar from '../components/QTEBar'
import { HeroAvatar, Trail, MapNode, ParchmentFrame } from '../components/parchment'

const HERO_SPRITE = '/sprites/hero/idle/00.png'

// Nodes d'Ashenvale — positions de la ref design (calque 1920×1080), ids du jeu
const NODES = [
  { id: 'ironhaven', name: 'Ironhaven', size: 'major', x: 360, y: 600, art: 'castle tower', glow: 'amber', tag: { text: 'Major City · safe', color: 'var(--forest-deep)' }, kind: 'city' },
  { id: 'millhaven', name: 'Millhaven', size: 'town', x: 560, y: 800, art: 'thatched cottage', glow: 'village', tag: { text: 'Village · safe', color: 'var(--sage)' }, kind: 'village' },
  { id: 'greywatch', name: 'Greywatch', size: 'town', x: 230, y: 380, art: 'watchtower', glow: 'village', tag: { text: 'Village · safe', color: 'var(--sage)' }, kind: 'village' },
  { id: 'ashenvale_forest', name: 'Ashenvale Forest', size: 'spot', x: 640, y: 470, art: 'tree cluster', tag: { text: 'Hunting · Lv 1–8', color: 'var(--forest-deep)' }, kind: 'spot' },
  { id: 'thornmarsh', name: 'Thornmarsh', size: 'spot', x: 800, y: 720, art: 'swamp reeds', tag: { text: 'Hunting · Lv 4–10', color: 'var(--forest-deep)' }, kind: 'spot' },
  { id: 'crumbled_ruins', name: 'Crumbled Ruins', size: 'spot', x: 470, y: 250, art: 'stone pillar', tag: { text: 'Hunting · Lv 6–12', color: 'var(--forest-deep)' }, kind: 'spot' },
  { id: 'barrow_hills', name: 'Barrow Hills', size: 'spot', x: 880, y: 360, art: 'hill mound', tag: { text: 'Hunting · Lv 8–14', color: 'var(--forest-deep)' }, kind: 'spot' },
]
const CRYPT_POS = { x: 720, y: 200 }
const TRAILS = [
  ['ironhaven', 'ashenvale_forest'], ['ironhaven', 'millhaven'], ['ironhaven', 'greywatch'],
  ['ashenvale_forest', 'crumbled_ruins'], ['ashenvale_forest', 'barrow_hills'], ['ashenvale_forest', 'thornmarsh'],
  ['barrow_hills', 'crypt'], ['millhaven', 'thornmarsh'],
]
const posById = (id) => (id === 'crypt' ? CRYPT_POS : NODES.find(n => n.id === id))

export default function WorldMap() {
  const { world, hero, setScreen, discoverDungeon } = useGameStore()
  const [tip, setTip] = useState(null)
  const [qteOpen, setQteOpen] = useState(false)

  const totalAshenvaleKills = Object.entries(world.monsterKillCounts)
    .filter(([id]) => MONSTERS[id]?.zone === 'ashenvale')
    .reduce((sum, [, n]) => sum + n, 0)
  const blightedUnlocked = totalAshenvaleKills >= 10 || hero.level >= 3
  const grimspireUnlocked = hero.level >= 8 || totalAshenvaleKills >= 40

  const heroNode = posById(world.currentHuntingSpot ?? world.currentLocation) ?? posById('ironhaven')
  const heroIsMajor = (world.currentHuntingSpot ?? world.currentLocation) === 'ironhaven'

  const goSafe = (id) => {
    useGameStore.setState(s => ({ world: { ...s.world, currentZone: 'ashenvale', currentLocation: id, currentHuntingSpot: null } }))
    setScreen('safe_zone')
  }
  const goHunt = (id) => {
    useGameStore.setState(s => ({ world: { ...s.world, currentZone: 'ashenvale', currentHuntingSpot: id } }))
    setScreen('zone_view')
  }

  const onNode = (node) => {
    if (node.kind === 'city' || node.kind === 'village') goSafe(node.id)
    else if (node.kind === 'spot') goHunt(node.id)
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

  return (
    <div className="parchment fill">
      <ParchmentFrame variant="compass" />

      {/* Zones */}
      <div className="zone-field zone-ashenvale" style={{ left: 60, top: 150, width: 940, height: 800 }} />
      <div
        className={`zone-field ${grimspireUnlocked ? 'zone-grimspire' : 'zone-locked'}`}
        style={{ left: 1180, top: 250, width: 420, height: 470, cursor: grimspireUnlocked ? 'pointer' : 'default' }}
        onClick={grimspireUnlocked ? onGrimspire : undefined}
        onMouseEnter={() => !grimspireUnlocked && setTip({ x: 1390, y: 300, text: '⚠ Grimspire — Reach Level 8 to unlock' })}
        onMouseLeave={() => setTip(null)}
      />

      {/* Mist */}
      <div className="mist" style={{ left: 540, top: 420, width: 260, height: 120 }} />
      <div className="mist" style={{ left: 700, top: 700, width: 220, height: 100, animationDelay: '2s' }} />

      {/* Zone labels */}
      <div className="t-zone" style={{ position: 'absolute', left: 120, top: 175, fontSize: 30, color: 'var(--forest-deep)', opacity: .82, whiteSpace: 'nowrap' }}>
        Ashenvale <span style={{ fontSize: 16, fontWeight: 600 }}>· Lv 1–20</span>
      </div>
      <div className="t-zone" style={{ position: 'absolute', left: 1230, top: 270, fontSize: 26, color: grimspireUnlocked ? '#4a3f30' : '#6b6356', display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap' }}>
        Grimspire {grimspireUnlocked ? <span style={{ fontSize: 15, fontWeight: 600 }}>· Lv 21–40</span> : <span style={{ fontSize: 22 }}>🔒</span>}
      </div>
      {!grimspireUnlocked && <div className="t-sub" style={{ position: 'absolute', left: 1230, top: 306, color: '#6b6356', fontSize: 15 }}>Level 8+</div>}

      {/* Trails */}
      {TRAILS.map(([a, b], i) => {
        const na = posById(a), nb = posById(b)
        if (!na || !nb) return null
        return <Trail key={i} from={[na.x, na.y]} to={[nb.x, nb.y]} bend={i % 2 ? 28 : -28} />
      })}

      {/* Blighted Road */}
      <Trail from={[960, 560]} to={[1180, 460]} danger={!grimspireUnlocked} bend={-40} />
      <div style={{ position: 'absolute', left: 1010, top: 470, zIndex: 14 }}><span style={{ fontSize: 22 }}>{blightedUnlocked ? '🧭' : '💀'}</span></div>
      <div
        style={{ position: 'absolute', left: 980, top: 650, zIndex: 18, cursor: blightedUnlocked ? 'pointer' : 'default' }}
        onClick={() => blightedUnlocked && setQteOpen(true)}
      >
        <div className="t-zone" style={{ fontSize: 14, color: 'var(--danger)', width: 220, textTransform: 'none', fontWeight: 700 }}>The Blighted Road</div>
        <div style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(192,57,43,.12)', border: '1px solid rgba(192,57,43,.5)', borderRadius: 5, padding: '4px 9px' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: 13, color: 'var(--danger)' }}>
            {blightedUnlocked ? '⚔ Cross the road' : `⚠ ${totalAshenvaleKills}/10 kills or Lv 3 to unlock`}
          </span>
        </div>
      </div>

      {/* Nodes */}
      {NODES.map(n => <MapNode key={n.id} node={n} onClick={onNode} />)}

      {/* Donjon */}
      {dungeon?.active && (
        <MapNode
          node={{ id: 'crypt', dungeon: true, size: 'spot', x: CRYPT_POS.x, y: CRYPT_POS.y, name: dungeon.discovered ? 'The Hollow Crypt' : '', tag: dungeon.discovered ? { text: '? Dungeon · Lv 12–16', color: 'var(--dungeon)' } : null }}
          onClick={onCrypt}
          onHover={(node, on) => on ? setTip({ x: CRYPT_POS.x, y: CRYPT_POS.y - 50, text: 'A mysterious portal hums with dark energy…' }) : setTip(null)}
        />
      )}

      {/* Héros */}
      <HeroAvatar x={heroNode.x} y={heroNode.y - (heroIsMajor ? 56 : 42)} name={hero.name} src={HERO_SPRITE} />

      {tip && <div className="lb-tip" style={{ left: tip.x, top: tip.y }}>{tip.text}</div>}

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
