/* 語彙 — core vocabulary, roughly JLPT N5 in scope */
(function () {
  const KM = (window.KM = window.KM || {});
  KM.DATA = KM.DATA || {};

  /* [ kana, kanji (may be empty), romaji, english ] */
  const FOOD = [
    ['ごはん','ご飯','gohan','cooked rice; a meal'],
    ['みず','水','mizu','water'],
    ['おちゃ','お茶','ocha','tea'],
    ['さかな','魚','sakana','fish'],
    ['にく','肉','niku','meat'],
    ['たまご','卵','tamago','egg'],
    ['やさい','野菜','yasai','vegetable'],
    ['くだもの','果物','kudamono','fruit'],
    ['りんご','','ringo','apple'],
    ['みかん','','mikan','mandarin orange'],
    ['パン','','pan','bread'],
    ['たべもの','食べ物','tabemono','food'],
    ['おかし','お菓子','okashi','sweets; snacks'],
    ['こめ','米','kome','uncooked rice'],
    ['みそしる','味噌汁','misoshiru','miso soup'],
    ['すし','寿司','sushi','sushi'],
    ['そば','蕎麦','soba','buckwheat noodles'],
    ['うどん','','udon','udon noodles'],
    ['しお','塩','shio','salt'],
    ['さとう','砂糖','satou','sugar'],
    ['ぎゅうにゅう','牛乳','gyuunyuu','milk'],
    ['コーヒー','','koohii','coffee']
  ];

  const PEOPLE = [
    ['ひと','人','hito','person'],
    ['おとこ','男','otoko','man'],
    ['おんな','女','onna','woman'],
    ['こども','子供','kodomo','child'],
    ['ともだち','友達','tomodachi','friend'],
    ['せんせい','先生','sensei','teacher'],
    ['がくせい','学生','gakusei','student'],
    ['かぞく','家族','kazoku','family'],
    ['ちち','父','chichi','(my) father'],
    ['はは','母','haha','(my) mother'],
    ['あに','兄','ani','(my) older brother'],
    ['あね','姉','ane','(my) older sister'],
    ['おとうと','弟','otouto','younger brother'],
    ['いもうと','妹','imouto','younger sister'],
    ['おじいさん','','ojiisan','grandfather; old man'],
    ['おばあさん','','obaasan','grandmother; old woman'],
    ['わたし','私','watashi','I; me'],
    ['なまえ','名前','namae','name']
  ];

  const NATURE = [
    ['やま','山','yama','mountain'],
    ['かわ','川','kawa','river'],
    ['うみ','海','umi','sea'],
    ['そら','空','sora','sky'],
    ['つき','月','tsuki','moon'],
    ['ひ','日','hi','sun; day'],
    ['ほし','星','hoshi','star'],
    ['き','木','ki','tree; wood'],
    ['はな','花','hana','flower'],
    ['さくら','桜','sakura','cherry blossom'],
    ['あめ','雨','ame','rain'],
    ['ゆき','雪','yuki','snow'],
    ['かぜ','風','kaze','wind'],
    ['いし','石','ishi','stone'],
    ['もり','森','mori','forest'],
    ['たけ','竹','take','bamboo'],
    ['いぬ','犬','inu','dog'],
    ['ねこ','猫','neko','cat'],
    ['とり','鳥','tori','bird'],
    ['むし','虫','mushi','insect'],
    ['うま','馬','uma','horse']
  ];

  const DAILY = [
    ['いえ','家','ie','house; home'],
    ['みせ','店','mise','shop'],
    ['がっこう','学校','gakkou','school'],
    ['えき','駅','eki','train station'],
    ['まち','町','machi','town'],
    ['くるま','車','kuruma','car'],
    ['でんしゃ','電車','densha','train'],
    ['ほん','本','hon','book'],
    ['かみ','紙','kami','paper'],
    ['つくえ','机','tsukue','desk'],
    ['いす','椅子','isu','chair'],
    ['とけい','時計','tokei','clock; watch'],
    ['かばん','','kaban','bag'],
    ['くつ','靴','kutsu','shoes'],
    ['ふく','服','fuku','clothes'],
    ['かさ','傘','kasa','umbrella'],
    ['でんわ','電話','denwa','telephone'],
    ['かぎ','鍵','kagi','key'],
    ['まど','窓','mado','window'],
    ['みち','道','michi','road; path; the Way']
  ];

  const VERBS = [
    ['たべる','食べる','taberu','to eat'],
    ['のむ','飲む','nomu','to drink'],
    ['みる','見る','miru','to see; to watch'],
    ['きく','聞く','kiku','to listen; to ask'],
    ['はなす','話す','hanasu','to speak'],
    ['よむ','読む','yomu','to read'],
    ['かく','書く','kaku','to write'],
    ['いく','行く','iku','to go'],
    ['くる','来る','kuru','to come'],
    ['かえる','帰る','kaeru','to go home; to return'],
    ['する','','suru','to do'],
    ['ねる','寝る','neru','to sleep'],
    ['おきる','起きる','okiru','to get up; to wake'],
    ['かう','買う','kau','to buy'],
    ['まつ','待つ','matsu','to wait'],
    ['わかる','分かる','wakaru','to understand'],
    ['あるく','歩く','aruku','to walk'],
    ['はしる','走る','hashiru','to run'],
    ['おぼえる','覚える','oboeru','to memorise; to learn'],
    ['わすれる','忘れる','wasureru','to forget']
  ];

  const ADJECTIVES = [
    ['おおきい','大きい','ookii','big'],
    ['ちいさい','小さい','chiisai','small'],
    ['あたらしい','新しい','atarashii','new'],
    ['ふるい','古い','furui','old (of things)'],
    ['たかい','高い','takai','tall; expensive'],
    ['やすい','安い','yasui','cheap'],
    ['さむい','寒い','samui','cold (weather)'],
    ['あつい','暑い','atsui','hot (weather)'],
    ['おいしい','','oishii','delicious'],
    ['たのしい','楽しい','tanoshii','enjoyable; fun'],
    ['むずかしい','難しい','muzukashii','difficult'],
    ['やさしい','優しい','yasashii','kind; gentle'],
    ['いい','','ii','good'],
    ['わるい','悪い','warui','bad'],
    ['はやい','早い','hayai','early; fast'],
    ['おそい','遅い','osoi','slow; late'],
    ['しずか','静か','shizuka','quiet'],
    ['きれい','','kirei','pretty; clean'],
    ['げんき','元気','genki','well; full of energy'],
    ['ゆうめい','有名','yuumei','famous']
  ];

  const TIME_COLOR = [
    ['あか','赤','aka','red'],
    ['あお','青','ao','blue'],
    ['しろ','白','shiro','white'],
    ['くろ','黒','kuro','black'],
    ['きいろ','黄色','kiiro','yellow'],
    ['みどり','緑','midori','green'],
    ['きょう','今日','kyou','today'],
    ['あした','明日','ashita','tomorrow'],
    ['きのう','昨日','kinou','yesterday'],
    ['あさ','朝','asa','morning'],
    ['ひる','昼','hiru','noon; daytime'],
    ['よる','夜','yoru','night'],
    ['いま','今','ima','now'],
    ['まいにち','毎日','mainichi','every day'],
    ['ときどき','時々','tokidoki','sometimes'],
    ['はる','春','haru','spring'],
    ['なつ','夏','natsu','summer'],
    ['あき','秋','aki','autumn'],
    ['ふゆ','冬','fuyu','winter'],
    ['としつき','年月','toshitsuki','years and months; time']
  ];

  const NUMBERS = [
    ['ぜろ','零','zero','zero'],
    ['いち','一','ichi','one'],
    ['に','二','ni','two'],
    ['さん','三','san','three'],
    ['よん','四','yon','four'],
    ['ご','五','go','five'],
    ['ろく','六','roku','six'],
    ['なな','七','nana','seven'],
    ['はち','八','hachi','eight'],
    ['きゅう','九','kyuu','nine'],
    ['じゅう','十','juu','ten'],
    ['じゅういち','十一','juuichi','eleven'],
    ['にじゅう','二十','nijuu','twenty'],
    ['ひゃく','百','hyaku','one hundred'],
    ['せん','千','sen','one thousand'],
    ['まん','万','man','ten thousand'],
    ['ひとつ','一つ','hitotsu','one thing'],
    ['ふたつ','二つ','futatsu','two things'],
    ['みっつ','三つ','mittsu','three things'],
    ['よっつ','四つ','yottsu','four things'],
    ['いつつ','五つ','itsutsu','five things']
  ];

  /* 数 — the digit you already read, against the kana you do not. */
  const DIGITS = [
    ['0','ぜろ','zero'],   ['1','いち','ichi'],  ['2','に','ni'],
    ['3','さん','san'],    ['4','よん','yon'],   ['5','ご','go'],
    ['6','ろく','roku'],   ['7','なな','nana'],  ['8','はち','hachi'],
    ['9','きゅう','kyuu'], ['10','じゅう','juu'], ['11','じゅういち','juuichi'],
    ['12','じゅうに','juuni'], ['15','じゅうご','juugo'], ['20','にじゅう','nijuu'],
    ['24','にじゅうよん','nijuuyon'], ['30','さんじゅう','sanjuu'],
    ['50','ごじゅう','gojuu'], ['99','きゅうじゅうきゅう','kyuujuukyuu'],
    ['100','ひゃく','hyaku'], ['300','さんびゃく','sanbyaku'],
    ['1000','せん','sen'], ['3000','さんぜん','sanzen'], ['10000','いちまん','ichiman']
  ];

  function wordDeck(id, jp, en, note, rows) {
    return {
      id: id,
      jp: jp,
      en: en,
      note: note,
      kind: 'word',
      columns: 3,
      items: rows.map(function (r) {
        return { id: id + ':' + r[0], jp: r[1] || r[0], kana: r[0], reading: r[2], en: r[3] };
      })
    };
  }

  KM.DATA.vocab = [
    wordDeck('w-food', '食べ物', 'Food and drink',
      'Rice, tea, fish. The first words any traveller needs at the inn.', FOOD),
    wordDeck('w-people', '人と家族', 'People and family',
      'Who is who. Note that a family speaks of itself with humbler words than of others.', PEOPLE),
    wordDeck('w-nature', '自然', 'Nature',
      'Mountain, river, sea. Half of classical poetry is built from these twenty words.', NATURE),
    wordDeck('w-daily', '暮らし', 'Everyday things',
      'House, shop, station, book. The furniture of an ordinary day.', DAILY),
    wordDeck('w-verbs', '動詞', 'Verbs',
      'Eat, drink, go, come. The dictionary form is the form you meet first.', VERBS),
    wordDeck('w-adjectives', '形容詞', 'Adjectives',
      'Big, small, new, old. Words ending in -i behave quite unlike words ending in -na.', ADJECTIVES),
    wordDeck('w-time', '時と色', 'Time and colour',
      'Today, tomorrow, red, white, and the four seasons that order the year.', TIME_COLOR),
    {
      id: 'w-digits',
      jp: '数字',
      en: 'Numbers from digits',
      note: 'The digit is already familiar; the kana is not. Prices, platforms and floor numbers are written in Arabic numerals in Japan, so this is the pairing you actually need. Watch 300 and 3000 — the sound shifts to sanbyaku and sanzen.',
      kind: 'word',
      columns: 3,
      items: DIGITS.map(function (r) {
        return { id: 'w-digits:' + r[0], jp: r[1], kana: r[1], reading: r[2], en: r[0] };
      })
    },
    wordDeck('w-numbers', '数', 'Numbers',
      'One to ten thousand, plus the native counters hitotsu, futatsu, mittsu.', NUMBERS)
  ];
})();
