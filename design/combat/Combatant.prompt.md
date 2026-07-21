One-sentence: One fighter on the battle line — ally or foe — with its floor health bar and, for foes, the telegraphed intent above it.

```jsx
<Combatant name="Corwin" initial="C" side="ally" hp={7} maxHp={8} />
<Combatant name="Ashwood Wolf" initial="W" side="foe" hp={6} maxHp={8} intent="⚔ 6–9 · Corwin" selected />
<Combatant name="Old Oakheart" initial="O" side="foe" elite hp={22} maxHp={30} intent="⚔⚔ 18–26 · all" />
```

The frame colour codes the side — gold ally, red foe, amber for the current target. There is no "enemy" label anywhere. `elite` makes it a single oversized figure so the encounter reads before its name does. `hp`/`maxHp` are bar segments, not raw HP: the bar is meant to be read, not counted. The bar carries an opaque plate and a light rim so it survives both a bright forest and a dark crypt behind it.
