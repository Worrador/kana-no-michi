/* 似 — the pairs that actually get confused, drilled only against each other.
   A normal question draws its wrong answers from the whole deck, which is easy:
   め is obvious next to か. It is not obvious next to ぬ. Here every wrong answer
   is a sign you might genuinely mistake this one for. */
(function () {
  const KM = (window.KM = window.KM || {});
  KM.DATA = KM.DATA || {};

  /* Each row is a set of signs that look alike. Order does not matter. */
  const SETS = [
    [['あ','a'],['お','o'],['む','mu']],
    [['い','i'],['り','ri'],['こ','ko']],
    [['き','ki'],['さ','sa'],['ち','chi']],
    [['ぬ','nu'],['め','me'],['の','no']],
    [['ね','ne'],['れ','re'],['わ','wa']],
    [['る','ru'],['ろ','ro'],['そ','so']],
    [['は','ha'],['ほ','ho'],['ま','ma'],['ば','ba']],
    [['つ','tsu'],['く','ku'],['へ','he']],
    [['し','shi'],['も','mo'],['ひ','hi']],
    [['た','ta'],['な','na'],['は','ha']],
    [['ふ','fu'],['ら','ra'],['う','u']],
    [['シ','shi'],['ツ','tsu'],['ソ','so'],['ン','n']],
    [['ノ','no'],['メ','me'],['ヌ','nu'],['ス','su']],
    [['ウ','u'],['ワ','wa'],['フ','fu'],['ク','ku']],
    [['コ','ko'],['ユ','yu'],['エ','e'],['ヨ','yo']],
    [['ケ','ke'],['タ','ta'],['ナ','na'],['チ','chi']],
    [['ル','ru'],['レ','re'],['ノ','no']],
    [['マ','ma'],['ム','mu'],['ア','a']],
    [['テ','te'],['チ','chi'],['ラ','ra']],
    [['ホ','ho'],['オ','o'],['木','ki — the kanji for tree']],
    [['ミ','mi'],['シ','shi'],['ニ','ni']],
    [['ロ','ro'],['口','kuchi — the kanji for mouth'],['囗','not a kana at all']],
    [['カ','ka'],['力','chikara — the kanji for power']],
    [['リ','ri'],['ソ','so'],['ノ','no']],
    [['セ','se'],['サ','sa'],['ヤ','ya']],
    [['モ','mo'],['ヲ','wo'],['毛','ke — the kanji for hair']]
  ];

  /* The notes worth having in front of you while drilling these. */
  const NOTES = {
    'シ': 'Two dots at the LEFT, sweep up from below.',
    'ツ': 'Two dots at the TOP, sweep down from above.',
    'ソ': 'One dot at the TOP, stroke down. Compare ン.',
    'ン': 'One dot at the LEFT, sweep up. Compare ソ.',
    'ぬ': 'Ends in a loop. め does not.',
    'め': 'No loop at the end. ぬ has one.',
    'ね': 'Loop on the right. れ is straight, わ is rounded.',
    'れ': 'The tail flies out straight.',
    'わ': 'The tail curves back in, unclosed.',
    'る': 'Ends in a closed loop. ろ just turns.',
    'ろ': 'No loop. る has one.',
    'は': 'Vertical stroke plus a cross. ほ adds one more bar.',
    'ほ': 'は with an extra horizontal bar.',
    'さ': 'Opens to the left. ち opens to the right.',
    'ち': 'さ mirrored.',
    'ロ': 'A kana. 口 mouth and 囗 enclosure are kanji, and squarer.'
  };

  /* A sign can sit in several sets — り is confused with い and with リ — so the
     confusable pool for each one is the union of every set it belongs to. */
  const pool = {};
  const reading = {};
  SETS.forEach(function (set) {
    set.forEach(function (pair) {
      reading[pair[0]] = pair[1];
      if (!pool[pair[0]]) pool[pair[0]] = {};
      set.forEach(function (other) {
        if (other[0] !== pair[0]) pool[pair[0]][other[0]] = other[1];
      });
    });
  });

  const items = [];
  Object.keys(pool).forEach(function (ch) {
    /* Only real kana become questions; the decoys still serve as wrong answers. */
    const code = ch.charCodeAt(0);
    if (code < 0x3040 || code > 0x30FF) return;
    items.push({
      id: 'lookalike:' + ch,
      jp: ch,
      reading: reading[ch],
      en: reading[ch],
      hint: NOTES[ch] || 'Look at what the other options do differently.',
      confuse: Object.keys(pool[ch]).map(function (o) { return [o, pool[ch][o]]; })
    });
  });

  KM.DATA.lookalikes = [{
    id: 'lookalikes',
    jp: '似た仮名',
    en: 'Lookalikes',
    note: 'Every wrong answer here is a sign you could genuinely mistake this one for — ぬ against め, シ against ツ, ね against れ against わ. Harder than it looks, and the fastest way to stop guessing.',
    kind: 'kana',
    columns: 5,
    items: items
  }];
})();
