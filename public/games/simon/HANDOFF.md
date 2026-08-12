# Simon (simon) — per-game handoff

Classic Simon memory game: watch the growing color/tone sequence, then
repeat it back by tapping the 4 quadrant pads.

## What's here

- `index.html` — everything, 4-quadrant circular layout (green/red/
  yellow/blue). `window.__simon` exposes just `C` (the admin-tunable
  difficulty knobs below) — not a full pure-sim export.
- Each pad has its own tone (`FREQ`, one frequency per color) played via
  the Web Audio API (`tone()`, a simple oscillator + gain envelope) —
  audio is generated on the fly, no sample files.
- Playback speed scales with sequence length (`playback()`,
  `speed=Math.max(C.SPEED_FLOOR,C.SPEED_START-seq.length*C.SPEED_STEP)`),
  so later rounds flash faster. A wrong tap ends the round and reports
  how many rounds were correctly reached.
- Best round count persisted to `localStorage["simon_best"]`.
- **Admin-configurable** at `/admin/games/?game=simon`: `SPEED_START`,
  `SPEED_FLOOR`, `SPEED_STEP` (the three constants in the playback-speed
  formula above). Uses the site's generic numeric-knob config pattern
  (see kaboom's HANDOFF.md) — saved to `localStorage["simon_config"]`,
  merged into `C` at boot via an explicit allowlist.

## Most recent pass

**Bug fix (found in a targeted bug-hunt pass, not player-reported): restarting
mid-playback left a stale `setInterval` running.** `playback()`'s interval id
`t` was a variable local to that single call, never stored anywhere `start()`
or the next `playback()` call could reach. Since `centerEl` (the ▶ in the
middle of the pads) and the Start button both call `start()` unconditionally
— even while the "Watch…" sequence is still animating — tapping either one
mid-playback left the old interval alive alongside the new one. Both then ran
concurrently against the same shared outer-scope `seq` array/length, so the
stale interval's `seq[i]` read the *new* round's (mutated) sequence, causing
wrong pads to flash/sound and letting the stale interval outlive the round it
belonged to. Confirmed with a headless repro (fake `setInterval`/
`clearInterval` counting active timers) that showed 2 concurrent intervals
after a second `start()` call before the first one had exited. Fixed by
tracking the timer id in an outer-scope `playTimer` var and clearing it at
the top of both `start()` and `playback()` before registering a new one.

Earlier: added the admin config pane described above (`SPEED_START`,
`SPEED_FLOOR`, `SPEED_STEP`) — no gameplay change to the defaults.

Earlier still: no player-feedback pass yet — this HANDOFF.md was
created as part of a documentation sweep (see the root HANDOFF.md's
"Per-game HANDOFF.md rollout" note). Everything under "What's here"
reflects the game as originally built.

## Open / deferred

Nothing currently open for this game.
