import { test, expect } from '@playwright/test'

// Smoke E2E : prouve que la chaîne Playwright + serveur Vite tourne et que l'app monte.
// (Ne dépend d'aucun contenu de jeu → stable dans le temps.)
test.describe('Smoke — boot applicatif', () => {
  test('boote sans crash et monte le root React', async ({ page }) => {
    const jsErrors = []
    page.on('pageerror', (err) => jsErrors.push(err.message))

    await page.goto('/')

    await expect(page).toHaveTitle(/Loop Breaker/)
    // React monte dans #root et remplace le splash statique #boot-splash.
    await expect(page.locator('#boot-splash')).toHaveCount(0)
    await expect(page.locator('#root')).not.toBeEmpty()

    expect(jsErrors, `Erreurs JS au boot :\n${jsErrors.join('\n')}`).toEqual([])
  })
})
