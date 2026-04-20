import { create } from 'zustand'
import { MONSTERS } from '../data/monsters'
import { QUESTS } from '../data/quests'

// ── État initial du héros ─────────────────────────────────────────────────────
const INITIAL_HERO = {
  name: 'The Wanderer',

  // Stats de base (Run 1)
  stats: {
    hp: 100,
    maxHp: 100,
    mana: 60,
    maxMana: 60,
    strength: 10,
    agility: 10,
    intelligence: 8,
    chance: 5,
    def: 5,
  },

  level: 1,
  exp: 0,
  expToNext: 100,

  // Skills (max 6 actifs, max 4 passifs)
  activeSkills: [],   // [{ skillId, level, xp, currentCooldown }]
  passiveSkills: [],  // [{ skillId, level, xp }]

  // Divinité liée
  deity: null,        // id de la divinité (null = sans dieu)
  deityBlessing: null,
  divineSkill: null,  // { skillId, level, xp }

  // Titres gagnés
  titles: [],         // ['Slayer of Eldenmoor', ...]

  // Équipement porté (null = slot vide)
  equipped: {
    weapon: null,
    helmet: null,
    armor:  null,
    boots:  null,
  },

  // Inventaire
  inventory: {
    resources: {},    // { resourceId: quantity }
    consumables: {},  // { resourceId: quantity }
    manaStones: [],   // [{ skillId, level, xp }] — skills non équipés
    equipment: [],    // [{ instanceId, templateId, name, slot, rarity, stats, sellPrice }]
    gold: 0,
  },

  // Progression Ignareth : compter les victoires par jour
  battleLog: [],           // [{ type: 'victory'|'defeat', day, turn }]
  combatEntryLog: [],      // [{ hpPercent, day }] — pour Sylvara

  // Infos du run
  runNumber: 1,
  deathCount: 0,
  reputationTokens: 0,     // jetons gagnés via quêtes
  adventurerRankTokens: 0, // jetons convertis en rang
}

// ── État initial du monde ─────────────────────────────────────────────────────
const INITIAL_WORLD = {
  currentZone: 'ashenvale',
  currentLocation: 'ironhaven', // ville/village où se trouve le héros
  currentHuntingSpot: null,     // spot de chasse actif (ashenvale_forest | thornmarsh | crumbled_ruins | barrow_hills)

  // Calendrier
  dayCount: 1,
  tickCount: 0,      // tick actuel dans la journée (0–23)
  isNight: false,

  // Donjons actifs par zone
  dungeons: {
    ashenvale: {
      active: true,
      cleared: false,
      position: 'east', // position aléatoire (cosmétique)
      discovered: false, // marqué "?" jusqu'à ce que le héros s'approche
    },
    grimspire: {
      active: true,
      cleared: false,
      position: 'north',
      discovered: false,
    },
  },

  // Kill count par type de monstre (pour débloquer l'idle)
  monsterKillCounts: {}, // { monsterId: count }

  // Toggles idle par monstre
  idleToggles: {},       // { monsterId: boolean }

  // État de l'idle global
  isIdleActive: false,
  idleTargetMonster: null,
  idleLog: [],           // [{ text, type, timestamp }] — 10 dernières entrées

  // Villages générés aléatoirement (buildings présents dans chaque village)
  generatedVillages: {}, // { villageId: { buildings: [...] } }

  // Demon Lord
  demonLordDefeated: false,
  demonLordResurrectionCounter: 0,

  // Quêtes
  activeQuests: [],      // ['questId', ...]
  completedQuests: [],   // ['questId', ...]
}

// ── État méta (persiste entre les runs) ─────────────────────────────────────
const INITIAL_META = {
  totalDeaths: 0,
  totalPlaytime: 0,
  demonLordKills: 0,
  titlesEarned: [],
  totalRepTokensEarned: 0,

  // Héritage en attente (rempli à la mort, consommé à la renaissance)
  pendingInheritance: null, // { stat, activeSkill, passiveSkill, bonuses }

  // Résumé du dernier run (pour l'écran post-mortem)
  lastRunSummary: null,

  // Liens divins par univers (mémorisés même après la mort)
  divineBonds: {}, // { universeId: deityId }
}

// ── Helpers purs (hors store) ─────────────────────────────────────────────────

/**
 * Applique un ou plusieurs level-ups à partir de l'exp courante.
 * Retourne les nouvelles valeurs sans muter l'objet original.
 */
function applyLevelUps(exp, level, expToNext, stats) {
  let levelsGained = 0
  while (exp >= expToNext) {
    exp -= expToNext
    level += 1
    expToNext = Math.round(expToNext * 1.5)
    const newMaxHp = Math.round(stats.maxHp * 1.10)
    const newMaxMana = Math.round(stats.maxMana * 1.10)
    stats = {
      ...stats,
      maxHp: newMaxHp, hp: newMaxHp,
      maxMana: newMaxMana, mana: newMaxMana,
      strength: stats.strength + 1,
      intelligence: stats.intelligence + 1,
      def: stats.def + 1,
      agility: stats.agility + 1,
    }
    levelsGained++
  }
  return { exp, level, expToNext, stats, levelsGained }
}

// ── Store Zustand ─────────────────────────────────────────────────────────────
export const useGameStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  hero: { ...INITIAL_HERO },
  world: { ...INITIAL_WORLD },
  meta: { ...INITIAL_META },

  // Écran actuel
  currentScreen: 'world_map', // 'world_map' | 'combat' | 'hero_sheet' | 'inventory' | 'safe_zone' | 'post_mortem' | 'gods_shop' | 'transmigration' | 'divine_call' | 'quest_board'

  // Combat en cours
  activeCombat: null, // { enemies: [...], turn: 0, log: [...], phase: 'player'|'enemy' }

  // Divine Call en attente
  pendingDivineCall: null, // { deityId } — déclenche l'écran d'éveil

  // Level up en attente d'affichage (nombre de niveaux gagnés non confirmés)
  pendingLevelUp: 0,

  // ── Naviguer entre écrans ──────────────────────────────────────────────────
  setScreen: (screen) => set({ currentScreen: screen }),

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
    })),

  equipItem: (instanceId) =>
    set((state) => {
      const item = state.hero.inventory.equipment.find(e => e.instanceId === instanceId)
      if (!item) return state

      // Déséquiper l'item actuellement dans ce slot (retour inventaire)
      const currentEquipped = state.hero.equipped[item.slot]
      const newInventory = state.hero.inventory.equipment.filter(e => e.instanceId !== instanceId)
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
      const item = state.hero.inventory.equipment.find(e => e.instanceId === instanceId)
      if (!item) return state
      return {
        hero: {
          ...state.hero,
          inventory: {
            ...state.hero.inventory,
            equipment: state.hero.inventory.equipment.filter(e => e.instanceId !== instanceId),
            gold: state.hero.inventory.gold + item.sellPrice,
          },
        },
      }
    }),

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
    })),

  equipActiveSkill: (skillData) =>
    set((state) => {
      if (state.hero.activeSkills.length >= 6) return state
      return {
        hero: {
          ...state.hero,
          activeSkills: [...state.hero.activeSkills, { ...skillData, currentCooldown: 0 }],
          inventory: {
            ...state.hero.inventory,
            manaStones: state.hero.inventory.manaStones.filter(
              (s) => s.skillId !== skillData.skillId
            ),
          },
        },
      }
    }),

  equipPassiveSkill: (skillData) =>
    set((state) => {
      if (state.hero.passiveSkills.length >= 4) return state
      return {
        hero: {
          ...state.hero,
          passiveSkills: [...state.hero.passiveSkills, skillData],
          inventory: {
            ...state.hero.inventory,
            manaStones: state.hero.inventory.manaStones.filter(
              (s) => s.skillId !== skillData.skillId
            ),
          },
        },
      }
    }),

  unequipActiveSkill: (skillId) =>
    set((state) => {
      const skill = state.hero.activeSkills.find(s => s.skillId === skillId)
      if (!skill) return state
      return { hero: { ...state.hero,
        activeSkills: state.hero.activeSkills.filter(s => s.skillId !== skillId),
        inventory: { ...state.hero.inventory, manaStones: [...state.hero.inventory.manaStones, skill] },
      }}
    }),

  unequipPassiveSkill: (skillId) =>
    set((state) => {
      const skill = state.hero.passiveSkills.find(s => s.skillId === skillId)
      if (!skill) return state
      return { hero: { ...state.hero,
        passiveSkills: state.hero.passiveSkills.filter(s => s.skillId !== skillId),
        inventory: { ...state.hero.inventory, manaStones: [...state.hero.inventory.manaStones, skill] },
      }}
    }),

  gainSkillXp: (skillId, xpAmount) =>
    set((state) => {
      const updateSkillXp = (skills) =>
        skills.map((s) => {
          if (s.skillId !== skillId) return s
          const newXp = s.xp + xpAmount
          const xpNeeded = s.level === 1 ? 20 : 50
          if (newXp >= xpNeeded && s.level < 3) {
            return { ...s, xp: newXp - xpNeeded, level: s.level + 1 }
          }
          return { ...s, xp: newXp }
        })

      return {
        hero: {
          ...state.hero,
          activeSkills: updateSkillXp(state.hero.activeSkills),
          passiveSkills: updateSkillXp(state.hero.passiveSkills),
        },
      }
    }),

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

  // ── Calendrier & monde ────────────────────────────────────────────────────

  sleep: () =>
    set((state) => {
      // Récupération complète + spawn nouveau donjon
      const newDungeons = { ...state.world.dungeons }
      Object.keys(newDungeons).forEach((zoneId) => {
        if (newDungeons[zoneId].cleared) {
          newDungeons[zoneId] = {
            active: true,
            cleared: false,
            position: ['north', 'south', 'east', 'west'][Math.floor(Math.random() * 4)],
            discovered: false,
          }
        }
      })

      return {
        hero: {
          ...state.hero,
          stats: {
            ...state.hero.stats,
            hp: state.hero.stats.maxHp,
            mana: state.hero.stats.maxMana,
          },
        },
        world: {
          ...state.world,
          tickCount: 0,
          dayCount: state.world.dayCount + 1,
          isNight: false,
          dungeons: newDungeons,
        },
      }
    }),

  // ── Kill count & idle ─────────────────────────────────────────────────────
  recordKill: (monsterId) =>
    set((state) => {
      const current = state.world.monsterKillCounts[monsterId] || 0
      return {
        world: {
          ...state.world,
          monsterKillCounts: {
            ...state.world.monsterKillCounts,
            [monsterId]: current + 1,
          },
        },
      }
    }),

  toggleIdle: (monsterId) =>
    set((state) => {
      const kills = state.world.monsterKillCounts[monsterId] || 0
      if (kills < 5) return state // pas encore débloqué
      const current = state.world.idleToggles[monsterId] || false
      return {
        world: {
          ...state.world,
          idleToggles: { ...state.world.idleToggles, [monsterId]: !current },
          isIdleActive: !current,
          idleTargetMonster: !current ? monsterId : null,
        },
      }
    }),

  addIdleLog: (entry) =>
    set((state) => {
      const newLog = [entry, ...state.world.idleLog].slice(0, 10)
      return { world: { ...state.world, idleLog: newLog } }
    }),

  // ── Combat ────────────────────────────────────────────────────────────────
  startCombat: (enemies) =>
    set({
      activeCombat: {
        enemies,
        turn: 0,
        log: [],
        phase: 'player',
        isOver: false,
        result: null, // 'victory' | 'defeat' | 'fled'
      },
      currentScreen: 'combat',
    }),

  endCombat: (result) =>
    set((state) => {
      // Enregistrer dans le battleLog pour les conditions d'éveil
      const entry = { type: result, day: state.world.dayCount, turn: state.world.tickCount }
      const newBattleLog = [...state.hero.battleLog, entry].slice(-100)

      return {
        activeCombat: null,
        currentScreen: 'world_map',
        hero: { ...state.hero, battleLog: newBattleLog },
      }
    }),

  addCombatLog: (message, type = 'info') =>
    set((state) => {
      if (!state.activeCombat) return state
      const newLog = [...state.activeCombat.log, { message, type }].slice(-20)
      return { activeCombat: { ...state.activeCombat, log: newLog } }
    }),

  // ── Enregistrer l'entrée en combat (pour Sylvara) ─────────────────────────
  recordCombatEntry: () =>
    set((state) => {
      const hpPercent = state.hero.stats.hp / state.hero.stats.maxHp
      const entry = { hpPercent, day: state.world.dayCount }
      const newLog = [...state.hero.combatEntryLog, entry].slice(-20)
      return { hero: { ...state.hero, combatEntryLog: newLog } }
    }),

  // ── Système divin ─────────────────────────────────────────────────────────
  triggerDivineCall: (deityId) =>
    set({ pendingDivineCall: { deityId }, currentScreen: 'divine_call' }),

  acceptDeity: (deityId, chosenSkillId) =>
    set((state) => ({
      hero: {
        ...state.hero,
        deity: deityId,
        divineSkill: { skillId: chosenSkillId, level: 1, xp: 0 },
      },
      meta: {
        ...state.meta,
        divineBonds: { ...state.meta.divineBonds, medieval_fantasy: deityId },
      },
      pendingDivineCall: null,
      currentScreen: 'world_map',
    })),

  refuseDeity: () =>
    set({
      pendingDivineCall: null,
      currentScreen: 'world_map',
    }),

  // ── Mort & transmigration ─────────────────────────────────────────────────
  heroDeath: (cause = 'Unknown enemy') =>
    set((state) => {
      const { hero, world } = state
      const summary = {
        cause,
        zone: world.currentZone,
        day: world.dayCount,
        level: hero.level,
        skills: [...hero.activeSkills, ...hero.passiveSkills],
        stats: { ...hero.stats },
        totalKills: Object.values(world.monsterKillCounts).reduce((a, b) => a + b, 0),
        reputationTokens: hero.reputationTokens,
      }

      return {
        meta: {
          ...state.meta,
          totalDeaths: state.meta.totalDeaths + 1,
          lastRunSummary: summary,
          totalRepTokensEarned: state.meta.totalRepTokensEarned + hero.reputationTokens,
        },
        activeCombat: null,
        currentScreen: 'post_mortem',
      }
    }),

  // Confirmer l'héritage et passer à la boutique des dieux
  confirmInheritance: (chosenStat, chosenActiveSkill, chosenPassiveSkill) =>
    set((state) => ({
      meta: {
        ...state.meta,
        pendingInheritance: { stat: chosenStat, activeSkill: chosenActiveSkill, passiveSkill: chosenPassiveSkill, bonuses: [] },
      },
      currentScreen: 'gods_shop',
    })),

  // Appliquer la renaissance après la boutique des dieux
  applyTransmigration: (shopPurchases) =>
    set((state) => {
      const { pendingInheritance } = state.meta
      if (!pendingInheritance) return state

      // Recalculer les stats de base avec la stat héritée
      const newStats = { ...INITIAL_HERO.stats }
      newStats[pendingInheritance.stat] = Math.round(
        INITIAL_HERO.stats[pendingInheritance.stat] * 1.10 // +10% sur la stat héritée
      )
      newStats.hp = newStats.maxHp = 100
      newStats.mana = newStats.maxMana = 60

      // Construire les skills hérités
      const inheritedActive = pendingInheritance.activeSkill
        ? [{ ...pendingInheritance.activeSkill, currentCooldown: 0 }]
        : []
      const inheritedPassive = pendingInheritance.passiveSkill
        ? [pendingInheritance.passiveSkill]
        : []

      // Ajouter les bonus d'achat boutique
      const extraSkills = shopPurchases.extraSkills || []
      const allActive = [...inheritedActive, ...extraSkills.filter((s) => s.type === 'active')]
      const allPassive = [...inheritedPassive, ...extraSkills.filter((s) => s.type === 'passive')]

      return {
        hero: {
          ...INITIAL_HERO,
          stats: newStats,
          activeSkills: allActive,
          passiveSkills: allPassive,
          runNumber: state.hero.runNumber + 1,
          deathCount: state.hero.deathCount + 1,
          reputationTokens: 0,
        },
        world: { ...INITIAL_WORLD },
        meta: {
          ...state.meta,
          pendingInheritance: null,
        },
        currentScreen: 'world_map',
      }
    }),

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

  // ── Idle tick ─────────────────────────────────────────────────────────────
  processIdleTick: () =>
    set((state) => {
      if (!state.world.isIdleActive || !state.world.idleTargetMonster) return state

      const monsterId = state.world.idleTargetMonster
      const monster = MONSTERS[monsterId]
      if (!monster) return state

      // Auto-disable si HP < 20% avant même de commencer
      const currentHp = state.hero.stats.hp
      const maxHp = state.hero.stats.maxHp
      if (currentHp / maxHp < 0.2) {
        const entry = { text: `[Idle] HP trop bas — combat suspendu.`, type: 'info', timestamp: Date.now() }
        return {
          world: {
            ...state.world,
            isIdleActive: false,
            idleTargetMonster: null,
            idleLog: [entry, ...state.world.idleLog].slice(0, 10),
          },
        }
      }

      // Vérifier si le héros peut gagner (dégâts nets > 0)
      const heroStr = state.hero.stats.strength
      const monDef = monster.baseStats.def
      if (heroStr - Math.floor(monDef / 2) <= 0) {
        const entry = { text: `Too weak to fight ${monster.name}.`, type: 'info', timestamp: Date.now() }
        return { world: { ...state.world, idleLog: [entry, ...state.world.idleLog].slice(0, 10) } }
      }

      // Calcul des drops
      const chanceBonus = Math.max(0, (state.hero.stats.chance - 5) * 0.005)
      const newResources = { ...state.hero.inventory.resources }
      let anyDropped = false

      monster.resourceDrops.forEach(drop => {
        if (Math.random() < drop.chance + chanceBonus) {
          anyDropped = true
          const qty = drop.qty.min + Math.floor(Math.random() * (drop.qty.max - drop.qty.min + 1))
          newResources[drop.resourceId] = (newResources[drop.resourceId] || 0) + qty
        }
      })

      if (!anyDropped && monster.resourceDrops.length > 0) {
        const drop = monster.resourceDrops[0]
        newResources[drop.resourceId] = (newResources[drop.resourceId] || 0) + drop.qty.min
      }

      const gold = monster.goldReward.min +
        Math.floor(Math.random() * (monster.goldReward.max - monster.goldReward.min + 1))

      const xp = monster.expReward ?? 10
      const newKillCount = (state.world.monsterKillCounts[monsterId] || 0) + 1

      // Dégâts reçus du monstre
      const monAtk = monster.baseStats.atk ?? monster.baseStats.strength ?? 5
      const heroDef = state.hero.stats.def
      const baseDamage = Math.max(1, monAtk - Math.floor(heroDef / 2))
      const damageTaken = Math.round(baseDamage * (0.9 + Math.random() * 0.2))
      const newHp = Math.max(1, currentHp - damageTaken)

      const { exp, level, expToNext, stats: s, levelsGained } = applyLevelUps(
        state.hero.exp + xp,
        state.hero.level,
        state.hero.expToNext,
        { ...state.hero.stats, hp: newHp },
      )

      const isLowHp = s.hp / s.maxHp < 0.2
      const levelUpStr = levelsGained > 0 ? ` ★ LEVEL UP! (${level})` : ''
      const entry = {
        text: `[Idle] Slew ${monster.name} · +${gold}g · +${xp}xp${levelUpStr}`,
        type: levelsGained > 0 ? 'drop' : 'kill',
        timestamp: Date.now(),
      }

      return {
        hero: {
          ...state.hero,
          exp, level, expToNext, stats: s,
          inventory: {
            ...state.hero.inventory,
            resources: newResources,
            gold: state.hero.inventory.gold + gold,
          },
        },
        pendingLevelUp: state.pendingLevelUp + levelsGained,
        world: {
          ...state.world,
          isIdleActive: isLowHp ? false : state.world.isIdleActive,
          idleTargetMonster: isLowHp ? null : state.world.idleTargetMonster,
          monsterKillCounts: {
            ...state.world.monsterKillCounts,
            [monsterId]: newKillCount,
          },
          idleLog: [entry, ...state.world.idleLog].slice(0, 10),
        },
      }
    }),

  // ── Tick calendrier ───────────────────────────────────────────────────────
  advanceTick: () =>
    set((state) => {
      const newTick = state.world.tickCount + 1
      if (newTick >= 24) {
        return { world: { ...state.world, tickCount: 0, dayCount: state.world.dayCount + 1 } }
      }
      return { world: { ...state.world, tickCount: newTick } }
    }),

  // ── Système de quêtes ────────────────────────────────────────────────────
  startQuest: (questId) =>
    set((state) => {
      const { activeQuests, completedQuests } = state.world
      if (completedQuests.includes(questId)) return state
      if (activeQuests.includes(questId)) return state
      return { world: { ...state.world, activeQuests: [...activeQuests, questId] } }
    }),

  isQuestComplete: (questId) => {
    const { hero, world } = get()
    const quest = QUESTS[questId]
    if (!quest) return false
    return quest.objectives.every((obj) => {
      if (obj.type === 'kill') return (world.monsterKillCounts[obj.monsterId] ?? 0) >= obj.count
      if (obj.type === 'level') return hero.level >= obj.targetLevel
      return false
    })
  },

  completeQuest: (questId) =>
    set((state) => {
      const { activeQuests: active, completedQuests: completed } = state.world
      if (!active.includes(questId)) return state
      const quest = QUESTS[questId]
      if (!quest) return state
      let newManaStones = [...state.hero.inventory.manaStones]
      let newGold = state.hero.inventory.gold
      if (quest.reward.skill) {
        newManaStones.push({ skillId: quest.reward.skill.skillId, level: 1, xp: 0 })
      }
      if (quest.reward.gold) newGold += quest.reward.gold
      const repTokens = quest.reward.reputationTokens ?? 1
      return {
        world: {
          ...state.world,
          activeQuests: active.filter((q) => q !== questId),
          completedQuests: [...completed, questId],
        },
        hero: {
          ...state.hero,
          reputationTokens: state.hero.reputationTokens + repTokens,
          inventory: { ...state.hero.inventory, manaStones: newManaStones, gold: newGold },
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

  // ── Persistence localStorage ──────────────────────────────────────────────
  saveGame: () => {
    const { hero, world, meta } = get()
    localStorage.setItem('roguelite_save', JSON.stringify({ hero, world, meta }))
  },

  loadGame: () => {
    const raw = localStorage.getItem('roguelite_save')
    if (!raw) return false
    try {
      const { hero, world, meta } = JSON.parse(raw)

      // ── Migration : normaliser les anciens formats de sauvegarde ──────
      const migratedWorld = {
        ...INITIAL_WORLD,   // valeurs par défaut pour les champs nouveaux
        ...world,
        // completedQuests était un nombre (0) dans l'ancienne version
        completedQuests: Array.isArray(world.completedQuests) ? world.completedQuests : [],
        activeQuests: Array.isArray(world.activeQuests) ? world.activeQuests : [],
        // currentHuntingSpot absent des anciennes sauvegardes
        currentHuntingSpot: world.currentHuntingSpot ?? null,
      }

      set({ hero, world: migratedWorld, meta })
      return true
    } catch {
      return false
    }
  },

  // ── Donjons ───────────────────────────────────────────────────────────────
  discoverDungeon: (zoneId) =>
    set((state) => {
      const dungeon = state.world.dungeons[zoneId]
      if (!dungeon) return state
      return {
        world: {
          ...state.world,
          dungeons: {
            ...state.world.dungeons,
            [zoneId]: { ...dungeon, discovered: true },
          },
        },
      }
    }),

  clearDungeon: (zoneId) =>
    set((state) => {
      const dungeon = state.world.dungeons[zoneId]
      if (!dungeon) return state
      return {
        world: {
          ...state.world,
          dungeons: {
            ...state.world.dungeons,
            [zoneId]: { ...dungeon, cleared: true },
          },
          demonLordDefeated: zoneId === 'grimspire' ? true : state.world.demonLordDefeated,
          demonLordResurrectionCounter: zoneId === 'grimspire'
            ? state.world.demonLordResurrectionCounter + 1
            : state.world.demonLordResurrectionCounter,
        },
        meta: {
          ...state.meta,
          demonLordKills: zoneId === 'grimspire' ? state.meta.demonLordKills + 1 : state.meta.demonLordKills,
        },
      }
    }),

  resetGame: () =>
    set({
      hero: { ...INITIAL_HERO },
      world: { ...INITIAL_WORLD },
      meta: { ...INITIAL_META },
      currentScreen: 'world_map',
      activeCombat: null,
      pendingDivineCall: null,
    }),
}))
