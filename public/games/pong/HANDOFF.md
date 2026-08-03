# Pong (pong) — per-game handoff

Classic Pong: paddle-and-ball tennis against a CPU opponent.

## What's here

- `index.html` — everything. No `window.__` pure-sim export; not yet set
  up for headless testing the way most other games are.
- Uses the shared "Press Spacebar to Begin" overlay gate.
- Original build: added alongside Lights Out and Hangman.

## Most recent pass

Fixed arrow keys steering the paddle also scrolling the page (missing
`preventDefault` on the keydown handler) — a real, if small, usability
bug: every paddle move was fighting the browser's own scroll behavior.

## Open / deferred

- **No `window.__pong` test export** — worth adding if this game gets a
  future gameplay pass.
