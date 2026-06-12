/* ============================================================
   components.js — reusable UI, defined ONCE. Returns HTML strings
   built from content.json. FORGE-OS full-bleed / HUD design.
   ============================================================ */

export const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));

const icon = {
  arrow: `<svg viewBox="0 0 24 24" fill="none" class="h-4 w-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  diag: `<svg viewBox="0 0 24 24" fill="none" class="h-4 w-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" class="h-4 w-4 shrink-0" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  spark: `<svg viewBox="0 0 24 24" fill="currentColor" class="h-3 w-3"><path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z"/></svg>`,
};

/* image with graceful fallback */
const img = (src, alt, cls = "") =>
  `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" referrerpolicy="no-referrer"
     onerror="window.__imgFail&&window.__imgFail(this)" class="${cls}" />`;

/* ---------- buttons ---------- */
export function button(cta, variant = "primary") {
  if (!cta) return "";
  const base = "group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-300";
  const styles = variant === "primary"
    ? "bg-steel-50 text-steel-950 hover:bg-forge-500 shadow-[0_14px_32px_-14px_rgba(42,33,27,0.55)] hover:-translate-y-0.5"
    : "border border-steel-400 text-steel-100 hover:border-forge-500 hover:text-forge-600 hover:-translate-y-0.5";
  return `<a href="${esc(cta.href)}" data-magnetic data-cursor="hover" class="${base} ${styles}">
      <span>${esc(cta.label)}</span>
      <span class="transition-transform duration-300 group-hover:translate-x-1">${icon.arrow}</span>
    </a>`;
}

/* ---------- section heading (with split-text reveal) ---------- */
export function sectionHeading({ eyebrow, title, subtitle, align = "left", index } = {}) {
  const center = align === "center";
  return `<header class="flex flex-col gap-5 max-w-4xl ${center ? "items-center text-center mx-auto" : "items-start"}">
      ${eyebrow ? `<span class="label-mono flex items-center gap-3" data-reveal>${index ? `<span class="text-steel-500">${esc(index)}</span>` : icon.spark}${esc(eyebrow)}</span>` : ""}
      <h2 class="heading-display giant-2 text-steel-50" data-split>${esc(title)}</h2>
      ${subtitle ? `<p class="text-steel-300 text-base md:text-lg leading-relaxed max-w-2xl" data-reveal>${esc(subtitle)}</p>` : ""}
    </header>`;
}

/* ---------- marquee ---------- */
export function marquee(items = [], small = false) {
  const sz = small ? "text-sm" : "text-2xl md:text-3xl font-display font-semibold";
  const row = items.map((t) =>
    `<span class="inline-flex items-center gap-3 px-6 ${sz} ${small ? "text-steel-400 font-mono uppercase tracking-widest" : "text-steel-500"}">${esc(t)}<span class="text-forge-500">${icon.spark}</span></span>`
  ).join("");
  return `<div class="marquee-mask overflow-hidden ${small ? "" : "relative z-10 border-y border-steel-800 bg-steel-950/85 backdrop-blur-sm py-6"}"><div class="marquee-track">${row}${row}</div></div>`;
}

/* ---------- stats ---------- */
export function statBlock(stat, i) {
  return `<div class="flex flex-col gap-2" data-reveal>
      <span class="label-mono text-steel-600">${String(i + 1).padStart(2, "0")}</span>
      <div class="font-display text-4xl md:text-6xl font-bold text-steel-50 leading-none">
        <span class="counter" data-target="${esc(stat.value)}">0</span><span class="text-forge-500">${esc(stat.suffix || "")}</span>
      </div>
      <div class="label-mono text-steel-400 normal-case tracking-widest">${esc(stat.label)}</div>
    </div>`;
}
export function statRow(stats = []) {
  return `<div class="grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-6">${stats.map(statBlock).join("")}</div>`;
}

/* ---------- division card (each carries its own accent colour) ---------- */
export function productCard(cat) {
  const a = cat.accent || "#f97316";
  return `<a href="/product.html?id=${esc(cat.id)}" id="${esc(cat.id)}" data-reveal data-cursor="hover" class="media-card surface-card group flex flex-col" style="border-top:3px solid ${a}">
      <div class="relative h-60 overflow-hidden">
        ${img(cat.image, cat.name, "h-full w-full object-cover opacity-80 group-hover:opacity-100")}
        <div class="absolute inset-0 bg-gradient-to-t from-steel-950 via-steel-950/30 to-transparent"></div>
        <span class="absolute left-5 top-5 numeral text-5xl" style="-webkit-text-stroke:1px ${a}">${esc(cat.code)}</span>
        ${cat.tagline ? `<span class="absolute right-5 top-5 rounded-full px-3 py-1 text-[11px] font-mono uppercase tracking-widest" style="background:${a}1f;color:${a}">${esc(cat.tagline)}</span>` : ""}
      </div>
      <div class="flex flex-1 flex-col gap-4 p-7">
        <h3 class="heading-display text-2xl text-steel-50 transition-colors" style="--tw:0" onmouseover="this.style.color='${a}'" onmouseout="this.style.color=''">${esc(cat.name)}</h3>
        <p class="text-steel-300 text-sm leading-relaxed">${esc(cat.summary)}</p>
        <ul class="flex flex-col gap-2 pt-1">
          ${cat.items.slice(0, 5).map((i) => `<li class="flex items-center gap-2 text-sm text-steel-200"><span style="color:${a}">${icon.check}</span>${esc(i)}</li>`).join("")}
          ${cat.items.length > 5 ? `<li class="pl-6 text-sm text-steel-400">+ ${cat.items.length - 5} more</li>` : ""}
        </ul>
        <span class="mt-auto inline-flex items-center gap-2 pt-3 label-mono" style="color:${a}">Explore division ${icon.arrow}</span>
      </div>
    </a>`;
}

/* ---------- team member card ---------- */
export function teamCard(m) {
  return `<article data-reveal data-cursor="hover" class="media-card surface-card group flex flex-col">
      <div class="relative aspect-[4/5] overflow-hidden">
        ${img(m.image, m.name, "h-full w-full object-cover opacity-85 group-hover:opacity-100")}
        <div class="absolute inset-0 bg-gradient-to-t from-steel-950 via-steel-950/10 to-transparent"></div>
      </div>
      <div class="flex flex-col gap-1 p-6">
        <h3 class="heading-display text-xl text-steel-50">${esc(m.name)}</h3>
        <span class="label-mono text-forge-500 normal-case tracking-widest">${esc(m.role)}</span>
        ${m.bio ? `<p class="mt-2 text-steel-300 text-sm leading-relaxed">${esc(m.bio)}</p>` : ""}
      </div>
    </article>`;
}

/* ---------- image gallery with captions ---------- */
export function gallery(images = []) {
  return `<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
      ${images.map((g) => {
        const src = typeof g === "string" ? g : g.src;
        const label = typeof g === "string" ? "" : g.label;
        return `<figure data-reveal data-cursor="hover" class="media-card group relative overflow-hidden rounded-2xl border border-steel-800 aspect-[4/3]">
          ${img(src, label || "Swastik Enterprises", "h-full w-full object-cover")}
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
          ${label ? `<figcaption class="absolute bottom-0 left-0 right-0 flex items-center gap-2 p-4"><span class="h-1.5 w-1.5 rounded-full bg-forge-500"></span><span class="font-display font-semibold text-white text-sm md:text-base">${esc(label)}</span></figcaption>` : ""}
        </figure>`;
      }).join("")}
    </div>`;
}

/* ---------- partners / distributors ---------- */
export function partnerCard(p, i) {
  return `<div data-reveal data-cursor="hover" class="surface-card flex items-center gap-5 p-6">
      <span class="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-forge-500/10 font-display text-2xl font-bold text-forge-600">${esc(p.name.charAt(0))}</span>
      <div class="flex flex-col">
        <h3 class="heading-display text-lg text-steel-50">${esc(p.name)}</h3>
        ${p.note ? `<span class="text-steel-300 text-sm">${esc(p.note)}</span>` : ""}
      </div>
    </div>`;
}

/* ---------- big editorial capability row ---------- */
export function capabilityRow(item) {
  return `<a href="/contact.html" data-reveal data-cursor="hover" class="edge-row group grid grid-cols-[auto,1fr] items-center gap-6 py-8 md:grid-cols-[200px,1fr,auto] md:gap-10 md:py-10 bleed">
      <span class="numeral text-5xl md:text-8xl">${esc(item.code)}</span>
      <div class="flex flex-col gap-2">
        <h3 class="heading-display text-2xl md:text-4xl text-steel-50 group-hover:text-forge-400 transition-colors">${esc(item.name)}</h3>
        <p class="text-steel-300 text-sm md:text-base max-w-2xl">${esc(item.desc)}</p>
      </div>
      <span class="hidden items-center gap-2 label-mono text-steel-500 transition-all duration-300 group-hover:text-forge-500 group-hover:translate-x-1 md:flex">Enquire ${icon.diag}</span>
    </a>`;
}

/* ---------- industry media card ---------- */
export function industryCard(item) {
  return `<article data-reveal data-cursor="hover" class="media-card group relative flex min-h-[340px] items-end rounded-2xl border border-steel-800">
      ${img(item.image, item.name, "absolute inset-0 h-full w-full object-cover opacity-45 group-hover:opacity-70")}
      <div class="absolute inset-0 bg-gradient-to-t from-steel-950 via-steel-950/60 to-transparent"></div>
      <div class="relative z-10 p-7 flex flex-col gap-2">
        <h3 class="heading-display text-2xl text-steel-50">${esc(item.name)}</h3>
        <p class="text-steel-300 text-sm max-w-sm opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">${esc(item.desc)}</p>
      </div>
    </article>`;
}

/* ---------- process step ---------- */
export function processStep(step) {
  return `<div data-reveal class="relative flex flex-col gap-4 surface-card p-8">
      <span class="numeral text-7xl">${esc(step.no)}</span>
      <h3 class="heading-display text-xl text-steel-50">${esc(step.name)}</h3>
      <p class="text-steel-300 text-sm leading-relaxed">${esc(step.desc)}</p>
    </div>`;
}

/* ---------- feature / value card ---------- */
export function featureCard(v) {
  return `<div data-reveal data-cursor="hover" class="surface-card group p-8 flex flex-col gap-3 transition-colors hover:border-forge-600/60">
      <span class="text-forge-500">${icon.spark}</span>
      <h3 class="heading-display text-xl text-steel-50">${esc(v.name)}</h3>
      <p class="text-steel-300 text-sm leading-relaxed">${esc(v.desc)}</p>
    </div>`;
}

/* ---------- testimonial ---------- */
export function testimonialCard(t) {
  return `<figure data-reveal class="surface-card p-8 flex flex-col gap-6 min-w-[320px] md:min-w-[440px] max-w-[480px]">
      <span class="font-display text-6xl leading-none text-forge-600">&ldquo;</span>
      <blockquote class="text-steel-100 text-lg leading-relaxed -mt-8">${esc(t.quote)}</blockquote>
      <figcaption class="mt-auto"><div class="text-steel-50 font-medium">${esc(t.name)}</div>
        <div class="label-mono text-steel-400 normal-case tracking-normal">${esc(t.role)}</div></figcaption>
    </figure>`;
}

/* ---------- CTA banner ---------- */
export function ctaBanner(banner, cta) {
  return `<section data-rail="Contact" class="bleed py-24 md:py-36 layer">
      <div data-reveal class="relative overflow-hidden rounded-3xl border border-steel-800 forge-glow bg-steel-900/50 px-8 py-16 md:px-16 md:py-24">
        <div class="bp-grid absolute inset-0 opacity-60"></div>
        <div class="relative z-10 flex flex-col gap-6 md:max-w-3xl">
          <span class="label-mono lead">${esc(banner.label)}</span>
          <h2 class="heading-display giant-2 text-steel-50" data-split>${esc(banner.title)}</h2>
          <p class="text-steel-300 md:text-lg max-w-2xl">${esc(banner.body)}</p>
          <div class="flex flex-wrap gap-4 pt-2">${button(cta.primary, "primary")}${button(cta.secondary, "ghost")}</div>
        </div>
      </div>
    </section>`;
}

/* ============================================================
   HUD CHROME
   ============================================================ */
export function hudFrame(content) {
  return `
  <div class="ticker"><div class="marquee-track">${content.marquee.concat(content.marquee).map((t) => `<span class="px-6 font-mono text-[11px] uppercase tracking-[0.25em] text-steel-400">${esc(t)} <span class="text-forge-500">/</span></span>`).join("")}</div></div>`;
}

/* ---------- NAVBAR: floating glass capsule with roll-over links ---------- */
export function navbar(content, currentPath) {
  const links = content.nav.map((l) => {
    const active = l.href === currentPath;
    return `<a href="${esc(l.href)}" data-cursor="hover" class="navx ${active ? "is-active" : ""}">
        <span class="navx-roll"><span class="navx-t">${esc(l.label)}</span><span class="navx-t navx-t2">${esc(l.label)}</span></span>
      </a>`;
  }).join("");
  const mobileLinks = content.nav.map((l, i) =>
    `<a href="${esc(l.href)}" data-cursor="hover" class="group flex items-baseline gap-4 heading-display text-4xl sm:text-6xl text-steel-100 hover:text-forge-400 transition-colors">
      <span class="label-mono text-steel-600">${String(i + 1).padStart(2, "0")}</span>${esc(l.label)}</a>`
  ).join("");

  return `
  <header id="topbar">
    <div class="navbar-shell">
      <nav class="navbar-bar">
        <a href="/index.html" data-cursor="hover" class="brand">
          <span class="brand-mark">S</span>
          <span class="brand-name hidden sm:block">${esc(content.brand.name)}</span>
        </a>
        <div class="navx-group hidden xl:flex">${links}</div>
        <div class="flex items-center gap-4">
          <span class="status-pill hidden lg:flex"><i></i>Open · ${esc(content.brand.established)}</span>
          <div class="hidden sm:block">${button(content.cta.primary, "primary")}</div>
          <button id="menu-open" data-cursor="hover" aria-label="Open menu" class="xl:hidden grid h-10 w-10 place-items-center rounded-lg border border-steel-700 text-steel-100">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>
        </div>
      </nav>
    </div>
  </header>

  <div id="menu-overlay" class="hidden bg-steel-950/98 backdrop-blur-xl">
    <div class="bleed flex items-center justify-between py-4">
      <span class="font-display font-semibold text-steel-50">${esc(content.brand.name)}</span>
      <button id="menu-close" aria-label="Close menu" class="grid h-10 w-10 place-items-center rounded-md border border-steel-700 text-steel-100">
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
    </div>
    <div class="bleed mt-12 flex flex-col gap-5">${mobileLinks}
      <div class="pt-6">${button(content.cta.primary, "primary")}</div>
    </div>
  </div>`;
}

/* ---------- FOOTER ---------- */
export function footer(content) {
  const cols = content.footer.columns.map((col) => `
      <div class="flex flex-col gap-4">
        <h4 class="label-mono text-steel-400">${esc(col.title)}</h4>
        <ul class="flex flex-col gap-3">${col.links.map((l) => `<li><a href="${esc(l.href)}" data-cursor="hover" class="hover-line text-steel-200 hover:text-steel-50 text-sm">${esc(l.label)}</a></li>`).join("")}</ul>
      </div>`).join("");
  const social = content.social.map((s) => `<a href="${esc(s.href)}" data-cursor="hover" class="hover-line text-steel-300 hover:text-forge-400 text-sm">${esc(s.label)}</a>`).join("");
  const b = content.brand;
  return `
  <footer class="relative z-10 border-t border-steel-800 bg-steel-950">
    <div class="bleed border-b border-steel-800 py-14 md:py-20">
      <span class="label-mono lead">Swastik Enterprises</span>
      <h2 class="heading-display leading-[0.85] text-steel-50 mt-5" style="font-size:clamp(2.6rem,11vw,11rem)">Swastik<span class="text-forge-500">.</span><br/><span class="text-outline">Enterprises</span></h2>
      <p class="mt-6 max-w-xl text-steel-400 text-sm">${esc(b.tagline)} · ${esc(b.established)}</p>
    </div>
    <div class="bleed grid gap-12 py-16 md:grid-cols-[1.5fr,1fr,1fr,1.3fr]">
      <div class="flex flex-col gap-4 max-w-xs">
        <a href="/index.html" class="flex items-center gap-3"><span class="grid h-9 w-9 place-items-center rounded-md bg-forge-500 text-steel-950 font-display font-bold">S</span><span class="font-display font-semibold text-steel-50">${esc(b.name)}</span></a>
        <p class="text-steel-400 text-sm leading-relaxed">${esc(content.footer.blurb)}</p>
        <div class="flex gap-5 pt-2">${social}</div>
      </div>
      ${cols}
      <div class="flex flex-col gap-3">
        <h4 class="label-mono text-steel-400">Get in touch</h4>
        <a href="mailto:${esc(b.email)}" class="hover-line text-steel-100 text-sm">${esc(b.email)}</a>
        <a href="tel:${esc(b.phone.replace(/\s/g, ""))}" class="hover-line text-steel-100 text-sm">${esc(b.phone)}</a>
        <p class="text-steel-400 text-sm">${esc(b.address.line1)}<br/>${esc(b.address.line2)}</p>
        <p class="text-steel-500 text-xs mt-1">${esc(b.hours)}</p>
      </div>
    </div>
    <div class="border-t border-steel-800"><div class="bleed flex flex-col gap-2 py-6 text-xs text-steel-500 md:flex-row md:items-center md:justify-between">
      <span>© <span id="year"></span> ${esc(b.name)}. ${esc(content.footer.legal)}</span>
      <span class="font-mono tracking-widest text-steel-600">${esc(b.gst)}</span>
    </div></div>
  </footer>`;
}

export { icon, img };
