import { useGameStore } from '../../store/gameStore'
import { heroSkillLevels } from '../../data/quests'
import { MASTER_QUESTS } from '../../data/masterQuests'
import { getMaster, getMasterQuestIdsAtLocation } from '../../data/masters'
import { QuestCard } from '../QuestBoard'

// ── MST04 / MST08 / v1.43 — Tableau « Trials of Mastery » partagé ──────────────
//
// Composant de board maître réutilisable, extrait d'AcademyPanel (MST04) pour surfacer
// AUSSI les maîtres ITINÉRANTS (MST08, DÉCISION #3) sur les tableaux LOCAUX des villages
// (KnightTrainer à Millhaven ; tableau communautaire de l'Église pour les villages sans
// PNJ-maître). La visibilité/gating est identique partout :
//   • quêtes du lieu = maîtres FIXES + itinérant de passage ce jour-là (getMasterQuestIdsAtLocation),
//   • une fois ENGAGÉ, on ne voit plus que le maître engagé (+ ses quêtes de skill),
//   • quêtes de skill grisées (🔒 + tooltip) tant que non initié (isMasterQuestLocked).
//
// Rend `null` s'il n'y a AUCUNE quête de maître surfaçable (ni fixe ni itinérant) — les
// panneaux hôtes peuvent donc le monter inconditionnellement.
export default function MasterBoard() {
  const {
    hero,
    world,
    startQuest,
    completeQuest,
    abandonQuest,
    isQuestComplete,
    isMasterQuestLocked,
  } = useGameStore()

  const activeIds = world.activeQuests ?? []
  const completedIds = world.completedQuests ?? []
  const skillLevels = heroSkillLevels(hero)

  // MST04/MST08 — état d'engagement + quêtes des maîtres du lieu (fixes + itinérant du jour).
  const engagedMaster = getMaster(hero.masterId)
  const localMasterQuestIds = getMasterQuestIdsAtLocation(world.currentLocation, world.dayCount)
  const localMasterQuests = localMasterQuestIds.map((id) => MASTER_QUESTS[id]).filter(Boolean)

  // MST04 — visibilité : une fois engagé, seules les quêtes du maître engagé restent visibles.
  const visibleMasterQuests = localMasterQuests.filter((q) => {
    if (engagedMaster == null) return true
    if (q.masterId === engagedMaster.id) return true
    return (engagedMaster.skillQuestPool ?? []).includes(q.id)
  })

  const masterActive = visibleMasterQuests.filter((q) => activeIds.includes(q.id))
  const masterAvailable = visibleMasterQuests.filter(
    (q) => !activeIds.includes(q.id) && !completedIds.includes(q.id),
  )

  const masterLockReason = (q) =>
    isMasterQuestLocked(q)
      ? engagedMaster == null
        ? 'Requires initiation with a master'
        : `Reserved for students of ${engagedMaster.name}`
      : null

  if (masterAvailable.length === 0 && masterActive.length === 0) return null

  return (
    <div className="mt-4 flex flex-col gap-2" style={{ maxWidth: 560 }} data-testid="master-quests">
      <div className="t-label" style={{ marginBottom: 2 }}>
        ✦ Trials of Mastery
      </div>
      {/* MST04 — état d'engagement : « no master » ou « master = X ». */}
      <p
        data-testid="master-state"
        style={{
          color: engagedMaster ? 'var(--amber-deep, #c0a060)' : '#7a6a8a',
          fontSize: '0.72rem',
          fontFamily: 'Cinzel, serif',
        }}
      >
        {engagedMaster
          ? `Master: ${engagedMaster.name} · ${engagedMaster.title}`
          : 'No master — complete an initiation to be taken as a student.'}
      </p>
      <p style={{ color: 'var(--ink-soft)', fontSize: '0.72rem', fontStyle: 'italic' }}>
        "Bring a technique to the level I name, and I shall reward your discipline."
      </p>
      {masterActive.map((q) => (
        <QuestCard
          key={q.id}
          quest={q}
          questStatus="active"
          heroLevel={hero.level}
          skillLevels={skillLevels}
          base={world.questProgress?.[q.id] ?? {}} // FIX-QUESTPROG02 — homogénéité (delta, pas cumul)
          canComplete={isQuestComplete(q.id)}
          onComplete={() => completeQuest(q.id)}
          onAbandon={() => abandonQuest(q.id)}
        />
      ))}
      {masterAvailable.map((q) => (
        <QuestCard
          key={q.id}
          quest={q}
          questStatus="available"
          heroLevel={hero.level}
          skillLevels={skillLevels}
          lockedReason={masterLockReason(q)}
          onAccept={() => startQuest(q.id)}
        />
      ))}
    </div>
  )
}
