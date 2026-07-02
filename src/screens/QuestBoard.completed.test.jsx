// FIX-QCOMPLETED-COLLAPSE01 — les quêtes terminées sont regroupées dans une section
// repliable (repliée par défaut) pour ne pas encombrer le board.
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { CollapsibleSection } from './QuestBoard'

afterEach(() => cleanup())

describe('FIX-QCOMPLETED-COLLAPSE01 — section repliable', () => {
  it("repliée par défaut : l'en-tête est visible mais les enfants masqués", () => {
    render(
      <CollapsibleSection title="Completed (3)" defaultOpen={false}>
        <div>quest-card</div>
      </CollapsibleSection>,
    )
    expect(screen.getByText(/Completed \(3\)/)).toBeInTheDocument()
    expect(screen.queryByText('quest-card')).toBeNull()
    expect(screen.getByTestId('collapsible-header').getAttribute('aria-expanded')).toBe('false')
  })

  it("clic sur l'en-tête : déplie et affiche les enfants", () => {
    render(
      <CollapsibleSection title="Completed (3)" defaultOpen={false}>
        <div>quest-card</div>
      </CollapsibleSection>,
    )
    fireEvent.click(screen.getByTestId('collapsible-header'))
    expect(screen.getByText('quest-card')).toBeInTheDocument()
    expect(screen.getByTestId('collapsible-header').getAttribute('aria-expanded')).toBe('true')
  })
})
