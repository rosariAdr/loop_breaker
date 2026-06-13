// ONB01 — Tutoriel contextuel : registre de hints + triggerHint (one-shot, dédup,
// réglage désactivable) + câblage aux 1ères occurrences (quête / level-up / craft / mort).
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { useToastStore } from './toastStore'
import { HINTS, getHint, getMqTutorialHint } from '../data/hints'

const s = () => useGameStore.getState()

beforeEach(() => {
  s().resetGame()
  useToastStore.getState().clearToasts()
  localStorage.clear()
})

describe('ONB01 — registre de hints', () => {
  it('expose les hints clés (titre + texte) et null pour un id inconnu', () => {
    for (const id of [
      'idle_unlock',
      'first_quest',
      'first_levelup',
      'first_craft',
      'transmigration',
    ]) {
      expect(HINTS[id]?.title).toBeTruthy()
      expect(HINTS[id]?.text).toBeTruthy()
    }
    expect(getHint('nope')).toBeNull()
  })

  it('ONB02 (stub) — getMqTutorialHint renvoie null tant que MQ-CHAIN01 absent', () => {
    expect(getMqTutorialHint('mq01_first_blood')).toBeNull()
  })
})

describe('ONB01 — triggerHint', () => {
  it('affiche une fois, marque seenHints, et ne se répète pas', () => {
    s().triggerHint('first_quest')
    expect(s().meta.seenHints).toContain('first_quest')
    const fired = () =>
      useToastStore.getState().toasts.filter((t) => /Quest accepted/.test(t.message)).length
    expect(fired()).toBe(1)

    s().triggerHint('first_quest') // 2ᵉ fois → no-op
    expect(fired()).toBe(1)
  })

  it('no-op si le tutoriel est désactivé (settings.tutorials = false)', () => {
    s().setSetting('tutorials', false)
    s().triggerHint('first_levelup')
    expect(s().meta.seenHints).not.toContain('first_levelup')
  })

  it('no-op pour un id inconnu', () => {
    s().triggerHint('does_not_exist')
    expect(s().meta.seenHints).not.toContain('does_not_exist')
  })
})

describe('ONB01 — câblage des déclencheurs', () => {
  it('startQuest (1ère acceptation) → first_quest', () => {
    s().startQuest('first_blood')
    expect(s().meta.seenHints).toContain('first_quest')
  })

  it('gainExp suffisant pour level up → first_levelup', () => {
    s().gainExp(1000)
    expect(s().hero.level).toBeGreaterThan(1)
    expect(s().meta.seenHints).toContain('first_levelup')
  })

  it('incrementCraftCount → first_craft', () => {
    s().incrementCraftCount()
    expect(s().meta.seenHints).toContain('first_craft')
  })

  it('heroDeath → transmigration', () => {
    s().heroDeath('test')
    expect(s().meta.seenHints).toContain('transmigration')
  })
})
