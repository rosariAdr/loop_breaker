import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

const STAT_KEYS = ['strength', 'agility', 'intelligence', 'chance', 'def']

const STAT_META = {
  strength:     { label: 'Strength',     color: '#c08040', icon: '⚔️' },
  agility:      { label: 'Agility',      color: '#40c080', icon: '🌿' },
  intelligence: { label: 'Intelligence', color: '#8060c0', icon: '✨' },
  chance:       { label: 'Chance',       color: '#c0c040', icon: '🍀' },
  def:          { label: 'Defense',      color: '#6080a0', icon: '🛡️' },
}

export default function LevelUpModal() {
  const { hero, pendingLevelUp, clearPendingLevelUp, updateHeroStat } = useGameStore()
  const [chosen, setChosen] = useState(null)

  const handleConfirm = () => {
    if (!chosen) return
    updateHeroStat(chosen, hero.stats[chosen] + 1)
    clearPendingLevelUp()
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.82)' }}
    >
      <div
        className="w-full max-w-sm mx-4 rounded-xl p-6 flex flex-col gap-5 anim-pop"
        style={{ background: '#0a0c10', border: '1px solid #3a4060' }}
      >
        {/* Titre */}
        <div className="text-center">
          <p style={{ fontFamily: 'Cinzel, serif', color: '#60d0ff', fontSize: '1.6rem', letterSpacing: '0.08em' }}>
            ✦ Level Up!
          </p>
          <p style={{ color: '#3a6a8a', fontSize: '0.82rem', marginTop: '0.3rem' }}>
            You reached level <span style={{ color: '#d4af70' }}>{hero.level}</span>
            {pendingLevelUp > 1 && ` (+${pendingLevelUp} levels)`}
          </p>
        </div>

        {/* Gains automatiques */}
        <div
          className="rounded p-3"
          style={{ background: '#080c10', border: '1px solid #1a2030' }}
        >
          <p style={{ color: '#3a6070', fontSize: '0.68rem', fontFamily: 'Cinzel, serif', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
            Auto bonuses × {pendingLevelUp}
          </p>
          <div className="flex flex-wrap gap-2">
            {['maxHp', 'maxMana', 'strength', 'intelligence', 'def', 'agility'].map(s => (
              <span key={s} style={{ color: '#40a060', fontSize: '0.72rem' }}>
                +{s === 'maxHp' || s === 'maxMana' ? '~10%' : pendingLevelUp} {s}
              </span>
            ))}
          </div>
        </div>

        {/* Choix du bonus */}
        <div>
          <p style={{ color: '#6a5a4a', fontSize: '0.75rem', fontFamily: 'Cinzel, serif', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            Choose a bonus stat (+1)
          </p>
          <div className="flex flex-col gap-2">
            {STAT_KEYS.map(stat => {
              const meta = STAT_META[stat]
              const isChosen = chosen === stat
              return (
                <button
                  key={stat}
                  onClick={() => setChosen(stat)}
                  className="flex items-center justify-between px-3 py-2.5 rounded transition-all"
                  style={{
                    background: isChosen ? '#0a1820' : '#0a0c10',
                    border: `1px solid ${isChosen ? meta.color + '80' : '#1a2030'}`,
                    cursor: 'pointer',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '1rem' }}>{meta.icon}</span>
                    <span style={{ fontFamily: 'Cinzel, serif', color: isChosen ? meta.color : '#6a5a4a', fontSize: '0.85rem' }}>
                      {meta.label}
                    </span>
                  </div>
                  <span style={{ color: isChosen ? meta.color : '#4a4a5a', fontSize: '0.82rem' }}>
                    {hero.stats[stat]} → <strong>{hero.stats[stat] + 1}</strong>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Confirmer */}
        <button
          onClick={handleConfirm}
          disabled={!chosen}
          className="w-full py-3 rounded transition-all"
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '0.9rem',
            background: chosen ? '#081828' : '#080808',
            color: chosen ? '#60d0ff' : '#2a2a3a',
            border: `1px solid ${chosen ? '#2060a0' : '#1a1a2a'}`,
            cursor: chosen ? 'pointer' : 'not-allowed',
          }}
        >
          Confirm & Continue
        </button>
      </div>
    </div>
  )
}
