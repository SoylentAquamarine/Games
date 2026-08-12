# Snake (snake) — per-game handoff

Classic Snake: grow by eating, don't hit the wall or your own tail.

## What's here

- `index.html` — everything. `window.__snake` exposes just `C` (the
  admin-tunable difficulty knobs below) — not a full pure-sim export,
  the update/render loop itself is still untested.
- Starts on spacebar.

## Most recent pass

**Bug fix (found in a targeted bug-hunt pass, not player-reported): pausing
didn't actually stop the snake in time.** `loop()` schedules its next tick
with `timer = setTimeout(() => { step(); loop(); }, speed)`. `togglePause()`
only flipped the `paused` flag — it never cleared that in-flight timer, and
the timer's callback doesn't check `paused` before calling `step()`. So the
tick already scheduled before you hit pause still fired once, moving the
snake (and, if the timing was unlucky, running it into a wall or its own
tail) *after* the "Paused" overlay was already showing. Confirmed with a
headless repro (fake `setTimeout`/`clearTimeout` tracking pending timers)
that showed the timer queue still had 1 pending timer immediately after the
pause keypress. Fixed by adding `clearTimeout(timer)` at the top of
`togglePause()`'s `paused` branch, so the pending step is cancelled the
instant you pause, matching resume's existing behavior of calling `loop()`
fresh (which itself starts with `clearTimeout(timer)`).

Earlier: fixed spacebar-to-start being undiscoverable — the mechanic already
worked, but neither the start overlay nor the hint text ever mentioned
it, so players had no way to know how to begin. A "it works but nobody
can find it" bug, not a logic bug.

## Admin config

`/admin/games/?game=snake` — 3 difficulty knobs registered in
`NUMERIC_CONFIGS` (`public/admin/games/index.html`): `START_SPEED`
(initial step interval, ms), `MIN_SPEED` (fastest it can ramp to),
`SPEED_STEP` (speed increase per food eaten). Pulled out of inline
magic numbers into a mutable `C` object; an IIFE reads
`localStorage.snake_config` on load and overrides any matching
numeric key via an explicit allowlist. `GRID` (board size) stays a
plain const — structural, not a difficulty knob.

## Open / deferred

Nothing currently open for this game.
