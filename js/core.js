/* =============================================================
   core.js — the shell both worlds share.

   Helpers, the section index used by the scroll spy, rail
   decoration, scroll wiring, and the single DOMContentLoaded
   listener. Page-specific files register work through
   window.SITE.boot, so load order is explicit: a page file
   loaded before core.js throws immediately rather than
   half-working.

   The rail markup is STATIC in both documents. This file only
   decorates it, so navigation survives with JavaScript off.
   ============================================================= */
(function () {
  'use strict';

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ic = (id, n) => `<svg width="${n || 14}" height="${n || 14}" aria-hidden="true"><use href="#${id}"/></svg>`;

  const today = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
  const day = (iso) => { const d = new Date(iso + 'T00:00:00'); d.setHours(0, 0, 0, 0); return d; };
  const fmt = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();

  /* Which document are we in. Drives the spy, nothing else —
     the hrefs themselves are written into each page's markup. */
  const HERE = /(^|\/)play(\.html)?$/.test(location.pathname) ? 'play' : 'work';

  /* The section index. `p` says which document each id lives in, so the
     spy never tries to track a section that is not here. The rail is the
     same eight items in both documents — play.html's two panels do not
     earn rail entries, and an identical rail is what lets it morph as a
     single shared element across the transition. */
  const NAV = [
    { id: 'top',      p: 'work' },
    { id: 'about',    p: 'work' },
    { id: 'now',      p: 'work' },
    { id: 'work',     p: 'work' },
    { id: 'toolkit',  p: 'work' },
    { id: 'learning', p: 'work' },
    { id: 'personal', p: 'work' },
    { id: 'contact',  p: 'work' }
  ];

  /* ---------- rail decoration ---------- */
  function nav() {
    const rn = $('#railName'); if (rn) rn.textContent = PROFILE.short;
    const rf = $('#railFoot'); if (rf) rf.textContent = 'open to work';
    const y  = $('#yr');       if (y)  y.textContent = new Date().getFullYear();
  }

  /* ---------- scroll wiring ---------- */
  function wire() {
    const links = $$('.rail__lnk, .msheet a[data-id]');
    const mine  = NAV.filter((n) => n.p === HERE);
    const secs  = mine.map((n) => document.getElementById(n.id)).filter(Boolean);
    const up    = $('#up');
    let tick = false;

    const onScroll = () => {
      if (tick) return;
      tick = true;
      requestAnimationFrame(() => {
        if (up) up.classList.toggle('show', window.scrollY > 600);

        /* No tracked sections in this document (the rail's links all
           point elsewhere): leave the static markup state alone. */
        if (secs.length) {
          let id = secs[0].id;
          secs.forEach((s) => { if (s.getBoundingClientRect().top <= 150) id = s.id; });

          links.forEach((l) => {
            if (l.dataset.page !== HERE) return;      // never touch the other world's link
            const on = l.dataset.id === id;
            l.classList.toggle('on', on);
            if (on) l.setAttribute('aria-current', 'true');
            else l.removeAttribute('aria-current');
          });
        }
        tick = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (up) up.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    const mb = $('#menuBt'), ms = $('#mSheet');
    if (mb && ms) {
      mb.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        const o = ms.classList.toggle('open');
        mb.setAttribute('aria-expanded', String(o));
      });
      ms.addEventListener('click', (e) => {
        if (e.target.closest('a')) {
          ms.classList.remove('open');
          mb.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  window.SITE = { $, $$, esc, ic, today, day, fmt, HERE, NAV, boot: [] };

  document.addEventListener('DOMContentLoaded', () => {
    nav();
    wire();
    window.SITE.boot.forEach((fn) => {
      try { fn(); } catch (e) { console.error('[site] boot step failed', e); }
    });
  });
})();
