// ── Configuration runtime du jeu ─────────────────────────────────────────────
// Regroupe :
//   • BAL-CSV01 — constantes d'équilibrage tunables, pilotées par `public/balance.csv`
//     (fetché au boot → objet `BALANCE` en mémoire ; fallback = défauts en dur).
//   • TECH06 — feature flags (activer/désactiver des features sans recompiler).

// ── BAL-CSV01 — Équilibrage live-linked ──────────────────────────────────────
//
// Archi (DÉCIDÉ 2026-06-20) : les constantes d'équilibrage vivent dans
// `public/balance.csv`, fetché au démarrage de l'app. Éditer ce CSV change
// l'équilibrage SANS rebuild (Vercel sert `public/` tel quel). Si le fetch
// échoue (offline, 404, CSV corrompu), on retombe sur `BALANCE_DEFAULTS` → le
// jeu reste 100% jouable.
//
// ⚠️ Règle d'or : `BALANCE_DEFAULTS` DOIT refléter les valeurs actuellement en
// dur dans le code, pour qu'en l'absence de CSV le comportement soit IDENTIQUE.
// Le CSV committé reprend donc ces mêmes valeurs ; c'est le dev qui les tune ensuite.

/**
 * Valeurs d'équilibrage par défaut (fallback si le CSV n'est pas chargé).
 * Chaque clé correspond à une ligne `key,value` de `public/balance.csv`.
 * @type {Readonly<Record<string, number>>}
 */
export const BALANCE_DEFAULTS = Object.freeze({
  // Courbe d'XP : `expToNext` est multiplié par ce facteur à chaque niveau.
  // (helpers.applyLevelUps / combat.applyExpGain)
  xp_curve_mult: 1.5,
  // Scaling des monstres selon le nombre de runs : base^min(runCount, cap).
  // (zones.scaleMonsterStats)
  run_scaling: 1.08,
  run_scaling_cap: 25,
  // Barèmes d'XP/rang par palier de difficulté des quêtes générées.
  // (quests.defaultQuestXp / defaultQuestRankPoints)
  quest_xp_easy: 40,
  quest_xp_medium: 110,
  quest_xp_hard: 150,
  quest_rank_easy: 1,
  quest_rank_medium: 3,
  quest_rank_hard: 5,
  // Multiplicateurs de zone pour le scaling de difficulté (zones.getZoneMult).
  zone_mult_ashenvale: 1.0,
  zone_mult_blighted_road: 1.8,
  zone_mult_grimspire: 2.5,
  zone_mult_dungeon_boss: 3.5,
  zone_mult_demon_lord: 6.0,
})

/**
 * Objet d'équilibrage VIVANT lu par la logique de jeu.
 * Initialisé aux défauts ; muté en place par `applyBalance` au boot (BAL-CSV01)
 * pour préserver les références importées ailleurs (la logique lit `BALANCE.x`).
 * @type {Record<string, number>}
 */
export const BALANCE = { ...BALANCE_DEFAULTS }

/**
 * Parse un CSV d'équilibrage `key,value` (une paire par ligne) en objet.
 * - Ignore les lignes vides et les commentaires (`#` en début de ligne).
 * - Ignore une éventuelle ligne d'en-tête `key,value`.
 * - Ne conserve que les valeurs numériques finies (les lignes invalides sont ignorées).
 * @param {string} text - Contenu brut du CSV.
 * @returns {Record<string, number>} Paires clé→nombre valides.
 */
export function parseBalanceCsv(text) {
  const out = {}
  if (typeof text !== 'string') return out
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const comma = line.indexOf(',')
    if (comma === -1) continue
    const key = line.slice(0, comma).trim()
    const rawValue = line.slice(comma + 1).trim()
    if (!key || key.toLowerCase() === 'key') continue // en-tête éventuel
    if (rawValue === '') continue // valeur manquante → ligne ignorée (Number('') === 0)
    const value = Number(rawValue)
    if (!Number.isFinite(value)) continue
    out[key] = value
  }
  return out
}

/**
 * Fusionne des overrides dans l'objet `BALANCE` vivant (mutation en place).
 * N'écrase QUE les clés déjà connues (présentes dans les défauts) → une clé
 * inconnue du CSV est ignorée, on ne pollue pas l'objet.
 * @param {Record<string, number>} overrides
 * @returns {Record<string, number>} La référence `BALANCE` (pour chaînage/test).
 */
export function applyBalance(overrides) {
  if (overrides && typeof overrides === 'object') {
    for (const key of Object.keys(BALANCE_DEFAULTS)) {
      if (typeof overrides[key] === 'number' && Number.isFinite(overrides[key])) {
        BALANCE[key] = overrides[key]
      }
    }
  }
  return BALANCE
}

/** Restaure `BALANCE` aux valeurs par défaut (utile aux tests). */
export function resetBalance() {
  for (const key of Object.keys(BALANCE)) delete BALANCE[key]
  Object.assign(BALANCE, BALANCE_DEFAULTS)
  return BALANCE
}

/**
 * BAL-CSV01 — Charge `public/balance.csv` au runtime et applique ses valeurs à
 * `BALANCE`. Best-effort : toute erreur (offline, 404, parse) est avalée et on
 * conserve les défauts → le jeu démarre toujours.
 * @param {typeof fetch} [fetchFn=fetch] - Injectable pour les tests.
 * @param {string} [url='/balance.csv'] - Chemin du CSV (servi depuis `public/`).
 * @returns {Promise<Record<string, number>>} L'objet `BALANCE` résultant.
 */
export async function loadBalance(fetchFn = globalThis.fetch, url = '/balance.csv') {
  try {
    if (typeof fetchFn !== 'function') return BALANCE
    const res = await fetchFn(url, { cache: 'no-cache' })
    if (!res || !res.ok) return BALANCE
    const text = await res.text()
    applyBalance(parseBalanceCsv(text))
  } catch {
    // Offline / CSV manquant / corrompu → on garde les défauts (jeu jouable).
  }
  return BALANCE
}

// ── TECH06 — Feature flags ────────────────────────────────────────────────────
//
// Activer/désactiver des features sans recompiler la logique. Les flags sont lus
// à l'exécution par les composants/logique concernés (cf. `csvBalanceLive`, lu au
// boot dans App.jsx pour décider si l'on tente le fetch `balance.csv`).
//
// AC (TECH06) : objet `FEATURE_FLAGS` exporté + ≥1 feature gardée par un flag + test.

/** @type {Record<string, boolean>} */
export const FEATURE_FLAGS = {
  // BAL-CSV01 — si false, on n'essaie même pas de fetcher le CSV : le jeu tourne
  // sur les défauts en dur. Sert de kill-switch en cas de CSV problématique en prod.
  csvBalanceLive: true,
}
