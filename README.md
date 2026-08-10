# Games

A large browser-games arcade (~50 games) with accounts, cloud save, per-game
comments, play analytics, an admin dashboard, and turn-based online multiplayer.
Deployed on **Cloudflare Workers static assets + one Worker + one KV namespace**.
No framework, no build step — every game is a single hand-written HTML file.

**Live:** https://games.square-bar-75ce.workers.dev

> **New here / continuing in a fresh session? Read [`HANDOFF.md`](HANDOFF.md) first** —
> it documents the architecture, backend API, KV keys, secrets, testing conventions,
> the full game catalog, and open next steps.

## Structure

```
public/
  index.html            Home page — categorized game grid
  styles.css            Home + shared styles
  comments.js           Per-game comments widget (on every game page) + play ping
  account.js            Account / cloud-save client
  account/  admin/  play/  play/match/   Feature pages
  games/<slug>/index.html   One file per game (cards/, board/, musicmaker/ are hubs)
src/index.js            The Worker: accounts, saves, comments, analytics, admin, multiplayer
wrangler.jsonc          Cloudflare Workers config (KV binding, secrets)
```

## Develop locally

```bash
npm install
npm run dev        # serves public/ at http://localhost:8787
```

## Deploy

```bash
npm run deploy     # wrangler deploy → games.<subdomain>.workers.dev
```

## Adding a game

Drop a folder into `public/games/<game-name>/` with its own `index.html`.
It will be served at `/games/<game-name>/`. Then link it from the landing page.

## Changelog

### 2026-08-10 — Full bug-hunt sweep, board/config rollouts completed

- **Site-wide bug-hunt pass**: every game reviewed at least once; 12 real
  bugs found and fixed, most in one recurring class — a restart
  ("New Game"/"Restart") not cancelling a still-in-flight `setTimeout`
  or `async`/`await` chain, letting stale state act on the freshly reset
  game (Simon, Snake, Whack, 4 board games, Crazy Eights, Hearts,
  Spades, Sokoban). Also fixed a genuine deadlock bug in Candy Crush
  (no reshuffle when a board runs out of legal moves).
- **Numeric-knob admin config rollout completed** — every game with a
  `const C={...}` block and independent difficulty constants now has a
  config pane at `/admin/games/`, 27 games total.
- **Board/level editor rollout** grew from 4 to 6 games (added Sokoban,
  Pac-Man); remaining candidates are purely procedural and need
  groundwork before an editor makes sense.
- **Per-game `HANDOFF.md` coverage completed** for every game, including
  the individual `cards/` sub-games that an earlier pass had missed.
- New shared libraries: `fullscreen.js` (site-wide fullscreen toggle
  with play-area scaling) and `mascots.js` grew a Space Chicken card
  theme in the shared `cards.js` engine.
- Ongoing player-comment processing across Quest, Adventure, and others
  — see each game's own `HANDOFF.md` for specifics.

### 2026-07-12 — More multiplayer + Atari-style Adventure

- **Online Checkers** added to multiplayer (`MP_GAMES`): 8×8 American draughts with
  mandatory capture, multi-jump chaining, kinging, and loss-on-no-legal-move, plus a
  two-click match-page renderer.
- **Online "Wild Cards"** (UNO-style, heads-up): full 108-card deck, action cards, draw
  pile reshuffle. First **hidden-information** online game — engines can now expose a
  `redact(state, sym)` hook (applied by `mpView()` in both match handlers) so each client
  only sees its own hand plus opponent/deck counts; authoritative state stays in KV.
- **Adventure** (`/games/adventure/`) — single-player Atari-2600-style clone: connected
  rooms/maze, three roaming dragons, sword/bridge/black-key/chalice items (one carried at a
  time), Gold + Black castles, and the Chalice quest.
- **Adventure real-time co-op** — challenge a friend to "Adventure (Co-op)" from the lobby
  to share one live maze (`/play/adv/`). First **Durable Object** in the project: an
  `AdventureRoom` DO holds the authoritative shared world and streams snapshots to both
  players over **WebSockets**; the client interpolates and shows your partner only when
  you're in the same room. Server-authoritative sim is headless-tested (28 cases) and the
  live WS flow verified end-to-end.

### 2026-07-11 — Big build-out (arcade + backend + multiplayer)

- **~50 games** across Arcade, Puzzle, Strategy, Word, Cards, Board, and Create
  categories — each self-contained, logic-tested headlessly before deploy.
- **Card engine** (`cards.js`) backing War, Crazy Eights, Hearts, Spades,
  Klondike, Blackjack; **Board hub** (Candy Land, Trouble, Sorry-style);
  **Music Maker** (Beat/Melody/Band on a shared Web Audio engine); Sprite Generator.
- **Accounts** (username/password, PBKDF2) + **cloud save** (whole-profile
  backup/restore). Removed the earlier Google Sign-In.
- **Per-game comments** widget on every page (feedback loop) + **play analytics**.
- **Admin dashboard** (`/admin`, token-gated): user count, plays/day, all comments.
- **Online multiplayer** (`/play`): waiting room, challenges, server-authoritative
  matches — Tic-Tac-Toe, Connect Four, Gomoku, Reversi, Ultimate T-T-T, Dots & Boxes.
- Home page reorganized into categories with per-card descriptions.
- Added `HANDOFF.md` for session continuity.

### 2026-07-04 — Project bootstrap

- Created Games platform scaffold on Cloudflare Workers static assets
- Landing page with "Live Development" status banner and placeholder game slots
- Wired up GitHub repo and Cloudflare deployment
