// Shared arcade furniture for every game on the site.
//
//   <script src="/arcade.js"></script>
//
// Gives three things that were previously reimplemented (or missing) per game:
//   Arcade.sfx     — synthesised sound effects, no audio files to load
//   Arcade.splash  — between-wave / death splash screens on a canvas
//   Arcade.SCREEN  — the shared 4:3 screen standard so games feel consistent
//
// Everything degrades quietly: with no WebAudio the sfx calls are no-ops, and
// the splash helpers are plain canvas drawing with no dependencies.
(function (global) {
  "use strict";

  // --- the house screen standard -------------------------------------------
  // 4:3 like an old TV. Games pick a tier; sprites keep their own sizes so the
  // playfield gets roomier rather than everything scaling up.
  const SCREEN = {
    ratio: 4 / 3,
    small:  { w: 480, h: 360 },
    medium: { w: 560, h: 420 },
    large:  { w: 640, h: 480 },
    // Max CSS width a game should display at, so every game feels the same size.
    cssMax: 560,
  };

  // Apply the standard to a canvas: sets the backing size and the CSS box.
  function fitScreen(canvas, tier) {
    const t = SCREEN[tier || "medium"] || SCREEN.medium;
    canvas.width = t.w; canvas.height = t.h;
    canvas.style.width = "min(96vw," + SCREEN.cssMax + "px)";
    canvas.style.height = "auto";
    canvas.style.aspectRatio = t.w + "/" + t.h;
    return t;
  }

  // --- sound ---------------------------------------------------------------
  // Tiny WebAudio synth. Browsers block audio until a user gesture, so the
  // context is created lazily on the first play and resumed on any input.
  let actx = null, muted = false;
  try { muted = localStorage.getItem("arcade_muted") === "1"; } catch (e) {}

  function ctx() {
    if (actx) return actx;
    const AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return null;
    try { actx = new AC(); } catch (e) { return null; }
    return actx;
  }
  function resume() { const a = ctx(); if (a && a.state === "suspended") a.resume(); }

  // One shaped oscillator burst.
  function tone(opts) {
    if (muted) return;
    const a = ctx(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain();
    const t0 = a.currentTime;
    const dur = opts.dur || 0.12;
    o.type = opts.type || "square";
    o.frequency.setValueAtTime(opts.from || 440, t0);
    if (opts.to && opts.to !== opts.from) o.frequency.exponentialRampToValueAtTime(Math.max(1, opts.to), t0 + dur);
    const vol = (opts.vol == null ? 0.16 : opts.vol);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(a.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }
  // Filtered white noise, for explosions and thumps.
  function noise(opts) {
    if (muted) return;
    const a = ctx(); if (!a) return;
    const dur = opts.dur || 0.25;
    const n = Math.floor(a.sampleRate * dur);
    const buf = a.createBuffer(1, n, a.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = a.createBufferSource(); src.buffer = buf;
    const f = a.createBiquadFilter(); f.type = "lowpass";
    f.frequency.setValueAtTime(opts.cut || 1200, a.currentTime);
    if (opts.cutTo) f.frequency.exponentialRampToValueAtTime(Math.max(1, opts.cutTo), a.currentTime + dur);
    const g = a.createGain(); g.gain.setValueAtTime(opts.vol == null ? 0.22 : opts.vol, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
    src.connect(f); f.connect(g); g.connect(a.destination);
    src.start();
  }

  const sfx = {
    shoot:   () => tone({ from: 880, to: 220, dur: 0.10, type: "square", vol: 0.12 }),
    hit:     () => tone({ from: 320, to: 120, dur: 0.12, type: "square", vol: 0.16 }),
    explode: () => noise({ dur: 0.38, cut: 1600, cutTo: 120, vol: 0.26 }),
    pickup:  () => tone({ from: 660, to: 1320, dur: 0.12, type: "triangle", vol: 0.14 }),
    coin:    () => { tone({ from: 988, dur: 0.07, type: "square", vol: 0.13 });
                     setTimeout(() => tone({ from: 1319, dur: 0.13, type: "square", vol: 0.13 }), 70); },
    jump:    () => tone({ from: 300, to: 720, dur: 0.13, type: "square", vol: 0.13 }),
    step:    () => tone({ from: 180, to: 140, dur: 0.05, type: "square", vol: 0.07 }),
    bounce:  () => tone({ from: 520, to: 300, dur: 0.08, type: "triangle", vol: 0.12 }),
    death:   () => { noise({ dur: 0.5, cut: 900, cutTo: 60, vol: 0.3 });
                     tone({ from: 340, to: 60, dur: 0.55, type: "sawtooth", vol: 0.16 }); },
    wave:    () => { [523, 659, 784].forEach((f, i) =>
                     setTimeout(() => tone({ from: f, dur: 0.16, type: "square", vol: 0.14 }), i * 110)); },
    win:     () => { [523, 659, 784, 1047].forEach((f, i) =>
                     setTimeout(() => tone({ from: f, dur: 0.20, type: "triangle", vol: 0.15 }), i * 130)); },
    lose:    () => { [392, 330, 262].forEach((f, i) =>
                     setTimeout(() => tone({ from: f, dur: 0.24, type: "sawtooth", vol: 0.15 }), i * 170)); },
    mute(on) { muted = on == null ? !muted : !!on;
               try { localStorage.setItem("arcade_muted", muted ? "1" : "0"); } catch (e) {}
               return muted; },
    get muted() { return muted; },
    resume,
  };

  // Any first gesture unlocks audio.
  if (typeof document !== "undefined" && document.addEventListener) {
    const wake = () => { resume(); };
    document.addEventListener("pointerdown", wake, { once: false, passive: true });
    document.addEventListener("keydown", wake, { once: false, passive: true });
  }

  // --- splash screens ------------------------------------------------------
  // A splash is just a countdown a game ticks each frame; draw() renders it.
  // Typical use:
  //   this.sp = Arcade.splash.wave(2, "Feathers");
  //   ... in update: if (Arcade.splash.tick(sp)) sp = null;
  //   ... in render: Arcade.splash.draw(ctx, W, H, sp);
  const FRAMES_2S = 120;

  const splash = {
    wave(n, name, frames) {
      return { kind: "wave", title: "WAVE " + n, sub: name ? String(name).toUpperCase() + "!" : "",
               life: frames || FRAMES_2S, max: frames || FRAMES_2S };
    },
    death(msg, sub, frames) {
      return { kind: "death", title: msg || "YOU DIED", sub: sub || "",
               life: frames || FRAMES_2S, max: frames || FRAMES_2S };
    },
    message(title, sub, frames) {
      return { kind: "msg", title: title, sub: sub || "", life: frames || FRAMES_2S, max: frames || FRAMES_2S };
    },
    // Returns true on the frame the splash finishes.
    tick(sp) { if (!sp) return false; return --sp.life <= 0; },
    active(sp) { return !!sp && sp.life > 0; },
    draw(c, W, H, sp) {
      if (!sp || sp.life <= 0) return;
      const p = sp.life / sp.max;                 // 1 -> 0
      const fade = Math.min(1, p * 3, (1 - p) * 6 + 0.25);
      c.save();
      c.fillStyle = "rgba(4,6,16," + (0.72 * Math.min(1, p * 4)) + ")";
      c.fillRect(0, 0, W, H);
      c.textAlign = "center";
      const shake = sp.kind === "death" ? (Math.random() - 0.5) * 4 : 0;
      const gold = sp.kind === "death" ? "#f43f5e" : "#ffcf5a";
      c.fillStyle = "rgba(0,0,0,.55)";
      c.font = "bold " + Math.round(W * 0.075) + "px system-ui";
      c.fillText(sp.title, W / 2 + 2 + shake, H / 2 - 4 + 2);
      c.fillStyle = gold;
      c.globalAlpha = fade;
      c.fillText(sp.title, W / 2 + shake, H / 2 - 4);
      if (sp.sub) {
        c.fillStyle = "#e6e6f0";
        c.font = Math.round(W * 0.042) + "px system-ui";
        c.fillText(sp.sub, W / 2, H / 2 + Math.round(W * 0.055));
      }
      // thin progress bar so the wait reads as deliberate, not a freeze
      c.globalAlpha = 0.5 * fade;
      c.fillStyle = gold;
      const bw = W * 0.34, bx = (W - bw) / 2, by = H / 2 + Math.round(W * 0.10);
      c.fillRect(bx, by, bw * (1 - p), 3);
      c.restore();
    },
    FRAMES_2S,
  };

  // ---------------------------------------------------------------------
  // startGate — the canvas equivalent of /startgate.js.
  //
  // Games that paint their own screen can't use a DOM overlay: their loop is
  // already running, so an overlay would just sit on top of a game in progress.
  // This gives the loop a flag to hold on instead:
  //
  //   const GATE = Arcade.startGate(canvas, "Galaga");
  //   function frame(){
  //     if(!GATE.open){ draw(); GATE.paint(); return requestAnimationFrame(frame); }
  //     ...
  //   }
  //
  // It swallows the opening press so the same keystroke does not also reach the
  // game and fire on frame one.
  function startGate(canvas, title) {
    const gate = { open: false };
    const ctx = canvas.getContext("2d");

    gate.paint = function () {
      const W = canvas.width, H = canvas.height, u = Math.min(W, H);
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,.62)";
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = "center";
      if (title) {
        ctx.fillStyle = "#ffcf5a";
        ctx.font = "bold " + Math.round(u * 0.082) + "px system-ui";
        ctx.fillText(String(title).toUpperCase(), W / 2, H / 2 - u * 0.03);
      }
      ctx.fillStyle = "#e6e6f0";
      ctx.font = Math.round(u * 0.046) + "px system-ui";
      ctx.globalAlpha = 0.55 + 0.45 * Math.sin(Date.now() / 380);
      ctx.fillText("PRESS SPACEBAR TO BEGIN", W / 2, H / 2 + u * 0.055);
      ctx.globalAlpha = 0.4;
      ctx.font = Math.round(u * 0.036) + "px system-ui";
      ctx.fillText("or tap to start", W / 2, H / 2 + u * 0.115);
      ctx.restore();
    };

    function opener(e) {
      if (gate.open) return;
      if (e && e.type === "keydown" && e.key !== " " && e.key !== "Enter") return;
      gate.open = true;
      if (e) {
        if (e.preventDefault) e.preventDefault();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      }
      try { sfx.coin(); } catch (_) {}
    }
    addEventListener("keydown", opener, true);
    canvas.addEventListener("pointerdown", opener, true);
    canvas.addEventListener("touchstart", opener, true);

    // call from New Game if the gate should come back
    gate.reset = function () { gate.open = false; };
    return gate;
  }

  // ---------------------------------------------------------------------
  // stats — per-game play history behind the account report.
  //
  //   Arcade.stats.record("galaga", 4200)   // call once per finished game
  //
  // Kept in localStorage so it rides along with the existing cloud backup,
  // which mirrors the whole of localStorage.
  const STATS_KEY = "arcade:stats:v1";

  // Games call record() from inside their frame loop, so it fires many times a
  // second with the running score — it is NOT one call per finished game. So a
  // call is treated as a running session rather than a new play: the first
  // scoring call opens a session and counts one play, later calls just extend
  // that same session's score, and the score dropping back to zero means a new
  // game has begun. Counting every call as a play would have logged tens of
  // thousands of plays a minute and made the averages meaningless.
  const session = Object.create(null);
  const stats = {
    all() {
      try { return JSON.parse(localStorage.getItem(STATS_KEY) || "{}"); }
      catch (_) { return {}; }
    },
    record(slug, score) {
      if (!slug) return;
      const n = Number(score);
      if (!Number.isFinite(n)) return;

      const live = session[slug];
      // a fresh game: no session yet, or the score has fallen back to zero
      const restarted = live && n === 0 && live.last > 0;
      if (!live || restarted) {
        if (n <= 0) {                       // nothing scored yet; wait for the first point
          if (restarted) delete session[slug];
          return;
        }
        return commit(slug, n, true);
      }
      if (n === live.last) return;          // idling on the game-over screen
      return commit(slug, n, false);
    },
    // explicit hook for games that want to force a new session
    newSession(slug) { delete session[slug]; },
    reset() {
      for (const k of Object.keys(session)) delete session[k];
      try { localStorage.removeItem(STATS_KEY); } catch (_) {}
    },
  };

  function commit(slug, n, isNewPlay) {
    const all = stats.all();
    const g = all[slug] || { plays: 0, total: 0, best: null, last: null, at: 0 };
    if (isNewPlay) {
      g.plays += 1;
      g.total += n;
      session[slug] = { last: n };
    } else {
      // same play continuing — add only what the score went up by
      g.total += n - session[slug].last;
      session[slug].last = n;
    }
    g.last = n;
    if (g.best === null || n > g.best) g.best = n;
    g.at = Date.now();
    all[slug] = g;
    try { localStorage.setItem(STATS_KEY, JSON.stringify(all)); } catch (_) {}
    return g;
  }

  global.Arcade = { SCREEN, fitScreen, sfx, splash, startGate, stats };
})(typeof window !== "undefined" ? window : globalThis);
