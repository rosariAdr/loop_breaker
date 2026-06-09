// UI-QUESTS — Suivi global des quêtes actives (overlay accessible partout via la Topbar).
// Lecture seule : liste les quêtes en cours avec progression par objectif + récompenses.
// Pour accepter/rendre une quête, c'est le Quest Board (en village) qui s'en charge.
import { useGameStore } from '../store/gameStore'
import { getQuestById, QUEST_NPC_REGISTRY, heroSkillLevels } from '../data/quests'
import { RESOURCES } from '../data/resources'

// Progression d'un objectif (mirroir de QuestBoard) : kill → monsterKillCounts, level → hero.level
function objectiveProgress(obj, { killCounts, heroLevel, visitedSpots = [], craftCount = 0, skillLevels = {} }) {
  if (obj.type === 'visit') {
    const done = visitedSpots.includes(obj.spotId)
    return { current: done ? 1 : 0, target: 1, done, pct: done ? 1 : 0 }
  }
  if (obj.type === 'craft') {
    const current = Math.min(obj.count, craftCount)
    return { current, target: obj.count, done: current >= obj.count, pct: obj.count > 0 ? current / obj.count : 0 }
  }
  if (obj.type === 'skill_levelup') {
    const current = Math.min(obj.targetLevel, skillLevels[obj.skillId] ?? 0)
    return { current, target: obj.targetLevel, done: current >= obj.targetLevel, pct: obj.targetLevel > 0 ? current / obj.targetLevel : 0 }
  }
  const current = obj.type === 'kill'
    ? Math.min(obj.count, killCounts[obj.monsterId] ?? 0)
    : obj.type === 'level'
      ? Math.min(obj.targetLevel, heroLevel ?? 1)
      : 0
  const target = obj.type === 'kill' ? obj.count : obj.targetLevel
  return { current, target, done: current >= target, pct: target > 0 ? current / target : 0 }
}

export default function QuestsOverlay({ onClose }) {
  const activeQuests = useGameStore((s) => s.world.activeQuests) ?? []
  const killCounts = useGameStore((s) => s.world.monsterKillCounts) ?? {}
  const visitedSpots = useGameStore((s) => s.world.visitedSpots) ?? []
  const craftCount = useGameStore((s) => s.meta.craftCount) ?? 0
  const hero = useGameStore((s) => s.hero)
  const skillLevels = heroSkillLevels(hero)
  const heroLevel = hero.level
  const isQuestComplete = useGameStore((s) => s.isQuestComplete)
  const setScreen = useGameStore((s) => s.setScreen)
  const back = onClose ?? (() => setScreen('world_map'))

  const quests = activeQuests.map((id) => getQuestById(id)).filter(Boolean)

  return (
    <div className="sheet-scrim" onClick={back}>
      <div className="sheet" style={{ width: 760, maxWidth: '94%' }} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-hd">
          <div className="sh-title">Quests<span className="sh-meta">{quests.length} active</span></div>
          <div className="sheet-x" onClick={back}>✕</div>
        </div>
        <div className="sheet-body" style={{ display: 'block', overflowY: 'auto' }} data-testid="quests-overlay">
          {quests.length === 0 && (
            <p style={{ color: '#6a5a4a', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0' }}>
              No active quests. Visit a Quest Board in a settlement to take one on.
            </p>
          )}

          {quests.map((q) => {
            const ready = isQuestComplete?.(q.id)
            const giver = QUEST_NPC_REGISTRY[q.giverNpc]
            return (
              <div
                key={q.id}
                data-testid={`quest-${q.id}`}
                style={{
                  marginBottom: 14, padding: '12px 14px', borderRadius: 10,
                  background: 'rgba(201,169,110,.10)',
                  border: `1px solid ${ready ? 'var(--forest-deep, #80c040)' : 'var(--parchment-shadow, #3a2818)'}`,
                }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-head, Cinzel), serif', fontWeight: 700, color: 'var(--ink, #2a1c0e)' }}>
                    {giver?.sigil ? `${giver.sigil} ` : ''}{q.name}
                  </span>
                  {ready && (
                    <span style={{ color: 'var(--forest-deep, #4a8020)', fontSize: '.7rem', fontWeight: 700 }}>
                      ✓ Ready to turn in
                    </span>
                  )}
                </div>
                {giver && (
                  <div style={{ color: '#6a5a4a', fontSize: '.7rem', marginBottom: 4 }}>
                    {giver.name} · {giver.title}
                  </div>
                )}
                <p style={{ color: '#5a4a3a', fontSize: '.78rem', marginBottom: 8 }}>{q.description}</p>

                <div className="flex flex-col gap-2" style={{ marginBottom: 8 }}>
                  {q.objectives.map((obj) => {
                    const { current, target, done, pct } = objectiveProgress(obj, { killCounts, heroLevel, visitedSpots, craftCount, skillLevels })
                    return (
                      <div key={obj.id} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span style={{ color: done ? '#40c080' : '#4a3a2a', fontSize: '.7rem' }}>{done ? '✓' : '○'}</span>
                          <span style={{ color: done ? '#60a060' : '#6a5a4a', fontSize: '.75rem' }}>
                            {obj.label} ({current}/{target})
                          </span>
                        </div>
                        <div
                          role="progressbar"
                          aria-label={`Objective progress: ${obj.label}`}
                          aria-valuenow={current} aria-valuemin={0} aria-valuemax={target}
                          className="rounded overflow-hidden ml-4"
                          style={{ height: 4, background: '#1a1410' }}
                        >
                          <div className="h-full rounded transition-all duration-500"
                            style={{ width: `${Math.min(100, pct * 100)}%`, background: done ? '#80c040' : '#d4af70' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex flex-wrap gap-2">
                  {q.reward?.gold > 0 && (
                    <span className="quest-reward" style={rewardStyle('#1a1408', '#d4af70', '#3a2808')}>+{q.reward.gold}g</span>
                  )}
                  {q.reward?.reputationTokens > 0 && (
                    <span className="quest-reward" style={rewardStyle('#0e1408', '#9ec070', '#28380e')}>🪙 {q.reward.reputationTokens}</span>
                  )}
                  {q.reward?.skill && (
                    <span className="quest-reward" style={rewardStyle('#140e1a', '#c8a0ff', '#33285a')}>✦ Skill</span>
                  )}
                  {q.reward?.consumables && Object.entries(q.reward.consumables).map(([id, qty]) => (
                    <span key={id} className="quest-reward" style={rewardStyle('#0e1814', '#70c0a0', '#0e3828')}>
                      {qty}× {RESOURCES[id]?.name ?? id}
                    </span>
                  ))}
                  {q.reward?.aura > 0 && (
                    <span className="quest-reward" style={rewardStyle('#1a1228', '#c084fc', '#3a1858')}>+{q.reward.aura} Aura</span>
                  )}
                  {q.reward?.concentration > 0 && (
                    <span className="quest-reward" style={rewardStyle('#0e1a1a', '#60c0c0', '#0e3838')}>+{q.reward.concentration} Conc.</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function rewardStyle(bg, color, border) {
  return {
    background: bg, color, border: `1px solid ${border}`,
    borderRadius: 6, padding: '2px 8px', fontSize: '.7rem', fontFamily: 'var(--font-head, Cinzel), serif',
  }
}
