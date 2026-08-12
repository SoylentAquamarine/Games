# Tower of Hanoi (hanoi) — per-game handoff

Classic Tower of Hanoi: move a stack of disks from the left peg to the
right peg, one at a time, never placing a larger disk on a smaller one.

## What's here

- `index.html` — everything. No `window.__` export — this game doesn't
  expose a pure sim for headless testing (grepped the file to confirm).
- Selectable disk count from 3 to 7 (`#size` buttons), each restarting
  with a freshly filled left peg and an updated "best possible" move
  count (`2^N - 1`) shown alongside the live move counter.
- Interaction is tap-to-select-a-peg, then tap-a-destination-peg (`sel`
  state) rather than drag-and-drop; picking an illegal destination (top
  disk larger than the one being moved) just re-selects that peg instead
  of showing an error.
- On solve, the status message distinguishes a perfect run (moves equal
  to the theoretical minimum) from a merely successful one.
- No admin config pane wired up for this game.

## Most recent pass — heavier code comments

Part of a site-wide comment-density pass (once the comment queue and
the admin config-page rollout both ran dry — see root `HANDOFF.md`).
Added the 2^N-1 minimum-moves fact to `reset()`, and cleaned up/
expanded `click()`'s existing but uncertain-sounding inline comment
("switch selection to a peg with a smaller top? just reselect") into a
clear explanation of the tap-to-select/tap-to-move/redirect-selection
interaction model. Comment-only — no logic touched. Live-verified:
deployed, zero console errors.

## Earlier pass

No player-feedback pass yet at the time this HANDOFF.md was created —
it was added as part of a documentation sweep (see the root
`HANDOFF.md`'s "Per-game HANDOFF.md rollout" note). Everything under
"What's here" reflects the game as originally built.

## Open / deferred

Nothing currently open for this game.
