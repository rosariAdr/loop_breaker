import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { RESOURCES } from '../../data/resources'
import { SKILLS } from '../../data/skills'
import { Panel, InfoLine } from './Panel'
import MasterBoard from './MasterBoard'

// ── Dame Roswyn — Knight Trainer de Millhaven ────────────────────────────────
// FIX-ALDRIC01 (option a) — le bâtiment appartient à un PNJ dédié : Dame Roswyn.
// Sir Aldric est 100 % Greywatch (donneur de quêtes + maître martial) ; ses quêtes ne
// sont plus listées ici (elles vivent sur le board de Greywatch) → l'onglet Quêtes a
// disparu, le panneau garde Techniques + Train + le MasterBoard local (MST08).

// Skills que Roswyn peut enseigner directement (contre or/ressources)
const ROSWYN_TRADES = [
  {
    skillId: 'power_strike',
    cost: { gold: 80 },
    description: "A focused blow. A warrior's first lesson.",
  },
  {
    skillId: 'shield_stance',
    cost: { gold: 100 },
    description: 'Defense is as vital as offense.',
  },
  {
    skillId: 'battle_focus',
    cost: { gold: 120, resources: { wolf_pelt: 3 } },
    description: 'Focus forged from the hunt.',
  },
]

export default function KnightTrainerPanel({ onBack }) {
  const { hero, spendGold, removeResource, addSkillToInventory, grantAura } = useGameStore()
  const [tab, setTab] = useState('trades') // 'trades' | 'train'
  const [msg, setMsg] = useState(null)

  // TRA01 — entraînement : le maître guerrier octroie de l'Aura (voie alternative STA02)
  const TRAIN_AURA_COST = 120
  const TRAIN_AURA_GAIN = 5
  const handleTrainAura = () => {
    if (hero.inventory.gold < TRAIN_AURA_COST) return flash('Not enough gold.', '#c04040')
    spendGold(TRAIN_AURA_COST)
    grantAura(TRAIN_AURA_GAIN)
    flash(`Trained hard! +${TRAIN_AURA_GAIN} Aura.`, '#c084fc')
  }

  const flash = (text, color = 'var(--forest-deep)') => {
    setMsg({ text, color })
    setTimeout(() => setMsg(null), 2500)
  }

  const handleTrade = (trade) => {
    const { cost, skillId } = trade
    if (hero.inventory.gold < (cost.gold ?? 0)) return flash('Not enough gold.', '#c04040')
    if (cost.resources) {
      for (const [resId, qty] of Object.entries(cost.resources)) {
        if ((hero.inventory.resources[resId] ?? 0) < qty)
          return flash(`Not enough ${RESOURCES[resId]?.name ?? resId}.`, '#c04040')
      }
    }
    const alreadyOwns =
      hero.inventory.manaStones.some((s) => s.skillId === skillId) ||
      hero.activeSkills.some((s) => s.skillId === skillId) ||
      hero.passiveSkills.some((s) => s.skillId === skillId)
    if (alreadyOwns) return flash('You already know this skill.', '#c04040')

    spendGold(cost.gold ?? 0)
    if (cost.resources) {
      for (const [resId, qty] of Object.entries(cost.resources)) removeResource(resId, qty)
    }
    addSkillToInventory({ skillId, level: 1, xp: 0 })
    flash(`Learned: ${SKILLS[skillId]?.name ?? skillId}!`)
  }

  return (
    <Panel title="⚔ Dame Roswyn — Knight Trainer of Millhaven" onBack={onBack}>
      <p
        style={{
          color: 'var(--ink-soft)',
          fontSize: '0.83rem',
          marginBottom: '0.75rem',
          fontStyle: 'italic',
        }}
      >
        "Stance before steel — the road taught me that. Let me spare you its worst lessons."
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {['trades', 'train'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-3 py-1 rounded text-xs capitalize"
            style={{
              fontFamily: 'Cinzel, serif',
              background: tab === t ? 'rgba(212,160,23,.18)' : 'rgba(201,169,110,.18)',
              color: tab === t ? 'var(--amber-deep)' : 'var(--ink-soft)',
              border: `1px solid ${tab === t ? 'var(--parchment-shadow)' : 'var(--parchment-shadow)'}`,
            }}
          >
            {t === 'trades' ? '⚔ Techniques' : '🔥 Train'}
          </button>
        ))}
      </div>

      {msg && (
        <p
          className="mb-3"
          style={{ color: msg.color, fontSize: '0.82rem', fontFamily: 'Cinzel, serif' }}
        >
          {msg.text}
        </p>
      )}

      {/* ── Tab Techniques ── */}
      {tab === 'trades' && (
        <div className="flex flex-col gap-2" style={{ maxWidth: '460px' }}>
          <InfoLine label="Gold" value={`${hero.inventory.gold}g`} />
          <div className="mt-2 flex flex-col gap-2">
            {ROSWYN_TRADES.map((trade) => {
              const skill = SKILLS[trade.skillId]
              if (!skill) return null
              const alreadyOwns =
                hero.inventory.manaStones.some((s) => s.skillId === trade.skillId) ||
                hero.activeSkills.some((s) => s.skillId === trade.skillId) ||
                hero.passiveSkills.some((s) => s.skillId === trade.skillId)
              const canAffordGold = hero.inventory.gold >= (trade.cost.gold ?? 0)
              const canAffordRes =
                !trade.cost.resources ||
                Object.entries(trade.cost.resources).every(
                  ([resId, qty]) => (hero.inventory.resources[resId] ?? 0) >= qty,
                )
              const canBuy = canAffordGold && canAffordRes && !alreadyOwns

              const costLabel = [
                trade.cost.gold && `${trade.cost.gold}g`,
                ...(trade.cost.resources
                  ? Object.entries(trade.cost.resources).map(
                      ([rId, q]) => `${q}× ${RESOURCES[rId]?.name ?? rId}`,
                    )
                  : []),
              ]
                .filter(Boolean)
                .join(' + ')

              return (
                <div
                  key={trade.skillId}
                  className="flex items-center justify-between p-3 rounded"
                  style={{
                    background: 'rgba(201,169,110,.18)',
                    border: `1px solid ${alreadyOwns ? 'rgba(74,124,47,.16)' : 'var(--parchment-shadow)'}`,
                    opacity: alreadyOwns ? 0.55 : 1,
                  }}
                >
                  <div className="flex-1">
                    <p
                      style={{
                        fontFamily: 'Cinzel, serif',
                        color: 'var(--amber-deep)',
                        fontSize: '0.88rem',
                      }}
                    >
                      {skill.name}
                      <span
                        className="ml-2 text-xs"
                        style={{ color: skill.type === 'active' ? '#60c0a0' : '#c084fc' }}
                      >
                        [{skill.type}]
                      </span>
                    </p>
                    <p
                      style={{
                        color: 'var(--ink-soft)',
                        fontSize: '0.73rem',
                        fontStyle: 'italic',
                        marginTop: '0.15rem',
                      }}
                    >
                      {trade.description}
                    </p>
                    <p
                      style={{ color: 'var(--ink-soft)', fontSize: '0.7rem', marginTop: '0.2rem' }}
                    >
                      Cost: {costLabel}
                    </p>
                  </div>
                  <button
                    onClick={() => handleTrade(trade)}
                    disabled={!canBuy}
                    className="ml-3 px-3 py-1 rounded text-xs shrink-0"
                    style={{
                      fontFamily: 'Cinzel, serif',
                      background: alreadyOwns
                        ? 'rgba(201,169,110,.18)'
                        : canBuy
                          ? 'rgba(212,160,23,.18)'
                          : 'rgba(201,169,110,.18)',
                      color: alreadyOwns
                        ? '#3a4a2a'
                        : canBuy
                          ? 'var(--amber-deep)'
                          : 'var(--ink-soft)',
                      border: `1px solid ${alreadyOwns ? 'rgba(74,124,47,.16)' : canBuy ? 'var(--parchment-shadow)' : 'var(--parchment-shadow)'}`,
                      cursor: canBuy ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {alreadyOwns ? '✓ Known' : 'Learn'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TRA01 — entraînement : le maître guerrier octroie de l'Aura */}
      {tab === 'train' && (
        <div className="flex flex-col gap-2" style={{ maxWidth: 460 }}>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.8rem', fontStyle: 'italic' }}>
            "Sweat now, bleed less later. Train, and your blows will bite harder."
          </p>
          <div
            className="flex items-center justify-between px-3 py-2 rounded"
            style={{
              background: 'rgba(192,132,252,.10)',
              border: '1px solid var(--parchment-shadow)',
            }}
          >
            <div>
              <p style={{ fontFamily: 'Cinzel, serif', color: '#c084fc', fontSize: '0.88rem' }}>
                Combat Training
              </p>
              <p style={{ color: 'var(--ink-soft)', fontSize: '0.73rem' }}>
                +{TRAIN_AURA_GAIN} Aura · current: {hero.aura ?? 0}
              </p>
            </div>
            <button
              onClick={handleTrainAura}
              disabled={hero.inventory.gold < TRAIN_AURA_COST}
              data-testid="train-aura"
              className="px-3 py-1 rounded text-xs shrink-0"
              style={{
                fontFamily: 'Cinzel, serif',
                background:
                  hero.inventory.gold >= TRAIN_AURA_COST
                    ? 'rgba(192,132,252,.18)'
                    : 'rgba(201,169,110,.18)',
                color: hero.inventory.gold >= TRAIN_AURA_COST ? '#c084fc' : 'var(--ink-soft)',
                border: '1px solid var(--parchment-shadow)',
                cursor: hero.inventory.gold >= TRAIN_AURA_COST ? 'pointer' : 'not-allowed',
              }}
            >
              {TRAIN_AURA_COST} 🪙
            </button>
          </div>
        </div>
      )}

      {/* MST08 / v1.43 (DÉCISION #3) — tableau de maître LOCAL de Millhaven : surface le
          maître ITINÉRANT de passage les jours où Millhaven l'accueille (gating partagé,
          cf. MasterBoard.jsx). Rend null hors de ces jours. */}
      <MasterBoard />
    </Panel>
  )
}
