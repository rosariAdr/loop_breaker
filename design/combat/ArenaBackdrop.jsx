import React from 'react'

/**
 * Painted arena plate for one hunting spot, with the elite ambience layer.
 *
 * CMB-DIR01 decision — an elite encounter is NOT a second painting: it reuses
 * the same plate and adds a darkened sky, embers and a red vignette. Five
 * illustrations instead of ten, and the contrast of bars and intents only has
 * to be validated once. Repainting a spot for elite later stays possible.
 */
export function ArenaBackdrop({ zone = 'ashenvale_forest', rank = 'common', src, ...rest }) {
  return (
    <div
      className="lb-cbt-backdrop"
      data-zone={zone}
      data-rank={rank}
      style={src ? { backgroundImage: `url(${src})`, backgroundSize: 'cover' } : undefined}
      aria-hidden="true"
      {...rest}
    />
  )
}
