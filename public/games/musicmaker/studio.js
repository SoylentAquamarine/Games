// Studio — shared multi-bar "full piece" arranger for Music Maker & Band Composer.
// Runs on the shared audio engine (window.MME). The host page provides a fixed
// set of element ids; Studio.init(config) wires everything and builds the grids.
//
// A song = N bars. Each bar has 16 steps. You edit one bar at a time with a
// navigator; playback runs the whole song start-to-end (no loop), or you can
// loop just the current bar to audition it. Length is capped by config.capSeconds.
(function (global) {
  "use strict";
  const STEPS = 16;
  const NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  const BLACK = new Set([1,3,6,8,10]);
  const VCOLORS = ["#f43f5e","#fb923c","#eab308","#4ade80","#22d3ee","#7c5cff","#e879f9","#f472b6","#38bdf8","#a3e635","#fca5a5","#c084fc"];
  const id = (x) => document.getElementById(x);
  const fmt = (sec) => { sec = Math.round(sec); return Math.floor(sec/60)+":"+String(sec%60).padStart(2,"0"); };

  function init(cfg) {
    cfg.maxVoices = cfg.maxVoices || cfg.voiceCount;
    const PITCHES = []; for (let m = cfg.highMidi; m >= cfg.lowMidi; m--) PITCHES.push(m);
    const INSTS = cfg.instruments;
    const KIT = cfg.drumKit;

    // ---- state ----
    let bpm = 110, master = 0.7, bars = 8, viewBar = 0, current = 0;
    let voices = [], drums = {};
    let playMode = null;   // "song" | "loop" | null

    function makeVoice(i) {
      return { instrument: cfg.defaultInstruments[i % cfg.defaultInstruments.length] || INSTS[0].id,
               chair: 1, muted: false, notes: new Set() };
    }
    function resetState() {
      voices = Array.from({ length: cfg.voiceCount }, (_, i) => makeVoice(i));
      drums = {}; KIT.forEach((k) => drums[k] = new Set());
      bars = 8; viewBar = 0; current = 0;
    }

    // ---- DOM build ----
    const rollCells = [], drumCells = {};
    let chairSel = null;

    function buildRoll() {
      const roll = id("roll"); roll.innerHTML = ""; rollCells.length = 0;
      for (let p = 0; p < PITCHES.length; p++) {
        const m = PITCHES[p], isB = BLACK.has(((m % 12) + 12) % 12);
        const lbl = document.createElement("div"); lbl.className = "rlabel" + (isB ? " black" : "");
        lbl.textContent = NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1); roll.appendChild(lbl);
        rollCells[p] = [];
        for (let s = 0; s < STEPS; s++) {
          const c = document.createElement("div"); c.className = "rc " + (isB ? "bl" : "wr") + (s % 4 === 0 ? " beat" : "");
          c.addEventListener("click", () => toggleNote(s, p));
          roll.appendChild(c); rollCells[p][s] = c;
        }
      }
    }
    function buildDrums() {
      const d = id("drums"); d.innerHTML = "";
      for (const dr of KIT) {
        const lbl = document.createElement("div"); lbl.className = "dlabel"; lbl.textContent = (cfg.drumLabels && cfg.drumLabels[dr]) || dr; d.appendChild(lbl);
        drumCells[dr] = [];
        for (let s = 0; s < STEPS; s++) {
          const c = document.createElement("div"); c.className = "dc" + (s % 4 === 0 ? " beat" : "");
          c.addEventListener("click", () => toggleDrum(dr, s));
          d.appendChild(c); drumCells[dr][s] = c;
        }
      }
    }
    function buildInst() {
      const s = id("inst"); s.innerHTML = "";
      INSTS.forEach((I) => { const o = document.createElement("option"); o.value = I.id; o.textContent = I.name; s.appendChild(o); });
      if (cfg.chairs && !chairSel) {
        const lbl = document.createElement("label"); lbl.className = "ctl"; lbl.textContent = "Chair ";
        chairSel = document.createElement("select");
        [1,2,3,4,5].forEach((n) => { const o = document.createElement("option"); o.value = n; o.textContent = n + (["st","nd","rd","th","th"][n-1]); chairSel.appendChild(o); });
        chairSel.addEventListener("change", () => { voices[current].chair = +chairSel.value; });
        lbl.appendChild(chairSel); id("inst").parentNode.after(lbl);
      }
    }
    function buildVoiceControls() {
      if (cfg.maxVoices <= cfg.voiceCount) return;
      const bar = document.createElement("div"); bar.className = "row"; bar.style.marginTop = "8px";
      const add = document.createElement("button"); add.className = "btn ghost sm"; add.textContent = "＋ Add voice";
      const rem = document.createElement("button"); rem.className = "btn ghost sm"; rem.textContent = "－ Remove voice";
      add.addEventListener("click", () => { if (voices.length < cfg.maxVoices) { voices.push(makeVoice(voices.length)); current = voices.length - 1; buildVoices(); selectVoice(current); } });
      rem.addEventListener("click", () => { if (voices.length > 1) { voices.splice(current, 1); current = Math.min(current, voices.length - 1); buildVoices(); selectVoice(current); } });
      bar.appendChild(add); bar.appendChild(rem);
      id("voices").parentNode.appendChild(bar);
    }
    function buildVoices() {
      const box = id("voices"); box.innerHTML = "";
      box.style.gridTemplateColumns = "repeat(" + Math.min(voices.length, 8) + ",1fr)";
      voices.forEach((v, i) => {
        const el = document.createElement("div");
        el.className = "voice" + (i === current ? " active" : "") + (v.muted ? " muted" : "");
        const nm = INSTS.find((x) => x.id === v.instrument);
        const chair = cfg.chairs ? (" · " + v.chair) : "";
        el.innerHTML = `<span class="vn">${i + 1}</span><span class="vi">${(nm ? nm.name : v.instrument)}${chair}</span><div class="swatch" style="background:${VCOLORS[i % VCOLORS.length]}"></div>`;
        el.addEventListener("click", () => selectVoice(i));
        el.addEventListener("dblclick", () => { v.muted = !v.muted; buildVoices(); });
        box.appendChild(el);
      });
    }
    function buildJump() {
      const j = id("jump"); j.innerHTML = "";
      for (let b = 0; b < bars; b++) { const o = document.createElement("option"); o.value = b; o.textContent = "Bar " + (b + 1); j.appendChild(o); }
      j.value = viewBar;
    }

    // ---- rendering ----
    function key(bar, step, pitch) { return bar + "_" + step + "_" + pitch; }
    function selectVoice(i) { current = i; id("editing-label").textContent = "Voice " + (i + 1); id("inst").value = voices[i].instrument; if (chairSel) chairSel.value = voices[i].chair; buildVoices(); renderGrid(); }
    function renderGrid() {
      const v = voices[current], col = VCOLORS[current % VCOLORS.length];
      for (let p = 0; p < PITCHES.length; p++) for (let s = 0; s < STEPS; s++) {
        const on = v.notes.has(key(viewBar, s, PITCHES[p])); const c = rollCells[p][s];
        c.classList.toggle("on", on); c.style.background = on ? col : "";
      }
    }
    function renderDrums() { for (const dr of KIT) for (let s = 0; s < STEPS; s++) drumCells[dr][s].classList.toggle("on", drums[dr].has(viewBar + "_" + s)); }
    function setViewBar(b) {
      viewBar = Math.max(0, Math.min(bars - 1, b));
      id("barpos").textContent = "Bar " + (viewBar + 1) + " / " + bars;
      id("editbar").textContent = "Bar " + (viewBar + 1);
      id("jump").value = viewBar;
      renderGrid(); renderDrums();
    }

    // ---- editing ----
    function gate() { return (60 / bpm) / 4 * 0.9; }
    function toggleNote(s, p) {
      MME.ensure(); MME.resume();
      const v = voices[current], k = key(viewBar, s, PITCHES[p]);
      if (v.notes.has(k)) v.notes.delete(k); else { v.notes.add(k); MME.playNote(v.instrument, MME.midiToFreq(PITCHES[p]), MME.ctx().currentTime, gate(), 1, chairDetune(v)); }
      const c = rollCells[p][s], on = v.notes.has(k); c.classList.toggle("on", on); c.style.background = on ? VCOLORS[current % VCOLORS.length] : "";
    }
    function toggleDrum(dr, s) {
      MME.ensure(); MME.resume();
      const k = viewBar + "_" + s;
      if (drums[dr].has(k)) drums[dr].delete(k); else { drums[dr].add(k); MME.playDrum(dr); }
      drumCells[dr][s].classList.toggle("on", drums[dr].has(k));
    }
    function chairDetune(v) { return cfg.chairs ? (v.chair - 3) * 5 : 0; }

    // ---- bar tools ----
    function duplicateBar() {
      if (viewBar + 1 >= bars) { status("No next bar — increase length first."); return; }
      const src = viewBar, dst = viewBar + 1, pre = src + "_";
      voices.forEach((v) => {
        [...v.notes].forEach((k) => { if (k.startsWith(dst + "_")) v.notes.delete(k); });
        [...v.notes].forEach((k) => { if (k.startsWith(pre)) v.notes.add(dst + "_" + k.substring(pre.length)); });
      });
      for (const dr of KIT) {
        [...drums[dr]].forEach((k) => { if (k.startsWith(dst + "_")) drums[dr].delete(k); });
        [...drums[dr]].forEach((k) => { if (k.startsWith(pre)) drums[dr].add(dst + "_" + k.substring(pre.length)); });
      }
      setViewBar(dst); status("Copied to bar " + (dst + 1) + ".");
    }
    function clearBar() {
      const pre = viewBar + "_";
      voices.forEach((v) => { [...v.notes].forEach((k) => { if (k.startsWith(pre)) v.notes.delete(k); }); });
      for (const dr of KIT) [...drums[dr]].forEach((k) => { if (k.startsWith(pre)) drums[dr].delete(k); });
      renderGrid(); renderDrums();
    }

    // ---- length / duration ----
    function barDur() { return (60 / bpm) * 4; }
    function maxBars() { return Math.max(1, Math.floor(cfg.capSeconds / barDur())); }
    function updateDuration() {
      const mx = maxBars();
      id("bars").max = mx;
      if (bars > mx) { bars = mx; }
      id("bars").value = bars;
      id("dur").textContent = fmt(bars * barDur());
      id("maxdur").textContent = fmt(cfg.capSeconds);
      if (viewBar >= bars) setViewBar(bars - 1);
      buildJump();
      id("barpos").textContent = "Bar " + (viewBar + 1) + " / " + bars;
    }
    function setBars(n) {
      n = Math.max(1, Math.min(maxBars(), Math.floor(n) || 1));
      bars = n; updateDuration();
    }

    // ---- transport ----
    function playBarStep(bar, step, time) {
      const g = gate();
      for (const v of voices) {
        if (v.muted) continue;
        const dt = chairDetune(v);
        for (let p = 0; p < PITCHES.length; p++) if (v.notes.has(key(bar, step, PITCHES[p]))) MME.playNote(v.instrument, MME.midiToFreq(PITCHES[p]), time, g, 1, dt);
      }
      for (const dr of KIT) if (drums[dr].has(bar + "_" + step)) MME.playDrum(dr, time);
    }
    function clearPH() { for (let p = 0; p < PITCHES.length; p++) for (let s = 0; s < STEPS; s++) rollCells[p][s].classList.remove("ph"); for (const dr of KIT) for (let s = 0; s < STEPS; s++) drumCells[dr][s].classList.remove("ph"); }
    function paintPH(step) { for (let p = 0; p < PITCHES.length; p++) for (let s = 0; s < STEPS; s++) rollCells[p][s].classList.toggle("ph", s === step); for (const dr of KIT) for (let s = 0; s < STEPS; s++) drumCells[dr][s].classList.toggle("ph", s === step); }

    function toggle(mode) {
      if (playMode === mode) { stop(); return; }
      if (playMode) stop();
      if (mode === "song") {
        playMode = "song";
        MME.transport.start({ steps: bars * STEPS, loop: false, getBpm: () => bpm,
          onStep: (g, t) => playBarStep(Math.floor(g / STEPS), g % STEPS, t),
          onDraw: (g) => { if (g < 0) { clearPH(); return; } const b = Math.floor(g / STEPS); if (b !== viewBar) setViewBar(b); paintPH(g % STEPS); },
          onEnd: () => { playMode = null; setButtons(); clearPH(); } });
      } else {
        playMode = "loop";
        MME.transport.start({ steps: STEPS, loop: true, getBpm: () => bpm,
          onStep: (s, t) => playBarStep(viewBar, s, t),
          onDraw: (s) => { if (s < 0) clearPH(); else paintPH(s); } });
      }
      setButtons();
    }
    function stop() { MME.transport.stop(); playMode = null; setButtons(); clearPH(); }
    function setButtons() {
      id("playsong").textContent = playMode === "song" ? "⏹ Stop" : "▶ Play Song";
      id("loopbar").textContent = playMode === "loop" ? "⏹ Stop" : "🔁 Loop Bar";
    }

    // ---- save / load ----
    function serialize() {
      return { v: 2, bpm, master, bars,
        voices: voices.map((v) => ({ instrument: v.instrument, chair: v.chair, muted: v.muted, notes: [...v.notes] })),
        drums: Object.fromEntries(KIT.map((k) => [k, [...drums[k]]])) };
    }
    function deserialize(d) {
      bpm = d.bpm || 110; master = d.master != null ? d.master : 0.7; bars = d.bars || 8;
      id("bpm").value = bpm; id("bpmv").textContent = bpm; id("vol").value = Math.round(master * 100); MME.setMaster(master);
      voices = (d.voices || []).slice(0, cfg.maxVoices).map((sv) => ({ instrument: sv.instrument || INSTS[0].id, chair: sv.chair || 1, muted: !!sv.muted, notes: new Set(sv.notes || []) }));
      if (voices.length === 0) voices = [makeVoice(0)];
      drums = {}; KIT.forEach((k) => drums[k] = new Set((d.drums && d.drums[k]) || []));
      current = 0; updateDuration(); buildVoices(); selectVoice(0); setViewBar(Math.min(viewBar, bars - 1));
    }
    const store = () => { try { return JSON.parse(localStorage.getItem(cfg.storageKey) || "{}"); } catch (e) { return {}; } };
    const saveStore = (o) => localStorage.setItem(cfg.storageKey, JSON.stringify(o));
    function refreshSongs() { const s = store(), sel = id("songs"); sel.innerHTML = '<option value="">— saved songs —</option>'; Object.keys(s).sort().forEach((n) => { const o = document.createElement("option"); o.value = n; o.textContent = n; sel.appendChild(o); }); }
    function status(m) { const s = id("save-status"); s.textContent = m; setTimeout(() => { if (s.textContent === m) s.textContent = ""; }, 2500); }

    // ---- wire controls ----
    id("playsong").addEventListener("click", () => toggle("song"));
    id("loopbar").addEventListener("click", () => toggle("loop"));
    id("bpm").addEventListener("input", (e) => { bpm = +e.target.value; id("bpmv").textContent = bpm; updateDuration(); });
    id("vol").addEventListener("input", (e) => { master = +e.target.value / 100; MME.setMaster(master); });
    id("inst").addEventListener("change", (e) => { voices[current].instrument = e.target.value; buildVoices(); });
    id("bars").addEventListener("change", (e) => setBars(+e.target.value));
    id("prev").addEventListener("click", () => setViewBar(viewBar - 1));
    id("next").addEventListener("click", () => setViewBar(viewBar + 1));
    id("jump").addEventListener("change", (e) => setViewBar(+e.target.value));
    id("dup").addEventListener("click", duplicateBar);
    id("clearbar").addEventListener("click", clearBar);
    id("clearall").addEventListener("click", () => { if (!confirm("Clear the whole piece?")) return; voices.forEach((v) => v.notes.clear()); KIT.forEach((k) => drums[k].clear()); renderGrid(); renderDrums(); });
    id("save").addEventListener("click", () => { const n = (id("songname").value || "").trim(); if (!n) { status("Name it first."); return; } const s = store(); s[n] = serialize(); saveStore(s); refreshSongs(); id("songs").value = n; status("Saved “" + n + "”."); });
    id("load").addEventListener("click", () => { const n = id("songs").value; if (!n) return; const s = store(); if (s[n]) { deserialize(s[n]); id("songname").value = n; status("Loaded “" + n + "”."); } });
    id("del").addEventListener("click", () => { const n = id("songs").value; if (!n) return; if (!confirm("Delete “" + n + "”?")) return; const s = store(); delete s[n]; saveStore(s); refreshSongs(); status("Deleted."); });

    // ---- boot ----
    resetState();
    buildRoll(); buildDrums(); buildInst(); buildVoiceControls(); buildVoices();
    id("inst").value = voices[0].instrument;
    updateDuration(); setViewBar(0); selectVoice(0);
    // starter groove so it isn't silent
    if (drums.kick) { drums.kick.add("0_0"); drums.kick.add("0_8"); }
    if (drums.snare) { drums.snare.add("0_4"); drums.snare.add("0_12"); }
    if (drums.hatClosed) [0,2,4,6,8,10,12,14].forEach((s) => drums.hatClosed.add("0_" + s));
    renderDrums(); refreshSongs();
  }

  global.Studio = { init };
})(window);
