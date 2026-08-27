/* =============================================================
   youtube.js — latest upload, recent uploads, and the channel
   avatar, straight from the public RSS feed. No API key.

   Notes on why this is shaped the way it is:
   • The proxies are raced in PARALLEL, not tried one after another.
     Sequential retries meant one slow proxy ate the whole budget.
   • The timeout is generous (14s). allorigins is often slow but does
     eventually answer — aborting at 7s was killing good requests.
   • The channel avatar is NOT in the RSS feed. It is read from the
     channel page's og:image tag instead, through the same proxy.
   ============================================================= */
(function () {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE.channelId}`;
  const TIMEOUT = 14000;

  const PROXIES = [
    (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    (u) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
    (u) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
    (u) => `https://api.cors.lol/?url=${encodeURIComponent(u)}`
  ];

  const blurb = $('#ytBlurb');
  if (blurb) blurb.textContent = YOUTUBE.blurb;

  const rel = (iso) => {
    const d = Math.floor((Date.now() - new Date(iso)) / 86400000);
    if (d <= 0) return 'today';
    if (d === 1) return 'yesterday';
    if (d < 30) return `${d} days ago`;
    if (d < 365) return `${Math.floor(d / 30)} month${Math.floor(d / 30) > 1 ? 's' : ''} ago`;
    const y = Math.floor(d / 365);
    return `${y} year${y > 1 ? 's' : ''} ago`;
  };

  /* Race every proxy at once; first usable answer wins. */
  function fetchVia(url, validate) {
    return new Promise((resolve) => {
      let settled = false, pending = PROXIES.length;
      const timer = setTimeout(() => { if (!settled) { settled = true; resolve(null); } }, TIMEOUT);

      PROXIES.forEach((build) => {
        fetch(build(url))
          .then((r) => (r.ok ? r.text() : Promise.reject(new Error('http ' + r.status))))
          .then((txt) => {
            if (settled) return;
            if (validate(txt)) { settled = true; clearTimeout(timer); resolve(txt); }
            else if (--pending === 0) { settled = true; clearTimeout(timer); resolve(null); }
          })
          .catch(() => {
            if (settled) return;
            if (--pending === 0) { settled = true; clearTimeout(timer); resolve(null); }
          });
      });
    });
  }

  function embed(id, title) {
    return `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}"
      title="${esc(title || 'Video from the YeagX channel')}" loading="lazy"
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen></iframe>`;
  }

  function parseFeed(xml) {
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    if (doc.querySelector('parsererror')) return [];

    return Array.from(doc.getElementsByTagName('entry')).map((e) => {
      const pick = (t) => { const n = e.getElementsByTagName(t)[0]; return n ? n.textContent : ''; };
      const id = pick('yt:videoId') || pick('videoId');

      // the thumbnail INSIDE this entry — never mistake it for the channel avatar
      let thumb = `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
      const mt = e.getElementsByTagName('media:thumbnail')[0];
      if (mt && mt.getAttribute('url')) thumb = mt.getAttribute('url');

      return { id, title: pick('title'), published: pick('published'), thumb };
    }).filter((v) => v.id);
  }

  /* The avatar lives on the channel page, not in the feed. */
  async function loadAvatar() {
    const img = $('#ytLogo');
    if (!img) return;
    const html = await fetchVia(YOUTUBE.url, (t) => t && t.indexOf('og:image') !== -1);
    if (!html) return;

    const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
           || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (m && m[1] && /^https?:\/\//.test(m[1])) {
      const probe = new Image();
      probe.onload = () => { img.src = m[1]; };   // only swap once it actually loads
      probe.src = m[1];
    }
  }

  function offline(reason) {
    const st = $('#ytStatus'), frame = $('#ytFrame'), list = $('#ytList'), now = $('#ytNow');
    const fb = (YOUTUBE.fallbackVideoId || '').trim();
    if (now) now.textContent = '';

    if (fb) {
      if (st) st.textContent = 'saved pick';
      if (frame) frame.innerHTML = embed(fb);
      if (list) list.innerHTML =
        `<a class="yt__sub" style="margin:0;justify-content:center" href="${YOUTUBE.url}"
            target="_blank" rel="noopener">See every upload</a>`;
      return;
    }

    if (st) st.textContent = 'offline';
    if (frame) frame.innerHTML =
      `<div class="ph">Could not reach the feed right now.<br>
        <a href="${YOUTUBE.url}" target="_blank" rel="noopener">Open the channel →</a></div>`;
    if (list) list.innerHTML =
      `<div style="font-size:12px;color:#888;padding:6px 2px">${esc(reason)}</div>`;
  }

  async function run() {
    loadAvatar();   // independent of the feed — never blocks it

    const xml = await fetchVia(FEED, (t) => t && t.indexOf('<entry') !== -1);
    if (!xml) { offline('no proxy answered in time'); return; }

    const vids = parseFeed(xml);
    if (!vids.length) { offline('the feed returned no videos'); return; }

    const st = $('#ytStatus');
    if (st) st.textContent = 'live';

    const latest = vids[0];
    const frame = $('#ytFrame');
    if (frame) frame.innerHTML = embed(latest.id, latest.title);

    const now = $('#ytNow');
    if (now) {
      const fresh = (Date.now() - new Date(latest.published)) < 7 * 86400000;
      now.innerHTML = `${fresh ? '<span class="yt__new">NEW</span>' : ''}
        <span>${esc(latest.title)} · <span style="color:#AAA">${rel(latest.published)}</span></span>`;
    }

    const list = $('#ytList');
    if (list) {
      const rest = vids.slice(1, 4);
      list.innerHTML = rest.length
        ? rest.map((v) => `
            <a class="yt__it" href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">
              <img src="${v.thumb}" alt="" loading="lazy" decoding="async">
              <span><b>${esc(v.title)}</b><span>${rel(v.published)}</span></span>
            </a>`).join('')
        : `<div style="font-size:13px;color:#888;padding:6px 2px">Only one upload on the feed so far.</div>`;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
