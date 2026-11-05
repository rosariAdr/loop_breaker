import React from 'react'

/**
 * The action console — permanent verb column, the selected verb's contents, and
 * a one-line ribbon describing whatever is hovered.
 *
 * R2 — fixed size: switching verb never moves the layout, and the block stays
 * reserved even on the enemy's turn.
 * R6 — the ribbon replaces floating tooltips, which would cover the arena at
 * the exact moment you are choosing.
 * CMB-COST01 — each skill shows its mana cost AND its tempo rank (the cost in
 * turns). Ranks shown here are placeholders until the grid is ratified.
 */
export function ActionGrid({
  verbs = [],
  activeVerb,
  onVerb,
  skills = [],
  ribbon = '',
  onHoverSkill,
  onPickSkill,
  ...rest
}) {
  return (
    <div className="lb-cbt-acts" {...rest}>
      <div className="lb-cbt-ribbon" aria-live="polite">
        {ribbon}
      </div>
      <div className="lb-cbt-acts__grid">
        <div className="lb-cbt-verbs" role="group" aria-label="Actions">
          {verbs.map((v) => (
            <button
              type="button"
              key={v.id}
              className="lb-cbt-verb"
              aria-pressed={v.id === activeVerb}
              onClick={() => onVerb?.(v.id)}
            >
              <span>{v.label}</span>
              {v.rank && <em>{v.rank}</em>}
            </button>
          ))}
        </div>
        <div className="lb-cbt-skills">
          {skills.map((s) => (
            <button
              type="button"
              key={s.id ?? s.name}
              className="lb-cbt-skill"
              onMouseEnter={() => onHoverSkill?.(s)}
              onFocus={() => onHoverSkill?.(s)}
              onClick={() => onPickSkill?.(s)}
            >
              <span>{s.name}</span>
              <span className="lb-cbt-skill__cost">{s.cost === 0 ? '—' : `${s.cost} mp`}</span>
              <span className={`lb-cbt-skill__rank lb-cbt-skill__rank--${s.rank ?? 'norm'}`}>
                {{ fast: '×0.7', norm: '×1.0', slow: '×1.5' }[s.rank ?? 'norm']}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
