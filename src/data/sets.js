// EQP01 / SET-G1 / SET-CONTENT01 — Bonus de set d'équipement.
//
// Modèle (SET-G1) :
//   - Chaque set gouverne 1 à 3 stats (`stats`).
//   - Le bonus est un POURCENTAGE du stat que les pièces DU SET fournissent (leur somme
//     de stats sur les pièces équipées), débloqué par paliers de pièces portées :
//       2 → +5 %, 3 → +13 %, 4 → +20 %, 5 → +27 %, 6 → +34 %, 7 → +41 %, 8 → +48 %, 9 → +55 %.
//   - Un set « de zone » = 4 pièces (3 normales + arme d'élite) ; un set haut-level va
//     jusqu'à 9 pièces (au max des slots, cf. SLOT01).
//
// Le champ `set` porté par une pièce (EQUIPMENT_TEMPLATES.set → propagé aux instances) est
// la clé d'un set ci-dessous. `getSetBonus` agrège les bonus de tous les sets actifs.

// SET-G1 — table des paliers : nb de pièces portées → fraction de bonus appliquée.
// Palier < 2 = aucun bonus. Extensible : au-delà de 9, on clampe sur le dernier palier.
export const SET_BONUS_TIERS = {
  2: 0.05,
  3: 0.13,
  4: 0.2,
  5: 0.27,
  6: 0.34,
  7: 0.41,
  8: 0.48,
  9: 0.55,
}

// SET-CONTENT01 — définitions des sets.
//   { id, name, stats: [statKey…], pieces: [templateId…], description }
// `pieces` = les templates qui composent le set (info d'affichage/complétion) ; la source de
// vérité pour « quelles pièces sont portées » reste `item.set` sur les instances équipées.
// NB conception (SLOT01) : les pièces d'un set complétable occupent des SLOTS DISTINCTS
// (sinon le palier n'est jamais atteint). Chaque set de zone = casque + armure + bottes +
// arme (4 slots distincts) ; l'arme d'élite est une arme ALTERNATIVE du même set (tag `set`
// identique) → l'équiper à la place de l'arme normale conserve le compte de 4 pièces.
export const SETS = {
  // ── Sets de zone Ashenvale (casque + armure + bottes + arme = 4 slots) ────────
  // Iron Vanguard : orienté défense/force. Arme d'élite alternative = Thunderhoof Maul.
  iron_vanguard: {
    id: 'iron_vanguard',
    name: 'Iron Vanguard',
    stats: ['def', 'strength'],
    pieces: ['iron_helm', 'leather_armor', 'swift_boots', 'iron_sword'],
    eliteWeapon: 'thunderhoof_maul', // arme d'élite alternative (même set)
    description: "Forgé pour tenir la ligne. Défense et force s'amplifient.",
  },
  // Wraithbound : orienté intelligence/PV. Arme d'élite alternative = Graven Edge.
  wraithbound: {
    id: 'wraithbound',
    name: 'Wraithbound Regalia',
    stats: ['intelligence', 'maxHp'],
    pieces: ['wraith_crown', 'bone_plate', 'cursed_greaves', 'bone_staff'],
    eliteWeapon: 'graven_edge', // arme d'élite alternative (même set)
    description: "Tissé d'énergie spectrale. Amplifie l'esprit et la vitalité.",
  },
}

/**
 * SET-G1 — fraction de bonus pour un nombre de pièces portées (0 sous 2 pièces).
 */
export function setBonusFraction(pieceCount) {
  if (pieceCount < 2) return 0
  const capped = Math.min(pieceCount, 9)
  return SET_BONUS_TIERS[capped] ?? 0
}

/**
 * Compte les pièces portées par set (clé `set` sur les instances équipées).
 * @returns {Record<string, number>} { setId: nbPièces }
 */
export function countEquippedSetPieces(equipped = {}) {
  const counts = {}
  for (const item of Object.values(equipped)) {
    if (item?.set) counts[item.set] = (counts[item.set] ?? 0) + 1
  }
  return counts
}

/**
 * EQP01 — Calcule les bonus de set actifs.
 * Pour chaque set dont ≥2 pièces sont portées, applique `fraction` (palier) à la SOMME
 * des stats gouvernés fournis par les pièces DE CE SET actuellement équipées.
 * @returns {Record<string, number>} { stat: bonusEntier } — arrondi.
 */
export function getSetBonus(equipped = {}) {
  const bonuses = {}
  const counts = countEquippedSetPieces(equipped)

  for (const [setId, count] of Object.entries(counts)) {
    const def = SETS[setId]
    if (!def) continue
    const fraction = setBonusFraction(count)
    if (fraction <= 0) continue

    // Somme des stats gouvernés, fournis par les pièces de CE set effectivement portées.
    const provided = {}
    for (const item of Object.values(equipped)) {
      if (item?.set !== setId) continue
      for (const stat of def.stats) {
        const v = item.stats?.[stat] ?? 0
        if (v) provided[stat] = (provided[stat] ?? 0) + v
      }
    }

    for (const [stat, total] of Object.entries(provided)) {
      const bonus = Math.round(total * fraction)
      if (bonus) bonuses[stat] = (bonuses[stat] ?? 0) + bonus
    }
  }

  return bonuses
}

/**
 * SET-UI01 — Résumé des sets actifs pour l'affichage.
 * @returns {Array<{ id, name, count, total, stats, fraction, active, bonuses }>}
 *   — un item par set dont ≥1 pièce est portée ; trié par nb de pièces décroissant.
 */
export function getActiveSetsSummary(equipped = {}) {
  const counts = countEquippedSetPieces(equipped)
  return Object.entries(counts)
    .map(([setId, count]) => {
      const def = SETS[setId]
      if (!def) return null
      const fraction = setBonusFraction(count)
      // Bonus de CE set isolé (pour l'affichage par set) : restreindre `equipped` aux
      // pièces du set puis réutiliser getSetBonus.
      const single = getSetBonus(
        Object.fromEntries(Object.entries(equipped).filter(([, it]) => it?.set === setId)),
      )
      return {
        id: setId,
        name: def.name,
        description: def.description,
        stats: def.stats,
        count,
        total: def.pieces.length,
        fraction,
        active: fraction > 0,
        bonuses: single,
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.count - a.count)
}
