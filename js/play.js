/* =============================================================
   play.js — the Clash Royale panel on the off-duty page.

   The YouTube panel is js/youtube.js, which owns its own feed
   race and fallback. Loads on play.html only.
   ============================================================= */
(function () {
  'use strict';

  const { $, esc } = window.SITE;

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
          <div class="cr__c${k.fav ? ' fav' : ''}">
            <span class="e">${k.elixir}</span>
            <img src="${k.img}" alt="${esc(k.name)}" loading="lazy" decoding="async">
            <b>${esc(k.name)}</b>
          </div>`).join('')}
      </div>
      <p class="cr__note">${esc(CLASH.note)}</p>`;
  }

  window.SITE.boot.push(clash);
})();
