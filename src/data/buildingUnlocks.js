// BLDUNL01 — Modèle de déblocage des bâtiments (data-driven).
//
// Chaque bâtiment déclare :
//   • default : 'unlocked' (accessible d'emblée) | 'locked' (nécessite un trigger)
//   • trigger : TYPE de déblocage prévu (BLDUNL02-04). PUREMENT INFORMATIF tant que
//               les déclencheurs réels ne sont pas câblés.
//   • lockedReason : texte affiché sur un bâtiment verrouillé (BLDUNL05).
//
// ⚠️ ÉTAT B4 (2026-06-13) — FLAG : les triggers réels (quête du maître, dialogue du
// doyen, arrivée en ville + fog) dépendent de **MQ-CHAIN01** (B5) et **START01/03**
// (B6), non construits. On livre donc le MODÈLE + le plumbing du store + le feedback
// verrouillé (BLDUNL05) ; au runtime l'état verrouillé vit dans `world.buildingLocks`
// (vide par défaut → rien de verrouillé → POC inchangé). Passer des bâtiments en
// `locked` au démarrage et câbler les triggers fins reste à groomer.
export const BUILDING_UNLOCKS = {
  merchant: { default: 'unlocked', trigger: null, lockedReason: null },
  church: { default: 'unlocked', trigger: null, lockedReason: null },
  inn: {
    default: 'unlocked',
    trigger: 'elder_dialogue', // BLDUNL02 — dialogue du doyen (centre du village)
    lockedReason: 'Speak with the village elder to open the inn',
  },
  blacksmith: {
    default: 'unlocked',
    trigger: 'master_quest', // BLDUNL02 — quête du maître devant le bâtiment
    lockedReason: "Complete the blacksmith's trial",
  },
  alchemy: {
    default: 'unlocked',
    trigger: 'master_quest',
    lockedReason: "Complete the alchemist's trial",
  },
  master_smith: {
    default: 'unlocked',
    trigger: 'master_quest',
    lockedReason: "Earn the master smith's favor",
  },
  knight_trainer: {
    default: 'unlocked',
    trigger: 'master_quest',
    lockedReason: 'Prove yourself to Sir Aldric',
  },
  academy: {
    default: 'unlocked',
    trigger: 'arrival_city', // BLDUNL03 — débloquée à l'arrivée en ville
    lockedReason: 'Reach a major city to enter the Academy',
  },
  guild: {
    default: 'unlocked',
    trigger: 'arrival_city', // BLDUNL04 — débloquée en ville (maître de Guilde)
    lockedReason: 'Reach a major city to join the Guild',
  },
}

/** Raison de verrouillage affichée pour un bâtiment (BLDUNL05). */
export function buildingLockReason(id) {
  return BUILDING_UNLOCKS[id]?.lockedReason ?? 'Locked'
}

/**
 * BLDUNL01 — un bâtiment est-il accessible ? Helper PUR (testable hors store).
 * Règle : déverrouillé sauf s'il figure explicitement dans `buildingLocks`
 * (override runtime). Un id inconnu est considéré déverrouillé.
 * @param {string} id
 * @param {string[]} buildingLocks  world.buildingLocks
 */
export function isBuildingUnlocked(id, buildingLocks = []) {
  return !buildingLocks.includes(id)
}
