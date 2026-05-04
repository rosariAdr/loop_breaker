import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { SKILLS } from '../data/skills'

const CATALOG = [
  {
    id: 'rank_restore',
    label: 'Adventurer Rank Restoration',
    description: 'Restore up to 80% of the rank you reached this run.',
    cost: 40,
    icon: '⚜',
    color: '#d4af70',
  },
  {
    id: 'bonus_skill',
    label: 'Bonus Skill Slot',
    description: 'Carry one additional skill (active or passive) beyond the base three.',
    cost: 80,
    icon: '✨',
    color: '#c084fc',
  },
  {
    id: 'bonus_stat',
    label: 'Bonus Stat Slot',
    description: 'Carry one additional stat beyond the base three.',
    cost: 80,
    icon: '📈',
    color: '#60a5fa',
  },
  {
    id: 'skill_levelup',
    label: 'Skill Level Up',
    description: 'Advance one of your inherited skills by one level.',
    cost: 20,
    icon: '⬆',
    color: '#40c080',
  },
  {
    id: 'starter_kit',
    label: 'Starter Kit',
    description: '3× Minor Healing Potion + 3× Minor Mana Potion to begin the next run.',
    cost: 10,
    icon: '🧪',
    color: '#80c040',
  },
  {
    id: 'divine_oracle',
    label: 'Divine Oracle',
    description: 'Reveals the relation score of deities in the next universe before you arrive.',
    cost: 15,
    icon: '🔮',
    color: '#c0a060',
  },
]

export default function GodsShop() {
  const { hero, meta, spendReputationTokens, applyTransmigration, addConsumable } = useGameStore()
  const [purchases, setPurchases] = useState([])
  const [tokens, setTokens] = useState(hero.reputationTokens + (meta.lastRunSummary?.reputationTokens ?? 0))

  const spend = (item) => {
    if (tokens < item.cost) return
    if (purchases.includes(item.id) && item.id !== 'skill_levelup' && item.id !== 'starter_kit') return
    setTokens(t => t - item.cost)
    setPurchases(p => [...p, item.id])
  }

  const handleConfirm = () => {
    // T10 — Starter kit (peut être acheté plusieurs fois)
    const starterKitCount = purchases.filter(p => p === 'starter_kit').length
    if (starterKitCount > 0) {
      addConsumable('hp_potion_small', 3 * starterKitCount)
      addConsumable('mana_potion_small', 3 * starterKitCount)
    }
    // T07 — Bonus skill : un skill actif basique offert (power_strike Lv 1)
    const extraSkills = purchases.includes('bonus_skill')
      ? [{ type: 'active', skillId: 'power_strike', level: 1, xp: 0 }]
      : []
    const shopPurchases = {
      extraSkills,
      rankRestored: purchases.includes('rank_restore'),
      bonusStatSlot: purchases.includes('bonus_stat'),
      skillLevelUps: purchases.filter(p => p === 'skill_levelup').length,
    }
    applyTransmigration(shopPurchases)
  }

  const inheritance = meta.pendingInheritance

  return (
    <div
      className="flex flex-col items-center min-h-screen p-8 overflow-y-auto"
      style={{ background: 'radial-gradient(ellipse at top, #0f0820 0%, #0a0a0f 60%)' }}
    >
      <div className="w-full max-w-xl flex flex-col gap-6">

        {/* Titre */}
        <div className="text-center">
          <p style={{ fontFamily: 'Cinzel, serif', color: '#c084fc', fontSize: '1.8rem', letterSpacing: '0.08em' }}>
            ✦ Gods' Shop ✦
          </p>
          <p style={{ color: '#5a4a6a', fontSize: '0.82rem', marginTop: '0.4rem', fontStyle: 'italic' }}>
            Between life and death, the divine offer their wares.
          </p>
          <div
            className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded"
            style={{ background: '#1a1028', border: '1px solid #4a2a80' }}
          >
            <span style={{ color: '#c084fc', fontSize: '0.9rem', fontFamily: 'Cinzel, serif' }}>
              🪙 {tokens} tokens
            </span>
          </div>
        </div>

        {/* Héritage — rappel */}
        {inheritance && (
          <div className="p-3 rounded border" style={{ background: '#080f08', borderColor: '#1a2810' }}>
            <p className="mb-2 text-xs uppercase tracking-widest" style={{ color: '#4a5a3a', fontFamily: 'Cinzel, serif' }}>
              Carrying forward
            </p>
            <div className="flex flex-wrap gap-2">
              {inheritance.stat && (
                <Tag label={`Stat: ${inheritance.stat}`} color="#60a5fa" />
              )}
              {inheritance.activeSkill && (
                <Tag label={`Active: ${SKILLS[inheritance.activeSkill.skillId]?.name ?? '?'}`} color="#c084fc" />
              )}
              {inheritance.passiveSkill && (
                <Tag label={`Passive: ${SKILLS[inheritance.passiveSkill.skillId]?.name ?? '?'}`} color="#40c080" />
              )}
            </div>
          </div>
        )}

        {/* Catalogue */}
        <div className="flex flex-col gap-3">
          {CATALOG.map(item => {
            const alreadyBought = purchases.includes(item.id) && item.id !== 'skill_levelup' && item.id !== 'starter_kit'
            const boughtCount = purchases.filter(p => p === item.id).length
            const canAfford = tokens >= item.cost
            const disabled = alreadyBought || !canAfford

            return (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 rounded border transition-all"
                style={{
                  background: alreadyBought ? '#0a1208' : '#0a0810',
                  borderColor: alreadyBought ? '#204020' : '#2a1848',
                  opacity: !canAfford && !alreadyBought ? 0.5 : 1,
                }}
              >
                <span style={{ fontSize: '1.5rem', minWidth: '2rem', textAlign: 'center' }}>{item.icon}</span>
                <div className="flex-1">
                  <p style={{ fontFamily: 'Cinzel, serif', color: item.color, fontSize: '0.88rem' }}>
                    {item.label}
                    {boughtCount > 1 && <span style={{ color: '#6a5a4a', marginLeft: '0.5rem' }}>×{boughtCount}</span>}
                  </p>
                  <p style={{ color: '#5a4a6a', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                    {item.description}
                  </p>
                </div>
                <button
                  onClick={() => spend(item)}
                  disabled={disabled}
                  className="px-4 py-2 rounded text-xs transition-all whitespace-nowrap"
                  style={{
                    fontFamily: 'Cinzel, serif',
                    background: alreadyBought ? '#102010' : canAfford ? '#1a1028' : '#0a0a10',
                    color: alreadyBought ? '#40c040' : canAfford ? '#c084fc' : '#3a2a4a',
                    border: `1px solid ${alreadyBought ? '#204020' : canAfford ? '#5040a0' : '#1a1428'}`,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  {alreadyBought ? '✓ Bought' : `${item.cost} 🪙`}
                </button>
              </div>
            )
          })}
        </div>

        {/* Confirmer */}
        <button
          onClick={handleConfirm}
          className="w-full py-4 rounded transition-all hover:opacity-90"
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '1rem',
            background: '#0a1a0a',
            color: '#80c040',
            border: '1px solid #305020',
            letterSpacing: '0.05em',
          }}
        >
          Transmigrate →
        </button>
      </div>
    </div>
  )
}

function Tag({ label, color }) {
  return (
    <span
      className="px-2 py-1 rounded text-xs"
      style={{ background: '#0a0f0a', color, border: `1px solid ${color}40` }}
    >
      {label}
    </span>
  )
}
