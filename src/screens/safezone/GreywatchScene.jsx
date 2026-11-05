import { HeroAvatar } from '../../components/parchment'
import { GREYWATCH_SCENE, getVillageLighting, isVillageNpcVisible } from './villageScenes'

function ScenerySprite({ sprite }) {
  return (
    <img
      className="greywatch-sprite"
      src={sprite.src}
      alt={sprite.alt}
      title={sprite.alt}
      draggable={false}
      style={{
        left: `${sprite.x}%`,
        top: `${sprite.y}%`,
        width: `${sprite.width}%`,
        zIndex: 10 + Math.round(sprite.y),
      }}
    />
  )
}

export default function GreywatchScene({ tick, heroName, buildings, onLeave, children }) {
  const lighting = getVillageLighting(tick)
  const background = `${GREYWATCH_SCENE.root}/background-${lighting}.png`

  return (
    <div className="greywatch-viewport" style={{ '--village-background': `url("${background}")` }}>
      <section
        className={`greywatch-scene greywatch-${lighting}`}
        aria-label="Greywatch village"
        data-lighting={lighting}
      >
        <img
          className="greywatch-background"
          src={background}
          alt="Greywatch countryside and watchtower"
          draggable={false}
        />
        {GREYWATCH_SCENE.decorations
          .filter((sprite) => !buildings.includes(sprite.replacedBy))
          .map((sprite) => (
            <ScenerySprite key={sprite.id} sprite={sprite} />
          ))}
        {GREYWATCH_SCENE.npcs
          .filter((npc) => isVillageNpcVisible(npc, tick))
          .map((npc) => (
            <ScenerySprite key={npc.id} sprite={npc} />
          ))}
        {children}
        <HeroAvatar {...GREYWATCH_SCENE.hero} name={heroName} />
        {GREYWATCH_SCENE.exits.map((exit) => (
          <button
            key={exit.id}
            className="greywatch-exit"
            style={{ left: `${exit.x}%`, top: `${exit.y}%` }}
            aria-label={exit.label}
            title="Return to the world map"
            onClick={onLeave}
          >
            <span aria-hidden="true">↗</span> Map
          </button>
        ))}
      </section>
    </div>
  )
}
