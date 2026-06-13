// REFAC01 — Slice « quests » du store (extrait de gameStore.js, comportement inchangé).
import { createEquipmentInstance } from '../../data/equipment'
import { getQuestById, snapshotForQuest, isQuestCompleteState } from '../../data/quests'
import { RESOURCES } from '../../data/resources'
import { SKILLS } from '../../data/skills'
import { ZONES } from '../../data/zones'
import { useToastStore } from '../toastStore'

export const createQuestsSlice = (set, get) => ({
  // ── Système de quêtes ────────────────────────────────────────────────────
  startQuest: (questId) => {
    const wasActive = (get().world.activeQuests ?? []).includes(questId)
    set((state) => {
      const { activeQuests, completedQuests } = state.world
      if (completedQuests.includes(questId)) return state
      if (activeQuests.includes(questId)) return state
      // FIX-QUESTSNAP01 — fige les compteurs cumulés au moment de l'acceptation.
      const quest = getQuestById(questId)
      const snapshot = quest ? snapshotForQuest(quest, state) : { baseKills: {}, baseCraft: 0 }
      return {
        world: {
          ...state.world,
          activeQuests: [...activeQuests, questId],
          questProgress: { ...(state.world.questProgress ?? {}), [questId]: snapshot },
        },
      }
    })
    // ONB01 — tip à la 1ère acceptation de quête (uniquement si réellement ajoutée).
    if (!wasActive && (get().world.activeQuests ?? []).includes(questId)) {
      get().triggerHint('first_quest')
    }
  },

  // UX03 — Abandonner une quête active (perte de progression, mais retirable des actives)
  abandonQuest: (questId) =>
    set((state) => {
      const { activeQuests } = state.world
      if (!activeQuests.includes(questId)) return state
      return {
        world: {
          ...state.world,
          activeQuests: activeQuests.filter((q) => q !== questId),
        },
      }
    }),

  // FIX-QUESTSNAP01 — complétude calculée en DELTA depuis l'acceptation (source unique
  // `isQuestCompleteState`, partagée avec l'affichage du board/overlay).
  isQuestComplete: (questId) => {
    const quest = getQuestById(questId)
    return isQuestCompleteState(quest, get())
  },

  completeQuest: (questId) =>
    set((state) => {
      const { activeQuests: active, completedQuests: completed } = state.world
      if (!active.includes(questId)) return state
      const quest = getQuestById(questId)
      if (!quest) return state
      const r = quest.reward
      const newManaStones = [...state.hero.inventory.manaStones]
      const newEquipment = [...state.hero.inventory.equipment]
      const newResources = { ...state.hero.inventory.resources }
      const newConsumables = { ...state.hero.inventory.consumables }
      const newStats = { ...state.hero.stats }
      let newGold = state.hero.inventory.gold
      let newAura = state.hero.aura ?? 0
      let newConcentration = state.hero.concentration ?? 0
      let unseenLoot = state.unseenLoot
      const repTokens = r.reputationTokens ?? 0

      if (r.skill) newManaStones.push({ skillId: r.skill.skillId, level: 1, xp: 0 })
      if (r.gold) newGold += r.gold

      // Q09 — récompenses variées : équipement / ressources / stat
      const eqItem = r.equipment
        ? createEquipmentInstance(r.equipment.templateId, r.equipment.rarity)
        : null
      if (eqItem) {
        newEquipment.push(eqItem)
        unseenLoot = true
      }
      if (r.resources) {
        for (const [id, qty] of Object.entries(r.resources)) {
          newResources[id] = (newResources[id] || 0) + qty
          unseenLoot = true
        }
      }
      // CHQ01 — récompenses en consommables (élixirs/potions ; quêtes d'église)
      if (r.consumables) {
        for (const [id, qty] of Object.entries(r.consumables)) {
          newConsumables[id] = (newConsumables[id] || 0) + qty
        }
      }
      if (r.stat && typeof newStats[r.stat.name] === 'number') {
        newStats[r.stat.name] += r.stat.amount
      }
      // ACA04 — récompenses Aura / Concentration (quêtes de maître)
      if (r.aura) newAura += r.aura
      if (r.concentration) newConcentration += r.concentration
      // PROG03 — récompense qui débloque une zone (voie « quête »)
      const newUnlockedZones = [...(state.world.unlockedZones ?? [])]
      if (r.unlockZone && ZONES[r.unlockZone] && !newUnlockedZones.includes(r.unlockZone)) {
        newUnlockedZones.push(r.unlockZone)
      }

      // Q07/Q09 — Toast récompense de quête
      const rewardParts = []
      if (r.gold) rewardParts.push(`+${r.gold}g`)
      if (repTokens) rewardParts.push(`+${repTokens} 🪙`)
      if (r.skill) rewardParts.push(SKILLS[r.skill.skillId]?.name ?? r.skill.skillId)
      if (eqItem) rewardParts.push(eqItem.name)
      if (r.resources) {
        for (const [id, qty] of Object.entries(r.resources))
          rewardParts.push(`${qty}× ${RESOURCES[id]?.name ?? id}`)
      }
      if (r.consumables) {
        for (const [id, qty] of Object.entries(r.consumables))
          rewardParts.push(`${qty}× ${RESOURCES[id]?.name ?? id}`)
      }
      if (r.stat) rewardParts.push(`+${r.stat.amount} ${r.stat.name}`)
      if (r.aura) rewardParts.push(`+${r.aura} Aura`)
      if (r.concentration) rewardParts.push(`+${r.concentration} Concentration`)
      useToastStore
        .getState()
        .addToast(`Quest complete: ${quest.name} — ${rewardParts.join(' · ')}`, 'quest')

      return {
        unseenLoot,
        world: {
          ...state.world,
          activeQuests: active.filter((q) => q !== questId),
          completedQuests: [...completed, questId],
          unlockedZones: newUnlockedZones,
        },
        hero: {
          ...state.hero,
          stats: newStats,
          aura: newAura,
          concentration: newConcentration,
          reputationTokens: state.hero.reputationTokens + repTokens,
          inventory: {
            ...state.hero.inventory,
            manaStones: newManaStones,
            gold: newGold,
            equipment: newEquipment,
            resources: newResources,
            consumables: newConsumables,
          },
        },
      }
    }),

  // ── Réputation ───────────────────────────────────────────────────────────
  addReputationTokens: (amount) =>
    set((state) => ({
      hero: { ...state.hero, reputationTokens: state.hero.reputationTokens + amount },
    })),

  spendReputationTokens: (amount) =>
    set((state) => ({
      hero: {
        ...state.hero,
        reputationTokens: Math.max(0, state.hero.reputationTokens - amount),
      },
    })),
})
