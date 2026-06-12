/* ============================================================
   pages.js — full-bleed, edge-anchored page assemblies (FORGE-OS).
   Composes the reusable blocks from components.js. No duplication.
   Sections carry data-rail="…" so the HUD rail auto-builds itself.
   ============================================================ */
import {
  esc, icon, img, button, sectionHeading, marquee, statRow,
  productCard, capabilityRow, industryCard, processStep,
  featureCard, testimonialCard, ctaBanner, teamCard, gallery, partnerCard,
} from "./components.js";

/* ---------- HERO: light, multi-division (all four aisles shown) ---------- */
function hero(c) {
  const h = c.home.hero;
  const lines = h.titleLines.map((line) => {
    const html = line.replace(new RegExp(`(${h.highlight})`, "i"), `<span style="color:var(--forge)">$1</span>`);
    return `<span class="reveal-mask"><span data-hero-line class="line-inner">${html}</span></span>`;
  }).join("");

  const collage = c.products.categories.map((d) =>
    `<a href="/product.html?id=${esc(d.id)}" data-cursor="hover" class="media-card group relative overflow-hidden rounded-2xl border border-steel-800" style="border-top:3px solid ${d.accent}">
        ${img(d.image, d.name, "aspect-[4/3] h-full w-full object-cover")}
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
        <span class="absolute bottom-3 left-3 right-3 font-display font-semibold text-white text-sm leading-tight">${esc(d.name)}</span>
      </a>`).join("");

  return `
  <section data-rail="Home" class="bleed pt-32 pb-16 md:pt-40 md:pb-24 layer">
    <div class="grid gap-12 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
      <div class="flex flex-col gap-6">
        <span class="label-mono lead" data-reveal>${esc(h.eyebrow)}</span>
        <h1 class="heading-display giant-2 text-steel-50">${lines}</h1>
        <p class="max-w-xl text-steel-200 text-base md:text-lg leading-relaxed" data-reveal>${esc(h.subtitle)}</p>
        <div class="flex flex-wrap items-center gap-5 pt-1" data-reveal>
          ${button(c.cta.primary, "primary")}${button(c.cta.secondary, "ghost")}
          <div class="flex items-center gap-3 pl-1">
            <span class="font-display text-4xl font-bold text-forge-600">${esc(h.stat.value)}</span>
            <span class="font-mono text-[11px] uppercase tracking-widest text-steel-400 max-w-[130px]">${esc(h.stat.label)}</span>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">${collage}</div>
    </div>
  </section>`;
}

/* ---------- intro split ---------- */
function introSplit(c) {
  const i = c.home.intro;
  return `
  <section data-rail="About" class="bleed py-24 md:py-32 layer">
    <div class="grid gap-14 lg:grid-cols-2 lg:items-center">
      <div class="relative" data-reveal>
        <div class="media-card overflow-hidden rounded-3xl border border-steel-800">
          ${img("https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=1100&q=80", "Spices, dry fruits and hardware supplied by Swastik Enterprises", "h-[480px] w-full object-cover")}
        </div>
        <div class="surface-card absolute -bottom-6 -right-4 hidden flex-col gap-1 p-5 sm:flex">
          <span class="font-display text-3xl font-bold text-steel-50">${esc(c.brand.established)}</span>
          <span class="label-mono text-steel-400 normal-case tracking-widest">Trusted across the region</span>
        </div>
      </div>
      <div class="flex flex-col gap-7">
        ${sectionHeading({ eyebrow: i.label, title: i.title, index: "01" })}
        <p class="text-steel-300 text-base md:text-lg leading-relaxed" data-reveal>${esc(i.body)}</p>
        <ul class="flex flex-col gap-3" data-reveal>
          ${i.points.map((p) => `<li class="flex items-center gap-3 text-steel-100"><span class="text-forge-500">${icon.check}</span>${esc(p)}</li>`).join("")}
        </ul>
        <div data-reveal class="pt-1">${button({ label: "More about us", href: "/about.html" }, "ghost")}</div>
      </div>
    </div>
  </section>`;
}

/* ---------- stats band ---------- */
function statsBand(c) {
  return `<section data-rail="Metrics" class="relative z-10 border-y border-steel-800 bg-steel-950/70 backdrop-blur-sm layer"><div class="bleed py-16 md:py-20">${statRow(c.home.stats)}</div></section>`;
}

/* ---------- products preview (clean grid) ---------- */
function productsReel(c) {
  return `
  <section data-rail="Products" class="bleed py-24 md:py-32 layer">
    <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      ${sectionHeading({ eyebrow: c.products.header.eyebrow, title: c.products.header.title, subtitle: c.products.header.subtitle, index: "02" })}
      <div class="hidden md:block shrink-0">${button({ label: "Full catalogue", href: "/products.html" }, "ghost")}</div>
    </div>
    <div class="mt-14 grid gap-6 md:grid-cols-2">${c.products.categories.map(productCard).join("")}</div>
    <div class="mt-10 md:hidden">${button({ label: "All divisions", href: "/products.html" }, "ghost")}</div>
  </section>`;
}

/* ---------- capability rows ---------- */
function capabilitiesList(c, withHeading = true) {
  const head = withHeading ? `<div class="bleed pb-4">${sectionHeading({ eyebrow: c.capabilities.header.eyebrow, title: c.capabilities.header.title, subtitle: c.capabilities.header.subtitle, index: "03" })}</div>` : "";
  return `<section data-rail="Capabilities" class="py-24 md:py-32 layer">${head}<div class="mt-6 border-b border-steel-800">${c.capabilities.list.map(capabilityRow).join("")}</div></section>`;
}

/* ---------- process ---------- */
function processSection(c) {
  return `<section data-rail="Process" class="bleed py-24 md:py-32 layer">
      <div class="mb-14">${sectionHeading({ eyebrow: c.process.label, title: c.process.title, index: "04" })}</div>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">${c.process.steps.map(processStep).join("")}</div>
    </section>`;
}

/* ---------- why ---------- */
function whySection(c) {
  return `<section data-rail="Why" class="bleed py-24 md:py-32 layer">
      <div class="grid gap-14 lg:grid-cols-[0.9fr,1.1fr] lg:items-start">
        <div class="lg:sticky lg:top-28">${sectionHeading({ eyebrow: c.why.label, title: c.why.title, index: "05" })}</div>
        <div class="grid gap-5 sm:grid-cols-2">${c.why.list.map(featureCard).join("")}</div>
      </div>
    </section>`;
}

/* ---------- testimonials ---------- */
function testimonialsSection(c) {
  return `<section data-rail="Clients" class="py-24 md:py-32 layer">
      <div class="bleed mb-14">${sectionHeading({ eyebrow: "Word from the floor", title: "Buyers who never let their dates slip.", index: "06" })}</div>
      <div class="marquee-mask overflow-x-auto md:overflow-hidden"><div class="flex gap-6 pb-4" style="padding-inline:var(--edge)">${c.testimonials.map(testimonialCard).join("")}</div></div>
    </section>`;
}

/* ---------- gallery ---------- */
function gallerySection(c) {
  if (!c.home.gallery || !c.home.gallery.length) return "";
  return `<section data-rail="Gallery" class="bleed py-24 md:py-32 layer">
      <div class="mb-12">${sectionHeading({ eyebrow: "On the floor", title: "Where the work happens.", index: "07" })}</div>
      ${gallery(c.home.gallery)}
    </section>`;
}

/* ---------- team ---------- */
function teamSection(c) {
  if (!c.about.team || !c.about.team.length) return "";
  return `<section data-rail="Team" class="bleed py-24 md:py-32 layer">
      <div class="mb-12">${sectionHeading({ eyebrow: "The people", title: "The team behind the parts.", subtitle: "A small, hands-on family business — you talk to the people who actually make and ship your order.", index: "T" })}</div>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">${c.about.team.map(teamCard).join("")}</div>
    </section>`;
}

/* ---------- partners & distributors ---------- */
function partnersSection(c) {
  if (!c.partners || !c.partners.list || !c.partners.list.length) return "";
  return `<section data-rail="Partners" class="bleed py-24 md:py-32 layer">
      <div class="mb-12">${sectionHeading({ eyebrow: c.partners.label, title: c.partners.title, subtitle: c.partners.subtitle, index: "08" })}</div>
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">${c.partners.list.map(partnerCard).join("")}</div>
    </section>`;
}

/* ---------- contact form helper ---------- */
function formField(f) {
  let control;
  if (f.type === "textarea") control = `<textarea name="${esc(f.name)}" rows="5" placeholder="${esc(f.placeholder || "")}" ${f.required ? "required" : ""}></textarea>`;
  else if (f.type === "select") control = `<select name="${esc(f.name)}" ${f.required ? "required" : ""}><option value="" disabled selected>Choose one…</option>${f.options.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join("")}</select>`;
  else control = `<input type="${esc(f.type)}" name="${esc(f.name)}" placeholder="${esc(f.placeholder || "")}" ${f.required ? "required" : ""}/>`;
  const span = f.type === "textarea" || f.type === "select" ? "sm:col-span-2" : "";
  return `<div class="field ${span}"><label>${esc(f.label)}${f.required ? ' <span class="text-forge-500">*</span>' : ""}</label>${control}</div>`;
}

/* ---------- generic page header band ---------- */
function pageHeader(head, index) {
  return `<section data-rail="${esc(head.eyebrow)}" class="bleed pt-36 pb-10 md:pt-44 layer">${sectionHeading({ eyebrow: head.eyebrow, title: head.title, subtitle: head.subtitle, index })}</section>`;
}

/* =========================================================
   PAGE BUILDERS
   ========================================================= */
function pageHome(c) {
  return hero(c) + marquee(c.marquee) + introSplit(c) + statsBand(c) +
    productsReel(c) + capabilitiesList(c) + processSection(c) +
    gallerySection(c) + whySection(c) + testimonialsSection(c) +
    partnersSection(c) + ctaBanner(c.home.ctaBanner, c.cta);
}

function pageProducts(c) {
  return pageHeader(c.products.header, "P") +
    `<section data-rail="Divisions" class="bleed pb-24 md:pb-32 layer"><div class="grid gap-6 md:grid-cols-2">${c.products.categories.map(productCard).join("")}</div></section>` +
    capabilitiesList(c) + ctaBanner(c.home.ctaBanner, c.cta);
}

function pageCapabilities(c) {
  return pageHeader(c.capabilities.header, "C") + capabilitiesList(c, false) +
    processSection(c) + whySection(c) + ctaBanner(c.home.ctaBanner, c.cta);
}

function pageIndustries(c) {
  return pageHeader(c.industries.header, "I") +
    `<section data-rail="Sectors" class="bleed pb-24 md:pb-32 layer"><div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">${c.industries.list.map(industryCard).join("")}</div></section>` +
    testimonialsSection(c) + ctaBanner(c.home.ctaBanner, c.cta);
}

function pageAbout(c) {
  const a = c.about;
  return pageHeader(a.header, "A") + `
  <section data-rail="Story" class="bleed pb-16 layer">
    <div class="grid gap-14 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
      <div class="media-card overflow-hidden rounded-3xl border border-steel-800" data-reveal>
        ${img("https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1100&q=80", "Inside the Swastik Enterprises workshop", "h-[480px] w-full object-cover")}
      </div>
      <div class="flex flex-col gap-5">${a.story.map((p) => `<p class="text-steel-300 text-base md:text-lg leading-relaxed" data-reveal>${esc(p)}</p>`).join("")}</div>
    </div>
  </section>
  <section data-rail="Metrics" class="relative z-10 border-y border-steel-800 bg-steel-950/70 layer"><div class="bleed py-16 md:py-20">${statRow(a.stats)}</div></section>
  <section data-rail="Values" class="bleed py-24 md:py-32 layer">
    <div class="mb-14">${sectionHeading({ eyebrow: "What we stand on", title: "Three values, no compromises.", index: "V" })}</div>
    <div class="grid gap-5 md:grid-cols-3">${a.values.map(featureCard).join("")}</div>
  </section>` + teamSection(c) + partnersSection(c) + ctaBanner(c.home.ctaBanner, c.cta);
}

/* ---------- product detail page (opened from a product card) ---------- */
function pageProductDetail(c) {
  const id = new URLSearchParams(location.search).get("id");
  const cat = c.products.categories.find((x) => x.id === id) || c.products.categories[0];
  const related = c.products.categories.filter((x) => x.id !== cat.id).slice(0, 3);
  const a = cat.accent || "#f97316";
  document.title = `${cat.name} | Swastik Enterprises`;

  return `
  <section class="bleed pt-36 pb-12 md:pt-44 layer" data-rail="Overview">
    <a href="/products.html" data-cursor="hover" class="inline-flex items-center gap-2 label-mono text-steel-400 hover:text-forge-400 mb-8"><span class="rotate-180 inline-flex">${icon.arrow}</span> All divisions</a>
    <div class="grid gap-12 lg:grid-cols-[1fr,1fr] lg:items-center">
      <div class="media-card overflow-hidden rounded-3xl border border-steel-800" data-reveal style="border-top:3px solid ${a}">
        ${img(cat.image, cat.name, "h-[440px] w-full object-cover")}
      </div>
      <div class="flex flex-col gap-6">
        <span class="label-mono lead" style="color:${a}">Division ${esc(cat.code)}${cat.tagline ? " · " + esc(cat.tagline) : ""}</span>
        <h1 class="heading-display giant-2 text-steel-50" data-split>${esc(cat.name)}</h1>
        <p class="text-steel-300 text-base md:text-lg leading-relaxed" data-reveal>${esc(cat.long || cat.summary)}</p>
        <div class="flex flex-wrap gap-4 pt-2" data-reveal>${button(c.cta.primary, "primary")}${button({ label: "WhatsApp us", href: `https://wa.me/${c.brand.whatsapp.replace(/[^0-9]/g, "")}` }, "ghost")}</div>
      </div>
    </div>
  </section>

  <section class="bleed py-16 layer" data-rail="Specs">
    <div class="grid gap-12 md:grid-cols-2">
      <div data-reveal>
        <h2 class="label-mono mb-6">Specifications</h2>
        <ul class="flex flex-col">
          ${(cat.specs || cat.items).map((s) => `<li class="flex items-center gap-3 border-t border-steel-800 py-4 text-steel-100"><span style="color:${a}">${icon.check}</span>${esc(s)}</li>`).join("")}
        </ul>
      </div>
      <div data-reveal>
        <h2 class="label-mono mb-6">Typical applications</h2>
        <ul class="flex flex-col">
          ${(cat.applications || []).map((s) => `<li class="flex items-center gap-3 border-t border-steel-800 py-4 text-steel-100"><span style="color:${a}">${icon.diag}</span>${esc(s)}</li>`).join("")}
        </ul>
        <div class="mt-8 surface-card p-6 flex flex-col gap-2">
          <span class="label-mono text-steel-400">Need a specific spec?</span>
          <p class="text-steel-200 text-sm">Call <a href="tel:${esc(c.brand.phone.replace(/\s/g, ""))}" class="text-forge-400 hover-line">${esc(c.brand.phone)}</a> or send your drawing — we'll match it.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="bleed py-20 md:py-28 layer" data-rail="More">
    <div class="mb-12">${sectionHeading({ eyebrow: "Keep exploring", title: "Related products." })}</div>
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">${related.map(productCard).join("")}</div>
  </section>
  ${ctaBanner(c.home.ctaBanner, c.cta)}`;
}

function pageContact(c) {
  const ct = c.contact, b = c.brand;
  const info = [
    { k: "Email", v: b.email, href: `mailto:${b.email}` },
    { k: "Phone", v: b.phone, href: `tel:${b.phone.replace(/\s/g, "")}` },
    { k: "WhatsApp", v: b.whatsapp, href: `https://wa.me/${b.whatsapp.replace(/[^0-9]/g, "")}` },
    { k: "Visit", v: `${b.address.line1}, ${b.address.line2}`, href: "#map" },
    { k: "Hours", v: b.hours, href: null },
  ];
  return pageHeader(ct.header, "Q") + `
  <section data-rail="Enquiry" class="bleed pb-24 md:pb-32 layer">
    <div class="grid gap-10 lg:grid-cols-[1.2fr,0.8fr]">
      <form id="quote-form" novalidate data-reveal class="surface-card p-7 md:p-10">
        <div class="grid gap-5 sm:grid-cols-2">${ct.form.fields.map(formField).join("")}</div>
        <div class="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button type="submit" data-magnetic data-cursor="hover" class="group inline-flex items-center gap-2 rounded-full bg-forge-500 px-7 py-3 text-sm font-medium text-steel-950 transition-colors hover:bg-forge-400">${esc(ct.form.submit)}<span class="transition-transform group-hover:translate-x-1">${icon.arrow}</span></button>
          <p class="font-mono text-[11px] uppercase tracking-widest text-steel-500">${esc(ct.form.note)}</p>
        </div>
        <p id="form-status" class="mt-4 hidden rounded-lg border border-forge-600/40 bg-forge-500/10 px-4 py-3 text-sm text-forge-400"></p>
      </form>
      <aside class="flex flex-col gap-6">
        <div class="surface-card p-7 flex flex-col divide-y divide-steel-800">
          ${info.map((i) => `<div class="flex flex-col gap-1 py-4 first:pt-0 last:pb-0"><span class="label-mono text-steel-500">${esc(i.k)}</span>${i.href ? `<a href="${esc(i.href)}" data-cursor="hover" class="hover-line text-steel-100">${esc(i.v)}</a>` : `<span class="text-steel-100">${esc(i.v)}</span>`}</div>`).join("")}
        </div>
        <div id="map" class="overflow-hidden rounded-2xl border border-steel-800"><iframe title="Swastik Enterprises location" loading="lazy" class="h-64 w-full" src="https://maps.google.com/maps?q=Ashok%20Vihar%20Phase%201%20Chhotu%20Ram%20Chowk&t=&z=14&ie=UTF8&iwloc=&output=embed"></iframe></div>
      </aside>
    </div>
  </section>`;
}

/* ---------- full product list (catalogue) with image cards ---------- */
function productItemCard(cat, item, i) {
  const a = cat.accent || "#bf5a2a";
  const pool = cat.images && cat.images.length ? cat.images : [cat.image];
  const src = pool[i % pool.length];
  return `<a href="/product.html?id=${esc(cat.id)}" data-cursor="hover" class="media-card surface-card group overflow-hidden flex flex-col">
      <div class="relative aspect-[4/3] overflow-hidden">
        ${img(src, item, "h-full w-full object-cover")}
        <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent"></div>
        <span class="absolute left-3 top-3 h-2.5 w-2.5 rounded-full" style="background:${a}"></span>
      </div>
      <div class="flex items-center justify-between gap-3 p-4">
        <span class="font-display text-base leading-tight text-steel-50">${esc(item)}</span>
        <span class="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider" style="background:${a}1a;color:${a}">Loose · Bulk</span>
      </div>
    </a>`;
}

function pageCatalog(c) {
  const groups = c.products.categories.map((cat) => `
    <section data-rail="${esc(cat.name)}" class="bleed py-12 md:py-16 layer">
      <div class="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-steel-800 pb-6">
        <div class="flex items-center gap-5">
          <span class="numeral text-5xl md:text-7xl" style="-webkit-text-stroke:1px ${cat.accent}">${esc(cat.code)}</span>
          <div class="flex flex-col">
            <h2 class="heading-display text-2xl md:text-4xl text-steel-50">${esc(cat.name)}</h2>
            <span class="text-steel-300 text-sm max-w-xl">${esc(cat.summary)}</span>
          </div>
        </div>
        <a href="/product.html?id=${esc(cat.id)}" data-cursor="hover" class="inline-flex items-center gap-2 label-mono" style="color:${cat.accent}">Open division ${icon.arrow}</a>
      </div>
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        ${cat.items.map((it, i) => productItemCard(cat, it, i)).join("")}
      </div>
    </section>`).join("");
  return `<section class="bleed pt-36 pb-4 md:pt-44 layer">${sectionHeading({ eyebrow: c.catalog.header.eyebrow, title: c.catalog.header.title, subtitle: c.catalog.header.subtitle, index: "P" })}</section>${groups}${marquee(c.marquee)}${ctaBanner(c.home.ctaBanner, c.cta)}`;
}

export const builders = {
  home: pageHome, products: pageProducts, capabilities: pageCapabilities,
  industries: pageIndustries, about: pageAbout, contact: pageContact,
  catalog: pageCatalog, "product-detail": pageProductDetail,
};
