// Système d'équipement
// SLOT01 — 9 slots portés : weapon | offhand | helmet | armor | gloves | boots | amulet | ring1 | ring2
// Catégories d'items (item.slot) : weapon | offhand | helmet | armor | gloves | boots | amulet | ring
//   - une pièce `ring` se loge dans ring1 puis ring2 ;
//   - une arme `twoHanded` occupe weapon + offhand (l'offhand est bloquée) ;
//   - `offhand` = bouclier ou arme secondaire (arme 1 main avec slot:'offhand').
// Rarités : common < rare < epic < legendary < mythic < ex < exx

import { getSetBonus } from './sets'

export const RARITY_TIERS = ['common', 'rare', 'epic', 'legendary', 'mythic', 'ex', 'exx']

// SLOT01 — ordre canonique des 9 slots portés (clés de hero.equipped).
export const EQUIP_SLOTS = [
  'weapon',
  'offhand',
  'helmet',
  'armor',
  'gloves',
  'boots',
  'amulet',
  'ring1',
  'ring2',
]

// SLOT01 — les deux slots de bague (une pièce `ring` va dans le premier libre).
export const RING_SLOTS = ['ring1', 'ring2']

export const RARITY_CONFIG = {
  common: { label: 'Common', color: '#9ca3af', mult: 1.0, sellMult: 1 },
  rare: { label: 'Rare', color: '#60a5fa', mult: 1.8, sellMult: 3 },
  epic: { label: 'Epic', color: '#c084fc', mult: 3.2, sellMult: 8 },
  legendary: { label: 'Legendary', color: '#fbbf24', mult: 6.0, sellMult: 20 },
  mythic: { label: 'Mythic', color: '#f87171', mult: 11.0, sellMult: 60 },
  ex: { label: 'EX', color: '#67e8f9', mult: 20.0, sellMult: 200 },
  exx: { label: 'EXX', color: '#ffffff', mult: 40.0, sellMult: 800 },
}

// Stats affectées par slot
// primary = stat principale boostée, secondary = stat secondaire (bonus réduit)
export const SLOT_STATS = {
  weapon: { primary: ['strength', 'intelligence'], secondary: [] },
  helmet: { primary: ['def'], secondary: ['maxHp'] },
  armor: { primary: ['def', 'maxHp'], secondary: [] },
  boots: { primary: ['agility'], secondary: ['chance'] },
}

// Valeurs de base (rarity common) par slot et par stat
export const BASE_STAT_VALUES = {
  weapon: { strength: 5, intelligence: 5 },
  helmet: { def: 4, maxHp: 15 },
  armor: { def: 6, maxHp: 25 },
  boots: { agility: 4, chance: 2 },
}

// Templates des pièces d'équipement
// Chaque template définit le slot, le nom de base, et les ingrédients de craft par rareté
export const EQUIPMENT_TEMPLATES = {
  // ── ARMES ────────────────────────────────────────────────────────────────
  iron_sword: {
    id: 'iron_sword',
    name: 'Iron Sword',
    slot: 'weapon',
    type: 'physical', // physical = STR, magical = INT
    description: 'A sturdy iron blade. Favors Strength.',
    statFocus: 'strength',
    baseStats: { strength: 5 },
    set: 'iron_vanguard', // SET-CONTENT01
    availableAt: ['blacksmith', 'merchant'],
    craftRecipes: {
      common: { ingredients: { rusted_iron: 3 }, gold: 20 },
      rare: { ingredients: { rusted_iron: 5, cursed_steel: 1 }, gold: 80 },
      epic: { ingredients: { cursed_steel: 3, warlord_crest: 1 }, gold: 250 },
      legendary: { ingredients: { cursed_steel: 5, warlord_crest: 2, void_crystal: 1 }, gold: 800 },
    },
    merchantStock: { common: true, rare: true, epic: true }, // Z07 — epic vendu en ville uniquement
    merchantBuyPrice: { common: 40, rare: 160, epic: 520 },
  },

  bone_staff: {
    id: 'bone_staff',
    name: 'Bone Staff',
    slot: 'weapon',
    type: 'magical',
    description: 'A staff carved from ancient bones. Favors Intelligence.',
    statFocus: 'intelligence',
    baseStats: { intelligence: 5 },
    set: 'wraithbound', // SET-CONTENT01
    twoHanded: true, // SLOT01 — un bâton se manie à 2 mains
    availableAt: ['blacksmith'],
    craftRecipes: {
      common: { ingredients: { bone_fragment: 4, ectoplasm: 1 }, gold: 25 },
      rare: { ingredients: { ancient_bone: 2, hollow_shard: 2 }, gold: 100 },
      epic: { ingredients: { ancient_bone: 4, wraith_essence: 2 }, gold: 300 },
      legendary: {
        ingredients: { ancient_bone: 6, wraith_essence: 3, void_crystal: 1 },
        gold: 1000,
      },
    },
    merchantStock: {},
    merchantBuyPrice: {},
  },

  serpent_dagger: {
    id: 'serpent_dagger',
    name: 'Serpent Dagger',
    slot: 'weapon',
    type: 'physical',
    description: 'A venom-coated dagger. Favors Agility and Strength.',
    statFocus: 'strength',
    baseStats: { strength: 4, agility: 2 },
    availableAt: ['blacksmith'],
    craftRecipes: {
      common: { ingredients: { serpent_scale: 3, marsh_venom: 1 }, gold: 30 },
      rare: { ingredients: { serpent_scale: 5, marsh_venom: 2, void_fang: 1 }, gold: 120 },
      // RES03 — verdant_ichor (sève alchimique du hill_slime) enduit la lame de poison.
      epic: { ingredients: { void_fang: 3, marsh_venom: 4, wyvern_talon: 1, verdant_ichor: 1 }, gold: 400 },
      legendary: { ingredients: { void_fang: 5, wyvern_talon: 3, dark_essence: 2 }, gold: 1200 },
    },
    merchantStock: {},
    merchantBuyPrice: {},
  },

  // ── ARMES SIGNATURE D'ÉLITE (MQ-ELITETURN01) ───────────────────────────────
  // Récompenses exclusives des remises de quête principale (MQ02/04/06). Non
  // craftables, non vendues (availableAt: []). `craftRecipes: {}` requis par
  // createEquipmentInstance (sellPrice retombe sur le défaut). +1 rareté à la
  // 2ᵉ remise géré côté flux (B5b).
  oakheart_branch: {
    id: 'oakheart_branch',
    name: 'Oakheart Branch',
    slot: 'weapon',
    type: 'physical',
    description: 'A living bough torn from Old Oakheart. Heavy, knotted, and still faintly warm.',
    statFocus: 'strength',
    baseStats: { strength: 6, def: 1 },
    availableAt: [],
    craftRecipes: {},
  },
  thunderhoof_maul: {
    id: 'thunderhoof_maul',
    name: 'Thunderhoof Maul',
    slot: 'weapon',
    type: 'physical',
    description: "Forged around Thunderhoof's horn. It lands like a charging beast.",
    statFocus: 'strength',
    baseStats: { strength: 7 },
    set: 'iron_vanguard', // SET-CONTENT01 — arme d'élite (4ᵉ pièce)
    twoHanded: true, // SLOT01 — le maul se manie à 2 mains
    availableAt: [],
    craftRecipes: {},
  },
  graven_edge: {
    id: 'graven_edge',
    name: 'Graven Edge',
    slot: 'weapon',
    type: 'magical',
    description: 'A rune-etched shard of the Graven Sentinel. It hums with bound intelligence.',
    statFocus: 'intelligence',
    baseStats: { intelligence: 7 },
    set: 'wraithbound', // SET-CONTENT01 — arme d'élite (4ᵉ pièce)
    availableAt: [],
    craftRecipes: {},
  },

  // ── CASQUES ──────────────────────────────────────────────────────────────
  iron_helm: {
    id: 'iron_helm',
    name: 'Iron Helm',
    slot: 'helmet',
    description: 'A basic iron helmet. Reduces damage taken.',
    baseStats: { def: 4, maxHp: 15 },
    set: 'iron_vanguard', // SET-CONTENT01
    availableAt: ['blacksmith', 'merchant'],
    craftRecipes: {
      common: { ingredients: { rusted_iron: 3, bone_fragment: 1 }, gold: 25 },
      rare: { ingredients: { rusted_iron: 5, cursed_armor_shard: 2 }, gold: 90 },
      epic: { ingredients: { cursed_armor_shard: 4, grimstone: 3 }, gold: 280 },
      legendary: {
        ingredients: { cursed_armor_shard: 6, void_crystal: 1, dark_essence: 2 },
        gold: 900,
      },
    },
    merchantStock: { common: true, rare: true },
    merchantBuyPrice: { common: 50, rare: 180 },
  },

  wraith_crown: {
    id: 'wraith_crown',
    name: 'Wraith Crown',
    slot: 'helmet',
    description: 'A crown woven from spectral iron. Enhances magical defense.',
    baseStats: { def: 3, maxHp: 20 },
    set: 'wraithbound', // SET-CONTENT01
    availableAt: ['blacksmith'],
    craftRecipes: {
      common: { ingredients: { ectoplasm: 3, briar_thorn: 2 }, gold: 30 },
      // RES03 — spectral_residue (résidu du ruin_specter) renforce l'aura spectrale du heaume.
      rare: { ingredients: { spectral_iron: 2, ectoplasm: 3, spectral_residue: 1 }, gold: 110 },
      epic: { ingredients: { spectral_iron: 4, wraith_essence: 2 }, gold: 350 },
      legendary: {
        ingredients: { spectral_iron: 6, wraith_essence: 3, cursed_gem: 1 },
        gold: 1100,
      },
    },
    merchantStock: {},
    merchantBuyPrice: {},
  },

  // ── ARMURES ──────────────────────────────────────────────────────────────
  leather_armor: {
    id: 'leather_armor',
    name: 'Leather Armor',
    slot: 'armor',
    description: 'Light leather armor. Balanced protection.',
    baseStats: { def: 6, maxHp: 25 },
    set: 'iron_vanguard', // SET-CONTENT01
    availableAt: ['blacksmith', 'merchant'],
    craftRecipes: {
      common: { ingredients: { wolf_pelt: 3, rusted_iron: 1 }, gold: 30 },
      // RES03 — ironhide_plate (plaque de cuir du tuskmaw_boar, prisée des tanneurs) durcit l'armure.
      rare: { ingredients: { wolf_pelt: 5, serpent_scale: 3, ironhide_plate: 1 }, gold: 100 },
      epic: { ingredients: { shadow_fur: 3, wyvern_scale: 3 }, gold: 320 },
      legendary: { ingredients: { shadow_fur: 5, wyvern_scale: 5, void_crystal: 1 }, gold: 1000 },
    },
    merchantStock: { common: true, rare: true },
    merchantBuyPrice: { common: 60, rare: 200 },
  },

  bone_plate: {
    id: 'bone_plate',
    name: 'Bone Plate',
    slot: 'armor',
    description: 'Heavy plate armor forged from ancient bones. Maximum protection.',
    baseStats: { def: 10, maxHp: 20 },
    set: 'wraithbound', // SET-CONTENT01
    availableAt: ['blacksmith'],
    craftRecipes: {
      common: { ingredients: { bone_fragment: 5, ancient_bone: 1 }, gold: 40 },
      rare: { ingredients: { ancient_bone: 3, giant_bone: 2 }, gold: 140 },
      epic: { ingredients: { giant_bone: 4, colossus_marrow: 2 }, gold: 450 },
      legendary: {
        ingredients: { giant_bone: 6, colossus_marrow: 3, forsaken_seal: 1 },
        gold: 1500,
      },
    },
    merchantStock: {},
    merchantBuyPrice: {},
  },

  // ── BOTTES ───────────────────────────────────────────────────────────────
  swift_boots: {
    id: 'swift_boots',
    name: 'Swift Boots',
    slot: 'boots',
    description: 'Light boots that increase movement speed and agility.',
    baseStats: { agility: 4, chance: 2 },
    set: 'iron_vanguard', // SET-CONTENT01 — bottes du set Iron Vanguard
    availableAt: ['blacksmith', 'merchant'],
    craftRecipes: {
      common: { ingredients: { wolf_pelt: 2, wolf_fang: 2 }, gold: 20 },
      // RES03 — wolf_alpha_fang (croc d'alpha, ashwood_wolf) allège et affûte la botte.
      rare: { ingredients: { wolf_pelt: 4, serpent_scale: 2, wolf_alpha_fang: 1 }, gold: 80 },
      // RES03 — goblin_warpaint (pigments indélébiles du knoll_goblin) marque la botte de guerre.
      epic: { ingredients: { shadow_fur: 3, void_fang: 2, goblin_warpaint: 1 }, gold: 260 },
      legendary: { ingredients: { shadow_fur: 5, void_fang: 3, dark_essence: 2 }, gold: 850 },
    },
    merchantStock: { common: true, rare: true },
    merchantBuyPrice: { common: 40, rare: 160 },
  },

  cursed_greaves: {
    id: 'cursed_greaves',
    name: 'Cursed Greaves',
    slot: 'boots',
    description: 'Heavy greaves imbued with dark energy. Boosts Chance significantly.',
    baseStats: { agility: 3, chance: 5 },
    set: 'wraithbound', // SET-CONTENT01 — grèves du set Wraithbound
    availableAt: ['blacksmith'],
    craftRecipes: {
      common: { ingredients: { rusted_iron: 2, rotten_flesh: 3 }, gold: 25 },
      // RES03 — caustic_core (cœur acide du mire_slime) imprègne les grèves d'une corrosion maudite.
      rare: { ingredients: { cursed_armor_shard: 3, hollow_shard: 2, caustic_core: 1 }, gold: 95 },
      epic: { ingredients: { cursed_steel: 3, dark_essence: 2 }, gold: 300 },
      legendary: { ingredients: { cursed_steel: 5, dark_essence: 3, warlord_crest: 2 }, gold: 950 },
    },
    merchantStock: {},
    merchantBuyPrice: {},
  },
}

// ── Utilitaires ───────────────────────────────────────────────────────────────

/**
 * Calcule les stats d'une pièce d'équipement selon sa rareté.
 * Les stats de base sont multipliées par le multiplicateur de rareté.
 */
export function calcEquipmentStats(templateId, rarity) {
  const template = EQUIPMENT_TEMPLATES[templateId]
  if (!template) return {}

  const mult = RARITY_CONFIG[rarity]?.mult ?? 1
  const result = {}

  Object.entries(template.baseStats).forEach(([stat, value]) => {
    result[stat] = Math.round(value * mult)
  })

  return result
}

/**
 * Z07 — Filtre/pondère le stock d'équipement marchand selon le type de localité.
 * - village : raretés communes + au plus 1 rare (la moins chère).
 * - ville   : raretés rares + au plus 1 epic (la moins chère).
 * Conserve l'ordre d'origine ; retombe sur le stock brut si le filtre vide tout.
 * @param {Array<{templateId,rarity,price}>} stock
 * @param {'city'|'village'} type
 */
export function filterEquipStockByLocation(stock, type) {
  if (!Array.isArray(stock) || stock.length === 0) return stock ?? []
  const cheapestOf = (rar) => {
    const items = stock.filter((s) => s.rarity === rar)
    if (items.length === 0) return null
    return items.reduce((a, b) => (b.price < a.price ? b : a))
  }
  let result
  if (type === 'city') {
    result = stock.filter((s) => s.rarity === 'rare')
    const epic = cheapestOf('epic')
    if (epic) result = [...result, epic]
  } else {
    result = stock.filter((s) => s.rarity === 'common')
    const rare = cheapestOf('rare')
    if (rare) result = [...result, rare]
  }
  return result.length ? result : stock
}

/**
 * Crée une instance d'équipement prête à être placée dans l'inventaire.
 */
export function createEquipmentInstance(templateId, rarity) {
  const template = EQUIPMENT_TEMPLATES[templateId]
  if (!template) return null

  const instance = {
    instanceId: `${templateId}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    templateId,
    name: `${RARITY_CONFIG[rarity].label} ${template.name}`,
    slot: template.slot,
    rarity,
    stats: calcEquipmentStats(templateId, rarity),
    sellPrice: Math.round(
      ((template.craftRecipes[rarity]?.gold ?? 20) * RARITY_CONFIG[rarity].sellMult) / 10,
    ),
  }
  // SLOT01 / EQP01 — propager les champs de gameplay portés par le template.
  if (template.set) instance.set = template.set // appartenance à un set (EQP01)
  if (template.twoHanded) instance.twoHanded = true // arme 2 mains → 2 slots (SLOT01)
  return instance
}

/**
 * Additionne tous les bonus de stats de l'équipement porté, PLUS les bonus de set actifs
 * (EQP01). Retourne un objet { stat: totalBonus }. Cette fonction est la couche unique de
 * bonus d'équipement consommée par le combat et la fiche héros → les bonus de set
 * s'appliquent partout sans câblage supplémentaire.
 */
export function calcEquippedStatBonuses(equipped) {
  const bonuses = {}
  Object.values(equipped).forEach((item) => {
    if (!item) return
    Object.entries(item.stats).forEach(([stat, val]) => {
      bonuses[stat] = (bonuses[stat] ?? 0) + val
    })
  })
  // EQP01 — ajouter les bonus de set (% du stat fourni par les pièces du set).
  const setBonuses = getSetBonus(equipped)
  for (const [stat, val] of Object.entries(setBonuses)) {
    bonuses[stat] = (bonuses[stat] ?? 0) + val
  }
  return bonuses
}

// ── SLOT01 — Résolution de slot & règles d'armes ──────────────────────────────

/**
 * Détermine dans quel slot porté ranger une pièce (catégorie `item.slot`).
 * - ring → première bague libre (ring1 puis ring2) ; si les 2 sont pleines → ring1 (remplacé).
 * - weapon/offhand/helmet/armor/gloves/boots/amulet → slot homonyme.
 * @returns {string} clé de hero.equipped, ou null si la catégorie est inconnue.
 */
export function resolveEquipSlot(item, equipped = {}) {
  if (!item) return null
  if (item.slot === 'ring') {
    const free = RING_SLOTS.find((s) => !equipped[s])
    return free ?? RING_SLOTS[0]
  }
  return EQUIP_SLOTS.includes(item.slot) ? item.slot : null
}

/**
 * Équipe une pièce en respectant les règles d'armes (SLOT01) :
 *   - arme 2 mains (twoHanded) → occupe weapon + offhand ; l'ancienne arme ET l'ancien
 *     offhand retournent au sac.
 *   - équiper un offhand alors qu'une arme 2 mains est portée → l'arme 2 mains part au sac.
 *   - remplacer une pièce dans un slot occupé → l'ancienne retourne au sac.
 * Fonction pure : ne mute rien. Retourne le nouvel état `equipped` et la liste des pièces
 * déplacées vers l'inventaire (`unequipped`).
 * @returns {{ equipped: object, unequipped: object[] }}
 */
export function equipInSlot(item, equipped = {}) {
  const next = { ...equipped }
  const unequipped = []
  const push = (piece) => {
    if (piece) unequipped.push(piece)
  }

  const targetSlot = resolveEquipSlot(item, equipped)
  if (!targetSlot) return { equipped: next, unequipped }

  if (targetSlot === 'weapon') {
    // Remplacer l'arme principale.
    push(next.weapon)
    // Si l'arme portée dans offhand était en fait la 2ᵉ moitié d'une 2 mains, rien à faire :
    // une 2 mains occupe weapon+offhand et est stockée dans weapon (offhand = miroir vide).
    if (item.twoHanded) {
      // Occupe aussi l'offhand : l'ancien offhand part au sac.
      push(next.offhand)
      next.offhand = null
    }
    next.weapon = item
  } else if (targetSlot === 'offhand') {
    // Poser un offhand libère une éventuelle arme 2 mains (qui occupait cet emplacement).
    if (next.weapon?.twoHanded) {
      push(next.weapon)
      next.weapon = null
    }
    push(next.offhand)
    next.offhand = item
  } else {
    push(next[targetSlot])
    next[targetSlot] = item
  }

  return { equipped: next, unequipped }
}

/**
 * Vérifie si le héros a les ingrédients pour crafter une pièce.
 */
export function canCraft(templateId, rarity, heroResources) {
  const template = EQUIPMENT_TEMPLATES[templateId]
  if (!template) return false
  const recipe = template.craftRecipes[rarity]
  if (!recipe) return false

  return Object.entries(recipe.ingredients).every(
    ([resId, qty]) => (heroResources[resId] ?? 0) >= qty,
  )
}
