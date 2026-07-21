import * as React from 'react'

/**
 * Painted arena plate for one hunting spot, plus the elite ambience layer.
 */
export interface ArenaBackdropProps {
  /** Hunting spot id — one painted plate per spot (`ASSET_PROMPTS` §11). */
  zone?: 'ashenvale_forest' | 'wildmere_hills' | 'crumbled_ruins' | 'thornmarsh' | 'hollow_crypt'
  /** `elite` overlays a darkened sky, embers and a red vignette on the same plate. */
  rank?: 'common' | 'elite'
  /** Final illustration (`/arenas/<zone>.png`). Omitted → the CSS stand-in. */
  src?: string
}

export function ArenaBackdrop(props: ArenaBackdropProps): React.JSX.Element
