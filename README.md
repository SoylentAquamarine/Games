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
