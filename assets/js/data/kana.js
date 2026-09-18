/* 仮名 — hiragana & katakana tables (Hepburn romanisation) */
(function () {
  const KM = (window.KM = window.KM || {});
  KM.DATA = KM.DATA || {};

  const H_BASIC = [
    ['あ','a'],['い','i'],['う','u'],['え','e'],['お','o'],
    ['か','ka'],['き','ki'],['く','ku'],['け','ke'],['こ','ko'],
    ['さ','sa'],['し','shi'],['す','su'],['せ','se'],['そ','so'],
    ['た','ta'],['ち','chi'],['つ','tsu'],['て','te'],['と','to'],
    ['な','na'],['に','ni'],['ぬ','nu'],['ね','ne'],['の','no'],
    ['は','ha'],['ひ','hi'],['ふ','fu'],['へ','he'],['ほ','ho'],
    ['ま','ma'],['み','mi'],['む','mu'],['め','me'],['も','mo'],
    ['や','ya'],['ゆ','yu'],['よ','yo'],
    ['ら','ra'],['り','ri'],['る','ru'],['れ','re'],['ろ','ro'],
    ['わ','wa'],['を','wo'],['ん','n']
  ];

  const H_DAKUTEN = [
    ['が','ga'],['ぎ','gi'],['ぐ','gu'],['げ','ge'],['ご','go'],
    ['ざ','za'],['じ','ji'],['ず','zu'],['ぜ','ze'],['ぞ','zo'],
    ['だ','da'],['ぢ','ji'],['づ','zu'],['で','de'],['ど','do'],
    ['ば','ba'],['び','bi'],['ぶ','bu'],['べ','be'],['ぼ','bo'],
    ['ぱ','pa'],['ぴ','pi'],['ぷ','pu'],['ぺ','pe'],['ぽ','po']
  ];

  const H_YOON = [
    ['きゃ','kya'],['きゅ','kyu'],['きょ','kyo'],
    ['しゃ','sha'],['しゅ','shu'],['しょ','sho'],
    ['ちゃ','cha'],['ちゅ','chu'],['ちょ','cho'],
    ['にゃ','nya'],['にゅ','nyu'],['にょ','nyo'],
    ['ひゃ','hya'],['ひゅ','hyu'],['ひょ','hyo'],
    ['みゃ','mya'],['みゅ','myu'],['みょ','myo'],
    ['りゃ','rya'],['りゅ','ryu'],['りょ','ryo'],
    ['ぎゃ','gya'],['ぎゅ','gyu'],['ぎょ','gyo'],
    ['じゃ','ja'],['じゅ','ju'],['じょ','jo'],
    ['びゃ','bya'],['びゅ','byu'],['びょ','byo'],
    ['ぴゃ','pya'],['ぴゅ','pyu'],['ぴょ','pyo']
  ];

  const K_BASIC = [
    ['ア','a'],['イ','i'],['ウ','u'],['エ','e'],['オ','o'],
    ['カ','ka'],['キ','ki'],['ク','ku'],['ケ','ke'],['コ','ko'],
    ['サ','sa'],['シ','shi'],['ス','su'],['セ','se'],['ソ','so'],
    ['タ','ta'],['チ','chi'],['ツ','tsu'],['テ','te'],['ト','to'],
    ['ナ','na'],['ニ','ni'],['ヌ','nu'],['ネ','ne'],['ノ','no'],
    ['ハ','ha'],['ヒ','hi'],['フ','fu'],['ヘ','he'],['ホ','ho'],
    ['マ','ma'],['ミ','mi'],['ム','mu'],['メ','me'],['モ','mo'],
    ['ヤ','ya'],['ユ','yu'],['ヨ','yo'],
    ['ラ','ra'],['リ','ri'],['ル','ru'],['レ','re'],['ロ','ro'],
    ['ワ','wa'],['ヲ','wo'],['ン','n']
  ];

  const K_DAKUTEN = [
    ['ガ','ga'],['ギ','gi'],['グ','gu'],['ゲ','ge'],['ゴ','go'],
    ['ザ','za'],['ジ','ji'],['ズ','zu'],['ゼ','ze'],['ゾ','zo'],
    ['ダ','da'],['ヂ','ji'],['ヅ','zu'],['デ','de'],['ド','do'],
    ['バ','ba'],['ビ','bi'],['ブ','bu'],['ベ','be'],['ボ','bo'],
    ['パ','pa'],['ピ','pi'],['プ','pu'],['ペ','pe'],['ポ','po']
  ];

  const K_YOON = [
    ['キャ','kya'],['キュ','kyu'],['キョ','kyo'],
    ['シャ','sha'],['シュ','shu'],['ショ','sho'],
    ['チャ','cha'],['チュ','chu'],['チョ','cho'],
    ['ニャ','nya'],['ニュ','nyu'],['ニョ','nyo'],
    ['ヒャ','hya'],['ヒュ','hyu'],['ヒョ','hyo'],
    ['ミャ','mya'],['ミュ','myu'],['ミョ','myo'],
    ['リャ','rya'],['リュ','ryu'],['リョ','ryo'],
    ['ギャ','gya'],['ギュ','gyu'],['ギョ','gyo'],
    ['ジャ','ja'],['ジュ','ju'],['ジョ','jo'],
    ['ビャ','bya'],['ビュ','byu'],['ビョ','byo'],
    ['ピャ','pya'],['ピュ','pyu'],['ピョ','pyo']
  ];

  function kanaDeck(id, jp, en, note, rows, columns) {
    return {
      id: id,
      jp: jp,
      en: en,
      note: note,
      kind: 'kana',
      columns: columns || 5,
      items: rows.map(function (row) {
        return { id: id + ':' + row[0], jp: row[0], reading: row[1], en: row[1] };
      })
    };
  }

  KM.DATA.kana = [
    kanaDeck('hira-gojuon', 'ひらがな 五十音', 'Hiragana, the 46 basic signs',
      'The flowing script. Every road out of the village begins with a-i-u-e-o.', H_BASIC, 5),
    kanaDeck('hira-dakuten', 'ひらがな 濁点', 'Hiragana, voiced marks',
      'Two small strokes or a ring, and ka becomes ga. Twenty-five new sounds for free.', H_DAKUTEN, 5),
    kanaDeck('hira-yoon', 'ひらがな 拗音', 'Hiragana, glides',
      'A small ya, yu or yo folded onto the sign before it: ki + ya = kya.', H_YOON, 3),
    kanaDeck('kata-gojuon', 'カタカナ 五十音', 'Katakana, the 46 basic signs',
      'The angular script, cut like strokes in stone. It carries foreign words.', K_BASIC, 5),
    kanaDeck('kata-dakuten', 'カタカナ 濁点', 'Katakana, voiced marks',
      'The same marks, the same sounds, a sharper hand.', K_DAKUTEN, 5),
    kanaDeck('kata-yoon', 'カタカナ 拗音', 'Katakana, glides',
      'Small ya, yu and yo again. Most borrowed words arrive through these.', K_YOON, 3)
  ];
})();
