import { useGameStore } from '../store/gameStore'
import { QUESTS } from '../data/quests'
import { SKILLS } from '../data/skills'

const ALL_QUESTS = Object.values(QUESTS)

export default function QuestBoard() {
  const { hero, world, setScreen, startQuest, isQuestComplete, completeQuest } = useGameStore()

  const activeIds = world.activeQuests ?? []
  const completedIds = world.completedQuests ?? []

  const available = ALL_QUESTS.filter(q => !activeIds.includes(q.id) && !completedIds.includes(q.id))
  const active    = ALL_QUESTS.filter(q => activeIds.includes(q.id))
  const completed = ALL_QUESTS.filter(q => completedIds.includes(q.id))

  return (
    <div className="flex h-full" style={{ minHeight: 'calc(100vh - 48px)' }}>
      <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto max-w-2xl">

        <div className="flex items-center gap-4">
          <button
            onClick={() => setScreen('safe_zone')}
            style={{ color: '#6a5a4a', fontSize: '0.85rem', fontFamily: 'Cinzel, serif' }}
          >
            ← Inn
          </button>
          <h2 style={{ fontFamily: 'Cinzel, serif', color: '#d4af70', fontSize: '1.3rem' }}>
            Quest Board
          </h2>
          <span style={{ marginLeft: 'auto', color: '#c084fc', fontSize: '0.82rem' }}>
            {hero.reputationTokens} 🪙 tokens
          </span>
        </div>

        {active.length > 0 && (
          <Section title={`Active (${active.length})`}>
            {active.map(q => (
              <QuestCard
                key={q.id}
                quest={q}
                questStatus="active"
                heroLevel={hero.level}
                killCounts={world.monsterKillCounts}
                canComplete={isQuestComplete(q.id)}
                onComplete={() => completeQuest(q.id)}
              />
            ))}
          </Section>
        )}

        {available.length > 0 && (
          <Section title="Available">
            {available.map(q => (
              <QuestCard
                key={q.id}
                quest={q}
                questStatus="available"
                heroLevel={hero.level}
                killCounts={world.monsterKillCounts}
                onAccept={() => startQuest(q.id)}
              />
            ))}
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
    </div>
  )
}

function QuestCard({ quest, questStatus, heroLevel, killCounts = {}, canComplete, onAccept, onComplete }) {
  const isCompleted = questStatus === 'completed'
  const isActive    = questStatus === 'active'

  const borderColor = isCompleted ? '#305030' : isActive ? '#3a2818' : '#2a2018'
  const bgColor     = isCompleted ? '#081008' : '#0a0a08'

  return (
    <div className="p-4 rounded border" style={{ background: bgColor, borderColor }}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <p style={{ fontFamily: 'Cinzel, serif', color: isCompleted ? '#40c080' : '#d4af70', fontSize: '0.9rem' }}>
          {quest.name}{isCompleted && ' ✓'}
        </p>
        {isActive && canComplete && (
          <button
            onClick={onComplete}
            className="px-3 py-1 rounded text-xs"
            style={{ fontFamily: 'Cinzel, serif', background: '#0a2010', color: '#40c080', border: '1px solid #305030', flexShrink: 0 }}
          >
            Claim
          </button>
        )}
        {questStatus === 'available' && (
          <button
            onClick={onAccept}
            className="px-3 py-1 rounded text-xs"
            style={{ fontFamily: 'Cinzel, serif', background: '#1a1208', color: '#d4af70', border: '1px solid #3a2818', flexShrink: 0 }}
          >
            Accept
          </button>
        )}
      </div>

      <p style={{ color: '#5a4a3a', fontSize: '0.75rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>
        {quest.flavorText}
      </p>

      {!isCompleted && (
        <div className="flex flex-col gap-1 mb-2">
          {quest.objectives.map(obj => {
            const current = obj.type === 'kill'
              ? Math.min(obj.count, killCounts[obj.monsterId] ?? 0)
              : obj.type === 'level'
                ? Math.min(obj.targetLevel, heroLevel ?? 1)
                : 0
            const target = obj.type === 'kill' ? obj.count : obj.targetLevel
            const done = current >= target

            return (
              <div key={obj.id} className="flex items-center gap-2">
                <span style={{ color: done ? '#40c080' : '#4a3a2a', fontSize: '0.7rem' }}>
                  {done ? '✓' : '○'}
                </span>
                <span style={{ color: done ? '#60a060' : '#6a5a4a', fontSize: '0.75rem' }}>
                  {obj.label} ({current}/{target})
                </span>
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
