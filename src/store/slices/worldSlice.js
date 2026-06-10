// REFAC01 — Slice « world » du store (extrait de gameStore.js, comportement inchangé).
import { getInformant } from '../../data/informants'
import { ZONES } from '../../data/zones'
import { VIGOR_COST, VIGOR_MAX, applyVigorCost } from '../../engine/vigor'
import { tickDebuffsOneDay } from '../../utils/debuffs'
import { useToastStore } from '../toastStore'

export const createWorldSlice = (set, get) => ({
  // ── Calendrier & monde ────────────────────────────────────────────────────

  sleep: () =>
    set((state) => {
      // Récupération complète + spawn nouveau donjon
      const newDungeons = { ...state.world.dungeons }
      Object.keys(newDungeons).forEach((zoneId) => {
        if (newDungeons[zoneId].cleared) {
          newDungeons[zoneId] = {
            active: true,
            cleared: false,
            position: ['north', 'south', 'east', 'west'][Math.floor(Math.random() * 4)],
            discovered: false,
          }
        }
      })

      return {
        hero: {
          ...state.hero,
          stats: {
            ...state.hero.stats,
            hp: state.hero.stats.maxHp,
            mana: state.hero.stats.maxMana,
          },
          vigor: VIGOR_MAX, // STA01 — dormir restaure la vigueur à 100
          // CRF01 — un jour passe : les debuffs temporaires décrémentent
          activeDebuffs: tickDebuffsOneDay(state.hero.activeDebuffs ?? []),
        },
        world: {
          ...state.world,
          tickCount: 8, // INN-WAKE01 — réveil à 8h du matin (et non minuit). Cohérence BLD01.
          dayCount: state.world.dayCount + 1,
          isNight: false,
          dungeons: newDungeons,
        },
      }
    }),

  // Q04 — enregistre la visite d'un spot de chasse (dédup), pour les quêtes d'exploration
  recordVisit: (spotId) =>
    set((state) => {
      const visited = state.world.visitedSpots ?? []
      if (!spotId || visited.includes(spotId)) return state
      return { world: { ...state.world, visitedSpots: [...visited, spotId] } }
    }),

  // PROG03 — débloque explicitement une zone (via récompense de quête OU info d'informateur).
  unlockZone: (zoneId, source = 'unknown') =>
    set((state) => {
      if (!ZONES[zoneId]) return state
      const cur = state.world.unlockedZones ?? []
      if (cur.includes(zoneId)) return state
      useToastStore
        .getState()
        .addToast(
          `🗺 New region revealed: ${ZONES[zoneId]?.name ?? zoneId}${source === 'info' ? ' (rumor)' : ''}`,
          'info',
        )
      return { world: { ...state.world, unlockedZones: [...cur, zoneId] } }
    }),

  // ── Tick calendrier ───────────────────────────────────────────────────────
  advanceTick: () =>
    set((state) => {
      const newTick = state.world.tickCount + 1
      if (newTick >= 24) {
        return { world: { ...state.world, tickCount: 0, dayCount: state.world.dayCount + 1 } }
      }
      return { world: { ...state.world, tickCount: newTick } }
    }),

  // TRV01/TRV03 — Voyage vers un node adjacent : déplace le héros sur la carte et
  // avance le temps de 3 tics (avec rollover de jour). N'exécute PAS l'idle
  // (on ne farme pas en marchant — décision 2026-06-06).
  travelTo: (nodeId, ticks = 3) =>
    set((state) => {
      const total = state.world.tickCount + ticks
      return {
        world: {
          ...state.world,
          currentNode: nodeId,
          tickCount: total % 24,
          dayCount: state.world.dayCount + Math.floor(total / 24),
        },
        // STA01 — un voyage coûte 1 de vigueur (par unité de distance)
        hero: {
          ...state.hero,
          vigor: applyVigorCost(state.hero.vigor ?? VIGOR_MAX, VIGOR_COST.distance),
        },
      }
    }),

  // TAV01 — acheter une info à un informateur. @returns {boolean} succès
  buyInfo: (id, price) => {
    const { hero, meta } = get()
    if ((meta.knownInfo ?? []).includes(id)) return false
    if (hero.inventory.gold < price) return false
    get().spendGold(price)
    set((s) => ({ meta: { ...s.meta, knownInfo: [...(s.meta.knownInfo ?? []), id] } }))
    useToastStore.getState().addToast('🕵 Information acquired.', 'info')
    // PROG03 — certaines rumeurs débloquent une zone (voie « info informateur »)
    const inf = getInformant(id)
    if (inf?.unlockZone) get().unlockZone(inf.unlockZone, 'info')
    return true
  },

  // ── Donjons ───────────────────────────────────────────────────────────────
  discoverDungeon: (zoneId) =>
    set((state) => {
      const dungeon = state.world.dungeons[zoneId]
      if (!dungeon) return state
      return {
        world: {
          ...state.world,
          dungeons: {
            ...state.world.dungeons,
            [zoneId]: { ...dungeon, discovered: true },
          },
        },
      }
    }),

  clearDungeon: (zoneId) =>
    set((state) => {
      const dungeon = state.world.dungeons[zoneId]
      if (!dungeon) return state

      // D05 — warp à la sortie : héros téléporté à la ville principale de la zone,
      // sortie du spot de chasse, idle stop (cohérence D07).
      const zoneData = ZONES[zoneId]
      const safeCityId = zoneData?.city?.id ?? state.world.currentLocation

      // M02 — incrément du compteur Demon Lords kills par univers
      // Pour l'instant un seul univers : 'medieval_fantasy'. Préparation X08.
      const universeId = 'medieval_fantasy'
      const isDemonLordKill = zoneId === 'grimspire'
      const updatedDemonLordKills = isDemonLordKill
        ? {
            ...(typeof state.meta.demonLordKills === 'object' ? state.meta.demonLordKills : {}),
            [universeId]:
              ((typeof state.meta.demonLordKills === 'object'
                ? state.meta.demonLordKills[universeId]
                : state.meta.demonLordKills) ?? 0) + 1,
          }
        : state.meta.demonLordKills

      // W01 — récompense de victoire sur le Demon Lord : +200 tokens de réputation
      const tokenReward = isDemonLordKill ? 200 : 0
      if (isDemonLordKill) {
        useToastStore
          .getState()
          .addToast('Demon Lord vanquished! +200 reputation tokens.', 'divine')
      }

      return {
        hero:
          tokenReward > 0
            ? { ...state.hero, reputationTokens: (state.hero.reputationTokens ?? 0) + tokenReward }
            : state.hero,
        world: {
          ...state.world,
          dungeons: {
            ...state.world.dungeons,
            [zoneId]: { ...dungeon, cleared: true },
          },
          demonLordDefeated: isDemonLordKill ? true : state.world.demonLordDefeated,
          // D05 — warp
          currentLocation: safeCityId,
          currentNode: safeCityId, // TRV01 — garde la position carte synchronisée au warp
          currentHuntingSpot: null,
          isIdleActive: false,
          idleTargetMonster: null,
        },
        meta: {
          ...state.meta,
          demonLordKills: updatedDemonLordKills,
          // W03 — flag levé pour le post-mortem si Malachar killed ce run
          malacharDefeatedThisRun: isDemonLordKill
            ? true
            : (state.meta.malacharDefeatedThisRun ?? false),
          // T13 — titres permanents gagnés en tuant un Demon Lord (dépend M01)
          titlesEarned: isDemonLordKill
            ? Array.from(
                new Set([...(state.meta.titlesEarned ?? []), 'demon_lord_slayer', 'malachar_bane']),
              )
            : (state.meta.titlesEarned ?? []),
        },
      }
    }),
})
