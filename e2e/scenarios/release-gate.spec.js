import { test } from '@playwright/test'

// Gate de release E2E — portage des scénarios de docs/TEST_SCENARIOS.md.
// Chaque test est en `fixme` tant qu'il n'est pas porté : il apparaît « skipped » et ne casse pas la suite.
// ✅ S1 est porté dans e2e/scenarios/S1-onboarding.spec.js. Les suivants s'éclateront pareil au fil du portage.
//
// Rappels (docs/TEST_SCENARIOS.md) :
//  - Test harness dev : Ctrl+Shift+D (ou bouton flottant ⚙ DEV) → helpers.openDevHarness().
//  - Le store n'est pas exposé sur window → passer par l'UI / les boutons du harness.
//  - Save débouncée ~30 s : attendre avant un reload quand on teste la persistance (F5).

test.describe('Release gate — recette E2E (S2→S10)', () => {
  // Harness : +5 wolf_pelt, +1000 gold → farmer wolf_fang sur les loups → Village → forge (Swift Boots common).
  // Attendu : conso ressources exacte ; qualité liée au score du mini-jeu (raté = moindre, sans crash) ; équipable.
  test.fixme('S2 — Récolte → craft forge → équiper', async () => {
    // TODO: porter depuis docs/TEST_SCENARIOS.md §S2
  })

  // Harness : +1000 gold ×6 → Greywatch (ville) → acheter les 7 pièces du set Iron Vanguard.
  // Attendu : chaque slot n'accepte que sa catégorie ; stats agrégées correctes ; bonus de set au seuil et au retrait.
  test.fixme('S3 — Équipement 9 slots + bonus de set', async () => {
    // TODO: porter depuis docs/TEST_SCENARIOS.md §S3
  })

  // Harness : Skip day ×3 → jour 4, Kaira Froststep à Greywatch ; puis ×4 → jour 8, elle est partie.
  // Attendu : présence/absence conformes au calendrier (1 lieu / 4 jours) ; récompense versée une seule fois.
  test.fixme('S4 — Maître itinérant au village', async () => {
    // TODO: porter depuis docs/TEST_SCENARIOS.md §S4
  })

  // Harness : Give frostbite + 5 all attrs + 50 maxHP/MP → Start combat.
  // Attendu : l'ennemi gelé saute son tour ; feedback visible ; décompte correct ; dégel effectif.
  test.fixme('S5 — Statut frozen en combat', async () => {
    // TODO: porter depuis docs/TEST_SCENARIOS.md §S5
  })

  // Visiter 2 lieux (Greywatch + Millhaven/Ironhaven) → comparer les boards → accepter 1 quête de village à chacun.
  // Attendu : cibles limitées aux spots possédés ; pools disjoints (0 doublon inter-village) ; pas de doublon MQ↔VQ.
  test.fixme('S6 — Quêtes : adjacence + pools disjoints', async () => {
    // TODO: porter depuis docs/TEST_SCENARIOS.md §S6
  })

  // Harness : +5 all attrs ×5, +50 maxHP/MP ×5, Full heal → World Map → Grimspire (NE PAS cliquer Kill Malachar).
  // Attendu : transitions de phase aux bons seuils HP ; pas de soft-lock ; victoire → Soul Rend + 200 tokens + titres.
  test.fixme('S7 — Grimspire → Malachar 3 phases (win condition)', async () => {
    // TODO: porter depuis docs/TEST_SCENARIOS.md §S7
  })

  // Harness : monter 2-3 stats, équiper 1 actif + 1 passif → Die → PostMortem (+50 tokens avant si test boutique).
  // Attendu : résumé exact ; les 3 héritages présents au run 2 (surtout le passif) ; achat déduit les tokens.
  test.fixme('S8 — Mort → héritage → boutique → run 2', async () => {
    // TODO: porter depuis docs/TEST_SCENARIOS.md §S8
  })

  // Nouveau run → WorldMap : zones voilées/verrouillées → cliquer une zone verrouillée → progresser la MQ → voyager.
  // Attendu : clic verrouillé = refus clair ; déblocage immédiat visible ; coût en tics ; fog levé persistant après F5.
  test.fixme('S9 — Fog / node-locking + voyage', async () => {
    // TODO: porter depuis docs/TEST_SCENARIOS.md §S9
  })

  // Harness : Unlock all idle (10 kills sur 5 monstres) → lancer l'idle → observer → fermer l'onglet → rouvrir.
  // Attendu : gains offline + récap au retour ; idle coupé sous le seuil HP ; aucun gain aberrant ; état cohérent.
  test.fixme('S10 — Idle + retour offline', async () => {
    // TODO: porter depuis docs/TEST_SCENARIOS.md §S10
  })
})
