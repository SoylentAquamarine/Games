# Chicken1 (chicken1) — per-game handoff

Top-down F1-style racer: a curving road, forward scroll, traffic culling.

## What's here

- `index.html` — everything. `window.__chicken1` exposes the pure sim for
  headless testing.
- Built alongside `chickenposition` (a separate pseudo-3D Pole
  Position-style racer) in the same original pass — the two share driving-
  game history but are independent games/files. See `chickenposition`'s
  HANDOFF for its own steering/curve fixes.
- Reworked from a lives-based game into a time trial: no chickens/lives,
  race to a finish line instead.
- **Five races** (`RACES`), each its own finish distance, traffic density
  and road-curve shape — Circuit Sprint, Switchback, Endurance, Gauntlet,
  Straightaway. A ◀ Race ▶ picker cycles between them, persisted to
  `localStorage["chicken1_raceidx"]`. `RACES[0]` (Circuit Sprint) is
  exactly the original single track, kept as the default.
- **Space chicken cameo**: a persisted race counter
  (`localStorage["chicken1_racenum"]`) shows a decorative
  `Mascots.spacesuitChicken` flyby once per race, on every 5th race
  started. Purely cosmetic — no collision, no scoring effect.

## Most recent pass

**Player feedback: "ok we have one race, we need more races with
different options, and every 5 races we need to see the space chicken."**
Added the five-race system and the every-5th-race cameo described above.
`roadCenterX(worldY, curve)` and `newState(raceIdx)` both gained an
optional parameter, defaulting to `RACES[0]`'s config so every existing
caller (and every pre-existing test) keeps behaving exactly as before.

Earlier: reworked into the time-trial format (no chickens/lives, race to
a finish line) in the same pass that fixed a canvas/coordinate-system
mismatch causing edge artifacts — that fix applied to both this game and
`chickenposition` since they share the underlying road-rendering
approach. Earlier still: curving road, correct forward scroll, and
traffic culling (`fix(driving): chicken1 gets a curving road...`).

## Open / deferred

Nothing currently open for this game.
