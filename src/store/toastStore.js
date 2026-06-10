// U01 — Store de toasts global (Zustand séparé du gameStore)
// Permet à n'importe quel composant ou action de pousser une notification.
//
// Usage :
//   import { useToastStore } from '../store/toastStore'
//   useToastStore.getState().addToast('Loot acquired!', 'loot')

import { create } from 'zustand'

// Types de toasts → couleurs/icônes gérés par le ToastContainer
export const TOAST_TYPES = [
  'loot',
  'levelup',
  'quest',
  'divine',
  'gluttony',
  'warning',
  'error',
  'info',
]

const DEFAULT_DURATION = 2500 // ms avant auto-dismiss

// Compteur interne pour id uniques (Date.now/random interdits ? non, dispo ici).
let _id = 0
function nextId() {
  _id += 1
  return `toast_${_id}`
}

export const useToastStore = create((set, get) => ({
  toasts: [], // [{ id, message, type, duration }]

  /**
   * Ajoute un toast. Retourne l'id (utile pour removeToast manuel).
   * @param {string} message
   * @param {string} type — un de TOAST_TYPES (défaut 'info')
   * @param {number} duration — ms (défaut 2500). 0 = persistant (pas d'auto-dismiss)
   */
  addToast: (message, type = 'info', duration = DEFAULT_DURATION) => {
    const id = nextId()
    const toast = { id, message, type: TOAST_TYPES.includes(type) ? type : 'info', duration }
    set((state) => ({ toasts: [...state.toasts, toast] }))

    // Auto-dismiss (sauf duration 0)
    if (duration > 0 && typeof setTimeout !== 'undefined') {
      setTimeout(() => {
        // Vérifie qu'il existe encore (pas déjà retiré manuellement)
        if (get().toasts.some((t) => t.id === id)) {
          get().removeToast(id)
        }
      }, duration)
    }
    return id
  },

  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  clearToasts: () => set({ toasts: [] }),
}))
