# AGENTS.md — Conventions de travail (loop_breaker)

> **Source de vérité unique des conventions de ce dépôt.** Lue nativement par **Claude Code** et par **Codex**.
> `CLAUDE.md` n'est qu'un pointeur : sa première ligne est `@AGENTS.md`.
> **Portabilité** — les sections §0 à §6 sont génériques : copiables telles quelles dans `facturation_auto` et `pulse_project`. Seule la §7 est propre à ce projet (c'est la seule à remplacer pour réutiliser ce fichier ailleurs).
> En cas de conflit entre ce fichier et le code : **s'arrêter et signaler**, ne jamais trancher en silence.

---

## 0. Règles pour les agents (Claude & Codex)

- **AGENTS.md fait foi.** Si une info manque (un taux, une règle, un choix d'archi), **demander — ne jamais inventer**. Toute proposition de comblement est taguée `💡 [proposé — à valider]` dans la doc ou la PR.
- **Un agent = un ticket = une branche à la fois.** Deux agents ne travaillent jamais sur les mêmes fichiers en parallèle.
- **Revue croisée.** Faire relire le diff d'un agent par l'autre (ex. `/code-review` côté Claude) avant d'ouvrir la PR.
- **Commits : l'agent propose, le dev commite.** L'agent rédige le message de commit ; le dev le valide et commite lui-même (GitKraken). **Aucun footer `Co-Authored-By`** sur ce dépôt.
- **Jamais** de commit direct sur `master`/`dev`, **jamais** de `push`/`merge`/`tag` par un agent sans demande explicite.

---

## 1. Workflow Git

```
master  ← stable, taggué (vX.Y.Z) — PR depuis dev uniquement
  └── dev  ← intégration continue — PR depuis feat/* uniquement
        ├── feat/<TICKET_ID>      (ex. feat/MAP01)
        ├── fix/<description>     (ex. fix/inventory-crash)
        └── chore/<description>   (maintenance, docs, deps)
```

- Pas de commit direct sur `master` ni `dev` → **tout passe par PR**.
- Une PR = un ticket (ou un lot cohérent de petits tickets liés).
- `feat/* → dev` : **squash merge**. `dev → master` : **merge classique** (préserve l'historique). Tag à chaque release.
- **Resync obligatoire après chaque `dev → master`** :
  ```bash
  git checkout dev && git merge --ff-only master && git push origin dev
  ```
  Check qui doit passer : `git log --oneline master..dev` **vide**.
- `wip:` autorisé pour un commit de session interrompue sur une branche `feat/*` (sera squashé à la PR).

---

## 2. Conventional Commits

Format : `type(scope): description courte`

| Type | Quand l'utiliser |
|---|---|
| `feat` | nouvelle fonctionnalité visible |
| `fix` | correction de bug |
| `test` | ajout/modif de tests sans changement de code prod |
| `refactor` | restructuration sans changement de comportement |
| `chore` | maintenance, deps, scripts, config |
| `docs` | documentation seule |
| `style` | formatage (rien sur la logique) |
| `perf` | optimisation de performance |

Les **scopes** sont propres au projet → voir §7.

---

## 3. Definition of Done (par type de ticket)

Vérifier **tous** les critères du type avant de fermer un ticket.

- **Feature (logique)** — code au pattern existant · **test unitaire** (logique pure) · **test fonctionnel** (action d'état) · **scénario** si la feature entre dans une boucle · build + lint verts · doc d'état à jour.
- **Feature (UI)** — respecte le design system / tokens · **smoke test de rendu** · pas de régression sur les écrans voisins · accessibilité minimum (`alt`, contraste) · capture si pertinent.
- **Bug fix** — **test de régression écrit AVANT le fix (TDD strict)** · tests verts après · stack trace originale notée dans le commit si pertinent.
- **Refactor** — tests existants verts (zéro changement de comportement) · pas de nouvelle dépendance injustifiée · taille de bundle stable (±5 %).
- **Data / contenu** — **test de structure** (champs requis, IDs uniques, références valides) · nommage cohérent (§7).
- **Docs / process** — markdown lisible · liens internes valides · CHANGELOG mis à jour si impact workflow.

---

## 4. Process de Pull Request

**`feat/* → dev`**
1. Push la branche (`git push -u origin feat/<ID>`).
2. PR titrée **comme un commit** (`type(scope): …`).
3. Description = lien vers le ticket + changements clés + **comment tester** (étapes) + captures si UI.
4. Auto-review du diff sur GitHub avant merge → **squash merge**.

**`dev → master` (release)**
1. `dev` porte une suite de features cohérente (pas un mix incomplet).
2. **🚦 Gate fonctionnelle E2E obligatoire** (voir §5) — sine qua non.
3. CHANGELOG : `[Unreleased] → [vX.Y.Z] - AAAA-MM-JJ`.
4. PR `dev → master` → **merge classique** → `git tag vX.Y.Z && git push --tags` → **resync `dev`** (§1).

---

## 5. Tests

**Pyramide** (unitaire → fonctionnel → scénarios → UI) :
- **Unitaire** — logique pure, testable sans mock (à côté du source).
- **Fonctionnel** — actions d'état / API (fichiers dédiés par domaine).
- **Scénarios** — multi-actions qui simulent un parcours réel.
- **UI** — rendu + navigation (smoke test obligatoire sur les flux critiques).

**Couverture visée** : logique pure ~90 % · actions ≥ 80 % (≥ 1 test par action) · UI = smoke + flux critiques.

**E2E — Playwright (standard du projet).**
- Les parcours critiques se valident en **Playwright**, lancés en local (`npx playwright test`) **et** en CI, et **exigés verts avant tout merge `dev → master`**.
- Les **scénarios de référence** sont ceux de `docs/TEST_SCENARIOS.md` : chaque scénario S1→S10 devient **une spec Playwright** (un `*.spec.js` par parcours), exécutée en vrai navigateur. Le squelette initial est groupé dans `e2e/scenarios/release-gate.spec.js` (`test.fixme`), à éclater au fil du portage.
- Garder les tests **déterministes** : attendre les éléments (`await expect(locator)`), pas de `waitForTimeout` fixe ; sélecteurs par rôle/`data-testid`, pas par classe CSS.
- ⏳ **Mise en place en cours.** Tant que la suite Playwright n'est pas opérationnelle, la **recette manuelle** des scénarios (en vrai navigateur, cochée avec date + hash de commit) reste la gate de secours. Dès que la suite existe, elle **remplace** le déroulé manuel.

---

## 6. Garde-fous (enforcement)

Les règles ci-dessus sont du *contexte* qu'un agent peut ne pas suivre. Pour les rendre **imposées** :

- **Pre-commit** (husky + lint-staged, déjà en place) : `eslint --fix` + `prettier --write` sur les fichiers stagés. S'installe au `npm install` (`npm run prepare` sinon).
- **`/code-review`** (Claude Code) avant chaque PR — il lit ce fichier et `CLAUDE.md`.
- `💡 [proposé]` **Hook `PreToolUse`** pour imposer les règles dures : bloquer `git push` sur `master`, refuser un nom de branche hors convention, et **exiger `npx playwright test` + `npm run test:run` verts avant un commit/merge** une fois la suite en place. (`/hooks` ou `.claude/settings.json`.)
- `💡 [proposé]` **CI GitHub Actions** (ticket DX-CI01) : `lint` + `test:run` + `build` + `playwright` à chaque PR.

---

## 7. Spécifique à ce dépôt (loop_breaker)

> **La seule section à remplacer pour réutiliser ce fichier dans un autre projet.**

- **Stack** : React 19 + Vite + Zustand 5 + Tailwind 4 + Vitest 4 + React Testing Library. **JavaScript pur** (pas de TypeScript). E2E : **Playwright** (chromium) — config `playwright.config.js`, tests dans `e2e/`, lancés par `npm run test:e2e`.
- **Scopes de commit** : `combat`, `store`, `quests`, `deities`, `ui`, `save`, `tests`, `proc`, `balance`.
- **Nommage** : composant React `PascalCase` · hook `useXxx` · action store `camelCase` (verbe + objet) · constante data `SCREAMING_SNAKE_CASE` · fonction engine `camelCase` · ID en data `snake_case` · ID de ticket `PREFIXE + NN`.
- **Architecture** : `data/` (données pures, immuables) · `engine/` (logique pure, 100 % testable sans mock) · `store/` (Zustand en slices) · `screens/` (orchestration) · `components/` (réutilisables). **Règle d'or : la logique métier va dans `engine/` ; les screens orchestrent, les actions store mutent l'état.**
- **Règle save (non négociable)** : tout champ ajouté à un `INITIAL_*` → migration dans `normalizeSave()` **et** test de régression dans `store/saveNormalize.test.js`.
- **Docs de référence** (détail long) : `docs/CONTRIBUTING.md` (guide humain complet) · `CONTEXT.md` (état + ADRs) · `TASKS.md` (backlog, système PRIO-SYS01) · `docs/TEST_SCENARIOS.md` (recette E2E) · `CHANGELOG.md`.
