import { defineConfig, devices } from '@playwright/test'

// Loop Breaker — configuration Playwright (E2E). Voir AGENTS.md §5.
// ⚠️ IPv4 forcé : sur ce poste `localhost` résout en ::1, ce qui casse la connexion au
// serveur Vite. On cible donc 127.0.0.1 des deux côtés (cf. docs/TEST_SCENARIOS.md).
const HOST = '127.0.0.1'
const PORT = 5173
const baseURL = `http://${HOST}:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  // Viewport 1920×1080 = la scène de référence du jeu (évite les artefacts du scaler --lb-scale).
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
  ],
  // Démarre le serveur de dev automatiquement, puis attend qu'il réponde.
  webServer: {
    command: `npm run dev -- --host ${HOST} --port ${PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
