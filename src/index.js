// Games Worker — static assets + username/password accounts & cloud saves.
//
// Routes:
//   POST /api/account/register { username, password } -> create account + session
//   POST /api/account/login    { username, password } -> log in + session
//   GET  /api/me                                       -> current user from session
//   POST /api/logout                                   -> clear session
//   GET/PUT /api/saves?ns=<name>                        -> per-user cloud save blob
// Everything else -> static assets (public/).

const SESSION_COOKIE = "games_session";
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/account/register" && request.method === "POST") {
      return handleRegister(request, env);
    }
    if (url.pathname === "/api/account/login" && request.method === "POST") {
      return handleLogin(request, env);
    }
    if (url.pathname === "/api/me" && request.method === "GET") {
      return handleMe(request, env);
    }
    if (url.pathname === "/api/logout" && request.method === "POST") {
      return handleLogout(request);
    }
    if (url.pathname === "/api/saves" && request.method === "GET") {
      return handleSaveGet(request, env, url);
    }
    if (url.pathname === "/api/saves" && request.method === "PUT") {
      return handleSavePut(request, env, url);
    }
    if (url.pathname === "/api/comments" && request.method === "GET") {
      return handleCommentsGet(request, env, url);
    }
    if (url.pathname === "/api/comments" && request.method === "POST") {
      return handleCommentsPost(request, env, url);
    }
    if (url.pathname === "/api/play" && request.method === "POST") {
      return handlePlay(request, env, url);
    }
    if (url.pathname === "/api/admin/data" && request.method === "GET") {
      return handleAdminData(request, env);
    }
    if (url.pathname === "/api/mp/ping" && request.method === "POST") return handleMpPing(request, env);
    if (url.pathname === "/api/mp/lobby" && request.method === "GET") return handleMpLobby(request, env);
    if (url.pathname === "/api/mp/challenge" && request.method === "POST") return handleMpChallenge(request, env);
    if (url.pathname === "/api/mp/respond" && request.method === "POST") return handleMpRespond(request, env);
    if (url.pathname === "/api/mp/match" && request.method === "GET") return handleMpMatch(request, env, url);
    if (url.pathname === "/api/mp/move" && request.method === "POST") return handleMpMove(request, env);

    // Not an API route — serve a static asset.
    return env.ASSETS.fetch(request);
  },
};

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

async function handleMe(request, env) {
  const payload = await getSession(request, env);
  if (!payload) return json({ loggedIn: false });
  return json({ loggedIn: true, user: userView(payload) });
}

// ---------------------------------------------------------------------------
// Username / password accounts (KV: ACCOUNTS) + per-user cloud saves
// ---------------------------------------------------------------------------

const USER_RE = /^[a-zA-Z0-9_-]{3,20}$/;
const NS_RE = /^[a-zA-Z0-9_.-]{1,40}$/;
const PBKDF2_ITERS = 100000;

async function getSession(request, env) {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const payload = await verifySession(token, env.SESSION_SECRET);
  if (!payload || payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

// public user view from a session payload
function userView(p) { return { username: p.u, kind: "local" }; }

// stable per-account key prefix for saves
function accountId(p) { return "u:" + p.u.toLowerCase(); }

async function sessionResponse(request, env, sessionData, bodyObj) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL;
  const token = await signSession({ ...sessionData, exp }, env.SESSION_SECRET);
  const secure = new URL(request.url).protocol === "https:";
  return json(bodyObj, 200, {
    "Set-Cookie": cookie(SESSION_COOKIE, token, { httpOnly: true, secure, sameSite: "Lax", path: "/", maxAge: SESSION_TTL }),
  });
}

async function pbkdf2(password, salt, iters) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), { name: "PBKDF2" }, false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: iters, hash: "SHA-256" }, key, 256);
  return new Uint8Array(bits);
}

async function handleRegister(request, env) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "invalid_body" }, 400); }
  const username = (body.username || "").trim();
  const password = body.password || "";
  if (!USER_RE.test(username)) return json({ error: "bad_username", message: "3-20 letters, numbers, _ or -" }, 400);
  if (password.length < 6) return json({ error: "short_password", message: "Password must be at least 6 characters" }, 400);

  const key = "u:" + username.toLowerCase();
  if (await env.ACCOUNTS.get(key)) return json({ error: "taken", message: "That username is taken" }, 409);

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt, PBKDF2_ITERS);
  const rec = { username, salt: bytesToB64url(salt), hash: bytesToB64url(hash), iters: PBKDF2_ITERS, created: Date.now() };
  await env.ACCOUNTS.put(key, JSON.stringify(rec));
  return sessionResponse(request, env, { u: username }, { loggedIn: true, user: { username, kind: "local" } });
}

async function handleLogin(request, env) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "invalid_body" }, 400); }
  const username = (body.username || "").trim();
  const password = body.password || "";
  const raw = await env.ACCOUNTS.get("u:" + username.toLowerCase());
  if (!raw) return json({ error: "bad_credentials", message: "Wrong username or password" }, 401);
  const rec = JSON.parse(raw);
  const hash = await pbkdf2(password, b64urlToBytes(rec.salt), rec.iters || PBKDF2_ITERS);
  if (!timingSafeEqual(bytesToB64url(hash), rec.hash)) return json({ error: "bad_credentials", message: "Wrong username or password" }, 401);
  return sessionResponse(request, env, { u: rec.username }, { loggedIn: true, user: { username: rec.username, kind: "local" } });
}

async function handleSaveGet(request, env, url) {
  const payload = await getSession(request, env);
  if (!payload) return json({ error: "unauth" }, 401);
  const ns = url.searchParams.get("ns") || "";
  if (!NS_RE.test(ns)) return json({ error: "bad_ns" }, 400);
  const raw = await env.ACCOUNTS.get("s:" + accountId(payload) + ":" + ns);
  return json({ ok: true, data: raw ? JSON.parse(raw) : null });
}

async function handleSavePut(request, env, url) {
  const payload = await getSession(request, env);
  if (!payload) return json({ error: "unauth" }, 401);
  const ns = url.searchParams.get("ns") || "";
  if (!NS_RE.test(ns)) return json({ error: "bad_ns" }, 400);
  const text = await request.text();
  if (text.length > 512 * 1024) return json({ error: "too_large" }, 413);
  try { JSON.parse(text); } catch { return json({ error: "invalid_json" }, 400); }
  await env.ACCOUNTS.put("s:" + accountId(payload) + ":" + ns, text);
  return json({ ok: true });
}

// ---------------------------------------------------------------------------
// Per-game comments / feedback (public; KV keys "comments:<slug>")
// ---------------------------------------------------------------------------

const SLUG_RE = /^[a-zA-Z0-9/_-]{1,60}$/;
const MAX_COMMENTS = 200;

async function handleCommentsGet(request, env, url) {
  const slug = url.searchParams.get("game") || "";
  if (!SLUG_RE.test(slug)) return json({ error: "bad_slug" }, 400);
  const raw = await env.ACCOUNTS.get("comments:" + slug);
  return json({ ok: true, comments: raw ? JSON.parse(raw) : [] });
}

async function handleCommentsPost(request, env, url) {
  const slug = url.searchParams.get("game") || "";
  if (!SLUG_RE.test(slug)) return json({ error: "bad_slug" }, 400);
  let body;
  try { body = await request.json(); } catch { return json({ error: "invalid_body" }, 400); }
  let text = (body.text || "").toString().trim();
  let name = (body.name || "").toString().trim().slice(0, 40) || "Anonymous";
  if (!text) return json({ error: "empty" }, 400);
  if (text.length > 1000) text = text.slice(0, 1000);
  const comment = { name, text, ts: Date.now() };
  const key = "comments:" + slug;
  const raw = await env.ACCOUNTS.get(key);
  const list = raw ? JSON.parse(raw) : [];
  list.unshift(comment);
  if (list.length > MAX_COMMENTS) list.length = MAX_COMMENTS;
  await env.ACCOUNTS.put(key, JSON.stringify(list));
  return json({ ok: true, comment });
}

// ---------------------------------------------------------------------------
// Play analytics (KV key "stats") + admin dashboard data
// ---------------------------------------------------------------------------

async function handlePlay(request, env, url) {
  const slug = url.searchParams.get("game") || "";
  if (!SLUG_RE.test(slug)) return json({ error: "bad_slug" }, 400);
  const raw = await env.ACCOUNTS.get("stats");
  const s = raw ? JSON.parse(raw) : { total: 0, games: {}, days: {} };
  s.total = (s.total || 0) + 1;
  s.games[slug] = (s.games[slug] || 0) + 1;
  const day = new Date().toISOString().slice(0, 10);
  s.days[day] = (s.days[day] || 0) + 1;
  const days = Object.keys(s.days).sort();
  while (days.length > 90) delete s.days[days.shift()];
  await env.ACCOUNTS.put("stats", JSON.stringify(s));
  return json({ ok: true });
}

function adminOk(request, env) {
  if (!env.ADMIN_TOKEN) return false;
  const auth = request.headers.get("Authorization") || "";
  let token = auth.replace(/^Bearer\s+/i, "");
  if (!token) token = new URL(request.url).searchParams.get("token") || "";
  return token.length > 0 && timingSafeEqual(token, env.ADMIN_TOKEN);
}

async function handleAdminData(request, env) {
  if (!adminOk(request, env)) return json({ error: "unauth" }, 401);

  // registered users (KV keys "u:<name>")
  let users = 0, cursor;
  do {
    const r = await env.ACCOUNTS.list({ prefix: "u:", cursor });
    users += r.keys.length;
    cursor = r.list_complete ? undefined : r.cursor;
  } while (cursor);

  const rawStats = await env.ACCOUNTS.get("stats");
  const stats = rawStats ? JSON.parse(rawStats) : { total: 0, games: {}, days: {} };

  // all comments across games
  const games = [];
  let totalComments = 0;
  cursor = undefined;
  do {
    const r = await env.ACCOUNTS.list({ prefix: "comments:", cursor });
    for (const k of r.keys) {
      const raw = await env.ACCOUNTS.get(k.name);
      const arr = raw ? JSON.parse(raw) : [];
      if (arr.length) { games.push({ game: k.name.slice("comments:".length), count: arr.length, comments: arr }); totalComments += arr.length; }
    }
    cursor = r.list_complete ? undefined : r.cursor;
  } while (cursor);
  games.sort((a, b) => b.count - a.count);

  return json({ ok: true, users, stats, totalComments, games });
}

// ---------------------------------------------------------------------------
// Multiplayer: presence lobby, challenges, and server-authoritative matches
// ---------------------------------------------------------------------------

// Each engine: move(state,pl,mv) -> {state, next} | null ; result(state) -> {winner}|{draw}|null
const other = (p) => (p === "X" ? "O" : "X");
const DIRS8 = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
function tt3Win(s) { const L = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]; for (const [a,b,c] of L) if (s[a] && s[a] === s[b] && s[a] === s[c]) return s[a]; return ""; }
function lineWin(s, rows, cols, need) { const at = (r,c) => (r>=0&&r<rows&&c>=0&&c<cols) ? s[r*cols+c] : ""; for (let r=0;r<rows;r++) for (let c=0;c<cols;c++){ const v=at(r,c); if(!v) continue; for (const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]]) { let k=1; while(at(r+dr*k,c+dc*k)===v) k++; if(k>=need) return v; } } return ""; }
function revFlips(s, pl, idx) { if (s[idx]) return []; const opp = other(pl), r = Math.floor(idx/8), c = idx%8, out = [];
  for (const [dr,dc] of DIRS8) { const line = []; let nr=r+dr, nc=c+dc; while(nr>=0&&nr<8&&nc>=0&&nc<8&&s[nr*8+nc]===opp){ line.push(nr*8+nc); nr+=dr; nc+=dc; } if(line.length&&nr>=0&&nr<8&&nc>=0&&nc<8&&s[nr*8+nc]===pl) out.push(...line); } return out; }
function revLegal(s, pl) { const m = []; for (let i=0;i<64;i++) if(!s[i]&&revFlips(s,pl,i).length) m.push(i); return m; }
const boardFull = (b) => b.every((x) => x);
function dbSides(s, br, bc) { return s.h[br*4+bc] + s.h[(br+1)*4+bc] + s.v[br*5+bc] + s.v[br*5+bc+1]; }

// --- Checkers (8x8 American draughts) helpers -----------------------------
// Piece codes: "x"/"X" = player X man/king, "o"/"O" = player O man/king.
// X starts at the bottom (rows 5-7) moving up; O at the top moving down.
const CK_KING = [[-1,-1],[-1,1],[1,-1],[1,1]];
function ckOwner(p) { return (p === "x" || p === "X") ? "X" : (p === "o" || p === "O") ? "O" : null; }
function ckKing(p) { return p === "X" || p === "O"; }
function ckDirs(p) { if (ckKing(p)) return CK_KING; return ckOwner(p) === "X" ? [[-1,-1],[-1,1]] : [[1,-1],[1,1]]; }
function ckJumps(b, i) { const p = b[i], own = ckOwner(p); if (!own) return []; const r = Math.floor(i/8), c = i%8, out = [];
  for (const [dr,dc] of ckDirs(p)) { const mr=r+dr, mc=c+dc, lr=r+2*dr, lc=c+2*dc; if (lr<0||lr>7||lc<0||lc>7) continue;
    const mi=mr*8+mc, li=lr*8+lc, mid=b[mi]; if (mid && ckOwner(mid) && ckOwner(mid)!==own && !b[li]) out.push({ to: li, over: mi }); }
  return out; }
function ckSteps(b, i) { const p = b[i], own = ckOwner(p); if (!own) return []; const r = Math.floor(i/8), c = i%8, out = [];
  for (const [dr,dc] of ckDirs(p)) { const nr=r+dr, nc=c+dc; if (nr<0||nr>7||nc<0||nc>7) continue; const ni=nr*8+nc; if (!b[ni]) out.push({ to: ni }); }
  return out; }
function ckMoves(b, pl, chain) {
  if (chain != null) return ckJumps(b, chain).map((j) => ({ from: chain, ...j }));
  const jumps = []; for (let i=0;i<64;i++) if (ckOwner(b[i])===pl) for (const j of ckJumps(b,i)) jumps.push({ from:i, ...j });
  if (jumps.length) return jumps;
  const steps = []; for (let i=0;i<64;i++) if (ckOwner(b[i])===pl) for (const s of ckSteps(b,i)) steps.push({ from:i, ...s });
  return steps;
}

// --- UNO-style "Wild Cards" helpers (heads-up, hidden-info; see redact) -----
// Card: {c:"R"|"G"|"B"|"Y"|"W", v:"0".."9"|"skip"|"rev"|"d2"|"wild"|"wd4"}
function unoBuildDeck() {
  const colors = ["R","G","B","Y"], deck = [];
  for (const c of colors) {
    deck.push({ c, v: "0" });
    for (let n=1;n<=9;n++) { deck.push({ c, v: String(n) }); deck.push({ c, v: String(n) }); }
    for (const a of ["skip","rev","d2"]) { deck.push({ c, v: a }); deck.push({ c, v: a }); }
  }
  for (let k=0;k<4;k++) { deck.push({ c:"W", v:"wild" }); deck.push({ c:"W", v:"wd4" }); }
  return deck;
}
function unoShuffle(a) { for (let i=a.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); const t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function unoPlayable(card, color, top) { if (card.c==="W") return true; return card.c===color || card.v===top.v; }
function unoReshuffle(s) { if (s.discard.length<=1) return; const top=s.discard.pop(); s.deck=unoShuffle(s.discard); s.discard=[top]; }
function unoDrawN(s, who, n) { for (let k=0;k<n;k++) { if (s.deck.length===0) unoReshuffle(s); if (s.deck.length===0) break; s.hands[who].push(s.deck.pop()); } }
const unoOther = (p) => (p==="X"?"O":"X");

const MP_GAMES = {
  ttt: { name: "Tic-Tac-Toe",
    init: () => Array(9).fill(""),
    move: (s, pl, mv) => { if (typeof mv !== "number" || mv < 0 || mv > 8 || s[mv]) return null; const n = s.slice(); n[mv] = pl; return { state: n, next: other(pl) }; },
    result: (s) => { const w = tt3Win(s); if (w) return { winner: w }; return boardFull(s) ? { draw: true } : null; },
  },
  c4: { name: "Connect Four",
    init: () => Array(42).fill(""),
    move: (s, pl, mv) => { if (typeof mv !== "number" || mv < 0 || mv > 6) return null; for (let r=5;r>=0;r--){ const i=r*7+mv; if(!s[i]){ const n=s.slice(); n[i]=pl; return { state:n, next:other(pl) }; } } return null; },
    result: (s) => { const w = lineWin(s, 6, 7, 4); if (w) return { winner: w }; return boardFull(s) ? { draw: true } : null; },
  },
  gomoku: { name: "Gomoku",
    init: () => Array(169).fill(""), // 13x13
    move: (s, pl, mv) => { if (typeof mv !== "number" || mv < 0 || mv >= 169 || s[mv]) return null; const n = s.slice(); n[mv] = pl; return { state: n, next: other(pl) }; },
    result: (s) => { const w = lineWin(s, 13, 13, 5); if (w) return { winner: w }; return boardFull(s) ? { draw: true } : null; },
  },
  reversi: { name: "Reversi",
    init: () => { const s = Array(64).fill(""); s[27]="O"; s[28]="X"; s[35]="X"; s[36]="O"; return s; },
    move: (s, pl, mv) => { const fl = revFlips(s, pl, mv); if (!fl.length) return null; const n = s.slice(); n[mv] = pl; for (const i of fl) n[i] = pl;
      const opp = other(pl); let next; if (revLegal(n, opp).length) next = opp; else if (revLegal(n, pl).length) next = pl; else next = opp; return { state: n, next }; },
    result: (s) => { if (revLegal(s,"X").length || revLegal(s,"O").length) return null; let x=0,o=0; for (const v of s){ if(v==="X")x++; else if(v==="O")o++; } return x>o?{winner:"X"}:o>x?{winner:"O"}:{draw:true}; },
  },
  uttt: { name: "Ultimate T-T-T",
    init: () => ({ boards: Array.from({length:9},()=>Array(9).fill("")), big: Array(9).fill(""), active: -1 }),
    move: (st, pl, mv) => { const bi = Math.floor(mv/9), ci = mv%9; if (bi<0||bi>8||ci<0||ci>8) return null;
      if (st.active !== -1 && st.active !== bi) return null; if (st.big[bi] || boardFull(st.boards[bi])) return null; if (st.boards[bi][ci]) return null;
      const boards = st.boards.map((b)=>b.slice()); boards[bi][ci] = pl; const big = st.big.slice();
      const w = tt3Win(boards[bi]); if (w) big[bi] = w; else if (boardFull(boards[bi])) big[bi] = "D";
      const active = (big[ci] || boardFull(boards[ci])) ? -1 : ci;
      return { state: { boards, big, active }, next: other(pl) }; },
    result: (st) => { const mw = tt3Win(st.big.map((v)=> (v==="X"||v==="O")?v:"")); if (mw) return { winner: mw }; return st.big.every((v)=>v) ? { draw: true } : null; },
  },
  dots: { name: "Dots & Boxes",
    init: () => ({ h: Array(20).fill(0), v: Array(20).fill(0), boxes: Array(16).fill(""), sX: 0, sO: 0 }),
    move: (st, pl, mv) => { const s = { h: st.h.slice(), v: st.v.slice(), boxes: st.boxes.slice(), sX: st.sX, sO: st.sO };
      let aff; if (mv>=0&&mv<20){ if(s.h[mv]) return null; s.h[mv]=1; const r=Math.floor(mv/4),c=mv%4; aff=[[r-1,c],[r,c]]; }
      else if (mv>=20&&mv<40){ const vi=mv-20; if(s.v[vi]) return null; s.v[vi]=1; const r=Math.floor(vi/5),c=vi%5; aff=[[r,c-1],[r,c]]; }
      else return null;
      let made=0; for (const [br,bc] of aff){ if(br<0||br>=4||bc<0||bc>=4) continue; const bi=br*4+bc; if(!s.boxes[bi]&&dbSides(s,br,bc)===4){ s.boxes[bi]=pl; made++; if(pl==="X")s.sX++; else s.sO++; } }
      return { state: s, next: made>0 ? pl : other(pl) }; },
    result: (s) => { if (!s.boxes.every((v)=>v)) return null; return s.sX>s.sO?{winner:"X"}:s.sO>s.sX?{winner:"O"}:{draw:true}; },
  },
  checkers: { name: "Checkers",
    init: () => { const b = Array(64).fill("");
      for (let r=0;r<3;r++) for (let c=0;c<8;c++) if ((r+c)%2===1) b[r*8+c]="o";
      for (let r=5;r<8;r++) for (let c=0;c<8;c++) if ((r+c)%2===1) b[r*8+c]="x";
      return { b, turn: "X", chain: null }; },
    move: (st, pl, mv) => {
      if (!mv || typeof mv.from !== "number" || typeof mv.to !== "number") return null;
      if (st.turn && st.turn !== pl) return null;
      const m = ckMoves(st.b, pl, st.chain).find((x) => x.from === mv.from && x.to === mv.to);
      if (!m) return null;
      const b = st.b.slice(); let p = b[m.from]; b[m.from] = "";
      if (m.over != null) b[m.over] = "";
      const tr = Math.floor(m.to/8); let kinged = false;
      if (p === "x" && tr === 0) { p = "X"; kinged = true; } else if (p === "o" && tr === 7) { p = "O"; kinged = true; }
      b[m.to] = p;
      let chain = null, next;
      if (m.over != null && !kinged && ckJumps(b, m.to).length) { chain = m.to; next = pl; } else { next = other(pl); }
      return { state: { b, turn: next, chain }, next };
    },
    result: (st) => {
      let hasX = false, hasO = false;
      for (const v of st.b) { const o = ckOwner(v); if (o === "X") hasX = true; else if (o === "O") hasO = true; }
      if (!hasX) return { winner: "O" };
      if (!hasO) return { winner: "X" };
      if (!ckMoves(st.b, st.turn, st.chain).length) return { winner: other(st.turn) };
      return null;
    },
  },
  wild: { name: "Wild Cards",
    init: () => {
      const deck = unoShuffle(unoBuildDeck());
      const hands = { X: [], O: [] };
      for (let k=0;k<7;k++) { hands.X.push(deck.pop()); hands.O.push(deck.pop()); }
      let start; // first discard must be a plain number card
      while (true) { const c = deck.pop(); if (/^[0-9]$/.test(c.v)) { start = c; break; } deck.unshift(c); }
      return { deck, discard: [start], color: start.c, hands, turn: "X", phase: "play", drawnIdx: null, lastAction: null };
    },
    move: (st, pl, mv) => {
      if (st.turn !== pl) return null;
      const opp = unoOther(pl);
      const s = JSON.parse(JSON.stringify(st));
      if (mv && mv.pass) {
        if (s.phase !== "drew") return null;
        s.phase="play"; s.drawnIdx=null; s.turn=opp; s.lastAction={ by:pl, type:"pass" };
        return { state:s, next:opp };
      }
      if (mv && mv.draw) {
        if (s.phase !== "play") return null;
        unoDrawN(s, pl, 1);
        const idx = s.hands[pl].length-1, drew = s.hands[pl][idx];
        if (drew && unoPlayable(drew, s.color, s.discard[s.discard.length-1])) {
          s.phase="drew"; s.drawnIdx=idx; s.turn=pl; s.lastAction={ by:pl, type:"draw" };
          return { state:s, next:pl };
        }
        s.phase="play"; s.drawnIdx=null; s.turn=opp; s.lastAction={ by:pl, type:"draw-pass" };
        return { state:s, next:opp };
      }
      if (mv && typeof mv.play === "number") {
        const i = mv.play, hand = s.hands[pl];
        if (i<0 || i>=hand.length) return null;
        if (s.phase==="drew" && i!==s.drawnIdx) return null;
        const card = hand[i], top = s.discard[s.discard.length-1];
        if (!unoPlayable(card, s.color, top)) return null;
        let chosen = card.c;
        if (card.c==="W") { chosen=(mv.color||"").toString().toUpperCase(); if (!["R","G","B","Y"].includes(chosen)) return null; }
        hand.splice(i,1); s.discard.push(card); s.color = card.c==="W"?chosen:card.c; s.phase="play"; s.drawnIdx=null;
        let next; const v = card.v;
        if (v==="d2") { unoDrawN(s, opp, 2); next=pl; }
        else if (v==="wd4") { unoDrawN(s, opp, 4); next=pl; }
        else if (v==="skip" || v==="rev") { next=pl; }
        else { next=opp; }
        s.turn=next; s.lastAction={ by:pl, type:"play", card, color:s.color };
        return { state:s, next };
      }
      return null;
    },
    result: (st) => {
      if (st.hands.X.length===0) return { winner:"X" };
      if (st.hands.O.length===0) return { winner:"O" };
      return null;
    },
    redact: (st, sym) => {
      const opp = unoOther(sym);
      return { top: st.discard[st.discard.length-1], color: st.color, phase: st.phase, turn: st.turn,
        hand: st.hands[sym], oppCount: st.hands[opp].length, deckCount: st.deck.length,
        drawnIdx: (st.phase==="drew" && st.turn===sym) ? st.drawnIdx : null, last: st.lastAction };
    },
  },
};

// Redact hidden-info games (e.g. Wild Cards) per viewer before sending to a client.
function mpView(match, eng, sym) {
  if (!eng || !eng.redact) return match;
  return { ...match, state: eng.redact(match.state, sym) };
}

function rid() { return bytesToB64url(crypto.getRandomValues(new Uint8Array(9))); }
async function mpUser(request, env) { const p = await getSession(request, env); return p && p.u ? p.u : null; }
const lc = (s) => s.toLowerCase();

async function handleMpPing(request, env) {
  const u = await mpUser(request, env); if (!u) return json({ error: "unauth" }, 401);
  const um = await env.ACCOUNTS.get("usermatch:" + lc(u));
  await env.ACCOUNTS.put("presence:" + lc(u), JSON.stringify({ name: u, ts: Date.now(), match: um || null }), { expirationTtl: 60 });
  return json({ ok: true });
}

async function handleMpLobby(request, env) {
  const u = await mpUser(request, env); if (!u) return json({ error: "unauth" }, 401);
  const now = Date.now();
  const players = []; let cursor;
  do {
    const r = await env.ACCOUNTS.list({ prefix: "presence:", cursor });
    for (const k of r.keys) { const raw = await env.ACCOUNTS.get(k.name); if (!raw) continue; const p = JSON.parse(raw);
      if (now - p.ts > 20000) continue; players.push({ name: p.name, status: p.match ? "playing" : "available" }); }
    cursor = r.list_complete ? undefined : r.cursor;
  } while (cursor);
  const challenges = []; cursor = undefined;
  do {
    const r = await env.ACCOUNTS.list({ prefix: "challenge:", cursor });
    for (const k of r.keys) { const raw = await env.ACCOUNTS.get(k.name); if (!raw) continue; const c = JSON.parse(raw);
      if (now - c.ts > 120000) { await env.ACCOUNTS.delete(k.name); continue; }
      if (lc(c.to) === lc(u)) challenges.push(c); }
    cursor = r.list_complete ? undefined : r.cursor;
  } while (cursor);
  const myMatch = await env.ACCOUNTS.get("usermatch:" + lc(u));
  return json({ ok: true, me: u, players, challenges, myMatch: myMatch || null, games: Object.fromEntries(Object.entries(MP_GAMES).map(([k, v]) => [k, v.name])) });
}

async function handleMpChallenge(request, env) {
  const u = await mpUser(request, env); if (!u) return json({ error: "unauth" }, 401);
  let body; try { body = await request.json(); } catch { return json({ error: "invalid_body" }, 400); }
  const to = (body.to || "").toString().trim(); const game = (body.game || "").toString();
  if (!MP_GAMES[game]) return json({ error: "bad_game" }, 400);
  if (!to || lc(to) === lc(u)) return json({ error: "bad_target" }, 400);
  const id = rid();
  await env.ACCOUNTS.put("challenge:" + id, JSON.stringify({ id, from: u, to, game, ts: Date.now() }), { expirationTtl: 180 });
  return json({ ok: true, id });
}

async function handleMpRespond(request, env) {
  const u = await mpUser(request, env); if (!u) return json({ error: "unauth" }, 401);
  let body; try { body = await request.json(); } catch { return json({ error: "invalid_body" }, 400); }
  const raw = await env.ACCOUNTS.get("challenge:" + body.id);
  if (!raw) return json({ error: "gone" }, 404);
  const c = JSON.parse(raw);
  if (lc(c.to) !== lc(u)) return json({ error: "not_yours" }, 403);
  await env.ACCOUNTS.delete("challenge:" + body.id);
  if (!body.accept) return json({ ok: true });
  const eng = MP_GAMES[c.game]; const mid = rid();
  const match = { id: mid, game: c.game, gameName: eng.name, players: { X: c.from, O: c.to }, state: eng.init(), turn: "X", winner: null, draw: false, version: 1, updated: Date.now() };
  await env.ACCOUNTS.put("match:" + mid, JSON.stringify(match));
  await env.ACCOUNTS.put("usermatch:" + lc(c.from), mid);
  await env.ACCOUNTS.put("usermatch:" + lc(c.to), mid);
  return json({ ok: true, matchId: mid });
}

async function handleMpMatch(request, env, url) {
  const u = await mpUser(request, env); if (!u) return json({ error: "unauth" }, 401);
  const raw = await env.ACCOUNTS.get("match:" + (url.searchParams.get("id") || ""));
  if (!raw) return json({ error: "gone" }, 404);
  const match = JSON.parse(raw);
  if (![lc(match.players.X), lc(match.players.O)].includes(lc(u))) return json({ error: "forbidden" }, 403);
  const sym = lc(match.players.X) === lc(u) ? "X" : "O";
  return json({ ok: true, match: mpView(match, MP_GAMES[match.game], sym) });
}

async function handleMpMove(request, env) {
  const u = await mpUser(request, env); if (!u) return json({ error: "unauth" }, 401);
  let body; try { body = await request.json(); } catch { return json({ error: "invalid_body" }, 400); }
  const key = "match:" + body.id;
  const raw = await env.ACCOUNTS.get(key);
  if (!raw) return json({ error: "gone" }, 404);
  const match = JSON.parse(raw);
  if (match.winner || match.draw) return json({ error: "over" }, 400);
  const sym = lc(match.players.X) === lc(u) ? "X" : (lc(match.players.O) === lc(u) ? "O" : null);
  if (!sym) return json({ error: "forbidden" }, 403);
  if (sym !== match.turn) return json({ error: "not_your_turn" }, 400);
  const eng = MP_GAMES[match.game];
  const out = eng.move(match.state, sym, body.move);
  if (!out) return json({ error: "illegal" }, 400);
  match.state = out.state;
  const res = eng.result(match.state);
  if (res) {
    if (res.winner) match.winner = res.winner;
    if (res.draw) match.draw = true;
    await env.ACCOUNTS.delete("usermatch:" + lc(match.players.X));
    await env.ACCOUNTS.delete("usermatch:" + lc(match.players.O));
  } else { match.turn = out.next; }
  match.version++; match.updated = Date.now();
  await env.ACCOUNTS.put(key, JSON.stringify(match));
  return json({ ok: true, match: mpView(match, eng, sym) });
}

function handleLogout(request) {
  const secure = new URL(request.url).protocol === "https:";
  return json({ loggedIn: false }, 200, {
    "Set-Cookie": cookie(SESSION_COOKIE, "", {
      httpOnly: true,
      secure,
      sameSite: "Lax",
      path: "/",
      maxAge: 0,
    }),
  });
}

// ---------------------------------------------------------------------------
// Session token (HMAC-SHA256 signed JSON)
// ---------------------------------------------------------------------------

async function signSession(payload, secret) {
  const body = textToB64url(JSON.stringify(payload));
  const sig = await hmac(body, secret);
  return `${body}.${sig}`;
}

async function verifySession(token, secret) {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = await hmac(body, secret);
  if (!timingSafeEqual(sig, expected)) return null;
  try {
    return JSON.parse(b64urlToText(body));
  } catch {
    return null;
  }
}

async function hmac(message, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return bytesToB64url(new Uint8Array(sig));
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function json(obj, status = 200, headers = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function cookie(name, value, opts = {}) {
  let str = `${name}=${value}`;
  if (opts.maxAge != null) str += `; Max-Age=${opts.maxAge}`;
  if (opts.path) str += `; Path=${opts.path}`;
  if (opts.sameSite) str += `; SameSite=${opts.sameSite}`;
  if (opts.httpOnly) str += `; HttpOnly`;
  if (opts.secure) str += `; Secure`;
  return str;
}

function readCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

// base64url <-> text/bytes
function b64urlToText(s) {
  return new TextDecoder().decode(b64urlToBytes(s));
}
function b64urlToBytes(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
function textToB64url(t) {
  return bytesToB64url(new TextEncoder().encode(t));
}
function bytesToB64url(bytes) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
