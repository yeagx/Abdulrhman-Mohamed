/* =============================================================
   contact.js — Web3Forms delivery with a real receipt.

   Rules this file follows:
     1. Never show success unless the API actually said success.
     2. Give the sender a reference number they can quote back.
     3. On failure, hand them a fallback that still carries their text.
     4. Never lose a draft.
   ============================================================= */
(function () {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ic = (id, n) => `<svg width="${n || 14}" height="${n || 14}"><use href="#${id}"/></svg>`;

  const ENDPOINT = 'https://api.web3forms.com/submit';
  const KEY = (typeof WEB3FORMS_ACCESS_KEY === 'string') ? WEB3FORMS_ACCESS_KEY.trim() : '';
  const KEY_OK = KEY && KEY !== 'PASTE_YOUR_ACCESS_KEY_HERE' && KEY.length > 20;
  const DRAFT = 'contact_draft_v2';

  const form = $('#cForm');
  const bt   = $('#sendBt');
  const rc   = $('#rcpt');

  const ref = () =>
    'MSG-' + Date.now().toString(36).toUpperCase().slice(-6) +
    '-' + Math.random().toString(36).toUpperCase().slice(2, 5);

  /* ---------- direct channels ---------- */
  function channels() {
    const box = $('#chans');
    if (!box) return;
    const wa = encodeURIComponent('Hi Abdulrhman — I saw your portfolio and wanted to ask about ');

    box.innerHTML = `
      <button class="chan" id="cpMail" type="button">
        <span class="chan__ic">${ic('i-mail', 14)}</span>
        <span class="chan__t"><b>Email</b><span>${esc(PROFILE.email)}</span></span>
        <span class="chan__x" id="cpHint">copy</span>
      </button>
      <a class="chan" href="https://wa.me/${PROFILE.phoneIntl}?text=${wa}" target="_blank" rel="noopener">
        <span class="chan__ic">${ic('i-wa', 14)}</span>
        <span class="chan__t"><b>WhatsApp</b><span>${esc(PROFILE.phone)}</span></span>
        <span class="chan__x">fastest</span>
      </a>
      <a class="chan" href="${PROFILE.links.linkedin}" target="_blank" rel="noopener">
        <span class="chan__ic">${ic('i-linkedin', 14)}</span>
        <span class="chan__t"><b>LinkedIn</b><span>/in/abdulrhman-mohamed-da</span></span>
        <span class="chan__x">${ic('i-ext', 11)}</span>
      </a>
      <a class="chan" href="tel:${PROFILE.phone.replace(/\s/g, '')}">
        <span class="chan__ic">${ic('i-phone', 14)}</span>
        <span class="chan__t"><b>Phone</b><span>${esc(PROFILE.phone)}</span></span>
        <span class="chan__x">Cairo · GMT+2</span>
      </a>`;

    const b = $('#cpMail'), h = $('#cpHint');
    if (b) b.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(PROFILE.email);
        h.textContent = 'copied'; h.classList.add('is-ok');
        setTimeout(() => { h.textContent = 'copy'; h.classList.remove('is-ok'); }, 1800);
      } catch (_) { window.location.href = 'mailto:' + PROFILE.email; }
    });
  }

  /* ---------- endpoint state ---------- */
  function state() {
    const pill = $('#formState'), note = $('#formNote');
    if (KEY_OK) {
      if (pill) { pill.textContent = 'ready'; pill.classList.add('is-ok'); }
    } else {
      if (pill) { pill.textContent = 'not set up'; pill.classList.add('is-bad'); }
      if (note) {
        note.textContent = 'form not connected yet — use email or WhatsApp on the left';
        note.classList.add('is-bad');
      }
      if (bt) bt.disabled = true;
      console.warn('[contact] No Web3Forms key. See README → "Turning the contact form on".');
    }
  }

  /* ---------- validation ---------- */
  const RULES = {
    cname:  { min: 2,  msg: 'Please enter your name.' },
    cemail: { re: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, msg: 'That email does not look right.' },
    cmsg:   { min: 12, msg: 'A little more detail, please.' }
  };

  function mark(id, msg) {
    const el = $('#' + id);
    const f = el ? el.closest('.fld') : null;
    const e = $('#e-' + id);
    if (f) f.classList.toggle('bad', !!msg);
    if (e) e.textContent = msg || '';
  }

  function check(all) {
    let ok = true;
    Object.keys(RULES).forEach((id) => {
      const el = $('#' + id);
      if (!el) return;
      const v = el.value.trim(), r = RULES[id];
      let m = '';
      if (!v) m = 'Required.';
      else if (r.min && v.length < r.min) m = r.msg;
      else if (r.re && !r.re.test(v)) m = r.msg;
      if (all || ($('#e-' + id) && $('#e-' + id).textContent)) mark(id, m);
      if (m) ok = false;
    });
    return ok;
  }

  /* ---------- draft ---------- */
  const draft = {
    save() {
      try {
        localStorage.setItem(DRAFT, JSON.stringify({
          name: $('#cname').value, email: $('#cemail').value,
          topic: $('#ctopic').value, message: $('#cmsg').value
        }));
      } catch (_) {}
    },
    load() {
      try {
        const d = JSON.parse(localStorage.getItem(DRAFT) || '{}');
        if (d.name) $('#cname').value = d.name;
        if (d.email) $('#cemail').value = d.email;
        if (d.topic) $('#ctopic').value = d.topic;
        if (d.message) $('#cmsg').value = d.message;
      } catch (_) {}
    },
    clear() { try { localStorage.removeItem(DRAFT); } catch (_) {} }
  };

  function count() {
    const c = $('#msgCount'), m = $('#cmsg');
    if (c && m) c.textContent = m.value.length;
  }

  /* ---------- receipt ---------- */
  function receipt(kind, title, rows, foot) {
    if (!rc) return;
    rc.hidden = false;
    rc.className = 'rcpt ' + kind;
    const t = $('#rcptTitle'); if (t) t.textContent = title;
    const b = $('#rcptBody');
    if (b) b.innerHTML =
      rows.map(([k, v]) => `<dl class="rcpt__ln"><dt>${esc(k)}</dt><dd>${v}</dd></dl>`).join('') +
      (foot ? `<p>${foot}</p>` : '');
    rc.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function mailto(id, d) {
    return `mailto:${PROFILE.email}` +
      `?subject=${encodeURIComponent(`[${id}] ${d.topic} — via portfolio`)}` +
      `&body=${encodeURIComponent(`${d.message}\n\n—\nFrom: ${d.name} <${d.email}>\nRef: ${id}`)}`;
  }

  /* ---------- submit ---------- */
  async function submit(e) {
    e.preventDefault();
    if (!KEY_OK) return;

    if (!check(true)) {
      const bad = document.querySelector('.fld.bad input, .fld.bad textarea');
      if (bad) bad.focus();
      return;
    }
    if ($('#company_website') && $('#company_website').value) return;   // honeypot

    const d = {
      name: $('#cname').value.trim(),
      email: $('#cemail').value.trim(),
      topic: $('#ctopic').value,
      message: $('#cmsg').value.trim()
    };
    const id = ref();
    const at = new Date();
    const label = bt.innerHTML;

    bt.disabled = true; bt.textContent = 'Sending…';
    receipt('run', 'sending', [
      ['reference', `<span class="tkt">${id}</span>`],
      ['status', 'waiting for the server…']
    ]);

    let res, json;
    try {
      const c = new AbortController();
      const timer = setTimeout(() => c.abort(), 15000);
      res = await fetch(ENDPOINT, {
        method: 'POST',
        signal: c.signal,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: KEY,
          subject: `[${id}] ${d.topic} — ${d.name}`,
          from_name: 'Portfolio contact form',
          replyto: d.email,
          name: d.name, email: d.email, topic: d.topic, message: d.message,
          reference: id, sent_at: at.toISOString(), page: location.href
        })
      });
      clearTimeout(timer);
      json = await res.json().catch(() => ({}));
    } catch (err) {
      bt.disabled = false; bt.innerHTML = label;
      draft.save();
      receipt('err', 'not delivered', [
        ['reference', `<span class="tkt">${id}</span>`],
        ['status', `<span class="is-bad">${err.name === 'AbortError' ? 'timed out' : 'network error'}</span>`],
        ['your text', 'saved — still in the form below']
      ],
        `This did <b>not</b> send, and I would rather tell you than show a fake tick.
         <a href="${mailto(id, d)}">Send it by email instead →</a> or
         <a href="https://wa.me/${PROFILE.phoneIntl}" target="_blank" rel="noopener">message me on WhatsApp</a>.`);
      return;
    }

    bt.disabled = false; bt.innerHTML = label;

    if (res.ok && json && json.success) {
      draft.clear(); form.reset(); count();
      receipt('ok', 'delivered', [
        ['reference', `<span class="tkt">${id}<button class="cpy" type="button" data-c="${id}">copy</button></span>`],
        ['sent', at.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })],
        ['server', `${res.status} ${esc(json.message || 'ok')}`],
        ['reply to', esc(d.email)]
      ],
        `It reached my inbox. Keep that reference — quote it if you follow up and I can find the exact message.
         I reply within 24 hours on weekdays.`);

      const c = $('#rcptBody').querySelector('[data-c]');
      if (c) c.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(c.dataset.c); c.textContent = 'copied'; } catch (_) {}
      });
    } else {
      draft.save();
      receipt('err', 'rejected', [
        ['reference', `<span class="tkt">${id}</span>`],
        ['server', `<span class="is-bad">${res.status} ${esc((json && json.message) || 'unknown error')}</span>`],
        ['your text', 'saved — still in the form below']
      ],
        `The server refused it, so nothing reached me.
         <a href="${mailto(id, d)}">Send the same message by email →</a>`);
    }
  }

  function init() {
    channels();
    state();
    if (!form) return;
    draft.load();
    count();
    form.addEventListener('submit', submit);
    form.addEventListener('input', () => { check(false); count(); });
    ['cname', 'cemail', 'cmsg'].forEach((id) => {
      const el = $('#' + id);
      if (el) el.addEventListener('blur', () => check(true));
    });
    let t;
    form.addEventListener('input', () => { clearTimeout(t); t = setTimeout(draft.save, 500); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
