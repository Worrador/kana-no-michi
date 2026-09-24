/* 進行 — screens, input, and the run loop. */
(function () {
  const KM = window.KM;
  const $ = function (id) { return document.getElementById(id); };
  const el = {};
  ['screens','petals','brandHome','toggleSound','toggleMusic','toggleTheme','titleStreak','pathsSubtitle','pathsNote',
   'optTyping','optListen','optListenWrap','optListenNote','optBuild','optBlitz',
   'listenBtn','builder','builderSlots','builderTiles','builderClear','builderSubmit',
   'filterNote','deckList','selectionNote','beginBtn','lanterns','score','combo','comboWrap','quitBtn',
   'road','stationName','burn','kakejiku','promptLabel','prompt','promptSub','stamp','answers',
   'typingForm','typingInput','feedback','stationKanji','stationRomaji','stationLine','stationGo',
   'placementBtn','verdict','fortuneJp','fortuneRomaji','fortuneGloss','tally','missedWrap','missedList','againBtn',
   'teachCount','teachJp','teachReading','teachReadings','teachMeaning','teachHint','teachBack','teachNext',
   'teachRule','teachExample','studyRule',
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
    lastConfig: null,
    teachIndex: 0,
    built: []
  };

  /* The one rule that makes kanji readings tractable, and the honest caveat. */
  const YOMI_RULE =
    '<h3><span class="jp">音と訓</span> <span class="en">which reading, and when</span></h3>' +
    '<ul>' +
      '<li><b>Standing alone</b>, or with a hiragana tail, a kanji takes its <b>訓 kun</b> ' +
        'reading — the native Japanese word. 山 <i>yama</i>, 見る <i>miru</i>.</li>' +
      '<li><b>Joined to another kanji</b>, it takes its <b>音 on</b> reading — the one ' +
        'borrowed from Chinese. 火山 <i>kazan</i>, 大学 <i>daigaku</i>.</li>' +
    '</ul>' +
    '<p>That is a strong tendency, not a law. 手紙 is two kanji and still reads ' +
    '<i>tegami</i>, both kun. Compounds often voice the second part as well — ' +
    '小 + 川 becomes <i>o-gawa</i>. You will meet the exceptions one word at a time; ' +
    'the rule is what makes the rest predictable.</p>';

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
  /* Each switch is a filter on the road list: tick it and only the roads it can apply
     to remain. A switch whose own kinds no longer intersect what the others have left
     is hidden outright, since offering it would be offering nothing. */
  const SWITCHES = [
    { key: 'typing', box: 'optTyping' },
    { key: 'listen', box: 'optListen' },
    { key: 'build',  box: 'optBuild' },
    { key: 'blitz',  box: 'optBlitz' }
  ];

  function switchOn(sw) {
    return el[sw.box].checked && !el[sw.box].disabled && !el[sw.box].closest('.switch').hidden;
  }

  /* null means no restriction at all. */
  function kindsFor(keys) {
    let kinds = null;
    keys.forEach(function (key) {
      const list = KM.Game.APPLIES[key];
      if (!list) return;
      kinds = kinds === null ? list.slice() : kinds.filter(function (k) { return list.indexOf(k) !== -1; });
    });
    return kinds;
  }

  function activeKeys(extra) {
    const keys = SWITCHES.filter(switchOn).map(function (sw) { return sw.key; });
    if (extra && keys.indexOf(extra) === -1) keys.push(extra);
    return keys;
  }

  function decksMatching(kinds) {
    return KM.decks.filter(function (d) { return !kinds || kinds.indexOf(d.kind) !== -1; });
  }

  function deckGroups() {
    return [
      { jp: '仮名', en: 'Kana', decks: KM.DATA.kana },
      { jp: '似た仮名', en: 'Lookalikes', decks: KM.DATA.lookalikes },
      { jp: '漢字', en: 'Kanji', decks: KM.DATA.kanji },
      { jp: '旅の漢字', en: 'Signs on the road', decks: KM.DATA.signs },
      { jp: '語彙', en: 'Words', decks: KM.DATA.vocab },
      { jp: '動画の単語 一', en: 'First course, in order', decks: KM.DATA.video },
      { jp: '動画の単語 二', en: 'Second course, in order', decks: KM.DATA.video2 },
      { jp: '表現', en: 'Phrases', decks: KM.DATA.phrases }
    ];
  }

  function renderPaths() {
    el.pathsSubtitle.textContent = {
      learn: 'Choose what to learn',
      journey: 'Choose your road',
      practice: 'Choose what to practise'
    }[state.mode];
    el.pathsNote.textContent = {
      learn: 'Five signs at a time — the five you know least well. Each is shown to you with its reading and a note on where its shape came from, and only then asked, until every one comes back correct twice. Nothing is timed against you here.',
      journey: 'Five post stations, six questions each, four lanterns. A wrong answer snuffs one out; a station walked clean relights one. Come here once you have learned a few signs.',
      practice: 'No lanterns and no finish line — it hands you whatever you are weakest at, for as long as you like. Press やめる Quit to stop, and you still get your tally and a fortune.'
    }[state.mode];
    const set = KM.Store.settings();
    el.optTyping.checked = !!set.typing;
    el.optListen.checked = !!set.listen;
    el.optBuild.checked = !!set.build;
    el.optBlitz.checked = !!set.blitz;

    /* 聴く needs a voice the machine may not have. */
    const canSpeak = KM.Speech.available();
    el.optListen.disabled = !canSpeak;
    el.optListenNote.textContent = canSpeak
      ? 'kana, word and phrase roads'
      : 'unavailable — this browser has no Japanese voice installed';
    if (!canSpeak) el.optListen.checked = false;

    el.optBlitz.disabled = state.mode === 'learn';

    /* Hide any switch that would leave the list empty, then filter by what is left. */
    SWITCHES.forEach(function (sw) {
      const row = el[sw.box].closest('.switch');
      const others = SWITCHES.filter(function (o) { return o !== sw && switchOn(o); })
                             .map(function (o) { return o.key; });
      const possible = decksMatching(kindsFor(others.concat([sw.key]))).length;
      row.hidden = possible === 0;
      if (row.hidden) el[sw.box].checked = false;
      row.classList.toggle('is-disabled', el[sw.box].disabled);
    });

    const kinds = kindsFor(activeKeys());
    const visible = decksMatching(kinds);
    const visibleIds = visible.map(function (d) { return d.id; });
    state.selected = state.selected.filter(function (id) { return visibleIds.indexOf(id) !== -1; });

    el.filterNote.hidden = !kinds;
    if (kinds) {
      const names = SWITCHES.filter(function (sw) { return switchOn(sw) && KM.Game.APPLIES[sw.key]; })
        .map(function (sw) { return el[sw.box].closest('.switch').querySelector('b').textContent; });
      el.filterNote.textContent = names.join(' + ') + ' — showing the ' + visible.length +
        ' road' + (visible.length === 1 ? '' : 's') + ' it can apply to.';
    }

    let html = '';
    deckGroups().forEach(function (group) {
      const decks = group.decks.filter(function (d) { return visibleIds.indexOf(d.id) !== -1; });
      if (!decks.length) return;
      html += '<h3 class="sub-head" style="grid-column:1/-1"><span class="jp">' + group.jp +
              '</span> <span class="en">' + group.en + '</span></h3>';
      decks.forEach(function (d) {
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
    KM.Audio.wake();

    if (config.mode === 'placement') {
      state.session = KM.Game.startPlacement();
      show('play');
      renderHud();
      nextQuestion();
      return;
    }

    if (config.mode === 'learn') {
      state.session = KM.Game.startLesson({
        deckIds: config.deckIds, size: 5,
        listening: config.listening, building: config.building
      });
      state.teachIndex = 0;
      return showTeach();
    }

    state.session = KM.Game.start(config);
    show('play');
    renderHud();
    nextQuestion();
  }

  /* ---------------- 手習い the teaching card ---------------- */
  function showTeach() {
    const s = state.session;
    const it = s.batch[state.teachIndex];
    const deck = KM.deckOfItem[it.id];

    el.teachCount.textContent = (state.teachIndex + 1) + ' / ' + s.batch.length;
    el.teachJp.textContent = it.jp;
    el.teachJp.className = 'lesson__jp' + (it.jp.length > 3 ? ' is-long' : '');
    el.teachReading.textContent = it.reading || '';

    /* kanji carry two families of reading, and that distinction is the lesson */
    if (it.on || it.kun) {
      el.teachReadings.hidden = false;
      el.teachReadings.innerHTML =
        (it.on ? '<div><dt>音 on</dt><dd>' + escapeHtml(it.on) + '</dd></div>' : '') +
        (it.kun ? '<div><dt>訓 kun</dt><dd>' + escapeHtml(it.kun) + '</dd></div>' : '');
    } else {
      el.teachReadings.hidden = true;
      el.teachReadings.innerHTML = '';
    }

    el.teachMeaning.textContent =
      (it.en && it.en !== it.reading) ? it.en : (deck.kind === 'kana' ? 'A sound, not a word.' : '');

    /* the compound puts the other reading family to work */
    if (it.ex) {
      el.teachExample.hidden = false;
      el.teachExample.innerHTML =
        '<span class="example__label">joined to another kanji</span>' +
        '<span class="example__row"><b>' + escapeHtml(it.ex[0]) + '</b>' +
        '<i>' + escapeHtml(it.ex[1]) + '</i></span>' +
        '<span class="example__en">' + escapeHtml(it.ex[2]) + '</span>';
    } else {
      el.teachExample.hidden = true;
      el.teachExample.innerHTML = '';
    }

    /* the rule itself, once, on the first card of a batch that contains kanji */
    const hasKanji = s.batch.some(function (b) { return KM.deckOfItem[b.id].kind === 'kanji'; });
    el.teachRule.hidden = !(hasKanji && state.teachIndex === 0);
    if (!el.teachRule.hidden && !el.teachRule.innerHTML) el.teachRule.innerHTML = YOMI_RULE;
    el.teachHint.textContent = it.hint || '';
    el.teachHint.hidden = !it.hint;

    el.teachBack.disabled = state.teachIndex === 0;
    el.teachNext.querySelector('.btn__jp').textContent =
      state.teachIndex === s.batch.length - 1 ? '始める' : '次へ';
    el.teachNext.querySelector('.btn__en').textContent =
      state.teachIndex === s.batch.length - 1 ? 'Begin' : 'Next';

    show('learn');
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
    } else if (s.mode === 'placement') {
      let road = '';
      KM.Game.TIERS.forEach(function (t, i) {
        const done = s.cleared[i];
        road += '<span class="step' + (done === true ? ' is-done' : i === s.tier ? ' is-now' : '') + '"></span>';
      });
      el.road.innerHTML = road;
      const tier = KM.Game.TIERS[Math.min(KM.Game.TIERS.length - 1, s.tier)];
      el.stationName.textContent = '腕試し · ' + tier.jp + ' — ' + tier.en +
        ' (' + (s.tierAsked + 1) + ' / ' + KM.Game.PER_TIER + ')';
    } else if (s.mode === 'lesson') {
      const done = KM.Game.learnedCount(s);
      let road = '';
      s.batch.forEach(function (it) {
        road += '<span class="step' + (s.need[it.id] ? '' : ' is-done') + '"></span>';
      });
      el.road.innerHTML = road;
      el.stationName.textContent = '手習い · learning — ' + done + ' / ' + s.batch.length + ' settled';
    } else {
      el.road.innerHTML = '';
      el.stationName.textContent = '稽古 · practice — ' + s.asked +
        ' answered · やめる when you have had enough';
    }
  }

  function nextQuestion() {
    const s = state.session;
    const q = KM.Game.next(s);
    state.q = q;
    state.locked = false;

    el.stamp.className = 'stamp';
    el.feedback.className = 'feedback';
    el.feedback.innerHTML = '&nbsp;';
    el.promptLabel.textContent = q.label;

    el.prompt.className = 'prompt';
    if (q.big) el.prompt.classList.add('is-huge');
    if (q.dir === 'read2jp') el.prompt.classList.add('is-romaji');
    else if (q.dir === 'en2jp') el.prompt.classList.add('is-latin');
    /* re-trigger the ink animation */
    el.prompt.style.animation = 'none';
    el.prompt.offsetHeight;
    el.prompt.style.animation = '';
    el.prompt.textContent = q.prompt;

    el.promptSub.textContent = (q.dir === 'jp2en' && q.item.kana && q.item.kana !== q.item.jp)
      ? q.item.kana : '';

    el.typingInput.value = '';
    el.typingInput.disabled = false;
    el.builder.hidden = true;
    el.listenBtn.hidden = true;
    state.built = [];

    /* 聴 — the question is the sound; nothing is shown until it is answered. */
    if (q.listen) {
      el.prompt.textContent = '⋯';
      el.prompt.classList.add('is-muted');
      el.listenBtn.hidden = false;
      KM.Speech.say(q.item.kana || q.item.jp);
    }

    if (q.build) {
      el.answers.className = 'answers';
      el.answers.innerHTML = '';
      el.typingForm.hidden = true;
      el.builder.hidden = false;
      drawBuilder(q);
    } else if (q.typed) {
      el.answers.innerHTML = '';
      el.typingForm.hidden = false;
      el.typingInput.focus();
    } else {
      el.typingForm.hidden = true;
      const face = q.dir === 'jp2read' ? ' answer--romaji' : q.dir === 'jp2en' ? ' answer--latin' : '';
      /* 似 — set them side by side and large enough to actually compare. */
      el.answers.className = 'answers' + (q.duel ? ' is-duel' : '');
      el.answers.innerHTML = q.choices.map(function (c, i) {
        return '<button class="answer' + face + '" type="button" data-choice="' +
               escapeAttr(c) + '"><span class="answer__key">' + (i + 1) + '</span>' + escapeHtml(c) + '</button>';
      }).join('');
    }

    const limit = state.session.mode === 'placement' ? 15000
                : state.session.blitz ? (q.build ? 9000 : 5000)
                : q.build ? 20000
                : q.typed ? 13000
                : q.listen ? 11000
                : 9500;
    startTimer(limit);
    renderHud();
  }

  /* ---------------- 語 the word builder ---------------- */
  /* state.built holds tile indices; this turns them into the word so far. */
  function builtWord(q) {
    return state.built.map(function (i) { return q.tiles[i]; }).join('');
  }

  function drawBuilder(q) {
    el.builderSlots.innerHTML = q.target.map(function (_, i) {
      const idx = state.built[i];
      return '<span class="slot' + (idx === undefined ? '' : ' is-filled') + '">' +
             escapeHtml(idx === undefined ? '' : q.tiles[idx]) + '</span>';
    }).join('');
    el.builderTiles.innerHTML = q.tiles.map(function (t, i) {
      const used = state.built.indexOf(i) !== -1;
      return '<button class="tile" type="button" data-tile="' + i + '"' +
             (used ? ' disabled' : '') + '>' + escapeHtml(t) + '</button>';
    }).join('');
    el.builderSubmit.disabled = state.built.length !== q.target.length;
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

    if (q.listen) {
      el.prompt.classList.remove('is-muted');
      el.prompt.textContent = q.item.jp;
    }
    if (q.build) {
      el.builderSubmit.disabled = true;
      el.builderTiles.querySelectorAll('.tile').forEach(function (t) { t.disabled = true; });
    }

    el.stamp.textContent = ok ? '正' : timedOut ? '時' : '否';
    el.stamp.className = 'stamp is-shown' + (ok ? '' : ' is-wrong');

    if (ok) KM.Audio.correct(s.combo); else KM.Audio.wrong();

    el.feedback.className = 'feedback ' + (ok ? 'is-right' : 'is-wrong');
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
    el.tally.innerHTML = s.mode === 'lesson'
      ? row('新', 'Learned', s.batch.length) +
        row('的中', 'Accuracy', acc + '<small>%</small>') +
        row('問', 'Answered', s.correct + '<small>/' + s.asked + '</small>') +
        row('時', 'Minutes', mins)
      : row('点数', 'Score', s.score) +
        row('的中', 'Accuracy', acc + '<small>%</small>') +
        row('連続', 'Best run', s.bestCombo) +
        row('問', 'Answered', s.correct + '<small>/' + s.asked + '</small>') +
        row('時', 'Minutes', mins);

    if (s.mode === 'lesson') {
      el.fortuneGloss.textContent = s.batch.map(function (it) { return it.jp; }).join('  ') +
        ' — now in the rotation. 稽古 Practice will keep bringing them back.';
    }

    const misses = KM.Game.misses(s);
    if (misses.length) {
      el.missedWrap.hidden = false;
      el.missedList.innerHTML = misses.map(function (m) {
        return '<div class="missed__item"><b>' + escapeHtml(m.item.jp) +
               '<em class="missed__count' + (m.count === m.of ? ' is-cold' : '') + '">' +
               (m.count === m.of
                  ? (m.count > 1 ? m.count + '× wrong, never right' : 'wrong')
                  : m.count + ' wrong of ' + m.of) +
               '</em>' +
               '</b><span>' + escapeHtml(m.item.reading || '') +
               (m.item.en && m.item.en !== m.item.reading ? ' — ' + escapeHtml(m.item.en) : '') +
               '</span></div>';
      }).join('');
    } else {
      el.missedWrap.hidden = true;
    }

    if (s.mode === 'placement') {
      const r = KM.Game.placementResult(s);
      KM.Game.applyPlacement(s);
      state.placeDeck = r.nextDeck;
      el.verdict.hidden = false;
      el.verdict.innerHTML = r.complete
        ? 'You cleared every rung. Nothing here is new to you — take 稽古 Practice, or 似た仮名 Lookalikes for the shapes that still catch people.'
        : 'Cleared ' + r.passed + ' of ' + KM.Game.TIERS.length + ' rungs. Everything below is marked as known, ' +
          'so it will come round for review rather than be taught again.<br>' +
          '<b>Start here: ' + escapeHtml(r.next.jp) + '</b> — ' + escapeHtml(r.next.en) + '.';
      el.againBtn.querySelector('.btn__jp').textContent = '手習い';
      el.againBtn.querySelector('.btn__en').textContent = 'Learn from there';
    } else {
      el.verdict.hidden = true;
      if (state.labelAgain) state.labelAgain(s.mode);
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
    el.studyRule.hidden = deck.kind !== 'kanji';
    if (!el.studyRule.hidden && !el.studyRule.innerHTML) el.studyRule.innerHTML = YOMI_RULE;
    const wide = deck.kind === 'phrase' || deck.kind === 'sign';
    el.studyChart.className = 'chart chart--' + (wide ? 2 : deck.columns);
    el.studyChart.innerHTML = deck.items.map(function (it) {
      const r = KM.SRS.peek(it.id);
      const pct = r ? Math.round((r.box / KM.SRS.TOP) * 100) : 0;
      return '<div class="cell' + (wide ? ' cell--wide' : '') + '">' +
        '<span class="cell__jp">' + escapeHtml(it.jp) + '</span>' +
        '<span class="cell__read">' + escapeHtml(it.reading || '') + '</span>' +
        (it.on || it.kun ? '<span class="cell__yomi">音 ' + escapeHtml(it.on || '—') +
          ' · 訓 ' + escapeHtml(it.kun || '—') + '</span>' : '') +
        (it.en && it.en !== it.reading ? '<span class="cell__en">' + escapeHtml(it.en) + '</span>' : '') +
        (it.ex ? '<span class="cell__ex">' + escapeHtml(it.ex[0]) + ' <i>' +
          escapeHtml(it.ex[1]) + '</i> ' + escapeHtml(it.ex[2]) + '</span>' : '') +
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
      const met = KM.SRS.learned(d.items);
      return '<div class="prow">' +
        '<span class="prow__name">' + d.jp + '<small>' + d.en +
          ' · ' + met + ' of ' + d.items.length + ' met</small></span>' +
        '<span class="prow__right">' +
          '<span class="prow__rank">' + r[0] + ' · ' + Math.round(m * 100) + '%</span>' +
          '<button class="prow__forget" type="button" data-forget="' + d.id + '"' +
            (met ? '' : ' disabled') + ' title="Forget this road and walk it again">忘れる</button>' +
        '</span>' +
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
    const musicOn = s.music !== false;
    el.toggleMusic.textContent = musicOn ? '楽' : '黙';
    el.toggleMusic.setAttribute('aria-pressed', musicOn);
    el.toggleMusic.title = musicOn ? 'Music on — tap for silence' : 'Music off';
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
        /* Arriving at the road list is a fresh choice; do not inherit the last one. */
        if (go.getAttribute('data-go') === 'paths') state.selected = [];
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

      /* One road at a time, rather than only the whole record. */
      const forget = e.target.closest('[data-forget]');
      if (forget && !forget.disabled) {
        const deck = KM.deckById[forget.getAttribute('data-forget')];
        if (!deck) return;
        const warn = 'Forget ' + deck.jp + '?' + String.fromCharCode(10, 10) +
          'Everything recorded for its ' + deck.items.length +
          ' items goes, and 手習い will teach them from scratch again. Every other road is untouched.';
        if (!window.confirm(warn)) return;
        KM.SRS.forget(deck.items);
        KM.Audio.page();
        return renderRecords();
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

    el.toggleMusic.addEventListener('click', function () {
      const wasOn = KM.Store.settings().music !== false;
      KM.Store.setSetting('music', !wasOn);
      applyTheme();
      if (wasOn) KM.Music.stop(); else KM.Music.start();
    });

    function onSwitch(key, box, exclusiveWith) {
      el[box].addEventListener('change', function () {
        if (el[box].checked && exclusiveWith) {
          el[exclusiveWith].checked = false;
          KM.Store.setSetting(exclusiveWith === 'optTyping' ? 'typing' : 'build', false);
        }
        KM.Store.setSetting(key, el[box].checked);
        KM.Audio.page();
        renderPaths();
      });
    }
    /* Typing and building are two different ways to give an answer; 聴く and 速 stack
       with either. */
    onSwitch('typing', 'optTyping', 'optBuild');
    onSwitch('build', 'optBuild', 'optTyping');
    onSwitch('listen', 'optListen', null);
    onSwitch('blitz', 'optBlitz', null);

    el.beginBtn.addEventListener('click', function () {
      const on = {};
      SWITCHES.forEach(function (sw) { on[sw.key] = switchOn(sw); });
      begin({
        mode: state.mode,
        deckIds: state.selected.slice(),
        typing: on.typing,
        listening: on.listen,
        building: on.build,
        blitz: on.blitz && state.mode !== 'learn'
      });
    });

    el.placementBtn.addEventListener('click', function () {
      leaveRun();
      KM.Audio.wake();
      KM.Audio.page();
      begin({ mode: 'placement', deckIds: [] });
    });

    el.againBtn.addEventListener('click', function () {
      /* After a placement the useful next step is a lesson where it left you. */
      if (state.lastConfig && state.lastConfig.mode === 'placement' && state.placeDeck) {
        state.mode = 'learn';
        state.selected = [state.placeDeck];
        return begin({ mode: 'learn', deckIds: [state.placeDeck] });
      }
      if (state.lastConfig) begin(state.lastConfig); else show('paths');
    });

    function labelAgain(mode) {
      el.againBtn.querySelector('.btn__jp').textContent = mode === 'learn' ? 'あと五つ' : 'もう一度';
      el.againBtn.querySelector('.btn__en').textContent = mode === 'learn' ? 'Five more' : 'Again';
    }
    state.labelAgain = labelAgain;

    el.builderTiles.addEventListener('click', function (e) {
      const t = e.target.closest('[data-tile]');
      if (!t || t.disabled || state.locked) return;
      const q = state.q;
      if (state.built.length >= q.target.length) return;
      state.built.push(parseInt(t.getAttribute('data-tile'), 10));
      KM.Audio.page();
      drawBuilder(q);
    });

    el.builderSlots.addEventListener('click', function () {
      if (state.locked || !state.built.length) return;
      state.built.pop();
      drawBuilder(state.q);
    });

    el.builderClear.addEventListener('click', function () {
      if (state.locked) return;
      state.built = [];
      drawBuilder(state.q);
    });

    el.builderSubmit.addEventListener('click', function () {
      if (state.locked || !state.q || !state.q.build) return;
      if (state.built.length !== state.q.target.length) return;
      submit(builtWord(state.q));
    });

    el.listenBtn.addEventListener('click', function () {
      if (!state.q) return;
      KM.Speech.say(state.q.item.kana || state.q.item.jp);
    });

    el.teachBack.addEventListener('click', function () {
      if (state.teachIndex > 0) { state.teachIndex--; KM.Audio.page(); showTeach(); }
    });

    el.teachNext.addEventListener('click', function () {
      const s = state.session;
      if (!s) return show('title');
      KM.Audio.page();
      if (state.teachIndex < s.batch.length - 1) { state.teachIndex++; return showTeach(); }
      show('play');
      renderHud();
      nextQuestion();
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
      if (state.locked || !state.q || !state.q.typed) return;
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
      if (state.screen === 'learn') {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
          e.preventDefault();
          return el.teachNext.click();
        }
        if (e.key === 'ArrowLeft') { e.preventDefault(); return el.teachBack.click(); }
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

    /* Nothing may sound before the first gesture, so the music waits for one. */
    function firstGesture() {
      state.gestured = true;
      KM.Audio.wake();
      if (KM.Store.settings().music !== false) KM.Music.start();
      document.removeEventListener('pointerdown', firstGesture);
      document.removeEventListener('keydown', firstGesture);
    }
    document.addEventListener('pointerdown', firstGesture);
    document.addEventListener('keydown', firstGesture);

    window.addEventListener('resize', function () { petalsCtl.resize(); });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) KM.Music.stop(true);
      else if (state.gestured && KM.Store.settings().music !== false) KM.Music.start();

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
