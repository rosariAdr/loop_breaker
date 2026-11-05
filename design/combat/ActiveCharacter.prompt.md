One-sentence: The acting character's block — portrait, HP/MP gauges and the stat grid that stays visible while the action is chosen.

```jsx
<ActiveCharacter
  name="Corwin" role="Wanderer" initial="C"
  hp={92} maxHp={110} mp={48} maxMp={60}
  stats={{ STR: 18, AGI: 14, INT: 11, DEF: 9, CRIT: '12 %', SPD: 4 }}
/>
```

The single most important borrowing from Darkest Dungeon: you decide with the numbers in front of you. The current Combat screen sends you to the Hero Sheet instead, which is the main reason it reads as "not strategic enough". Keep `stats` to six entries — the grid is two columns of three and does not scroll.
