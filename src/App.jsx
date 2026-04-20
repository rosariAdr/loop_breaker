import { useEffect, useState } from 'react'
import { useGameStore } from './store/gameStore'

import WorldMap from './screens/WorldMap'
import ZoneView from './screens/ZoneView'
import Combat from './screens/Combat'
import HeroSheet from './screens/HeroSheet'
import Inventory from './screens/Inventory'
import SafeZone from './screens/SafeZone'
import PostMortem from './screens/PostMortem'
import GodsShop from './screens/GodsShop'
import DivineCall from './screens/DivineCall'

function App() {
  const { currentScreen, loadGame, saveGame, pendingDivineCall, processIdleTick, advanceTick } = useGameStore()

  // Charger la sauvegarde au démarrage
  useEffect(() => {
    loadGame()
  }, [])

  // Boucle idle : 1 combat toutes les 3 secondes si idle actif
  useEffect(() => {
    const interval = setInterval(() => {
      const { world, activeCombat } = useGameStore.getState()
      if (world.isIdleActive && !activeCombat) {
        processIdleTick()
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Tick calendrier : 1 tick toutes les 30 secondes (1 journée = 12 min)
  useEffect(() => {
    const interval = setInterval(() => {
      const { activeCombat, currentScreen } = useGameStore.getState()
      const pausedScreens = ['post_mortem', 'gods_shop', 'divine_call']
      if (!activeCombat && !pausedScreens.includes(currentScreen)) advanceTick()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // Auto-save toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => saveGame(), 30000)
    return () => clearInterval(interval)
  }, [])

  const renderScreen = () => {
    switch (currentScreen) {
      case 'world_map':     return <WorldMap />
      case 'zone_view':     return <ZoneView />
      case 'combat':        return <Combat />
      case 'hero_sheet':    return <HeroSheet />
      case 'inventory':     return <Inventory />
      case 'safe_zone':     return <SafeZone />
      case 'post_mortem':   return <PostMortem />
      case 'gods_shop':     return <GodsShop />
      case 'divine_call':   return <WorldMap /> // fond derrière le modal
      default:              return <WorldMap />
    }
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0a0a0f' }}>
      <NavBar />
      <main className="flex-1">
        {renderScreen()}
      </main>
      {/* DivineCall est un modal — toujours monté si pendingDivineCall existe */}
      {pendingDivineCall && <DivineCall />}
    </div>
  )
}

function NavBar() {
  const { setScreen, currentScreen, hero, world, saveGame } = useGameStore()
  const [saveFlash, setSaveFlash] = useState(false)

  const hideNav = ['post_mortem', 'gods_shop', 'divine_call'].includes(currentScreen)

  const handleSave = () => {
    saveGame()
    setSaveFlash(true)
    setTimeout(() => setSaveFlash(false), 1500)
  }

  const tabs = [
    { id: 'world_map', label: 'Map' },
    { id: 'hero_sheet', label: 'Hero' },
    { id: 'inventory', label: 'Bag' },
  ]

  return (
    <header
      className="flex items-center justify-between px-4 py-2 border-b"
      style={{ borderColor: '#2a2018', background: '#0f0c08' }}
    >
      {/* Infos run + XP bar */}
      <div className="flex items-center gap-4 text-sm" style={{ color: '#d4af70' }}>
        <span style={{ fontFamily: 'Cinzel, serif' }}>Run #{hero.runNumber}</span>
        <div className="flex items-center gap-1">
          <span style={{ color: '#6a5a4a', fontSize: '0.78rem' }}>Lv{hero.level}</span>
          <div className="w-16 h-1.5 rounded overflow-hidden" style={{ background: '#1a1410' }}>
            <div
              className="h-full rounded transition-all duration-300"
              style={{ width: `${Math.min(100, (hero.exp / hero.expToNext) * 100)}%`, background: '#60d0ff' }}
            />
          </div>
          <span style={{ color: '#3a6a8a', fontSize: '0.7rem' }}>{hero.exp}/{hero.expToNext}</span>
        </div>
        <span style={{ color: '#4a4030', fontSize: '0.78rem' }}>Day {world.dayCount}</span>
      </div>

      {/* Barres HP / MP */}
      <div className="flex items-center gap-4">
        <Bar value={hero.stats.hp} max={hero.stats.maxHp} color="#c04040" label="HP" />
        <Bar value={hero.stats.mana} max={hero.stats.maxMana} color="#3060c0" label="MP" />
      </div>

      {/* Nav + Save */}
      {!hideNav && (
        <div className="flex items-center gap-2">
          <nav className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setScreen(tab.id)}
                className="px-3 py-1 text-sm rounded"
                style={{
                  fontFamily: 'Cinzel, serif',
                  background: currentScreen === tab.id ? '#d4af70' : '#1a1410',
                  color: currentScreen === tab.id ? '#0a0a0f' : '#d4af70',
                  border: '1px solid #2a2018',
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <button
            onClick={handleSave}
            className="px-2 py-1 text-xs rounded transition-all"
            style={{
              fontFamily: 'Cinzel, serif',
              background: saveFlash ? '#0f2010' : '#0f0c08',
              color: saveFlash ? '#80c040' : '#4a4030',
              border: `1px solid ${saveFlash ? '#406030' : '#2a2018'}`,
            }}
          >
            {saveFlash ? '✓ Saved' : '💾 Save'}
          </button>
        </div>
      )}
    </header>
  )
}

function Bar({ value, max, color, label }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs w-6" style={{ color: '#7a6a5a' }}>{label}</span>
      <div className="w-24 h-2 rounded overflow-hidden" style={{ background: '#1a1410' }}>
        <div
          className="h-full rounded transition-all duration-300"
          style={{ width: `${percent}%`, background: color }}
        />
      </div>
      <span className="text-xs" style={{ color: '#7a6a5a' }}>{value}/{max}</span>
    </div>
  )
}

export default App
