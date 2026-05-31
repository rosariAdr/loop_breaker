import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { SKILLS, isDivineSkillInheritable } from '../data/skills'
import { ZONES } from '../data/zones'
import ConfirmDialog from '../components/ConfirmDialog'

export default function PostMortem() {
  const { meta, confirmInheritance, resetGame, markFirstDeathSeen } = useGameStore()
  const summary = meta.lastRunSummary
  // TUT03 — hint au tout 1er run/1ère mort
  const showFirstDeathHint = !meta.firstDeathSeen && meta.totalDeaths <= 1

  // Sélection de l'héritage
  const [chosenStat, setChosenStat] = useState(null)
  const [chosenActive, setChosenActive] = useState(null)
  // UX03 — confirmation reset
  const [pendingReset, setPendingReset] = useState(false)
  const [chosenPassive, setChosenPassive] = useState(null)
  // W03 — bannière "to be continued" si Malachar killed ce run
  const [continueBannerDismissed, setContinueBannerDismissed] = useState(false)
  const showContinueBanner = meta.malacharDefeatedThisRun && !continueBannerDismissed

  if (!summary) return null

  // DV10 — un skill divin n'est héritable qu'à partir du niveau 2
  const isInheritable = (s) => {
    const t = SKILLS[s.skillId]
    if (!t) return false
    return isDivineSkillInheritable({ ...t, level: s.level })
  }

  const activeSkills = summary.skills.filter(s => {
    const t = SKILLS[s.skillId]
    return t?.type === 'active' && isInheritable(s)
  })
  const passiveSkills = summary.skills.filter(s => {
    const t = SKILLS[s.skillId]
    return t?.type === 'passive' && isInheritable(s)
  })

  const statKeys = ['strength', 'agility', 'intelligence', 'chance', 'def']

  const handleConfirm = () => {
    confirmInheritance(chosenStat, chosenActive, chosenPassive)
  }

  // W03 — Bannière "to be continued" overlay si Malachar killed
  if (showContinueBanner) {
    return (
      <div
        data-testid="malachar-defeated-banner"
        className="flex flex-col items-center justify-center min-h-screen p-8"
        style={{ background: 'radial-gradient(ellipse at center, #2a0808 0%, #0a0a0f 60%, #000 100%)' }}
      >
        <div className="w-full max-w-xl flex flex-col gap-8 items-center text-center anim-pop">
          <p style={{
            fontFamily: 'Cinzel, serif',
            color: '#e04040',
            fontSize: '3rem',
            letterSpacing: '0.15em',
            textShadow: '0 0 24px rgba(224,64,64,0.5)',
          }}>
            ☠ MALACHAR THE UNDYING
          </p>
          <p style={{ color: '#c04040', fontSize: '1.4rem', fontFamily: 'Cinzel, serif' }}>
            …has fallen.
          </p>
          <div className="border-t border-b py-6 px-4" style={{ borderColor: '#5a2020' }}>
            <p style={{ color: '#d4af70', fontSize: '1rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.08em' }}>
              ⚜ Slayer of Eldenmoor ⚜
            </p>
            <p style={{ color: '#8a6a4a', fontSize: '0.85rem', fontStyle: 'italic', marginTop: '0.5rem' }}>
              The Demon Lord is slain. The medieval realm trembles.
              <br />
              Your soul drifts beyond, toward the next universe…
            </p>
          </div>
          <p style={{ color: '#5a4030', fontSize: '0.95rem', fontStyle: 'italic', letterSpacing: '0.05em' }}>
            To be continued.
          </p>
          <button
            onClick={() => setContinueBannerDismissed(true)}
            className="mt-4 px-6 py-3 rounded transition-all hover:opacity-90"
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.9rem',
              background: '#1a0808',
              color: '#e04040',
              border: '1px solid #5a2020',
              letterSpacing: '0.08em',
            }}
          >
            Continue to Transmigration →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col items-center justify-start min-h-screen p-8 overflow-y-auto"
      style={{ background: 'linear-gradient(180deg, #080508 0%, #0a0a0f 100%)' }}
    >
      <div className="w-full max-w-xl flex flex-col gap-6">

        {/* Titre */}
        <div className="text-center">
          <p style={{ fontFamily: 'Cinzel, serif', color: '#c04040', fontSize: '2rem', letterSpacing: '0.1em' }}>
            ☠ Fallen
          </p>
          <p style={{ color: '#4a3a2a', fontSize: '0.85rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
            Your soul departs this realm...
          </p>
        </div>

        {/* Résumé du run */}
        <div className="p-4 rounded border" style={{ background: '#0a0808', borderColor: '#2a1810' }}>
          <p className="mb-3 text-xs uppercase tracking-widest" style={{ color: '#4a3a2a', fontFamily: 'Cinzel, serif' }}>
            Run Summary
          </p>
          <div className="grid grid-cols-2 gap-2">
            <SummaryLine label="Cause of death" value={summary.cause} />
            <SummaryLine label="Zone" value={ZONES[summary.zone]?.name ?? summary.zone} />
            <SummaryLine label="Day reached" value={summary.day} />
            <SummaryLine label="Level" value={summary.level} />
            <SummaryLine label="Total kills" value={summary.totalKills} />
            <SummaryLine label="Tokens earned" value={`${summary.reputationTokens} 🪙`} />
          </div>
          <div className="mt-2 pt-2 border-t grid grid-cols-3 gap-2" style={{ borderColor: '#1a1410' }}>
            {statKeys.map(stat => (
              <SummaryLine key={stat} label={stat} value={summary.stats[stat] ?? '—'} small />
            ))}
          </div>
        </div>

        {/* TUT03 — Hint première transmigration */}
        {showFirstDeathHint && (
          <div
            data-testid="first-death-hint"
            className="p-4 rounded border anim-pop"
            style={{ background: '#0a0f18', borderColor: '#2a4060' }}
          >
            <p style={{ fontFamily: 'Cinzel, serif', color: '#60a0d0', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              ✦ First Transmigration
            </p>
            <p style={{ color: '#7a8a9a', fontSize: '0.78rem', lineHeight: 1.5 }}>
              Death is not the end. You may carry <strong>one stat</strong>, <strong>one active skill</strong> and
              <strong> one passive skill</strong> into your next life. Choose wisely — these become the foundation
              of a stronger run. The Gods' Shop awaits after.
            </p>
            <button
              onClick={markFirstDeathSeen}
              className="mt-3 px-4 py-1.5 rounded text-xs"
              style={{ fontFamily: 'Cinzel, serif', background: '#0a1828', color: '#60a0d0', border: '1px solid #2a4060' }}
            >
              Got it
            </button>
          </div>
        )}

        {/* Choisir l'héritage */}
        <div
          className="p-4 rounded border"
          style={{
            background: '#0a0c08',
            // TUT03 — surbrillance pendant le 1er run
            borderColor: showFirstDeathHint ? '#3a5070' : '#1a2810',
            boxShadow: showFirstDeathHint ? '0 0 16px rgba(60,80,112,0.3)' : 'none',
          }}
        >
          <p className="mb-1 text-xs uppercase tracking-widest" style={{ color: '#4a3a2a', fontFamily: 'Cinzel, serif' }}>
            Transmigration — Choose what to carry
          </p>
          <p style={{ color: '#5a4a3a', fontSize: '0.78rem', fontStyle: 'italic', marginBottom: '1rem' }}>
            One stat · one active skill · one passive skill
          </p>

          {/* Stat */}
          <p style={{ color: '#6a5a4a', fontSize: '0.78rem', marginBottom: '0.5rem', fontFamily: 'Cinzel, serif' }}>
            STAT
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {statKeys.map(stat => (
              <button
                key={stat}
                onClick={() => setChosenStat(stat)}
                className="px-3 py-1 rounded text-xs capitalize transition-all"
                style={{
                  fontFamily: 'Cinzel, serif',
                  background: chosenStat === stat ? '#1a2010' : '#0f0c08',
                  color: chosenStat === stat ? '#80c040' : '#6a5a4a',
                  border: `1px solid ${chosenStat === stat ? '#406030' : '#1a1810'}`,
                }}
              >
                {stat} ({summary.stats[stat] ?? '—'})
              </button>
            ))}
          </div>

          {/* Active skill */}
          <p style={{ color: '#6a5a4a', fontSize: '0.78rem', marginBottom: '0.5rem', fontFamily: 'Cinzel, serif' }}>
            ACTIVE SKILL {activeSkills.length === 0 && '(none)'}
          </p>
          <div className="flex flex-col gap-1 mb-4">
            {activeSkills.length === 0 && (
              <button
                onClick={() => setChosenActive(null)}
                className="px-3 py-2 rounded text-xs text-left"
                style={{ background: chosenActive === null ? '#1a1208' : '#0f0c08', color: '#4a3a2a', border: '1px solid #1a1410' }}
              >
                Skip (no active skills)
              </button>
            )}
            {activeSkills.map((s) => {
              const t = SKILLS[s.skillId]
              return (
                <button
                  key={s.skillId}
                  onClick={() => setChosenActive(s)}
                  className="px-3 py-2 rounded text-xs text-left transition-all"
                  style={{
                    background: chosenActive?.skillId === s.skillId ? '#1a1208' : '#0f0c08',
                    color: chosenActive?.skillId === s.skillId ? '#d4af70' : '#6a5a4a',
                    border: `1px solid ${chosenActive?.skillId === s.skillId ? '#3a2818' : '#1a1410'}`,
                  }}
                >
                  {t?.name ?? s.skillId} · Lv {s.level}
                </button>
              )
            })}
          </div>

          {/* Passive skill */}
          <p style={{ color: '#6a5a4a', fontSize: '0.78rem', marginBottom: '0.5rem', fontFamily: 'Cinzel, serif' }}>
            PASSIVE SKILL {passiveSkills.length === 0 && '(none)'}
          </p>
          <div className="flex flex-col gap-1 mb-4">
            {passiveSkills.length === 0 && (
              <button
                onClick={() => setChosenPassive(null)}
                className="px-3 py-2 rounded text-xs text-left"
                style={{ background: chosenPassive === null ? '#1a1208' : '#0f0c08', color: '#4a3a2a', border: '1px solid #1a1410' }}
              >
                Skip (no passive skills)
              </button>
            )}
            {passiveSkills.map((s) => {
              const t = SKILLS[s.skillId]
              return (
                <button
                  key={s.skillId}
                  onClick={() => setChosenPassive(s)}
                  className="px-3 py-2 rounded text-xs text-left transition-all"
                  style={{
                    background: chosenPassive?.skillId === s.skillId ? '#081a08' : '#0f0c08',
                    color: chosenPassive?.skillId === s.skillId ? '#40c080' : '#6a5a4a',
                    border: `1px solid ${chosenPassive?.skillId === s.skillId ? '#184018' : '#1a1410'}`,
                  }}
                >
                  {t?.name ?? s.skillId} · Lv {s.level}
                </button>
              )
            })}
          </div>

          {/* Confirmer */}
          <button
            onClick={handleConfirm}
            disabled={!chosenStat}
            className="w-full py-3 rounded transition-all"
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.9rem',
              background: chosenStat ? '#0a1808' : '#0a0a0a',
              color: chosenStat ? '#80c040' : '#2a2a2a',
              border: `1px solid ${chosenStat ? '#305020' : '#1a1a1a'}`,
              cursor: chosenStat ? 'pointer' : 'not-allowed',
            }}
          >
            Enter the Gods' Shop →
          </button>

          {/* Reset complet — UX03 avec confirmation */}
          <button
            onClick={() => setPendingReset(true)}
            className="w-full py-2 rounded mt-1 text-xs transition-all hover:opacity-80"
            style={{
              fontFamily: 'Cinzel, serif',
              background: 'transparent',
              color: '#4a2a1a',
              border: '1px solid #2a1410',
              cursor: 'pointer',
            }}
          >
            ↺ New Run — reset everything
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={pendingReset}
        title="Reset all progress?"
        message="Your entire save will be deleted: hero, world, meta. This cannot be undone."
        confirmLabel="Reset everything"
        cancelLabel="Keep my save"
        variant="destructive"
        onConfirm={() => { resetGame(); setPendingReset(false) }}
        onCancel={() => setPendingReset(false)}
      />
    </div>
  )
}

function SummaryLine({ label, value, small = false }) {
  return (
    <div>
      <p style={{ color: '#4a3a2a', fontSize: small ? '0.68rem' : '0.72rem', fontFamily: 'Cinzel, serif', textTransform: 'uppercase' }}>
        {label}
      </p>
      <p style={{ color: '#d4af70', fontSize: small ? '0.8rem' : '0.88rem' }}>{value}</p>
    </div>
  )
}

