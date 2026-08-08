# Chicken Position (chickenposition) — per-game handoff

Pole Position-style pseudo-3D racer: bottom-up road projection, curves
that shift the rendered road, an offroad penalty.

## What's here

- `index.html` — everything. `window.__chickenposition` exposes the pure
  sim (`newState`, `step`, `curveAt`, `crash`, `computeRoadRows`, `RACES`,
  `C`).
- Built alongside `chicken1` (a separate top-down F1 racer) in the same
  original pass — the two share some driving-game history but are
  independent games/files.
- Road curvature accumulates from a single source (not compounded from
  multiple values) — a past bug let right-edge artifacts creep in when
  curve contributions were added from more than one place per frame.
- **Tracks are built from segments** (`buildTrack`): a length + a target
  curve strength. Each segment eases in from the previous one over its
  first 22% and then holds flat — a real straight, then a real, sustained
  turn (see `segCurveAt`). `curveAt(pos, track)` wraps that with the
  start-of-race straight ramp and defaults `track` to `RACES[0]`'s so
  every caller that doesn't know about races still works.
- **Five races** (`RACES`): Circuit, Switchback, Speedway, Hairpins,
  Rally Stage — each its own segment layout and finish distance. A
  ◀ Race ▶ picker cycles between them, persisted to
  `localStorage["chickenposition_raceidx"]`.
- **A real finish line**: reaching `s.finishDist` ends the race as an
  outright win (drawn as a checkered band at the corresponding row),
  taking priority over the TIME countdown even on the same frame. TIME
  running out (the only way to end a race before this pass) is still a
  loss condition if you don't reach the line first.
- **Admin-configurable** at `/admin/games/?game=chickenposition`:
  `MAXSPD`, `ACCEL`, `BRAKE`, `DRAG`, `TIME_START`, `TIME_RATE`. Uses the
  site's generic numeric-knob config pattern (see kaboom's HANDOFF.md) —
  saved to `localStorage["chickenposition_config"]`, merged into `C` at
  boot via an explicit allowlist. **Steering/render constants (`STEER`,
  `CENTRIFUGAL`, `STEER_SHIFT`, `RENDER_CLAMP`, `CAR_WIDE`, etc.) are
  deliberately NOT exposed** — the in-code comments document them as
  carefully coupled to fix the road-vs-collision desync bug described
  below, and an untested admin combination could reintroduce it. The
  exposed knobs apply identically across every race in `RACES` since only
  `track`/`finishDist` vary per-race, not these.

## Most recent pass

Added admin-configurable difficulty knobs (see above) as part of the
site-wide numeric-knob config rollout — no player feedback prompted this,
just extending an existing pattern to a game that already had a suitable
`C` object.

Earlier: **player feedback: "needs actual turns, not just slight curves,
needs a finish line and different races."** All three landed together:

1. Replaced the single continuous sine-blend course with the segment
   system described above — the whole track used to read as one gentle,
   constant wobble; now it's real straights punctuated by real, sustained
   corners.
2. Added the finish-line win condition (previously the race only ever
   ended by running out of TIME).
3. Added the five-race picker.

`curveAt` and `computeRoadRows` both gained an optional trailing `track`
parameter defaulting to `RACES[0]`'s, so every pre-existing test kept
passing unmodified.

Earlier: recalibrated the steering-shift dampener (0.24 → 0.9) so the
rendered road position actually matches the offroad collision threshold —
before this, small legitimate steering barely moved the drawn road, so
"still looks on the road" was true on screen while `playerX` had already
crossed the real offroad line underneath. Earlier still: dampened how
much steering shifts the road at all (was flinging it off-screen at full
lock), tightened the collision hitbox to match the drawn car size, and
fixed a single-curve-accumulation bug that caused right-edge road
artifacts.

## Open / deferred

Nothing currently open for this game.
