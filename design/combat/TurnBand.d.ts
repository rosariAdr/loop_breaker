import * as React from 'react'

export interface TurnEntry {
  initial: string
  /** Red frame when true, gold otherwise. */
  foe?: boolean
  /** Accessible name for the slot. */
  name?: string
}

/**
 * The visible turn order above the arena (CMB-ATB02). The first entry is the
 * one acting now.
 */
export interface TurnBandProps {
  entries?: TurnEntry[]
  /** Right-hand context line, e.g. "Ashenvale Forest · Lv 1–8 · Turn 3". */
  where?: React.ReactNode
  /** How many upcoming turns to show. 5–7 stays readable. */
  slots?: number
}

export function TurnBand(props: TurnBandProps): React.JSX.Element
