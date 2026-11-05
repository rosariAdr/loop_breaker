// B5b/MQ-CHAIN01 + MQ-ELITETURN01 — moteur de chaîne (disponibilité, unlocks),
// résolveur de remise d'élite (consommation + escalade de rareté), hint ONB02.
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { useToastStore } from './toastStore'

const s = () => useGameStore.getState()
const setRes = (id, qty) =>
  useGameStore.setState((st) => ({
    hero: {
      ...st.hero,
      inventory: { ...st.hero.inventory, resources: { ...st.hero.inventory.resources, [id]: qty } },
    },
  }))

beforeEach(() => {
  s().resetGame()
  useToastStore.getState().clearToasts()
  localStorage.clear()
})

describe('MQ-CHAIN01 — disponibilité enchaînée', () => {
  it('mq01 est disponible au départ, mq02 non', () => {
    expect(s().isMainQuestAvailable('mq01_waking')).toBe(true)
    expect(s().isMainQuestAvailable('mq02_millhaven_road')).toBe(false)
  })

  it('compléter mq01 rend mq02 disponible', () => {
    s().startQuest('mq01_waking')
    s().completeQuest('mq01_waking')
    expect(s().world.completedQuests).toContain('mq01_waking')
    expect(s().isMainQuestAvailable('mq02_millhaven_road')).toBe(true)
    expect(s().isMainQuestAvailable('mq01_waking')).toBe(false) // déjà fait
  })
})

describe('MQ-CHAIN01 — un palier ouvre des nodes', () => {
  it('mq02 ouvre la localité millhaven', () => {
    setRes('earth_crystal', 3)
    s().startQuest('mq02_millhaven_road')
    s().completeQuest('mq02_millhaven_road')
    expect(s().world.unlockedNodes).toContain('millhaven')
  })

  it('mq03 ouvre les hunting spots wildmere_hills + crumbled_ruins', () => {
    s().startQuest('mq03_new_horizons')
    s().completeQuest('mq03_new_horizons')
    expect(s().world.unlockedNodes).toEqual(
      expect.arrayContaining(['wildmere_hills', 'crumbled_ruins']),
    )
  })
})

describe('MQ-ELITETURN01 — résolveur de remise', () => {
  it('consomme 3× l’item rare et octroie l’arme RARE (1ʳᵉ remise)', () => {
    setRes('earth_crystal', 3)
    s().startQuest('mq02_millhaven_road')
    s().completeQuest('mq02_millhaven_road')

    expect(s().hero.inventory.resources.earth_crystal).toBe(0) // consommés
    const weapon = s().hero.inventory.equipment.find((e) => e.templateId === 'oakheart_branch')
    expect(weapon).toBeDefined()
    expect(weapon.rarity).toBe('rare')
    expect(s().meta.eliteTurnins.oakheart_branch).toBe(1)
  })

  it('escalade la rareté à la remise suivante (rare → epic)', () => {
    // 1ʳᵉ remise
    setRes('earth_crystal', 3)
    s().startQuest('mq02_millhaven_road')
    s().completeQuest('mq02_millhaven_road')
    // 2ᵉ remise (simulée : on ré-arme la quête comme un turn-in répétable)
    useGameStore.setState((st) => ({
      world: {
        ...st.world,
        activeQuests: [...st.world.activeQuests, 'mq02_millhaven_road'],
        completedQuests: st.world.completedQuests.filter((q) => q !== 'mq02_millhaven_road'),
      },
    }))
    setRes('earth_crystal', 3)
    s().completeQuest('mq02_millhaven_road')

    const weapons = s().hero.inventory.equipment.filter((e) => e.templateId === 'oakheart_branch')
    expect(weapons.some((w) => w.rarity === 'epic')).toBe(true)
    expect(s().meta.eliteTurnins.oakheart_branch).toBe(2)
  })

  it('voie « rendre l’arme » : retire l’arme détenue puis rend la version supérieure', () => {
    // possède l'arme rare, pas les items → la remise consomme l'arme
    useGameStore.setState((st) => ({
      meta: { ...st.meta, eliteTurnins: { oakheart_branch: 1 } },
      hero: {
        ...st.hero,
        inventory: {
          ...st.hero.inventory,
          equipment: [
            {
              instanceId: 'old',
              templateId: 'oakheart_branch',
              rarity: 'rare',
              slot: 'weapon',
              stats: {},
            },
          ],
        },
      },
    }))
    s().startQuest('mq02_millhaven_road')
    s().completeQuest('mq02_millhaven_road')
    const weapons = s().hero.inventory.equipment.filter((e) => e.templateId === 'oakheart_branch')
    expect(weapons).toHaveLength(1) // l'ancienne retirée, la nouvelle ajoutée
    expect(weapons[0].rarity).toBe('epic')
  })
})

describe('ONB02 — hint au démarrage d’un palier d’élite', () => {
  it('accepter mq02 déclenche le tip mq_elite_turnin', () => {
    s().startQuest('mq02_millhaven_road')
    expect(s().meta.seenHints).toContain('mq_elite_turnin')
  })
})
