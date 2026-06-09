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
  // TRM01 — présélectionner la stat la plus haute du run (sinon, si le joueur ne clique
  // rien, AUCUNE stat n'était héritée → « ma stat n'a pas été ramenée »).
  const [chosenStat, setChosenStat] = useState(() => {
    const keys = ['strength', 'agility', 'intelligence', 'chance', 'def']
    const stats = summary?.stats ?? {}
    return keys.reduce((best, k) => ((stats[k] ?? 0) > (stats[best] ?? 0) ? k : best), keys[0])
  })
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
        className="takeover-void"
        style={{ justifyContent: 'center', background: 'radial-gradient(ellipse at center, #2a0808 0%, #0a0a0f 60%, #000 100%)' }}
      >
        <div className="flex flex-col gap-8 items-center text-center anim-pop" style={{ maxWidth: 640 }}>
          <p style={{ fontFamily: 'var(--font-head)', fontWeight: 800, color: '#e04040', fontSize: '3rem', letterSpacing: '0.15em', textShadow: '0 0 24px rgba(224,64,64,0.5)' }}>
            ☠ MALACHAR THE UNDYING
          </p>
          <p style={{ color: '#c04040', fontSize: '1.4rem', fontFamily: 'var(--font-head)' }}>…has fallen.</p>
          <div className="py-6 px-6" style={{ borderTop: '1px solid #5a2020', borderBottom: '1px solid #5a2020' }}>
            <p style={{ color: 'var(--gold)', fontSize: '1rem', fontFamily: 'var(--font-head)', letterSpacing: '0.08em' }}>⚜ Slayer of Eldenmoor ⚜</p>
            <p style={{ color: '#a07a5a', fontSize: '0.85rem', fontStyle: 'italic', marginTop: '0.6rem', lineHeight: 1.5 }}>
              The Demon Lord is slain. The medieval realm trembles.
              <br />Your soul drifts beyond, toward the next universe…
            </p>
          </div>
          <p style={{ color: '#6a4a36', fontSize: '0.95rem', fontStyle: 'italic', letterSpacing: '0.05em' }}>To be continued.</p>
          <button className="pbtn" style={{ borderColor: '#5a2020', color: '#e04040', background: 'rgba(40,8,8,.6)' }} onClick={() => setContinueBannerDismissed(true)}>
            Continue to Transmigration →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="takeover-void">
      <div className="w-full flex flex-col gap-6" style={{ maxWidth: 640 }}>

        {/* Titre */}
        <div className="text-center">
          <p className="pm-title" style={{ color: 'var(--danger)', fontSize: '2.2rem', textShadow: '0 2px 18px rgba(192,57,43,.4)' }}>☠ Fallen</p>
          <p style={{ color: '#8a7355', fontSize: '0.9rem', marginTop: '0.5rem', fontStyle: 'italic' }}>Your soul departs this realm…</p>
        </div>

        {/* Chronique du run + héritage (parchemin) */}
        <div className="pm-scroll flex flex-col gap-6">

          {/* Résumé */}
          <div>
            <div className="pm-section">Run Summary</div>
            <div className="pm-grid">
              <SummaryLine label="Cause of death" value={summary.cause} />
              <SummaryLine label="Zone" value={ZONES[summary.zone]?.name ?? summary.zone} />
              <SummaryLine label="Day reached" value={summary.day} />
              <SummaryLine label="Level" value={summary.level} />
              <SummaryLine label="Total kills" value={summary.totalKills} />
              <SummaryLine label="Tokens earned" value={`${summary.reputationTokens} 🪙`} />
            </div>
            <div className="pm-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--parchment-shadow)' }}>
              {statKeys.map(stat => <SummaryLine key={stat} label={stat} value={summary.stats[stat] ?? '—'} />)}
            </div>
          </div>

          {/* TUT03 — Hint première transmigration */}
          {showFirstDeathHint && (
            <div data-testid="first-death-hint" className="pm-hint anim-pop">
              <p style={{ fontFamily: 'var(--font-head)', color: '#2f7fb8', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 700 }}>✦ First Transmigration</p>
              <p style={{ color: 'var(--ink-soft)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                Death is not the end. You may carry <strong>one stat</strong>, <strong>one active skill</strong> and
                <strong> one passive skill</strong> into your next life. Choose wisely — these become the foundation
                of a stronger run. The Gods' Shop awaits after.
              </p>
              <button className="pbtn" style={{ marginTop: 12, fontSize: 12, padding: '6px 14px' }} onClick={markFirstDeathSeen}>Got it</button>
            </div>
          )}

          {/* Héritage */}
          <div style={showFirstDeathHint ? { boxShadow: '0 0 0 2px rgba(47,127,184,.3)', borderRadius: 8, padding: 14, margin: -2 } : undefined}>
            <div className="pm-section">Transmigration — Choose what to carry</div>
            <p style={{ color: 'var(--ink-soft)', fontSize: '0.78rem', fontStyle: 'italic', marginTop: -6, marginBottom: 14 }}>
              One stat · one active skill · one passive skill
            </p>

            {/* Stat */}
            <p className="pm-label">Stat</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {statKeys.map(stat => (
                <button key={stat} onClick={() => setChosenStat(stat)} className={`pm-chip ${chosenStat === stat ? 'sel' : ''}`}>
                  {stat} ({summary.stats[stat] ?? '—'})
                </button>
              ))}
            </div>

            {/* Active skill */}
            <p className="pm-label">Active Skill {activeSkills.length === 0 && '(none)'}</p>
            <div className="flex flex-col gap-1 mb-4">
              {activeSkills.length === 0 && (
                <button onClick={() => setChosenActive(null)} className={`pm-row ${chosenActive === null ? 'sel' : ''}`}>Skip (no active skills)</button>
              )}
              {activeSkills.map((s) => {
                const t = SKILLS[s.skillId]
                return (
                  <button key={s.skillId} onClick={() => setChosenActive(s)} className={`pm-row ${chosenActive?.skillId === s.skillId ? 'sel' : ''}`}>
                    {t?.name ?? s.skillId} · Lv {s.level}
                  </button>
                )
              })}
            </div>

            {/* Passive skill */}
            <p className="pm-label">Passive Skill {passiveSkills.length === 0 && '(none)'}</p>
            <div className="flex flex-col gap-1 mb-4">
              {passiveSkills.length === 0 && (
                <button onClick={() => setChosenPassive(null)} className={`pm-row ${chosenPassive === null ? 'sel' : ''}`}>Skip (no passive skills)</button>
              )}
              {passiveSkills.map((s) => {
                const t = SKILLS[s.skillId]
                return (
                  <button key={s.skillId} onClick={() => setChosenPassive(s)} className={`pm-row ${chosenPassive?.skillId === s.skillId ? 'sel' : ''}`}>
                    {t?.name ?? s.skillId} · Lv {s.level}
                  </button>
                )
              })}
            </div>

            {/* Confirmer */}
            <button onClick={handleConfirm} disabled={!chosenStat} className="pbtn primary wide" style={!chosenStat ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}>
              Enter the Gods' Shop →
            </button>

            {/* Reset complet — UX03 avec confirmation */}
            <button onClick={() => setPendingReset(true)} className="pm-reset">↺ New Run — reset everything</button>
          </div>
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

function SummaryLine({ label, value }) {
  return (
    <div className="pm-line">
      <p className="k">{label}</p>
      <p className="v">{value}</p>
    </div>
  )
}
