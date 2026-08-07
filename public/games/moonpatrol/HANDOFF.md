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
- **Admin-configurable** at `/admin/games/?game=moonpatrol`: `SPEED0`,
  `SPEEDMAX`, `BSPEED`, `MAX_VOLLEYS`, `CHICKENS`, `EXTRA`,
  `BOARD_DIST`. Uses the site's generic numeric-knob config pattern (see
  kaboom's HANDOFF.md) — saved to `localStorage["moonpatrol_config"]`,
  merged into `C` at boot via an explicit allowlist. Core jump/gravity
  physics (`GRAV`, `JUMP_V`) are deliberately NOT exposed — same reasoning
  as every other game's config panel, only pacing/difficulty knobs are
  admin-editable, not core feel.

## Most recent pass

Added the admin config pane described above — no gameplay change to the
defaults.

Earlier: chickens-as-lives conversion, death animation, board title cards,
extra chicken awards, and the flyby bonus — one combined pass. Earlier
still: three-way fire and parallax-scrolling terrain layers added.

## Open / deferred

- **Flyby cameo doesn't use the shared `/mascots.js` library** — its
  sprite is simpler than either library variant. Needs a design call:
  upgrade this game's cameo to match the shared sprite, or add a
  lighter-weight "mini" variant to the library that both can share.
