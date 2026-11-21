import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import { FEATURE_FLAGS, loadBalance } from './config'

// BAL-CSV01 — charge l'équilibrage live depuis `public/balance.csv` au boot
// (best-effort, non bloquant : si le fetch échoue, `BALANCE` garde ses défauts).
// TECH06 — gardé par le feature flag `csvBalanceLive` (kill-switch sans recompiler).
if (FEATURE_FLAGS.csvBalanceLive) {
  loadBalance()
}

// LB-11 — boundary racine : Topbar, Breadcrumb, Sidebar, modales et toasts sont rendus hors
// des boundaries d'écran d'App.jsx. Sans elle, une erreur chez eux laisse un écran blanc.
createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
)
