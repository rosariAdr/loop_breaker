import { useGameStore } from '../store/gameStore'
import { ZONES } from '../data/zones'
import { MONSTERS } from '../data/monsters'

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

// Positions centrales des nœuds (% du conteneur)
const NODE_POSITIONS = {
  ashenvale_forest: { x: 28, y: 18 },
  thornmarsh:       { x: 10, y: 52 },
  crumbled_ruins:   { x: 65, y: 22 },
  barrow_hills:     { x: 40, y: 72 },
  ironhaven:        { x: 44, y: 52 },
  millhaven:        { x: 16, y: 32 },
  greywatch:        { x: 62, y: 68 },
}

export default function WorldMap() {
  const { world, setScreen, hero } = useGameStore()
  const zone = ZONES.ashenvale

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

  const handleBlightedRoad = () => {
    if (!blightedRoadUnlocked) return
    useGameStore.setState((state) => ({
      world: { ...state.world, currentZone: 'blighted_road', currentHuntingSpot: null },
    }))
    setScreen('zone_view')
  }

  const handleGrimspire = () => {
    if (!grimspireUnlocked) return
    useGameStore.setState((state) => ({
      world: { ...state.world, currentZone: 'grimspire', currentHuntingSpot: null },
    }))
    setScreen('zone_view')
  }

  return (
    <div className="flex h-full" style={{ minHeight: 'calc(100vh - 48px)' }}>

      {/* ── Carte principale ── */}
      <div className="flex-1 flex flex-col p-4 gap-3">
        <h2 style={{ fontFamily: 'Cinzel, serif', color: '#d4af70', fontSize: '1.1rem', letterSpacing: '0.1em' }}>
          ⚔ ELDENMOOR ⚔
        </h2>

        {/* Conteneur de la carte Ashenvale */}
        <div
          className="relative rounded-lg overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at 40% 40%, #111208 0%, #0a0c08 60%, #080a06 100%)',
            border: '1px solid #2a2818',
            width: '100%',
            maxWidth: '780px',
            aspectRatio: '16/10',
          }}
        >
          {/* Grille de fond subtile */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, #1a1810 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              opacity: 0.4,
            }}
          />

          {/* Label zone */}
          <div
            className="absolute"
            style={{
              top: '8px', left: '12px',
              fontSize: '0.65rem', color: '#3a3020',
              fontFamily: 'Cinzel, serif', letterSpacing: '0.12em', textTransform: 'uppercase',
            }}
          >
            Ashenvale Region
          </div>

          {/* SVG des chemins */}
          <svg
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="none"
            style={{ pointerEvents: 'none' }}
          >
            {MAP_PATHS.map(([a, b]) => {
              const pa = NODE_POSITIONS[a]
              const pb = NODE_POSITIONS[b]
              if (!pa || !pb) return null
              return (
                <line
                  key={`${a}-${b}`}
                  x1={`${pa.x}%`} y1={`${pa.y}%`}
                  x2={`${pb.x}%`} y2={`${pb.y}%`}
                  stroke="#2a2518"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              )
            })}
          </svg>

          {/* Nœuds de chasse */}
          {zone.huntingSpots.map((spot) => (
            <HuntNode
              key={spot.id}
              spot={spot}
              active={activeNodeId === spot.id}
              onClick={() => handleHuntingSpot(spot.id)}
              idleMonsters={getSpotIdleMonsters(world, spot)}
            />
          ))}

          {/* Nœud ville — Ironhaven */}
          <LocationNode
            id="ironhaven"
            icon="🏰"
            label="Ironhaven"
            sublabel="Major City"
            color="#d4af70"
            active={activeNodeId === 'ironhaven'}
            onClick={() => handleSafeZone('ironhaven')}
          />

          {/* Nœud village — Millhaven */}
          <LocationNode
            id="millhaven"
            icon="🏘"
            label="Millhaven"
            sublabel="Village · Sir Aldric"
            color="#b09060"
            active={activeNodeId === 'millhaven'}
            onClick={() => handleSafeZone('millhaven')}
          />

          {/* Nœud village — Greywatch */}
          <LocationNode
            id="greywatch"
            icon="🏘"
            label="Greywatch"
            sublabel="Village"
            color="#808060"
            active={activeNodeId === 'greywatch'}
            onClick={() => handleSafeZone('greywatch')}
          />

          {/* Marqueur personnage */}
          <CharacterMarker nodeId={activeNodeId} />

          {/* Flèche vers Blighted Road */}
          <div
            className="absolute flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition-all"
            style={{
              right: '2%', top: '45%',
              background: '#0d0808',
              border: `1px dashed ${blightedRoadUnlocked ? '#5a2018' : '#1a1410'}`,
              opacity: blightedRoadUnlocked ? 1 : 0.45,
            }}
            onClick={handleBlightedRoad}
          >
            <span style={{ color: blightedRoadUnlocked ? '#8a4030' : '#3a2018', fontSize: '0.65rem', fontFamily: 'Cinzel, serif' }}>
              {blightedRoadUnlocked ? '⚠' : '🔒'} Blighted Road →
            </span>
          </div>
        </div>

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
    </div>
  )
}

// ── Nœud de chasse ────────────────────────────────────────────────────────────
function HuntNode({ spot, active, onClick, idleMonsters }) {
  const pos = NODE_POSITIONS[spot.id]
  if (!pos) return null

  return (
    <button
      onClick={onClick}
      className="absolute flex flex-col items-center gap-0.5 transition-all hover:scale-110"
      style={{
        left: `${pos.x}%`, top: `${pos.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
      }}
      title={`${spot.name} · Lv${spot.levelRange[0]}-${spot.levelRange[1]}`}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-base transition-all"
        style={{
          background: active ? '#1a2810' : '#101008',
          border: `2px solid ${active ? '#80c040' : '#3a3020'}`,
          boxShadow: active ? '0 0 10px rgba(128,192,64,0.4)' : 'none',
        }}
      >
        {spot.icon}
      </div>
      <div
        className="text-center"
        style={{
          fontSize: '0.6rem',
          color: active ? '#80c040' : '#6a5a3a',
          fontFamily: 'Cinzel, serif',
          whiteSpace: 'nowrap',
          textShadow: '0 0 6px #000',
        }}
      >
        {spot.name}
      </div>
      {idleMonsters.length > 0 && (
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#80c040', marginTop: '1px' }} />
      )}
    </button>
  )
}

// ── Nœud de location safe ─────────────────────────────────────────────────────
function LocationNode({ id, icon, label, sublabel, color, active, onClick }) {
  const pos = NODE_POSITIONS[id]
  if (!pos) return null

  return (
    <button
      onClick={onClick}
      className="absolute flex flex-col items-center gap-0.5 transition-all hover:scale-110"
      style={{
        left: `${pos.x}%`, top: `${pos.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
      }}
      title={label}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-base transition-all"
        style={{
          background: active ? '#1a150a' : '#0f0d08',
          border: `2px solid ${active ? color : '#2a2018'}`,
          boxShadow: active ? `0 0 12px ${color}40` : 'none',
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: '0.6rem', color: active ? color : '#6a5a3a', fontFamily: 'Cinzel, serif', whiteSpace: 'nowrap', textShadow: '0 0 6px #000' }}>
        {label}
      </div>
      {sublabel && (
        <div style={{ fontSize: '0.52rem', color: '#4a3a2a', fontStyle: 'italic', textShadow: '0 0 4px #000', whiteSpace: 'nowrap' }}>
          {sublabel}
        </div>
      )}
    </button>
  )
}

// ── Marqueur personnage ───────────────────────────────────────────────────────
function CharacterMarker({ nodeId }) {
  const pos = NODE_POSITIONS[nodeId]
  if (!pos) return null

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y - 9}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 20,
        transition: 'left 0.5s ease, top 0.5s ease',
      }}
    >
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center text-xs animate-pulse"
        style={{
          background: '#c04040',
          border: '2px solid #ff6060',
          boxShadow: '0 0 8px rgba(192,64,64,0.8)',
          fontSize: '0.6rem',
        }}
      >
        ⚔
      </div>
    </div>
  )
}

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

function getSpotIdleMonsters(world, spot) {
  return spot.monsters.filter(mId => world.idleToggles[mId])
}
