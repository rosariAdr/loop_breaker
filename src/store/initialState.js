// ── TECH02 — Save schema versioning ──────────────────────────────────────────
// Incrémenter SAVE_VERSION chaque fois qu'un changement de structure persisté
// nécessite une migration. Ajouter la migration correspondante dans `runMigrations`.
export const SAVE_VERSION = 2

// ── État initial du héros ─────────────────────────────────────────────────────
// (les migrations sont définies plus bas, après les INITIAL_*)
export const INITIAL_HERO = {
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
  aura: 0, // 0 = non débloquée
  skillUseCount: 0, // total de skills utilisés (pour le gain +1/10)
  skillUseLog: [], // [dayCount, …] pour la fenêtre glissante de déblocage (15 en <4j)

  // STA03 — Concentration (qualité de craft, 0-150).
  concentration: 0,

  // Skills (max 6 actifs, max 4 passifs)
  activeSkills: [], // [{ skillId, level, xp, currentCooldown }]
  passiveSkills: [], // [{ skillId, level, xp }]

  // Divinité liée
  deity: null, // id de la divinité (null = sans dieu)
  deityBlessing: null,
  divineSkill: null, // { skillId, level, xp }

  // Titres gagnés
  titles: [], // ['Slayer of Eldenmoor', ...]

  // CRF01 — Debuffs passifs actifs (malus temporaires en jours, ou permanents)
  activeDebuffs: [], // [{ debuffId, permanent, duration: { type: 'days', remaining } }]

  // Équipement porté (null = slot vide)
  equipped: {
    weapon: null,
    helmet: null,
    armor: null,
    boots: null,
  },

  // Inventaire
  inventory: {
    resources: {}, // { resourceId: quantity }
    consumables: {}, // { resourceId: quantity }
    manaStones: [], // [{ skillId, level, xp }] — skills non équipés
    equipment: [], // [{ instanceId, templateId, name, slot, rarity, stats, sellPrice }]
    gold: 0,
  },

  // Progression Ignareth : compter les victoires par jour
  battleLog: [], // [{ type: 'victory'|'defeat', day, turn }]
  combatEntryLog: [], // [{ hpPercent, day }] — pour Sylvara

  // Infos du run
  runNumber: 1,
  deathCount: 0,
  reputationTokens: 0, // jetons gagnés via quêtes
  adventurerRankTokens: 0, // jetons convertis en rang

  // Flag : le joueur a-t-il choisi son nom ? (faux = CharacterCreation à afficher)
  heroNamed: false,

  // DV07 — Le joueur a-t-il refusé une divinité ce run ? (→ bonus solo T11)
  soloRun: false,
}

// ── État initial du monde ─────────────────────────────────────────────────────
export const INITIAL_WORLD = {
  currentZone: 'ashenvale',
  currentLocation: 'ironhaven', // ville/village où se trouve le héros
  currentHuntingSpot: null, // spot de chasse actif (ashenvale_forest | thornmarsh | crumbled_ruins | wildmere_hills)
  currentNode: 'ironhaven', // TRV01 — position du héros sur la World Map (node)

  // PROG02 — zones débloquées (déblocage explicite via quête/info ; auto-déblocage
  // par niveau/kills reste géré par isZoneUnlocked). Nouveau run = zone de départ seule.
  unlockedZones: ['ashenvale'],

  // Calendrier
  dayCount: 1,
  tickCount: 0, // tick actuel dans la journée (0–23)
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
  idleToggles: {}, // { monsterId: boolean }

  // État de l'idle global
  isIdleActive: false,
  idleTargetMonster: null,
  idleHpThreshold: 0.2, // I08 — seuil de PV (fraction) sous lequel l'idle se coupe automatiquement
  idleLog: [], // [{ text, type, timestamp }] — 10 dernières entrées

  // Villages générés aléatoirement (buildings présents dans chaque village)
  generatedVillages: {}, // { villageId: { buildings: [...] } }

  // Demon Lord
  demonLordDefeated: false,
  demonLordResurrectionCounter: 0,

  // Quêtes
  activeQuests: [], // ['questId', ...]
  completedQuests: [], // ['questId', ...]
}

// ── État méta (persiste entre les runs) ─────────────────────────────────────
export const INITIAL_META = {
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
  seenHints: [], // ['idle_unlock', ...]
  firstDeathSeen: false, // TUT03 — surbrillance PostMortem au 1er run

  // ACH01 — accomplissements débloqués (persistants entre runs ; bonus de stat permanents)
  achievements: [], // [achievementId, ...]

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
  gluttonyLastUsed: null, // jour de la dernière absorption (cooldown 5 jours)

  // IDLE-OFF — progression hors-ligne
  lastSeen: null, // timestamp (ms) de la dernière sauvegarde
  offlineSummary: null, // { monsterName, kills, gold, xp, resources } — affiché au retour puis effacé

  // SET01 — réglages joueur (persistés avec meta)
  settings: { animations: true },

  // TAV01 — infos achetées aux informateurs (persistant entre runs)
  knownInfo: [], // [infoId, ...]
}
