// DX-ERRTRACK01 — journal d'erreurs runtime (Sentry-lite localStorage)
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { logRuntimeError, getErrorLog, clearErrorLog } from './errorLog'

beforeEach(() => {
  localStorage.clear()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('errorLog — logRuntimeError / getErrorLog / clearErrorLog', () => {
  it('enregistre une entrée structurée (message + ts) en tête', () => {
    logRuntimeError(new Error('boom'), { source: 'test' })
    const log = getErrorLog()
    expect(log).toHaveLength(1)
    expect(log[0].message).toBe('boom')
    expect(log[0].source).toBe('test')
    expect(log[0].ts).toBeTruthy()
  })

  it('garde au plus 10 entrées (ring buffer, plus récentes en tête)', () => {
    for (let i = 0; i < 14; i++) logRuntimeError(new Error(`e${i}`))
    const log = getErrorLog()
    expect(log).toHaveLength(10)
    expect(log[0].message).toBe('e13') // la plus récente en tête
  })

  it('clearErrorLog vide le journal', () => {
    logRuntimeError(new Error('x'))
    clearErrorLog()
    expect(getErrorLog()).toEqual([])
  })

  it('getErrorLog tolère un contenu corrompu', () => {
    localStorage.setItem('lb_errors', 'not json')
    expect(getErrorLog()).toEqual([])
  })
})
