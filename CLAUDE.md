@AGENTS.md

<!-- CLAUDE.md = pointeur. Toutes les conventions vivent dans AGENTS.md (lu aussi par Codex). -->
<!-- Ne pas dupliquer de règles ici : les ajouter dans AGENTS.md. Ci-dessous, uniquement les notes propres à Claude Code. -->

## Notes Claude Code

- **Commits** : ne jamais committer automatiquement. Proposer le message, laisser le dev committer (GitKraken). **Aucun `Co-Authored-By`** (voir AGENTS.md §0).
- **Avant d'ouvrir une PR** : `npm run porte`, puis `/code-review`.
- **Branches** : respecter `feat|fix|chore/<…>` (AGENTS.md §1). Avec `--worktree`, renommer la branche à la convention (le défaut `worktree-<nom>` ne la respecte pas) et fixer `PORT_E2E` ; garder `.claude/worktrees/` hors de git.
- **E2E** : Playwright est le standard (AGENTS.md §5 et §7) ; les scénarios de `docs/TEST_SCENARIOS.md` sont à porter en specs.
