# LEFT. link page

The page in the Instagram bio of [@antonio.left](https://www.instagram.com/antonio.left/):
the streaming platforms, Spotify's player, a short bio, and photos by Guilherme Cabral.

Live at https://antonioleft.com (the old address, antoniograzzawut.github.io/left, forwards there)

| File | What |
| --- | --- |
| `index.html` | The 8-bit version, at the main address |
| `studio.html` | The studio version, at https://antonioleft.com/studio.html. Set aside on 4 Nov 2026: left as it was, not kept up to date |
| `layout.css` | Where everything sits, shared by both |
| `page.js` | The photo loop, the bio box, the player's box, the 8-bit sounds and the LIMBO sticker |
| `portfolio/` | The portfolio for residencies and open calls, at https://antonioleft.com/portfolio/: the CV/BIO as a web page, with its photos in `portfolio/img/` |
| `limbo/` | LIMBO as a game, at https://antonioleft.com/limbo/: five calls, a choice after each, the lyrics with English under them. Its sound goes in `limbo/audio/` |
| `antonio-graca-bio.pdf` | The CV/BIO, linked from the portfolio, without the phone number and personal email |
| `bio.html` | How Android phones see that PDF: they cannot open one inside Instagram, so this page draws it |
| `vendor/pdfjs/` | The tool `bio.html` draws the PDF with (pdf.js 5.7.284 by Mozilla, free to use) |
| `img/` | The photos, the 8-bit sprites and the logo |
| `CNAME` | The address antonioleft.com. GitHub wrote it; leave it as it is |

## Changing it

**Text and links.** Open the file here on GitHub, click the pencil, change only
the words between `>` and `<` (for a link, only the address inside the quotes
after `href=`), then press "Commit changes", and once more in the small window
that opens. Every link and the bio are written
twice, once in `index.html` and once in `studio.html`: change both. The live
page follows within a few minutes, but a phone that opened it in the last 10
minutes can still show the old version for a while.

**The bio PDF.** Press "Add file", then "Upload files", drop in the new PDF
named exactly `antonio-graca-bio.pdf`, then press "Commit changes" at the bottom
of the page. Android phones show it through `bio.html`, which reads the same file,
so nothing else changes. Canva exports it at about 5 MB: ask Claude to make it
lighter first, so it opens faster on a phone. Anyone can
download it, and every old version stays readable in the history, so it must
never carry the phone number or the personal email. Delete them in Canva before
exporting: Canva also draws the shadow of a text as a picture, so a text removed
from the PDF afterwards can still be read in its shadow.

**The player.** "Hear me out?" opens Spotify's own player with the top tracks of
the LEFT. artist page, so it follows Spotify by itself. To show an album or a
playlist instead, ask Claude.

**Sounds.** On the 8-bit page every press makes a small sound, like an old
game, and when the mouse makes him turn, a swoosh from that side (browsers only
allow it after the first click on the page). To turn them off, open `index.html`, find `<body data-bpm="120" data-wobble data-sounds>`
and delete ` data-sounds` (with the space before it). The studio page has no sounds.

**The LIMBO sticker.** On the 8-bit page, three seconds after it opens, a sticker
saying "Play LIMBO now!" lands on the photo and leads to the game; its X takes it off
until the tab is closed. To take it away for good, delete the lines from
`<div class="sticker">` to the `</div>` under them in `index.html`.

**The portfolio.** Its words are in `portfolio/index.html`, changed the same way
as the link page, and each one is written only once. They come from the CV/BIO
PDF, so when the PDF changes, change them too, or ask Claude. To get it as a
PDF, open it on a laptop in Chrome, press Print and choose "Save as PDF": it
comes out black on white, on three pages, with the links still working.

**LIMBO.** The words, the English, the calls and their choices, and the credits
are all in `limbo/album.js`: each line of a song is the Portuguese, then ` | `,
then the English. The sound is one MP3 per track in `limbo/audio/`, named by its
number, plus `title.mp3`, the album's intro in 8 bits, the only 8-bit thing left:
it plays on the title screen until PRESS START. (A phone only lets a page play sound
after a tap on it, so on a first visit the button says INSERT COIN first; coming from
the sticker on the link page, Chrome lets the music start at once.) Then a screen
with only the choice of language, and no music. Each song waits behind a single
play button that opens into it. The game is played in the dark, each track with its
own look (its `vibe` in `album.js`), drawn in `limbo/index.html`; the calls share the
green of an old phone, and the end opens into the white void of the album's cover.
There are no pictures of António in the game: the phone shows who calls as a role
(Amigo, Namorada, Amigo 2, Irmão, Mãe: `caller` in `album.js`), and the real voices
are in the credits.

**Playing it.** While a song plays only the line being sung shows, and its longest
word lights up: catching it scores, more the sooner, and catches in a row multiply
the points. In Silêncio it turns around: points for touching nothing. When nobody
sings, the song's own little 8-bit picture moves in the middle (a coin for the Intro,
the sun for Siga, a bomb for Violento, a heart for Pulso, an hourglass for Volto a ti,
the car for A1 Norte, a mirror ball for Dançar, a diamond for Quero mais, a candle for
Silêncio, a rain cloud for Não estou bem, a crying eye for Chora), drawn in
`limbo/game.js`. A call shows what the voice says as chat messages, one at a time,
each in its own seconds of the track (`chat` in `album.js`: "from-to | Portuguese |
English"); at its `choose` second the messages go and only the choice stays, while
the call plays on. These times are for the call files on the site now, so new files
need new times. A ringing phone can be declined, which means GAME OVER, with nine
seconds to go back. Ten seconds to choose once a call is over, or fate picks ("Parar
o relógio" stops the clock; phones set to reduce motion get none). After each song,
the game's own system tells the story so far (`story` in `album.js`: each song's
line depends on the choice before it) and who you are becoming, then the next call
rings. The system is failing: glitches, rare at first and more and more towards the
end, with its errors in the story. Skipping a song early gets a cheeky line
(`skips`). The end shows the score and a grade, the best on that phone, each choice
on a card in its song's colours with the share of "souls in Limbo" who chose the same
(made up: `souls` in `album.js`), the ending's name and traits (`ending`), a button
to share it, and the album's credits rolling up. Siga starts 2.6 seconds in, after
its silence (`from` in `album.js`).

**LIMBO's lyrics in time with the music.** `limbo/timings.js` says when each line
is sung. Its first version was made by machine on 5 Nov 2026 (the voice pulled out
of each song, what it sings recognised and matched to the words), so some lines can
be a second or two off. To fix a song, open https://antonioleft.com/limbo/sync.html
on a phone or a laptop, pick the song, and tap the big button, or press space, the
moment each line starts; "Undo" goes back a line. A song timed this way plays in
time on that same device at once. For everyone, press "Descarregar timings.js" at
the bottom, then in the `limbo` folder here press "Add file", "Upload files", drop
that file in (it replaces the old one) and press "Commit changes". The times can
also be pasted to Claude.

**Photos.** Ask Claude. They are cropped, lined up and converted, so a raw photo
uploaded over an old one will not sit right.

Every earlier version stays in the history, so any change can be undone.
