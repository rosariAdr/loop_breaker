---
name: content-audit
description: "Audits planned content counts (CONTEXT.md §5 + docs/DESIGN.md) against what's actually implemented in src/data/*.js. Shows planned vs built per content type, flags gaps. Use for a content-progress snapshot or when the user says 'content audit', 'what's left to build', 'planned vs built'."
argument-hint: "[monsters | skills | quests | equipment | recipes | --summary | (no arg = full)]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Write
---

# Content Audit (Loop Breaker)

Compares **planned** content (the counters in `CONTEXT.md §5 "Contenu actuel"`
and any targets in `docs/DESIGN.md`) against **built** content (real entries in
`src/data/*.js`). Complements `consistency-check` (which checks integrity, not
completeness).

## Phase 1 — Planned

Read `CONTEXT.md` §5 table (Zones, Spots de chasse, Monstres/boss, Skills,
Divinités, Debuffs, Recettes, Consommables, Titres, Articles boutique, Portraits…)
and any explicit target counts in `docs/DESIGN.md` / open `TASKS.md` tickets
(e.g. "6 skills nocturnes", "8 quêtes de village", "8 char portraits"). Build a
planned-count table with its source.

## Phase 2 — Built

Count real entries per registry in `src/data/` (Grep the object keys):

| Content | File | Count how |
|---|---|---|
| Monsters | `monsters.js` | keys in `MONSTERS` (split surface vs `reserve:true` vs boss/demon_lord) |
| Skills | `skills.js` | keys in `SKILLS` |
| Quests | `quests.js` + `mainQuests.js` + `churchQuests.js` + `masterQuests.js` | keys per file |
| Equipment | `equipment.js` | keys in `EQUIPMENT_TEMPLATES` |
| Resources / consumables | `resources.js` | keys |
| Recipes | `recipes.js` | `ALCHEMY_RECIPES` + `MASTER_RECIPES` (+ base forge) |
| Zones / spots | `zones.js` | `ZONES` + `huntingSpots[]` |
| Deities / titles / achievements / portraits | `deities.js`/`titles.js`/`achievements.js`/`portraits.js` | keys |

`Grep pattern="^\s{2}[a-z0-9_]+:\s*\{" glob="src/data/monsters.js" output_mode="count"`
is a quick key-count (verify against a Read for files with nested objects).

## Phase 3 — Gap table

```
| Content type | Planned | Built | Gap | Status |
|--------------|---------|-------|-----|--------|
```
Status: `COMPLETE` (built ≥ planned) · `IN PROGRESS` (50–99%) · `EARLY` (1–49%) ·
`NOT STARTED` (0). Flag `HIGH PRIORITY` when the gap sits on the near-term runway
(a v1.31–v1.42 epic in the `TASKS.md` Plan de release).

Also flag **counter drift**: where `CONTEXT.md §5` disagrees with the real count
(hand off the fix to a CONTEXT.md update — that's part of the DoD).

## Phase 4 — Output

Default / single-type: present the table + a one-line summary
(total planned / built / gap %). Ask before writing:
"Écrire le rapport dans `docs/content-audit-[YYYY-MM-DD].md` ?"

`--summary`: print table only, no file.

## Phase 5 — Next steps

- Biggest HIGH-PRIORITY gap → point at the owning epic in `TASKS.md`.
- Counter drift → "mettre à jour `CONTEXT.md §5`."
- Missing planned targets (a ticket with no count) → "chiffrer dans le ticket
  avant de coder."

Verdict: **COMPLETE**.

> Adapted from Claude-Code-Game-Studios (`content-audit`, MIT). Repointed from
> `design/gdd` + `assets/data` to Loop Breaker's `CONTEXT.md` + `src/data`.
