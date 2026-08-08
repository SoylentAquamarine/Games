# Games — Session Handoff

Living reference for continuing this project in a fresh chat. Read this first.

**Live site:** https://games.square-bar-75ce.workers.dev
**Repo:** github.com/SoylentAquamarine/Games (branch `main`) — **public**
**Local:** `C:\git\Games`

---

## 1. What this is

A large arcade of ~50 self-contained browser games plus a lightweight backend
(accounts, cloud save, per-game comments, play analytics, an admin dashboard,
and turn-based online multiplayer) — all on **Cloudflare Workers static assets +
one Worker + one KV namespace**. No framework, no build step. Every game is a
single hand-written HTML file with inline CSS/JS.

## 2. Deploy / infra

- **Deploy:** `npx wrangler deploy` from `C:\git\Games` (publishes `public/` + the Worker).
- **Cloudflare account:** `info@vtxconsulting.net` (wrangler is already logged in).
- **Worker name:** `games`. **Config:** `wrangler.jsonc`.
- **KV namespace binding `ACCOUNTS`**, id `e6faf92ca1ae442baa47195b70e4266d`.
  Set a key manually: `npx wrangler kv key put "<key>" '<val>' --namespace-id=e6faf92ca1ae442baa47195b70e4266d --remote`
- **Worker secrets** (set via `wrangler secret put`):
  - `SESSION_SECRET` — HMAC key for signed session cookies.
  - `ADMIN_TOKEN` — admin dashboard password. Not recorded here (this repo is public) — check
    the Cloudflare dashboard's Worker secrets, or the AI assistant's private memory/notes for
    the current value. If it's ever exposed in a commit, rotate immediately with
    `wrangler secret put ADMIN_TOKEN` — no code change needed, it's read from `env.ADMIN_TOKEN`.
- **Google Sign-In was removed** — do not re-add. Accounts are username/password only.

### Deploy gotchas (seen repeatedly)
- **Subfolder propagation lag:** brand-new `/games/<slug>/` paths often return **404 for 5–20s** after deploy, then settle to 200. Not a bug — re-check after a short wait.
- Git prints `LF will be replaced by CRLF` warnings on Windows — harmless.

## 3. Backend (all in `src/index.js`, ~single file)

Everything else falls through to static assets. API routes:

**Accounts / saves** (KV keys `u:<name>`, `s:<accountId>:<ns>`)
- `POST /api/account/register` `{username,password}` → PBKDF2-SHA256 (100k iters, per-user salt), sets session cookie.
- `POST /api/account/login`, `GET /api/me`, `POST /api/logout`.
- `GET/PUT /api/saves?ns=<name>` — per-user JSON blob (auth required).

**Comments** (KV `comments:<slug>`, newest-first, capped 200)
- `GET/POST /api/comments?game=<slug>` — public; text escaped on render.

**Play analytics** (KV `stats` = `{total, games:{}, days:{}}`)
- `POST /api/play?game=<slug>` — increments counters. Pinged automatically by `comments.js` on every game page load.

**Admin** (token-gated via `Authorization: Bearer <ADMIN_TOKEN>`)
- `GET /api/admin/data` → `{users, stats, totalComments, games:[...]}`.

**Multiplayer** (KV `presence:<name>` [60s TTL], `challenge:<id>`, `match:<id>`, `usermatch:<name>`)
- `POST /api/mp/ping` — heartbeat (call every ~4s while in lobby).
- `GET /api/mp/lobby` → online players, incoming challenges, my active match, `games` map.
- `POST /api/mp/challenge` `{to,game}`, `POST /api/mp/respond` `{id,accept}`.
- `GET /api/mp/match?id=`, `POST /api/mp/move` `{id,move}` — **server-authoritative**, validates turn + legality, detects wins.

### Multiplayer engine (`MP_GAMES` in `src/index.js`)
Each game engine implements:
```
init()               -> state (any JSON)
move(state, pl, mv)  -> { state, next } | null   // next = "X"|"O" who plays next
result(state)        -> { winner } | { draw } | null
```
`move` returning `next` lets games express **extra turns** (Dots & Boxes: same
player after claiming a box; Checkers: same player mid multi-jump; Wild Cards:
same player after a Skip/Reverse/Draw-Two/Wild-Draw-Four in heads-up) and
**skips** (Reversi: passes back if opponent has no move). Players are always
symbols `"X"` (challenger) and `"O"`.
**Live online games:** `ttt`, `c4`, `gomoku`, `reversi`, `uttt`, `dots`,
`checkers`, `wild` (UNO-style "Wild Cards").
The lobby challenge dropdown auto-lists whatever's in `MP_GAMES`; the match page
(`public/play/match/index.html`) has a renderer per game key.

**Hidden-information games** (first one: `wild`): an engine may add an optional
`redact(state, sym) -> safeState` method. `mpView()` in `src/index.js` applies it
in **both** `handleMpMatch` and `handleMpMove` so each client only ever receives
its own hand + opponent/deck *counts* — the full `state` (all hands, deck order)
stays server-side in KV and is what `move`/`result` operate on. Any future
hidden-info game (Battleship placement, etc.) should follow this pattern.

**To add an online game:** add an engine to `MP_GAMES` + a renderer in the match
page keyed by the same slug (+ a `redact` hook if it has hidden state). Battleship
(needs a hidden placement phase) is the natural next port.

## 4. Frontend structure

```
public/
  index.html            Home page — categorized game grid + feedback callout
  styles.css            Home + shared bits
  comments.js           Self-injecting per-game comments widget (added to ALL game pages) + play ping
  account.js            Account/cloud-save client helper
  account/index.html    Register / login / profile / cloud backup+restore
  admin/index.html      Owner dashboard (token login)
  admin/comments/index.html Comment moderation across all games
  admin/games/index.html    Per-game config: pick a game, moderate its comments,
                             edit its Configuration pane. Board/level editors
                             (quest, chickenmania, adventure, minigolf) vs. plain
                             numeric-knob panes (kaboom) vs. the generic raw-JSON
                             fallback for everything else not yet wired up — see
                             "Per-game HANDOFF.md rollout" below for where that
                             stands.
  play/index.html       Multiplayer lobby / waiting room
  play/match/index.html Online match renderer (all 6 games)
  games/<slug>/index.html   One file per game
  games/cards/          cards.js engine + war, crazy8, hearts, spades, klondike, index (hub)
  games/board/          candyland, trouble, sorry, chickenopoly, gameofchicken
                             (5 independent sub-games, no top-level hub page —
                             each has its own URL under games/board/<slug>/)
  games/musicmaker/     engine.js + studio.js + beat, melody, band, index (hub)
```

### Shared client libraries (drop-in, self-inject their own styles)
- **`comments.js`** — on every game page (injected via a Node patch script, see below). Renders the comment box, pings `/api/play`, and **stops keydown/keyup/keypress from its inputs propagating to game key handlers** (fixes WASD-in-textarea).
- **`games/cards/cards.js`** — `window.Cards`: deck model, shuffle/deal, CSS card-face renderer. Used by war/crazy8/hearts/spades/klondike/blackjack.
- **`games/musicmaker/engine.js`** — `window.MME`: Web Audio (instruments + 14-piece drum kit + transport). `studio.js` = shared multi-bar arranger for melody & band.
- **`mascots.js`** — `window.Mascots.spacesuitChicken(ctx,x,y,r,facing)` (basic) and `window.Mascots.spacesuitChickenFlying(ctx,x,y,r,facing)` (jetpack + life-support-pack variant, for shootable flybys): the site-wide decorative spacesuit-chicken cameo (bonus catches, flybys). Started as a per-game copy-pasted sprite — already drifting (missing details in some copies) before this library existed. Now used by duckhunt, lander, kaboom, dk, chickenmania, boulderdash, centipede, missilecommand, qbert, and drmario's bonus round (10 games total). Also `window.Mascots.rooster(ctx,x,y,w,h,facing,step,hit)` — "Rooster Reg," extracted from duckhunt's own "friend, don't shoot him" character (the exact one the original comment named), now available for other games to reuse with that same framing. Also `window.Mascots.heroChicken(ctx,x,y,size,dir)` — extracted from quest's existing player avatar, this site's most developed protagonist design; `dir` is 0=up/1=down/2=left/3=right. **All 3 "standard characters" the original comment named (mascot/spacesuit chicken, rooster, Hero chicken) are now shared library functions.** Tests that boot a migrated game's page through a mocked DOM need a matching `Mascots` stub in their sandbox (e.g. `Mascots: { heroChicken(){} }`) — this bit every quest test that reaches `render()` when heroChicken was added; fixed in the scratchpad test files, but worth remembering for any NEW quest test. **The original mascot-library comment is fully resolved and archived**: drmario's "Dr Chicken" side-panel portrait was redesigned as a surgical-mask doctor (own body, teal mask + ear-loop strap, white coat kept, head-mirror band) rather than migrated to the spacesuit variants, per the player's explicit ask that she look different — see drmario's HANDOFF.md. **Still open (not from that comment, just noted while touching this area):** moonpatrol's cameo is a simpler sprite that doesn't match either spacesuit-chicken variant closely enough to swap in silently (needs a design call — upgrade it to match, or add a "mini" variant).

### Patch script to add comments.js to every game (idempotent)
```js
// run from C:\git\Games with: node -e '<this>'
const fs=require("fs"),path=require("path");
function walk(d){let o=[];for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())o=o.concat(walk(p));else if(e.name==="index.html")o.push(p);}return o;}
for(const f of walk("public/games")){let h=fs.readFileSync(f,"utf8");if(h.includes("/comments.js"))continue;const i=h.lastIndexOf("</body>");if(i<0)continue;fs.writeFileSync(f,h.slice(0,i)+'  <script src="/comments.js" defer></script>\n'+h.slice(i));}
```
Run this after adding any new game so it gets a comments section + play tracking.

### Conventions every game follows
- Dark theme, palette vars `--bg/#0f1020, --panel/#1e2140, --accent/#7c5cff, --accent-2/#22d3ee`, radial-gradient bg.
- `← Home` link top-left, gradient `<h1>` title, `New Game` button.
- **Keyboard AND touch** controls (arrows/WASD + on-screen d-pad or swipe).
- localStorage for per-game best scores / saves (keys like `snake_best`, `mm_beats`).
- Most games expose a `window.__<name> = {...pure fns...}` for headless testing.

## 5. Testing convention (do this before every deploy)

Games are validated by **headless Node** before shipping — extract the inline
`<script>`, stub DOM/AudioContext/localStorage, and exercise the pure logic
(win detection, generation solvability, conservation, AI takes-win/blocks, etc.).
Pattern: `fs.readFileSync(...).match(/<script>([\s\S]*?)<\/script>/)[1]` grabs the
first (attribute-less) inline script; the `comments.js` include has attributes so
it's ignored. Multiplayer engines are unit-tested by slicing `MP_GAMES` out of
`src/index.js` and exposing via `globalThis`.

**Recurring self-inflicted trap:** several "test failures" during this project
were *mistyped expected values in the test*, not code bugs (e.g. 8 and 5 ARE
consecutive Fibonacci numbers). Re-derive expectations by hand before assuming a
bug.

## 6. Game catalog (home page categories)

- **Arcade & Action:** Snake, Pac-Man, Space Invaders, Asteroids, Breakout, Frogger, Flappy, Doodle Jump, Stack, Pong, Tron, Whack-a-Mole, Quest (Zelda-style), Adventure (Atari-2600-style: rooms/dragons/keys/castles/chalice), Bubble Shooter
- **Puzzle & Merge:** 2048, Threes, Fibonacci, Drop Merge, 15 Puzzle, Tetris, Candy Match, Minesweeper, Sudoku, Lights Out, Flood It, Memory Match, Tower of Hanoi, Sokoban, Nonogram, Maze
- **Strategy & Classics:** Tic-Tac-Toe, Ultimate T-T-T, Connect Four, Gomoku, Reversi, Checkers, Dots & Boxes, Battleship, War of the Ring (Stratego/LOTR), Mastermind, Simon, Mancala
- **Word:** Word Guess (Wordle-like), Hangman, Word Search
- **Cards & Dice:** Card Games hub (War, Crazy Eights, Hearts, Spades, Klondike), Blackjack, Yahtzee
- **Collections & Create:** Board Games hub (Candy Land, Trouble, Sorry-style), Music Maker (Beat/Melody/Band), Sprite Generator

Card cards on the home page show a small gameplay description; trademarked
titles are described by gameplay rather than named (deliberate framing).

## 7. Open items / suggested next steps

- **More online multiplayer games:** Checkers (multi-jump), Battleship (hidden placement phase), Mancala, Gomoku variants. Add engine to `MP_GAMES` + match-page renderer.
- **Real-time PvP** (Pong/Tron head-to-head) could reuse the Durable-Object + WebSocket
  transport built for Adventure co-op (below).

### Adventure real-time co-op (BUILT — first Durable Object in the project)

Separate transport from the turn-based `MP_GAMES` (KV+polling) — real-time needs push.

- **DO:** `AdventureRoom` in `src/adventure-coop.js` (re-exported from `src/index.js`).
  One instance per match (`env.ADVENTURE.idFromName(matchId)`). Holds the authoritative
  **shared** co-op world in memory (both heroes, shared objects/dragons/gates), ticks it
  via a re-arming `storage.setAlarm` loop (`TICK_MS=80` ≈ 12.5 fps) and broadcasts a
  snapshot to both players each tick over standard (non-hibernation) WebSockets — active
  sockets keep the DO resident so the in-memory world survives between alarms. Loop stops
  when no sockets remain or the game is won. (Note: if BOTH players disconnect mid-match
  the DO can be evicted and the world resets — acceptable for v1; persist to make durable.)
- **Sim:** `newWorld/addPlayer/setInput/coopTick/coopDrop/snapshot` — pure, headless-tested
  (28 cases). Room map + movement/collision **mirror** the single-player sim in
  `public/games/adventure/index.html` (kept in sync by hand; two copies, no build step).
- **Wire:** client → `{type:"input",dir}` / `{type:"drop"}`; server → `welcome`
  (`slot`, full `rooms` map, `consts`) once, then `state` snapshots (`players{X,O}`,
  `objects`, `dragons`, `gates`, `won`). Server is authoritative for everything.
- **Route:** `GET /api/adv/ws?id=<matchId>` (`handleAdvWs`) authenticates via session
  cookie, resolves the caller's slot from the `match:` record, and forwards the WS upgrade
  to the DO with `?slot=&name=`.
- **Lobby flow:** `advcoop` is injected into the lobby games map + allowed in
  `handleMpChallenge`; `handleMpRespond` creates a stateless `match:{game:"advcoop"}`
  record (the DO holds real state) and both `/play/index.html` redirects branch to
  `/play/adv/?id=` when `game==="advcoop"` (via `myMatchGame` / respond's `game` field).
- **Client:** `public/play/adv/index.html` — connects, renders at 60fps with **snapshot
  interpolation** (renders ~160ms in the past, lerps positions, snaps on room change; no
  client prediction yet — future polish for tighter local feel). Renders the partner hero
  **only when `partner.room === myRoom`** (the "same screen / different screen" rule);
  the server always sends both.
- **Config:** `wrangler.jsonc` has `durable_objects` binding `ADVENTURE` → `AdventureRoom`
  and migration `v1` (`new_sqlite_classes`, free-plan compatible).
- **Single-player still queued:** Air Hockey, Go Fish (Go Fish can reuse `cards.js`).
- **Admin test data:** the user count / play stats include a handful of `alice_*`, `bob_*`, `tester_*`, `chk_*` accounts created during API testing. Consider a "clear test data" admin action (delete `u:<test>`, reset `stats`).
- **KV write contention:** play counters + presence use read-modify-write on KV — fine at low traffic, undercounts under heavy concurrency. Fine for now.
- **Per-game HANDOFF.md rollout — done.** Every game folder under `public/games/` now has a `HANDOFF.md` (convention: `public/games/<slug>/HANDOFF.md` — see `docs/README.md`). Keep it current: when you finish a pass on a game, update its HANDOFF.md before moving on. Note: `board/` has no top-level game of its own — its `HANDOFF.md` covers the 5 sub-games (`candyland`, `chickenopoly`, `gameofchicken`, `sorry`, `trouble`) as a set.
- **Per-game admin config rollout in progress:** `admin/games/index.html`'s Configuration pane falls back to a raw-JSON textarea games don't actually read yet, for any game without a dedicated pane wired into `CFG_PANES`/`showConfig()`. Two patterns exist so far: board/level editors (quest, chickenmania, adventure, minigolf — visual grid/canvas editing) and a generic, data-driven numeric-knob table (`NUMERIC_CONFIGS` in `admin/games/index.html` — a handful of number inputs merged into each game's `C` object via an explicit allowlist at boot; add a game with one table entry + a matching allowlist snippet in that game's own file, no new admin HTML/JS). 23 games use the numeric-knob pattern so far: kaboom, centipede, boulderdash, qbert, duckhunt, missilecommand, galaga, digdug, bomberman, lander, moonpatrol, dino, joust, pinball, chixxon, chickencircus, colorswitch, pianotiles, timberman, fruitninja, helixjump, knifehit, chickenposition — see kaboom's HANDOFF.md for the full explanation. It's much cheaper to add than a board editor and fits most games (anything with tunable difficulty constants in its `C` export) — prefer it unless the game genuinely has an editable board/level shape. Rolling out a game or two at a time, same cadence as HANDOFF.md docs. Remaining candidates with a `const C={...}` block: `chicken1` (has a rich per-race config already, similar to chickenposition — would need the same care picking only independent knobs), `crossyroad` (its difficulty constants — lane speed/spawn density — are inline `Math.random()` calls, not in `C`, so nothing to wire up without refactoring first), `drmario` (`C` only has `rows`/`cols`/`colors` — all board-shape, not real difficulty knobs), `pool` (`FRICTION`/`MAX_POWER`/`CUSHION` could work, but table dimensions live in a separate `TABLES` map per mode, worth checking how config would interact with mode-switching before wiring it up). None of these are cheap "just add a table entry" wins like the ones already done — treat them as their own small design decisions, not a mechanical batch. Many other games (snake, pacman, invaders, asteroids, breakout, frogger, flappy, doodlejump, pong, tron, whack, bubbleshooter, and most puzzle/card/board titles) predate the `C`-object convention and use plain local variables instead — adding config to those would mean refactoring the game's internals first, a bigger job than the "one table entry + one allowlist snippet" cost that makes this rollout cheap elsewhere; don't do that opportunistically, only as its own deliberate pass.
- **4 new text-based games requested** (player feedback on the home page): "2 pure text and 2 half text half graphics on the screen like oregon trail." All 4 shipped: `huntfox` (Hunt the Wumpus clone, randomly-generated cave), `eggheist` (hand-authored choice-driven mystery, fixed map), `chickentrail` (Oregon Trail-style survival journey, text stat panel + canvas trail strip), `chickencaravan` (Oregon Trail-style trading route between towns — deliberately economy-focused rather than survival-focused, so the two don't play the same) — see their own HANDOFF.md files. Comment already archived.
- **"Make the github page public and link to it from the main page"** (home page feedback) — already satisfied: the `SoylentAquamarine/Games` repo is public, and the footer of `public/index.html` has had a "💻 Source on GitHub" link since before this pass. The rest of that same comment ("heavily comment the code and maintain the index.md files... /docs folder and HANDOFF.MD files in each of the games") is the standing, continuous documentation directive already tracked by this section and `docs/README.md` — not archived, since it has no clean "done" state.
- **Two more open home-page asks, not yet started:** (1) "we need tempest, and the touch pad to draw in a circle should be the controller, so I guess just mouse based" — a new game (Tempest doesn't exist in `public/games/` yet), with a mouse/circular-drag control scheme instead of the original spinner knob. (2) "look at the top 20 video games of each year and make the 1978-1988 games, decide on a realistic list and do them" — an open-ended request to build roughly a decade's worth of new games; too large to attempt as a single pass. Both need a scoping decision (which arcade classics, how many, in what order) before starting — flag for the user rather than guessing at a ~20-title backlog unprompted.

## 8. Working style that fit this project

- Build one game per file; deploy + verify (curl the URL) + commit as a checkpoint. Don't batch huge multi-file changes without checkpoints — the write/exec service had intermittent short outages.
- Commit messages end with the Co-Authored-By trailer.
- The user asks for games in batches ("more games") and periodically for features (comments, admin, multiplayer, categories). They value: things that actually work (tested), honest reporting of what's verified vs. assumed, and momentum over discussion.
