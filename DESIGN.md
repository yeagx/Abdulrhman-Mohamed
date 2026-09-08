# Design

The visual world of abdulrhman-mohamed's portfolio, written from the built code.

Direction: **neo-brutalism, plant-floor rendition**. Pinned by the brief, so no concept roll was
run. It replaces the previous "departure board" system wholesale — but keeps the status board that
system was built around, because a split-flap board is a physical industrial object and this world
is made of physical objects.

## The idea

Two rooms, one construction method.

The work page is a **plant floor**: panels bolted to concrete, machine-blue fields owning whole
regions, safety-yellow legends, and exactly one job running right now. A data pipeline moves
material through stages, reports throughput, and has one thing live — which is what a plant floor
is. It refuses the card-grid developer portfolio, and it refuses the yellow-on-white neo-brutalism
that every generator ships for this brief.

The off-duty page is the **arcade**: the same keyline weight, the same hard offset, the same plate
geometry and spacing rhythm, with the material inverted to ink black, broadcast red and arena gold.

The visitor is never disoriented, because the building method never changes. Only the material does.

## Two documents

| | `index.html` | `play.html` |
|---|---|---|
| Room | the plant | the arcade |
| Contains | hero, about, now + before-this, work in three racks, toolkit, training, the doorway, contact | the YouTube channel, the Clash Royale deck |
| Ground | concrete `#E6E3DA` | ink `#0E0E0E` |
| Stylesheets | `core.css` + `work.css` + `transition.css` | `core.css` + `play.css` + `transition.css` |
| Scripts | `data` → `core` → `work` → `contact` | `data` → `core` → `play` → `youtube` |

A recruiter reading a CV never scrolls through a Clash Royale deck to reach the contact form, and
the gaming content does not have to whisper to earn its place.

## Color

Committed: machine blue carries whole regions rather than accenting a neutral. The ground is light
because the physical scene is a lit plant floor — a control panel reads against concrete, not
against night.

| Token | Value | Role |
|---|---|---|
| `--ground` | `#E6E3DA` | concrete; the default page surface |
| `--ink` | `#111110` | keylines, offsets, prose, the hard black |
| `--paper` | `#F6F5F1` | a lifted plate face |
| `--field` | `#1B3AC9` | machine blue; panels own the surface |
| `--field-2` | `#12279B` | pressed / darker blue |
| `--signal` | `#FFD400` | safety yellow; legends, numerals, highlighted prose |
| `--live` | `#FF4A00` | **reserved**: the live job and the primary action |
| `--faint` | `#5E5C55` | secondary prose |
| `--fault` | `#C40018` | a stopped job: validation and delivery failure |
| `--ok` | `#1B3AC9` | a good result |
| `--on-field` / `--on-field-2` | `#F6F5F1` / `#BFC9F2` | type on a blue field |

Measured on concrete: prose 17.4:1, secondary 5.3:1, `--fault` 4.9:1, `--ok` 4.8:1. Paper on blue
7.8:1, yellow on blue 6.0:1, `--on-field-2` on blue 5.1:1.

`--live` is a discipline, not a palette entry. Orange fails contrast as type on both grounds, so it
only ever appears as a **field with near-black type on it** — the boarding row, the primary button,
the live module, the current-page rail entry. If it appears anywhere else, that is a bug.

### The arcade inversion

`play.css` overrides tokens only; it never touches structure. Values come from an `--arc-*` block in
`core.css`, so the doorway that quotes the arcade inside the plant and the room itself cannot drift.

| Token | becomes |
|---|---|
| `--ground` | `#0E0E0E` |
| `--ink` | `#F6F5F1` — keylines and offsets go white |
| `--paper` | `#1C1C1C` |
| `--field` | `#FF2D16` broadcast red |
| `--signal` | `#FFC12B` arena gold |
| `--on-field` | `#0E0E0E` — near-black on red measures 5.2:1, white only 3.7:1 |

Each panel then carries its own `--accent` (`.zone--yt` red, `.zone--cr` gold) so the two read as
siblings rather than as two visual systems.

### Chrome does not invert

The rail, the mobile sheet, the skip link, the footer and the back-to-top read from a separate
`--chrome-*` block and look identical in both rooms. The corridor is the same; the rooms are not.
This is what keeps a visitor oriented across the transition, and it makes the rail a single shared
element the transition can hold perfectly still. `play.css` overrides exactly one chrome token,
`--chrome-acc`, so the corridor nods to the room it opens onto.

## Construction

- **The plate.** Every surface is `border: 3px solid` + `box-shadow: 6px 6px 0`, zero radius, no
  blur. `--rule` and `--drop` are the only two construction dimensions.
- **The press.** Interactive plates translate `+3px, +3px` and drop to a `3px` offset on `:active` —
  the plate is pushed into the wall. That is the entire feedback vocabulary; nothing fades.
- **Rank by inversion.** The most important row prints as a colored field with near-black type
  rather than getting bigger.
- **Whole slats.** The board snaps to `--course: 54px`.
- **Racks, not one undifferentiated list.** The Work section is three labelled groups — data
  engineering, the graduation project, smaller builds — each introduced by a `.grp` bar: an ink
  label bolted flat to the wall, no offset, because the plates under it carry the depth and two
  stacked shadows read as clutter. The bar names a *set*, which is information architecture, not an
  eyebrow over a heading. The separation is the point: the graduation project is a full-stack AI
  product, and grouping it apart is what lets the data engineering work be read on its own terms.
- **The portrait is cropped on purpose, and only where there is room.** At two columns it is a 4:5
  plate with `object-position: 50% 18%`, so the frame keeps the head rather than the pavement. Once
  the layout goes single-column the crop is dropped entirely (`aspect-ratio: auto`) and the whole
  photograph shows — a wide slot cut out of a portrait shot is worse than a taller image.
- **Spacing scale**, 6 / 12 / 20 / 32 / 52 / 84px. More space above a heading than below it.
- **No gradients, no glass, no glow.** One striped surface exists on the whole site: the hazard tape
  along the top of the doorway, because a threshold is exactly what it marks.

## Type

Two faces.

- **Big Shoulders Display** (variable 100–900) for display: the name, every `h2`, board
  destinations, module numerals, metric figures. An industrial condensed face out of a signage
  tradition; it holds at plate scale and stays condensed enough to set a long name on one line.
- **Archivo** (variable) for everything read as language, worked across its `wdth`/`wght` axes.

No monospace anywhere. The tabular character comes from `font-variant-numeric: tabular-nums`, which
is what a real board uses.

| Role | Setting |
|---|---|
| Name | Big Shoulders 800, `clamp(56px, 10.5vw, 118px)`, tracking `-.022em` |
| `h2` | Big Shoulders 800, `clamp(38px, 6vw, 68px)`, uppercase |
| Legends, status, labels | Archivo `wdth 80–82, wght 700–800`, 10–11px, `letter-spacing .09–.14em`, uppercase |
| Prose | Archivo `wdth 100, wght 400`, 17px/1.62, measure capped 66ch |
| Highlighted prose | yellow spread with `box-shadow`, never padding — padding pushed a visible gap between the phrase and the punctuation after it |

## Motion

Two authored moments, ranked. Everything else snaps with `steps()` timing, which suits plate
material: a bolted panel does not glide.

**1 — The plate (focal).** Moving between the two rooms is a cross-document View Transition. One
material carries it: `clip-path` on the root snapshot. Going deeper, the new room opens from a
horizontal band like an aperture and fills the frame; coming back, the plant floor rises into place.
The outgoing page is held perfectly still and the incoming one is clipped in over it. 420ms,
`cubic-bezier(.22, 1, .36, 1)` — pointer events are blocked for the whole transition, so anything
longer reads as a hang.

**Why the root and not a shared element.** A named `door` on both sides would morph the doorway's
rectangle into the room literally, and that was the first design. It was dropped: making it read
correctly requires the `door` group to paint above the outgoing root snapshot but below the incoming
one, and cross-group `z-index` on `::view-transition-group()` is the part of this API where engines
diverge most. The aperture needs no cross-group ordering at all — one property, one group, the same
result in every engine that supports the feature. **No element on either page carries a
`view-transition-name` of `door`.** If a future edit adds one, it must exist on both pages, and
nothing else may share the name: two elements with one name in the old state aborts the entire
transition, silently, into a plain navigation.

**2 — The arrival.** The board's status column steps through glyphs and settles, one slat at a time
(`work.js` → `flap()`). Gated to a cold arrival at the top of the page: returning from the arcade
lands the visitor at the doorway, where the board is off screen, and running it there would spend
the moment on nobody.

### The shell's own motion

Not a third authored moment — the same material as the page transition, one floor down. Anything
that **opens** on this site opens on a `clip-path`, at every scale:

| What | How |
|---|---|
| The page transition | `clip-path` on the root snapshot, 420ms |
| The rail opening | `clip-path` from the collapsed edge, 260ms, with the labels staggered 30–170ms behind it |
| The mobile sheet dropping | `clip-path` from the top, 240ms |

The rail is **always** its open width and clipped down to `--edge`; hovering animates the clip.
Animating `width` would relayout the rail on every frame, and it would make `.page`'s offset
dependent on rail state instead of a static token. Clipped-away area is not hit-testable, so the
collapsed strip stays the only hover target and the open state cannot be entered by accident.

Two smaller state motions carry the same idea at component scale: a rail link's punched square
rotates 45° like a bolt being turned, and the mobile burger's three bars fold into a cross. Both are
transforms, both under 200ms.

### How the transition is wired

- The opt-in is **inline in each page's `<head>`**, not in `transition.css`: an external sheet is
  discovered behind the cross-origin font request, and the transition has a hard ~4s budget to first
  render.
- **Direction needs no JavaScript.** All pseudo-element styling is taken from the document you
  navigate *to*, and there are exactly two pages, so the destination alone decides the direction.
  Each page declares its own type — `index.html` `to-work`, `play.html` `to-play` — and
  `transition.css` branches on `:active-view-transition-type()`. No types plumbing, no `pageswap`,
  no `pagereveal`.
- `.rail` and `.up` are `position: fixed`. Without their own `view-transition-name` they are captured
  inside the root snapshot and dragged by its clip-path. Named, they are lifted out — and because
  chrome is identical in both rooms, the correct animation for them is none at all.
- The rail's hover width is pinned during a transition. The cursor is on a rail link at the moment
  you click one, so the outgoing snapshot would otherwise catch it expanded at 236px and morph it
  down to 56px.
- The back-link's `#personal` fragment is **load-bearing**. Without it the work page arrives scrolled
  to the top and the visitor has to hunt for where they were — seven sections down. With it, the
  browser scrolls to the doorway before first render, so the aperture opens onto the right place and
  the return is symmetrical. It is also the precondition for ever adding the shared-element morph.
- The board's own "Away from work" row links to `play.html` and is a second, equally valid route to
  the arcade. It carries no transition name, and neither does the doorway (see above).
- Both pages prerender the other on hover via Speculation Rules, matched by **selector** rather than
  path so it holds on a GitHub Pages project subpath as well as at a domain root. `youtube.js` waits
  for `prerenderingchange` before racing its proxies, so hover jitter over the doorway cannot burn
  free-tier proxy quota on navigations that never happen.

### Reduced motion and degradation

The opt-in is nested inside `@media (prefers-reduced-motion: no-preference)`, so a visitor who asked
for less motion gets a plain instant navigation. That is the right degradation for a full-viewport
wipe, the motion class most associated with vestibular discomfort. A second layer in
`transition.css` neutralises the pseudos in case a future edit opts in unconditionally — note that
`core.css`'s `*` reduced-motion block does **not** reach them, because `*` matches elements and
these are not elements.

Browsers without cross-document view transitions perform a plain navigation. No error, no console
warning, nothing to fall back to.

## States

A failure is a job that stopped mid-step, and it reports what actually happened and what to do next
— never a fake success. The contact receipt names the server status, keeps the sender's text, and
hands them a mailto and a WhatsApp link that still carry the message.

- **Live** — `--live` field, near-black type
- **Done / arrived** — `--signal` type on the ordinary ground
- **Scheduled** — `--faint` type
- **Fault** — `--fault` field with `--fault-in` type, recovery in the body

State colours never live in JavaScript. `contact.js` toggles `.is-ok` / `.is-bad`, which resolve
through tokens — the previous build hard-coded `var(--cy)` and `var(--err)` into JS and both silently
died when the stylesheet that defined them was deleted.

## Accessibility

- The rail markup is **static in both documents**, so the site navigates with JavaScript off and the
  current-page state is correct at first paint. `nav()` only decorates it. The previous build built
  the rail from JS, which left the page with no navigation at all when scripts failed.
- `aria-current="page"` for the whole-document match, `aria-current="true"` for the in-page section
  match. The scroll spy is keyed on `data-id` / `data-page`, not on link index — an index-based spy
  pins the highlight to the first link on a page whose sections it does not have.
- A skip link is the first focusable element on both pages, parked at `top: -200px` rather than
  transformed: `translateY(-200%)` only clears the element's own height, which on the mobile top bar
  left it partly visible.
- `:focus-visible` is a 3px `--live` outline with offset. Selection, caret and scrollbars are themed
  from the palette on both pages.

## Responsive

Narrow screens drop columns; the type holds.

| Width | What changes |
|---|---|
| ≤1080px | gutters tighten to 32px |
| ≤1020px | training and contact stack; the timetable stops being sticky; the two arcade panels stack |
| ≤940px | hero stacks; the portrait drops its crop and shows the whole frame, capped at 460px |
| ≤900px | the rail lies down into a 56px top bar with a burger and a sheet; its clip is released; the hero's top padding tightens |
| ≤860px | the board drops its Detail column; project stages, toolkit and the doorway go single-column; the project meta chip becomes a full-width line |
| ≤620px | gutters 20px; the offset drops to 5px; form pairs, project headers and the small-builds rows stack |
| ≤520px | the board drops its header and each row becomes a stacked slat |
| ≤440px | the Clash deck goes 4→2 columns |

## Operating notes

The README is deliberately a single line, so the handful of facts that break things silently when
forgotten live here instead.

**Caching.** There is no `?v=` cache-busting anywhere any more. `vercel.json` sets
`Cache-Control: public, max-age=0, must-revalidate` on `/(CSS|js)/(.*)` and on `*.html`, so editing
a file and pushing is enough. It went from 4 tags in 1 file to ~14 across 2, and a half-finished
bump would have served one room with the other's palette. On a host without that config, a hard
refresh is how you see your own changes.

`cleanUrls` is deliberately **off**. It would 308-redirect `/play.html` to `/play`, adding a round
trip inside the page transition, and `python -m http.server` 404s on `/play` — a dev/prod mismatch
that is not worth URL-shape purity.

**The domain appears in five places.** `canonical`, `og:url` and `og:image` in both documents, plus
`sitemap.xml` and `robots.txt`. It is currently `https://abdulrhman-mohamed.vercel.app`. Relative
`og:image` is not reliably resolved by crawlers, which is why these are absolute and why moving host
is a five-file edit.

**Two runtime dependencies, both with a real fallback.** The contact form posts to Web3Forms with
the access key at the foot of `js/data.js`; the key is safe in public JavaScript because it only
permits sending to the owner's own inbox. The YouTube panel races four public CORS proxies against
the channel RSS feed and falls back to `YOUTUBE.fallbackVideoId` when none answer, so the panel
never shows an error box.

**Running it.** `python -m http.server 5174`. No build step, no `npm install`, no bundler.

### Claims are checked against the repos they link to

Every project on the page links to a public repo, which means a visitor is one click from verifying
any claim. Three lines were corrected when the links went in, because the repos contradicted them:
`red.`'s "secure checkout and inventory control" (no payment gateway, no inventory admin exists),
`Rufuf`'s "built 95% solo" (its own credits name three people with distinct roles), and DocMind's
"built the entire frontend" (the repo lists three people on frontend).

Team size and role are stated where they are true. A named role on a four-person build reads as more
credible than an implied solo one, and it is the version that survives a reader clicking through.

## Rules a future edit must not break

1. `--live` stays reserved, and only ever as a field with near-black type on it — never as type.
2. Two faces. Display needs come out of Big Shoulders; language needs come out of Archivo.
3. The plate is the only container: 3px keyline, 6px hard offset, zero radius, no blur. No nested
   plates.
4. Chrome does not invert. New shell parts read `--chrome-*`, not `--ink` / `--paper`.
5. No eyebrow or kicker above a heading.
6. Numbers on the page are real or they do not appear. Team projects say so, and say which part was
   his — the rack label and the "My part" block exist so that credit is never implied by omission.
7. Two authored moments, ranked, plus the shell's own reveals. New *authored* animation replaces one
   of the two; it does not join them. Anything that opens, opens on a `clip-path` — never on `width`,
   `height`, or padding.
8. State colour lives in CSS. JavaScript toggles classes, never colours.
9. The arcade is a token inversion in `play.css`. If it starts overriding structure, the two rooms
   have stopped sharing a grammar.
10. The back-link keeps its `#personal` fragment.
11. The transition stays pure CSS. It needs no JavaScript today, and adding any is a regression:
    scripts do not run before first render without a parser-blocking `<head>` script, which is what
    the JS-off guarantee exists to avoid.
