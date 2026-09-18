/* 勝負 — session state and question construction. */
(function () {
  const KM = (window.KM = window.KM || {});

  KM.decks = [];
  KM.deckById = {};
  KM.itemById = {};
  KM.deckOfItem = {};

  KM.initData = function () {
    KM.decks = [].concat(KM.DATA.kana, KM.DATA.vocab, KM.DATA.phrases);
    KM.decks.forEach(function (d) {
      KM.deckById[d.id] = d;
      d.items.forEach(function (it) {
        KM.itemById[it.id] = it;
        KM.deckOfItem[it.id] = d;
      });
    });
  };

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function weightedPick(items, exclude) {
    let total = 0;
    const w = items.map(function (it) {
      const x = it.id === exclude ? 0.001 : KM.SRS.weight(it.id);
      total += x;
      return x;
    });
    let r = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
      r -= w[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  /* 宿場 — the post stations of an old highway; one journey passes five. */
  const STATIONS = [
    { jp: '日本橋', en: 'Nihonbashi', line: 'Dawn over the bridge. The road begins under your feet.' },
    { jp: '戸塚', en: 'Totsuka', line: 'Pine shadows on the road. You have found your pace.' },
    { jp: '箱根', en: 'Hakone', line: 'The mountain pass. Steep going, thin air, wide view.' },
    { jp: '由比', en: 'Yui', line: 'The sea on your left, and Fuji white above the waves.' },
    { jp: '京', en: 'Kyou', line: 'The capital at dusk. Lanterns, and the smell of rain on stone.' }
  ];

  const STATION_LENGTH = 6;
  const LIVES = 4;

  function pickDirection(deck, typing) {
    if (typing && (deck.kind === 'kana')) return 'jp2read';
    if (deck.kind === 'kana') return Math.random() < 0.6 ? 'jp2read' : 'read2jp';
    return Math.random() < 0.55 ? 'jp2en' : 'en2jp';
  }

  function faceFor(item, deck, dir, side) {
    const want = (side === 'q')
      ? { jp2read: 'jp', read2jp: 'read', jp2en: 'jp', en2jp: 'en' }[dir]
      : { jp2read: 'read', read2jp: 'jp', jp2en: 'en', en2jp: 'jp' }[dir];
    if (want === 'jp') return item.jp;
    if (want === 'read') return item.reading;
    return item.en;
  }

  const LABELS = {
    jp2read: { kana: 'How is this kana read?', word: 'Read this aloud', phrase: 'Read this aloud' },
    read2jp: { kana: 'Which kana is this?', word: 'Which word is this?', phrase: 'Which phrase is this?' },
    jp2en: { kana: 'What does this mean?', word: 'What does this word mean?', phrase: 'What does this phrase mean?' },
    en2jp: { kana: 'Which kana?', word: 'Which word says this?', phrase: 'Which phrase says this?' }
  };

  function buildQuestion(session) {
    const pool = session.pool;
    const item = weightedPick(pool, session.lastId);
    const deck = KM.deckOfItem[item.id];
    const dir = pickDirection(deck, session.typing);
    session.lastId = item.id;

    const answer = faceFor(item, deck, dir, 'a');
    const q = {
      item: item,
      deck: deck,
      dir: dir,
      typed: session.typing && deck.kind === 'kana',
      label: LABELS[dir][deck.kind],
      prompt: faceFor(item, deck, dir, 'q'),
      answer: answer,
      big: dir === 'read2jp' || dir === 'en2jp' ? false : deck.kind === 'kana',
      sub: '',
      choices: []
    };

    /* On an English prompt for a word, show the reading as a whisper under the answer later. */
    if (!q.typed) {
      const seen = {};
      seen[answer] = true;
      const others = [];
      const candidates = shuffle(deck.items.slice());
      for (let i = 0; i < candidates.length && others.length < 3; i++) {
        const face = faceFor(candidates[i], deck, dir, 'a');
        if (seen[face]) continue;
        seen[face] = true;
        others.push(face);
      }
      /* Small decks can run short; borrow from anywhere of the same kind. */
      if (others.length < 3) {
        const wide = shuffle(KM.decks.filter(function (d) { return d.kind === deck.kind; }));
        for (let d = 0; d < wide.length && others.length < 3; d++) {
          const list = shuffle(wide[d].items.slice());
          for (let i = 0; i < list.length && others.length < 3; i++) {
            const face = faceFor(list[i], wide[d], dir, 'a');
            if (!face || seen[face]) continue;
            seen[face] = true;
            others.push(face);
          }
        }
      }
      q.choices = shuffle(others.concat([answer]));
    }
    return q;
  }

  /* Typed romaji is forgiving about the usual ambiguities. */
  const ROMAJI_ALIASES = {
    shi: ['si'], chi: ['ti'], tsu: ['tu'], fu: ['hu'], ji: ['zi', 'di'], zu: ['du'],
    sha: ['sya'], shu: ['syu'], sho: ['syo'], cha: ['tya'], chu: ['tyu'], cho: ['tyo'],
    ja: ['zya', 'jya'], ju: ['zyu', 'jyu'], jo: ['zyo', 'jyo'], wo: ['o'], n: ['nn']
  };

  function normalise(s) {
    return String(s || '').toLowerCase().replace(/[^a-z]/g, '');
  }

  function checkTyped(input, answer) {
    const a = normalise(answer);
    const i = normalise(input);
    if (!i) return false;
    if (i === a) return true;
    const alt = ROMAJI_ALIASES[a];
    return !!(alt && alt.indexOf(i) !== -1);
  }

  /* 御神籤 — the fortune slip drawn at a shrine, here earned rather than drawn. */
  const FORTUNES = [
    [0.95, '大吉', 'Dai-kichi', 'Great blessing'],
    [0.85, '中吉', 'Chuu-kichi', 'Middle blessing'],
    [0.75, '小吉', 'Shou-kichi', 'Small blessing'],
    [0.60, '吉', 'Kichi', 'Blessing'],
    [0.00, '末吉', 'Sue-kichi', 'Blessing yet to come']
  ];

  KM.Game = {
    STATIONS: STATIONS,
    STATION_LENGTH: STATION_LENGTH,

    start: function (opts) {
      const deckIds = opts.deckIds.slice();
      let pool = [];
      deckIds.forEach(function (id) {
        const d = KM.deckById[id];
        if (d) pool = pool.concat(d.items);
      });
      const journey = opts.mode === 'journey';
      return {
        mode: opts.mode,
        deckIds: deckIds,
        pool: pool,
        typing: !!opts.typing,
        lastId: null,
        total: journey ? STATIONS.length * STATION_LENGTH : Infinity,
        asked: 0,
        correct: 0,
        score: 0,
        combo: 0,
        bestCombo: 0,
        lives: journey ? LIVES : Infinity,
        missed: [],
        stationErrors: 0,
        relit: false,
        startedAt: Date.now(),
        current: null,
        over: false,
        failed: false
      };
    },

    next: function (session) {
      session.current = buildQuestion(session);
      return session.current;
    },

    station: function (session) {
      return Math.min(STATIONS.length - 1, Math.floor(session.asked / STATION_LENGTH));
    },

    /* Called with the remaining fraction of the incense timer, 0..1. */
    answer: function (session, given, remaining) {
      const q = session.current;
      const ok = q.typed ? checkTyped(given, q.answer) : given === q.answer;

      session.asked++;
      KM.SRS.grade(q.item.id, ok);
      const stats = KM.Store.stats();
      stats.answers++;

      if (ok) {
        session.correct++;
        session.combo++;
        stats.correct++;
        session.bestCombo = Math.max(session.bestCombo, session.combo);
        stats.longestCombo = Math.max(stats.longestCombo || 0, session.combo);
        const speed = Math.round(80 * Math.max(0, remaining));
        const mult = 1 + Math.min(4, Math.floor(session.combo / 3)) * 0.5;
        session.score += Math.round((100 + speed) * mult);
      } else {
        session.combo = 0;
        if (session.lives !== Infinity) session.lives--;
        if (session.missed.length < 40) session.missed.push({ item: q.item, deck: q.deck, given: given });
      }
      KM.Store.markDay();

      if (session.lives <= 0) { session.over = true; session.failed = true; }
      else if (session.asked >= session.total) { session.over = true; }

      /* A station walked without a single miss relights one lantern. */
      if (!ok) session.stationErrors++;
      if (session.mode === 'journey' && !session.over && session.asked % STATION_LENGTH === 0) {
        session.relit = session.stationErrors === 0 && session.lives < LIVES;
        if (session.relit) session.lives++;
        session.stationErrors = 0;
      }
      return ok;
    },

    accuracy: function (session) {
      return session.asked ? session.correct / session.asked : 0;
    },

    fortune: function (session) {
      if (session.failed) return ['凶', 'Kyou', 'Turn back and walk it again'];
      const a = KM.Game.accuracy(session);
      for (let i = 0; i < FORTUNES.length; i++) {
        if (a >= FORTUNES[i][0]) return FORTUNES[i].slice(1);
      }
      return FORTUNES[FORTUNES.length - 1].slice(1);
    },

    finish: function (session) {
      const stats = KM.Store.stats();
      if (session.mode === 'journey' && !session.failed && session.asked >= session.total) stats.journeys++;
      const key = session.deckIds.slice().sort().join('+');
      if (session.mode === 'journey') {
        stats.best[key] = Math.max(stats.best[key] || 0, session.score);
      }
      KM.Store.save();
    },

    shuffle: shuffle,
    checkTyped: checkTyped
  };
})();
