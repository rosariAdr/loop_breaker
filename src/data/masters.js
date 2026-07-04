// MST09 — Pools de skills-récompense par discipline de maître.
//
// Chaque maître (v1.43) a un `focus` (discipline). Les quêtes du maître engagé
// récompensent des skills tirés du pool de sa discipline (MST01/MST03). Ce module
// ne fait QUE définir ces pools — l'engagement, les quêtes d'initiation et le
// gating sont hors périmètre (MST01/MST02/MST05, gate design MST-G1).
//
// Cohérence physical/magic (SKD, source de vérité `getSkillDropType` dans monsters.js) :
//   - disciplines PHYSIQUES (martial, berserker) → techniques à dégâts physiques
//     (`effect.damage.type === 'physical'`) + techniques utilitaires/passives martiales
//     (garde, riposte, buffs) qui ne portent AUCUN dégât contradictoire.
//   - disciplines MAGIQUES (arcane, feu, glace) → skills magiques : jamais de dégâts
//     physiques. `feu`/`glace` exigent en plus l'élément exact (`fire`/`ice`).
//
// ⚠️ On ne puise que dans les skills « de base » du joueur (container `mana_stone`) :
//   les skills `divine`/`supreme` s'obtiennent via l'éveil d'une divinité / le Demon Lord,
//   pas via un maître (cf. ACADEMY_CATALOG qui exclut aussi boss/divins/suprêmes).
//
// ✅ GLACE (SKD-ICE01) : quatre skills d'élément `ice` existent désormais dans skills.js
//   (ice_shard, frostbite, blizzard, frost_lance ; Soul Chill reste un skill PHYSIQUE, hors
//   pool). Le pool `glace` est alimenté — le maître de glace itinérant (MST08) peut donc
//   récompenser des skills de glace.

// Disciplines connues (extensible). Sert de référence partagée (UI, MST01, tests).
export const MASTER_FOCUSES = ['martial', 'arcane', 'feu', 'glace', 'berserker']

// Classe de cohérence attendue par discipline :
//   'physical' → skills à dégâts physiques (+ utilitaires/passifs martiaux)
//   'magic'    → skills magiques non physiques
//   'magic:fire' / 'magic:ice' → magiques ET de l'élément exact
export const FOCUS_DAMAGE_CLASS = {
  martial: 'physical',
  berserker: 'physical',
  arcane: 'magic',
  feu: 'magic:fire',
  glace: 'magic:ice',
}

// Pools de skills-récompense par discipline. Ids ⊂ SKILLS (container mana_stone).
export const MASTER_SKILL_POOLS = {
  // Martial — épée & garde : frappe maîtrisée, riposte, posture défensive, endurance.
  martial: [
    'power_strike', // 160% STR (physique)
    'cleave', // AoE physique
    'cursed_blade', // physique + defense break
    'counter_strike', // riposte (utilitaire martial, sans dégât direct)
    'shield_stance', // posture défensive (utilitaire martial)
    'battle_focus', // passif +STR
    'veterans_resolve', // passif +maxHP
    'iron_resolve', // passif +DEF
  ],

  // Berserker — furie brute : gros coups physiques, sacrifice, aucune retenue.
  berserker: [
    'reckless_blow', // 220% STR, sacrifie de l'Agility
    'bone_crush', // 220% STR
    'trample_charge', // 180% STR
    'savage_bite', // 140% STR
    'bramble_slam', // physique + slow
    'thick_hide', // passif : réduction de dégâts (encaisser pour cogner)
  ],

  // Arcane — magie « pure » (dégâts magiques non élémentaires) + contrôle.
  arcane: [
    'wing_gust', // dégâts magiques AoE
    'soul_crush', // dégâts magiques lourds (skill de boss recyclé, MST03)
    'plague_maw', // dégâts magiques + poison
    'abyss_howl', // debuff ATK (contrôle magique, sans dégât physique)
    'forsaken_curse', // debuff all-stats (contrôle magique, skill de boss recyclé)
  ],

  // Feu — magie de flammes : brûlure. (inferno_strike est divin → hors pool.)
  feu: [
    'ember_burst', // 100% INT feu + burn
    'fox_fire', // 120% INT feu + burn
  ],

  // Glace — magie de givre : éclat, gel (slow), tempête AoE, lance perforante. (SKD-ICE01)
  glace: [
    'ice_shard', // 100% INT glace (mono-cible)
    'frostbite', // 110% INT glace + slow (gel)
    'blizzard', // 90% INT glace AoE
    'frost_lance', // 180% INT glace (gros mono-cible)
  ],
}

/** Pool de skills-récompense d'une discipline (tableau d'ids ; [] si inconnue/vide). */
export function getMasterSkillPool(focus) {
  return MASTER_SKILL_POOLS[focus] ?? []
}

// ── MST01/MST05 — Modèle de données « maître » + engagement ───────────────────
//
// Un maître (mentor) enseigne une discipline (`focus`) via des quêtes. Le héros
// s'ENGAGE auprès d'UN SEUL maître par run (MST-G1(b)) : choix LIBRE parmi tous les
// maîtres, la 1ʳᵉ quête d'initiation validée verrouille l'engagement définitivement
// (MST-G1(a) : pas d'auto-assignation à un maître par défaut). L'état d'engagement
// (`hero.masterId`) vit dans le RUN et se réinitialise à la transmigration (comme les
// skills/stats) — voir INITIAL_HERO + le lock côté store (setMaster).
//
// Chaque maître porte :
//   - `id`, `name`, `title` (MST-G2 pour Aldric)
//   - `location` (localité fixe) OU `itinerant: true` (maître de passage — MST08, batch 3)
//   - `focus` ∈ MASTER_FOCUSES → détermine son pool de skills-récompense
//   - `initiationQuestId` : la quête d'initiation qui, validée, engage le héros
//   - `skillQuestPool[]` : ids des quêtes de maître (⊂ MASTER_QUESTS) proposées une fois
//     initié. Les skills récompensés par ces quêtes appartiennent au pool de la discipline
//     (MASTER_SKILL_POOLS[focus]).
export const MASTERS = {
  // MST05 — Sir Aldric, maître martial de Greywatch (village de départ). Porte la quête
  // d'initiation de départ. Non obligatoire : le héros peut choisir un autre maître (modèle
  // à choix libre). Titre décidé (MST-G2).
  sir_aldric: {
    id: 'sir_aldric',
    name: 'Sir Aldric',
    title: "Membre d'honneur du Royal Knighthood", // MST-G2 (chaîne exacte)
    location: 'greywatch',
    focus: 'martial',
    initiationQuestId: 'master_init_aldric',
    // Quêtes de maître martial (ACA04 existantes ; skills ⊂ MASTER_SKILL_POOLS.martial).
    skillQuestPool: ['master_sharpen_strike', 'master_focus_cleave', 'master_temper_resolve'],
  },

  // MST07 — Archmagister Vael, maître ARCANE d'Ironhaven (recyclé academy_master, MST-G3).
  // Il conserve le catalogue payant de l'Académie ET devient un maître dont les quêtes
  // récompensent des skills du pool arcane que la boutique NE vend PAS (soul_crush, etc.).
  academy_master: {
    id: 'academy_master',
    name: 'Archmagister Vael',
    title: 'Master of the Academy',
    location: 'ironhaven',
    focus: 'arcane',
    initiationQuestId: 'master_init_vael',
    // skills ⊂ MASTER_SKILL_POOLS.arcane (abyss_howl → wing_gust → soul_crush).
    skillQuestPool: ['master_arcane_pulse', 'master_soul_rend'],
  },

  // MST06 — Magister Elyndra, « Ancien mage de la cour royale », maître ARCANE de Millhaven.
  court_mage: {
    id: 'court_mage',
    name: 'Magister Elyndra',
    title: 'Ancien mage de la cour royale',
    location: 'millhaven',
    focus: 'arcane',
    initiationQuestId: 'master_init_elyndra',
    // skills ⊂ MASTER_SKILL_POOLS.arcane (plague_maw → abyss_howl → forsaken_curse).
    skillQuestPool: ['master_court_venom', 'master_court_curse'],
  },

  // MST07 — Bulgar the Unbroken, maître PHYSIQUE (berserker) d'Ironhaven, distinct de Vael.
  pit_master: {
    id: 'pit_master',
    name: 'Bulgar the Unbroken',
    title: 'Master of the Iron Pit',
    location: 'ironhaven',
    focus: 'berserker',
    initiationQuestId: 'master_init_bulgar',
    // skills ⊂ MASTER_SKILL_POOLS.berserker (trample_charge → bone_crush → reckless_blow).
    skillQuestPool: ['master_pit_frenzy', 'master_pit_reckless'],
  },

  // ── MST08 — Maîtres ITINÉRANTS (de passage) ─────────────────────────────────
  // Pas de `location` fixe : `itinerant: true`. Ils APPARAISSENT à une localité au fil
  // du temps (rotation déterministe sur `dayCount`, cf. getItinerantMasterForDay /
  // getItinerantMastersAtLocation). Fusionne/étend NPC05 (maître de passage à la Guilde).
  // Chacun porte une quête d'initiation + un skillQuestPool ⊂ MASTER_SKILL_POOLS[focus].

  // Maître de FEU itinérant — magie de flammes (pool `feu`).
  flame_wanderer: {
    id: 'flame_wanderer',
    name: 'Pyra the Emberwalker',
    title: 'Wandering Flamecaller',
    itinerant: true,
    focus: 'feu',
    initiationQuestId: 'master_init_pyra',
    // skills ⊂ MASTER_SKILL_POOLS.feu (ember_burst → fox_fire).
    skillQuestPool: ['master_ember_kindle', 'master_ember_blaze'],
  },

  // Maître de GLACE itinérant — magie de givre (pool `glace`, débloqué par SKD-ICE01).
  frost_wanderer: {
    id: 'frost_wanderer',
    name: 'Kaira Froststep',
    title: 'Wandering Frostweaver',
    itinerant: true,
    focus: 'glace',
    initiationQuestId: 'master_init_kaira',
    // skills ⊂ MASTER_SKILL_POOLS.glace (ice_shard → frostbite → blizzard).
    skillQuestPool: ['master_frost_shard', 'master_frost_storm'],
  },

  // Maître BERSERKER itinérant — furie brute (pool `berserker`), distinct de Bulgar.
  savage_wanderer: {
    id: 'savage_wanderer',
    name: 'Grukk Bloodmane',
    title: 'Wandering Berserker',
    itinerant: true,
    focus: 'berserker',
    initiationQuestId: 'master_init_grukk',
    // skills ⊂ MASTER_SKILL_POOLS.berserker (savage_bite → bramble_slam).
    skillQuestPool: ['master_savage_maul', 'master_savage_thrash'],
  },
}

/** Un maître par id (ou null si inconnu). */
export function getMaster(masterId) {
  return MASTERS[masterId] ?? null
}

/** Le maître dont la quête d'initiation est `questId` (ou null). Sert au verrou MST02. */
export function getMasterByInitiationQuest(questId) {
  return Object.values(MASTERS).find((m) => m.initiationQuestId === questId) ?? null
}

/** Les maîtres FIXES d'une localité (itinérants exclus — MST08). Tableau (possiblement vide). */
export function getMastersAtLocation(locationId) {
  if (!locationId) return []
  return Object.values(MASTERS).filter((m) => !m.itinerant && m.location === locationId)
}

// ── MST08 / v1.43 (batch 6) — Apparition des maîtres ITINÉRANTS (de passage) ──
//
// Un maître itinérant n'a pas de `location` : il APPARAÎT à une localité au fil du temps.
// Modèle retenu (déterministe, testable, sans alea de render) : UN itinérant « de passage »
// à la fois, en rotation tous les ITINERANT_ROTATION_DAYS jours (même convention que la
// rotation de l'église, CHURCH_ROTATION_DAYS).
//
// DÉCISION #3 (v1.43 batch 6) — l'itinérant du bloc courant se tient dans UNE SEULE
// agglomération (tirée de façon déterministe par bloc), plus dans toutes à la fois. Le
// bloc sélectionne À LA FOIS le maître ET son agglomération-hôte, via un « combo » qui
// énumère TOUTES les paires (maître × agglo) de façon déterministe et sans couplage :
//   block = floor(dayCount / ITINERANT_ROTATION_DAYS)
//   combo = block % (nbMaîtres × nbAgglos)                (18 paires : 3 × 6)
//   maître = ITINERANT_MASTERS[combo % nbMaîtres]         (avance chaque bloc)
//   hôte   = ITINERANT_HOST_ORDER[floor(combo / nbMaîtres) % nbAgglos]  (avance tous les 3 blocs)
// Ainsi, sur le cycle complet (ppcm = nbMaîtres × nbAgglos = 18 blocs = 72 jours) chaque
// paire (maître, agglo) survient EXACTEMENT une fois : toute agglo finit par accueillir chacun
// des 3 focus (contrairement à un simple `block % nbAgglos` qui figerait 1 focus par agglo).
// Les spots de chasse et donjons n'accueillent jamais de maître de passage (pas de halte).
//
// L'itinérant surface sur le tableau de maître LOCAL de son agglomération-hôte : l'Académie
// en ville, le maître de village (KnightTrainer) à Millhaven, et — pour les villages sans
// PNJ-maître dédié — le tableau communautaire de l'Église (cf. panels, réutilise le gating).

/** Maîtres itinérants (ordre de rotation stable = ordre d'insertion dans MASTERS). */
export const ITINERANT_MASTERS = Object.values(MASTERS).filter((m) => m.itinerant)

/** Cadence de rotation des itinérants (jours). DÉCISION #3 : 4 jours (bloc de rotation). */
export const ITINERANT_ROTATION_DAYS = 4

// Agglomérations qui peuvent accueillir un maître de passage (ORDRE = seed de sélection
// d'hôte par bloc). Les 6 agglos du monde (2 villes + 4 villages). Codées en dur pour
// éviter une dépendance croisée vers zones/worldGraph (données pures).
export const ITINERANT_HOST_ORDER = [
  'greywatch',
  'millhaven',
  'ironhaven',
  'stonehaven',
  'duskreach',
  'ashfall_post',
]
const ITINERANT_HOST_LOCATIONS = new Set(ITINERANT_HOST_ORDER)

/** Une localité peut-elle accueillir un maître de passage ? (agglomération). */
export function isItinerantHostLocation(locationId) {
  return ITINERANT_HOST_LOCATIONS.has(locationId)
}

/** Bloc de rotation courant : change tous les ITINERANT_ROTATION_DAYS jours (dès dayCount 0). */
export function itinerantRotationBlock(dayCount = 1) {
  return Math.floor((dayCount ?? 1) / ITINERANT_ROTATION_DAYS)
}

/**
 * Index de « combo » (paire maître × agglo) du bloc courant, ∈ [0, nbMaîtres×nbAgglos).
 * Énumère déterministe­ment toutes les paires ; base commune de master/host (voir en-tête).
 */
function itinerantComboIndex(dayCount = 1) {
  const nM = ITINERANT_MASTERS.length
  const nH = ITINERANT_HOST_ORDER.length
  if (nM === 0 || nH === 0) return 0
  return itinerantRotationBlock(dayCount) % (nM * nH)
}

/**
 * MST08 — Le maître itinérant « de passage » pour un jour donné (ou null si aucun).
 * maître = ITINERANT_MASTERS[combo % nbMaîtres] : avance d'un cran chaque bloc.
 */
export function getItinerantMasterForDay(dayCount = 1) {
  const list = ITINERANT_MASTERS
  if (list.length === 0) return null
  return list[itinerantComboIndex(dayCount) % list.length]
}

/**
 * DÉCISION #3 — L'agglomération-hôte de l'itinérant pour un jour donné (id, ou null si aucune
 * agglo n'est configurée). hôte = ITINERANT_HOST_ORDER[floor(combo / nbMaîtres) % nbAgglos] :
 * avance tous les nbMaîtres blocs → toute agglo finit par accueillir chaque focus.
 */
export function getItinerantHostForDay(dayCount = 1) {
  const hosts = ITINERANT_HOST_ORDER
  const nM = ITINERANT_MASTERS.length
  if (hosts.length === 0 || nM === 0) return null
  return hosts[Math.floor(itinerantComboIndex(dayCount) / nM) % hosts.length]
}

/**
 * MST08 / DÉCISION #3 — Maître(s) itinérant(s) présents à une localité un jour donné.
 * Tableau (0 ou 1 élément) : l'itinérant du bloc courant UNIQUEMENT si `locationId` est SON
 * agglomération-hôte du bloc (plus « partout à la fois »). Symétrique de getMastersAtLocation.
 */
export function getItinerantMastersAtLocation(locationId, dayCount = 1) {
  if (!isItinerantHostLocation(locationId)) return []
  if (getItinerantHostForDay(dayCount) !== locationId) return []
  const m = getItinerantMasterForDay(dayCount)
  return m ? [m] : []
}

/**
 * MST04/MST08 — Toutes les quêtes de maître (initiation + skillQuestPool) surfaçables à une
 * localité : celles des maîtres FIXES du lieu, PLUS — si `dayCount` est fourni — celles du
 * maître itinérant de passage ce jour-là (uniquement dans une agglomération). Renvoie des
 * ids (⊂ MASTER_QUESTS). Sans `dayCount`, comportement inchangé (fixes seuls, rétro-compat).
 */
export function getMasterQuestIdsAtLocation(locationId, dayCount = null) {
  const ids = []
  for (const m of getMastersAtLocation(locationId)) {
    ids.push(m.initiationQuestId, ...(m.skillQuestPool ?? []))
  }
  if (dayCount != null) {
    for (const m of getItinerantMastersAtLocation(locationId, dayCount)) {
      ids.push(m.initiationQuestId, ...(m.skillQuestPool ?? []))
    }
  }
  return ids
}
