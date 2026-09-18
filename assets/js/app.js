/* 進行 — screens, input, and the run loop. */
(function () {
  const KM = window.KM;
  const $ = function (id) { return document.getElementById(id); };
  const el = {};
  ['screens','petals','brandHome','toggleSound','toggleTheme','titleStreak','pathsSubtitle','pathsNote',
   'optTyping','deckList','selectionNote','beginBtn','lanterns','score','combo','comboWrap','quitBtn',
   'road','stationName','burn','kakejiku','promptLabel','prompt','promptSub','stamp','answers',
   'typingForm','typingInput','feedback','stationKanji','stationRomaji','stationLine','stationGo',
   'fortuneJp','fortuneRomaji','fortuneGloss','tally','missedWrap','missedList','againBtn',
   'studyTabs','studyNote','studyChart','totals','progressList','resetBtn'].forEach(function (id) {
    el[id] = $(id);
  });

  const state = {
    screen: 'title',
    mode: 'journey',
    selected: [],
    session: null,
    q: null,
    locked: true,
    timer: null,
    deadline: 0,
    limit: 9000,
    studyDeck: null,
    lastConfig: null
  };

  /* ---------------- screen routing ---------------- */
  function show(name) {
    state.screen = name;
    const list = document.querySelectorAll('.screen');
    for (let i = 0; i < list.length; i++) list[i].classList.toggle('is-active', list[i].id === 'screen-' + name);
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (name === 'title') renderTitle();
    if (name === 'paths') renderPaths();
    if (name === 'study') renderStudy();
    if (name === 'records') renderRecords();
  }

  function stopTimer() {
    if (state.timer) { window.cancelAnimationFrame(state.timer); state.timer = null; }
  }

  function leaveRun() {
    stopTimer();
    state.session = null;
  }

  /* ---------------- title ---------------- */
  function renderTitle() {
    const st = KM.Store.stats();
    const days = KM.Store.streakDays();
    const learned = Object.keys(KM.Store.state().srs).length;
    if (!st.answers) {
      el.titleStreak.innerHTML = 'The gate is open. Nothing has been walked yet.';
    } else {
      el.titleStreak.innerHTML =
        '<b>' + learned + '</b> signs met &nbsp;·&nbsp; <b>' + st.answers + '</b> answers given' +
        (days > 1 ? ' &nbsp;·&nbsp; <b>' + days + '</b> days in a row' : '');
    }
  }

  /* ---------------- deck picking ---------------- */
  function deckGroups() {
    return [
      { jp: '仮名', en: 'Kana', decks: KM.DATA.kana },
      { jp: '語彙', en: 'Words', decks: KM.DATA.vocab },
      { jp: '表現', en: 'Phrases', decks: KM.DATA.phrases }
    ];
  }

  function renderPaths() {
    el.pathsSubtitle.textContent = state.mode === 'journey' ? 'Choose your road' : 'Choose what to practise';
    el.pathsNote.textContent = state.mode === 'journey'
      ? 'Five post stations, six questions each, three lanterns. A wrong answer snuffs one out.'
      : 'No timer pressure beyond the incense, no lanterns, no end. Leave whenever you like.';
    el.optTyping.checked = !!KM.Store.settings().typing;

    let html = '';
    deckGroups().forEach(function (group) {
      html += '<h3 class="sub-head" style="grid-column:1/-1"><span class="jp">' + group.jp +
              '</span> <span class="en">' + group.en + '</span></h3>';
      group.decks.forEach(function (d) {
        const m = KM.SRS.mastery(d.items);
        const on = state.selected.indexOf(d.id) !== -1;
        html += '<button class="deck" type="button" data-deck="' + d.id + '" aria-pressed="' + on + '">' +
                '<span class="deck__ring" style="--m:' + m.toFixed(3) + '"><span>' + Math.round(m * 100) + '%</span></span>' +
                '<span><span class="deck__name">' + d.jp + '</span>' +
                '<span class="deck__en">' + d.en + '</span>' +
                '<span class="deck__count">' + d.items.length + ' items</span></span></button>';
      });
    });
    el.deckList.innerHTML = html;
    updateSelection();
  }

  function updateSelection() {
    let n = 0;
    state.selected.forEach(function (id) { n += (KM.deckById[id] || { items: [] }).items.length; });
    el.selectionNote.innerHTML = state.selected.length
      ? '<b>' + state.selected.length + '</b> road' + (state.selected.length > 1 ? 's' : '') +
        ', <b>' + n + '</b> items in the bag.'
      : 'Nothing chosen yet.';
    el.beginBtn.disabled = state.selected.length === 0;
  }

  /* ---------------- the run ---------------- */
  function begin(config) {
    state.lastConfig = config;
    state.session = KM.Game.start(config);
    KM.Audio.wake();
    show('play');
    renderHud();
    nextQuestion();
  }

  function renderHud() {
    const s = state.session;
    el.score.textContent = s.score;
    el.combo.textContent = s.combo;
    el.comboWrap.classList.toggle('is-hot', s.combo > 0 && s.combo % 3 === 0);

    if (s.lives === Infinity) {
      el.lanterns.innerHTML = '<span class="hud__stat"><i>的中</i><b>' +
        Math.round(KM.Game.accuracy(s) * 100) + '%</b></span>';
    } else {
      let html = '';
      for (let i = 0; i < 4; i++) html += '<span class="lantern' + (i < s.lives ? '' : ' is-out') + '"></span>';
      el.lanterns.innerHTML = html;
    }

    if (s.mode === 'journey') {
      const st = KM.Game.station(s);
      let road = '';
      for (let i = 0; i < KM.Game.STATIONS.length; i++) {
        road += '<span class="step' + (i < st ? ' is-done' : i === st ? ' is-now' : '') + '"></span>';
      }
      el.road.innerHTML = road;
      const station = KM.Game.STATIONS[st];
      const within = (s.asked % KM.Game.STATION_LENGTH) + 1;
      el.stationName.textContent = station.jp + ' · ' + station.en + ' — ' +
        Math.min(within, KM.Game.STATION_LENGTH) + ' / ' + KM.Game.STATION_LENGTH;
    } else {
      el.road.innerHTML = '';
      el.stationName.textContent = '稽古 · practice — ' + s.asked + ' answered';
    }
  }

  function nextQuestion() {
    const s = state.session;
    const q = KM.Game.next(s);
    state.q = q;
    state.locked = false;

    el.stamp.className = 'stamp';
    el.feedback.innerHTML = '&nbsp;';
    el.promptLabel.textContent = q.label;

    el.prompt.className = 'prompt';
    if (q.big) el.prompt.classList.add('is-huge');
    if (q.dir === 'read2jp' || q.dir === 'en2jp') el.prompt.classList.add('is-latin');
    /* re-trigger the ink animation */
    el.prompt.style.animation = 'none';
    el.prompt.offsetHeight;
    el.prompt.style.animation = '';
    el.prompt.textContent = q.prompt;

    el.promptSub.textContent = (q.dir === 'jp2en' && q.item.kana && q.item.kana !== q.item.jp)
      ? q.item.kana : '';

    if (q.typed) {
      el.answers.innerHTML = '';
      el.typingForm.hidden = false;
      el.typingInput.value = '';
      el.typingInput.disabled = false;
      el.typingInput.focus();
    } else {
      el.typingForm.hidden = true;
      const latin = q.dir === 'jp2read' || q.dir === 'jp2en';
      el.answers.innerHTML = q.choices.map(function (c, i) {
        return '<button class="answer' + (latin ? ' answer--latin' : '') + '" type="button" data-choice="' +
               escapeAttr(c) + '"><span class="answer__key">' + (i + 1) + '</span>' + escapeHtml(c) + '</button>';
      }).join('');
    }

    startTimer(q.typed ? 13000 : 9500);
    renderHud();
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escapeAttr(s) { return escapeHtml(s).replace(/"/g, '&quot;'); }

  function startTimer(ms) {
    stopTimer();
    state.limit = ms;
    state.deadline = performance.now() + ms;
    let warned = false;
    const incense = el.burn.parentElement.parentElement;
    incense.classList.remove('is-low');

    function frame(now) {
      const left = Math.max(0, (state.deadline - now) / state.limit);
      el.burn.style.transform = 'scaleX(' + left + ')';
      if (left < 0.25 && !warned) { warned = true; incense.classList.add('is-low'); }
      if (left <= 0) { state.timer = null; if (!state.locked) submit(null); return; }
      state.timer = window.requestAnimationFrame(frame);
    }
    state.timer = window.requestAnimationFrame(frame);
  }

  function remaining() {
    return Math.max(0, (state.deadline - performance.now()) / state.limit);
  }

  function submit(given) {
    if (state.locked) return;
    state.locked = true;
    stopTimer();

    const s = state.session;
    const q = state.q;
    const left = remaining();
    const timedOut = given === null;
    const ok = KM.Game.answer(s, given, left);

    /* mark the buttons */
    const buttons = el.answers.querySelectorAll('.answer');
    for (let i = 0; i < buttons.length; i++) {
      const v = buttons[i].getAttribute('data-choice');
      buttons[i].disabled = true;
      if (v === q.answer) buttons[i].classList.add('is-right');
      else if (!ok && v === given) buttons[i].classList.add('is-wrong');
      else buttons[i].classList.add('is-dim');
    }
    if (q.typed) el.typingInput.disabled = true;

    el.stamp.textContent = ok ? '正' : timedOut ? '時' : '否';
    el.stamp.className = 'stamp is-shown' + (ok ? '' : ' is-wrong');

    if (ok) KM.Audio.correct(s.combo); else KM.Audio.wrong();

    el.feedback.innerHTML = feedbackHtml(q, ok, timedOut, given);
    renderHud();

    window.setTimeout(function () {
      if (!state.session) return;
      if (s.over) return finish();
      const crossed = s.mode === 'journey' && s.asked % KM.Game.STATION_LENGTH === 0;
      if (crossed) return showStation();
      nextQuestion();
    }, ok ? 850 : 2100);
  }

  function feedbackHtml(q, ok, timedOut, given) {
    const it = q.item;
    if (ok) {
      const praise = ['よし', '見事', 'その調子', '上出来'][Math.min(3, Math.floor(state.session.combo / 3))];
      return '<b>' + praise + '</b> <i>' + (state.session.combo > 1 ? state.session.combo + ' in a row' : 'correct') + '</i>';
    }
    let line = timedOut ? 'The incense burned out. ' : (given ? 'Not quite. ' : '');
    line += '<b>' + escapeHtml(it.jp) + '</b> ';
    const bits = [];
    if (it.reading) bits.push('<i>' + escapeHtml(it.reading) + '</i>');
    if (it.en && it.en !== it.reading) bits.push(escapeHtml(it.en));
    line += bits.join(' — ');
    if (it.hint) line += '<br><i>' + escapeHtml(it.hint) + '</i>';
    return line;
  }

  function showStation() {
    const s = state.session;
    const idx = KM.Game.station(s);
    const st = KM.Game.STATIONS[idx];
    el.stationKanji.textContent = st.jp;
    el.stationRomaji.textContent = st.en;
    el.stationLine.innerHTML = escapeHtml(st.line) +
      (s.relit ? '<br><span style="color:var(--shu)">You passed without a stumble. A lantern is relit.</span>' : '');
    s.relit = false;
    KM.Audio.bell();
    show('station');
  }

  function finish() {
    const s = state.session;
    stopTimer();
    KM.Game.finish(s);

    const f = KM.Game.fortune(s);
    el.fortuneJp.textContent = f[0];
    el.fortuneRomaji.textContent = f[1];
    el.fortuneGloss.textContent = f[2];

    const acc = Math.round(KM.Game.accuracy(s) * 100);
    const mins = Math.max(1, Math.round((Date.now() - s.startedAt) / 60000));
    el.tally.innerHTML =
      row('点数', 'Score', s.score) +
      row('的中', 'Accuracy', acc + '<small>%</small>') +
      row('連続', 'Best run', s.bestCombo) +
      row('問', 'Answered', s.correct + '<small>/' + s.asked + '</small>') +
      row('時', 'Minutes', mins);

    if (s.missed.length) {
      el.missedWrap.hidden = false;
      el.missedList.innerHTML = s.missed.map(function (m) {
        return '<div class="missed__item"><b>' + escapeHtml(m.item.jp) + '</b><span>' +
               escapeHtml(m.item.reading || '') +
               (m.item.en && m.item.en !== m.item.reading ? ' — ' + escapeHtml(m.item.en) : '') +
               '</span></div>';
      }).join('');
    } else {
      el.missedWrap.hidden = true;
    }

    if (s.failed) KM.Audio.wrong(); else KM.Audio.fanfare();
    state.session = null;
    show('result');
  }

  function row(jp, en, value) {
    return '<div><dt>' + jp + ' · ' + en + '</dt><dd>' + value + '</dd></div>';
  }

  /* ---------------- 巻物 study ---------------- */
  function renderStudy() {
    if (!state.studyDeck) state.studyDeck = KM.decks[0].id;
    el.studyTabs.innerHTML = KM.decks.map(function (d) {
      return '<button class="tab" type="button" role="tab" data-tab="' + d.id + '" aria-selected="' +
             (d.id === state.studyDeck) + '">' + d.jp + '</button>';
    }).join('');

    const deck = KM.deckById[state.studyDeck];
    el.studyNote.textContent = deck.note;
    const wide = deck.kind === 'phrase';
    el.studyChart.className = 'chart chart--' + (wide ? 2 : deck.columns);
    el.studyChart.innerHTML = deck.items.map(function (it) {
      const r = KM.SRS.peek(it.id);
      const pct = r ? Math.round((r.box / KM.SRS.TOP) * 100) : 0;
      return '<div class="cell' + (wide ? ' cell--wide' : '') + '">' +
        '<span class="cell__jp">' + escapeHtml(it.jp) + '</span>' +
        '<span class="cell__read">' + escapeHtml(it.reading || '') + '</span>' +
        (it.en && it.en !== it.reading ? '<span class="cell__en">' + escapeHtml(it.en) + '</span>' : '') +
        (it.hint ? '<span class="cell__hint">' + escapeHtml(it.hint) + '</span>' : '') +
        '<span class="cell__bar"><i style="width:' + pct + '%"></i></span>' +
        '</div>';
    }).join('');
  }

  /* ---------------- 記録 records ---------------- */
  function renderRecords() {
    const st = KM.Store.stats();
    const acc = st.answers ? Math.round((st.correct / st.answers) * 100) : 0;
    let allItems = [];
    KM.decks.forEach(function (d) { allItems = allItems.concat(d.items); });
    const overall = KM.SRS.mastery(allItems);
    const rank = KM.SRS.rank(overall);

    el.totals.innerHTML =
      total('位', 'Rank', rank[0]) +
      total('修行', 'Overall', Math.round(overall * 100) + '%') +
      total('問', 'Answers', st.answers) +
      total('的中', 'Accuracy', acc + '%') +
      total('旅', 'Journeys', st.journeys || 0) +
      total('連続', 'Best run', st.longestCombo || 0) +
      total('日', 'Day streak', KM.Store.streakDays());

    el.progressList.innerHTML = KM.decks.map(function (d) {
      const m = KM.SRS.mastery(d.items);
      const r = KM.SRS.rank(m);
      return '<div class="prow">' +
        '<span class="prow__name">' + d.jp + '<small>' + d.en + '</small></span>' +
        '<span class="prow__rank">' + r[0] + ' · ' + Math.round(m * 100) + '%</span>' +
        '<span class="prow__bar"><i style="width:' + (m * 100).toFixed(1) + '%"></i></span>' +
        '</div>';
    }).join('');
  }

  function total(jp, en, value) {
    return '<div class="total"><i>' + jp + '</i><b>' + value + '</b><span>' + en + '</span></div>';
  }

  /* ---------------- 桜 drifting petals ---------------- */
  function petals() {
    const c = el.petals;
    const ctx = c.getContext('2d');
    let w = 0, h = 0, bits = [], raf = null;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(26, Math.max(10, w / 46)));
      bits = [];
      for (let i = 0; i < n; i++) bits.push(spawn(true));
    }

    function spawn(anywhere) {
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : -20,
        s: 4 + Math.random() * 6,
        vy: 0.18 + Math.random() * 0.45,
        drift: 0.4 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.02,
        rot: Math.random() * Math.PI,
        a: 0.18 + Math.random() * 0.4
      };
    }

    function petal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.a;
      ctx.fillStyle = document.documentElement.dataset.theme === 'night' ? '#e6b7c4' : '#e8a9b8';
      ctx.beginPath();
      ctx.moveTo(0, -p.s);
      ctx.bezierCurveTo(p.s * .8, -p.s * .5, p.s * .6, p.s * .7, 0, p.s);
      ctx.bezierCurveTo(-p.s * .6, p.s * .7, -p.s * .8, -p.s * .5, 0, -p.s);
      ctx.fill();
      ctx.restore();
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < bits.length; i++) {
        const p = bits[i];
        p.phase += 0.014;
        p.y += p.vy;
        p.x += Math.sin(p.phase) * p.drift;
        p.rot += p.spin;
        if (p.y > h + 24) bits[i] = spawn(false);
        petal(p);
      }
      raf = window.requestAnimationFrame(frame);
    }

    return {
      start: function () {
        if (reduced || raf) return;
        resize();
        frame();
      },
      stop: function () {
        if (raf) { window.cancelAnimationFrame(raf); raf = null; }
        ctx.clearRect(0, 0, w, h);
      },
      resize: function () { if (raf) resize(); }
    };
  }

  /* ---------------- wiring ---------------- */
  const sakura = { start: function () {}, stop: function () {}, resize: function () {} };
  let petalsCtl = sakura;

  function applyTheme() {
    const s = KM.Store.settings();
    document.documentElement.dataset.theme = s.theme;
    el.toggleTheme.textContent = s.theme === 'night' ? '月' : '灯';
    el.toggleTheme.title = s.theme === 'night' ? 'Night — tap for day' : 'Day — tap for night';
    el.toggleSound.textContent = s.sound === false ? '静' : '音';
    el.toggleSound.setAttribute('aria-pressed', s.sound !== false);
    el.toggleSound.title = s.sound === false ? 'Sound off' : 'Sound on';
  }

  function bind() {
    document.addEventListener('click', function (e) {
      const go = e.target.closest('[data-go]');
      if (go) {
        const mode = go.getAttribute('data-mode');
        if (mode) state.mode = mode;
        leaveRun();
        KM.Audio.wake();
        KM.Audio.page();
        return show(go.getAttribute('data-go'));
      }

      const deck = e.target.closest('[data-deck]');
      if (deck) {
        const id = deck.getAttribute('data-deck');
        const i = state.selected.indexOf(id);
        if (i === -1) state.selected.push(id); else state.selected.splice(i, 1);
        deck.setAttribute('aria-pressed', i === -1);
        KM.Audio.page();
        return updateSelection();
      }

      const tab = e.target.closest('[data-tab]');
      if (tab) {
        state.studyDeck = tab.getAttribute('data-tab');
        KM.Audio.page();
        return renderStudy();
      }

      const choice = e.target.closest('[data-choice]');
      if (choice && !choice.disabled) {
        return submit(choice.getAttribute('data-choice'));
      }
    });

    el.brandHome.addEventListener('click', function () { leaveRun(); show('title'); });

    el.toggleTheme.addEventListener('click', function () {
      const s = KM.Store.settings();
      KM.Store.setSetting('theme', s.theme === 'night' ? 'day' : 'night');
      applyTheme();
    });

    el.toggleSound.addEventListener('click', function () {
      const s = KM.Store.settings();
      KM.Store.setSetting('sound', s.sound === false);
      applyTheme();
      KM.Audio.page();
    });

    el.optTyping.addEventListener('change', function () {
      KM.Store.setSetting('typing', el.optTyping.checked);
    });

    el.beginBtn.addEventListener('click', function () {
      begin({ mode: state.mode, deckIds: state.selected.slice(), typing: el.optTyping.checked });
    });

    el.againBtn.addEventListener('click', function () {
      if (state.lastConfig) begin(state.lastConfig); else show('paths');
    });

    el.stationGo.addEventListener('click', function () {
      if (!state.session) return show('title');
      show('play');
      nextQuestion();
    });

    el.quitBtn.addEventListener('click', function () {
      const s = state.session;
      if (s && s.asked > 0) { s.over = true; return finish(); }
      leaveRun();
      show('title');
    });

    el.typingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (state.locked) return;
      const v = el.typingInput.value.trim();
      if (v) submit(v);
    });

    el.resetBtn.addEventListener('click', function () {
      if (!window.confirm('Erase every record and start again from the gate?')) return;
      KM.Store.reset();
      applyTheme();
      renderRecords();
    });

    document.addEventListener('keydown', function (e) {
      if (state.screen === 'station' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        return el.stationGo.click();
      }
      if (e.key === 'Escape') {
        if (state.screen === 'play') return el.quitBtn.click();
        if (state.screen !== 'title') { leaveRun(); return show('title'); }
      }
      if (state.screen !== 'play' || state.locked) return;
      if (document.activeElement === el.typingInput) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 4) {
        const b = el.answers.querySelectorAll('.answer')[n - 1];
        if (b && !b.disabled) { e.preventDefault(); submit(b.getAttribute('data-choice')); }
      }
    });

    window.addEventListener('resize', function () { petalsCtl.resize(); });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden && state.screen === 'play' && state.session && !state.locked) {
        /* pause honestly: stop the burn where it stands */
        stopTimer();
        state.pausedLeft = remaining();
      } else if (!document.hidden && state.screen === 'play' && state.session && !state.locked && state.pausedLeft) {
        state.deadline = performance.now() + state.pausedLeft * state.limit;
        startTimerFrom();
        state.pausedLeft = 0;
      }
    });
  }

  function startTimerFrom() {
    const incense = el.burn.parentElement.parentElement;
    function frame(now) {
      const left = Math.max(0, (state.deadline - now) / state.limit);
      el.burn.style.transform = 'scaleX(' + left + ')';
      incense.classList.toggle('is-low', left < 0.25);
      if (left <= 0) { state.timer = null; if (!state.locked) submit(null); return; }
      state.timer = window.requestAnimationFrame(frame);
    }
    state.timer = window.requestAnimationFrame(frame);
  }

  /* ---------------- init ---------------- */
  KM.initData();
  applyTheme();
  bind();
  petalsCtl = petals();
  petalsCtl.start();
  show('title');
})();
