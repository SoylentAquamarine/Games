# Chicken Match (candycrush) — per-game handoff

Match-3: swap two adjacent chicken heads to line up 3+ of the same color,
reach the target score before moves run out.

## What's here

- `index.html` — everything. `window.__cc` exposes the pure sim (`gen`,
  `findMatches`, `collapse`, `SIZE`, `NCOL`) for headless testing.
- 8x8 board (`SIZE=8`), 6 colors (`NCOL=6`). Each tile is a small inline
  SVG chicken head (`chickenSVG`) tinted per color via a `darken()` helper
  rather than a plain colored square.
- Board generation (`gen`) avoids pre-existing 3-in-a-rows/columns so the
  starting board has no free matches. Swaps that don't produce a match are
  reverted after a short delay with a "No match there." status message.
- Chain/cascade scoring: after a swap, `resolve()` repeatedly finds
  matches, clears them, collapses columns with `collapse()` (refilling
  from the top with new random tiles), and re-checks — each successive
  cascade step multiplies the per-tile score by an increasing `combo`
  counter.
- Fixed target of 1000 points in 25 moves (`TARGET`, `MOVES`); game ends
  in a win or "out of moves" state.
- No admin config pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the game as
originally built.

## Open / deferred

Nothing currently open for this game.
