# Swastik Enterprises — Website

Website for **Swastik Enterprises**, a four-division wholesaler: hardware &
fasteners, spices & masale, dry fruits & nuts, and polybags. English at `/`,
Hindi at `/hi/`.

Plain **HTML + CSS + vanilla JS**: no framework and no npm packages. A
small Node script pre-renders every page into finished HTML from one content
file, so pages load instantly and search engines see real content.

## Run it

```bash
node server.mjs
```

Open http://localhost:5173 (Hindi: http://localhost:5173/hi/). The server builds
the site on start and **rebuilds automatically** whenever you save
`data/*.json` or anything in `js/`. Just refresh the browser.

## Edit content

| What | Where |
| --- | --- |
| All English text, products, photos, phone, address, hours | `data/content.json` |
| Hindi translations (only the text — ids/photos come from the English file) | `data/content.hi.json` |
| Colours, fonts, spacing, animation | `assets/css/style.css` |

- Wrap a word in `*asterisks*` in any title for the italic accent.
- Each product line has an `id` (keep it stable — saved quote lists use it), a `name`
  (`"Haldi / Turmeric"` shows *Haldi* with *Turmeric* underneath) and an `image`.
- Unsplash image links are resized automatically; any other path
  (e.g. `assets/img/haldi.jpg`) is used as-is. Broken images fall back to a placeholder.
- `brand.credentials` — add your **FSSAI** number, **GSTIN** and a **Google reviews**
  link; they appear in the footer and on the contact page as soon as they're filled in.
- `brand.mapsQuery` — what the contact-page map searches for. Check the pin is right.

### Publishing

Run `node build.mjs` (or just keep `node server.mjs` running while you edit), then
upload the whole folder to any static host (Netlify, Cloudflare Pages, GitHub Pages,
regular hosting). Replace `https://swastikenterprises.example` in
`data/content.json → meta.siteUrl` with the real domain and rebuild.

### Enquiry form

With no backend, the form opens WhatsApp (or the email app) with the enquiry
fully written out. To receive submissions on a server instead, put a form
endpoint (Formspree, Web3Forms, your own) in `contact.form.endpoint`.

## What's in it

- **Hero counter:** product tokens drop in with real physics (Matter.js). Drag them
  around; tap one to add it to the quote list.
- **Kinetic headline:** letters thicken as the cursor passes (variable fonts).
- **Quote list:** add lines from anywhere, set quantity + unit, then
  - **Paste a list** — type or paste "haldi 25 kg / kaju 10kg / M12 bolts 500";
    it understands Hindi, Hinglish, typos, quintals and tons,
  - send it on **WhatsApp**, carry it into the enquiry form, **share a link**
    to the list, or **save it as a PDF**,
  - **Past lists** are kept so repeat buyers can re-order in one tap.
- **Search everything:** press `/` (or Ctrl/⌘+K). Typo-tolerant, Hindi-aware, with voice
  search where the browser supports it.
- **Snap your list** (contact page) — photograph a handwritten list and share it to
  WhatsApp; **call-back request**; live **open/closed** status in IST; map.
- Native **page transitions** (the division photo morphs into the next page),
  **scroll-driven animation** in pure CSS, spring easing, a sticky quote bar on phones.
- **Installable app** with offline support (service worker; switched off on localhost).
- Unique tools per page: division accordion, polybag calculator, industry
  explorer with starter lists, order configurator, comparison tables, gallery lightbox,
  printable division catalogue.

## Structure

```
build.mjs            renders every page (EN + HI) to static HTML
server.mjs           dev server: build on start + on change
data/content.json    all copy, products, photos (English)
data/content.hi.json Hindi overrides
assets/css/style.css the design system
js/ui.js             shared components (used at build time and in the browser)
js/chrome.js         nav, menu, footer
js/pages.js          one render() + init() per page
js/main.js           browser entry: reads the page's data island, wires behaviour
js/quote.js          quote list, drawer, paste parser hookup, share, PDF, history
js/search.js         fuzzy + Hindi/English search and the list parser
js/palette.js        "/" search palette + voice
js/motion.js         reveals, counters, kinetic type, widgets, view-transition hand-off
js/physics.js        the hero counter
sw.js, manifest.webmanifest   offline + install
hi/                  generated Hindi pages
```

Old `product.html?id=…` links redirect to the new division pages.

## Before going live

- Real domain in `meta.siteUrl`; confirm the email, the stats (600+ clients,
  40+ team, 98% on-time) and the testimonials are real.
- Add FSSAI / GSTIN / reviews link, partner logo files and your own photos
  (shop, team, warehouse) when available — they'll lift trust more than anything else.
