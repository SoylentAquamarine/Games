# Docs

This folder is the public entry point into how the project is documented.
It doesn't duplicate anything — it just links to where the real docs live.

- **[`/HANDOFF.md`](../HANDOFF.md)** — whole-project handoff: infra, deploy,
  backend API, frontend structure, testing convention. Read this first if
  you're new to the repo.
- **[`/README.md`](../README.md)** — quick overview + changelog.
- **[`/public/games/INDEX.md`](../public/games/INDEX.md)** — the full game
  catalog as a table (slug, name, category), kept in sync with what's
  actually deployed. The admin Game Admin page (`/admin/games/`) reads this
  file to build its list of games.

## Per-game HANDOFF.md

Any game that's had non-trivial work done on it gets its own
`public/games/<slug>/HANDOFF.md` — a short, living note for whoever (human
or AI) touches that game next:

- What the game currently does, in a sentence or two.
- Anything non-obvious about how it's built (shared patterns, gotchas,
  deliberate deviations from the site-wide conventions in the root
  HANDOFF.md).
- What was changed on the most recent pass, and why.
- What's still open / deferred, so the next pass doesn't have to
  rediscover it from a comment thread.

Every game in `public/games/` (102 as of this writing, including the
`cards/`/`board/` sub-games) now has one — see the root HANDOFF.md's
"Per-game HANDOFF.md rollout" note. If a new game folder ever appears
without one, add it the next time you touch that game; its `index.html`
is the source of truth in the meantime.

## Code comments

Game logic favors comments that explain *why*, not *what* — see the root
HANDOFF.md's testing/conventions sections for the reasoning behind
non-obvious mechanics (e.g. boss hit-pause + knockback in Quest, round
cadence math in Lander). Obvious code (a `draw()` function that draws, a
`reset()` that resets) is left uncommented on purpose — the "heavily
comment" ask from player feedback is being interpreted as *comment the
non-obvious parts thoroughly*, not narrate every line.
