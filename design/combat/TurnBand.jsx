import React from 'react'

/**
 * The visible turn order — the band above the arena (CMB-ATB02).
 *
 * Borrowed from Chained Echoes: diamond portraits, side coded by frame colour,
 * only two markers (acting / next). It takes a variable number of fighters
 * without changing shape, which is why it survives companions (v1.61).
 */
export function TurnBand({ entries = [], where, slots = 7, ...rest }) {
  const shown = entries.slice(0, slots)
  return (
    <div className="lb-cbt-band" {...rest}>
      <div className="lb-cbt-queue" role="list" aria-label="Turn order">
        {shown.map((e, i) => (
          <span
            key={i}
            role="listitem"
            className={[
              'lb-cbt-slot',
              e.foe && 'lb-cbt-slot--foe',
              i === 0 && 'lb-cbt-slot--now',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-label={i === 0 ? `${e.name ?? e.initial}, acting` : e.name ?? e.initial}
          >
            <span>{e.initial}</span>
          </span>
        ))}
        <span className="lb-cbt-band__tag">Act → Next</span>
      </div>
      {where && <span className="lb-cbt-band__where">{where}</span>}
    </div>
  )
}
