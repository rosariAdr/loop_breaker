// REFAC01 — Slice « save » du store (extrait de gameStore.js, comportement inchangé).
import { INITIAL_HERO, INITIAL_META, INITIAL_WORLD, SAVE_VERSION } from '../initialState'
import { runMigrations } from '../migrations'
import { logRuntimeError } from '../../utils/errorLog'

export const createSaveSlice = (set, get) => ({
  // LB-01 — état transitoire, jamais persisté (hors des INITIAL_*) : la save du disque n'a pas
  // pu être lue. Tant qu'il vaut true, saveGame n'écrit rien, pour ne pas écraser cette save.
  // Seuls le lèvent un chargement réussi et l'import explicite d'un fichier (importSave) ;
  // pas resetGame, car le joueur ne sait pas qu'une save illisible existe.
  saveLoadFailed: false,

  // ── Persistence localStorage ──────────────────────────────────────────────
  /** @returns {boolean} true si la save a été écrite sur le disque */
  saveGame: () => {
    // LB-01 — l'échec est déjà journalisé une fois par loadGame (lb_errors) : pas de log ici,
    // sinon l'autosave en écrirait un toutes les 30 s.
    if (get().saveLoadFailed) return false
    // IDLE-OFF — horodate la sauvegarde (base du calcul hors-ligne au retour)
    set((s) => ({ meta: { ...s.meta, lastSeen: Date.now() } }))
    const { hero, world, meta } = get()
    const payload = JSON.stringify({ hero, world, meta, saveVersion: SAVE_VERSION })
    try {
      localStorage.setItem('roguelite_save', payload)
      // Reset le flag si une sauvegarde précédente a échoué
      if (get().saveQuotaExceeded) set({ saveQuotaExceeded: false })
      return true
    } catch (e) {
      // TECH03 — quota exceeded ou autre erreur de persistance
      console.error('[save] localStorage write failed:', e?.name, e?.message)
      set({ saveQuotaExceeded: true })
      return false
    }
  },

  /** @returns {boolean} true si une save a été chargée (false : aucune save, ou save illisible) */
  loadGame: () => {
    try {
      // LB-01 — getItem dans le try : un stockage inaccessible (SecurityError) ne doit pas
      // faire planter le montage de l'app.
      const raw = localStorage.getItem('roguelite_save')
      if (!raw) return false
      const parsed = JSON.parse(raw)
      const migrated = runMigrations(parsed)
      set({
        hero: migrated.hero,
        world: migrated.world,
        meta: migrated.meta,
        saveLoadFailed: false,
      })
      return true
    } catch (e) {
      // LB-01 — save illisible (ou stockage inaccessible) : on bloque l'écriture au lieu de
      // laisser l'autosave remplacer la save d'origine par l'état initial.
      logRuntimeError(e, { source: 'load-game' })
      set({ saveLoadFailed: true })
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
      // LB-01 — importer un fichier est un choix explicite : il remplace la save illisible.
      set({
        hero: migrated.hero,
        world: migrated.world,
        meta: migrated.meta,
        saveLoadFailed: false,
      })
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
      // LB-01 — saveLoadFailed volontairement conservé (voir plus haut).
      unseenLoot: false,
    }),
})
