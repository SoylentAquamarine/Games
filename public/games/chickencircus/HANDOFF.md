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
- **Admin-configurable** at `/admin/games/?game=chickencircus`: `LIVES`,
  `GRAV` (fall gravity), `SEESAW_SPEED`, `ROW_GAP` (balloon row spacing).
  Uses the site's generic numeric-knob config pattern (see kaboom's
  HANDOFF.md) — saved to `localStorage["chickencircus_config"]`, merged
  into `C` at boot via an explicit allowlist.

## Most recent pass

Added admin-configurable difficulty knobs (see above) as part of the
site-wide numeric-knob config rollout — no player feedback prompted this,
just extending an existing pattern to a game that already had a suitable
`C` object.

Earlier: launch physics reworked to fling toward the corner of the
landing end with the square-catch/near-miss-hop split. Before that: fixed
the game halting outright, and the chicken now waits on the ground end
between launches instead of an undefined idle state.

## Open / deferred

Nothing currently open for this game.
