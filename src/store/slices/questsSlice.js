// REFAC01 — Slice « quests » du store (extrait de gameStore.js, comportement inchangé).
import { CHURCH_QUESTS, churchRotationBlock } from '../../data/churchQuests'
import { createEquipmentInstance, RARITY_TIERS } from '../../data/equipment'
import { getMqTutorialHint } from '../../data/hints'
import {
  getQuestById,
  snapshotForQuest,
  isQuestCompleteState,
  isQuestExpired,
  questXpReward,
  QUEST_XP_REPEAT_MULT,
} from '../../data/quests'
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
      // ONB02/MQ-CHAIN01 — chaque palier principal enseigne une mécanique.
      const q = getQuestById(questId)
      if (q?.isMainQuest && q.mqStep) {
        const hint = getMqTutorialHint(q.mqStep)
        if (hint) get().triggerHint(hint)
      }
    }
  },

  // B5b/MQ-CHAIN01 — un palier principal est disponible si son prérequis est complété
  // et qu'il n'est ni actif ni déjà terminé.
  isMainQuestAvailable: (id) => {
    const q = getQuestById(id)
    if (!q?.isMainQuest) return false
    const { activeQuests = [], completedQuests = [] } = get().world
    if (activeQuests.includes(id) || completedQuests.includes(id)) return false
    return !q.requires || completedQuests.includes(q.requires)
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

  // QSV2-TIMED01 — retire les quêtes chronométrées expirées (échec → elles retombent
  // dans le pool, redevenant disponibles à la prochaine rotation).
  pruneExpiredQuests: () =>
    set((state) => {
      const active = state.world.activeQuests ?? []
      const expired = active.filter((id) => {
        const q = getQuestById(id)
        return q && isQuestExpired(q, state.world)
      })
      if (expired.length === 0) return state
      const progress = { ...(state.world.questProgress ?? {}) }
      for (const id of expired) delete progress[id]
      return {
        world: {
          ...state.world,
          activeQuests: active.filter((id) => !expired.includes(id)),
          questProgress: progress,
        },
      }
    }),

  completeQuest: (questId) => {
    let xpGain = 0
    set((state) => {
      const { activeQuests: active, completedQuests: completed } = state.world
      if (!active.includes(questId)) return state
      const quest = getQuestById(questId)
      if (!quest) return state
      // FIX-CHURCH-DRY01 — les actes de dévotion (église) sont RÉPÉTABLES : au lieu d'être exclus
      // à jamais, on stampe le bloc de rotation courant → re-proposables au bloc suivant.
      const isChurchQuest = !!CHURCH_QUESTS[questId]
      const churchDeeds = isChurchQuest
        ? {
            ...(state.world.churchDeeds ?? {}),
            [questId]: churchRotationBlock(state.world.dayCount),
          }
        : (state.world.churchDeeds ?? {})
      // FIX-QXP01 — XP de héros : plein la 1ʳᵉ fois, réduit sur re-complétion (quêtes répétables).
      const firstTime = !completed.includes(questId)
      xpGain = firstTime
        ? questXpReward(quest)
        : Math.round(questXpReward(quest) * QUEST_XP_REPEAT_MULT)
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

      // MQ-ELITETURN01 — remise d'élite : consomme les items rendus (ou l'arme rendue)
      // et escalade la rareté de l'arme signature (+1 par remise : rare → epic → …).
      const turnin = quest.objectives?.find((o) => o.type === 'elite_turnin')
      let eliteTurnins = state.meta.eliteTurnins ?? {}
      let eqRarity = r.equipment?.rarity
      if (turnin && r.equipment) {
        const prior = eliteTurnins[turnin.weaponTemplateId] ?? 0
        eqRarity = RARITY_TIERS[Math.min(1 + prior, RARITY_TIERS.length - 1)] // rare = index 1
        eliteTurnins = { ...eliteTurnins, [turnin.weaponTemplateId]: prior + 1 }
        const held = newResources[turnin.resourceId] ?? 0
        if (held >= turnin.count) {
          newResources[turnin.resourceId] = held - turnin.count // voie « 3× item rare »
        } else {
          const wi = newEquipment.findIndex((e) => e.templateId === turnin.weaponTemplateId)
          if (wi >= 0) newEquipment.splice(wi, 1) // voie « rendre l'arme »
        }
      }

      // Q09 — récompenses variées : équipement / ressources / stat
      const eqItem = r.equipment ? createEquipmentInstance(r.equipment.templateId, eqRarity) : null
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

      // MQ-CHAIN01 — un palier principal ouvre des nodes (localités / hunting spots).
      // Stocké dans world.unlockedNodes ; consommé par le gating/fog (B6).
      const newUnlockedNodes = [...(state.world.unlockedNodes ?? [])]
      if (quest.isMainQuest && quest.unlocks) {
        for (const nodeId of [...(quest.unlocks.locations ?? []), ...(quest.unlocks.spots ?? [])]) {
          if (!newUnlockedNodes.includes(nodeId)) newUnlockedNodes.push(nodeId)
        }
      }

      // Q07/Q09 — Toast récompense de quête
      const rewardParts = []
      if (xpGain) rewardParts.push(`+${xpGain} XP`)
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
        meta: { ...state.meta, eliteTurnins },
        world: {
          ...state.world,
          activeQuests: active.filter((q) => q !== questId),
          completedQuests: completed.includes(questId) ? completed : [...completed, questId],
          churchDeeds,
          unlockedZones: newUnlockedZones,
          unlockedNodes: newUnlockedNodes,
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
    })
    // FIX-QXP01 — octroi de l'XP hors du set (réutilise gainExp : level-up + hint gérés).
    if (xpGain > 0) get().gainExp(xpGain)
  },

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
