// MST08 — engagement auprès d'un maître ITINÉRANT : l'initiation d'un itinérant engage
// le héros exactement comme un maître fixe (setMaster / isMasterQuestLocked réutilisés),
// et l'immuabilité du run vaut aussi entre fixe et itinérant.
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { useToastStore } from './toastStore'
import { MASTER_QUESTS } from '../data/masterQuests'
import { MASTERS } from '../data/masters'

const s = () => useGameStore.getState()

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

describe('MST08 — engagement via un maître itinérant', () => {
  const cases = [
    { master: 'flame_wanderer', init: 'master_init_pyra' },
    { master: 'frost_wanderer', init: 'master_init_kaira' },
    { master: 'savage_wanderer', init: 'master_init_grukk' },
  ]

  it('setMaster accepte un maître itinérant (présent dans MASTERS)', () => {
    for (const { master } of cases) {
      s().resetGame()
      expect(s().setMaster(master)).toBe(true)
      expect(s().hero.masterId).toBe(master)
    }
  })

  it.each(cases)('valider $init engage $master et verrouille le run', ({ master, init }) => {
    const q = MASTER_QUESTS[init]
    expect(s().hero.masterId).toBeNull()
    s().startQuest(q.id)
    bumpKills(q.objectives[0].monsterId, q.objectives[0].count)
    expect(s().isQuestComplete(q.id)).toBe(true)
    s().completeQuest(q.id)
    expect(s().hero.masterId).toBe(master)
    // immuable : un second engagement (même vers un fixe) est rejeté
    expect(s().setMaster('sir_aldric')).toBe(false)
    expect(s().hero.masterId).toBe(master)
  })

  it('les initiations itinérantes ne sont jamais verrouillées', () => {
    for (const { init } of cases) {
      expect(s().isMasterQuestLocked(MASTER_QUESTS[init])).toBe(false)
    }
  })

  it('engagé chez un itinérant : ses quêtes de skill se déverrouillent, celles des autres non', () => {
    s().setMaster('frost_wanderer') // maître de glace itinérant
    const own = MASTER_QUESTS[MASTERS.frost_wanderer.skillQuestPool[0]]
    expect(s().isMasterQuestLocked(own)).toBe(false)
    s().startQuest(own.id)
    expect(s().world.activeQuests).toContain(own.id)
    // quête d'un autre maître (fixe) → reste verrouillée
    expect(s().isMasterQuestLocked(MASTER_QUESTS.master_pit_reckless)).toBe(true)
  })

  it('engagé chez un fixe : l’initiation d’un itinérant reste verrouillée (déjà engagé)', () => {
    s().setMaster('sir_aldric')
    // l'initiation itinérante elle-même n'est pas "master-locked" (porte d'entrée), mais
    // setMaster refuse un 2e engagement → compléter l'initiation ne réengage pas.
    const q = MASTER_QUESTS.master_init_pyra
    s().startQuest(q.id)
    bumpKills(q.objectives[0].monsterId, q.objectives[0].count)
    s().completeQuest(q.id)
    expect(s().hero.masterId).toBe('sir_aldric') // engagement d'origine conservé
  })

  it('un skill de glace (frostbite) est octroyé en complétant une quête du maître de glace', () => {
    s().setMaster('frost_wanderer')
    const q = MASTER_QUESTS.master_frost_shard // objectif ice_shard Lv2 → reward frostbite
    s().startQuest(q.id)
    useGameStore.setState((st) => ({
      hero: { ...st.hero, activeSkills: [{ skillId: 'ice_shard', level: 2, xp: 0 }] },
    }))
    expect(s().isQuestComplete(q.id)).toBe(true)
    s().completeQuest(q.id)
    expect(s().hero.inventory.manaStones.some((m) => m.skillId === 'frostbite')).toBe(true)
  })
})

describe('MST08 — portée RUN : reset de l’engagement itinérant', () => {
  it('resetGame réinitialise un engagement itinérant à null', () => {
    s().setMaster('flame_wanderer')
    s().resetGame()
    expect(s().hero.masterId).toBeNull()
  })
})
