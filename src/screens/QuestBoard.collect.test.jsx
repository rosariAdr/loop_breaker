// FIX-QCARD-COLLECT01 — Régression : le QuestCard du board doit refléter l'objectif `collect`
// via la source unique `questObjectiveStatus` (et non un calcul local incomplet affichant 0/1),
// pour que l'affichage board == overlay == store (Claim seulement si réellement complet).
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { QuestCard } from './QuestBoard'
import { questObjectiveStatus } from '../data/quests'

afterEach(() => cleanup())

const collectQuest = {
  id: 'vq_greywatch_collect_wolf_fang',
  name: 'Gather Wolf Fang',
  flavorText: '',
  giverNpc: 'greywatch_elder',
  objectives: [
    {
      id: 'collect',
      type: 'collect',
      resourceId: 'wolf_fang',
      count: 5,
      label: 'Collect Wolf Fang',
    },
  ],
  reward: { gold: 30 },
}

describe('FIX-QCARD-COLLECT01 — objectif collect sur le board', () => {
  it('questObjectiveStatus : collect en delta (accepté) et 0 avant acceptation', () => {
    const state = {
      world: { questProgress: { [collectQuest.id]: { baseResources: { wolf_fang: 1 } } } },
      hero: { inventory: { resources: { wolf_fang: 3 } } },
      meta: {},
    }
    const [accepted] = questObjectiveStatus(collectQuest, state, { accepted: true })
    expect(accepted.current).toBe(2) // 3 détenus − 1 au snapshot
    expect(accepted.target).toBe(5)
    expect(accepted.done).toBe(false)

    const [notAccepted] = questObjectiveStatus(collectQuest, state, { accepted: false })
    expect(notAccepted.current).toBe(0) // carte « available » → pas de cumul
    expect(notAccepted.target).toBe(5)
  })

  it('carte active à 2/5 : affiche (2/5) — pas (0/1) — barre = 2, pas de Claim', () => {
    const status = [{ obj: collectQuest.objectives[0], current: 2, target: 5, done: false }]
    render(
      <QuestCard
        quest={collectQuest}
        questStatus="active"
        objectiveStatus={status}
        canComplete={false}
      />,
    )
    expect(screen.getByText('Collect Wolf Fang')).toBeInTheDocument()
    expect(screen.getByText('2/5')).toBeInTheDocument()
    expect(screen.queryByText('0/1')).toBeNull()
    expect(screen.queryByText('Claim')).toBeNull()
    const bar = screen.getByTestId('objective-progress')
    expect(bar.getAttribute('aria-valuenow')).toBe('2')
    expect(bar.getAttribute('aria-valuemax')).toBe('5')
  })

  it('carte active complète 5/5 : (5/5) done + bouton Claim', () => {
    const status = [{ obj: collectQuest.objectives[0], current: 5, target: 5, done: true }]
    render(
      <QuestCard
        quest={collectQuest}
        questStatus="active"
        objectiveStatus={status}
        canComplete={true}
        onComplete={() => {}}
      />,
    )
    expect(screen.getByText('Collect Wolf Fang')).toBeInTheDocument()
    expect(screen.getByText('5/5')).toBeInTheDocument()
    expect(screen.getByText('Claim')).toBeInTheDocument()
  })
})
