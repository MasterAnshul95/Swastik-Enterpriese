/* ============================================================
   quote.js — the quote-list builder.
   Add product lines from anywhere, paste a free-text list, set
   quantities, then send it on WhatsApp, carry it into the form,
   share it as a link or save it as a PDF. Past lists are kept
   so repeat buyers can re-order in one tap.
   ============================================================ */
import { esc, fmt, icon, logoMark, waHref, divColor } from "./ui.js";
import { indexItems, parseList } from "./search.js";

const KEY = "swastik.quote.v1";
const HKEY = "swastik.history.v1";
const UNITS = ["kg", "g", "pcs", "packs", "bags", "boxes", "rolls"];
const listeners = new Set();
let DATA = null;
let items = read(KEY, []);

function read(k, fallback) {
  try { return JSON.parse(localStorage.getItem(k)) || fallback; } catch (_) { return fallback; }
}
function write(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {}
}
function save() {
  write(KEY, items);
  listeners.forEach((fn) => fn(items));
}
const buzz = () => { try { navigator.vibrate?.(12); } catch (_) {} };

export const quote = {
  get items() { return items; },
  has: (id) => items.some((i) => i.id === id),
  add(it, { qty, silent } = {}) {
    if (this.has(it.id)) {
      if (qty) this.update(it.id, { qty });
      return;
    }
    const unit = it.unit || "kg";
    items = [...items, { id: it.id, name: it.name, div: it.div || "custom", qty: qty ?? it.qty ?? (unit === "kg" ? 10 : 100), unit }];
    save();
    if (!silent) buzz();
  },
  insert(entry, at) {
    const copy = items.filter((i) => i.id !== entry.id);
    copy.splice(Math.min(at, copy.length), 0, entry);
    items = copy;
    save();
  },
  remove(id) { items = items.filter((i) => i.id !== id); save(); },
  update(id, patch) { items = items.map((i) => (i.id === id ? { ...i, ...patch } : i)); save(); },
  replace(list) { items = list.map((i) => ({ ...i })); save(); },
  clear() { items = []; save(); },
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  /* Show product names in the page's language, whatever language they were added in. */
  label(i) { return DATA?.byId?.[i.id]?.raw || i.name; },
  /* Keep a copy of the current list in "Past lists". */
  remember() {
    if (!items.length) return;
    const h = read(HKEY, []).filter((e) => JSON.stringify(e.items) !== JSON.stringify(items));
    write(HKEY, [{ at: Date.now(), items }, ...h].slice(0, 8));
  },
  open: () => {},
};

export function quoteText(list, notes = "") {
  const u = DATA.ui;
  const lines = list.map((i, n) => `${n + 1}. ${quote.label(i)}${i.spec ? ` (${i.spec})` : ""} — ${i.qty} ${u.units[i.unit] || i.unit}`);
  return [u.quote.greeting, "", ...lines, notes ? `\n${u.quote.notesLabel}: ${notes}` : "", "", u.quote.sentFrom].join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/* ---------- toasts ---------- */
let toastWrap;
export function toast(html, { action } = {}) {
  if (!toastWrap) {
    toastWrap = document.createElement("div");
    toastWrap.className = "toasts";
    toastWrap.setAttribute("role", "status");
    toastWrap.setAttribute("aria-live", "polite");
    document.body.appendChild(toastWrap);
  }
  while (toastWrap.children.length > 2) toastWrap.firstElementChild.remove();
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `<span class="toast__icon">${icon("check")}</span><span class="toast__text">${html}</span>${action ? `<button type="button" class="toast__action">${esc(action.label)}</button>` : ""}`;
  if (action) t.querySelector(".toast__action").addEventListener("click", () => { action.run(); t.remove(); });
  toastWrap.appendChild(t);
  requestAnimationFrame(() => t.classList.add("is-in"));
  setTimeout(() => { t.classList.remove("is-in"); setTimeout(() => t.remove(), 400); }, 3600);
}

/* ---------- share links: #list=<base64url JSON> ---------- */
const b64 = {
  enc: (s) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""),
  dec: (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0))),
};
function shareUrl() {
  const payload = items.map((i) => [i.id, i.qty, i.unit, i.div, i.div === "custom" ? i.name : 0, i.spec || 0]);
  const url = new URL(`${DATA.root}catalog.html`, location.href);
  url.hash = `list=${b64.enc(JSON.stringify(payload))}`;
  return url.href;
}
function loadShared() {
  const m = location.hash.match(/^#list=([\w-]+)/);
  if (!m) return false;
  try {
    const list = JSON.parse(b64.dec(m[1])).map(([id, qty, unit, div, name, spec]) => ({ id, qty, unit, div, name: name || DATA.byId[id]?.raw || id, ...(spec ? { spec } : {}) }));
    if (list.length) {
      quote.replace(list);
      toast(esc(fmt(DATA.ui.quote.sharedLoaded, { n: list.length })));
    }
  } catch (_) {}
  history.replaceState(null, "", location.pathname + location.search);
  return true;
}

/* ---------- print / PDF ---------- */
function printQuote(notes) {
  const u = DATA.ui;
  let sheet = document.getElementById("print-sheet");
  if (!sheet) { sheet = document.createElement("section"); sheet.id = "print-sheet"; document.body.appendChild(sheet); }
  const date = new Intl.DateTimeFormat(DATA.locale, { dateStyle: "long" }).format(new Date());
  sheet.innerHTML = `<header><div class="ps-brand">${logoMark()}<span><b>${esc(DATA.brand.name)}</b><small>${esc(DATA.brand.phone)} · ${esc(DATA.brand.email)}</small></span></div><div><h1>${esc(u.quote.printTitle)}</h1><p>${esc(date)}</p></div></header>
    <table><thead><tr><th>#</th><th>${esc(u.quote.printItem)}</th><th>${esc(u.quote.printDivision)}</th><th>${esc(u.quote.printQty)}</th></tr></thead>
    <tbody>${items.map((i, n) => `<tr><td>${n + 1}</td><td>${esc(quote.label(i))}${i.spec ? `<br><small>${esc(i.spec)}</small>` : ""}</td><td>${esc(DATA.divById[i.div]?.short || "—")}</td><td>${esc(i.qty)} ${esc(u.units[i.unit] || i.unit)}</td></tr>`).join("")}</tbody></table>
    ${notes ? `<p class="ps-notes"><b>${esc(u.quote.notesLabel)}:</b> ${esc(notes)}</p>` : ""}
    <footer>${esc(DATA.brand.address)} · ${esc(DATA.brand.hours)}</footer>`;
  document.documentElement.classList.add("print-quote");
  addEventListener("afterprint", () => document.documentElement.classList.remove("print-quote"), { once: true });
  window.print();
}

/* ---------- drawer ---------- */
function drawerShell(u) {
  const q = u.quote;
  return `<div class="drawer" data-drawer inert>
    <div class="drawer__scrim" data-quote-close></div>
    <aside class="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="qd-title" tabindex="-1">
      <div class="drawer__grip" data-grip aria-hidden="true"></div>
      <header class="drawer__head">
        <div>
          <span class="eyebrow"><span class="eyebrow__dot"></span>${esc(q.eyebrow)}</span>
          <h2 id="qd-title">${esc(u.quoteList)} <sup data-quote-count>0</sup></h2>
        </div>
        <button class="iconbtn" type="button" data-quote-close aria-label="${esc(u.close)}">${icon("x")}</button>
      </header>
      <div class="drawer__tabs" role="tablist">
        <button role="tab" type="button" data-tab="list" aria-selected="true">${icon("list")}${esc(q.tabList)}</button>
        <button role="tab" type="button" data-tab="paste" aria-selected="false">${icon("paste")}${esc(q.tabPaste)}</button>
        <button role="tab" type="button" data-tab="history" aria-selected="false">${icon("history")}${esc(q.tabHistory)}</button>
      </div>
      <div class="drawer__body" data-quote-body data-pane="list"></div>
      <div class="drawer__body" data-pane="paste" hidden>
        <h3 class="drawer__h">${esc(q.pasteTitle)}</h3>
        <p class="drawer__hint">${esc(q.pasteHint)}</p>
        <textarea class="paste" rows="8" data-paste placeholder="${esc(q.pastePlaceholder)}"></textarea>
        <p class="drawer__result" data-paste-result aria-live="polite"></p>
      </div>
      <div class="drawer__body" data-pane="history" hidden></div>
      <footer class="drawer__foot" data-quote-foot></footer>
    </aside>
  </div>`;
}

function row(i, u) {
  return `<li class="qitem" style="--c:${divColor(i.div)}" data-id="${esc(i.id)}">
    <span class="qitem__dot"></span>
    <div class="qitem__main">
      <span class="qitem__name">${esc(quote.label(i))}${i.div === "custom" ? ` <em class="qitem__tag">${esc(u.quote.custom)}</em>` : ""}${i.spec ? `<small class="qitem__spec">“${esc(i.spec)}”</small>` : ""}</span>
      <div class="qitem__ctrl">
        <div class="stepper">
          <button type="button" data-step="-1" aria-label="${esc(u.quote.decrease)}">${icon("minus")}</button>
          <input type="number" inputmode="decimal" min="0" step="any" value="${esc(i.qty)}" aria-label="${esc(u.quote.qty)}" data-qty>
          <button type="button" data-step="1" aria-label="${esc(u.quote.increase)}">${icon("plus")}</button>
        </div>
        <select data-unit aria-label="${esc(u.quote.unit)}">${UNITS.map((x) => `<option value="${x}"${x === i.unit ? " selected" : ""}>${esc(u.units[x] || x)}</option>`).join("")}</select>
      </div>
    </div>
    <button class="iconbtn iconbtn--sm" type="button" data-remove aria-label="${esc(u.quote.remove)}">${icon("trash")}</button>
  </li>`;
}

export function initQuote(data) {
  DATA = data;
  DATA.byId = Object.fromEntries(data.items.map((i) => [i.id, i]));
  DATA.divById = Object.fromEntries(data.divisions.map((d) => [d.id, d]));
  const u = data.ui;
  const q = u.quote;
  const indexed = indexItems(data.items);

  document.body.insertAdjacentHTML("beforeend", drawerShell(u));
  const drawer = document.querySelector("[data-drawer]");
  const panel = drawer.querySelector(".drawer__panel");
  const body = drawer.querySelector("[data-quote-body]");
  const foot = drawer.querySelector("[data-quote-foot]");
  const panes = [...drawer.querySelectorAll("[data-pane]")];
  const tabs = [...drawer.querySelectorAll("[data-tab]")];
  const paste = drawer.querySelector("[data-paste]");
  let tab = "list";
  let notes = "";
  let lastFocus = null;

  const setTab = (name) => {
    tab = name;
    tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.tab === name)));
    panes.forEach((p) => (p.hidden = p.dataset.pane !== name));
    renderFoot();
    if (name === "history") renderHistory();
    if (name === "paste") setTimeout(() => paste.focus(), 60);
  };

  const open = (name = "list") => {
    lastFocus = document.activeElement;
    drawer.inert = false;
    drawer.classList.add("is-open");
    document.documentElement.classList.add("drawer-open");
    setTab(name);
    setTimeout(() => name === "list" && panel.focus(), 60);
  };
  const close = () => {
    drawer.classList.remove("is-open");
    document.documentElement.classList.remove("drawer-open");
    setTimeout(() => (drawer.inert = true), 450);
    lastFocus?.focus?.();
  };
  quote.open = open;

  const renderFoot = () => {
    if (tab === "paste") {
      foot.innerHTML = `<button class="btn btn--ink btn--block" type="button" data-paste-go data-ic="plus"><span class="btn__label">${esc(q.pasteButton)}</span><span class="btn__icon">${icon("plus")}</span></button>`;
      return;
    }
    if (tab === "history" || !items.length) { foot.innerHTML = ""; return; }
    foot.innerHTML = `
      <a class="btn btn--wa btn--block" data-send-wa target="_blank" rel="noopener" href="#" data-ic="whatsapp"><span class="btn__label">${esc(q.sendWhatsapp)}</span><span class="btn__icon">${icon("whatsapp")}</span></a>
      <a class="btn btn--ghost btn--block" href="${data.root}contact.html#enquiry" data-ic="arrow"><span class="btn__label">${esc(q.toForm)}</span><span class="btn__icon">${icon("arrow")}</span></a>
      <div class="drawer__tools">
        <button type="button" class="tool" data-share>${icon("share")}${esc(q.share)}</button>
        <button type="button" class="tool" data-pdf>${icon("print")}${esc(q.pdf)}</button>
        <button type="button" class="tool tool--quiet" data-clear>${icon("trash")}${esc(q.clear)}</button>
      </div>`;
    updateWa();
  };

  const render = () => {
    const list = items;
    document.querySelectorAll("[data-quote-count]").forEach((el) => {
      if (el.textContent !== String(list.length)) {
        el.textContent = list.length;
        el.classList.remove("bump");
        void el.offsetWidth;
        el.classList.add("bump");
      }
    });
    document.documentElement.classList.toggle("has-quote", list.length > 0);
    const bar = document.querySelector(".qbar-m");
    if (bar) {
      bar.hidden = !list.length;
      const txt = bar.querySelector("[data-qbar-text]");
      txt.textContent = fmt(txt.dataset.tpl, { n: list.length });
    }
    syncAddButtons();

    if (!list.length) {
      body.innerHTML = `<div class="qempty">
        <div class="qempty__mark">${logoMark()}</div>
        <p class="qempty__title">${esc(q.emptyTitle)}</p>
        <p>${esc(q.emptyBody)}</p>
        <div class="qempty__actions">
          <a class="btn btn--ink" href="${data.root}catalog.html" data-ic="arrowUR"><span class="btn__label">${esc(u.browseProducts)}</span><span class="btn__icon">${icon("arrowUR")}</span></a>
          <button class="btn btn--ghost" type="button" data-goto="paste" data-ic="paste"><span class="btn__label">${esc(q.tabPaste)}</span><span class="btn__icon">${icon("paste")}</span></button>
        </div>
      </div>`;
    } else {
      const divs = new Set(list.map((i) => i.div)).size;
      body.innerHTML = `<p class="qsummary">${esc(list.length === 1 ? q.summaryOne : fmt(q.summary, { n: list.length, d: divs }))}</p><ul class="qlist">${list.map((i) => row(i, u)).join("")}</ul>
        <label class="qnotes"><span>${esc(q.notes)}</span><textarea rows="3" data-notes placeholder="${esc(q.notesPlaceholder)}">${esc(notes)}</textarea></label>`;
    }
    renderFoot();
  };

  const renderHistory = () => {
    const h = read(HKEY, []);
    const pane = drawer.querySelector('[data-pane="history"]');
    const df = new Intl.DateTimeFormat(data.locale, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
    pane.innerHTML = h.length
      ? `<ul class="hlist">${h
          .map(
            (e, n) => `<li class="hitem">
          <div><b>${esc(df.format(new Date(e.at)))}</b><small>${esc(fmt(q.historyItems, { n: e.items.length }))}</small>
          <p>${e.items.slice(0, 4).map((i) => esc(quote.label(i))).join(" · ")}${e.items.length > 4 ? " …" : ""}</p></div>
          <button class="btn btn--ghost btn--sm" type="button" data-reuse="${n}" data-ic="history"><span class="btn__label">${esc(q.historyReload)}</span><span class="btn__icon">${icon("history")}</span></button>
        </li>`
          )
          .join("")}</ul>`
      : `<div class="qempty"><div class="qempty__mark">${icon("history")}</div><p>${esc(q.historyEmpty)}</p></div>`;
  };

  const updateWa = () => {
    const a = foot.querySelector("[data-send-wa]");
    if (a) a.href = waHref(data.brand.whatsapp, quoteText(items, notes));
  };

  /* Remove with an undo toast — used by the drawer and by toggled add buttons. */
  const removeWithUndo = (id) => {
    const at = items.findIndex((i) => i.id === id);
    if (at < 0) return;
    const entry = items[at];
    quote.remove(id);
    toast(esc(fmt(u.removedToast, { name: quote.label(entry) })), { action: { label: u.undo, run: () => quote.insert(entry, at) } });
  };

  // Delegated drawer interactions (no re-render while typing).
  body.addEventListener("input", (e) => {
    const li = e.target.closest("[data-id]");
    if (e.target.matches("[data-notes]")) { notes = e.target.value; updateWa(); return; }
    if (li && e.target.matches("[data-qty]")) { quote.update(li.dataset.id, { qty: e.target.value }); updateWa(); }
  });
  body.addEventListener("change", (e) => {
    const li = e.target.closest("[data-id]");
    if (li && e.target.matches("[data-unit]")) { quote.update(li.dataset.id, { unit: e.target.value }); updateWa(); }
  });
  drawer.addEventListener("click", (e) => {
    const li = e.target.closest("[data-id]");
    const step = e.target.closest("[data-step]");
    if (li && step) {
      const input = li.querySelector("[data-qty]");
      const cur = parseFloat(input.value) || 0;
      const inc = cur >= 100 ? 50 : cur >= 20 ? 10 : cur >= 5 ? 5 : 1;
      input.value = Math.max(0, cur + inc * Number(step.dataset.step));
      quote.update(li.dataset.id, { qty: input.value });
      updateWa();
    }
    if (li && e.target.closest("[data-remove]")) {
      li.classList.add("is-out");
      setTimeout(() => removeWithUndo(li.dataset.id), 220);
    }
    const t = e.target.closest("[data-tab]");
    if (t) setTab(t.dataset.tab);
    const g = e.target.closest("[data-goto]");
    if (g) setTab(g.dataset.goto);
    if (e.target.closest("[data-send-wa]")) quote.remember();
    if (e.target.closest("[data-clear]")) {
      const before = items.slice();
      notes = "";
      quote.clear();
      toast(esc(q.clear), { action: { label: u.undo, run: () => quote.replace(before) } });
    }
    if (e.target.closest("[data-pdf]")) printQuote(notes);
    if (e.target.closest("[data-share]")) {
      const url = shareUrl();
      if (navigator.share && matchMedia("(pointer: coarse)").matches) navigator.share({ title: u.quoteList, url }).catch(() => {});
      else navigator.clipboard?.writeText(url).then(() => toast(esc(q.linkCopied)), () => prompt(q.share, url));
    }
    const reuse = e.target.closest("[data-reuse]");
    if (reuse) {
      const before = items.slice();
      quote.replace(read(HKEY, [])[Number(reuse.dataset.reuse)].items);
      setTab("list");
      toast(esc(fmt(q.sharedLoaded, { n: items.length })), { action: { label: u.undo, run: () => quote.replace(before) } });
    }
    if (e.target.closest("[data-paste-go]")) {
      const parsed = parseList(paste.value, indexed);
      let m = 0, cnum = 0;
      parsed.forEach((p) => {
        if (p.item) {
          m++;
          quote.add({ id: p.item.id, name: p.item.raw, div: p.item.div, unit: p.unit || p.item.unit }, { qty: p.qty ?? undefined, silent: true });
          if (p.unit) quote.update(p.item.id, { unit: p.unit });
          if (p.spec) quote.update(p.item.id, { spec: p.spec });
        } else {
          cnum++;
          const id = `custom-${p.text.toLowerCase().replace(/\s+/g, "-").slice(0, 40)}`;
          quote.add({ id, name: p.text.replace(/\s*[\d.]+\s*\S*$/, "") || p.text, div: "custom", unit: p.unit || "kg" }, { qty: p.qty ?? 1, silent: true });
        }
      });
      if (parsed.length) {
        buzz();
        paste.value = "";
        setTab("list");
        toast(esc(fmt(q.pasteResult, { m, c: cnum })));
      }
    }
  });

  // Re-render only on structural changes (add / remove / clear / replace).
  let lastIds = items.map((i) => i.id).join("|");
  quote.subscribe((list) => {
    const ids = list.map((i) => i.id).join("|");
    if (ids !== lastIds) { lastIds = ids; render(); }
  });
  render();

  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-quote-open]");
    if (opener) { e.preventDefault(); open(opener.dataset.quoteOpen || "list"); }
    if (e.target.closest("[data-quote-close]")) close();
    const add = e.target.closest("[data-add]");
    if (add && !add.dataset.dragged) {
      e.preventDefault();
      const it = JSON.parse(add.dataset.add);
      if (quote.has(it.id)) removeWithUndo(it.id);
      else {
        quote.add(it);
        add.classList.add("pop");
        setTimeout(() => add.classList.remove("pop"), 500);
        toast(`<strong>${esc(fmt(u.addedToast, { name: quote.label(it) }))}</strong>`, { action: { label: u.viewList, run: () => open() } });
      }
    }
    const many = e.target.closest("[data-starter], [data-add-all]");
    if (many) {
      const ids = JSON.parse(many.dataset.starter || many.dataset.addAll);
      ids.forEach((id) => { const it = DATA.byId[id]; if (it) quote.add({ id, name: it.raw, div: it.div, unit: it.unit }, { silent: true }); });
      buzz();
      const tpl = many.dataset.starter ? u.home.audienceLoaded : u.division.rangeAdded;
      toast(`<strong>${esc(fmt(tpl, { n: ids.length }))}</strong>`, { action: { label: u.viewList, run: () => open() } });
    }
    const pr = e.target.closest("[data-print]");
    if (pr) {
      document.documentElement.classList.add(`print-${pr.dataset.print}`);
      addEventListener("afterprint", () => document.documentElement.classList.remove(`print-${pr.dataset.print}`), { once: true });
      window.print();
    }
  });

  // Keyboard: Esc closes, Tab is trapped inside the open drawer.
  addEventListener("keydown", (e) => {
    if (!drawer.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "Tab") {
      const f = [...panel.querySelectorAll("a[href],button,input,select,textarea")].filter((el) => !el.disabled && el.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
    }
  });

  // Swipe the sheet down to close (phones).
  let y0 = null;
  drawer.querySelector("[data-grip]").addEventListener("pointerdown", (e) => (y0 = e.clientY));
  addEventListener("pointerup", (e) => { if (y0 !== null && e.clientY - y0 > 60) close(); y0 = null; });

  // Another tab changed the list → stay in sync.
  addEventListener("storage", (e) => { if (e.key === KEY) { items = read(KEY, []); listeners.forEach((fn) => fn(items)); } });

  if (loadShared()) open();
}

export function syncAddButtons(root = document) {
  root.querySelectorAll("[data-add]").forEach((b) => {
    try {
      const on = quote.has(JSON.parse(b.dataset.add).id);
      b.setAttribute("aria-pressed", String(on));
      b.classList.toggle("is-on", on);
      const label = b.querySelector(".add__label");
      if (label) label.textContent = on ? label.dataset.on : label.dataset.off;
    } catch (_) {}
  });
}
