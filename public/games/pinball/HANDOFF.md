# Chicken Pinball (pinball) — per-game handoff

Pinball table: flippers, launch lane, bumpers.

## What's here

- `index.html` — everything. `window.__pinball` exposes the pure sim for
  headless testing.
- Table is 50% larger than its original size, with wider flippers and
  better ball containment (was escaping the table).

## Most recent pass

Fixed a launch that could fail to clear the lane (ball getting stuck at
the top of the plunger lane) and added a spacebar table-bump input.
Earlier: wider flippers and 50% larger table alongside a ball-containment
fix. Earlier still: addressed a round of player comments together with
digdug, wordle, and chutes.

## Open / deferred

Nothing currently open for this game.
