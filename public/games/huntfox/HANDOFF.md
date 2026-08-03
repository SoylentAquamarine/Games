# Hunt the Fox (huntfox) — per-game handoff

Pure-text Hunt the Wumpus clone: a fox is hiding somewhere in a 20-burrow
warren, with 2 ravines (pits) and 2 hawks (bats) scattered through it.
Move burrow to burrow following sense clues, then fire one of 5
slingshot stones through up to 5 connected burrows to try to hit it.

## What's here

- `index.html` — everything, no `<canvas>` at all — a scrolling text log,
  a command input (`move 5`, `shoot 5 8 12`, or just a bare number to
  move), and buttons for the current room's exits. `window.__huntfox`
  exposes the pure sim (`generateCave`, `isConnected`, `newGame`,
  `neighbors`, `senses`, `move`, `shoot`, `N`, `DEGREE`).
- **The cave is generated fresh every game**, not the fixed classic
  20-room dodecahedron map original Wumpus players eventually memorize.
  `generateCave()` builds a random 3-regular graph (every room has
  exactly 3 exits) via repeated-random-stub-matching with retries,
  validated for no self-loops/duplicate edges/degree mismatches and full
  connectivity (`isConnected`) before being accepted — falls back to a
  small hand-built valid graph in the (extremely unlikely) case 200
  random attempts all fail structurally.
- Hazard rules: walking into a pit is instant death. Walking into the
  fox's room is a 75% kill / 25% flee (fox relocates to a random one of
  its own exits). Walking into a hawk's room is 50/50 — either it grabs
  you and drops you in a **fully random** room anywhere in the warren
  (which can chain into another hazard — `enterRoom()` recurses), or you
  duck clear. A shot that misses gives the fox a 25% chance to relocate;
  if it relocates into the shooter's own room, that's also a loss.
- A queued shot that hits an illegal (non-adjacent) room deflects to a
  random real exit of wherever it currently is, rather than erroring —
  matches the classic game's "arrow flies wild" behavior for a
  badly-aimed path.

## Most recent pass

New game, built in response to player feedback: "we need 4 text based
games, make 2 pure text and 2 half text half graphics on the screen like
oregon trail." This is the first of the 4 (one of the two "pure text"
games). Registered on the home page under a new "📖 Text Adventures"
category.

## Open / deferred

- Nothing outstanding from the "4 text-based games" comment — all 4
  shipped. See `eggheist` (2nd pure-text game), `chickentrail` and
  `chickencaravan` (the 2 Oregon-Trail-style games).
