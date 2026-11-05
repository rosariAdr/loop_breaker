// ── Helpers purs (hors store) ─────────────────────────────────────────────────

import { BALANCE } from '../config'

/**
 * Applique un ou plusieurs level-ups à partir de l'exp courante.
 * Retourne les nouvelles valeurs sans muter l'objet original.
 */
export function applyLevelUps(exp, level, expToNext, stats) {
  let levelsGained = 0
  while (exp >= expToNext) {
    exp -= expToNext
    level += 1
    expToNext = Math.round(expToNext * BALANCE.xp_curve_mult)
    const newMaxHp = Math.round(stats.maxHp * 1.1)
    const newMaxMana = Math.round(stats.maxMana * 1.1)
    stats = {
      ...stats,
      maxHp: newMaxHp,
      hp: newMaxHp,
      maxMana: newMaxMana,
      mana: newMaxMana,
      strength: stats.strength + 1,
      intelligence: stats.intelligence + 1,
      def: stats.def + 1,
      agility: stats.agility + 1,
    }
    levelsGained++
  }
  return { exp, level, expToNext, stats, levelsGained }
}
