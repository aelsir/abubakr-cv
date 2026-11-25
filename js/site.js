(function () {
  document.documentElement.classList.remove('no-js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Fade sections in as they arrive */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* Top bar hairline once scrolled */
  var bar = document.querySelector('.bar');
  /* The lane: red line and runner follow the reader */
  var lane = document.getElementById('lane');
  var fill = lane && lane.querySelector('.fill');
  var runner = lane && lane.querySelector('.runner');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      if (bar) bar.classList.toggle('scrolled', window.scrollY > 8);
      if (!lane) return;
      var r = lane.getBoundingClientRect();
      var p = (window.innerHeight * 0.6 - r.top) / r.height;
      p = Math.max(0, Math.min(1, p));
      fill.style.height = (p * (r.height - 16)) + 'px';
      runner.style.top = (p * (r.height - 17)) + 'px';
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* Gallery strip arrows */
  var strip = document.querySelector('.strip');
  document.querySelectorAll('[data-strip]').forEach(function (b) {
    b.addEventListener('click', function () {
      var dir = document.documentElement.dir === 'rtl' ? -1 : 1;
      var step = strip.querySelector('figure').offsetWidth + 14;
      strip.scrollBy({ left: dir * step * Number(b.getAttribute('data-strip')), behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Full-screen photo viewer */
  var box = document.getElementById('lightbox');
  var figs = Array.prototype.slice.call(document.querySelectorAll('.strip figure'));
  var big = box.querySelector('img');
  var cap = box.querySelector('.cap');
  var count = box.querySelector('.count');
  var idx = 0, lastFocus = null;

  function show(i) {
    idx = (i + figs.length) % figs.length;
    var img = figs[idx].querySelector('img');
    big.src = img.getAttribute('src');
    big.alt = img.alt;
    cap.innerHTML = figs[idx].querySelector('figcaption').innerHTML;
    count.textContent = (idx + 1) + ' / ' + figs.length;
  }
  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    box.classList.add('open');
    document.body.style.overflow = 'hidden';
    box.querySelector('.x').focus();
  }
  function close() {
    box.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  /* "next" means the reading direction: leftwards in Arabic, rightwards in English */
  function next() { show(idx + 1); }
  function prev() { show(idx - 1); }

  figs.forEach(function (f, i) {
    f.querySelector('button').addEventListener('click', function () { open(i); });
  });
  box.querySelector('.x').addEventListener('click', close);
  box.querySelector('[data-next]').addEventListener('click', next);
  box.querySelector('[data-prev]').addEventListener('click', prev);
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) {
    if (!box.classList.contains('open')) return;
    var rtl = document.documentElement.dir === 'rtl';
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') (rtl ? next : prev)();
    else if (e.key === 'ArrowRight') (rtl ? prev : next)();
  });
  var x0 = null;
  box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) < 40) return;
    var rtl = document.documentElement.dir === 'rtl';
    var swipedLeft = dx < 0;
    (swipedLeft !== rtl ? next : prev)();
  });
  document.addEventListener('langchange', function () {
    if (box.classList.contains('open')) show(idx);
  });

  /* Video loads only when asked, so the page stays light */
  var v = document.querySelector('.video');
  if (v) {
    v.style.backgroundImage = 'url(https://i.ytimg.com/vi/' + v.dataset.id + '/hqdefault.jpg)';
    v.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + v.dataset.id + '?autoplay=1&rel=0';
      f.allow = 'autoplay; encrypted-media; picture-in-picture';
      f.allowFullscreen = true;
      f.title = v.getAttribute('aria-label') || 'Video';
      v.replaceWith(Object.assign(document.createElement('div'), { className: 'video' }));
      document.querySelector('.video').appendChild(f);
    }, { once: true });
  }
})();
