# Audit du fil des quêtes et proposition narrative

Date : 5 novembre 2026. Retour joueur : blocage à Millhaven après les monstres de Crumbled Ruins.

## Périmètre et conclusion

Lecture de l'architecture et de la documentation du projet, puis analyse ciblée des données de quêtes, du graphe de déplacement, du verrouillage des lieux, des tableaux/journal, des récompenses, de l'équipement, des sauvegardes et de leurs tests. Il ne s'agit pas d'une revue exhaustive ligne par ligne de tous les systèmes du jeu. Aucune sauvegarde joueur ni partie réelle n'a été inspectée.

Le blocage à Millhaven est expliqué par une dépendance circulaire dans la progression normale. La créativité souffre aussi de trois remises d'élite très similaires, de deux étapes réduites à un niveau minimum et de l'absence de conclusion narrative après MQ06.

Ce document constitue un diagnostic et une proposition de conception. Aucun comportement du jeu n'est modifié.

## 1. Blocage confirmé : les collines derrière leur propre verrou

Sources : `src/data/mainQuests.js`, `src/data/worldGraph.js`, `src/data/zones.js`, `src/screens/WorldMap.jsx`.

1. MQ02 ouvre Millhaven.
2. MQ03 ouvre les nodes Wildmere Hills et Crumbled Ruins.
3. Les ruines sont reliées directement à Millhaven : elles sont accessibles.
4. Wildmere Hills n'a qu'un voisin : Ironhaven.
5. Ironhaven est encore verrouillée et ne s'ouvre qu'après MQ04.
6. MQ04 demande une remise liée à Thunderhoof, qui se trouve à Wildmere Hills.

Déclarer un node ouvert ne suffit donc pas : il faut un chemin dont tous les nodes sont accessibles. Le joueur peut épuiser les ruines sans jamais atteindre la cible qui ouvre la ville. Cela correspond au retour de Millhaven ; l'état exact de sa quête reste à vérifier dans sa sauvegarde.

Reproduction : simulation Node sur les exports réels `MAIN_QUEST_ORDER`, `MAIN_QUESTS` et `EDGES`. On accorde les objectifs antérieurs pour isoler la géographie, puis on calcule les lieux atteignables depuis Greywatch avant chaque quête. Premier échec : `mq04_ironhaven_gates`, cible `wildmere_hills`, `targetReachable:false`.

**Correction recommandée :** créer une liaison Millhaven ↔ Wildmere Hills, en conservant l'accès existant depuis Ironhaven. Adapter le tracé de carte et vérifier les règles de quêtes secondaires fondées sur l'adjacence et la propriété des spots. Cette correction conserve les étapes et les identifiants de sauvegarde. Déverrouiller Ironhaven plus tôt annulerait le rôle de MQ04 et serait moins cohérent.

## 2. Autres fragilités

### Butin aléatoire sur le chemin critique

MQ02, MQ04 et MQ06 demandent trois ressources rares ou une arme signature. Le Sentinelle donne une Cursed Gem avec une probabilité de base de 15 %, une unité par succès. Sans autre source ni bonus, obtenir trois gemmes demande en moyenne vingt victoires ; aucune limite supérieure ne garantit la progression. Tuer tous les monstres une fois ne termine pas cet objectif.

La branche arme ne correspond pas à un drop d'arme déclaré sur le Sentinelle : `nc_graven_elite`, quête secondaire de Millhaven, récompense cette arme. Le contrat peut aider, mais compte ses victoires après acceptation ; le prendre après avoir tué le Sentinelle impose de recommencer.

**Recommandation :** la première victoire obligatoire donne une preuve garantie, ou vaut directement validation. Garder les trois rares pour un contrat facultatif d'amélioration d'arme. Ne pas faire dépendre l'histoire d'une série de jets favorables.

### Une arme équipée ne compte plus comme arme détenue

`questObjectiveStatus(elite_turnin)` ne regarde que `hero.inventory.equipment`. Or `equipItem` retire l'arme du sac pour la placer dans `hero.equipped`. La voie arme peut donc disparaître dès que le joueur utilise sa récompense.

**Recommandation :** afficher clairement la remise requise et proposer une sélection de l'objet à rendre. Si les objets équipés comptent, leur consommation doit aussi déséquiper proprement l'objet. Une simple extension du prédicat de possession serait insuffisante.

### Le journal perd le fil entre deux quêtes

Le journal global liste les quêtes actives uniquement. La prochaine MQ disponible n'apparaît qu'au tableau du lieu émetteur. `nextMainQuest` existe, mais ses seules utilisations trouvées sont les tests. Le joueur ne reçoit donc pas systématiquement la destination suivante après une remise.

**Recommandation :** toujours afficher une ligne principale : objectif en cours, retour pour remise, prochaine quête à accepter avec lieu/PNJ, ou conclusion explicite de chapitre. Ajouter un repère sur la carte ; éviter de laisser un journal vide signifier implicitement « cherche le bon tableau ».

### Fin de chaîne sans conclusion

La chaîne comporte exactement six quêtes et se termine par l'ouverture de Thornmarsh. Aucun acte principal n'utilise ensuite le marais ou le Crypt Keeper pour conclure cette campagne. Le squelette Map 2 est déclaré gelé dans `worldGraph.js`, alors que l'ancienne UI permet toujours d'ouvrir Grimspire par niveau, nombre de kills ou rumeur achetée.

**Recommandation :** donner une conclusion jouable à la première carte et distinguer clairement le contenu disponible de l'extension future. Harmoniser le déblocage narratif avec les accès de zones historiques ; ne pas promettre une campagne Map 2 simplement parce qu'un accès legacy existe.

### Deux étapes provisoires devenues permanentes

MQ03 et MQ05 utilisent les niveaux 4 et 6, avec le marqueur `simplified:'TIER01'`. Le projet possède désormais des tiers d'équipement, mais ces quêtes conservent leurs seuils provisoires. Elles ne racontent aucun événement nouveau et peuvent être instantanément terminées.

**Recommandation :** remplacer ces attentes par une découverte ou une décision utile à l'intrigue. Garder les niveaux recommandés comme information de préparation.

### Les actions du store ne protègent pas toutes les règles

`startQuest` ne vérifie pas les prérequis MQ ; `completeQuest` ne vérifie pas la complétude avant de donner les récompenses. Les boutons du tableau limitent le flux normal, mais les tests du store exploitent ces raccourcis : certains terminent une quête sans ses objectifs, ou démarrent directement MQ03.

**Recommandation :** centraliser les validations dans les actions du store et réviser les tests qui contournent ces règles. Le test d'adjacence existant exclut explicitement les quêtes principales ; un test de parcours complet est nécessaire en plus des tests unitaires.

## 3. Première piste narrative — écartée le 5 novembre 2026

**Cette piste liée à la transmigration est écartée à la demande du joueur.** La proposition qui la remplace est détaillée dans `QUEST_CAMPAIGN_IDLE.md` : chaîne complète d'accès aux zones, apprentissage de l'idle, épreuve répétable du Sentinelle et trois fils facultatifs. Le diagnostic technique ci-dessus reste valable. Le tableau ci-dessous est conservé uniquement comme historique de conception ; il ne constitue plus la direction proposée.

Proposition originale à discuter, et non description du lore déjà implémenté.

La région subit une corruption liée à un ancien dispositif de résurrection. Les bêtes ne deviennent pas simplement hostiles : elles reconnaissent un héros qu'elles n'ont jamais rencontré dans cette vie. Chaque lieu révèle un aspect du cycle de transmigration. Les PNJ poursuivent des buts distincts : Moira protège le village, Halric veut rétablir les convois, Vaern veut contenir la menace, l'Église veut interpréter les souvenirs des morts.

| Acte | Situation et action du joueur | Révélation / conséquence |
|---|---|---|
| Greywatch — Les loups reviennent | Repousser les loups et découvrir une ancienne marque sur Oakheart ; première victoire déterministe | Moira reconnaît la marque et confie une lettre pour Halric ; route de Millhaven ouverte |
| Millhaven — Le convoi sans traces | Choisir de rechercher des survivants aux ruines ou de sécuriser les collines ; les deux parcours sont accessibles | L'un fournit un témoignage, l'autre des provisions ; les deux donnent une piste commune |
| Wildmere — Le gardien affolé | Vaincre Thunderhoof ; preuve garantie, aucun farm rare obligatoire | Une marque de harnais révèle qu'il protégeait le convoi ; ouverture d'Ironhaven |
| Crumbled Ruins — Le serment de pierre | Examiner une inscription, affronter le Sentinelle puis décider de briser ou préserver son sceau | Il gardait quelque chose enfermé ; le tuer ne signifie pas encore comprendre le problème |
| Ironhaven — Deux versions du même désastre | Confronter le rapport militaire au témoignage recueilli ; choisir l'aide de Vaern ou de l'Église | Le choix change l'allié et une récompense, puis converge vers le marais |
| Thornmarsh — La mémoire qui pourrit | Trouver les traces de corruption et vaincre Fenrot comme point culminant du marais | La corruption vient de Hollow Crypt ; la destination finale devient explicite |
| Hollow Crypt — Le premier nom | Vaincre le Crypt Keeper et découvrir son registre | Le nom du héros apparaît plusieurs fois : conclusion du chapitre, puis promesse de Grimspire |

Les collines et les ruines peuvent être abordées dans un ordre souple, avec une convergence claire. Les choix ne nécessitent pas de doubler toute la campagne : une route commune conserve la faisabilité solo, tandis que les dialogues, alliés et récompenses rendent les choix visibles.

### Exemple concret à Millhaven

Halric : « Trois convois ont disparu. Les bêtes n'ont touché ni l'or ni les vivres. Seulement les voyageurs. Et cette marque sur votre lettre… je l'ai vue sur une pierre des ruines. »

Le journal affiche deux pistes distinctes : rechercher le dernier convoi aux ruines, ou sécuriser Wildmere pour les secours. Après le Sentinelle, une inscription fournit immédiatement une information et une destination. Le retour à Millhaven fait évoluer le dialogue de Halric. La même victoire fait donc avancer l'enquête, pas seulement une barre de ressources.

### Réutiliser les systèmes existants sans fabriquer de faux choix

Première passe réalisable avec `visit`, `kill`, récompenses et chaîne `requires`. Elle peut déjà varier les actions et améliorer les textes. Les interactions d'inscription, dialogues conditionnels et choix persistants demandent de nouveaux événements/objectifs : ne pas prétendre qu'un objectif `visit` équivaut à une enquête interactive.

Pour une seconde passe, ajouter des choix persistants, leurs conséquences et une migration de sauvegarde. Prévoir une option sans divinité et sans maître : l'histoire obligatoire ne doit dépendre ni d'une profession, ni d'un PNJ itinérant, ni d'un bâtiment aléatoire.

Les contrats répétés de chasse/collecte restent utiles pour l'économie idle. Les réserver au secondaire et aux améliorations évite de leur faire porter seuls la narration principale.

## 4. Ordre de réalisation et critères de validation

1. **Réparer Millhaven** : liaison vers les collines et test qui prouve l'accès à Thunderhoof avant l'ouverture d'Ironhaven. Rejouer depuis une sauvegarde après MQ03, sans réinitialisation.
2. **Rendre la progression lisible** : prochaine destination dans le journal et retour de remise explicite ; montrer les quantités réellement manquantes pour les remises existantes.
3. **Sécuriser les validations** : interdire l'acceptation hors prérequis et les récompenses prématurées ; traiter le cas de l'arme équipée.
4. **Ôter l'aléatoire obligatoire** : victoire/preuve garantie pour le premier passage ; rares conservés pour les améliorations facultatives.
5. **Réécrire le premier chapitre** : conserver autant que possible les IDs existants, ajouter une conclusion marais → crypte et un épilogue. Définir le traitement des quêtes déjà actives/terminées avant de modifier leurs objectifs.
6. **Ajouter les embranchements** : uniquement après un parcours linéaire complet et solide.

Tests nécessaires : parcours du graphe à chaque étape, donneur et cibles atteignables avant récompense, progression malgré une séquence de drops rares défavorable, journal après chaque remise, ancienne sauvegarde à Millhaven, arme signature équipée, chemin sans divinité/maître, fin de chapitre explicite. Une recette manuelle doit emprunter les vrais déplacements et boutons.

## 5. Vérification effectuée

- Simulation de connectivité sur les données réelles : blocage MQ04 confirmé.
- Tests ciblés mainQuests, mqchain, worldGraph et QuestBoard.mq : commande terminée avec **86 tests verts dans 9 fichiers**. Ce total inclut des fichiers supplémentaires sélectionnés par les filtres Vitest. Ces tests ne détectent pas la dépendance circulaire.
- Premier lancement des tests empêché par `spawn EPERM` dans la sandbox ; relance hors sandbox réussie.
- Aucune modification du gameplay, aucun commit, aucune modification de sauvegarde.
