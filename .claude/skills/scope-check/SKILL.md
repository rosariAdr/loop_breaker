---
name: scope-check
description: "Compare a feature/epic's current scope against its original plan in TASKS.md to detect scope creep — additions without cuts. Read-only; quantifies bloat and recommends cuts/defers. Use when the user says 'scope check', 'any scope creep', 'are we staying in scope' for an epic or ticket."
argument-hint: "[epic id e.g. v1.31 | ticket id e.g. MST | feature name]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash
---

# Scope Check (Loop Breaker)

Read-only. Compares the **planned** scope of a ticket/epic against what it has
grown into (in `TASKS.md`, plus code touched). Our planning lives in `TASKS.md`
under the PRIO-SYS01 system (see its header legend) — the "🗺 Plan de release"
table (epics → versions) and the "Backlog par épique" sections.

## Phase 1 — Baseline

Resolve `$ARGUMENTS[0]`:
- **epic** (`v1.31`, `v1.43`…) → its row in the "🗺 Plan de release" table (the
  declared ticket count, e.g. "Quêtes (18)") + its `### v1.xy` section.
- **ticket id prefix** (`MST`, `VQ`, `SKD`…) → all matching `- [ ]` lines.
- **feature name** → grep TASKS.md + `docs/DESIGN.md` for it.

If nothing matches, report the miss and stop (no baseline = no check).

## Phase 2 — Current state

- Actual open tickets under the epic now (`grep -c` the section) vs the table's
  declared count.
- New ids added since the table was written (compare table count vs live count).
- Code touched: `git log --oneline` for the branch; TODO/FIXME added in `src/`.
- Any ticket that has grown sub-bullets / "Décision" notes beyond its original
  one-liner.

## Phase 3 — Compare

```markdown
## Scope Check: [epic/ticket]
### Declared (Plan de release): [N] tickets
### Live in backlog: [N] tickets
### Additions (not in the declared count)
| Ticket | Added when | Justified? | Size |
### Removals / merges
| Ticket | Reason |
### Bloat
- Declared [N] → live [N]  (net [+/−X], [±Y%])
### Risk
- Release risk / coherence risk — [Low/Med/High] + why
### Recommendations
1. Cut · 2. Defer (move epic in the table, per PRIO-SYS01) · 3. Keep · 4. Flag for you
```

## Phase 4 — Verdict

| Net change | Verdict |
|---|---|
| ≤10% | **PASS** — on track |
| 10–25% | **CONCERNS** — minor creep, targeted cuts |
| 25–50% | **FAIL** — significant creep, cut or re-version |
| >50% | **FAIL** — re-plan; split the epic |

```
Scope Verdict: [PASS/CONCERNS/FAIL] — net [±X%]
```

## Phase 5 — Next

- CONCERNS/FAIL → propose the 2–3 best cut candidates, or "déplacer l'épique
  dans la table Plan de release" (PRIO-SYS01: replanifier = déplacer l'épique,
  pas rééditer les tickets). Reference the milestone exit criteria in the TASKS
  legend.
- Always: "Re-run `/scope-check [id]` after cuts."

### Rules
- Creep = additions without cuts or a version move.
- Not all additions are bad (discovered requirements) — but must be acknowledged.
- Quantify ("+35% tickets"), never "feels big".
- Preserve core player experience over nice-to-haves when cutting.

> Adapted from Claude-Code-Game-Studios (`scope-check`, MIT). Repointed from
> `production/sprints` to TASKS.md / PRIO-SYS01.
