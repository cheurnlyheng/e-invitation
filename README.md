# Wedding e-invitation

Mobile-first wedding invitation for one wedding, with a private dashboard for the couple. Guests open a link or scan a QR code. Khmer is the default language, with an English switch.

Built with Next.js (App Router), React, TypeScript, Tailwind CSS v4, `motion` and Postgres (hosted on Railway). The look and behaviour follow the ChungDoi "lotus-v2-green" template as a stand-in until the real invitation design exists.

```bash
npm run dev     # http://localhost:3000   (dashboard: /admin)
npm run build   # production build
npm run lint
```

Personalised links show the guest's name on the cover: `http://localhost:3000/?to=Sokha`
Force a language with `?lang=en` or `?lang=km`.

## The invitation

Cover with a pulsing heart seal, falling blossoms and an Open button (starts the music), then: hero with the scalloped photo outline, parents and event details, 3D coverflow gallery with a lightbox, reception info with live countdown and calendar, add-to-calendar (.ics), RSVP form, venue map, schedule timeline with medallions, guestbook, gift box (hover pops it and bursts confetti, tap opens the bank details and QR), and a closing lotus. Corner flowers drift with a scroll parallax, the page auto-scrolls gently after opening (scrolling by hand pauses it, tapping the page resumes it), a spinning-disc button controls the music, and a "Confirm Attendance" button stays pinned at the bottom centre of the screen (on the same line as the music button) so guests can always find it.

Section positions match the reference template exactly at phone width (measured in a browser). Desktop shows a 900px column like the reference.

## The dashboard (`/admin`)

Sign in with one shared password. It shows:

- **Overview:** guests coming, replies saying no, and the latest replies and wishes.
- **RSVPs:** every reply with its guest count; search, filter, delete, download CSV.
- **Wishes:** hide a wish from the public guestbook (it stays here) or delete it; download CSV.
- **Links:** type your guest list, get one personal link per guest (`/?to=Name`), and see who has opened theirs and who has replied. Each guest (and the general link) has a **QR card** button: it shows a card with the wedding artwork, the couple's names, the date, the guest's name and a QR code for that link, in Khmer or English, with a **Save to Photos** button on phones (it opens the share menu; choose Save Image to put the card in the photo gallery) and a **Download PNG** button (1200x2150, ready to send in a chat or print). You can also press and hold the card and choose Add to Photos. The QR points at the address you opened the dashboard from, so make the cards from the live site, not localhost.

The dashboard is not linked from the invitation and is excluded from search engines (`robots.txt`).

### How data is stored

| Situation | Storage |
| --- | --- |
| `DATABASE_URL` is set (Vercel + Railway) | Postgres. Tables are created automatically on first use. |
| Not set, running `npm run dev` | A git-ignored JSON file in `.data/`, so everything works locally with no setup. |
| Not set, in production | Saving is refused with a clear error, so guest data is never lost silently. |

### Environment variables

Copy `.env.example` to `.env.local` for local work; set the same names in Vercel (Project, Settings, Environment Variables) for the live site.

| Name | Purpose |
| --- | --- |
| `ADMIN_PASSWORD` | Dashboard password, at least 6 characters. With no password the dashboard stays locked. |
| `ADMIN_SECRET` | Optional. Signs the sign-in cookie; change it to sign everyone out. Defaults to the password. |
| `DATABASE_URL` | Postgres connection string. For Railway use the database's public address (its `DATABASE_PUBLIC_URL` variable). |
| `DATABASE_CA` | The Postgres server's certificate authority, in PEM form (it is public, not secret). Railway's database signs its own certificate, so this is how the site checks it is talking to the real database; the connection is refused if the server's certificate was not issued by it. Leave it empty for hosts with a normal public certificate. If the Railway database is ever recreated, its certificate changes and this value must be replaced. |

### Security notes

- The database connection is encrypted and the server's certificate is verified (pinned through `DATABASE_CA`); it is never switched to "trust anything".
- Every admin route re-checks the signed, HttpOnly sign-in cookie itself; the page is only a convenience.
- Wrong passwords are slowed down and rate limited; guest forms are rate limited per IP; request bodies are size-capped.
- Admin changes are refused when the request comes from another website.
- CSV downloads neutralise spreadsheet formulas in guest-typed text.

## Where to change things

| To change | Edit |
| --- | --- |
| Names, parents, dates, venues, schedule, bank accounts, photos, music | `src/config/invitation.ts` |
| Fixed wording (buttons, headings) in Khmer and English | `src/config/strings.ts` |
| Colours | CSS variables at the top of `src/app/globals.css` |
| Fonts | `src/app/layout.tsx` and the `--font-*` tokens in `globals.css` |
| Flower artwork, medallions, gift art, gallery photos | `public/ref/` (positions: `src/components/decor/Flower.tsx` and the section components) |
| Music and QR images | `public/audio`, `public/gift` |
| Dashboard screens | `src/components/admin/` |
| Database and API | `src/server/` and `src/app/api/` |

## Placeholders, and what must change before sharing

- **`public/ref/` is the reference template's artwork and stock photos** (flowers, medallions, gift box, the 10 couple photos). They are ChungDoi's assets and are here only as stand-ins. **Replace them with your own before the link goes to guests.**
- Names, date, venue and bank details in `invitation.ts` are fake. The Khmer wording is a draft and needs a native speaker's proofread.
- `public/audio/placeholder.wav` is a synthesised tune; add the real song. `public/gift/qr-placeholder.svg` stands in for the real KHQR image.
- The paper texture (`public/ref/paper-grain.svg`) is generated, not the template's own.
- The dashboard is in English only.

## Not built yet

- Link-preview image and title for chat apps (Open Graph).
- The final design from the physical invitation.
