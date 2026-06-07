import { useEffect, useState, useRef } from 'react'
import { useGameStore } from './store/gameStore'
import { useToastStore } from './store/toastStore'
import { ZONES } from './data/zones'

import WorldMap from './screens/WorldMap'
import ZoneView from './screens/ZoneView'
import Combat from './screens/Combat'
import HeroSheet from './screens/HeroSheet'
import Inventory from './screens/Inventory'
import CodexOverlay from './screens/CodexOverlay'
import QuestsOverlay from './screens/QuestsOverlay'
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
import OfflineRecapModal from './components/OfflineRecapModal'
import SettingsModal from './components/SettingsModal'
import { Sidebar } from './components/parchment'

// Écrans en takeover plein-canvas (sans topbar/breadcrumb)
const FULLSCREEN = ['combat', 'post_mortem', 'gods_shop', 'divine_call']
// IMM04 — écrans rendus en overlay AU-DESSUS du monde (immersion : on ne quitte pas la scène)
const OVERLAY_SCREENS = ['hero_sheet', 'inventory', 'codex', 'quests']

function App() {
  const {
    currentScreen, loadGame, saveGame,
    pendingDivineCall, pendingLevelUp,
    processIdleTick, advanceTick,
    hero, world, setScreen, sleep,
  } = useGameStore()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const animationsOn = useGameStore((s) => s.meta.settings?.animations ?? true)

  useEffect(() => {
    loadGame()
    // IDLE-OFF — créditer les gains accumulés hors-ligne après le chargement
    useGameStore.getState().applyOfflineProgress()
  }, [])

  // SET01 — applique le réglage Animations (classe globale qui neutralise anims/transitions)
  useEffect(() => {
    document.documentElement.classList.toggle('lb-no-anim', !animationsOn)
  }, [animationsOn])

  // Scaler du canvas 1920×1080 (ratio en JS car scale() veut un nombre sans unité)
  useEffect(() => {
    const apply = () => {
      const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080)
      document.documentElement.style.setProperty('--lb-scale', String(s))
    }
    apply()
    window.addEventListener('resize', apply)
    return () => window.removeEventListener('resize', apply)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const { world, activeCombat } = useGameStore.getState()
      if (world.isIdleActive && !activeCombat) {
        try { processIdleTick() } catch (e) { console.error('[idle tick]', e) }
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const { activeCombat, currentScreen: cs } = useGameStore.getState()
      const pausedScreens = ['post_mortem', 'gods_shop', 'divine_call']
      if (!activeCombat && !pausedScreens.includes(cs)) advanceTick()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => saveGame(), 30000)
    return () => clearInterval(interval)
  }, [])

  // IMM04 — mémorise le dernier écran-monde (pattern React : setState gardé pendant le render)
  // pour rendre Hero/Bag en overlay PAR-DESSUS lui et y revenir à la fermeture.
  const isOverlay = OVERLAY_SCREENS.includes(currentScreen)
  const fullscreen = FULLSCREEN.includes(currentScreen)
  const [underScreen, setUnderScreen] = useState('world_map')
  const [prevScreen, setPrevScreen] = useState(currentScreen)
  if (currentScreen !== prevScreen) {
    setPrevScreen(currentScreen)
    if (!isOverlay && !fullscreen) setUnderScreen(currentScreen)
  }
  const baseScreen = isOverlay ? underScreen : currentScreen
  const overlayClose = () => setScreen(underScreen)

  // KBD01 — Échap : ferme l'overlay Options/Hero/Bag en priorité, sinon quitte la zone
  // vers la World Map. Ne s'applique pas aux écrans takeover (combat, etc.).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (settingsOpen) { setSettingsOpen(false); return }
      const screen = useGameStore.getState().currentScreen
      if (OVERLAY_SCREENS.includes(screen)) { setScreen(underScreen); return }
      if (screen === 'safe_zone' || screen === 'zone_view') setScreen('world_map')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [settingsOpen, underScreen, setScreen])

  const renderScreen = (screen = currentScreen) => {
    switch (screen) {
      case 'world_map':   return <WorldMap />
      case 'zone_view':   return <ZoneView />
      case 'combat':      return <Combat />
      case 'hero_sheet':  return <HeroSheet onClose={overlayClose} />
      case 'inventory':   return <Inventory onClose={overlayClose} />
      case 'codex':       return <CodexOverlay onClose={overlayClose} />
      case 'quests':      return <QuestsOverlay onClose={overlayClose} />
      case 'safe_zone':   return <SafeZone />
      case 'post_mortem': return <PostMortem />
      case 'gods_shop':   return <GodsShop />
      case 'divine_call': return <WorldMap />
      case 'quest_board': return <QuestBoard />
      default:            return <WorldMap />
    }
  }

  const showCharCreation = hero.runNumber === 1 && !hero.heroNamed
  const showLevelUp = pendingLevelUp > 0 && !showCharCreation

  // Sidebar partagée (réf design) — pour l'instant sur le world_map (autres écrans à porter)
  const zone = ZONES[world.currentZone]
  const locName = zone?.city?.id === world.currentLocation ? zone.city.name
    : zone?.villages?.find(v => v.id === world.currentLocation)?.name ?? zone?.name ?? 'Eldenmoor'
  const showSidebar = baseScreen === 'world_map'
  const sbProps = {
    location: locName, zone: zone?.name ?? 'Ashenvale',
    deity: hero.deity ? hero.deity[0].toUpperCase() + hero.deity.slice(1) : null,
    demonLord: world.demonLordDefeated ? 'Malachar (defeated)' : 'Malachar the Undying',
    tokens: hero.reputationTokens ?? 0,
    actions: [
      { ico: '🌙', label: 'Sleep', primary: true, onClick: () => sleep() },
      { ico: '⚔', label: 'Hero Sheet', onClick: () => setScreen('hero_sheet') },
      { ico: '🎒', label: 'Inventory', onClick: () => setScreen('inventory') },
      // UI-BESTIARY-BTN — accès au bestiaire (CodexOverlay) depuis le panneau parchemin
      { ico: '📖', label: 'Bestiary', onClick: () => setScreen('codex') },
    ],
  }

  return (
    <div className="lb-stage">
      <div className="lb-canvas">
        {!fullscreen && <Topbar onOpenSettings={() => setSettingsOpen(true)} />}
        {!fullscreen && <Breadcrumb />}

        {fullscreen ? (
          <ErrorBoundary>
            <div key={currentScreen} className="anim-screen-fade fill">{renderScreen()}</div>
          </ErrorBoundary>
        ) : (
          <div className="map-area parch-sheet">
            <ErrorBoundary>
              {/* Écran-monde sous-jacent (reste visible/estompé derrière l'overlay) */}
              <div key={baseScreen} className="anim-screen-fade fill" style={{ overflow: 'auto' }}>
                {renderScreen(baseScreen)}
              </div>
              {/* IMM04 — Hero Sheet / Inventory en overlay par-dessus le monde */}
              {isOverlay && (
                <div key={currentScreen} className="fill">
                  {renderScreen(currentScreen)}
                </div>
              )}
            </ErrorBoundary>
          </div>
        )}

        {showSidebar && <Sidebar {...sbProps} />}

        {/* Modals */}
        {pendingDivineCall && <DivineCall />}
        {showLevelUp && <LevelUpModal />}
        {showCharCreation && <CharacterCreation />}
        <OfflineRecapModal />
        {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      </div>

      <ToastContainer />
      <DebugPanel />
    </div>
  )
}

// ── Topbar (planche de bois — réf design) ─────────────────────────────────────
function Meter({ kind, value, max, label }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={`meter m-${kind}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span className="tb-label">{label}</span>
        <span className="m-num">{value}/{max}</span>
      </div>
      <div className="m-track"><div className="m-fill" style={{ width: pct + '%' }} /></div>
    </div>
  )
}

function Topbar({ onOpenSettings }) {
  const { setScreen, currentScreen, hero, world, saveGame, unseenLoot, exportSave, importSave } = useGameStore()
  const [saveFlash, setSaveFlash] = useState(false)
  const [saveMenuOpen, setSaveMenuOpen] = useState(false)
  const fileRef = useRef(null)
  const handleSave = () => { saveGame(); setSaveFlash(true); setTimeout(() => setSaveFlash(false), 1500); setSaveMenuOpen(false) }

  // TECH07 — export téléchargé
  const doExport = () => {
    const blob = new Blob([exportSave()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `loop-breaker-save-day${world.dayCount}.json`
    a.click()
    URL.revokeObjectURL(url)
    setSaveMenuOpen(false)
  }
  // TECH07 — import depuis fichier
  const onImportFile = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const ok = importSave(String(reader.result))
      useToastStore.getState().addToast(ok ? 'Save imported.' : 'Invalid save file.', ok ? 'levelup' : 'warning')
      setSaveMenuOpen(false)
    }
    reader.readAsText(file)
  }

  const tabs = [
    { id: 'world_map', label: 'Map' },
    { id: 'quests', label: 'Quests' }, // UI-QUESTS — suivi des quêtes actives (overlay)
    { id: 'hero_sheet', label: 'Hero' },
    { id: 'inventory', label: 'Bag' },
    { id: 'save', label: saveFlash ? '✓' : 'Save' },
  ]
  const activeTab = currentScreen === 'hero_sheet' ? 'hero_sheet'
    : currentScreen === 'inventory' ? 'inventory'
    : currentScreen === 'quests' ? 'quests' : 'world_map'

  return (
    <div className="topbar">
      <div className="tb-group">
        <div className="center-col">
          <span className="tb-label">Run #{hero.runNumber} · Lv {hero.level}</span>
          <div className="meter m-xp" style={{ width: 120, marginTop: 3 }}>
            <div className="m-track" style={{ height: 8 }}>
              <div className="m-fill" style={{ width: Math.min(100, (hero.exp / hero.expToNext) * 100) + '%' }} />
            </div>
          </div>
        </div>
      </div>
      <div className="tb-divider" />
      <div className="tb-group">
        <Meter kind="hp" value={hero.stats.hp} max={hero.stats.maxHp} label="HP" />
        <Meter kind="mp" value={hero.stats.mana} max={hero.stats.maxMana} label="MP" />
      </div>
      <div style={{ flex: 1 }} />
      <div className="tb-group">
        <div className="tb-stat"><span className="tb-ico">{world.isNight ? '🌙' : '☀'}</span><span className="tb-val">Day {world.dayCount}</span></div>
        <div className="tb-stat"><span className="tb-label">T</span><span className="tb-val">{world.tickCount}/24</span></div>
        <div className="tb-stat"><span className="tb-ico">🪙</span><span className="tb-val">{hero.reputationTokens ?? 0}</span></div>
      </div>
      <div className="tb-divider" />
      <div className="tb-tabs">
        {tabs.map(t => {
          const showBadge = t.id === 'inventory' && unseenLoot && currentScreen !== 'inventory'
          const onClick = () => { if (t.id === 'save') setSaveMenuOpen(o => !o); else setScreen(t.id) }
          return (
            <div key={t.id} className={`tb-tab ${activeTab === t.id || (t.id === 'save' && saveMenuOpen) ? 'active' : ''}`} onClick={onClick} style={{ position: 'relative' }}>
              {t.label}
              {showBadge && (
                <span data-testid="unseen-loot-badge" aria-label="new loot"
                  style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', border: '1px solid #1a0808', boxShadow: '0 0 6px var(--danger)' }} />
              )}
              {/* TECH07 — menu Save / Export / Import */}
              {t.id === 'save' && saveMenuOpen && (
                <div className="tb-save-menu" onClick={e => e.stopPropagation()}>
                  <button onClick={handleSave}>💾 Save now</button>
                  <button onClick={doExport}>⬇ Export to file…</button>
                  <button onClick={() => fileRef.current?.click()}>⬆ Import from file…</button>
                  <button onClick={() => { setSaveMenuOpen(false); onOpenSettings?.() }}>⚙ Options…</button>
                </div>
              )}
            </div>
          )
        })}
        <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={onImportFile} />
      </div>
    </div>
  )
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────
function Breadcrumb() {
  const { world, currentScreen } = useGameStore()
  const zone = ZONES[world.currentZone]
  const zoneName = zone?.name ?? world.currentZone

  const trail = ['Eldenmoor']
  if (currentScreen === 'safe_zone') {
    const loc = zone?.city?.id === world.currentLocation ? zone?.city
      : zone?.villages?.find(v => v.id === world.currentLocation)
    trail.push(zoneName, loc?.name ?? 'Settlement')
  } else if (currentScreen === 'zone_view') {
    const spot = zone?.huntingSpots?.find(s => s.id === world.currentHuntingSpot)
    trail.push(zoneName, spot?.name ?? 'Wilds')
  } else {
    // world_map : Eldenmoor › <lieu courant>
    const loc = zone?.city?.id === world.currentLocation ? zone?.city
      : zone?.villages?.find(v => v.id === world.currentLocation)
    trail.push(loc?.name ?? zoneName)
  }

  return (
    <div className="crumbrule">
      <div className="crumb">
        {trail.map((c, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            {i > 0 && <span className="sep">›</span>}
            <span className={i === trail.length - 1 ? 'cur' : ''}>{c}</span>
          </span>
        ))}
      </div>
      <div className="rope" />
    </div>
  )
}

export default App
