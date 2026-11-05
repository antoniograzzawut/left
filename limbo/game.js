// LIMBO, the game-album by LEFT., played in the browser.
// The album is a path: the Intro, then five phone calls. Each call ends in a choice between two songs, and every
// path ends on "Limbo (fim)", so there are 32 ways through. The words, translations, calls, choices and credits are
// in album.js; when each line is sung is in timings.js.
// The title screen plays the album's intro in 8 bits until PRESS START; then the language, with no music. Each song
// waits behind a single play button, which opens into it. While it plays only the line being sung shows, and one
// word of it lights up: catching it scores. A call rings, and is answered or not. Each part of the album has its
// own look (its vibe in album.js, drawn in index.html). The end recaps the choices, the score and the credits.
(() => {
  const album = window.LIMBO;
  const byN = new Map(album.tracks.map(t => [t.n, t]));
  const calls = album.tracks.filter(t => t.call);
  const LAST = 17;
  // After a song comes the next call, and after the last pair of songs, the end
  const nextAfter = n => (calls.find(t => t.n > n) || byN.get(LAST)).n;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const TEXT = {
    pt: {
      by: 'um álbum-jogo de LEFT.', chooseLang: 'Em que língua queres jogar?',
      musicOn: 'Música: ligada', musicOff: 'Música: desligada', phones: 'Melhor com auscultadores',
      spotify: 'Ouvir o álbum no Spotify', play: 'Tocar', pause: 'Pausa', where: 'Onde vai a faixa',
      skip: 'Saltar', next: 'Continuar', soon: 'O áudio ainda não está aqui. Por agora, lê.',
      incoming: 'Chamada recebida', answer: 'Atender', decline: 'Recusar', onLine: 'Na linha',
      choose: 'Escolhe', hold: 'Parar o relógio', held: 'Relógio parado', fate: 'O destino escolheu por ti.',
      hungUp: 'Desligaste-lhe na cara.', cont: 'Continuar?', backToCall: 'Sim, voltar à chamada',
      credits: 'Ficha técnica', end: 'Fim', score: 'Pontos', best: 'Recorde', newBest: 'Novo recorde!',
      caught: 'Palavras apanhadas', grade: 'Nota', tapHint: 'Toca na palavra que acende.',
      hushHint: 'Shhh. Aqui não se toca em nada.', hushed: 'Shhh!',
      recap: 'As tuas escolhas', souls: 'das almas no Limbo escolheram o mesmo.',
      yourEnd: 'O teu final', share: 'Partilhar', copied: 'Copiado. Cola onde quiseres.',
      rollTitle: 'Créditos', again: 'Jogar outra vez', restart: 'Recomeçar', soFar: 'até agora', character: 'Personagem',
    },
    en: {
      by: 'a game-album by LEFT.', chooseLang: 'Which language do you want to play in?',
      musicOn: 'Music: on', musicOff: 'Music: off', phones: 'Best with headphones',
      spotify: 'Listen to the album on Spotify', play: 'Play', pause: 'Pause', where: 'Position in the track',
      skip: 'Skip', next: 'Continue', soon: 'The audio isn’t here yet. For now, read along.',
      incoming: 'Incoming call', answer: 'Answer', decline: 'Decline', onLine: 'On the line',
      choose: 'Choose', hold: 'Stop the clock', held: 'Clock stopped', fate: 'Fate chose for you.',
      hungUp: 'You hung up on them.', cont: 'Continue?', backToCall: 'Yes, back to the call',
      credits: 'Credits', end: 'The end', score: 'Score', best: 'Best', newBest: 'New best!',
      caught: 'Words caught', grade: 'Grade', tapHint: 'Tap the word that lights up.',
      hushHint: 'Shhh. Touch nothing here.', hushed: 'Shhh!',
      recap: 'Your choices', souls: 'of the souls in Limbo chose the same.',
      yourEnd: 'Your ending', share: 'Share', copied: 'Copied. Paste it anywhere.',
      rollTitle: 'Credits', again: 'Play again', restart: 'Start over', soFar: 'so far', character: 'Character',
    },
  };
  // The credits are written in Portuguese; in English only the roles change
  const ROLES = {
    produção: 'production', música: 'music', letra: 'lyrics', interpretação: 'performance', instrumentos: 'instruments',
    vozes: 'vocals', voz: 'voice', mistura: 'mix', master: 'mastering', guitarras: 'guitars', baixo: 'bass',
    teclas: 'keys', teclados: 'keyboards', bateria: 'drums', sintetizadores: 'synths', beat: 'beat', cordas: 'strings',
    sopros: 'horns', piano: 'piano', e: 'and',
  };

  const body = document.body;
  const game = document.getElementById('game');
  const restart = document.querySelector('.restart');
  const live = document.querySelector('.sr');
  const scene = document.querySelector('.scene');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  let lang = savedLang();
  let path = [];     // the song picked after each call
  let screen = 'title';
  let at = 0;        // the track on screen

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  // Words of the page itself come in both languages, and the one chosen shows
  const pair = ([pt, en]) => `<span class="ui-pt">${esc(pt)}</span><span class="ui-en" lang="en">${esc(en)}</span>`;
  const say = key => pair([TEXT.pt[key], TEXT.en[key]]);
  const both2 = key => [TEXT.pt[key], TEXT.en[key]];
  // Before the language is chosen: the Portuguese, and the English under it
  const both = key => `${esc(TEXT.pt[key])}<span class="also" lang="en">${esc(TEXT.en[key])}</span>`;
  // Words of the album are always in Portuguese, with the English under them when English is on
  const tr = (pt, en) => `${esc(pt)}${en && en !== pt ? `<span class="en" lang="en">${esc(en)}</span>` : ''}`;
  // A track's name as a heading: a guest artist in smaller letters under it, then the English
  const titleHTML = t => {
    const guest = t.title.match(/^(.*?) (\(ft\. .*\))$/);
    return (guest ? `${esc(guest[1])}<span class="ft">${esc(guest[2])}</span>` : esc(t.title)) +
      (t.en && t.en !== t.title ? `<span class="en" lang="en">${esc(t.en)}</span>` : '');
  };
  const plainTitle = t => t.title.replace(/ \(ft\..*\)/, '');
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  const ICON = {
    play: '<svg viewBox="0 0 7 7" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M1 0h1v1h1v1h1v1h1v1H4v1H3v1H2v1H1z"/></svg>',
    pause: '<svg viewBox="0 0 7 7" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M1 0h2v7H1zM4 0h2v7H4z"/></svg>',
  };
  const PHONE = '<svg class="phone" viewBox="0 0 12 10" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M1 0h10v1h1v3H9V2H3v2H0V1h1zM3 5h6v1h1v1h1v3H1V7h1V6h1zM5 7v1h2V7z"/></svg>';

  // ---- A small 8-bit picture for each song, moving in a few frames, for when nothing is being sung. Drawn from rows
  // of letters, each a colour; classes a/b, f1/f2/f3 are frames, the others moves (in index.html) ----
  function px(rows, key) {
    const d = {};
    rows.forEach((row, y) => [...row].forEach((ch, x) => { if (key[ch]) (d[ch] = d[ch] || []).push(`M${x} ${y}h1v1h-1z`); }));
    return Object.entries(d).map(([ch, path]) => `<path style="fill:${key[ch]}" d="${path.join('')}"/>`).join('');
  }
  const art = inner => `<svg class="art" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">${inner}</svg>`;
  const grid = (fn, h = 16, w = 16) => Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => fn(x, y)).join(''));
  const BALL = ['......XXXX......', '.....XXXXXX.....', '....XXXXXXXX....', '....XXXXXXXX....', '....XXXXXXXX....', '....XXXXXXXX....', '.....XXXXXX.....', '......XXXX......'];
  const ball = flip => grid((x, y) => (y >= 3 && y <= 10 && BALL[y - 3][x] === 'X' ? (((x + y) % 2) ^ flip ? 't' : 'T') : '.'));
  const drops = k => grid((x, y) => ([3, 6, 9, 12].some((c, i) => x === c && (y - 9 - ((i * 2 + k * 2) % 6) + 12) % 6 < 2 && y >= 9 && y <= 14) ? 'D' : '.'));
  const ART = {
    // the Intro: a coin spinning, like the one the game asks for
    night: art(`<g class="spin">${px(['', '......YYYY......', '....YYYYYYYY....', '...YYwYYYYYYy...', '..YYwYYYYYYYYy..', '..YwYYyYYYYYYy..', '.YYYYYyYYYYYYYy.', '.YYYYYyYYYYYYYy.', '.YYYYYyYYYYYYYy.', '.YYYYYyyyyYYYYy.', '..YYYYYYYYYYYy..', '..YYYYYYYYYYyy..', '...YYYYYYYYyy...', '....yYYYYYyy....', '......yyyy......'], { Y: '#F7C948', y: '#B8862B', w: '#FFF6D8' })}</g>`),
    // Siga: the sun, its rays turning
    sunrise: art(px(['', '', '', '', '......YYYY......', '.....YYYYYY.....', '....YYYYYYYY....', '....YYYYYYYY....', '....YYYYYYYY....', '....YYYYYYYY....', '.....YYYYYY.....', '......YYYY......'], { Y: '#FFC46B' }) +
      `<g class="a">${px(['', '.......OO.......', '.......OO.......', '', '', '', '', '.OO..........OO.', '.OO..........OO.', '', '', '', '', '.......OO.......', '.......OO.......'], { O: '#FF9A4D' })}</g>` +
      `<g class="b">${px(['', '', '..O.........O...', '...O.......O....', '', '', '', '', '', '', '', '', '...O.......O....', '..O.........O...'], { O: '#FF9A4D' })}</g>`),
    // Violento: a bomb, its fuse sparking
    riot: art(px(['', '', '', '', '...........F....', '..........F.....', '......BBBF......', '....BBBBBBB.....', '...BWBBBBBBB....', '...BWBBBBBBB....', '...BBBBBBBBB....', '...BBBBBBBBB....', '...BBBBBBBBB....', '....BBBBBBB.....', '......BBB.......'], { B: 'var(--red)', W: '#FFE8E3', F: '#C9A27E' }) +
      `<g class="a">${px(['', '............S...', '...........SSS..', '............S...'], { S: '#FFD84A' })}</g><g class="b">${px(['', '...........S.S..', '............S...', '...........S.S..'], { S: '#FFF2A8' })}</g>`),
    // Pulso: the heart, beating
    heart: art(`<g class="beat">${px(['', '', '', '...HHH....HHH...', '..HHHHH..HHHHH..', '.HHWWHHHHHHHHHH.', '.HHWHHHHHHHHHHH.', '.HHHHHHHHHHHHHH.', '..HHHHHHHHHHHH..', '...HHHHHHHHHH...', '....HHHHHHHH....', '.....HHHHHH.....', '......HHHH......', '.......HH.......'], { H: '#FF4F98', W: '#FFE4F1' })}</g>`),
    // Volto a ti: an hourglass, the years running through it
    sepia: art(px(['', '...FFFFFFFFFF...', '....G......G....', '....G......G....', '.....G....G.....', '......G..G......', '.......GG.......', '.......GG.......', '......G..G......', '.....G....G.....', '....G......G....', '....G......G....', '...FFFFFFFFFF...'], { F: '#D3A576', G: '#F4E5CB' }) +
      `<g class="f1">${px(['', '', '.....SSSSSS.....', '.....SSSSSS.....', '......SSSS......', '.......SS.......'], { S: '#E8875A' })}</g>` +
      `<g class="f2">${px(['', '', '', '', '......SSSS......', '.......SS.......', '', '', '.......S........', '.......S........', '......SSSS......', '.....SSSSSS.....'], { S: '#E8875A' })}</g>` +
      `<g class="f3">${px(['', '', '', '', '', '', '', '', '.......SS.......', '......SSSS......', '.....SSSSSS.....', '.....SSSSSS.....'], { S: '#E8875A' })}</g>`),
    // A1 Norte: the car on the motorway, the lines rushing past
    road: art(`<g class="bob">${px(['', '', '', '', '', '', '......RRRR......', '.....RBBBBR.....', '..RRRRRRRRRRRR..', '..RRRRRRRRRRRRY.', '..RRRRRRRRRRRR..'], { R: 'var(--red)', B: '#7FB0FF', Y: '#FFF7D6' })}</g>` +
      `<g class="a">${px(['', '', '', '', '', '', '', '', '', '', '', '....WW....WW....', '....WW....WW....'], { W: '#E8F0FF' })}</g><g class="b">${px(['', '', '', '', '', '', '', '', '', '', '', '....W.....W.....', '.....W.....W....'], { W: '#E8F0FF' })}</g>` +
      `<g class="dash">${px(['', '', '', '', '', '', '', '', '', '', '', '', '', '', 'DD..DD..DD..DD..DD..'], { D: '#E8F0FF' })}</g>`),
    // Dançar: the mirror ball, its tiles flashing
    club: art(px(['.......S........', '.......S........', '.......S........'], { S: '#FFF0DB' }) +
      `<g class="a">${px(ball(0), { T: '#FFF0DB', t: '#57E4FF' })}${px(['', '', '', '', '..P.............', '.PPP............', '..P.............', '', '', '.............P..', '............PPP.', '.............P..'], { P: '#FF58B2' })}</g>` +
      `<g class="b">${px(ball(1), { T: '#FFF0DB', t: '#57E4FF' })}${px(['', '', '.............P..', '............PPP.', '.............P..', '', '', '', '', '', '..P.............', '.PPP............', '..P.............'], { P: '#FF58B2' })}</g>`),
    // Quero mais: a diamond, glinting
    gold: art(`<g class="bob">${px(['', '', '', '.....GGGGGG.....', '....GGGGGGGG....', '...GGWGGGGGGG...', '...gggggggggg...', '....gggggggg....', '.....gggggg.....', '......gggg......', '.......gg.......'], { G: '#FFD866', g: '#E9BE52', W: '#FFFBEA' })}</g>` +
      `<g class="a">${px(['', '............W...', '...........WWW..', '............W...'], { W: '#FFFBEA' })}</g><g class="b">${px(['', '', '', '', '', '', '', '', '..W.............', '.WWW............', '..W.............'], { W: '#FFFBEA' })}</g>`),
    // Silêncio: a candle, barely moving
    quiet: art(px(['', '', '', '', '', '', '.......w........', '.....CCCCC......', '.....CCCCC......', '.....CCCCC......', '.....CCCCC......', '.....CCCCC......', '.....CCCCC......', '.....CCCCC......', '....BBBBBBB.....'], { w: '#4A4A4A', C: '#969696', B: '#6E6E6E' }) +
      `<g class="a">${px(['', '', '.......f........', '......fFf.......', '......fFf.......', '.......F........'], { F: '#EDEDED', f: '#BDBDBD' })}</g><g class="b">${px(['', '', '........f.......', '.......fFf......', '......fFf.......', '.......F........'], { F: '#EDEDED', f: '#BDBDBD' })}</g>`),
    // Não estou bem: a cloud that won't stop raining
    overcast: art(px(['', '', '.....CCCC.......', '...CCCCCCCC.....', '..CCCCCCCCCCC...', '.CCCCCCCCCCCCC..', '.CCCCCCCCCCCCC..', '..ccccccccccc...'], { C: '#9AAABA', c: '#6F7F8F' }) +
      `<g class="f1">${px(drops(0), { D: '#DAE2EA' })}</g><g class="f2">${px(drops(1), { D: '#DAE2EA' })}</g><g class="f3">${px(drops(2), { D: '#DAE2EA' })}</g>`),
    // Chora: an eye, crying ("dentro de um olho afogado")
    tears: art(px(['', '', '', '', '.....LLLLLL.....', '...LL......LL...', '..L....II....L..', '.L...IIPPII...L.', '.L...IIPPII...L.', '..L....II....L..', '...LL......LL...', '.....LLLLLL.....'], { L: '#E3F0FF', I: '#4FAEFF', P: '#061226' }) +
      `<g class="f1">${px(['', '', '', '', '', '', '', '', '', '', '', '', '...........T....', '...........T....'], { T: '#7DC2FF' })}</g>` +
      `<g class="f2">${px(['', '', '', '', '', '', '', '', '', '', '', '', '....T...........', '....T......T....', '...........T....'], { T: '#7DC2FF' })}</g>` +
      `<g class="f3">${px(['', '', '', '', '', '', '', '', '', '', '', '', '', '....T...........', '....T...........', '...........T....'], { T: '#7DC2FF' })}</g>`),
  };
  const idleHTML = t => (ART[t.vibe] ? `<div class="idle">${ART[t.vibe]}</div>` : '');

  function verses(words) {
    return words.trim().split(/\n\s*\n/).map(block => block.split('\n').map(line => {
      const [pt, en = ''] = line.split(' | ');
      return [pt.trim(), en.trim()];
    }));
  }
  // All the words at once: only for a song whose times aren't known yet
  const wordsHTML = t => !t.words ? '' : `<div class="words">${verses(t.words).map(v =>
    `<p>${v.map(([pt, en]) => `<span class="line">${tr(pt, en)}</span>`).join('')}</p>`).join('')}</div>`;
  const creditsEN = s => s.split(' · ').map(part => {
    const i = part.indexOf(': ');
    const role = part.slice(0, i).replace(/[A-Za-zÀ-ÿ]+/g, w => ROLES[w.toLowerCase()] || w);
    return role.charAt(0).toUpperCase() + role.slice(1) + part.slice(i);
  }).join(' · ');
  const creditsHTML = t => !t.credits ? '' :
    `<details class="credits"><summary>${say('credits')}</summary>
      <p><span class="ui-pt">${esc(t.credits)}</span><span class="ui-en" lang="en">${esc(creditsEN(t.credits))}</span></p></details>`;
  const callerHTML = t => pair(t.caller || [t.voice, t.voice]);

  // ---- A line over everything for a few seconds: fate's pick, the hint, what the game says on a skip ----
  const toastEl = document.createElement('p');
  toastEl.className = 'toast';
  toastEl.setAttribute('aria-hidden', 'true');
  document.body.append(toastEl);
  let toastTimer = null;
  function toast([pt, en], ms = 3200) {
    toastEl.innerHTML = pair([pt, en]);
    toastEl.classList.remove('show');
    void toastEl.offsetWidth;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), ms);
    announce(lang === 'en' ? en : pt);
  }
  function announce(message) {
    live.textContent = '';
    setTimeout(() => { live.textContent = message; }, 60);
  }

  // Each screen in its look: the colours change in a few steps and the scene behind comes in
  function setVibe(vibe) {
    if (body.dataset.vibe === vibe) return;
    body.dataset.vibe = vibe;
    scene.classList.remove('in');
    void scene.offsetWidth;
    scene.classList.add('in');
    themeColor.content = getComputedStyle(body).getPropertyValue('--paper').trim();
  }

  function render(name, html, focus, vibe = 'night', extra = '') {
    stopClock();
    clearInterval(overTimer);
    clearTimeout(storyTimer);
    buzz(false);
    stage = null;
    convo = null;
    screen = name;
    body.dataset.screen = name;
    setVibe(vibe);
    game.innerHTML = `<section class="screen ${name} ${extra}">${html}</section>`;
    restart.hidden = name === 'title';
    scrollTo(0, 0);
    if (focus === false) return;
    const target = game.querySelector(focus || 'h2');
    if (target) {
      if (!target.matches('button, a')) target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  }

  // ---- The sound of the album ----
  const audio = new Audio();
  audio.preload = 'auto';
  let onEnd = null, missing = false, seeking = false;
  // Each track is an MP3, or an M4A (what a Mac makes on its own); the MP3 is tried first
  const KINDS = ['mp3', 'm4a'];
  const file = (n, kind) => `audio/${String(n).padStart(2, '0')}.${kind}`;
  let attempt = 0, handled = 0, kind = 0;

  function listen(n, then) {
    onEnd = then;
    missing = false;
    media(n);
    load(n, 0);
  }
  // A track starts where its sound does (from, in album.js: Siga opens with seconds of silence)
  function load(n, k) {
    const mine = ++attempt;
    kind = k;
    const from = byN.get(n)?.from;
    audio.src = file(n, KINDS[k]) + (from ? `#t=${from}` : '');
    paint();
    const p = audio.play();
    if (p) p.then(paint, err => {
      if (err.name === 'NotSupportedError') failed(n, mine);
      else paint();  // the browser waits for a tap on Play, or another track was asked for first
    });
  }
  // That file isn't there: the other kind is tried, and with neither (yet) the words show whole
  // and the game goes on without the sound
  function failed(n, which) {
    if (n !== at || which !== attempt || handled === which || missing) return;
    handled = which;
    if (kind + 1 < KINDS.length) return load(n, kind + 1);
    missing = true;
    if (stage) { stage.box.innerHTML = wordsHTML(stage.t); stage = null; }
    paint();
    if (screen === 'call') finish();
  }
  function finish() {
    const then = onEnd;
    onEnd = null;
    paint();
    if (then) then();
  }
  audio.addEventListener('error', () => failed(at, attempt));
  audio.addEventListener('ended', finish);
  audio.addEventListener('play', paint);
  audio.addEventListener('pause', paint);
  audio.addEventListener('timeupdate', tick);
  audio.addEventListener('loadedmetadata', tick);

  function deckHTML(goOn) {
    return `<div class="deck" data-state="playing">
      <button class="pp" type="button"></button>
      <label class="sr" for="seek">${say('where')}</label>
      <input class="seek" id="seek" type="range" min="0" max="1000" step="1" value="0">
      <span class="time">0:00</span>
      <button class="skip" type="button">${say('skip')}</button>
      <p class="note">${say('soon')}</p>
      ${goOn ? `<button class="big go-on" type="button">${say('next')}</button>` : ''}
    </div>`;
  }
  function hookDeck() {
    const deck = game.querySelector('.deck');
    if (!deck) return;
    deck.querySelector('.pp').addEventListener('click', () => {
      if (audio.paused) audio.play().catch(() => {});
      else audio.pause();
    });
    const seek = deck.querySelector('.seek');
    seek.addEventListener('input', () => {
      seeking = true;
      if (isFinite(audio.duration)) audio.currentTime = seek.value / 1000 * audio.duration;
    });
    seek.addEventListener('change', () => { seeking = false; });
    deck.querySelector('.skip').addEventListener('click', () => {
      const early = !isFinite(audio.duration) || audio.currentTime < audio.duration * 0.6;
      audio.pause();
      if (screen === 'song' && !missing && early) {
        const line = skipLine(at);
        if (line) toast(line);
      }
      finish();
    });
    deck.querySelector('.go-on')?.addEventListener('click', () => { sfx.go(); finish(); });
    paint();
  }
  // What the game says when a song is skipped: its own line most of the time, or one of the lines for any song
  function skipLine(n) {
    const lines = album.skips || {}, any = lines.any || [];
    if (lines[n] && (Math.random() < 0.7 || !any.length)) return lines[n];
    return any.length ? any[Math.floor(Math.random() * any.length)] : null;
  }
  function paint() {
    const deck = game.querySelector('.deck');
    const section = game.querySelector('.screen');
    if (section) section.classList.toggle('playing', !!deck && !missing && !audio.paused);
    if (!deck) return;
    deck.dataset.state = missing ? 'missing' : audio.paused ? 'paused' : 'playing';
    deck.querySelector('.pp').innerHTML = (audio.paused ? ICON.play : ICON.pause) +
      `<span class="sr">${say(audio.paused ? 'play' : 'pause')}</span>`;
    tick();
  }
  function tick() {
    const deck = game.querySelector('.deck');
    if (!deck || missing) return;
    const d = audio.duration, c = audio.currentTime || 0;
    deck.querySelector('.time').textContent = isFinite(d) ? `${mmss(c)} / ${mmss(d)}` : mmss(c);
    if (!seeking && isFinite(d) && d > 0) deck.querySelector('.seek').value = Math.round(c / d * 1000);
  }
  // On the lock screen and in the phone's music controls
  function media(n) {
    if (!('mediaSession' in navigator) || !window.MediaMetadata) return;
    try { navigator.mediaSession.metadata = new MediaMetadata({ title: byN.get(n).title, artist: 'LEFT.', album: 'LIMBO' }); } catch {}
  }
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.setActionHandler('play', () => audio.play().catch(() => {}));
      navigator.mediaSession.setActionHandler('pause', () => audio.pause());
    } catch {}
  }

  // ---- Only the line being sung. Its times come from timings.js, or from the tap-along on this device: each is
  // when the line starts, or [start, end]. A line without an end stays until the next one, or a few seconds ----
  function timesFor(n) {
    let mine = {};
    try { mine = JSON.parse(localStorage.getItem('limbo-times') || '{}'); } catch {}
    return mine[n] || (window.LIMBO_TIMES || {})[n] || null;
  }
  // The word to catch in a line: its longest (four letters or more), the later one if two are as long
  function keyIndex(line) {
    let best = -1, bestLen = 0;
    line.split(/\s+/).forEach((w, i) => {
      const l = w.replace(/[^\p{L}\p{N}]/gu, '').length;
      if (l >= 4 && l >= bestLen) { best = i; bestLen = l; }
    });
    return best;
  }
  function linesOf(t) {
    const times = timesFor(t.n);
    if (!t.words || !times) return null;
    const flat = verses(t.words).flat();
    if (times.length !== flat.length) return null;  // times for other words: show the words whole
    const startOf = v => (Array.isArray(v) ? v[0] : v);
    return flat.map(([pt, en], i) => {
      const start = startOf(times[i]);
      const next = i + 1 < times.length ? startOf(times[i + 1]) : Infinity;
      const guess = Math.min(7, Math.max(1.6, 0.8 + 0.075 * pt.length));
      let end = Math.min(next, Array.isArray(times[i]) && times[i][1] ? Math.max(times[i][1], start + 0.8) : start + guess);
      if (next - end < 1.2) end = next;  // a short breath between two lines: the first stays until the next
      // a word to catch, if the line stays long enough to catch it
      return { pt, en, start, end, key: end - start >= 1 ? keyIndex(pt) : -1 };
    });
  }
  const lineHTML = (line, i) => {
    const pt = line.pt.split(/\s+/).map((w, k) => (k === line.key && !stage.hush
      ? `<span class="key">${esc(w)}</span>` : esc(w))).join(' ');
    return `<p class="now-line" data-i="${i}"><span class="pt">${pt}</span>${line.en && line.en !== line.pt ? `<span class="en" lang="en">${esc(line.en)}</span>` : ''}</p>`;
  };

  // ---- The points: a lit word caught soon after it lights is worth more, and catches in a row multiply them.
  // In Silêncio the game turns around: every line let go by in silence scores, and a touch breaks it ----
  let run = null, best = 0, hinted = false;
  try { best = Number(localStorage.getItem('limbo-best')) || 0; } catch {}
  const newRun = () => ({ score: 0, combo: 0, caught: 0, keys: 0 });
  const mult = () => Math.min(4, 1 + Math.floor(run.combo / 5));
  let stage = null;  // the song on screen: { t, box, lines, now, done, hush, noisy }
  let convo = null;  // the call on screen: { chat, typing, said, choices }

  function startStage(t) {
    const box = game.querySelector('.stage');
    if (!box) return;
    const lines = linesOf(t);
    if (!lines) { box.innerHTML = wordsHTML(t); return; }
    box.innerHTML = idleHTML(t);
    stage = { t, box, lines, now: -1, done: {}, hush: !!t.hush, noisy: false };
  }
  function paintStage() {
    if (!stage || !stage.box.isConnected || missing) return;
    const pos = audio.currentTime;
    let i = -1;
    for (let k = 0; k < stage.lines.length && stage.lines[k].start <= pos; k++) i = k;
    const shown = i >= 0 && pos < stage.lines[i].end ? i : -1;
    if (shown === stage.now) return;
    settle(stage.now);
    stage.now = shown;
    stage.noisy = false;
    if (shown < 0) { stage.box.innerHTML = idleHTML(stage.t); return; }
    stage.box.innerHTML = lineHTML(stage.lines[shown], shown);
    if (Math.random() < 0.1 + 0.45 * decay()) {
      const el = stage.box.querySelector('.now-line');
      scramble(el, 160 + 260 * decay());
      tear(el);
    }
    const key = stage.box.querySelector('.key');
    if (key && stage.done[shown]) key.classList.add(stage.done[shown] === 'caught' ? 'caught' : 'gone');
    if (key && !hinted) { hinted = true; toast(both2('tapHint'), 2600); }
  }
  // A line leaving the screen: its word was caught or not; in Silêncio, it went by quietly or not
  function settle(i) {
    if (!stage || i < 0 || stage.done[i]) return;
    if (stage.hush) {
      run.keys++;
      if (stage.noisy) { stage.done[i] = 'noise'; run.combo = 0; }
      else { stage.done[i] = 'quiet'; run.caught++; run.combo++; score(100, stage.box); }
    } else if (stage.lines[i].key >= 0) {
      run.keys++;
      stage.done[i] = 'missed';
      run.combo = 0;
    }
    paintHUD();
  }
  function settleAll() { if (stage) settle(stage.now); }
  function score(points, near) {
    const m = mult();
    run.score += points * m;
    const layer = game.querySelector('.pops');
    if (layer && near) {
      const pop = document.createElement('span');
      pop.className = 'pop';
      pop.textContent = `+${points * m}`;
      const a = layer.getBoundingClientRect(), b = near.getBoundingClientRect();
      pop.style.left = `${Math.round(b.left - a.left + b.width / 2)}px`;
      pop.style.top = `${Math.round(b.top - a.top)}px`;
      layer.append(pop);
      setTimeout(() => pop.remove(), 900);
    }
    paintHUD();
  }
  function catchKey() {
    if (!stage || stage.hush || stage.now < 0) return;
    const i = stage.now, line = stage.lines[i];
    if (line.key < 0 || stage.done[i]) return;
    const key = stage.box.querySelector('.key');
    const late = audio.currentTime - line.start;
    stage.done[i] = 'caught';
    run.keys++;
    run.caught++;
    run.combo++;
    key?.classList.add('caught');
    sfx.catch();
    score(late < 1 ? 100 : late < 2 ? 70 : 50, key || stage.box);
  }
  function noise() {
    if (!stage || !stage.hush || stage.now < 0 || stage.noisy || stage.done[stage.now]) return;
    stage.noisy = true;
    sfx.shh();
    toast(both2('hushed'), 1400);
  }
  const hudHTML = () => `${say('score')} <b class="points">${run.score}</b><b class="mult"></b>`;
  function paintHUD() {
    const hud = game.querySelector('.hud');
    if (!hud) return;
    hud.querySelector('.points').textContent = run.score;
    hud.querySelector('.mult').textContent = mult() > 1 ? ` x${mult()}` : '';
  }
  game.addEventListener('pointerdown', e => {
    if (screen !== 'song') return;
    if (e.target.closest('.key')) { e.preventDefault(); catchKey(); return; }
    if (!e.target.closest('.deck, .credits, a, button')) noise();
  });
  addEventListener('keydown', e => {
    if (screen !== 'song' || e.repeat || !(e.code === 'Space' || e.code === 'Enter')) return;
    if (e.target.closest('button, input, summary, a')) return;
    e.preventDefault();
    if (stage?.hush) noise(); else catchKey();
  });
  function frame() {
    paintStage();
    if (stage && !audio.paused) requestAnimationFrame(frame);
  }
  audio.addEventListener('play', () => requestAnimationFrame(frame));
  audio.addEventListener('seeked', paintStage);

  // ---- The little sounds of the game itself, made on the spot like the link page's ----
  const sfx = (() => {
    let ctx = null, wave = null, timer = null;
    function up() {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        ctx = new AC();
        const real = new Float32Array(32), imag = new Float32Array(32);
        for (let k = 1; k < 32; k++) {
          real[k] = Math.sin(2 * Math.PI * k * 0.25) / (Math.PI * k);
          imag[k] = (1 - Math.cos(2 * Math.PI * k * 0.25)) / (Math.PI * k);
        }
        wave = ctx.createPeriodicWave(real, imag);
      }
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      return true;
    }
    function notes(list, volume) {
      try {
        if (!up()) return;
        let t = ctx.currentTime + 0.01;
        for (const [hz, ms] of list) {
          const length = ms / 1000;
          const osc = ctx.createOscillator(), gain = ctx.createGain();
          osc.setPeriodicWave(wave);
          osc.frequency.value = hz;
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(volume, t + 0.003);
          gain.gain.setValueAtTime(volume, t + length * 0.7);
          gain.gain.linearRampToValueAtTime(0, t + length);
          osc.connect(gain).connect(ctx.destination);
          osc.start(t);
          osc.stop(t + length + 0.01);
          t += length;
        }
      } catch { /* no sound on this browser: the game works the same */ }
    }
    const tone = semitones => 440 * 2 ** (semitones / 12);
    return {
      context: () => (up() ? ctx : null),
      // Whether this page may play sound before any tap on it: Chrome lets it after a tap on a link of this site
      awake() {
        try { if (navigator.getAutoplayPolicy) return navigator.getAutoplayPolicy('audiocontext') === 'allowed'; } catch {}
        return !!(up() && ctx.state === 'running');
      },
      go: () => notes([[tone(10), 35], [tone(17), 35], [tone(22), 80]], 0.07),
      pick: () => notes([[tone(3), 45], [tone(7), 45], [tone(10), 45], [tone(15), 100]], 0.07),
      coin: () => notes([[987.8, 70], [1318.5, 340]], 0.08),
      catch: () => notes([[tone(19), 30], [tone(26), 60]], 0.06),
      shh: () => notes([[tone(-14), 140]], 0.07),
      over: () => notes([[tone(3), 180], [tone(2), 180], [tone(1), 180], [tone(0), 520]], 0.08),
      tick: () => notes([[tone(24), 25]], 0.05),
      // An old phone: two notes trading fast, a pause, again; it gives up after six rings
      ring() {
        clearInterval(timer);
        let rings = 0;
        const burst = () => {
          if (++rings > 6) return clearInterval(timer);
          notes(Array.from({ length: 16 }, (_, i) => [i % 2 ? 1046.5 : 1318.5, 50]), 0.05);
        };
        burst();
        timer = setInterval(burst, 1800);
      },
      hush() { clearInterval(timer); timer = null; },
    };
  })();

  // ---- The title music: the album's intro in 8 bits (16.29 s), looping without a gap ----
  const chiptune = (() => {
    const LOOP = 16.2857;
    let data = null, buffer = null, source = null, gain = null, on = true, wanted = false;
    fetch('audio/title.mp3').then(r => (r.ok ? r.arrayBuffer() : null)).then(b => { data = b; if (wanted) play(); }, () => {});
    async function play() {
      wanted = true;
      const ctx = sfx.context();
      if (!ctx || !on || source) return;
      // On an iPhone set to silent, heard like the album itself is
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch {}
      try {
        if (!buffer) {
          if (!data) return;
          buffer = await ctx.decodeAudioData(data.slice(0));
        }
        if (source || !on || !wanted) return;
        // An MP3 starts with a few silent milliseconds: the loop starts at the first sound
        const first = buffer.getChannelData(0).findIndex(v => Math.abs(v) > 0.002);
        const start = Math.max(0, first) / buffer.sampleRate;
        source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.loopStart = start;
        source.loopEnd = Math.min(buffer.duration, start + LOOP);
        gain = ctx.createGain();
        gain.gain.value = 0.9;  // the chiptune is quieter than the album: close to full
        source.connect(gain).connect(ctx.destination);
        source.start(0, start);
      } catch { /* no title music on this browser */ }
    }
    function stop(fade = 0.6) {
      wanted = false;
      if (!source) return;
      const ctx = sfx.context(), s = source, g = gain;
      source = gain = null;
      try {
        g.gain.setValueAtTime(g.gain.value, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + fade);
        s.stop(ctx.currentTime + fade + 0.05);
      } catch {}
    }
    return {
      play, stop,
      toggle() { on = !on; if (on) play(); else stop(0.2); return on; },
      get on() { return on; },
    };
  })();

  // ---- The screens ----
  // The title: the 8-bit intro plays until PRESS START. A browser plays sound only after a first tap (unless the
  // tap was on a link of this same site, on Chrome), so then the button asks for a coin first, like an arcade
  function title() {
    at = 0;
    onEnd = null;
    audio.pause();
    let coin = !sfx.awake();
    render('title', `
      <h1 class="limbo">LIMBO</h1>
      <p class="by">${both('by')}</p>
      <button class="big press" type="button">${coin ? 'Insert coin' : 'Press start'}</button>
      <div class="extras">
        <button class="music" type="button" aria-pressed="${chiptune.on}">${both(chiptune.on ? 'musicOn' : 'musicOff')}</button>
        <p class="small">${both('phones')}</p>
        <p class="small"><a href="${esc(album.spotify)}">${both('spotify')}</a></p>
      </div>`, false, 'night');
    const press = game.querySelector('.press');
    const inserted = () => { coin = false; press.textContent = 'Press start'; };
    if (!coin) chiptune.play();
    press.addEventListener('click', () => {
      if (coin) { sfx.coin(); chiptune.play(); inserted(); return; }
      chiptune.stop(0.3);
      sfx.go();
      language();
    });
    const music = game.querySelector('.music');
    music.addEventListener('click', () => {
      const on = chiptune.toggle();
      music.setAttribute('aria-pressed', String(on));
      music.innerHTML = both(on ? 'musicOn' : 'musicOff');
      if (coin && on) inserted();
    });
  }

  // The language, and nothing else: no music, no menu
  function language() {
    render('lang', `
      <p class="ask">${both('chooseLang')}</p>
      <div class="tongues">
        <button class="big start" type="button" data-lang="pt" lang="pt">Português</button>
        <button class="big start" type="button" data-lang="en" lang="en">English</button>
      </div>`, `.start[data-lang="${lang}"]`, 'night');
    game.querySelectorAll('.start').forEach(button => button.addEventListener('click', () => {
      setLang(button.dataset.lang);
      sfx.go();
      begin();
    }));
  }

  function begin() {
    path = [];
    run = newRun();
    hinted = false;
    ready(1, () => song(1));
  }

  // Before a track: one play button, in the look of what's coming, and nothing else. Pressed, it opens into it
  function ready(n, then) {
    at = n;
    render('ready', `<button class="go" type="button"><span class="sr">${say('play')}</span>${ICON.play}</button>`, '.go', byN.get(n).vibe);
    game.querySelector('.go').addEventListener('click', () => { sfx.go(); then(); }, { once: true });
  }

  function song(n) {
    const t = byN.get(n);
    at = n;
    render('song', `
      <h2 class="song-title">${titleHTML(t)}</h2>
      <div class="box">
        <p class="tag hud">${hudHTML()}</p>
        ${deckHTML(true)}
        <div class="stage"></div>
        <div class="pops" aria-hidden="true"></div>
        ${creditsHTML(t)}
      </div>`, null, t.vibe, 'opening');
    hookDeck();
    startStage(t);
    paintHUD();
    if (t.hush) toast(both2('hushHint'), 4200);
    listen(n, () => {
      settleAll();
      const next = n === 1 ? calls[0].n : nextAfter(n);
      story(() => (next === LAST ? ready(LAST, finale) : ring(next)));
    });
  }

  function ring(n) {
    const t = byN.get(n);
    at = n;
    audio.pause();
    render('ring', `
      <div class="calling ringing">${PHONE}</div>
      <p class="incoming">${say('incoming')}</p>
      <h2 class="caller">${callerHTML(t)}</h2>
      <div class="answers">
        <button class="big answer" type="button">${say('answer')}</button>
        <button class="big decline" type="button">${say('decline')}</button>
      </div>`, '.answer', 'lcd');
    sfx.ring();
    buzz(true);
    announce(`${TEXT[lang].incoming}: ${t.caller ? t.caller[lang === 'en' ? 1 : 0] : ''}`);
    game.querySelector('.answer').addEventListener('click', () => { sfx.hush(); buzz(false); sfx.go(); call(n); });
    game.querySelector('.decline').addEventListener('click', () => { sfx.hush(); buzz(false); gameOver(n); });
  }

  // On the line: who it is and their voice; then what they ask, and the choice
  function call(n) {
    const t = byN.get(n);
    at = n;
    // a call without its chat yet: its question, as a message from the start, and the choice when it ends
    const chat = t.chat || { at: 0, choose: null, words: `${t.question[0]} | ${t.question[1]}` };
    const msgs = chat.words.trim().split('\n').map(l => l.split(' | ').map(x => (x || '').trim()));
    render('call', `
      <p class="line-who">${say('onLine')}</p>
      <h2 class="caller">${callerHTML(t)}</h2>
      <div class="box">
        ${deckHTML(false)}
        <div class="voice" aria-hidden="true">${'<i></i>'.repeat(9)}</div>
        <div class="chat" aria-live="polite">
          <p class="typing" hidden aria-hidden="true"><i></i><i></i><i></i></p>
          ${msgs.map(([pt, en]) => `<p class="bubble" hidden>${tr(pt, en)}</p>`).join('')}
        </div>
        <div class="choices" hidden>
          <p class="choose-label">${say('choose')}</p>
          ${clockOn() ? `<div class="clock" style="--left: 1">
            <span class="secs" aria-hidden="true">${CHOOSE_IN}</span>
            <button class="hold" type="button">${say('hold')}</button>
          </div>` : ''}
          ${t.options.map(o => `<button class="pick" type="button" data-to="${o.to}"><span>${tr(o.pt, o.en)}</span></button>`).join('')}
        </div>
        ${creditsHTML(t)}
      </div>`, null, 'lcd');
    hookDeck();
    convo = { chat, typing: false, said: false, choices: false };
    game.querySelectorAll('.pick').forEach(button => button.addEventListener('click', () => {
      const to = Number(button.dataset.to), fated = button.dataset.fated === '1';
      onEnd = null;
      audio.pause();  // the call may still be playing: picking ends it
      sfx.pick();
      path.push(to);
      ready(to, () => song(to));
      if (fated) toast(both2('fate'));
    }));
    game.querySelector('.hold')?.addEventListener('click', e => {
      const hold = e.currentTarget;
      noClock = true;
      stopClock();
      hold.closest('.clock').classList.add('held');
      hold.innerHTML = say('held');
      hold.disabled = true;
      game.querySelector('.pick')?.focus({ preventScroll: true });
    });
    listen(n, () => {
      showChat();
      showChoices();
      game.querySelector('.voice')?.classList.add('done');
      const box = game.querySelector('.choices');
      if (box) startClock(box);  // the clock only once the call is over
    });
  }
  // The call's moments, by the track's time: "typing..." just before its messages, then they show, then the choice
  function callTick() {
    if (screen !== 'call' || !convo || missing) return;
    const pos = audio.currentTime;
    if (!convo.said && !convo.typing && pos >= convo.chat.at - 0.9) {
      convo.typing = true;
      const dots = game.querySelector('.typing');
      if (dots) dots.hidden = false;
    }
    if (!convo.said && pos >= convo.chat.at) showChat();
    if (!convo.choices && convo.chat.choose != null && pos >= convo.chat.choose) showChoices();
  }
  audio.addEventListener('timeupdate', callTick);
  audio.addEventListener('seeked', callTick);
  function showChat() {
    if (!convo || convo.said) return;
    convo.said = true;
    const dots = game.querySelector('.typing');
    if (dots) dots.hidden = true;
    [...game.querySelectorAll('.bubble')].forEach((b, i) => setTimeout(() => { b.hidden = false; }, calm ? 0 : i * 700));
  }
  function showChoices() {
    const box = game.querySelector('.choices');
    if (!box || !box.hidden) return;
    if (convo) convo.choices = true;
    box.hidden = false;
    announce(TEXT[lang].choose);
    box.querySelector('.pick').focus({ preventScroll: true });
    box.scrollIntoView({ block: 'nearest', behavior: calm ? 'auto' : 'smooth' });
  }

  // ---- The end: the last track plays over the score, the choices, your ending and the credits ----
  function finale() {
    at = LAST;
    const name = endingName(path);
    const newBest = run.score > best;
    if (newBest) { best = run.score; try { localStorage.setItem('limbo-best', String(best)); } catch {} }
    const rate = run.keys >= 8 ? run.caught / run.keys : null;
    const grade = rate == null ? '' : rate >= 0.9 ? 'S' : rate >= 0.75 ? 'A' : rate >= 0.55 ? 'B' : rate >= 0.35 ? 'C' : 'D';
    render('end', `
      <h2>${say('end')}</h2>
      <div class="box">
        ${deckHTML(false)}
        <section class="tally">
          <p class="line-who">${say('score')}</p>
          <p class="total">${run.score}</p>
          ${grade ? `<p class="grade">${say('grade')} <b>${grade}</b></p>` : ''}
          <p class="sub">${say('caught')}: ${run.caught}/${run.keys} · ${say('best')}: ${best}${newBest && run.score ? ` · ${say('newBest')}` : ''}</p>
        </section>
        <section class="recap">
          <p class="line-who">${say('recap')}</p>
          <ol>${path.map((to, i) => recapHTML(calls[i], to, i)).join('')}</ol>
        </section>
        <div class="card">
          <p class="line-who">${say('yourEnd')}</p>
          <p class="ending">${pair([name.pt, name.en])}</p>
          <ul class="traits">${name.traits.map(tt => `<li>${pair(tt)}</li>`).join('')}</ul>
          <p class="rare">${pair(rarityText(soulsShare(path)))}</p>
          <button class="big share" type="button">${say('share')}</button>
        </div>
        <section class="roll">
          <p class="line-who">${say('rollTitle')}</p>
          <div class="roll-window" tabindex="0"><div class="roll-strip">${rollHTML()}</div></div>
        </section>
      </div>
      <button class="big again" type="button">${say('again')}</button>
      <p class="small"><a href="${esc(album.spotify)}">${say('spotify')}</a></p>`, null, 'void', 'opening');
    hookDeck();
    game.querySelector('.share').addEventListener('click', () => shareEnding(name));
    game.querySelector('.again').addEventListener('click', () => { audio.pause(); sfx.go(); title(); });
    listen(LAST, null);
  }
  // One choice in the recap: who called, what they asked, what you picked, and how many souls did the same
  function recapHTML(c, to, i) {
    const o = c.options.find(x => x.to === to);
    const song = byN.get(to);
    const pct = (album.souls || {})[to];
    return `<li>
      <div class="band" data-look="${esc(song.vibe)}">
        <span class="num">${i + 1}</span>
        <span class="who">${callerHTML(c)}</span>
        <span class="song">${esc(plainTitle(song))}</span>
        ${ART[song.vibe] || ''}
      </div>
      <div class="then">
        <p class="q">${tr(`“${c.question[0]}”`, `“${c.question[1]}”`)}</p>
        <p class="a">${tr(o.pt, o.en)}</p>
        ${storyLine(i ? path[i - 1] : null, to) ? `<p class="told">${pair(storyLine(i ? path[i - 1] : null, to))}</p>` : ''}
        ${pct ? `<p class="pct"><b>${pct}%</b> ${say('souls')}</p>` : ''}
      </div>
    </li>`;
  }
  // The share of souls that took this whole path: the five choices' shares multiplied
  function soulsShare(picks) {
    const s = album.souls || {};
    if (picks.length < calls.length || !picks.every(p => s[p])) return null;
    return picks.reduce((a, p) => a * s[p] / 100, 100);
  }
  function rarityText(p) {
    if (p == null) return ['', ''];
    if (p < 1) return ['Menos de 1% das almas chegaram a este final.', 'Fewer than 1% of souls reached this ending.'];
    const n = Math.round(p);
    return [`Só ${n}% das almas chegaram a este final.`, `Only ${n}% of souls reached this ending.`];
  }
  // The album's credits, track by track, rolling up like a game's
  function rollHTML() {
    return `<p class="roll-head">LIMBO (2024)<br>LEFT.</p>` + album.tracks.filter(t => t.credits).map(t => {
      const en = creditsEN(t.credits).split(' · ');
      return `<div class="roll-track">
        <p class="roll-name">${esc(t.call && t.caller ? `${t.title} · ${t.caller[0]}` : t.title)}</p>
        ${t.credits.split(' · ').map((part, k) => `<p>${pair([part, en[k]])}</p>`).join('')}
      </div>`;
    }).join('') + `<p class="roll-head">antonioleft.com</p>`;
  }

  // ---- After each track: the story so far, in the game system's own box, before the next call comes. Each line
  // depends on the choice before it, and under them, who you are becoming ----
  const storyLine = (prev, n) => (album.story || {})[`${prev}>${n}`] || (album.story || {})[n] || null;
  function storySoFar() {
    return [storyLine(null, 1), ...path.map((n, i) => storyLine(i ? path[i - 1] : null, n))].filter(Boolean);
  }
  function character() {
    const e = album.ending || {};
    const name = [e.who?.[path[1]], e.where?.[path[2]]].filter(Boolean);
    const traits = [path[0], path[3], path[4]].map(n => e.traits?.[n]).filter(Boolean);
    const join = k => [name.map(x => x[k]).join(' '), ...traits.map(x => x[k])].filter(Boolean).join(' · ');
    return [join(0), join(1)];
  }
  let storyTimer = null;
  function story(then) {
    const lines = storySoFar();
    const errs = ((album.story || {}).errors || []).slice(0, Math.max(0, path.length - 2));
    const who = character();
    render('story', `
      <div class="log">
        <p class="log-head">LIMBO.SYS <span>· ${say('soFar')}</span></p>
        ${lines.map((l, i) => `<p class="log-line${i === lines.length - 1 ? ' new' : ''}">${pair(l)}</p>`).join('')}
        ${errs.map(l => `<p class="log-line err">${pair(l)}</p>`).join('')}
        ${who[0] ? `<p class="log-who">${say('character')}: <b>${pair(who)}</b></p>` : ''}
      </div>
      <button class="big next" type="button">${say('next')}</button>`, '.next', byN.get(at).vibe);
    const go = () => { clearTimeout(storyTimer); then(); };
    game.querySelector('.next').addEventListener('click', () => { sfx.go(); go(); }, { once: true });
    const newest = game.querySelector('.log-line.new');
    if (newest) typeOut(newest);
    announce(lines[lines.length - 1][lang === 'en' ? 1 : 0]);
    storyTimer = setTimeout(go, Math.min(13000, 5500 + lines[lines.length - 1][0].length * 45 + errs.length * 900));
  }

  // ---- The system failing: glitches, rare at the start and more and more towards the end. They also cover for a
  // line that comes a moment early or late ----
  const GLYPHS = '█▓▒░#@$%&*?!<>/|¥§¤';
  const junk = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  const decay = () => Math.min(1, (path.length + (screen === 'end' ? 1.5 : 0)) / 5);
  function textNodes(el) {
    const nodes = [], w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) nodes.push(w.currentNode);
    return nodes;
  }
  // some letters turn to junk for a moment, then come back
  function scramble(el, ms = 240) {
    if (!el || el.dataset.glitch) return;
    const nodes = textNodes(el), orig = nodes.map(n => n.nodeValue);
    const amount = 0.12 + 0.3 * decay();
    el.dataset.glitch = '1';
    let f = 0;
    const step = () => {
      if (f++ >= 3 || !el.isConnected) { nodes.forEach((n, i) => { n.nodeValue = orig[i]; }); delete el.dataset.glitch; return; }
      nodes.forEach((n, i) => { n.nodeValue = [...orig[i]].map(c => (c.trim() && Math.random() < amount ? junk() : c)).join(''); });
      setTimeout(step, ms / 3);
    };
    step();
  }
  // the picture tears for a moment
  function tear(el) {
    if (!el || calm) return;
    el.classList.remove('tear');
    void el.offsetWidth;
    el.classList.add('tear');
    setTimeout(() => el.classList.remove('tear'), 340);
  }
  // the newest line of the story types itself out, a wrong letter here and there
  function typeOut(el) {
    if (calm) return;
    const nodes = textNodes(el), full = nodes.map(n => n.nodeValue);
    const total = Math.max(...full.map(t => t.length));
    let i = 0;
    const step = () => {
      i += 2;
      if (!el.isConnected) return;
      nodes.forEach((n, k) => { n.nodeValue = full[k].slice(0, i) + (i < full[k].length && Math.random() < 0.3 + decay() * 0.5 ? junk() : ''); });
      if (i < total) setTimeout(step, 28); else nodes.forEach((n, k) => { n.nodeValue = full[k]; });
    };
    nodes.forEach(n => { n.nodeValue = ''; });
    step();
  }
  // now and then something on screen hiccups, and late in the game the whole screen does
  setInterval(() => {
    if (document.hidden || ['title', 'lang', 'ready'].includes(screen)) return;
    if (Math.random() > 0.04 + 0.32 * decay()) return;
    const els = [...game.querySelectorAll('h2, .now-line, .hud, .log-line, .recap .band, .ending, .total, .roll-name')];
    const el = els[Math.floor(Math.random() * els.length)];
    if (el) { scramble(el, 200 + 300 * decay()); tear(el); }
    if (!calm && Math.random() < decay() * 0.5) {
      body.classList.add('glitch');
      setTimeout(() => body.classList.remove('glitch'), 160 + Math.random() * 200);
    }
  }, 2800);

  // ---- Declining a call: GAME OVER, and nine seconds to continue, or back to the title ----
  let overTimer = null;
  function gameOver(n) {
    at = n;
    render('over', `
      <div class="dead">${PHONE}</div>
      <h2 class="over-title">Game over</h2>
      <p class="said">${say('hungUp')}</p>
      <p class="cont">${say('cont')} <span class="count">9</span></p>
      <button class="big back-to-call" type="button">${say('backToCall')}</button>`, '.back-to-call', 'over');
    sfx.over();
    announce(`Game over. ${TEXT[lang].hungUp} ${TEXT[lang].cont}`);
    let left = 9;
    const count = game.querySelector('.count');
    overTimer = setInterval(() => {
      left -= 1;
      if (left < 0) { clearInterval(overTimer); title(); return; }
      count.textContent = left;
      sfx.tick();
    }, 1000);
    game.querySelector('.back-to-call').addEventListener('click', () => { clearInterval(overTimer); sfx.go(); ring(n); });
  }

  // ---- The clock on a choice: ten seconds, then fate picks one. "Stop the clock" stops it, and every clock
  // after it, for anyone who wants the time; with less motion asked for (the phone's settings) there is none ----
  const CHOOSE_IN = 10;
  let clock = null, noClock = false;
  const clockOn = () => !calm && !noClock;
  function stopClock() { if (clock) { clearInterval(clock); clock = null; } }
  function startClock(box) {
    stopClock();
    const bar = box.querySelector('.clock');
    if (!bar) return;
    let tenths = CHOOSE_IN * 10;
    clock = setInterval(() => {
      tenths -= 1;
      bar.style.setProperty('--left', String(Math.ceil(tenths / 5) / (CHOOSE_IN * 2)));  // in 20 steps
      if (tenths % 10 === 0) {
        bar.querySelector('.secs').textContent = tenths / 10;
        bar.classList.toggle('late', tenths <= 30);
        if (tenths > 0 && tenths <= 30) sfx.tick();
      }
      if (tenths <= 0) {
        stopClock();
        const picks = [...box.querySelectorAll('.pick')];
        const pick = picks[Math.floor(Math.random() * picks.length)];
        pick.dataset.fated = '1';
        pick.click();
      }
    }, 100);
  }

  // ---- A phone that rings also buzzes, where the phone can (Android); six rings, like the sound ----
  let buzzTimer = null, buzzing = false;
  function buzz(on) {
    if (!navigator.vibrate || (!on && !buzzing)) return;
    clearInterval(buzzTimer);
    buzzing = on;
    try {
      if (!on) { navigator.vibrate(0); return; }
      let rings = 0;
      const once = () => { if (++rings > 6) { clearInterval(buzzTimer); return; } navigator.vibrate([500, 250, 500]); };
      once();
      buzzTimer = setInterval(once, 1800);
    } catch {}
  }

  // ---- Your ending's name, from your five choices (album.js), and a way to share it with your score ----
  function endingName(picks) {
    const e = album.ending || {};
    const who = (e.who || {})[picks[1]] || ['', ''], where = (e.where || {})[picks[2]] || ['', ''];
    return {
      pt: `${who[0]} ${where[0]}`.trim(),
      en: `${who[1]} ${where[1]}`.trim(),
      traits: [picks[0], picks[3], picks[4]].map(n => (e.traits || {})[n]).filter(Boolean),
    };
  }
  async function shareEnding(name) {
    const text = lang === 'en'
      ? `I played LIMBO by LEFT.: got “${name.en}” and scored ${run.score}. What about you?`
      : `Joguei LIMBO de LEFT.: saiu-me “${name.pt}” e fiz ${run.score} pontos. E tu?`;
    const url = 'https://antonioleft.com/limbo/';
    sfx.go();
    if (navigator.share) {
      try { await navigator.share({ title: 'LIMBO · LEFT.', text, url }); return; } catch (err) { if (err.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(`${text} ${url}`); toast(both2('copied')); } catch { toast([`${text} ${url}`, `${text} ${url}`], 6000); }
  }

  // ---- Language ----
  function savedLang() {
    try {
      const saved = localStorage.getItem('limbo-lang');
      if (saved === 'pt' || saved === 'en') return saved;
    } catch {}
    return /^pt/i.test(navigator.language || '') ? 'pt' : 'en';
  }
  function setLang(l) {
    lang = l;
    body.dataset.lang = l;
    document.documentElement.lang = l;
    document.querySelectorAll('.langs button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
    try { localStorage.setItem('limbo-lang', l); } catch {}
  }

  restart.innerHTML = say('restart');
  restart.addEventListener('click', () => { audio.pause(); sfx.hush(); chiptune.stop(0.2); title(); });
  document.querySelectorAll('.langs button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  setLang(lang);
  title();
})();
