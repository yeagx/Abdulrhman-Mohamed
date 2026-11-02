/* =============================================================
   api/_youtube.js — the channel, read server-side.

   Shared by the live endpoint (api/youtube.js) and the snapshot
   job (scripts/youtube-sync.js). The underscore keeps Vercel from
   serving this file as a route of its own.

   Why it is shaped like this:
   • It runs on a server, so there is no CORS and no public proxy.
     Those proxies were half the old failure; the other half was
     YouTube itself — the RSS feed (feeds/videos.xml) has been
     answering 404 for every channel, Google's own included.
   • Three sources, tried in order, each validated before it wins:
       1. the YouTube Data API v3, when YOUTUBE_API_KEY is set —
          official, stable, and the one to rely on;
       2. the channel's own /videos page, which carries the uploads
          and the avatar in its embedded ytInitialData;
       3. the RSS feed, in case it ever comes back.
   • The channel is fixed here, not read from the request, so the
     endpoint can never be turned into an open proxy. It must match
     YOUTUBE in js/data.js.
   ============================================================= */
'use strict';

const CHANNEL_ID = 'UCyrZcIzWhSUJUxpa5mzYF9w';
/* UULF, not UU: the long-form uploads only. UU carries Shorts and past
   streams too, which the channel's Videos tab — the page source — does
   not, and the two sources must agree or the panel would swap lists. */
const UPLOADS_ID = 'UULF' + CHANNEL_ID.slice(2);
const COUNT = 4;                                  // the panel shows one + three
const TIMEOUT = 8000;

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/130.0 Safari/537.36';
/* English, and past the EU consent wall — without the cookie a request
   from a European region gets the consent page instead of the channel. */
const PAGE_HEADERS = {
  'user-agent': UA,
  'accept-language': 'en-US,en;q=0.9',
  cookie: 'CONSENT=YES+cb; SOCS=CAI; PREF=hl=en&gl=US'
};
/* English labels ("4 weeks ago") whatever region the request leaves from */
const LOCALE = 'hl=en&gl=US';

const VIDEO_ID = /^[\w-]{11}$/;

async function get(url, opts) {
  const r = await fetch(url, { ...opts, signal: AbortSignal.timeout(TIMEOUT) });
  if (!r.ok) throw new Error(`${r.status} from ${new URL(url).host}`);
  return r;
}

/* The one shape every source has to produce. Anything that does not
   fit is dropped rather than trusted. */
function clean(videos, avatar, source) {
  const seen = new Set();
  const out = (videos || []).filter((v) => {
    if (!v || !VIDEO_ID.test(v.id) || seen.has(v.id) || !v.title) return false;
    /* new Date(null) is a valid 1970, so a missing date has to be
       refused by hand rather than left to isNaN */
    const t = v.published ? Date.parse(v.published) : NaN;
    if (!(t > 0)) return false;
    seen.add(v.id);
    return true;
  }).slice(0, COUNT).map((v) => ({
    id: v.id,
    title: String(v.title).trim(),
    published: new Date(v.published).toISOString(),
    /* whether that date is the real one or an estimate off "N weeks
       ago"; the snapshot job uses it, the page never sees it */
    exact: v.exact !== false
  }));
  if (!out.length) throw new Error(`${source}: no usable videos`);
  return {
    source,
    avatar: /^https:\/\//.test(avatar || '') ? avatar : null,
    videos: out
  };
}

/* ---------- 1. the Data API ---------- */
async function fromApi(key) {
  const q = (path, params) =>
    get(`https://www.googleapis.com/youtube/v3/${path}?${new URLSearchParams({ ...params, key })}`)
      .then((r) => r.json());

  const [list, chan] = await Promise.all([
    q('playlistItems', { part: 'snippet,contentDetails', playlistId: UPLOADS_ID, maxResults: '10' }),
    q('channels', { part: 'snippet', id: CHANNEL_ID }).catch(() => null)
  ]);

  /* private and deleted uploads stay in the playlist with no publish date */
  const videos = (list.items || []).map((it) => ({
    id: it.contentDetails && it.contentDetails.videoId,
    title: it.snippet && it.snippet.title,
    published: it.contentDetails && it.contentDetails.videoPublishedAt
  })).filter((v) => v.published);

  const th = chan && chan.items && chan.items[0] && chan.items[0].snippet.thumbnails;
  const avatar = th && ((th.high || th.medium || th.default) || {}).url;
  return clean(videos, avatar, 'api');
}

/* ---------- 2. the channel page ---------- */
const AGO = { second: 1, minute: 60, hour: 3600, day: 86400, week: 604800, month: 2592000, year: 31536000 };

/* "4 weeks ago" → an approximate date, used only when the exact one
   cannot be read off the watch page */
function fromAgo(label) {
  const m = /(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/i.exec(label || '');
  return m ? new Date(Date.now() - m[1] * AGO[m[2].toLowerCase()] * 1000).toISOString() : null;
}

async function exactDate(id) {
  try {
    const html = await (await get(`https://www.youtube.com/watch?v=${id}&${LOCALE}`, { headers: PAGE_HEADERS })).text();
    const m = /"publishDate":"([^"]+)"/.exec(html) || /itemprop="datePublished" content="([^"]+)"/.exec(html);
    return m && !isNaN(new Date(m[1])) ? m[1] : null;
  } catch (_) {
    return null;
  }
}

/* the uploads grid and the avatar, as the channel page embeds them */
async function readPage() {
  const html = await (await get(`https://www.youtube.com/channel/${CHANNEL_ID}/videos?${LOCALE}`, { headers: PAGE_HEADERS })).text();
  const m = /var ytInitialData = (\{.*?\});<\/script>/s.exec(html);
  if (!m) throw new Error('page: no ytInitialData (consent or bot wall?)');
  const data = JSON.parse(m[1]);

  /* YouTube has shipped both renderers for the same grid; read either */
  const found = [];
  (function walk(o) {
    if (!o || typeof o !== 'object') return;
    if (o.lockupViewModel && o.lockupViewModel.contentType === 'LOCKUP_CONTENT_TYPE_VIDEO') {
      const l = o.lockupViewModel, md = l.metadata && l.metadata.lockupMetadataViewModel;
      const ago = JSON.stringify(md || {}).match(/"accessibilityLabel":"([^"]*ago)"/);
      found.push({ id: l.contentId, title: md && md.title && md.title.content, ago: ago && ago[1] });
      return;
    }
    if (o.videoRenderer) {
      const v = o.videoRenderer;
      found.push({
        id: v.videoId,
        title: v.title && ((v.title.runs || [])[0] || {}).text,
        ago: v.publishedTimeText && v.publishedTimeText.simpleText
      });
      return;
    }
    for (const k in o) walk(o[k]);
  })(data);

  const meta = data.metadata && data.metadata.channelMetadataRenderer;
  const thumbs = meta && meta.avatar && meta.avatar.thumbnails;
  const avatar = (thumbs && thumbs.length && thumbs[thumbs.length - 1].url) ||
    ((/<meta property="og:image" content="([^"]+)"/.exec(html) || [])[1]);

  return { found: found.filter((v) => VIDEO_ID.test(v.id || '')), avatar };
}

async function fromPage() {
  const { found, avatar } = await readPage();
  const top = found.slice(0, COUNT);
  const dates = await Promise.all(top.map((v) => exactDate(v.id)));
  const videos = top.map((v, i) => ({
    id: v.id, title: v.title, published: dates[i] || fromAgo(v.ago), exact: !!dates[i]
  }));
  return clean(videos, avatar, 'page');
}

/* ---------- 3. the feed ---------- */
const unxml = (s) => String(s)
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

async function fromFeed() {
  const xml = await (await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`)).text();
  const pick = (block, tag) => { const m = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`).exec(block); return m ? unxml(m[1]) : ''; };
  const videos = (xml.match(/<entry>[\s\S]*?<\/entry>/g) || []).map((e) => ({
    id: pick(e, 'yt:videoId'), title: pick(e, 'title'), published: pick(e, 'published')
  }));
  return clean(videos, null, 'feed');
}

/* First source that produces real videos wins. If the winner has no
   avatar (the feed never does), borrow one from the page. */
async function getChannel() {
  const key = process.env.YOUTUBE_API_KEY;
  const sources = [key && (() => fromApi(key)), fromPage, fromFeed].filter(Boolean);
  const errors = [];

  for (const src of sources) {
    try {
      const out = await src();
      if (!out.avatar && src !== fromPage) {
        try { out.avatar = (await readPage()).avatar || null; } catch (_) { /* keep null */ }
      }
      return out;
    } catch (e) {
      errors.push(e.message);
    }
  }
  throw new Error('every source failed — ' + errors.join(' · '));
}

/* The same picture is served from different hosts at different sizes
   (yt3.ggpht.com …=s800 from the API, yt3.googleusercontent.com …=s900
   from the page). Compare on the image's own token, not the URL. */
const avatarKey = (url) => (url ? String(url).replace(/^https?:\/\/[^/]+\//, '').split('=')[0] : '');

module.exports = { getChannel, avatarKey, CHANNEL_ID };
