/* =============================================================
   GET /api/youtube — the channel's latest uploads and avatar.

   A Vercel function. The CDN holds each answer for 30 minutes and
   keeps serving the last good one for a day while it refreshes in
   the background, so most visits never reach YouTube at all and a
   bad minute on YouTube's side is not a bad minute on this site.
   A failure is never cached.
   ============================================================= */
'use strict';

const { getChannel } = require('./_youtube');

module.exports = async (req, res) => {
  try {
    const data = await getChannel();
    data.videos = data.videos.map(({ exact, ...v }) => v);   // internal to the snapshot job
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400');
    res.status(200).json(data);
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ error: e.message });
  }
};
