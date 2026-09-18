/* 漢字 — the first characters, each with both reading families and where its shape came from.
   [ character, on-yomi, kun-yomi, romaji used for drilling, meaning, origin,
     [ compound, its reading, what it means ] ]
   The compound is chosen to show the OTHER reading family at work: a character read
   with kun on its own turns up with its on reading once it joins another kanji. */
(function () {
  const KM = (window.KM = window.KM || {});
  KM.DATA = KM.DATA || {};

  const NUMBERS = [
    ['一','イチ','ひと(つ)','ichi','one','One stroke. Nothing is simpler.',['一月','ichigatsu','January']],
    ['二','ニ','ふた(つ)','ni','two','Two strokes, the lower one longer.',['二月','nigatsu','February']],
    ['三','サン','みっ(つ)','san','three','Three strokes. The counting stops here.',['三月','sangatsu','March']],
    ['四','シ','よっ(つ)','yon','four','A mouth with legs. The old form really was four lines.',['四月','shigatsu','April — shi, not yon']],
    ['五','ゴ','いつ(つ)','go','five','A spool wound between two lines.',['五月','gogatsu','May']],
    ['六','ロク','むっ(つ)','roku','six','A roof standing on two legs.',['六月','rokugatsu','June']],
    ['七','シチ','なな(つ)','nana','seven','A cross with a hook cut through it.',['七月','shichigatsu','July — shichi, not nana']],
    ['八','ハチ','やっ(つ)','hachi','eight','Two strokes parting: something split in two.',['八月','hachigatsu','August']],
    ['九','キュウ','ここの(つ)','kyuu','nine','A hook doubling back on itself, almost ten.',['九月','kugatsu','September — ku, not kyuu']],
    ['十','ジュウ','とお','juu','ten','A complete cross: the full count.',['十月','juugatsu','October']],
    ['百','ヒャク','','hyaku','hundred','One (一) set above 白 white.',['三百','sanbyaku','three hundred — h voices to b']],
    ['千','セン','ち','sen','thousand','A stroke laid over ten (十).',['三千','sanzen','three thousand — s voices to z']],
    ['万','マン','','man','ten thousand','Japanese counts in units of ten thousand, not thousands.',['一万','ichiman','ten thousand']],
    ['円','エン','まる','en','yen; circle','Once 圓, a round coin. Now squared off.',['千円','sen-en','1000 yen']]
  ];

  const NATURE = [
    ['日','ニチ','ひ','hi','sun; day','The sun with a mark at its centre.',['毎日','mainichi','every day']],
    ['月','ゲツ','つき','tsuki','moon; month','A crescent moon.',['今月','kongetsu','this month']],
    ['火','カ','ひ','hi','fire','A flame with sparks flying off either side.',['火山','kazan','volcano — yama becomes zan']],
    ['水','スイ','みず','mizu','water','A stream with currents branching from it.',['水曜日','suiyoubi','Wednesday']],
    ['木','モク','き','ki','tree; wood','A tree: trunk, branches, roots.',['木曜日','mokuyoubi','Thursday']],
    ['金','キン','かね','kane','gold; metal; money','Nuggets buried under a roof in the earth.',['金魚','kingyo','goldfish']],
    ['土','ド','つち','tsuchi','earth; soil','A mound of earth heaped on the ground.',['土曜日','doyoubi','Saturday']],
    ['山','サン','やま','yama','mountain','Three peaks. Alone it is yama; in 火山 volcano it is -zan.',['富士山','Fujisan','Mount Fuji']],
    ['川','セン','かわ','kawa','river','Three lines of running water.',['小川','ogawa','a stream — both kun, and kawa voices to gawa']],
    ['田','デン','た','ta','rice field','A field divided into plots, seen from above.',['水田','suiden','paddy field']],
    ['天','テン','あま','ten','heaven; sky','A line drawn above a person: what is over your head.',['天気','tenki','weather']],
    ['空','クウ','そら','sora','sky; empty','A hole in a roof, and the open air beyond.',['空気','kuuki','air']],
    ['雨','ウ','あめ','ame','rain','Drops falling inside a window frame.',['大雨','ooame','heavy rain — both kun']],
    ['花','カ','はな','hana','flower','Grass on top, a figure changing beneath: a plant transformed.',['花火','hanabi','fireworks — both kun']],
    ['草','ソウ','くさ','kusa','grass','Grass over 早 early: what comes up first.',['草原','sougen','grassland']],
    ['石','セキ','いし','ishi','stone','A stone lying at the foot of a cliff.',['石油','sekiyu','petroleum']]
  ];

  const BODY = [
    ['人','ジン','ひと','hito','person','A figure walking, seen from the side.',['日本人','nihonjin','a Japanese person']],
    ['男','ダン','おとこ','otoko','man','Power (力) applied in the rice field (田).',['男子','danshi','boy']],
    ['女','ジョ','おんな','onna','woman','A figure kneeling with arms folded.',['女子','joshi','girl']],
    ['子','シ','こ','ko','child','A baby: arms out, legs swaddled together.',['子供','kodomo','child']],
    ['父','フ','ちち','chichi','father','A hand gripping a tool.',['お父さん','otousan','father — irregular, learn it whole']],
    ['母','ボ','はは','haha','mother','A figure with two dots: the breasts that nurse.',['お母さん','okaasan','mother — irregular, learn it whole']],
    ['友','ユウ','とも','tomo','friend','Two hands reaching the same way.',['友人','yuujin','friend, formally']],
    ['目','モク','め','me','eye','An eye, stood on its end.',['目的','mokuteki','purpose']],
    ['耳','ジ','みみ','mimi','ear','The outline of an ear.',['初耳','hatsumimi','news to me — both kun']],
    ['口','コウ','くち','kuchi','mouth','An open mouth.',['入口','iriguchi','entrance — kuchi voices to guchi']],
    ['手','シュ','て','te','hand','Fingers above, a wrist below.',['手紙','tegami','a letter — two kanji, yet both kun']],
    ['足','ソク','あし','ashi','foot; leg','A knee set over a foot.',['不足','fusoku','a shortage']],
    ['心','シン','こころ','kokoro','heart; mind','The chambers of a heart. Japanese puts feeling here, not in the head.',['安心','anshin','peace of mind']]
  ];

  const POSITION = [
    ['大','ダイ','おお(きい)','ookii','big','A person with arms stretched as wide as they go.',['大学','daigaku','university']],
    ['中','チュウ','なか','naka','middle; inside','A line driven through the centre of a box.',['中学','chuugaku','middle school']],
    ['小','ショウ','ちい(さい)','chiisai','small','Something split into little pieces.',['小学校','shougakkou','primary school']],
    ['上','ジョウ','うえ','ue','above; up','A mark standing above the line.',['上手','jouzu','skilful']],
    ['下','カ','した','shita','below; down','A mark hanging below the line.',['下手','heta','unskilful — the twin of jouzu']],
    ['左','サ','ひだり','hidari','left','A hand and a carpenter square.',['左右','sayuu','left and right']],
    ['右','ウ','みぎ','migi','right','A hand and a mouth.',['右手','migite','right hand — both kun']],
    ['前','ゼン','まえ','mae','before; front','Feet moving forward under a roof.',['午前','gozen','morning, a.m.']],
    ['後','ゴ','うし(ろ)','ushiro','behind; after','A road, a thread, and a dragging step.',['午後','gogo','afternoon, p.m.']],
    ['内','ナイ','うち','uchi','inside','A person within an enclosure.',['案内','annai','guidance']],
    ['外','ガイ','そと','soto','outside','Evening and divination: what was done out of doors.',['外国','gaikoku','a foreign country']],
    ['方','ホウ','かた','kata','direction; way','A plough turning aside.',['方法','houhou','a method']]
  ];

  const EVERYDAY = [
    ['本','ホン','もと','hon','book; origin','A tree with a mark at its root: the origin of the thing.',['日本','nihon','Japan — the origin of the sun']],
    ['学','ガク','まな(ぶ)','gaku','study; learning','A child under a roof, being taught.',['学生','gakusei','student']],
    ['校','コウ','','kou','school','Wood (木) and crossing (交): the building itself.',['学校','gakkou','school']],
    ['先','セン','さき','saki','ahead; previous','A foot stepping out in front.',['先生','sensei','teacher']],
    ['生','セイ','い(きる)','sei','life; birth','A shoot pushing up out of the ground.',['生活','seikatsu','daily life']],
    ['年','ネン','とし','toshi','year','A person carrying the harvest home: one crop, one year.',['来年','rainen','next year']],
    ['時','ジ','とき','toki','time; hour','The sun, and a measure kept at the temple.',['時間','jikan','time']],
    ['間','カン','あいだ','aida','interval; between','The sun seen through a gate (門).',['人間','ningen','a human being']],
    ['見','ケン','み(る)','miru','to see','An eye (目) walking about on legs.',['意見','iken','an opinion']],
    ['行','コウ','い(く)','iku','to go','A crossroads.',['銀行','ginkou','a bank']],
    ['来','ライ','く(る)','kuru','to come','Wheat. The same sign once meant arrival.',['来月','raigetsu','next month']],
    ['食','ショク','た(べる)','taberu','to eat; food','A lid set over a heap of grain.',['食事','shokuji','a meal']],
    ['飲','イン','の(む)','nomu','to drink','Food (食) beside a person opening wide.',['飲食','inshoku','food and drink']],
    ['言','ゲン','い(う)','iu','to say; word','A mouth with sound coming out of it.',['言語','gengo','language']],
    ['車','シャ','くるま','kuruma','vehicle; car','A cart from above: axle and wheels.',['電車','densha','train']],
    ['門','モン','かど','mon','gate','A pair of doors, swinging.',['専門','senmon','a speciality']]
  ];

  function kanjiDeck(id, jp, en, note, rows) {
    return {
      id: id,
      jp: jp,
      en: en,
      note: note,
      kind: 'kanji',
      columns: 3,
      items: rows.map(function (r) {
        return {
          id: id + ':' + r[0],
          jp: r[0],
          on: r[1],
          kun: r[2],
          reading: r[3],
          en: r[4],
          hint: r[5],
          ex: r[6]
        };
      })
    };
  }

  KM.DATA.kanji = [
    kanjiDeck('k-numbers', '漢数字', 'Kanji, numbers',
      'One to ten in three strokes or fewer. Note that Japanese counts in units of ten thousand (万), so 30,000 is 三万.', NUMBERS),
    kanjiDeck('k-nature', '漢字 自然', 'Kanji, nature',
      'The oldest characters, and the most transparent: most are still pictures of the thing they name.', NATURE),
    kanjiDeck('k-body', '漢字 人と体', 'Kanji, people and the body',
      'Bodies and relations. Several of these turn up inside more complicated characters as parts.', BODY),
    kanjiDeck('k-position', '漢字 大小と位置', 'Kanji, size and position',
      'Big, small, above, below, in, out. Abstract ideas drawn as diagrams rather than pictures.', POSITION),
    kanjiDeck('k-everyday', '漢字 暮らし', 'Kanji, everyday life',
      'School, time, going, coming, eating. The characters you meet on your first day in Japan.', EVERYDAY)
  ];
})();
