#!/usr/bin/env node
/* =============================================================
   scripts/youtube-sync.js — refresh the saved YouTube snapshot.

   Writes data/youtube.js and saves the channel avatar over
   Images/yeagx_logo.jpg. The page renders from these first, from
   its own origin, so the panel is never empty — even with the live
   endpoint down, on a static host with no functions, or opened
   straight from disk.

   A script that sets window.YT_SNAPSHOT rather than a JSON file on
   purpose: a <script> tag loads everywhere, file:// included, where
   fetch() is refused — and it is in place before youtube.js runs,
   so the panel paints without a single request.

   Run by .github/workflows/youtube-sync.yml on a schedule, or by
   hand:   node scripts/youtube-sync.js
   (set YOUTUBE_API_KEY first to read through the official API).

   On any failure it exits non-zero and writes NOTHING, so a bad run
   can never replace a good snapshot with an empty one. Nothing in
   the file changes from run to run unless the channel did, so the
   job only commits when there is something new.
   ============================================================= */
'use strict';

const fs = require('fs');
const path = require('path');
const { getChannel, avatarKey } = require('../api/_youtube');

const ROOT = path.join(__dirname, '..');
const SNAP = path.join(ROOT, 'data', 'youtube.js');
const LOGO = path.join(ROOT, 'Images', 'yeagx_logo.jpg');
const HEAD = '/* Written by scripts/youtube-sync.js — do not edit by hand. */\nwindow.YT_SNAPSHOT = ';

/* the snapshot already on disk, or an empty one if there is none */
function previous() {
  try {
    const txt = fs.readFileSync(SNAP, 'utf8');
    return JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1));
  } catch (_) {
    return {};
  }
}

async function main() {
  const prev = previous();
  const ch = await getChannel();

  /* Only download the avatar when the picture itself changed. A new
     picture gets a new image token; the same one can come back from a
     different host or size depending on the source, and re-saving it
     would churn the file for nothing. */
  let avatarUrl = prev.avatarUrl || null;
  if (ch.avatar && avatarKey(ch.avatar) !== avatarKey(prev.avatarUrl)) {
    try {
      const r = await fetch(ch.avatar, { signal: AbortSignal.timeout(10000) });
      const type = r.headers.get('content-type') || '';
      if (!r.ok || !type.startsWith('image/')) throw new Error(`${r.status} ${type}`);
      fs.writeFileSync(LOGO, Buffer.from(await r.arrayBuffer()));
      avatarUrl = ch.avatar;
      console.log('avatar  updated');
    } catch (e) {
      console.warn('avatar  kept the old one:', e.message);
    }
  }

  /* An exact date always wins. An estimate (off "4 weeks ago", when a
     watch page could not be read) drifts every run, so it only stands
     in when nothing better is on file — otherwise every run would be a
     commit. A stored estimate is replaced the first time an exact date
     turns up, and the flag is kept so the next run knows which it has. */
  const known = new Map((prev.videos || []).map((v) => [v.id, v]));
  const videos = ch.videos.map((v) => {
    const old = known.get(v.id);
    const keep = old && !v.exact && Date.parse(old.published) > 0;
    return {
      id: v.id,
      title: v.title,
      published: keep ? old.published : v.published,
      exact: keep ? old.exact !== false : v.exact
    };
  });

  const snap = { avatarUrl, videos };
  fs.mkdirSync(path.dirname(SNAP), { recursive: true });
  fs.writeFileSync(SNAP, HEAD + JSON.stringify(snap, null, 2) + ';\n');
  console.log(`videos  ${videos.length} via ${ch.source}: ${videos.map((v) => v.id).join(', ')}`);
}

main().catch((e) => {
  console.error('youtube-sync failed, snapshot left as it was:', e.message);
  process.exit(1);
});
