// UX01 — Tests Tooltip
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import Tooltip from './Tooltip'

afterEach(cleanup)

describe('Tooltip — UX01', () => {
  it('rend les children même sans hover', () => {
    render(<Tooltip content="Hello">child-text</Tooltip>)
    expect(screen.getByText('child-text')).toBeInTheDocument()
  })

  it("n'affiche PAS le tooltip par défaut", () => {
    render(<Tooltip content="Hello">child</Tooltip>)
    expect(screen.queryByTestId('tooltip')).toBeNull()
  })

  it('affiche le tooltip au mouseenter', () => {
    render(<Tooltip content="Strength: physical damage">child</Tooltip>)
    fireEvent.mouseEnter(screen.getByText('child'))
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    expect(screen.getByText(/Strength: physical damage/)).toBeInTheDocument()
  })

  it('cache le tooltip au mouseleave', () => {
    render(<Tooltip content="Hello">child</Tooltip>)
    const wrapper = screen.getByText('child')
    fireEvent.mouseEnter(wrapper)
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    fireEvent.mouseLeave(wrapper)
    expect(screen.queryByTestId('tooltip')).toBeNull()
  })

  it('affiche au focus (clavier)', () => {
    render(<Tooltip content="Hello">child</Tooltip>)
    fireEvent.focus(screen.getByText('child'))
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
  })

  it('affiche au click (mobile tap)', () => {
    render(<Tooltip content="Hello">child</Tooltip>)
    fireEvent.click(screen.getByText('child'))
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
  })

  it('ne rend pas le wrapper si content est falsy (retourne children direct)', () => {
    const { container } = render(<Tooltip content={null}>direct-child</Tooltip>)
    // Pas de span.relative.inline-block — children rendus tels quels
    expect(container.querySelector('.relative.inline-block')).toBeNull()
    expect(screen.getByText('direct-child')).toBeInTheDocument()
  })

  it("role='tooltip' présent (a11y)", () => {
    render(<Tooltip content="Hello">child</Tooltip>)
    fireEvent.mouseEnter(screen.getByText('child'))
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it("position='bottom' positionne sous l'élément", () => {
    render(
      <Tooltip content="Hello" position="bottom">
        child
      </Tooltip>,
    )
    fireEvent.mouseEnter(screen.getByText('child'))
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip.style.top).toMatch(/100%/)
  })
})
