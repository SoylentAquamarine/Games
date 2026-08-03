# Egg Shooter (bubbleshooter) — per-game handoff

Bubble Shooter-style aim-and-match: fire eggs up into a field, match 3+
of the same color to clear them.

## What's here

- `index.html` — everything. `window.__bubble` exposes the pure sim for
  headless testing.
- Calmer egg field and an interlude flyby, added in the same pass as
  Asteroids' own interlude flyby.

## Most recent pass

Fixed every shot traveling at one consistent speed — it used to get
faster with each shot, which made later shots harder to aim on reflex
rather than on genuine difficulty. Earlier: the original build — calmer
egg field, interlude flyby, added as a new game alongside a pass on
Asteroids.

## Open / deferred

Nothing currently open for this game.
