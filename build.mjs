/* ============================================================
   build.mjs — renders every page to finished, static HTML.
   English at the root, Hindi under /hi/. Zero dependencies:
     node build.mjs
   (node server.mjs runs this for you and re-runs it on save.)
   ============================================================ */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { pages } from "./js/pages.js";
import { navbar, menu, footer, floating } from "./js/chrome.js";
import { esc, fmt, allItems, logoMark } from "./js/ui.js";

const ROOT = dirname(fileURLToPath(import.meta.url));
const readJSON = async (p) => JSON.parse(await readFile(join(ROOT, p), "utf8"));

/* content.hi.json overrides content.json: objects by key, arrays by index. */
function merge(base, over) {
  if (over === undefined) return base;
  if (Array.isArray(base) && Array.isArray(over)) return base.map((b, i) => (i < over.length ? merge(b, over[i]) : b));
  if (base && over && typeof base === "object" && typeof over === "object" && !Array.isArray(base) && !Array.isArray(over)) {
    const out = { ...base };
    for (const k of Object.keys(over)) out[k] = merge(base[k], over[k]);
    return out;
  }
  return over;
}

const en = await readJSON("data/content.json");
const hi = existsSync(join(ROOT, "data/content.hi.json")) ? merge(en, await readJSON("data/content.hi.json")) : null;
const LANGS = [{ code: "en", c: en, dir: "", root: "" }, ...(hi ? [{ code: "hi", c: hi, dir: "hi/", root: "../" }] : [])];
/* Site path on the host, e.g. "/Swastik-Enterpriese/" on GitHub Pages — the 404 page needs it. */
const BASE = new URL(en.meta.siteUrl).pathname.replace(/\/?$/, "/");

const FONTS =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..800&family=Geist:wght@400..700&family=Geist+Mono:wght@400..600&family=Instrument+Serif:ital@0;1";
const FONTS_HI = "&family=Anek+Devanagari:wdth,wght@75..125,300..800";

const pageList = (c) => [
  { file: "index.html", page: "home", seo: c.home.seo },
  { file: "catalog.html", page: "catalog", seo: c.catalog.seo },
  { file: "products.html", page: "products", seo: c.products.seo },
  ...c.products.categories.map((d) => ({ file: d.file, page: "division", id: d.id, seo: { title: `${d.name} | ${c.brand.name}`, description: d.summary } })),
  { file: "capabilities.html", page: "capabilities", seo: c.capabilities.seo },
  { file: "industries.html", page: "industries", seo: c.industries.seo },
  { file: "about.html", page: "about", seo: c.about.seo },
  { file: "contact.html", page: "contact", seo: c.contact.seo },
  { file: "404.html", page: "notFound", seo: c.notFound.seo },
];

function island(c, lang) {
  const b = c.brand;
  const data = {
    lang: lang.code,
    locale: c.meta.locale,
    root: lang.root,
    brand: { name: b.name, phone: b.phone, whatsapp: b.whatsapp, email: b.email, hours: b.hours, open: b.open, address: `${b.address.line1}, ${b.address.line2}` },
    ui: c.ui,
    nav: c.nav,
    form: { endpoint: c.contact.form.endpoint },
    items: allItems(c).map(({ id, raw, name, alt, image, div, divName, short, unit, file, code }) => ({ id, raw, name, alt, image, div, divName, short, unit, file, code })),
    divisions: c.products.categories.map((d) => ({ id: d.id, name: d.name, short: d.short, file: d.file, image: d.image, lines: fmt(c.ui.productLines, { n: d.items.length }) })),
  };
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function jsonLd(c, p, lang) {
  const site = c.meta.siteUrl;
  const b = c.brand;
  if (p.page === "home")
    return {
      "@context": "https://schema.org",
      "@type": "WholesaleStore",
      name: b.name,
      description: b.blurb,
      url: `${site}/${lang.dir}`,
      logo: `${site}/favicon.svg`,
      image: c.meta.ogImage,
      telephone: b.phone.replace(/\s/g, ""),
      email: b.email,
      foundingDate: String(b.founded),
      address: { "@type": "PostalAddress", streetAddress: `${b.address.line1}, ${b.address.line2}`, addressCountry: "IN" },
      openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "09:00", closes: "19:00" }],
      areaServed: "IN",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: b.tagline,
        itemListElement: c.products.categories.map((d) => ({ "@type": "OfferCatalog", name: d.name, itemListElement: d.items.map((i) => ({ "@type": "Offer", itemOffered: { "@type": "Product", name: i.name } })) })),
      },
    };
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: c.nav[0].label, item: `${site}/${lang.dir}index.html` },
      { "@type": "ListItem", position: 2, name: (p.seo.title || "").split("|")[0].trim(), item: `${site}/${lang.dir}${p.file}` },
    ],
  };
}

function documentHtml(c, lang, p, out) {
  const site = c.meta.siteUrl;
  const title = out.title || p.seo.title;
  const description = out.description || p.seo.description;
  const alt = lang.code === "en" ? `hi/${p.file}` : `../${p.file}`;
  const ctx = { lang: lang.code, root: lang.root, file: p.file, page: p.page, alt, year: new Date().getFullYear() };
  const r = lang.root;
  return `<!DOCTYPE html>
<html lang="${lang.code}" data-page="${p.page}">
  <head>
    <meta charset="UTF-8" />
    ${p.page === "notFound" ? `<base href="${BASE}${lang.dir}" />\n    ` : ""}<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#f4f1ea" />
    <meta name="color-scheme" content="light" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${site}/${lang.dir}${p.file}" />
    ${LANGS.map((l) => `<link rel="alternate" hreflang="${l.code}" href="${site}/${l.dir}${p.file}" />`).join("\n    ")}
    <link rel="alternate" hreflang="x-default" href="${site}/${p.file}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${esc(c.brand.name)}" />
    <meta property="og:locale" content="${c.meta.locale.replace("-", "_")}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${esc(c.meta.ogImage)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" type="image/svg+xml" href="${r}favicon.svg" />
    <link rel="apple-touch-icon" href="${r}favicon.svg" />
    <link rel="manifest" href="${r}manifest.webmanifest" />
    <script>(function(d){d.classList.add("js");setTimeout(function(){if(!window.__booted)d.classList.add("is-ready","reveal-all")},3500)})(document.documentElement);</script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preconnect" href="https://images.unsplash.com" />
    <link rel="stylesheet" href="${FONTS}${lang.code === "hi" ? FONTS_HI : ""}&amp;display=swap" />
    <link rel="stylesheet" href="${r}assets/css/style.css" />
    ${p.page === "home" ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js" defer data-matter></script>\n    ' : ""}<script type="module" src="${r}js/main.js"></script>
    <script type="application/ld+json">${JSON.stringify(jsonLd(c, p, lang)).replace(/</g, "\\u003c")}</script>
  </head>
  <body>
    ${navbar(c, ctx)}
    ${menu(c, ctx)}
    <main id="main">${out.html}
    </main>
    ${footer(c, ctx)}
    ${floating(c)}
    <script type="application/json" id="site-data">${island(c, lang)}</script>
  </body>
</html>
`;
}

/* Old product.html?id=… links keep working. */
function legacyRedirect(c) {
  const map = Object.fromEntries(c.products.categories.map((d) => [d.id, d.file]));
  return `<!DOCTYPE html>
<html lang="${c.meta.lang}"><head><meta charset="UTF-8" /><meta name="robots" content="noindex" /><title>${esc(c.brand.name)}</title>
<script>var m=${JSON.stringify(map)};location.replace(m[new URLSearchParams(location.search).get("id")]||"products.html");</script>
<noscript><meta http-equiv="refresh" content="0;url=products.html" /></noscript></head>
<body><a href="products.html">${esc(c.products.header.title.replace(/\*/g, ""))}</a></body></html>
`;
}

function sitemap() {
  const site = en.meta.siteUrl;
  const urls = pageList(en).filter((p) => p.page !== "notFound");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .map((p) =>
    LANGS.map(
      (l) => `  <url><loc>${site}/${l.dir}${p.file}</loc>${LANGS.map((a) => `<xhtml:link rel="alternate" hreflang="${a.code}" href="${site}/${a.dir}${p.file}"/>`).join("")}<changefreq>monthly</changefreq><priority>${p.page === "home" ? "1.0" : "0.8"}</priority></url>`
    ).join("\n")
  )
  .join("\n")}
</urlset>
`;
}

let count = 0;
for (const lang of LANGS) {
  if (lang.dir) await mkdir(join(ROOT, lang.dir), { recursive: true });
  for (const p of pageList(lang.c)) {
    const out = pages[p.page].render(lang.c, { id: p.id, lang: lang.code });
    await writeFile(join(ROOT, lang.dir, p.file), documentHtml(lang.c, lang, p, out));
    count++;
  }
  await writeFile(join(ROOT, lang.dir, "product.html"), legacyRedirect(lang.c));
}
await writeFile(join(ROOT, "sitemap.xml"), sitemap());
await writeFile(join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${en.meta.siteUrl}/sitemap.xml\n`);
console.log(`  built ${count} pages (${LANGS.map((l) => l.code).join(" + ")})`);
