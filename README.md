# LEFT. link page

The page in the Instagram bio of [@antonio.left](https://www.instagram.com/antonio.left/):
the streaming platforms, a short bio, and photos by Guilherme Cabral.

Live at https://antoniograzzawut.github.io/left/

| File | What |
| --- | --- |
| `index.html` | The 8-bit version, at the main address |
| `studio.html` | The studio version, at https://antoniograzzawut.github.io/left/studio.html |
| `layout.css` | Where everything sits, shared by both |
| `page.js` | The photo loop and the bio box, shared by both |
| `antonio-graca-bio.pdf` | The bio behind "about me": the CV/BIO without the phone number and personal email |
| `bio.html` | How Android phones see that PDF: they cannot open one inside Instagram, so this page draws it |
| `vendor/pdfjs/` | The tool `bio.html` draws the PDF with (pdf.js 5.7.284 by Mozilla, free to use) |
| `img/` | The photos, the 8-bit sprites and the logo |

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

**Photos.** Ask Claude. They are cropped, lined up and converted, so a raw photo
uploaded over an old one will not sit right.

Every earlier version stays in the history, so any change can be undone.
