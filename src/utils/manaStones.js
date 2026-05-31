// S03 — Helpers de gestion des mana stones (regroupement des doublons)

/**
 * Regroupe les mana stones identiques (même skillId + level) en entrées avec un compteur.
 * @param {Array} stones — [{ skillId, level, xp }]
 * @returns {Array} [{ skillId, level, xp, count, firstIndex }]
 *   - firstIndex : index de la 1ère occurrence dans le tableau original (pour la sélection UI)
 *   - count : nombre de copies identiques (même skillId + level)
 */
export function groupManaStones(stones) {
  if (!Array.isArray(stones)) return []
  const groups = []
  const keyToGroup = new Map()

  stones.forEach((stone, index) => {
    const key = `${stone.skillId}__${stone.level}`
    if (keyToGroup.has(key)) {
      keyToGroup.get(key).count += 1
    } else {
      const group = {
        skillId: stone.skillId,
        level: stone.level,
        xp: stone.xp,
        count: 1,
        firstIndex: index,
      }
      keyToGroup.set(key, group)
      groups.push(group)
    }
  })

  return groups
}

/**
 * Retire UNE seule occurrence d'un skill des mana stones (par skillId).
 * Corrige le comportement initial qui retirait toutes les copies.
 * @param {Array} stones
 * @param {string} skillId
 * @returns {Array} nouveau tableau sans la 1ère occurrence du skillId
 */
export function removeOneManaStone(stones, skillId) {
  if (!Array.isArray(stones)) return []
  const idx = stones.findIndex((s) => s.skillId === skillId)
  if (idx === -1) return stones
  return [...stones.slice(0, idx), ...stones.slice(idx + 1)]
}
