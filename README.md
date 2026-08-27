# Portfolio — Abdulrhman Mohamed Gomaa

Personal portfolio site. Plain HTML, CSS and vanilla JavaScript — no framework, no build step,
no `npm install`. The YouTube and Clash Royale sections deliberately use their own colours and
typefaces so they read as separate worlds from the rest of the page.

**All the content lives in one file: [`js/data.js`](js/data.js).** You should almost never need to
open `index.html`.

---

# Part 1 — Things only you can do

There are four. The first one is the important one.

## 1. Turn the contact form on (10 minutes)

### What Web3Forms actually is

Your site is a set of static files. Static files cannot send email — sending email needs a server.
Web3Forms **is** that server, run by someone else, for free. Your form sends the message to them,
and they forward it to your Gmail. You do not write any backend code and you do not create an account.

The old form on your previous site pointed at a `forms.gle` share link instead of a real submit
endpoint, which is why nothing ever reached you. This one will tell you plainly whether it worked.

### Getting your key

1. Open **<https://web3forms.com>** in your browser.
2. On the front page there is a box that says *"Enter your email address"*. Type
   **abdulrhman.mohamed026@gmail.com** into it and press **Create Access Key**.
3. Check that Gmail inbox. You will get an email from Web3Forms containing an **Access Key** — a long
   string that looks roughly like `a1b2c3d4-5e6f-7890-abcd-ef1234567890`.
   *(If it is not there in a minute, check the Spam and Promotions tabs.)*
4. Copy that key.

### Putting the key in

1. Open `js/data.js` in VS Code.
2. Scroll to the **very last line** of the file. It says:

   ```js
   const WEB3FORMS_ACCESS_KEY = 'PASTE_YOUR_ACCESS_KEY_HERE';
   ```

3. Replace `PASTE_YOUR_ACCESS_KEY_HERE` with your key, **keeping the quote marks**:

   ```js
   const WEB3FORMS_ACCESS_KEY = 'a1b2c3d4-5e6f-7890-abcd-ef1234567890';
   ```

4. Save the file.

### Checking it worked

Open the site, go to the contact section, and look at the small label in the top-right of the form
box:

- it said **`not set up`** before, and the Send button was greyed out
- it should now say **`ready`** and the button should be clickable

Send yourself a test message. You should see a green **delivered** panel with a reference number like
`MSG-K3F9A2-X7Q`, and the message should arrive in your Gmail within a few seconds with the subject
`[MSG-K3F9A2-X7Q] Job or internship — Your Name`.

If it shows a red **rejected** panel instead, the key was pasted wrong — the panel prints the exact
error the server returned, so read it. `Invalid form_id/access_key format` means the key is
malformed (a character missing, or the quotes deleted).

### Optional but worth doing

Web3Forms can also send an automatic "thanks, I got your message" reply to whoever contacted you.
Log in on their site with the same email, find your form's settings, and turn on **Auto Respond**.

> **Is the key a secret?** No. It only allows sending a message *to your own inbox*, so it is safe
> sitting in your public JavaScript. That is how Web3Forms is designed to work.

---

## 2. Check the YouTube section

I rewrote how this works. Three things changed:

- **The channel picture is now fetched automatically** from your channel page, so it stays current on
  its own. `Images/yeagx_logo.jpg` is only the placeholder shown for the split second before it
  arrives (and if the fetch fails). Replacing that file is optional now, but still worth doing.
- **The proxies are raced in parallel** instead of one after another, and the timeout went from 7 to
  14 seconds. The old 7-second limit was aborting requests that would have succeeded — that is the
  most likely reason it said "Feed unreachable".
- **The recent-videos list** shows the three uploads under the latest one, with a red `NEW` badge on
  anything posted in the last week.

**Open the site on your own machine and look at the label in the top right of the YouTube panel.**
`live` means the feed loaded. I still cannot test this myself — the environment I build in blocks
every one of these proxies.

If it says `offline`, add a safety net so a visitor never sees an error box:

1. Open one of your videos. The address looks like
   `https://www.youtube.com/watch?v=`**`dQw4w9WgXcQ`** — copy the part after `v=`.
2. In `js/data.js`, find `fallbackVideoId: ''` inside the `YOUTUBE` block and paste it in:

   ```js
   fallbackVideoId: 'dQw4w9WgXcQ',
   ```

The live feed still wins whenever it works.

## 3. Update the Clash Royale numbers

In `js/data.js`, in the `CLASH` block, update the four numbers and the `updated` label together:

```js
const CLASH = {
  updated: 'August 2026',     // <- change this when you change the numbers
```

Right now it says *updated August 2025*, which makes it look like you stopped playing.

---

## 4. Two projects have no link

`StepUp` and `Rufuf POS` are listed with empty `url` fields, so they show as plain text with no
link. If those have repos, add the addresses in the `ALSO` block in `js/data.js`. If they do not,
leave them — they still read fine as a list.

---

# Part 2 — Hosting it

You already have a site at `abdulrhman-mohamed.vercel.app`, so **Vercel** is the path of least
resistance. Everything below assumes the project is in a GitHub repository.

## Step 1 — Get the code onto GitHub

If this folder is not a Git repository yet, open a terminal in the project folder and run:

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "Portfolio v2"
```

Then create an empty repository on GitHub (**github.com → New repository**, name it `portfolio`,
do **not** tick "Add a README"), and connect it — replace `yeagx` if your username differs:

```bash
git remote add origin https://github.com/yeagx/portfolio.git
```

```bash
git branch -M main
```

```bash
git push -u origin main
```

## Step 2 — Deploy on Vercel

1. Go to <https://vercel.com> and sign in with GitHub.
2. **Add New… → Project**, then **Import** your `portfolio` repository.
3. On the configuration screen:
   - **Framework Preset:** `Other`
   - **Build Command:** leave empty
   - **Output Directory:** leave empty (or `.`)
   - **Install Command:** leave empty

   There is no build step — Vercel just serves the files.
4. Click **Deploy**. About twenty seconds later you get a live URL.

**From then on, every `git push` redeploys automatically.** Your normal update loop becomes:

```bash
git add . && git commit -m "update" && git push
```

### Pointing your existing address at it

If `abdulrhman-mohamed.vercel.app` is attached to your old project, go into that old project in the
Vercel dashboard → **Settings → Domains**, remove the domain, then add it to the new project under
its own **Settings → Domains**. Alternatively just delete the old project first.

### A real domain (optional)

Buy one (Namecheap, Cloudflare, GoDaddy — roughly $10/year). In Vercel: **Settings → Domains → Add**,
type the domain, and Vercel shows you the DNS records to create at your registrar. It issues the
HTTPS certificate for you.

## Alternative — GitHub Pages

Free and fine, slightly less convenient. In your repository: **Settings → Pages → Source: Deploy from
a branch → Branch: `main`, folder: `/ (root)` → Save**. After a minute the site is at
`https://yeagx.github.io/portfolio/`.

## After you deploy: the caching gotcha

Browsers cache CSS and JS aggressively. When you change a style and it does not appear, that is why.
The stylesheet and script links in `index.html` end with `?v=5`. **Bump that number** (to `?v=6`, and
so on) whenever you change a CSS or JS file, and every visitor gets the new version immediately.

---

# Part 3 — Editing the content

Everything is in `js/data.js`:

| Block | What it controls |
|---|---|
| `PROFILE` | Name, contact details, degree, GPA, links, the title block |
| `NOW` | The Finnovate role |
| `WORK` | DocMind and the F1 warehouse, section by section |
| `ALSO` | The three one-line projects |
| `TOOLKIT` | The skills table. Add `learning: true` to mark something as still being learned |
| `TRAINING` | SIC, DEPI, ITI, IcTHub |
| `SIC` | The full 44-session agenda — module ranges, the "here now" marker and the "next session" line are all derived from it |
| `YOUTUBE` | Channel details and the fallback video |
| `CLASH` | Stats and deck |

### The syllabus updates itself

`SIC.sessions` holds every session from the official BD 802 agenda with its real date. At page load
the site works out, from today's date alone:

- which module you are in (highlighted, with the **here now** badge)
- which modules are finished
- inside the current module, which individual sessions are already behind you
- what the next session is and when

You never edit it as the course runs. Today it resolves to *module 5, Hive & ingestion*, with
*Apache Hive #1* done and *Apache Hive #2 on 30 Aug* next.

When you finish the capstone, add it to `WORK` as a third project — that is the edit that will
actually matter.

### Things deliberately left out

- **IGYM, ARIA, Portfolio v1** — removed, as you asked.
- **Tableau and Streamlit** — your old site claimed both, your CV lists neither, so I left them out
  rather than assert a skill your own CV does not. Add them back to `TOOLKIT` if they are accurate.

---

# Running it locally

```bash
python -m http.server 5174
```

Then open <http://localhost:5174>. Opening `index.html` by double-clicking mostly works, but the
YouTube feed will be blocked by browser security rules, so use the command above.

---

# File map

```
index.html          markup + inline SVG icons (no icon-font CDN)
CSS/
  base.css          tokens, rail, hero, schematic, shared pieces
  sections.css      content sections + the YouTube / Clash zones
js/
  data.js           ← everything you edit lives here
  render.js         builds the page from data.js, rail + scroll
  dag.js            routes the schematic wires
  youtube.js        RSS feed with fallbacks
  contact.js        Web3Forms delivery + receipt
archive/            your previous site, untouched
Images/  CV.pdf
```

---

Cairo, Egypt · [abdulrhman.mohamed026@gmail.com](mailto:abdulrhman.mohamed026@gmail.com) ·
[LinkedIn](https://www.linkedin.com/in/abdulrhman-mohamed-da) ·
[GitHub](https://github.com/yeagx) · [YouTube](https://www.youtube.com/@YeagX)

Clash Royale card art and trademarks belong to Supercell.
