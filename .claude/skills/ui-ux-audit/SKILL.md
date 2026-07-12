---
name: ui-ux-audit
description: "Audit the LIVE game UI/UX screen-by-screen (drives the running dev server in a browser) against game-usability heuristics, then emit prioritized findings as PRIO-SYS01 tickets — each with a concrete UI/UX fix proposal — grouped per-screen epic. Accessibility is a light readability garde-fou only (NOT a WCAG pass). Use at the start of a UI/UX redesign, per screen, or when the user says 'audit UI', 'audit UX', 'ux review', 'revue ergonomie', 'audit ergonomique'."
argument-hint: "[screen | all | quick-wins]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, AskUserQuestion, Bash, mcp__Claude_Browser__preview_start, mcp__Claude_Browser__navigate, mcp__Claude_Browser__read_page, mcp__Claude_Browser__get_page_text, mcp__Claude_Browser__find, mcp__Claude_Browser__computer, mcp__Claude_Browser__read_console_messages, mcp__Claude_Browser__resize_window, mcp__Claude_Browser__preview_logs
---

# UI/UX Audit (Loop Breaker)

Heuristic UX audit of the **running game** — not of a design doc. It drives the
live dev server in a browser, walks each screen, and turns what it observes into
**PRIO-SYS01 tickets** (`docs/CONTRIBUTING.md` DoD, `TASKS.md` legend) with a
concrete **proposition de solution** per finding. Findings are grouped **par
écran** (each screen = its own epic, prefix `UX-<SCREEN>`), matching the
per-screen redesign structure.

> **Scope.** This skill *audits and proposes*; it does **not** redesign or
> implement. Heavy findings (a screen that needs rethinking) are **routed to the
> maquette phase** (épique UXR / `brainstorm` + Claude Design), not fixed inline.
> **Accessibility is deliberately light** here (owner's call): a readability
> garde-fou only — see Pass D. No WCAG certification, no resize/reflow checks
> (fixed 1920×1080 canvas = a design choice, not a defect).

## Phase 1 — Mode

- `all` (default) — audit every screen in the inventory (Phase 3).
- `<screen>` — audit one screen (e.g. `worldmap`, `combat`, `village`,
  `inventory`, `guild`, `church`). Alias tolerated (fr/en).
- `quick-wins` — walk all screens but **only** log XS/S findings, to feed an
  immediate "quick wins" lot before the deeper per-screen work.

## Phase 2 — Boot the live app

1. Ensure the dev server is up: `preview_start` with the project's dev config.
   If `.claude/launch.json` has no dev entry, create one (`npm run dev`, Vite,
   port 5173) then `preview_start`.
2. **Fix the viewport to 1920×1080** (`resize_window`) once, up front. The game
   is a fixed PC-first stage — auditing at any other size manufactures false
   "responsive" findings. Never log a responsive/mobile issue.
3. Load a **representative save** (a mid-run state exercises HP/mana/quests/idle),
   or a fresh save for onboarding checks. Note which one in the report.
4. If another browser is wired in the session (Playwright MCP, claude-in-chrome),
   use it instead — the phases are tool-agnostic.

## Phase 3 — Screen inventory & states

Walk each screen; for **each** capture the states that actually exist there:
*idle · hover · action sélectionnée · confirmation destructive · loading/empty ·
error · tooltip · plein vs vide*. Per screen: `navigate` → `computer` screenshot
→ `read_page` (DOM/structure + refs) → `read_console_messages` (catch React 19
errors surfacing during the walk).

| Screen (epic) | Focus |
|---|---|
| World Map (`UX-MAP`) | lisibilité des nodes/verrous/fog, node courant, trails, feedback de déplacement |
| Combat tour-par-tour (`UX-CBT`) | jauges HP/MP/tour, feedback de skill/dégâts/statuts, ordre d'action, multi-ennemis |
| Village / ville (`UX-VIL`) | panneaux quêtes / craft / dieux, overlay PNJ, actions inline (IMM01) |
| Inventaire (`UX-INV`) | grilles carried/equipped, stacks, or, slots d'équipement |
| Guilde (`UX-GLD`) | réputation, rang, remises d'élite, jetons |
| Église (`UX-CHU`) | quêtes église, progression, dons/dieux |
| Écrans takeover (`UX-TKO`) | GodsShop / DivineCall / PostMortem (volontairement sombres — juger la cohérence, pas re-skinner) |

> **Hero Sheet est exclu par défaut** : la refonte V2 (barres uniformes + jalons,
> HSV2-02→06) est **déjà livrée**. Ne l'audite que si l'argument le nomme.

## Phase 4 — Rubric (4 passes par écran)

Encode the audited methodology. Run all four on each screen; each finding cites
the pass + specific heuristic.

**Pass A — Nielsen (10 heuristiques, version JEU).** Points de tension probables
pour une UI parchemin dense : H1 visibilité de l'état système (jauges HP/tour/
boucle lisibles ?), H3 contrôle & liberté (annuler/revenir), H4 cohérence des
contrôles **entre écrans**, H5/H9 prévention & récupération d'erreur (craft,
dons aux dieux, actions **irréversibles**), H6 reconnaître plutôt que se rappeler,
H8 esthétique vs minimalisme (arbitrer la **densité** assumée du parchemin).

**Pass B — Utilisabilité de JEU (heuristiques PLAY / game usability).** Ce que
Nielsen ignore : pacing/rythme, sentiment de **progression et de maîtrise**,
clarté des objectifs, **onboarding des mécaniques**, cohérence narrative du ton
dark-medieval.

**Pass C — Spécifique IDLE / ROGUELITE** (l'axe qu'aucun outil externe ne couvre) :
lisibilité du **scaling numérique** (gros nombres), **feedback des gains offline /
auto-chasse**, clarté de la **méta-progression** et des **boucles de run**,
lisibilité de la **transmigration** (héritage/Boutique des Dieux).

**Pass D — Garde-fou LISIBILITÉ (léger, a11y déprioritée).** Uniquement :
contraste texte crème/ocre sur fond parchemin sombre ; taille de cible cliquable ;
focus visible sur les flux clavier existants ; pas d'info **par la couleur seule**.
**Ne pas** logger : lecteur d'écran, resize/reflow, SEO, mobile. Si un doute a11y
est lourd, le noter comme P5 « à traiter plus tard », pas comme blocage.

## Phase 5 — Severity → priority

**Sévérité UX 0–4** (recommandation) = fréquence × impact × persistance ; la
*fréquence* se juge sur les écrans récurrents (Combat, World Map).

| Sév | Sens | → Priorité PRIO-SYS01 |
|---|---|---|
| 4 | catastrophe : bloque/embrouille le cœur de boucle | **P1** |
| 3 | majeur : friction forte, contournable | **P2** |
| 2 | mineur : dégrade sans bloquer | **P3** |
| 1 | cosmétique / polish | **P4–P5** |

Sévérité = recommandation ; **priorité = décision de l'utilisateur** (comme
`bug-triage`). Maturité : 🟢 si constat + proposition sont clairs (codable) ;
🟡 si la solution demande un arbitrage design → candidat **maquette (UXR)**.

## Phase 6 — Report & draft tickets

Report first (screen × axe), then draft tickets. One **finding** =
`{ écran, pass/heuristique, preuve (screenshot + extrait DOM), sévérité 0-4 → P, proposition de solution }`.

```
## UI/UX Audit — [date]   (mode: [all|<screen>|quick-wins]  · save: [fraîche|mid-run])
Écrans audités : [N]   Findings : [N]  (P1:[n] P2:[n] P3:[n] P4-5:[n])   Routés maquette (🟡): [n]

### UX-MAP — World Map
| # | pass | constat (preuve) | sév→P | proposition | maturité |
|---|------|------------------|-------|-------------|----------|
### UX-CBT — Combat
| … |
### Transversal (cohérence inter-écrans)
- …
```

Then, for each finding, a **PRIO-SYS01 line** ready to paste, grouped under its
per-screen epic (canonical format from the `TASKS.md` legend):

```
- [ ] **UX-<SCREEN>-<n> — <titre>** · <XS|S|M|L> · P<1-5> · <🟢|🟡> — <pass> : <constat court> ; **proposition** : <solution concrète>. ⟶ <preuve/liens>
```

`quick-wins` mode outputs only XS/S · 🟢 lines, as a single ready-to-run lot.

## Phase 7 — Gate & route

- **Ask before writing** to `TASKS.md`: "Créer ces épiques `UX-<SCREEN>` +
  tickets dans le Backlog par épique, et ajouter les lignes au Plan de release
  (horizon urgent/moyen/long) ?" Write only on approval. (Milestone = porté par
  l'épique, cf. légende PRIO-SYS01.)
- **Route, don't fix**: 🟡 findings (refonte d'écran) → ne pas coder ; les
  marquer comme entrées de la phase maquette (UXR / `brainstorm` + Claude Design).
- **Grooming**: after drafting, suggest `scope-check` (garder chaque épique
  bornée) and, for anything that overlaps a bug, `bug-triage`.
- Never commit (CONTRIBUTING §2). Never mark a finding won't-fix without asking.

Verdict: **COMPLETE** (report + drafts delivered) or **BLOCKED** (write declined
/ dev server unavailable).

> Adapté de Claude-Code-Game-Studios (`ux-review`, MIT © Donchitos) — **repurposé**
> de la *validation de spec doc* (`design/ux/*.md`, pipeline GDD) vers un **audit
> heuristique de l'app live**. Repointé : les checklists complétude/états/inputs/
> critères d'acceptation → passes Nielsen(jeu) + PLAY + idle/roguelite ; sortie →
> tickets PRIO-SYS01 **par écran** dans `TASKS.md` ; a11y ramenée à un garde-fou
> lisibilité (choix produit : PC-first, canevas fixe 1920×1080). `agent:`/`model:`/
> `design/` de l'upstream retirés (cf. `.claude/skills/README.md`).
