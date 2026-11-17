# AGENTS.md — Conventions de travail (loop_breaker)

> **Source de vérité unique des conventions de ce dépôt.** Lue nativement par **Codex**, et par **Claude Code** via `CLAUDE.md`, qui l'importe (`@AGENTS.md`).
> **Socle commun** — les §0 à §6 sont le socle partagé par tous les projets : même texte partout, à quelques valeurs près (nom de la branche stable, contenu de la commande `porte`, outils de test), toutes rappelées en §7. La §7 est propre à ce dépôt.
> En cas de conflit entre ce fichier et le code : **s'arrêter et signaler**, ne jamais trancher en silence.

---

## 0. Règles pour les agents (Claude & Codex)

- **AGENTS.md fait foi.** Si une info manque (une règle, un choix d'archi, une valeur métier), **demander — ne jamais inventer**. Toute proposition de comblement est taguée `💡 [proposé — à valider]` dans la doc ou la PR.
- **Un agent = un ticket = une branche à la fois.** Deux agents ne travaillent jamais sur les mêmes fichiers en parallèle.
- **Revue croisée.** Faire relire le diff d'un agent par l'autre (ex. `/code-review` côté Claude) avant d'ouvrir la PR.
- **Commits : l'agent propose, le dev commite.** L'agent rédige le message de commit ; le dev le valide et commite lui-même (GitKraken). **Aucun footer `Co-Authored-By`.**
- **Jamais** de commit direct sur `master`/`dev`, **jamais** de `push`/`merge`/`tag` par un agent sans demande explicite.

### Plusieurs agents en parallèle

- **Le brief écrit le périmètre** : les fichiers que l'agent possède, et ceux auxquels il ne touche pas.
- **Un port de test par copie.** Chaque copie du dépôt (worktree) qui lance les tests fixe son port (`PORT_E2E=3101`, `3102`…). Sinon `reuseExistingServer` fait lire le serveur d'une autre copie, et la porte voit des tests verts sur un code qui n'est pas le sien.
- **Aucun relevé depuis une branche** (nombre de tests, couverture, compteurs) : il est périmé dès la fusion suivante. Les relevés se font une fois, sur `dev`, après la dernière fusion.
- **Fichiers partagés** (CHANGELOG, journal) : ajouter en fin de section ; un conflit se résout en gardant les deux côtés.
- **Numérotation partagée** (tickets, ADR) : le brief annonce le dernier numéro attribué, et on vérifie qu'un ID est libre avant de le poser. En cas de collision, celui qui est déjà fusionné garde son numéro.

---

## 1. Workflow Git

```
master  ← stable, taggué (vX.Y.Z) — PR depuis dev uniquement
  └── dev  ← intégration continue — PR depuis les branches de travail
        ├── feat/<TICKET_ID>      (ex. feat/MAP01)
        ├── fix/<description>     (ex. fix/inventory-crash)
        └── chore/<description>   (maintenance, docs, deps, outillage)
```

- Pas de commit direct sur `master` ni `dev` → **tout passe par PR**.
- Une PR = un ticket (ou un lot cohérent de petits tickets liés).
- Branches de travail → `dev` : **squash merge**. `dev → master` : **merge classique** (préserve l'historique). Tag à chaque release.
- **Resync obligatoire après chaque `dev → master`** :
  ```bash
  git checkout dev && git merge --ff-only master && git push origin dev
  ```
  Check qui doit passer : `git log --oneline master..dev` **vide**.
- `wip:` autorisé pour un commit de session interrompue sur une branche de travail (squashé à la PR).

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

Les **scopes** et la **langue des messages** sont propres au projet → voir §7.

---

## 3. Definition of Done (par type de ticket)

Vérifier **tous** les critères du type avant de fermer un ticket.

- **Feature (logique)** — code au pattern existant · **test unitaire** (logique pure) · **test fonctionnel** (action d'état) · **scénario** si la feature entre dans une boucle · **porte verte** (§5) · doc d'état à jour.
- **Feature (UI)** — respecte le design system / tokens · **smoke test de rendu** · pas de régression sur les écrans voisins · accessibilité minimum (`alt`, contraste) · capture si pertinent.
- **Bug fix** — **test de régression écrit AVANT le fix (TDD strict)** : il échoue d'abord, c'est ce qui prouve qu'il garde (§5) · tests verts après · stack trace originale notée dans le commit si pertinent.
- **Refactor** — tests existants verts (zéro changement de comportement) · pas de nouvelle dépendance injustifiée · taille du livrable stable (±5 %).
- **Data / contenu** — **test de structure** (champs requis, IDs uniques, références valides) · nommage cohérent (§7).
- **Docs / process** — markdown lisible · liens internes valides · CHANGELOG mis à jour si impact workflow.

---

## 4. Process de Pull Request

**Branche de travail → `dev`**
1. **Porte verte** (§5) sur la branche.
2. Push la branche (`git push -u origin <branche>`).
3. PR titrée **comme un commit** (`type(scope): …`).
4. Description = lien vers le ticket + changements clés + **comment tester** (étapes) + captures si UI. Une branche apporte ses tests, ou la PR dit pourquoi elle n'en a pas besoin.
5. Revue croisée (`/code-review` côté Claude) + auto-review du diff → **squash merge**.

**`dev → master` (release)**
1. `dev` porte une suite de features cohérente (pas un mix incomplet).
2. **🚦 Gate de release obligatoire** : porte verte sur `dev` + recette E2E du projet (§7) — sine qua non.
3. CHANGELOG : `[Unreleased] → [vX.Y.Z] - AAAA-MM-JJ`.
4. PR `dev → master` → **merge classique** → `git tag vX.Y.Z && git push --tags` → **resync `dev`** (§1).

---

## 5. Tests

**Pyramide** (unitaire → fonctionnel → scénarios → UI) :
- **Unitaire** — logique pure, testable sans mock (à côté du source).
- **Fonctionnel** — actions d'état / API (fichiers dédiés par domaine).
- **Scénarios** — multi-actions qui simulent un parcours réel.
- **UI** — rendu + navigation (smoke test obligatoire sur les flux critiques).

**Couverture visée** : logique pure ~90 % · le reste ≥ 80 % (au moins un test par action ou fonction publique) · UI = smoke + flux critiques.

**La porte — une seule commande avant toute fusion.**
- `porte` enchaîne tout ce qui doit être vert (lint/format, typage s'il y en a, tests, build, e2e) et **s'arrête à la première erreur**. Commande exacte : §7.
- On fusionne **parce que la porte est verte**, pas parce que le travail est fini — même pour un petit changement.
- Si un test échoue, on corrige le code — **jamais le test**, sauf à écrire pourquoi le test avait tort.
- La même commande tourne en local, dans le hook et en CI (§6) : ce qui est vert ici est vert là-bas.

**Une garde ne vaut que cassée au moins une fois.**
- Avant d'affirmer qu'un test protège quelque chose, le faire **échouer exprès** (casser le code ou l'attente), constater le rouge, puis rétablir.
- Obligatoire pour les **assertions négatives** (« n'apparaît pas », `toHaveCount(0)`, `not.toBeVisible()`, `assert x not in …`) : sur un mauvais sélecteur, elles passent à vide.

**E2E — Playwright (standard dès qu'il y a une interface).**
- Les parcours critiques se valident en **Playwright**, en vrai navigateur, et font partie de la porte.
- Tests **déterministes** : attendre les éléments (`await expect(locator)`), jamais de `waitForTimeout` fixe ; sélecteurs par rôle / `data-testid`, pas par classe CSS.
- Port paramétrable (`PORT_E2E`, §0) et serveur forcé en IPv4 (`127.0.0.1`) : sous Windows, `localhost` peut résoudre en `::1`.
- Parcours couverts et état du portage : §7.

---

## 6. Garde-fous (enforcement)

Les règles ci-dessus sont du *contexte* qu'un agent peut ne pas suivre. Pour les rendre **imposées** :

- **Pre-commit** : formatage + lint des fichiers indexés (outil et état : §7).
- **`/code-review`** (Claude Code) avant chaque PR — il lit ce fichier et `CLAUDE.md`.
- `💡 [proposé]` **Hook `PreToolUse`** pour imposer les règles dures : bloquer `git push` sur `master`/`dev`, refuser un nom de branche hors convention, et **exiger la porte verte avant un commit/merge**. (`/hooks` ou `.claude/settings.json`.)
- **CI** : exécute la même commande `porte` à chaque PR (état : §7).

---

## 7. Spécifique à ce dépôt (loop_breaker)

> **La seule section à remplacer pour réutiliser ce fichier dans un autre projet.**

- **Stack** : React 19 + Vite + Zustand 5 + Tailwind 4 + Vitest 4 + React Testing Library. **JavaScript pur** (pas de TypeScript).
- **Branche stable** : `master` (les autres projets utilisent `main`). Intégration sur `dev`.
- **Porte** : `npm run porte` = `lint` + `format:check` + `test:run` (Vitest, 1000+ tests) + `build` + `test:e2e` (Playwright).
- **E2E** : Playwright (chromium, viewport 1920×1080), config `playwright.config.js` (serveur Vite forcé en `127.0.0.1`, port `PORT_E2E`, 5173 par défaut — pas de réutilisation de serveur quand il est fixé), tests dans `e2e/`. Scénarios de référence : `docs/TEST_SCENARIOS.md` S1→S10. **S1 est porté** (`e2e/scenarios/S1-onboarding.spec.js`) ; S2→S10 attendent en squelette `test.fixme` dans `e2e/scenarios/release-gate.spec.js`, à éclater en un fichier par parcours au fil du portage. Tant qu'ils ne sont pas portés, leur **recette manuelle** (vrai navigateur, cochée avec date et hash de commit) complète la gate de release.
- **Pre-commit** : husky + lint-staged (`eslint --fix` + `prettier --write` sur les fichiers indexés), installé au `npm install` (`npm run prepare` sinon).
- **CI** : aucune. `💡 [proposé]` ticket DX-CI01 : la même `porte` à chaque PR.
- **Scopes de commit** : `combat`, `store`, `quests`, `deities`, `ui`, `save`, `tests`, `proc`, `balance`. L'historique mêle messages en français et en anglais.
- **Nommage** : composant React `PascalCase` · hook `useXxx` · action store `camelCase` (verbe + objet) · constante data `SCREAMING_SNAKE_CASE` · fonction engine `camelCase` · ID en data `snake_case` · ID de ticket `PREFIXE + NN`.
- **Architecture** : `data/` (données pures, immuables) · `engine/` (logique pure, 100 % testable sans mock) · `store/` (Zustand en slices) · `screens/` (orchestration) · `components/` (réutilisables). **Règle d'or : la logique métier va dans `engine/` ; les screens orchestrent, les actions store mutent l'état.**
- **Règle save (non négociable)** : tout champ ajouté à un `INITIAL_*` → migration dans `normalizeSave()` **et** test de régression dans `store/saveNormalize.test.js`.
- **Docs de référence** (détail long) : `docs/CONTRIBUTING.md` (guide humain complet) · `CONTEXT.md` (état + ADRs) · `TASKS.md` (backlog, système PRIO-SYS01) · `docs/TEST_SCENARIOS.md` (recette E2E) · `CHANGELOG.md`.
