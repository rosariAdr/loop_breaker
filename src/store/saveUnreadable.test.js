// LB-01 — Une sauvegarde illisible au chargement ne doit jamais être écrasée.
// Avant le correctif : `loadGame` avalait l'erreur (ou laissait fuir celle de `getItem`), le jeu
// repartait de l'état initial, et l'autosave remplaçait 30 s plus tard la save d'origine.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useGameStore } from './gameStore'

const KEY = 'roguelite_save'
const store = () => useGameStore.getState()

// Saves fictives : une chaîne qui n'est pas du JSON, et un JSON qui fait lever les migrations.
const NOT_JSON = '{"hero":{"name":"Fixture"},"world":' // tronquée
const MIGRATION_THROWS = 'null' // JSON valide, mais runMigrations(null) lève

beforeEach(() => {
  localStorage.clear()
  store().resetGame()
  // Le blocage survit volontairement à resetGame : on le remet à zéro entre les tests.
  useGameStore.setState({ saveLoadFailed: false })
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('LB-01 — save illisible : jamais écrasée', () => {
  it('JSON invalide : après loadGame puis saveGame, la valeur d’origine reste récupérable', () => {
    localStorage.setItem(KEY, NOT_JSON)

    expect(store().loadGame()).toBe(false)
    store().saveGame()

    expect(localStorage.getItem(KEY)).toBe(NOT_JSON)
  })

  it('migration qui lève : après loadGame puis saveGame, la valeur d’origine reste récupérable', () => {
    localStorage.setItem(KEY, MIGRATION_THROWS)

    expect(store().loadGame()).toBe(false)
    store().saveGame()

    expect(localStorage.getItem(KEY)).toBe(MIGRATION_THROWS)
  })

  it('getItem qui lève : loadGame ne lève pas, et saveGame n’écrit rien', () => {
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new DOMException('Access denied', 'SecurityError')
    })
    const setItem = vi.spyOn(localStorage, 'setItem')

    let loaded
    expect(() => {
      loaded = store().loadGame()
    }).not.toThrow()
    expect(loaded).toBe(false)
    store().saveGame()

    expect(setItem).not.toHaveBeenCalledWith(KEY, expect.anything())
  })

  it('saveGame dit si la save a été écrite : true sinon, false quand elle est bloquée', () => {
    expect(store().saveGame()).toBe(true)

    localStorage.setItem(KEY, NOT_JSON)
    store().loadGame()

    expect(store().saveGame()).toBe(false)
  })

  it('autosave répétée : la save illisible survit à plusieurs saveGame', () => {
    localStorage.setItem(KEY, NOT_JSON)
    store().loadGame()

    store().saveGame()
    store().saveGame()
    store().saveGame()

    expect(localStorage.getItem(KEY)).toBe(NOT_JSON)
  })
})

describe('LB-01 — ce qui doit continuer de sauvegarder', () => {
  it('aucune save sur le disque : nouvelle partie, saveGame écrit', () => {
    expect(store().loadGame()).toBe(false)

    store().saveGame()
    expect(JSON.parse(localStorage.getItem(KEY)).hero).toBeTruthy()
  })

  it('save lisible : loadGame réussit, saveGame écrit', () => {
    store().addGold(123)
    store().saveGame()
    store().resetGame()

    expect(store().loadGame()).toBe(true)
    store().addGold(1)

    store().saveGame()
    expect(JSON.parse(localStorage.getItem(KEY)).hero.inventory.gold).toBe(124)
  })

  it('après un échec, une save lisible chargée ensuite débloque la sauvegarde', () => {
    localStorage.setItem(KEY, NOT_JSON)
    store().loadGame()
    localStorage.setItem(KEY, store().exportSave())

    expect(store().loadGame()).toBe(true)
    store().addGold(7)
    store().saveGame()
    expect(JSON.parse(localStorage.getItem(KEY)).hero.inventory.gold).toBe(7)
  })

  it('import explicite d’un fichier : remplace la save illisible (choix du joueur)', () => {
    const imported = store().exportSave()
    localStorage.setItem(KEY, NOT_JSON)
    store().loadGame()

    expect(store().importSave(imported)).toBe(true)

    expect(localStorage.getItem(KEY)).not.toBe(NOT_JSON)
    expect(JSON.parse(localStorage.getItem(KEY)).hero).toBeTruthy()
  })
})

describe('LB-01 — resetGame ne remplace pas la save illisible', () => {
  // Options et PostMortem appellent resetGame après une confirmation, mais le joueur ne sait pas
  // qu'une save illisible existe : il croit remettre à zéro la partie neuve qu'il voit.
  it('après resetGame, saveGame n’écrit toujours rien et la valeur d’origine reste', () => {
    localStorage.setItem(KEY, NOT_JSON)
    store().loadGame()

    store().resetGame()
    store().saveGame()

    expect(localStorage.getItem(KEY)).toBe(NOT_JSON)
  })
})
