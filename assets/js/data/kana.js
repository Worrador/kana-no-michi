/* 仮名 — hiragana & katakana. Each basic sign carries a mnemonic for its shape. */
(function () {
  const KM = (window.KM = window.KM || {});
  KM.DATA = KM.DATA || {};

  /* [ kana, romaji, mnemonic ] */
  const H_BASIC = [
    ['あ','a','A cross, then a loop — an A tangled in ribbon.'],
    ['い','i','Two strokes leaning together, like a doubled i.'],
    ['う','u','A beak tilted up, saying ooh.'],
    ['え','e','A bird with a long neck and a swept-back tail.'],
    ['お','o','あ with a flying tail. Oh, so nearly the same.'],
    ['か','ka','A kite on its string, with one cross-spar.'],
    ['き','ki','A key with two notches cut in the shaft.'],
    ['く','ku','A beak, or the corner of a cup.'],
    ['け','ke','A keg with a plank leaning against it.'],
    ['こ','ko','Two cords lying parallel.'],
    ['さ','sa','A sail on a mast, the wind curling under it.'],
    ['し','shi','A fishing hook. The sheer curve of a smile.'],
    ['す','su','A swing hanging from a looped rope.'],
    ['せ','se','A set of scales, one arm out to the left.'],
    ['そ','so','A zigzag: the stitch that mends a sock.'],
    ['た','ta','A cross beside a small c — a tall figure.'],
    ['ち','chi','た turned about. A cheek with an earring.'],
    ['つ','tsu','A wave curling over. Tsunami.'],
    ['て','te','A hand reaching out. te means hand.'],
    ['と','to','A toe with a splinter going into it.'],
    ['な','na','A nail with a knot of rope around it.'],
    ['に','ni','A needle, and two threads beside it.'],
    ['ぬ','nu','Noodles twirled up, with a loop left over.'],
    ['ね','ne','A cat with a curled tail. Neko.'],
    ['の','no','One circling stroke. No, nothing else.'],
    ['は','ha','A hat on a pole, with a crossbar.'],
    ['ひ','hi','A wide grin. Hee hee.'],
    ['ふ','fu','Mount Fuji, with cloud on either side.'],
    ['へ','he','A low hill. The simplest sign there is.'],
    ['ほ','ho','は with one bar more: a house with a chimney.'],
    ['ま','ma','A mast with two crossbars and a loop below.'],
    ['み','mi','A curl with a tail, like the numeral 3 dancing.'],
    ['む','mu','A cow with a flick of its tail. Moo.'],
    ['め','me','An eye. me means eye. ぬ without the loop.'],
    ['も','mo','A fishhook with two worms on the line.'],
    ['や','ya','A yacht: sail, mast and keel.'],
    ['ゆ','yu','A looped fish, unique among the rest.'],
    ['よ','yo','A yo-yo hanging on its string.'],
    ['ら','ra','A rabbit sitting up on its hind legs.'],
    ['り','ri','Two reeds standing side by side.'],
    ['る','ru','A road that turns and ties itself in a loop.'],
    ['れ','re','る with the tail flying free. A rebel.'],
    ['ろ','ro','る without the loop: the road just turns.'],
    ['わ','wa','れ with a rounder belly. A wasp.'],
    ['を','wo','A figure carrying a load. Only ever a particle.'],
    ['ん','n','One swoop. The only sign that can end a word alone.']
  ];

  const K_BASIC = [
    ['ア','a','An axe head, striking to the left.'],
    ['イ','i','An easel seen from the side.'],
    ['ウ','u','A roof. Everything under it says oo.'],
    ['エ','e','An I-beam, straight off the engineering drawing.'],
    ['オ','o','ア with a leg stuck out.'],
    ['カ','ka','か straightened out: one katana slash.'],
    ['キ','ki','A key, cut sharper than き.'],
    ['ク','ku','A corner, cut clean.'],
    ['ケ','ke','A keg with a strap across it.'],
    ['コ','ko','A corner bracket.'],
    ['サ','sa','Three prongs: the crest on a samurai helmet.'],
    ['シ','shi','Two dots, then a sweep UP from the lower left. Compare ツ.'],
    ['ス','su','A ski slope with a pole.'],
    ['セ','se','せ with the curl squared off.'],
    ['ソ','so','One dot, then a stroke DOWN from the top. Compare ン.'],
    ['タ','ta','ク with a bar through it: a luggage tag.'],
    ['チ','chi','A cheese wedge on a stand.'],
    ['ツ','tsu','Two dots, then a sweep DOWN from the top. Compare シ.'],
    ['テ','te','A telephone pole with two wires.'],
    ['ト','to','A pole with a nub at the toe.'],
    ['ナ','na','A knife crossing a post.'],
    ['ニ','ni','Two lines. ni is two.'],
    ['ヌ','nu','Noodles, crossed with a chopstick.'],
    ['ネ','ne','A necktie hanging down.'],
    ['ノ','no','A single slash. No more than that.'],
    ['ハ','ha','Two legs apart, laughing. Ha ha.'],
    ['ヒ','hi','A heel and a shin.'],
    ['フ','fu','One corner of a flag.'],
    ['ヘ','he','The same low hill as へ. The two are twins.'],
    ['ホ','ho','A cross with two props: a house frame.'],
    ['マ','ma','A marker tick.'],
    ['ミ','mi','Three lines. mi is three.'],
    ['ム','mu','A crescent corner, mouth open to moo.'],
    ['メ','me','An X marks what the eye has found.'],
    ['モ','mo','も pulled straight.'],
    ['ヤ','ya','A yacht mast with the boom across it.'],
    ['ユ','yu','A U standing on a base.'],
    ['ヨ','yo','Three prongs of a fork. Yo!'],
    ['ラ','ra','A ramp with a roof over it.'],
    ['リ','ri','Two reeds, straightened.'],
    ['ル','ru','Two legs, the right one curling away.'],
    ['レ','re','A single tick, rebounding upward.'],
    ['ロ','ro','A square room.'],
    ['ワ','wa','ウ without its mark: a bare wall.'],
    ['ヲ','wo','A hook. You will almost never write this one.'],
    ['ン','n','One dot, then a sweep UP from below. Compare ソ.']
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

  /* The marked kana are systematic, so their notes are derived rather than written out.
     Unicode helps: a voiced sign sits one code point after its plain form, and a
     handakuten sign two after — が is か + 1, ぱ is は + 2. */
  function romajiMap(rows) {
    const m = {};
    rows.forEach(function (r) { m[r[0]] = r[1]; });
    return m;
  }

  function markedHint(kana, romaji, plain) {
    const handaku = romaji.charAt(0) === 'p';
    const base = String.fromCharCode(kana.charCodeAt(0) - (handaku ? 2 : 1));
    const from = plain[base];
    if (!from) return '';
    return base + ' with ' + (handaku ? 'the ring ゜' : 'the two strokes ゛') +
           ' — ' + from + ' becomes ' + romaji + '.';
  }

  function glideHint(kana, romaji, plain) {
    const big = kana.charAt(0);
    const small = kana.charAt(1);
    const from = plain[big];
    if (!from) return '';
    const tail = { 'ゃ': 'ya', 'ゅ': 'yu', 'ょ': 'yo', 'ャ': 'ya', 'ュ': 'yu', 'ョ': 'yo' }[small];
    return big + ' plus a small ' + small + ' — one beat, not two: ' +
           romaji + ', never ' + from + '-' + tail + '.';
  }

  function kanaDeck(id, jp, en, note, rows, columns, plain, derive) {
    return {
      id: id,
      jp: jp,
      en: en,
      note: note,
      kind: 'kana',
      columns: columns || 5,
      items: rows.map(function (row) {
        return {
          id: id + ':' + row[0],
          jp: row[0],
          reading: row[1],
          en: row[1],
          hint: row[2] || (derive ? derive(row[0], row[1], plain) : '')
        };
      })
    };
  }

  const H_PLAIN = romajiMap(H_BASIC);
  const K_PLAIN = romajiMap(K_BASIC);
  /* Glides can be built on a voiced sign too (ぎゃ, じゃ), so that lookup needs both tables. */
  const H_ALL = romajiMap(H_BASIC.concat(H_DAKUTEN));
  const K_ALL = romajiMap(K_BASIC.concat(K_DAKUTEN));

  KM.DATA.kana = [
    kanaDeck('hira-gojuon', 'ひらがな 五十音', 'Hiragana, the 46 basic signs',
      'The flowing script, used for every native Japanese word and all the grammar between them. Start here.',
      H_BASIC, 5),
    kanaDeck('hira-dakuten', 'ひらがな 濁点', 'Hiragana, voiced marks',
      'No new shapes to learn — only two marks. ゛ voices a sound (k to g, s to z, t to d, h to b) and ゜ turns the h row into p.',
      H_DAKUTEN, 5, H_PLAIN, markedHint),
    kanaDeck('hira-yoon', 'ひらがな 拗音', 'Hiragana, glides',
      'A small ゃ ゅ ょ fuses with the sign before it. きゃ is one beat, kya — not ki-ya. Size matters: きや is two beats.',
      H_YOON, 3, H_ALL, glideHint),
    kanaDeck('kata-gojuon', 'カタカナ 五十音', 'Katakana, the 46 basic signs',
      'The angular script. It carries foreign words, names, and anything meant to stand out — the italics of Japanese.',
      K_BASIC, 5),
    kanaDeck('kata-dakuten', 'カタカナ 濁点', 'Katakana, voiced marks',
      'The same two marks, the same rule, a sharper hand.',
      K_DAKUTEN, 5, K_PLAIN, markedHint),
    kanaDeck('kata-yoon', 'カタカナ 拗音', 'Katakana, glides',
      'Small ャ ュ ョ. Most borrowed words arrive through these.',
      K_YOON, 3, K_ALL, glideHint)
  ];
})();
