// Shared by both versions of the page.
// The photos loop on their own, like a GIF. With a mouse, pointing at a platform makes him look at it
// and pointing at him makes him look at you. Pressing a platform (or him) makes him reach out.
// "Who am I?" opens the bio, a few pages long, and he faces you while you read it.
// "Hear me out?" opens a box with Spotify's player in it, and he faces you while you listen.
(() => {
  const sitter = document.querySelector('.sitter');
  const dialog = document.querySelector('.bio');
  const player = document.querySelector('.player');
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const beat = 60000 / (Number(document.body.dataset.bpm) || 100);
  const wobble = 'wobble' in document.body.dataset && !calm;

  // In beats. Facing you holds longest; the reach comes once per loop.
  const LOOP = [['front', 2], ['left', 1], ['front', 1], ['right', 1], ['front', 2],
                ['left', 1], ['front', 1], ['right', 1], ['front', 1], ['reach', 1]];

  let step = 0, timer = null, held = false, leaving = false, loaded = false;
  let over = null;      // what the mouse is on: him, or a platform
  let pressed = false;  // a finger or button is down on him or on a platform

  function show(look) {
    if (sitter.dataset.look === look || (!loaded && look !== 'front')) return;
    sitter.dataset.look = look;
    if (wobble) {
      // a pixel or two of shake on every frame, like a flipbook
      const px = () => `${Math.round(Math.random() * 4 - 2)}px`;
      sitter.style.setProperty('--jx', px());
      sitter.style.setProperty('--jy', px());
    }
  }

  function tick() {
    const [look, beats] = LOOP[step];
    show(look);
    step = (step + 1) % LOOP.length;
    timer = setTimeout(tick, beats * beat);
  }
  function stop() { clearTimeout(timer); timer = null; }
  function play() { if (loaded && !calm && !held && !timer && !document.hidden) tick(); }
  function hold(look) { held = true; stop(); show(look); }

  function sideOf(el) {
    const s = sitter.getBoundingClientRect(), r = el.getBoundingClientRect();
    const middle = s.left + s.width / 2, x = r.left + r.width / 2, dead = s.width * 0.1;
    return x < middle - dead ? 'left' : x > middle + dead ? 'right' : 'front';
  }

  // Once nothing is pressed: face whatever the mouse is on, or go back to looping
  function settle() {
    if (leaving || pressed || dialog.open || player.open) return;
    if (over) return hold(over === sitter ? 'front' : sideOf(over));
    held = false;
    if (calm) show('front');
    play();
  }

  [sitter, ...document.querySelectorAll('.go, .who, .hear')].forEach(el => {
    el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { over = el; settle(); } });
    el.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { over = null; settle(); } });
  });

  function press() { pressed = true; hold('reach'); }
  function letGo() { if (pressed) setTimeout(() => { pressed = false; settle(); }, 500); }
  sitter.addEventListener('pointerdown', press);
  addEventListener('pointerup', letGo);
  addEventListener('pointercancel', letGo);

  document.querySelectorAll('.go').forEach(a => {
    a.addEventListener('pointerdown', press);
    a.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;  // opened in another tab
      // He keeps reaching while the page leaves. If it never does (the app opened instead), he carries on.
      leaving = true;
      hold('reach');
      setTimeout(() => { leaving = false; settle(); }, 3000);
    });
  });

  // On Android the built-in browser of apps such as Instagram cannot open a PDF, and older phones only
  // download it: there "about me" opens bio.html, a page that draws the same PDF
  if (/Android/i.test(navigator.userAgent)) {
    document.querySelectorAll('a[href$=".pdf"]').forEach(a => { a.href = 'bio.html'; });
  }

  // The bio has pages: Next turns to the next one, Back to the one before.
  // On the 8-bit page, like in an old game, each page types itself out the first time it is shown,
  // a tap on the box shows it all at once or turns the page, and the speaker stays "???"
  // until the first page is done.
  const pages = [...dialog.querySelectorAll('.page')];
  const next = dialog.querySelector('.next');
  const back = dialog.querySelector('.back');
  const typed = dialog.querySelector('.typed');
  const tag = dialog.querySelector('.tag');
  const seen = new Set();
  let current = 0, typing = null;
  // Right after the box opens, turns or fills in, a click from a finger or a mouse is the second half of
  // a double tap or double click, landing on whatever just appeared: it is ignored for a moment
  let quietUntil = 0, lastPointer = 'mouse', downOnBackdrop = false;
  const hush = () => { quietUntil = performance.now() + 500; };

  function finishTyping() {
    clearInterval(typing);
    typing = null;
    dialog.classList.remove('typing');
    typed?.replaceChildren();
    if (tag) tag.textContent = tag.dataset.name;
    next.hidden = current === pages.length - 1;
    back.hidden = current === 0;
    hush();
  }

  // A copy of the page lies on top of it and fills in letter by letter. The letters still to come
  // are already there but invisible, so a word never jumps to the next line halfway through.
  function typeOut(page) {
    if (!typed || calm || seen.has(page)) return finishTyping();
    seen.add(page);
    typed.replaceChildren(...[...page.childNodes].map(n => n.cloneNode(true)));
    typed.querySelectorAll('a').forEach(a => a.removeAttribute('href'));
    const texts = [], walk = document.createTreeWalker(typed, NodeFilter.SHOW_TEXT);
    while (walk.nextNode()) if (walk.currentNode.data.trim()) texts.push(walk.currentNode);
    const parts = texts.map(node => {
      const text = node.data.replace(/\s+/g, ' ');
      const shown = document.createElement('span'), rest = document.createElement('span');
      rest.className = 'rest';
      rest.textContent = text;
      node.replaceWith(shown, rest);
      return { shown, rest, text };
    });
    if (!parts.length) return finishTyping();
    let i = 0, k = 0;
    clearInterval(typing);
    dialog.classList.add('typing');
    next.hidden = back.hidden = true;
    typing = setInterval(() => {
      const { shown, rest, text } = parts[i];
      shown.textContent = text.slice(0, ++k);
      rest.textContent = text.slice(k);
      if (k === text.length) { i++; k = 0; }
      if (i === parts.length) finishTyping();
    }, 16);
  }

  function turnTo(index) {
    if (!pages[index]) return;
    pages[current].classList.remove('current');
    current = index;
    pages[current].classList.add('current');
    pages[current].focus({ preventScroll: true });
    dialog.scrollTop = 0;  // on a short screen the box scrolls: each page starts at its top
    typeOut(pages[current]);
    hush();
  }

  document.querySelector('.who').addEventListener('click', () => {
    seen.clear();
    if (tag) tag.textContent = '???';
    dialog.showModal();
    hold('front');
    turnTo(0);
  });
  next.addEventListener('click', () => turnTo(current + 1));
  back.addEventListener('click', () => turnTo(current - 1));
  // Both boxes. Where a press starts, and with what: a text selection dragged past the edge is not a tap outside,
  // and a mouse click on the text is left for selecting words, so only a finger turns the page by tapping it.
  // The browser counts the clicks of a double click (detail 2 and up): those are ignored too.
  // Clicks from the keyboard have no count (detail 0), so they always go through
  [dialog, player].forEach(box => {
    box.addEventListener('pointerdown', e => {
      lastPointer = e.pointerType;
      downOnBackdrop = e.target === box;
    });
    box.addEventListener('click', e => {
      if (e.detail > 1 || (e.detail && performance.now() < quietUntil)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }, true);
    box.addEventListener('click', e => { if (e.target === box && downOnBackdrop) box.close(); });  // a tap outside the box
  });
  dialog.addEventListener('click', e => {
    if (e.target === dialog || !typed || e.target.closest('a, button')) return;
    if (typing) finishTyping();
    else if (lastPointer !== 'mouse' && current < pages.length - 1 && getSelection().isCollapsed) turnTo(current + 1);
  });
  dialog.addEventListener('keydown', () => { if (typing) finishTyping(); });
  dialog.addEventListener('close', () => {
    if (typing) finishTyping();
    settle();
  });

  // "Hear me out?": Spotify's own player, which waits in the page as a <template> and loads nothing until it is
  // put in. It is in the page only while its box is open: taking it out is what stops the music, so closing
  // the box or leaving the page stops it, while switching to another tab or app leaves it playing. The music
  // itself only ever starts from the visitor's own tap on the player's play button.
  const deck = player.querySelector('.deck');
  const embed = deck.querySelector('template');
  let frame = null;
  function sync(gone) {
    const wanted = player.open && !gone;
    if (wanted && !frame) {
      frame = embed.content.firstElementChild.cloneNode(true);
      deck.append(frame);
    } else if (!wanted && frame) {
      frame.remove();
      frame = null;
    }
  }
  document.querySelector('.hear').addEventListener('click', () => {
    player.showModal();
    player.scrollTop = 0;
    hold('front');
    hush();
    sync();
    // The focus goes to the box itself, as in the bio: on Close, a held Enter key would shut it and open it again
    player.focus();
    // A tap on the player never reaches this page, so the quiet moment is kept on the player itself:
    // the second tap of a double tap cannot press play by accident
    frame.style.pointerEvents = 'none';
    setTimeout(() => { if (frame) frame.style.pointerEvents = ''; }, 500);
  });
  player.addEventListener('close', () => {
    sync();
    settle();
  });
  addEventListener('pagehide', () => sync(true));

  // Every frame has to arrive before the loop starts, so a slow connection never shows an empty frame
  Promise.all([...sitter.querySelectorAll('img')].map(img => img.decode()))
    .then(() => { loaded = true; settle(); }, () => {});

  // Coming back with the browser's back button: start over, facing you (and still facing you if a box is open)
  addEventListener('pageshow', e => {
    if (!e.persisted) return;
    leaving = pressed = held = false;
    over = null;
    stop();
    step = 0;
    show('front');
    sync();
    settle();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else settle();
  });
})();
