/* ============================================================
   motion.js — browser behaviour shared by every page: nav, menu,
   reveals, counters, kinetic headline, accordions, small widgets
   and the hand-off for cross-page view transitions.
   Scroll-scrubbed effects live in CSS (animation-timeline);
   this file only fills in where a browser lacks them.
   ============================================================ */
import { fmt, esc } from "./ui.js";
import { openStatus } from "./chrome.js";
import { quote, toast } from "./quote.js";
import { attachVoice } from "./palette.js";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
const scrollTimelines = typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()");
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const vt = (fn) => (document.startViewTransition && !reduced ? document.startViewTransition(fn) : fn());

/* ---------- broken remote image → branded placeholder ---------- */
function imageFallbacks(root) {
  const swap = (im) => {
    if (im.dataset.failed) return;
    im.dataset.failed = "1";
    im.removeAttribute("srcset");
    im.src = `${root}assets/placeholder.svg`;
  };
  $$("img[data-fallback]").forEach((im) => {
    if (im.complete && im.naturalWidth === 0 && im.src) swap(im);
    im.addEventListener("error", () => swap(im), { once: true });
  });
}

/* ---------- nav, menu, progress, back-to-top ---------- */
function chrome() {
  const html = document.documentElement;
  const nav = document.querySelector("[data-nav]");
  const menu = document.querySelector("[data-menu]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const setMenu = (open) => {
    html.classList.toggle("menu-open", open);
    menu.inert = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? toggle.dataset.close : toggle.dataset.open);
  };
  toggle?.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  addEventListener("keydown", (e) => e.key === "Escape" && html.classList.contains("menu-open") && setMenu(false));

  let lastY = scrollY;
  const bar = document.querySelector("[data-progress]");
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle("is-scrolled", y > 24);
    if (!html.classList.contains("menu-open")) {
      if (y > 480 && y > lastY + 4) nav.classList.add("is-hidden");
      else if (y < lastY - 4 || y < 480) nav.classList.remove("is-hidden");
    }
    html.classList.toggle("nav-hidden", nav.classList.contains("is-hidden"));
    lastY = y;
    if (!scrollTimelines && bar) {
      const h = html.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? Math.min(1, y / h) : 0})`;
    }
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  document.querySelector("[data-totop]")?.addEventListener("click", () => scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }));
}

/* ---------- live open / closed pills ---------- */
function statusPills(data) {
  const paint = () => {
    const s = openStatus(data.brand, data.ui.status);
    $$("[data-status]").forEach((el) => {
      el.classList.toggle("is-open", s.open);
      el.classList.toggle("is-closed", !s.open);
      el.lastElementChild.textContent = s.text;
    });
  };
  paint();
  setInterval(paint, 60000);
}

/* ---------- reveal on view ---------- */
function reveals() {
  const els = $$("[data-reveal], [data-split], .stats, [data-receipt], .tile--ontime, .tile--quote");
  if (reduced || !("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("is-in")); return; }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }),
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );
  // Whatever is already on screen reveals now — don't wait for the observer's first pass.
  els.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * 0.92 && r.bottom > 0) el.classList.add("is-in");
    else io.observe(el);
  });
}

/* ---------- number count-up (final values are in the HTML already) ---------- */
function counters() {
  if (reduced) return;
  const run = (el) => {
    const end = parseFloat(el.dataset.count);
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / 1500);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4))).toLocaleString("en-IN");
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } }), { threshold: 0.5 });
  $$("[data-count]").forEach((el) => {
    if (el.getBoundingClientRect().top > innerHeight) { el.textContent = "0"; io.observe(el); }
  });
}

/* ---------- kinetic headline: letters thicken near the cursor ---------- */
function kinetic(lang) {
  const h = document.querySelector("[data-kinetic]");
  if (!h || !fine || reduced) return;
  // Latin splits per letter; Devanagari per word (letters would break conjuncts).
  const unit = lang === "hi" ? /(\s+)/ : /(\s+|)/;
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(unit).filter((s) => s !== "").forEach((s) => {
          if (/^\s+$/.test(s)) return frag.append(s);
          const span = document.createElement("span");
          span.className = "k";
          span.textContent = s;
          frag.append(span);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.classList.contains("serif")) walk(n);
    });
  };
  walk(h);
  const spans = $$(".k", h);
  let px = -1e4, py = -1e4, raf = 0;
  const paint = () => {
    raf = 0;
    for (const s of spans) {
      const r = s.getBoundingClientRect();
      const d = Math.hypot(r.left + r.width / 2 - px, r.top + r.height / 2 - py);
      const f = Math.max(0, 1 - d / 280) ** 2;
      s.style.fontWeight = Math.round(600 + 200 * f);
      s.style.fontStretch = `${(92 - 10 * f).toFixed(1)}%`;
    }
  };
  const hero = h.closest("[data-hero]") || h;
  hero.addEventListener("pointermove", (e) => { px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(paint); });
  hero.addEventListener("pointerleave", () => { px = py = -1e4; if (!raf) raf = requestAnimationFrame(paint); });
}

/* ---------- divisions accordion (home) ---------- */
function aisles() {
  const root = document.querySelector("[data-aisles]");
  if (!root) return;
  const list = $$("[data-aisle]", root);
  const set = (n) =>
    list.forEach((a, i) => {
      const on = i === n;
      a.classList.toggle("is-active", on);
      a.querySelector(".aisle__tab").setAttribute("aria-expanded", String(on));
      a.querySelector(".aisle__panel").inert = !on;
    });
  list.forEach((a, i) => {
    const tab = a.querySelector(".aisle__tab");
    tab.addEventListener("click", () => set(i));
    if (fine) {
      let t;
      tab.addEventListener("pointerenter", () => (t = setTimeout(() => set(i), 160)));
      tab.addEventListener("pointerleave", () => clearTimeout(t));
    }
  });
}

/* ---------- industry explorer (tabs) ---------- */
function explorer() {
  const root = document.querySelector("[data-explorer]");
  if (!root) return;
  const tabs = $$('[role="tab"]', root);
  const panels = $$('[role="tabpanel"]', root);
  const set = (n, focus) =>
    vt(() => {
      tabs.forEach((t, i) => { t.setAttribute("aria-selected", String(i === n)); t.tabIndex = i === n ? 0 : -1; });
      panels.forEach((p, i) => (p.hidden = i !== n));
      if (focus) tabs[n].focus();
    });
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => set(i));
    t.addEventListener("keydown", (e) => {
      const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (k) { e.preventDefault(); set((i + k + tabs.length) % tabs.length, true); }
    });
  });
}

/* ---------- testimonials ---------- */
function quotesSlider() {
  const root = document.querySelector("[data-quotes]");
  if (!root) return;
  const slides = $$(".quote", root);
  const bars = $$(".qbar", root);
  let i = 0, timer;
  const go = (n) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => { s.classList.toggle("is-active", k === i); s.setAttribute("aria-hidden", String(k !== i)); });
    bars.forEach((b, k) => { b.classList.remove("is-active"); if (k === i) { void b.offsetWidth; b.classList.add("is-active"); } });
    clearTimeout(timer);
    if (!reduced) timer = setTimeout(() => go(i + 1), 7000);
  };
  bars.forEach((b) => b.addEventListener("click", () => go(Number(b.dataset.q))));
  root.querySelector("[data-q-prev]")?.addEventListener("click", () => go(i - 1));
  root.querySelector("[data-q-next]")?.addEventListener("click", () => go(i + 1));
  go(0);
}

/* ---------- bento widgets ---------- */
function switches() {
  $$("[data-switch-tile]").forEach((tile) => {
    const opts = $$("[data-switch]", tile);
    const text = tile.querySelector("[data-switch-text]");
    const set = (k) => {
      tile.classList.toggle("is-b", k === "b");
      opts.forEach((o) => { const on = o.dataset.switch === k; o.classList.toggle("is-on", on); o.setAttribute("aria-pressed", String(on)); });
      text.textContent = text.dataset[k];
    };
    let auto = reduced ? 0 : setInterval(() => set(tile.classList.contains("is-b") ? "a" : "b"), 3600);
    opts.forEach((o) => o.addEventListener("click", () => { set(o.dataset.switch); clearInterval(auto); }));
  });
}

function calculator(data) {
  const tile = document.querySelector("[data-calc]");
  if (!tile) return;
  const kg = tile.querySelector("[data-calc-kg]");
  const pack = tile.querySelector("[data-calc-pack]");
  const out = tile.querySelector("[data-calc-n]");
  const sub = tile.querySelector("[data-calc-sub]");
  const addBtn = tile.querySelector("[data-calc-add]");
  const base = JSON.parse(tile.dataset.addBase);
  let n = 0;
  const update = () => {
    n = Math.max(0, Math.ceil((parseFloat(kg.value) || 0) / parseFloat(pack.value)));
    out.textContent = n.toLocaleString("en-IN");
    sub.textContent = fmt(sub.dataset.tpl, { pack: pack.selectedOptions[0].textContent, kg: kg.value || 0 });
    addBtn.querySelector(".btn__label").textContent = fmt(addBtn.dataset.tpl, { n: n.toLocaleString("en-IN") });
    addBtn.disabled = !n;
  };
  kg.addEventListener("input", update);
  pack.addEventListener("change", update);
  addBtn.addEventListener("click", () => {
    if (quote.has(base.id)) quote.update(base.id, { qty: n, unit: "pcs" });
    else quote.add({ ...base, unit: "pcs" }, { qty: n });
    toast(`<strong>${esc(fmt(data.ui.addedToast, { name: quote.label(base) }))}</strong> · ${n.toLocaleString("en-IN")}`, { action: { label: data.ui.viewList, run: () => quote.open() } });
  });
  update();
}

/* The 24h tile carries a real clock, on IST. */
function clocks() {
  const el = document.querySelector("[data-clock]");
  if (!el) return;
  const fmtIST = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "numeric", second: "numeric", hour12: false });
  const tick = () => {
    const [h, m, s] = fmtIST.format(new Date()).split(":").map(Number);
    el.style.setProperty("--h", `${(h % 12) * 30 + m * 0.5}deg`);
    el.style.setProperty("--m", `${m * 6}deg`);
    el.style.setProperty("--s", `${s * 6}deg`);
  };
  tick();
  setInterval(tick, 1000);
}

/* ---------- product strip: CSS scroll-timeline, JS stand-in elsewhere ---------- */
function stripFallback() {
  const strip = document.querySelector("[data-strip]");
  if (!strip || scrollTimelines || reduced) return;
  const rows = $$("[data-strip-row] .strip__track", strip);
  const paint = () => {
    const r = strip.getBoundingClientRect();
    const p = 1 - (r.top + r.height) / (innerHeight + r.height);
    rows.forEach((t, i) => (t.style.transform = `translate3d(${(i % 2 ? -25 + p * 25 : -p * 25).toFixed(2)}%,0,0)`));
  };
  addEventListener("scroll", () => requestAnimationFrame(paint), { passive: true });
  paint();
}

/* ---------- cross-page view transitions: name the image you clicked ---------- */
function viewTransitionHandoff() {
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-vt-link], a[data-vt]");
    if (!a) return;
    const name = a.dataset.vtLink || a.dataset.vt;
    const media = a.matches("[data-vt]") ? a : a.querySelector(`[data-vt="${name}"]`) || document.querySelector(`[data-vt="${name}"]`);
    if (media) media.style.viewTransitionName = name;
  });
  // Coming back via the back button: clear names so the next click starts clean.
  addEventListener("pageshow", () => $$("[data-vt]").forEach((el) => (el.style.viewTransitionName = "")));
}

/* ---------- install as an app + offline cache ---------- */
function pwa(root) {
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  if ("serviceWorker" in navigator && !local) navigator.serviceWorker.register(`${root}sw.js`).catch(() => {});
  let deferred = null;
  const btn = document.querySelector("[data-install]");
  addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; if (btn) btn.hidden = false; });
  btn?.addEventListener("click", async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; btn.hidden = true; });
}

export function initMotion(data) {
  imageFallbacks(data.root);
  chrome();
  statusPills(data);
  reveals();
  counters();
  kinetic(data.lang);
  aisles();
  explorer();
  quotesSlider();
  switches();
  calculator(data);
  clocks();
  stripFallback();
  viewTransitionHandoff();
  pwa(data.root);
  $$("[data-voice]").forEach((b) => attachVoice(b, document.querySelector(b.dataset.target), data.locale));
  document.documentElement.classList.add("is-ready");
}
