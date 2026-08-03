# Chicken Crossing (frogger) — per-game handoff

Frogger-style road/river crossing: dodge traffic, ride logs across the
river without falling in.

## What's here

- `index.html` — everything. No `window.__` pure-sim export; not yet set
  up for headless testing the way most other games are.
- `Arcade.sfx` wired up for sound effects (shared pass with digdug,
  drmario, bomberman).
- Log rows: the top two rows flow in the opposite direction from the rest
  — a deliberate visual/gameplay variety fix, not a bug.

## Most recent pass

Sound effects wired up via the shared `Arcade.sfx` helper. Earlier: fixed
the top two log rows to flow opposite the others (previously all rows
flowed the same direction, which read as monotonous/easier than
intended). Earlier still: chicken-themed rebrand, and an early
player-comment processing pass (batch 1, shared across several games).

## Open / deferred

- **No `window.__frogger` test export** — worth adding if this game gets
  a future gameplay pass.
