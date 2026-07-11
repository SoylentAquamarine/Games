// Drop-in per-game comments widget. Include on any game page:
//   <script src="/comments.js" defer></script>
// It derives the game slug from the URL, injects its own styles + UI at the
// bottom of the page, and talks to /api/comments.
(function () {
  "use strict";
  // slug = path under /games/ (e.g. "snake", "cards/war"), fallback to pathname
  function slug() {
    let p = location.pathname.replace(/index\.html$/, "").replace(/\/+$/, "");
    const m = p.match(/\/games\/(.+)$/);
    let s = m ? m[1] : p.replace(/^\//, "") || "home";
    return s.replace(/[^a-zA-Z0-9/_-]/g, "").slice(0, 60) || "home";
  }
  const GAME = slug();

  function esc(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
  function timeAgo(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return Math.floor(s / 60) + "m ago";
    if (s < 86400) return Math.floor(s / 3600) + "h ago";
    return Math.floor(s / 86400) + "d ago";
  }

  function injectStyles() {
    const st = document.createElement("style");
    st.textContent = `
      .cmt-wrap{max-width:640px;margin:26px auto 40px;padding:0 14px;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#e6e6f0}
      .cmt-card{background:#1e2140;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:16px}
      .cmt-h{display:flex;align-items:center;gap:8px;font-weight:800;font-size:1.05rem;margin:0 0 4px}
      .cmt-sub{color:#9a9ab5;font-size:.82rem;margin:0 0 14px;line-height:1.5}
      .cmt-form{display:flex;flex-direction:column;gap:8px;margin-bottom:16px}
      .cmt-form input,.cmt-form textarea{background:#252a4d;color:#e6e6f0;border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:9px 11px;font-size:.92rem;font-family:inherit;width:100%}
      .cmt-form textarea{min-height:64px;resize:vertical}
      .cmt-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
      .cmt-row input{flex:1;min-width:120px}
      .cmt-btn{background:linear-gradient(120deg,#7c5cff,#22d3ee);color:#0b0c1a;border:none;font-weight:700;padding:9px 18px;border-radius:999px;cursor:pointer;font-size:.9rem;white-space:nowrap}
      .cmt-btn:disabled{opacity:.5;cursor:default}
      .cmt-msg{font-size:.82rem;min-height:1.1em}
      .cmt-msg.ok{color:#34d399}.cmt-msg.err{color:#f87171}
      .cmt-list{display:flex;flex-direction:column;gap:10px}
      .cmt-item{background:#171a30;border:1px solid rgba(255,255,255,.05);border-radius:10px;padding:10px 12px}
      .cmt-meta{font-size:.78rem;color:#9a9ab5;margin-bottom:3px}
      .cmt-meta b{color:#22d3ee;font-weight:700}
      .cmt-text{font-size:.92rem;line-height:1.45;white-space:pre-wrap;word-break:break-word}
      .cmt-empty{color:#9a9ab5;font-size:.86rem;text-align:center;padding:8px}
    `;
    document.head.appendChild(st);
  }

  function build() {
    const wrap = document.createElement("div");
    wrap.className = "cmt-wrap";
    wrap.innerHTML = `
      <div class="cmt-card">
        <h3 class="cmt-h">💬 Comments &amp; feedback</h3>
        <p class="cmt-sub">Tried this game? Tell me what you liked, what felt off, or anything that doesn't work all the way — I read every comment and adjust the game.</p>
        <div class="cmt-form">
          <div class="cmt-row">
            <input id="cmt-name" maxlength="40" placeholder="Name (optional)" autocomplete="nickname" />
            <button class="cmt-btn" id="cmt-send">Post</button>
          </div>
          <textarea id="cmt-text" maxlength="1000" placeholder="Your feedback…"></textarea>
          <div class="cmt-msg" id="cmt-msg"></div>
        </div>
        <div class="cmt-list" id="cmt-list"><div class="cmt-empty">Loading comments…</div></div>
      </div>`;
    document.body.appendChild(wrap);

    const listEl = wrap.querySelector("#cmt-list");
    const msgEl = wrap.querySelector("#cmt-msg");
    const nameEl = wrap.querySelector("#cmt-name");
    const textEl = wrap.querySelector("#cmt-text");
    const sendEl = wrap.querySelector("#cmt-send");

    function render(comments) {
      if (!comments.length) { listEl.innerHTML = '<div class="cmt-empty">No comments yet — be the first!</div>'; return; }
      listEl.innerHTML = comments.map((c) =>
        `<div class="cmt-item"><div class="cmt-meta"><b>${esc(c.name)}</b> · ${timeAgo(c.ts)}</div><div class="cmt-text">${esc(c.text)}</div></div>`
      ).join("");
    }
    function msg(t, ok) { msgEl.textContent = t; msgEl.className = "cmt-msg " + (ok ? "ok" : "err"); }

    async function load() {
      try { const r = await fetch("/api/comments?game=" + encodeURIComponent(GAME)); const d = await r.json(); render(d.comments || []); }
      catch { listEl.innerHTML = '<div class="cmt-empty">Couldn’t load comments.</div>'; }
    }
    async function post() {
      const text = textEl.value.trim();
      if (!text) { msg("Write something first.", false); return; }
      sendEl.disabled = true; msg("Posting…", true);
      try {
        const r = await fetch("/api/comments?game=" + encodeURIComponent(GAME), {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: nameEl.value.trim(), text }),
        });
        const d = await r.json();
        if (d.ok) { textEl.value = ""; msg("Thanks — posted!", true); load(); }
        else msg(d.error === "empty" ? "Write something first." : "Couldn’t post.", false);
      } catch { msg("Network error.", false); }
      sendEl.disabled = false;
    }
    sendEl.addEventListener("click", post);
    load();
  }

  function init() { injectStyles(); build(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
