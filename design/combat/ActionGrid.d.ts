import * as React from 'react'

export interface ActionVerb {
  id: string
  label: string
  /** Tempo rank shown greyed next to the verb, e.g. "×1.0". */
  rank?: string
}

export interface ActionSkill {
  id?: string
  name: string
  /** Mana cost. `0` renders as an em dash. */
  cost: number
  /** Tempo rank — the cost in turns (CMB-COST01). */
  rank?: 'fast' | 'norm' | 'slow'
  /** One line, shown in the ribbon on hover. */
  description?: string
}

/**
 * The action console — fixed-size verb column, the selected verb's contents,
 * and a one-line ribbon instead of floating tooltips.
 */
export interface ActionGridProps {
  verbs?: ActionVerb[]
  activeVerb?: string
  onVerb?: (id: string) => void
  skills?: ActionSkill[]
  ribbon?: React.ReactNode
  onHoverSkill?: (skill: ActionSkill) => void
  onPickSkill?: (skill: ActionSkill) => void
}

export function ActionGrid(props: ActionGridProps): React.JSX.Element
