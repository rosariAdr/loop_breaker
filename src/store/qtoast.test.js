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

// QSV2-DROPDUP01 — fixture : mq01_waking (« The Waking », 5× ashwood_wolf) remplace first_blood.
describe('QTOAST01 — toast de progrès de quête', () => {
  it('un kill qui avance une quête active pousse un toast quest', () => {
    s().startQuest('mq01_waking') // kill 5 ashwood_wolf
    s().recordKill('ashwood_wolf')
    expect(questToasts().some((t) => /The Waking.*1\/5/.test(t.message))).toBe(true)
  })

  it('FIX-QTOAST-DUR01 — durées allongées : progrès 3200 ms, done 4000 ms', () => {
    s().startQuest('mq01_waking') // kill 5 ashwood_wolf
    s().recordKill('ashwood_wolf') // 1/5 → toast de progrès
    const prog = questToasts().find((t) => /The Waking.*1\/5/.test(t.message))
    expect(prog?.duration).toBe(3200)
    useToastStore.setState({ toasts: [] })
    for (let i = 0; i < 4; i++) s().recordKill('ashwood_wolf') // → 5/5 done
    const done = questToasts().find((t) => /The Waking.*5\/5/.test(t.message))
    expect(done?.duration).toBe(4000)
  })

  it('aucun toast pour un monstre hors objectif actif', () => {
    s().startQuest('mq01_waking')
    useToastStore.setState({ toasts: [] })
    s().recordKill('tuskmaw_boar')
    expect(questToasts()).toHaveLength(0)
  })

  it('pas de spam après complétion (raw > target)', () => {
    s().startQuest('mq01_waking')
    for (let i = 0; i < 5; i++) s().recordKill('ashwood_wolf') // 5/5
    useToastStore.setState({ toasts: [] })
    s().recordKill('ashwood_wolf') // 6e → raw 6 > 5 → aucun toast
    expect(questToasts()).toHaveLength(0)
  })
})
