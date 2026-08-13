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

  // Player feedback (round 2): "get it as close as you can" — a from-
  // scratch push to make the synthesized stand-in read much closer to the
  // real thing's well-documented acoustic shape, still built entirely from
  // oscillators/noise/filters (no sample of the actual recording — see
  // sfx.death()'s comment for why that stays off the table). The real
  // scream's widely-analyzed shape isn't a clean tone sweep: it's a fast
  // vocal attack, a wavering/raspy held note (vibrato + turbulent breath
  // noise + vowel-formant resonance, not a pure waveform), and a ragged
  // stuttering crack at the tail instead of a smooth fade-out. Each of
  // those is modeled here as its own signal, then mixed:
  //   - two detuned sawtooth voices (a cheap "chorus" trick — a single
  //     oscillator reads as flat/synthetic, two slightly out of tune
  //     against each other reads as an unsteady human voice)
  //   - an 8Hz vibrato LFO modulating their pitch, for the held-note waver
  //   - a bandpass "formant" filter coloring the tone voices toward a
  //     shouted-vowel resonance rather than a raw buzzy sawtooth
  //   - a waveshaper (tanh soft-clip) adding harmonic rasp/distortion —
  //     the harshness a strained human voice has that a clean tone lacks
  //   - band-filtered white noise mixed underneath for vocal breath/rasp
  //     texture (real screams are full of turbulent non-tonal noise)
  //   - a gain envelope with a brief dip-and-catch stutter near the end
  //     (a voice cracking drops out and catches again, it doesn't glide
  //     smoothly to silence)
  function scream() {
    if (muted) return;
    const a = ctx(); if (!a) return;
    const t0 = a.currentTime, dur = 0.82;

    const o1 = a.createOscillator(), o2 = a.createOscillator();
    o1.type = "sawtooth"; o2.type = "sawtooth";
    o2.detune.setValueAtTime(11, t0);
    [o1, o2].forEach((o) => {
      o.frequency.setValueAtTime(480, t0);
      o.frequency.linearRampToValueAtTime(1050, t0 + dur * 0.10);
      o.frequency.linearRampToValueAtTime(880, t0 + dur * 0.22);
      o.frequency.linearRampToValueAtTime(960, t0 + dur * 0.40);
      o.frequency.linearRampToValueAtTime(900, t0 + dur * 0.60);
      o.frequency.linearRampToValueAtTime(520, t0 + dur * 0.82);
      o.frequency.linearRampToValueAtTime(210, t0 + dur);
    });

    const lfo = a.createOscillator(), lfoGain = a.createGain();
    lfo.frequency.setValueAtTime(8, t0);
    lfoGain.gain.setValueAtTime(35, t0);
    lfo.connect(lfoGain); lfoGain.connect(o1.frequency); lfoGain.connect(o2.frequency);

    const nBuf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
    const nd = nBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const nSrc = a.createBufferSource(); nSrc.buffer = nBuf;
    const nFilt = a.createBiquadFilter(); nFilt.type = "bandpass";
    nFilt.frequency.setValueAtTime(1200, t0);
    nFilt.frequency.linearRampToValueAtTime(500, t0 + dur);
    nFilt.Q.setValueAtTime(2.2, t0);
    const nGain = a.createGain();
    nGain.gain.setValueAtTime(0.0001, t0);
    nGain.gain.linearRampToValueAtTime(0.05, t0 + dur * 0.15);
    nGain.gain.linearRampToValueAtTime(0.035, t0 + dur * 0.7);
    nGain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    const shaper = a.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = (i / 255) * 2 - 1; curve[i] = Math.tanh(x * 2.4); }
    shaper.curve = curve; shaper.oversample = "2x";

    const formant = a.createBiquadFilter();
    formant.type = "bandpass";
    formant.frequency.setValueAtTime(1500, t0);
    formant.Q.setValueAtTime(1.1, t0);

    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.22, t0 + 0.025);
    g.gain.exponentialRampToValueAtTime(0.16, t0 + dur * 0.55);
    g.gain.exponentialRampToValueAtTime(0.19, t0 + dur * 0.68);
    g.gain.exponentialRampToValueAtTime(0.05, t0 + dur * 0.74);
    g.gain.exponentialRampToValueAtTime(0.14, t0 + dur * 0.8);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    o1.connect(formant); o2.connect(formant);
    formant.connect(shaper); shaper.connect(g);
    nSrc.connect(nFilt); nFilt.connect(nGain); nGain.connect(g);
    g.connect(a.destination);

    o1.start(t0); o2.start(t0); lfo.start(t0); nSrc.start(t0);
    o1.stop(t0 + dur + 0.02); o2.stop(t0 + dur + 0.02); lfo.stop(t0 + dur + 0.02);
  }

  const sfx = {
    // Player feedback: "laser blast sounds should be more than just a puck
    // sound." The old shoot() was a single flat square-wave sweep, always
    // identical, always thin — read more like a hockey-puck blip than a
    // laser. Sawtooth gives it the harsher harmonic buzz a laser needs;
    // slight per-shot pitch randomization keeps rapid fire from sounding
    // like the exact same note on a loop; a very short high-cut noise burst
    // at the front adds the "zap" crack real laser SFX have alongside the
    // tonal sweep.
    shoot:   () => { const f = 1000 + Math.random() * 260;
                     tone({ from: f, to: 160 + Math.random() * 60, dur: 0.09 + Math.random() * 0.03, type: "sawtooth", vol: 0.13 });
                     noise({ dur: 0.035, cut: 5000, cutTo: 1800, vol: 0.05 }); },
    hit:     () => tone({ from: 320, to: 120, dur: 0.12, type: "square", vol: 0.16 }),
    explode: () => noise({ dur: 0.38, cut: 1600, cutTo: 120, vol: 0.26 }),
    pickup:  () => tone({ from: 660, to: 1320, dur: 0.12, type: "triangle", vol: 0.14 }),
    coin:    () => { tone({ from: 988, dur: 0.07, type: "square", vol: 0.13 });
                     setTimeout(() => tone({ from: 1319, dur: 0.13, type: "square", vol: 0.13 }), 70); },
    jump:    () => tone({ from: 300, to: 720, dur: 0.13, type: "square", vol: 0.13 }),
    step:    () => tone({ from: 180, to: 140, dur: 0.05, type: "square", vol: 0.07 }),
    power:   () => tone({ from: 200, to: 640, dur: 0.28, type: "sawtooth", vol: 0.15 }),
    warn:    () => tone({ from: 900, dur: 0.05, type: "square", vol: 0.10 }),
    bounce:  () => tone({ from: 520, to: 300, dur: 0.08, type: "triangle", vol: 0.12 }),
    // Player feedback: "find the wilhelm scream and incorporate that as the
    // sound when I die," then "get it as close as you can." The actual
    // film sample is a specific, still-copyrighted Warner Bros. recording —
    // not something to fetch from the web and embed as a downloaded asset,
    // no matter how closely requested. scream() (above) is a from-scratch
    // synthesis pass built to match its widely-documented acoustic shape
    // as closely as oscillators/noise/filters can get: vibrato, formant
    // coloring, distortion rasp, and a stuttering crack at the tail,
    // rather than a plain tone sweep. Wired into death() (not the generic
    // hit()) since every game already calls death() specifically for the
    // player's own death — no per-game changes needed.
    death:   () => { noise({ dur: 0.5, cut: 900, cutTo: 60, vol: 0.3 });
                     tone({ from: 340, to: 60, dur: 0.55, type: "sawtooth", vol: 0.16 });
                     scream(); },
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
      // Several games render at a bigger backing-store resolution than their
      // logical coordinate space (canvas.width/height scaled up for a crisper
      // display + devicePixelRatio, with a single ctx.scale() applied once at
      // setup so their own draw calls stay in logical units). This function
      // used to read canvas.width/height directly, ignoring that active
      // transform -- on those games the gate's title/press-text rendered at
      // the RAW backing-store size, then got scaled up AGAIN by the already-
      // active transform, coming out enormous and badly mispositioned.
      // Dividing by the transform's own scale factor recovers the logical
      // size those games actually draw in; on every other game (no transform
      // applied, scale 1) this is a no-op and behaves exactly as before.
      const t = ctx.getTransform();
      const W = canvas.width / (t.a || 1), H = canvas.height / (t.d || 1), u = Math.min(W, H);
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

    // Typing in the feedback box must never be treated as starting the game —
    // otherwise every space in a comment gets eaten.
    function isTyping(el) {
      if (!el) return false;
      const tag = (el.tagName || "").toLowerCase();
      return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable;
    }
    function opener(e) {
      if (gate.open) return;
      if (e && e.type === "keydown") {
        if (e.key !== " " && e.key !== "Enter") return;
        if (isTyping(e.target)) return;
      }
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
