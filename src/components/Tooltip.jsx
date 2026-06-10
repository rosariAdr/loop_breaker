// UX01 — Tooltip réutilisable (hover popover)
// Pattern : wrap any element, popover apparaît au mouseenter, cachée au mouseleave.
// Position : top par défaut (au-dessus de l'élément). Compatible mobile (tap to show).

import { useState, useRef } from 'react'

/**
 * DEVBP02 — Tooltip au survol (UX01). Si `content` est vide, rend les enfants tels quels.
 * @param {object} props
 * @param {import('react').ReactNode} props.content - contenu de l'infobulle
 * @param {import('react').ReactNode} props.children - élément déclencheur (survol/tap)
 * @param {'top'|'bottom'|'left'|'right'} [props.position] - position de l'infobulle
 * @param {number} [props.maxWidth] - largeur max (px)
 */
export default function Tooltip({ content, children, position = 'top', maxWidth = 240 }) {
  const [visible, setVisible] = useState(false)
  const wrapperRef = useRef(null)

  if (!content) return children

  const show = () => setVisible(true)
  const hide = () => setVisible(false)

  const positionStyles = {
    top: { bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
    bottom: { top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
    right: { left: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' },
    left: { right: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' },
  }[position]

  return (
    <span
      ref={wrapperRef}
      className="relative inline-block"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onClick={show} // mobile-friendly : tap pour afficher
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          data-testid="tooltip"
          className="absolute pointer-events-none rounded px-3 py-2 anim-pop"
          style={{
            ...positionStyles,
            background: '#0a0808',
            border: '1px solid #5a3818',
            color: '#d4af70',
            fontSize: '0.75rem',
            fontFamily: 'Crimson Text, serif',
            lineHeight: '1.4',
            maxWidth: `${maxWidth}px`,
            width: 'max-content',
            boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
            zIndex: 100,
            whiteSpace: 'normal',
          }}
        >
          {content}
        </span>
      )}
    </span>
  )
}
