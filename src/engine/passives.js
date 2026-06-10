// SKL-PASS — Effets des skills passifs équipés + XP passif.
//
// Jusqu'ici les `effect` des passifs (`maxHpBonus`, `damageReduction`) n'étaient
// consommés nulle part → AUCUN passif n'avait d'effet réel en combat. Ce module
// agrège les modificateurs des passifs équipés (avec leurs bonus de niveau) et est
// branché dans `Combat.jsx` (réduction de dégâts + bonus de PV max).
import { SKILLS, getLevelBonus } from '../data/skills'

// XP gagné par chaque passif équipé à chaque coup encaissé par le héros.
export const PASSIVE_XP_PER_HIT = 2
// Plafond de réduction de dégâts cumulée (anti-invulnérabilité).
export const MAX_DAMAGE_REDUCTION = 0.75

/**
 * Agrège les modificateurs des passifs équipés.
 * @param {{skillId:string, level:number}[]} passiveSkills
 * @returns {{ maxHpBonus:number, damageReduction:number }}
 *   maxHpBonus : fraction de PV max en plus (ex. 0.20 = +20%)
 *   damageReduction : fraction de dégâts reçus en moins (plafonnée)
 * @example getPassiveModifiers([{ skillId:'veterans_resolve', level:1 }]).maxHpBonus // 0.20
 */
export function getPassiveModifiers(passiveSkills = []) {
  let maxHpBonus = 0
  let damageReduction = 0
  for (const s of passiveSkills ?? []) {
    const tpl = SKILLS[s?.skillId]
    if (!tpl || tpl.type !== 'passive') continue
    const eff = tpl.effect ?? {}
    // SKL01 — anti-régression au-delà du niveau 3 (passifs peuvent monter à 5)
    const bonus = getLevelBonus(tpl, s.level)
    if (eff.maxHpBonus != null) maxHpBonus += eff.maxHpBonus + (bonus.maxHpBonusBonus ?? 0)
    if (eff.damageReduction != null)
      damageReduction += eff.damageReduction + (bonus.reductionBonus ?? 0)
  }
  return { maxHpBonus, damageReduction: Math.min(MAX_DAMAGE_REDUCTION, damageReduction) }
}
