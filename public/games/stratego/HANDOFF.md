# War of the Ring (stratego) — per-game handoff

A Lord of the Rings-themed Stratego clone (titled "War of the Ring" in
the UI): deploy a hidden 10x10 army of ranked units, then capture the
enemy Stronghold or immobilize them entirely.

## What's here

- `index.html` — everything. No `window.__` export — this game doesn't
  expose a pure sim for headless testing (grepped the file to confirm).
- Two phases: `"setup"` (tap two of your own units to swap their
  starting positions before battle, or 🎲 Re-deploy to fully re-shuffle
  your side) and `"play"`. Units are LOTR-flavored ranks 1-10 (`NAMES`,
  `GLYPH`) — e.g. 10=Aragorn (👑, highest), 1=Frodo (💍, lowest), plus
  special pieces `B` (Troll Ambush / bomb) and `F` (Stronghold / flag).
- Combat rules (`combat`) are standard Stratego with named exceptions:
  higher rank wins, equal ranks mutually destroy, only the Dwarf Sapper
  (rank 3) can safely clear a Troll Ambush bomb (anyone else dies
  attacking one), and Frodo (1) uniquely defeats Aragorn (10) *only* when
  attacking. The `F` Stronghold always loses when attacked (capturing it
  wins instantly) and never moves.
- The Ranger (rank 2) is the only unit that moves multiple squares in a
  straight line (a "Scout"), stopping at the first piece encountered;
  every other movable unit moves exactly one square orthogonally. A
  2x2-cell "lake" sits in each half of the board and blocks movement.
- Enemy (Mordor) units stay hidden (👁️) until they're revealed by
  combat or by the AI's own move logic marking them `known`; the human's
  own units are always visible to the human.
- CPU (`aiMove`/`scoreMove`) picks the highest-scoring move among all
  legal moves, weighing known-defender combat outcomes heavily, treating
  unknown-defender attacks as cheap for weak units/scouts and risky for
  strong ones, and nudging movement toward the human's side when no
  attack is available.
- No admin config pane wired up for this game.

## Most recent pass — heavier code comments

Part of a site-wide comment-density pass (once the comment queue and
the admin config-page rollout both ran dry — see root `HANDOFF.md`).
The file's overall comment ratio reads low mostly because it's long
(362 lines, much of it DOM/rendering code) — the actual game-logic
core was already reasonably explained (`combat()`'s special cases,
`scoreMove()`'s CPU heuristic), with one genuine gap: `legalTargets()`
never explained the Scout's (rank 2) unlimited-slide movement versus
every other piece's single-step move. Added that. Comment-only — no
logic touched; existing `stratego-smoke-test.js` (15 randomized games,
no crashes) still passes unchanged. Live-verified: deployed, zero
console errors.

## Earlier pass

No player-feedback pass yet at the time this HANDOFF.md was created —
it was added as part of a documentation sweep (see the root
`HANDOFF.md`'s "Per-game HANDOFF.md rollout" note). Everything under
"What's here" reflects the game as originally built.

## Open / deferred

Nothing currently open for this game.
