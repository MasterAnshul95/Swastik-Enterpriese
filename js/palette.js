/* ============================================================
   palette.js — "/" or Ctrl/⌘+K search over every product,
   division and page. Typo-tolerant, Hindi/English aware, and
   speaks: the mic button uses the browser's speech recognition.
   ============================================================ */
import { esc, icon, telHref, waHref, divColor } from "./ui.js";
import { indexItems, searchItems, norm } from "./search.js";
import { quote, toast } from "./quote.js";

/* Speech-to-text into any input (catalog search, palette). */
export function attachVoice(btn, input, locale) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR || !btn) return;
  btn.hidden = false;
  btn.addEventListener("click", () => {
    const rec = new SR();
    rec.lang = locale;
    rec.interimResults = true;
    btn.classList.add("is-listening");
    rec.onresult = (e) => {
      input.value = [...e.results].map((r) => r[0].transcript).join(" ");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    };
    rec.onend = rec.onerror = () => btn.classList.remove("is-listening");
    rec.start();
  });
}

export function initPalette(data) {
  const u = data.ui;
  const p = u.palette;
  const indexed = indexItems(data.items);
  const products = indexed.map((it) => ({ type: "product", label: it.raw, sub: it.divName, div: it.div, item: it }));
  const divisions = data.divisions.map((d) => ({ type: "division", label: d.name, sub: d.lines, div: d.id, href: `${data.root}${d.file}` }));
  const pages = data.nav.map((n) => ({ type: "page", label: n.label, sub: "", href: `${data.root}${n.href}` }));
  const actions = [
    { type: "action", label: p.openQuote, sub: p.openQuoteSub, run: () => quote.open() },
    { type: "action", label: p.paste, sub: p.pasteSub, run: () => quote.open("paste") },
    { type: "action", label: `${u.call} ${data.brand.phone}`, sub: p.callSub, href: telHref(data.brand.phone) },
    { type: "action", label: u.whatsapp, sub: p.waSub, href: waHref(data.brand.whatsapp), blank: true },
  ];
  const others = [...divisions, ...pages, ...actions];

  document.body.insertAdjacentHTML(
    "beforeend",
    `<div class="palette" data-palette inert>
      <div class="palette__scrim" data-palette-close></div>
      <div class="palette__box" role="dialog" aria-modal="true" aria-label="${esc(u.search)}">
        <label class="palette__input">${icon("search")}<input type="text" placeholder="${esc(p.placeholder)}" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="palette-list" data-palette-input><button type="button" class="palette__mic" data-palette-mic aria-label="${esc(p.voice)}" hidden>${icon("mic")}</button><kbd>esc</kbd></label>
        <ul class="palette__list" id="palette-list" role="listbox" data-palette-list></ul>
        <div class="palette__hint"><span><kbd>↑</kbd><kbd>↓</kbd> ${esc(p.move)}</span><span><kbd>↵</kbd> ${esc(p.select)}</span></div>
      </div>
    </div>`
  );
  const el = document.querySelector("[data-palette]");
  const input = el.querySelector("[data-palette-input]");
  const list = el.querySelector("[data-palette-list]");
  attachVoice(el.querySelector("[data-palette-mic]"), input, data.locale);
  let results = [];
  let active = 0;

  const search = (q) => {
    if (!norm(q)) return [...actions.slice(0, 2), ...divisions, ...products.slice(0, 4)];
    const hits = searchItems(q, indexed, 10).map((it) => products.find((x) => x.item.id === it.id));
    const terms = norm(q).split(" ");
    const extra = others.filter((r) => terms.every((t) => norm(`${r.label} ${r.sub}`).includes(t)));
    return [...hits, ...extra].slice(0, 12);
  };

  const draw = () => {
    if (!results.length) {
      list.innerHTML = `<li class="palette__empty">${esc(p.empty)} <a href="${data.root}contact.html">${esc(p.ask)}</a></li>`;
      return;
    }
    list.innerHTML = results
      .map((r, i) => {
        const added = r.type === "product" && quote.has(r.item.id);
        const tag = r.type === "product" ? (added ? p.tagIn : p.tagAdd) : r.type === "division" ? p.tagDivision : r.type === "page" ? p.tagPage : p.tagAction;
        const glyph = r.type === "product" ? `<img src="${esc(r.item.image.split("?")[0])}?auto=format&fit=crop&w=96&h=96&q=60" alt="" loading="lazy">` : r.type === "division" ? "<i></i>" : icon(r.type === "page" ? "arrowUR" : "sparkle");
        return `<li role="option" id="pal-${i}" aria-selected="${i === active}" class="palette__item${i === active ? " is-active" : ""}" data-i="${i}" ${r.div ? `style="--c:${divColor(r.div)}"` : ""}>
          <span class="palette__glyph">${glyph}</span>
          <span class="palette__text"><strong>${esc(r.label)}</strong>${r.sub ? `<small>${esc(r.sub)}</small>` : ""}</span>
          <span class="palette__tag${added ? " is-on" : ""}">${esc(tag)}</span>
        </li>`;
      })
      .join("");
    input.setAttribute("aria-activedescendant", `pal-${active}`);
    list.querySelector(".is-active")?.scrollIntoView({ block: "nearest" });
  };

  const run = (r) => {
    if (!r) return;
    if (r.type === "product") {
      const it = r.item;
      if (quote.has(it.id)) quote.remove(it.id);
      else { quote.add({ id: it.id, name: it.raw, div: it.div, unit: it.unit }); toast(`<strong>${esc(it.raw)}</strong>`); }
      draw();
      return;
    }
    close();
    if (r.run) r.run();
    else if (r.blank) window.open(r.href, "_blank", "noopener");
    else location.href = r.href;
  };

  const openP = () => {
    el.inert = false;
    el.classList.add("is-open");
    document.documentElement.classList.add("palette-open");
    input.value = "";
    active = 0;
    results = search("");
    draw();
    setTimeout(() => input.focus(), 30);
  };
  const close = () => {
    el.classList.remove("is-open");
    document.documentElement.classList.remove("palette-open");
    setTimeout(() => (el.inert = true), 300);
  };

  input.addEventListener("input", () => { active = 0; results = search(input.value); draw(); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); active = Math.min(results.length - 1, active + 1); draw(); }
    if (e.key === "ArrowUp") { e.preventDefault(); active = Math.max(0, active - 1); draw(); }
    if (e.key === "Enter") { e.preventDefault(); run(results[active]); }
  });
  list.addEventListener("click", (e) => {
    const li = e.target.closest("[data-i]");
    if (li) { active = Number(li.dataset.i); run(results[active]); }
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-palette-open]")) { e.preventDefault(); openP(); }
    if (e.target.closest("[data-palette-close]")) close();
  });
  addEventListener("keydown", (e) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    const isOpen = el.classList.contains("is-open");
    if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing && !isOpen)) { e.preventDefault(); isOpen ? close() : openP(); }
    else if (e.key === "Escape" && isOpen) close();
  });
}
