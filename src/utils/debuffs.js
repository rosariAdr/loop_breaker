// CRF01 — Helpers purs pour les debuffs passifs temporaires (durée en jours).
// Testables sans React. Voir data/debuffs.js pour le registre.

import { DEBUFFS } from '../data/debuffs'

const MAX_TOTAL_REDUCTION = 0.9 // garde-fou : une stat ne descend jamais sous 10%

/**
 * Crée une instance de debuff actif.
 * permanent → remaining null (ne se décrémente jamais ; à soigner via antidote).
 */
export function makeDebuff(debuffId, days = 7, permanent = false) {
  return {
    debuffId,
    permanent,
    duration: { type: 'days', remaining: permanent ? null : days },
  }
}

/**
 * Ajoute (ou rafraîchit) un debuff dans la liste active.
 * Même debuffId déjà présent → prend la durée max (ou permanent si l'un l'est).
 * Retourne un nouveau tableau.
 */
export function addDebuff(active = [], debuffId, days = 7, permanent = false) {
  if (!DEBUFFS[debuffId]) return [...active]
  const existing = active.find(d => d.debuffId === debuffId)
  if (!existing) return [...active, makeDebuff(debuffId, days, permanent)]
  return active.map(d => {
    if (d.debuffId !== debuffId) return d
    const nowPermanent = d.permanent || permanent
    return {
      ...d,
      permanent: nowPermanent,
      duration: {
        type: 'days',
        remaining: nowPermanent ? null : Math.max(d.duration.remaining ?? 0, days),
      },
    }
  })
}

/**
 * Avance d'un jour : décrémente les debuffs temporaires, retire les expirés.
 * Les permanents restent intacts. Retourne un nouveau tableau.
 */
export function tickDebuffsOneDay(active = []) {
  return active
    .map(d => (d.permanent
      ? d
      : { ...d, duration: { ...d.duration, remaining: (d.duration.remaining ?? 0) - 1 } }))
    .filter(d => d.permanent || (d.duration.remaining ?? 0) > 0)
}

/**
 * Agrège les réductions de stats par stat : { stat: totalFraction }.
 */
export function getDebuffStatModifiers(active = []) {
  const mods = {}
  active.forEach(d => {
    const def = DEBUFFS[d.debuffId]
    if (!def) return
    mods[def.stat] = (mods[def.stat] ?? 0) + def.reduction
  })
  return mods
}

/**
 * Applique les réductions des debuffs à un objet de stats (ne mute pas l'entrée).
 * Réductions additives par stat, plafonnées à MAX_TOTAL_REDUCTION.
 */
export function applyDebuffsToStats(stats, active = []) {
  const mods = getDebuffStatModifiers(active)
  const out = { ...stats }
  Object.entries(mods).forEach(([stat, reduction]) => {
    if (typeof out[stat] === 'number') {
      const r = Math.min(reduction, MAX_TOTAL_REDUCTION)
      out[stat] = Math.max(0, Math.round(out[stat] * (1 - r)))
    }
  })
  return out
}
