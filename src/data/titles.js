// M01 — Titres permanents (persistent entre les runs via meta.titlesEarned).
// TITLE-BUF01 — chaque titre porte des `statBuffs` appliqués aux stats effectives (combat + fiche).
// TITLE-G1 — un seul titre ACTIF à la fois (meta.activeTitle) ; seuls ses buffs s'appliquent.
export const TITLES = {
  first_steps: {
    id: 'first_steps',
    name: 'First Steps',
    icon: '👣',
    description: 'Survived — and fell — for the first time. The loop begins.',
    statBuffs: { agility: 1 },
  },
  demon_lord_slayer: {
    id: 'demon_lord_slayer',
    name: 'Demon Lord Slayer',
    icon: '👑',
    description: 'Struck down a Demon Lord and shattered its dominion.',
    statBuffs: { strength: 2, def: 1 },
  },
  malachar_bane: {
    id: 'malachar_bane',
    name: "Malachar's Bane",
    icon: '😈',
    description: 'Ended Malachar, the Demon Lord of Grimspire.',
    statBuffs: { strength: 3, intelligence: 3 },
  },
  // BEST03 — titre de complétion du bestiaire d'Ashenvale (surface).
  ashenvale_warden: {
    id: 'ashenvale_warden',
    name: 'Ashenvale Warden',
    icon: '🌲',
    description: 'Recorded every beast that stalks Ashenvale.',
    statBuffs: { strength: 1, def: 1 },
  },
}

export function getTitle(id) {
  return TITLES[id] ?? null
}

// TITLE-BUF01 — statBuffs du titre actif (objet {stat: bonus}), vide si aucun / inconnu.
export function getTitleStatBuffs(activeTitleId) {
  return TITLES[activeTitleId]?.statBuffs ?? {}
}
