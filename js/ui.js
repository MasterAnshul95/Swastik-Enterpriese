/* ============================================================
   ui.js — shared helpers + reusable UI pieces.
   Pure functions returning HTML strings: used at build time
   (Node, to pre-render pages) and in the browser.
   ============================================================ */

export const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* "*word*" in copy → serif italic accent. Escapes everything else. */
export const rich = (s = "") => esc(s).replace(/\*(.+?)\*/g, '<em class="serif">$1</em>');
export const plain = (s = "") => String(s).replace(/\*/g, "");

/* "{n} lines" + { n: 3 } → "3 lines" */
export const fmt = (s = "", vars = {}) => String(s).replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));

export const slug = (s = "") =>
  String(s).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const telHref = (p = "") => `tel:${p.replace(/[^\d+]/g, "")}`;
export const waNumber = (p = "") => p.replace(/[^\d]/g, "");
export const waHref = (p, text = "") => `https://wa.me/${waNumber(p)}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
export const mapsHref = (q = "") => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
export const mapsEmbed = (q = "") => `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;

/* Unsplash URLs get sized on the fly; any other URL (e.g. your own assets/img/…) is used as-is. */
export function imgUrl(src = "", w = 1200, h = 0) {
  if (!src.includes("images.unsplash.com")) return src;
  return `${src.split("?")[0]}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ""}&q=72`;
}

export function img(src, alt = "", { w = 1200, ratio = 0, cls = "", sizes = "100vw", eager = false, attrs = "" } = {}) {
  if (!src) return "";
  const h = (x) => (ratio ? Math.round(x * ratio) : 0);
  const widths = src.includes("images.unsplash.com") ? [400, 700, 1000, 1400, 1900].filter((x) => x <= w * 1.6 && x > w * 0.5) : [];
  const set = widths.length > 1 ? ` srcset="${widths.map((x) => `${imgUrl(src, x, h(x))} ${x}w`).join(", ")}" sizes="${sizes}"` : "";
  return `<img class="${cls}" src="${imgUrl(src, w, h(w))}"${set} alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" data-fallback ${attrs}>`;
}

/* "Haldi / Turmeric" → { name: "Haldi", alt: "Turmeric" } */
export function splitName(raw = "") {
  const [name, alt] = raw.split(" / ");
  return { name: name.trim(), alt: (alt || "").trim() };
}

export const initials = (name = "") =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => [...w][0].toUpperCase()).join("");

/* ---------- icons (24px, stroke) ---------- */
const P = {
  arrow: '<path d="M5 12h14"/><path d="m13 5 7 7-7 7"/>',
  arrowUR: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
  arrowL: '<path d="M19 12H5"/><path d="m11 5-7 7 7 7"/>',
  arrowUp: '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  minus: '<path d="M5 12h14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  search: '<circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.2-4.2"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="3"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3 2"/>',
  list: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  package: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  sparkle: '<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.14 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  mic: '<rect width="6" height="12" x="9" y="2" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><path d="M12 18v4"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3.5"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/>',
  print: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14" rx="1"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  paste: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2"/><path d="M9 12h6"/><path d="M9 16h4"/>',
  grid: '<rect width="7" height="7" x="3" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="3" rx="1.5"/><rect width="7" height="7" x="3" y="14" rx="1.5"/><rect width="7" height="7" x="14" y="14" rx="1.5"/>',
  rows: '<rect width="18" height="7" x="3" y="3" rx="1.5"/><rect width="18" height="7" x="3" y="14" rx="1.5"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
  globe: '<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19"/><path d="M12 2.5a14.5 14.5 0 0 1 0 19 14.5 14.5 0 0 1 0-19"/>',
  star: '<path d="M11.5 2.8a.6.6 0 0 1 1 0l2.6 5.3 5.8.9a.6.6 0 0 1 .3 1l-4.2 4.1 1 5.8a.6.6 0 0 1-.9.6L12 17.8l-5.2 2.7a.6.6 0 0 1-.9-.6l1-5.8-4.2-4.1a.6.6 0 0 1 .3-1l5.8-.9z"/>',
};
const WA_PATH =
  "M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.28-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.41Z";

export function icon(name, cls = "ic") {
  if (name === "whatsapp")
    return `<svg class="${cls}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${WA_PATH}"/></svg>`;
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ""}</svg>`;
}

/* ---------- brand mark: four petals, one per division ---------- */
export const PETAL = "M15 15H7.2A5.2 5.2 0 0 1 2 9.8V7.2A5.2 5.2 0 0 1 7.2 2h2.6A5.2 5.2 0 0 1 15 7.2z";
export function logoMark(cls = "mark") {
  return `<svg class="${cls}" viewBox="0 0 32 32" aria-hidden="true">
    <path class="p p1" d="${PETAL}" fill="var(--c-hardware)"/>
    <path class="p p2" d="${PETAL}" fill="var(--c-spices)" transform="matrix(-1 0 0 1 32 0)"/>
    <path class="p p3" d="${PETAL}" fill="var(--c-dryfruits)" transform="rotate(180 16 16)"/>
    <path class="p p4" d="${PETAL}" fill="var(--c-packaging)" transform="matrix(1 0 0 -1 0 32)"/>
  </svg>`;
}
export const petal = (cls = "petal") =>
  `<svg class="${cls}" viewBox="0 0 17 17" aria-hidden="true"><path d="${PETAL}" fill="currentColor"/></svg>`;

export const DIVS = ["hardware", "spices", "dryfruits", "packaging"];
export const divColor = (id) => (DIVS.includes(id) ? `var(--c-${id})` : "var(--ink-3)");

/* ---------- small pieces ---------- */
export function btn(label, href, { variant = "ink", icon: ic = "arrowUR", attrs = "", size = "" } = {}) {
  const cls = `btn btn--${variant}${size ? ` btn--${size}` : ""}`;
  const inner = `<span class="btn__label">${esc(label)}</span>${ic ? `<span class="btn__icon">${icon(ic)}</span>` : ""}`;
  return href
    ? `<a class="${cls}" href="${esc(href)}" data-ic="${ic}" ${attrs}>${inner}</a>`
    : `<button class="${cls}" type="button" data-ic="${ic}" ${attrs}>${inner}</button>`;
}

export const eyebrow = (text, idx = "") =>
  `<span class="eyebrow">${idx ? `<span class="eyebrow__idx">(${esc(idx)})</span>` : '<span class="eyebrow__dot"></span>'}${esc(text)}</span>`;

/* Headline split into words for a staggered mask reveal. */
export function splitTitle(text, tag = "h2", cls = "", attrs = "") {
  const words = rich(text)
    .replace(/<em class="serif">.*?<\/em>/g, (m) => m.replace(/ /g, "\u0000"))
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/\u0000/g, " "));
  const inner = words.map((w, i) => `<span class="w"><span class="w__i" style="--i:${i}">${w}</span></span>`).join(" ");
  return `<${tag} class="${cls}" data-split ${attrs}>${inner}</${tag}>`;
}

export function sectionHead({ idx = "", label = "", title = "", body = "", side = "", cls = "", tag = "h2" }) {
  return `<header class="shead ${cls}">
    <div class="shead__main">
      ${label ? eyebrow(label, idx) : ""}
      ${splitTitle(title, tag, "h2")}
    </div>
    ${body || side ? `<div class="shead__side" data-reveal>${body ? `<p class="lede">${rich(body)}</p>` : ""}${side}</div>` : ""}
  </header>`;
}

export function stats(list = [], cls = "") {
  return `<div class="stats ${cls}">${list
    .map(
      (s, i) => `<div class="stat" data-reveal style="--d:${i * 80}ms">
        <span class="stat__value"><span ${s.plain ? "" : `data-count="${esc(s.value)}"`}>${esc(s.value)}</span><span class="stat__suffix">${esc(s.suffix || "")}</span></span>
        <span class="stat__label"><i class="sq" style="--c:${divColor(DIVS[i % 4])}"></i>${esc(s.label)}</span>
      </div>`
    )
    .join("")}</div>`;
}

/* Every product line, flattened, with stable ids. */
export function allItems(c) {
  return c.products.categories.flatMap((cat) =>
    cat.items.map((it, i) => {
      const { name, alt } = splitName(it.name);
      return {
        id: it.id, raw: it.name, name, alt, image: it.image || cat.image,
        div: cat.id, divName: cat.name, short: cat.short, unit: cat.unit, file: cat.file,
        code: `${cat.code}.${String(i + 1).padStart(2, "0")}`,
      };
    })
  );
}

export const addData = (item) => esc(JSON.stringify({ id: item.id, name: item.raw, div: item.div, unit: item.unit }));

export function addBtn(item, ui, { cls = "" } = {}) {
  return `<button class="add ${cls}" type="button" data-add="${addData(item)}" aria-pressed="false" aria-label="${esc(fmt(ui.addTo, { name: item.raw }))}">
    <span class="add__icon">${icon("plus")}${icon("check")}</span><span class="add__label" data-on="${esc(ui.added)}" data-off="${esc(ui.add)}">${esc(ui.add)}</span>
  </button>`;
}

/* Small pill that adds one item — used in division panels, pairs, starter lists. */
export function chipAdd(item, ui) {
  return `<button class="chip-add" type="button" data-add="${addData(item)}" aria-pressed="false" aria-label="${esc(fmt(ui.addTo, { name: item.raw }))}" style="--c:${divColor(item.div)}">
    <span class="chip-add__img">${img(item.image, "", { w: 96, ratio: 1, sizes: "32px" })}</span>${esc(item.name)}<span class="chip-add__icon">${icon("plus")}${icon("check")}</span>
  </button>`;
}

export function productCard(item, ui, { eager = false } = {}) {
  return `<article class="pcard" data-item data-id="${item.id}" data-div="${item.div}" data-name="${esc(item.raw.toLowerCase())}" style="--c:${divColor(item.div)};--vt:p-${item.id}">
    <div class="pcard__media">
      ${img(item.image, item.raw, { w: 520, ratio: 0.8, sizes: "(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 22vw", eager })}
      <span class="pcard__code">${esc(item.code)}</span>
    </div>
    <div class="pcard__body">
      <h3 class="pcard__name">${esc(item.name)}</h3>
      <p class="pcard__alt">${item.alt ? esc(item.alt) : "&nbsp;"}</p>
      <div class="pcard__foot">
        <span class="pcard__meta"><i></i>${esc(ui.looseBulk)}</span>
        ${addBtn(item, ui)}
      </div>
    </div>
  </article>`;
}

export function crumbs(items = [], home = "Home") {
  return `<nav class="crumbs" aria-label="Breadcrumb" data-reveal>
    <a href="index.html">${esc(home)}</a>${items.map((cr) => `<span aria-hidden="true">/</span>${cr.href ? `<a href="${esc(cr.href)}">${esc(cr.label)}</a>` : `<span aria-current="page">${esc(cr.label)}</span>`}`).join("")}
  </nav>`;
}

export function pageHero({ eyebrow: eb = "", title = "", subtitle = "", trail = [], home = "Home", side = "" }) {
  return `<section class="phero">
    <div class="phero__bg" aria-hidden="true"></div>
    <div class="container">
      ${crumbs(trail, home)}
      <div class="phero__grid">
        <div>
          ${eb ? eyebrow(eb) : ""}
          ${splitTitle(title, "h1", "h1")}
        </div>
        <div class="phero__side" data-reveal style="--d:200ms">
          ${subtitle ? `<p class="lede">${rich(subtitle)}</p>` : ""}
          ${side}
        </div>
      </div>
    </div>
  </section>`;
}

export function ctaBlock(c, { title, body } = {}) {
  const b = c.brand;
  const cb = c.home.ctaBanner;
  const ui = c.ui;
  return `<section class="section cta-wrap">
    <div class="container">
      <div class="cta" data-reveal>
        <div class="cta__glow" aria-hidden="true"></div>
        <div class="cta__mark" aria-hidden="true">${logoMark()}</div>
        <div class="cta__body">
          ${eyebrow(cb.label)}
          ${splitTitle(title || cb.title, "h2", "cta__title")}
          <p class="cta__text">${rich(body || cb.body)}</p>
          <div class="cta__actions">
            ${btn(ui.whatsappUs, waHref(b.whatsapp, ui.form.plainGreeting), { variant: "wa", icon: "whatsapp", attrs: 'target="_blank" rel="noopener"' })}
            ${btn(cb.paste, "", { variant: "light", icon: "paste", attrs: 'data-quote-open="paste"' })}
            ${btn(cb.snap, "contact.html#snap", { variant: "ghost-light", icon: "camera" })}
          </div>
          <a class="cta__tel" href="${telHref(b.phone)}">${icon("phone")}<span>${esc(b.phone)}</span></a>
        </div>
      </div>
    </div>
  </section>`;
}

export function testimonials(list = [], ui) {
  return `<div class="quotes" data-quotes>
    <div class="quotes__stage">
      ${list
        .map(
          (t, i) => `<figure class="quote${i === 0 ? " is-active" : ""}" style="--c:${divColor(t.division)}" aria-hidden="${i === 0 ? "false" : "true"}">
            <blockquote><p>${esc(t.quote)}</p></blockquote>
            <figcaption><span class="avatar">${esc(initials(t.name))}</span><span><strong>${esc(t.name)}</strong><small>${esc(t.role)}</small></span></figcaption>
          </figure>`
        )
        .join("")}
    </div>
    <div class="quotes__nav">
      <div class="quotes__bars">${list.map((_, i) => `<button class="qbar${i === 0 ? " is-active" : ""}" type="button" aria-label="${i + 1} / ${list.length}" data-q="${i}"><i></i></button>`).join("")}</div>
      <div class="quotes__arrows">
        <button class="iconbtn" type="button" data-q-prev aria-label="←">${icon("arrowL")}</button>
        <button class="iconbtn" type="button" data-q-next aria-label="→">${icon("arrow")}</button>
      </div>
    </div>
  </div>`;
}

/* Partner "logos": monogram lockups until real logo files are supplied. */
export function partners(p) {
  return `<div class="partners">
    ${p.list
      .map(
        (x, i) => `<div class="partner" data-reveal style="--d:${i * 90}ms;--c:${divColor(DIVS[(i + 1) % 4])}">
          <span class="partner__logo"><span class="partner__mono">${esc(initials(x.name))}</span><span class="partner__name">${esc(x.name)}</span></span>
          <span class="partner__note">${esc(x.note)}</span>
        </div>`
      )
      .join("")}
    <div class="partner partner--more" data-reveal style="--d:280ms"><span class="partner__big">${esc(p.moreValue)}</span><span class="partner__note">${esc(p.moreLabel)}</span></div>
  </div>`;
}

/* The scroll-driven product "shelf": two rows of photo chips sliding with the page. */
export function shelfStrip(items) {
  const half = Math.ceil(items.length / 2);
  const row = (list, cls) =>
    `<div class="strip__row ${cls}" data-strip-row><div class="strip__track">${[...list, ...list]
      .map((it) => `<a class="strip__item" href="${esc(it.file)}" style="--c:${divColor(it.div)}" tabindex="-1">${img(it.image, "", { w: 240, ratio: 1, sizes: "72px" })}<span>${esc(it.name)}</span></a>`)
      .join("")}</div></div>`;
  return `<section class="strip" aria-hidden="true" data-strip>
    ${row(items.slice(0, half), "")}
    ${row(items.slice(half), "strip__row--rev")}
  </section>`;
}
