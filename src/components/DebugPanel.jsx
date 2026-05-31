// PROC06 — Debug / cheat panel (DEV only)
// Accessible via Ctrl+Shift+D uniquement quand import.meta.env.DEV est true.
// Aucune trace en build production (le composant retourne null hors DEV).

import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'

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

  if (!IS_DEV || !open) return null

  return <DebugPanelContent onClose={() => setOpen(false)} />
}

function DebugPanelContent({ onClose }) {
  const store = useGameStore
  const hero = useGameStore((s) => s.hero)
  const world = useGameStore((s) => s.world)

  const cmd = (label, fn) => ({ label, fn })

  const commands = [
    cmd('+1000 gold', () => store.getState().addGold(1000)),
    cmd('+50 tokens', () => store.getState().addReputationTokens(50)),
    cmd('+500 XP', () => store.getState().gainExp(500)),
    cmd('Full heal', () => store.getState().healHero(99999)),
    cmd('Skip day (sleep)', () => store.getState().sleep()),
    cmd('+1 tick', () => store.getState().advanceTick()),
    cmd('Set run #10', () => store.setState((s) => ({ hero: { ...s.hero, runNumber: 10 } }))),
    cmd('Force Ignareth', () => store.getState().acceptDeity('ignareth', 'inferno_strike')),
    cmd('Force Sylvara', () => store.getState().acceptDeity('sylvara', 'healing_bloom')),
    cmd('Force Voltaris', () => store.getState().acceptDeity('voltaris', 'chain_lightning')),
    cmd('Kill Malachar', () => store.getState().clearDungeon('grimspire')),
    cmd('Give savage_bite', () => store.getState().addSkillToInventory({ skillId: 'savage_bite', level: 1, xp: 0 })),
    cmd('+5 wolf_pelt', () => store.getState().addResource('wolf_pelt', 5)),
    cmd('+3 hp potions', () => store.getState().addConsumable('hp_potion_medium', 3)),
    cmd('Unlock all idle', () => store.setState((s) => ({
      world: {
        ...s.world,
        monsterKillCounts: Object.fromEntries(
          ['ashwood_wolf', 'rotting_shambler', 'gloom_bat', 'marsh_serpent', 'stone_golem'].map((m) => [m, 10])
        ),
      },
    }))),
    cmd('Reset game', () => store.getState().resetGame()),
  ]

  return (
    <div
      data-testid="debug-panel"
      className="fixed z-[200] rounded-lg overflow-hidden"
      style={{
        bottom: '16px',
        right: '16px',
        width: '280px',
        background: '#0a0a12',
        border: '1px solid #4040a0',
        boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
      }}
    >
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ background: '#10102a', borderBottom: '1px solid #2a2a5a' }}
      >
        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#8080ff', letterSpacing: '0.05em' }}>
          ⚙ DEBUG PANEL (DEV)
        </span>
        <button
          onClick={onClose}
          style={{ color: '#6060a0', fontSize: '0.9rem', cursor: 'pointer', background: 'none', border: 'none' }}
        >
          ✕
        </button>
      </div>

      <div className="px-2 py-1.5" style={{ fontFamily: 'monospace', fontSize: '0.62rem', color: '#5a5a8a' }}>
        Run #{hero.runNumber} · Lv{hero.level} · {hero.inventory.gold}g · 🪙{hero.reputationTokens}
        <br />
        Day {world.dayCount} · T{world.tickCount}/24 · {hero.deity ?? 'no deity'}
      </div>

      <div className="grid grid-cols-2 gap-1 p-2 max-h-[320px] overflow-y-auto">
        {commands.map((c) => (
          <button
            key={c.label}
            onClick={c.fn}
            className="px-2 py-1.5 rounded text-left transition-all hover:opacity-80"
            style={{
              fontFamily: 'monospace',
              fontSize: '0.62rem',
              background: '#16162e',
              color: '#a0a0e0',
              border: '1px solid #2a2a5a',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}
