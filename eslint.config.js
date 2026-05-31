import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  // Override : ErrorBoundary doit être un class component (React n'a pas de hook équivalent).
  // La règle react-refresh ne gère pas bien les class components → on la désactive ici.
  {
    files: ['src/components/ErrorBoundary.jsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  // Helpers/constantes co-exportés depuis QuestBoard.jsx (getRankInfo, RANK_TIERS).
  // Acceptable car ces exports sont utilisés uniquement en tests, pas par les autres
  // composants → le HMR n'en pâtit pas en pratique.
  {
    files: ['src/screens/QuestBoard.jsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  // Idem pour WorldMapCanvas.jsx (helpers purs lerp, pctToPx, getNodeAtPosition)
  // et QTEBar.jsx (helpers isInGreenZone, cursorPositionAt).
  {
    files: ['src/screens/WorldMapCanvas.jsx', 'src/components/QTEBar.jsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  // GodsShop.jsx exporte CATALOG (BAL01) + getBonusSkillPool (T07b) pour les tests.
  // QuestBoard.jsx déjà couvert plus haut.
  {
    files: ['src/screens/GodsShop.jsx', 'src/screens/ZoneView.jsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
