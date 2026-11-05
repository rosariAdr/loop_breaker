import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { RESOURCES } from '../../data/resources'
import {
  EQUIPMENT_TEMPLATES,
  RARITY_TIERS,
  RARITY_CONFIG,
  canCraft,
  createEquipmentInstance,
} from '../../data/equipment'
import { concentrationGain } from '../../utils/crafting'
import { resolveHybridCraftOutcome } from '../../utils/craftModel'
import {
  TEMPLATE_FORGE_RECIPES,
  getRecipeById,
  getCombinationByRarity,
} from '../../data/craftRecipes'
import CraftingMinigame from '../../components/CraftingMinigame'
import { Panel } from './Panel'

export default function BlacksmithPanel({ onBack }) {
  const { hero, spendGold, removeResource, addEquipmentToInventory, addHeroDebuff } = useGameStore()
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [selectedRarity, setSelectedRarity] = useState('common')
  const [craftMsg, setCraftMsg] = useState(null)
  const [minigameOpen, setMinigameOpen] = useState(false) // CRF03

  // Templates disponibles au forgeron
  const smithTemplates = Object.values(EQUIPMENT_TEMPLATES).filter((t) =>
    t.availableAt?.includes('blacksmith'),
  )

  const template = selectedTemplate ? EQUIPMENT_TEMPLATES[selectedTemplate] : null
  const recipe = template?.craftRecipes?.[selectedRarity]

  const hasIngredients = recipe
    ? canCraft(selectedTemplate, selectedRarity, hero.inventory.resources)
    : false
  const hasGold = recipe ? hero.inventory.gold >= recipe.gold : false
  const canDoCraft = hasIngredients && hasGold

  // CRF03 — lance le mini-jeu de forge ; les ingrédients sont consommés à l'engagement
  const handleCraft = () => {
    if (!canDoCraft || !recipe) return
    Object.entries(recipe.ingredients).forEach(([resId, qty]) => removeResource(resId, qty))
    spendGold(recipe.gold)
    setCraftMsg(null)
    setMinigameOpen(true)
  }

  // CRF03 + CRF04 — issue du mini-jeu : succès = rareté ajustée, échec = debuff
  const handleMinigameComplete = ({ tier }) => {
    setMinigameOpen(false)
    useGameStore.getState().spendVigor(3) // STA01 — un craft coûte de la vigueur
    useGameStore.getState().incrementCraftCount('equipment') // Q05 / QOBJ-TYPES01 — compteur (+ par kind)
    useGameStore.getState().gainConcentration(concentrationGain(tier)) // STA03 — gain de Concentration
    // v1.42 batch 6 — chemin de qualité HYBRIDE : la rareté vient de la `rarityTable` de la
    // combinaison forge_<templateId>__<rarité> (source unifiée), + palier + Concentration.
    const forgeRecipe = getRecipeById(`forge_${selectedTemplate}`, TEMPLATE_FORGE_RECIPES)
    const combination = getCombinationByRarity(forgeRecipe, selectedRarity)
    const outcome = resolveHybridCraftOutcome({
      tier,
      rarityTable: combination?.rarityTable,
      baseRarity: selectedRarity, // secours si la combinaison n'a pas de table
      concentration: hero.concentration,
    }) // STA03 + CRAFT-RARITY01
    if (outcome.success) {
      const item = createEquipmentInstance(selectedTemplate, outcome.rarity)
      addEquipmentToInventory(item)
      const bonus = outcome.rarity !== selectedRarity ? ` (${tier}! → ${outcome.rarity})` : ''
      setCraftMsg(`✓ ${item.name} forged!${bonus}`)
    } else {
      // raté → Burnt Hands 7j ; catastrophe → permanent
      addHeroDebuff('burnt_hands', 7, outcome.permanentDebuff)
      setCraftMsg(
        outcome.severity === 'catastrophe'
          ? '✗ Catastrophe! The forge backfires — Burnt Hands (permanent).'
          : '✗ Botched! The metal cracks — Burnt Hands (7 days).',
      )
    }
    setTimeout(() => setCraftMsg(null), 3500)
  }

  // Rarités disponibles pour le template sélectionné
  const availableRarities = template ? RARITY_TIERS.filter((r) => template.craftRecipes?.[r]) : []

  return (
    <Panel title="🔨 Blacksmith's Forge" onBack={onBack}>
      <p
        style={{
          color: 'var(--ink-soft)',
          fontSize: '0.85rem',
          marginBottom: '0.75rem',
          fontStyle: 'italic',
        }}
      >
        "The forge roars. The smith nods at you."
      </p>

      <div className="flex gap-4" style={{ maxWidth: '580px' }}>
        {/* Liste des templates */}
        <div className="flex flex-col gap-1" style={{ width: '180px', flexShrink: 0 }}>
          <p
            style={{
              color: 'var(--ink-soft)',
              fontSize: '0.7rem',
              fontFamily: 'Cinzel, serif',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.3rem',
            }}
          >
            Items
          </p>
          {['weapon', 'helmet', 'armor', 'boots'].map((slot) => (
            <div key={slot}>
              <p
                style={{
                  color: '#3a2a1a',
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginTop: '0.4rem',
                  marginBottom: '0.2rem',
                }}
              >
                {slot}
              </p>
              {smithTemplates
                .filter((t) => t.slot === slot)
                .map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTemplate(t.id)
                      setSelectedRarity('common')
                      setCraftMsg(null)
                    }}
                    className="w-full text-left px-2 py-1.5 rounded text-xs mb-0.5"
                    style={{
                      background:
                        selectedTemplate === t.id
                          ? 'rgba(212,160,23,.18)'
                          : 'rgba(201,169,110,.18)',
                      color: selectedTemplate === t.id ? 'var(--amber-deep)' : 'var(--ink-soft)',
                      border: `1px solid ${selectedTemplate === t.id ? 'var(--parchment-shadow)' : 'var(--parchment-shadow)'}`,
                      fontFamily: 'Cinzel, serif',
                    }}
                  >
                    {t.name}
                  </button>
                ))}
            </div>
          ))}
        </div>

        {/* Détail du craft */}
        <div className="flex-1 flex flex-col gap-3">
          {!template ? (
            <p style={{ color: 'var(--ink-soft)', fontSize: '0.82rem', fontStyle: 'italic' }}>
              Select an item to craft.
            </p>
          ) : (
            <>
              <div>
                <p
                  style={{
                    fontFamily: 'Cinzel, serif',
                    color: 'var(--amber-deep)',
                    fontSize: '0.95rem',
                  }}
                >
                  {template.name}
                </p>
                <p style={{ color: 'var(--ink-soft)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                  {template.description}
                </p>
              </div>

              {/* Sélecteur de rareté */}
              <div className="flex flex-wrap gap-1">
                {availableRarities.map((r) => {
                  const rc = RARITY_CONFIG[r]
                  return (
                    <button
                      key={r}
                      onClick={() => {
                        setSelectedRarity(r)
                        setCraftMsg(null)
                      }}
                      className="px-2 py-0.5 rounded text-xs"
                      style={{
                        fontFamily: 'Cinzel, serif',
                        color: rc.color,
                        background:
                          selectedRarity === r ? 'rgba(212,160,23,.2)' : 'rgba(201,169,110,.18)',
                        border: `1px solid ${selectedRarity === r ? rc.color : 'var(--parchment-shadow)'}`,
                      }}
                    >
                      {rc.label}
                    </button>
                  )
                })}
              </div>

              {/* Recette */}
              {recipe && (
                <div className="flex flex-col gap-1">
                  <p
                    style={{
                      color: 'var(--ink-soft)',
                      fontSize: '0.7rem',
                      fontFamily: 'Cinzel, serif',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Recipe
                  </p>
                  {Object.entries(recipe.ingredients).map(([resId, qty]) => {
                    const res = RESOURCES[resId]
                    const owned = hero.inventory.resources[resId] ?? 0
                    const ok = owned >= qty
                    return (
                      <div
                        key={resId}
                        className="flex justify-between items-center"
                        // Z03 — grise les ingrédients manquants
                        style={{ fontSize: '0.78rem', opacity: ok ? 1 : 0.6 }}
                      >
                        <span style={{ color: ok ? 'var(--forest-deep)' : '#c04040' }}>
                          {ok ? '✓' : '✗'} {res?.name ?? resId}
                        </span>
                        <span style={{ color: ok ? '#6a9a4a' : '#8a3a2a' }}>
                          {owned}/{qty}
                        </span>
                      </div>
                    )
                  })}
                  <div
                    className="flex justify-between items-center mt-1"
                    style={{ fontSize: '0.78rem' }}
                  >
                    <span style={{ color: hasGold ? 'var(--forest-deep)' : '#c04040' }}>
                      {hasGold ? '✓' : '✗'} Gold
                    </span>
                    <span style={{ color: hasGold ? '#6a9a4a' : '#8a3a2a' }}>
                      {hero.inventory.gold}/{recipe.gold}g
                    </span>
                  </div>
                </div>
              )}

              {/* Stat preview */}
              {recipe && (
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
                  {Object.entries(template.baseStats).map(([s, v]) => (
                    <span
                      key={s}
                      style={{ marginRight: '0.75rem', color: RARITY_CONFIG[selectedRarity].color }}
                    >
                      +{Math.round(v * RARITY_CONFIG[selectedRarity].mult)} {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Bouton craft */}
              <button
                onClick={handleCraft}
                disabled={!canDoCraft}
                className="px-4 py-2 rounded text-sm transition-all"
                style={{
                  fontFamily: 'Cinzel, serif',
                  background: canDoCraft ? 'rgba(212,160,23,.18)' : 'rgba(201,169,110,.18)',
                  color: canDoCraft ? 'var(--amber-deep)' : 'var(--ink-soft)',
                  border: `1px solid ${canDoCraft ? '#6a5018' : 'var(--parchment-shadow)'}`,
                  cursor: canDoCraft ? 'pointer' : 'not-allowed',
                }}
              >
                🔨 Craft {RARITY_CONFIG[selectedRarity]?.label} {template.name}
              </button>

              {/* Z03 — Raison du blocage explicite */}
              {recipe && !canDoCraft && (
                <p
                  data-testid="craft-blocked-reason"
                  style={{ color: '#8a4030', fontSize: '0.72rem', fontStyle: 'italic' }}
                >
                  {!hasIngredients && !hasGold
                    ? 'Missing ingredients and gold.'
                    : !hasIngredients
                      ? 'Missing ingredients (see ✗ above).'
                      : 'Not enough gold.'}
                </p>
              )}

              {craftMsg && (
                <p
                  style={{
                    color: craftMsg.startsWith('✗') ? '#c06040' : 'var(--forest-deep)',
                    fontSize: '0.82rem',
                    fontFamily: 'Cinzel, serif',
                  }}
                >
                  {craftMsg}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* CRF03 — mini-jeu de forge */}
      <CraftingMinigame
        open={minigameOpen}
        mode="forge"
        title={`Forge — ${template?.name ?? ''}`}
        onComplete={handleMinigameComplete}
      />
    </Panel>
  )
}
