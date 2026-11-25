/* Language switch shared by every page.
   Arabic is the default. Text for both languages lives in the HTML as
   elements marked data-l="ar" / data-l="en"; CSS hides the inactive one.
   Attributes (alt, aria-label) that differ by language use data-ar-<attr> / data-en-<attr>. */
(function () {
  var KEY = 'site_lang';

  function pick() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'ar' || q === 'en') return q;
    try { var s = localStorage.getItem(KEY); if (s === 'ar' || s === 'en') return s; } catch (e) {}
    return 'ar';
  }

  function apply(lang) {
    var root = document.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    var t = root.getAttribute('data-title-' + lang);
    if (t) document.title = t;
    document.querySelectorAll('[data-' + lang + '-alt],[data-' + lang + '-aria-label],[data-' + lang + '-href]').forEach(function (el) {
      ['alt', 'aria-label', 'href'].forEach(function (a) {
        var v = el.getAttribute('data-' + lang + '-' + a);
        if (v !== null) el.setAttribute(a, v);
      });
    });
    document.querySelectorAll('[data-lang-link]').forEach(function (a) {
      var u = new URL(a.getAttribute('href'), location.href);
      u.searchParams.set('lang', lang);
      a.setAttribute('href', u.pathname.split('/').pop() + u.search + u.hash);
    });
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  }

  window.siteLang = {
    get: function () { return document.documentElement.lang; },
    toggle: function () {
      var next = document.documentElement.lang === 'ar' ? 'en' : 'ar';
      try { localStorage.setItem(KEY, next); } catch (e) {}
      apply(next);
    }
  };

  apply(pick());

  document.addEventListener('DOMContentLoaded', function () {
    apply(document.documentElement.lang);
    document.querySelectorAll('[data-lang-toggle]').forEach(function (b) {
      b.addEventListener('click', window.siteLang.toggle);
    });
  });
})();
