// MST01/MST02/MST05 — engagement de maître : état de run, verrou immuable, flux d'initiation,
// gating des quêtes de maître, reset à la transmigration.
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { useToastStore } from './toastStore'
import { INITIAL_HERO } from './initialState'
import { normalizeSave } from './migrations'
import { MASTER_QUESTS } from '../data/masterQuests'

const s = () => useGameStore.getState()

// Fait progresser une quête de kill jusqu'à complétion (kills posés APRÈS l'acceptation
// pour que le delta vs snapshot compte).
const bumpKills = (monsterId, count) =>
  useGameStore.setState((st) => ({
    world: {
      ...st.world,
      monsterKillCounts: { ...st.world.monsterKillCounts, [monsterId]: count },
    },
  }))

beforeEach(() => {
  s().resetGame()
  useToastStore.getState().clearToasts()
  localStorage.clear()
})

describe('MST01 — état d’engagement (masterId)', () => {
  it('démarre à null (aucun maître, choix libre — pas d’auto-assignation)', () => {
    expect(INITIAL_HERO.masterId).toBeNull()
    expect(s().hero.masterId).toBeNull()
  })

  it('setMaster pose le maître engagé et renvoie true', () => {
    expect(s().setMaster('sir_aldric')).toBe(true)
    expect(s().hero.masterId).toBe('sir_aldric')
  })

  it('setMaster rejette un id inconnu (renvoie false, ne pose rien)', () => {
    expect(s().setMaster('nope')).toBe(false)
    expect(s().hero.masterId).toBeNull()
  })

  it('setMaster est IMMUABLE : rejette un second engagement (renvoie false, conserve le 1er)', () => {
    s().setMaster('sir_aldric')
    expect(s().setMaster('sir_aldric')).toBe(false)
    expect(s().hero.masterId).toBe('sir_aldric')
  })
})

describe('MST02 — verrou d’engagement via quête d’initiation', () => {
  it('valider l’initiation engage le héros (setMaster) et verrouille', () => {
    const q = MASTER_QUESTS.master_init_aldric
    expect(s().hero.masterId).toBeNull()
    s().startQuest(q.id)
    bumpKills('ashwood_wolf', q.objectives[0].count)
    expect(s().isQuestComplete(q.id)).toBe(true)
    s().completeQuest(q.id)
    expect(s().hero.masterId).toBe('sir_aldric') // engagé
    expect(s().world.completedQuests).toContain(q.id)
  })

  it('les quêtes de maître (non-initiation) sont VERROUILLÉES tant qu’aucune initiation validée', () => {
    const skillQuest = MASTER_QUESTS.master_sharpen_strike
    expect(s().isMasterQuestLocked(skillQuest)).toBe(true)
    // startQuest refuse de l’accepter tant que verrouillée
    s().startQuest(skillQuest.id)
    expect(s().world.activeQuests).not.toContain(skillQuest.id)
  })

  it('l’initiation elle-même n’est jamais verrouillée', () => {
    expect(s().isMasterQuestLocked(MASTER_QUESTS.master_init_aldric)).toBe(false)
    s().startQuest('master_init_aldric')
    expect(s().world.activeQuests).toContain('master_init_aldric')
  })

  it('une fois engagé, les quêtes du maître engagé se déverrouillent', () => {
    s().setMaster('sir_aldric')
    const skillQuest = MASTER_QUESTS.master_sharpen_strike // dans le pool d’Aldric
    expect(s().isMasterQuestLocked(skillQuest)).toBe(false)
    s().startQuest(skillQuest.id)
    expect(s().world.activeQuests).toContain(skillQuest.id)
  })

  it('la quête d’un AUTRE maître reste verrouillée même engagé (immuabilité de choix)', () => {
    s().setMaster('sir_aldric')
    // quête de maître fictive hors du pool d’Aldric → doit rester verrouillée
    const foreign = { id: 'phantom_master_quest', isMasterQuest: true }
    expect(s().isMasterQuestLocked(foreign)).toBe(true)
  })

  it('une quête non-maître n’est jamais concernée par le verrou', () => {
    expect(s().isMasterQuestLocked({ id: 'first_blood' })).toBe(false)
  })

  it('re-valider l’initiation n’écrase pas l’engagement (setMaster idempotent)', () => {
    const q = MASTER_QUESTS.master_init_aldric
    s().startQuest(q.id)
    bumpKills('ashwood_wolf', q.objectives[0].count)
    s().completeQuest(q.id)
    expect(s().hero.masterId).toBe('sir_aldric')
    // simule une re-complétion (quête ré-armée) — l’engagement ne change pas
    useGameStore.setState((st) => ({
      world: {
        ...st.world,
        activeQuests: [...st.world.activeQuests, q.id],
        completedQuests: st.world.completedQuests.filter((x) => x !== q.id),
      },
    }))
    s().completeQuest(q.id)
    expect(s().hero.masterId).toBe('sir_aldric')
  })
})

describe('MST06/MST07 — initiations des nouveaux maîtres', () => {
  const cases = [
    { master: 'academy_master', init: 'master_init_vael' },
    { master: 'court_mage', init: 'master_init_elyndra' },
    { master: 'pit_master', init: 'master_init_bulgar' },
  ]

  it.each(cases)('valider $init engage $master et verrouille', ({ master, init }) => {
    const q = MASTER_QUESTS[init]
    expect(s().hero.masterId).toBeNull()
    s().startQuest(q.id)
    bumpKills(q.objectives[0].monsterId, q.objectives[0].count)
    expect(s().isQuestComplete(q.id)).toBe(true)
    s().completeQuest(q.id)
    expect(s().hero.masterId).toBe(master)
    // second engagement rejeté (immuable)
    expect(s().setMaster(master === 'court_mage' ? 'pit_master' : 'court_mage')).toBe(false)
  })

  it('engagé chez Vael : les quêtes de Bulgar (autre maître) restent verrouillées', () => {
    s().setMaster('academy_master')
    expect(s().isMasterQuestLocked(MASTER_QUESTS.master_soul_rend)).toBe(false) // pool de Vael
    expect(s().isMasterQuestLocked(MASTER_QUESTS.master_pit_reckless)).toBe(true) // pool de Bulgar
    s().startQuest('master_pit_reckless')
    expect(s().world.activeQuests).not.toContain('master_pit_reckless')
  })

  it('les initiations des nouveaux maîtres ne sont jamais verrouillées', () => {
    for (const { init } of cases) {
      expect(s().isMasterQuestLocked(MASTER_QUESTS[init])).toBe(false)
    }
  })

  it('un skill rerouté (soul_crush) est octroyé en complétant la quête de maître arcane', () => {
    s().setMaster('academy_master')
    const q = MASTER_QUESTS.master_soul_rend // reward.skill soul_crush, objectif wing_gust Lv2
    s().startQuest(q.id)
    useGameStore.setState((st) => ({
      hero: { ...st.hero, activeSkills: [{ skillId: 'wing_gust', level: 2, xp: 0 }] },
    }))
    expect(s().isQuestComplete(q.id)).toBe(true)
    s().completeQuest(q.id)
    expect(s().hero.inventory.manaStones.some((m) => m.skillId === 'soul_crush')).toBe(true)
  })
})

describe('MST01 — portée RUN : reset à la transmigration', () => {
  it('applyTransmigration réinitialise masterId à null', () => {
    s().setMaster('sir_aldric')
    expect(s().hero.masterId).toBe('sir_aldric')
    // prépare une renaissance minimale
    s().confirmInheritance(null, null, null)
    s().applyTransmigration({})
    expect(s().hero.masterId).toBeNull() // réinitialisé comme skills/stats
  })

  it('resetGame (nouveau run) réinitialise masterId à null', () => {
    s().setMaster('sir_aldric')
    s().resetGame()
    expect(s().hero.masterId).toBeNull()
  })
})

describe('MST01 — persistance du champ dans le run (migrations)', () => {
  it('normalizeSave conserve un masterId engagé (persisté dans le run)', () => {
    const save = { hero: { masterId: 'sir_aldric' }, world: {}, meta: {} }
    expect(normalizeSave(save).hero.masterId).toBe('sir_aldric')
  })

  it('normalizeSave backfill masterId à null pour une vieille save (champ absent)', () => {
    const save = { hero: { name: 'Old' }, world: {}, meta: {} }
    expect(normalizeSave(save).hero.masterId).toBeNull()
  })

  it('normalizeSave répare un masterId malformé (non-string → null)', () => {
    const save = { hero: { masterId: 42 }, world: {}, meta: {} }
    expect(normalizeSave(save).hero.masterId).toBeNull()
  })
})
