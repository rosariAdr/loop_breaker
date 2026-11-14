import { test, expect } from '@playwright/test'

// S1 — Onboarding nouveau joueur (QONBOARD01). Porté depuis docs/TEST_SCENARIOS.md §S1.
// ⚠️ AUCUN cheat : vrai parcours d'un nouveau joueur.
// Cœur couvert ici : écran de nommage → entrée en jeu → persistance après reload
// (l'onboarding ne se re-déclenche pas) → interface en anglais.
// À étendre ensuite : le déroulé complet de la chaîne « Premières fois » (accepter/compléter
// les quêtes onb_*), qui demande de piloter combat + quêtes.

const SAVE_KEY = 'roguelite_save'
const HERO_NAME = 'Testaeril'

// Save vierge AVANT chaque test — SANS addInitScript : sinon le reload de persistance (étape 5)
// ré-effacerait la save. On charge, on vide localStorage, puis on recharge pour atterrir sur
// l'écran de création.
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate((key) => window.localStorage.removeItem(key), SAVE_KEY)
  await page.reload()
})

test.describe('S1 — Onboarding nouveau joueur', () => {
  test('nommage → entrée en jeu → persistance après reload', async ({ page }) => {
    // 1) Save vierge → l'écran de création s'affiche (texte anglais).
    await expect(page.getByText('The Wanderer Awakes')).toBeVisible()
    const nameInput = page.getByPlaceholder('Enter your name...')
    await expect(nameInput).toBeVisible()

    // 2) Nommer le héros et commencer.
    await nameInput.fill(HERO_NAME)
    await page.getByRole('button', { name: /Begin the Journey/ }).click()

    // 3) Le modal disparaît et on est en jeu (topbar « Run #1 »).
    await expect(page.getByText('The Wanderer Awakes')).toHaveCount(0)
    await expect(page.getByText(/Run #1/)).toBeVisible()

    // 4) Sauvegarder explicitement (la save auto est débouncée ~30 s).
    await page.getByText('Save', { exact: true }).click()
    await page.getByRole('button', { name: /Save now/ }).click()

    // 5) Reload : l'onboarding ne se re-déclenche pas, l'état persiste.
    await page.reload()
    await expect(page.getByText('The Wanderer Awakes')).toHaveCount(0)
    await expect(page.getByText(/Run #1/)).toBeVisible()
  })
})
