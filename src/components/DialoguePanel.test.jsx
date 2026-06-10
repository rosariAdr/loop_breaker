// NPC01 — Tests du panneau de dialogue (navigation de l'arbre)
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import DialoguePanel from './DialoguePanel'
import { getDialogue } from '../data/dialogues'

afterEach(cleanup)

describe('NPC01 — DialoguePanel', () => {
  const d = getDialogue('village_elder')

  it('rend le nœud de départ', () => {
    render(<DialoguePanel dialogue={d} />)
    expect(screen.getByText(/troubled times/)).toBeInTheDocument()
  })

  it('clic sur une option navigue vers le nœud cible', () => {
    render(<DialoguePanel dialogue={d} />)
    fireEvent.click(screen.getByText('What troubles you?'))
    expect(screen.getByText(/Beasts from the forest/)).toBeInTheDocument()
  })

  it('(Back) revient au nœud précédent', () => {
    render(<DialoguePanel dialogue={d} />)
    fireEvent.click(screen.getByText('Is there work for me?'))
    expect(screen.getByText(/keeps the quest board/)).toBeInTheDocument()
    fireEvent.click(screen.getByText('(Back)'))
    expect(screen.getByText(/troubled times/)).toBeInTheDocument()
  })

  it('option terminale (nextId null) appelle onClose', () => {
    const onClose = vi.fn()
    render(<DialoguePanel dialogue={d} onClose={onClose} />)
    fireEvent.click(screen.getByText('Farewell.'))
    expect(onClose).toHaveBeenCalled()
  })

  it('rend null si dialogue absent', () => {
    const { container } = render(<DialoguePanel dialogue={null} />)
    expect(container.querySelector('[data-testid="dialogue-panel"]')).toBeNull()
  })
})
