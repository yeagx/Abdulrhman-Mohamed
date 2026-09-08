/* =============================================================
   work.js — everything on the work page.

   Builds the hero, the status board, and the five sections
   under it from data.js, and runs the split-flap arrival.
   Loads on index.html only.
   ============================================================= */
(function () {
  'use strict';

  const { $, $$, esc, ic, today, day, fmt, copy } = window.SITE;

  /* =========================================================
     Course position is derived from the real agenda dates.
     Read only by hero(), board() and learning() — all of which
     live on this page, which is why it is not in core.

     A function rather than a one-shot IIFE so the page can
     re-derive it at midnight: everything dated here hangs off
     `today`, and a tab left open overnight would otherwise keep
     yesterday's module marked as the one running.
     ========================================================= */
  const derive = () => {
    const byMod = {}, all = [];
    SIC.sessions.forEach(([n, m, topic, iso]) => {
      const rec = { n, m, topic, d: day(iso) };
      (byMod[m] = byMod[m] || []).push(rec);
      all.push(rec);
    });
    all.sort((a, b) => a.d - b.d);

    const mods = SIC.modules.map((m) => {
      const ss = (byMod[m.n] || []).slice().sort((a, b) => a.d - b.d);
      return {
        n: m.n, name: m.name, sessions: ss,
        start: ss.length ? ss[0].d : null,
        end: ss.length ? ss[ss.length - 1].d : null,
        state: 'todo'
      };
    });

    let cur = null;
    mods.forEach((m) => {
      if (!m.start) return;
      if (m.end < today) m.state = 'done';
      else if (m.start <= today && today <= m.end) { m.state = 'now'; cur = m; }
    });
    if (!cur) {
      cur = mods.find((m) => m.start && m.start > today) || mods[mods.length - 1];
      if (cur) cur.state = 'now';
    }

    return {
      mods, cur,
      todays: all.find((s) => s.d.getTime() === today.getTime()) || null,
      next: all.find((s) => s.d > today) || null,
      done: all.filter((s) => s.d < today).length,
      total: all.length
    };
  };

  let sic = derive();

  /* ---------- hero ---------- */
  function hero() {
    const n = $('#heroNow');
    if (n) n.textContent = `${NOW.shortCompany || NOW.company} · module ${sic.cur ? sic.cur.n : '—'} of ${sic.mods.length}`;

    const tb = $('#titleBlock');
    if (tb) tb.innerHTML = [
      ['role', esc(PROFILE.role)],
      ['base', esc(PROFILE.location)],
      ['degree', `${esc(PROFILE.degree)} · ${esc(PROFILE.gpa)}`],
      ['status', '<span class="live">open to work</span>']
    ].map(([a, b]) => `<div class="tblock__row"><dt>${a}</dt><dd>${b}</dd></div>`).join('');
  }

  /* =========================================================
     THE SHIFT CLOCK
     A plant floor has a clock on the wall, and it is the
     clearest signal that the room is running rather than
     photographed. It costs rule 7 nothing: a readout is not an
     animation, and nothing on the page moves because of it.

     Africa/Cairo is pinned rather than taken from the visitor's
     machine — the figure means "his local time", which is the
     whole reason it sits in the origin line, and it has to stay
     true for someone reading from another timezone.

     The next tick is aimed at the actual second boundary so it
     cannot drift, and the whole thing stops while the tab is
     hidden rather than repainting into a background nobody is
     looking at.
     ========================================================= */
  function clock() {
    const el = $('#heroClk');
    if (!el) return;

    let f;
    try {
      f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Cairo', hour12: false,
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    } catch (_) {
      return;   /* no timezone data: show nothing rather than a wrong time */
    }

    let timer = null;

    const tick = () => {
      el.textContent = `CAI ${f.format(new Date())}`;
      timer = setTimeout(tick, 1000 - (Date.now() % 1000));
    };

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { clearTimeout(timer); timer = null; }
      else if (timer === null) tick();
    });

    tick();
  }

  /* Every value on the board is a real figure, never an invented
     departure time. Exactly one row is live. */
  function board() {
    const el = $('#board');
    if (!el) return;

    const rows = [
      ['2022–26', 'About me',         PROFILE.schoolShort,                      'arrived',  'about'],
      ['Now',     "What I'm doing",   'Samsung IC',                             'running',  'now'],
      ['2025–26', "What I've built",  `${WORK.length + (typeof GRAD !== 'undefined' ? GRAD.length : 0)} + ${ALSO.length} builds`, 'arrived',  'work'],
      ['—',       'What I work with', `${TOOLKIT.length} groups`,               'arrived',  'toolkit'],
      ['Now',     'Training',         `module ${sic.cur ? sic.cur.n : '—'}/${sic.mods.length}`, 'boarding', 'learning'],
      ['—',       'Away from work',   'YouTube · Clash',                        'arrived',  'personal'],
      ['24 hrs',  'Get in touch',     'Cairo · remote',                         'open',     'contact']
    ];

    /* The board's own route to the other world. It must NOT carry a
       view-transition-name: two elements sharing `door` in the old
       state aborts the whole transition. */
    const to = (id) => (id === 'personal' ? 'play.html' : `#${id}`);

    el.innerHTML =
      `<div class="board__hd">
         <span>When</span><span>Destination</span><span>Detail</span><span>Status</span>
       </div>` +
      rows.map(([when, dest, detail, status, id]) => {
        const s = status === 'boarding' ? 'live'
          : (status === 'open' || status === 'running') ? 'done' : '';
        return `
          <a class="brow" href="${to(id)}">
            <span class="brow__t">${esc(when)}</span>
            <span class="brow__d">${esc(dest)}</span>
            <span class="brow__n">${esc(detail)}</span>
            <span class="brow__s" data-s="${s}" data-flap="${esc(status)}">${esc(status)}</span>
          </a>`;
      }).join('');
  }

  /* ---------- about ---------- */
  function about() {
    const pc = $('#portCap');
    if (pc) pc.innerHTML =
      `<b>${esc(PROFILE.short)}</b><br>${esc(PROFILE.role)}<br>${esc(PROFILE.location)}`;

    const f = $('#facts');
    if (f) f.innerHTML = [
      ['degree', esc(PROFILE.degree)],
      ['school', esc(PROFILE.schoolShort)],
      ['years', esc(PROFILE.years)],
      ['gpa', esc(PROFILE.gpa)],
      ['languages', esc(PROFILE.languages)],
      ['open to', '<span class="live">data engineering / analytics roles</span>']
    ].map(([a, b]) => `<div class="tblock__row"><dt>${a}</dt><dd>${b}</dd></div>`).join('');
  }

  /* ---------- current role ---------- */
  function now() {
    const b = $('#nowBlock');
    if (!b) return;
    b.innerHTML = `
      <div class="now__hd">
        <h3>${esc(NOW.title)}</h3>
        <span class="co">${esc(NOW.company)}</span>
        <span class="wh">${esc(NOW.when)} · ${esc(NOW.where)}</span>
      </div>
      <div class="now__bd">
        <p>${esc(NOW.body)}</p>
        <div class="now__tools">${NOW.tools.map((t) => `<span class="tg">${esc(t)}</span>`).join('')}</div>
        <div class="callout"><b>${esc(NOW.note.h)}</b>${esc(NOW.note.p)}</div>
      </div>`;

    /* the role before this one — a quiet ruled strip, not a second panel */
    const pv = $('#past');
    if (pv && typeof PAST !== 'undefined' && PAST.length) pv.innerHTML =
      `<div class="past__hd">Before this</div>` +
      PAST.map((r) => `
        <div class="past__row">
          <div class="past__who">
            <b>${esc(r.role)}</b>
            <span class="co">${esc(r.company)}</span>
            <span class="crs__when">${esc(r.when)}</span>
          </div>
          <p>${esc(r.note)}</p>
          <div class="now__tools">${r.tools.map((t) => `<span class="tg">${esc(t)}</span>`).join('')}</div>
        </div>`).join('');
  }

  /* ---------- work ----------
     Three racks, each with its own label: the data engineering builds,
     the graduation project, then the one-liners. The graduation project
     is a full-stack AI product rather than a pipeline, and grouping it
     apart is what lets the data work be read on its own terms.
     ------------------------------------------------------------------ */
  const rack = (label, count) =>
    `<div class="grp"><b>${esc(label)}</b><span>${esc(count)}</span></div>`;

  /* a stable id per build, so one project can be linked on its own */
  const slug = (s) =>
    'p-' + String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const card = (p) => `
    <article class="prj" id="${slug(p.name)}">
      <div class="prj__hd">
        <div>
          <h3>${esc(p.name)}</h3>
          <p class="prj__sub">${esc(p.sub)}</p>
          <p class="prj__lead">${esc(p.lead)}</p>
        </div>
        <div class="prj__meta">${esc(p.meta)}</div>
      </div>
      <div class="prj__body">
        ${p.blocks.map((b) => `
          <div class="prj__cell">
            <h4>${esc(b.h)}</h4>
            <p>${esc(b.p)}</p>
            ${b.d ? `<span class="prj__delta"><b>${esc(b.dl || 'Moved:')}</b> ${esc(b.d)}</span>` : ''}
          </div>`).join('')}
      </div>
      <div class="prj__ft">
        <div class="prj__stack">${p.stack.map((x) => `<span class="tg">${esc(x)}</span>`).join('')}</div>
        <div class="prj__lnks">
          ${p.links.length
            ? p.links.map((l) => `<a class="bt" href="${l.url}" target="_blank" rel="noopener">${ic('i-github')} ${esc(l.label)}</a>`).join('')
            : '<span class="frm__nt">university project · repo private</span>'}
          <button class="bt prj__cp" type="button" data-lnk="${slug(p.name)}">Copy link</button>
        </div>
      </div>
    </article>`;

  function work() {
    const n = (k) => `${k} project${k === 1 ? '' : 's'}`;

    const host = $('#projects');
    if (host) host.innerHTML =
      rack('Data engineering', n(WORK.length)) + WORK.map(card).join('');

    const g = $('#grad');
    if (g && typeof GRAD !== 'undefined' && GRAD.length) g.innerHTML =
      rack('Graduation project', 'Computer Science · AASTMT') + GRAD.map(card).join('');

    const a = $('#also');
    if (a) a.innerHTML =
      rack('Smaller builds', `${ALSO.length} more`) +
      `<div class="also__list">` +
      ALSO.map((x) => {
        const inner = `<b>${esc(x.name)}</b><span>${esc(x.note)}</span><i>${x.url ? 'github' : ''}</i>`;
        return x.url
          ? `<a class="also__row" href="${x.url}" target="_blank" rel="noopener">${inner}</a>`
          : `<div class="also__row">${inner}</div>`;
      }).join('') +
      `</div>`;
  }

  /* ---------- toolkit ---------- */
  function kit() {
    const k = $('#kit');
    if (!k) return;
    /* Real buttons, not spans: a part number selects a line, and the
       racks filter to the builds that actually run on it. A control
       that only answers a mouse is not a control. */
    k.innerHTML = TOOLKIT.map((g) => `
      <div class="kit__row">
        <div class="kit__name">${esc(g.group)}</div>
        <div class="kit__items">
          ${g.items.map((i) =>
            `<button type="button" class="tg${i.learning ? ' tg--now' : ''}">${esc(i.n)}</button>`
          ).join('')}
        </div>
      </div>`).join('');
  }

  /* ---------- training + the live timetable ---------- */
  function learning() {
    const c = $('#courses');
    if (c) c.innerHTML = TRAINING.map((t) => `
      <div class="crs${t.current ? ' is-now' : ''}">
        <div class="crs__hd">
          <h4>${esc(t.name)}</h4>
          <span class="crs__when">${esc(t.when)}${t.current ? ' · ongoing' : ''}</span>
          <span class="org">${esc(t.org)}</span>
        </div>
        <div class="crs__bd"><p>${esc(t.body)}</p></div>
      </div>`).join('');

    const s = $('#syllabus');
    if (!s) return;

    const up = sic.todays
      ? `today · ${sic.todays.topic}`
      : (sic.next ? `next · ${sic.next.topic}, ${fmt(sic.next.d)}` : 'course complete');

    /* The session count was already derived and never shown. It is a
       real figure off the real agenda, so it can go on the page
       (rule 6). The bar is drawn from the same number — JS writes
       the number, core's stylesheet owns the colour (rule 8). */
    const pct = sic.total ? Math.round((sic.done / sic.total) * 100) : 0;

    s.innerHTML = `
      <div class="syl__hd">
        <b>Samsung big data — timetable</b>
        <span class="crs__when">module ${sic.cur ? sic.cur.n : '—'} of ${sic.mods.length}</span>
        <span class="syl__next">${esc(up)}</span>
        <span class="syl__prog num" style="--done:${pct}">
          session ${sic.done} of ${sic.total} · ${pct}% done
        </span>
      </div>
      <ul class="syl__list">
        ${sic.mods.map((m) => {
          const cls = m.state === 'done' ? 'done' : (m.state === 'now' ? 'now' : '');
          const range = m.start ? `${fmt(m.start)} – ${fmt(m.end)}` : '';
          const detail = m.state === 'now'
            ? m.sessions.map((x) =>
                `<span class="syl__s${x.d < today ? ' is-done' : (x.d.getTime() === today.getTime() ? ' is-today' : '')}">${esc(x.topic)}</span>`
              ).join('')
            : esc(m.sessions.map((x) => x.topic).join(', '));

          return `
            <li class="syl__i ${cls}">
              <span class="syl__n">${String(m.n).padStart(2, '0')}</span>
              <span class="syl__t">
                <b>${esc(m.name)}${m.state === 'now' ? '<span class="syl__here">here now</span>' : ''}</b>
                <span class="syl__topics">${detail}</span>
                ${range ? `<span class="syl__date">${range}</span>` : ''}
              </span>
            </li>`;
        }).join('')}
      </ul>`;

    const el = s.querySelector('.syl__i.now');
    const list = s.querySelector('.syl__list');
    if (el && list) list.scrollTop = Math.max(0, el.offsetTop - list.clientHeight / 2 + el.offsetHeight / 2);
  }

  /* =========================================================
     THE ARRIVAL
     The status column steps through glyphs and settles, one
     slat at a time, the way a mechanical blind lands on its
     legend.

     Gated to a cold arrival at the top of the page. Returning
     from the other world lands the visitor at #personal, where
     the board is off screen — running it there would spend the
     moment on nobody, under an already-captured snapshot.
     ========================================================= */
  function flap() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (location.hash || window.scrollY > 40) return;

    const cells = $$('#board [data-flap]');
    if (!cells.length) return;

    const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    cells.forEach((cell, row) => {
      const final = cell.dataset.flap;
      const len = final.length;
      let step = 0;
      const steps = 5 + row;
      cell.classList.add('stepping');
      /* While it is scrambling, the cell holds nonsense. Hide it from
         assistive tech until it has landed rather than offering a
         screen reader a row whose status reads "qkxbe". */
      cell.setAttribute('aria-hidden', 'true');

      const tick = () => {
        step++;
        if (step >= steps) {
          cell.textContent = final;
          cell.classList.remove('stepping');
          cell.removeAttribute('aria-hidden');
          return;
        }
        // settle left-to-right: characters lock in order
        const locked = Math.floor((step / steps) * len);
        let out = final.slice(0, locked);
        for (let i = locked; i < len; i++) {
          out += final[i] === ' ' ? ' ' : GLYPHS[(Math.random() * 26) | 0].toLowerCase();
        }
        cell.textContent = out;
        setTimeout(tick, 55);
      };
      setTimeout(tick, 220 + row * 90);
    });
  }

  /* =========================================================
     THE PART INDEX
     A tag is a stamped part number, and the same part turns up
     in several machines. Pointing at one lights every place it
     is used — the toolkit row, the current role, each build
     that runs on it — so the page shows its own wiring instead
     of leaving the reader to search for it. Selecting one
     filters the racks to the builds that actually use it.

     Built once, after every section has rendered, from what is
     on the page rather than from a second copy of the data:
     there is no list to keep in step.
     ========================================================= */
  const key = (s) => String(s).toLowerCase().replace(/\s+/g, ' ').trim();

  function parts() {
    /* the toolkit's legend is two worked examples, not real parts */
    const tags = $$('.tg').filter((t) => !t.closest('.kit__key'));
    if (!tags.length) return;

    const index = new Map();
    tags.forEach((t) => {
      const k = key(t.textContent);
      if (!k) return;
      t.dataset.k = k;
      let l = index.get(k);
      if (!l) { l = []; index.set(k, l); }
      l.push(t);
    });

    const cards = $$('.prj');
    const bar = $('#kitSel');
    let sel = null, hot = null;

    /* what each build runs on, resolved once rather than per event */
    const runs = new Map();
    cards.forEach((c) => runs.set(c, $$('.tg', c).map((t) => t.dataset.k)));

    const light = (k, on) =>
      (index.get(k) || []).forEach((t) => t.classList.toggle('tg--hot', on));

    function apply() {
      const hits = sel ? cards.filter((c) => (runs.get(c) || []).indexOf(sel) > -1) : [];

      /* A toolkit part that no build on this page lists is a real and
         ordinary case — most of a toolkit never appears in a project
         stack. Grey out every rack to prove that and the visitor has
         been punished for a fair question, so say it in words and
         leave the section alone. */
      const useful = !!sel && hits.length > 0;
      cards.forEach((c) => c.classList.toggle('dim', useful && hits.indexOf(c) < 0));
      tags.forEach((t) => t.classList.toggle('tg--sel', !!sel && t.dataset.k === sel));

      if (!bar) return;
      if (!sel) { bar.hidden = true; bar.textContent = ''; return; }

      bar.hidden = false;
      bar.innerHTML =
        `<b>${esc(index.get(sel)[0].textContent.trim())}</b>` +
        (hits.length
          ? `<span>${hits.length} of ${cards.length} builds run on it</span>
             <a href="#work">show me</a>`
          : `<span>no build on this page lists it</span>`) +
        `<button class="kit__clr" type="button">clear</button>`;
    }

    /* One delegated pass for the whole document. There are a great
       many tags, and a listener on each is a listener wasted. */
    const over = (e) => {
      const t = e.target.closest ? e.target.closest('.tg') : null;
      const k = t && !t.closest('.kit__key') ? t.dataset.k : null;
      if (k === hot) return;
      if (hot) light(hot, false);
      hot = k;
      if (hot) light(hot, true);
    };

    document.addEventListener('pointerover', over);
    document.addEventListener('focusin', over);

    document.addEventListener('click', (e) => {
      if (!e.target.closest) return;
      if (e.target.closest('.kit__clr')) { sel = null; apply(); return; }
      const t = e.target.closest('button.tg');
      if (!t) return;
      sel = (sel === t.dataset.k) ? null : t.dataset.k;   /* a second press clears */
      apply();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sel) { sel = null; apply(); }
    });
  }

  /* ---------- a deep link to one build ----------
     Reuses core's clipboard helper, so "copied" cannot come to mean
     something different here than it does on the contact panel. If
     the clipboard is refused, put the fragment in the address bar —
     the visitor can still copy it themselves. */
  function deeplink() {
    document.addEventListener('click', (e) => {
      const b = e.target.closest ? e.target.closest('.prj__cp') : null;
      if (!b) return;
      const id = b.dataset.lnk;
      copy(location.origin + location.pathname + '#' + id, b, () => { location.hash = id; });
    });
  }

  /* ---------- settle a build's own fragment ----------
     The browser scrolls to a fragment while the page is still being
     built from data.js, so by the time the racks have rendered the
     target has moved out from under the landing — a copied link can
     miss its build by a couple of hundred pixels, and by a different
     amount each load. Put it back once everything is on the page.

     Scoped deliberately to the `p-` ids this file introduces. The
     doorway's own #personal landing is left exactly as it was: that
     one belongs to the page transition, and rule 11 keeps JavaScript
     out of it. */
  function settle() {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    if (id.indexOf('p-') !== 0) return;

    /* If the visitor has already taken hold of the page, they own the
       scroll position from then on. Never yank it back. */
    let held = false;
    const grab = () => { held = true; };
    ['wheel', 'touchstart', 'keydown'].forEach((e) =>
      window.addEventListener(e, grab, { once: true, passive: true }));

    const land = () => {
      if (held) return;
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' });
    };

    land();
    /* The web faces arrive after this and reflow every section above
       the target, so a single landing drifts by a hundred pixels or
       so. Land it again once the fonts are in. */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(land);
  }

  /* ---------- midnight ----------
     Every date on this page hangs off `today`, computed once when
     core.js loaded. A tab left open overnight would keep yesterday's
     module marked as the one running and yesterday's session marked
     as today's. Re-derive at the local day boundary and re-render
     the three sections that read dates.

     `today` is core's own Date, mutated in place on purpose: the
     scroll spy and the arcade read the same object, and two
     different ideas of "today" in one page is the bug this exists
     to prevent. The board is re-rendered but the flap is NOT re-run
     — the arrival already happened. */
  function rollover() {
    const now = new Date();
    const next = new Date(now);
    next.setHours(24, 0, 0, 30);          /* just past the boundary */

    setTimeout(() => {
      today.setTime(new Date().setHours(0, 0, 0, 0));
      sic = derive();
      try { hero(); board(); learning(); } catch (e) { console.error('[work] rollover render failed', e); }
      rollover();                          /* and again tomorrow */
    }, Math.max(1000, next - now));
  }

  window.SITE.boot.push(() => {
    hero(); board(); about(); now(); work(); kit(); learning();
    clock();
    parts();          /* after every section: it indexes what is on the page */
    deeplink();
    settle();       /* after the racks exist, so a copied link lands true */
    rollover();
    flap();
  });
})();
