# Pong (pong) — per-game handoff

Classic Pong: paddle-and-ball tennis against a CPU opponent.

## What's here

- `index.html` — everything. `window.__pong` exposes just `C` (the
  admin-tunable difficulty knobs below) — not a full pure-sim export,
  the update/render loop itself is still untested.
- Uses the shared "Press Spacebar to Begin" overlay gate.
- Original build: added alongside Lights Out and Hangman.

## Most recent pass

Fixed arrow keys steering the paddle also scrolling the page (missing
`preventDefault` on the keydown handler) — a real, if small, usability
bug: every paddle move was fighting the browser's own scroll behavior.

## Admin config

`/admin/games/?game=pong` — 3 difficulty knobs registered in
`NUMERIC_CONFIGS` (`public/admin/games/index.html`): `WIN` (points to
win), `CPU_SPEED`, `BALL_SPEED` (initial serve speed). Pulled out of
a standalone `const` plus two locally-scoped magic numbers (the CPU's
tracking speed, the ball's serve speed) into a mutable `C` object; an
IIFE reads `localStorage.pong_config` on load and overrides any
matching numeric key via an explicit allowlist. `PW`/`PH` (paddle
size) stay plain consts — structural, not a difficulty knob.

## Open / deferred

Nothing currently open for this game.
