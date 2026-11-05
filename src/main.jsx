import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { FEATURE_FLAGS, loadBalance } from './config'

// BAL-CSV01 — charge l'équilibrage live depuis `public/balance.csv` au boot
// (best-effort, non bloquant : si le fetch échoue, `BALANCE` garde ses défauts).
// TECH06 — gardé par le feature flag `csvBalanceLive` (kill-switch sans recompiler).
if (FEATURE_FLAGS.csvBalanceLive) {
  loadBalance()
}

createRoot(document.getElementById('root')).render(<App />)
