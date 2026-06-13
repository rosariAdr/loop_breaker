// REFAC01 — Slice « idle » du store (extrait de gameStore.js, comportement inchangé).
import { MONSTERS } from '../../data/monsters'
import { ZONES, getMonsterLevel } from '../../data/zones'
import { buildEnemy, isEnemyTooStrong } from '../../engine/combat'
import { canGrind, computeOfflineGains, elapsedIdleTicks } from '../../engine/offlineProgress'
import { applyLevelUps } from '../helpers'
import { useToastStore } from '../toastStore'

// IDLE-MASTERY01 — seuil de « maîtrise » unifié : il faut vaincre un monstre
// ce nombre de fois pour débloquer l'idle (et révéler son skill droppable, S02).
// Source unique : importée par ZoneView pour l'affichage et la barre de kills.
export const IDLE_MASTERY_KILLS = 5

export const createIdleSlice = (set, get) => ({
  toggleIdle: (monsterId) =>
    set((state) => {
      const kills = state.world.monsterKillCounts[monsterId] || 0
      if (kills < IDLE_MASTERY_KILLS) return state // pas encore débloqué

      // D07 — Idle interdit dans certaines zones (Blighted Road) et écrans (dungeon)
      const zone = ZONES[state.world.currentZone]
      if (zone?.idleAllowed === false) return state
      if (state.currentScreen === 'dungeon') return state

      const current = state.world.idleToggles[monsterId] || false
      return {
        world: {
          ...state.world,
          idleToggles: { ...state.world.idleToggles, [monsterId]: !current },
          isIdleActive: !current,
          idleTargetMonster: !current ? monsterId : null,
        },
      }
    }),

  // I08 — seuil de PV auto-stop de l'idle, configurable par le joueur (borné 5–90%)
  setIdleHpThreshold: (value) =>
    set((state) => ({
      world: { ...state.world, idleHpThreshold: Math.max(0.05, Math.min(0.9, value)) },
    })),

  addIdleLog: (entry) =>
    set((state) => {
      const newLog = [entry, ...state.world.idleLog].slice(0, 10)
      return { world: { ...state.world, idleLog: newLog } }
    }),

  // ── Idle tick ─────────────────────────────────────────────────────────────
  processIdleTick: () =>
    set((state) => {
      if (!state.world.isIdleActive || !state.world.idleTargetMonster) return state

      const monsterId = state.world.idleTargetMonster
      const monster = MONSTERS[monsterId]
      if (!monster) return state

      // B12 — ennemi trop fort pour l'idle (niveau > hero +5) :
      // on stoppe l'idle et on force un combat manuel (pas d'auto-grind suicidaire).
      const monsterLevel = getMonsterLevel(monsterId)
      if (isEnemyTooStrong(monsterLevel, state.hero.level)) {
        useToastStore
          .getState()
          .addToast(
            `${monster.name} (Lv ${monsterLevel}) is too strong to grind — fight it manually!`,
            'warning',
          )
        const entry = {
          text: `[Idle] ${monster.name} too strong (Lv ${monsterLevel}) — forced into manual combat.`,
          type: 'info',
          timestamp: Date.now(),
        }
        const forcedEnemy = buildEnemy(monsterId, state.world.currentZone, state.hero.runNumber)
        return {
          activeCombat: forcedEnemy
            ? {
                enemies: [forcedEnemy],
                turn: 0,
                log: [],
                phase: 'player',
                isOver: false,
                result: null,
              }
            : state.activeCombat,
          currentScreen: forcedEnemy ? 'combat' : state.currentScreen,
          world: {
            ...state.world,
            isIdleActive: false,
            idleTargetMonster: null,
            idleLog: [entry, ...state.world.idleLog].slice(0, 10),
          },
        }
      }

      // Auto-disable si HP sous le seuil configuré (I08) avant même de commencer
      const currentHp = state.hero.stats.hp
      const maxHp = state.hero.stats.maxHp
      const idleHpThreshold = state.world.idleHpThreshold ?? 0.2
      if (currentHp / maxHp < idleHpThreshold) {
        const entry = {
          text: `[Idle] HP trop bas — combat suspendu.`,
          type: 'info',
          timestamp: Date.now(),
        }
        // I04 — toast warning (événement rare, non-spammy)
        useToastStore
          .getState()
          .addToast('Idle paused — HP too low. Rest before continuing.', 'warning')
        return {
          world: {
            ...state.world,
            isIdleActive: false,
            idleTargetMonster: null,
            idleLog: [entry, ...state.world.idleLog].slice(0, 10),
          },
        }
      }

      // Vérifier si le héros peut gagner (dégâts nets > 0)
      const heroStr = state.hero.stats.strength
      const monDef = monster.baseStats.def
      if (heroStr - Math.floor(monDef / 2) <= 0) {
        const entry = {
          text: `Too weak to fight ${monster.name}.`,
          type: 'info',
          timestamp: Date.now(),
        }
        return { world: { ...state.world, idleLog: [entry, ...state.world.idleLog].slice(0, 10) } }
      }

      // Calcul des drops
      const chanceBonus = Math.max(0, (state.hero.stats.chance - 5) * 0.005)
      const newResources = { ...state.hero.inventory.resources }
      let anyDropped = false

      monster.resourceDrops.forEach((drop) => {
        if (Math.random() < drop.chance + chanceBonus) {
          anyDropped = true
          const qty = drop.qty.min + Math.floor(Math.random() * (drop.qty.max - drop.qty.min + 1))
          newResources[drop.resourceId] = (newResources[drop.resourceId] || 0) + qty
        }
      })

      if (!anyDropped && monster.resourceDrops.length > 0) {
        const drop = monster.resourceDrops[0]
        newResources[drop.resourceId] = (newResources[drop.resourceId] || 0) + drop.qty.min
      }

      const gold =
        monster.goldReward.min +
        Math.floor(Math.random() * (monster.goldReward.max - monster.goldReward.min + 1))

      const xp = monster.expReward ?? 10
      const newKillCount = (state.world.monsterKillCounts[monsterId] || 0) + 1

      // Dégâts reçus du monstre
      const monAtk = monster.baseStats.atk ?? monster.baseStats.strength ?? 5
      const heroDef = state.hero.stats.def
      const baseDamage = Math.max(1, monAtk - Math.floor(heroDef / 2))
      const damageTaken = Math.round(baseDamage * (0.9 + Math.random() * 0.2))
      const newHp = Math.max(1, currentHp - damageTaken)

      const {
        exp,
        level,
        expToNext,
        stats: s,
        levelsGained,
      } = applyLevelUps(state.hero.exp + xp, state.hero.level, state.hero.expToNext, {
        ...state.hero.stats,
        hp: newHp,
      })

      const isLowHp = s.hp / s.maxHp < (state.world.idleHpThreshold ?? 0.2)
      const levelUpStr = levelsGained > 0 ? ` ★ LEVEL UP! (${level})` : ''
      const entry = {
        text: `[Idle] Slew ${monster.name} · +${gold}g · +${xp}xp${levelUpStr}`,
        type: levelsGained > 0 ? 'drop' : 'kill',
        timestamp: Date.now(),
      }

      // I04 — toast sur level-up en idle (événement marquant, non-spammy)
      if (levelsGained > 0) {
        useToastStore.getState().addToast(`Level up! You reached level ${level} (idle).`, 'levelup')
      }
      // I04 — toast si idle s'arrête pour HP bas après ce combat
      if (isLowHp) {
        useToastStore.getState().addToast('Idle stopped — HP critically low.', 'warning')
      }

      return {
        hero: {
          ...state.hero,
          exp,
          level,
          expToNext,
          stats: s,
          inventory: {
            ...state.hero.inventory,
            resources: newResources,
            gold: state.hero.inventory.gold + gold,
          },
        },
        pendingLevelUp: state.pendingLevelUp + levelsGained,
        world: {
          ...state.world,
          isIdleActive: isLowHp ? false : state.world.isIdleActive,
          idleTargetMonster: isLowHp ? null : state.world.idleTargetMonster,
          monsterKillCounts: {
            ...state.world.monsterKillCounts,
            [monsterId]: newKillCount,
          },
          idleLog: [entry, ...state.world.idleLog].slice(0, 10),
        },
      }
    }),

  // IDLE-OFF — au retour, créditer les gains accumulés pendant l'absence si l'idle
  // était actif. Calcul en batch (valeurs espérées). nowMs injectable pour les tests.
  applyOfflineProgress: (nowMs = Date.now()) => {
    const { hero, world, meta } = get()
    if (!world.isIdleActive || !world.idleTargetMonster || !meta.lastSeen) return
    const monsterId = world.idleTargetMonster
    const monster = MONSTERS[monsterId]
    if (!monster || !canGrind(hero, monster)) return
    // Idle se serait arrêté si l'ennemi est trop fort (B12) → pas de gains hors-ligne
    if (isEnemyTooStrong(getMonsterLevel(monsterId), hero.level)) return

    const ticks = elapsedIdleTicks(meta.lastSeen, nowMs)
    if (ticks <= 0) return

    const gains = computeOfflineGains({ monster, ticks, chance: hero.stats.chance })

    // Crédit via les actions canoniques (gère les level-ups proprement)
    get().addGold(gains.gold)
    for (const [id, qty] of Object.entries(gains.resources)) get().addResource(id, qty)
    if (gains.xp > 0) get().gainExp(gains.xp)

    set((s) => ({
      world: {
        ...s.world,
        monsterKillCounts: {
          ...s.world.monsterKillCounts,
          [monsterId]: (s.world.monsterKillCounts[monsterId] || 0) + gains.kills,
        },
      },
      meta: {
        ...s.meta,
        lastSeen: nowMs, // évite le double-comptage si on recharge
        offlineSummary: { monsterName: monster.name, ...gains },
      },
    }))
  },

  clearOfflineSummary: () => set((s) => ({ meta: { ...s.meta, offlineSummary: null } })),
})
