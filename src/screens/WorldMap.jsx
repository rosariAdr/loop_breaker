import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { ZONES } from '../data/zones'
import { MONSTERS } from '../data/monsters'
import WorldMapCanvas from './WorldMapCanvas'
import QTEBar from '../components/QTEBar'

// ── Chemins SVG entre nœuds de la carte ──────────────────────────────────────
const MAP_PATHS = [
  // [from node id, to node id]
  ['millhaven', 'ashenvale_forest'],
  ['ashenvale_forest', 'crumbled_ruins'],
  ['millhaven', 'ironhaven'],
  ['millhaven', 'thornmarsh'],
  ['ironhaven', 'ashenvale_forest'],
  ['ironhaven', 'crumbled_ruins'],
  ['ironhaven', 'thornmarsh'],
  ['ironhaven', 'greywatch'],
  ['ironhaven', 'barrow_hills'],
  ['greywatch', 'barrow_hills'],
]

// (NODE_POSITIONS retiré — les positions % sont définies inline dans canvasNodes)

export default function WorldMap() {
  const { world, setScreen, hero } = useGameStore()
  const zone = ZONES.ashenvale
  // MAP02 — QTE pour traverser Blighted Road
  const [qteOpen, setQteOpen] = useState(false)

  const totalAshenvaleKills = Object.entries(world.monsterKillCounts)
    .filter(([id]) => MONSTERS[id]?.zone === 'ashenvale')
    .reduce((sum, [, n]) => sum + n, 0)

  const blightedRoadUnlocked = totalAshenvaleKills >= 10 || hero.level >= 3
  const grimspireUnlocked = hero.level >= 8 || totalAshenvaleKills >= 40

  // Nœud actif = spot de chasse si défini, sinon la location safe
  const activeNodeId = world.currentHuntingSpot ?? world.currentLocation

  const handleSafeZone = (locationId, zoneId = 'ashenvale') => {
    useGameStore.setState((state) => ({
      world: { ...state.world, currentZone: zoneId, currentLocation: locationId, currentHuntingSpot: null },
    }))
    setScreen('safe_zone')
  }

  const handleHuntingSpot = (spotId) => {
    useGameStore.setState((state) => ({
      world: { ...state.world, currentZone: 'ashenvale', currentHuntingSpot: spotId },
    }))
    setScreen('zone_view')
  }

  // MAP02 — Traversée de la Blighted Road via QTE
  const handleBlightedRoad = () => {
    if (!blightedRoadUnlocked) return
    setQteOpen(true)
  }

  const enterBlightedRoad = () => {
    useGameStore.setState((state) => ({
      world: { ...state.world, currentZone: 'blighted_road', currentHuntingSpot: null },
    }))
    setScreen('zone_view')
  }

  const handleQteSuccess = () => {
    setQteOpen(false)
    // Succès = traversée rapide, entrée immédiate
    enterBlightedRoad()
  }

  const handleQteFailure = () => {
    setQteOpen(false)
    // Échec = traversée normale + coût HP léger (5% maxHp)
    useGameStore.setState((state) => ({
      hero: {
        ...state.hero,
        stats: {
          ...state.hero.stats,
          hp: Math.max(1, state.hero.stats.hp - Math.round(state.hero.stats.maxHp * 0.05)),
        },
      },
    }))
    enterBlightedRoad()
  }

  const handleGrimspire = () => {
    if (!grimspireUnlocked) return
    useGameStore.setState((state) => ({
      world: { ...state.world, currentZone: 'grimspire', currentHuntingSpot: null },
    }))
    setScreen('zone_view')
  }

  // MAP01 — Build nodes pour le canvas (positions, types, callbacks)
  const canvasNodes = [
    ...zone.huntingSpots.map(spot => ({
      id: spot.id,
      label: spot.name,
      sublabel: null,
      icon: spot.icon,
      x: spot.mapPos.x, y: spot.mapPos.y,
      type: 'spot',
      color: '#80c040',
      locked: false,
    })),
    {
      id: 'ironhaven',
      label: 'Ironhaven', sublabel: 'Major City', icon: '🏰',
      x: 44, y: 52, type: 'city', color: '#d4af70', locked: false,
    },
    {
      id: 'millhaven',
      label: 'Millhaven', sublabel: 'Sir Aldric', icon: '🏘',
      x: 16, y: 32, type: 'village', color: '#b09060', locked: false,
    },
    {
      id: 'greywatch',
      label: 'Greywatch', sublabel: 'Village', icon: '🏘',
      x: 62, y: 68, type: 'village', color: '#808060', locked: false,
    },
  ]

  // Donjon Ashenvale : marker "?" tant que non découvert (D02)
  const ashenvaleDungeon = world.dungeons?.ashenvale
  const dungeonNode = ashenvaleDungeon?.active ? {
    x: 78, y: 30,
    discovered: ashenvaleDungeon.discovered,
    label: ashenvaleDungeon.discovered ? 'The Hollow Crypt · Lv 12-16' : null,
  } : null

  const { discoverDungeon } = useGameStore()

  const handleCanvasSelectNode = (node) => {
    if (node.type === 'city' || node.type === 'village') {
      handleSafeZone(node.id)
    } else if (node.type === 'spot') {
      handleHuntingSpot(node.id)
    } else if (node.type === 'dungeon') {
      // D02 — clic sur marker '?' : révéler le donjon (1er clic) ou entrer (futur D01)
      if (!ashenvaleDungeon?.discovered) {
        discoverDungeon('ashenvale')
      }
      // (futur D01) : sinon, entrer dans le donjon
    }
  }

  return (
    <div className="flex h-full" style={{ minHeight: 'calc(100vh - 48px)' }}>

      {/* ── Carte principale ── */}
      <div className="flex-1 flex flex-col p-4 gap-3">
        <h2 style={{ fontFamily: 'Cinzel, serif', color: '#d4af70', fontSize: '1.1rem', letterSpacing: '0.1em' }}>
          ⚔ ELDENMOOR ⚔
        </h2>

        {/* MAP01 — Canvas 2D animé */}
        <WorldMapCanvas
          nodes={canvasNodes}
          paths={MAP_PATHS}
          activeNodeId={activeNodeId}
          dungeonNode={dungeonNode}
          onSelectNode={handleCanvasSelectNode}
        />

        {/* Zones verrouillées */}
        <div className="flex gap-3 max-w-xl">
          <LockedRegion
            label="The Blighted Road"
            hint={blightedRoadUnlocked ? null : `${totalAshenvaleKills}/10 Ashenvale kills or Lv3`}
            unlocked={blightedRoadUnlocked}
            onClick={handleBlightedRoad}
          />
          <LockedRegion
            label="Grimspire"
            hint={grimspireUnlocked ? null : `Lv8 or 40 Ashenvale kills (${hero.level}/8 · ${totalAshenvaleKills}/40)`}
            unlocked={grimspireUnlocked}
            onClick={handleGrimspire}
          />
        </div>
      </div>

      {/* ── Sidebar droite ── */}
      <Sidebar world={world} hero={hero} setScreen={setScreen} />

      {/* MAP02 — QTE pour traverser Blighted Road */}
      <QTEBar
        open={qteOpen}
        title="⚠ Cross the Blighted Road"
        hint="Time your dash through the cursed mist. Hit NOW when the cursor is in the green zone."
        durationMs={1400}
        zoneStart={42}
        zoneEnd={58}
        timeoutMs={5000}
        onSuccess={handleQteSuccess}
        onFailure={handleQteFailure}
      />
    </div>
  )
}

// (HuntNode, LocationNode, CharacterMarker retirés — rendu par WorldMapCanvas désormais)

// ── Région verrouillée ────────────────────────────────────────────────────────
function LockedRegion({ label, hint, unlocked, onClick }) {
  return (
    <div
      className="flex-1 flex items-center gap-2 px-3 py-2 rounded transition-all"
      style={{
        background: '#0d0808',
        border: `1px dashed ${unlocked ? '#5a2018' : '#1a1410'}`,
        cursor: unlocked ? 'pointer' : 'default',
        opacity: unlocked ? 1 : 0.5,
      }}
      onClick={onClick}
    >
      <span style={{ color: unlocked ? '#8a4030' : '#3a2018', fontSize: '0.9rem' }}>
        {unlocked ? '⚠' : '🔒'}
      </span>
      <div>
        <p style={{ color: unlocked ? '#8a5040' : '#4a3028', fontSize: '0.78rem', fontFamily: 'Cinzel, serif' }}>
          {label}
        </p>
        {hint && (
          <p style={{ color: '#4a3028', fontSize: '0.68rem', fontStyle: 'italic' }}>
            Locked — {hint}
          </p>
        )}
        {unlocked && !hint && (
          <p style={{ color: '#5a3020', fontSize: '0.68rem', fontStyle: 'italic' }}>
            Click to enter
          </p>
        )}
      </div>
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ world, hero, setScreen }) {
  const { sleep } = useGameStore()

  const canSleep = world.currentLocation &&
    (ZONES.ashenvale.city?.id === world.currentLocation ||
     ZONES.grimspire?.city?.id === world.currentLocation ||
     ZONES.ashenvale.villages?.some(v => v.id === world.currentLocation) ||
     ZONES.grimspire?.villages?.some(v => v.id === world.currentLocation))

  return (
    <aside className="w-64 flex flex-col gap-4 p-4 border-l" style={{ borderColor: '#2a2018', background: '#0a0805' }}>

      <Section title="Location">
        <p style={{ color: '#d4af70', fontFamily: 'Cinzel, serif', fontSize: '0.9rem' }}>
          {getLocationName(world.currentZone, world.currentLocation, world.currentHuntingSpot)}
        </p>
        <p style={{ color: '#6a5a4a', fontSize: '0.78rem', marginTop: '0.25rem' }}>
          Day {world.dayCount} · {world.tickCount}/24 ticks
        </p>
        <div className="mt-2 w-full h-1 rounded" style={{ background: '#1a1410' }}>
          <div className="h-full rounded" style={{ width: `${(world.tickCount / 24) * 100}%`, background: '#d4af70' }} />
        </div>
      </Section>

      <Section title="Deity">
        {hero.deity ? (
          <p style={{ color: '#c084fc', fontSize: '0.85rem' }}>✦ {hero.deity.charAt(0).toUpperCase() + hero.deity.slice(1)}</p>
        ) : (
          <p style={{ color: '#4a3a2a', fontSize: '0.82rem', fontStyle: 'italic' }}>No deity chosen</p>
        )}
      </Section>

      <Section title="Demon Lord">
        <div className="flex items-center gap-2">
          <span style={{ color: world.demonLordDefeated ? '#c04040' : '#604030', fontSize: '0.85rem' }}>
            {world.demonLordDefeated ? '☠ Defeated' : '⚡ Malachar the Undying'}
          </span>
        </div>
        {world.demonLordDefeated && world.demonLordResurrectionCounter > 0 && (
          <p style={{ color: '#604030', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            Resurrects in {4 - world.demonLordResurrectionCounter} transmigrations
          </p>
        )}
      </Section>

      <Section title="Reputation">
        <p style={{ color: '#d4af70', fontSize: '0.9rem' }}>🪙 {hero.reputationTokens} tokens</p>
      </Section>

      <Section title="Actions">
        <div className="flex flex-col gap-2">
          <ActionButton label="💤 Sleep" disabled={!canSleep} onClick={sleep} hint={canSleep ? 'Full HP + Mana restore' : 'Find an inn first'} />
          <ActionButton label="👤 Hero Sheet" onClick={() => setScreen('hero_sheet')} />
          <ActionButton label="🎒 Inventory" onClick={() => setScreen('inventory')} />
        </div>
      </Section>

      {world.isIdleActive && (
        <Section title="Idle Log">
          <div className="flex flex-col gap-1">
            {world.idleLog.slice(0, 5).map((entry, i) => (
              <p key={i} style={{ color: '#6a7a5a', fontSize: '0.72rem' }}>{entry.text}</p>
            ))}
            {world.idleLog.length === 0 && (
              <p style={{ color: '#4a3a2a', fontSize: '0.75rem', fontStyle: 'italic' }}>Waiting for combat...</p>
            )}
          </div>
        </Section>
      )}
    </aside>
  )
}

// ── Utilitaires ───────────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-widest" style={{ color: '#4a3a2a', fontFamily: 'Cinzel, serif' }}>
        {title}
      </p>
      {children}
    </div>
  )
}

function ActionButton({ label, onClick, disabled = false, hint }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={hint}
      className="w-full px-3 py-2 rounded text-sm text-left transition-all"
      style={{
        fontFamily: 'Cinzel, serif',
        background: disabled ? '#0f0c08' : '#1a1410',
        color: disabled ? '#3a2a1a' : '#d4af70',
        border: `1px solid ${disabled ? '#1a1410' : '#3a2818'}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {label}
    </button>
  )
}

function getLocationName(zoneId, locationId, huntingSpot) {
  if (huntingSpot) {
    const spot = ZONES.ashenvale?.huntingSpots?.find(s => s.id === huntingSpot)
    return spot?.name ?? huntingSpot
  }
  if (!locationId) return ZONES[zoneId]?.name ?? 'Unknown'
  const zone = ZONES[zoneId]
  if (!zone) return 'Unknown'
  if (zone.city?.id === locationId) return zone.city.name
  const village = zone.villages?.find((v) => v.id === locationId)
  return village?.name ?? zone.name
}

