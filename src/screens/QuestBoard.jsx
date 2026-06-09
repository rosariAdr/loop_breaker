import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { QUEST_NPC_REGISTRY, getBoardQuests, isPrestigiousQuest, PRESTIGE_MIN_TOKENS } from '../data/quests'
import { getLocationType } from '../data/zones'
import { SKILLS } from '../data/skills'
import { RESOURCES } from '../data/resources'
import ConfirmDialog from '../components/ConfirmDialog'

// Q06 — Rangs aventurier basés sur les reputation tokens
// Seuils : Copper 0-9, Silver 10-29, Gold 30-69, Platinum 70-149, Diamond 150+
export const RANK_TIERS = [
  { id: 'copper',   label: 'Copper',   color: '#b87333', threshold: 0,   nextAt: 10  },
  { id: 'silver',   label: 'Silver',   color: '#bbbbbb', threshold: 10,  nextAt: 30  },
  { id: 'gold',     label: 'Gold',     color: '#d4af70', threshold: 30,  nextAt: 70  },
  { id: 'platinum', label: 'Platinum', color: '#c0e0e0', threshold: 70,  nextAt: 150 },
  { id: 'diamond',  label: 'Diamond',  color: '#80c0ff', threshold: 150, nextAt: null },
]

export function getRankInfo(tokens) {
  const t = Math.max(0, tokens ?? 0)
  // Trouver le tier courant (le plus élevé dont on dépasse le seuil)
  let current = RANK_TIERS[0]
  for (const tier of RANK_TIERS) {
    if (t >= tier.threshold) current = tier
  }
  const isMax = current.nextAt === null
  const tokensInTier = t - current.threshold
  const tokensNeededInTier = isMax ? 0 : current.nextAt - current.threshold
  const pctToNext = isMax ? 1 : tokensInTier / tokensNeededInTier
  return {
    tier: current.id,
    label: current.label,
    color: current.color,
    tokens: t,
    tokensInTier,
    tokensNeededInTier,
    pctToNext: Math.min(1, pctToNext),
    isMax,
    nextAt: current.nextAt,
  }
}

export default function QuestBoard() {
  const { hero, world, meta, setScreen, startQuest, isQuestComplete, completeQuest, abandonQuest } = useGameStore()
  const [pendingAbandon, setPendingAbandon] = useState(null) // questObject

  const activeIds = world.activeQuests ?? []
  const completedIds = world.completedQuests ?? []
  const visitedSpots = world.visitedSpots ?? []
  const craftCount = meta?.craftCount ?? 0

  // GLD01/GLD02 — venue : la ville = Guilde (tout le board, prestige gardé par le rang),
  // le village = auberge (pool réduit, sans quêtes prestigieuses).
  const locationType = getLocationType(world)
  const isGuild = locationType === 'city'
  const venue = isGuild ? 'guild' : 'village'
  const boardQuests = getBoardQuests(venue)

  const available = boardQuests.filter(q => !activeIds.includes(q.id) && !completedIds.includes(q.id))
  const active    = boardQuests.filter(q => activeIds.includes(q.id))
  const completed = boardQuests.filter(q => completedIds.includes(q.id))

  const rank = getRankInfo(hero.reputationTokens)
  // une quête prestigieuse ne peut être acceptée qu'à partir du rang Argent
  const canAcceptPrestige = (hero.reputationTokens ?? 0) >= PRESTIGE_MIN_TOKENS
  const acceptGuard = (q) => {
    if (isPrestigiousQuest(q) && !canAcceptPrestige) return
    startQuest(q.id)
  }
  const boardTitle = isGuild ? "Adventurers' Guild" : 'Village Notice Board'
  const backLabel = isGuild ? '← Guild' : '← Inn'

  return (
    <div className="flex h-full" style={{ minHeight: 'calc(100vh - 48px)' }}>
      <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto max-w-2xl">

        <div className="flex items-center gap-4">
          <button
            onClick={() => setScreen('safe_zone')}
            style={{ color: '#6a5a4a', fontSize: '0.85rem', fontFamily: 'Cinzel, serif' }}
          >
            {backLabel}
          </button>
          <h2 style={{ fontFamily: 'Cinzel, serif', color: '#d4af70', fontSize: '1.3rem' }}>
            {boardTitle}
          </h2>
          <span style={{ marginLeft: 'auto', color: '#c084fc', fontSize: '0.82rem' }}>
            {hero.reputationTokens} 🪙 tokens
          </span>
        </div>

        {/* GLD01/GLD02 — sous-titre selon le lieu */}
        <p style={{ color: '#6a5a4a', fontSize: '0.78rem', fontStyle: 'italic', marginTop: '-0.5rem' }}>
          {isGuild
            ? 'Prestigious commissions for proven adventurers — your reputation opens new doors.'
            : "Local errands posted on the inn's board — and your Adventurer's Card."}
        </p>

        {/* Q06 — Rang aventurier (la « carte d'aventurier ») */}
        <RankBanner rank={rank} />

        {active.length > 0 && (
          <Section title={`Active (${active.length})`}>
            {active.map(q => (
              <QuestCard
                key={q.id}
                quest={q}
                questStatus="active"
                heroLevel={hero.level}
                killCounts={world.monsterKillCounts}
                visitedSpots={visitedSpots}
                craftCount={craftCount}
                canComplete={isQuestComplete(q.id)}
                onComplete={() => completeQuest(q.id)}
                onAbandon={() => setPendingAbandon(q)}
              />
            ))}
          </Section>
        )}

        {available.length > 0 && (
          <Section title={isGuild ? 'Available · Guild Commissions' : 'Available'}>
            {available.map(q => {
              const locked = isPrestigiousQuest(q) && !canAcceptPrestige
              return (
                <QuestCard
                  key={q.id}
                  quest={q}
                  questStatus="available"
                  heroLevel={hero.level}
                  killCounts={world.monsterKillCounts}
                  visitedSpots={visitedSpots}
                  craftCount={craftCount}
                  prestige={isPrestigiousQuest(q)}
                  lockedReason={locked ? `Requires ${PRESTIGE_MIN_TOKENS} 🪙 (Silver rank)` : null}
                  onAccept={() => acceptGuard(q)}
                />
              )
            })}
          </Section>
        )}

        {completed.length > 0 && (
          <Section title={`Completed (${completed.length})`}>
            {completed.map(q => (
              <QuestCard key={q.id} quest={q} questStatus="completed" heroLevel={hero.level} killCounts={world.monsterKillCounts} />
            ))}
          </Section>
        )}

        {available.length === 0 && active.length === 0 && completed.length === 0 && (
          <p style={{ color: '#4a3a2a', fontSize: '0.85rem', fontStyle: 'italic' }}>
            No quests available at this location.
          </p>
        )}
      </div>

      {/* UX03 — Confirmation abandon de quête */}
      <ConfirmDialog
        open={!!pendingAbandon}
        title="Abandon quest?"
        message={pendingAbandon ? `You are about to abandon "${pendingAbandon.name}". Your progress on this quest will be lost.` : ''}
        confirmLabel="Abandon"
        cancelLabel="Keep going"
        variant="warn"
        onConfirm={() => { abandonQuest(pendingAbandon.id); setPendingAbandon(null) }}
        onCancel={() => setPendingAbandon(null)}
      />
    </div>
  )
}

// ── Q06 — Banner rang aventurier avec progression ──────────────────────────────
function RankBanner({ rank }) {
  const pctLabel = rank.isMax
    ? 'MAX'
    : `${rank.tokensInTier} / ${rank.tokensNeededInTier} to ${nextLabel(rank.tier)}`

  return (
    <div
      data-testid="rank-banner"
      className="rounded p-3 flex flex-col gap-2"
      style={{ background: '#0a0a0f', border: `1px solid ${rank.color}40` }}
    >
      <div className="flex items-center justify-between">
        <span style={{ color: rank.color, fontFamily: 'Cinzel, serif', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
          ⚜ Adventurer Rank: <strong>{rank.label}</strong>
        </span>
        <span style={{ color: '#6a5a4a', fontSize: '0.72rem', fontFamily: 'Cinzel, serif' }}>
          {pctLabel}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`Adventurer rank progress: ${rank.label}`}
        aria-valuenow={Math.round(rank.pctToNext * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="rounded overflow-hidden"
        style={{ height: '6px', background: '#1a1410' }}
      >
        <div
          className="h-full rounded transition-all duration-500"
          style={{
            width: `${rank.pctToNext * 100}%`,
            background: rank.color,
            boxShadow: `0 0 6px ${rank.color}80`,
          }}
        />
      </div>
    </div>
  )
}

function nextLabel(currentTierId) {
  const idx = RANK_TIERS.findIndex(t => t.id === currentTierId)
  const next = RANK_TIERS[idx + 1]
  return next?.label ?? '???'
}

export function QuestCard({ quest, questStatus, heroLevel, killCounts = {}, visitedSpots = [], craftCount = 0, skillLevels = {}, prestige = false, lockedReason = null, canComplete, onAccept, onComplete, onAbandon }) {
  const isCompleted = questStatus === 'completed'
  const isActive    = questStatus === 'active'

  const borderColor = isCompleted ? '#305030' : isActive ? '#3a2818' : '#2a2018'
  const bgColor     = isCompleted ? '#081008' : '#0a0a08'

  const npc = QUEST_NPC_REGISTRY[quest.giverNpc]

  return (
    <div className="p-4 rounded border" style={{ background: bgColor, borderColor }}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex-1">
          <p style={{ fontFamily: 'Cinzel, serif', color: isCompleted ? '#40c080' : '#d4af70', fontSize: '0.9rem' }}>
            {prestige && <span title="Guild commission" style={{ color: '#c084fc', marginRight: 4 }}>⚜</span>}
            {quest.name}{isCompleted && ' ✓'}
          </p>
          {npc && (
            <p style={{ color: '#6a5a4a', fontSize: '0.68rem', fontFamily: 'Cinzel, serif', marginTop: '0.1rem' }}>
              {npc.sigil} {npc.name} · {npc.title}
            </p>
          )}
        </div>
        {isActive && canComplete && (
          <button
            onClick={onComplete}
            className="px-3 py-1 rounded text-xs"
            style={{ fontFamily: 'Cinzel, serif', background: '#0a2010', color: '#40c080', border: '1px solid #305030', flexShrink: 0 }}
          >
            Claim
          </button>
        )}
        {isActive && !canComplete && onAbandon && (
          <button
            onClick={onAbandon}
            className="px-3 py-1 rounded text-xs"
            style={{ fontFamily: 'Cinzel, serif', background: '#1a0808', color: '#a06040', border: '1px solid #4a2010', flexShrink: 0 }}
            title="Abandon this quest"
          >
            Abandon
          </button>
        )}
        {questStatus === 'available' && !lockedReason && (
          <button
            onClick={onAccept}
            className="px-3 py-1 rounded text-xs"
            style={{ fontFamily: 'Cinzel, serif', background: '#1a1208', color: '#d4af70', border: '1px solid #3a2818', flexShrink: 0 }}
          >
            Accept
          </button>
        )}
        {questStatus === 'available' && lockedReason && (
          <span
            data-testid="quest-locked"
            title={lockedReason}
            className="px-3 py-1 rounded text-xs"
            style={{ fontFamily: 'Cinzel, serif', background: '#0a0a08', color: '#7a6a8a', border: '1px solid #2a2038', flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            🔒 {lockedReason}
          </span>
        )}
      </div>

      <p style={{ color: '#5a4a3a', fontSize: '0.75rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>
        {quest.flavorText}
      </p>

      {!isCompleted && (
        <div className="flex flex-col gap-2 mb-2">
          {quest.objectives.map(obj => {
            const current = obj.type === 'kill'
              ? Math.min(obj.count, killCounts[obj.monsterId] ?? 0)
              : obj.type === 'level'
                ? Math.min(obj.targetLevel, heroLevel ?? 1)
                : obj.type === 'visit'
                  ? (visitedSpots.includes(obj.spotId) ? 1 : 0)
                  : obj.type === 'craft'
                    ? Math.min(obj.count, craftCount)
                    : obj.type === 'skill_levelup'
                      ? Math.min(obj.targetLevel, skillLevels[obj.skillId] ?? 0)
                      : 0
            const target = obj.type === 'kill' ? obj.count
              : obj.type === 'level' ? obj.targetLevel
                : obj.type === 'craft' ? obj.count
                  : obj.type === 'skill_levelup' ? obj.targetLevel
                    : 1
            const done = current >= target
            const pct = target > 0 ? current / target : 0

            return (
              <div key={obj.id} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span style={{ color: done ? '#40c080' : '#4a3a2a', fontSize: '0.7rem' }}>
                    {done ? '✓' : '○'}
                  </span>
                  <span style={{ color: done ? '#60a060' : '#6a5a4a', fontSize: '0.75rem' }}>
                    {obj.label} ({current}/{target})
                  </span>
                </div>
                {/* Q02 — Barre de progression visuelle */}
                <div
                  data-testid="objective-progress"
                  role="progressbar"
                  aria-label={`Objective progress: ${obj.label}`}
                  aria-valuenow={current}
                  aria-valuemin={0}
                  aria-valuemax={target}
                  className="rounded overflow-hidden ml-4"
                  style={{ height: '4px', background: '#1a1410' }}
                >
                  <div
                    className="h-full rounded transition-all duration-500"
                    style={{
                      width: `${Math.min(100, pct * 100)}%`,
                      background: done ? '#80c040' : '#d4af70',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {quest.reward.gold && (
          <RewardBadge bg="#1a1408" color="#d4af70" border="#3a2808">+{quest.reward.gold}g</RewardBadge>
        )}
        {quest.reward.reputationTokens && (
          <RewardBadge bg="#100a18" color="#c084fc" border="#3a1858">+{quest.reward.reputationTokens} 🪙</RewardBadge>
        )}
        {quest.reward.skill && (
          <RewardBadge bg="#0a1018" color="#60a0c0" border="#1a3050">
            {SKILLS[quest.reward.skill.skillId]?.name ?? quest.reward.skill.skillId}
          </RewardBadge>
        )}
        {quest.reward.consumables && Object.entries(quest.reward.consumables).map(([id, qty]) => (
          <RewardBadge key={id} bg="#0e1814" color="#70c0a0" border="#0e3828">
            {qty}× {RESOURCES[id]?.name ?? id}
          </RewardBadge>
        ))}
        {quest.reward.resources && Object.entries(quest.reward.resources).map(([id, qty]) => (
          <RewardBadge key={id} bg="#181410" color="#c0a060" border="#332810">
            {qty}× {RESOURCES[id]?.name ?? id}
          </RewardBadge>
        ))}
        {quest.reward.stat && (
          <RewardBadge bg="#101810" color="#90c070" border="#1a3018">
            +{quest.reward.stat.amount} {quest.reward.stat.name}
          </RewardBadge>
        )}
        {quest.reward.aura > 0 && (
          <RewardBadge bg="#1a1228" color="#c084fc" border="#3a1858">+{quest.reward.aura} Aura</RewardBadge>
        )}
        {quest.reward.concentration > 0 && (
          <RewardBadge bg="#0e1a1a" color="#60c0c0" border="#0e3838">+{quest.reward.concentration} Concentration</RewardBadge>
        )}
      </div>
    </div>
  )
}

function RewardBadge({ bg, color, border, children }) {
  return (
    <span className="px-2 py-0.5 rounded text-xs" style={{ background: bg, color, border: `1px solid ${border}` }}>
      {children}
    </span>
  )
}

function Section({ title, children }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs uppercase tracking-widest" style={{ color: '#4a3a2a', fontFamily: 'Cinzel, serif' }}>
        {title}
      </p>
      {children}
    </div>
  )
}
