// ACA01/ACA03 — Académie de magie : catalogue d'achat de skills + plus-value au niveau.
import { SKILLS } from './skills'

// Catalogue d'achat (skillId → prix de base en or, au niveau 1).
// On vend les techniques « de base » du joueur (pas les skills de boss / divins / suprêmes).
export const ACADEMY_CATALOG = {
  power_strike: 120,
  cleave: 150,
  counter_strike: 140,
  shield_stance: 130,
  savage_bite: 110,
  venom_bite: 160,
  healing_bloom: 200,
  veterans_resolve: 180, // passif
  stone_skin: 170, // passif
}

// Prix de base de revente pour un skill hors catalogue (drops de boss, etc.).
const DEFAULT_SELL_BASE = 100

// ACA03 — plus-value au niveau : valeur = base × 1.15^(niveau − 1).
export function skillValueAtLevel(basePrice, level = 1) {
  return Math.round(basePrice * Math.pow(1.15, Math.max(0, (level ?? 1) - 1)))
}

/** Prix d'achat d'un skill (au niveau 1). null si non achetable. */
export function skillBuyPrice(skillId) {
  const base = ACADEMY_CATALOG[skillId]
  return base == null ? null : base
}

/** Prix de revente d'un skill possédé, selon son niveau (plus-value au niveau). */
export function skillSellPrice(skillId, level = 1) {
  const base = ACADEMY_CATALOG[skillId] ?? DEFAULT_SELL_BASE
  // 60% de la valeur au niveau → revendre un skill monté rapporte plus (plus-value).
  return Math.round(skillValueAtLevel(base, level) * 0.6)
}

/** Liste des entrées achetables, enrichies du template SKILLS (pour l'UI). */
export function getAcademyCatalog() {
  return Object.entries(ACADEMY_CATALOG)
    .filter(([id]) => SKILLS[id])
    .map(([id, price]) => ({ skillId: id, price, skill: SKILLS[id] }))
}
