/* =============================================================
   dag.js — routes the wires between the schematic nodes.
   Orthogonal routing (right angles only), like a real diagram.
   Re-routes when the grid wraps from 4 → 2 → 1 columns.
   ============================================================= */
(function () {
  'use strict';

  const box = document.getElementById('schem');
  const svg = document.getElementById('wires');
  if (!box || !svg) return;

  const NS = 'http://www.w3.org/2000/svg';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  

  function path(d) {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('class', 'wire');
    p.setAttribute('d', d);
    svg.appendChild(p);
    if (!reduced) {
      const f = document.createElementNS(NS, 'path');
      f.setAttribute('class', 'wire--flow');
      f.setAttribute('d', d);
      svg.appendChild(f);
    }
  }

  function draw() {
    const nodes = Array.from(box.querySelectorAll('.nd'));
    if (nodes.length < 2) return;

    const r = box.getBoundingClientRect();
    if (!r.width) return;

    svg.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
    svg.setAttribute('width', r.width);
    svg.setAttribute('height', r.height);
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    // the flowing wires are painted with a gradient — it has to live
    // inside this same <svg> for url(#wireGrad) to resolve
    const defs = document.createElementNS(NS, 'defs');
    const grad = document.createElementNS(NS, 'linearGradient');
    grad.setAttribute('id', 'wireGrad');
    // user space, not the path's bounding box — a vertical wire has a
    // near-zero-width box and would otherwise lose its gradient entirely
    grad.setAttribute('gradientUnits', 'userSpaceOnUse');
    grad.setAttribute('x1', '0');       grad.setAttribute('y1', '0');
    grad.setAttribute('x2', String(r.width)); grad.setAttribute('y2', '0');
    [['0%', '#E14CFF'], ['100%', '#FF8A2B']].forEach(([off, col]) => {
      const st = document.createElementNS(NS, 'stop');
      st.setAttribute('offset', off);
      st.setAttribute('stop-color', col);
      grad.appendChild(st);
    });
    defs.appendChild(grad);
    svg.appendChild(defs);

    for (let i = 0; i < nodes.length - 1; i++) {
      const A = nodes[i].getBoundingClientRect();
      const B = nodes[i + 1].getBoundingClientRect();

      const ax = A.right - r.left, ay = A.top - r.top + A.height / 2;
      const bx = B.left  - r.left, by = B.top - r.top + B.height / 2;
      const sameRow = Math.abs(A.top - B.top) < 8;
      const sameCol = Math.abs(A.left - B.left) < 8;

      if (sameRow) {
        // straight run with a step if the rows are not perfectly level
        const mid = (ax + bx) / 2;
        path(Math.abs(ay - by) < 1
          ? `M ${ax} ${ay} H ${bx}`
          : `M ${ax} ${ay} H ${mid} V ${by} H ${bx}`);

      } else {
        // Different rows — single column, or the 4-across grid has wrapped.
        // Route entirely inside the gutter between the two rows so the wire
        // never crosses a node: down out of A, across, then down into B.
        const acx = A.left - r.left + A.width / 2;
        const bcx = B.left - r.left + B.width / 2;
        const yA = A.bottom - r.top;
        const yB = B.top - r.top;
        const yMid = (yA + yB) / 2;

        path(sameCol || Math.abs(acx - bcx) < 1
          ? `M ${acx} ${yA} V ${yB}`
          : `M ${acx} ${yA} V ${yMid} H ${bcx} V ${yB}`);
      }
    }
  }

  let t;
  const redraw = () => { clearTimeout(t); t = setTimeout(draw, 60); };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', draw);
  else draw();

  window.addEventListener('load', draw);
  window.addEventListener('resize', redraw);
  window.addEventListener('orientationchange', redraw);

  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(redraw);
    ro.observe(box);
    const first = box.querySelector('.nd');
    if (first) ro.observe(first);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  [250, 900].forEach(ms => setTimeout(draw, ms));
})();
