# Timber! (timberman) — per-game handoff

Timberman-style reflex game: chop the correct side of the tree away from
each branch before the countdown timer runs out.

## What's here

- `index.html` — everything, canvas-based. `window.__timberman` exposes
  the pure sim (`newState`, `chop`, `tickTimer`, `genBlock`, `C`) for
  headless testing.
- Uses the shared `/arcade.js` `Arcade.startGate` (press-to-begin gate)
  and `Arcade.stats.record("timberman", s.score)`.
- Each trunk block (`genBlock`) has a 32% chance of a left branch, 32%
  right, 36% none. Chopping the side matching the block directly above
  the lumberjack (`s.trunk[1]`) ends the run instantly; otherwise the
  trunk shifts down one block and a fresh block is appended at the top.
- A depleting timer bar (`s.timer`, drains at `C.TIMER_DRAIN` per frame,
  refills by `C.TIMER_GAIN` per successful chop) ends the run if it hits
  zero — so play requires a steady chop rate, not just correct-side
  chopping.
- Controls: click/tap the left or right half of the canvas, on-screen
  "◀ Chop"/"Chop ▶" buttons, or arrow keys/A-D.
- Best score persisted to `localStorage["timber_best"]`.
- **Admin-configurable** at `/admin/games/?game=timberman`: `TRUNK_LEN`
  (visible trunk length), `TIMER_MAX`, `TIMER_GAIN`, `TIMER_DRAIN`. Uses
  the site's generic numeric-knob config pattern (see kaboom's
  HANDOFF.md) — saved to `localStorage["timberman_config"]`, merged into
  `C` at boot via an explicit allowlist.

## Most recent pass

Added admin-configurable difficulty knobs (see above) as part of the
site-wide numeric-knob config rollout — no player feedback prompted this,
just extending an existing pattern to a game that already had a suitable
`C` object.

Earlier: no player-feedback pass yet — this HANDOFF.md was created as
part of a documentation sweep (see the root HANDOFF.md's "Per-game
HANDOFF.md rollout" note). Everything under "What's here" reflects the
game as originally built.

## Open / deferred

Nothing currently open for this game.
