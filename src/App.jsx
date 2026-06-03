import { useEffect, useState } from 'react'
import { useGameStore } from './store/gameStore'
import { ZONES } from './data/zones'

import WorldMap from './screens/WorldMap'
import ZoneView from './screens/ZoneView'
import Combat from './screens/Combat'
import HeroSheet from './screens/HeroSheet'
import Inventory from './screens/Inventory'
import SafeZone from './screens/SafeZone'
import PostMortem from './screens/PostMortem'
import GodsShop from './screens/GodsShop'
import DivineCall from './screens/DivineCall'
import QuestBoard from './screens/QuestBoard'
import LevelUpModal from './screens/LevelUpModal'
import CharacterCreation from './screens/CharacterCreation'
import ErrorBoundary from './components/ErrorBoundary'
import DebugPanel from './components/DebugPanel'
import ToastContainer from './components/ToastContainer'

// UI01 — écrans qui prennent tout le stage (takeover, sans topbar/breadcrumb)
const FULLSCREEN = ['combat', 'post_mortem', 'gods_shop', 'divine_call']

function App() {
  const {
    currentScreen, loadGame, saveGame,
    pendingDivineCall, pendingLevelUp,
    processIdleTick, advanceTick,
    hero,
  } = useGameStore()

  useEffect(() => { loadGame() }, [])

  // UI01 — scaler du stage 1920×1080 (ratio calculé en JS car scale() veut un nombre)
  useEffect(() => {
    const apply = () => {
      const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080)
      document.documentElement.style.setProperty('--lb-scale', String(s))
    }
    apply()
    window.addEventListener('resize', apply)
    return () => window.removeEventListener('resize', apply)
  }, [])

  // Boucle idle : 1 combat toutes les 3s si idle actif
  useEffect(() => {
    const interval = setInterval(() => {
      const { world, activeCombat } = useGameStore.getState()
      if (world.isIdleActive && !activeCombat) {
        try { processIdleTick() } catch (e) { console.error('[idle tick]', e) }
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Tick calendrier : 1 tick / 30s
  useEffect(() => {
    const interval = setInterval(() => {
      const { activeCombat, currentScreen: cs } = useGameStore.getState()
      const pausedScreens = ['post_mortem', 'gods_shop', 'divine_call']
      if (!activeCombat && !pausedScreens.includes(cs)) advanceTick()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // Auto-save / 30s
  useEffect(() => {
    const interval = setInterval(() => saveGame(), 30000)
    return () => clearInterval(interval)
  }, [])

  const renderScreen = () => {
    switch (currentScreen) {
      case 'world_map':   return <WorldMap />
      case 'zone_view':   return <ZoneView />
      case 'combat':      return <Combat />
      case 'hero_sheet':  return <HeroSheet />
      case 'inventory':   return <Inventory />
      case 'safe_zone':   return <SafeZone />
      case 'post_mortem': return <PostMortem />
      case 'gods_shop':   return <GodsShop />
      case 'divine_call': return <WorldMap /> // fond derrière le modal
      case 'quest_board': return <QuestBoard />
      default:            return <WorldMap />
    }
  }

  const showCharCreation = hero.runNumber === 1 && !hero.heroNamed
  const showLevelUp = pendingLevelUp > 0 && !showCharCreation
  const fullscreen = FULLSCREEN.includes(currentScreen)

  return (
    <div className="lb-scene">
      <div className="lb-stage">
        {!fullscreen && <Topbar />}
        {!fullscreen && <Breadcrumb />}
        <main className="lb-sheet-area">
          <ErrorBoundary>
            {/* U04 — key={currentScreen} → re-déclenche le fade */}
            <div key={currentScreen} className="anim-screen-fade" style={{ position: 'absolute', inset: 0 }}>
              {renderScreen()}
            </div>
          </ErrorBoundary>
        </main>

        {/* Modals (au-dessus du stage) */}
        {pendingDivineCall && <DivineCall />}
        {showLevelUp && <LevelUpModal />}
        {showCharCreation && <CharacterCreation />}
      </div>

      {/* U01 — Toasts globaux + PROC06 Debug panel (hors stage, plein écran) */}
      <ToastContainer />
      <DebugPanel />
    </div>
  )
}

// ── Topbar (UI01 — planche de bois, fusionne run/XP, HP/MP, jour, onglets) ─────
function Topbar() {
  const { setScreen, currentScreen, hero, world, saveGame, unseenLoot } = useGameStore()
  const [saveFlash, setSaveFlash] = useState(false)

  const handleSave = () => {
    saveGame(); setSaveFlash(true); setTimeout(() => setSaveFlash(false), 1500)
  }

  const xpPct = Math.min(100, (hero.exp / hero.expToNext) * 100)
  const tabs = [
    { id: 'world_map', label: 'Map' },
    { id: 'hero_sheet', label: 'Hero' },
    { id: 'inventory', label: 'Bag' },
  ]

  return (
    <header className="lb-topbar">
      {/* Run / Lv + XP */}
      <div className="flex flex-col" style={{ gap: '3px', minWidth: '128px' }}>
        <span className="lb-eyebrow">Run #{hero.runNumber} · Lv {hero.level}</span>
        <div className="lb-gauge-track" style={{ width: '120px', height: '8px' }}>
          <div className="lb-gauge-fill" style={{ width: `${xpPct}%`, background: 'linear-gradient(90deg, var(--xp-from), var(--xp-to))' }} />
        </div>
      </div>

      <div className="sep" />

      {/* Jauges HP / MP */}
      <Gauge label="HP" value={hero.stats.hp} max={hero.stats.maxHp} from="var(--hp-from)" to="var(--hp-to)" />
      <Gauge label="MP" value={hero.stats.mana} max={hero.stats.maxMana} from="var(--mp-from)" to="var(--mp-to)" />

      <div style={{ flex: 1 }} />

      {/* Groupe stats (DayBar fusionnée) */}
      <div className="flex items-center" style={{ gap: '14px', fontFamily: 'Cinzel, serif', fontSize: '14px', fontWeight: 600, color: '#f0dcae' }}>
        <span>{world.isNight ? '🌙' : '☀'} Day {world.dayCount}</span>
        <span style={{ opacity: .85 }}>T {world.tickCount}/24</span>
        <span>🪙 {hero.reputationTokens ?? 0}</span>
      </div>

      <div className="sep" />

      {/* Onglets */}
      <nav className="flex items-center" style={{ gap: '6px' }}>
        {tabs.map(tab => {
          const showBadge = tab.id === 'inventory' && unseenLoot && currentScreen !== 'inventory'
          return (
            <button
              key={tab.id}
              onClick={() => setScreen(tab.id)}
              className={`lb-tab${currentScreen === tab.id ? ' active' : ''}`}
              style={{ position: 'relative' }}
            >
              {tab.label}
              {showBadge && (
                <span data-testid="unseen-loot-badge" aria-label="new loot"
                  style={{ position: 'absolute', top: '-3px', right: '-3px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)', border: '1px solid #1a0808', boxShadow: '0 0 6px var(--danger)' }} />
              )}
            </button>
          )
        })}
        <button onClick={handleSave} className={`lb-tab${saveFlash ? ' active' : ''}`}>
          {saveFlash ? '✓ Saved' : 'Save'}
        </button>
      </nav>
    </header>
  )
}

function Gauge({ label, value, max, from, to }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="flex flex-col" style={{ gap: '2px', width: '150px' }}>
      <div className="flex items-center justify-between" style={{ fontSize: '10px', color: '#e7d3a4', fontFamily: 'Cinzel, serif' }}>
        <span style={{ fontWeight: 700, letterSpacing: '.06em' }}>{label}</span>
        <span style={{ opacity: .85 }}>{value}/{max}</span>
      </div>
      <div className="lb-gauge-track">
        <div className="lb-gauge-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${from}, ${to})` }} />
      </div>
    </div>
  )
}

// ── Breadcrumb (UI01 — chemin de région) ──────────────────────────────────────
function Breadcrumb() {
  const { world, currentScreen } = useGameStore()
  const zone = ZONES[world.currentZone]
  const zoneName = zone?.name ?? world.currentZone

  // Chemin selon l'écran
  const parts = ['Eldenmoor']
  if (currentScreen === 'world_map') {
    parts.push(zoneName)
  } else if (currentScreen === 'safe_zone') {
    const loc = zone?.city?.id === world.currentLocation
      ? zone?.city
      : zone?.villages?.find(v => v.id === world.currentLocation)
    parts.push(zoneName, loc?.name ?? 'Settlement')
  } else if (currentScreen === 'zone_view') {
    const spot = zone?.huntingSpots?.find(s => s.id === world.currentHuntingSpot)
    parts.push(zoneName, spot?.name ?? 'Wilds')
  } else {
    parts.push(zoneName)
  }

  return (
    <div className="lb-breadcrumb">
      <span>
        {parts.map((p, i) => (
          <span key={i}>
            <span className={i === parts.length - 1 ? 'current' : ''}>{p}</span>
            {i < parts.length - 1 && <span className="sep">›</span>}
          </span>
        ))}
      </span>
      <span style={{ opacity: .35, letterSpacing: '.3em' }}>· · · · · ·</span>
    </div>
  )
}

export default App
