// QTOAST01 — pop-up de progrès de quête (toast latéral) sur incrément d'objectif kill.
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { useToastStore } from './toastStore'

const s = () => useGameStore.getState()
const questToasts = () => useToastStore.getState().toasts.filter((t) => t.type === 'quest')

beforeEach(() => {
  s().resetGame()
  localStorage.clear()
  useToastStore.setState({ toasts: [] })
})

describe('QTOAST01 — toast de progrès de quête', () => {
  it('un kill qui avance une quête active pousse un toast quest', () => {
    s().startQuest('first_blood') // kill 5 ashwood_wolf
    s().recordKill('ashwood_wolf')
    expect(questToasts().some((t) => /First Blood.*1\/5/.test(t.message))).toBe(true)
  })

  it('aucun toast pour un monstre hors objectif actif', () => {
    s().startQuest('first_blood')
    useToastStore.setState({ toasts: [] })
    s().recordKill('tuskmaw_boar')
    expect(questToasts()).toHaveLength(0)
  })

  it('pas de spam après complétion (raw > target)', () => {
    s().startQuest('first_blood')
    for (let i = 0; i < 5; i++) s().recordKill('ashwood_wolf') // 5/5
    useToastStore.setState({ toasts: [] })
    s().recordKill('ashwood_wolf') // 6e → raw 6 > 5 → aucun toast
    expect(questToasts()).toHaveLength(0)
  })
})
