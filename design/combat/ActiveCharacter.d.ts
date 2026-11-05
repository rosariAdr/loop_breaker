import * as React from 'react'

/**
 * The acting character's block — portrait, HP/MP gauges and the permanent stat
 * grid that stays on screen while the action is being chosen.
 */
export interface ActiveCharacterProps {
  name: string
  /** Class or title, shown in italics under the name. */
  role?: string
  initial: string
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  /** Short uppercase keys → values, e.g. `{ STR: 18, AGI: 14, SPD: 4 }`. */
  stats?: Record<string, React.ReactNode>
}

export function ActiveCharacter(props: ActiveCharacterProps): React.JSX.Element
