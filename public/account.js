// Shared account + cloud-save client. Include on any page: <script src="/account.js"></script>
// Backend: Cloudflare Worker (/api/account/*, /api/me, /api/logout, /api/saves).
(function (global) {
  "use strict";

  async function jpost(url, body) {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) });
    let d = {};
    try { d = await r.json(); } catch {}
    return { ok: r.ok, status: r.status, ...d };
  }

  const Account = {
    async me() {
      try { const r = await fetch("/api/me"); return await r.json(); }
      catch { return { loggedIn: false }; }
    },
    register(username, password) { return jpost("/api/account/register", { username, password }); },
    login(username, password) { return jpost("/api/account/login", { username, password }); },
    async logout() { try { await fetch("/api/logout", { method: "POST" }); } catch {} },

    // per-namespace cloud blob (used for targeted per-game sync)
    async load(ns) {
      try { const r = await fetch("/api/saves?ns=" + encodeURIComponent(ns)); if (!r.ok) return null; const d = await r.json(); return d.data; }
      catch { return null; }
    },
    async save(ns, data) {
      try { const r = await fetch("/api/saves?ns=" + encodeURIComponent(ns), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); return r.ok; }
      catch { return false; }
    },

    // whole-profile backup: mirrors all of localStorage (every game's saves + high scores)
    collectLocal() {
      const o = {};
      for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); }
      return o;
    },
    async backupAll() {
      const payload = { savedAt: Date.now(), data: this.collectLocal() };
      return this.save("profile", payload);
    },
    async restoreAll() {
      const blob = await this.load("profile");
      if (!blob || !blob.data) return { restored: 0, savedAt: null };
      let n = 0;
      for (const k in blob.data) { try { localStorage.setItem(k, blob.data[k]); n++; } catch {} }
      return { restored: n, savedAt: blob.savedAt };
    },
    async lastBackup() {
      const blob = await this.load("profile");
      return blob ? blob.savedAt : null;
    },
  };

  global.Account = Account;
})(window);
