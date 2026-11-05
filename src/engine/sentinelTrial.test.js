import { describe, expect, it } from 'vitest'
import { EMPTY_TRIAL, resolveSentinelTrial } from './sentinelTrial'

const active = () => ({ ...EMPTY_TRIAL, active: true })
describe('Sentinel Trial', () => {
  it('awards exactly one guaranteed orb per pair, then requires reactivation', () => {
    const first = resolveSentinelTrial(active(), 'victory', ['graven_sentinel'])
    expect(first).toEqual({ trial: { active: true, wins: 1, completed: 0 }, orbs: 0 })
    const second = resolveSentinelTrial(first.trial, 'victory', [
      'graven_sentinel',
      'graven_sentinel',
    ])
    expect(second).toEqual({ trial: { active: false, wins: 0, completed: 1 }, orbs: 1 })
    expect(resolveSentinelTrial(second.trial, 'victory', ['graven_sentinel']).orbs).toBe(0)
  })
  it.each(['defeat', 'fled'])('%s resets the streak without ending the trial', (outcome) => {
    expect(resolveSentinelTrial({ ...active(), wins: 1 }, outcome, ['graven_sentinel'])).toEqual({
      trial: active(),
      orbs: 0,
    })
  })
  it.each([['ashwood_wolf'], ['graven_sentinel', 'ashwood_wolf'], []])(
    'rejects other or mixed encounters: %j',
    (...ids) => {
      expect(resolveSentinelTrial({ ...active(), wins: 1 }, 'victory', ids)).toEqual({
        trial: active(),
        orbs: 0,
      })
    },
  )
})
