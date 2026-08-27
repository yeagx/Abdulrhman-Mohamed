/* =============================================================
   render.js — builds the page from data.js, plus rail + scroll
   ============================================================= */
(function () {
  'use strict';

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ic = (id, n) => `<svg width="${n || 13}" height="${n || 13}" aria-hidden="true"><use href="#${id}"/></svg>`;

  const today = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
  const day = (iso) => { const d = new Date(iso + 'T00:00:00'); d.setHours(0, 0, 0, 0); return d; };
  const fmt = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  /* =========================================================
     Everything about the course is DERIVED from the session
     dates — module ranges, which module is current, what is
     next. Nothing here is hard-coded.
     ========================================================= */
  const sic = (() => {
    const byMod = {};
    const all = [];

    SIC.sessions.forEach(([n, m, topic, iso, hrs]) => {
      const rec = { n, m, topic, d: day(iso), hrs };
      (byMod[m] = byMod[m] || []).push(rec);
      all.push(rec);
    });
    all.sort((a, b) => a.d - b.d);

    const mods = SIC.modules.map((m) => {
      const ss = (byMod[m.n] || []).slice().sort((a, b) => a.d - b.d);
      return {
        n: m.n,
        name: m.name,
        sessions: ss,
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
    // between two modules? the next one up is where I am headed
    if (!cur) {
      cur = mods.find((m) => m.start && m.start > today) || mods[mods.length - 1];
      if (cur) cur.state = 'now';
    }

    const todays = all.find((s) => s.d.getTime() === today.getTime()) || null;
    const next   = all.find((s) => s.d > today) || null;
    const done   = all.filter((s) => s.d < today).length;

    return { mods, cur, todays, next, done, total: all.length };
  })();

  /* ---------- rail + mobile sheet ---------- */
  const NAV = [
    { id: 'top',      t: 'top' },
    { id: 'about',    t: 'about' },
    { id: 'now',      t: 'now' },
    { id: 'work',     t: 'work' },
    { id: 'toolkit',  t: 'toolkit' },
    { id: 'learning', t: 'training' },
    { id: 'personal', t: 'personal' },
    { id: 'contact',  t: 'contact' }
  ];

  function nav() {
    const ul = $('#railNav');
    if (ul) ul.innerHTML = NAV.map((n) => `
      <li><a class="rail__lnk" href="#${n.id}" data-id="${n.id}" title="${n.t}">
        <span class="rail__no"></span>
        <span class="rail__txt">${n.t}</span>
      </a></li>`).join('');

    const ms = $('#mSheet');
    if (ms) ms.innerHTML = NAV.map((n) => `
      <a href="#${n.id}"><span></span>${n.t}</a>`).join('') +
      `<a href="CV.pdf" download><span></span>résumé</a>`;

    const rn = $('#railName'); if (rn) rn.textContent = PROFILE.short;
    const rf = $('#railFoot'); if (rf) rf.textContent = 'open to work';
  }

  /* ---------- hero ---------- */
  function hero() {
    const k = $('#heroKicker');
    if (k) k.textContent = `currently — ${NOW.company} · ${SIC.name.split('—')[0].trim()}`;

    const tb = $('#titleBlock');
    if (tb) tb.innerHTML = [
      ['name', esc(PROFILE.short)],
      ['role', esc(PROFILE.role)],
      ['loc',  esc(PROFILE.location)],
      ['edu',  `${esc(PROFILE.degree)}, ${esc(PROFILE.schoolShort)} ’26`]
    ].map(([a, b]) => `<div class="tblock__row"><dt>${a}</dt><dd>${b}</dd></div>`).join('');
  }

  /* ---------- about ---------- */
  function about() {
    const pc = $('#portCap');
    if (pc) pc.innerHTML =
      `<b>name</b> &nbsp;${esc(PROFILE.short)}<br>` +
      `<b>role</b> &nbsp;${esc(PROFILE.role)}<br>` +
      `<b>base</b> &nbsp;${esc(PROFILE.location)}`;

    const f = $('#facts');
    if (f) f.innerHTML = [
      ['degree',  esc(PROFILE.degree)],
      ['school',  esc(PROFILE.schoolShort)],
      ['years',   esc(PROFILE.years)],
      ['gpa',     esc(PROFILE.gpa)],
      ['langs',   esc(PROFILE.languages)],
      ['open to', '<span style="color:var(--magenta)">data engineering / analytics roles</span>']
    ].map(([a, b]) => `<div class="tblock__row"><dt>${a}</dt><dd>${b}</dd></div>`).join('');
  }

  /* ---------- now ---------- */
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
        <div class="callout"><b>Why it is on a data engineering site.</b> ${esc(NOW.relevance)}</div>
      </div>`;
  }

  /* ---------- work ---------- */
  function work() {
    const host = $('#projects');
    if (host) host.innerHTML = WORK.map((p) => `
      <article class="blk prj rv">
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
              <h4><span class="tick"></span>${esc(b.h)}</h4>
              <p>${esc(b.p)}</p>
            </div>`).join('')}
        </div>
        <div class="prj__ft">
          <div class="prj__stack">${p.stack.map((s) => `<span class="tg">${esc(s)}</span>`).join('')}</div>
          <div class="prj__lnks">
            ${p.links.length
              ? p.links.map((l) => `<a class="bt" href="${l.url}" target="_blank" rel="noopener">${ic('i-github')} ${esc(l.label)}</a>`).join('')
              : '<span class="frm__nt">university project — repo private</span>'}
          </div>
        </div>
      </article>`).join('');

    const a = $('#also');
    if (a) a.innerHTML = ALSO.map((x) => {
      const inner = `<b>${esc(x.name)}</b><span>${esc(x.note)}</span><i>${x.url ? 'github ↗' : ''}</i>`;
      return x.url
        ? `<a class="also__row" href="${x.url}" target="_blank" rel="noopener">${inner}</a>`
        : `<div class="also__row">${inner}</div>`;
    }).join('');
  }

  /* ---------- toolkit ---------- */
  function kit() {
    const k = $('#kit');
    if (!k) return;
    k.innerHTML = TOOLKIT.map((g) => `
      <div class="kit__row">
        <div class="kit__name"><span class="tick"></span>${esc(g.group)}</div>
        <div class="kit__items">
          ${g.items.map((i) => `<span class="tg${i.learning ? ' tg--now' : ''}">${esc(i.n)}</span>`).join('')}
        </div>
      </div>`).join('');
  }

  /* ---------- training + live syllabus ---------- */
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

    const cur = sic.cur;
    const upNext = sic.todays
      ? `today · ${sic.todays.topic}`
      : (sic.next ? `next · ${sic.next.topic}, ${fmt(sic.next.d)}` : 'course complete');

    s.innerHTML = `
      <div class="syl__hd">
        <span class="tick"></span>
        <b>Samsung big data — syllabus</b>
        <span class="crs__when">module ${cur ? cur.n : '—'} of ${sic.mods.length}</span>
        <span class="syl__next">${esc(upNext)}</span>
      </div>
      <ul class="syl__list">
        ${sic.mods.map((m) => {
          const cls = m.state === 'done' ? 'done' : (m.state === 'now' ? 'now' : '');
          const range = m.start ? `${fmt(m.start)} – ${fmt(m.end)}` : '';
          // inside the module I'm in, show which sessions are already behind me
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

    // open the panel on the module I'm actually in
    const el = s.querySelector('.syl__i.now');
    const list = s.querySelector('.syl__list');
    if (el && list) list.scrollTop = Math.max(0, el.offsetTop - list.clientHeight / 2 + el.offsetHeight / 2);
  }

  /* ---------- clash ---------- */
  function clash() {
    const u = $('#crUpdated');
    if (u) u.textContent = `updated ${CLASH.updated}`;

    const c = $('#clash');
    if (!c) return;
    c.innerHTML = `
      <div class="cr__hd">
        <b>${esc(CLASH.player.name)}</b>
        <span>${esc(CLASH.player.tag)}</span>
      </div>
      <dl class="cr__met">
        ${CLASH.metrics.map((m) => `<div><dt>${esc(m.label)}</dt><dd>${esc(m.value)}</dd></div>`).join('')}
      </dl>
      <div class="cr__deckhd">
        <b>${esc(CLASH.deck.name)}</b>
        <span>avg elixir ${CLASH.deck.avgElixir.toFixed(1)}</span>
      </div>
      <div class="cr__deck">
        ${CLASH.deck.cards.map((k) => `
          <div class="cr__c${k.fav ? ' fav' : ''}" title="${esc(k.name)}">
            <span class="e">${k.elixir}</span>
            <img src="${k.img}" alt="${esc(k.name)}" loading="lazy" decoding="async">
          </div>`).join('')}
      </div>
      <p class="cr__note">${esc(CLASH.note)}</p>`;
  }

  /* ---------- scroll wiring ---------- */
  function wire() {
    const links = $$('.rail__lnk');
    const secs = NAV.map((n) => document.getElementById(n.id)).filter(Boolean);
    const up = $('#up');
    let tick = false;

    const onScroll = () => {
      if (tick) return;
      tick = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (up) up.classList.toggle('show', y > 600);
        let idx = 0;
        secs.forEach((s, i) => { if (s.getBoundingClientRect().top <= 140) idx = i; });
        links.forEach((l, i) => l.classList.toggle('on', i === idx));
        tick = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (up) up.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => {
        es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -6% 0px', threshold: .05 });
      $$('.rv').forEach((el) => io.observe(el));
    } else {
      $$('.rv').forEach((el) => el.classList.add('in'));
    }

    const mb = $('#menuBt'), ms = $('#mSheet');
    if (mb && ms) {
      mb.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        const o = ms.classList.toggle('open');
        mb.setAttribute('aria-expanded', String(o));
      });
      ms.addEventListener('click', (e) => {
        if (e.target.closest('a')) { ms.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const y = $('#yr'); if (y) y.textContent = new Date().getFullYear();
    nav(); hero(); about(); now(); work(); kit(); learning(); clash(); wire();
    $$('#projects .rv').forEach((el) => el.classList.add('in'));
  });

  window.__site = { $, $$, esc, ic, sic };
})();
