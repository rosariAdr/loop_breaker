// UX03 — Tests ConfirmDialog
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import ConfirmDialog from './ConfirmDialog'

afterEach(cleanup)

describe('ConfirmDialog — UX03', () => {
  it("ne rend rien si open=false", () => {
    render(<ConfirmDialog open={false} title="X" message="Y" onConfirm={() => {}} onCancel={() => {}} />)
    expect(screen.queryByTestId('confirm-dialog')).toBeNull()
  })

  it('rend titre + message + 2 boutons quand open=true', () => {
    render(<ConfirmDialog open={true} title="Confirm reset" message="This is destructive." onConfirm={() => {}} onCancel={() => {}} />)
    expect(screen.getByText('Confirm reset')).toBeInTheDocument()
    expect(screen.getByText('This is destructive.')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
  })

  it("appelle onConfirm au clic sur le bouton Confirm", () => {
    const onConfirm = vi.fn()
    render(<ConfirmDialog open={true} title="X" onConfirm={onConfirm} onCancel={() => {}} />)
    fireEvent.click(screen.getByText('Confirm'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it("appelle onCancel au clic sur Cancel", () => {
    const onCancel = vi.fn()
    render(<ConfirmDialog open={true} title="X" onConfirm={() => {}} onCancel={onCancel} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it("appelle onCancel au clic sur le backdrop", () => {
    const onCancel = vi.fn()
    render(<ConfirmDialog open={true} title="X" onConfirm={() => {}} onCancel={onCancel} />)
    fireEvent.click(screen.getByTestId('confirm-dialog'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it("ne propage PAS le click depuis l'intérieur du dialog (pas de fermeture accidentelle)", () => {
    const onCancel = vi.fn()
    render(<ConfirmDialog open={true} title="X" message="Hello" onConfirm={() => {}} onCancel={onCancel} />)
    fireEvent.click(screen.getByText('Hello'))
    expect(onCancel).not.toHaveBeenCalled()
  })

  it("labels custom honorés (confirmLabel, cancelLabel)", () => {
    render(<ConfirmDialog open={true} title="X" confirmLabel="Burn it" cancelLabel="Wait" onConfirm={() => {}} onCancel={() => {}} />)
    expect(screen.getByText('Burn it')).toBeInTheDocument()
    expect(screen.getByText('Wait')).toBeInTheDocument()
  })

  it("a role='dialog' et aria-modal='true' (a11y)", () => {
    render(<ConfirmDialog open={true} title="X" onConfirm={() => {}} onCancel={() => {}} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog.getAttribute('aria-modal')).toBe('true')
  })
})
