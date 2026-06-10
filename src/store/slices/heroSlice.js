// REFAC01 — Slice « hero » du store (extrait de gameStore.js, comportement inchangé).
import { skillBuyPrice, skillSellPrice } from '../../data/academy'
import { RESOURCES } from '../../data/resources'
import { SKILLS, SKILL_MAX_LEVEL, skillXpForLevel } from '../../data/skills'
import { AURA, countWithinDays } from '../../engine/aura'
import { VIGOR_MAX, applyVigorCost } from '../../engine/vigor'
import { addDebuff } from '../../utils/debuffs'
import { removeOneManaStone } from '../../utils/manaStones'
import { applyLevelUps } from '../helpers'
import { useToastStore } from '../toastStore'

export const createHeroSlice = (set, get) => ({
  // ── Modifier les stats du héros ───────────────────────────────────────────
  updateHeroStat: (stat, value) =>
    set((state) => ({
      hero: {
        ...state.hero,
        stats: { ...state.hero.stats, [stat]: value },
      },
    })),

  healHero: (amount) =>
    set((state) => {
      const { hp, maxHp } = state.hero.stats
      return {
        hero: {
          ...state.hero,
          stats: { ...state.hero.stats, hp: Math.min(hp + amount, maxHp) },
        },
      }
    }),

  restoreHeroMana: (amount) =>
    set((state) => {
      const { mana, maxMana } = state.hero.stats
      return {
        hero: {
          ...state.hero,
          stats: { ...state.hero.stats, mana: Math.min(mana + amount, maxMana) },
        },
      }
    }),

  // CAL01 — Prier à l'église : restaure 40% HP/mana ET consomme 1 tick (rollover si tickCount=23)
  prayAtChurch: () =>
    set((state) => {
      const { hp, maxHp, mana, maxMana } = state.hero.stats
      const newHp = Math.min(hp + Math.round(maxHp * 0.4), maxHp)
      const newMana = Math.min(mana + Math.round(maxMana * 0.4), maxMana)
      const newTick = state.world.tickCount + 1
      const rolloverDay = newTick >= 24
      return {
        hero: {
          ...state.hero,
          stats: { ...state.hero.stats, hp: newHp, mana: newMana },
        },
        world: {
          ...state.world,
          tickCount: rolloverDay ? 0 : newTick,
          dayCount: rolloverDay ? state.world.dayCount + 1 : state.world.dayCount,
        },
      }
    }),

  // STA01 — dépense / restaure la vigueur (clampée 0-100)
  spendVigor: (amount) =>
    set((state) => ({
      hero: { ...state.hero, vigor: applyVigorCost(state.hero.vigor ?? VIGOR_MAX, amount) },
    })),

  restoreVigor: () => set((state) => ({ hero: { ...state.hero, vigor: VIGOR_MAX } })),

  // STA02 — enregistre l'usage d'un skill : débloque l'Aura (15 skills en <4j) puis +1/10 usages.
  recordSkillUse: () =>
    set((state) => {
      const day = state.world.dayCount
      const log = [...(state.hero.skillUseLog ?? []), day].slice(-200)
      const count = (state.hero.skillUseCount ?? 0) + 1
      let aura = state.hero.aura ?? 0
      if (aura <= 0) {
        if (countWithinDays(log, day, AURA.unlockWindowDays) >= AURA.unlockUses) {
          aura = AURA.startValue
          useToastStore
            .getState()
            .addToast('Your Aura awakens — your blows strike harder! (+15 Aura)', 'levelup', 4000)
        }
      } else if (
        Math.floor(count / AURA.gainPerUses) > Math.floor((count - 1) / AURA.gainPerUses)
      ) {
        aura += 1
      }
      return { hero: { ...state.hero, skillUseLog: log, skillUseCount: count, aura } }
    }),

  // STA02/TRA01 — débloque/ajoute de l'Aura directement (entraînement chez un maître)
  grantAura: (amount) =>
    set((state) => ({ hero: { ...state.hero, aura: Math.max(state.hero.aura ?? 0, 0) + amount } })),

  // STA03 — gagne de la Concentration (clampée 0-150)
  gainConcentration: (amount) =>
    set((state) => ({
      hero: {
        ...state.hero,
        concentration: Math.min(150, Math.max(0, (state.hero.concentration ?? 0) + amount)),
      },
    })),

  // ITM01 — Lire un livre de stats (consommable `gain_stat`). @returns {boolean} succès
  // STA03b — voie alternative de gain de Concentration (et Aura / stats permanentes).
  useBook: (bookId) => {
    const res = RESOURCES[bookId]
    const eff = res?.effect
    if (!eff || eff.type !== 'gain_stat') return false
    const owned = get().hero.inventory.consumables[bookId] ?? 0
    if (owned <= 0) return false
    // consomme le livre
    set((state) => ({
      hero: {
        ...state.hero,
        inventory: {
          ...state.hero.inventory,
          consumables: { ...state.hero.inventory.consumables, [bookId]: owned - 1 },
        },
      },
    }))
    const { stat, amount } = eff
    if (stat === 'concentration') get().gainConcentration(amount)
    else if (stat === 'aura') get().grantAura(amount)
    else {
      // stat permanente (intelligence, strength…) → appliquée + mémorisée (réappliquée chaque run)
      set((state) => ({
        hero: {
          ...state.hero,
          stats: { ...state.hero.stats, [stat]: (state.hero.stats[stat] ?? 0) + amount },
        },
        meta: {
          ...state.meta,
          permanentStatBoosts: {
            ...(state.meta.permanentStatBoosts ?? {}),
            [stat]: ((state.meta.permanentStatBoosts ?? {})[stat] ?? 0) + amount,
          },
        },
      }))
    }
    useToastStore.getState().addToast(`Read ${res.name} — +${amount} ${stat}`, 'levelup', 3500)
    return true
  },

  // ── Gestion de l'équipement ───────────────────────────────────────────────
  addEquipmentToInventory: (item) =>
    set((state) => ({
      hero: {
        ...state.hero,
        inventory: {
          ...state.hero.inventory,
          equipment: [...state.hero.inventory.equipment, item],
        },
      },
      unseenLoot: true, // UX05
    })),

  equipItem: (instanceId) =>
    set((state) => {
      const item = state.hero.inventory.equipment.find((e) => e.instanceId === instanceId)
      if (!item) return state

      // Déséquiper l'item actuellement dans ce slot (retour inventaire)
      const currentEquipped = state.hero.equipped[item.slot]
      const newInventory = state.hero.inventory.equipment.filter((e) => e.instanceId !== instanceId)
      if (currentEquipped) newInventory.push(currentEquipped)

      return {
        hero: {
          ...state.hero,
          equipped: { ...state.hero.equipped, [item.slot]: item },
          inventory: { ...state.hero.inventory, equipment: newInventory },
        },
      }
    }),

  unequipItem: (slot) =>
    set((state) => {
      const item = state.hero.equipped[slot]
      if (!item) return state
      return {
        hero: {
          ...state.hero,
          equipped: { ...state.hero.equipped, [slot]: null },
          inventory: {
            ...state.hero.inventory,
            equipment: [...state.hero.inventory.equipment, item],
          },
        },
      }
    }),

  removeResource: (resourceId, qty) =>
    set((state) => {
      const current = state.hero.inventory.resources[resourceId] ?? 0
      return {
        hero: {
          ...state.hero,
          inventory: {
            ...state.hero.inventory,
            resources: {
              ...state.hero.inventory.resources,
              [resourceId]: Math.max(0, current - qty),
            },
          },
        },
      }
    }),

  sellEquipment: (instanceId) =>
    set((state) => {
      const item = state.hero.inventory.equipment.find((e) => e.instanceId === instanceId)
      if (!item) return state
      return {
        hero: {
          ...state.hero,
          inventory: {
            ...state.hero.inventory,
            equipment: state.hero.inventory.equipment.filter((e) => e.instanceId !== instanceId),
            gold: state.hero.inventory.gold + item.sellPrice,
          },
        },
      }
    }),

  // ── ACA01/ACA03 — Académie : acheter / revendre des skills ────────────────
  // Achète un skill (mana stone niveau 1) contre de l'or. @returns {boolean} succès
  buySkill: (skillId) => {
    const price = skillBuyPrice(skillId)
    const { hero } = get()
    if (price == null || hero.inventory.gold < price) {
      useToastStore.getState().addToast('Not enough gold.', 'warning')
      return false
    }
    set((state) => ({
      hero: {
        ...state.hero,
        inventory: {
          ...state.hero.inventory,
          gold: state.hero.inventory.gold - price,
          manaStones: [...state.hero.inventory.manaStones, { skillId, level: 1, xp: 0 }],
        },
      },
      unseenLoot: true,
    }))
    useToastStore
      .getState()
      .addToast(`Learned ${SKILLS[skillId]?.name ?? skillId} · −${price} 🪙`, 'info')
    return true
  },

  // Revend UNE copie d'un skill possédé (mana stone), prix selon son niveau (ACA03 plus-value).
  sellSkill: (skillId) => {
    const { hero } = get()
    const stones = hero.inventory.manaStones
    const idx = stones.findIndex((s) => s.skillId === skillId)
    if (idx === -1) return false
    const level = stones[idx].level ?? 1
    const price = skillSellPrice(skillId, level)
    set((state) => {
      const arr = state.hero.inventory.manaStones
      const i = arr.findIndex((s) => s.skillId === skillId)
      const newStones = i === -1 ? arr : [...arr.slice(0, i), ...arr.slice(i + 1)]
      return {
        hero: {
          ...state.hero,
          inventory: {
            ...state.hero.inventory,
            gold: state.hero.inventory.gold + price,
            manaStones: newStones,
          },
        },
      }
    })
    useToastStore
      .getState()
      .addToast(`Sold ${SKILLS[skillId]?.name ?? skillId} (Lv${level}) · +${price} 🪙`, 'info')
    return true
  },

  // ── Gestion des skills ────────────────────────────────────────────────────
  addSkillToInventory: (skillData) =>
    set((state) => ({
      hero: {
        ...state.hero,
        inventory: {
          ...state.hero.inventory,
          manaStones: [...state.hero.inventory.manaStones, skillData],
        },
      },
      unseenLoot: true, // UX05
    })),

  // UX05 — Marque le loot comme vu (appelé à l'ouverture de l'écran Inventory)
  markLootAsSeen: () => set({ unseenLoot: false }),

  equipActiveSkill: (skillData) =>
    set((state) => {
      if (state.hero.activeSkills.length >= 6) return state
      // Refuse si le skill est déjà équipé (évite les doublons en slot)
      if (state.hero.activeSkills.some((s) => s.skillId === skillData.skillId)) return state
      return {
        hero: {
          ...state.hero,
          activeSkills: [...state.hero.activeSkills, { ...skillData, currentCooldown: 0 }],
          inventory: {
            ...state.hero.inventory,
            // S03 — ne retire QU'UNE copie (removeOneManaStone), pas toutes
            manaStones: removeOneManaStone(state.hero.inventory.manaStones, skillData.skillId),
          },
        },
      }
    }),

  equipPassiveSkill: (skillData) =>
    set((state) => {
      if (state.hero.passiveSkills.length >= 4) return state
      if (state.hero.passiveSkills.some((s) => s.skillId === skillData.skillId)) return state
      return {
        hero: {
          ...state.hero,
          passiveSkills: [...state.hero.passiveSkills, skillData],
          inventory: {
            ...state.hero.inventory,
            // S03 — ne retire QU'UNE copie
            manaStones: removeOneManaStone(state.hero.inventory.manaStones, skillData.skillId),
          },
        },
      }
    }),

  unequipActiveSkill: (skillId) =>
    set((state) => {
      const skill = state.hero.activeSkills.find((s) => s.skillId === skillId)
      if (!skill) return state
      return {
        hero: {
          ...state.hero,
          activeSkills: state.hero.activeSkills.filter((s) => s.skillId !== skillId),
          inventory: {
            ...state.hero.inventory,
            manaStones: [...state.hero.inventory.manaStones, skill],
          },
        },
      }
    }),

  unequipPassiveSkill: (skillId) =>
    set((state) => {
      const skill = state.hero.passiveSkills.find((s) => s.skillId === skillId)
      if (!skill) return state
      return {
        hero: {
          ...state.hero,
          passiveSkills: state.hero.passiveSkills.filter((s) => s.skillId !== skillId),
          inventory: {
            ...state.hero.inventory,
            manaStones: [...state.hero.inventory.manaStones, skill],
          },
        },
      }
    }),

  gainSkillXp: (skillId, xpAmount) =>
    set((state) => {
      const levelUps = [] // S04 — tracker les level-ups pour notif
      const updateSkillXp = (skills) =>
        skills.map((s) => {
          if (s.skillId !== skillId) return s
          const newXp = s.xp + xpAmount
          // SKL01 — paliers d'XP jusqu'au niveau 5 (était 3) via skillXpForLevel.
          const xpNeeded = skillXpForLevel(s.level)
          if (newXp >= xpNeeded && s.level < SKILL_MAX_LEVEL) {
            const toLevel = s.level + 1
            levelUps.push({
              id: `${skillId}_${Date.now()}_${Math.random()}`,
              skillId,
              fromLevel: s.level,
              toLevel,
              timestamp: Date.now(),
            })
            return { ...s, xp: newXp - xpNeeded, level: toLevel }
          }
          return { ...s, xp: newXp }
        })

      return {
        hero: {
          ...state.hero,
          activeSkills: updateSkillXp(state.hero.activeSkills),
          passiveSkills: updateSkillXp(state.hero.passiveSkills),
        },
        recentSkillLevelUps: [...state.recentSkillLevelUps, ...levelUps],
      }
    }),

  // S04 — Consomme un level-up notif (après affichage par Combat.jsx)
  clearSkillLevelUp: (id) =>
    set((state) => ({
      recentSkillLevelUps: state.recentSkillLevelUps.filter((e) => e.id !== id),
    })),

  // Reset complet (utile pour tests ou si l'écran change)
  clearAllSkillLevelUps: () => set({ recentSkillLevelUps: [] }),

  // ── Inventaire ────────────────────────────────────────────────────────────
  addResource: (resourceId, qty) =>
    set((state) => {
      const current = state.hero.inventory.resources[resourceId] || 0
      return {
        hero: {
          ...state.hero,
          inventory: {
            ...state.hero.inventory,
            resources: { ...state.hero.inventory.resources, [resourceId]: current + qty },
          },
        },
        unseenLoot: true, // UX05
      }
    }),

  addConsumable: (resourceId, qty) =>
    set((state) => {
      const current = state.hero.inventory.consumables[resourceId] || 0
      return {
        hero: {
          ...state.hero,
          inventory: {
            ...state.hero.inventory,
            consumables: { ...state.hero.inventory.consumables, [resourceId]: current + qty },
          },
        },
      }
    }),

  addGold: (amount) =>
    set((state) => ({
      hero: {
        ...state.hero,
        inventory: { ...state.hero.inventory, gold: state.hero.inventory.gold + amount },
      },
    })),

  spendGold: (amount) =>
    set((state) => ({
      hero: {
        ...state.hero,
        inventory: {
          ...state.hero.inventory,
          gold: Math.max(0, state.hero.inventory.gold - amount),
        },
      },
    })),

  // CRF01 — Applique un debuff au héros (utilisé par les ratés de crafting CRF02/03)
  addHeroDebuff: (debuffId, days = 7, permanent = false) =>
    set((state) => ({
      hero: {
        ...state.hero,
        activeDebuffs: addDebuff(state.hero.activeDebuffs ?? [], debuffId, days, permanent),
      },
    })),

  // CRF06 — Soigne les debuffs actifs du héros (y compris permanents). Utilisé par l'antidote.
  // @returns {number} nombre de debuffs soignés
  cureHeroDebuffs: () => {
    const cured = (get().hero.activeDebuffs ?? []).length
    if (cured > 0) set((state) => ({ hero: { ...state.hero, activeDebuffs: [] } }))
    return cured
  },

  // ── XP & niveau ──────────────────────────────────────────────────────────
  gainExp: (amount) =>
    set((state) => {
      const { exp, level, expToNext, stats, levelsGained } = applyLevelUps(
        state.hero.exp + amount,
        state.hero.level,
        state.hero.expToNext,
        { ...state.hero.stats },
      )
      return {
        hero: { ...state.hero, exp, level, expToNext, stats },
        pendingLevelUp: state.pendingLevelUp + levelsGained,
      }
    }),

  clearPendingLevelUp: () => set({ pendingLevelUp: 0 }),

  // ── Nom du héros (CharacterCreation) ─────────────────────────────────────
  renameHero: (name) =>
    set((state) => ({
      hero: {
        ...state.hero,
        name: name.trim() || 'The Wanderer',
        heroNamed: true,
      },
    })),
})
