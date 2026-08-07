# Chicken Adventure (adventure) — per-game handoff

Atari Adventure-style overworld crawl: rooms on a grid, keys, a sword,
dragons that chase, castles, a 100%-completion secret ending.

## What's here

- `index.html` — everything. `window.__adventure` exposes the pure sim
  (`newGame`, `tick`, `drop`, `respawn`, `dragonStep`, `collide`, `ROOMS`,
  `borderWalls`, `roomWalls`, `LABEL`, `doorwaySpot`) for headless testing.
- Rooms sit on a real grid with an overworld map shown beside the game
  canvas (side-by-side row, not stacked below it).
- Dragons have a real chase behavior: leaving a room with a live dragon in
  it gives it a 33% chance to follow, arriving `CHASE_DELAY` (~3s) behind
  — but that 33% halves for every additional CONSECUTIVE room the same
  dragon follows through (`CHASE_DECAY`), so a chase streak can't
  realistically go on forever. A failed roll, or a respawn, resets the
  streak. A dragon that follows arrives through the same doorway the hero
  just used (`doorwaySpot`), not a far corner.
- Dragons the hero has ever shared a room with (`d.triggered`) show their
  live current room on the overworld map from then on, including while
  chasing — untriggered (never-encountered) dragons stay hidden.
- A secret ending exists for 100% map completion.
- Level layout is editable from the admin page's Level Editor
  (`/admin/games/?game=adventure`) — same convention as Quest/
  Chickenmania; edits are stored in `localStorage` and read on load with
  a safe fallback to the built-in default map.

## Most recent pass

**Player feedback: "once a dragon follows you to a new room, 100% chance
it will keep following you to new rooms. When it follows, have it follow
you through the same doorway you came through, not appear in the
corner." and "once the dragons are triggered, show them on the world
map."** Three changes, described above: the chase-streak decay
(`CHASE_DECAY`), doorway-entry positioning for a chasing dragon
(`doorwaySpot`), and triggered-dragon map tracking (`d.triggered`). The
underlying 33% per-room roll was already independent each time — nothing
capped how many times in a row the same dragon could keep winning it, so
a bad-luck streak could feel (and statistically often was) close to
inescapable; the decay directly addresses that.

Earlier: changed the secret screen's credit text from "CREATED BY" to
"ADAPTED BY" (both `s.msg` and the render-path `ctx.fillText` calls) —
this is a reskin of the original 1979 Atari Adventure's hidden easter
egg, not an original creation, so the wording should say so.

Earlier still: dragon chase behavior added in two steps: first a 25%
chase-into-next-room chance, then a separate 33% chase-on-flee chance
plus the secret 100%-completion ending. Earlier still: moved the
explored-rooms map to sit beside the canvas instead of below it (was
pushing the controls row down awkwardly); separated the black key's
color from other pickups, castle recoloring, a rotating sword sprite,
and title cleanup.

## Open / deferred

Nothing currently open for this game.
