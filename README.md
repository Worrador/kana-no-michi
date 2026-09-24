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

## 腕試し — the placement ladder

Before anything else, if you already know some Japanese. Eight rungs — hiragana, its
marks and glides, katakana, its marks and glides, signs, words, kanji, phrases — four
questions each. Three of four carries you up. One bad rung is luck, so it takes **two
consecutive failures** to stop you; a complete beginner is out in about eight questions,
someone who knows the lot answers all thirty-two.

You are graded in 級 and 段, the scale used for everything from judo to the abacus:
十級 at the foot, 初段 at the top. But the grade is decoration. The point is that a
cleared rung **seeds the scheduler** — its items are marked known, so 手習い stops
offering them as new material and starts you at the first rung you did not clear.

The seeding is deliberately cautious. Four questions is a sample of a rung, not a survey
of its hundred items, so a cleared rung only lifts them to the first box: they still come
round for review, they just are not taught from scratch. And the rung it starts you at is
the lowest one you *failed*, not the last one you attempted — you can fail katakana and
still pass the words above it, and the katakana is what you should go back to.

## Three ways to walk it

It teaches before it tests. **手習い Learn** is the way in, and the other two are what
you do once you have something to practise.

| | |
|---|---|
| **手習い Learn** | Takes the five signs you know least well, **shows** each one first — reading, meaning, and a note on where its shape came from — then asks only those five until every one comes back correct twice. Nothing is timed against you. |
| **旅 Journey** | Five stations, thirty questions, four lanterns, a score and a fortune at the end. |
| **稽古 Practice** | No lanterns and no finish line. The scheduler picks whatever you are weakest at and keeps handing it to you. It ends only when you press **やめる Quit** — and you still get your tally and a fortune. |

And **巻物 Scrolls**, which is not a game at all: every chart laid out flat, with a
small green bar under each entry showing how well it has settled in.

## What it teaches

**597 items** across 29 roads.

- **似た仮名 Lookalikes (55)** — the pairs that actually get confused, drilled only
  against each other. A normal question draws its wrong answers from the whole deck,
  which is easy: め is obvious beside か. It is not obvious beside ぬ. Only signs that
  share a structure and differ by one stroke, one loop or one direction are in here —
  sets like つ/く/へ were cut, because those are merely all simple, which is not the
  same thing as confusable. A sign with no genuine lookalike is not in the deck at all,
  and a pair with only each other makes a straight two-way duel, which is the purest
  form of it. Here every wrong
  answer is a sign you could genuinely mistake this one for — ぬ/め, シ/ツ/ソ/ン,
  ね/れ/わ, る/ろ/そ — and a set with only two members gives three choices rather than
  padding itself out with something irrelevant. Same-reading pairs like へ/ヘ are
  deliberately excluded, because "which one is *he*?" has two right answers.
- **仮名 Kana (208)** — hiragana and katakana, each in three roads: the 46 basic
  signs, the 25 voiced forms (`か → が`), and the 33 glides (`き + ゃ → きゃ`).
  Every one of the 92 basic signs carries a mnemonic for its shape, including the
  distinctions that actually catch people out — シ sweeps **up** from the lower left,
  ツ sweeps **down** from the top. The notes for the marked and glided kana are
  *derived* rather than written: a voiced sign sits one code point after its plain
  form in Unicode, so が knows it is か with two strokes.
- **漢字 Kanji (71)** — numbers, nature, the body, position, and everyday life. The
  word lists already show kanji incidentally, as the spelling of a word; these teach
  the character itself, and specifically the thing that makes kanji hard: **two
  families of reading**. 音 *on'yomi* came from Chinese, 訓 *kun'yomi* is native
  Japanese, and which one surfaces depends on the company the character keeps — 山
  alone is *yama*, but in 火山 it is *-zan*. Each entry also gives the pictographic
  origin, because 川 stops being arbitrary once you see the three lines of water.

  **The rule for which reading to use is stated outright**, on the first card of any
  kanji lesson and above every kanji chart in the scrolls: alone or with a hiragana
  tail a character takes its kun reading, joined to another kanji it takes its on
  reading — with the honest caveat that this is a strong tendency and not a law.
  Every kanji then carries a compound chosen to show the *other* family at work, so
  the rule is demonstrated rather than asserted: 山 *yama* but 富士山 *Fujisan*, 火山
  *kazan*. The awkward cases are included deliberately — 手紙 *tegami* is two kanji and
  still kun, 九月 is *ku*gatsu and not *kyuu*, and 小川 shows a compound voicing its
  second half into *o-gawa*.
- **語彙 Words (162)** — food, people and family, nature, everyday things, verbs,
  adjectives, time and colour, numbers. Roughly JLPT N5 in scope, with kanji shown
  where a beginner would really meet it.
- **旅の漢字 Signs (37)** — the characters you meet rather than study: 出口 入口
  非常口, 男 女, 北口, 押 引, 大人 子供, 無料 有料, 禁煙 危険, 準備中. Asked by meaning
  only, in both directions, and never for a reading — you do not need to know that 出口
  reads *deguchi* in order to walk through it. Each carries a note on where you actually
  meet it.
- **動画の単語 Course words (520)** — vocabulary followed along with two video courses,
  kept in **the order each course teaches it**, in blocks of twenty, so a block matches
  what you have just watched rather than being scattered by theme. The two are separate
  roads on the list (一 and 二) because their numbering restarts. Romaji is
  derived from the kana by `tools/kana-to-romaji.py` rather than typed by hand; where a
  word also appears in the themed decks the two agree on every one of the 64 overlaps,
  which is how the converter was checked. Three readings in the source were wrong and
  are corrected here: 頬 is ほお not ほう, 金曜日 is きんようび not きにょうび, and コピー機
  is コピーき.
- **表現 Phrases (40)** — greetings, courtesy, the fixed exchanges of home and
  workplace, and what to say on the road. Each one carries a note about *when* it
  is actually said, which is usually the harder half.

Questions come in both directions — sign to sound, sound to sign, word to meaning,
meaning to word — so you are never just pattern-matching one column of a table. Kanji
are asked for their readings as well as their meanings, since knowing 山 means
"mountain" is only half of knowing it.

Tick **書く** and kana roads stop offering choices: you type the reading. It accepts
the common alternative romanisations, so `si`, `tu`, `hu`, `sya` and `nn` are all
fine.

## Ways of being asked

The same memory engine feeds all of them, so an item you are weak at resurfaces
whichever way you are playing.

| | |
|---|---|
| **choose** | See the sign, pick the sound — or the reverse. The default, in both directions. |
| **書く type** | Type the reading instead of choosing it. Strongest recall. Accepts `si`, `tu`, `hu`, `sya`, `nn`. Kana, kanji and word roads. |
| **聴く listen** | Hear it first; nothing is shown until you answer. Uses the browser's own Japanese voice, and says so plainly when the machine has none installed rather than mispronouncing everything in an English one. Kana, word and phrase roads. |
| **組む build** | Assemble the word from kana tiles, in order, with decoy tiles mixed in. Word roads only — a single kana is not a puzzle. |
| **速 blitz** | Five seconds a question. Applies to any road. |

**They are also filters.** Ticking one narrows the road list to the roads it can apply
to — tick 組む and only the word roads remain, since a single kana is not a puzzle to
assemble. Roads already chosen that fall outside the filter are dropped from the
selection, and a switch whose remaining roads would be none hides itself rather than
offering nothing. 書く and 組む are two different ways of giving an answer and so are
mutually exclusive; 聴く and 速 stack with either, which gives you *hear it and spell
it* and *hear it and type it* for free. One table in `game.js` declares what applies
where, and both the engine and the road list read it, so the list can never offer a
road where a ticked switch would quietly do nothing.

## Forgetting one road

**記録 Records** lists every road with how much of it you have met, and each carries its
own 忘れる. It clears that road's scheduler records and nothing else — 手習い will teach
those signs from scratch again, and the other twenty-eight are untouched. The full
白紙に戻す is still there for starting over completely.

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
- A correct answer presses a green **判子 hanko** seal over the scroll, in `multiply`
  blend so it soaks into the paper; a wrong one presses the same seal in vermilion.
  Green passes, red does not — the chosen answer is outlined to match.
- The timer is a stick of **線香 incense** with a live ember that flares as it runs low.
- Cherry petals drift down the background on a canvas, and stop entirely if you have
  asked your system for reduced motion.
- **灯** in the corner turns the paper to night: lantern light on sumi black.
- The paper ground is fixed to the viewport, so a long page scrolls over it rather than
  dragging it along and tiling it.

## Sound

All of it is synthesised at runtime with the Web Audio API. There are no audio files
either.

Right answers strike **拍子木**, the wooden clappers that open a kabuki scene, over a
koto string plucked up the **hirajōshi** scale as your combo climbs. Reaching a
station rings a **鈴** standing bell.

Behind that sits a **background piece that composes itself as it plays** — a slow koto
ambience on the same hirajōshi tuning, sparse and deliberately unresolved. The melody
is a weighted random walk that prefers small steps and leaves gaps; a low string sounds
every eighth beat, a drone breathes underneath, and the whole thing runs through a
generated reverb impulse so it has a room around it. It never loops, because there is
no loop — it is written one beat ahead of itself, forever.

Two independent toggles sit in the top corner: **音** effects and **楽** music. Both are
remembered. The music waits for your first click, as browsers require, fades in rather
than starting abruptly, and hushes itself when you switch tabs.

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

**A first run.** Take **手習い Learn**, tick only **ひらがな 五十音**, and leave 書く
unticked. Five signs will be shown to you and then drilled. Repeat that a few times, and
only then set out on 旅 — the road is a test, and it expects you to bring something to it.

## Layout

```
index.html              every screen, as plain sections
assets/css/fonts.css    Noto Serif JP, subset and inlined as a data URI
assets/css/style.css    the whole look; patterns and textures are inline SVG
assets/js/
  data/kana.js          hiragana and katakana, with shape mnemonics
  data/lookalikes.js    confusable sets, each drilled only against itself
  data/kanji.js         71 kanji with both reading families and their origins
  data/signs.js         37 signs for travelling, recognised by meaning alone
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

### Typography

Three faces, deliberately. Japanese is set in **Noto Serif JP**, subset to the ~590
characters the game actually renders and inlined into `assets/css/fonts.css` as a data
URI — about 150 KB. It is inlined rather than linked because Chrome treats every
`file://` document as an opaque origin and refuses to load a linked font from one, so a
linked `woff2` would silently fall back for anyone who just double-clicks `index.html`.
Latin prose uses an old-style serif from the system, and **romaji has its own monospace
stack** (Fira Code first, where installed), used only where romaji appears as a reading —
the typing field, reading lines, compound glosses — so transliteration reads as a gloss
set apart from the text, and `shougakkou` is unambiguous.

Run `python tools/build-font.py` after adding new Japanese text, to re-subset and
re-inline. The source font is downloaded on demand and is not committed; only the
subset ships. Noto Serif JP is under the SIL Open Font License 1.1 — see
`assets/fonts/OFL.txt`.

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
