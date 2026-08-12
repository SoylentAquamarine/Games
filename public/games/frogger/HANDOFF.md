# Chicken Crossing (frogger) — per-game handoff

Frogger-style road/river crossing: dodge traffic, ride logs across the
river without falling in.

## What's here

- `index.html` — everything. `window.__frogger` exposes just `C` (the
  admin-tunable difficulty knobs below) — not a full pure-sim export.
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

## Admin config

`/admin/games/?game=frogger` — 2 difficulty knobs registered in
`NUMERIC_CONFIGS` (`public/admin/games/index.html`): `LIVES`,
`SPEED_MULT` (scales every lane's traffic/log speed together). Pulled
`lives=3` out of `reset()` and added `SPEED_MULT` as a multiplier
applied at both lane-item movement and log-riding, rather than
exposing each lane's individual speed/gap — those stay in their own
config array untouched. An IIFE reads `localStorage.frogger_config`
on load and overrides any matching numeric key via an explicit
allowlist.

## Open / deferred

Nothing currently open for this game.
