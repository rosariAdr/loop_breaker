// PROC06 / DEV01 — Debug / cheat / test harness (DEV only)
// Toggle : bouton flottant « DEV » (bas-droite) ou hotkey Ctrl+Shift+D.
// Aucune trace en build production (le composant retourne null hors DEV).

import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { generateEnemies } from '../engine/combat'

const IS_DEV = import.meta.env?.DEV ?? false

export default function DebugPanel() {
  const [open, setOpen] = useState(false)

  // Hotkey Ctrl+Shift+D
  useEffect(() => {
    if (!IS_DEV) return
    const onKey = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!IS_DEV) return null

  return (
    <>
      {!open && (
        <button
          data-testid="debug-toggle"
          onClick={() => setOpen(true)}
          title="Test harness (Ctrl+Shift+D)"
          style={{
            position: 'fixed', bottom: 14, right: 14, zIndex: 200,
            fontFamily: 'monospace', fontSize: 11, letterSpacing: '.08em',
            padding: '7px 11px', borderRadius: 8, cursor: 'pointer',
            background: '#10102a', color: '#8080ff', border: '1px solid #4040a0',
            boxShadow: '0 4px 16px rgba(0,0,0,.5)',
          }}
        >
          ⚙ DEV
        </button>
      )}
      {open && <DebugPanelContent onClose={() => setOpen(false)} />}
    </>
  )
}

function DebugPanelContent({ onClose }) {
  const store = useGameStore
  const hero = useGameStore((s) => s.hero)
  const world = useGameStore((s) => s.world)
  const get = () => store.getState()

  const cmd = (label, fn) => ({ label, fn })

  // ── Navigation entre écrans ───────────────────────────────────────────────
  const nav = [
    cmd('🗺 World Map', () => get().setScreen('world_map')),
    cmd('🏘 Village', () => {
      store.setState((s) => ({ world: { ...s.world, currentZone: 'ashenvale', currentLocation: 'millhaven', currentHuntingSpot: null } }))
      get().setScreen('safe_zone')
    }),
    cmd('🌲 Forest', () => {
      store.setState((s) => ({ world: { ...s.world, currentZone: 'ashenvale', currentHuntingSpot: 'ashenvale_forest' } }))
      get().setScreen('zone_view')
    }),
    cmd('⚔ Hero Sheet', () => get().setScreen('hero_sheet')),
    cmd('🎒 Inventory', () => get().setScreen('inventory')),
    cmd('📜 Quest Board', () => get().setScreen('quest_board')),
  ]

  // ── Déclencheurs de flux ──────────────────────────────────────────────────
  const triggers = [
    cmd('⚔ Start combat', () => {
      const enemies = generateEnemies('ashwood_wolf', 'ashenvale', get().hero.runNumber)
      if (enemies.length) get().startCombat(enemies)
    }),
    cmd('✦ Divine call', () => get().triggerDivineCall('ignareth')),
    cmd('☠ Die → PostMortem', () => get().heroDeath('Debug Panel')),
    cmd("🛒 Gods' Shop", () => get().setScreen('gods_shop')),
  ]

  // ── Cheats d'état ─────────────────────────────────────────────────────────
  const cheats = [
    cmd('+1000 gold', () => get().addGold(1000)),
    cmd('+50 tokens', () => get().addReputationTokens(50)),
    cmd('+500 XP', () => get().gainExp(500)),
    cmd('Full heal', () => get().healHero(99999)),
    cmd('Skip day (sleep)', () => get().sleep()),
    cmd('+1 tick', () => get().advanceTick()),
    cmd('Set run #10', () => store.setState((s) => ({ hero: { ...s.hero, runNumber: 10 } }))),
    cmd('Force Ignareth', () => get().acceptDeity('ignareth', 'inferno_strike')),
    cmd('Force Sylvara', () => get().acceptDeity('sylvara', 'healing_bloom')),
    cmd('Force Voltaris', () => get().acceptDeity('voltaris', 'chain_lightning')),
    cmd('Kill Malachar', () => get().clearDungeon('grimspire')),
    cmd('Give savage_bite', () => get().addSkillToInventory({ skillId: 'savage_bite', level: 1, xp: 0 })),
    cmd('+5 wolf_pelt', () => get().addResource('wolf_pelt', 5)),
    cmd('+3 hp potions', () => get().addConsumable('hp_potion_medium', 3)),
    cmd('Unlock all idle', () => store.setState((s) => ({
      world: {
        ...s.world,
        monsterKillCounts: Object.fromEntries(
          ['ashwood_wolf', 'rotting_shambler', 'gloom_bat', 'marsh_serpent', 'stone_golem'].map((m) => [m, 10])
        ),
      },
    }))),
    cmd('Reset game', () => get().resetGame()),
  ]

  return (
    <div
      data-testid="debug-panel"
      className="fixed z-[200] rounded-lg overflow-hidden"
      style={{
        bottom: '16px', right: '16px', width: '300px',
        background: '#0a0a12', border: '1px solid #4040a0',
        boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
      }}
    >
      <div className="flex items-center justify-between px-3 py-2" style={{ background: '#10102a', borderBottom: '1px solid #2a2a5a' }}>
        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#8080ff', letterSpacing: '0.05em' }}>
          ⚙ TEST HARNESS (DEV)
        </span>
        <button onClick={onClose} style={{ color: '#6060a0', fontSize: '0.9rem', cursor: 'pointer', background: 'none', border: 'none' }}>✕</button>
      </div>

      <div className="px-2 py-1.5" style={{ fontFamily: 'monospace', fontSize: '0.62rem', color: '#5a5a8a' }}>
        Run #{hero.runNumber} · Lv{hero.level} · {hero.inventory.gold}g · 🪙{hero.reputationTokens}
        <br />
        Day {world.dayCount} · T{world.tickCount}/24 · {hero.deity ?? 'no deity'} · [{world.currentZone}]
      </div>

      <div className="max-h-[420px] overflow-y-auto px-2 pb-2">
        <Section title="Navigate" commands={nav} accent="#80a0ff" />
        <Section title="Triggers" commands={triggers} accent="#e0a060" />
        <Section title="Cheats" commands={cheats} accent="#a0a0e0" />
      </div>
    </div>
  )
}

function Section({ title, commands, accent }) {
  return (
    <div className="mt-1.5">
      <p style={{ fontFamily: 'monospace', fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: accent, opacity: 0.8, margin: '6px 2px 4px' }}>
        {title}
      </p>
      <div className="grid grid-cols-2 gap-1">
        {commands.map((c) => (
          <button
            key={c.label}
            onClick={c.fn}
            className="px-2 py-1.5 rounded text-left transition-all hover:opacity-80"
            style={{ fontFamily: 'monospace', fontSize: '0.62rem', background: '#16162e', color: '#a0a0e0', border: '1px solid #2a2a5a' }}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}
