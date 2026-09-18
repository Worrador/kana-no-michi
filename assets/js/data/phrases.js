/* 挨拶と表現 — set phrases, the ones you actually say out loud */
(function () {
  const KM = (window.KM = window.KM || {});
  KM.DATA = KM.DATA || {};

  /* [ japanese, romaji, english, when to use it ] */
  const GREETINGS = [
    ['おはようございます','ohayou gozaimasu','Good morning','Before about ten in the morning; drop gozaimasu with friends.'],
    ['こんにちは','konnichiwa','Hello; good afternoon','The safe daytime greeting. The last character is written ha but said wa.'],
    ['こんばんは','konbanwa','Good evening','From dusk onwards.'],
    ['おやすみなさい','oyasumi nasai','Good night','Said when parting for the night or going to bed.'],
    ['さようなら','sayounara','Goodbye','Formal, and a little final. Friends say ja mata.'],
    ['またあした','mata ashita','See you tomorrow','Light and everyday.'],
    ['はじめまして','hajimemashite','How do you do','Only at a first meeting, ever.'],
    ['よろしくおねがいします','yoroshiku onegai shimasu','Please treat me well','Follows hajimemashite, and closes most requests.'],
    ['おげんきですか','ogenki desu ka','How are you?','Not asked daily as in English; it implies time has passed.'],
    ['ひさしぶりですね','hisashiburi desu ne','It has been a long time','For someone you have not seen in a while.']
  ];

  const COURTESY = [
    ['ありがとうございます','arigatou gozaimasu','Thank you','Past tense arigatou gozaimashita thanks for something finished.'],
    ['どういたしまして','dou itashimashite','You are welcome','Polite, slightly formal.'],
    ['すみません','sumimasen','Excuse me; sorry; thank you','The most useful word in Japanese. Calls a waiter, apologises, thanks.'],
    ['ごめんなさい','gomen nasai','I am sorry','A real apology rather than a polite noise.'],
    ['おねがいします','onegai shimasu','Please','Attach it to any request and it becomes courteous.'],
    ['しつれいします','shitsurei shimasu','Excuse me for the intrusion','Entering or leaving a room, or ending a call.'],
    ['だいじょうぶです','daijoubu desu','It is fine; I am all right','Also declines an offer politely.'],
    ['おめでとうございます','omedetou gozaimasu','Congratulations','Birthdays, weddings, new years.'],
    ['がんばって','ganbatte','Do your best; good luck','Said to someone about to try something hard.'],
    ['きをつけて','ki o tsukete','Take care','To someone leaving or travelling.']
  ];

  const HOUSEHOLD = [
    ['いただきます','itadakimasu','I gratefully receive','Said before eating, hands together. Never skipped.'],
    ['ごちそうさまでした','gochisousama deshita','Thank you for the meal','Said after eating, to cook and to food alike.'],
    ['いってきます','ittekimasu','I am off and will come back','Said by the person leaving the house.'],
    ['いってらっしゃい','itterasshai','Go and come back safely','The reply from those staying behind.'],
    ['ただいま','tadaima','I am home','Called out on returning.'],
    ['おかえりなさい','okaeri nasai','Welcome home','The answer to tadaima.'],
    ['おつかれさまです','otsukaresama desu','Thank you for your hard work','The universal greeting between colleagues, coming and going.'],
    ['おさきにしつれいします','osaki ni shitsurei shimasu','Excuse me for leaving first','Said when you leave the office before others.']
  ];

  const TRAVEL = [
    ['にほんごがわかりません','nihongo ga wakarimasen','I do not understand Japanese','Honest and very useful.'],
    ['えいごをはなせますか','eigo o hanasemasu ka','Can you speak English?','Ask it after sumimasen, not instead of it.'],
    ['もういちどおねがいします','mou ichido onegai shimasu','Once more, please','Better than nodding along.'],
    ['ゆっくりおねがいします','yukkuri onegai shimasu','Slowly, please','Works wonders.'],
    ['なまえはなんですか','namae wa nan desu ka','What is your name?','Add o before namae to be polite about theirs.'],
    ['これはいくらですか','kore wa ikura desu ka','How much is this?','Shops, stalls, markets.'],
    ['トイレはどこですか','toire wa doko desu ka','Where is the toilet?','doko desu ka asks where anything is.'],
    ['えきはどこですか','eki wa doko desu ka','Where is the station?','Swap eki for any place you need.'],
    ['たすけてください','tasukete kudasai','Please help me','Keep it, hope never to need it.'],
    ['わかりました','wakarimashita','I understand; understood','Said when something has just become clear.'],
    ['しりません','shirimasen','I do not know','Distinct from wakarimasen, I do not understand.'],
    ['たのしかったです','tanoshikatta desu','It was enjoyable','A gracious thing to say as you leave.']
  ];

  function phraseDeck(id, jp, en, note, rows) {
    return {
      id: id,
      jp: jp,
      en: en,
      note: note,
      kind: 'phrase',
      columns: 2,
      items: rows.map(function (r) {
        return { id: id + ':' + r[0], jp: r[0], kana: r[0], reading: r[1], en: r[2], hint: r[3] };
      })
    };
  }

  KM.DATA.phrases = [
    phraseDeck('p-greetings', '挨拶', 'Greetings',
      'The words that open a conversation, and the ones that close it.', GREETINGS),
    phraseDeck('p-courtesy', '礼儀', 'Courtesy',
      'Thanks, apology and permission. Politeness is grammar here, not decoration.', COURTESY),
    phraseDeck('p-household', '家と職場', 'Home and workplace',
      'Ritual exchanges. Each one has a fixed reply, and the reply is expected.', HOUSEHOLD),
    phraseDeck('p-travel', '旅', 'On the road',
      'Asking, not understanding, and asking again.', TRAVEL)
  ];
})();
