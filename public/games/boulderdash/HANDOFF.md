# ChickenDash (boulderdash) — per-game handoff

Boulder Dash-style digger: tunnel through dirt, dodge/drop falling
boulders, collect eggs, reach the exit.

## What's here

- `index.html` — everything. `window.__boulderdash` exposes the pure sim
  (`newState`, `buildLevel`, `nextScreen`, `loseChicken`, `respawnPlayer`,
  `awardExtras`, `move`, `physicsStep`, `inb`, `C`).
- A flyby cameo drops in periodically, drawn via the shared `/mascots.js`
  library (`Mascots.spacesuitChickenFlying` — the jetpack variant). This
  game used to have its own local copy of that sprite; removed in favor of
  the shared one.
- Board is 75% larger than the original size (`feat: Boulder Dash ->
  ChickenDash, board 75% larger`).
- **Admin-configurable** at `/admin/games/?game=boulderdash`: `CHICKENS`
  (starting lives) and `EXTRA` (extra-chicken score threshold). Uses the
  site's generic numeric-knob config pattern (see kaboom's HANDOFF.md) —
  saved to `localStorage["boulderdash_config"]`, merged into `C` at boot
  via an explicit allowlist.

## Most recent pass

Added the admin config pane described above — no gameplay change to the
defaults.

Earlier: migrated the flyby cameo to `/mascots.js` (`Mascots.spacesuitChickenFlying`)
as part of a site-wide sweep — see the root `HANDOFF.md`'s mascots.js
entry. No gameplay change, purely de-duplicating a copy-pasted sprite that
had started drifting from the other games' versions.

Prior pass: chickens as lives, CHICKEN DOWN respawn, screen progression
with more boulders on average at later screens, extras.

## Open / deferred

Nothing currently open for this game.
