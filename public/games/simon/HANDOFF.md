# Simon (simon) — per-game handoff

Classic Simon memory game: watch the growing color/tone sequence, then
repeat it back by tapping the 4 quadrant pads.

## What's here

- `index.html` — everything, 4-quadrant circular layout (green/red/
  yellow/blue). No `window.__` export — this game doesn't expose a pure
  sim for headless testing (grepped the file to confirm).
- Each pad has its own tone (`FREQ`, one frequency per color) played via
  the Web Audio API (`tone()`, a simple oscillator + gain envelope) —
  audio is generated on the fly, no sample files.
- Playback speed scales with sequence length (`playback()`,
  `speed=Math.max(300,650-seq.length*20)`), so later rounds flash faster.
  A wrong tap ends the round and reports how many rounds were correctly
  reached.
- Best round count persisted to `localStorage["simon_best"]`. No admin
  config pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the game as
originally built.

## Open / deferred

Nothing currently open for this game.
