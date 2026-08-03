# Chicken Circus (chickencircus) — per-game handoff

Circus-cannon catch game: launch the chicken toward the corner of the
landing end, time the catch.

## What's here

- `index.html` — everything. `window.__chickencircus` exposes the pure
  sim (`newState`, `step`, `land`, `loseLife`, `makeBalloons`,
  `resetRound`, `swapSide`, and more).
- A launch flings the chicken OUT toward the corner of the launch end (not
  straight up) — a square catch is predictable, a near miss becomes a
  random hop rather than an instant fail.
- Shares a "stuck, can't progress" bug class with Pool from the same
  pass (`fix(chickencircus): game no longer halts` / `fix(pool): could
  not get out of cue-ball placement`) — worth checking together if either
  regresses.

## Most recent pass

Launch physics reworked to fling toward the corner of the landing end
with the square-catch/near-miss-hop split. Earlier: fixed the game
halting outright, and the chicken now waits on the ground end between
launches instead of an undefined idle state.

## Open / deferred

Nothing currently open for this game.
