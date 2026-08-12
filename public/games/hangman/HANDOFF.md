# Hangman (hangman) — per-game handoff

Classic Hangman: guess the word letter by letter before the drawing
completes.

## What's here

- `index.html` — everything. `window.__hangman` exposes just `C` (the
  admin-tunable difficulty knob below) — not a full pure-sim export.
- Original build: added alongside Pong and Lights Out.
- **Admin-configurable** at `/admin/games/?game=hangman`: `MAXW` (wrong
  guesses allowed). Uses the site's generic numeric-knob config pattern
  (see kaboom's HANDOFF.md) — saved to `localStorage["hangman_config"]`,
  merged into `C` at boot via an explicit allowlist. Capped at 6 (both in
  the admin field's `max` and defensively in `drawGallows()`'s draw
  loop) since the gallows figure is hand-drawn as exactly 6 SVG stages
  (`PARTS`) — a higher `MAXW` just means the figure finishes appearing
  early rather than indexing past the array.

## Most recent pass

Added the admin config pane described above (`MAXW`) — no gameplay
change to the default. `drawGallows()`'s reveal loop was also bounded
to `PARTS.length` defensively, since an admin-raised `MAXW` beyond 6
would otherwise let `wrong` exceed the number of drawn stages.

Earlier: no dedicated feedback pass yet beyond the original build and
the site-wide comments-widget rollout.

## Open / deferred

Nothing currently open for this game.
