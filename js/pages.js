/* ============================================================
   pages.js — one entry per page: { render(c, ctx), init?(data) }.
   render() runs at build time and returns the page's <main> HTML;
   init() runs in the browser to wire up that page's widgets.
   ============================================================ */
import {
  esc, rich, fmt, img, icon, btn, eyebrow, splitTitle, sectionHead, stats, divColor, DIVS,
  allItems, productCard, addBtn, chipAdd, addData, pageHero, ctaBlock, testimonials, partners,
  logoMark, petal, splitName, initials, telHref, waHref, mapsHref, mapsEmbed, shelfStrip,
} from "./ui.js";
import { statusPill } from "./chrome.js";
import { indexItems, searchItems } from "./search.js";
import { quote, quoteText, toast } from "./quote.js";

const byId = (c) => Object.fromEntries(c.products.categories.map((d) => [d.id, d]));
const itemsById = (c) => Object.fromEntries(allItems(c).map((i) => [i.id, i]));
const lines = (n, ui) => (n === 1 ? ui.productLine : fmt(ui.productLines, { n }));
/* Four lanes (one per division) converging on one delivery hub. */
const mergePath = (i) => { const y = 14 + i * 25.3; return `M0 ${y} C 110 ${y}, 120 53, 214 53`; };

/* Interleave items so neighbouring chips alternate division colours. */
function interleave(items) {
  const groups = DIVS.map((d) => items.filter((i) => i.div === d));
  const out = [];
  for (let i = 0; out.length < items.length; i++) groups.forEach((g) => g[i] && out.push(g[i]));
  return out;
}

/* ============================================================
   Shared sections
   ============================================================ */
function aislesSection(c, idx) {
  const a = c.home.aisles;
  const ui = c.ui;
  const all = allItems(c);
  return `<section class="section aisles-sec" id="divisions">
    <div class="container">
      ${sectionHead({ idx, label: a.label, title: a.title, body: a.subtitle, side: btn(ui.browseProducts, "catalog.html", { variant: "ghost" }) })}
      <div class="aisles" data-aisles>
        ${c.products.categories
          .map((d, i) => {
            const items = all.filter((x) => x.div === d.id);
            return `<article class="aisle${i === 0 ? " is-active" : ""}" style="--c:${divColor(d.id)}" data-aisle>
            <button class="aisle__tab" type="button" aria-expanded="${i === 0}" aria-controls="aisle-${d.id}">
              <span class="aisle__no">${esc(d.code)}</span>
              <span class="aisle__label">${esc(d.short)}</span>
              <span class="aisle__count">${items.length}</span>
              <span class="aisle__plus">${icon("plus")}</span>
            </button>
            <div class="aisle__panel" id="aisle-${d.id}"${i === 0 ? "" : " inert"}>
              <a class="aisle__media" href="${esc(d.file)}" data-vt="div-${d.id}" tabindex="-1">${img(d.image, d.name, { w: 1200, sizes: "(max-width: 900px) 100vw, 45vw" })}</a>
              <div class="aisle__body">
                <span class="tagpill">${petal()}${esc(d.tagline)}</span>
                <h3 class="aisle__name">${esc(d.name)}</h3>
                <p class="aisle__summary">${esc(d.summary)}</p>
                <div class="chipwrap">${items.slice(0, 6).map((it) => chipAdd(it, ui)).join("")}</div>
                <div class="aisle__cta">
                  ${btn(`${ui.explore} ${d.short}`, d.file, { attrs: `data-vt-link="div-${d.id}"` })}
                  ${btn(lines(items.length, ui), `catalog.html#${d.id}`, { variant: "ghost", icon: "arrow" })}
                </div>
              </div>
            </div>
          </article>`;
          })
          .join("")}
      </div>
    </div>
  </section>`;
}

function bento(c, idx) {
  const b = c.why.bento;
  const ui = c.ui;
  const calc = ui.calc;
  const foodGrade = itemsById(c)["packaging-food-grade"];
  const ring = (pct) => {
    const r = 52, C = 2 * Math.PI * r;
    return `<svg class="ring" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="${r}" class="ring__track"/><circle cx="60" cy="60" r="${r}" class="ring__bar" style="--len:${C.toFixed(1)};--off:${(C * (1 - pct / 100)).toFixed(1)}"/></svg>`;
  };
  return `<section class="section why">
    <div class="container">
      ${sectionHead({ idx, label: c.why.label, title: c.why.title })}
      <div class="bento">
        <article class="tile tile--invoice" data-reveal>
          <div class="tile__head">
            <span class="tile__label">${esc(b.invoice.label)}</span>
            <h3 class="tile__title">${esc(b.invoice.title)}</h3>
            <p class="tile__body">${esc(b.invoice.body)}</p>
          </div>
          <div class="receipt" data-receipt>
            <div class="receipt__head"><span class="receipt__brand">${logoMark()}${esc(c.brand.name)}</span><span>${esc(b.invoice.head)}</span></div>
            <ul class="receipt__lines">${b.invoice.lines.map((l, i) => `<li style="--c:${divColor(l[0])};--i:${i}"><i></i><span>${esc(l[1])}</span><b>${esc(l[2])}</b></li>`).join("")}</ul>
            <div class="receipt__foot"><span class="receipt__check">${icon("check")}</span>${esc(b.invoice.foot)}</div>
          </div>
        </article>

        <article class="tile tile--quote" data-reveal style="--d:80ms">
          <span class="tile__label">${esc(b.quote.label)}</span>
          <div class="tile__big"><span data-count="${esc(b.quote.value)}">${esc(b.quote.value)}</span><small>${esc(b.quote.suffix)}</small></div>
          <div class="clock" aria-hidden="true" data-clock><i class="clock__h"></i><i class="clock__m"></i><i class="clock__s"></i></div>
          <h3 class="tile__title">${esc(b.quote.title)}</h3>
          <p class="tile__body">${esc(b.quote.body)}</p>
        </article>

        <article class="tile tile--ontime" data-reveal style="--d:160ms">
          <span class="tile__label">${esc(b.ontime.label)}</span>
          <div class="ringwrap">${ring(Number(b.ontime.value))}<span class="ringwrap__val"><span data-count="${esc(b.ontime.value)}">${esc(b.ontime.value)}</span>%</span></div>
          <h3 class="tile__title">${esc(b.ontime.title)}</h3>
        </article>

        <article class="tile tile--loose" data-reveal data-switch-tile>
          <span class="tile__label">${esc(b.loose.label)}</span>
          <h3 class="tile__title">${esc(b.loose.title)}</h3>
          <div class="switch" role="group" aria-label="${esc(b.loose.label)}">
            <button type="button" class="switch__opt is-on" data-switch="a" aria-pressed="true">${icon("scale")}${esc(b.loose.a)}</button>
            <button type="button" class="switch__opt" data-switch="b" aria-pressed="false">${icon("truck")}${esc(b.loose.b)}</button>
            <span class="switch__thumb" aria-hidden="true"></span>
          </div>
          <p class="switch__text" data-switch-text data-a="${esc(b.loose.aText)}" data-b="${esc(b.loose.bText)}">${esc(b.loose.aText)}</p>
        </article>

        <article class="tile tile--img tile--quality" data-reveal style="--d:80ms">
          ${img(b.quality.image, b.quality.title, { w: 800, sizes: "(max-width: 900px) 100vw, 30vw" })}
          <div class="tile__overlay"><span class="tile__label">${esc(b.quality.label)}</span><h3 class="tile__title">${esc(b.quality.title)}</h3></div>
        </article>

        <article class="tile tile--calc" data-reveal data-calc data-add-base="${addData(foodGrade)}">
          <span class="tile__label">${esc(calc.label)}</span>
          <h3 class="tile__title">${esc(calc.title)}</h3>
          <div class="calc">
            <label class="calc__field"><span>${esc(calc.total)}</span><input type="number" inputmode="decimal" min="0" step="any" value="25" data-calc-kg></label>
            <label class="calc__field"><span>${esc(calc.pack)}</span><select data-calc-pack>${calc.packs.map((p, i) => `<option value="${[0.05, 0.1, 0.25, 0.5, 1, 5][i]}"${i === 2 ? " selected" : ""}>${esc(p)}</option>`).join("")}</select></label>
          </div>
          <div class="calc__out">
            <div><b class="calc__n" data-calc-n>100</b> <span data-calc-unit>${esc(fmt(calc.result, { n: "" }).trim())}</span><small data-calc-sub data-tpl="${esc(calc.resultSub)}"></small></div>
            <button class="btn btn--ink btn--sm" type="button" data-calc-add data-tpl="${esc(calc.add)}" data-ic="plus"><span class="btn__label">${esc(fmt(calc.add, { n: 100 }))}</span><span class="btn__icon">${icon("plus")}</span></button>
          </div>
          <div class="merge" aria-hidden="true">
            <svg class="merge__svg" viewBox="0 0 260 104">${DIVS.map((_, i) => `<path d="${mergePath(i)}"/>`).join("")}</svg>
            ${DIVS.map((d, i) => `<span class="merge__dot" style="--c:${divColor(d)};--i:${i};offset-path:path('${mergePath(i)}')"></span>`).join("")}
            <span class="merge__hub">${icon("package")}</span>
          </div>
        </article>

        <article class="tile tile--img tile--fab" data-reveal style="--d:80ms">
          ${img(b.fab.image, b.fab.title, { w: 1400, sizes: "(max-width: 900px) 100vw, 60vw" })}
          <div class="tile__overlay"><span class="tile__label">${esc(b.fab.label)}</span><h3 class="tile__title">${esc(b.fab.title)}</h3><p class="tile__body">${esc(b.fab.body)}</p></div>
        </article>
      </div>
    </div>
  </section>`;
}

function processSection(c, idx) {
  const p = c.process;
  return `<section class="section process dark">
    <div class="container">
      ${sectionHead({ idx, label: p.label, title: p.title, cls: "shead--light" })}
      <div class="steps" data-steps>
        <div class="steps__line" aria-hidden="true"><i data-steps-line></i></div>
        ${p.steps
          .map(
            (s, i) => `<article class="step" data-step style="--c:${divColor(DIVS[i % 4])};--k:${i}">
          <span class="step__node">${icon(s.icon)}</span>
          <span class="step__no">${esc(s.no)}</span>
          <h3>${esc(s.name)}</h3>
          <p>${esc(s.desc)}</p>
        </article>`
          )
          .join("")}
      </div>
    </div>
  </section>`;
}

function explorer(c, idx) {
  const a = c.home.audience;
  const ui = c.ui;
  const D = byId(c);
  const I = itemsById(c);
  const list = c.industries.list;
  return `<section class="section audience">
    <div class="container">
      ${sectionHead({ idx, label: a.label, title: a.title, body: a.subtitle })}
      <div class="explorer" data-explorer>
        <div class="explorer__list" role="tablist" aria-orientation="vertical">
          ${list
            .map(
              (x, i) => `<button class="explorer__tab" role="tab" type="button" id="ex-tab-${i}" aria-controls="ex-panel-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">
              <span class="explorer__no">0${i + 1}</span>
              <span class="explorer__name">${esc(x.name)}</span>
              <span class="explorer__dots">${x.divisions.map((d) => `<i style="--c:${divColor(d)}"></i>`).join("")}</span>
            </button>`
            )
            .join("")}
        </div>
        <div class="explorer__stage">
          ${list
            .map((x, i) => {
              const starter = (x.starter || []).map((id) => I[id]).filter(Boolean);
              return `<div class="explorer__panel" role="tabpanel" id="ex-panel-${i}" aria-labelledby="ex-tab-${i}"${i === 0 ? "" : " hidden"}>
              <div class="explorer__media">${img(x.image, x.name, { w: 1100, sizes: "(max-width: 900px) 100vw, 50vw" })}
                <div class="explorer__tags">${x.divisions.map((d) => `<a class="dtag" href="${esc(D[d].file)}" style="--c:${divColor(d)}"><i></i>${esc(D[d].short)}</a>`).join("")}</div>
              </div>
              <div class="explorer__body">
                <h3 class="h3">${esc(x.name)}</h3>
                <p>${esc(x.desc)}</p>
                <span class="explorer__label">${esc(ui.home.audienceTypical)}</span>
                <div class="chipwrap">${starter.map((it) => chipAdd(it, ui)).join("")}</div>
                <button class="btn btn--ink" type="button" data-ic="plus" data-starter='${esc(JSON.stringify(starter.map((s) => s.id)))}'><span class="btn__label">${esc(ui.home.audienceLoad)}</span><span class="btn__icon">${icon("plus")}</span></button>
              </div>
            </div>`;
            })
            .join("")}
        </div>
      </div>
    </div>
  </section>`;
}

function voices(c, idx) {
  const v = c.home.voices;
  return `<section class="section voices">
    <div class="container">
      <div class="voices__grid">
        ${sectionHead({ idx, label: v.label, title: v.title, body: v.body })}
        ${testimonials(c.testimonials, c.ui)}
      </div>
      <div class="partners-wrap">
        <div class="partners-head">${eyebrow(c.partners.label)}<h3 class="h3">${rich(c.partners.title)}</h3></div>
        ${partners(c.partners)}
      </div>
    </div>
  </section>`;
}

function otherCard(d, ui) {
  return `<a class="ocard" href="${esc(d.file)}" style="--c:${divColor(d.id)}" data-vt-link="div-${d.id}">
    <span class="ocard__img" data-vt="div-${d.id}">${img(d.image, d.name, { w: 400, ratio: 0.8, sizes: "120px" })}</span>
    <span class="ocard__body"><small>${esc(d.code)} · ${esc(fmt(ui.productLines, { n: d.items.length }))}</small><b>${esc(d.name)}</b></span>
    <span class="ocard__go">${icon("arrowUR")}</span>
  </a>`;
}

/* ============================================================
   Home
   ============================================================ */
const home = {
  render(c) {
    const h = c.home.hero;
    const ui = c.ui;
    const b = c.brand;
    const I = itemsById(c);
    const D = byId(c);
    const tokens = h.tokens.map((id) => I[id]).filter(Boolean);
    const title = h.title.map((l, i) => `<span class="hline"><span class="hline__i" style="--i:${i}">${rich(l)}</span></span>`).join("");

    const keys = { fasteners: "hardware", masale: "spices", fruits: "dryfruits", polybags: "packaging" };
    const words = c.home.intro.statement.split(/\s+/);
    const statement = words
      .map((w, i) => {
        const k = Object.keys(keys).find((x) => w.toLowerCase().startsWith(x));
        return `<span class="sw" style="--p:${(i / words.length).toFixed(3)}">${esc(w)}</span>${k ? ` <span class="spill" style="--c:${divColor(keys[k])}">${img(D[keys[k]].image, "", { w: 200, ratio: 0.5, sizes: "90px" })}</span>` : ""}`;
      })
      .join(" ");

    return {
      html: `
      <section class="hero" data-hero>
        <div class="hero__bg" aria-hidden="true"><div class="hero__grid"></div><div class="hero__glow"></div></div>
        <div class="container hero__inner">
          <div class="hero__top">
            ${eyebrow(h.eyebrow)}
            <span class="hero__est">${statusPill(b)}<span class="hide-sm">${esc(b.established)}</span></span>
          </div>
          <h1 class="hero__title" data-kinetic>${title}</h1>
          <div class="hero__row">
            <p class="hero__sub">${esc(h.subtitle)}</p>
            <div class="hero__actions">
              ${btn(ui.getWholesaleQuote, "contact.html")}
              ${btn(ui.browseProducts, "catalog.html", { variant: "ghost", icon: "arrow" })}
            </div>
          </div>
        </div>
        <div class="shelf" data-shelf>
          <div class="shelf__floor"><span class="shelf__hint" data-touch="${esc(ui.home.shelfHintTouch)}">${esc(ui.home.shelfHint)}</span></div>
          <div class="shelf__tokens">
            ${tokens
              .map(
                (it) => `<button class="token" type="button" data-add="${addData(it)}" aria-pressed="false" aria-label="${esc(fmt(ui.addTo, { name: it.raw }))}" style="--c:${divColor(it.div)}">
                <span class="token__img">${img(it.image, "", { w: 120, ratio: 1, sizes: "44px", eager: true })}</span>
                <span class="token__name">${esc(it.name)}</span>
                <span class="token__mark">${icon("plus")}${icon("check")}</span>
              </button>`
              )
              .join("")}
          </div>
        </div>
      </section>

      ${shelfStrip(interleave(allItems(c)).slice(0, 24))}

      ${aislesSection(c, "01")}

      <section class="section intro">
        <div class="container">
          <div class="intro__grid">
            <div class="intro__label">${eyebrow(c.home.intro.label, "02")}${btn(c.nav.find((n) => n.href === "about.html")?.label || "About", "about.html", { variant: "ghost", icon: "arrow", size: "sm" })}</div>
            <p class="statement" data-scrub>${statement}</p>
          </div>
          ${stats(c.home.stats)}
        </div>
      </section>

      ${bento(c, "03")}
      ${processSection(c, "04")}
      ${explorer(c, "05")}
      ${voices(c, "06")}
      ${ctaBlock(c)}`,
    };
  },
};

/* ============================================================
   Products (catalog)
   ============================================================ */
const catalog = {
  render(c) {
    const cats = c.products.categories;
    const items = allItems(c);
    const h = c.catalog.header;
    const ui = c.ui;
    const t = ui.catalog;
    return {
      html: `
      ${pageHero({
        eyebrow: h.eyebrow, title: h.title, subtitle: h.subtitle, trail: [{ label: c.nav[1].label }], home: c.nav[0].label,
        side: `<div class="phero__meta"><span><b>${items.length}</b> ${esc(t.lines)}</span><span><b>${cats.length}</b> ${esc(t.divisions)}</span><span><b>1000+</b> ${esc(t.skus)}</span></div>`,
      })}
      <section class="catalog" data-catalog>
        <div class="container">
          <div class="toolbar" data-toolbar>
            <label class="search">${icon("search")}<input type="search" placeholder="${esc(t.searchPlaceholder)}" data-cat-search aria-label="${esc(ui.search)}" autocomplete="off" enterkeyhint="search"><button class="search__mic" type="button" data-voice data-target="[data-cat-search]" aria-label="${esc(ui.palette.voice)}" hidden>${icon("mic")}</button></label>
            <div class="filters" role="group" aria-label="${esc(t.divisions)}">
              <button class="filter is-on" type="button" data-filter="all" aria-pressed="true">${esc(t.all)} <span>${items.length}</span></button>
              ${cats.map((d) => `<button class="filter" type="button" data-filter="${d.id}" style="--c:${divColor(d.id)}" aria-pressed="false"><i></i>${esc(d.short)} <span>${d.items.length}</span></button>`).join("")}
            </div>
            <div class="toolbar__end">
              <label class="sort"><span class="sr">${esc(t.sortLabel)}</span><select data-sort aria-label="${esc(t.sortLabel)}"><option value="division">${esc(t.sortDivision)}</option><option value="az">${esc(t.sortAz)}</option></select></label>
              <div class="viewtoggle" role="group">
                <button type="button" class="is-on" data-view="grid" aria-pressed="true" aria-label="${esc(t.viewGrid)}">${icon("grid")}</button>
                <button type="button" data-view="list" aria-pressed="false" aria-label="${esc(t.viewList)}">${icon("rows")}</button>
              </div>
            </div>
          </div>
          <p class="catalog__note" data-fuzzy hidden>${esc(t.didYouMean)}</p>
          <div class="cflat pgrid" data-flat hidden></div>
          ${cats
            .map(
              (d) => `<div class="cgroup" data-group="${d.id}" id="${d.id}" style="--c:${divColor(d.id)}">
              <header class="cgroup__head" data-reveal>
                <a class="cgroup__img" href="${esc(d.file)}" data-vt-link="div-${d.id}" tabindex="-1"><span data-vt="div-${d.id}">${img(d.image, d.name, { w: 400, ratio: 0.75, sizes: "140px" })}</span></a>
                <div class="cgroup__text"><span class="cgroup__code">${esc(d.code)} — ${esc(d.tagline)}</span><h2>${esc(d.name)}</h2><p>${esc(d.summary)}</p></div>
                <a class="cgroup__link" href="${esc(d.file)}" data-vt-link="div-${d.id}">${esc(t.divisionDetails)} ${icon("arrowUR")}</a>
              </header>
              <div class="pgrid" data-grid>${items.filter((i) => i.div === d.id).map((it) => productCard(it, ui)).join("")}</div>
            </div>`
            )
            .join("")}
          <div class="cempty" data-empty hidden>
            <div class="cempty__mark">${logoMark()}</div>
            <h3 data-empty-title data-tpl="${esc(t.emptyTitle)}"></h3>
            <p>${esc(t.emptyBody)}</p>
            ${btn(t.emptyCta, "contact.html#enquiry")}
          </div>
        </div>
      </section>
      ${ctaBlock(c, { title: c.catalog.ctaTitle, body: c.catalog.ctaBody })}`,
    };
  },
  init(data) {
    const root = document.querySelector("[data-catalog]");
    const input = root.querySelector("[data-cat-search]");
    const filters = [...root.querySelectorAll("[data-filter]")];
    const groups = [...root.querySelectorAll("[data-group]")];
    const flat = root.querySelector("[data-flat]");
    const empty = root.querySelector("[data-empty]");
    const fuzzyNote = root.querySelector("[data-fuzzy]");
    const cards = [...root.querySelectorAll("[data-item]")];
    const home = new Map(cards.map((el) => [el, el.parentElement]));
    const idx = indexItems(data.items);
    let div = "all", sort = "division";

    const vt = (fn) => (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches ? document.startViewTransition(fn) : fn());

    const apply = () => {
      const q = input.value.trim();
      const hits = q ? new Set(searchItems(q, idx, 100).map((i) => i.id)) : null;
      const exact = q ? cards.some((el) => el.dataset.name.includes(q.toLowerCase())) : true;
      cards.forEach((el) => { el.hidden = !((div === "all" || el.dataset.div === div) && (!hits || hits.has(el.dataset.id))); });
      if (sort === "az") {
        cards.slice().sort((a, b) => a.dataset.name.localeCompare(b.dataset.name)).forEach((el) => flat.appendChild(el));
        flat.hidden = false;
        groups.forEach((g) => (g.hidden = true));
      } else {
        cards.forEach((el) => home.get(el).appendChild(el));
        flat.hidden = true;
        groups.forEach((g) => (g.hidden = ![...g.querySelectorAll("[data-item]")].some((el) => !el.hidden)));
      }
      const shown = cards.filter((el) => !el.hidden).length;
      empty.hidden = shown > 0;
      fuzzyNote.hidden = !q || !shown || exact;
      const title = empty.querySelector("[data-empty-title]");
      title.textContent = fmt(title.dataset.tpl, { q: q || div });
    };
    const setDiv = (d) => {
      div = d;
      filters.forEach((f) => { const on = f.dataset.filter === d; f.classList.toggle("is-on", on); f.setAttribute("aria-pressed", String(on)); });
      vt(apply);
    };
    filters.forEach((f) => f.addEventListener("click", () => setDiv(f.dataset.filter)));
    let t;
    input.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => vt(apply), 120); });
    root.querySelector("[data-sort]").addEventListener("change", (e) => { sort = e.target.value; vt(apply); });
    root.querySelectorAll("[data-view]").forEach((b) =>
      b.addEventListener("click", () => {
        vt(() => {
          root.classList.toggle("is-list", b.dataset.view === "list");
          root.querySelectorAll("[data-view]").forEach((x) => { x.classList.toggle("is-on", x === b); x.setAttribute("aria-pressed", String(x === b)); });
        });
      })
    );
    const fromHash = () => { const h = location.hash.slice(1); if (DIVS.includes(h)) setDiv(h); };
    addEventListener("hashchange", fromHash);
    fromHash();
    const q = new URLSearchParams(location.search).get("q");
    if (q) { input.value = q; apply(); }
  },
};

/* ============================================================
   Divisions overview
   ============================================================ */
const products = {
  render(c) {
    const h = c.products.header;
    const cmp = c.products.compare;
    const ui = c.ui;
    const cats = c.products.categories;
    return {
      html: `
      ${pageHero({ eyebrow: h.eyebrow, title: h.title, subtitle: h.subtitle, trail: [{ label: c.nav[2].label }], home: c.nav[0].label })}
      <section class="section section--tight">
        <div class="container">
          <div class="dgrid">
            ${cats
              .map(
                (d, i) => `<a class="dcard" href="${esc(d.file)}" style="--c:${divColor(d.id)};--d:${(i % 2) * 90}ms" data-reveal data-vt-link="div-${d.id}">
                <div class="dcard__media" data-vt="div-${d.id}">${img(d.image, d.name, { w: 1200, ratio: 0.62, sizes: "(max-width: 900px) 100vw, 50vw", eager: i < 2 })}</div>
                <div class="dcard__body">
                  <div class="dcard__top"><span class="dcard__code">${esc(d.code)}</span><span class="tagpill">${petal()}${esc(d.tagline)}</span></div>
                  <h2 class="dcard__name">${esc(d.name)}</h2>
                  <p>${esc(d.summary)}</p>
                  <div class="dcard__foot"><span>${esc(fmt(ui.productLines, { n: d.items.length }))} · ${esc(ui.looseBulk)}</span><span class="dcard__go">${icon("arrowUR")}</span></div>
                </div>
              </a>`
              )
              .join("")}
          </div>
        </div>
      </section>
      <section class="section compare-sec">
        <div class="container">
          ${sectionHead({ idx: "01", label: cmp.label, title: cmp.title })}
          <div class="tablewrap" data-reveal>
            <table class="ctable">
              <thead><tr><th scope="col"><span class="sr">—</span></th>${cats.map((d) => `<th scope="col" style="--c:${divColor(d.id)}"><a href="${esc(d.file)}"><span class="ctable__glyph">${petal()}</span>${esc(d.short)}</a></th>`).join("")}</tr></thead>
              <tbody>
                <tr><th scope="row">${esc(cmp.rowLines)}</th>${cats.map((d) => `<td><b class="ctable__big">${d.items.length}</b></td>`).join("")}</tr>
                <tr><th scope="row">${esc(cmp.rowFormats)}</th>${cats.map((d) => `<td>${d.specs.slice(0, 3).map(esc).join("<br>")}</td>`).join("")}</tr>
                <tr><th scope="row">${esc(cmp.rowBest)}</th>${cats.map((d) => `<td>${d.applications.slice(0, 2).map(esc).join("<br>")}</td>`).join("")}</tr>
                <tr><th scope="row">${esc(cmp.rowHighlight)}</th>${cats.map((d) => `<td style="--c:${divColor(d.id)}"><span class="ctable__hl">${esc(d.highlight)}</span></td>`).join("")}</tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      ${ctaBlock(c)}`,
    };
  },
};

/* ============================================================
   Division detail (hardware.html, spices.html, …)
   ============================================================ */
const division = {
  render(c, ctx) {
    const ui = c.ui;
    const t = ui.division;
    const cats = c.products.categories;
    const d = cats.find((x) => x.id === ctx.id);
    const items = allItems(c).filter((i) => i.div === d.id);
    const I = itemsById(c);
    const pairs = (d.pairsWith || []).map((id) => I[id]).filter(Boolean);
    const others = cats.filter((x) => x.id !== d.id);
    return {
      title: `${d.name} | ${c.brand.name}`,
      description: d.summary,
      html: `
      <section class="dhero" style="--c:${divColor(d.id)}" data-division="${d.id}">
        <div class="dhero__bg" aria-hidden="true"></div>
        <div class="container">
          <nav class="crumbs" aria-label="Breadcrumb" data-reveal><a href="index.html">${esc(c.nav[0].label)}</a><span aria-hidden="true">/</span><a href="products.html">${esc(c.nav[2].label)}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(d.name)}</span></nav>
          <div class="dhero__grid">
            <div class="dhero__info">
              <span class="eyebrow"><span class="eyebrow__idx">(${esc(d.code)})</span>${esc(t.eyebrow)} · ${esc(d.tagline)}</span>
              ${splitTitle(d.name, "h1", "h1 dhero__title")}
              <p class="lede" data-reveal style="--d:150ms">${esc(d.long)}</p>
              <div class="dhero__actions" data-reveal style="--d:250ms">
                ${btn(t.requestQuote, `contact.html?interest=${d.id}#enquiry`)}
                <button class="btn btn--ghost" type="button" data-add-all='${esc(JSON.stringify(items.map((i) => i.id)))}' data-ic="plus"><span class="btn__label">${esc(t.addRange)}</span><span class="btn__icon">${icon("plus")}</span></button>
                <button class="linkbtn linkbtn--icon" type="button" data-print="catalogue">${icon("download")}${esc(t.catalogue)}</button>
              </div>
            </div>
            <div class="dhero__media">
              <div class="dhero__img" style="view-transition-name:div-${d.id}">${img(d.image, d.name, { w: 1400, ratio: 1.1, sizes: "(max-width: 900px) 100vw, 50vw", eager: true })}</div>
              <div class="dhero__float"><span class="dhero__glyph">${petal()}</span><span><b>${esc(fmt(ui.productLines, { n: items.length }))}</b><small>${esc(t.packed)}</small></span></div>
            </div>
          </div>
        </div>
      </section>

      <section class="section section--tight">
        <div class="container">
          <div class="gallery" data-gallery>${d.images
            .map((u, i) => `<button class="gallery__item" type="button" data-reveal style="--d:${i * 70}ms" data-full="${esc(u)}" aria-label="${esc(fmt(t.gallery, { n: i + 1, total: d.images.length }))}">${img(u, `${d.name} — ${i + 1}`, { w: 900, sizes: "(max-width: 900px) 50vw, 25vw" })}</button>`)
            .join("")}</div>
        </div>
      </section>

      <section class="section range" style="--c:${divColor(d.id)}">
        <div class="container">
          ${sectionHead({ idx: "01", label: t.rangeLabel, title: fmt(t.rangeTitle, { name: d.short.toLowerCase() }), body: t.rangeBody })}
          <div class="pgrid">${items.map((it) => productCard(it, ui)).join("")}</div>
        </div>
      </section>

      <section class="section specs" style="--c:${divColor(d.id)}">
        <div class="container specs__grid">
          <div class="specs__col" data-reveal>
            ${eyebrow(t.specs, "02")}
            <ul class="checks">${d.specs.map((s) => `<li>${icon("check")}<span>${esc(s)}</span></li>`).join("")}</ul>
          </div>
          <div class="specs__col" data-reveal style="--d:120ms">
            ${eyebrow(t.buyers, "03")}
            <ul class="apps">${d.applications.map((a, i) => `<li><span class="apps__no">0${i + 1}</span>${esc(a)}</li>`).join("")}</ul>
          </div>
        </div>
      </section>

      ${pairs.length ? `<section class="section pairs">
        <div class="container">
          ${sectionHead({ idx: "04", label: t.pairsLabel, title: t.pairsTitle, body: t.pairsBody })}
          <div class="pgrid pgrid--pairs">${pairs.map((it) => productCard(it, ui)).join("")}</div>
        </div>
      </section>` : ""}

      <section class="section section--tight">
        <div class="container">
          <div class="others-head">${eyebrow(t.others)}<a class="linkarrow" href="products.html">${esc(t.allDivisions)} ${icon("arrow")}</a></div>
          <div class="others">${others.map((o) => otherCard(o, ui)).join("")}</div>
        </div>
      </section>

      <dialog class="lightbox" data-lightbox aria-label="${esc(d.name)}">
        <img alt="" data-lightbox-img>
        <div class="lightbox__bar">
          <span data-lightbox-count></span>
          <span class="lightbox__btns">
            <button class="iconbtn iconbtn--light" type="button" data-lightbox-prev aria-label="←">${icon("arrowL")}</button>
            <button class="iconbtn iconbtn--light" type="button" data-lightbox-next aria-label="→">${icon("arrow")}</button>
            <button class="iconbtn iconbtn--light" type="button" data-lightbox-close aria-label="${esc(ui.close)}">${icon("x")}</button>
          </span>
        </div>
      </dialog>
      ${ctaBlock(c)}`,
    };
  },
  init(data) {
    // Gallery lightbox (native <dialog>, swipe + keys).
    const dlg = document.querySelector("[data-lightbox]");
    const items = [...document.querySelectorAll("[data-gallery] [data-full]")];
    if (!dlg || !items.length) return;
    const im = dlg.querySelector("[data-lightbox-img]");
    const count = dlg.querySelector("[data-lightbox-count]");
    let i = 0;
    const show = (n) => {
      i = (n + items.length) % items.length;
      const src = items[i].dataset.full.split("?")[0];
      im.src = `${src}?auto=format&fit=max&w=2000&q=80`;
      im.alt = items[i].querySelector("img")?.alt || "";
      count.textContent = `${i + 1} / ${items.length}`;
    };
    items.forEach((b, n) => b.addEventListener("click", () => { show(n); dlg.showModal(); }));
    dlg.querySelector("[data-lightbox-prev]").addEventListener("click", () => show(i - 1));
    dlg.querySelector("[data-lightbox-next]").addEventListener("click", () => show(i + 1));
    dlg.querySelector("[data-lightbox-close]").addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") show(i - 1); if (e.key === "ArrowRight") show(i + 1); });
    let x0 = null;
    dlg.addEventListener("pointerdown", (e) => (x0 = e.clientX));
    dlg.addEventListener("pointerup", (e) => { if (x0 !== null && Math.abs(e.clientX - x0) > 50) show(i + (e.clientX < x0 ? 1 : -1)); x0 = null; });
  },
};

/* ============================================================
   Services
   ============================================================ */
const capabilities = {
  render(c) {
    const h = c.capabilities.header;
    const cfg = c.capabilities.configurator;
    const cmp = c.capabilities.compare;
    const b = c.brand;
    return {
      html: `
      ${pageHero({ eyebrow: h.eyebrow, title: h.title, subtitle: h.subtitle, trail: [{ label: c.nav[3].label }], home: c.nav[0].label })}
      <section class="section section--tight">
        <div class="container">
          <div class="sgrid">
            ${c.capabilities.list
              .map(
                (s, i) => `<article class="service" data-reveal style="--d:${(i % 3) * 80}ms;--c:${divColor(DIVS[i % 4])}">
                <div class="service__top"><span class="service__icon">${icon(s.icon)}</span><span class="service__code">${esc(s.code)}</span></div>
                <h3>${esc(s.name)}</h3>
                <p>${esc(s.desc)}</p>
              </article>`
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="section config" data-config data-intro="${esc(cfg.messageIntro)}" data-wa="${esc(b.whatsapp)}">
        <div class="container config__grid">
          ${sectionHead({ idx: "01", label: cfg.label, title: cfg.title, body: cfg.body })}
          <div class="config__card" data-reveal>
            ${cfg.steps
              .map(
                (s, si) => `<fieldset class="config__step" data-step-key="${esc(s.key)}" data-step-title="${esc(s.title)}">
                <legend><span class="config__n">${si + 1}</span>${esc(s.title)}</legend>
                <div class="chipset">${s.options
                  .map((o, oi) => `<label class="cchip"${si === 0 ? ` style="--c:${divColor(DIVS[oi])}"` : ""}><input type="${s.multi ? "checkbox" : "radio"}" name="cfg-${esc(s.key)}" value="${esc(o)}"><span>${si === 0 ? "<i></i>" : ""}${esc(o)}</span></label>`)
                  .join("")}</div>
              </fieldset>`
              )
              .join("")}
            <div class="config__summary">
              <span class="eyebrow"><span class="eyebrow__dot"></span>${esc(cfg.summaryTitle)}</span>
              <p class="config__text" data-config-text data-empty="${esc(cfg.summaryEmpty)}">${esc(cfg.summaryEmpty)}</p>
              <div class="config__actions">
                ${btn(cfg.send, waHref(b.whatsapp), { variant: "wa", icon: "whatsapp", attrs: 'target="_blank" rel="noopener" data-config-send aria-disabled="true"' })}
                ${btn(cfg.startList, "catalog.html", { variant: "ghost", icon: "list" })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section compare-sec">
        <div class="container">
          ${sectionHead({ idx: "02", label: cmp.label, title: cmp.title })}
          <div class="tablewrap" data-reveal>
            <table class="ctable ctable--ways">
              <thead><tr><th scope="col"><span class="sr">—</span></th>${cmp.columns.map((col, i) => `<th scope="col" style="--c:${divColor(DIVS[i])}"><span class="ctable__glyph">${petal()}</span>${esc(col)}</th>`).join("")}</tr></thead>
              <tbody>${cmp.rows.map((r) => `<tr><th scope="row">${esc(r.label)}</th>${r.values.map((v) => `<td>${esc(v)}</td>`).join("")}</tr>`).join("")}</tbody>
            </table>
          </div>
        </div>
      </section>
      ${ctaBlock(c)}`,
    };
  },
  init() {
    const root = document.querySelector("[data-config]");
    const steps = [...root.querySelectorAll("[data-step-key]")];
    const text = root.querySelector("[data-config-text]");
    const send = root.querySelector("[data-config-send]");
    const update = () => {
      const picked = steps.map((s) => ({ title: s.dataset.stepTitle, values: [...s.querySelectorAll("input:checked")].map((i) => i.value) }));
      if (!picked[0].values.length) {
        text.textContent = text.dataset.empty;
        send.setAttribute("aria-disabled", "true");
        return;
      }
      const lines = picked.filter((p) => p.values.length).map((p) => `${p.title.replace(/\s*[?？:]\s*$/, "")}: ${p.values.join(", ")}`);
      text.innerHTML = lines.map((l) => `<span>${esc(l)}</span>`).join("");
      send.removeAttribute("aria-disabled");
      send.href = waHref(root.dataset.wa, `${root.dataset.intro}\n\n${lines.map((l) => `• ${l}`).join("\n")}`);
    };
    root.addEventListener("change", update);
    send.addEventListener("click", (e) => { if (send.getAttribute("aria-disabled") === "true") e.preventDefault(); });
  },
};

/* ============================================================
   Customers
   ============================================================ */
const industries = {
  render(c) {
    const h = c.industries.header;
    const ui = c.ui;
    const D = byId(c);
    const I = itemsById(c);
    return {
      html: `
      ${pageHero({ eyebrow: h.eyebrow, title: h.title, subtitle: h.subtitle, trail: [{ label: c.nav[4].label }], home: c.nav[0].label })}
      <section class="section section--tight">
        <div class="container">
          <div class="igrid">
            ${c.industries.list
              .map((x, i) => {
                const starter = (x.starter || []).map((id) => I[id]).filter(Boolean);
                return `<article class="icard" data-reveal style="--d:${(i % 3) * 80}ms">
                <div class="icard__media">${img(x.image, x.name, { w: 900, ratio: 0.72, sizes: "(max-width: 900px) 100vw, 33vw" })}<span class="icard__no">0${i + 1}</span></div>
                <div class="icard__body">
                  <h3>${esc(x.name)}</h3>
                  <p>${esc(x.desc)}</p>
                  <div class="icard__divs">${x.divisions.map((d) => `<a class="dtag" href="${esc(D[d].file)}" style="--c:${divColor(d)}"><i></i>${esc(D[d].short)}</a>`).join("")}</div>
                  <div class="icard__starter">
                    <span class="explorer__label">${esc(ui.home.audienceTypical)}</span>
                    <p>${starter.map((s) => esc(s.name)).join(" · ")}</p>
                    <button class="btn btn--ghost btn--sm" type="button" data-ic="plus" data-starter='${esc(JSON.stringify(starter.map((s) => s.id)))}'><span class="btn__label">${esc(ui.home.audienceLoad)}</span><span class="btn__icon">${icon("plus")}</span></button>
                  </div>
                </div>
              </article>`;
              })
              .join("")}
          </div>
        </div>
      </section>
      ${voices(c, "01")}
      ${ctaBlock(c)}`,
    };
  },
};

/* ============================================================
   About
   ============================================================ */
const about = {
  render(c) {
    const a = c.about;
    const D = byId(c);
    return {
      html: `
      ${pageHero({ eyebrow: a.header.eyebrow, title: a.header.title, subtitle: a.header.subtitle, trail: [{ label: c.nav[5].label }], home: c.nav[0].label })}
      <section class="story">
        <div class="story__media" data-expand>
          <div class="story__frame">${img(a.image, a.imageAlt, { w: 1900, ratio: 0.55, sizes: "100vw" })}</div>
          <span class="story__badge">${logoMark()}<span>${esc(c.brand.established)}</span></span>
        </div>
        <div class="container story__grid">
          <div class="story__label">${eyebrow(a.storyLabel, "01")}</div>
          <div class="story__text">${a.story.map((p, i) => `<p data-reveal style="--d:${i * 80}ms"${i === 0 ? ' class="story__lead"' : ""}>${esc(p)}</p>`).join("")}</div>
        </div>
      </section>

      <section class="journey" data-journey>
        <div class="journey__sticky">
          <div class="container">${sectionHead({ idx: "02", label: a.journey.label, title: a.journey.title, body: a.journey.body })}</div>
          <div class="journey__viewport">
            <ol class="journey__track">
              ${a.milestones
                .map(
                  (m, i) => `<li class="mstone" style="--c:${divColor(m.division)}">
                  <div class="mstone__img">${img(D[m.division].image, m.title, { w: 900, ratio: 0.7, sizes: "(max-width: 700px) 80vw, 40vw" })}<span class="mstone__no">0${i + 1}</span></div>
                  <div class="mstone__body"><span class="mstone__dot">${petal()}</span><h3>${esc(m.title)}</h3><p>${esc(m.desc)}</p></div>
                </li>`
                )
                .join("")}
            </ol>
          </div>
          <div class="container"><div class="journey__bar" aria-hidden="true"><i></i></div></div>
        </div>
      </section>

      <section class="section values">
        <div class="container">
          ${stats(a.stats, "stats--boxed")}
          <div class="vgrid">
            ${a.values
              .map(
                (v, i) => `<article class="value" data-reveal style="--d:${i * 90}ms;--c:${divColor(DIVS[i])}">
                <span class="value__no">0${i + 1}</span>
                <h3>${esc(v.name)}</h3>
                <p>${esc(v.desc)}</p>
              </article>`
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="section team">
        <div class="container">
          ${sectionHead({ idx: "03", label: a.teamHead.label, title: a.teamHead.title, body: a.teamHead.body })}
          <div class="tgrid">
            ${a.team
              .map(
                (t, i) => `<article class="person" data-reveal style="--d:${i * 90}ms;--c:${divColor(DIVS[i % 4])}">
                <div class="person__avatar"><span>${esc(initials(t.name))}</span>${logoMark("person__mark")}</div>
                <div class="person__body">
                  <span class="person__role">${esc(t.role)}</span>
                  <h3>${esc(t.name)}</h3>
                  <p>${esc(t.bio)}</p>
                </div>
              </article>`
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="section section--tight">
        <div class="container">
          <div class="partners-head">${eyebrow(c.partners.label, "04")}<h3 class="h3">${rich(c.partners.title)}</h3></div>
          ${partners(c.partners)}
        </div>
      </section>
      ${ctaBlock(c)}`,
    };
  },
};

/* ============================================================
   Contact
   ============================================================ */
const contact = {
  render(c) {
    const h = c.contact.header;
    const f = c.contact.form;
    const b = c.brand;
    const ui = c.ui;
    const t = ui.contact;
    const cr = b.credentials || {};
    const field = (x) => {
      const req = x.required ? " required" : "";
      const star = x.required ? '<span class="req" aria-hidden="true">*</span>' : "";
      if (x.type === "chips")
        return `<fieldset class="field field--full"><legend class="field__label">${esc(x.label)}</legend><div class="chipset">${x.options
          .map((o) => `<label class="cchip"${DIVS.includes(o.value) ? ` style="--c:${divColor(o.value)}"` : ""}><input type="checkbox" name="${esc(x.name)}" value="${esc(o.label)}" data-value="${esc(o.value)}"><span><i></i>${esc(o.label)}</span></label>`)
          .join("")}</div></fieldset>`;
      if (x.type === "textarea")
        return `<label class="field field--full"><span class="field__label">${esc(x.label)}${star}</span><textarea name="${esc(x.name)}" rows="5" placeholder="${esc(x.placeholder || "")}"${req}></textarea></label>`;
      return `<label class="field"><span class="field__label">${esc(x.label)}${star}</span><input type="${esc(x.type)}" name="${esc(x.name)}" placeholder="${esc(x.placeholder || "")}" autocomplete="${esc(x.autocomplete || "on")}"${req}></label>`;
    };
    const card = (ic, label, value, href, hint = "", extra = "") =>
      `<a class="ccard${extra}" href="${esc(href)}"${href.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>
        <span class="ccard__icon">${icon(ic)}</span>
        <span class="ccard__text"><small>${esc(label)}</small><b>${value}</b>${hint ? `<em>${esc(hint)}</em>` : ""}</span>
        <span class="ccard__go">${icon("arrowUR")}</span>
      </a>`;
    const creds = [cr.fssai && ["FSSAI", cr.fssai], cr.gstin && ["GSTIN", cr.gstin]].filter(Boolean);

    return {
      html: `
      ${pageHero({ eyebrow: h.eyebrow, title: h.title, subtitle: h.subtitle, trail: [{ label: c.nav[6].label }], home: c.nav[0].label, side: statusPill(b) })}
      <section class="section section--tight contact" id="enquiry">
        <div class="container contact__grid">
          <aside class="cinfo">
            ${card("phone", ui.call, esc(b.phone), telHref(b.phone), b.hours)}
            ${card("whatsapp", ui.whatsapp, esc(b.whatsapp), waHref(b.whatsapp), t.snapTitle, " ccard--wa")}
            ${card("mail", ui.email, esc(b.email), `mailto:${b.email}`)}
            ${card("pin", ui.visit, `${esc(b.address.line1)}<br>${esc(b.address.line2)}`, mapsHref(b.mapsQuery), ui.openInMaps)}
            ${creds.length || cr.reviewsUrl ? `<div class="creds"><span class="eyebrow"><span class="eyebrow__dot"></span>${esc(t.credentials)}</span>${creds.map(([k, v]) => `<span class="creds__item"><b>${k}</b>${esc(v)}</span>`).join("")}${cr.reviewsUrl ? `<a class="linkarrow" href="${esc(cr.reviewsUrl)}" target="_blank" rel="noopener">${icon("star")}${esc(cr.reviewsLabel || t.reviews)}</a>` : ""}</div>` : ""}
          </aside>
          <form class="form" id="quote-form" novalidate data-reveal>
            <div class="form__head">
              <h2 class="h3">${esc(ui.form.title)}</h2>
              <p>${esc(ui.form.intro)}</p>
            </div>
            <div class="form__list" data-form-list></div>
            <div class="form__fields">${f.fields.map(field).join("")}</div>
            <div class="form__actions">
              <button class="btn btn--wa" type="submit" data-via="wa" data-ic="whatsapp"><span class="btn__label">${esc(f.submit)}</span><span class="btn__icon">${icon("whatsapp")}</span></button>
              <button class="btn btn--ghost" type="submit" data-via="email" data-ic="mail"><span class="btn__label">${esc(f.submitAlt)}</span><span class="btn__icon">${icon("mail")}</span></button>
            </div>
            <p class="form__note">${esc(f.note)}</p>
            <div class="form__status" data-form-status role="status" aria-live="polite"></div>
          </form>
        </div>
      </section>

      <section class="section section--tight extras">
        <div class="container extras__grid">
          <article class="xcard xcard--snap" id="snap" data-reveal data-snap-card data-caption="${esc(t.snapCaption)}">
            <span class="xcard__icon">${icon("camera")}</span>
            <h3 class="h3">${esc(t.snapTitle)}</h3>
            <p>${esc(t.snapBody)}</p>
            <div class="snap__preview" data-snap-preview hidden><img alt="" data-snap-img></div>
            <div class="xcard__actions">
              <label class="btn btn--ink" data-ic="camera"><input type="file" accept="image/*" capture="environment" data-snap class="sr"><span class="btn__label">${esc(t.snapButton)}</span><span class="btn__icon">${icon("camera")}</span></label>
              <button class="btn btn--wa" type="button" data-snap-share data-ic="whatsapp" hidden><span class="btn__label">${esc(t.snapShare)}</span><span class="btn__icon">${icon("whatsapp")}</span></button>
            </div>
            <p class="snap__fallback" data-snap-fallback hidden>${esc(t.snapFallback)} <a href="${waHref(b.whatsapp, t.snapCaption)}" target="_blank" rel="noopener">${esc(t.snapOpenChat)} →</a></p>
          </article>

          <form class="xcard xcard--call" data-reveal style="--d:90ms" data-callback data-msg="${esc(t.callbackMessage)}" data-wa="${esc(b.whatsapp)}" novalidate>
            <span class="xcard__icon">${icon("phone")}</span>
            <h3 class="h3">${esc(t.callbackTitle)}</h3>
            <p>${esc(t.callbackBody)}</p>
            <div class="callback">
              <label class="field"><span class="field__label">${esc(t.callbackName)}</span><input name="cbname" autocomplete="name" required></label>
              <label class="field"><span class="field__label">${esc(t.callbackPhone)}</span><input name="cbphone" type="tel" autocomplete="tel" required></label>
              <label class="field field--full"><span class="field__label">${esc(t.callbackWhen)}</span><select name="cbwhen">${t.callbackSlots.map((s) => `<option>${esc(s)}</option>`).join("")}</select></label>
            </div>
            <button class="btn btn--ink" type="submit" data-ic="arrowUR"><span class="btn__label">${esc(t.callbackButton)}</span><span class="btn__icon">${icon("arrowUR")}</span></button>
          </form>

          ${b.mapEmbed ? `<article class="xcard xcard--map" data-reveal style="--d:180ms">
            <div class="map"><iframe title="${esc(t.mapTitle)}" src="${esc(mapsEmbed(b.mapsQuery))}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
            <div class="map__foot"><span><b>${esc(t.mapTitle)}</b><small>${esc(b.address.line1)}, ${esc(b.address.line2)}</small></span>${btn(t.directions, mapsHref(b.mapsQuery), { variant: "ghost", size: "sm", attrs: 'target="_blank" rel="noopener"' })}</div>
          </article>` : ""}
        </div>
      </section>

      <section class="section faq">
        <div class="container faq__grid">
          ${sectionHead({ idx: "01", label: c.contact.faqHead.label, title: c.contact.faqHead.title, body: c.contact.faqHead.body })}
          <div class="faq__list">
            ${c.contact.faq
              .map((q, i) => `<details class="qa" data-reveal style="--d:${i * 60}ms"${i === 0 ? " open" : ""}><summary><span>${esc(q.q)}</span><span class="qa__icon">${icon("plus")}</span></summary><div class="qa__a"><p>${esc(q.a)}</p></div></details>`)
              .join("")}
          </div>
        </div>
      </section>`,
    };
  },
  init(data) {
    const ui = data.ui;
    const b = data.brand;
    const form = document.getElementById("quote-form");
    const status = form.querySelector("[data-form-status]");
    const listEl = form.querySelector("[data-form-list]");
    const msg = form.querySelector('[name="message"]');
    let via = "wa";

    // Pre-tick the division passed as ?interest=…
    const pre = new URLSearchParams(location.search).get("interest");
    if (pre) form.querySelectorAll(`[data-value="${CSS.escape(pre)}"]`).forEach((i) => (i.checked = true));

    const drawList = () => {
      const list = quote.items;
      msg.required = list.length === 0;
      listEl.innerHTML = list.length
        ? `<div class="flist"><div class="flist__head"><span>${icon("list")} ${esc(fmt(ui.form.listAttached, { n: list.length }))}</span><button type="button" class="linkbtn" data-quote-open>${esc(ui.form.edit)}</button></div>
           <ul>${list.map((i) => `<li style="--c:${divColor(i.div)}"><i></i>${esc(quote.label(i))}<b>${esc(i.qty)} ${esc(ui.units[i.unit] || i.unit)}</b></li>`).join("")}</ul></div>`
        : `<button type="button" class="flist flist--empty" data-palette-open>${icon("search")}<span>${esc(ui.form.listTip)}</span></button>`;
    };
    drawList();
    quote.subscribe(drawList);

    form.querySelectorAll("[data-via]").forEach((x) => x.addEventListener("click", () => (via = x.dataset.via)));
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const fd = new FormData(form);
      const get = (k) => (fd.get(k) || "").toString().trim();
      const t = ui.form;
      const interests = fd.getAll("interest").join(", ");
      const details = [
        `${t.fieldName}: ${get("name")}`,
        get("company") && `${t.fieldBusiness}: ${get("company")}`,
        `${t.fieldPhone}: ${get("phone")}`,
        get("email") && `${t.fieldEmail}: ${get("email")}`,
        interests && `${t.fieldInterest}: ${interests}`,
        get("message") && `\n${t.fieldRequirement}:\n${get("message")}`,
      ].filter(Boolean).join("\n");
      const text = quote.items.length ? `${quoteText(quote.items)}\n\n${details}` : `${t.plainGreeting}\n\n${details}`;
      const first = get("name").split(" ")[0];

      if (data.form?.endpoint) {
        status.className = "form__status is-busy";
        status.textContent = t.sending;
        try {
          const res = await fetch(data.form.endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ ...Object.fromEntries(fd), interest: interests, quoteList: quote.items, text }) });
          if (!res.ok) throw new Error(res.status);
          status.className = "form__status is-ok";
          status.innerHTML = `${icon("check")}<span>${esc(fmt(t.thanksServer, { name: first }))}</span>`;
          form.reset();
          return;
        } catch (_) { /* fall back to WhatsApp / email */ }
      }
      const href = via === "email" ? `mailto:${b.email}?subject=${encodeURIComponent(fmt(t.subject, { name: get("name") }))}&body=${encodeURIComponent(text)}` : waHref(b.whatsapp, text);
      if (via === "email") location.href = href;
      else { quote.remember(); window.open(href, "_blank", "noopener"); }
      status.className = "form__status is-ok";
      status.innerHTML = `${icon("check")}<span>${esc(fmt(via === "email" ? t.thanksEmail : t.thanksWa, { name: first }))} <a href="${esc(href)}"${via === "email" ? "" : ' target="_blank" rel="noopener"'}>${esc(t.didntOpen)}</a></span>`;
    });

    // Snap your list: camera → preview → Web Share (files) to WhatsApp, or a chat link fallback.
    const snap = document.querySelector("[data-snap-card]");
    if (snap) {
      const input = snap.querySelector("[data-snap]");
      const prev = snap.querySelector("[data-snap-preview]");
      const shareBtn = snap.querySelector("[data-snap-share]");
      const fallback = snap.querySelector("[data-snap-fallback]");
      let file = null;
      input.addEventListener("change", () => {
        file = input.files?.[0];
        if (!file) return;
        prev.hidden = false;
        snap.querySelector("[data-snap-img]").src = URL.createObjectURL(file);
        const canShare = navigator.canShare?.({ files: [file] });
        shareBtn.hidden = !canShare;
        fallback.hidden = !!canShare;
      });
      shareBtn.addEventListener("click", async () => {
        try { await navigator.share({ files: [file], text: snap.dataset.caption }); } catch (_) {}
      });
    }

    // Call-back request → WhatsApp message.
    const cb = document.querySelector("[data-callback]");
    cb?.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!cb.reportValidity()) return;
      const fd = new FormData(cb);
      const text = `${cb.dataset.msg}\n\n${ui.form.fieldName}: ${fd.get("cbname")}\n${ui.form.fieldPhone}: ${fd.get("cbphone")}\n${ui.contact.callbackWhen}: ${fd.get("cbwhen")}`;
      window.open(waHref(cb.dataset.wa, text), "_blank", "noopener");
    });
  },
};

/* ============================================================
   404
   ============================================================ */
const notFound = {
  render(c) {
    const n = c.notFound;
    return {
      html: `
      ${pageHero({ eyebrow: n.eyebrow, title: n.title, subtitle: n.subtitle, trail: [{ label: n.eyebrow }], home: c.nav[0].label, side: `<div class="phero__actions">${btn(c.ui.search, "", { variant: "ink", icon: "search", attrs: "data-palette-open" })}${btn(c.ui.browseProducts, "catalog.html", { variant: "ghost", icon: "arrow" })}</div>` })}
      <section class="section section--tight"><div class="container"><div class="others">${c.products.categories.map((d) => otherCard(d, c.ui)).join("")}</div></div></section>`,
    };
  },
};

export const pages = { home, catalog, products, division, capabilities, industries, about, contact, notFound };
