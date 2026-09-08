/* =============================================================
   work.js — everything on the work page.

   Builds the hero, the status board, and the five sections
   under it from data.js, and runs the split-flap arrival.
   Loads on index.html only.
   ============================================================= */
(function () {
  'use strict';

  const { $, $$, esc, ic, today, day, fmt } = window.SITE;

  /* =========================================================
     Course position is derived from the real agenda dates.
     Read only by hero(), board() and learning() — all of which
     live on this page, which is why it is not in core.
     ========================================================= */
  const sic = (() => {
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
  })();

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

  const card = (p) => `
    <article class="prj">
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
    k.innerHTML = TOOLKIT.map((g) => `
      <div class="kit__row">
        <div class="kit__name">${esc(g.group)}</div>
        <div class="kit__items">
          ${g.items.map((i) => `<span class="tg${i.learning ? ' tg--now' : ''}">${esc(i.n)}</span>`).join('')}
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

    s.innerHTML = `
      <div class="syl__hd">
        <b>Samsung big data — timetable</b>
        <span class="crs__when">module ${sic.cur ? sic.cur.n : '—'} of ${sic.mods.length}</span>
        <span class="syl__next">${esc(up)}</span>
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

      const tick = () => {
        step++;
        if (step >= steps) {
          cell.textContent = final;
          cell.classList.remove('stepping');
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

  window.SITE.boot.push(() => {
    hero(); board(); about(); now(); work(); kit(); learning();
    flap();
  });
})();
