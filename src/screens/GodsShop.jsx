import { useState, useRef, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { SKILLS } from '../data/skills'

// T07b — Skills basiques de Zone 1 (fallback si pas de run précédent)
const FALLBACK_BONUS_SKILLS = ['power_strike', 'shield_stance', 'savage_bite']

/**
 * T07b — Calcule la pool de skills disponibles pour le bonus.
 * Priorité : skills du run précédent (lastRunSummary). Fallback : skills basiques Zone 1.
 * @returns {Array<{ skillId, level, type }>}
 */
export function getBonusSkillPool(lastRunSummary) {
  const fromRun = lastRunSummary?.skills ?? []
  const source = fromRun.length > 0
    ? fromRun
    : FALLBACK_BONUS_SKILLS.map((skillId) => ({ skillId, level: 1, xp: 0 }))

  // Dédoublonner par skillId, enrichir avec le type depuis SKILLS
  const seen = new Set()
  const pool = []
  for (const s of source) {
    if (seen.has(s.skillId)) continue
    const template = SKILLS[s.skillId]
    if (!template) continue
    seen.add(s.skillId)
    pool.push({ skillId: s.skillId, level: s.level ?? 1, type: template.type })
  }
  return pool
}

// BAL01 — Coûts révisés (calibration économie tokens : run typique = ~8-12 tokens)
// Cible : run moyen = 1 article achetable, run excellent = 2-3 articles.
export const CATALOG = [
  {
    id: 'rank_restore',
    label: 'Adventurer Rank Restoration',
    description: 'Restore up to 80% of the rank you reached this run.',
    cost: 25,  // BAL01 : 40 → 25
    icon: '⚜',
    color: '#d4af70',
  },
  {
    id: 'bonus_skill',
    label: 'Bonus Skill Slot',
    description: 'Carry one additional skill (active or passive) beyond the base three.',
    cost: 50,  // BAL01 : 80 → 50
    icon: '✨',
    color: '#c084fc',
  },
  {
    id: 'bonus_stat',
    label: 'Bonus Stat Slot',
    description: 'Carry one additional stat beyond the base three.',
    cost: 50,  // BAL01 : 80 → 50
    icon: '📈',
    color: '#60a5fa',
  },
  {
    id: 'skill_levelup',
    label: 'Skill Level Up',
    description: 'Advance one of your inherited skills by one level.',
    cost: 12,  // BAL01 : 20 → 12
    icon: '⬆',
    color: '#40c080',
  },
  {
    id: 'starter_kit',
    label: 'Starter Kit',
    description: '3× Minor Healing Potion + 3× Minor Mana Potion to begin the next run.',
    cost: 5,   // BAL01 : 10 → 5
    icon: '🧪',
    color: '#80c040',
  },
  {
    id: 'divine_oracle',
    label: 'Divine Oracle',
    description: 'Reveals the relation score of deities in the next universe before you arrive.',
    cost: 8,   // BAL01 : 15 → 8
    icon: '🔮',
    color: '#c0a060',
    // TRM01 — option non encore implémentée (DV12, v2). Tant que c'est le cas elle reste
    // NON achetable (sinon elle prélève 8 tokens sans aucun effet).
    comingSoon: true,
  },
]

export default function GodsShop() {
  const { hero, meta, applyTransmigration, addConsumable } = useGameStore()
  const [purchases, setPurchases] = useState([])
  const [tokens, setTokens] = useState(hero.reputationTokens + (meta.lastRunSummary?.reputationTokens ?? 0))
  // T07b — skill bonus sélectionné
  const [bonusSkillId, setBonusSkillId] = useState(null)

  const bonusSkillPool = getBonusSkillPool(meta.lastRunSummary)
  const bonusSkillBought = purchases.includes('bonus_skill')

  // T02 — transition animée de renaissance avant l'application réelle de la transmigration
  const [reborn, setReborn] = useState(false)
  const pendingRef = useRef(null)
  const firedRef = useRef(false)
  const nextRun = (hero.runNumber ?? 0) + 1

  const finishRebirth = () => {
    if (firedRef.current) return
    firedRef.current = true
    applyTransmigration(pendingRef.current ?? {})
  }

  // Auto-avance après l'animation (un fallback ; le bouton fait la même chose)
  useEffect(() => {
    if (!reborn) return
    const t = setTimeout(finishRebirth, 2600)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reborn])

  const spend = (item) => {
    if (item.comingSoon) return // TRM01 — option non implémentée : non achetable
    if (tokens < item.cost) return
    if (purchases.includes(item.id) && item.id !== 'skill_levelup' && item.id !== 'starter_kit') return
    setTokens(t => t - item.cost)
    setPurchases(p => [...p, item.id])
    // T07b — à l'achat du bonus skill, pré-sélectionner le 1er de la pool
    if (item.id === 'bonus_skill' && !bonusSkillId && bonusSkillPool.length > 0) {
      setBonusSkillId(bonusSkillPool[0].skillId)
    }
  }

  const handleConfirm = () => {
    // T10 — Starter kit (peut être acheté plusieurs fois)
    const starterKitCount = purchases.filter(p => p === 'starter_kit').length
    if (starterKitCount > 0) {
      addConsumable('hp_potion_small', 3 * starterKitCount)
      addConsumable('mana_potion_small', 3 * starterKitCount)
    }
    // T07b — Bonus skill : le skill choisi par le joueur (ou 1er de la pool par défaut)
    let extraSkills = []
    if (bonusSkillBought) {
      const chosenId = bonusSkillId ?? bonusSkillPool[0]?.skillId ?? 'power_strike'
      const template = SKILLS[chosenId]
      extraSkills = [{ type: template?.type ?? 'active', skillId: chosenId, level: 1, xp: 0 }]
    }
    const shopPurchases = {
      extraSkills,
      rankRestored: purchases.includes('rank_restore'),
      bonusStatSlot: purchases.includes('bonus_stat'),
      skillLevelUps: purchases.filter(p => p === 'skill_levelup').length,
    }
    // T02 — lance d'abord la transition animée ; applyTransmigration s'exécute à la fin
    pendingRef.current = shopPurchases
    setReborn(true)
  }

  const inheritance = meta.pendingInheritance

  // T02 — écran de transition animé entre la boutique et la renaissance
  if (reborn) {
    return (
      <div
        className="takeover-void transmig-scene"
        data-testid="rebirth-transition"
        style={{ background: 'radial-gradient(ellipse at 50% 45%, #2a1a4e 0%, #120c22 45%, #060509 100%)' }}
      >
        <div className="transmig-core" aria-hidden="true" />
        <div className="transmig-rings" aria-hidden="true">
          <span /><span /><span />
        </div>
        <div className="transmig-text">
          <p className="transmig-kicker">The cycle turns…</p>
          <p className="transmig-title">Reborn</p>
          <p className="transmig-run">Run {nextRun}</p>
        </div>
        <button onClick={finishRebirth} className="transmig-continue" data-testid="rebirth-continue">
          Begin Anew →
        </button>
      </div>
    )
  }

  return (
    <div className="takeover-void" style={{ background: 'radial-gradient(ellipse at 50% 12%, #18102e 0%, #0b0a12 55%, #060509 100%)' }}>
      <div className="w-full flex flex-col gap-6" style={{ maxWidth: 600 }}>

        {/* Titre */}
        <div className="text-center">
          <p style={{ fontFamily: 'var(--font-head)', fontWeight: 800, color: '#c79cff', fontSize: '2rem', letterSpacing: '0.1em', textShadow: '0 0 26px rgba(160,110,220,.45)' }}>
            ✦ Gods' Shop ✦
          </p>
          <p style={{ color: '#8a7aa6', fontSize: '0.85rem', marginTop: '0.4rem', fontStyle: 'italic' }}>
            Between life and death, the divine offer their wares.
          </p>
          <div className="inline-flex items-center gap-2 mt-3" style={{ padding: '8px 18px', borderRadius: 999, background: 'linear-gradient(180deg, rgba(160,110,220,.22), rgba(160,110,220,.08))', border: '1.5px solid rgba(150,110,210,.5)' }}>
            <span style={{ color: '#d8c2ff', fontSize: '0.95rem', fontFamily: 'var(--font-head)', fontWeight: 600 }}>🪙 {tokens} tokens</span>
          </div>
        </div>

        {/* Héritage — rappel */}
        {inheritance && (
          <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(14,22,14,.6)', border: '1.5px solid rgba(60,110,60,.4)' }}>
            <p className="mb-2" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7a9a6a', fontFamily: 'var(--font-head)' }}>
              Carrying forward
            </p>
            <div className="flex flex-wrap gap-2">
              {inheritance.stat && <Tag label={`Stat: ${inheritance.stat}`} color="#7fb8ff" />}
              {inheritance.activeSkill && <Tag label={`Active: ${SKILLS[inheritance.activeSkill.skillId]?.name ?? '?'}`} color="#c79cff" />}
              {inheritance.passiveSkill && <Tag label={`Passive: ${SKILLS[inheritance.passiveSkill.skillId]?.name ?? '?'}`} color="#6ad0a0" />}
            </div>
          </div>
        )}

        {/* Catalogue */}
        <div className="flex flex-col gap-3">
          {CATALOG.map(item => {
            const alreadyBought = purchases.includes(item.id) && item.id !== 'skill_levelup' && item.id !== 'starter_kit'
            const boughtCount = purchases.filter(p => p === item.id).length
            const canAfford = tokens >= item.cost
            const disabled = alreadyBought || !canAfford || item.comingSoon // TRM01

            return (
              <div
                key={item.id}
                className="flex items-center gap-4 transition-all"
                style={{
                  padding: '14px 16px', borderRadius: 10,
                  background: alreadyBought ? 'rgba(12,26,12,.6)' : 'rgba(22,14,36,.7)',
                  border: `1.5px solid ${alreadyBought ? 'rgba(64,160,64,.45)' : 'rgba(90,66,140,.5)'}`,
                  opacity: !canAfford && !alreadyBought ? 0.55 : 1,
                  boxShadow: alreadyBought ? 'none' : '0 4px 16px rgba(40,20,70,.3)',
                }}
              >
                <span style={{ fontSize: '1.6rem', minWidth: '2rem', textAlign: 'center' }}>{item.icon}</span>
                <div className="flex-1">
                  <p style={{ fontFamily: 'var(--font-head)', fontWeight: 600, color: item.color, fontSize: '0.92rem' }}>
                    {item.label}
                    {boughtCount > 1 && <span style={{ color: '#8a7aa6', marginLeft: '0.5rem' }}>×{boughtCount}</span>}
                  </p>
                  <p style={{ color: '#8a7aa6', fontSize: '0.76rem', marginTop: '0.2rem' }}>{item.description}</p>
                </div>
                <button
                  onClick={() => spend(item)}
                  disabled={disabled}
                  className="transition-all whitespace-nowrap"
                  style={{
                    fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 12, padding: '9px 16px', borderRadius: 7,
                    background: alreadyBought ? 'rgba(40,90,40,.4)' : canAfford ? 'rgba(90,66,150,.4)' : 'rgba(30,24,44,.5)',
                    color: alreadyBought ? '#88e088' : canAfford ? '#d8c2ff' : '#5a4a6a',
                    border: `1.5px solid ${alreadyBought ? 'rgba(64,160,64,.5)' : canAfford ? 'rgba(130,100,200,.6)' : 'rgba(50,40,70,.5)'}`,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  {item.comingSoon ? 'Soon' : alreadyBought ? '✓ Bought' : `${item.cost} 🪙`}
                </button>
              </div>
            )
          })}
        </div>

        {/* T07b — Sélecteur de skill bonus (visible si bonus_skill acheté) */}
        {bonusSkillBought && (
          <div data-testid="bonus-skill-selector" style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(22,14,36,.7)', border: '1.5px solid rgba(120,90,190,.5)' }}>
            <p style={{ fontFamily: 'var(--font-head)', fontWeight: 600, color: '#c79cff', fontSize: '0.85rem', marginBottom: '0.6rem' }}>
              ✨ Choose your bonus skill
            </p>
            <div className="flex flex-wrap gap-2">
              {bonusSkillPool.map((s) => {
                const template = SKILLS[s.skillId]
                const chosen = bonusSkillId === s.skillId
                return (
                  <button
                    key={s.skillId}
                    onClick={() => setBonusSkillId(s.skillId)}
                    className="transition-all"
                    style={{
                      fontFamily: 'var(--font-head)', fontSize: 12, padding: '7px 13px', borderRadius: 6,
                      background: chosen ? 'rgba(90,66,150,.45)' : 'rgba(20,16,32,.6)',
                      color: chosen ? '#d8c2ff' : '#8a7aa6',
                      border: `1.5px solid ${chosen ? 'rgba(130,100,200,.7)' : 'rgba(60,48,90,.5)'}`,
                    }}
                  >
                    {template?.name ?? s.skillId}
                    <span style={{ color: '#6a5a86', marginLeft: '0.4rem' }}>[{s.type}]</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Confirmer */}
        <button
          onClick={handleConfirm}
          className="w-full transition-all hover:opacity-90"
          style={{
            fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '1rem', padding: '16px', borderRadius: 9,
            background: 'linear-gradient(180deg, rgba(80,160,72,.35), rgba(45,90,40,.5))',
            color: '#9ce080', border: '1.5px solid rgba(80,160,72,.5)', letterSpacing: '0.05em',
          }}
        >
          Transmigrate →
        </button>
      </div>
    </div>
  )
}

function Tag({ label, color }) {
  return (
    <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontFamily: 'var(--font-head)', background: 'rgba(0,0,0,.25)', color, border: `1px solid ${color}55` }}>
      {label}
    </span>
  )
}
