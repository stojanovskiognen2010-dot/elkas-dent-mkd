# Elkas Dent MKD

Website for **Елкас Дент / Elkas Dent**, a private dental practice in Bitola, North Macedonia.
Static HTML + CSS + vanilla JS. No build step, no dependencies, no framework.

Built for one visitor in particular: an older patient booking on a phone. Everything is
oversized on purpose — 19px body text, 56px minimum tap targets, a booking flow with one
question per screen and a **Назад** button on every one of them.

## Run it

```
preview_start { "name": "elkas" }     →  http://localhost:5270
```

The entry lives in `C:\Users\user\Desktop\.claude\launch.json` and uses the shared
`static-serve.mjs`. Opening `index.html` as a `file://` URL also works, except the Google
Maps iframe.

## Layout

```
index.html              the whole page
assets/css/site.css     design tokens + all styles
assets/js/site.js       i18n, open/closed status, booking flow
assets/img/             photos + favicon
```

## Photos — in, from Facebook

All four are the practice's own, pulled from the public Facebook page. The page itself is
behind a login wall, but the photo grid is not: headless Chrome `--dump-dom` on
`facebook.com/Elkasd/photos` lists them as 206x206 thumbnails, and rewriting
`ctp=s206x206` -> `ctp=s720x720` in the CDN URL returns the real 720x720 image.

| File | Photo |
|---|---|
| `clinic-1.jpg` | Overhead, dentist in a face shield |
| `clinic-2.jpg` | Dentist with the curing light |
| `case-1.jpg` | Before/after, branded "Elkas Dent - Bitola" |
| `case-2.jpg` | Before/after, second case |
| `logo.jpg` | The real ELKAS DENT lockup |

The CDN signatures expire, so those URLs cannot be refetched later as-is — rerun the dump.
A sixth photo (the waiting area with the plum wall) only ever returns an error at 720 and is
not on the site. The `.is-missing` dashed-slot fallback stays in `site.js` for any future slot.

The logo came from `graph.facebook.com/Elkasd/picture?width=1200&height=1200`, which is public
even though the page is not. The square mark in the header and the favicon are a hand-drawn SVG
of it, shared with the sibling build in `Desktop client`.

## What is verified, and what is not

Everything factual on the page came from the Google Maps listing and the Facebook page,
checked on 18 October 2026:

- Address: ул. Св. Климент Охридски 33, Пелагонка 2, 7000 Битола
- Phones: **078 438 106** (Google) and **077 851 511** (Facebook)
- Hours: Monday–Saturday 09:00–17:00, Sunday closed
- Google 5.0 ★ (1 review) · Facebook 963 followers, 86% recommend (9 reviews)
- Coordinates 41.0271813, 21.3339526 · plus code 28GM+VH

**Needs the owner's confirmation before this goes public:**

1. **The service list** (`index.html`, the `.svc` block, and `REASONS` in `site.js`) is the
   standard set for a practice like this, written in plain patient language. It is a
   sensible guess, not information from the clinic. Confirm, cut or extend it.
   Two likely gaps to ask about rather than guess at:
   **лекување на корен** (root canal — one of the most common reasons a patient comes in,
   and currently absent) and **детска стоматологија** (the About text says children come to
   the practice, but no card reflects it).
2. **The dentist's name** is nowhere on the page because it is not published anywhere
   public. Worth adding — patients book a person, not a building.
3. **Email address** — unknown. There is no email anywhere on the page.
4. **Which phone is the main one.** Two different numbers are published in two places;
   both are on the page, Google's is the one used by the call buttons and `tel:` links.
5. **ФЗОМ contract** — not claimed either way on the page. Say so if there is one.
6. **Patient consent for the before/after photos.** They appear to be the clinic's own
   marketing images, but publishing identifiable patient photographs on a website is the
   owner's call to make, not ours.
7. The two soft claims in the blue card — *"Цената ви ја кажуваме однапред"* and
   *"доволно време за секој пациент"* — are promises on the clinic's behalf. Keep them only
   if they are true.

## Booking

Three steps, then a confirmation screen:

1. **Зошто доаѓате** — nine reasons, one tap advances.
2. **Кога** — the next 14 open days (Sundays skipped, and a 90-minute lead time means
   today's imminent slots never show), then 30-minute slots from 09:00 to 16:30.
3. **Име и телефон** — name and phone required, email and note optional.

The confirmation is on-screen and stored in `localStorage`, so returning to the page shows
the appointment again in a bar at the bottom. From there the patient can add it to their
calendar (`.ics`), send it to the practice over Viber or SMS with the text already written,
or print it.

**No email or SMS is sent automatically.** Nothing reaches the clinic unless the patient
presses Viber/SMS or the clinic is called. This was the agreed scope. To make it automatic
later, the one place to change is the `[data-bk-send]` handler in `site.js` — POST
`messageText()` and `details()` to a form endpoint (Web3Forms, Formspree) or a Cloudflare
Worker, and keep the on-screen confirmation exactly as it is.

## Notes for whoever edits this next

- **Macedonian dates are spelled out by hand** (`MONTHS`, `DOW` in `site.js`). Chrome's
  `Intl` has no `mk-MK` data and silently returns English — never reintroduce
  `toLocaleDateString`.
- **Macedonian is the source text**, held in the HTML. English lives in the `EN` dictionary
  keyed by `data-i18n`. Add a key to both when you add copy.
- **Colours come from the logo** — plum `#a4518f` and indigo `#3c3f9e`. Indigo carries the
  structure, plum is reserved for the booking button. They live only in the `:root` block of
  `site.css`; every rule goes through the variables, so a repalette is that block alone.
- **Three languages: MK (in the HTML), EN and EL (dictionaries in `site.js`).** Onest has no
  Greek subset, so `html[lang="el"]` swaps `--sans` to Manrope, and the Manrope stylesheet is
  injected only when somebody actually picks Greek. Macedonian and English are untouched.
  Greek month and weekday names are hand-spelled for the same reason the Macedonian ones are.
- **Booking offers one thing: a 30-minute check-up.** That removed the old "what brings you in"
  step, so the flow is two steps, not three. `SERVICE` and `SERVICE_MIN` in `site.js` are the
  single source for its name and length.
- **Two designs exist. The live one is this: centred hero, teal-era layout, logo colours.**
  A print-leaflet alternative (serif headings, hairline rules, numbered service list, no icons)
  was built and then set aside at the owner's choice; it is kept whole in `v2-print/`
  (`index.html`, `site.css`, `site.js`) and can be swapped back by copying those three files over
  `index.html`, `assets/css/site.css` and `assets/js/site.js`. `v1-rejected/` holds the same
  files as the live version and is now redundant.
- Fonts: **Onest** only. Josefin, Fraunces, DM Sans and Jost all break or distort Cyrillic.
  No italics on Cyrillic text. (The print version additionally uses Lora and IBM Plex Mono.)
- Images carry `width`/`height` attributes *and* `height: auto` in CSS. Remove the CSS rule
  and the height attribute wins over `aspect-ratio`, which stretches lazy images.
- The booking `<dialog>` uses `height: fit-content`, otherwise it stretches to `max-height`
  and the content jumps between steps.
- No scroll listeners anywhere — `IntersectionObserver` only.

## Publishing

Not published. The page carries `<meta name="robots" content="noindex, nofollow">`.
When the owner approves: GitHub Pages under `stojanovskiognen2010-dot`, repo
`elkas-dent-mkd`, and remove the `noindex` tag at the same time.
