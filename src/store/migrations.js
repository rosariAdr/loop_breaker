// REFAC01 — Migrations save (extrait de gameStore.js).
import { INITIAL_HERO, INITIAL_WORLD, INITIAL_META } from './initialState'
import { ZONE_ORDER } from '../data/zones'

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
    resources: inventory.resources ?? {},
    consumables: inventory.consumables ?? {},
    manaStones: Array.isArray(inventory.manaStones) ? inventory.manaStones : [],
    equipment: Array.isArray(inventory.equipment) ? inventory.equipment : [],
    gold: inventory.gold ?? 0,
  }
  const migratedEquipped = {
    weapon: null,
    helmet: null,
    armor: null,
    boots: null,
    ...(hero.equipped ?? {}),
  }

  // Migration DV02 rétroactive : si divineSkill existe mais pas dans activeSkills, l'ajouter
  const baseActive = Array.isArray(hero.activeSkills) ? hero.activeSkills : []
  const divineInActive =
    hero.divineSkill && !baseActive.some((s) => s.skillId === hero.divineSkill.skillId)
  const migratedActiveSkills =
    divineInActive && baseActive.length < 6 ? [...baseActive, hero.divineSkill] : baseActive

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
    gluttonyLastUsed: meta.gluttonyLastUsed ?? null, // GLT01
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

// SAVE-AUDIT01 — coercitions défensives : un champ persisté présent mais du MAUVAIS type
// (save corrompue, édition manuelle, bug d'une version antérieure) est réparé au lieu de
// crasher au premier accès non défensif (`.length`, `.includes`, `Object.entries`…).
const asArray = (v, def = []) => (Array.isArray(v) ? v : def)
const asObject = (v, def = {}) => (v && typeof v === 'object' && !Array.isArray(v) ? v : def)

/**
 * Backfill IDEMPOTENT + validation de schéma défensive, appliqué à CHAQUE chargement quelle
 * que soit la version de la save. Garantit la forme attendue de hero/world/meta (champs
 * manquants → défaut ; champs malformés → réparés) pour qu'aucune lecture ne crashe.
 */
export function normalizeSave(save) {
  if (!save || typeof save !== 'object') return save
  const sHero = asObject(save.hero)
  const sWorld = asObject(save.world)
  const sMeta = asObject(save.meta)

  // ── Hero ──
  const inv = asObject(sHero.inventory)
  const hero = {
    ...INITIAL_HERO,
    ...sHero,
    stats: { ...INITIAL_HERO.stats, ...asObject(sHero.stats) },
    equipped: { ...INITIAL_HERO.equipped, ...asObject(sHero.equipped) },
    inventory: {
      resources: asObject(inv.resources),
      consumables: asObject(inv.consumables),
      manaStones: asArray(inv.manaStones),
      equipment: asArray(inv.equipment),
      gold: typeof inv.gold === 'number' ? inv.gold : 0,
    },
    activeSkills: asArray(sHero.activeSkills),
    passiveSkills: asArray(sHero.passiveSkills),
    activeDebuffs: asArray(sHero.activeDebuffs),
    battleLog: asArray(sHero.battleLog),
    combatEntryLog: asArray(sHero.combatEntryLog),
    titles: asArray(sHero.titles),
    skillUseLog: asArray(sHero.skillUseLog),
  }

  // ── World ──
  const world = {
    ...INITIAL_WORLD,
    ...sWorld,
    activeQuests: asArray(sWorld.activeQuests),
    completedQuests: asArray(sWorld.completedQuests),
    unlockedZones: asArray(sWorld.unlockedZones, [...INITIAL_WORLD.unlockedZones]),
    visitedSpots: asArray(sWorld.visitedSpots),
    idleLog: asArray(sWorld.idleLog),
    monsterKillCounts: asObject(sWorld.monsterKillCounts),
    idleToggles: asObject(sWorld.idleToggles),
    dungeons: asObject(sWorld.dungeons, { ...INITIAL_WORLD.dungeons }),
    generatedVillages: asObject(sWorld.generatedVillages),
    questProgress: asObject(sWorld.questProgress), // FIX-QUESTSNAP01
  }
  // MON01 — remap des ids de spot/node renommés
  if (SPOT_ID_REMAP[world.currentHuntingSpot])
    world.currentHuntingSpot = SPOT_ID_REMAP[world.currentHuntingSpot]
  if (SPOT_ID_REMAP[world.currentNode]) world.currentNode = SPOT_ID_REMAP[world.currentNode]

  // ── Meta ──
  const meta = {
    ...INITIAL_META,
    ...sMeta,
    achievements: asArray(sMeta.achievements),
    titlesEarned: asArray(sMeta.titlesEarned),
    seenHints: asArray(sMeta.seenHints),
    knownInfo: asArray(sMeta.knownInfo),
    divineBonds: asObject(sMeta.divineBonds),
    permanentStatBoosts: asObject(sMeta.permanentStatBoosts),
    demonLordKills: asObject(sMeta.demonLordKills),
    // settings imbriqué → fusion explicite pour conserver les sous-clés par défaut
    settings: { ...INITIAL_META.settings, ...asObject(sMeta.settings) },
  }

  return { ...save, hero, world, meta }
}

/**
 * Applique toutes les migrations nécessaires en séquence pour amener
 * une save à la version courante (SAVE_VERSION).
 */
export function runMigrations(save) {
  let current = save
  const fromVersion = current.saveVersion ?? 1 // pas de saveVersion = v1 (legacy)

  if (fromVersion < 2) current = migrateV1ToV2(current)
  // Ajouter les futures migrations ici :
  // if (fromVersion < 3) current = migrateV2ToV3(current)

  // Filet final : backfill des champs par défaut manquants, toutes versions confondues.
  return normalizeSave(current)
}
