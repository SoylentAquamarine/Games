# The Great Egg Heist (eggheist) — per-game handoff

Pure-text choice-driven mystery: eggs are missing from the henhouse,
explore the farm, gather clues, find the right item, and confront the
culprit at the fox den.

## What's here

- `index.html` — everything, no `<canvas>` — a scrolling text log, a
  command input (`go barn`, `take lantern`, `look`, `inventory`, or a
  bare room name), and buttons for the current room's exits/item.
  `window.__eggheist` exposes the pure sim (`ROOMS`, `WIN_CLUES_NEEDED`,
  `newGame`, `roomDef`, `look`, `move`, `take`).
- **Unlike `huntfox`, the map is fixed/hand-authored, not randomly
  generated** — 7 rooms (`ROOMS` object: henhouse, barn, pond, silo,
  toolshed, orchard, foxden), each with a description, exits, and
  optionally one item and/or one clue.
- Two rooms are locked behind an item in inventory (`requires`): the silo
  needs the `lantern` (found in the barn), the toolshed needs the `key`
  (found in the orchard). Each locked room's clue is only revealed once
  you're actually inside.
- **The henhouse's clue is unavoidable in real play** — `look()` runs
  automatically the moment a new game starts, and henhouse is the
  mandatory hub you pass through to reach the pond/orchard branch. Worth
  remembering if this map is ever extended: any clue placed in a room
  that sits on the only path to another required room stops being
  optional busywork and becomes a guaranteed freebie.
- `foxden` is the terminal room — entering it (from the barn, always
  reachable, no lock) ends the game. Win requires the `grain` item
  (found at the pond) AND at least `WIN_CLUES_NEEDED` (2) clues
  collected; otherwise one of two different bad-ending messages plays
  depending on whether you had the grain at all.

## Most recent pass

New game, built in response to the same player feedback as `huntfox`:
"we need 4 text based games, make 2 pure text and 2 half text half
graphics on the screen like oregon trail." This is the second of the 4
(the second "pure text" game — both are now done). Registered on the
home page's "📖 Text Adventures" category alongside huntfox.

## Open / deferred

- **1 more game from the same comment**: a second "half text half
  graphics" Oregon-Trail-style game. `chickentrail` is the first one —
  see its HANDOFF.md. Not started — see the root `HANDOFF.md` and the
  still-open home-page comment for the original ask.
- The map is small (7 rooms, 1 ending state with 3 outcome messages) —
  if the player wants more depth here later, more rooms/items/clues can
  be added to `ROOMS` without touching the engine functions at all.
