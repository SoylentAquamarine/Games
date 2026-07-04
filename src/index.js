// Games Worker — static assets + Google Sign-In session backend.
//
// Routes:
//   POST /api/auth/google   { credential }  -> verify Google ID token, set session cookie
//   GET  /api/me                            -> current user from session cookie
//   POST /api/logout                        -> clear session cookie
// Everything else -> static assets (public/).

const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_ISS = ["https://accounts.google.com", "accounts.google.com"];
const SESSION_COOKIE = "games_session";
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/auth/google" && request.method === "POST") {
      return handleGoogleLogin(request, env);
    }
    if (url.pathname === "/api/me" && request.method === "GET") {
      return handleMe(request, env);
    }
    if (url.pathname === "/api/logout" && request.method === "POST") {
      return handleLogout(request);
    }

    // Not an API route — serve a static asset.
    return env.ASSETS.fetch(request);
  },
};

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

async function handleGoogleLogin(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_body" }, 400);
  }

  const credential = body && body.credential;
  if (!credential) return json({ error: "missing_credential" }, 400);

  let claims;
  try {
    claims = await verifyGoogleToken(credential, env.GOOGLE_CLIENT_ID);
  } catch (err) {
    return json({ error: "invalid_token", detail: String(err) }, 401);
  }

  const user = {
    sub: claims.sub,
    email: claims.email,
    name: claims.name || claims.email,
    picture: claims.picture || "",
  };

  const secret = env.SESSION_SECRET;
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL;
  const token = await signSession({ ...user, exp }, secret);

  const secure = new URL(request.url).protocol === "https:";
  return json({ loggedIn: true, user }, 200, {
    "Set-Cookie": cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      secure,
      sameSite: "Lax",
      path: "/",
      maxAge: SESSION_TTL,
    }),
  });
}

async function handleMe(request, env) {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return json({ loggedIn: false });

  const payload = await verifySession(token, env.SESSION_SECRET);
  if (!payload || payload.exp < Math.floor(Date.now() / 1000)) {
    return json({ loggedIn: false });
  }
  return json({
    loggedIn: true,
    user: {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    },
  });
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
// Google ID token verification (RS256 via WebCrypto + Google JWKS)
// ---------------------------------------------------------------------------

async function verifyGoogleToken(jwt, clientId) {
  const [headerB64, payloadB64, sigB64] = jwt.split(".");
  if (!headerB64 || !payloadB64 || !sigB64) throw new Error("malformed jwt");

  const header = JSON.parse(b64urlToText(headerB64));
  const payload = JSON.parse(b64urlToText(payloadB64));

  if (header.alg !== "RS256") throw new Error("unexpected alg");

  const jwk = await getGoogleKey(header.kid);
  if (!jwk) throw new Error("signing key not found");

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );

  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const sig = b64urlToBytes(sigB64);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, sig, data);
  if (!ok) throw new Error("bad signature");

  if (payload.aud !== clientId) throw new Error("aud mismatch");
  if (!GOOGLE_ISS.includes(payload.iss)) throw new Error("iss mismatch");
  if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error("expired");

  return payload;
}

async function getGoogleKey(kid) {
  const res = await fetch(GOOGLE_JWKS_URL);
  const { keys } = await res.json();
  return keys.find((k) => k.kid === kid);
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
