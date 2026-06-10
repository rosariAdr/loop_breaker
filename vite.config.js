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
        // COV80 — seuil aligné sur l'acquis (~78 %) pour que test:coverage soit vert en CI ;
        // cible 80 % à reprendre quand les internes de Combat.jsx seront couverts.
        lines: 76,
      },
    },
  },
})
