// QSV2-DROPDUP01 — retrait des quêtes legacy doublonnées de la chaîne principale au même
// village (first_blood ↔ mq01, nc_oakheart_elite ↔ mq02, toutes deux à Greywatch après
// re-domiciliation). Le registre et la balance sont purgés, et une save qui référence
// encore ces ids est FILTRÉE à la migration (ids inconnus retirés) sans casser le board.
import { describe, it, expect } from 'vitest'
import { QUESTS, getQuestById, getQuestIssuer } from './quests'
import { QUEST_BALANCE } from './questBalance'
import { generateVillageQuestPool } from './villageQuests'
import { runMigrations } from '../store/migrations'

describe('QSV2-DROPDUP01 — quêtes legacy doublonnées retirées', () => {
  it('first_blood et nc_oakheart_elite ne sont plus au registre', () => {
    expect(QUESTS.first_blood).toBeUndefined()
    expect(QUESTS.nc_oakheart_elite).toBeUndefined()
    expect(getQuestById('first_blood')).toBeNull()
    expect(getQuestById('nc_oakheart_elite')).toBeNull()
  })

  it('proof_of_worth (« atteindre Lv3 ») est conservée — pas un doublon de cible', () => {
    expect(QUESTS.proof_of_worth).toBeDefined()
    expect(getQuestById('proof_of_worth')).toBeTruthy()
  })

  it('la balance ne référence plus les ids retirés', () => {
    expect(QUEST_BALANCE.first_blood).toBeUndefined()
    expect(QUEST_BALANCE.nc_oakheart_elite).toBeUndefined()
  })

  it('aucune quête autorée ne doublonne une cible de la MQ au même lieu (anti-régression)', () => {
    // mq01 (5× ashwood_wolf) et mq02 (old_oakheart) sont émises à Greywatch : aucune
    // quête statique de QUESTS ne doit re-cibler ces monstres depuis Greywatch.
    const mqTargets = new Set(['ashwood_wolf', 'old_oakheart'])
    for (const q of Object.values(QUESTS)) {
      if (getQuestIssuer(q) !== 'greywatch') continue
      for (const obj of q.objectives ?? []) {
        if (obj.type === 'kill') expect(mqTargets.has(obj.monsterId)).toBe(false)
      }
    }
  })
})

describe('QSV2-DROPDUP01 — migration save (ids inconnus filtrés)', () => {
  const baseSave = (world) => ({
    saveVersion: 3,
    hero: {},
    meta: {},
    world,
  })

  it('une save avec les ids retirés actifs/complétés est nettoyée sans casser', () => {
    const save = runMigrations(
      baseSave({
        activeQuests: ['first_blood', 'clear_the_marsh'],
        completedQuests: ['nc_oakheart_elite', 'proof_of_worth'],
        questProgress: { first_blood: { baseKills: { ashwood_wolf: 2 } }, clear_the_marsh: {} },
      }),
    )
    expect(save.world.activeQuests).toEqual(['clear_the_marsh'])
    expect(save.world.completedQuests).toEqual(['proof_of_worth'])
    expect(Object.keys(save.world.questProgress)).toEqual(['clear_the_marsh'])
    // getQuestById résout tout ce qui reste → le board/l'overlay ne rendront jamais un id mort
    for (const id of [...save.world.activeQuests, ...save.world.completedQuests]) {
      expect(getQuestById(id)).toBeTruthy()
    }
  })

  it('les quêtes de VILLAGE générées (vq_*) survivent au filtre', () => {
    const vq = generateVillageQuestPool('greywatch')[0]
    expect(vq).toBeDefined()
    const save = runMigrations(
      baseSave({ activeQuests: [vq.id, 'first_blood'], completedQuests: [vq.id] }),
    )
    expect(save.world.activeQuests).toEqual([vq.id])
    expect(save.world.completedQuests).toEqual([vq.id])
  })

  it('les quêtes église / maître / MQ / onboarding survivent au filtre', () => {
    const save = runMigrations(
      baseSave({
        activeQuests: ['church_thin_the_pack', 'master_init_aldric'],
        completedQuests: ['mq01_waking', 'onb_first_edge'],
      }),
    )
    expect(save.world.activeQuests).toEqual(['church_thin_the_pack', 'master_init_aldric'])
    expect(save.world.completedQuests).toEqual(['mq01_waking', 'onb_first_edge'])
  })
})
