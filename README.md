# solid-journey
A private, shared **website** for two people to keep the story of their relationship —
scrapbook photos, letters, how you met, and a running counter of time together.
One responsive site, not a native app — it works from any browser, including on
iOS and Android phones.

## Tech stack
- **React** — for the four distinct panels (Scrapbook, Letters, Story, Time), shared
  navigation, the interactive bits (tap-tap hearts, live timer), and a persistent
  floating music player.
- **Tailwind CSS** — utility-first styling, kept consistent across panels, built
  mobile-first so it's comfortable on a phone browser as well as desktop.
- **Supabase** — Postgres database + file storage for photos and songs, so entries,
  images, and music persist for real (not just in-browser).

No app-store packaging, no Capacitor, no native build — "works on mobile" here means
the website itself is responsive, the same way any well-built site adapts to a phone
screen.

## Panels
The app is organized around one main page plus four feature panels, switched by a
button/nav bar — plus one floating widget that stays visible no matter which panel
you're on.

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

### 5. Music player (floating, persistent)
- A small floating panel docked to the **bottom-right corner**, visible on top of
  every panel (Scrapbook, Letters, Story, Time, main page) — not something you
  navigate to, it just stays there.
- Controls: **play/pause**, **next**, **previous**, plus the current song's title
  showing in the widget.
- Songs are files you (the couple) upload ahead of time — this isn't a streaming
  integration, just a small curated playlist stored in Supabase Storage.
- Playback order follows the order songs were added (or a manual `sort_order` if you
  want to reorder later); next/previous just moves through that list, looping back
  to the start after the last track.
- Minimized/collapsed state on small screens so it doesn't block content — expands
  on tap.

## Data model (Supabase)
- `settings` — partner names, relationship start date, story content.
- `scrapbook_entries` — title, date, description, photo (stored in Supabase Storage).
- `letters` — date, letter content.
- `songs` — title, artist (optional), audio file (stored in Supabase Storage),
  `sort_order` for playback sequence.
- (Time panel needs no storage of its own — it's computed live from `settings.since`.)

## What's in this repo
| File | Purpose |
|---|---|
| `schema.sql` | Creates the database tables, security policies, and photo/song storage buckets. Run once. |
| `README.md` | This file. |

## Status
- [x] Requirements defined (this document)
- [ ] Supabase project created, schema drafted
- [ ] React + Tailwind project scaffolded
- [ ] Main page timeline (Scrapbook summary)
- [ ] Scrapbook panel (full CRUD + photo upload)
- [ ] Letters panel
- [ ] Story panel
- [ ] Time panel (timer, countdown, tap-tap hearts)
- [ ] Floating music player (upload songs, play/pause/next/previous)
- [ ] Responsive pass for mobile browsers (iOS/Android)

## Notes on access
There's no per-person login — anyone with the deployed link and the app's Supabase key
can read and write everything. This is intentional for a two-person shared archive, not
an oversight. Real per-person accounts would need Supabase Auth added later if ever
needed.

archive-of-us/
├── index.html              ← entry point, dito naka-link ang fonts
├── package.json            ← listahan ng dependencies (React, Tailwind, atbp)
├── vite.config.js          ← config para sa build tool
├── tailwind.config.js      ← dito nakadeclare yung colors mo (gold, ink, paper, atbp)
├── postcss.config.js
├── .env                    ← dito nakatago ang Supabase URL + key mo
├── .gitignore
│
└── src/
    ├── main.jsx             ← nagsisimula dito ang app
    ├── App.jsx               ← "traffic controller" — asan yung 5 tabs, alin ang active
    ├── index.css             ← Tailwind setup + heart animation
    ├── supabaseClient.js     ← connection papunta sa database mo
    ├── utils.js              ← date formatting, countdown calculations
    │
    ├── components/
    │   ├── Nav.jsx            ← yung 5 tabs sa itaas (Home, Scrapbook, Letters, Story, Time)
    │   ├── MemoryCard.jsx     ← yung polaroid card, ginagamit sa Home AT Scrapbook
    │   ├── MemoryModal.jsx    ← yung "Add a memory" popup form
    │   └── Onboarding.jsx     ← yung unang "ilagay pangalan niyo" popup
    │
    └── pages/
        ├── Home.jsx           ← main page (timeline lang, walang letters)
        ├── Scrapbook.jsx      ← buong scrapbook panel
        ├── Letters.jsx        ← letters panel
        ├── Story.jsx          ← "how we met" panel
        └── Time.jsx           ← timer, countdown, tap-tap hearts
