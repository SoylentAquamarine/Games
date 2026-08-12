# Chickenland (board/candyland) — per-game handoff

Candy Land-style color-matching race: draw a card, hop to the next
matching space, mud puddles cost a turn, first to the barn wins.

## What's here

- `index.html` — everything. `window.__cl` exposes `buildSpaces`,
  `nextOf`, `buildDeck` for headless testing.
- 3 players (you + 2 CPU), 54-space lane (`N`), 6 barnyard colors drawn
  from the Okabe-Ito color-blind-safe palette (deliberately not the
  original two visually-similar amber/gold pair — see the comment at
  the top of the script).
- The deck (`buildDeck`) has 7 single + 3 double cards per color;
  drawing a double card moves to the *second* matching space ahead
  (`nextOf`'s `count` starts at 2), not just double the distance.
- Two fixed mud spaces (12, 31 — `mud` Set) cost the player their next
  turn if they land there.
- **Stale-timer protection**: every CPU-turn/card-reveal `setTimeout`
  captures the current game generation (`const g=gen;`) before
  scheduling, and checks `g===gen` (or `g!==gen` to bail) before
  acting. `newGame()` increments `gen`, so a timer left over from a
  game the player abandoned via "New Game" mid-turn can never act on
  the fresh game's state. This is applied consistently at every
  `setTimeout` call site in the file — verified during a bug-hunt pass
  this session, no gap found.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (the `board/*` folder was the last set of games
missing per-game HANDOFF.md files — see the root HANDOFF.md's
"Per-game HANDOFF.md rollout" note). Everything under "What's here"
reflects the game as originally built, including the deliberate
colorblind-safe palette choice and the already-correct stale-timer
guarding.

## Open / deferred

Nothing currently open for this game. No admin-config-worthy numeric
knobs were found on inspection — `N` (lane length) and the mud
positions are structural to this specific board layout, not simple
difficulty scalars.
