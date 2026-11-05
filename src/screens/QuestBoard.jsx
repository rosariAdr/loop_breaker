import { useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import {
  QUESTS,
  QUEST_NPC_REGISTRY,
  getQuestById,
  getQuestIssuer,
  hasEquippedForObjective,
  isPrestigiousQuest,
  questDaysLeft,
  questObjectiveStatus,
  questXpReward,
  questRankPoints,
  PRESTIGE_MIN_TOKENS,
} from '../data/quests'
import { MAIN_QUESTS } from '../data/mainQuests'
import { ONBOARDING_QUESTS } from '../data/onboardingQuests'
import { getActiveVillageQuests } from '../data/villageQuests'
import { getLocationType } from '../data/zones'
import { SKILLS } from '../data/skills'
import { RESOURCES } from '../data/resources'
import { getRankInfo, nextRankLabel } from '../data/ranks'
import ConfirmDialog from '../components/ConfirmDialog'

// FIX-QRANK01 — Rang d'aventurier : échelle 10 paliers pilotée par `hero.rankPoints`
// (source : src/data/ranks.js). Les `reputationTokens` restent la monnaie / le gate Guilde.

export default function QuestBoard() {
  const {
    hero,
    world,
    meta,
    setScreen,
    startQuest,
    isQuestComplete,
    completeQuest,
    abandonQuest,
    isMainQuestAvailable,
    isOnboardingQuestAvailable,
    pruneExpiredQuests,
  } = useGameStore()
  const [pendingAbandon, setPendingAbandon] = useState(null) // questObject

  // QSV2-TIMED01 — purge les quêtes chronométrées expirées à l'ouverture / au changement de jour.
  useEffect(() => {
    pruneExpiredQuests()
  }, [world.dayCount, pruneExpiredQuests])

  const activeIds = world.activeQuests ?? []
  const completedIds = world.completedQuests ?? []
  // FIX-QCARD-COLLECT01 — statut d'objectif via la source unique (gère collect/elite_turnin).
  // `accepted=false` pour les cartes « available » (pas de cumul avant acceptation).
  const qStatus = (q, accepted) => questObjectiveStatus(q, { world, hero, meta }, { accepted })

  // GLD01/GLD02 — venue : la ville = Guilde (titre/labels), le village = auberge.
  const locationType = getLocationType(world)
  const isGuild = locationType === 'city'
  const isCity = isGuild
  const here = world.currentLocation

  // QSV2-LOCALITY01 — une quête est DISPONIBLE uniquement à son lieu émetteur.
  // QSV2-TURNIN01 — une quête active/terminée est rendable (Claim) au lieu émetteur OU en ville
  // (la ville = point de rendu universel). Les villages d'une même zone PvE ont donc des
  // quêtes distinctes (pas de partage par adjacence).
  // MQ-CHAIN01/B6 — la chaîne principale est postée sur le board de son lieu émetteur
  // (Doyen), gated par le chaînage (isMainQuestAvailable). Surfacer ces quêtes rend
  // la progression (et donc le déblocage des nodes START02) jouable.
  const allBoardQuests = [
    ...Object.values(QUESTS),
    ...Object.values(MAIN_QUESTS),
    ...Object.values(ONBOARDING_QUESTS), // QONBOARD01 — chaîne « Premières fois »
  ]
  const canTurnInHere = (q) => getQuestIssuer(q) === here || isCity

  // VQ06/VQ07 — quêtes de village générées par adjacence (rotation + level-gate VQ-G3/G4).
  const villageActive = getActiveVillageQuests(here, {
    dayCount: world.dayCount,
    heroLevel: hero.level,
    isCity,
  })
  const available = [
    ...allBoardQuests.filter((q) => {
      if ((q.mapTier ?? 1) > 1) return false // QSV2-ADJ-AUDIT01 — quêtes Map 2 gelées hors board
      if (getQuestIssuer(q) !== here) return false
      if (activeIds.includes(q.id) || completedIds.includes(q.id)) return false
      if (q.isMainQuest) return isMainQuestAvailable(q.id)
      if (q.track === 'onboarding') return isOnboardingQuestAvailable(q.id) // QONBOARD01 — gate par chaînage
      return true
    }),
    ...villageActive.filter((q) => !activeIds.includes(q.id) && !completedIds.includes(q.id)),
  ]
  // active/completed résolus par id (inclut les quêtes de village acceptées).
  const resolveIds = (ids) => ids.map((id) => getQuestById(id)).filter(Boolean)
  const active = resolveIds(activeIds).filter(canTurnInHere)
  const completed = resolveIds(completedIds).filter(canTurnInHere)
  // MQUI01 — la chaîne principale a sa propre section en tête du board.
  const mainAvailable = available.filter((q) => q.isMainQuest)
  // QONBOARD01 — la chaîne d'onboarding a sa propre section « Premières fois », distincte des MQ.
  const onboardingAvailable = available.filter((q) => q.track === 'onboarding')
  const otherAvailable = available.filter((q) => !q.isMainQuest && q.track !== 'onboarding')

  const rank = getRankInfo(hero.rankPoints)
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
      <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto">
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
        <p
          style={{
            color: '#6a5a4a',
            fontSize: '0.78rem',
            fontStyle: 'italic',
            marginTop: '-0.5rem',
          }}
        >
          {isGuild
            ? 'Prestigious commissions for proven adventurers — your reputation opens new doors.'
            : "Local errands posted on the inn's board — and your Adventurer's Card."}
        </p>

        {/* Q06 — Rang aventurier (la « carte d'aventurier ») */}
        <RankBanner rank={rank} />

        {mainAvailable.length > 0 && (
          <Section title="⚔ Main Quest">
            {mainAvailable.map((q) => (
              <QuestCard
                key={q.id}
                quest={q}
                questStatus="available"
                heroLevel={hero.level}
                objectiveStatus={qStatus(q, false)}
                onAccept={() => acceptGuard(q)}
              />
            ))}
          </Section>
        )}

        {onboardingAvailable.length > 0 && (
          <Section title="✨ First Steps">
            {onboardingAvailable.map((q) => (
              <QuestCard
                key={q.id}
                quest={q}
                questStatus="available"
                heroLevel={hero.level}
                objectiveStatus={qStatus(q, false)}
                onAccept={() => acceptGuard(q)}
              />
            ))}
          </Section>
        )}

        {active.length > 0 && (
          <Section title={`Active (${active.length})`}>
            {active.map((q) => (
              <QuestCard
                key={q.id}
                quest={q}
                questStatus="active"
                heroLevel={hero.level}
                objectiveStatus={qStatus(q, true)}
                daysLeft={questDaysLeft(q, world)}
                canComplete={isQuestComplete(q.id)}
                onComplete={() => completeQuest(q.id)}
                onAbandon={() => setPendingAbandon(q)}
              />
            ))}
          </Section>
        )}

        {otherAvailable.length > 0 && (
          <Section title={isGuild ? 'Available · Guild Commissions' : 'Available'}>
            {otherAvailable.map((q) => {
              const locked = isPrestigiousQuest(q) && !canAcceptPrestige
              return (
                <QuestCard
                  key={q.id}
                  quest={q}
                  questStatus="available"
                  heroLevel={hero.level}
                  objectiveStatus={qStatus(q, false)}
                  prestige={isPrestigiousQuest(q)}
                  lockedReason={locked ? `Requires ${PRESTIGE_MIN_TOKENS} 🪙 (réputation)` : null}
                  onAccept={() => acceptGuard(q)}
                />
              )
            })}
          </Section>
        )}

        {completed.length > 0 && (
          <CollapsibleSection title={`Completed (${completed.length})`} defaultOpen={false}>
            {completed.map((q) => (
              <QuestCard
                key={q.id}
                quest={q}
                questStatus="completed"
                heroLevel={hero.level}
                killCounts={world.monsterKillCounts}
              />
            ))}
          </CollapsibleSection>
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
        message={
          pendingAbandon
            ? `You are about to abandon "${pendingAbandon.name}". Your progress on this quest will be lost.`
            : ''
        }
        confirmLabel="Abandon"
        cancelLabel="Keep going"
        variant="warn"
        onConfirm={() => {
          abandonQuest(pendingAbandon.id)
          setPendingAbandon(null)
        }}
        onCancel={() => setPendingAbandon(null)}
      />
    </div>
  )
}

// ── Q06 — Banner rang aventurier avec progression ──────────────────────────────
function RankBanner({ rank }) {
  const pctLabel = rank.isMax
    ? 'MAX'
    : `${rank.tokensInTier} / ${rank.tokensNeededInTier} to ${nextRankLabel(rank.tier)}`

  return (
    <div
      data-testid="rank-banner"
      className="rounded p-3 flex flex-col gap-2"
      style={{ background: '#0a0a0f', border: `1px solid ${rank.color}40` }}
    >
      <div className="flex items-center justify-between">
        <span
          style={{
            color: rank.color,
            fontFamily: 'Cinzel, serif',
            fontSize: '0.9rem',
            letterSpacing: '0.05em',
          }}
        >
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

export function QuestCard({
  quest,
  questStatus,
  heroLevel,
  killCounts = {},
  visitedSpots = [],
  craftCount = 0,
  craftCountByKind = {}, // QOBJ-TYPES01 — crafts par kind (objectif craft + outputKind)
  prayCount = 0, // QOBJ-TYPES01 — prières (objectif pray)
  deedsAccepted = 0, // QOBJ-TYPES01 — actes de dévotion acceptés (objectif accept_deed)
  equipped = {}, // QOBJ-TYPES01 — pièces portées (objectif equip, check d'état)
  skillLevels = {},
  base = {}, // FIX-QUESTSNAP01 — snapshot { baseKills, baseCraft } pour la progression en delta
  objectiveStatus = null, // FIX-QCARD-COLLECT01 — statuts précalculés (source unique questObjectiveStatus)
  prestige = false,
  daysLeft = null,
  lockedReason = null,
  parchment = false, // UI11 — carte claire (panneau Église) au lieu du fond sombre du board
  canComplete,
  onAccept,
  onComplete,
  onAbandon,
}) {
  const baseKills = base.baseKills ?? {}
  const baseCraft = base.baseCraft ?? 0
  const baseCraftByKind = base.baseCraftByKind ?? {} // QOBJ-TYPES01
  const basePray = base.basePray ?? 0 // QOBJ-TYPES01
  const baseDeeds = base.baseDeeds ?? 0 // QOBJ-TYPES01
  const isCompleted = questStatus === 'completed'
  const isActive = questStatus === 'active'

  // UI11 — deux palettes : sombre (board, défaut) / parchemin (Église : bg #e8d4a0,
  // liseré gauche #c89432, texte #2c1a0a — plus de fond noir dans le panneau clair).
  const pal = parchment
    ? {
        bg: isCompleted ? '#ddd2ae' : '#e8d4a0',
        border: '#c89432',
        borderLeft: '3px solid #c89432',
        title: isCompleted ? '#2f6b2f' : '#7a4d10',
        objLabel: '#2c1a0a',
        objIcon: (done, started) => (done ? '#3f7d20' : started ? '#8a5a17' : '#8a7a5a'),
        pillBg: (done, started) => (done ? '#cfe3b8' : started ? '#eadfbc' : '#dccfa8'),
        pillFg: (done, started) => (done ? '#2f6b1f' : started ? '#7a4d10' : '#6b5a3a'),
        track: '#cbb98d',
        claim: { background: '#dff0d0', color: '#2f6b1f', border: '1px solid #9dc27e' },
        abandon: { background: '#f0dcd0', color: '#8a4a2a', border: '1px solid #c09070' },
        accept: { background: '#f2e3bd', color: '#7a4d10', border: '1px solid #c89432' },
        locked: { background: '#dccfa8', color: '#6b5a6a', border: '1px solid #b0a080' },
      }
    : {
        bg: isCompleted ? '#081008' : '#0a0a08',
        border: isCompleted ? '#305030' : isActive ? '#3a2818' : '#2a2018',
        borderLeft: null,
        title: isCompleted ? '#40c080' : '#d4af70',
        objLabel: '#dcc79a',
        objIcon: (done, started) => (done ? '#80c040' : started ? '#d4af70' : '#7a6a4a'),
        pillBg: (done, started) => (done ? '#1e3010' : started ? '#3a2c12' : '#2a2418'),
        pillFg: (done, started) => (done ? '#8fd257' : started ? '#e6b95e' : '#9a8558'),
        track: '#1a1410',
        claim: { background: '#0a2010', color: '#40c080', border: '1px solid #305030' },
        abandon: { background: '#1a0808', color: '#a06040', border: '1px solid #4a2010' },
        accept: { background: '#1a1208', color: '#d4af70', border: '1px solid #3a2818' },
        locked: { background: '#0a0a08', color: '#7a6a8a', border: '1px solid #2a2038' },
      }

  const npc = QUEST_NPC_REGISTRY[quest.giverNpc]

  // FIX-QCARD-COLLECT01 — source unique : si `objectiveStatus` (issu de questObjectiveStatus)
  // est fourni, on l'utilise tel quel (gère collect/elite_turnin). Sinon (ex. ChurchPanel), on
  // retombe sur ce calcul local rétro-compatible. QOBJ-TYPES01 — gère aussi les nouveaux types
  // pray/accept_deed/equip + craft filtré par kind (kill/craft/pray/accept_deed en delta).
  const fallbackStatus = (obj) => {
    switch (obj.type) {
      case 'kill':
        return {
          current: isActive
            ? Math.min(
                obj.count,
                Math.max(0, (killCounts[obj.monsterId] ?? 0) - (baseKills[obj.monsterId] ?? 0)),
              )
            : 0,
          target: obj.count,
        }
      case 'level':
        return { current: Math.min(obj.targetLevel, heroLevel ?? 1), target: obj.targetLevel }
      case 'visit':
        return { current: visitedSpots.includes(obj.spotId) ? 1 : 0, target: 1 }
      case 'craft': {
        const done = obj.outputKind
          ? (craftCountByKind[obj.outputKind] ?? 0) - (baseCraftByKind[obj.outputKind] ?? 0)
          : craftCount - baseCraft
        return { current: isActive ? Math.min(obj.count, Math.max(0, done)) : 0, target: obj.count }
      }
      case 'pray':
        return {
          current: isActive ? Math.min(obj.count, Math.max(0, prayCount - basePray)) : 0,
          target: obj.count,
        }
      case 'accept_deed':
        return {
          current: isActive ? Math.min(obj.count, Math.max(0, deedsAccepted - baseDeeds)) : 0,
          target: obj.count,
        }
      case 'equip':
        return { current: hasEquippedForObjective(equipped, obj) ? 1 : 0, target: 1 }
      case 'skill_levelup':
        return {
          current: Math.min(obj.targetLevel, skillLevels[obj.skillId] ?? 0),
          target: obj.targetLevel,
        }
      default:
        return { current: 0, target: obj.count ?? 1 }
    }
  }
  const statuses =
    objectiveStatus ??
    (quest.objectives ?? []).map((obj) => {
      const { current, target } = fallbackStatus(obj)
      return { obj, current, target, done: current >= target }
    })

  return (
    <div
      className="p-4 rounded border"
      data-parchment={parchment || undefined}
      style={{
        background: pal.bg,
        borderColor: pal.border,
        ...(pal.borderLeft ? { borderLeft: pal.borderLeft } : {}),
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex-1">
          <p
            style={{
              fontFamily: 'Cinzel, serif',
              color: pal.title,
              fontSize: '0.9rem',
            }}
          >
            {quest.isMainQuest && (
              <span title="Main quest" style={{ color: '#ffd700', marginRight: 4 }}>
                ⚔
              </span>
            )}
            {prestige && (
              <span title="Guild commission" style={{ color: '#c084fc', marginRight: 4 }}>
                ⚜
              </span>
            )}
            {quest.name}
            {isCompleted && ' ✓'}
            {isActive && daysLeft != null && (
              <span
                style={{
                  color: daysLeft <= 1 ? '#e07070' : '#9a8060',
                  fontSize: '0.7rem',
                  marginLeft: 6,
                }}
              >
                ⏳ {daysLeft >= 0 ? `${daysLeft}d` : 'expired'}
              </span>
            )}
          </p>
          {npc && (
            <p
              style={{
                color: '#6a5a4a',
                fontSize: '0.68rem',
                fontFamily: 'Cinzel, serif',
                marginTop: '0.1rem',
              }}
            >
              {npc.sigil} {npc.name} · {npc.title}
            </p>
          )}
        </div>
        {isActive && canComplete && (
          <button
            onClick={onComplete}
            className="px-3 py-1 rounded text-xs"
            style={{ fontFamily: 'Cinzel, serif', ...pal.claim, flexShrink: 0 }}
          >
            Claim
          </button>
        )}
        {isActive && !canComplete && onAbandon && (
          <button
            onClick={onAbandon}
            className="px-3 py-1 rounded text-xs"
            style={{ fontFamily: 'Cinzel, serif', ...pal.abandon, flexShrink: 0 }}
            title="Abandon this quest"
          >
            Abandon
          </button>
        )}
        {questStatus === 'available' && !lockedReason && (
          <button
            onClick={onAccept}
            className="px-3 py-1 rounded text-xs"
            style={{ fontFamily: 'Cinzel, serif', ...pal.accept, flexShrink: 0 }}
          >
            Accept
          </button>
        )}
        {questStatus === 'available' && lockedReason && (
          <span
            data-testid="quest-locked"
            title={lockedReason}
            className="px-3 py-1 rounded text-xs"
            style={{
              fontFamily: 'Cinzel, serif',
              ...pal.locked,
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            🔒 {lockedReason}
          </span>
        )}
      </div>

      <p
        style={{
          color: '#5a4a3a',
          fontSize: '0.75rem',
          fontStyle: 'italic',
          marginBottom: '0.5rem',
        }}
      >
        {quest.flavorText}
      </p>

      {!isCompleted && (
        <div className="flex flex-col gap-2 mb-2">
          {statuses.map(({ obj, current, target, done }) => {
            const pct = target > 0 ? current / target : 0
            // QUI-QOBJ-STYLE01 — libellé lisible (14px/500) + compteur en pastille colorée par état
            // (gris pas commencé → ambre en cours → vert fait). Carte sombre (board).
            const started = current > 0
            const iconColor = pal.objIcon(done, started)
            const pillBg = pal.pillBg(done, started)
            const pillFg = pal.pillFg(done, started)

            return (
              <div key={obj.id} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span style={{ color: iconColor, fontSize: '0.85rem' }}>{done ? '✓' : '○'}</span>
                  <span style={{ color: pal.objLabel, fontSize: '0.875rem', fontWeight: 500 }}>
                    {obj.label}
                  </span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      padding: '1px 8px',
                      borderRadius: 10,
                      background: pillBg,
                      color: pillFg,
                    }}
                  >
                    {current}/{target}
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
                  style={{ height: '5px', background: pal.track }}
                >
                  <div
                    className="h-full rounded transition-all duration-500"
                    style={{
                      width: `${Math.min(100, pct * 100)}%`,
                      background: done ? '#80c040' : '#c8912e',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {/* FIX-QXP01 — chip XP (toute quête octroie de l'XP de héros) */}
        <RewardBadge bg="#0f1024" color="#8ab0ff" border="#26325a">
          +{questXpReward(quest)} XP
        </RewardBadge>
        {/* FIX-QRANK01 — chip points de rang d'aventurier */}
        {questRankPoints(quest) > 0 && (
          <RewardBadge bg="#1a1220" color="#c9a0e0" border="#3a2850">
            +{questRankPoints(quest)} rank
          </RewardBadge>
        )}
        {quest.reward.gold && (
          <RewardBadge bg="#1a1408" color="#d4af70" border="#3a2808">
            +{quest.reward.gold}g
          </RewardBadge>
        )}
        {quest.reward.reputationTokens && (
          <RewardBadge bg="#100a18" color="#c084fc" border="#3a1858">
            +{quest.reward.reputationTokens} 🪙
          </RewardBadge>
        )}
        {quest.reward.skill && (
          <RewardBadge bg="#0a1018" color="#60a0c0" border="#1a3050">
            {SKILLS[quest.reward.skill.skillId]?.name ?? quest.reward.skill.skillId}
          </RewardBadge>
        )}
        {quest.reward.consumables &&
          Object.entries(quest.reward.consumables).map(([id, qty]) => (
            <RewardBadge key={id} bg="#0e1814" color="#70c0a0" border="#0e3828">
              {qty}× {RESOURCES[id]?.name ?? id}
            </RewardBadge>
          ))}
        {quest.reward.resources &&
          Object.entries(quest.reward.resources).map(([id, qty]) => (
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
          <RewardBadge bg="#1a1228" color="#c084fc" border="#3a1858">
            +{quest.reward.aura} Aura
          </RewardBadge>
        )}
        {quest.reward.concentration > 0 && (
          <RewardBadge bg="#0e1a1a" color="#60c0c0" border="#0e3838">
            +{quest.reward.concentration} Concentration
          </RewardBadge>
        )}
      </div>
    </div>
  )
}

function RewardBadge({ bg, color, border, children }) {
  return (
    <span
      className="px-2 py-0.5 rounded text-xs"
      style={{ background: bg, color, border: `1px solid ${border}` }}
    >
      {children}
    </span>
  )
}

// FIX-QCOMPLETED-COLLAPSE01 — section repliable (utilisée pour « Completed », repliée par défaut).
export function CollapsibleSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        data-testid="collapsible-header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="text-xs uppercase tracking-widest flex items-center gap-2"
        style={{
          color: '#4a3a2a',
          fontFamily: 'Cinzel, serif',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: '0.65rem' }}>{open ? '▾' : '▸'}</span>
        <span>{title}</span>
      </button>
      {open && <div className="qb-grid">{children}</div>}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="flex flex-col gap-3">
      <p
        className="text-xs uppercase tracking-widest"
        style={{ color: '#4a3a2a', fontFamily: 'Cinzel, serif' }}
      >
        {title}
      </p>
      {/* QB-LAYOUT01 — grille responsive pleine largeur (2-3 colonnes) */}
      <div className="qb-grid">{children}</div>
    </div>
  )
}
