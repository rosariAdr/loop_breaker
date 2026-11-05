# Campagne : ouvrir les routes, maîtriser la chasse

Conception et implémentation — 5 novembre 2026.

**État : implémenté dans le projet.** Campagne de onze étapes, trois fils facultatifs (neuf quêtes), verrou global d'idle, épreuve du Sentinelle et migration v4. L'amélioration d'arme demande 1 puis 2 orbes, avec un plafond de deux améliorations ; l'arme doit être dans le sac. La variante de verrou global proposée plus bas a été choisie. Les paragraphes de conception restent la référence des intentions initiales.

Les donjons utilisent les combats de boss déjà disponibles ; le parcours multi-salles reste à réaliser. La campagne de la future Map 2 n'est pas activée. Validation automatisée et smoke test navigateur documentés dans `../TEST_SCENARIOS.md` ; ne pas confondre avec une recette manuelle complète avant release.

### Validation de l'implémentation

- `npm run test:run -- --maxWorkers=4` : **2085 tests réussis, 0 échec, 0 ignoré, 182 fichiers**. Les 34 nouveaux tests dédiés se répartissent en 20 tests store, 6 tests purs de l'épreuve et 8 tests UI.
- Build de production et ESLint réussis ; contrôle de formatage effectué après suppression des rapports temporaires de tests. Le build conserve les avertissements existants sur l'ordre de l'import Google Fonts et la taille du chunk principal.
- `git diff --check` : aucune erreur d'espacement. Aucun commit ni déploiement effectué.
- Smoke test sur la vraie interface locale : démarrage → Greywatch → auberge → tableau → acceptation MQ01 → journal actif. Portail du journal contrôlé visuellement après correction de la superposition avec la sidebar.
- Les onze quêtes et les trois fils facultatifs, y compris les deux choix finaux du gardien, sont parcourus par les tests automatisés. L'équilibrage en jeu et la recette manuelle complète jusqu'à Malachar ne sont pas certifiés par ces tests ; checklist dans `../TEST_SCENARIOS.md`.

## Demande et direction

- Une chaîne principale complète qui donne accès aux différentes zones.
- Remplacer la remise aléatoire des trois gemmes du Sentinelle par une progression obtenue en combattant ; proposition du joueur : deux combats successifs donnent un orbe.
- Deux ou trois fils parallèles facultatifs : proposition retenue ici, trois fils courts.
- Fil conducteur : débloquer l'**idle / combat automatique**, et non la transmigration. Le sens d'« idol » a été confirmé par le joueur.

Les quantités, titres et règles détaillées ci-dessous sont des propositions à régler au playtest, pas des décisions déjà validées par le joueur.

## 1. Donner une raison à la maîtrise

Les routes se ferment parce que les patrouilles ne savent plus prévoir les comportements des monstres. Moira, Halric puis Vaern demandent au héros de constituer un carnet de chasse : observer, combattre, reconnaître les signes d'attaque et établir un circuit sûr. L'idle représente cette maîtrise acquise : le héros sait exécuter une routine contre un ennemi connu.

Chaque nouvelle zone apporte une question concrète : qui menace la route, quel comportement faut-il apprendre, comment rendre la chasse reproductible ? Les remises racontent ce qui change dans la région et annoncent la destination suivante. Aucun mystère sur les vies précédentes n'est nécessaire.

Débloquer l'idle doit arriver tôt. Attendre les ruines priverait le début de jeu de sa mécanique centrale. La campagne introduit l'automatisation, puis apprend à l'utiliser dans des zones plus dangereuses ; elle ne promet pas une nouvelle automatisation identique à chaque étape.

## 2. Articuler campagne et règles d'idle

### Comportement actuel

`IDLE_MASTERY_KILLS = 5` dans `src/store/slices/idleSlice.js`. L'accès est actuellement local à chaque monstre, sans quête globale obligatoire. Le jeu ajoute des limites de niveau et de PV ; l'idle est interdit sur Blighted Road et en donjon. La progression hors ligne possède son propre chemin de calcul.

### Proposition

1. MQ01 apprend à maîtriser le loup : cinq victoires, comme le seuil actuel. Les victoires déjà réalisées dans la run comptent pour cette introduction, afin de ne pas imposer cinq nouvelles victoires à un joueur qui a exploré avant de prendre la quête.
2. La remise de MQ01 valide le carnet de chasse et ouvre la fonction d'idle. Le journal explique ensuite que chaque nouvelle espèce demande cinq victoires pour être automatisée.
3. Les quêtes suivantes ouvrent des lieux et des connaissances, sans remettre le carnet à zéro à chaque village.
4. Aucun objectif principal ne demande un nombre d'heures d'idle ou d'absence. Le joueur peut continuer en combat manuel.
5. Une maîtrise n'annule pas les règles de sécurité existantes. Aucun idle de donjon ou de Blighted Road ajouté implicitement.

Cette proposition ajoute un vrai verrou global et exige du code, une migration et une vérification des accès en ligne/hors ligne. Variante moins coûteuse : garder le déblocage automatique actuel au cinquième kill et faire constater ce déblocage par MQ01. Les deux variantes ne doivent pas coexister avec des messages contradictoires. Recommandation : verrou global si l'on veut que la quête débloque réellement la fonction, avec préservation des anciennes parties.

## 3. Chaîne principale complète proposée

La complétude vise d'abord tout le contenu actuellement jouable : les quatre spots d'Ashenvale, les villages, Hollow Crypt, Blighted Road, Grimspire, Forsaken Citadel et Malachar. Les lieux seulement esquissés dans la future Map 2 restent une extension distincte.

| Étape | Donneur et objectif | Récompense de progression / raison narrative |
|---|---|---|
| MQ01 — Le carnet de chasse | Moira, Greywatch : maîtriser le loup, cinq victoires cumulées dans la run | Fonction d'idle, explication de la maîtrise par espèce ; premier circuit sûr |
| MQ02 — Une route sous les racines | Moira : vaincre Old Oakheart une fois ; preuve garantie | Millhaven ; la forêt cesse de bloquer les convois, arme signature conservée comme récompense |
| MQ03 — Relever les chemins | Halric, Millhaven : accepter la mission de reconnaissance, puis visiter les ruines | **À l'acceptation**, ouvrir Wildmere Hills et Crumbled Ruins pour permettre la reconnaissance ; à la remise, rapport et provisions. Ajouter le chemin Millhaven ↔ Wildmere Hills avant cette quête |
| MQ04 — La charge de Thunderhoof | Halric : vaincre Thunderhoof une fois ; preuve garantie | Ironhaven ; passage sûr pour les patrouilles. Aucun rare requis |
| MQ05 — Le rapport des patrouilles | Vaern, Ironhaven : remettre le rapport de Halric et préparer une reconnaissance des ruines | Mission du Sentinelle ; dialogue utile plutôt que seuil de niveau 6. Remise directe possible : ne pas imposer un aller-retour vide |
| MQ06 — Briser la garde | Vaern : réussir l'épreuve de deux victoires du Sentinelle, obtenir puis remettre son premier orbe | Thornmarsh ; le sceau de la route s'ouvre. L'épreuve répétable reste accessible ensuite |
| MQ07 — Un circuit dans les roseaux | Vaern : explorer Thornmarsh et vaincre trois serpents puis un Briar Wraith | Accès narratif à Hollow Crypt ; la patrouille retrouve son entrée. Deux étapes ordonnées, pas un simple paquet de compteurs simultanés |
| MQ08 — Le maître de la crypte | Vaern : terminer Hollow Crypt et vaincre le Crypt Keeper | Blighted Road ; les signaux qui désorientaient les voyageurs cessent |
| MQ09 — Traversée sans retour | Vaern : traverser Blighted Road ; réussite ou échec du QTE permet de continuer, avec ses conséquences actuelles | Grimspire ; le trajet doit réellement être accompli, sans téléportation directe depuis Greywatch |
| MQ10 — La citadelle des Délaissés | Vaern, mission donnée avant le départ : terminer Forsaken Citadel | Accès à la confrontation avec Malachar ; aucun donneur inaccessible à trouver au-delà d'une porte |
| MQ11 — Le dernier obstacle | Mission déjà confiée : vaincre Malachar | Conclusion de campagne, bilan des routes sécurisées ; les récompenses de boss existantes ne sont pas octroyées deux fois |

MQ03 requiert un mécanisme d'ouverture à l'acceptation, absent des données actuelles. Variante possible : scinder la mission en briefing court qui ouvre les lieux à sa remise, puis reconnaissance. Un objectif ne doit jamais demander de visiter un lieu ouvert seulement par sa propre récompense.

MQ05 est un passage narratif, pas une tâche artificielle. L'UI peut enchaîner son briefing vers MQ06 dans la même conversation.

MQ07 ne rend pas Fenrot obligatoire : le projet le réserve actuellement hors de certains contrats Map 1. Une quête facultative pourra l'utiliser après décision explicite de réactiver ce contenu ; la progression principale n'en dépend pas.

### Unifier les portes

Les accès historiques à Blighted Road/Grimspire par niveau, kills ou rumeur doivent être alignés avec cette chaîne. Une rumeur révèle la destination et sa condition ; elle ne contourne plus la campagne. Les accès directs aux donjons et à Malachar doivent appliquer les mêmes prérequis que la carte.

Les éléments Map 2 gelés — Veteran's Playground, Draconic Frontier, Vampire Castle, etc. — ne deviennent pas jouables par l'ajout de quelques quêtes : il manque des liaisons, l'intégration de carte et du contenu. La campagne ci-dessus conclut le contenu existant avec les accès actuels à Grimspire. Une future carte complète demandera son propre lot, sans présenter ses nodes gelés comme déjà livrés.

## 4. Sentinelle : deux victoires, un orbe garanti

Nom proposé : **Épreuve de la garde brisée**, disponible aux ruines à partir de MQ06, puis répétable indépendamment de la campagne.

1. Activer l'épreuve : compteur explicite `0/2`.
2. Vaincre le Sentinelle en combat manuel : `1/2`.
3. Le vaincre à nouveau : `2/2`, remise immédiate d'un **orbe de garde** garanti et fin de l'épreuve.
4. Le premier orbe sert à MQ06. Une nouvelle épreuve peut ensuite être activée ; pas de délai de rotation du tableau de village.

Interprétation proposée de « deux fois de suite » : deux victoires sur le Sentinelle dans la même épreuve ; une défaite, une fuite ou un combat contre une autre espèce réinitialise la série, avec message explicite. Se soigner, dormir, ouvrir l'inventaire ou quitter/recharger la partie ne l'annule pas. Aucun chronomètre. Les combats déjà faits avant l'activation ne sont pas crédités rétroactivement.

Compter les victoires, pas les unités tuées : un éventuel combat contenant deux Sentinelles ne vaut qu'une victoire. L'idle et les gains hors ligne ne valident pas cette épreuve manuelle. La progression normale de maîtrise du Sentinelle continue séparément.

Pourquoi conserver le retour au repos : l'épreuve mesure la capacité à reproduire une victoire, pas la possession de potions ou une série sans pause. Si l'intention devient un endurance challenge sans soin, il faut une arène dédiée et un équilibrage distinct.

### Utilité des répétitions

- Premier orbe : passage obligatoire vers Thornmarsh, consommé une fois.
- Orbes supplémentaires : améliorations facultatives de l'arme signature, avec paliers et coût croissant à équilibrer.
- L'orbe nécessaire à la campagne est réservé à MQ06 tant que celle-ci n'est pas terminée ; une dépense facultative ne peut pas rebloquer le passage.
- Aucune conversion infinie gratuite en statistiques ou en rareté. Une récompense ne doit être attribuée qu'une fois par épreuve, y compris après rechargement.

La mécanique peut rester propre au Sentinelle. Copier la même série d'orbes sur chaque élite recréerait la monotonie actuelle. Oakheart introduit une victoire simple ; Thunderhoof teste l'accès à une nouvelle région ; le Sentinelle introduit une épreuve de répétabilité.

## 5. Trois fils parallèles facultatifs

Ces fils suivent la campagne sans fournir de clé obligatoire. Ils sont accessibles par des PNJ fixes ; aucun maître exclusif, bâtiment optionnel aléatoire ou engagement divin ne doit empêcher de les finir. Les récompenses ci-dessous sont des catégories à équilibrer.

### A. Les convois de Halric — protéger les habitants

Thème : les routes servent à quelqu'un ; une victoire change la vie du village.

1. **Le convoi arrêté**, Millhaven après MQ03 : retrouver le camp aux ruines et découvrir ce qui a été abandonné. Interaction dédiée, pas une escorte prétendument simulée par un simple compteur de kills.
2. **La route de rechange**, après MQ04 : choisir de sécuriser le passage des collines ou financer des provisions avec une somme fixe affichée. Deux solutions à la même étape, aucune ne consomme un objet de campagne.
3. **Le retour des chariots**, à Ironhaven : remettre le rapport, dialogue montrant le retour du convoi. Récompense : lot de provisions et avantage marchand modeste, ou récompense d'or fixe dans une première version.

Conséquence narrative : Halric parle du convoi sauvé, une entrée de journal rappelle le choix. Un vrai convoi animé et une escorte de combat constituent une extension, pas un prérequis.

### B. Les notes du chasseur — comprendre pour automatiser

Thème : progresser dans la maîtrise en option, sans ralentir les accès de zones.

1. **Deux façons de chasser**, Greywatch après MQ01 : maîtriser une seconde espèce de la forêt. Les cinq victoires déjà obtenues comptent.
2. **Reconnaître la menace**, Millhaven après MQ03 : maîtriser une espèce des collines ou des ruines, au choix parmi une liste visible.
3. **Un circuit sûr**, Ironhaven après MQ06 : maîtriser un ennemi du marais puis réaliser une courte série d'idle sur un ennemi déjà maîtrisé. Aucun temps hors ligne imposé ; compteur de victoires automatiques distinct.

Récompense : provisions et titre de pisteur ; un bonus éventuel doit rester mineur. Les réglages de sécurité essentiels (arrêt PV, indication de danger) restent disponibles sans finir ce fil.

Ce fil prolonge le tutoriel sans répéter ses quêtes : reprendre le contenu d'onboarding existant quand il enseigne déjà la même action, plutôt que demander deux fois les mêmes loups.

### C. Le serment du gardien — comprendre les ruines

Thème : le Sentinelle défendait une route ou une prison ; enquête locale, sans lien avec la transmigration.

1. **Les bornes effacées**, ruines après MQ03 : examiner deux inscriptions distinctes qui indiquent les anciennes limites du marais.
2. **Un orbe pour témoigner**, après MQ06 : réussir une épreuve supplémentaire du Sentinelle et apporter un orbe non réservé à la campagne.
3. **Restaurer ou démanteler**, après MQ08 : décider de restaurer les bornes de protection ou de remettre leurs matériaux à Ironhaven. Dialogue final et récompenses de valeur comparable : protection/consommables ou ressources de forge.

Conséquence narrative : réponse différente de Vaern et description du lieu modifiée. Le choix ne ferme aucune zone et ne change pas les conditions d'idle. Pas de nouvelle fin de campagne à produire pour chaque branche.

## 6. Travail technique requis

### Parcours et données

- Liaison Millhaven ↔ Wildmere Hills ; test de connectivité avec les verrous réellement actifs.
- Étendre le registre MQ et les conditions de portes ; mettre à jour le journal pour indiquer le prochain donneur et la remise.
- Ajouter des objectifs d'interaction, dialogue/remise de rapport, traversée et fin de donjon. Les types actuels `visit`/`kill` ne représentent pas tous ces événements.
- Définir des chaînes secondaires permanentes avec prérequis, hors du pool village en rotation ; appliquer ces règles dans le store et l'UI.

### Épreuve et idle

- État persistant d'épreuve : activation, série, fin récompensée ; traiter les résultats de combat manuel, fuite et mort.
- Ne pas utiliser seulement `monsterKillCounts` : il mélange des sources de kills et ne prouve pas deux victoires manuelles successives.
- Récompenser l'orbe de manière atomique, puis réserver/consommer correctement le premier orbe pour MQ06.
- Si verrou global d'idle : source unique réutilisée par les boutons, `toggleIdle`, le tick, les gains hors ligne et la migration.

### Sauvegardes

- Préserver les IDs MQ01–MQ06 pour ne pas perdre l'avancement existant.
- Partie bloquée après MQ03 : la liaison réparée doit suffire à reprendre le chemin.
- MQ06 active : initialiser l'épreuve à zéro ; ne pas attribuer des victoires manuelles fictives. Afficher l'objectif remplacé ; les anciennes gemmes restent des ressources ordinaires.
- MQ06 déjà terminée : conserver Thornmarsh et ne pas redemander un orbe.
- Anciennes parties avec idle actif ou maîtrise déjà acquise : conserver l'accès à l'idle.
- Anciennes parties avancées à Grimspire : préserver les accès gagnés et permettre la reprise de la trame sans enfermer le héros. Une politique explicite de rattrapage des étapes sera nécessaire.
- Champs ajoutés : normalisation, tests de vieilles saves et évolution de version selon les conventions du projet.

## 7. Lots et critères d'acceptation

1. **Déblocage immédiat de Millhaven** : graphe réparé et test de parcours jusqu'à Thunderhoof, save existante utilisable.
2. **Sentinelle déterministe** : deux victoires → un orbe, premier passage et répétitions ; règles de rupture et sauvegarde vérifiées.
3. **Campagne complète du contenu jouable** : accès de zones/donjons harmonisés, MQ01–MQ11 et prochaine étape toujours visible ; passage manuel intégral jusqu'à Malachar.
4. **Trois fils facultatifs** : finissables indépendamment, sans fournir une clé de la campagne ; décisions et récompenses persistantes.

Tests déterminants : aucun objectif derrière sa propre porte ; tous les lieux obligatoires atteignables ; aucun drop rare nécessaire ; une victoire ne vaut pas deux ; pas d'orbe via idle/offline ; défaite/fuite rompent la série ; repos/rechargement la conservent ; pas de double récompense ; quêtes incompletes refusées par le store ; aucun accès legacy ne contourne une porte ; aucune dépense secondaire ne consomme l'orbe réservé ; anciennes saves conservées ; campagne terminable sans les trois fils facultatifs.

La première étape de développement peut commencer indépendamment des choix de récompenses et de narration : réparer la liaison vers Wildmere Hills. La campagne complète et les fils facultatifs sont un travail de plusieurs lots, au-delà d'un simple changement de textes.
