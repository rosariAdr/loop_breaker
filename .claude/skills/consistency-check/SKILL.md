---
name: consistency-check
description: "Referential-integrity + contradiction scan across the game's data files (src/data/*.js). Detects dead ids (a quest/recipe/drop/zone pointing at a monster, skill, resource, equipment or node that doesn't exist), duplicate entries with conflicting values, and counts in CONTEXT.md that no longer match the data. Grep-first. Use after editing any src/data file, before shipping a content epic, or when the user says 'consistency check', 'check data integrity', 'dead refs'."
argument-hint: "[full | refs | counts | id:<some_id>]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Write, AskUserQuestion
---

# Consistency Check (Loop Breaker data)

Our source of truth for content is the **JS data files in `src/data/`**, not a
separate registry. This skill treats those files as the registry: it builds the
set of defined ids, then verifies every cross-reference resolves and that no id
is defined twice with different values. It also cross-checks the content
counters in `CONTEXT.md §5`.

This is the automatable half of ticket **QA01 / QA-EXT01**.

**When to run:** after editing any `src/data/*.js`, before closing a content
epic (v1.31 Quêtes, v1.32 Skills, v1.42 Équip/Craft…), before a merge.

---

## Phase 1 — Parse mode & map the data files

Modes (`$ARGUMENTS[0]`):
- `full` (default) — refs + duplicates + counts
- `refs` — dead-reference scan only
- `counts` — CONTEXT.md §5 counters vs actual data only
- `id:<x>` — trace one id across all data files

Data files (glob `src/data/*.js`, ignore `*.test.js`). Key registries and the
fields that reference them:

| Registry (defined in) | id shape | Referenced by (field → file) |
|---|---|---|
| `MONSTERS` (monsters.js) | snake_case | `objectives[].monsterId` (quests/mainQuests/churchQuests), `zones.js huntingSpots[].monsters[]`, `MONSTERS_BY_ZONE/_BY_SPOT`, `bossId`/`bossMechanics` |
| `SKILLS` (skills.js) | snake_case | `skillDrop.skillId` (monsters), `reward.skill.skillId` (quests), `divineSkill`, `ACADEMY_CATALOG` (academy.js), `MASTER_QUESTS skillId` |
| `RESOURCES` + consumables (resources.js) | snake_case | `resourceDrops[].resourceId` (monsters), `reward.resources`/`reward.consumables` keys (quests), recipe inputs/outputs (recipes.js), `elite_turnin.resourceId` (mainQuests) |
| `EQUIPMENT_TEMPLATES` (equipment.js) | snake_case | `reward.equipment.templateId` (quests), `weaponTemplateId` (mainQuests elite_turnin), recipe outputs |
| `ZONES` / huntingSpots (zones.js) | snake_case | `monster.zone`/`monster.huntingSpot`, `unlockZone`/`unlocks.spots`, `visit` objectives `spotId` |
| nodes/edges (worldGraph.js) | snake_case | `unlocks.locations`, `currentLocation`, POS keys |
| NPCs (`QUEST_NPCS`, `*_QUEST_NPC`, MAIN/MASTER) | snake_case | `giverNpc` (all quest files) |

**Grep-first**: read each registry file once to collect defined ids
(`Grep pattern="^\s*([a-z0-9_]+):\s*\{" -o` on the registry object, or Read the
file if small — most are < 600 lines). Do NOT full-read every consumer; grep the
referencing fields.

---

## Phase 2 — Dead-reference scan (`refs`)

For each referencing field, extract the referenced ids and check membership in
the corresponding defined-id set. Report any that don't resolve.

Concrete high-value checks (from real bugs we've hit):
- Every `giverNpc` resolves in `QUEST_NPC_REGISTRY` (quests.js).
- Every quest `monsterId` exists in `MONSTERS` **and is not `reserve:true`** (a
  quest can't target a reserve monster that never spawns).
- Every `reward.skill.skillId` / `skillDrop.skillId` exists in `SKILLS`.
- Every `reward.resources`/`consumables`/`resourceDrops.resourceId` /
  `elite_turnin.resourceId` exists in `RESOURCES` or the consumables map.
- Every `reward.equipment.templateId` / `weaponTemplateId` / recipe output exists
  in `EQUIPMENT_TEMPLATES`.
- Every `zones.js huntingSpots[].monsters[]` id exists and its `MONSTERS[id].huntingSpot`
  matches the spot (bidirectional).
- Every `unlocks.locations[]` / `unlocks.spots[]` (mainQuests) is a real node/spot.

For `id:<x>` mode: grep `<x>` across all `src/data` + `src/engine` + `src/store`
and print where it is defined and every place it is referenced.

---

## Phase 3 — Duplicate / contradiction scan

- Same id key defined twice in the same registry object (JS silently keeps the
  last) → **CONFLICT**.
- Same logical entity split across files with different values (e.g. a monster's
  `huntingSpot` in `MONSTERS` vs its membership in `MONSTERS_BY_SPOT`) → **CONFLICT**.
- A resource used as a turn-in but flagged as "signature/unique" while also
  dropping from other monsters (cf. `MQ-TURNIN-SIG01`) → **NOTE**.

## Phase 4 — Counter check (`counts`)

Read the content table in `CONTEXT.md §5` (Zones / Spots / Monstres / Skills /
Recettes / Consommables / Titres / Articles boutique…). Count the real entries in
the data files (exclude `reserve:true` where the table says "surface"). Report
any counter that drifted, with the real number.

---

## Phase 5 — Report

```
## Consistency Check — src/data
Date: [date]   Mode: [full|refs|counts|id]
Registries: MONSTERS [N] · SKILLS [N] · RESOURCES [N] · EQUIPMENT [N] · ZONES [N] · NPCs [N]

### 🔴 Dead references (must fix)
- [file:field] "[value]" → not found in [registry]

### 🔴 Duplicates / contradictions
- [id] defined in [file] with conflicting [attr]: [a] vs [b]

### 📊 CONTEXT.md §5 drift
- [row]: CONTEXT says [X], data has [Y]

### ✅ Clean
- [N] references verified.

Verdict: PASS | ISSUES FOUND ([N])
```

If issues found, propose fixes but **do not edit data files without asking**
(they are gameplay-affecting and often need a matching test — cf. CONTRIBUTING
DoD "Contenu data": test de structure + compteurs CONTEXT.md).

## Phase 6 — Close

If the fix touches a field covered by `INITIAL_*` (save schema), remind: "save
migration + regression test required (CONTRIBUTING §6)."

Close with `AskUserQuestion`:
- "Consistency check done — [N] issues. Next?"
- `[A] Fix the highest-severity issue now` · `[B] Open FIX- tickets in TASKS.md (PRIO-SYS01)` · `[C] Save report to docs/` · `[D] Stop`

> Adapted from Claude-Code-Game-Studios (`consistency-check`, MIT) for Loop Breaker's JS data model.
