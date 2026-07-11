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

const MP_GAMES = {
  ttt: {
    name: "Tic-Tac-Toe",
    init: () => Array(9).fill(""),
    move: (state, pl, mv) => { if (typeof mv !== "number" || mv < 0 || mv > 8 || state[mv]) return null; const s = state.slice(); s[mv] = pl; return s; },
    result: (s) => {
      const L = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      for (const [a,b,c] of L) if (s[a] && s[a] === s[b] && s[a] === s[c]) return { winner: s[a] };
      return s.every((x) => x) ? { draw: true } : null;
    },
  },
  c4: {
    name: "Connect Four",
    init: () => Array(42).fill(""), // 6 rows x 7 cols, index = r*7 + c (r0 = top)
    move: (state, pl, mv) => { if (typeof mv !== "number" || mv < 0 || mv > 6) return null; for (let r = 5; r >= 0; r--) { const i = r*7+mv; if (!state[i]) { const s = state.slice(); s[i] = pl; return s; } } return null; },
    result: (s) => {
      const at = (r,c) => (r>=0&&r<6&&c>=0&&c<7) ? s[r*7+c] : "";
      for (let r=0;r<6;r++) for (let c=0;c<7;c++) { const v=at(r,c); if(!v) continue;
        for (const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]]) { let k=1; while(at(r+dr*k,c+dc*k)===v) k++; if(k>=4) return { winner:v }; } }
      return s.every((x) => x) ? { draw: true } : null;
    },
  },
};

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
  return json({ ok: true, match });
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
  const ns = eng.move(match.state, sym, body.move);
  if (!ns) return json({ error: "illegal" }, 400);
  match.state = ns;
  const res = eng.result(ns);
  if (res) {
    if (res.winner) match.winner = res.winner;
    if (res.draw) match.draw = true;
    await env.ACCOUNTS.delete("usermatch:" + lc(match.players.X));
    await env.ACCOUNTS.delete("usermatch:" + lc(match.players.O));
  } else { match.turn = sym === "X" ? "O" : "X"; }
  match.version++; match.updated = Date.now();
  await env.ACCOUNTS.put(key, JSON.stringify(match));
  return json({ ok: true, match });
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
