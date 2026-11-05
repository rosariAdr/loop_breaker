# Project skills — Loop Breaker

Curated, **adapted** subset of [Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios)
(MIT © 2026 Donchitos). The upstream repo is an engine-oriented studio framework
(Godot/Unity/Unreal, ~75 skills, ~49 agents, executable hooks). We took only the
**stack-agnostic, additive** skills and rewrote each for this project's reality:
React 19 + Vite + Zustand 5 + Tailwind 4 + **Vitest** + **JS pur**, data in
`src/data/*.js`, backlog in `TASKS.md` (PRIO-SYS01), design in `docs/`.

## Installed (7)

| Skill | What it does here | Reads |
|---|---|---|
| `/consistency-check` | referential integrity + contradictions across data (= automatable half of QA01) | `src/data/*.js`, `CONTEXT.md §5` |
| `/balance-check` | outliers / curves / economy (BAL tickets) | `balance/*.csv`, `src/data`, `docs/DESIGN.md` |
| `/content-audit` | planned vs built content | `CONTEXT.md §5` vs `src/data` |
| `/playtest-report` | structure playtest notes + route findings | `docs/PLAYTESTS.md` |
| `/scope-check` | scope-creep guard for an epic/ticket | `TASKS.md` (Plan de release) |
| `/bug-triage` | classify bugs → `FIX-` tickets (PRIO-SYS01) | `TASKS.md`, `docs/PLAYTESTS.md` |
| `/ui-ux-audit` | **live-app** heuristic UX audit (browser-driven) → tickets par écran (PRIO-SYS01) ; a11y = garde-fou léger | dev server (browser), `TASKS.md` |

Each `SKILL.md` ends with an adaptation note. Frontmatter `agent:` /
director-gate / `production/`-scaffolding references from upstream were removed.

## Bespoke (project-native, not from CCGS)

| Skill | What it does |
|---|---|
| `/asset-forge` | builds the **Asset Forge** — prompt-as-data asset generation (`asset_forge/`, manifest + Gemini/Nano Banana runner, `with_bg`/`no_bg` double storage, sync + Batch API). Reuses `process_assets.py`. Perimeter = `asset_forge/` only; never touches game code. |
| `/lb-brainstorm` | exploration cadrée de game design (3 tours : questions socratiques → options chiffrées S/M/L → convergence). Produit des options à valider, **jamais du code**. |
| `/lb-cadrage` | fige une décision en **ADR + tickets + plan** d'implémentation, avant toute ligne de code. Pont entre `/lb-brainstorm` et l'implémentation. |
| `/lb-grooming` | raffinage du backlog : inventaire, anti-doublon, découpage, repriorisation. Ne modifie **jamais** `TASKS.md` sans décision cochée. |

Les trois skills `lb-*` partagent le protocole **HITL** ([`HITL.md`](HITL.md)) — *Claude propose, Adrian
dispose*. Chaque proposition (statu quo compris) passe par une feuille de validation Excel générée par
[`tools/backlog-studio/`](../../tools/backlog-studio/) ; rien ne s'écrit sans décision cochée, et une
cellule vide vaut « non traitée », jamais accord tacite.

## Deliberately NOT installed (why)

- **Hooks + `settings.json`** — upstream wires ~10 executable hooks (validate-commit/
  push on every Bash, validate-assets on every Write/Edit, session/compact/subagent
  logging). They would fight our `.husky` pre-commit and the "Claude ne commite pas"
  rule, and slow every turn. Not installed.
- **The ~49 agents** — mostly Godot/Unity/Unreal/C#/shader/network specialists,
  irrelevant to a React web game.
- **Engine / planning skills** — `setup-engine`, engine specialists, and the
  `create-epics`/`create-stories`/`sprint-plan`/`story-*` planning skills: they
  assume `design/gdd/`, `design/registry/entities.yaml`, `production/sprints/`, and
  would create a **parallel backlog** conflicting with our PRIO-SYS01 / `TASKS.md`.
- **Overlaps we already have** — built-in `/code-review`, `/simplify`,
  `docs/CHANGELOG.md`, etc.

## Adding more later

The full upstream set is worth browsing for one-offs (`security-audit`,
`perf-profile`, `tech-debt`, `retrospective`, `quick-design`, `ux-design`). To
adopt one: copy its `SKILL.md`, strip `agent:`/gate/`production/` references, and
repoint paths to `src/`, `docs/`, `balance/`, `TASKS.md`. Ask and I'll adapt it.

> **Note** : `ux-review` (upstream) a déjà été adopté — mais **repurposé** en
> `/ui-ux-audit` (validation de spec doc → audit heuristique de l'app **live**).
> `ux-design` / `quick-design` restent des candidats pour la **phase maquettes**
> (épique UXR : un futur skill `brainstorm` d'idéation cadrée).
