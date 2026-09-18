/* 音 — every sound is synthesised at runtime. No audio files in this repo. */
(function () {
  const KM = (window.KM = window.KM || {});
  let ctx = null;

  /* Hirajoshi, a classic koto tuning. Combo steps climb it. */
  const SCALE = [293.66, 329.63, 349.23, 440.00, 466.16, 587.33, 659.25, 698.46, 880.00];

  function on() { return KM.Store.settings().sound !== false; }

  /* The context is shared. Only effects answer to the 音 toggle; music has its own. */
  function context() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      try { ctx = new C(); } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function ac() { return on() ? context() : null; }

  function env(node, t, peak, attack, decay) {
    node.gain.setValueAtTime(0.0001, t);
    node.gain.exponentialRampToValueAtTime(peak, t + attack);
    node.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  }

  function noiseBuffer(c, secs) {
    const n = Math.floor(c.sampleRate * secs);
    const buf = c.createBuffer(1, n, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
    return buf;
  }

  /* 拍子木 — the wooden clappers that open a kabuki scene. */
  function clack(freq, gain) {
    const c = ac(); if (!c) return;
    const t = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, 0.12);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = freq || 1800;
    bp.Q.value = 6;
    const g = c.createGain();
    env(g, t, gain || 0.28, 0.002, 0.11);
    src.connect(bp); bp.connect(g); g.connect(c.destination);
    src.start(t); src.stop(t + 0.16);
  }

  /* 琴 — a plucked string: two slightly detuned triangles, quick decay. */
  function pluck(freq, gain, len) {
    const c = ac(); if (!c) return;
    const t = c.currentTime;
    const g = c.createGain();
    env(g, t, gain || 0.16, 0.006, len || 0.85);
    [0, 1.006].forEach(function (d, i) {
      const o = c.createOscillator();
      o.type = i ? 'sine' : 'triangle';
      o.frequency.value = freq * (d || 1);
      o.connect(g);
      o.start(t); o.stop(t + (len || 0.85) + 0.05);
    });
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(4200, t);
    lp.frequency.exponentialRampToValueAtTime(700, t + (len || 0.85));
    g.connect(lp); lp.connect(c.destination);
  }

  KM.Audio = {
    /* Browsers require a gesture before audio starts. */
    wake: function () { ac(); },

    correct: function (combo) {
      clack(2100, 0.20);
      pluck(SCALE[Math.min(SCALE.length - 1, Math.max(0, (combo || 1) - 1))], 0.14, 0.7);
    },

    wrong: function () {
      const c = ac(); if (!c) return;
      const t = c.currentTime;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(190, t);
      o.frequency.exponentialRampToValueAtTime(72, t + 0.34);
      env(g, t, 0.20, 0.008, 0.36);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + 0.42);
      clack(420, 0.10);
    },

    tick: function () { clack(1200, 0.05); },

    /* 鈴 — the small standing bell struck at the end of a sitting. */
    bell: function () {
      const c = ac(); if (!c) return;
      const t = c.currentTime;
      [1, 2.76, 5.4].forEach(function (mult, i) {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = 'sine';
        o.frequency.value = 523.25 * mult;
        env(g, t, 0.13 / (i + 1), 0.01, 3.2 / (i + 1));
        o.connect(g); g.connect(c.destination);
        o.start(t); o.stop(t + 3.6);
      });
    },

    fanfare: function () {
      [0, 2, 4, 6].forEach(function (step, i) {
        window.setTimeout(function () { pluck(SCALE[step], 0.15, 1.1); }, i * 130);
      });
    },

    page: function () { clack(900, 0.07); }
  };

  /* ================= 音楽 — a slow koto ambience, composed as it plays =================
     Hirajoshi across two and a half octaves. The melody is a weighted random walk that
     prefers small steps, leaves gaps, and never resolves anywhere in particular. */

  const MUSIC_SCALE = [
    146.83, 164.81, 174.61, 220.00, 233.08,   /* D3  E3  F3  A3  Bb3 */
    293.66, 329.63, 349.23, 440.00, 466.16,   /* D4  E4  F4  A4  Bb4 */
    587.33, 659.25, 698.46                    /* D5  E5  F5        */
  ];
  const BEAT = 0.92;

  let bus = null, pad = null, playing = false, tickId = null, nextAt = 0, step = 0, note = 6;

  /* A generated impulse response: noise under an exponential decay. Gives the koto a room. */
  function reverb(c) {
    const len = Math.floor(c.sampleRate * 2.8);
    const buf = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    const cv = c.createConvolver();
    cv.buffer = buf;
    return cv;
  }

  function buildBus(c) {
    bus = c.createGain();
    bus.gain.value = 0.0001;
    const dry = c.createGain(); dry.gain.value = 0.7;
    const wet = c.createGain(); wet.gain.value = 0.4;
    bus.connect(dry); dry.connect(c.destination);
    const cv = reverb(c);
    bus.connect(cv); cv.connect(wet); wet.connect(c.destination);
  }

  /* One plucked string: body, a quiet octave partial, and a filter closing as it rings out. */
  function koto(c, t, freq, gain) {
    const g = c.createGain();
    env(g, t, gain, 0.012, 2.6);
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(3200, t);
    lp.frequency.exponentialRampToValueAtTime(480, t + 2.2);

    const body = c.createOscillator();
    body.type = 'triangle';
    body.frequency.value = freq;
    body.connect(g);

    const partial = c.createOscillator();
    partial.type = 'sine';
    partial.frequency.value = freq * 2.004;
    const pg = c.createGain(); pg.gain.value = 0.3;
    partial.connect(pg); pg.connect(g);

    g.connect(lp); lp.connect(bus);
    body.start(t); body.stop(t + 3.1);
    partial.start(t); partial.stop(t + 3.1);
  }

  /* A low drone with a filter that breathes once every twenty seconds or so. */
  function startPad(c) {
    const gain = c.createGain();
    gain.gain.value = 0.0001;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 360;

    pad = [];
    [73.42, 110.00, 146.83].forEach(function (f, i) {
      const o = c.createOscillator();
      o.type = i === 2 ? 'sine' : 'triangle';
      o.frequency.value = f;
      o.detune.value = (i - 1) * 5;
      o.connect(gain);
      o.start();
      pad.push(o);
    });

    const lfo = c.createOscillator();
    lfo.frequency.value = 0.045;
    const lfoDepth = c.createGain();
    lfoDepth.gain.value = 130;
    lfo.connect(lfoDepth); lfoDepth.connect(lp.frequency);
    lfo.start();
    pad.push(lfo);

    gain.connect(lp); lp.connect(bus);
    gain.gain.exponentialRampToValueAtTime(0.05, c.currentTime + 7);
  }

  function beat(c, t) {
    /* every eighth beat, a low string, like a hand resting on the instrument */
    if (step % 8 === 0) koto(c, t, MUSIC_SCALE[0] / 2, 0.085);

    if (Math.random() < 0.6) {
      const walk = [-3, -2, -1, -1, 0, 1, 1, 2, 2, 4][Math.floor(Math.random() * 10)];
      note = Math.max(2, Math.min(MUSIC_SCALE.length - 1, note + walk));
      koto(c, t, MUSIC_SCALE[note], 0.085 + Math.random() * 0.045);
      /* now and then a grace note struck just below and just before */
      if (Math.random() < 0.16 && note > 0) {
        koto(c, Math.max(c.currentTime, t - 0.13), MUSIC_SCALE[note - 1], 0.04);
      }
    }
  }

  function schedule() {
    if (!playing || !ctx) return;
    while (nextAt < ctx.currentTime + 0.7) {
      beat(ctx, nextAt);
      nextAt += BEAT;
      step++;
    }
    tickId = window.setTimeout(schedule, 140);
  }

  function ramp(target, seconds) {
    if (!bus || !ctx) return;
    const t = ctx.currentTime;
    bus.gain.cancelScheduledValues(t);
    bus.gain.setValueAtTime(Math.max(0.0001, bus.gain.value), t);
    bus.gain.exponentialRampToValueAtTime(Math.max(0.0001, target), t + seconds);
  }

  KM.Music = {
    enabled: function () { return KM.Store.settings().music !== false; },

    start: function () {
      if (playing) return;
      const c = context();
      if (!c) return;
      if (!bus) buildBus(c);
      if (!pad) startPad(c);
      playing = true;
      step = 0;
      nextAt = c.currentTime + 0.5;
      ramp(0.55, 3.5);
      schedule();
    },

    stop: function (quick) {
      if (!playing) return;
      playing = false;
      if (tickId) { window.clearTimeout(tickId); tickId = null; }
      ramp(0.0001, quick ? 0.3 : 1.8);
    },

    isPlaying: function () { return playing; }
  };
})();
