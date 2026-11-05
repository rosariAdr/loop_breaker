// BEST01/02/03 — Bestiaire : paliers de kills par espèce → bonus permanents (méta).
// Compteur persistant `meta.bestiaryKills[monsterId]` (cumulé entre runs).
import { MONSTERS, MONSTERS_BY_ZONE } from './monsters'

// BEST01 — paliers : 10 → +5% dégâts vs l'espèce ; 50 → +10% + stats complètes au Codex ;
// 100 → maîtrisé : +5% taux de drop de l'espèce + lore & recette (BEST02).
export const BESTIARY_TIERS = [
  { level: 1, kills: 10, dmgBonus: 0.05 },
  { level: 2, kills: 50, dmgBonus: 0.1, codexFull: true },
  { level: 3, kills: 100, dmgBonus: 0.1, dropBonus: 0.05, mastered: true, loreUnlocked: true },
]

// BEST03 — complétion du bestiaire d'une zone → titre + petit bonus de dégâts dans la zone.
export const ZONE_BESTIARY = {
  ashenvale: { titleId: 'ashenvale_warden', zoneDmgBonus: 0.02 },
}

export function bestiaryTier(kills = 0) {
  const t = {
    level: 0,
    dmgBonus: 0,
    dropBonus: 0,
    codexFull: false,
    mastered: false,
    loreUnlocked: false,
  }
  for (const tier of BESTIARY_TIERS) if ((kills ?? 0) >= tier.kills) Object.assign(t, tier)
  return t
}
export const bestiaryDamageBonus = (kills) => bestiaryTier(kills).dmgBonus
export const bestiaryDropBonus = (kills) => bestiaryTier(kills).dropBonus ?? 0
export const isMastered = (kills) => bestiaryTier(kills).mastered === true

// BEST03 — toutes les espèces (non-réserve) d'une zone sont-elles maîtrisées ?
export function zoneBestiaryComplete(zone, bestiaryKills = {}) {
  const species = (MONSTERS_BY_ZONE[zone] ?? []).filter((id) => !MONSTERS[id]?.reserve)
  return species.length > 0 && species.every((id) => isMastered(bestiaryKills[id]))
}
export function completedBestiaryZones(bestiaryKills = {}) {
  return Object.keys(ZONE_BESTIARY).filter((z) => zoneBestiaryComplete(z, bestiaryKills))
}

// BEST02 — lore révélé à la maîtrise (100 kills) ; fallback dérivé si pas de champ dédié.
export function bestiaryLore(monsterId) {
  const m = MONSTERS[monsterId]
  if (!m) return ''
  return (
    m.lore ??
    `${m.name} — ${m.rank === 'elite' ? 'a fearsome elite' : 'a creature'} of ${m.huntingSpot ?? m.zone}. Master hunters learn its every weakness.`
  )
}
