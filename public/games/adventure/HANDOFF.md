# Chicken Adventure (adventure) — per-game handoff

Atari Adventure-style overworld crawl: rooms on a grid, keys, a sword,
dragons that chase, castles, a 100%-completion secret ending.

## What's here

- `index.html` — everything. `window.__adventure` exposes the pure sim
  (`newGame`, `tick`, `drop`, `respawn`, `dragonStep`, `collide`, `ROOMS`,
  `borderWalls`, `roomWalls`, `LABEL`) for headless testing.
- Rooms sit on a real grid with an overworld map shown beside the game
  canvas (side-by-side row, not stacked below it).
- Dragons have a real chase behavior: a 25% chance per step to chase into
  the next room instead of staying put, and a separate 33% chance to
  chase specifically when fleeing a room the player just entered.
- A secret ending exists for 100% map completion.
- Level layout is editable from the admin page's Level Editor
  (`/admin/games/?game=adventure`) — same convention as Quest/
  Chickenmania; edits are stored in `localStorage` and read on load with
  a safe fallback to the built-in default map.

## Most recent pass

**Player feedback: "change the secret screen text from created by to
adapted by."** The 100%-completion secret ending's credit text (both
`s.msg` and the actual `ctx.fillText` calls in the render path — two
separate places, easy to fix only one and miss the other) now reads
"ADAPTED BY STEPHEN PLEASANTS" instead of "CREATED BY..." — this is a
reskin of the original 1979 Atari Adventure's hidden easter egg, not an
original creation, so the wording should say so.

Earlier: dragon chase behavior added in two steps: first a 25%
chase-into-next-room chance, then a separate 33% chase-on-flee chance
plus the secret 100%-completion ending. Earlier still: moved the
explored-rooms map to sit beside the canvas instead of below it (was
pushing the controls row down awkwardly); separated the black key's
color from other pickups, castle recoloring, a rotating sword sprite,
and title cleanup.

## Open / deferred

Two player comments, not yet started:

1. **"once a dragon follows you to a new room, 100% chance it will keep
   following you to new rooms. When it follows, have it follow you
   through the same doorway you came through, not appear in the
   corner."** Two parts: (a) the current 25%/33% chase chances would
   need to become a persistent "this dragon is now hunting you" state
   that stays 100% once triggered, rather than a fresh roll every step;
   (b) a chasing dragon should spawn at the specific doorway/edge the
   player just came through, not at a fixed corner position.
2. **"once the dragons are triggered, show them on the world map"** —
   the overworld map currently only shows explored rooms; would need to
   also mark which rooms contain an active/chasing dragon.
