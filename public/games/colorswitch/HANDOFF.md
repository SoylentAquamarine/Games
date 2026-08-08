# Color Switch (colorswitch) — per-game handoff

Endless bouncer: tap to flap a ball upward through spinning 4-color
rings, but only through the arc segment matching your current color.

## What's here

- `index.html` — everything, canvas-based. `window.__colorswitch` exposes
  the pure sim (`newState`, `step`, `gateColorIndex`, `COLORS`, `C`) for
  headless testing.
- Uses the shared `/arcade.js` `Arcade.startGate` — the loop is held with
  a "press to begin" gate until the player's first flap, and
  `Arcade.stats.record("colorswitch", s.score)` reports scores to the
  site's stats system.
- Each ring (`makeRing`) is a random permutation of the 4 colors across
  its 4 quadrant arcs and spins continuously at a random speed/direction;
  passing through the wrong-colored arc ends the run (`s.over=true`).
  Stars (`makeStar`) sit between rings and change the ball's current color
  on pickup.
- Camera follows the ball (`camY = s.ball.y - H*0.62`) so the world
  scrolls rather than the ball moving on a fixed screen.
- Best score persisted to `localStorage["colorswitch_best"]`.
- **Admin-configurable** at `/admin/games/?game=colorswitch`: `GRAVITY`,
  `FLAP` (strength), `RING_GAP` (spacing). Uses the site's generic
  numeric-knob config pattern (see kaboom's HANDOFF.md) — saved to
  `localStorage["colorswitch_config"]`, merged into `C` at boot via an
  explicit allowlist.

## Most recent pass

**Bug fix (found in a code-review pass, not player-reported): passing a
ring checked the wrong color segment.** `gateColorIndex()` decided
pass/fail by finding which segment index contained the ring's raw
rotation value (`r.rot`) — not a meaningful query. What matters is which
quarter-arc is actually drawn at the top of the ring (world angle
`-PI/2`), since that's the point the ball's vertical flight path
crosses. The old formula drifted in the opposite rotational direction
from the true top segment, disagreeing with what's on screen roughly
half the time — the game could kill you for a color that visually looked
correct, or pass you through on one that didn't. Fixed by solving for
the segment containing world angle `-PI/2` relative to `r.rot`.

Earlier: added admin-configurable difficulty knobs (see above) as part of
the site-wide numeric-knob config rollout — no player feedback prompted
this, just extending an existing pattern to a game that already had a
suitable `C` object.

Earlier still: no player-feedback pass yet — this HANDOFF.md was created as
part of a documentation sweep (see the root HANDOFF.md's "Per-game
HANDOFF.md rollout" note). Everything under "What's here" reflects the
game as originally built.

## Open / deferred

Nothing currently open for this game.
