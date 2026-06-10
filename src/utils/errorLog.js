// DX-ERRTRACK01 — « Sentry-lite » pour l'alpha : journalise les erreurs runtime dans
// localStorage (ring buffer) pour qu'elles soient inspectables/exportables (sinon une
// erreur de prod reste invisible). Aucune dépendance, aucune requête réseau.
const KEY = 'lb_errors'
const MAX = 10

/**
 * Journalise une erreur runtime : console structurée + persistance (les MAX plus récentes).
 * @param {unknown} error - l'erreur capturée
 * @param {object} [extra] - contexte additionnel (componentStack, source, écran…)
 * @returns {object} l'entrée enregistrée
 */
export function logRuntimeError(error, extra = {}) {
  const entry = {
    ts: new Date().toISOString(),
    message: String(error?.message ?? error ?? 'Unknown error'),
    stack: error?.stack ? String(error.stack).slice(0, 2000) : null,
    ...extra,
  }
  console.error('[runtime-error]', entry)
  try {
    const prev = JSON.parse(localStorage.getItem(KEY) || '[]')
    const next = [entry, ...(Array.isArray(prev) ? prev : [])].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // localStorage indisponible / quota dépassé — on n'aggrave pas une erreur par une autre.
  }
  return entry
}

/** Les erreurs runtime enregistrées (plus récentes en tête). */
export function getErrorLog() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

/** Vide le journal d'erreurs. */
export function clearErrorLog() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
