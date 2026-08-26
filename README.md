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
screen. All onboarding and identity screens are built mobile-first: large tap targets,
full-width buttons, native date pickers, and comfortable font sizes on small screens.

## First-time setup flow (onboarding wizard)

The very first time the archive is opened — the app checks whether `settings` is
completely empty (no seed/placeholder row exists; see `schema.sql`) — a 3-step wizard
runs to set everything up:

1. **"Sino ka?"** ("What's your name?") — the person setting up the archive types
   their own name.
2. **"Sino partner mo?"** ("Who's your partner?") — they type their partner's name.
3. **"Kailan monthsary?"** ("When's your monthsary?") — they pick the relationship
   start date (native date picker, mobile-friendly).

Flow: **open site → "Sino ka?" (type name) → "Sino partner mo?" (type name) →
"Kailan monthsary?" (pick date) → main page.**

On completion, this writes the first (and only) row to the `settings` table in
Supabase (`partner_one_name`, `partner_two_name`, `since`) — this is where the
"julith & nicole" names on the main page come from. This wizard only runs once,
globally, since it's writing the shared `settings` row — once that row exists, the
wizard never shows again for anyone.

## Returning-visitor identity gate ("who's opening this?")

Separate from the onboarding wizard above — this runs **per device/browser**, not
globally:

- On load, the app checks `localStorage` for a saved identity.
- If none is saved, a screen shows the two names already set up in `settings` as
  tappable options ("Are you Julith or Nicole?") — no typing, just a pick.
- Once picked, the choice is saved to `localStorage` on that device, and the app goes
  straight to the main page from then on — the gate won't show again on that
  browser/device.
- The picked identity is used only for a personalized greeting on the main page
  (e.g. "Welcome back, Julith 💛") — it does **not** restrict or change any content;
  both partners see the same data.

## Panels

The app is organized around one main page plus four feature panels, switched by a
button/nav bar.

### Main page
- Shows a **vertical timeline** of the Scrapbook entries only, summarized (thumbnail +
  title + date). This is the "at a glance" view of the relationship.
- Does **not** show Letters — those stay private to their own panel.
- Fully scrollable, no pagination.
- Shows the personalized greeting from the identity gate above.

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

## Design

- Dark, slightly purple-tinted background (ink).
- Gold/amber accent for primary buttons and highlights.
- Cream/paper-colored cards for scrapbook entries and letters, polaroid/paper-note
  look with a small "tape" accent.
- Muted rose accent for the tap-tap button on the Time panel.
- Serif (Playfair Display) for names/headings, clean sans-serif (Inter) for body/UI.

## Data model (Supabase)

- `settings` — partner names, relationship start date, story content. Starts
  completely empty; the onboarding wizard writes the single row on first run, and it's
  editable later.
- `memories` — title, date, kind, note, photo (stored in Supabase Storage). Powers both
  the Scrapbook panel and the summarized timeline on the main page.
- `letters` — title, date, letter content.
- (Time panel needs no storage of its own — it's computed live from `settings.since`.)
- (The identity gate needs no Supabase storage — it only reads the two names already
  in `settings`, and saves the visitor's pick locally via `localStorage`.)

## Project structure

```
archive-of-us/
├── index.html              — entry point, fonts linked here
├── package.json             — dependencies (React, Tailwind, Supabase client)
├── vite.config.js           — build tool config
├── tailwind.config.js       — custom colors (ink, gold, paper, rose) and fonts
├── postcss.config.js
├── schema.sql                — Supabase tables, RLS policies, storage bucket
├── .env                      — Supabase URL + key (not committed to git)
├── .env.example
├── .gitignore
│
└── src/
    ├── main.jsx              — app entry point
    ├── App.jsx                — controls active panel + which gate/wizard to show
    ├── index.css              — Tailwind setup + heart-tap animation
    ├── supabaseClient.js      — connection to the database
    ├── utils.js               — date formatting, countdown/timer math, localStorage helpers
    │
    ├── components/
    │   ├── Nav.jsx             — the 5 tabs (Home, Scrapbook, Letters, Story, Time)
    │   ├── MemoryCard.jsx      — the polaroid-style card, used in Home + Scrapbook
    │   ├── MemoryModal.jsx     — the "Add a memory" popup form
    │   └── Onboarding.jsx      — first-time 3-step setup wizard AND the
    │                              returning-visitor "who's opening this?" gate
    │
    └── pages/
        ├── Home.jsx            — main page (summarized timeline + greeting)
        ├── Scrapbook.jsx       — full scrapbook panel
        ├── Letters.jsx         — letters panel
        ├── Story.jsx           — "how we met" panel
        └── Time.jsx            — timer, countdown, tap-tap hearts
```

## Setup

1. Run `schema.sql` in Supabase (SQL Editor → New query → paste → Run).
2. `npm install`
3. Copy `.env.example` to `.env` and fill in your Supabase project URL + publishable
   key.
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
- [x] Supabase project created, full schema (settings + story, memories, letters, storage)
- [ ] React + Tailwind project scaffolded
- [ ] Onboarding wizard (3-step first-time setup)
- [ ] Identity gate ("who's opening this?" + localStorage)
- [ ] Main page timeline (Scrapbook summary + greeting)
- [ ] Scrapbook panel (full CRUD + photo upload)
- [ ] Letters panel
- [ ] Story panel
- [ ] Time panel (timer, countdown, tap-tap hearts)
- [ ] Responsive pass for mobile browsers (iOS/Android)

## Notes on access

There's no per-person login — anyone with the deployed link and the app's Supabase key
can read and write everything. This is intentional for a two-person shared archive, not
an oversight. Real per-person accounts would need Supabase Auth added later if ever
needed. The identity gate above is **not** a security feature — it's purely a local,
per-device convenience for showing the right name back at each partner.