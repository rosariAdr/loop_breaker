// VQ01-07 / VQ-G — Quêtes de village générées par la carte (QSV2-ADJ-AUDIT01).
// Le pool d'un lieu = monstres/ressources de ses spots de chasse POSSÉDÉS (SPOT_OWNER,
// 1 spot = 1 seul lieu → pools disjoints, QSV2-SPOTOWNER01 / VQ-DEDUP01). Rotation /3 j
// (VQ06). Règles de grooming :
//  • VQ-G1 — seules les quêtes d'élite donnent des reputation tokens (communes = gold/ressources).
//  • VQ-G3 — quêtes d'élite level-gated (requiredLevel = bas du levelRange du spot).
//  • VQ-G4 — nb actives = base (village 3 / ville 6) + 1 par 5 niveaux, plafond 6 / 12.
//  • VQ-G2 — progression « collect » comptée en delta après acceptation (snapshot, cf. quests.js).
//  • VQ-G5 — en ville, le board (Guilde) consomme ce pool avec isCity=true.
import { MONSTERS, MONSTERS_BY_SPOT } from './monsters'
import { RESOURCES } from './resources'
import { neighborsOf } from './worldGraph'
import { getSpotLevelRange } from './zones'

// VQ07 — donneur de quêtes par localité (Map 1).
export const VILLAGE_QUEST_GIVERS = {
  greywatch: 'greywatch_elder', // Elder Moira
  millhaven: 'millhaven_elder', // Warden Halric
  ironhaven: 'ironhaven_captain', // Captain Vaern (Guilde)
}

// Élites réservées à Map 2 (hors pool village Map 1).
const FROZEN_MONSTERS = new Set(['fenrot_devourer'])

const prettySpot = (spot) =>
  spot
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
const resourceName = (id) => RESOURCES[id]?.name ?? id
const tierOf = (lvl) => (lvl < 10 ? 'easy' : lvl < 20 ? 'mid' : 'hard')

// VQ02 — spots de chasse adjacents à un lieu (intersection graphe × spots de chasse).
export function adjacentSpots(location) {
  return neighborsOf(location).filter((n) => MONSTERS_BY_SPOT[n])
}

// QSV2-SPOTOWNER01 — PROPRIÉTAIRE UNIQUE par spot (pools disjoints, résout VQ-DEDUP01).
// Dérivé de la carte : chaque spot de chasse de surface est attribué à UN seul lieu
// ADJACENT (worldGraph.EDGES), pour qu'aucun contenu ne soit proposé à deux villages
// (fin du double-dip). Contestés tranchés : ashenvale_forest (Greywatch|Millhaven) →
// Greywatch (sinon le village de départ n'a aucune quête) ; thornmarsh
// (Millhaven|Ironhaven) → Ironhaven (spot fin-de-Map-1 L20-30 → ville finale).
// Garde-fou : test d'adjacence + de disjonction (QSV2-QSRC-TEST01).
export const SPOT_OWNER = {
  ashenvale_forest: 'greywatch',
  crumbled_ruins: 'millhaven',
  thornmarsh: 'ironhaven',
  wildmere_hills: 'ironhaven',
}

// Spots POSSÉDÉS par un lieu = source du sourcing des quêtes (remplace l'union adjacente).
export function ownedSpots(location) {
  return Object.keys(SPOT_OWNER).filter(
    (spot) => SPOT_OWNER[spot] === location && MONSTERS_BY_SPOT[spot],
  )
}

// VQ-G4 — nombre de quêtes actives selon le niveau du héros + le type de lieu.
export function villageQuestCount(heroLevel = 1, isCity = false) {
  const base = isCity ? 6 : 3
  const max = isCity ? 12 : 6
  return Math.min(base + Math.floor((heroLevel ?? 1) / 5), max)
}

// QSV2-QSRC-TEST01 — propriétaire unique par RESSOURCE : un drop partagé par des monstres
// de spots appartenant à 2 lieux (ex. ectoplasm : briar_wraith→thornmarsh/Ironhaven ET
// ruin_specter→crumbled_ruins/Millhaven) ne génère sa quête de collecte QUE chez le
// propriétaire du spot de sa PREMIÈRE source (déterministe, dérivé de la carte) — sinon
// la même cible `collect` existerait à deux villages (double-dip inter-village).
function resourceOwner(resourceId) {
  const firstSource = RESOURCES[resourceId]?.sources?.[0]
  const spot = MONSTERS[firstSource]?.huntingSpot
  return spot ? (SPOT_OWNER[spot] ?? null) : null
}

// VQ01 / VQ02 / VQ03-05 — pool de quêtes d'un lieu (déterministe, par adjacence).
export function generateVillageQuestPool(location) {
  const giver = VILLAGE_QUEST_GIVERS[location]
  if (!giver) return []
  const pool = []
  for (const spot of ownedSpots(location)) {
    // QSV2-SPOTOWNER01 — pools disjoints (1 spot → 1 lieu), plus de doublon inter-village
    const [minLvl] = getSpotLevelRange(spot) ?? [1, 1]
    const difficultyTier = tierOf(minLvl)
    const common = {
      giverNpc: giver,
      issuedBy: location,
      isVillageQuest: true,
      sourceSpot: spot,
      difficultyTier,
    }
    for (const monsterId of MONSTERS_BY_SPOT[spot]) {
      if (FROZEN_MONSTERS.has(monsterId)) continue
      const m = MONSTERS[monsterId]
      if (!m) continue
      const isElite = m.rank === 'elite'
      const count = isElite ? 1 : 5
      // VQ01 — quête kill
      pool.push({
        ...common,
        id: `vq_${location}_kill_${monsterId}`,
        name: isElite ? `Bounty: ${m.name}` : `Cull the ${m.name}s`,
        description: `Hunt ${isElite ? 'the elite ' : ''}${m.name} in the ${prettySpot(spot)}.`,
        ...(isElite ? { requiredLevel: minLvl } : {}), // VQ-G3
        objectives: [
          {
            id: 'kill',
            type: 'kill',
            monsterId,
            count,
            label: `Kill ${m.name}${count > 1 ? 's' : ''}`,
          },
        ],
        reward: {
          gold: count * (minLvl + 2) * (isElite ? 8 : 2),
          reputationTokens: isElite ? 5 : 0, // VQ-G1
        },
      })
      // VQ01 — quête collect (drop principal d'un monstre commun)
      if (!isElite) {
        const drop = m.resourceDrops?.[0]
        // QSV2-QSRC-TEST01 — ressource partagée entre lieux → seule le propriétaire la propose
        const dropOwner = drop ? resourceOwner(drop.resourceId) : null
        if (drop && (dropOwner == null || dropOwner === location)) {
          const cc = 5
          pool.push({
            ...common,
            id: `vq_${location}_collect_${drop.resourceId}`,
            name: `Gather ${resourceName(drop.resourceId)}`,
            description: `Collect ${cc}× ${resourceName(drop.resourceId)} from the ${prettySpot(spot)}.`,
            objectives: [
              {
                id: 'collect',
                type: 'collect',
                resourceId: drop.resourceId,
                count: cc,
                label: `Collect ${resourceName(drop.resourceId)}`,
              },
            ],
            reward: {
              gold: cc * (RESOURCES[drop.resourceId]?.sellPrice ?? 2) * 3,
              reputationTokens: 0,
            },
          })
        }
      }
    }
    // QSV2-MULTIMON01 — quête « patrouille » multi-objectifs (2 communs du spot).
    const commons = MONSTERS_BY_SPOT[spot].filter(
      (id) => !FROZEN_MONSTERS.has(id) && MONSTERS[id]?.rank !== 'elite',
    )
    if (commons.length >= 2) {
      const [a, b] = commons
      pool.push({
        ...common,
        id: `vq_${location}_patrol_${spot}`,
        name: `Patrol the ${prettySpot(spot)}`,
        description: `Drive back the beasts threatening the ${prettySpot(spot)}.`,
        deadlineDays: 4, // QSV2-TIMED01 — patrouille chronométrée
        objectives: [
          { id: 'k1', type: 'kill', monsterId: a, count: 3, label: `Kill ${MONSTERS[a].name}s` },
          { id: 'k2', type: 'kill', monsterId: b, count: 3, label: `Kill ${MONSTERS[b].name}s` },
        ],
        reward: { gold: 6 * (minLvl + 2) * 2, reputationTokens: 0 },
      })
    }

    // VQ01 — quête visit (par spot)
    pool.push({
      ...common,
      id: `vq_${location}_visit_${spot}`,
      name: `Scout the ${prettySpot(spot)}`,
      description: `Travel to the ${prettySpot(spot)} and report back.`,
      objectives: [
        { id: 'visit', type: 'visit', spotId: spot, label: `Explore the ${prettySpot(spot)}` },
      ],
      reward: { gold: (minLvl + 2) * 5, reputationTokens: 0 },
    })
  }
  // dédoublonnage par id (un drop principal partagé par 2 spots ne crée qu'une collecte)
  const seen = new Set()
  return pool.filter((q) => (seen.has(q.id) ? false : (seen.add(q.id), true)))
}

// VQ06 + VQ-G3 + VQ-G4 — quêtes de village actives (fenêtre glissante /3 jours).
export function getActiveVillageQuests(
  location,
  { dayCount = 1, heroLevel = 1, isCity = false } = {},
) {
  const pool = generateVillageQuestPool(location).filter((q) => heroLevel >= (q.requiredLevel ?? 0))
  if (pool.length === 0) return []
  const n = Math.min(villageQuestCount(heroLevel, isCity), pool.length)
  const block = Math.floor((dayCount ?? 1) / 3)
  const start = (block * n) % pool.length
  const out = []
  for (let i = 0; i < n; i++) out.push(pool[(start + i) % pool.length])
  return out
}

// Résout une quête de village par id (régénère le pool de son lieu). L'id encode le
// lieu : `vq_<location>_<kind>_<target>` → permet à getQuestById (store + board) de la
// retrouver pour l'acceptation / la complétion / le snapshot.
export function getVillageQuestById(id) {
  if (typeof id !== 'string' || !id.startsWith('vq_')) return null
  const location = id.split('_')[1]
  return generateVillageQuestPool(location).find((q) => q.id === id) ?? null
}
