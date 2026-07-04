import { useGameStore } from '../../store/gameStore'
import { CHURCH_QUESTS, getAvailableChurchDeeds, CHURCH_ROTATION_DAYS } from '../../data/churchQuests'
import { QuestCard } from '../QuestBoard'
import { Panel, InfoLine } from './Panel'

export default function ChurchPanel({ onBack }) {
  const {
    hero,
    world,
    meta,
    prayAtChurch,
    startQuest,
    completeQuest,
    abandonQuest,
    isQuestComplete,
  } = useGameStore()

  const alreadyFull = hero.stats.hp >= hero.stats.maxHp && hero.stats.mana >= hero.stats.maxMana

  // CHQ01 — quêtes de l'église : pool tournant tous les 3 jours
  const activeIds = world.activeQuests ?? []
  const dayCount = world.dayCount ?? 1
  // FIX-CHURCH-DRY01 — deeds répétables par bloc (world.churchDeeds) + pool min garanti (CHQ-LOC02).
  const available = getAvailableChurchDeeds({
    dayCount,
    location: world.currentLocation,
    activeQuests: activeIds,
    churchDeeds: world.churchDeeds,
  })
  // Quêtes d'église acceptées (restent rendables même après rotation hors du pool)
  const activeChurch = activeIds.map((id) => CHURCH_QUESTS[id]).filter(Boolean)
  const nextRotationDay = (Math.floor(dayCount / CHURCH_ROTATION_DAYS) + 1) * CHURCH_ROTATION_DAYS
  const daysLeft = Math.max(1, nextRotationDay - dayCount)

  const killCounts = world.monsterKillCounts ?? {}
  const visitedSpots = world.visitedSpots ?? []
  const craftCount = meta?.craftCount ?? 0

  return (
    <Panel title="⛪ Church of the Old Gods" onBack={onBack}>
      <p
        style={{
          color: 'var(--ink-soft)',
          fontSize: '0.85rem',
          marginBottom: '1rem',
          fontStyle: 'italic',
        }}
      >
        "The gods hear those who kneel."
      </p>
      <div className="flex flex-col gap-3 max-w-sm">
        <InfoLine label="HP" value={`${hero.stats.hp} / ${hero.stats.maxHp}`} />
        <InfoLine label="Mana" value={`${hero.stats.mana} / ${hero.stats.maxMana}`} />

        <button
          onClick={prayAtChurch}
          disabled={alreadyFull}
          className="mt-2 px-4 py-3 rounded transition-all"
          style={{
            fontFamily: 'Cinzel, serif',
            background: alreadyFull ? 'rgba(201,169,110,.1)' : 'rgba(160,110,220,.12)',
            color: alreadyFull ? '#3a3a4a' : '#c0a0ff',
            border: `1px solid ${alreadyFull ? '#1a1a2a' : '#5040a0'}`,
            cursor: alreadyFull ? 'not-allowed' : 'pointer',
          }}
        >
          🙏 Pray
          <br />
          <span style={{ fontSize: '0.75rem', color: '#7060b0' }}>
            {alreadyFull ? 'Already at full strength' : 'Restores 40% HP & Mana · costs 1 tick'}
          </span>
        </button>
      </div>

      {/* CHQ01 — Œuvres de dévotion (quêtes tournantes, récompenses tokens + élixirs) */}
      <div
        className="mt-6 flex flex-col gap-3"
        style={{ maxWidth: 560 }}
        data-testid="church-quests"
      >
        <div className="flex items-baseline justify-between">
          <h3 style={{ fontFamily: 'Cinzel, serif', color: '#c0a060', fontSize: '0.95rem' }}>
            🕯 Acts of Devotion
          </h3>
          <span style={{ color: 'var(--ink-soft)', fontSize: '0.7rem', fontStyle: 'italic' }}>
            New deeds in {daysLeft} day{daysLeft > 1 ? 's' : ''}
          </span>
        </div>
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.72rem', fontStyle: 'italic' }}>
          "Serve the faithful, and the Old Gods provide — never coin, but their blessings."
        </p>

        {activeChurch.length > 0 &&
          activeChurch.map((q) => (
            <QuestCard
              key={q.id}
              quest={q}
              questStatus="active"
              heroLevel={hero.level}
              killCounts={killCounts}
              visitedSpots={visitedSpots}
              craftCount={craftCount}
              canComplete={isQuestComplete(q.id)}
              onComplete={() => completeQuest(q.id)}
              onAbandon={() => abandonQuest(q.id)}
            />
          ))}

        {available.length > 0
          ? available.map((q) => (
              <QuestCard
                key={q.id}
                quest={q}
                questStatus="available"
                heroLevel={hero.level}
                killCounts={killCounts}
                visitedSpots={visitedSpots}
                craftCount={craftCount}
                onAccept={() => startQuest(q.id)}
              />
            ))
          : activeChurch.length === 0 && (
              <p style={{ color: '#5a4a3a', fontSize: '0.78rem', fontStyle: 'italic' }}>
                You have answered the church's calls for now. Return in a few days.
              </p>
            )}
      </div>
    </Panel>
  )
}
