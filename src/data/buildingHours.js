// BLD01 — Horaires d'ouverture des bâtiments (lié CAL01, en ticks 0-23 = heures).
//
// DÉCIDÉ : la taverne (inn) est ouverte 24/24 ; les autres bâtiments ont des horaires.
// Un bâtiment fermé refuse l'entrée + indique son heure d'ouverture.

// `null` = ouvert en permanence. Sinon { from, to } en ticks (to exclus). Pas d'overnight ici.
export const BUILDING_HOURS = {
  inn: null, // 24/24
  church: { from: 5, to: 21 }, // aube → soirée
  merchant: { from: 7, to: 19 },
  alchemy: { from: 8, to: 20 },
  blacksmith: { from: 6, to: 18 },
  master_smith: { from: 8, to: 18 },
  knight_trainer: { from: 7, to: 17 },
  guild: { from: 8, to: 20 }, // v1.2
  academy: { from: 8, to: 20 }, // v1.2
}

/** Vrai si le bâtiment est ouvert au tick donné (0-23). 24/24 si pas d'horaires. */
export function isBuildingOpen(buildingId, tick) {
  const h = BUILDING_HOURS[buildingId]
  if (!h) return true
  const t = (((tick ?? 0) % 24) + 24) % 24
  // gère un éventuel créneau qui passe minuit (from > to)
  return h.from <= h.to ? t >= h.from && t < h.to : t >= h.from || t < h.to
}

/** Prochaine heure d'ouverture (tick), ou null si 24/24. */
export function nextOpenHour(buildingId) {
  const h = BUILDING_HOURS[buildingId]
  return h ? h.from : null
}

/** Libellé lisible des horaires. */
export function formatBuildingHours(buildingId) {
  const h = BUILDING_HOURS[buildingId]
  if (!h) return 'Open all day'
  return `Open ${h.from}:00–${h.to}:00`
}
