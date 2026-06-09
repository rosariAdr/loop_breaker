// IDLE-OFF — Progression hors-ligne.
// Calcule en BATCH (valeurs espérées, pas de boucle tick-par-tick) les gains
// accumulés pendant l'absence du joueur si l'idle était actif.
//
// Décisions (2026-06-06) : gains illimités (pas de plafond de temps), la Fatigue
// ne s'accumule PAS hors-ligne, l'auto-stop HP est ignoré hors-ligne (à revoir).

// Durée réelle d'un tick idle (doit rester synchro avec l'intervalle dans App.jsx).
export const IDLE_TICK_MS = 3000

/** Nombre de ticks idle écoulés entre deux timestamps (>= 0). */
export function elapsedIdleTicks(lastSeenMs, nowMs) {
  if (lastSeenMs == null || nowMs == null || nowMs <= lastSeenMs) return 0
  return Math.floor((nowMs - lastSeenMs) / IDLE_TICK_MS)
}

/** Le héros peut-il farmer ce monstre (dégâts nets > 0) ? — miroir de processIdleTick. */
export function canGrind(hero, monster) {
  if (!hero || !monster) return false
  const heroStr = hero.stats?.strength ?? 0
  const monDef = monster.baseStats?.def ?? 0
  return heroStr - Math.floor(monDef / 2) > 0
}

const avg = (min, max) => (min + max) / 2

/**
 * Gains espérés pour `ticks` kills idle d'un monstre.
 * @returns {{ kills:number, gold:number, xp:number, resources:Record<string,number> }}
 */
export function computeOfflineGains({ monster, ticks, chance = 5 }) {
  if (!monster || !ticks || ticks <= 0) return { kills: 0, gold: 0, xp: 0, resources: {} }

  const chanceBonus = Math.max(0, (chance - 5) * 0.005) // miroir de processIdleTick

  const gold = Math.round(ticks * avg(monster.goldReward.min, monster.goldReward.max))
  const xp = ticks * (monster.expReward ?? 10)

  const resources = {}
  for (const drop of monster.resourceDrops ?? []) {
    const p = Math.min(1, drop.chance + chanceBonus)
    const expectedQty = p * avg(drop.qty.min, drop.qty.max)
    const total = Math.round(ticks * expectedQty)
    if (total > 0) resources[drop.resourceId] = total
  }

  return { kills: ticks, gold, xp, resources }
}
