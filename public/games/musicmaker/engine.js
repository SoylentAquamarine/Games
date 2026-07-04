// Music Maker — shared audio engine.
// Used by Beat Maker, Music Maker (melody), and (later) Band Composer.
//
// Design goals:
//  - One AudioContext + master bus, created lazily on first user gesture.
//  - A registry of synth INSTRUMENTS (melodic) that can grow without limit.
//  - A full synthesized DRUMKIT (no samples) so it stays self-contained.
//  - A generic look-ahead transport: the caller supplies onStep(step,time)
//    to schedule sound and onDraw(step) to move a playhead. The engine does
//    not know or care about voice counts or data shapes — modes own that.
(function (global) {
  "use strict";

  let ctx = null, master = null, noiseBuf = null;
  let masterVol = 0.7;

  function ensure() {
    if (ctx) return;
    ctx = new (global.AudioContext || global.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = masterVol;
    master.connect(ctx.destination);
    const len = Math.floor(ctx.sampleRate * 0.5);
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  function resume() { if (ctx && ctx.state === "suspended") ctx.resume(); }
  function setMaster(v) { masterVol = v; if (master) master.gain.value = v; }
  function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  function noiseSource(hp, lp) {
    const s = ctx.createBufferSource();
    s.buffer = noiseBuf;
    let node = s;
    if (hp) { const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = hp; node.connect(f); node = f; }
    if (lp) { const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = lp; node.connect(f); node = f; }
    return { src: s, out: node };
  }
  function env(node, time, peak, dur, attack) {
    node.gain.setValueAtTime(0.0001, time);
    node.gain.linearRampToValueAtTime(peak, time + (attack || 0.002));
    node.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  }

  // ---------------------------------------------------------------- instruments
  const INSTRUMENTS = [
    { id: "piano",   name: "Grand Piano",     type: "triangle", a: .004, d: .5,  s: .0,  r: .15, g: .34 },
    { id: "epiano",  name: "Electric Piano",  type: "sine",     a: .004, d: .4,  s: .15, r: .2,  g: .34, fat: true },
    { id: "organ",   name: "Organ",           type: "sine",     a: .01,  d: .05, s: .9,  r: .1,  g: .26, fat: true },
    { id: "lead",    name: "Synth Lead",      type: "sawtooth", a: .01,  d: .2,  s: .5,  r: .12, g: .22 },
    { id: "bass",    name: "Synth Bass",      type: "square",   a: .005, d: .25, s: .4,  r: .1,  g: .28 },
    { id: "bell",    name: "Bell",            type: "sine",     a: .002, d: 1.1, s: .0,  r: .3,  g: .32 },
    { id: "pluck",   name: "Pluck",           type: "sawtooth", a: .002, d: .18, s: .0,  r: .08, g: .28 },
    { id: "strings", name: "Strings",         type: "sawtooth", a: .08,  d: .3,  s: .7,  r: .3,  g: .2,  fat: true },
  ];
  const INST_BY_ID = Object.fromEntries(INSTRUMENTS.map((i) => [i.id, i]));

  function playNote(instId, freq, time, dur, vel) {
    ensure();
    const I = INST_BY_ID[instId] || INSTRUMENTS[0];
    const v = vel == null ? 1 : vel;
    const g = ctx.createGain(); g.connect(master);
    const oscs = [];
    const mk = (det) => { const o = ctx.createOscillator(); o.type = I.type; o.frequency.value = freq; if (det) o.detune.value = det; o.connect(g); oscs.push(o); };
    mk(0); if (I.fat) { mk(-7); mk(7); }
    const peak = I.g * v, end = time + dur;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(peak, time + I.a);
    g.gain.linearRampToValueAtTime(Math.max(peak * I.s, 0.0001), time + I.a + I.d);
    g.gain.setValueAtTime(Math.max(peak * I.s, 0.0001), end);
    g.gain.exponentialRampToValueAtTime(0.0001, end + I.r);
    oscs.forEach((o) => { o.start(time); o.stop(end + I.r + 0.02); });
  }

  // ---------------------------------------------------------------- drum kit
  function tone(type, f0, f1, time, dur, peak) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, time);
    if (f1 != null) o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), time + dur);
    o.connect(g); g.connect(master);
    g.gain.setValueAtTime(peak, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.start(time); o.stop(time + dur + 0.02);
  }

  const KIT = {
    kick(t, v) { tone("sine", 150, 48, t, 0.18, 0.95 * v); },
    snare(t, v) {
      const n = noiseSource(1200); const g = ctx.createGain(); n.out.connect(g); g.connect(master);
      env(g, t, 0.6 * v, 0.18); n.src.start(t); n.src.stop(t + 0.2);
      tone("triangle", 180, null, t, 0.12, 0.3 * v);
    },
    hatClosed(t, v) { const n = noiseSource(8000); const g = ctx.createGain(); n.out.connect(g); g.connect(master); env(g, t, 0.4 * v, 0.04); n.src.start(t); n.src.stop(t + 0.05); },
    hatOpen(t, v) { const n = noiseSource(7500); const g = ctx.createGain(); n.out.connect(g); g.connect(master); env(g, t, 0.38 * v, 0.32); n.src.start(t); n.src.stop(t + 0.34); },
    crash(t, v) { const n = noiseSource(4000); const g = ctx.createGain(); n.out.connect(g); g.connect(master); env(g, t, 0.5 * v, 1.4); n.src.start(t); n.src.stop(t + 1.42); },
    ride(t, v) {
      const n = noiseSource(6500); const g = ctx.createGain(); n.out.connect(g); g.connect(master); env(g, t, 0.24 * v, 0.5); n.src.start(t); n.src.stop(t + 0.52);
      tone("square", 3200, null, t, 0.12, 0.06 * v);
    },
    tomHi(t, v) { tone("triangle", 260, 130, t, 0.28, 0.6 * v); },
    tomMid(t, v) { tone("triangle", 180, 90, t, 0.32, 0.6 * v); },
    tomLo(t, v) { tone("triangle", 120, 60, t, 0.36, 0.62 * v); },
    clap(t, v) { for (let k = 0; k < 3; k++) { const tt = t + k * 0.02; const n = noiseSource(1000); const g = ctx.createGain(); n.out.connect(g); g.connect(master); env(g, tt, 0.4 * v, 0.09); n.src.start(tt); n.src.stop(tt + 0.1); } },
    cowbell(t, v) {
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 2640; bp.Q.value = 2;
      const g = ctx.createGain(); bp.connect(g); g.connect(master);
      const o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
      o1.type = o2.type = "square"; o1.frequency.value = 540; o2.frequency.value = 800;
      o1.connect(bp); o2.connect(bp);
      g.gain.setValueAtTime(0.4 * v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      o1.start(t); o2.start(t); o1.stop(t + 0.36); o2.stop(t + 0.36);
    },
    rimshot(t, v) {
      tone("triangle", 1700, null, t, 0.03, 0.5 * v);
      const n = noiseSource(2500); const g = ctx.createGain(); n.out.connect(g); g.connect(master); env(g, t, 0.3 * v, 0.03); n.src.start(t); n.src.stop(t + 0.04);
    },
    shaker(t, v) { const n = noiseSource(6000); const g = ctx.createGain(); n.out.connect(g); g.connect(master); env(g, t, 0.22 * v, 0.06); n.src.start(t); n.src.stop(t + 0.07); },
    glass(t, v) {
      tone("sine", 2100, null, t, 0.25, 0.3 * v);
      const n = noiseSource(3000); const g = ctx.createGain(); n.out.connect(g); g.connect(master); env(g, t, 0.08 * v, 0.03); n.src.start(t); n.src.stop(t + 0.04);
    },
  };

  // Ordered kit for the Beat Maker UI.
  const DRUMKIT = [
    { id: "kick",      label: "Kick",        emoji: "🥁" },
    { id: "snare",     label: "Snare",       emoji: "🪘" },
    { id: "hatClosed", label: "Hi-Hat (closed)", emoji: "🎩" },
    { id: "hatOpen",   label: "Hi-Hat (open)",   emoji: "👒" },
    { id: "crash",     label: "Crash",       emoji: "💥" },
    { id: "ride",      label: "Ride",        emoji: "🛎️" },
    { id: "tomHi",     label: "Tom (high)",  emoji: "🔺" },
    { id: "tomMid",    label: "Tom (mid)",   emoji: "🔸" },
    { id: "tomLo",     label: "Tom (low)",   emoji: "🔻" },
    { id: "clap",      label: "Clap",        emoji: "👏" },
    { id: "cowbell",   label: "Cowbell",     emoji: "🐄" },
    { id: "rimshot",   label: "Rimshot",     emoji: "🎯" },
    { id: "shaker",    label: "Shaker",      emoji: "🧂" },
    { id: "glass",     label: "Glass Tap",   emoji: "🍶" },
  ];

  function playDrum(id, time, vel) {
    ensure();
    const fn = KIT[id];
    if (fn) fn(time == null ? ctx.currentTime : time, vel == null ? 1 : vel);
  }

  // ---------------------------------------------------------------- transport
  let playing = false, curStep = 0, nextTime = 0, schedTimer = null, rafId = null, drawStep = -1;
  const queue = [];
  let cfg = null;

  function start(config) {
    ensure(); resume();
    cfg = config;                 // { steps, getBpm(), onStep(step,time), onDraw(step) }
    playing = true; curStep = 0; drawStep = -1; queue.length = 0;
    nextTime = ctx.currentTime + 0.06;
    scheduler(); drawLoop();
  }
  function scheduler() {
    if (!playing) return;
    const sps = () => (60 / cfg.getBpm()) / 4;   // seconds per 16th step
    while (nextTime < ctx.currentTime + 0.1) {
      cfg.onStep(curStep, nextTime);
      queue.push({ step: curStep, time: nextTime });
      nextTime += sps();
      curStep = (curStep + 1) % cfg.steps;
    }
    schedTimer = setTimeout(scheduler, 25);
  }
  function drawLoop() {
    if (!playing) return;
    const now = ctx.currentTime; let s = drawStep;
    while (queue.length && queue[0].time <= now) s = queue.shift().step;
    if (s !== drawStep) { drawStep = s; if (cfg.onDraw) cfg.onDraw(s); }
    rafId = requestAnimationFrame(drawLoop);
  }
  function stop() {
    playing = false;
    clearTimeout(schedTimer); cancelAnimationFrame(rafId);
    if (cfg && cfg.onDraw) cfg.onDraw(-1);
  }

  global.MME = {
    ensure, resume, setMaster, midiToFreq,
    playNote, playDrum,
    INSTRUMENTS, DRUMKIT,
    ctx: () => ctx,
    transport: { start, stop, isPlaying: () => playing },
  };
})(window);
