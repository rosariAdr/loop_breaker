---
name: bug-triage
description: "Collect open bugs (FIX- tickets in TASKS.md + bug rows in docs/PLAYTESTS.md), classify by severity vs priority, surface systemic trends, and produce a triage list in PRIO-SYS01 format. Use at the start of a fix session, after a playtest, or when the user says 'triage bugs', 'what bugs are open'."
argument-hint: "[full | trend | new (from pasted notes)]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, AskUserQuestion
---

# Bug Triage (Loop Breaker)

Bugs live as **`FIX-…` tickets** in `TASKS.md` (the `### BUG_v1.2 — Correctifs
de playthrough` epic, prefix `FIX-`) and as **bug rows in playtest entries**
(`docs/PLAYTESTS.md`). This skill separates **severity** (impact) from
**priority** (urgency, on our PRIO-SYS01 1–5 scale) and keeps critical bugs from
being lost.

## Phase 1 — Mode

- `full` (default) — triage all open `FIX-` tickets + un-filed bug rows.
- `trend` — read-only trend analysis, no writes.
- `new` — turn pasted/observed bug notes into `FIX-` tickets (PRIO-SYS01 format).

## Phase 2 — Load

- `Grep pattern="^\s*- \[ \] \*\*FIX-" TASKS.md` → open bug tickets.
- Scan `docs/PLAYTESTS.md` "### Bugs" tables for rows not yet turned into tickets.
- Read the `TASKS.md` header legend for the current PRIO-SYS01 vocabulary and the
  active near-term epics (Plan de release), for assignment targets.

If none found: "Aucun bug ouvert (`FIX-` dans TASKS.md, tables Bugs dans
PLAYTESTS.md)." Stop.

## Phase 3 — Classify

**Severity** (objective):
| | |
|---|---|
| **S1 Critical** | crash / save corruption / softlock (e.g. héros piégé sur node verrouillé) / feature totalement cassée |
| **S2 High** | feature majeure cassée, jeu encore jouable / mauvais résultat significatif |
| **S3 Medium** | dégradé mais contournable / affichage faux non bloquant (ex. cumul de kills affiché) |
| **S4 Low** | cosmétique, typo, pas d'impact gameplay |

**Priority** — map onto our **P1–P5** (PRIO-SYS01):
- **P1** bloque l'alpha / régression sur contenu livré → à corriger tout de suite.
- **P2** nécessaire à la prochaine release (épique en cours).
- **P3** important, pas bloquant. **P4** confort. **P5** lointain.

**Maturité**: 🟢 si la cause + le fix sont clairs (test de régression écrivable) ;
🟡 si à diagnostiquer.

**Systemic flags:**
- ≥3 bugs sur le même système (ex. QuestCard/board) → "qualité à revoir sur
  [système]" (cf. FIX-QUESTPROG01/02 = même classe).
- Bug sur une story marquée `[x]` → régression, rouvrir.

## Phase 4 — Trend

Total ouverts · ouverts vs fermés récents · hot spot (système le plus buggé) ·
régressions (bugs contre du `[x]`) · âge.

## Phase 5 — Report / tickets

```
## Bug Triage — [date]  (mode: [full|trend])
Open FIX-: [N]   Unfiled (PLAYTESTS): [N]

### P1 — tout de suite
| id | système | Sev | résumé | maturité |
### P2 — release courante
| … |
### P3+ — backlog
| … |
### Systemic
- …
```

For `new` mode, draft each bug as a PRIO-SYS01 line ready to paste into the
`### BUG_v1.2` epic (respect CONTRIBUTING DoD: **test de régression écrit AVANT
le fix**):
```
- [ ] **FIX-<slug> — <titre>** · S · P<n> · <🟢|🟡> — 🐞 *retour [source/date].* [symptôme + repro] ; **cause** : [si connue] ; **fix** : [piste] + test de régression. ⟶ [liens]
```

## Phase 6 — Write & gate

Ask before editing TASKS.md: "Ajouter/mettre à jour ces `FIX-` tickets dans le
`### BUG_v1.2` de TASKS.md ?" Write only on approval.
- **Never** mark a bug won't-fix without asking (surface as P5 candidate).
- Severity = recommendation; priority = ta décision.
- Do not commit (CONTRIBUTING §2).

Verdict: **COMPLETE** (or **BLOCKED** if write declined).

> Adapted from Claude-Code-Game-Studios (`bug-triage`, MIT). Repointed from
> `production/qa/bugs/` + S/P scale to TASKS.md `FIX-` epic + PRIO-SYS01 (P1–P5).
