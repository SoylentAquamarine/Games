# Knife Hit (knifehit) — per-game handoff

Knife Hit-style timing game: throw knives into a spinning log without
hitting a knife already stuck in it, clearing waves of increasing spin
speed and obstacle count.

## What's here

- `index.html` — everything, canvas-based. `window.__knifehit` exposes
  the pure sim (`newState`, `step`, `throwKnife`, `nextLevel`,
  `angleCollides`, `angDist`, `C`) for headless testing.
- Uses the shared `/arcade.js` `Arcade.startGate` (press-to-begin gate).
- Knives stick at a fixed launch angle (`STICK = Math.PI/2`, bottom of the
  log) in the log's *local* rotating frame; a throw collides
  (`angleCollides`) if any already-stuck knife is within `C.TOL` angular
  distance of that local angle, regardless of the log's current spin
  position.
- Each level requires sticking `C.KNIVES_PER` (6) knives without a
  collision; clearing a level (`nextLevel`) alternates spin direction,
  increases spin speed with level number, and (from level 2 onward) seeds
  the log with `min(4, floor(level/2))` pre-placed "obstacle" knives the
  player must avoid.
- Best score persisted to `localStorage["knife_best"]`.
- **Admin-configurable** at `/admin/games/?game=knifehit`: `TOL`
  (collision tolerance), `KNIVES_PER`. Uses the site's generic
  numeric-knob config pattern (see kaboom's HANDOFF.md) — saved to
  `localStorage["knifehit_config"]`, merged into `C` at boot via an
  explicit allowlist.

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
