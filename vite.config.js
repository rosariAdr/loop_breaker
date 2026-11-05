import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    // DEVBP01 — seuil de couverture (vérifié via `npm run test:coverage`).
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        // COV80 → COV-COMBAT01 (v1.34) — Combat.jsx passé de ~71 % à ~95 % de lignes
        // (suite Combat.coverage.test.jsx) → couverture globale ~83 %. Seuil remonté à 80 %.
        lines: 80,
      },
    },
  },
})
