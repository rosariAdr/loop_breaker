import * as React from 'react'

/**
 * One fighter on the battle line — ally or foe, with its floor health bar and,
 * for foes, the telegraphed intent.
 */
export interface CombatantProps {
  name: string
  /** Single glyph shown in the body — placeholder until CONT01 sprites land. */
  initial: string
  /** Frame colour codes the side: gold ally, red foe. */
  side?: 'ally' | 'foe'
  /** Health in bar segments, not raw HP — the bar is read, not counted. */
  hp?: number
  maxHp?: number
  /** Damage range or move name, e.g. "⚔ 6–9 · Corwin". Never reveals a crit. */
  intent?: string
  /** Oversized single foe — an elite encounter reads before its name does. */
  elite?: boolean
  /** Amber targeting ring. */
  selected?: boolean
  /** Hide the floor bar (e.g. a direction that puts health in a roster table). */
  showBar?: boolean
  onSelect?: () => void
}

export function Combatant(props: CombatantProps): React.JSX.Element
