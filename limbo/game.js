// LIMBO, the game-album by LEFT., played in the browser.
// The album is a path: the Intro, then five phone calls. Each call ends in a choice between two songs, and every
// path ends on "Limbo (fim)", so there are 32 ways through. The words, translations, choices and credits are in
// album.js. Track 7's sound is audio/07.mp3, and so on; while a track's sound is not there yet, the game shows its
// words and goes on when you tap Continue. It is played in the dark, and each part of the album has its own look
// (its vibe in album.js, drawn in index.html). The title screen loops the album's intro in 8 bits.
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
      by: 'um álbum-jogo de LEFT.',
      how: 'Cinco chamadas. Cada uma acaba numa escolha entre duas canções. Há 32 caminhos.',
      start: 'Jogar', musicOn: 'Música: ligada', musicOff: 'Música: desligada', phones: 'Melhor com auscultadores',
      cover: 'A capa de LIMBO: António a flutuar num vazio branco, iluminado de vermelho',
      spotify: 'Ouvir o álbum no Spotify', track: 'Faixa', call: 'Chamada',
      incoming: 'Chamada recebida', answer: 'Atender', onLine: 'Na linha', choose: 'Escolhe',
      next: 'Continuar', skip: 'Saltar', play: 'Tocar', pause: 'Pausa', where: 'Onde vai a faixa',
      soon: 'O áudio ainda não está aqui. Por agora, lê.', credits: 'Ficha técnica', end: 'Fim',
      path: 'O teu caminho', oneOf: 'Um dos 32 caminhos de LIMBO.', again: 'Jogar outra vez', restart: 'Recomeçar',
    },
    en: {
      by: 'a game-album by LEFT.',
      how: 'Five phone calls. Each one ends in a choice between two songs. There are 32 ways through.',
      start: 'Play', musicOn: 'Music: on', musicOff: 'Music: off', phones: 'Best with headphones',
      cover: 'The cover of LIMBO: António floating in a white void, lit red',
      spotify: 'Listen to the album on Spotify', track: 'Track', call: 'Call',
      incoming: 'Incoming call', answer: 'Answer', onLine: 'On the line', choose: 'Choose',
      next: 'Continue', skip: 'Skip', play: 'Play', pause: 'Pause', where: 'Position in the track',
      soon: 'The audio isn’t here yet. For now, read along.', credits: 'Credits', end: 'The end',
      path: 'Your path', oneOf: 'One of LIMBO’s 32 paths.', again: 'Play again', restart: 'Start over',
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
  const pathList = document.querySelector('.path');
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
  const say = key => `<span class="ui-pt">${esc(TEXT.pt[key])}</span><span class="ui-en" lang="en">${esc(TEXT.en[key])}</span>`;
  // Words of the album are always in Portuguese, with the English under them when English is on
  const tr = (pt, en) => `${esc(pt)}${en && en !== pt ? `<span class="en" lang="en">${esc(en)}</span>` : ''}`;
  // A track's name as a heading: a guest artist in smaller letters under it, then the English
  const titleHTML = t => {
    const guest = t.title.match(/^(.*?) (\(ft\. .*\))$/);
    return (guest ? `${esc(guest[1])}<span class="ft">${esc(guest[2])}</span>` : esc(t.title)) +
      (t.en && t.en !== t.title ? `<span class="en" lang="en">${esc(t.en)}</span>` : '');
  };
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  const SPRITE = look => `<img class="him" src="img/${look}.png" width="96" height="120" alt="">`;
  const ICON = {
    play: '<svg viewBox="0 0 7 7" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M1 0h1v1h1v1h1v1h1v1H4v1H3v1H2v1H1z"/></svg>',
    pause: '<svg viewBox="0 0 7 7" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M1 0h2v7H1zM4 0h2v7H4z"/></svg>',
  };
  const PHONE = '<svg class="phone" viewBox="0 0 12 10" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M1 0h10v1h1v3H9V2H3v2H0V1h1zM3 5h6v1h1v1h1v3H1V7h1V6h1zM5 7v1h2V7z"/></svg>';

  function verses(words) {
    return words.trim().split(/\n\s*\n/).map(block => block.split('\n').map(line => {
      const [pt, en = ''] = line.split(' | ');
      return [pt.trim(), en.trim()];
    }));
  }
  const wordsHTML = t => !t.words ? '' :
    `<div class="words">${verses(t.words).map(v =>
      `<p>${v.map(([pt, en]) => `<span class="line">${tr(pt, en)}</span>`).join('')}</p>`).join('')}</div>`;
  const creditsEN = s => s.split(' · ').map(part => {
    const i = part.indexOf(': ');
    const role = part.slice(0, i).replace(/[A-Za-zÀ-ÿ]+/g, w => ROLES[w.toLowerCase()] || w);
    return role.charAt(0).toUpperCase() + role.slice(1) + part.slice(i);
  }).join(' · ');
  const creditsHTML = t => !t.credits ? '' :
    `<details class="credits"><summary>${say('credits')}</summary>
      <p><span class="ui-pt">${esc(t.credits)}</span><span class="ui-en" lang="en">${esc(creditsEN(t.credits))}</span></p></details>`;

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

  function render(name, html, focus, vibe = 'night') {
    screen = name;
    body.dataset.screen = name;
    setVibe(vibe);
    game.innerHTML = `<section class="screen ${name}">${html}</section>`;
    restart.hidden = name === 'title';
    paintPath();
    scrollTo(0, 0);
    if (focus === false) return;
    const target = game.querySelector(focus || 'h2');
    if (target) {
      if (!target.matches('button, a')) target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  }

  // The way so far, along the top: the Intro, one step per call (the song picked, once picked), and the end
  function paintPath() {
    const now = at === 1 ? 0 : at === LAST ? 6 : byN.get(at)?.call || path.indexOf(at) + 1;
    const steps = [
      'Intro',
      ...calls.map((c, i) => path[i] ? esc(byN.get(path[i]).title.replace(/ \(ft\..*\)/, '')) : `${c.call} ?`),
      say('end'),
    ];
    pathList.innerHTML = screen === 'title' ? '' : steps.map((s, i) =>
      `<li${i === now ? ' aria-current="step"' : ''}${i < now ? ' class="done"' : ''}>${s}</li>`).join('');
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
  function load(n, k) {
    const mine = ++attempt;
    kind = k;
    audio.src = file(n, KINDS[k]);
    paint();
    const p = audio.play();
    if (p) p.then(paint, err => {
      if (err.name === 'NotSupportedError') failed(n, mine);
      else paint();  // the browser waits for a tap on Play, or another track was asked for first
    });
  }
  // That file isn't there: the other kind is tried, and with neither (yet) the words stay
  // and the game goes on without the sound
  function failed(n, which) {
    if (n !== at || which !== attempt || handled === which || missing) return;
    handled = which;
    if (kind + 1 < KINDS.length) return load(n, kind + 1);
    missing = true;
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
    deck.querySelector('.skip').addEventListener('click', () => { audio.pause(); finish(); });
    deck.querySelector('.go-on')?.addEventListener('click', () => { sfx.go(); finish(); });
    paint();
  }
  function paint() {
    const deck = game.querySelector('.deck');
    const stage = game.querySelector('.screen');
    if (stage) stage.classList.toggle('playing', !!deck && !missing && !audio.paused);
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
      if (ctx.state === 'suspended') ctx.resume();
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
      go: () => notes([[tone(10), 35], [tone(17), 35], [tone(22), 80]], 0.07),
      pick: () => notes([[tone(3), 45], [tone(7), 45], [tone(10), 45], [tone(15), 100]], 0.07),
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
    let data = null, buffer = null, source = null, gain = null, on = true;
    fetch('audio/title.mp3').then(r => (r.ok ? r.arrayBuffer() : null)).then(b => { data = b; }, () => {});
    async function play() {
      const ctx = sfx.context();
      if (!ctx || !on || source) return;
      // On an iPhone set to silent, heard like the album itself is
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch {}
      try {
        if (!buffer) {
          if (!data) return;
          buffer = await ctx.decodeAudioData(data.slice(0));
        }
        if (source || !on) return;
        // An MP3 starts with a few silent milliseconds: the loop starts at the first sound
        const first = buffer.getChannelData(0).findIndex(v => Math.abs(v) > 0.002);
        const start = Math.max(0, first) / buffer.sampleRate;
        source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.loopStart = start;
        source.loopEnd = Math.min(buffer.duration, start + LOOP);
        gain = ctx.createGain();
        gain.gain.value = 0.5;
        source.connect(gain).connect(ctx.destination);
        source.start(0, start);
      } catch { /* no title music on this browser */ }
    }
    function stop(fade = 0.6) {
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
  // The title screen: PRESS START first (a browser plays sound only after a tap), then the music and the menu
  function title() {
    at = 0;
    onEnd = null;
    render('title', `
      <h1 class="limbo">LIMBO</h1>
      <p class="by">${say('by')}</p>
      ${SPRITE('front')}
      <button class="big press" type="button">Press start</button>
      <div class="menu" hidden>
        <p class="how">${say('how')}</p>
        <button class="big start" type="button">${say('start')}</button>
        <button class="music" type="button" aria-pressed="${chiptune.on}">${say(chiptune.on ? 'musicOn' : 'musicOff')}</button>
        <p class="small">${say('phones')}</p>
        <p class="small"><a href="${esc(album.spotify)}">${say('spotify')}</a></p>
      </div>`, false, 'night');
    const press = game.querySelector('.press'), menu = game.querySelector('.menu');
    press.addEventListener('click', () => {
      sfx.go();
      chiptune.play();
      press.hidden = true;
      menu.hidden = false;
      menu.querySelector('.start').focus({ preventScroll: true });
    });
    menu.querySelector('.start').addEventListener('click', () => { chiptune.stop(); sfx.go(); begin(); });
    const music = menu.querySelector('.music');
    music.addEventListener('click', () => {
      const on = chiptune.toggle();
      music.setAttribute('aria-pressed', String(on));
      music.innerHTML = say(on ? 'musicOn' : 'musicOff');
    });
  }

  function begin() {
    path = [];
    song(1);
  }

  function song(n) {
    const t = byN.get(n);
    at = n;
    render('song', `
      <div class="head">${SPRITE('front')}<h2>${titleHTML(t)}</h2></div>
      <div class="box">
        <p class="tag">${say('track')} ${n}</p>
        ${deckHTML(true)}
        ${wordsHTML(t)}
        ${creditsHTML(t)}
      </div>`, null, t.vibe);
    hookDeck();
    listen(n, () => {
      const next = n === 1 ? calls[0].n : nextAfter(n);
      if (next === LAST) finale(); else ring(next);
    });
  }

  function ring(n) {
    const t = byN.get(n);
    at = n;
    audio.pause();
    render('ring', `
      <div class="calling ringing">${SPRITE('look-right')}${PHONE}</div>
      <h2>${say('call')} ${t.call}/5</h2>
      <p class="incoming">${say('incoming')}</p>
      <button class="big answer" type="button">${say('answer')}</button>`, '.answer', 'lcd');
    sfx.ring();
    announce(`${TEXT[lang].incoming}: ${TEXT[lang].call} ${t.call}/5`);
    game.querySelector('.answer').addEventListener('click', () => { sfx.hush(); sfx.go(); call(n); });
  }

  function call(n) {
    const t = byN.get(n);
    at = n;
    render('call', `
      <div class="head">${SPRITE('front')}<h2>${titleHTML(t)}</h2></div>
      <div class="box">
        <p class="tag">${say('call')} ${t.call}/5</p>
        <p class="line-who">${say('onLine')}: ${esc(t.voice)}</p>
        <p class="said">${tr(`“${t.question[0]}”`, `“${t.question[1]}”`)}</p>
        ${deckHTML(false)}
        <div class="choices" hidden>
          <p>${say('choose')}</p>
          ${t.options.map(o => `<button class="pick" type="button" data-to="${o.to}"><span>${tr(o.pt, o.en)}</span></button>`).join('')}
        </div>
        ${creditsHTML(t)}
      </div>`, null, 'lcd');
    hookDeck();
    game.querySelectorAll('.pick').forEach(button => button.addEventListener('click', () => {
      sfx.pick();
      path.push(Number(button.dataset.to));
      song(Number(button.dataset.to));
    }));
    listen(n, showChoices);
  }

  function showChoices() {
    const box = game.querySelector('.choices');
    if (!box || !box.hidden) return;
    box.hidden = false;
    announce(TEXT[lang].choose);
    box.querySelector('.pick').focus({ preventScroll: true });
    box.scrollIntoView({ block: 'nearest', behavior: calm ? 'auto' : 'smooth' });
  }

  function finale() {
    const t = byN.get(LAST);
    at = LAST;
    render('end', `
      <img class="cover" src="img/cover.webp" width="720" height="720" alt="${esc(TEXT[lang].cover)}">
      <h2>${say('end')}</h2>
      <div class="box">
        <p class="tag">${say('track')} ${LAST} · ${esc(t.title)}</p>
        ${deckHTML(false)}
        <p class="line-who">${say('path')}</p>
        <ol class="trail">${path.map(n => `<li><span>${tr(byN.get(n).title, byN.get(n).en)}</span></li>`).join('')}</ol>
        <p class="one">${say('oneOf')}</p>
        ${creditsHTML(t)}
      </div>
      <button class="big again" type="button">${say('again')}</button>
      <p class="small"><a href="${esc(album.spotify)}">${say('spotify')}</a></p>`, null, 'void');
    hookDeck();
    game.querySelector('.again').addEventListener('click', () => { audio.pause(); sfx.go(); begin(); });
    listen(LAST, null);
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
    pathList.setAttribute('aria-label', TEXT[l].path);
    try { localStorage.setItem('limbo-lang', l); } catch {}
  }

  restart.innerHTML = say('restart');
  restart.addEventListener('click', () => { audio.pause(); sfx.hush(); chiptune.stop(0.2); title(); });
  document.querySelectorAll('.langs button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  setLang(lang);
  title();
})();
