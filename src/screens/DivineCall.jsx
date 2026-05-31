import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { DEITIES } from '../data/deities'
import { SKILLS } from '../data/skills'

export default function DivineCall() {
  const { pendingDivineCall, acceptDeity, refuseDeity, meta } = useGameStore()
  const [phase, setPhase] = useState('message')   // 'message' | 'choose_skill' | 'confirm_refuse'
  const [chosenSkill, setChosenSkill] = useState(null)

  if (!pendingDivineCall) return null

  const deity = DEITIES[pendingDivineCall.deityId]
  if (!deity) return null

  // DV03 — Fidélité inter-run : ce dieu nous reconnaît si déjà lié dans cet univers
  const universeId = deity.universe ?? 'medieval_fantasy'
  const isReturningDeity = meta.divineBonds?.[universeId] === deity.id

  const skillOptions = deity.divineSkillOptions.map(id => ({
    id,
    template: SKILLS[id],
  }))

  const handleAccept = () => setPhase('choose_skill')

  const handleConfirmSkill = () => {
    if (!chosenSkill) return
    acceptDeity(pendingDivineCall.deityId, chosenSkill)
  }

  const handleRefuse = () => {
    refuseDeity()
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: 'radial-gradient(ellipse at center, #1a0f2a 0%, #0a0508 70%)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="w-full max-w-lg p-8 rounded-lg flex flex-col gap-6"
        style={{
          background: '#08060f',
          border: `2px solid ${deity.color}40`,
          boxShadow: `0 0 40px ${deity.color}20`,
        }}
      >
        {/* Phase 1 — Message du dieu */}
        {phase === 'message' && (
          <>
            {/* Sigil */}
            <div className="text-center">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                style={{
                  background: `${deity.color}15`,
                  border: `2px solid ${deity.color}50`,
                  fontSize: '2.5rem',
                  boxShadow: `0 0 20px ${deity.color}30`,
                }}
              >
                {deity.sigil}
              </div>
              <p style={{ fontFamily: 'Cinzel, serif', color: deity.color, fontSize: '1.3rem', letterSpacing: '0.08em' }}>
                {deity.name}
              </p>
              <p style={{ color: '#6a5a7a', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                {deity.title}
              </p>
            </div>

            {/* DV03 — Bannière de reconnaissance (dieu déjà lié dans cet univers) */}
            {isReturningDeity && (
              <div
                data-testid="returning-deity-banner"
                className="p-2.5 rounded text-center"
                style={{ background: `${deity.color}12`, border: `1px solid ${deity.color}40` }}
              >
                <p style={{ color: deity.color, fontSize: '0.78rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.04em' }}>
                  ✦ {deity.name} remembers you ✦
                </p>
                <p style={{ color: '#8a7a9a', fontSize: '0.72rem', fontStyle: 'italic', marginTop: '0.2rem' }}>
                  "We have walked together before. I knew you would return."
                </p>
              </div>
            )}

            {/* Message */}
            <div
              className="p-4 rounded"
              style={{ background: '#0f0c18', border: `1px solid ${deity.color}20` }}
            >
              <p
                style={{
                  color: '#c0b0d0',
                  fontSize: '0.88rem',
                  fontStyle: 'italic',
                  lineHeight: '1.7',
                }}
              >
                "{deity.callMessage}"
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAccept}
                className="flex-1 py-3 rounded transition-all hover:opacity-90"
                style={{
                  fontFamily: 'Cinzel, serif',
                  background: `${deity.color}20`,
                  color: deity.color,
                  border: `1px solid ${deity.color}60`,
                  fontSize: '0.88rem',
                }}
              >
                Accept
              </button>
              <button
                onClick={() => setPhase('confirm_refuse')}
                className="flex-1 py-3 rounded transition-all hover:opacity-80"
                style={{
                  fontFamily: 'Cinzel, serif',
                  background: '#100808',
                  color: '#6a4a4a',
                  border: '1px solid #3a1818',
                  fontSize: '0.88rem',
                }}
              >
                Refuse
              </button>
            </div>
          </>
        )}

        {/* Phase 2 — Choix du skill divin */}
        {phase === 'choose_skill' && (
          <>
            <div className="text-center">
              <p style={{ fontFamily: 'Cinzel, serif', color: deity.color, fontSize: '1.1rem' }}>
                {deity.sigil} Choose your gift
              </p>
              <p style={{ color: '#6a5a7a', fontSize: '0.8rem', marginTop: '0.3rem', fontStyle: 'italic' }}>
                "{deity.acceptMessage}"
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {skillOptions.map(({ id, template }) => {
                if (!template) return null
                const isChosen = chosenSkill === id
                return (
                  <button
                    key={id}
                    onClick={() => setChosenSkill(id)}
                    className="p-4 rounded text-left transition-all"
                    style={{
                      background: isChosen ? `${deity.color}15` : '#0f0c18',
                      border: `1px solid ${isChosen ? deity.color : `${deity.color}25`}`,
                    }}
                  >
                    <p style={{ fontFamily: 'Cinzel, serif', color: deity.color, fontSize: '0.9rem' }}>
                      {template.name}
                    </p>
                    <p style={{ color: '#7a6a8a', fontSize: '0.78rem', marginTop: '0.3rem' }}>
                      {template.description}
                    </p>
                    <div className="flex gap-3 mt-2" style={{ color: '#5a4a6a', fontSize: '0.72rem' }}>
                      {template.cost.mana > 0 && <span>{template.cost.mana} MP</span>}
                      {template.cost.hp > 0 && <span>{template.cost.hp} HP</span>}
                      {template.cooldown > 0 && <span>CD: {template.cooldown}t</span>}
                      <span style={{ color: '#4a3a5a', marginLeft: 'auto' }}>
                        ⚠ Only inheritable at level 2+
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={handleConfirmSkill}
              disabled={!chosenSkill}
              className="w-full py-3 rounded transition-all"
              style={{
                fontFamily: 'Cinzel, serif',
                background: chosenSkill ? `${deity.color}20` : '#0a0808',
                color: chosenSkill ? deity.color : '#3a2a2a',
                border: `1px solid ${chosenSkill ? `${deity.color}60` : '#1a1010'}`,
                cursor: chosenSkill ? 'pointer' : 'not-allowed',
              }}
            >
              Receive {chosenSkill ? SKILLS[chosenSkill]?.name : '...'}
            </button>
          </>
        )}

        {/* Phase 3 — Confirmation refus */}
        {phase === 'confirm_refuse' && (
          <>
            <div className="text-center">
              <p style={{ fontFamily: 'Cinzel, serif', color: '#c06060', fontSize: '1.1rem' }}>
                Turn away the divine?
              </p>
              <p
                style={{
                  color: '#7a6a5a',
                  fontSize: '0.85rem',
                  fontStyle: 'italic',
                  marginTop: '0.75rem',
                  lineHeight: '1.6',
                }}
              >
                "{deity.refuseMessage}"
              </p>
              <p style={{ color: '#5a4a3a', fontSize: '0.78rem', marginTop: '1rem' }}>
                You will walk alone this run. But your next transmigration will carry a bonus.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRefuse}
                className="flex-1 py-3 rounded transition-all hover:opacity-90"
                style={{
                  fontFamily: 'Cinzel, serif',
                  background: '#100808',
                  color: '#c04040',
                  border: '1px solid #4a1818',
                }}
              >
                Walk alone
              </button>
              <button
                onClick={() => setPhase('message')}
                className="flex-1 py-3 rounded transition-all hover:opacity-80"
                style={{
                  fontFamily: 'Cinzel, serif',
                  background: '#0f0c18',
                  color: '#6a5a7a',
                  border: `1px solid ${deity.color}25`,
                }}
              >
                ← Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
