# Repository Index — Chicken Arcade

A chicken-themed browser-games arcade (107 games), deployed on **Cloudflare Workers**. Live at **https://games.square-bar-75ce.workers.dev**. This file is a map of the repo for quick navigation (e.g. by an AI reading the GitHub).

## Stack

- **Static assets** in [`public/`](public/) served by the Worker's `ASSETS` binding.
- **Worker** [`src/index.js`](src/index.js) — routes, the comments API (`/api/...`), KV (`ACCOUNTS`) and Durable Objects for multiplayer/shared state.
- Config: [`wrangler.jsonc`](wrangler.jsonc) (`main: src/index.js`, `assets` binding, KV, Durable Objects). Deploy with `npx wrangler deploy`.

## Top-level layout

| Path | What it is |
|---|---|
| [`public/index.html`](public/index.html) | Home page — the grid of game cards (name + one-line description per game). Source of truth for what's "live". |
| [`public/games/`](public/games/) | **The games.** One self-contained `<slug>/index.html` each. See [`public/games/INDEX.md`](public/games/INDEX.md) for the full list. |
| [`public/games/INDEX.md`](public/games/INDEX.md) | **Full games listing** — slug → name → description table (107 games). |
| [`public/arcade.js`](public/arcade.js) | Shared game engine: `Arcade.SCREEN` (4:3 screen tiers), `Arcade.sfx`, `Arcade.splash` (wave/death cards), `Arcade.startGate` (spacebar start), `Arcade.stats` (per-game play tracking). |
| [`public/comments.js`](public/comments.js) | The per-page comment box (players leave feedback; the maintainer implements it). |
| [`public/games/cards/cards.js`](public/games/cards/cards.js) | Shared card-deck library (`window.Cards`): deck model, shuffle/deal, CSS card renderer, and a 6-theme deck selector (`Cards.THEMES`/`getTheme`/`setTheme`) used by every card game. |
| [`public/mascots.js`](public/mascots.js) | Shared chicken-character library (`window.Mascots`): spacesuit chicken, rooster, hero chicken — reusable sprites drawn by multiple games instead of each rolling its own. |
| [`public/fullscreen.js`](public/fullscreen.js) | Self-injecting fullscreen toggle, on every game page — adds a corner button and scales the play area up to fill the screen while fullscreen is active. |
| [`public/editor/`](public/editor/) | **Level Editor** (admin) — design tools for Quest dungeons, Chickenmania waves, and the Adventure map. Saves to localStorage; games load the override on next open. |
| [`public/admin/`](public/admin/) | Admin pages (comment moderation, etc.). |
| [`public/account/`](public/account/), [`public/account.js`](public/account.js) | Player accounts (KV-backed). |
| [`public/play/`](public/play/) | Shared play/landing surface. |
| [`public/startgate.js`](public/startgate.js) | DOM-overlay "press space to begin" gate. |
| [`public/styles.css`](public/styles.css) | Shared site styles. |
| [`src/index.js`](src/index.js) | Cloudflare Worker: static-asset serving + the comments/admin API + KV + Durable Objects. |
| [`src/adventure-coop.js`](src/adventure-coop.js) | Durable Object for Adventure co-op / shared state. |
| [`README.md`](README.md) | Project readme + changelog. |
| [`HANDOFF.md`](HANDOFF.md) | Working notes / handoff. |

## Conventions

- Each game is **one HTML file** with inline CSS + JS. No build step per game.
- Pure game logic is exposed on **`window.__<name>`** (e.g. `window.__quest`, `window.__chickenmania`) so it can be unit-tested headlessly in Node via `vm` with DOM stubs.
- The comments API (admin): `GET /api/admin/comments`, `POST /api/admin/comments {game, ts, action}` (approve/archive/delete), `GET /api/admin/comments/archive`. Public read: `GET /api/comments?game=<slug>`.
- Games standardize on a **4:3** screen via `Arcade.SCREEN` / `Arcade.fitScreen`.

## Notable games / systems

- **Quest** (`public/games/quest/`) — a Zelda-like being expanded into a full game: an explorable **farmyard overworld** with 12 semi-hidden dungeon entrances, 12 themed bosses, and a **12-egg carton** goal (final Fox King boss gated at 12/12).
- **Card games** (`public/games/cards/*`, `public/games/carddeck/`) — Klondike, FreeCell, Pyramid, Go Fish, Hearts, Spades, War, Crazy Eights, Video Poker — all share `cards.js`.
- **Board games** (`public/games/board/*`) and arcade clones (Asteroids→ChickenRoids, Pole Position→Chicken Position, F1→Chicken1, Mahjong→Chicken Jhong, etc.).
