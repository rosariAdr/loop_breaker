// Quêtes du jeu
// Objectives: { type: 'kill', monsterId, count } | { type: 'level', targetLevel }
// Rewards: { skill: { skillId, level }, gold, reputationTokens, consumables, ... }

import { CHURCH_QUESTS, CHURCH_QUEST_NPC } from './churchQuests'
import { MASTER_QUESTS, MASTER_QUEST_NPC } from './masterQuests'
import { MONSTERS } from './monsters'

// ── NPCs donneurs (Q08) ──────────────────────────────────────────────────────
export const QUEST_NPCS = {
  sir_aldric: {
    id: 'sir_aldric',
    name: 'Sir Aldric',
    title: 'Knight of Millhaven',
    location: 'ironhaven',
    sigil: '⚔',
  },
  ironhaven_captain: {
    id: 'ironhaven_captain',
    name: 'Captain Vaern',
    title: 'Captain of the Ironhaven Guard',
    location: 'ironhaven',
    sigil: '🛡',
  },
  greywatch_elder: {
    id: 'greywatch_elder',
    name: 'Elder Moira',
    title: 'Elder of Greywatch Village',
    location: 'greywatch',
    sigil: '🌿',
  },
  // NPC02 — donneur supplémentaire (livraisons / commandes d'artisanat)
  merchant_pell: {
    id: 'merchant_pell',
    name: 'Pell the Trader',
    title: 'Travelling Merchant',
    location: 'ironhaven',
    sigil: '🛒',
  },
}

export const QUESTS = {
  // ── Sir Aldric (existantes) ────────────────────────────────────────────────
  first_blood: {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Prove your worth by hunting down Ashwood Wolves in the forest.',
    giverNpc: 'sir_aldric',
    flavorText: '"The wolves grow bold. Show them what fear looks like."',
    objectives: [
      {
        id: 'kill_wolves',
        type: 'kill',
        monsterId: 'ashwood_wolf',
        count: 5,
        label: 'Kill Ashwood Wolves',
      },
    ],
    reward: {
      skill: { skillId: 'counter_strike', level: 1 },
      gold: 50,
      reputationTokens: 0,
    },
  },

  proof_of_worth: {
    id: 'proof_of_worth',
    name: 'Proof of Worth',
    description: "Grow strong enough to earn Sir Aldric's respect.",
    giverNpc: 'sir_aldric',
    flavorText: '"Strength is earned through trials. Return when you have grown."',
    objectives: [{ id: 'reach_level', type: 'level', targetLevel: 3, label: 'Reach Level 3' }],
    reward: {
      skill: { skillId: 'veterans_resolve', level: 1 },
      gold: 30,
      reputationTokens: 0,
    },
  },

  clear_the_marsh: {
    id: 'clear_the_marsh',
    name: 'Clear the Marsh',
    description: 'Travelers have been disappearing near the Thornmarsh. End the serpent threat.',
    giverNpc: 'sir_aldric',
    flavorText: '"Three merchants lost this week alone. The marsh must be cleansed."',
    objectives: [
      {
        id: 'kill_serpents',
        type: 'kill',
        monsterId: 'marsh_serpent',
        count: 3,
        label: 'Kill Marsh Serpents',
      },
    ],
    reward: {
      skill: { skillId: 'cleave', level: 1 },
      gold: 80,
      reputationTokens: 0,
    },
  },

  // ── Q03 — Quêtes boss donjon (Captain Vaern) ──────────────────────────────
  silence_the_crypt: {
    id: 'silence_the_crypt',
    name: 'Silence the Crypt',
    description: 'End the Crypt Keeper who commands the hollow dead of Ashenvale.',
    giverNpc: 'ironhaven_captain',
    flavorText: '"Our scouts have not returned. The crypt must fall, or no one is safe."',
    objectives: [
      {
        id: 'kill_crypt_keeper',
        type: 'kill',
        monsterId: 'hollow_crypt_boss',
        count: 1,
        label: 'Slay the Crypt Keeper',
      },
    ],
    reward: {
      skill: { skillId: 'soul_crush', level: 1 },
      gold: 200,
      reputationTokens: 0,
    },
  },

  storm_the_citadel: {
    id: 'storm_the_citadel',
    name: 'Storm the Citadel',
    description: 'The Lord of the Forsaken rules Grimspire. Break his reign.',
    giverNpc: 'ironhaven_captain',
    flavorText: '"No army has taken the Citadel. A lone hero might. Go — prove us wrong."',
    objectives: [
      {
        id: 'kill_forsaken_lord',
        type: 'kill',
        monsterId: 'forsaken_citadel_boss',
        count: 1,
        label: 'Slay the Lord of the Forsaken',
      },
    ],
    reward: {
      skill: { skillId: 'forsaken_curse', level: 1 },
      gold: 450,
      reputationTokens: 0,
    },
  },

  end_the_demon: {
    id: 'end_the_demon',
    name: 'End the Demon',
    description: 'Malachar the Undying cannot die. But perhaps you can.',
    giverNpc: 'ironhaven_captain',
    flavorText: '"Four champions have tried. None returned. Yet here you stand."',
    objectives: [
      {
        id: 'kill_malachar',
        type: 'kill',
        monsterId: 'malachar',
        count: 1,
        label: 'Slay Malachar',
      },
    ],
    reward: {
      gold: 1000,
      reputationTokens: 0,
    },
  },

  // ── Q08 — Greywatch Elder (marais / ruines) ───────────────────────────────
  bog_purge: {
    id: 'bog_purge',
    name: 'Bog Purge',
    description: 'The Mire Slimes spread rot through the marsh. Cull their numbers.',
    giverNpc: 'greywatch_elder',
    flavorText: '"My grandson fell last harvest. Do this, and the village remembers you."',
    objectives: [
      // MON01 — re-ciblé depuis bog_shambler (retiré du Thornmarsh) vers mire_slime.
      {
        id: 'kill_mire_slimes',
        type: 'kill',
        monsterId: 'mire_slime',
        count: 4,
        label: 'Kill Mire Slimes',
      },
    ],
    reward: {
      gold: 120,
      reputationTokens: 0,
    },
  },

  ruins_cleanse: {
    id: 'ruins_cleanse',
    name: 'Cleanse the Ruins',
    description: 'Ancient specters haunt the Crumbled Ruins. End their restless watch.',
    giverNpc: 'greywatch_elder',
    flavorText: '"The dead do not rest here. They remember. They hunger."',
    objectives: [
      {
        id: 'kill_ruin_specters',
        type: 'kill',
        monsterId: 'ruin_specter',
        count: 3,
        label: 'Kill Ruin Specters',
      },
      {
        id: 'kill_hollow_knights',
        type: 'kill',
        monsterId: 'hollow_knight',
        count: 2,
        label: 'Kill Hollow Knights',
      },
    ],
    reward: {
      gold: 180,
      reputationTokens: 0,
    },
  },

  // ── NPC02 — 10 quêtes de contenu (rangs Cuivre → Argent) ──────────────────
  // Élites · donjon · livraison/exploration · commandes d'artisanat. Récompenses Q09 variées.

  // Cuivre
  nc_thin_the_boars: {
    id: 'nc_thin_the_boars',
    name: 'Boar Trouble',
    description: 'Tuskmaw boars trample the eastern fields. Thin their number.',
    giverNpc: 'sir_aldric',
    flavorText: '"They\'ve gored two oxen this week. Put them down before it\'s a farmhand."',
    objectives: [
      {
        id: 'kill_boars',
        type: 'kill',
        monsterId: 'tuskmaw_boar',
        count: 4,
        label: 'Kill Tuskmaw Boars',
      },
    ],
    reward: { gold: 60, reputationTokens: 0, consumables: { hp_potion_small: 2 } },
  },

  nc_oakheart_elite: {
    id: 'nc_oakheart_elite',
    name: 'The Old Oak Walks',
    description: 'Old Oakheart, an ancient elite of the forest, has awoken. Fell it.',
    giverNpc: 'sir_aldric',
    flavorText: '"Some say it remembers the first fire. I say it burns like any other."',
    objectives: [
      {
        id: 'kill_oakheart',
        type: 'kill',
        monsterId: 'old_oakheart',
        count: 1,
        label: 'Slay Old Oakheart (elite)',
      },
    ],
    reward: {
      gold: 120,
      reputationTokens: 5,
      equipment: { templateId: 'leather_armor', rarity: 'rare' },
    },
  },

  nc_scout_marsh: {
    id: 'nc_scout_marsh',
    name: 'Eyes on the Marsh',
    description: 'Scout the Thornmarsh and report what stirs there.',
    giverNpc: 'greywatch_elder',
    flavorText: '"Walk it, mark it, come back breathing. That\'s all I ask."',
    objectives: [
      { id: 'visit_marsh', type: 'visit', spotId: 'thornmarsh', label: 'Explore the Thornmarsh' },
    ],
    reward: { gold: 50, reputationTokens: 0, resources: { marsh_venom: 2 } },
  },

  nc_deliver_ruins: {
    id: 'nc_deliver_ruins',
    name: 'A Package for the Ruins',
    description: 'Carry a sealed crate to the watch-camp at the Crumbled Ruins.',
    giverNpc: 'merchant_pell',
    flavorText: '"Don\'t open it. Don\'t shake it. Just get it there in one piece."',
    objectives: [
      {
        id: 'visit_ruins',
        type: 'visit',
        spotId: 'crumbled_ruins',
        label: 'Deliver to the Crumbled Ruins',
      },
    ],
    reward: { gold: 80, reputationTokens: 0, consumables: { stamina_ration: 2 } },
  },

  nc_forge_offering: {
    id: 'nc_forge_offering',
    name: "Pell's Standing Order",
    description: 'Pell needs crafted goods to resell. Craft a few items of any kind.',
    giverNpc: 'merchant_pell',
    flavorText: '"Make me something I can sell, and I\'ll make it worth your while."',
    objectives: [{ id: 'craft_three', type: 'craft', count: 3, label: 'Craft 3 items' }],
    reward: { gold: 70, reputationTokens: 0, resources: { rusted_iron: 3 } },
  },

  // Argent
  nc_fenrot_elite: {
    id: 'nc_fenrot_elite',
    name: 'The Devourer of Thornmarsh',
    description: 'Fenrot the Devourer, an elite serpent-beast, hunts the marsh. End it.',
    giverNpc: 'greywatch_elder',
    flavorText: '"It swallowed my brother\'s hound whole. Bring me its fangs."',
    objectives: [
      {
        id: 'kill_fenrot',
        type: 'kill',
        monsterId: 'fenrot_devourer',
        count: 1,
        label: 'Slay Fenrot the Devourer (elite)',
      },
    ],
    reward: {
      gold: 160,
      reputationTokens: 5,
      equipment: { templateId: 'serpent_dagger', rarity: 'rare' },
    },
  },

  nc_graven_elite: {
    id: 'nc_graven_elite',
    name: 'The Graven Sentinel',
    description: 'An elite construct guards the inner ruins. Shatter its watch.',
    giverNpc: 'ironhaven_captain',
    flavorText: '"It has stood there a thousand years. Make it kneel."',
    objectives: [
      {
        id: 'kill_graven',
        type: 'kill',
        monsterId: 'graven_sentinel',
        count: 1,
        label: 'Destroy the Graven Sentinel (elite)',
      },
    ],
    reward: { gold: 180, reputationTokens: 5, skill: { skillId: 'power_strike', level: 1 } },
  },

  nc_thunderhoof_elite: {
    id: 'nc_thunderhoof_elite',
    name: 'Thunder on the Hills',
    description: 'Thunderhoof, the elite beast of Wildmere, scatters every patrol. Bring it down.',
    giverNpc: 'ironhaven_captain',
    flavorText: '"You hear it before you see it. Make sure it never charges again."',
    objectives: [
      {
        id: 'kill_thunderhoof',
        type: 'kill',
        monsterId: 'thunderhoof',
        count: 1,
        label: 'Slay Thunderhoof (elite)',
      },
    ],
    reward: {
      gold: 200,
      reputationTokens: 5,
      equipment: { templateId: 'iron_helm', rarity: 'rare' },
    },
  },

  nc_explore_hills: {
    id: 'nc_explore_hills',
    name: 'Beyond the Treeline',
    description:
      'Chart the Wildmere Hills for the Ironhaven survey — and find the pass to Grimspire.',
    giverNpc: 'greywatch_elder',
    flavorText:
      '"The maps end where the hills begin. Help us draw the rest — and the road beyond."',
    objectives: [
      {
        id: 'visit_hills',
        type: 'visit',
        spotId: 'wildmere_hills',
        label: 'Explore the Wildmere Hills',
      },
    ],
    // PROG03 — voie « quête » : terminer cette exploration révèle Grimspire.
    reward: {
      gold: 90,
      reputationTokens: 0,
      stat: { name: 'strength', amount: 1 },
      unlockZone: 'grimspire',
    },
  },

  nc_artisans_trial: {
    id: 'nc_artisans_trial',
    name: "The Artisan's Trial",
    description: 'Prove your craft to the Ironhaven guild: forge a full batch of goods.',
    giverNpc: 'merchant_pell',
    flavorText: '"Five clean pieces, no excuses. Then we\'ll talk about real commissions."',
    objectives: [{ id: 'craft_five', type: 'craft', count: 5, label: 'Craft 5 items' }],
    reward: {
      gold: 150,
      reputationTokens: 0,
      equipment: { templateId: 'bone_plate', rarity: 'epic' },
    },
  },
}

// ── CHQ01 — Registre global (board + église) ──────────────────────────────────
// QUESTS reste le board "classique" (QuestBoard). Le store doit aussi résoudre les
// quêtes d'église par id, sans les faire apparaître sur le board principal.
// Résolution DYNAMIQUE (et pas un objet figé) pour rester correct si QUESTS est muté
// au runtime (cas des tests qui injectent des quêtes temporaires).

// Tous les NPC donneurs (board + église + maîtres), pour l'affichage des cartes de quête.
export const QUEST_NPC_REGISTRY = { ...QUEST_NPCS, ...CHURCH_QUEST_NPC, ...MASTER_QUEST_NPC }

/** Résout une quête par id (board, église ou maître). */
export function getQuestById(id) {
  return QUESTS[id] ?? CHURCH_QUESTS[id] ?? MASTER_QUESTS[id] ?? null
}

// ── GLD01/GLD02 — Répartition des quêtes du board par lieu (Guilde ville / auberge village) ──
// Prestige Q06 (rang aventurier requis) : seuil de tokens pour ACCEPTER une quête prestigieuse.
export const PRESTIGE_MIN_TOKENS = 10 // rang Argent (cf. RANK_TIERS)

/**
 * Une quête est "prestigieuse" (réservée à la Guilde, gardée par le rang) si elle
 * récompense beaucoup de réputation (≥3) ou vise un boss / demon lord / élite.
 */
export function isPrestigiousQuest(quest) {
  if (!quest) return false
  if ((quest.reward?.reputationTokens ?? 0) >= 3) return true
  return quest.objectives.some((o) => {
    if (o.type !== 'kill') return false
    const m = MONSTERS[o.monsterId]
    return !!m && (m.rank === 'boss' || m.rank === 'demon_lord' || m.rank === 'elite')
  })
}

/**
 * Quêtes du board affichées selon le lieu :
 * - 'guild' (ville) : tout le board (les prestigieuses sont gardées par le rang à l'acceptation).
 * - 'village'       : uniquement les quêtes standard (pool réduit).
 */
export function getBoardQuests(venue) {
  const all = Object.values(QUESTS)
  if (venue === 'village') return all.filter((q) => !isPrestigiousQuest(q))
  return all
}

// ── QSV2-LOCALITY01/TURNIN01 — lieu émetteur d'une quête ──────────────────────
// `issuedBy` explicite, sinon le `location` du PNJ donneur. Sert à la disponibilité
// (au lieu émetteur uniquement) et au rendu (lieu émetteur OU ville).
export function getQuestIssuer(quest) {
  if (!quest) return null
  return quest.issuedBy ?? QUEST_NPC_REGISTRY[quest.giverNpc]?.location ?? null
}

// ── FIX-QUESTSNAP01 — snapshot des compteurs cumulés à l'ACCEPTATION ──────────
// Capture les kills actuels des monstres ciblés + le craftCount courant, pour que la
// progression soit comptée en DELTA (une quête déjà « remplie » en cumulé n'est PLUS
// instantanément complétable à l'acceptation).
export function snapshotForQuest(quest, state) {
  const baseKills = {}
  for (const obj of quest?.objectives ?? []) {
    if (obj.type === 'kill') {
      baseKills[obj.monsterId] = state.world?.monsterKillCounts?.[obj.monsterId] ?? 0
    }
  }
  return { baseKills, baseCraft: state.meta?.craftCount ?? 0 }
}

// Statut par objectif, compté DEPUIS l'acceptation (kill/craft = delta vs snapshot ;
// level/visit/skill_levelup = seuils d'état). Source unique pour le store ET l'UI.
export function questObjectiveStatus(quest, state) {
  const base = state.world?.questProgress?.[quest?.id] ?? {}
  const baseKills = base.baseKills ?? {}
  const baseCraft = base.baseCraft ?? 0
  const skillLevels = heroSkillLevels(state.hero)
  return (quest?.objectives ?? []).map((obj) => {
    let raw = 0
    let target = 1
    if (obj.type === 'kill') {
      target = obj.count
      raw = Math.max(
        0,
        (state.world?.monsterKillCounts?.[obj.monsterId] ?? 0) - (baseKills[obj.monsterId] ?? 0),
      )
    } else if (obj.type === 'level') {
      target = obj.targetLevel
      raw = state.hero?.level ?? 1
    } else if (obj.type === 'visit') {
      target = 1
      raw = (state.world?.visitedSpots ?? []).includes(obj.spotId) ? 1 : 0
    } else if (obj.type === 'craft') {
      target = obj.count
      raw = Math.max(0, (state.meta?.craftCount ?? 0) - baseCraft)
    } else if (obj.type === 'skill_levelup') {
      target = obj.targetLevel
      raw = skillLevels[obj.skillId] ?? 0
    }
    return { obj, current: Math.min(raw, target), target, done: raw >= target }
  })
}

export function isQuestCompleteState(quest, state) {
  if (!quest) return false
  return questObjectiveStatus(quest, state).every((o) => o.done)
}

/**
 * ACA04 — Niveau le plus élevé possédé pour chaque skillId (équipé, divin ou en
 * réserve dans les mana stones). Sert aux objectifs `skill_levelup`.
 */
export function heroSkillLevels(hero) {
  const map = {}
  const all = [...(hero?.activeSkills ?? []), ...(hero?.passiveSkills ?? [])]
  if (hero?.divineSkill) all.push(hero.divineSkill)
  for (const s of hero?.inventory?.manaStones ?? []) all.push(s)
  for (const s of all) {
    if (!s?.skillId) continue
    map[s.skillId] = Math.max(map[s.skillId] ?? 0, s.level ?? 1)
  }
  return map
}
