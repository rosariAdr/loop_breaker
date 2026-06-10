import { create } from 'zustand'
import { INITIAL_HERO, INITIAL_WORLD, INITIAL_META } from './initialState'
import { createHeroSlice } from './slices/heroSlice'
import { createCombatSlice } from './slices/combatSlice'
import { createQuestsSlice } from './slices/questsSlice'
import { createWorldSlice } from './slices/worldSlice'
import { createIdleSlice } from './slices/idleSlice'
import { createMetaSlice } from './slices/metaSlice'
import { createSaveSlice } from './slices/saveSlice'

// Ré-exports : préservent l'API publique du module (consommée par les tests).
export { SAVE_VERSION } from './initialState'
export { normalizeSave, runMigrations } from './migrations'

// ── Store Zustand — recomposition des slices (REFAC01) ────────────────────────
// L'état racine reste ici ; chaque domaine d'actions vit dans son slice. `get()`
// renvoie le store complet recomposé, donc les appels inter-slices fonctionnent.
export const useGameStore = create((set, get) => ({
  // ── État racine ──
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

  // ── Slices d'actions ──
  ...createHeroSlice(set, get),
  ...createCombatSlice(set, get),
  ...createQuestsSlice(set, get),
  ...createWorldSlice(set, get),
  ...createIdleSlice(set, get),
  ...createMetaSlice(set, get),
  ...createSaveSlice(set, get),
}))
