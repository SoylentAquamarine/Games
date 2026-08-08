# Word Search (wordsearch) — per-game handoff

Classic word search on a 12x12 grid: tap the first and last letter of a
word to claim it, words run in any of the 8 directions.

## What's here

- `index.html` — everything. `window.__ws` exposes `buildTest`, `N` for
  headless testing.
- Word pool (`POOL`) is a fixed list of 20 words; each new puzzle shuffles
  the pool and places up to 8 of them (`tryPlace`, up to 200 random
  position/direction attempts per word, respecting cells already filled
  by earlier words) before filling every remaining cell with a random
  letter.
- Selection is tap-start, tap-end (not drag): `lineCells` validates the
  two taps form a straight line (horizontal, vertical, or exactly
  diagonal) and reads off the letters between them; the result is checked
  against placed words both forwards and reversed, so words can be found
  in either direction along their line.
- Already-`found` words stay highlighted (`markFound`) and are shown
  struck through in the word list.
- No admin config pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the game as
originally built.

## Open / deferred

Nothing currently open for this game.
