# the archive of us

A private, shared **website** for two people to keep the story of their relationship —
scrapbook photos, letters, how you met, and a running counter of time together.
One responsive site, not a native app — it works from any browser, including on
iOS and Android phones.

## Tech stack

- **React** — for the four distinct panels (Scrapbook, Letters, Story, Time), shared
  navigation, and the interactive bits (tap-tap hearts, live timer).
- **Tailwind CSS** — utility-first styling, kept consistent across panels, built
  mobile-first so it's comfortable on a phone browser as well as desktop.
- **Supabase** — Postgres database + file storage for photos, so entries and images
  persist for real (not just in-browser).

No app-store packaging, no Capacitor, no native build — "works on mobile" here means
the website itself is responsive, the same way any well-built site adapts to a phone
screen.

## Panels

The app is organized around one main page plus four feature panels, switched by a
button/nav bar.

### Main page
- Shows a **vertical timeline** of the Scrapbook entries only, summarized (thumbnail +
  title + date). This is the "at a glance" view of the relationship.
- Does **not** show Letters — those stay private to their own panel.
- Fully scrollable, no pagination.

### 1. Scrapbook
- Add an entry with: **photo, date, title, description** — formatted like a short
  letter/note attached to a picture.
- This is the source of the summarized entries shown on the main page timeline.

### 2. Letters
- A separate space containing **letters and their dates** only (no required photo).
- Kept out of the main timeline — this panel is its own quiet corner.

### 3. Story (how we met)
- A single scrollable narrative panel: the story of how you met and what things were
  like before you got together.
- Static/editable content, not a list of entries — one continuous story.

### 4. Time
- **Together timer**: live count of how long you've been together (days/hours/etc).
- **Countdown**: time and date remaining until the next anniversary.
- **Tap-tap button**: on tap, fills the panel's background with floating hearts as a
  small interactive moment.

## Data model (Supabase)

- `settings` — partner names, relationship start date, story content.
- `memories` — title, date, kind, note, photo (stored in Supabase Storage). Powers both
  the Scrapbook panel and the summarized timeline on the main page.
- `letters` — title, date, letter content.
- (Time panel needs no storage of its own — it's computed live from `settings.since`.)

## Project structure

```
archive-of-us/
├── index.html              — entry point, fonts linked here
├── package.json            — dependencies (React, Tailwind, Supabase client)
├── vite.config.js          — build tool config
├── tailwind.config.js      — custom colors (gold, ink, paper, etc.) and fonts
├── postcss.config.js
├── .env                    — Supabase URL + key (not committed to git)
├── .gitignore
│
└── src/
    ├── main.jsx             — app entry point
    ├── App.jsx               — controls which panel/tab is active
    ├── index.css             — Tailwind setup + heart-tap animation
    ├── supabaseClient.js     — connection to the database
    ├── utils.js              — date formatting, countdown/timer math
    │
    ├── components/
    │   ├── Nav.jsx            — the 5 tabs (Home, Scrapbook, Letters, Story, Time)
    │   ├── MemoryCard.jsx     — the polaroid-style card, used in Home + Scrapbook
    │   ├── MemoryModal.jsx    — the "Add a memory" popup form
    │   └── Onboarding.jsx     — first-time "enter your names" popup
    │
    └── pages/
        ├── Home.jsx           — main page (summarized timeline only, no letters)
        ├── Scrapbook.jsx      — full scrapbook panel
        ├── Letters.jsx        — letters panel
        ├── Story.jsx          — "how we met" panel
        └── Time.jsx           — timer, countdown, tap-tap hearts
```

## Setup

1. Run `schema.sql` in Supabase (SQL Editor → New query → paste → Run).
2. `npm install`
3. Copy `.env.example` to `.env` and fill in your Supabase project URL + publishable key
   (already provided if this repo was set up together with Claude).
4. `npm run dev` — opens the site locally to preview.
5. `npm run build` when ready to deploy (e.g. to Vercel or Netlify).

## What's in this repo

| File | Purpose |
|---|---|
| `schema.sql` | Creates the database tables, security policies, and photo storage bucket. Safe to re-run. |
| `README.md` | This file. |
| `src/` | The React app itself — see Project structure above. |

## Status

- [x] Requirements defined (this document)
- [ ] Supabase project created, full schema (settings + story, memories, letters, storage)
- [ ] React + Tailwind project scaffolded
- [ ] Main page timeline (Scrapbook summary)
- [ ] Scrapbook panel (full CRUD + photo upload)
- [ ] Letters panel
- [ ] Story panel
- [ ] Time panel (timer, countdown, tap-tap hearts)
- [ ] Responsive pass for mobile browsers (iOS/Android)

## Notes on access

There's no per-person login — anyone with the deployed link and the app's Supabase key
can read and write everything. This is intentional for a two-person shared archive, not
an oversight. Real per-person accounts would need Supabase Auth added later if ever
needed.
