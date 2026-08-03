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

Dragon chase behavior added in two steps: first a 25% chase-into-next-
room chance, then a separate 33% chase-on-flee chance plus the secret
100%-completion ending. Earlier: moved the explored-rooms map to sit
beside the canvas instead of below it (was pushing the controls row down
awkwardly); separated the black key's color from other pickups, castle
recoloring, a rotating sword sprite, and title cleanup.

## Open / deferred

Nothing currently open for this game.
