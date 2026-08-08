# Music Maker (musicmaker) — per-game handoff

Not a game — this is the hub landing page for the site's 3 music-creation
studios, each a separate sub-app under `musicmaker/`.

## What's here

- `index.html` — a simple landing page linking to the 3 studios, all
  marked "Ready": Beat Maker (`beat/`, 14-piece drum kit), Music Maker
  (`melody/`, 8-voice player-piano roll), and Band Composer (`band/`,
  concert-band instruments with 1st-5th chair parts). No `window.__`
  export and no gameplay of its own — it's pure navigation.
- The actual audio engine lives outside this file: `engine.js`
  (`window.MME`, Web Audio instruments + drum kit + transport, shared by
  all 3 studios) and `studio.js` (shared multi-bar arranger used by
  melody and band). This HANDOFF.md covers only the hub page itself —
  the 3 sub-studios are separate apps under `beat/`, `melody/`, and
  `band/` and aren't part of this documentation pass.
- No admin config pane wired up for this page.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the page as
originally built.

## Open / deferred

Nothing currently open for this page. (The 3 sub-studios under `beat/`,
`melody/`, and `band/` are out of scope for this hub-page HANDOFF.md and
were not reviewed here.)
