/* 旅の漢字 — signs you actually meet. Recognised by shape and meaning only:
   you do not need to know that 出口 is read deguchi in order to walk through it.
   [ sign, reading (for reference, never drilled), meaning, where you meet it ] */
(function () {
  const KM = (window.KM = window.KM || {});
  KM.DATA = KM.DATA || {};

  const WAYFINDING = [
    ['出口','deguchi','Exit','The single most useful pair of characters in Japan.'],
    ['入口','iriguchi','Entrance','入 enters, 出 leaves. The 口 on both is mouth, here an opening.'],
    ['非常口','hijouguchi','Emergency exit','Always green, always with the running figure.'],
    ['駅','eki','Station','Tacked onto every station name: 東京駅 is Tokyo Station.'],
    ['北口','kitaguchi','North exit','Large stations name their exits by compass point, not number.'],
    ['南口','minamiguchi','South exit','南 south. Meeting someone means agreeing which 口.'],
    ['東口','higashiguchi','East exit','東 east, as in 東京 Tokyo, the eastern capital.'],
    ['西口','nishiguchi','West exit','西 west.'],
    ['改札','kaisatsu','Ticket gate','Where you tap in and out.'],
    ['切符','kippu','Ticket','On the machines, though IC cards have mostly replaced it.'],
    ['案内所','annaijo','Information desk','案内 means guidance; 所 a place.'],
    ['駐車場','chuushajou','Car park','車 is the car you already know.']
  ];

  const DOORS = [
    ['押','osu','Push','On the door itself. One character, one action.'],
    ['引','hiku','Pull','The other half of every glass door.'],
    ['開','hiraku','Open','Lift buttons: 開 holds the doors open.'],
    ['閉','shimeru','Closed; shut','閉 closes them. Note the 門 gate in both.'],
    ['営業中','eigyouchuu','Open for business','Hanging in the window of a shop.'],
    ['準備中','junbichuu','Preparing — not open yet','The trap. The lights are on but the kitchen is not ready.'],
    ['定休日','teikyuubi','Regular closing day','The weekday this shop shuts every week.'],
    ['本日','honjitsu','Today','Usually at the head of a notice about today only.']
  ];

  const MONEY = [
    ['大人','otona','Adult','On every ticket machine, above the higher price.'],
    ['子供','kodomo','Child','The cheaper fare.'],
    ['無料','muryou','Free of charge','無 means none. Good news.'],
    ['有料','yuuryou','Paid — there is a charge','有 means there is. Less good news.'],
    ['現金','genkin','Cash','Often followed by のみ only. Japan still likes cash.'],
    ['両替','ryougae','Money exchange','On machines that break notes into coins.'],
    ['会計','kaikei','The bill; the cashier','Say おかいけい to ask for the bill.'],
    ['円','en','Yen','The price is the number in front of it.']
  ];

  const WARNINGS = [
    ['男','otoko','Men','The toilet door. Usually blue, but do not rely on the colour.'],
    ['女','onna','Women','Usually red. Learn the two shapes; they differ more than they look.'],
    ['危険','kiken','Danger','Red, and it means it.'],
    ['禁煙','kinen','No smoking','禁 forbids, 煙 is smoke.'],
    ['立入禁止','tachiiri kinshi','No entry','Literally: entering on foot, forbidden.'],
    ['止まれ','tomare','Stop','Painted on the road at junctions. A red triangle.'],
    ['水','mizu','Cold water','On the tap. Also just water generally.'],
    ['湯','yu','Hot water','On the other tap, and on bathhouse curtains.'],
    ['温泉','onsen','Hot spring','And the swirling-steam mark that goes with it.']
  ];

  function signDeck(id, jp, en, note, rows) {
    return {
      id: id,
      jp: jp,
      en: en,
      note: note,
      kind: 'sign',
      columns: 2,
      items: rows.map(function (r) {
        return { id: id + ':' + r[0], jp: r[0], reading: r[1], en: r[2], hint: r[3] };
      })
    };
  }

  KM.DATA.signs = [
    signDeck('s-way', '旅の漢字 案内', 'Signs — finding your way',
      'Stations and streets. These are asked by meaning only: recognise the shape, walk the right way. The readings are given for reference and never drilled.', WAYFINDING),
    signDeck('s-doors', '旅の漢字 店', 'Signs — doors and shops',
      'Whether a place is open, and which way the door goes. 準備中 is the one that catches people out.', DOORS),
    signDeck('s-money', '旅の漢字 金', 'Signs — tickets and money',
      'Ticket machines and prices. Knowing 大人 and 無料 saves more confusion than any twenty words.', MONEY),
    signDeck('s-warn', '旅の漢字 注意', 'Signs — toilets and warnings',
      'The ones worth getting right first time.', WARNINGS)
  ];
})();
