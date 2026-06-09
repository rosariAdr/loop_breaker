// UI09 — Transition « parchemin » à l'entrée/sortie d'une zone.
// Seuls les passages World Map ↔ Zone (safe_zone / zone_view) déclenchent l'effet
// de déroulé de parchemin (les autres changements d'écran gardent le simple fondu U04).

const WORLD = 'world_map'
const ZONE_SCREENS = new Set(['safe_zone', 'zone_view'])

/**
 * Le changement d'écran prev→next est-il une entrée/sortie de zone ?
 * @returns {boolean}
 */
export function isZoneTransition(prev, next) {
  if (!prev || !next || prev === next) return false
  const enter = prev === WORLD && ZONE_SCREENS.has(next)
  const exit = ZONE_SCREENS.has(prev) && next === WORLD
  return enter || exit
}
