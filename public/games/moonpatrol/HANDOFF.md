# Chicken Patrol (moonpatrol) — per-game handoff

Moon Patrol-style side-scrolling buggy: jump craters, three-way fire
(forward + up), parallax-scrolling terrain.

## What's here

- `index.html` — everything. `window.__moonpatrol` exposes the pure sim
  (`LAYERS`, `newState`, `step`, `fire`, `spawn`, `buggyRect`, `C`).
- Has its own small flyby cameo — visually simpler than the shared
  `/mascots.js` sprite (just a head circle + beak, no comb/visor), so it
  was deliberately **not** migrated during the site-wide mascots.js sweep
  (see the root `HANDOFF.md`'s mascots.js entry). Upgrading it to match
  the shared library, or adding a "mini" library variant, is still open.
- Chickens as lives, a death animation, board title cards, extra chickens
  at score milestones, and the space-chicken flyby as a bonus.
- **Controls, closer to the original arcade game**: Space fires, ArrowUp/W
  jumps (these used to overlap — Space did both). Left/Right are held
  inputs (not edge-triggered) that nudge the buggy's own `s.x` within
  `C.BUGGY_RANGE` of its base `C.BUGGY_X` — the buggy used to have no
  horizontal movement at all, always drawn/collided at the fixed base
  position. The world's forward scroll (`s.speed`) is completely
  untouched by steering; it only changes via its own automatic ramp.
  `buggyRect`/`fire`/collision/drawing all read the buggy's current
  `s.x` now, not the old fixed constant. A crash resets `s.x` back to
  the base position along with everything else.
- **Admin-configurable** at `/admin/games/?game=moonpatrol`: `SPEED0`,
  `SPEEDMAX`, `BSPEED`, `MAX_VOLLEYS`, `CHICKENS`, `EXTRA`,
  `BOARD_DIST`. Uses the site's generic numeric-knob config pattern (see
  kaboom's HANDOFF.md) — saved to `localStorage["moonpatrol_config"]`,
  merged into `C` at boot via an explicit allowlist. Core jump/gravity
  physics (`GRAV`, `JUMP_V`) are deliberately NOT exposed — same reasoning
  as every other game's config panel, only pacing/difficulty knobs are
  admin-editable, not core feel.

## Most recent pass

**Player feedback: "figure out a way to make this more like moon patrol.
Make the space bar fire and the up arrow jump. Left and right should
move the car each direction a little, while the screen is still rolling
a constant speed. Original game has levels i think, research that."**
The control rework described above. The "research levels" ask was
speculative ("I think"), not a concrete spec — the existing per-distance
`BOARD_DIST`/"BOARD N" progression is this game's analog to the original
arcade's terrain-segment structure, so no new mechanic was invented on
top of what already exists rather than guessing at an unspecified one.

Earlier: added the admin config pane described above — no gameplay
change to the defaults at that point.

Earlier still: chickens-as-lives conversion, death animation, board
title cards, extra chicken awards, and the flyby bonus — one combined
pass. Earlier still: three-way fire and parallax-scrolling terrain
layers added.

## Open / deferred

- **Flyby cameo doesn't use the shared `/mascots.js` library** — its
  sprite is simpler than either library variant. Needs a design call:
  upgrade this game's cameo to match the shared sprite, or add a
  lighter-weight "mini" variant to the library that both can share.
