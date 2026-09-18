/* 似 — the pairs that actually get confused, drilled only against each other.
   A normal question draws its wrong answers from the whole deck, which is easy:
   め is obvious next to か. It is not obvious next to ぬ. Here every wrong answer
   is a sign you might genuinely mistake this one for. */
(function () {
  const KM = (window.KM = window.KM || {});
  KM.DATA = KM.DATA || {};

  /* Only pairs that are genuinely mistaken for one another — signs that share a
     structure and differ by one stroke, one loop or one direction. Sets like つ/く/へ
     were cut: those are merely all simple, which is not the same as confusable.
     Two members makes a straight duel, and that is fine; it is the purest form of it. */
  const SETS = [
    /* ひらがな */
    [['あ','a'],['お','o']],
    [['い','i'],['り','ri']],
    [['き','ki'],['さ','sa'],['ち','chi']],
    [['ぬ','nu'],['め','me']],
    [['ね','ne'],['れ','re'],['わ','wa']],
    [['る','ru'],['ろ','ro']],
    [['は','ha'],['ほ','ho'],['ま','ma']],
    [['ま','ma'],['も','mo']],
    [['し','shi'],['も','mo']],
    [['に','ni'],['こ','ko']],
    /* カタカナ */
    [['シ','shi'],['ツ','tsu'],['ソ','so'],['ン','n']],
    [['ノ','no'],['メ','me'],['ヌ','nu'],['ス','su']],
    [['ウ','u'],['ワ','wa'],['ク','ku'],['フ','fu']],
    [['コ','ko'],['ユ','yu'],['エ','e'],['ヨ','yo'],['ロ','ro']],
    [['ク','ku'],['ケ','ke'],['タ','ta']],
    [['ホ','ho'],['オ','o'],['ネ','ne']],
    [['モ','mo'],['ヲ','wo'],['ラ','ra']],
    [['ル','ru'],['レ','re']],
    [['テ','te'],['チ','chi']],
    [['ミ','mi'],['シ','shi']],
    [['セ','se'],['サ','sa']],
    [['マ','ma'],['ア','a']]
  ];

  /* The notes worth having in front of you while drilling these. */
  const NOTES = {
    'あ': 'The loop crosses itself. お does not.',
    'お': 'あ without the crossing loop, plus a dot on the right.',
    'い': 'Two separate strokes, both leaning right.',
    'り': 'The right stroke hangs lower and curves in.',
    'き': 'さ with one more crossbar.',
    'さ': 'Opens to the left. ち is the mirror image.',
    'ち': 'さ turned about — opens to the right.',
    'ぬ': 'Ends in a closed loop. め does not.',
    'め': 'ぬ without the loop.',
    'ね': 'Loop on the right, closed.',
    'れ': 'The tail flies out straight, no loop.',
    'わ': 'The tail curves back in but stays open.',
    'る': 'Ends in a closed loop. ろ just turns.',
    'ろ': 'る without the loop.',
    'は': 'Vertical stroke, then a cross. ほ adds one more bar.',
    'ほ': 'は with an extra horizontal bar.',
    'ま': 'Two bars crossed by a curve that loops at the foot.',
    'も': 'ま turned about — the curve starts at the top.',
    'し': 'One stroke. も is the same hook with two bars added.',
    'に': 'こ with a vertical stroke down the left.',
    'こ': 'Two bars and nothing else.',
    'シ': 'Two dots at the LEFT, sweep up from below.',
    'ツ': 'Two dots at the TOP, sweep down from above.',
    'ソ': 'One dot at the TOP, stroke down. Compare ン.',
    'ン': 'One dot at the LEFT, sweep up. Compare ソ.',
    'ノ': 'A single slash. The others are built on it.',
    'メ': 'ノ crossed by a second stroke.',
    'ヌ': 'ノ with a bar across the top.',
    'ス': 'ヌ without the crossing tail.',
    'ウ': 'A roof with a mark on top.',
    'ワ': 'ウ without the mark.',
    'ク': 'ワ with the top stroke cut short.',
    'フ': 'One stroke only — no left leg.',
    'コ': 'Open at the bottom left. ロ is closed.',
    'ロ': 'A closed box.',
    'ユ': 'The foot runs right. エ has bars top and bottom.',
    'エ': 'Two bars joined by a vertical.',
    'ヨ': 'Three prongs off one spine.',
    'ケ': 'ク with a stroke through the top.',
    'タ': 'ク with a bar inside it.',
    'ホ': 'A vertical with a crossbar and two separate dots.',
    'オ': 'ホ without the dots.',
    'ネ': 'ホ with a slanted mark on top.',
    'モ': 'Two bars and a hook that turns up.',
    'ヲ': 'Like ラ but the tail hooks left.',
    'ラ': 'A short top mark and a hook.',
    'ル': 'Two legs, the right one curling away.',
    'レ': 'One stroke, rebounding upward.',
    'テ': 'Two bars and a vertical through them.',
    'チ': 'The top stroke slants.',
    'ミ': 'Three separate bars.',
    'セ': 'Squared off, with the bar crossing.',
    'サ': 'Three prongs, the bar crossing all of them.',
    'マ': 'A tick with the tail going left.',
    'ア': 'マ with a vertical dropped through it.'
  };
  /* A sign can sit in several sets — は is confused with ほ ま ば, and separately with
     た な. Those are two different mistakes, so they are kept as two separate duels
     rather than merged into one pool. A question draws one set and shows it whole. */
  const belongs = {};
  const reading = {};
  const order = [];
  SETS.forEach(function (set) {
    set.forEach(function (pair) {
      if (!belongs[pair[0]]) { belongs[pair[0]] = []; order.push(pair[0]); }
      reading[pair[0]] = pair[1];
      belongs[pair[0]].push(set.filter(function (o) { return o[0] !== pair[0]; }));
    });
  });

  const items = order.map(function (ch) {
    return {
      id: 'lookalike:' + ch,
      jp: ch,
      reading: reading[ch],
      en: reading[ch],
      hint: NOTES[ch] || 'Look at what the other options do differently.',
      sets: belongs[ch]
    };
  });

  KM.DATA.lookalikes = [{
    id: 'lookalikes',
    jp: '似た仮名',
    en: 'Lookalikes',
    note: 'A showdown between exactly the signs that get mistaken for one another: ぬ against め, る against ろ, シ against ツ ソ ン. Some are straight two-way duels, which is the point — the only way through is to know the one stroke that differs. Signs with no genuine lookalike are not in here.',
    kind: 'kana',
    columns: 5,
    items: items
  }];
})();
