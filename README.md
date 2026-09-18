# 仮名の道 — Kana no Michi

*The Path of Kana.* A quiet browser game for learning Japanese, built to look like
a woodblock print and to run from a single double-click.

No build step, no dependencies, no network calls, no asset files. Open `index.html`
and play.

---

## The idea

You walk an old highway. The road is divided into five post stations, and at each
station the scroll shows you a sign, a word or a phrase. Read it before the stick
of incense burns out.

Four paper lanterns light your way. A wrong answer snuffs one out. Clear a whole
station without a stumble and one is relit. When the last lantern goes dark, the
road turns you back.

At the end you are handed an **omikuji** — the paper fortune drawn at a shrine —
except this one is earned rather than drawn. 大吉 for a near-perfect walk, 凶 if
the lanterns failed you.

## Two ways to walk it

| | |
|---|---|
| **旅 Journey** | Five stations, thirty questions, four lanterns, a score and a fortune at the end. |
| **稽古 Practice** | No lanterns, no ending. The scheduler picks whatever you are weakest at and keeps handing it to you. Leave when you like. |

And **巻物 Scrolls**, which is not a game at all: every chart laid out flat, with a
small green bar under each entry showing how well it has settled in.

## What it teaches

**410 items** across 18 roads.

- **仮名 Kana (208)** — hiragana and katakana, each in three roads: the 46 basic
  signs, the 25 voiced forms (`か → が`), and the 33 glides (`き + ゃ → きゃ`).
- **語彙 Words (162)** — food, people and family, nature, everyday things, verbs,
  adjectives, time and colour, numbers. Roughly JLPT N5 in scope, with kanji shown
  where a beginner would really meet it.
- **表現 Phrases (40)** — greetings, courtesy, the fixed exchanges of home and
  workplace, and what to say on the road. Each one carries a note about *when* it
  is actually said, which is usually the harder half.

Questions come in both directions — sign to sound, sound to sign, word to meaning,
meaning to word — so you are never just pattern-matching one column of a table.

Tick **書く** and kana roads stop offering choices: you type the reading. It accepts
the common alternative romanisations, so `si`, `tu`, `hu`, `sya` and `nn` are all
fine.

## How it decides what to ask

A five-box Leitner scheduler, one box per item, with intervals of 0, 1, 3, 7 and 21
days. A right answer moves an item up one box; a wrong answer drops it two, because
a thing you just got wrong is not a thing you half-know.

Weighting follows from that: items you have never seen come first, items that are
due come next, and items resting in a high box still surface occasionally so they
never quietly rot. Mastery for a road is the average box across its items, which is
what the ring on each card and the bars in **記録 Records** are showing.

Everything is kept in `localStorage` under one key. Nothing leaves your machine.

## The look

Everything on screen is generated — there is not one image file in this repository.

- The paper is an SVG turbulence filter blended over a warm ground.
- The **青海波 seigaiha** wave band under the header is a tiling SVG of three
  concentric arcs.
- The prompt hangs in a **掛軸 kakejiku** scroll: brocade silk mount, a slim batten
  above and a weighted, capped roller below.
- A correct answer presses a vermilion **判子 hanko** seal over the scroll, in
  `multiply` blend so it soaks into the paper like real cinnabar ink.
- The timer is a stick of **線香 incense** with a live ember that flares as it runs low.
- Cherry petals drift down the background on a canvas, and stop entirely if you have
  asked your system for reduced motion.
- **灯** in the corner turns the paper to night: lantern light on sumi black.

Sound is synthesised at runtime with the Web Audio API — no files. Right answers
strike **拍子木**, the wooden clappers that open a kabuki scene, over a koto string
plucked up the **hirajōshi** scale as your combo climbs. Reaching a station rings a
**鈴** standing bell.

## Playing

Open `index.html` in any modern browser. That is the whole installation.

If you would rather serve it — which guarantees progress is saved in every browser —
any static server will do:

```sh
python -m http.server 8000     # then visit http://localhost:8000
npx serve .
```

**Keys.** `1`–`4` choose an answer, `Enter` walks on from a station, `Esc` leaves
the road.

## Layout

```
index.html              every screen, as plain sections
assets/css/style.css    the whole look; patterns and textures are inline SVG
assets/js/
  data/kana.js          hiragana and katakana tables
  data/vocab.js         eight themed word lists
  data/phrases.js       set phrases, each with a note on when to say it
  storage.js            one localStorage key, versioned
  srs.js                the Leitner scheduler
  audio.js              synthesised clappers, koto and bell
  game.js               sessions, question construction, scoring, fortunes
  app.js                screens, input, the run loop, falling petals
```

Scripts are plain classic scripts sharing a `KM` namespace rather than ES modules,
specifically so that `file://` works without a server.

### Adding material

Append to a table in `assets/js/data/`, or add a deck with `wordDeck(...)` — it will
appear on the road list, in the scrolls and in the records with no other changes.
Item shape:

```js
{ id: 'unique', jp: '山', kana: 'やま', reading: 'yama', en: 'mountain', hint: 'optional' }
```

## Licence

MIT. See [LICENSE](LICENSE).

---

道は一歩から — *a road begins with one step.*
