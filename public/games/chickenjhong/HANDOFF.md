# Chickenjhong (chickenjhong) — per-game handoff

Mahjong solitaire with chicken-themed tiles: clear pairs of free tiles
until the board is empty.

## What's here

- `index.html` — everything. `window.__chickenjhong` exposes the pure sim
  (`FACES`, `BOARDS`, `isFree`, `freeTiles`, `newBoard`, `dealSolvable`,
  `pairsLeft`, `won`, `anyMoves`, `reshuffle`, `indexBoard`).
- `BOARDS` is an array of layouts — board 1 is solvable-by-construction
  (dealt by pairing tiles from a guaranteed-clearable order, not pure
  random shuffle, so every deal is actually beatable). A board selector
  picks between the available layouts.
- Includes a tile-review page for previewing the tile art.

## Most recent pass

Added a diamond/twin/ring board layout set (4 boards total), on the way
to a stated goal of 20. Original pass: the game itself — mahjong solitaire
with chicken tiles, solvable-by-construction board 1, the tile-review
page, and the boards array built to be extended.

## Open / deferred

- **More board layouts** — 4 of a stated 20-board goal exist so far.
