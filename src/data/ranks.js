// FIX-QRANK01 — Rang d'aventurier : échelle à 10 paliers, pilotée par le compteur cumulatif
// `hero.rankPoints` (gagné en complétant des quêtes ; **distinct** de `reputationTokens`, qui
// reste la monnaie dépensable à la Boutique des Dieux et le gate des commissions de Guilde).
// Seuils progressifs (tunables) : ~350 points pour atteindre Suprême.
export const RANK_TIERS = [
  { id: 'aluminium', label: 'Aluminium', color: '#b8b8c0', threshold: 0, nextAt: 10 },
  { id: 'iron', label: 'Fer', color: '#8a8a8a', threshold: 10, nextAt: 25 },
  { id: 'bronze', label: 'Bronze', color: '#b87333', threshold: 25, nextAt: 45 },
  { id: 'silver', label: 'Argent', color: '#bbbbbb', threshold: 45, nextAt: 70 },
  { id: 'orichalcum', label: 'Orichalque', color: '#5fbf9f', threshold: 70, nextAt: 100 },
  { id: 'gold', label: 'Or', color: '#d4af37', threshold: 100, nextAt: 140 },
  { id: 'platinum', label: 'Platine', color: '#c0e0e0', threshold: 140, nextAt: 190 },
  { id: 'emerald', label: 'Émeraude', color: '#50c878', threshold: 190, nextAt: 260 },
  { id: 'diamond', label: 'Diamant', color: '#80c0ff', threshold: 260, nextAt: 350 },
  { id: 'supreme', label: 'Suprême', color: '#ff70d0', threshold: 350, nextAt: null },
]

// Info de rang pour un total de points cumulés (`rankPoints`).
export function getRankInfo(points) {
  const p = Math.max(0, points ?? 0)
  let current = RANK_TIERS[0]
  for (const tier of RANK_TIERS) if (p >= tier.threshold) current = tier
  const isMax = current.nextAt == null
  const pointsInTier = p - current.threshold
  const pointsNeededInTier = isMax ? 0 : current.nextAt - current.threshold
  const pctToNext = isMax ? 1 : pointsInTier / pointsNeededInTier
  return {
    tier: current.id,
    label: current.label,
    color: current.color,
    isMax,
    pointsInTier,
    pointsNeededInTier,
    pctToNext,
    // alias rétro-compat (RankBanner lisait tokensInTier/tokensNeededInTier)
    tokensInTier: pointsInTier,
    tokensNeededInTier: pointsNeededInTier,
  }
}

export function nextRankLabel(currentTierId) {
  const idx = RANK_TIERS.findIndex((t) => t.id === currentTierId)
  return RANK_TIERS[idx + 1]?.label ?? '???'
}
