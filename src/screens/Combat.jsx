import { isDefeated } from '../engine/combat'
import ConfirmDialog from '../components/ConfirmDialog'
import { useCombat } from './combat/useCombat'
import EnemyCard from './combat/EnemyCard'
import HeroCard from './combat/HeroCard'
import ActionPanel from './combat/ActionPanel'
import ResultPanel from './combat/ResultPanel'
import CombatLog from './combat/CombatLog'
import PhaseIndicator from './combat/PhaseIndicator'
import GluttonyChoiceModal from './combat/GluttonyChoiceModal'

// REFAC03 — Combat.jsx est désormais la façade publique : elle consomme le hook de
// logique `useCombat` et compose les sous-composants de présentation extraits dans
// `src/screens/combat/`. Le comportement observable est strictement inchangé.
export default function Combat() {
  const {
    hero,
    meta,
    activeCombat,
    absorbGluttony,
    enemies,
    heroStats,
    heroSkills,
    heroEffects,
    phase,
    result,
    confirmEscape,
    setConfirmEscape,
    selectedAction,
    setSelectedAction,
    log,
    loot,
    isBoss,
    isAnimating,
    selectedTargetId,
    setSelectedTargetId,
    heroHitFlash,
    turnCount,
    animatingEnemyId,
    animatingHero,
    skillFx,
    arenaSkillShake,
    heroAttackAnim,
    attackingEnemyId,
    floatingNumbers,
    combatStats,
    gluttonyChoice,
    setGluttonyChoice,
    consumableItems,
    arenaBg,
    handleAttack,
    handleUseSkill,
    handleUseItem,
    handleFlee,
    handleLeave,
    handleVictory,
  } = useCombat()

  if (!activeCombat) return null

  return (
    <div
      className="flex flex-col select-none"
      style={{ minHeight: 'calc(100vh - 48px)', background: arenaBg }}
    >
      {/* CMB-ESCAPE01 — filet anti-blocage : bouton toujours dispo (hors résultat) qui résout
          le combat comme une victoire propre, pour que le joueur ne soit JAMAIS coincé. */}
      {phase !== 'result' && (
        <button
          className="cmb-escape-btn"
          data-testid="combat-escape"
          onClick={() => setConfirmEscape(true)}
          title="Safety net — end this combat as a clean victory"
        >
          🚪 Exit Combat
        </button>
      )}
      <ConfirmDialog
        open={confirmEscape}
        variant="warn"
        title="Exit this combat?"
        message="Safety net: the fight ends now and is resolved as a clean victory. Use this only if the combat seems stuck."
        confirmLabel="Exit (count as win)"
        cancelLabel="Keep fighting"
        onConfirm={() => {
          setConfirmEscape(false)
          handleVictory(enemies)
        }}
        onCancel={() => setConfirmEscape(false)}
      />

      {/* ── Arène ── */}
      {/* ANIM01 — screen shake quand le héros encaisse ; ANIM02 — secousse sur gros skill/AoE */}
      <div
        className={`flex flex-col flex-1${animatingHero || arenaSkillShake ? ' anim-arena-shake' : ''}`}
      >
        {/* Zone ennemis — haut, centré */}
        <div
          className="flex justify-center items-end gap-10 px-8 pt-6 pb-4 relative"
          style={{ minHeight: '200px' }}
        >
          {/* ANIM02 — onde de choc AoE teintée par l'élément */}
          {skillFx?.aoe && (
            <span
              className="skill-aoe-wave"
              data-testid="skill-aoe-wave"
              style={{ '--fx-color': skillFx.color }}
              aria-hidden="true"
            />
          )}
          {enemies.map((enemy) => (
            <EnemyCard
              key={enemy.id}
              enemy={enemy}
              isSelected={selectedTargetId === enemy.id}
              isHit={animatingEnemyId === enemy.id}
              isAttacking={attackingEnemyId === enemy.id}
              fx={skillFx && skillFx.targetIds.includes(enemy.id) ? skillFx : null}
              floatingNumbers={floatingNumbers.filter((n) => n.targetId === enemy.id)}
              onSelect={() =>
                !isDefeated(enemy) && phase === 'player' && setSelectedTargetId(enemy.id)
              }
            />
          ))}
        </div>

        {/* Séparateur VS centré */}
        <div className="flex items-center px-8 gap-4">
          <div
            className="flex-1 h-px"
            style={{ background: 'linear-gradient(to right, transparent, #3a2020)' }}
          />
          <PhaseIndicator phase={phase} turnCount={turnCount} />
          <div
            className="flex-1 h-px"
            style={{ background: 'linear-gradient(to left, transparent, #3a2020)' }}
          />
        </div>

        {/* Zone héros — bas de l'arène, centré */}
        <div className="flex justify-center px-8 pt-4 pb-3">
          <HeroCard
            heroStats={heroStats}
            heroName={hero.name}
            activeTitle={meta?.activeTitle}
            deity={hero.deity}
            hitFlash={heroHitFlash}
            isAnimHit={animatingHero}
            isAttacking={heroAttackAnim}
            floatingNumbers={floatingNumbers.filter((n) => n.targetId === 'hero')}
            heroEffects={heroEffects}
          />
        </div>
      </div>

      {/* ── Panneau d'actions ── */}
      {phase === 'player' && result === null && (
        <ActionPanel
          selectedAction={selectedAction}
          onSelectAction={setSelectedAction}
          onAttack={handleAttack}
          onFlee={handleFlee}
          heroSkills={heroSkills}
          heroStats={heroStats}
          onUseSkill={handleUseSkill}
          consumables={consumableItems}
          onUseItem={handleUseItem}
          isBoss={isBoss}
          isAnimating={isAnimating}
        />
      )}

      {/* ── Résultat ── */}
      {phase === 'result' && (
        <ResultPanel result={result} loot={loot} combatStats={combatStats} onLeave={handleLeave} />
      )}

      {/* GLT02 — choix de la stat à dévorer (assassinat) */}
      {gluttonyChoice && (
        <GluttonyChoiceModal
          monsterId={gluttonyChoice.monsterId}
          onChoose={(stat) => {
            absorbGluttony({ monsterId: gluttonyChoice.monsterId, stat })
            setGluttonyChoice(null)
          }}
        />
      )}

      {/* ── Log de combat ── */}
      <CombatLog log={log} />
    </div>
  )
}
