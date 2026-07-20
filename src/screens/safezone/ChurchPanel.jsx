import { useGameStore } from '../../store/gameStore'
import {
  CHURCH_QUESTS,
  getAvailableChurchDeeds,
  CHURCH_ROTATION_DAYS,
} from '../../data/churchQuests'
import { hasDedicatedMasterBoard } from '../../data/zones'
import { QuestCard } from '../QuestBoard'
import MasterBoard from './MasterBoard'

// UI11 — POC B « split 2 colonnes » : l'Église s'ouvre en 1 clic, sans écran d'intro.
// Colonne GAUCHE (portrait NpcOverlay) : Talk (géré par NpcOverlay) + ChurchPrayBlock ci-dessous.
// Colonne DROITE (ce fichier) : Acts of Devotion (badge + timer) + quote + cartes de quêtes
// PARCHEMIN (QuestCard parchment) scrollables + MasterBoard (repli itinérant) + ✕ Leave.
// Le HP/MP a été retiré (redondant avec la topbar).

/** UI11 — bloc « Pray » rendu sous le portrait (colonne gauche de NpcOverlay). */
export function ChurchPrayBlock() {
  const { hero, prayAtChurch } = useGameStore()
  const alreadyFull = hero.stats.hp >= hero.stats.maxHp && hero.stats.mana >= hero.stats.maxMana
  return (
    <div
      data-testid="church-pray"
      style={{
        marginTop: 10,
        paddingTop: 10,
        borderTop: '1px solid rgba(60, 40, 10, 0.25)',
        width: '100%',
      }}
    >
      <button
        onClick={prayAtChurch}
        disabled={alreadyFull}
        className="pbtn primary"
        style={{
          width: '100%',
          justifyContent: 'center',
          opacity: alreadyFull ? 0.55 : 1,
          cursor: alreadyFull ? 'not-allowed' : 'pointer',
        }}
      >
        <span className="pbtn-ico">🙏</span>Pray
      </button>
      <p
        style={{
          fontSize: '0.66rem',
          marginTop: 4,
          fontStyle: 'italic',
          color: 'var(--ink-soft)',
          textAlign: 'center',
        }}
      >
        {alreadyFull ? 'Already at full strength' : 'Restores 40% HP & Mana · costs 1 tick'}
      </p>
    </div>
  )
}

export default function ChurchPanel({ onLeave }) {
  const { hero, world, meta, startQuest, completeQuest, abandonQuest, isQuestComplete } =
    useGameStore()

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
  const deedCount = activeChurch.length + available.length

  const killCounts = world.monsterKillCounts ?? {}
  const visitedSpots = world.visitedSpots ?? []
  const craftCount = meta?.craftCount ?? 0

  return (
    <div data-testid="church-split" className="flex flex-col gap-2" style={{ maxWidth: 620 }}>
      {/* En-tête : titre + badge de compte + timer de rotation */}
      <div className="flex items-baseline justify-between gap-3">
        <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--amber-deep)', fontSize: '1rem' }}>
          🕯 Acts of Devotion
          <span
            data-testid="deeds-count"
            style={{
              marginLeft: 8,
              fontSize: '0.68rem',
              padding: '1px 8px',
              borderRadius: 10,
              background: '#eadfbc',
              border: '1px solid #c89432',
              color: '#7a4d10',
              verticalAlign: 'middle',
            }}
          >
            {deedCount}
          </span>
        </h3>
        <span style={{ color: 'var(--ink-soft)', fontSize: '0.7rem', fontStyle: 'italic' }}>
          New deeds in {daysLeft} day{daysLeft > 1 ? 's' : ''}
        </span>
      </div>
      <p style={{ color: 'var(--ink-soft)', fontSize: '0.72rem', fontStyle: 'italic' }}>
        "Serve the faithful, and the Old Gods provide — never coin, but their blessings."
      </p>

      {/* CHQ01 — cartes parchemin, liste scrollable */}
      <div
        className="flex flex-col gap-3"
        data-testid="church-quests"
        style={{ overflowY: 'auto', maxHeight: 380, paddingRight: 4 }}
      >
        {activeChurch.length > 0 &&
          activeChurch.map((q) => (
            <QuestCard
              key={q.id}
              quest={q}
              questStatus="active"
              parchment
              heroLevel={hero.level}
              killCounts={killCounts}
              visitedSpots={visitedSpots}
              craftCount={craftCount}
              base={world.questProgress?.[q.id] ?? {}}
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
                parchment
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

      {/* MST08 / v1.43 (DÉCISION #3) — repli communautaire : dans un village SANS PNJ-maître
          dédié (Greywatch/Duskreach/Ashfall Post), le maître ITINÉRANT de passage surface sur
          le tableau de l'Église les jours où ce village l'accueille. On l'évite là où un board
          maître dédié existe déjà (Académie en ville, KnightTrainer à Millhaven). */}
      {!hasDedicatedMasterBoard(world.currentLocation) && <MasterBoard />}

      <button
        className="pbtn"
        onClick={onLeave}
        style={{ alignSelf: 'flex-start', marginTop: 4 }}
        data-testid="church-leave"
      >
        <span className="pbtn-ico">✕</span>Leave
      </button>
    </div>
  )
}
