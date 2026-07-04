import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { RESOURCES } from '../../data/resources'
import { SKILLS } from '../../data/skills'
import { QUESTS } from '../../data/quests'
import { Panel, InfoLine } from './Panel'

// ── Sir Aldric — Knight Trainer ───────────────────────────────────────────────

// Skills qu'Aldric peut enseigner directement (contre or/ressources)
const ALDRIC_TRADES = [
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
  const {
    hero,
    world,
    spendGold,
    removeResource,
    addSkillToInventory,
    startQuest,
    completeQuest,
    isQuestComplete,
    grantAura,
  } = useGameStore()
  const [tab, setTab] = useState('quests') // 'quests' | 'trades' | 'train'
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

  // Garde-fous pour les anciennes sauvegardes avec format incorrect
  const activeQuests = Array.isArray(world.activeQuests) ? world.activeQuests : []
  const completedQuests = Array.isArray(world.completedQuests) ? world.completedQuests : []

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

  const questIds = Object.keys(QUESTS).filter((qId) => QUESTS[qId].giverNpc === 'sir_aldric')

  return (
    <Panel title="⚔ Sir Aldric — Knight of Millhaven" onBack={onBack}>
      <p
        style={{
          color: 'var(--ink-soft)',
          fontSize: '0.83rem',
          marginBottom: '0.75rem',
          fontStyle: 'italic',
        }}
      >
        "I have fought for twenty years. Let me spare you the worst of the lessons."
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {['quests', 'trades', 'train'].map((t) => (
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
            {t === 'quests' ? '📜 Quests' : t === 'trades' ? '⚔ Techniques' : '🔥 Train'}
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

      {/* ── Tab Quêtes ── */}
      {tab === 'quests' && (
        <div className="flex flex-col gap-3" style={{ maxWidth: '460px' }}>
          {questIds.map((questId) => {
            const quest = QUESTS[questId]
            const isActive = activeQuests.includes(questId)
            const isDone = completedQuests.includes(questId)
            const canComplete = isActive && isQuestComplete(questId)

            let statusColor = 'var(--ink-soft)'
            let statusLabel = 'Not started'
            if (isDone) {
              statusColor = 'var(--forest-deep)'
              statusLabel = 'Completed ✓'
            } else if (canComplete) {
              statusColor = 'var(--amber-deep)'
              statusLabel = 'Ready to claim!'
            } else if (isActive) {
              statusColor = '#6a9a4a'
              statusLabel = 'In progress'
            }

            return (
              <div
                key={questId}
                className="p-3 rounded"
                style={{
                  background: 'rgba(201,169,110,.18)',
                  border: `1px solid ${isDone ? 'rgba(74,124,47,.16)' : canComplete ? '#4a3a18' : 'var(--parchment-shadow)'}`,
                  opacity: isDone ? 0.6 : 1,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p
                      style={{
                        fontFamily: 'Cinzel, serif',
                        color: isDone ? '#4a5a2a' : 'var(--amber-deep)',
                        fontSize: '0.88rem',
                      }}
                    >
                      {quest.name}
                    </p>
                    <p
                      style={{
                        color: 'var(--ink-soft)',
                        fontSize: '0.75rem',
                        marginTop: '0.2rem',
                        fontStyle: 'italic',
                      }}
                    >
                      {quest.flavorText}
                    </p>
                    {/* Objectifs */}
                    <div className="mt-2 flex flex-col gap-0.5">
                      {quest.objectives.map((obj) => {
                        let current = 0
                        let target = 0
                        if (obj.type === 'kill') {
                          current = world.monsterKillCounts[obj.monsterId] ?? 0
                          target = obj.count
                        } else if (obj.type === 'level') {
                          current = hero.level
                          target = obj.targetLevel
                        }
                        const done = current >= target
                        return (
                          <p
                            key={obj.id}
                            style={{
                              color: done ? 'var(--forest-deep)' : 'var(--ink-soft)',
                              fontSize: '0.72rem',
                            }}
                          >
                            {done ? '✓' : '○'} {obj.label} ({Math.min(current, target)}/{target})
                          </p>
                        )
                      })}
                    </div>
                    {/* Récompense */}
                    <p
                      style={{ color: 'var(--ink-soft)', fontSize: '0.7rem', marginTop: '0.4rem' }}
                    >
                      Reward:{' '}
                      {quest.reward.skill &&
                        `${SKILLS[quest.reward.skill.skillId]?.name ?? quest.reward.skill.skillId}`}
                      {quest.reward.gold && ` · ${quest.reward.gold}g`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <p
                      style={{
                        color: statusColor,
                        fontSize: '0.68rem',
                        fontFamily: 'Cinzel, serif',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {statusLabel}
                    </p>
                    {!isActive && !isDone && (
                      <button
                        onClick={() => {
                          startQuest(questId)
                          flash(`Quest accepted: ${quest.name}`)
                        }}
                        className="px-2 py-0.5 rounded text-xs"
                        style={{
                          fontFamily: 'Cinzel, serif',
                          background: 'rgba(74,124,47,.16)',
                          color: 'var(--forest-deep)',
                          border: '1px solid rgba(74,124,47,.4)',
                        }}
                      >
                        Accept
                      </button>
                    )}
                    {canComplete && (
                      <button
                        onClick={() => {
                          completeQuest(questId)
                          flash(`Quest complete! Reward claimed.`)
                        }}
                        className="px-2 py-0.5 rounded text-xs"
                        style={{
                          fontFamily: 'Cinzel, serif',
                          background: 'rgba(212,160,23,.18)',
                          color: 'var(--amber-deep)',
                          border: '1px solid #4a3a18',
                        }}
                      >
                        Claim
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Tab Techniques ── */}
      {tab === 'trades' && (
        <div className="flex flex-col gap-2" style={{ maxWidth: '460px' }}>
          <InfoLine label="Gold" value={`${hero.inventory.gold}g`} />
          <div className="mt-2 flex flex-col gap-2">
            {ALDRIC_TRADES.map((trade) => {
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
    </Panel>
  )
}
