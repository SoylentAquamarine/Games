# Helix Jump (helixjump) — per-game handoff

Helix Jump-style falling-ball game: rotate a spiral tower so the ball
drops through gaps in each platform ring, avoiding red "death" segments.

## What's here

- `index.html` — everything, canvas-based. `window.__helixjump` exposes
  the pure sim (`newState`, `step`, `segIndexUnder`, `genPlatform`, `C`)
  for headless testing.
- Uses the shared `/arcade.js` `Arcade.startGate` (press-to-begin gate)
  and `Arcade.stats.record("helixjump", s.score)`.
- Each platform ring is divided into 12 segments (`C.SEG`); `genPlatform`
  carves 1-2 adjacent "gap" segments per ring, and from the 3rd platform
  onward has a 50% chance to convert one remaining solid segment into a
  "death" segment (instant game over on landing).
- The ball bounces on solid segments (`C.BOUNCE`), falls through gaps to
  advance `s.score`/`s.nextIdx`, and platforms are generated lazily 8 rows
  ahead of the current one (`while(s.platforms.length < s.nextIdx+8)`) so
  the tower is effectively endless.
- Rotation input comes from arrow keys/A-D, or drag (mouse/touch)
  converted to rotation delta via `dxToRot`.
- Best depth persisted to `localStorage["helix_best"]`.
- **Admin-configurable** at `/admin/games/?game=helixjump`: `GRAVITY`,
  `BOUNCE`, `ROT_STEP`. Uses the site's generic numeric-knob config
  pattern (see kaboom's HANDOFF.md) — saved to
  `localStorage["helixjump_config"]`, merged into `C` at boot via an
  explicit allowlist. **`SEG` (platform segment count) is deliberately
  NOT exposed** — it's a board-shape constant, not a plain difficulty
  knob.

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
