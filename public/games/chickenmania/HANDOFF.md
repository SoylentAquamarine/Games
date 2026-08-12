# Chickenmania — per-game handoff

Megamania-style shooter: 8 rotating enemy formations (one per wave), a
guided single-shot weapon that keeps answering your left/right steering
all the way up the screen, and a ONE SHOT ONE KILL bonus round.

## What's here

- `index.html` — everything. `window.__chickenmania` exposes the pure sim
  (`newState`, `step`, `fire`, `startOneKill`, `oneKillStep`, `WAVES`, `OK`,
  `C`) for headless testing.
- `WAVES` can be overridden by `localStorage["chickenmania_waves"]`, edited
  from the admin Game Admin page's wave editor.
- Egg/water drops scale up each time the 8-formation cycle repeats
  (`cycleOf`), 10% per loop; movement pattern per formation never changes
  (feathers always wild, cartons always cycle, etc.) — that's deliberate,
  it's how players learn the board.

## Most recent pass (three rounds of player feedback on the bonus round)

1. **Bug**: the ONE SHOT ONE KILL trigger checked `s.wave % OK.EVERY===0 &&
   s.misses===0`, but `s.misses` was only ever reset at a checkpoint wave —
   a miss on wave 1 silently persisted through waves 2-3 and could block
   wave 4's bonus even after a flawless wave 4. Fixed: misses reset every
   wave now, so the checkpoint only judges the wave that actually clears it.
2. Once players actually reached the bonus round: it reused the ordinary
   wave-clear sound (confusing), the title-card pause dragged (240 frames,
   ~4s), and the 10 spacesuit chickens were bunched so tight (`DELAY_STEP`
   11 vs a 208-frame crossing time) that up to ~9 could be on screen at
   once — "completely impossible to hit." Fixed: distinct `win()` sound,
   `TITLE` cut to 90, `DELAY_STEP` widened to 100 (~2 in flight at a time).
3. **"I just got one shot one kill on the first wave and it did not
   trigger"** — the `wave % OK.EVERY === 0` checkpoint gate itself was the
   problem; players expect the name to mean exactly what it says. The gate
   is gone entirely — any wave cleared with zero missed shots triggers the
   bonus now, `OK.EVERY` no longer exists.

## Admin config

`/admin/games/?game=chickenmania` — 4 difficulty knobs registered in
`NUMERIC_CONFIGS` (`public/admin/games/index.html`): `LIVES`,
`SHIP_SPEED`, `WAVE_BONUS`, `RAMP` (the per-formation-replay
speed/drop-rate multiplier, moved out of a standalone `const` into
`C` for this). These live in the same `C` object chickenmania already
used for layout/geometry; an IIFE reads `localStorage.
chickenmania_config` on load and overrides any matching numeric key
via an explicit allowlist. Pure layout/geometry fields (`W`, `H`,
`SHIP_W`, `E_W`, `COLS`, `ROWS`, ...) stay untouched — changing those
would break rendering, not just difficulty. Separate from
`localStorage["chickenmania_waves"]` above — one tunes formation
shapes, the other tunes overall pacing. `window.__chickenmania`
already exported `C`, so no export change was needed.

## Open / deferred

Nothing currently open for this game.
