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
number, plus `title.mp3`, the album's intro in 8 bits that loops on the title
screen. The game is played in the dark, and each track has its own look (its
`vibe` in `album.js`): its colours and the scene behind its words, drawn in
`limbo/index.html`. The calls share the green of an old phone, and the end opens
into the white void of the album's cover. Its pictures are in `limbo/img/`. At the end, an 8-bit
bonus opens: the chiptune versions of Siga, Pulso, A1 Norte and Quero mais, listed
under `bonus` in `album.js`.

**LIMBO's lyrics in time with the music.** Open https://antonioleft.com/limbo/sync.html
(on a phone or a laptop), pick a song, and tap the big button, or press space, the
moment each line starts; "Undo" goes back a line. A song timed this way already lights
up line by line in the game on that same device. For everyone to see it, press
"Descarregar timings.js" at the bottom, then in the `limbo` folder here press "Add
file", "Upload files", drop that file in (it replaces the old one) and press "Commit
changes". The times can also be pasted to Claude.

**Photos.** Ask Claude. They are cropped, lined up and converted, so a raw photo
uploaded over an old one will not sit right.

Every earlier version stays in the history, so any change can be undone.
