/* 音 — every sound is synthesised at runtime. No audio files in this repo. */
(function () {
  const KM = (window.KM = window.KM || {});
  let ctx = null;

  /* Hirajoshi, a classic koto tuning. Combo steps climb it. */
  const SCALE = [293.66, 329.63, 349.23, 440.00, 466.16, 587.33, 659.25, 698.46, 880.00];

  function on() { return KM.Store.settings().sound !== false; }

  function ac() {
    if (!on()) return null;
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

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
})();
