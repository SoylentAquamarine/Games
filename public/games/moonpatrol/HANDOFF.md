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

## Most recent pass

Chickens-as-lives conversion, death animation, board title cards, extra
chicken awards, and the flyby bonus — one combined pass. Earlier:
three-way fire and parallax-scrolling terrain layers added.

## Open / deferred

- **Flyby cameo doesn't use the shared `/mascots.js` library** — its
  sprite is simpler than either library variant. Needs a design call:
  upgrade this game's cameo to match the shared sprite, or add a
  lighter-weight "mini" variant to the library that both can share.
