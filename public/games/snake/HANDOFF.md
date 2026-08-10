# Snake (snake) — per-game handoff

Classic Snake: grow by eating, don't hit the wall or your own tail.

## What's here

- `index.html` — everything. No `window.__` pure-sim export; not yet set
  up for headless testing the way most other games are.
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

## Open / deferred

- **No `window.__snake` test export** — worth adding if this game gets a
  future gameplay pass.
