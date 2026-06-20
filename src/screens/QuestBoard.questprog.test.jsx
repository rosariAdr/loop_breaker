// FIX-QUESTPROG01 — Régression : une quête NON acceptée (carte « available ») ne doit pas
// afficher le cumul de kills/crafts du joueur ; la progression delta ne court qu'à l'acceptation.
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { QuestCard } from './QuestBoard'

afterEach(() => cleanup())

const killQuest = {
  id: 'test_kill',
  name: 'The Waking',
  flavorText: 'wolves',
  giverNpc: 'greywatch_elder',
  objectives: [
    { id: 'k', type: 'kill', monsterId: 'ashwood_wolf', count: 5, label: 'Cull Ashwood Wolves' },
  ],
  reward: { gold: 60 },
}
const craftQuest = {
  id: 'test_craft',
  name: 'Artisan',
  flavorText: '',
  giverNpc: 'merchant_pell',
  objectives: [{ id: 'c', type: 'craft', count: 3, label: 'Craft items' }],
  reward: { gold: 50 },
}

describe('FIX-QUESTPROG01 — progression 0 sur les quêtes disponibles', () => {
  it('quête kill disponible : 0/5 même si 5 loups déjà tués (pas de cumul)', () => {
    render(<QuestCard quest={killQuest} questStatus="available" killCounts={{ ashwood_wolf: 5 }} />)
    expect(screen.getByText(/Cull Ashwood Wolves \(0\/5\)/)).toBeInTheDocument()
    expect(screen.queryByText(/\(5\/5\)/)).toBeNull()
  })

  it('quête craft disponible : 0/3 même avec un craftCount cumulé élevé', () => {
    render(<QuestCard quest={craftQuest} questStatus="available" craftCount={10} />)
    expect(screen.getByText(/Craft items \(0\/3\)/)).toBeInTheDocument()
  })

  it("quête kill active : progression = delta depuis le snapshot d'acceptation", () => {
    render(
      <QuestCard
        quest={killQuest}
        questStatus="active"
        killCounts={{ ashwood_wolf: 7 }}
        base={{ baseKills: { ashwood_wolf: 5 } }}
      />,
    )
    expect(screen.getByText(/Cull Ashwood Wolves \(2\/5\)/)).toBeInTheDocument() // 7 - 5 = 2
  })

  it('quête kill fraîchement acceptée (snapshot = kills actuels) : 0/5', () => {
    render(
      <QuestCard
        quest={killQuest}
        questStatus="active"
        killCounts={{ ashwood_wolf: 5 }}
        base={{ baseKills: { ashwood_wolf: 5 } }}
      />,
    )
    expect(screen.getByText(/Cull Ashwood Wolves \(0\/5\)/)).toBeInTheDocument()
  })
})
