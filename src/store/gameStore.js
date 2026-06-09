import { create } from 'zustand'
import { MONSTERS } from '../data/monsters'
import { QUESTS, getQuestById, heroSkillLevels } from '../data/quests'
import { SKILLS, SKILL_MAX_LEVEL, skillXpForLevel } from '../data/skills'
import { skillBuyPrice, skillSellPrice } from '../data/academy'
import { ACHIEVEMENTS, newlyUnlocked } from '../data/achievements'
import { VIGOR_MAX, VIGOR_COST, applyVigorCost } from '../engine/vigor'
import { AURA, countWithinDays } from '../engine/aura'
import { RESOURCES } from '../data/resources'
import { createEquipmentInstance } from '../data/equipment'
import { DEITIES, applyDeityBlessing } from '../data/deities'
import { ZONES, ZONE_ORDER, getMonsterLevel } from '../data/zones'
import { getInformant } from '../data/informants'
import { isEnemyTooStrong, buildEnemy } from '../engine/combat'
import { useToastStore } from './toastStore'
import { removeOneManaStone } from '../utils/manaStones'
import { addDebuff, tickDebuffsOneDay } from '../utils/debuffs'
import { TITLES } from '../data/titles'
import { pickGluttonyStat, gluttonyAbsorbAmount } from '../engine/gluttony'
import { elapsedIdleTicks, canGrind, computeOfflineGains } from '../engine/offlineProgress'

// ── TECH02 — Save schema versioning ──────────────────────────────────────────
// Incrémenter SAVE_VERSION chaque fois qu'un changement de structure persisté
// nécessite une migration. Ajouter la migration correspondante dans `runMigrations`.
export const SAVE_VERSION = 2

// ── État initial du héros ─────────────────────────────────────────────────────
// (les migrations sont définies plus bas, après les INITIAL_*)
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

  // STA01 — Vigueur (Fatigue) : 100 = frais, décroît avec l'effort, restaurée au sommeil.
  vigor: 100,

  // STA02 — Aura (mult. de dégâts permanent) + tracking d'usage de skills.
  aura: 0,            // 0 = non débloquée
  skillUseCount: 0,   // total de skills utilisés (pour le gain +1/10)
  skillUseLog: [],    // [dayCount, …] pour la fenêtre glissante de déblocage (15 en <4j)

  // STA03 — Concentration (qualité de craft, 0-150).
  concentration: 0,

  // Skills (max 6 actifs, max 4 passifs)
  activeSkills: [],   // [{ skillId, level, xp, currentCooldown }]
  passiveSkills: [],  // [{ skillId, level, xp }]

  // Divinité liée
  deity: null,        // id de la divinité (null = sans dieu)
  deityBlessing: null,
  divineSkill: null,  // { skillId, level, xp }

  // Titres gagnés
  titles: [],         // ['Slayer of Eldenmoor', ...]

  // CRF01 — Debuffs passifs actifs (malus temporaires en jours, ou permanents)
  activeDebuffs: [],  // [{ debuffId, permanent, duration: { type: 'days', remaining } }]

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

  // Flag : le joueur a-t-il choisi son nom ? (faux = CharacterCreation à afficher)
  heroNamed: false,

  // DV07 — Le joueur a-t-il refusé une divinité ce run ? (→ bonus solo T11)
  soloRun: false,
}

// ── État initial du monde ─────────────────────────────────────────────────────
const INITIAL_WORLD = {
  currentZone: 'ashenvale',
  currentLocation: 'ironhaven', // ville/village où se trouve le héros
  currentHuntingSpot: null,     // spot de chasse actif (ashenvale_forest | thornmarsh | crumbled_ruins | wildmere_hills)
  currentNode: 'ironhaven',     // TRV01 — position du héros sur la World Map (node)

  // PROG02 — zones débloquées (déblocage explicite via quête/info ; auto-déblocage
  // par niveau/kills reste géré par isZoneUnlocked). Nouveau run = zone de départ seule.
  unlockedZones: ['ashenvale'],

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

  // Q04 — spots de chasse déjà visités (pour les quêtes d'exploration)
  visitedSpots: [], // [spotId, ...]

  // Toggles idle par monstre
  idleToggles: {},       // { monsterId: boolean }

  // État de l'idle global
  isIdleActive: false,
  idleTargetMonster: null,
  idleHpThreshold: 0.2,  // I08 — seuil de PV (fraction) sous lequel l'idle se coupe automatiquement
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
  // M02 — Compteur Demon Lords kills par univers : { [universeId]: count }
  // Préparation X08 multi-univers. Pour le POC : un seul univers 'medieval_fantasy'.
  demonLordKills: {},
  titlesEarned: [],
  totalRepTokensEarned: 0,

  // W03 — Flag levé si Malachar killed durant ce run (consommé au PostMortem)
  malacharDefeatedThisRun: false,

  // TUT02/TUT03 — Hints d'onboarding déjà vus (ne se réaffichent jamais)
  seenHints: [],        // ['idle_unlock', ...]
  firstDeathSeen: false, // TUT03 — surbrillance PostMortem au 1er run

  // ACH01 — accomplissements débloqués (persistants entre runs ; bonus de stat permanents)
  achievements: [],     // [achievementId, ...]

  // Q05 — nombre de crafts réussis (pour les quêtes de craft)
  craftCount: 0,

  // Héritage en attente (rempli à la mort, consommé à la renaissance)
  pendingInheritance: null, // { stat, activeSkill, passiveSkill, bonuses }

  // Résumé du dernier run (pour l'écran post-mortem)
  lastRunSummary: null,

  // Liens divins par univers (mémorisés même après la mort)
  divineBonds: {}, // { universeId: deityId }

  // GLT01 — Gluttony : boosts de stats permanents cumulés (appliqués à chaque run)
  permanentStatBoosts: {}, // { strength: N, ... }
  gluttonyLastUsed: null,  // jour de la dernière absorption (cooldown 5 jours)

  // IDLE-OFF — progression hors-ligne
  lastSeen: null,        // timestamp (ms) de la dernière sauvegarde
  offlineSummary: null,  // { monsterName, kills, gold, xp, resources } — affiché au retour puis effacé

  // SET01 — réglages joueur (persistés avec meta)
  settings: { animations: true },

  // TAV01 — infos achetées aux informateurs (persistant entre runs)
  knownInfo: [], // [infoId, ...]
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

// ── TECH02 — Migrations save (séquentielles) ─────────────────────────────────

/**
 * Migration v1 → v2 : structure complète des champs hero/world/meta.
 * Reprend toute la logique de robustesse anti-crash sur vieilles saves.
 */
function migrateV1ToV2(save) {
  const { hero = {}, world = {}, meta = {} } = save

  // ── World ──
  const migratedWorld = {
    ...INITIAL_WORLD,
    ...world,
    completedQuests: Array.isArray(world.completedQuests) ? world.completedQuests : [],
    activeQuests: Array.isArray(world.activeQuests) ? world.activeQuests : [],
    currentHuntingSpot: world.currentHuntingSpot ?? null,
    monsterKillCounts: world.monsterKillCounts ?? {},
    idleToggles: world.idleToggles ?? {},
    idleHpThreshold: world.idleHpThreshold ?? 0.2, // I08
    // PROG02 — migration : une save antérieure (sans le champ) a tout débloqué (pas de régression).
    unlockedZones: Array.isArray(world.unlockedZones) ? world.unlockedZones : [...ZONE_ORDER],
    idleLog: Array.isArray(world.idleLog) ? world.idleLog : [],
    generatedVillages: world.generatedVillages ?? {},
    dungeons: world.dungeons ?? { ...INITIAL_WORLD.dungeons },
    currentNode: world.currentNode ?? world.currentLocation ?? 'ironhaven', // TRV01
  }

  // ── Hero ──
  const inventory = hero.inventory ?? {}
  const migratedInventory = {
    resources:   inventory.resources   ?? {},
    consumables: inventory.consumables ?? {},
    manaStones:  Array.isArray(inventory.manaStones) ? inventory.manaStones : [],
    equipment:   Array.isArray(inventory.equipment)  ? inventory.equipment  : [],
    gold:        inventory.gold ?? 0,
  }
  const migratedEquipped = {
    weapon: null, helmet: null, armor: null, boots: null,
    ...(hero.equipped ?? {}),
  }

  // Migration DV02 rétroactive : si divineSkill existe mais pas dans activeSkills, l'ajouter
  const baseActive = Array.isArray(hero.activeSkills) ? hero.activeSkills : []
  const divineInActive = hero.divineSkill && !baseActive.some(s => s.skillId === hero.divineSkill.skillId)
  const migratedActiveSkills = divineInActive && baseActive.length < 6
    ? [...baseActive, hero.divineSkill]
    : baseActive

  const migratedHero = {
    ...INITIAL_HERO,
    ...hero,
    heroNamed: hero.heroNamed ?? (hero.name && hero.name !== 'The Wanderer' ? true : false),
    reputationTokens: hero.reputationTokens ?? 0,
    inventory: migratedInventory,
    equipped: migratedEquipped,
    activeSkills: migratedActiveSkills,
    passiveSkills: Array.isArray(hero.passiveSkills) ? hero.passiveSkills : [],
    battleLog: Array.isArray(hero.battleLog) ? hero.battleLog : [],
    combatEntryLog: Array.isArray(hero.combatEntryLog) ? hero.combatEntryLog : [],
    titles: Array.isArray(hero.titles) ? hero.titles : [],
    activeDebuffs: Array.isArray(hero.activeDebuffs) ? hero.activeDebuffs : [], // CRF01
  }

  // ── Meta ──
  const migratedMeta = {
    ...INITIAL_META,
    ...meta,
    divineBonds: meta.divineBonds ?? {},
    titlesEarned: Array.isArray(meta.titlesEarned) ? meta.titlesEarned : [],
    permanentStatBoosts: meta.permanentStatBoosts ?? {}, // GLT01
    gluttonyLastUsed: meta.gluttonyLastUsed ?? null,      // GLT01
  }

  return { hero: migratedHero, world: migratedWorld, meta: migratedMeta, saveVersion: 2 }
}

/**
 * Backfill IDEMPOTENT des champs par défaut, appliqué à CHAQUE chargement quelle que
 * soit la version de la save. Indispensable car les migrations sont *version-gated* :
 * une save déjà à la version courante (ex. v2) qui a été écrite AVANT l'ajout d'un champ
 * `meta`/`world`/`hero` ne repasse jamais par la migration et se retrouve avec ce champ
 * `undefined` → crash à la première lecture non défensive.
 *
 * Cas réel corrigé : une save v2 sans `meta.seenHints` faisait throw `recordKill` au 5ᵉ
 * kill (`state.meta.seenHints.includes(...)`) → compteurs de kills/quêtes bloqués + (avant
 * le try/catch de handleVictory) combat figé. Le merge superficiel ré-injecte tout champ
 * de premier niveau manquant SANS écraser les données existantes de la save.
 */
// MON01 — renommages d'ids de spots/nodes (decision 3 : id renommé partout). On remappe
// les références persistées des vieilles saves pour qu'elles pointent toujours sur un spot
// valide (sinon ZoneView/WorldMap casseraient sur un id disparu).
const SPOT_ID_REMAP = { barrow_hills: 'wildmere_hills' }

export function normalizeSave(save) {
  if (!save || typeof save !== 'object') return save
  const world = { ...INITIAL_WORLD, ...(save.world ?? {}) }
  // Remap des ids de spot/node renommés
  if (SPOT_ID_REMAP[world.currentHuntingSpot]) world.currentHuntingSpot = SPOT_ID_REMAP[world.currentHuntingSpot]
  if (SPOT_ID_REMAP[world.currentNode]) world.currentNode = SPOT_ID_REMAP[world.currentNode]
  return {
    ...save,
    hero: { ...INITIAL_HERO, ...(save.hero ?? {}) },
    world,
    meta: {
      ...INITIAL_META,
      ...(save.meta ?? {}),
      // settings est imbriqué → fusion explicite pour ne pas perdre les sous-clés par défaut
      settings: { ...INITIAL_META.settings, ...(save.meta?.settings ?? {}) },
    },
  }
}

/**
 * Applique toutes les migrations nécessaires en séquence pour amener
 * une save à la version courante (SAVE_VERSION).
 */
export function runMigrations(save) {
  let current = save
  const fromVersion = current.saveVersion ?? 1  // pas de saveVersion = v1 (legacy)

  if (fromVersion < 2) current = migrateV1ToV2(current)
  // Ajouter les futures migrations ici :
  // if (fromVersion < 3) current = migrateV2ToV3(current)

  // Filet final : backfill des champs par défaut manquants, toutes versions confondues.
  return normalizeSave(current)
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

  // S04 — Level-ups de skills récents (consommés par Combat.jsx pour afficher une notif)
  recentSkillLevelUps: [], // [{ id, skillId, fromLevel, toLevel, timestamp }]

  // TECH03 — Flag levé si le dernier saveGame a échoué (quota localStorage dépassé, etc.)
  saveQuotaExceeded: false,

  // UX05 — Flag levé à chaque drop de loot (combat/idle), reset au passage sur Inventory
  unseenLoot: false,

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

  // CAL01 — Prier à l'église : restaure 40% HP/mana ET consomme 1 tick (rollover si tickCount=23)
  prayAtChurch: () =>
    set((state) => {
      const { hp, maxHp, mana, maxMana } = state.hero.stats
      const newHp = Math.min(hp + Math.round(maxHp * 0.40), maxHp)
      const newMana = Math.min(mana + Math.round(maxMana * 0.40), maxMana)
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
    set((state) => ({ hero: { ...state.hero, vigor: applyVigorCost(state.hero.vigor ?? VIGOR_MAX, amount) } })),
  restoreVigor: () =>
    set((state) => ({ hero: { ...state.hero, vigor: VIGOR_MAX } })),

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
          useToastStore.getState().addToast('Your Aura awakens — your blows strike harder! (+15 Aura)', 'levelup', 4000)
        }
      } else if (Math.floor(count / AURA.gainPerUses) > Math.floor((count - 1) / AURA.gainPerUses)) {
        aura += 1
      }
      return { hero: { ...state.hero, skillUseLog: log, skillUseCount: count, aura } }
    }),

  // STA02/TRA01 — débloque/ajoute de l'Aura directement (entraînement chez un maître)
  grantAura: (amount) =>
    set((state) => ({ hero: { ...state.hero, aura: Math.max(state.hero.aura ?? 0, 0) + amount } })),

  // STA03 — gagne de la Concentration (clampée 0-150)
  gainConcentration: (amount) =>
    set((state) => ({ hero: { ...state.hero, concentration: Math.min(150, Math.max(0, (state.hero.concentration ?? 0) + amount)) } })),

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
      hero: { ...state.hero, inventory: { ...state.hero.inventory, consumables: { ...state.hero.inventory.consumables, [bookId]: owned - 1 } } },
    }))
    const { stat, amount } = eff
    if (stat === 'concentration') get().gainConcentration(amount)
    else if (stat === 'aura') get().grantAura(amount)
    else {
      // stat permanente (intelligence, strength…) → appliquée + mémorisée (réappliquée chaque run)
      set((state) => ({
        hero: { ...state.hero, stats: { ...state.hero.stats, [stat]: (state.hero.stats[stat] ?? 0) + amount } },
        meta: { ...state.meta, permanentStatBoosts: { ...(state.meta.permanentStatBoosts ?? {}), [stat]: ((state.meta.permanentStatBoosts ?? {})[stat] ?? 0) + amount } },
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
      unseenLoot: true,  // UX05
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
    useToastStore.getState().addToast(`Learned ${SKILLS[skillId]?.name ?? skillId} · −${price} 🪙`, 'info')
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
          inventory: { ...state.hero.inventory, gold: state.hero.inventory.gold + price, manaStones: newStones },
        },
      }
    })
    useToastStore.getState().addToast(`Sold ${SKILLS[skillId]?.name ?? skillId} (Lv${level}) · +${price} 🪙`, 'info')
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
      unseenLoot: true,  // UX05
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
      const levelUps = []  // S04 — tracker les level-ups pour notif
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
        unseenLoot: true,  // UX05
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
          vigor: VIGOR_MAX, // STA01 — dormir restaure la vigueur à 100
          // CRF01 — un jour passe : les debuffs temporaires décrémentent
          activeDebuffs: tickDebuffsOneDay(state.hero.activeDebuffs ?? []),
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

  // GLT01/GLT02/GLT04 — Gluttony absorbe une stat (proc passif aléatoire ou assassinat choisi)
  absorbGluttony: ({ monsterId, stat = null }) =>
    set((state) => {
      const monster = MONSTERS[monsterId]
      if (!monster) return state
      const chosenStat = stat ?? pickGluttonyStat()
      const amount = gluttonyAbsorbAmount(monster)
      useToastStore.getState().addToast(
        `Gluttony — Absorbed +${amount} ${chosenStat.toUpperCase()} from ${monster.name}`,
        'gluttony'
      )
      return {
        hero: {
          ...state.hero,
          stats: { ...state.hero.stats, [chosenStat]: (state.hero.stats[chosenStat] ?? 0) + amount },
        },
        meta: {
          ...state.meta,
          permanentStatBoosts: {
            ...(state.meta.permanentStatBoosts ?? {}),
            [chosenStat]: ((state.meta.permanentStatBoosts ?? {})[chosenStat] ?? 0) + amount,
          },
          gluttonyLastUsed: state.world.dayCount,
        },
      }
    }),

  // M01 — Attribue un titre permanent (dédup, persistant entre runs). Toast si nouveau.
  awardTitle: (titleId) =>
    set((state) => {
      if (!TITLES[titleId]) return state
      const earned = state.meta.titlesEarned ?? []
      if (earned.includes(titleId)) return state
      useToastStore.getState().addToast(`Title earned: ${TITLES[titleId].name}`, 'info')
      return { meta: { ...state.meta, titlesEarned: [...earned, titleId] } }
    }),

  // ACH01 — Évalue les accomplissements ; débloque les nouveaux, applique leurs bonus de
  // stat (permanents, comme Gluttony) + toast. Appelé après kill / quête / mort / demon lord.
  checkAchievements: () =>
    set((state) => {
      const newly = newlyUnlocked(state)
      if (newly.length === 0) return state
      const newStats = { ...state.hero.stats }
      const permBoosts = { ...(state.meta.permanentStatBoosts ?? {}) }
      newly.forEach((ach) => {
        const r = ach.reward ?? {}
        if (r.stat && typeof newStats[r.stat.name] === 'number') {
          newStats[r.stat.name] += r.stat.amount
          permBoosts[r.stat.name] = (permBoosts[r.stat.name] ?? 0) + r.stat.amount
        }
        useToastStore.getState().addToast(`🏆 Achievement: ${ACHIEVEMENTS[ach.id].name}!`, 'levelup', 4000)
      })
      return {
        hero: { ...state.hero, stats: newStats },
        meta: {
          ...state.meta,
          achievements: [...(state.meta.achievements ?? []), ...newly.map((a) => a.id)],
          permanentStatBoosts: permBoosts,
        },
      }
    }),

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

  // ── Kill count & idle ─────────────────────────────────────────────────────
  recordKill: (monsterId) =>
    set((state) => {
      const current = (state.world.monsterKillCounts ?? {})[monsterId] || 0
      const newCount = current + 1

      // TUT02 — Hint idle unlock : 1ère fois qu'un mob atteint 5 kills (seuil idle)
      // Accès défensif : `seenHints` peut être absent d'une vieille save → ?? []
      // (sinon `.includes` throwait et bloquait l'incrément du compteur de kills).
      const currentHints = state.meta.seenHints ?? []
      let newSeenHints = currentHints
      if (newCount >= 5 && !currentHints.includes('idle_unlock')) {
        const monsterName = MONSTERS[monsterId]?.name ?? monsterId
        useToastStore.getState().addToast(
          `Idle combat unlocked for ${monsterName}! Toggle it from the zone view.`,
          'info',
          4000,
        )
        newSeenHints = [...currentHints, 'idle_unlock']
      }

      return {
        world: {
          ...state.world,
          monsterKillCounts: {
            ...state.world.monsterKillCounts,
            [monsterId]: newCount,
          },
        },
        meta: { ...state.meta, seenHints: newSeenHints },
      }
    }),

  toggleIdle: (monsterId) =>
    set((state) => {
      const kills = state.world.monsterKillCounts[monsterId] || 0
      if (kills < 5) return state // pas encore débloqué

      // D07 — Idle interdit dans certaines zones (Blighted Road) et écrans (dungeon)
      const zone = ZONES[state.world.currentZone]
      if (zone?.idleAllowed === false) return state
      if (state.currentScreen === 'dungeon') return state

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

  // I08 — seuil de PV auto-stop de l'idle, configurable par le joueur (borné 5–90%)
  setIdleHpThreshold: (value) =>
    set((state) => ({
      world: { ...state.world, idleHpThreshold: Math.max(0.05, Math.min(0.9, value)) },
    })),

  addIdleLog: (entry) =>
    set((state) => {
      const newLog = [entry, ...state.world.idleLog].slice(0, 10)
      return { world: { ...state.world, idleLog: newLog } }
    }),

  // Q04 — enregistre la visite d'un spot de chasse (dédup), pour les quêtes d'exploration
  recordVisit: (spotId) =>
    set((state) => {
      const visited = state.world.visitedSpots ?? []
      if (!spotId || visited.includes(spotId)) return state
      return { world: { ...state.world, visitedSpots: [...visited, spotId] } }
    }),

  // PROG03 — débloque explicitement une zone (via récompense de quête OU info d'informateur).
  unlockZone: (zoneId, source = 'unknown') =>
    set((state) => {
      if (!ZONES[zoneId]) return state
      const cur = state.world.unlockedZones ?? []
      if (cur.includes(zoneId)) return state
      useToastStore.getState().addToast(
        `🗺 New region revealed: ${ZONES[zoneId]?.name ?? zoneId}${source === 'info' ? ' (rumor)' : ''}`,
        'info',
      )
      return { world: { ...state.world, unlockedZones: [...cur, zoneId] } }
    }),

  // Q05 — incrémente le compteur de crafts réussis (pour les quêtes de craft)
  incrementCraftCount: () =>
    set((state) => ({ meta: { ...state.meta, craftCount: (state.meta.craftCount ?? 0) + 1 } })),

  // ── Combat ────────────────────────────────────────────────────────────────
  startCombat: (enemies) =>
    set((state) => ({
      activeCombat: {
        enemies,
        turn: 0,
        log: [],
        phase: 'player',
        isOver: false,
        result: null, // 'victory' | 'defeat' | 'fled'
      },
      currentScreen: 'combat',
      // STA01 — un combat coûte de la vigueur
      hero: { ...state.hero, vigor: applyVigorCost(state.hero.vigor ?? VIGOR_MAX, VIGOR_COST.combat) },
    })),

  endCombat: (result) =>
    set((state) => {
      // Enregistrer dans le battleLog pour les conditions d'éveil
      // DV04 — hpPercent à la fin du combat (pour Voltaris : victoires sous 30% HP)
      const hpPercent = state.hero.stats.hp / state.hero.stats.maxHp
      const entry = { type: result, day: state.world.dayCount, turn: state.world.tickCount, hpPercent }
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
    set((state) => {
      const divineSkill = { skillId: chosenSkillId, level: 1, xp: 0 }
      const alreadyIn = state.hero.activeSkills.some(s => s.skillId === chosenSkillId)
      const newActiveSkills = alreadyIn
        ? state.hero.activeSkills
        : [...state.hero.activeSkills, divineSkill]

      // DV08 — appliquer la bénédiction passive aux stats (ex: Ignareth +15% strength)
      const newStats = applyDeityBlessing(state.hero.stats, deityId)
      const blessing = DEITIES[deityId]?.blessing ?? null

      return {
        hero: {
          ...state.hero,
          deity: deityId,
          deityBlessing: blessing,
          divineSkill,
          activeSkills: newActiveSkills,
          stats: newStats,
        },
        meta: {
          ...state.meta,
          divineBonds: { ...state.meta.divineBonds, medieval_fantasy: deityId },
        },
        pendingDivineCall: null,
        currentScreen: 'world_map',
      }
    }),

  // DV07 — Refuser la divinité = run solo (flag pour le bonus T11 à la transmigration)
  refuseDeity: () =>
    set((state) => ({
      pendingDivineCall: null,
      currentScreen: 'world_map',
      hero: { ...state.hero, soloRun: true },
    })),

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

  // TUT03 — Marque le hint de transmigration comme vu (1ère mort)
  markFirstDeathSeen: () =>
    set((state) => ({ meta: { ...state.meta, firstDeathSeen: true } })),

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
  // shopPurchases : {
  //   extraSkills?:    [{ type: 'active'|'passive', ... }],   // T07 — slot bonus skill
  //   rankRestored?:   boolean,                                // T06 — restaure 80% des rep tokens
  //   bonusStatSlot?:  boolean,                                // T08 — +1 stat random
  //   bonusStat?:      string,                                 // T08 — stat précise (override random)
  //   skillLevelUps?:  number,                                 // T09 — N levels sur skills hérités
  // }
  applyTransmigration: (shopPurchases = {}) =>
    set((state) => {
      const { pendingInheritance } = state.meta
      if (!pendingInheritance) return state

      // Stats de base + héritage de stat (TRM01)
      const newStats = { ...INITIAL_HERO.stats }
      if (pendingInheritance.stat) {
        const stat = pendingInheritance.stat
        const base = INITIAL_HERO.stats[stat] ?? 0
        // TRM01 — « ramener davantage » : 40% de la valeur ATTEINTE pendant le run
        // (lastRunSummary), avec plancher = base (jamais sous la stat de départ).
        const runValue = state.meta.lastRunSummary?.stats?.[stat] ?? base
        newStats[stat] = Math.max(base, Math.round(runValue * 0.4))
      }
      newStats.hp = newStats.maxHp = 100
      newStats.mana = newStats.maxMana = 60

      // GLT01 — réapplique les boosts permanents de Gluttony (cumulés entre runs)
      Object.entries(state.meta.permanentStatBoosts ?? {}).forEach(([stat, amt]) => {
        if (stat in newStats) newStats[stat] = (newStats[stat] ?? 0) + amt
      })

      // T08 — stat bonus (slot supplémentaire)
      if (shopPurchases.bonusStatSlot) {
        const statKeys = ['strength', 'agility', 'intelligence', 'chance', 'def']
        const bonusStat = shopPurchases.bonusStat
          ?? statKeys[Math.floor(Math.random() * statKeys.length)]
        if (statKeys.includes(bonusStat)) {
          newStats[bonusStat] = (newStats[bonusStat] ?? 0) + 1
        }
      }

      // T11 + DV07 — Compensation solo : run précédent sans divinité OU refus explicite
      const wasSolo = !state.hero.deity || state.hero.soloRun === true
      const soloLevelBonus = wasSolo ? 1 : 0

      // T09 — Skill level ups boutique (au-dessus du niveau actuel)
      const skillLevelUps = Math.max(0, shopPurchases.skillLevelUps ?? 0)

      // Construire les skills hérités avec bonus T09 + T11
      const applyLevelBonus = (skill) => {
        if (!skill) return null
        const bonus = soloLevelBonus + skillLevelUps
        return { ...skill, level: Math.min(3, (skill.level ?? 1) + bonus) }
      }

      const inheritedActive = pendingInheritance.activeSkill
        ? [{ ...applyLevelBonus(pendingInheritance.activeSkill), currentCooldown: 0 }]
        : []
      const inheritedPassive = pendingInheritance.passiveSkill
        ? [applyLevelBonus(pendingInheritance.passiveSkill)]
        : []

      // T07 — bonus skill slot (normaliser au format { skillId, level, xp, currentCooldown? })
      const extraSkills = shopPurchases.extraSkills ?? []
      const normalizeSkill = (s, isActive) => ({
        skillId: s.skillId,
        level: s.level ?? 1,
        xp: s.xp ?? 0,
        ...(isActive ? { currentCooldown: 0 } : {}),
      })
      const extraActive = extraSkills.filter((s) => s.type === 'active').map((s) => normalizeSkill(s, true))
      const extraPassive = extraSkills.filter((s) => s.type === 'passive').map((s) => normalizeSkill(s, false))
      const allActive = [...inheritedActive, ...extraActive]
      const allPassive = [...inheritedPassive, ...extraPassive]

      // T06 — Rank restoration : 80% des rep tokens du run précédent
      const restoredTokens = shopPurchases.rankRestored
        ? Math.round((state.hero.reputationTokens ?? 0) * 0.80)
        : 0

      // T04 + W02 — Malachar resurrection counter
      // Incrémenté à CHAQUE transmigration tant que Malachar est défait.
      // Quand le counter atteint 4 → Malachar respawn (reset counter + flag defeated)
      const RESURRECTION_CYCLES = 4
      const wasDemonLordDefeated = state.world.demonLordDefeated
      let newCounter = state.world.demonLordResurrectionCounter ?? 0
      let nextDemonLordDefeated = wasDemonLordDefeated
      let nextDungeons = { ...INITIAL_WORLD.dungeons }

      if (wasDemonLordDefeated) {
        newCounter += 1
        if (newCounter >= RESURRECTION_CYCLES) {
          // Malachar respawn
          newCounter = 0
          nextDemonLordDefeated = false
          // Le donjon grimspire est aussi reset (cleared → false)
          nextDungeons = {
            ...nextDungeons,
            grimspire: { ...nextDungeons.grimspire, cleared: false, discovered: false },
          }
        }
      } else {
        newCounter = 0  // pas de défaite encore : counter à 0
      }

      return {
        hero: {
          ...INITIAL_HERO,
          stats: newStats,
          activeSkills: allActive,
          passiveSkills: allPassive,
          runNumber: state.hero.runNumber + 1,
          deathCount: state.hero.deathCount + 1,
          reputationTokens: restoredTokens,
          // heroNamed : on garde le nom — pas la peine de retaper à chaque run
          name: state.hero.name,
          heroNamed: state.hero.heroNamed,
        },
        world: {
          ...INITIAL_WORLD,
          dungeons: nextDungeons,
          // T04 — Malachar resurrection counter persiste à travers le nouveau monde
          demonLordDefeated: nextDemonLordDefeated,
          demonLordResurrectionCounter: newCounter,
        },
        meta: {
          ...state.meta,
          pendingInheritance: null,
          // W03 — Flag malacharDefeatedThisRun reset après transmigration (consommé)
          malacharDefeatedThisRun: false,
        },
        currentScreen: 'world_map',
        pendingLevelUp: 0,
        recentSkillLevelUps: [],
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

      // B12 — ennemi trop fort pour l'idle (niveau > hero +5) :
      // on stoppe l'idle et on force un combat manuel (pas d'auto-grind suicidaire).
      const monsterLevel = getMonsterLevel(monsterId)
      if (isEnemyTooStrong(monsterLevel, state.hero.level)) {
        useToastStore.getState().addToast(
          `${monster.name} (Lv ${monsterLevel}) is too strong to grind — fight it manually!`,
          'warning'
        )
        const entry = {
          text: `[Idle] ${monster.name} too strong (Lv ${monsterLevel}) — forced into manual combat.`,
          type: 'info',
          timestamp: Date.now(),
        }
        const forcedEnemy = buildEnemy(monsterId, state.world.currentZone, state.hero.runNumber)
        return {
          activeCombat: forcedEnemy
            ? { enemies: [forcedEnemy], turn: 0, log: [], phase: 'player', isOver: false, result: null }
            : state.activeCombat,
          currentScreen: forcedEnemy ? 'combat' : state.currentScreen,
          world: {
            ...state.world,
            isIdleActive: false,
            idleTargetMonster: null,
            idleLog: [entry, ...state.world.idleLog].slice(0, 10),
          },
        }
      }

      // Auto-disable si HP sous le seuil configuré (I08) avant même de commencer
      const currentHp = state.hero.stats.hp
      const maxHp = state.hero.stats.maxHp
      const idleHpThreshold = state.world.idleHpThreshold ?? 0.2
      if (currentHp / maxHp < idleHpThreshold) {
        const entry = { text: `[Idle] HP trop bas — combat suspendu.`, type: 'info', timestamp: Date.now() }
        // I04 — toast warning (événement rare, non-spammy)
        useToastStore.getState().addToast('Idle paused — HP too low. Rest before continuing.', 'warning')
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

      const isLowHp = s.hp / s.maxHp < (state.world.idleHpThreshold ?? 0.2)
      const levelUpStr = levelsGained > 0 ? ` ★ LEVEL UP! (${level})` : ''
      const entry = {
        text: `[Idle] Slew ${monster.name} · +${gold}g · +${xp}xp${levelUpStr}`,
        type: levelsGained > 0 ? 'drop' : 'kill',
        timestamp: Date.now(),
      }

      // I04 — toast sur level-up en idle (événement marquant, non-spammy)
      if (levelsGained > 0) {
        useToastStore.getState().addToast(`Level up! You reached level ${level} (idle).`, 'levelup')
      }
      // I04 — toast si idle s'arrête pour HP bas après ce combat
      if (isLowHp) {
        useToastStore.getState().addToast('Idle stopped — HP critically low.', 'warning')
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

  // TRV01/TRV03 — Voyage vers un node adjacent : déplace le héros sur la carte et
  // avance le temps de 3 tics (avec rollover de jour). N'exécute PAS l'idle
  // (on ne farme pas en marchant — décision 2026-06-06).
  travelTo: (nodeId, ticks = 3) =>
    set((state) => {
      const total = state.world.tickCount + ticks
      return {
        world: {
          ...state.world,
          currentNode: nodeId,
          tickCount: total % 24,
          dayCount: state.world.dayCount + Math.floor(total / 24),
        },
        // STA01 — un voyage coûte 1 de vigueur (par unité de distance)
        hero: { ...state.hero, vigor: applyVigorCost(state.hero.vigor ?? VIGOR_MAX, VIGOR_COST.distance) },
      }
    }),

  // ── Système de quêtes ────────────────────────────────────────────────────
  startQuest: (questId) =>
    set((state) => {
      const { activeQuests, completedQuests } = state.world
      if (completedQuests.includes(questId)) return state
      if (activeQuests.includes(questId)) return state
      return { world: { ...state.world, activeQuests: [...activeQuests, questId] } }
    }),

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

  isQuestComplete: (questId) => {
    const { hero, world, meta } = get()
    const quest = getQuestById(questId)
    if (!quest) return false
    return quest.objectives.every((obj) => {
      if (obj.type === 'kill') return (world.monsterKillCounts[obj.monsterId] ?? 0) >= obj.count
      if (obj.type === 'level') return hero.level >= obj.targetLevel
      if (obj.type === 'visit') return (world.visitedSpots ?? []).includes(obj.spotId) // Q04
      if (obj.type === 'craft') return (meta.craftCount ?? 0) >= obj.count             // Q05
      if (obj.type === 'skill_levelup') return (heroSkillLevels(hero)[obj.skillId] ?? 0) >= obj.targetLevel // ACA04
      return false
    })
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
      const repTokens = r.reputationTokens ?? 1

      if (r.skill) newManaStones.push({ skillId: r.skill.skillId, level: 1, xp: 0 })
      if (r.gold) newGold += r.gold

      // Q09 — récompenses variées : équipement / ressources / stat
      const eqItem = r.equipment ? createEquipmentInstance(r.equipment.templateId, r.equipment.rarity) : null
      if (eqItem) { newEquipment.push(eqItem); unseenLoot = true }
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
        for (const [id, qty] of Object.entries(r.resources)) rewardParts.push(`${qty}× ${RESOURCES[id]?.name ?? id}`)
      }
      if (r.consumables) {
        for (const [id, qty] of Object.entries(r.consumables)) rewardParts.push(`${qty}× ${RESOURCES[id]?.name ?? id}`)
      }
      if (r.stat) rewardParts.push(`+${r.stat.amount} ${r.stat.name}`)
      if (r.aura) rewardParts.push(`+${r.aura} Aura`)
      if (r.concentration) rewardParts.push(`+${r.concentration} Concentration`)
      useToastStore.getState().addToast(
        `Quest complete: ${quest.name} — ${rewardParts.join(' · ')}`,
        'quest',
      )

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
          inventory: { ...state.hero.inventory, manaStones: newManaStones, gold: newGold, equipment: newEquipment, resources: newResources, consumables: newConsumables },
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

  // ── Nom du héros (CharacterCreation) ─────────────────────────────────────
  renameHero: (name) =>
    set((state) => ({
      hero: {
        ...state.hero,
        name: name.trim() || 'The Wanderer',
        heroNamed: true,
      },
    })),

  // ── Persistence localStorage ──────────────────────────────────────────────
  saveGame: () => {
    // IDLE-OFF — horodate la sauvegarde (base du calcul hors-ligne au retour)
    set((s) => ({ meta: { ...s.meta, lastSeen: Date.now() } }))
    const { hero, world, meta } = get()
    const payload = JSON.stringify({ hero, world, meta, saveVersion: SAVE_VERSION })
    try {
      localStorage.setItem('roguelite_save', payload)
      // Reset le flag si une sauvegarde précédente a échoué
      if (get().saveQuotaExceeded) set({ saveQuotaExceeded: false })
    } catch (e) {
      // TECH03 — quota exceeded ou autre erreur de persistance
      console.error('[save] localStorage write failed:', e?.name, e?.message)
      set({ saveQuotaExceeded: true })
    }
  },

  loadGame: () => {
    const raw = localStorage.getItem('roguelite_save')
    if (!raw) return false
    try {
      const parsed = JSON.parse(raw)
      const migrated = runMigrations(parsed)
      set({ hero: migrated.hero, world: migrated.world, meta: migrated.meta })
      return true
    } catch {
      return false
    }
  },

  // IDLE-OFF — au retour, créditer les gains accumulés pendant l'absence si l'idle
  // était actif. Calcul en batch (valeurs espérées). nowMs injectable pour les tests.
  applyOfflineProgress: (nowMs = Date.now()) => {
    const { hero, world, meta } = get()
    if (!world.isIdleActive || !world.idleTargetMonster || !meta.lastSeen) return
    const monsterId = world.idleTargetMonster
    const monster = MONSTERS[monsterId]
    if (!monster || !canGrind(hero, monster)) return
    // Idle se serait arrêté si l'ennemi est trop fort (B12) → pas de gains hors-ligne
    if (isEnemyTooStrong(getMonsterLevel(monsterId), hero.level)) return

    const ticks = elapsedIdleTicks(meta.lastSeen, nowMs)
    if (ticks <= 0) return

    const gains = computeOfflineGains({ monster, ticks, chance: hero.stats.chance })

    // Crédit via les actions canoniques (gère les level-ups proprement)
    get().addGold(gains.gold)
    for (const [id, qty] of Object.entries(gains.resources)) get().addResource(id, qty)
    if (gains.xp > 0) get().gainExp(gains.xp)

    set((s) => ({
      world: {
        ...s.world,
        monsterKillCounts: {
          ...s.world.monsterKillCounts,
          [monsterId]: (s.world.monsterKillCounts[monsterId] || 0) + gains.kills,
        },
      },
      meta: {
        ...s.meta,
        lastSeen: nowMs, // évite le double-comptage si on recharge
        offlineSummary: { monsterName: monster.name, ...gains },
      },
    }))
  },

  clearOfflineSummary: () => set((s) => ({ meta: { ...s.meta, offlineSummary: null } })),

  // SET01 — modifier un réglage joueur
  setSetting: (key, value) =>
    set((s) => ({ meta: { ...s.meta, settings: { ...(s.meta.settings ?? {}), [key]: value } } })),

  // TAV01 — acheter une info à un informateur. @returns {boolean} succès
  buyInfo: (id, price) => {
    const { hero, meta } = get()
    if ((meta.knownInfo ?? []).includes(id)) return false
    if (hero.inventory.gold < price) return false
    get().spendGold(price)
    set((s) => ({ meta: { ...s.meta, knownInfo: [...(s.meta.knownInfo ?? []), id] } }))
    useToastStore.getState().addToast('🕵 Information acquired.', 'info')
    // PROG03 — certaines rumeurs débloquent une zone (voie « info informateur »)
    const inf = getInformant(id)
    if (inf?.unlockZone) get().unlockZone(inf.unlockZone, 'info')
    return true
  },

  // TECH07 — Export / Import de save (fichier). Filet de sécurité + portabilité.
  exportSave: () => {
    const { hero, world, meta } = get()
    return JSON.stringify({ hero, world, meta, saveVersion: SAVE_VERSION }, null, 2)
  },

  /** Charge une save depuis une chaîne JSON (avec migrations). @returns {boolean} succès */
  importSave: (json) => {
    try {
      const parsed = JSON.parse(json)
      if (!parsed || !parsed.hero || !parsed.world) return false
      const migrated = runMigrations(parsed)
      set({ hero: migrated.hero, world: migrated.world, meta: migrated.meta })
      get().saveGame()
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

      // D05 — warp à la sortie : héros téléporté à la ville principale de la zone,
      // sortie du spot de chasse, idle stop (cohérence D07).
      const zoneData = ZONES[zoneId]
      const safeCityId = zoneData?.city?.id ?? state.world.currentLocation

      // M02 — incrément du compteur Demon Lords kills par univers
      // Pour l'instant un seul univers : 'medieval_fantasy'. Préparation X08.
      const universeId = 'medieval_fantasy'
      const isDemonLordKill = zoneId === 'grimspire'
      const updatedDemonLordKills = isDemonLordKill
        ? {
            ...(typeof state.meta.demonLordKills === 'object' ? state.meta.demonLordKills : {}),
            [universeId]: ((typeof state.meta.demonLordKills === 'object'
              ? state.meta.demonLordKills[universeId]
              : state.meta.demonLordKills) ?? 0) + 1,
          }
        : state.meta.demonLordKills

      // W01 — récompense de victoire sur le Demon Lord : +200 tokens de réputation
      const tokenReward = isDemonLordKill ? 200 : 0
      if (isDemonLordKill) {
        useToastStore.getState().addToast('Demon Lord vanquished! +200 reputation tokens.', 'divine')
      }

      return {
        hero: tokenReward > 0
          ? { ...state.hero, reputationTokens: (state.hero.reputationTokens ?? 0) + tokenReward }
          : state.hero,
        world: {
          ...state.world,
          dungeons: {
            ...state.world.dungeons,
            [zoneId]: { ...dungeon, cleared: true },
          },
          demonLordDefeated: isDemonLordKill ? true : state.world.demonLordDefeated,
          // D05 — warp
          currentLocation: safeCityId,
          currentNode: safeCityId, // TRV01 — garde la position carte synchronisée au warp
          currentHuntingSpot: null,
          isIdleActive: false,
          idleTargetMonster: null,
        },
        meta: {
          ...state.meta,
          demonLordKills: updatedDemonLordKills,
          // W03 — flag levé pour le post-mortem si Malachar killed ce run
          malacharDefeatedThisRun: isDemonLordKill ? true : (state.meta.malacharDefeatedThisRun ?? false),
          // T13 — titres permanents gagnés en tuant un Demon Lord (dépend M01)
          titlesEarned: isDemonLordKill
            ? Array.from(new Set([...(state.meta.titlesEarned ?? []), 'demon_lord_slayer', 'malachar_bane']))
            : (state.meta.titlesEarned ?? []),
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
      pendingLevelUp: 0,
      recentSkillLevelUps: [],
      saveQuotaExceeded: false,
      unseenLoot: false,
    }),
}))
