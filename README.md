# Swastik Enterprises — Website

A fast, animated, multi-page marketing site for **Swastik Enterprises** (industrial
hardware, fasteners, metals & custom fabrication).

Built with **plain HTML + Tailwind (CDN) + GSAP/ScrollTrigger + Lenis + Three.js**
— no build step, no framework. The design is a full-bleed **"FORGE-OS" industrial
HUD**: a persistent reflective 3D metal bolt/nut/washer (Three.js) rotates behind
edge-anchored content, framed by HUD readouts and a live section rail. All content
lives in one JSON file; all UI is built from reusable component functions (zero
copy-paste between pages).

> **Why no Framer Motion?** Framer Motion is a React-only library and cannot run in
> plain HTML. The same (often smoother) motion here is done with **GSAP + Lenis + CSS**,
> which is the correct tool for a static HTML site.

---

## Run it locally

You need a tiny local web server (the pages load content via `fetch`, which browsers
block on `file://`). Node is already required only for the server.

```bash
# from this folder
npm install      # installs the "serve" static server (one time)
npm run dev      # serves at http://localhost:5173
```

Then open **http://localhost:5173**.

**No Node?** Any static server works. Easiest alternatives:
- VS Code → install the **Live Server** extension → right-click `index.html` → "Open with Live Server".
- Python: `python -m http.server 5173` then open `http://localhost:5173`.

---

## Edit the content (no coding)

Everything you read on the site — headlines, product lists, stats, contact details —
lives in **`data/content.json`**. Change the text there, refresh the browser, done.

- Phone / email / address → `brand`
- Hero headline → `home.hero`
- Product categories → `products.categories`
- Capabilities → `capabilities.list`
- Industries → `industries.list`
- Page titles & meta descriptions (SEO) → each section's `seo`

Swap any image by replacing its URL in `content.json`. Current images are free,
licence-safe photos from **Unsplash**. For best performance, download the ones you
want and host them in an `assets/img/` folder, then point the URLs there.

---

## Project structure

```
index.html  products.html  capabilities.html  industries.html  about.html  contact.html
│   thin SEO shells — each just declares its page + loads the shared scripts
│
├─ data/content.json     ← ALL site copy & image URLs (single source of truth)
├─ assets/styles.css     ← FORGE-OS styles (full-bleed layout, HUD) on top of Tailwind
├─ assets/placeholder.svg← shown automatically if any remote image fails to load
├─ favicon.svg  robots.txt  sitemap.xml
└─ js/
   ├─ config.js          ← Tailwind theme tokens (colours, fonts) — defined once
   ├─ components.js       ← reusable UI blocks (HUD, navbar, footer, cards, marquee…)
   ├─ pages.js            ← composes blocks into each page's body (full-bleed sections)
   ├─ scene3d.js          ← Three.js metal bolt/nut/washer (scroll-rotate + cursor)
   ├─ animations.js       ← Lenis smooth scroll + GSAP reveals / split-text / HUD rail
   └─ main.js             ← loads JSON, mounts components, boots 3D + animations
```

The 3D scene and all animation degrade gracefully: if WebGL or any CDN is blocked,
the site still renders fully (the 3D canvas and motion simply switch off).

## Pages

`Home` · `Products` · `Capabilities` · `Industries` · `About` · `Contact`

## Going live

Upload the whole folder to any static host (Netlify, Vercel, Cloudflare Pages,
GitHub Pages, or normal web hosting). Before launch, replace
`https://swastikenterprises.example` in the `<link rel="canonical">`, Open Graph
tags, `robots.txt` and `sitemap.xml` with your real domain.

The contact form currently shows a success message only (no backend). To receive
real enquiries, connect it to a service like Formspree, Web3Forms or your own
endpoint in `js/main.js` → `handleForm()`.
