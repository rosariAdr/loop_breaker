// U01 — Tests toastStore
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useToastStore, TOAST_TYPES } from './toastStore'

beforeEach(() => {
  useToastStore.getState().clearToasts()
})

describe('toastStore — U01', () => {
  it("toasts vide au départ", () => {
    expect(useToastStore.getState().toasts).toEqual([])
  })

  it("addToast ajoute un toast avec message et type", () => {
    useToastStore.getState().addToast('Hello', 'loot')
    const toasts = useToastStore.getState().toasts
    expect(toasts).toHaveLength(1)
    expect(toasts[0].message).toBe('Hello')
    expect(toasts[0].type).toBe('loot')
  })

  it("addToast retourne un id unique", () => {
    const id1 = useToastStore.getState().addToast('A')
    const id2 = useToastStore.getState().addToast('B')
    expect(id1).not.toBe(id2)
  })

  it("type invalide → fallback 'info'", () => {
    useToastStore.getState().addToast('X', 'not_a_type')
    expect(useToastStore.getState().toasts[0].type).toBe('info')
  })

  it("type par défaut = 'info'", () => {
    useToastStore.getState().addToast('X')
    expect(useToastStore.getState().toasts[0].type).toBe('info')
  })

  it("removeToast retire le toast ciblé", () => {
    const id = useToastStore.getState().addToast('A')
    useToastStore.getState().addToast('B')
    useToastStore.getState().removeToast(id)
    const toasts = useToastStore.getState().toasts
    expect(toasts).toHaveLength(1)
    expect(toasts[0].message).toBe('B')
  })

  it("clearToasts vide tout", () => {
    useToastStore.getState().addToast('A')
    useToastStore.getState().addToast('B')
    useToastStore.getState().clearToasts()
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it("auto-dismiss après duration (fake timers)", () => {
    vi.useFakeTimers()
    useToastStore.getState().addToast('Temp', 'info', 1000)
    expect(useToastStore.getState().toasts).toHaveLength(1)
    vi.advanceTimersByTime(1100)
    expect(useToastStore.getState().toasts).toHaveLength(0)
    vi.useRealTimers()
  })

  it("duration 0 = persistant (pas d'auto-dismiss)", () => {
    vi.useFakeTimers()
    useToastStore.getState().addToast('Persist', 'warning', 0)
    vi.advanceTimersByTime(10000)
    expect(useToastStore.getState().toasts).toHaveLength(1)
    vi.useRealTimers()
  })

  it("plusieurs toasts coexistent", () => {
    useToastStore.getState().addToast('A', 'loot', 0)
    useToastStore.getState().addToast('B', 'quest', 0)
    useToastStore.getState().addToast('C', 'divine', 0)
    expect(useToastStore.getState().toasts).toHaveLength(3)
  })

  it("TOAST_TYPES exporte les types attendus", () => {
    expect(TOAST_TYPES).toContain('loot')
    expect(TOAST_TYPES).toContain('quest')
    expect(TOAST_TYPES).toContain('divine')
    expect(TOAST_TYPES).toContain('gluttony')
    expect(TOAST_TYPES).toContain('warning')
    expect(TOAST_TYPES).toContain('error')
  })
})
