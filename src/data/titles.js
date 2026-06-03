// M01 — Titres permanents (persistent entre les runs via meta.titlesEarned).
// Gagnés par des hauts faits ; affichés sur le HeroSheet.

export const TITLES = {
  first_steps: {
    id: 'first_steps',
    name: 'First Steps',
    icon: '👣',
    description: 'Survived — and fell — for the first time. The loop begins.',
  },
  demon_lord_slayer: {
    id: 'demon_lord_slayer',
    name: 'Demon Lord Slayer',
    icon: '👑',
    description: 'Struck down a Demon Lord and shattered its dominion.',
  },
  malachar_bane: {
    id: 'malachar_bane',
    name: "Malachar's Bane",
    icon: '😈',
    description: 'Ended Malachar, the Demon Lord of Grimspire.',
  },
}

export function getTitle(id) {
  return TITLES[id] ?? null
}
