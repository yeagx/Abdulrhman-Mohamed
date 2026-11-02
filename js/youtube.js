/* =============================================================
   youtube.js — latest upload, recent uploads, and the channel
   avatar. No API key in the page, no public proxies.

   Two sources, both on this site's own origin:
   • data/youtube.js — a saved snapshot (window.YT_SNAPSHOT), written
     by scripts/youtube-sync.js on a schedule, which also saves the
     avatar over Images/yeagx_logo.jpg. A plain <script>, so it is
     loaded before this file runs, from disk as well as from a
     server: the panel paints from it with no request at all.
   • api/youtube — a Vercel function that reads the channel server-
     side and is CDN-cached. It replaces the snapshot when it answers;
     when it does not, or on a host with no functions, the snapshot
     simply stays.

   The frame holds the upload's thumbnail as a real link until someone
   presses play, and only then becomes a YouTube player. YouTube
   refuses a player on a page that sent no Referer (its "error 153"),
   which is every page opened from disk — so there, play stays the
   link it already is and opens YouTube. A broken player card can
   never reach the page.

   The old version raced four public CORS proxies against the RSS
   feed. Both halves failed: the proxies go down, and YouTube's feed
   now answers 404 for every channel. See api/_youtube.js.
   ============================================================= */
(function () {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* relative, so it still resolves on a GitHub Pages subpath */
  const LIVE = 'api/youtube';
  /* a page with a real origin sends a Referer; one opened from disk cannot */
  const CAN_EMBED = /^https?:$/.test(location.protocol);

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

  const watch = (id) => `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
  const still = (id, size) => `https://i.ytimg.com/vi/${encodeURIComponent(id)}/${size}.jpg`;

  /* One gate for both sources. Anything that is not a list of real
     video ids — a 404 page, an error body, a half-written file —
     comes back as null rather than as something to render. */
  function usable(d) {
    const vids = d && Array.isArray(d.videos)
      ? d.videos.filter((v) => v && /^[\w-]{11}$/.test(v.id) && v.title && Date.parse(v.published) > 0)
      : [];
    return vids.length ? { videos: vids, avatar: d.avatar || d.avatarUrl || null } : null;
  }

  function live(ms) {
    if (!CAN_EMBED) return Promise.resolve(null);   // no endpoint behind a file:// page
    const ctl = 'AbortController' in window ? new AbortController() : null;
    const timer = ctl && setTimeout(() => ctl.abort(), ms);
    return fetch(LIVE, { cache: 'no-cache', signal: ctl ? ctl.signal : undefined })
      .then((r) => (r.ok ? r.json() : null))
      .then(usable)
      .catch(() => null)
      .then((d) => { clearTimeout(timer); return d; });
  }

  /* The player only ever exists because someone pressed play, so the
     autoplay is a response to a gesture, never an ambush. The referrer
     policy is spelled out because the embed is refused without one. */
  function player(v) {
    return `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}?autoplay=1&rel=0"
      title="${esc(v.title || 'Video from the YeagX channel')}"
      referrerpolicy="strict-origin-when-cross-origin"
      allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen></iframe>`;
  }

  /* The poster: the upload's own thumbnail, as a link to it. */
  function poster(v) {
    return `<a class="yt__play" href="${watch(v.id)}" target="_blank" rel="noopener" data-v="${esc(v.id)}"
        aria-label="${CAN_EMBED ? 'Play' : 'Watch on YouTube'}: ${esc(v.title || 'latest upload')}">
      <img src="${still(v.id, 'maxresdefault')}" alt="" decoding="async">
      <span class="yt__go" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24"><path fill="currentColor" d="M7 4.5v15l12.5-7.5z"/></svg>
      </span>
    </a>`;
  }

  /* Not every upload has a full-size thumbnail. A missing one comes back
     as YouTube's 120px grey placeholder rather than as an error, so
     check the size too. hqdefault always exists, and object-fit: cover
     crops its letterbox bars away exactly. */
  function settlePoster(frame, id) {
    const img = frame.querySelector('.yt__play img');
    if (!img) return;
    const fallback = () => { if (img.src.indexOf('hqdefault') < 0) img.src = still(id, 'hqdefault'); };
    img.addEventListener('error', fallback, { once: true });
    img.addEventListener('load', () => { if (img.naturalWidth <= 120) fallback(); });
  }

  /* the picture's own token: the same image comes from different hosts
     and sizes depending on the source (see avatarKey in api/_youtube.js) */
  const key = (url) => (url ? String(url).replace(/^https?:\/\/[^/]+\//, '').split('=')[0] : '');

  /* The snapshot job already saved the avatar over the <img>'s own file,
     so it is right before any script runs. A live address that differs
     from the one that job saved means the picture changed since: swap,
     but only once the new one has actually loaded. */
  function avatar(url) {
    const img = $('#ytLogo');
    if (!img || !url || !/^https:\/\//.test(url)) return;
    const probe = new Image();
    probe.onload = () => { img.src = url; };
    probe.src = url;
  }

  /* What is on screen, so a second, newer answer only touches what
     actually changed — and never pulls a video out from under someone
     who has pressed play. */
  let vids = [], shown = null, playing = false;

  function show(v) {
    const frame = $('#ytFrame');
    if (!frame) return;
    frame.innerHTML = poster(v);
    settlePoster(frame, v.id);
    shown = v.id;
  }

  function render(data, state) {
    const st = $('#ytStatus');
    if (st) st.textContent = state;
    if (playing) return;

    vids = data.videos;
    const latest = vids[0];
    if (latest.id !== shown) show(latest);

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
            <a class="yt__it" data-v="${esc(v.id)}" href="${watch(v.id)}" target="_blank" rel="noopener">
              <img src="${still(v.id, 'mqdefault')}" alt="" loading="lazy" decoding="async">
              <span><b>${esc(v.title)}</b><span>${rel(v.published)}</span></span>
            </a>`).join('')
        : `<div style="font-size:13px;color:#888;padding:6px 2px">Only one upload so far.</div>`;
    }
  }

  /* Nothing at all to show: the snapshot file is missing and the live
     source did not answer. Fall back to the one upload named in
     data.js, still as a poster, so even this case is a real video. */
  function offline() {
    const st = $('#ytStatus'), list = $('#ytList'), now = $('#ytNow');
    const fb = (YOUTUBE.fallbackVideoId || '').trim();
    if (now) now.textContent = '';

    if (fb) {
      if (st) st.textContent = 'saved pick';
      vids = [{ id: fb, title: 'Video from the YeagX channel' }];
      show(vids[0]);
      if (list) list.innerHTML =
        `<a class="yt__sub" style="margin:0;justify-content:center" href="${YOUTUBE.url}"
            target="_blank" rel="noopener">See every upload</a>`;
      return;
    }

    if (st) st.textContent = 'offline';
    const frame = $('#ytFrame');
    if (frame) frame.innerHTML =
      `<div class="ph">Could not reach the channel right now.<br>
        <a href="${YOUTUBE.url}" target="_blank" rel="noopener">Open the channel →</a></div>`;
    if (list) list.innerHTML = '';
  }

  /* ---------- the panel is something you operate ----------
     Pressing play, on the poster or on a row, plays that upload in the
     frame that is already sitting there rather than throwing the
     visitor out to another tab.

     Every control stays a real link to YouTube, and every escape hatch
     is left open: a modified click, a middle click, a scripts-off visit
     and a page opened from disk all still go to the video. Playing in
     place is an enhancement on top of a link that already worked,
     which is the only way it is allowed to be worth doing. */
  function controls() {
    const panel = $('#yt'), frame = $('#ytFrame'), now = $('#ytNow'), list = $('#ytList');
    if (!panel || !frame) return;

    panel.addEventListener('click', (e) => {
      if (!CAN_EMBED) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const a = e.target.closest ? e.target.closest('.yt__play, .yt__it') : null;
      if (!a || !a.dataset.v) return;
      const v = vids.filter((x) => x.id === a.dataset.v)[0];
      if (!v) return;

      e.preventDefault();
      playing = true;
      shown = v.id;
      frame.innerHTML = player(v);

      if (now && v.published) now.innerHTML =
        `<span class="yt__new">PLAYING</span>
         <span>${esc(v.title)} · <span style="color:#AAA">${rel(v.published)}</span></span>`;

      if (list) list.querySelectorAll('.yt__it').forEach((r) => {
        const on = r === a;
        r.classList.toggle('on', on);
        if (on) r.setAttribute('aria-current', 'true');
        else r.removeAttribute('aria-current');
      });
    });
  }

  function run() {
    controls();

    /* the snapshot is already in memory: paint it now, no request */
    const snap = usable(window.YT_SNAPSHOT);
    if (snap) render(snap, 'saved');

    const ask = () => live(10000).then((l) => {
      if (l) {
        render(l, 'live');
        if (l.avatar && key(l.avatar) !== key(snap && snap.avatar)) avatar(l.avatar);
      } else if (!snap) {
        offline();
      }
    });

    /* Do not call out while this page is only being speculated. The
       work page prerenders play.html on hover, and scripts run normally
       in a prerendered document — without this gate, hover jitter over
       the doorway would spend function invocations on navigations that
       never happen. The snapshot needs no request, so it paints either
       way and the panel is ready the moment the page is activated. */
    if (document.prerendering) document.addEventListener('prerenderingchange', ask, { once: true });
    else ask();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
