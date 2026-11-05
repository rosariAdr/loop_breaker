// Variantes présentes dans public/monsters (l'image principale compte aussi).
const PORTRAIT_COUNTS = {
  briar_wraith: 3,
  fenrot_devourer: 3,
  graven_sentinel: 3,
  hill_slime: 3,
  hollow_knight: 3,
  knoll_goblin: 3,
  mire_slime: 2,
  ruin_specter: 3,
  russet_fox: 3,
  stone_golem: 3,
  thicket_hare: 2,
  thunderhoof: 3,
}

// Parcourt les variantes sans répétition avant d'épuiser celles disponibles.
export function monsterPortraitSrc(monsterId, index = 0) {
  const variant = index % (PORTRAIT_COUNTS[monsterId] ?? 1)
  return `/monsters/${monsterId}${variant === 0 ? '' : `_${variant + 1}`}.png`
}
