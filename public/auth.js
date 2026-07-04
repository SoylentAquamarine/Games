// Google Sign-In + One Tap wiring for the Games landing page.
(function () {
  const CLIENT_ID = window.GOOGLE_CLIENT_ID || "";
  const area = () => document.getElementById("auth-area");

  const configured =
    CLIENT_ID && !CLIENT_ID.startsWith("REPLACE_WITH_YOUR_CLIENT_ID");

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    // Already signed in? Show the user and skip Google prompts.
    const me = await getMe();
    if (me.loggedIn) {
      renderUser(me.user);
      return;
    }

    renderSignedOut();

    if (!configured) {
      // No Client ID yet — leave a hint instead of crashing.
      const hint = document.createElement("span");
      hint.className = "auth-hint";
      hint.textContent = "Google sign-in not configured yet";
      area().appendChild(hint);
      return;
    }

    await waitForGsi();
    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: handleCredentialResponse,
      use_fedcm_for_prompt: true,
      auto_select: true,
    });
    google.accounts.id.renderButton(document.getElementById("g_signin"), {
      theme: "filled_blue",
      size: "large",
      shape: "pill",
      text: "signin_with",
    });
    // One Tap — the popup that appears automatically on visit.
    google.accounts.id.prompt();
  }

  async function handleCredentialResponse(response) {
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: response.credential }),
    });
    const data = await res.json().catch(() => ({}));
    if (data.loggedIn) {
      renderUser(data.user);
    } else {
      alert("Sign-in failed. Please try again.");
    }
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    if (window.google && google.accounts) {
      google.accounts.id.disableAutoSelect();
    }
    location.reload();
  }

  // --- UI ------------------------------------------------------------------

  function renderSignedOut() {
    area().innerHTML = '<div id="g_signin"></div>';
  }

  function renderUser(user) {
    const avatar = user.picture
      ? `<img class="avatar" src="${escapeAttr(user.picture)}" alt="" referrerpolicy="no-referrer" />`
      : "";
    area().innerHTML = `
      <div class="user">
        ${avatar}
        <span class="user-name">${escapeHtml(user.name || user.email)}</span>
        <button id="logout-btn" class="logout">Sign out</button>
      </div>`;
    document.getElementById("logout-btn").addEventListener("click", logout);
  }

  // --- helpers -------------------------------------------------------------

  async function getMe() {
    try {
      const r = await fetch("/api/me");
      return await r.json();
    } catch {
      return { loggedIn: false };
    }
  }

  function waitForGsi() {
    return new Promise((resolve) => {
      if (window.google && google.accounts && google.accounts.id) return resolve();
      const t = setInterval(() => {
        if (window.google && google.accounts && google.accounts.id) {
          clearInterval(t);
          resolve();
        }
      }, 100);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[c]);
  }
  function escapeAttr(s) {
    return escapeHtml(s);
  }
})();
