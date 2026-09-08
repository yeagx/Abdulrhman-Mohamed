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

  /* One place asks whether motion is welcome, so the board's flap,
     the keyline draw and anything added later cannot drift apart.
     Queried live rather than cached: the setting can change without
     a reload. */
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Clipboard with a visible receipt and an honest failure. The
     contact page's email row and each project's link control both
     come through here, so "copied" cannot quietly come to mean two
     different things in two files. `fb` runs when the write is
     refused — an insecure origin, or a browser that wants a
     stronger gesture — and nothing is ever reported as copied
     unless it actually was. */
  async function copy(text, el, fb) {
    try {
      await navigator.clipboard.writeText(text);
      if (el) {
        const was = el.textContent;
        el.textContent = 'copied';
        el.classList.add('is-ok');
        setTimeout(() => { el.textContent = was; el.classList.remove('is-ok'); }, 1800);
      }
      return true;
    } catch (_) {
      if (typeof fb === 'function') fb();
      return false;
    }
  }

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
    const rail  = $('#rail');
    let tick = false;

    const onScroll = () => {
      if (tick) return;
      tick = true;
      requestAnimationFrame(() => {
        if (up) up.classList.toggle('show', window.scrollY > 600);

        /* The rail's position gauge. One number out of JavaScript and
           no colour at all (rule 8) — core.css turns --prog into a
           bar. It rides this existing pass rather than opening a
           second scroll listener. */
        if (rail) {
          const run = document.documentElement.scrollHeight - window.innerHeight;
          rail.style.setProperty('--prog', run > 0 ? (window.scrollY / run).toFixed(4) : '0');
        }

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
      /* Escape closes it and hands focus back to the control that
         opened it, rather than leaving the visitor inside a sheet
         they cannot dismiss from the keyboard. */
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape' || !ms.classList.contains('open')) return;
        ms.classList.remove('open');
        mb.setAttribute('aria-expanded', 'false');
        mb.focus();
      });
    }
  }

  /* ---------- the keyline draw ----------
     Each section's rule bolts itself in as you reach it. Not a third
     authored moment: it is the shell's own clip-path material, the
     same curve as the rail, one floor down. Nothing else moves.

     The start state is added HERE rather than in the stylesheet, so
     a visitor with scripts off never meets a rule clipped to nothing
     with no script coming to open it. */
  const EDGE = .88;   /* fire once the rule is properly into the room */

  function draw() {
    if (reduced() || !('IntersectionObserver' in window)) return;

    const rules = $$('.rule');
    if (!rules.length) return;

    const io = new IntersectionObserver((ens) => {
      ens.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);        /* it draws once; it is not a loop */
      });
    }, { rootMargin: `0px 0px -${Math.round((1 - EDGE) * 100)}% 0px` });

    /* Where "already there" ends. Normally that is the fold — but a
       fragment landing is still scrolling when this runs, because
       scroll-behavior is smooth, so measuring against the current
       viewport would mark the destination's own keyline as an
       arrival and draw it under the page transition, at exactly the
       moment the visitor is meant to be watching the room open.
       Resolve the fragment up front instead of racing it, and treat
       everything down to it as already bolted in. */
    let floor = window.scrollY + window.innerHeight * EDGE;
    const target = location.hash && document.getElementById(location.hash.slice(1));
    if (target) floor = Math.max(floor, window.scrollY + target.getBoundingClientRect().bottom);

    rules.forEach((r) => {
      /* Anything at or above the floor is not an arrival — it is
         where the visitor started, including the doorway they land
         on coming back from the arcade. Leave it bolted in. */
      if (window.scrollY + r.getBoundingClientRect().top < floor) return;
      r.classList.add('draw');
      io.observe(r);
    });
  }

  /* ---------- the jog ----------
     j / k step the page section by section, the way a panel's jog
     dial steps a line. Deliberately narrow: no modifiers, and never
     while the visitor is typing — the contact form owns the keyboard
     the moment one of its fields has focus. */
  function jog() {
    const mine = NAV.filter((n) => n.p === HERE);
    if (mine.length < 2) return;

    document.addEventListener('keydown', (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key !== 'j' && e.key !== 'k') return;

      const t = e.target;
      if (t && (t.isContentEditable ||
                (t.closest && t.closest('input, textarea, select')))) return;

      const secs = mine.map((n) => document.getElementById(n.id)).filter(Boolean);
      if (!secs.length) return;

      /* Where we are now, measured off the same 150px line the spy
         uses — so the jog and the rail highlight can never disagree
         about which section the visitor is in. */
      let i = 0;
      secs.forEach((s, n) => { if (s.getBoundingClientRect().top <= 150) i = n; });

      const to = secs[Math.min(secs.length - 1, Math.max(0, i + (e.key === 'j' ? 1 : -1)))];
      if (!to || to === secs[i]) return;      /* already at the end of the run */

      e.preventDefault();
      /* Move focus, not just the viewport: a keyboard visitor who
         jogs to a section should be able to tab on from there. */
      to.setAttribute('tabindex', '-1');
      to.focus({ preventScroll: true });
      to.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    });
  }

  window.SITE = { $, $$, esc, ic, today, day, fmt, reduced, copy, HERE, NAV, boot: [] };

  document.addEventListener('DOMContentLoaded', () => {
    nav();
    wire();
    jog();
    window.SITE.boot.forEach((fn) => {
      try { fn(); } catch (e) { console.error('[site] boot step failed', e); }
    });
    /* Last, and after the page files have rendered: the rules it
       watches for do not all exist until the sections are built. */
    try { draw(); } catch (e) { console.error('[site] keyline draw failed', e); }
  });
})();
