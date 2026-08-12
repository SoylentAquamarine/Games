# Word Search (wordsearch) — per-game handoff

Classic word search on a 12x12 grid: tap the first and last letter of a
word to claim it, words run in any of the 8 directions.

## What's here

- `index.html` — everything. `window.__ws` exposes `buildTest`, `N`, `C`
  (spread flat too) for headless testing.
- Word pool (`POOL`) is a fixed list of 20 words; each new puzzle shuffles
  the pool and places up to `C.WORD_COUNT` of them (`tryPlace`, up to 200
  random position/direction attempts per word, respecting cells already
  filled by earlier words) before filling every remaining cell with a
  random letter.
- Selection is tap-start, tap-end (not drag): `lineCells` validates the
  two taps form a straight line (horizontal, vertical, or exactly
  diagonal) and reads off the letters between them; the result is checked
  against placed words both forwards and reversed, so words can be found
  in either direction along their line.
- Already-`found` words stay highlighted (`markFound`) and are shown
  struck through in the word list.

## Most recent pass — admin config

Part of the site-wide admin config-page rollout (see root `HANDOFF.md`).
Grid size (`N`, was a hardcoded `const N=12`) and word count (was a
hardcoded `>=8` cap) pulled into a `C` object with the standard
localStorage-override IIFE (`wordsearch_config`, explicit allowlist:
`GRID_SIZE`, `WORD_COUNT`). Registered in `/admin/games/`'s
`NUMERIC_CONFIGS`. `WORD_COUNT`'s admin field is capped at 20 to match
the fixed 20-word `POOL` — the generation loop is already naturally
bounded by the pool size regardless (`for(const w of shuffled)` can't
iterate past 20), so an over-high value just can't ever place more than
20 words rather than erroring. New `wordsearch-config-test.js` (6
checks: defaults match the old hardcoded values, a localStorage
override changes both `N` and the word cap, and the override is
actually respected by `newGame()`) all pass; existing
`wordsearch-gen-test.js` unaffected. Live-verified: deployed, zero
console errors.

## Earlier pass

No player-feedback pass yet at the time this HANDOFF.md was created —
it was added as part of a documentation sweep (see the root
`HANDOFF.md`'s "Per-game HANDOFF.md rollout" note). Everything under
"What's here" reflects the game as originally built.

## Open / deferred

Nothing currently open for this game.
