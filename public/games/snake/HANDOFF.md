# Snake (snake) — per-game handoff

Classic Snake: grow by eating, don't hit the wall or your own tail.

## What's here

- `index.html` — everything. No `window.__` pure-sim export; not yet set
  up for headless testing the way most other games are.
- Starts on spacebar.

## Most recent pass

Fixed spacebar-to-start being undiscoverable — the mechanic already
worked, but neither the start overlay nor the hint text ever mentioned
it, so players had no way to know how to begin. A "it works but nobody
can find it" bug, not a logic bug.

## Open / deferred

- **No `window.__snake` test export** — worth adding if this game gets a
  future gameplay pass.
