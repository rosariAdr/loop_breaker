// U01 — Tests ToastContainer
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import ToastContainer from './ToastContainer'
import { useToastStore } from '../store/toastStore'

beforeEach(() => {
  useToastStore.getState().clearToasts()
})

afterEach(cleanup)

describe('ToastContainer — U01', () => {
  it('ne rend rien si aucun toast', () => {
    render(<ToastContainer />)
    expect(screen.queryByTestId('toast-container')).toBeNull()
  })

  it('rend un toast après addToast', () => {
    useToastStore.getState().addToast('Loot acquired!', 'loot', 0)
    render(<ToastContainer />)
    expect(screen.getByTestId('toast-container')).toBeInTheDocument()
    expect(screen.getByText('Loot acquired!')).toBeInTheDocument()
  })

  it('rend plusieurs toasts', () => {
    useToastStore.getState().addToast('A', 'loot', 0)
    useToastStore.getState().addToast('B', 'quest', 0)
    render(<ToastContainer />)
    expect(screen.getAllByTestId('toast')).toHaveLength(2)
  })

  it('clic sur un toast le retire', () => {
    useToastStore.getState().addToast('Click me', 'info', 0)
    render(<ToastContainer />)
    fireEvent.click(screen.getByText('Click me'))
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('role=status pour a11y', () => {
    useToastStore.getState().addToast('Accessible', 'info', 0)
    render(<ToastContainer />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
