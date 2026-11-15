@AGENTS.md

<!-- CLAUDE.md = pointeur. Toutes les conventions vivent dans AGENTS.md (lu aussi par Codex). -->
<!-- Ne pas dupliquer de règles ici : les ajouter dans AGENTS.md. Ci-dessous, uniquement les notes propres à Claude Code. -->

## Notes Claude Code

- **Commits** : ne jamais committer automatiquement. Proposer le message, laisser le dev committer (GitKraken). **Aucun `Co-Authored-By`** (voir AGENTS.md §0).
- **Avant d'ouvrir une PR** : lancer `/code-review`.
- **Branches** : respecter `feat|fix|chore/<…>` (AGENTS.md §1). Si tu utilises `--worktree`, renomme la branche à ta convention (le défaut `worktree-<nom>` ne la respecte pas) et garde `.claude/worktrees/` dans `.gitignore`.
- **E2E** : Playwright est le standard (AGENTS.md §5) ; les scénarios de `docs/TEST_SCENARIOS.md` sont à porter en specs.
