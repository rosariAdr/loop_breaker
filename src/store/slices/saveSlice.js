// REFAC01 — Slice « save » du store (extrait de gameStore.js, comportement inchangé).
import { INITIAL_HERO, INITIAL_META, INITIAL_WORLD, SAVE_VERSION } from '../initialState'
import { runMigrations } from '../migrations'

export const createSaveSlice = (set, get) => ({
  // ── Persistence localStorage ──────────────────────────────────────────────
  saveGame: () => {
    // IDLE-OFF — horodate la sauvegarde (base du calcul hors-ligne au retour)
    set((s) => ({ meta: { ...s.meta, lastSeen: Date.now() } }))
    const { hero, world, meta } = get()
    const payload = JSON.stringify({ hero, world, meta, saveVersion: SAVE_VERSION })
    try {
      localStorage.setItem('roguelite_save', payload)
      // Reset le flag si une sauvegarde précédente a échoué
      if (get().saveQuotaExceeded) set({ saveQuotaExceeded: false })
    } catch (e) {
      // TECH03 — quota exceeded ou autre erreur de persistance
      console.error('[save] localStorage write failed:', e?.name, e?.message)
      set({ saveQuotaExceeded: true })
    }
  },

  loadGame: () => {
    const raw = localStorage.getItem('roguelite_save')
    if (!raw) return false
    try {
      const parsed = JSON.parse(raw)
      const migrated = runMigrations(parsed)
      set({ hero: migrated.hero, world: migrated.world, meta: migrated.meta })
      return true
    } catch {
      return false
    }
  },

  // TECH07 — Export / Import de save (fichier). Filet de sécurité + portabilité.
  exportSave: () => {
    const { hero, world, meta } = get()
    return JSON.stringify({ hero, world, meta, saveVersion: SAVE_VERSION }, null, 2)
  },

  /** Charge une save depuis une chaîne JSON (avec migrations). @returns {boolean} succès */

  importSave: (json) => {
    try {
      const parsed = JSON.parse(json)
      if (!parsed || !parsed.hero || !parsed.world) return false
      const migrated = runMigrations(parsed)
      set({ hero: migrated.hero, world: migrated.world, meta: migrated.meta })
      get().saveGame()
      return true
    } catch {
      return false
    }
  },

  resetGame: () =>
    set({
      hero: { ...INITIAL_HERO },
      world: { ...INITIAL_WORLD },
      meta: { ...INITIAL_META },
      currentScreen: 'world_map',
      activeCombat: null,
      pendingDivineCall: null,
      pendingLevelUp: 0,
      recentSkillLevelUps: [],
      saveQuotaExceeded: false,
      unseenLoot: false,
    }),
})
