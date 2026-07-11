---
name: playtest-report
description: "Generate a blank playtest report, or turn raw playtest notes into a structured entry appended to docs/PLAYTESTS.md, then route findings to design / balance / bug / backlog. Use when the user says 'playtest report', 'log this playtest', 'write up my playthrough notes'."
argument-hint: "[new | analyze <path-or-paste>]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, AskUserQuestion
---

# Playtest Report (Loop Breaker)

Feeds **BAL02/BAL03** and the `FIX-` bug epic. Reports live in
`docs/PLAYTESTS.md` (single journal, append newest on top).

## Phase 1 — Mode

- `new` → output the blank template below.
- `analyze <path>` (or pasted notes) → read notes, cross-reference `docs/DESIGN.md`
  / `CONTEXT.md`, fill the template, flag anything that contradicts design intent.

## Phase 2A — Template

```markdown
## Playtest — [date] · build [branch@commit] · [tester]
**Focus**: [what was tested]   **Session**: [first-time / returning / targeted]

### First minutes
- Goal clear? [Y/N/partly] · Controls clear? [Y/N/partly] · Feel: [engaged/confused/bored/frustrated]

### What worked
- …
### Pain points  (sev H/M/L)
- …
### Confusion
- …
### Delight
- …

### Bugs
| # | Description | Sev (S1–S4) | Reproducible |
|---|-------------|-------------|--------------|

### Balance feel
- Difficulty: [easy/right/hard] · Pacing: [slow/good/fast] · Economy (tokens/gold): […]

### Quantitative (if any)
- Deaths / zone reached / day count / run length …

### Top 3 for this session
1. …  2. …  3. …
```

## Phase 2B — Analyze

Fill the template from the notes. Where an observation conflicts with
`docs/DESIGN.md` or an acted decision in `CONTEXT.md`, mark it **⚠ vs design**.

## Phase 3 — Route findings

Bucket every finding and route:
- **Design change** → summarize; if it touches a data field, note the save/DoD
  impact; propose a `TASKS.md` ticket (PRIO-SYS01).
- **Balance** → "Run `/balance-check [domain]` before tuning."
- **Bug** → "Run `/bug-triage` — or file a `FIX-…` ticket now."
- **Polish** → drop into the relevant epic in `TASKS.md`.

## Phase 4 — Save

Ask: "Ajouter cette entrée en tête de `docs/PLAYTESTS.md` ?" On yes, prepend the
filled report under the file's header (create `docs/PLAYTESTS.md` if missing).

## Phase 5 — Next

- Highest-priority finding first.
- New bugs → `/bug-triage`. Balance doubts → `/balance-check`.
- Do not commit (CONTRIBUTING §2 — Claude propose, le dev commite).

Verdict: **COMPLETE**.

> Adapted from Claude-Code-Game-Studios (`playtest-report`, MIT). Director-gate /
> `production/` machinery removed; output repointed to `docs/PLAYTESTS.md`.
