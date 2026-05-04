// scripts/generate-balance-csv.mjs
// Génère balance/combat_stats.csv : stats monstres × zone_mult × runCount
// Usage : node scripts/generate-balance-csv.mjs
// Re-générer après chaque changement dans MONSTERS, ZONE_MULTS ou scaleMonsterStats.

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { MONSTERS, MONSTERS_BY_ZONE } from '../src/data/monsters.js'
import { ZONE_MULTS, scaleMonsterStats } from '../src/data/zones.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Niveaux de scaling représentatifs : run 1 (premier), 5 (transmigration récurrente),
// 10 (mid-game), 15 (late-game), 25 (cap du scaling)
const RUN_LEVELS = [1, 5, 10, 15, 25]

// Pour les boss et le demon lord, on applique un mult plus élevé que la zone de base.
// `scaleMonsterStats` lit dans ZONE_MULTS via le `zoneId` passé. On fournit donc
// le bon zoneId selon le rank du monstre.
function getEffectiveZoneId(monster) {
  if (monster.rank === 'demon_lord') return 'demon_lord'
  if (monster.rank === 'boss') return 'dungeon_boss'
  return monster.zone
}

function escapeCsv(s) {
  const v = String(s)
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`
  }
  return v
}

const headers = [
  'monster_id',
  'name',
  'zone',
  'rank',
  'effective_zone_id',
  'zone_mult',
  'run_count',
  'run_scale',
  'effective_scale',
  'hp_base',
  'atk_base',
  'def_base',
  'spd_base',
  'hp_scaled',
  'atk_scaled',
  'def_scaled',
  'spd_scaled',
  'expReward',
]

const rows = [headers.join(',')]

for (const [monsterId, monster] of Object.entries(MONSTERS)) {
  const effZoneId = getEffectiveZoneId(monster)
  const zoneMult = ZONE_MULTS[effZoneId] ?? 1.0

  for (const runCount of RUN_LEVELS) {
    const runScale = Math.pow(1.08, Math.min(runCount, 25))
    const scaled = scaleMonsterStats(monster.baseStats, effZoneId, runCount)
    const effectiveScale = zoneMult * runScale

    rows.push([
      monsterId,
      escapeCsv(monster.name),
      monster.zone,
      monster.rank,
      effZoneId,
      zoneMult.toFixed(2),
      runCount,
      runScale.toFixed(3),
      effectiveScale.toFixed(3),
      monster.baseStats.hp,
      monster.baseStats.atk,
      monster.baseStats.def,
      monster.baseStats.spd,
      scaled.hp,
      scaled.atk,
      scaled.def,
      scaled.spd,
      monster.expReward,
    ].join(','))
  }
}

const outPath = join(__dirname, '..', 'balance', 'combat_stats.csv')
writeFileSync(outPath, rows.join('\n') + '\n', 'utf8')

const totalMonsters = Object.keys(MONSTERS).length
const totalRows = rows.length - 1 // -1 pour le header

console.log(`✓ ${outPath}`)
console.log(`  ${totalMonsters} monstres × ${RUN_LEVELS.length} niveaux = ${totalRows} lignes`)
console.log(`  Zones rencontrées : ${[...new Set(Object.values(MONSTERS).map(m => getEffectiveZoneId(m)))].join(', ')}`)
console.log(`  Cross-check : zone_mult × 1.08^run_count = effective_scale`)
