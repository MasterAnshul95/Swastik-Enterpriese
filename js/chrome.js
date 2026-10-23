/* ============================================================
   chrome.js — the frame around every page: nav, mobile menu,
   footer, floating WhatsApp, mobile quote bar, open/closed pill.
   Pure render functions (pre-rendered at build time).
   ============================================================ */
import { esc, rich, fmt, icon, logoMark, telHref, waHref, mapsHref, btn } from "./ui.js";

const isActive = (href, ctx) => {
  const target = href.split("?")[0];
  if (ctx.page === "division") return target === "products.html";
  return ctx.file === target;
};

/* ---------- open / closed, computed in IST (runs in the browser) ---------- */
export function openStatus(brand, s) {
  const o = brand.open;
  if (!o) return { open: false, text: brand.hours };
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value;
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  const h = Number(get("hour")) + Number(get("minute")) / 60;
  const time = (x) => `${((x + 11) % 12) + 1} ${x < 12 ? s.am : s.pm}`;
  const openToday = o.days.includes(day);
  if (openToday && h >= o.from && h < o.to) return { open: true, text: fmt(s.openUntil, { time: time(o.to) }) };
  let next = day;
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    if (o.days.includes(d)) { next = d; break; }
  }
  const when = openToday && h < o.from ? s.today : next === (day + 1) % 7 ? s.tomorrow : s.days[next];
  return { open: false, text: fmt(s.closedOpens, { when, time: time(o.from) }) };
}

/* Rendered neutral; the browser swaps in the live state. */
export const statusPill = (brand, cls = "") =>
  `<span class="status ${cls}" data-status><i></i><span>${esc(brand.hours)}</span></span>`;

export function navbar(c, ctx) {
  const ui = c.ui;
  return `<a class="skip" href="#main">${esc(ui.skip)}</a>
  <header class="nav" data-nav>
    <div class="nav__bar">
      <a class="brand" href="index.html" aria-label="${esc(c.brand.name)}">
        ${logoMark("brand__mark")}
        <span class="brand__word">${esc(c.brand.short)}<small>${esc(c.brand.suffix)}</small></span>
      </a>
      <nav class="nav__links" aria-label="Primary">
        ${c.nav
          .filter((n) => n.href !== "index.html")
          .map((n) => `<a href="${esc(n.href)}" class="nav__link${isActive(n.href, ctx) ? " is-active" : ""}"${isActive(n.href, ctx) ? ' aria-current="page"' : ""}><span>${esc(n.label)}</span></a>`)
          .join("")}
      </nav>
      <div class="nav__actions">
        <a class="nav__lang" href="${esc(ctx.alt)}" hreflang="${ctx.lang === "en" ? "hi" : "en"}" lang="${ctx.lang === "en" ? "hi" : "en"}" aria-label="${esc(ui.langSwitchLabel)}">${icon("globe")}<span>${esc(ui.langSwitch)}</span></a>
        <button class="nav__search" type="button" data-palette-open aria-label="${esc(ui.search)}">${icon("search")}<span>${esc(ui.search)}</span><kbd>/</kbd></button>
        <button class="nav__quote" type="button" data-quote-open aria-label="${esc(ui.openQuote)}">${icon("list")}<span class="nav__quote-label">${esc(ui.quoteList)}</span><b class="badge" data-quote-count>0</b></button>
        <button class="nav__burger" type="button" data-menu-toggle aria-expanded="false" aria-controls="menu" aria-label="${esc(ui.openMenu)}" data-open="${esc(ui.openMenu)}" data-close="${esc(ui.closeMenu)}"><i></i><i></i></button>
      </div>
    </div>
  </header>
  <div class="progress" aria-hidden="true"><i data-progress></i></div>`;
}

export function menu(c, ctx) {
  const b = c.brand;
  return `<div class="menu" id="menu" data-menu inert>
    <div class="menu__inner">
      <nav class="menu__links" aria-label="Mobile">
        ${c.nav.map((n, i) => `<a href="${esc(n.href)}" class="menu__link${isActive(n.href, ctx) ? " is-active" : ""}" style="--i:${i}"><small>0${i + 1}</small><span>${esc(n.label)}</span></a>`).join("")}
      </nav>
      <div class="menu__foot">
        ${statusPill(b)}
        <a href="${telHref(b.phone)}">${icon("phone")}${esc(b.phone)}</a>
        <a href="${waHref(b.whatsapp)}" target="_blank" rel="noopener">${icon("whatsapp")}${esc(c.ui.whatsapp)}</a>
        <a href="${esc(ctx.alt)}" lang="${ctx.lang === "en" ? "hi" : "en"}">${icon("globe")}${esc(c.ui.langSwitch)}</a>
      </div>
    </div>
  </div>`;
}

export function footer(c, ctx) {
  const b = c.brand;
  const f = c.footer;
  const ui = c.ui;
  const cr = b.credentials || {};
  const creds = [cr.fssai && `FSSAI ${cr.fssai}`, cr.gstin && `GSTIN ${cr.gstin}`].filter(Boolean);
  return `<footer class="footer">
    <div class="container">
      <div class="footer__top">
        <div class="footer__lead">
          <p class="footer__statement">${rich(f.statement)}</p>
          <p class="footer__blurb">${esc(f.blurb)}</p>
          <div class="footer__cta">
            ${btn(ui.getQuote, "contact.html", { variant: "light" })}
            ${btn(ui.whatsapp, waHref(b.whatsapp), { variant: "ghost-light", icon: "whatsapp", attrs: 'target="_blank" rel="noopener"' })}
          </div>
        </div>
        <div class="footer__cols">
          ${f.columns
            .map((col) => `<div class="footer__col"><h3>${esc(col.title)}</h3><ul>${col.links.map((l) => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join("")}</ul></div>`)
            .join("")}
          <div class="footer__col footer__col--contact">
            <h3>${esc(f.visitTitle)}</h3>
            <ul>
              <li><a href="${telHref(b.phone)}">${esc(b.phone)}</a></li>
              <li><a href="mailto:${esc(b.email)}">${esc(b.email)}</a></li>
              <li><a href="${mapsHref(b.mapsQuery)}" target="_blank" rel="noopener">${esc(b.address.line1)}<br>${esc(b.address.line2)}</a></li>
              <li class="muted">${esc(b.hours)}</li>
              <li>${statusPill(b, "status--dark")}</li>
            </ul>
          </div>
        </div>
      </div>
      ${creds.length ? `<p class="footer__creds">${creds.map(esc).join(" · ")}</p>` : ""}
      <div class="footer__word" aria-hidden="true"><span>${esc(b.short)}</span>${logoMark("footer__mark")}</div>
      <div class="footer__bottom">
        <span>© ${ctx.year} ${esc(b.name)}. ${esc(f.legal)}</span>
        <span class="footer__social">${c.social.map((s) => `<a href="${esc(s.href)}">${esc(s.label)}</a>`).join("")}<a href="${esc(ctx.alt)}" lang="${ctx.lang === "en" ? "hi" : "en"}">${esc(ui.langSwitch)}</a></span>
        <span class="footer__tools">
          <button class="totop" type="button" data-install hidden>${icon("download")}${esc(ui.installApp)}</button>
          <button class="totop" type="button" data-totop>${esc(ui.backToTop)} ${icon("arrowUp")}</button>
        </span>
      </div>
    </div>
  </footer>`;
}

export function floating(c) {
  const ui = c.ui;
  return `<a class="fab" href="${waHref(c.brand.whatsapp, ui.form.plainGreeting)}" target="_blank" rel="noopener" aria-label="${esc(ui.chatWithUs)}">
    ${icon("whatsapp")}<span>${esc(ui.chatWithUs)}</span>
  </a>
  <button class="qbar-m" type="button" data-quote-open hidden>
    <span class="qbar-m__count"><b data-quote-count>0</b></span>
    <span class="qbar-m__text" data-qbar-text data-tpl="${esc(ui.quote.barText)}"></span>
    <span class="qbar-m__go">${esc(ui.quote.barSend)} ${icon("arrow")}</span>
  </button>`;
}
