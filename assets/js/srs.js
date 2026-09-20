/* 稽古 — a Leitner box scheduler. Five boxes, widening intervals. */
(function () {
  const KM = (window.KM = window.KM || {});
  const DAY = 86400000;
  const INTERVALS = [0, 1, 3, 7, 21];      /* days until an item in box n is due again */
  const TOP = INTERVALS.length - 1;

  function rec(id) {
    const srs = KM.Store.state().srs;
    if (!srs[id]) srs[id] = { box: 0, due: 0, seen: 0, correct: 0, streak: 0 };
    return srs[id];
  }

  KM.SRS = {
    TOP: TOP,
    record: rec,
    peek: function (id) { return KM.Store.state().srs[id] || null; },

    /* Drop every record for these items, so the road counts as unwalked again. */
    forget: function (items) {
      const srs = KM.Store.state().srs;
      items.forEach(function (it) { delete srs[it.id]; });
      KM.Store.save();
      return items.length;
    },

    isDue: function (id) {
      const r = KM.Store.state().srs[id];
      return !r || r.due <= Date.now();
    },

    /* Right answers climb one box, wrong answers fall two. */
    grade: function (id, correct) {
      const r = rec(id);
      r.seen++;
      if (correct) {
        r.correct++;
        r.streak++;
        r.box = Math.min(TOP, r.box + 1);
      } else {
        r.streak = 0;
        r.box = Math.max(0, r.box - 2);
      }
      r.due = Date.now() + INTERVALS[r.box] * DAY;
      KM.Store.save();
      return r;
    },

    /* Higher weight means more likely to be asked. */
    weight: function (id) {
      const r = KM.Store.state().srs[id];
      if (!r) return 6;                      /* never seen: show it soon */
      if (r.due <= Date.now()) return 4 - r.box * 0.5;
      return 0.6 / (r.box + 1);              /* not due, but never fully retired */
    },

    /* 0..1 across a set of items. */
    mastery: function (items) {
      if (!items.length) return 0;
      const srs = KM.Store.state().srs;
      let sum = 0;
      for (let i = 0; i < items.length; i++) {
        const r = srs[items[i].id];
        if (r) sum += r.box / TOP;
      }
      return sum / items.length;
    },

    learned: function (items) {
      const srs = KM.Store.state().srs;
      return items.filter(function (it) { return srs[it.id] && srs[it.id].box >= 1; }).length;
    },

    RANKS: [
      [0.95, '免許皆伝', 'Menkyo kaiden', 'full transmission'],
      [0.80, '師範', 'Shihan', 'master'],
      [0.60, '達者', 'Tassha', 'adept'],
      [0.40, '門下', 'Monka', 'disciple'],
      [0.15, '見習', 'Minarai', 'apprentice'],
      [0.00, '初心', 'Shoshin', 'beginner']
    ],

    rank: function (m) {
      const list = KM.SRS.RANKS;
      for (let i = 0; i < list.length; i++) if (m >= list[i][0]) return list[i];
      return list[list.length - 1];
    }
  };
})();
