// S06 — Contenant cosmétique des skills selon l'univers
// Mécanique identique partout : seul le nom/l'icône change selon l'univers courant.
// Préparation X08 (multi-univers).

export const SKILL_CONTAINERS = {
  medieval_fantasy: { id: 'mana_stone', label: 'Mana Stones', singular: 'Mana Stone', icon: '💎' },
  wushu:            { id: 'manuscript', label: 'Manuscripts', singular: 'Manuscript', icon: '📜' },
  tower:            { id: 'data_chip',  label: 'Data Chips',  singular: 'Data Chip',  icon: '🔲' },
  post_apo:         { id: 'fragment',   label: 'Fragments',   singular: 'Fragment',   icon: '🧩' },
}

const DEFAULT_CONTAINER = SKILL_CONTAINERS.medieval_fantasy

/**
 * Retourne le contenant cosmétique d'un univers.
 * @param {string} universeId
 * @returns {{ id, label, singular, icon }}
 */
export function getSkillContainer(universeId) {
  return SKILL_CONTAINERS[universeId] ?? DEFAULT_CONTAINER
}
