# Revue du backlog — 5 novembre 2026

## Résultat et périmètre

Inventaire de `TASKS.md`, croisé avec `CONTEXT.md`, `docs/CONTRIBUTING.md`, les documents de design, quelques points de code et l'état Git local. **196 entrées non closes : 189 ouvertes et 7 partielles, réparties sur 29 sections.** Ce chiffre mesure les cases du document, pas 196 fonctionnalités toutes absentes : il inclut des chapeaux, des sous-décisions et des tickets devenus obsolètes.

Le dernier état de campagne documenté est de 2085 tests verts dans 182 fichiers. Les tests n'ont pas été relancés pour cette revue documentaire. Les systèmes futurs n'ont pas tous été audités ligne par ligne. Les mentions « prêt » ci-dessous proviennent du backlog et ne valent pas vérification de toutes les dépendances.

La branche courante observée est `feat/v1.37_quests_refonte`, avec le commit `dd5827a` de refonte des quêtes. Le tag local `v0.2.0` existe. Le dépôt était propre au début de la revue ; des assets non suivis sont ensuite apparus dans `public/villages/greywatch/npcs/`. Ils n'ont pas été modifiés.

## 1. À mettre à jour avant de compter le travail restant

| Ticket | Constat |
|---|---|
| QOBJ-TYPES01 / QONBOARD01 | Code et traduction présents ; le reliquat « FIX-I18N01 + merge dev » est historique. Les tests de ces fonctionnalités existent. La validation navigateur complète reste un autre sujet. |
| CMB-DIR01 | `docs/design/CMB-DIR01-target.md` déclare explicitement la direction A validée et les critères de clôture remplis. Reste l'implémentation de l'écran, bloquée par les fonds peints. |
| MVAR01 | `monsterPortraits.js`, `generateEnemies` et les tests de variantes font déjà fonctionner le choix des portraits en combat. Vérifier le périmètre ZoneView/Codex avant de fermer tout le ticket. |
| QOL02 | Les fonctions d'export/import sont présentes dans `saveSlice.js`. Le multi-slot n'est pas implémenté dans cette slice ; il reste un travail réel. |
| REP-REBAL01 | Le rang utilise déjà `hero.rankPoints`, distinct des tokens dépensables. La partie économique du ticket reste pertinente. |
| REL-TAG01 | Le tag local existe et CONTEXT décrit la release 0.2.0 comme livrée. Réconcilier l'état GitHub et la recette au lieu de relancer mécaniquement les anciennes opérations. |
| D06 | Un respawn au sommeil existe déjà dans `worldSlice.sleep`. L'adaptation au futur donjon, sa position et son cycle exact doivent être distingués du comportement déjà livré. |
| CONTEXT / README | Plusieurs compteurs et descriptions historiques coexistent avec le nouvel encart campagne : six MQ / onze MQ, anciennes versions de save, anciens nombres de tests. Une passe de synchronisation documentaire est utile. |

## 2. Ce qui peut démarrer dès maintenant

Ordre conseillé, sans commencer ces implémentations pendant cette revue :

| Ordre | Ticket / lot | Pourquoi maintenant | Livrable et limite |
|---|---|---|---|
| 1 | TEST-SCEN01 + BAL02/BAL03 ciblés | La campagne et l'idle viennent de changer. | Reprendre une ancienne save de Millhaven, finir la campagne en navigateur, mesurer temps/morts/rythme. Ne pas ajuster l'économie sans mesures ; une modification de formule imposera ses tests. |
| 2 | Synchronisation du backlog | Plusieurs cases ouvertes correspondent à du code existant ou à des décisions déjà prises. | Réconcilier les tickets ci-dessus et les chiffres de CONTEXT. Pas de clôture de recette réelle sur la seule foi de tests unitaires. |
| 3 | UX-COMPARE-EXT01 | Aucun asset externe ni refonte moteur requis. | Corriger notamment les bagues : l'inventaire lit `equipped[selectedItem.slot]` alors que les instances de catégorie `ring` sont portées dans `ring1/ring2`. Comparaison des deux bagues et de l'amulette, tests d'équipement. |
| 4 | DV05 | Couleurs par dieu déjà définies dans `deities.js`. | Aura/bordure sur HeroCard et état sans dieu ; changement visuel limité, vérification de lisibilité. |
| 5 | Partie autonome de SETTINGS-FULL01 / QOL02 | Export/import existe dans le store, mais n'est pas proposé dans les Options actuelles. | Exposer sauvegarde/restauration et erreurs de format avec les migrations existantes ; traiter les slots séparément. |
| 6 | SKILL-DESC01, périmètre court | Le code masque les descriptions des SkillRow compactes. Tooltip déjà disponible. | Description au survol + helper pur d'effet estimé, réutilisant les formules actuelles ; ne pas confondre estimation et dégât garanti. Chiffrage des statuts particuliers à couvrir par tests. |
| 7 | IDLE-AUDIT01 ciblé | Priorité P5 historique à réexaminer avec l'idle au cœur de la campagne. | Vérifier zones interdites, transitions, vigueur, seuils PV, offline et progression de maîtrise. Le ticket de sécurité complet dépasse cet audit. |
| 8 | BLDUNL02 → BLDUNL03/04 | Pré-requis de quêtes désormais disponibles. | Câbler les triggers. D'abord fixer la présence des services essentiels : certains bâtiments de village sont encore optionnels. Ne pas verrouiller le tableau qui fournit la quête permettant de l'ouvrir. |

Les lots 3 et 4 sont les meilleurs petits changements techniques indépendants. Les lots 1 et 2 sont les plus utiles pour sécuriser l'état actuel. Les lots 5 et 6 améliorent directement la compréhension et le confort du joueur.

## 3. Prêt à préparer, avec une dépendance à respecter

- **Donjons :** cadrage maintenant ; modèle, générateur et tests purs ensuite. Les assets n'empêchent pas d'avancer sur la logique, mais la conception doit d'abord être réconciliée : `TASKS.md` décrit **9 salles linéaires**, tandis que `reviews/propositions-2026-07-20-donjon.json` décrit **5–6 salles procédurales avec embranchement**, option B « retenue à l'oral », et une citadelle senior plus longue. La feuille de revue Excel n'a pas été lue dans cette passe. Ne pas démarrer D01 sur l'ancienne spécification sans vérifier cette décision.
- **Mini-jeu de forge :** le prototype et le découpage existent. Ordre : CRAFTMG-ENGINE01 → CRAFTMG-FORGE01/SHAPE01 → CRAFTMG-AUTO01. Clarifier le couplage au grade et au plafond local, encore ouverts, avant de promettre la totalité du moteur final.
- **Drops d'équipement :** EQDROP-G1 puis EQDROP01b. Taux validés, mais le pool et le branchement du loot doivent précéder le réglage effectif.
- **Divin :** ALT01 peut démarrer ; DVQ01 vient après le modèle de faveur. DV11 précède DV12.
- **Événements :** EVT01 avant EVT02/EVT03 ; les marqueurs verts des consommateurs ne suppriment pas cette dépendance.
- **Art de combat :** ASSET-ARENA01 prépare une vraie livraison d'écran. Les cinq fonds peints sont une condition de la décision validée ; ne pas livrer un remplacement provisoire en dégradés alors que la décision est « assets d'abord, écran complet ensuite ».

## 4. À ne pas lancer sans cadrage ou dégel

- **MONLV01** porte une formule décidée mais laisse ouverts les récompenses/drops et le bonus élite. La borne basse proposée peut dépasser la borne haute quand le héros dépasse largement la plage du spot : traiter ce cas avant câblage. Le run scaling est encore 1.08 dans la configuration, contre 1.03 proposé.
- **Combat ATB :** CMB-COST01 demande un chiffrage validé ensemble. Puis ATB01 → ATB02 → intents/break/focus. L'écran complet dépend aussi des assets validés.
- **Map 2 / embuscades :** épique explicitement gelée ; la campagne actuelle conclut le contenu jouable sans constituer la future carte complète.
- **Météo :** WTHR-G1 exige une décision de cohérence temporelle avant les effets.
- **Foyer / méta / pactes / reliques d'âme :** frontières de persistance, cumul et héritage encore à décider.
- **Audio :** sourcing/style avant le système ; musique et SFX ne sont pas prêts indépendamment de cette base.
- **Multivers et backend :** projets structurants planifiés plus tard ; ne pas les glisser dans une stabilisation de la campagne.

## 5. Capacité GitHub, Git local et GitKraken dans cette session

### Vérification effective

- Dépôt : `rosariAdr/loop_breaker`, branche par défaut distante `master`.
- Connecteur GitHub : compte `javidjmg28` ; métadonnées du dépôt : `pull:true`, `push:false`, `admin:false`. L'API de consultation détaillée des droits a répondu 403 « Resource not accessible by integration ».
- Cela permet de lire ce dépôt et de travailler avec les outils de consultation accessibles. L'existence d'outils de création de branche/PR/merge dans le connecteur ne garantit pas leurs droits sur ce dépôt.
- GitKraken Desktop a été inspecté en lecture : dépôt `roguelite-game`, branche de refonte et commit `dd5827a` visibles ; boutons Pull/Push/Branch/Stash accessibles dans l'interface. Aucun bouton de mutation n'a été actionné.
- Les credentials GitKraken et ceux du connecteur GitHub sont distincts. Aucun push de test n'a été effectué, donc aucun droit de publication n'est attesté pour la session GitKraken.

### Travail possible

- **Local :** inspecter commits/branches/diffs, créer une branche de travail pour un développement autorisé, modifier, tester et préparer une intégration.
- **GitHub :** lire code/PR/issues/CI selon les permissions disponibles ; publier une branche, une PR ou une fusion demande à la fois l'autorisation de la tâche et des droits effectifs adaptés.
- **GitKraken :** pilotage graphique possible pour inspecter les branches, comparer des commits et réaliser les opérations demandées ; l'automatisation UI est plus lente et dépend de la stabilité de la fenêtre.
- **Workflow du projet :** `docs/CONTRIBUTING.md` réserve les commits au développeur via GitKraken, interdit les commits directs sur master/dev et prévoit feature → dev puis dev → master. Aucun commit, push, merge, PR, tag ou changement d'authentification n'a été effectué pour cette revue.

Documentation officielle consultée sur les revues Codex : [Custom Code Review rules for Codex](https://developers.openai.com/blog/custom-code-review-rules-for-codex). Les droits propres à cette session ci-dessus proviennent des outils connectés et de l'observation locale, pas d'une promesse générale du produit.

## 6. Inventaire exhaustif des cases non closes

Lecture fidèle de TASKS, avec statut documentaire et exceptions identifiées. « Prêt déclaré » signifie uniquement le marqueur vert du document ; vérifier la section 3 avant de planifier les tickets dépendants.

### 🚀 RELEASE-0.2.0 — Gate de release master — 2 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [TEST-SCEN01 — Recette fonctionnelle = gate sine qua non](../TASKS.md#L391) | P2 | Partiel · À cadrer | À faire : recette navigateur complète, notamment nouvelle campagne et anciennes saves. |
| [REL-TAG01 — Bump 0.2.0 + PR dev→master + tag + resync](../TASKS.md#L392) | P2 | Partiel · À cadrer | À réconcilier : le tag local v0.2.0 existe ; ne pas refaire une release ancienne sans vérifier l'état distant. |

### v1.34 — Tech / DX / Balance — 3 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [BAL02 — Calibration boss difficulty + playtest](../TASKS.md#L495) | P2 | Ouvert · Prêt déclaré | — |
| [BAL03 — Calibration idle kill rate vs progression](../TASKS.md#L496) | P2 | Ouvert · Prêt déclaré | — |
| [TECH04 — Performance Canvas 2D — budget 60fps](../TASKS.md#L500) | P3 | Ouvert · Prêt déclaré | — |

### v1.41 — Donjon — 7 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [D01-SPEC — Spécifier le flux de donjon (DESIGN.md)](../TASKS.md#L509) | P3 | Ouvert · Prêt déclaré | Contradiction à résoudre : TASKS impose neuf salles, le JSON de revue décrit l'option B procédurale retenue à l'oral. |
| [DUN-MODEL01 — Modèle de données « donjon à salles »](../TASKS.md#L510) | P3 | Ouvert · Prêt déclaré | — |
| [D01 — Flux donjon complet](../TASKS.md#L511) | P3 | Ouvert · Prêt déclaré | — |
| [D03 — Carte de donjon](../TASKS.md#L512) | P3 | Ouvert · Prêt déclaré | — |
| [DUN-ART01 — Carte graphique du donjon (9 salles)](../TASKS.md#L513) | P3 | Ouvert · À cadrer | — |
| [D06 — Donjon spawn la nuit suivante](../TASKS.md#L514) | P3 | Ouvert · Prêt déclaré | — |
| [DUNREV01 — Revue complète du système de donjon (umbrella)](../TASKS.md#L515) | P3 | Ouvert · Prêt déclaré | — |

### v1.42 — Équipement & Craft — 21 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [CRAFT-GRADE01 — Grades de craft par métier](../TASKS.md#L529) | P3 | Ouvert · Prêt déclaré | — |
| [CRAFT-TOOL01 — Outils de craft par métier](../TASKS.md#L533) | P3 | Ouvert · Prêt déclaré | — |
| [CRAFT-LOC01 — Plafond de rareté par lieu](../TASKS.md#L534) | P3 | Ouvert · Prêt déclaré | — |
| [CRAFT-LOC-G1 — Exception maître forgeron](../TASKS.md#L535) | P3 | Ouvert · Prêt déclaré | — |
| [CRAFT-QUEST01 — Quêtes de craft](../TASKS.md#L536) | P3 | Ouvert · Prêt déclaré | — |
| [CRAFTMG01 — Mini-jeux dédiés par métier de craft (umbrella)](../TASKS.md#L537) | P3 | Ouvert · Prêt déclaré | — |
| [CRAFTMG-ENGINE01 — Moteur `MiniGame` partagé (composant + logique pure)](../TASKS.md#L538) | P3 | Ouvert · Prêt déclaré | — |
| [CRAFTMG-FORGE01 — Variante forge (chaleur + frappe)](../TASKS.md#L539) | P3 | Ouvert · Prêt déclaré | — |
| [CRAFTMG-SHAPE01 — Silhouette & chemin de frappe par équipement (`forgeShape`)](../TASKS.md#L540) | P3 | Ouvert · Prêt déclaré | — |
| [CRAFTMG-AUTO01 — Auto-forge basé sur l'historique de la pièce](../TASKS.md#L541) | P3 | Ouvert · Prêt déclaré | — |
| [CRAFT-DISC01 — Craft expérimental (découverte)](../TASKS.md#L542) | P3 | Ouvert · Prêt déclaré | — |
| [LEAT01 — Séparer forge (métal) et cordonnier (cuir)](../TASKS.md#L545) | P3 | Ouvert · Prêt déclaré | — |
| [BIJOU01 — Métier bijoutier](../TASKS.md#L546) | P3 | Ouvert · Prêt déclaré | — |
| [BIJOU-BLD01 — Bâtiment + NPC bijoutier](../TASKS.md#L547) | P3 | Ouvert · Prêt déclaré | — |
| [COOK01 — Métier de cuisine](../TASKS.md#L548) | P3 | Ouvert · Prêt déclaré | — |
| [EQDROP01b — Drops d'équipement tier-based](../TASKS.md#L555) | P3 | Ouvert · Prêt déclaré | — |
| [EQDROP-G1 — Pool d'équipement](../TASKS.md#L556) | P3 | Ouvert · Prêt déclaré | — |
| [ENCH01 — Renforcement +N](../TASKS.md#L557) | P4 | Ouvert · Prêt déclaré | — |
| [ENCH02 — Risque d'échec](../TASKS.md#L558) | P4 | Ouvert · Prêt déclaré | — |
| [SOCKET01 — Sertir des mana stones](../TASKS.md#L559) | P4 | Ouvert · Prêt déclaré | — |
| [UX-COMPARE-EXT01 — Comparaison équipement étendue](../TASKS.md#L560) | P3 | Ouvert · Prêt déclaré | — |

### ⚔ COMBAT-ATB — Sablier de Guerre + Frappes du Destin (v1.44) — 9 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [CMB-ATB01 — Moteur de jauges ATB + ranks d'action](../TASKS.md#L583) | P3 | Ouvert · Prêt déclaré | — |
| [CMB-ATB02 — Timeline visible (bandeau 5-7 portraits)](../TASKS.md#L584) | P3 | Ouvert · Prêt déclaré | — |
| [CMB-QTE01 — Timing bars sur les skills (1 input)](../TASKS.md#L585) | P3 | Ouvert · Prêt déclaré | — |
| [CMB-INT01 — Intents chiffrés (avec RNG, crits jamais télégraphiés)](../TASKS.md#L586) | P3 | Ouvert · Prêt déclaré | — |
| [CMB-COST01 — Grille de coûts d'action (préparation vs immédiat, en tours & AGI)](../TASKS.md#L587) | P3 | Ouvert · À cadrer | — |
| [CMB-DIR01 — Direction artistique & présentation du combat (maquettes avant code)](../TASKS.md#L588) | P3 | Ouvert · À cadrer | Clôturable : maquette cible explicitement validée, livrable présent ; ne pas refaire la phase de design. |
| [ASSET-ARENA01 — 5 fonds d'arène peints](../TASKS.md#L601) | P3 | Ouvert · À cadrer | Prompts disponibles, dossier public/arenas absent au contrôle ; livraison visuelle combat bloquée par ces assets. |
| [CMB-BREAK01 — Bouclier / break solo](../TASKS.md#L602) | P3 | Ouvert · Prêt déclaré | — |
| [CMB-FOCUS01 — Garde qui banque (Focus)](../TASKS.md#L603) | P3 | Ouvert · Prêt déclaré | — |

### v1.51 — Monde & carte — 11 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [MONLV01 — Système de niveau des monstres](../TASKS.md#L610) | P3 | Ouvert · Prêt déclaré | Pas entièrement prêt : récompenses/drops et bonus élite ouverts ; borner la formule quand le héros dépasse la zone. |
| [WMAP06 — Asset Map 1](../TASKS.md#L617) | P3 | Ouvert · Prêt déclaré | — |
| [WMAP08 — Recalibrage `POS`](../TASKS.md#L618) | P3 | Ouvert · Prêt déclaré | — |
| [WMAP-G1 — Re-leveling Barrow Hills](../TASKS.md#L619) | P3 | Ouvert · Prêt déclaré | — |
| [WMAP-G2 — Bestiaire Thornmarsh Lv 20-30](../TASKS.md#L620) | P3 | Ouvert · Prêt déclaré | — |
| [WMAP-G3 — Nommage assets](../TASKS.md#L621) | P3 | Ouvert · Prêt déclaré | — |
| [BLDUNL02 — Déblocage progressif des bâtiments](../TASKS.md#L622) | P2 | Partiel · Prêt déclaré | Plomberie présente ; triggers non câblés, bâtiments optionnels à traiter sans rendre la campagne impossible. |
| [BLDUNL03 — Académie via quête](../TASKS.md#L623) | P2 | Partiel · Prêt déclaré | Faisable avec le lot BLDUNL02 ; respecter l'accès au contenu obligatoire. |
| [BLDUNL04 — Guilde via quête](../TASKS.md#L624) | P2 | Partiel · Prêt déclaré | Faisable avec le lot BLDUNL02 ; éviter de cacher le tableau requis pour la campagne. |
| [ZADV01 — Design de la zone avancée (Grimspire) + bestiaire](../TASKS.md#L625) | P3 | Ouvert · Prêt déclaré | — |
| [ZONE-NAMING01 — Nettoyage des ids de zone](../TASKS.md#L626) | P3 | Ouvert · Prêt déclaré | — |

### v1.52 — Divin — 5 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [DV05 — Aura divine visuelle](../TASKS.md#L632) | P3 | Ouvert · Prêt déclaré | — |
| [ALT01 — Autels des dieux + relations divines](../TASKS.md#L633) | P3 | Ouvert · Prêt déclaré | — |
| [DVQ01 — Quêtes divines à l'église](../TASKS.md#L634) | P3 | Ouvert · Prêt déclaré | — |
| [DV11 — Relations inter-divines −10/+10](../TASKS.md#L635) | P3 | Ouvert · Prêt déclaré | — |
| [DV12 — Oracle divin (boutique)](../TASKS.md#L636) | P3 | Ouvert · Prêt déclaré | — |

### VOW — Vœux divins de run (v1.53) — 3 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [VOW01 — Data vœux + conditions trackées](../TASKS.md#L641) | P3 | Ouvert · Prêt déclaré | — |
| [VOW02 — UI serment + suivi](../TASKS.md#L642) | P3 | Ouvert · Prêt déclaré | — |
| [VOW03 — Résolution à la mort](../TASKS.md#L643) | P3 | Ouvert · Prêt déclaré | — |

### PACT — Pactes de transmigration à double tranchant (v1.54) — 4 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [PACT01 — Data des pactes](../TASKS.md#L648) | P3 | Ouvert · Prêt déclaré | — |
| [PACT02 — UI PostMortem (3ᵉ volet « Pactes »)](../TASKS.md#L649) | P3 | Ouvert · Prêt déclaré | — |
| [PACT03 — Application au run suivant](../TASKS.md#L650) | P3 | Ouvert · Prêt déclaré | — |
| [PACT-G1 — Cumul](../TASKS.md#L651) | P3 | Ouvert · À cadrer | — |

### NEM — Némésis : le monde se souvient de tes morts (v1.55) — 3 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [NEM01 — Capture + génération](../TASKS.md#L656) | P3 | Ouvert · Prêt déclaré | — |
| [NEM02 — Rendu](../TASKS.md#L657) | P3 | Ouvert · Prêt déclaré | — |
| [NEM03 — Récompenses + expiration](../TASKS.md#L658) | P3 | Ouvert · Prêt déclaré | — |

### ECHO — Échos du prédécesseur : ta tombe, ton fantôme (v1.56) — 4 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [ECHO01 — Persistance lieu + loadout de mort](../TASKS.md#L663) | P3 | Ouvert · Prêt déclaré | — |
| [ECHO02 — Tombe : marqueur + recueillement](../TASKS.md#L664) | P3 | Ouvert · Prêt déclaré | — |
| [ECHO03 — Combat d'Écho](../TASKS.md#L665) | P3 | Ouvert · Prêt déclaré | — |
| [ECHO-G1 — Cadrage](../TASKS.md#L666) | P3 | Ouvert · À cadrer | — |

### WTHR — Météo par zone (v1.57) — 4 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [WTHR-G1 — Modèle de cohérence temporelle](../TASKS.md#L671) | P3 | Ouvert · À cadrer | — |
| [WTHR01 — Data météo + tirage cohérent](../TASKS.md#L672) | P3 | Ouvert · Bloqué | — |
| [WTHR02 — Effets branchés](../TASKS.md#L673) | P3 | Ouvert · Bloqué | — |
| [WTHR03 — UI](../TASKS.md#L674) | P3 | Ouvert · Bloqué | — |

### v1.61 — Compagnons — 12 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [CMP01 — Structure données Companion + traits](../TASKS.md#L679) | P3 | Ouvert · Prêt déclaré | — |
| [CMP02 — Génération aléatoire traits à la rencontre](../TASKS.md#L680) | P3 | Ouvert · Prêt déclaré | — |
| [CMP03 — followProbability() dans combat.js](../TASKS.md#L681) | P3 | Ouvert · Prêt déclaré | — |
| [CMP04 — CompanionCard en combat](../TASKS.md#L682) | P3 | Ouvert · Prêt déclaré | — |
| [CMP05 — Interface conseil joueur (3s)](../TASKS.md#L683) | P3 | Ouvert · Prêt déclaré | — |
| [CMP06 — Recrutement compagnon SafeZone + donjon](../TASKS.md#L684) | P3 | Ouvert · Prêt déclaré | — |
| [CMP07 — Permadeath + message narratif](../TASKS.md#L685) | P3 | Ouvert · Prêt déclaré | — |
| [CMP08 — Easter egg relation ≥ 9](../TASKS.md#L686) | P3 | Ouvert · Prêt déclaré | — |
| [CMP09 — Évolution relationScore](../TASKS.md#L687) | P3 | Ouvert · Prêt déclaré | — |
| [COMP01 — Familier d'assistance](../TASKS.md#L688) | P4 | Ouvert · Prêt déclaré | — |
| [COMP02 — Apprivoisement](../TASKS.md#L689) | P4 | Ouvert · Prêt déclaré | — |
| [COMP03 — Progression du familier](../TASKS.md#L690) | P4 | Ouvert · Prêt déclaré | — |

### v1.62 — Événements, explo & NPC — 8 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [EVT01 — Framework événements aléatoires](../TASKS.md#L694) | P3 | Ouvert · Prêt déclaré | — |
| [EVT02 — Événements de zone implémentés](../TASKS.md#L695) | P3 | Ouvert · Prêt déclaré | — |
| [EVT03 — Événements nocturnes](../TASKS.md#L696) | P3 | Ouvert · Prêt déclaré | — |
| [EXPL01 — Nodes cachés](../TASKS.md#L697) | P4 | Ouvert · Prêt déclaré | — |
| [EXPL02 — Événements de route non-combat](../TASKS.md#L698) | P4 | Ouvert · Prêt déclaré | — |
| [EXPL03 — Coffres / trésors de zone](../TASKS.md#L699) | P4 | Ouvert · Prêt déclaré | — |
| [NPC03 — NPCs récurrents avec mémoire](../TASKS.md#L700) | P3 | Ouvert · Prêt déclaré | — |
| [NPC05 — Maître itinérant à la Guilde](../TASKS.md#L701) | P3 | Ouvert · Prêt déclaré | — |

### v1.71 — UI / UX & a11y — 10 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [UI10 — Refonte du format d'affichage : passage en 16:9](../TASKS.md#L706) | P4 | Ouvert · À cadrer | — |
| [TIME-DISPLAY01 — Refonte de l'affichage de l'heure](../TASKS.md#L707) | P3 | Ouvert · À cadrer | — |
| [SETTINGS-FULL01 — Compléter l'écran Options](../TASKS.md#L708) | P3 | Ouvert · À cadrer | Découpable : exposer export/import dès maintenant ; volume après système audio. |
| [A11Y01 — Accessibilité de base](../TASKS.md#L709) | P3 | Ouvert · À cadrer | — |
| [UX04 — Navigation clavier complète](../TASKS.md#L710) | P3 | Ouvert · À cadrer | — |
| [U02 — Responsive mobile](../TASKS.md#L711) | P3 | Ouvert · À cadrer | — |
| [ONBOARD01 — Onboarding premier run (tooltips contextuels)](../TASKS.md#L712) | P3 | Ouvert · À cadrer | — |
| [QOBJ-TYPES01 — Nouveaux types d'objectif de quête (actions non-combat)](../TASKS.md#L713) | P3 | Partiel · Prêt déclaré | Clôturable côté code : types non-combat déjà intégrés et traduits ; ancienne réserve de merge à actualiser. |
| [QONBOARD01 — Chaîne de quêtes d'onboarding (« Les premiers pas », Greywatch)](../TASKS.md#L714) | P3 | Partiel · Prêt déclaré | Clôturable côté code : chaîne intégrée, traduite et testée ; conserver la recette réelle séparée. |
| [SKILL-DESC01 — Skills : description courte + effet chiffré selon les stats (Hero Sheet + combat)](../TASKS.md#L715) | P3 | Ouvert · À cadrer | — |

### v1.72 — Idle & planification — 10 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [IDLE-AUDIT01 — Cohérence de l'idle](../TASKS.md#L720) | P5 | Ouvert · À cadrer | — |
| [IDLE-SAFE01 — Sécurité idle](../TASKS.md#L721) | P3 | Ouvert · Prêt déclaré | Arrêt PV partiellement présent ; mort hors ligne/embuscades dépendent d'autres systèmes. |
| [IDLE-INT01 — Interactions idle (résolu)](../TASKS.md#L722) | P3 | Ouvert · Prêt déclaré | Dépend d'éléments nocturnes/embuscades non livrés ; le mot « résolu » concerne la décision, pas le code. |
| [IDLE-CRAFT01 — Idle généralisé au craft](../TASKS.md#L723) | P3 | Ouvert · Prêt déclaré | — |
| [PLAN01 — Écran de planification (auberge/foyer)](../TASKS.md#L724) | P3 | Ouvert · Prêt déclaré | — |
| [PLAN02 — Prérequis ≥3 activités](../TASKS.md#L725) | P3 | Ouvert · À cadrer | — |
| [QOL01 — Contrôle de vitesse + auto-battle](../TASKS.md#L726) | P4 | Ouvert · Prêt déclaré | — |
| [QOL02 — Multi-slots de sauvegarde + export/import](../TASKS.md#L727) | P4 | Ouvert · Prêt déclaré | Export/import déjà implémentés ; multi-slots et accès utilisateur restent à compléter. |
| [QOL03 — Raccourcis clavier remappables](../TASKS.md#L728) | P4 | Ouvert · Prêt déclaré | — |
| [UX-NUMFMT01 — Formatage des grands nombres](../TASKS.md#L729) | P5 | Ouvert · À cadrer | — |

### v1.81 — Méta / prestige — 7 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [META01 — Arbre méta persistant](../TASKS.md#L734) | P4 | Ouvert · À cadrer | — |
| [META02 — Choix de carryover étendus](../TASKS.md#L735) | P4 | Ouvert · À cadrer | — |
| [META03 — Modificateurs NG+](../TASKS.md#L736) | P4 | Ouvert · À cadrer | — |
| [HIS01 — Historique des runs](../TASKS.md#L737) | P3 | Ouvert · À cadrer | — |
| [HIS02 — Statistiques globales meta](../TASKS.md#L738) | P3 | Ouvert · À cadrer | — |
| [REP-REBAL01 — Rééquilibrage des tokens](../TASKS.md#L739) | P4 | Ouvert · À cadrer | Sous-problème rang/monnaie déjà corrigé via rankPoints ; recalibrage économique restant. |
| [PERMSTAT01 — Items de stats définitives](../TASKS.md#L740) | P4 | Ouvert · À cadrer | — |

### SOUL — Reliques liées à l'âme (v1.83) — 3 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [SOUL01 — Flag `soulbound` + persistance](../TASKS.md#L745) | P3 | Ouvert · Prêt déclaré | — |
| [SOUL02 — Rituel de liaison](../TASKS.md#L746) | P3 | Ouvert · Prêt déclaré | — |
| [SOUL-G1 — Périmètre](../TASKS.md#L747) | P3 | Ouvert · À cadrer | — |

### v1.82 — Assets, art & lore — 10 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [CONT01 — Sprites de carte/combat chibi (couche A)](../TASKS.md#L752) | P3 | Ouvert · À cadrer | — |
| [UI08 — Intégration sprites (couches A + B)](../TASKS.md#L753) | P3 | Ouvert · À cadrer | — |
| [C03 — Portraits personnage](../TASKS.md#L754) | P4 | Ouvert · À cadrer | — |
| [CONT05 — ASSETS.md + sourcing licences](../TASKS.md#L755) | P4 | Ouvert · Prêt déclaré | — |
| [MVAR01 — Variante d'image par ennemi (combats multi-ennemis)](../TASKS.md#L756) | P3 | Ouvert · À cadrer | Déjà réalisé en combat ; vérifier séparément l'extension éventuelle ZoneView/Codex avant clôture totale. |
| [HS-EQUIP01 — Icônes/assets pour les objets équipés](../TASKS.md#L757) | P3 | Ouvert · À cadrer | — |
| [ART-EQUIP01 — Images Gemini pour tout l'équipement (craftable + droppable)](../TASKS.md#L758) | P3 | Ouvert · À cadrer | — |
| [CONT02 — Descriptions lore par zone](../TASKS.md#L759) | P3 | Ouvert · À cadrer | — |
| [CONT03 — Flavor text sur les skills](../TASKS.md#L760) | P3 | Ouvert · À cadrer | — |
| [CODEX02 — Codex de lore](../TASKS.md#L761) | P3 | Ouvert · À cadrer | — |

### CULT — Le Cercle des Éveillés (v1.84) — 4 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [CULT01 — PNJ + mémoire trans-run](../TASKS.md#L766) | P4 | Ouvert · Prêt déclaré | — |
| [CULT02 — 3 services méta](../TASKS.md#L767) | P4 | Ouvert · Prêt déclaré | — |
| [CULT03 — Progression du sanctuaire](../TASKS.md#L768) | P4 | Ouvert · Prêt déclaré | — |
| [CULT-G1 — Cadrage lore + écriture](../TASKS.md#L769) | P4 | Ouvert · À cadrer | — |

### v1.91 — Audio, game-feel & cycle nuit — 14 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [AUDIO-ASSETS01 — Sourcing des assets sonores (info)](../TASKS.md#L774) | P3 | Ouvert · À cadrer | — |
| [AUDIO01 — Système audio (SFX + musique)](../TASKS.md#L775) | P3 | Ouvert · À cadrer | — |
| [FEEL01 — SFX par action](../TASKS.md#L776) | P4 | Ouvert · Prêt déclaré | — |
| [FEEL02 — Musique par zone & jour/nuit](../TASKS.md#L777) | P4 | Ouvert · Prêt déclaré | — |
| [FEEL03 — Juice visuel](../TASKS.md#L778) | P4 | Ouvert · Prêt déclaré | — |
| [DN01 — Indicateur visuel jour/nuit](../TASKS.md#L779) | P4 | Ouvert · Prêt déclaré | — |
| [DN02 — Animation d'incrément de temps](../TASKS.md#L780) | P4 | Ouvert · Prêt déclaré | — |
| [DN03 — Variantes de map jour/nuit](../TASKS.md#L781) | P4 | Ouvert · Prêt déclaré | — |
| [DN-G1 — Cadrage jour/nuit](../TASKS.md#L782) | P4 | Ouvert · À cadrer | — |
| [DN04 — Capacités nocturnes des monstres](../TASKS.md#L783) | P4 | Ouvert · À cadrer | — |
| [DN05 — Récompenses majorées la nuit](../TASKS.md#L784) | P4 | Ouvert · À cadrer | — |
| [NSKL01 — Drop de skill rare nocturne](../TASKS.md#L785) | P4 | Ouvert · Prêt déclaré | — |
| [NSKL02 — 6 skills rares nocturnes](../TASKS.md#L786) | P4 | Ouvert · À cadrer | — |
| [NSKL-G1 — Balance](../TASKS.md#L787) | P4 | Ouvert · À cadrer | — |

### v1.92 — Multivers & Foyer — 5 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [X08 — Architecture multi-univers](../TASKS.md#L791) | P3 | Ouvert · À cadrer | — |
| [X09 — Règle de rotation (fenêtre glissante)](../TASKS.md#L792) | P3 | Ouvert · À cadrer | — |
| [HOME01a — Achat du foyer + emplacement sur la map du village](../TASKS.md#L793) | P3 | Ouvert · À cadrer | — |
| [HOME01b — Lit (dormir chez soi)](../TASKS.md#L794) | P3 | Ouvert · À cadrer | — |
| [HOME01c — Coffre de stockage](../TASKS.md#L795) | P3 | Ouvert · À cadrer | — |

### UNIV-WUSHU — Univers 2 : monde wushu (v1.95) — 4 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [UNIV-WU-DESIGN01 — Doc de design de l'univers](../TASKS.md#L800) | P4 | Ouvert · À cadrer | — |
| [UNIV-WU-DATA01 — Namespace data](../TASKS.md#L801) | P4 | Ouvert · Bloqué | — |
| [UNIV-WU-MAP01 — Carte + POS](../TASKS.md#L802) | P4 | Ouvert · Bloqué | — |
| [UNIV-WU-ART01 — Assets](../TASKS.md#L803) | P4 | Ouvert · Bloqué | — |

### UNIV-TOWER — Univers 3 : la Tour (v1.96) — 4 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [UNIV-TW-DESIGN01 — Doc de design](../TASKS.md#L808) | P4 | Ouvert · À cadrer | — |
| [UNIV-TW-DATA01 — Namespace data](../TASKS.md#L809) | P4 | Ouvert · Bloqué | — |
| [UNIV-TW-MAP01 — Rendu vertical de la carte](../TASKS.md#L810) | P4 | Ouvert · Bloqué | — |
| [UNIV-TW-ART01 — Assets](../TASKS.md#L811) | P4 | Ouvert · Bloqué | — |

### v1.93 — Intégration finale (gate) — 5 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [MIGRATE-EXT01 — Migration de save étendue](../TASKS.md#L816) | P3 | Ouvert · Prêt déclaré | — |
| [QA-EXT01 — Étendre l'audit d'intégrité](../TASKS.md#L817) | P3 | Ouvert · Prêt déclaré | — |
| [BAL-INTEG01 — Intégrer les nouveaux drops au balancing](../TASKS.md#L818) | P3 | Ouvert · Prêt déclaré | — |
| [BAL-AUDIT01 — Passe d'équilibrage globale](../TASKS.md#L819) | P2 | Ouvert · À cadrer | — |
| [SEC02 — Durcissement sécurité (post-alpha)](../TASKS.md#L820) | P4 | Ouvert · À cadrer | — |

### v1.94 — Backend & données (Supabase) — 8 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [SUPA-ADR01 — ADR : périmètre DB vs bundle](../TASKS.md#L825) | P3 | Ouvert · À cadrer | — |
| [SUPA-SETUP01 — Projet Supabase + client + env](../TASKS.md#L826) | P3 | Ouvert · À cadrer | — |
| [SUPA-SCHEMA01 — Schéma SQL des tables de contenu](../TASKS.md#L827) | P3 | Ouvert · À cadrer | — |
| [SUPA-SEED01 — Import initial des données actuelles](../TASKS.md#L828) | P3 | Ouvert · À cadrer | — |
| [SUPA-CODEGEN01 — Génération build-time de `src/data` depuis Supabase](../TASKS.md#L829) | P2 | Ouvert · À cadrer | — |
| [SUPA-SAVES01 — Saves cloud + Auth](../TASKS.md#L830) | P3 | Ouvert · À cadrer | — |
| [SUPA-TELEMETRY01 — Télémétrie de playtest (opt-in)](../TASKS.md#L831) | P4 | Ouvert · À cadrer | — |
| [SUPA-ADMIN01 — Édition du contenu : Studio vs mini-admin](../TASKS.md#L832) | P4 | Ouvert · À découper | — |

### gelé — Embuscade & Map 2 — 12 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [WMAP03 — Zone Draconic Supra Metal Rock](../TASKS.md#L837) | P4 | Ouvert · Prêt déclaré | — |
| [WMAP07 — Asset Map 2](../TASKS.md#L838) | P4 | Ouvert · Prêt déclaré | — |
| [WMAP09 — Transition inter-map](../TASKS.md#L839) | P4 | Ouvert · À découper | — |
| [AMB01 — Champ `ambush` sur edges Map 2](../TASKS.md#L840) | P4 | Ouvert · Prêt déclaré | — |
| [AMB02 — Roll par tick](../TASKS.md#L841) | P4 | Ouvert · Prêt déclaré | — |
| [AMB03 — Sous-roll élite](../TASKS.md#L842) | P4 | Ouvert · Prêt déclaré | — |
| [AMB04 — Surprise](../TASKS.md#L843) | P4 | Ouvert · Prêt déclaré | — |
| [AMB05 — Fuite pénalisée](../TASKS.md#L844) | P4 | Ouvert · Prêt déclaré | — |
| [AMB06 — Spawn haut de range](../TASKS.md#L845) | P4 | Ouvert · Prêt déclaré | — |
| [AMB07 — Taux de base par route](../TASKS.md#L846) | P4 | Ouvert · Prêt déclaré | — |
| [AMB-G1 — Map 2 seulement ?](../TASKS.md#L847) | P4 | Ouvert · À cadrer | — |
| [AMB-G2 — Définition `sum_stats`](../TASKS.md#L848) | P4 | Ouvert · À cadrer | — |

### v2 — Ambition résiduelle — 3 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [MAP03 — Migration WorldMap vers PixiJS v8](../TASKS.md#L854) | P3 | Ouvert · À cadrer | — |
| [BSS01b — Crypt Keeper : vraie invocation de Skeleton Adds](../TASKS.md#L855) | P3 | Ouvert · À cadrer | — |
| [BSS02b — Lord of the Forsaken : couche d'armure régénérante](../TASKS.md#L856) | P3 | Ouvert · À cadrer | — |

### v3 — Lointain — 1 entrées

| Ticket | Priorité | Statut documentaire | Observation |
|---|---|---|---|
| [ECO-DYN01 (SUG-E4) — Économie dynamique](../TASKS.md#L860) | P5 | Ouvert · À cadrer | — |


