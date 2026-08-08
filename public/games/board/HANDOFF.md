# Board Games hub (board) — per-game handoff

The `board/` folder is a container for standalone board-game reskins —
there is no `board/index.html` of its own (unlike the `musicmaker/` hub,
which has a landing page). Players reach each sub-game directly via its
own URL, and each is listed as its own entry in `public/games/INDEX.md`.

## What's here

- No `index.html` at this level — only sub-folders, each a fully
  independent game:
  - `board/candyland/index.html` — "Chickenland," a Candy Land-style race
    to the barn.
  - `board/chickenopoly/index.html` — "Chickenopoly," a Monopoly clone.
    Already has its own `HANDOFF.md` (see
    `public/games/board/chickenopoly/HANDOFF.md`) with a much fuller
    per-game history.
  - `board/gameofchicken/index.html` — "The Game of Chicken," a Game of
    Life-style clone (spin, retire, biggest nest egg wins).
  - `board/sorry/index.html` — a Sorry!-style card-draw race game.
  - `board/trouble/index.html` — a Trouble-style Pop-o-Matic race game.
- The root `HANDOFF.md`'s frontend-structure listing describes
  `games/board/` as "candyland, trouble, sorry, index (hub)" — that
  `index (hub)` reference is stale; no such file exists in this folder
  today. `gameofchicken` and `chickenopoly` aren't mentioned there either.
  This HANDOFF.md reflects the actual current folder contents, not that
  older description.
- No admin config pane wired up at the `board` level (each sub-game would
  need its own, if any).

## Most recent pass

No player-feedback pass yet at the hub level — this HANDOFF.md was
created as part of a documentation sweep (see the root HANDOFF.md's
"Per-game HANDOFF.md rollout" note). Individual sub-games (notably
`chickenopoly`) have had their own passes — see their own HANDOFF.md
files.

## Open / deferred

`board/chickenopoly` has a live, explicitly deferred player request for
4-player human multiplayer across 4 computers (real-time networking) —
see the "Open / deferred" section of
`public/games/board/chickenopoly/HANDOFF.md` for the full note. Not
addressed here; flagging its existence only.
