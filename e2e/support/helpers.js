// Helpers partagés pour les tests E2E Playwright. Voir AGENTS.md §5.
// Rappel (docs/TEST_SCENARIOS.md) : le store n'est PAS exposé sur window —
// tout passe par l'UI ou par le Test harness dev.

const SAVE_KEY = 'roguelite_save'

// Vide la sauvegarde AVANT le chargement de la page (save vierge, ex. S1).
export async function clearSave(page) {
  await page.addInitScript((key) => {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // localStorage indisponible (mode privé, etc.) — sans effet pour le test.
    }
  }, SAVE_KEY)
}

// Ouvre le Test harness dev (cheats, téléportation). Dev build uniquement (import.meta.env.DEV).
export async function openDevHarness(page) {
  await page.keyboard.press('Control+Shift+D')
}
