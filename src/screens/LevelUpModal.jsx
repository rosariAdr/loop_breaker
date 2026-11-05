import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

const STAT_KEYS = ['strength', 'agility', 'intelligence', 'chance', 'def']

const STAT_META = {
  strength: { label: 'Strength', color: '#c08040', icon: '⚔️' },
  agility: { label: 'Agility', color: '#40c080', icon: '🌿' },
  intelligence: { label: 'Intelligence', color: '#8060c0', icon: '✨' },
  chance: { label: 'Chance', color: '#c0c040', icon: '🍀' },
  def: { label: 'Defense', color: '#6080a0', icon: '🛡️' },
}

// FIX-LVLQUEUE01 — modal UNIQUE et cumulé : `pendingLevelUp` = nombre de points à répartir
// (1 par niveau gagné, coalescé sur toutes les rafales d'XP). Le joueur alloue autant de
// points que de niveaux ; « Do it later » (ou tout reliquat non alloué de « Confirm »)
// reporte les points dans `hero.pendingStatPoints`, attribuables ensuite depuis le HeroSheet.
export default function LevelUpModal() {
  const { hero, pendingLevelUp, commitLevelUp, deferLevelUp } = useGameStore()
  const [alloc, setAlloc] = useState({})

  const assigned = Object.values(alloc).reduce((a, b) => a + b, 0)
  const remaining = pendingLevelUp - assigned

  const inc = (stat) => {
    if (remaining <= 0) return
    setAlloc((a) => ({ ...a, [stat]: (a[stat] ?? 0) + 1 }))
  }
  const dec = (stat) => {
    setAlloc((a) => {
      if (!(a[stat] > 0)) return a
      return { ...a, [stat]: a[stat] - 1 }
    })
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.82)' }}
      data-testid="levelup-modal"
    >
      <div
        className="w-full max-w-sm mx-4 rounded-xl p-6 flex flex-col gap-5 anim-pop"
        style={{ background: '#0a0c10', border: '1px solid #3a4060' }}
      >
        {/* Titre */}
        <div className="text-center">
          <p
            style={{
              fontFamily: 'Cinzel, serif',
              color: '#60d0ff',
              fontSize: '1.6rem',
              letterSpacing: '0.08em',
            }}
          >
            ✦ Level Up!
          </p>
          <p style={{ color: '#3a6a8a', fontSize: '0.82rem', marginTop: '0.3rem' }}>
            You reached level <span style={{ color: '#d4af70' }}>{hero.level}</span>
            {pendingLevelUp > 1 && (
              <span data-testid="levelup-levels"> {` (+${pendingLevelUp} levels)`}</span>
            )}
          </p>
        </div>

        {/* Gains automatiques */}
        <div className="rounded p-3" style={{ background: '#080c10', border: '1px solid #1a2030' }}>
          <p
            style={{
              color: '#3a6070',
              fontSize: '0.68rem',
              fontFamily: 'Cinzel, serif',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.5rem',
            }}
          >
            Auto bonuses × {pendingLevelUp}
          </p>
          <div className="flex flex-wrap gap-2">
            {['maxHp', 'maxMana', 'strength', 'intelligence', 'def', 'agility'].map((s) => (
              <span key={s} style={{ color: '#40a060', fontSize: '0.72rem' }}>
                +{s === 'maxHp' || s === 'maxMana' ? '~10%' : pendingLevelUp} {s}
              </span>
            ))}
          </div>
        </div>

        {/* Répartition des points de stat (1 par niveau) */}
        <div>
          <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
            <p
              style={{
                color: '#6a5a4a',
                fontSize: '0.75rem',
                fontFamily: 'Cinzel, serif',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Assign stat points
            </p>
            <span
              data-testid="levelup-remaining"
              style={{
                color: remaining > 0 ? '#60d0ff' : '#40a060',
                fontSize: '0.78rem',
                fontFamily: 'Cinzel, serif',
              }}
            >
              {remaining} / {pendingLevelUp} left
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {STAT_KEYS.map((stat) => {
              const meta = STAT_META[stat]
              const added = alloc[stat] ?? 0
              const active = added > 0
              return (
                <div
                  key={stat}
                  className="flex items-center justify-between px-3 py-2 rounded"
                  style={{
                    background: active ? '#0a1820' : '#0a0c10',
                    border: `1px solid ${active ? meta.color + '80' : '#1a2030'}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '1rem' }}>{meta.icon}</span>
                    <span
                      style={{
                        fontFamily: 'Cinzel, serif',
                        color: active ? meta.color : '#6a5a4a',
                        fontSize: '0.85rem',
                      }}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: active ? meta.color : '#4a4a5a', fontSize: '0.8rem' }}>
                      {hero.stats[stat]}
                      {added > 0 && (
                        <>
                          {' → '}
                          <strong>{hero.stats[stat] + added}</strong>
                        </>
                      )}
                    </span>
                    <button
                      onClick={() => dec(stat)}
                      disabled={added <= 0}
                      data-testid={`levelup-minus-${stat}`}
                      className="w-6 h-6 rounded"
                      style={{
                        background: added > 0 ? '#1a2030' : '#0a0c10',
                        color: added > 0 ? '#c0c0d0' : '#2a2a3a',
                        border: '1px solid #2a3040',
                        cursor: added > 0 ? 'pointer' : 'not-allowed',
                      }}
                    >
                      −
                    </button>
                    <button
                      onClick={() => inc(stat)}
                      disabled={remaining <= 0}
                      data-testid={`levelup-plus-${stat}`}
                      className="w-6 h-6 rounded"
                      style={{
                        background: remaining > 0 ? '#081828' : '#0a0c10',
                        color: remaining > 0 ? '#60d0ff' : '#2a2a3a',
                        border: `1px solid ${remaining > 0 ? '#2060a0' : '#1a1a2a'}`,
                        cursor: remaining > 0 ? 'pointer' : 'not-allowed',
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions : Confirmer (applique + reporte le reliquat) / Reporter tout */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => commitLevelUp(alloc)}
            data-testid="levelup-confirm"
            className="w-full py-3 rounded transition-all"
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.9rem',
              background: '#081828',
              color: '#60d0ff',
              border: '1px solid #2060a0',
              cursor: 'pointer',
            }}
          >
            {remaining > 0 ? `Confirm (${remaining} saved for later)` : 'Confirm & Continue'}
          </button>
          <button
            onClick={() => deferLevelUp()}
            data-testid="levelup-defer"
            className="w-full py-2 rounded transition-all"
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.8rem',
              background: 'transparent',
              color: '#6a5a4a',
              border: '1px solid #1a2030',
              cursor: 'pointer',
            }}
          >
            Do it later
          </button>
        </div>
      </div>
    </div>
  )
}
