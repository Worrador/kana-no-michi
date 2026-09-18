/* 記録 — persistence. One key in localStorage, versioned. */
(function () {
  const KM = (window.KM = window.KM || {});
  const KEY = 'kana-no-michi.v1';

  const BLANK = {
    version: 1,
    srs: {},
    stats: { answers: 0, correct: 0, journeys: 0, longestCombo: 0, best: {}, days: {} },
    settings: { theme: 'day', sound: true, typing: false }
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  let state = null;

  function load() {
    if (state) return state;
    let raw = null;
    try { raw = window.localStorage.getItem(KEY); } catch (e) { raw = null; }
    if (!raw) { state = clone(BLANK); return state; }
    try {
      const parsed = JSON.parse(raw);
      state = Object.assign(clone(BLANK), parsed);
      state.stats = Object.assign(clone(BLANK.stats), parsed.stats || {});
      state.settings = Object.assign(clone(BLANK.settings), parsed.settings || {});
      state.srs = parsed.srs || {};
    } catch (e) {
      state = clone(BLANK);
    }
    return state;
  }

  let pending = null;
  function save() {
    if (pending) return;
    pending = window.setTimeout(function () {
      pending = null;
      try { window.localStorage.setItem(KEY, JSON.stringify(load())); } catch (e) { /* private mode */ }
    }, 120);
  }

  function today() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  KM.Store = {
    state: load,
    save: save,
    settings: function () { return load().settings; },
    setSetting: function (k, v) { load().settings[k] = v; save(); },
    stats: function () { return load().stats; },
    markDay: function () {
      const s = load().stats;
      s.days[today()] = (s.days[today()] || 0) + 1;
      save();
    },
    /* Consecutive days ending today (or yesterday, so an evening gap is forgiving). */
    streakDays: function () {
      const days = load().stats.days || {};
      const d = new Date();
      let n = 0;
      for (let i = 0; i < 400; i++) {
        const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        if (days[key]) { n++; } else if (i > 0) { break; }
        d.setDate(d.getDate() - 1);
      }
      return n;
    },
    reset: function () { state = clone(BLANK); try { window.localStorage.removeItem(KEY); } catch (e) {} }
  };
})();
