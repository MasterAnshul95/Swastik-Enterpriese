/* ============================================================
   animations.js — motion layer.
   Lenis smooth scroll + GSAP/ScrollTrigger (reveals, split-text,
   parallax, pinning) + HUD rail/readouts + image fallback.
   GSAP/ScrollTrigger/Lenis arrive as CDN globals.
   ============================================================ */

const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

let lenis = null;

/* ---------- image fallback (failed remote img -> local placeholder) ---------- */
export function initImageFallback() {
  window.__imgFail = (el) => {
    if (!el || el.dataset.failed) return;
    el.dataset.failed = "1";
    el.classList.add("img-failed");
    el.src = "/assets/placeholder.svg";
  };
  // catch images that errored before the handler attached
  document.querySelectorAll("img").forEach((im) => {
    if (im.complete && im.naturalWidth === 0) window.__imgFail(im);
  });
}

/* ---------- Lenis ---------- */
function initLenis() {
  if (prefersReduced || typeof Lenis === "undefined") return;
  lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  if (typeof ScrollTrigger !== "undefined") {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  document.querySelectorAll('a[href*="#"]').forEach((a) => {
    const url = new URL(a.href, location.href);
    if (url.pathname === location.pathname && url.hash) {
      a.addEventListener("click", (e) => {
        const target = document.querySelector(url.hash);
        if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -90 }); }
      });
    }
  });
}
export function scrollTo(target) { if (lenis) lenis.scrollTo(target, { offset: -80 }); }

/* ---------- split text into masked words ---------- */
function splitWords(el) {
  const words = [];
  const walk = (node, extra) => {
    const frag = document.createDocumentFragment();
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (part === "") return;
          if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
          const mask = document.createElement("span");
          mask.className = "reveal-mask";
          mask.style.display = "inline-block";
          const w = document.createElement("span");
          w.className = "word" + (extra ? " " + extra : "");
          w.textContent = part;
          mask.appendChild(w);
          frag.appendChild(mask);
          frag.appendChild(document.createTextNode(" "));
          words.push(w);
        });
      } else if (child.nodeType === 1) {
        frag.appendChild(walk(child, ((extra || "") + " " + (child.getAttribute("class") || "")).trim()));
      }
    });
    return frag;
  };
  const frag = walk(el, "");
  el.innerHTML = "";
  el.appendChild(frag);
  return words;
}

function initSplitText() {
  const heads = [...document.querySelectorAll("[data-split]")];
  heads.forEach((el) => {
    const words = splitWords(el);
    if (prefersReduced || typeof IntersectionObserver === "undefined") return;
    gsap.set(words, { yPercent: 115 });
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        gsap.to(words, { yPercent: 0, duration: 0.95, ease: "power4.out", stagger: 0.035 });
        obs.unobserve(e.target);
      });
    }, { threshold: 0.2 });
    io.observe(el);
  });
}

/* ---------- generic reveals (IntersectionObserver) ---------- */
function initReveals() {
  const els = [...document.querySelectorAll("[data-reveal]")];
  if (!els.length) return;
  if (prefersReduced || typeof IntersectionObserver === "undefined" || typeof gsap === "undefined") {
    els.forEach((el) => { el.style.opacity = "1"; el.style.transform = "none"; });
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      gsap.to(entry.target, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", overwrite: "auto" });
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  els.forEach((el) => io.observe(el));
}

/* ---------- counters ---------- */
function initCounters() {
  const counters = [...document.querySelectorAll(".counter")];
  if (!counters.length) return;
  const run = (el) => {
    const raw = el.dataset.target || el.textContent;
    const target = parseFloat(String(raw).replace(/[^0-9.]/g, ""));
    if (isNaN(target)) { el.textContent = raw; return; }
    const isInt = Number.isInteger(target);
    const isYear = isInt && target >= 1900 && target <= 2100; // years shouldn't get a comma (2009, not 2,009)
    const obj = { v: 0 };
    gsap.to(obj, { v: target, duration: 1.6, ease: "power2.out", onUpdate: () => { el.textContent = isInt ? (isYear ? String(Math.round(obj.v)) : Math.round(obj.v).toLocaleString()) : obj.v.toFixed(1); } });
  };
  if (prefersReduced || typeof IntersectionObserver === "undefined") { counters.forEach((el) => (el.textContent = el.dataset.target || el.textContent)); return; }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => { if (e.isIntersecting) { run(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.5 });
  counters.forEach((el) => io.observe(el));
}

/* ---------- magnetic buttons ---------- */
function initMagnetic() {
  if (prefersReduced || !finePointer) return;
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    const s = 0.35;
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - (r.left + r.width / 2)) * s, y: (e.clientY - (r.top + r.height / 2)) * s, duration: 0.4, ease: "power3.out" });
    });
    el.addEventListener("mouseleave", () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" }));
  });
}

/* ---------- custom cursor ---------- */
function initCursor() {
  if (prefersReduced || !finePointer) return;
  const dot = document.createElement("div"); dot.className = "cursor-dot";
  const ring = document.createElement("div"); ring.className = "cursor-ring";
  document.body.append(dot, ring);
  document.documentElement.classList.add("custom-cursor-active");
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`; });
  (function loop() { rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18; ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`; requestAnimationFrame(loop); })();
  document.addEventListener("mouseover", (e) => { if (e.target.closest('[data-cursor="hover"]')) ring.classList.add("is-hover"); });
  document.addEventListener("mouseout", (e) => { if (e.target.closest('[data-cursor="hover"]')) ring.classList.remove("is-hover"); });
  addEventListener("mousedown", () => ring.classList.add("is-drag"));
  addEventListener("mouseup", () => ring.classList.remove("is-drag"));
}

/* ---------- scroll progress + HUD readouts ---------- */
function initScrollHud() {
  const bar = document.createElement("div"); bar.className = "scroll-progress"; document.body.appendChild(bar);
  const scr = document.getElementById("hud-scroll");
  const update = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    const p = h > 0 ? scrollY / h : 0;
    bar.style.transform = `scaleX(${p})`;
    if (scr) scr.textContent = String(Math.round(p * 100)).padStart(3, "0");
  };
  update();
  addEventListener("scroll", update, { passive: true });
}

/* ---------- 3D canvas scroll-fade (keeps mid-page text readable) ---------- */
function initSceneFade() {
  const canvas = document.getElementById("bg3d");
  if (!canvas) return;
  const isHome = document.body.dataset.page === "home";
  const update = () => {
    let o;
    if (isHome) o = 1 - Math.min(1, scrollY / (innerHeight * 0.7)) * 0.94; // 1 -> ~0.06
    else o = 0.38;
    canvas.style.opacity = String(Math.max(0.06, o));
  };
  update();
  addEventListener("scroll", update, { passive: true });
}

/* ---------- navbar: condense + hide on scroll-down, reveal on scroll-up ---------- */
function initNavbar() {
  const bar = document.getElementById("topbar");
  let last = 0;
  const onScroll = () => {
    const y = scrollY;
    if (bar) {
      bar.classList.toggle("scrolled", y > 24);
      const menuOpen = document.getElementById("menu-overlay") && !document.getElementById("menu-overlay").classList.contains("hidden");
      if (!menuOpen) {
        if (y > 280 && y > last + 6) bar.classList.add("hidden");
        else if (y < last - 6 || y < 280) bar.classList.remove("hidden");
      }
    }
    last = y;
  };
  onScroll(); addEventListener("scroll", onScroll, { passive: true });
  const menu = document.getElementById("menu-overlay");
  const open = document.getElementById("menu-open");
  const close = document.getElementById("menu-close");
  const toggle = (show) => {
    if (!menu) return;
    menu.classList.toggle("hidden", !show);
    document.body.style.overflow = show ? "hidden" : "";
    if (lenis) show ? lenis.stop() : lenis.start();
  };
  open && open.addEventListener("click", () => toggle(true));
  close && close.addEventListener("click", () => toggle(false));
  menu && menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggle(false)));
}

/* ---------- HUD rail auto-built from [data-rail] sections ---------- */
function initRail() {
  const rail = document.getElementById("rail");
  const sections = [...document.querySelectorAll("[data-rail]")];
  if (!sections.length) return;
  const total = document.getElementById("hud-total");
  if (total) total.textContent = String(sections.length).padStart(2, "0");
  const secNum = document.getElementById("hud-sec");

  if (rail) {
    rail.innerHTML = sections.map((s, i) =>
      `<a href="#" data-i="${i}" class="tick" style="pointer-events:auto" title="${s.dataset.rail}"><span class="bar"></span><span>${String(i + 1).padStart(2, "0")}</span></a>`
    ).join("");
    rail.querySelectorAll(".tick").forEach((t, i) => {
      t.addEventListener("click", (e) => { e.preventDefault(); scrollTo(sections[i]); });
    });
  }
  const ticks = rail ? [...rail.querySelectorAll(".tick")] : [];

  if (typeof IntersectionObserver === "undefined") return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const i = sections.indexOf(e.target);
      ticks.forEach((t, ti) => t.classList.toggle("active", ti === i));
      if (secNum) secNum.textContent = String(i + 1).padStart(2, "0");
    });
  }, { threshold: 0.01, rootMargin: "-45% 0px -45% 0px" });
  sections.forEach((s) => io.observe(s));
}

/* ---------- hero line reveal ---------- */
function initHeroIntro() {
  const lines = gsap.utils.toArray("[data-hero-line]");
  if (!lines.length) return;
  if (prefersReduced) { gsap.set(lines, { yPercent: 0, opacity: 1 }); return; }
  gsap.from(lines, { yPercent: 120, opacity: 0, duration: 1.05, ease: "power4.out", stagger: 0.12, delay: 0.15 });
}

/* ---------- parallax ---------- */
function initParallax() {
  if (prefersReduced || typeof ScrollTrigger === "undefined") return;
  gsap.utils.toArray("[data-parallax]").forEach((el) => {
    const depth = parseFloat(el.dataset.parallax) || 0.2;
    gsap.to(el, { yPercent: depth * 100, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
  });
}

/* ---------- scroll-reactive motion (calm & smooth) ---------- */
function initScrollMotion() {
  if (prefersReduced || typeof ScrollTrigger === "undefined") return;

  // big outlined numerals drift gently as you scroll past them
  gsap.utils.toArray(".numeral").forEach((el) => {
    gsap.fromTo(el, { yPercent: -5 }, {
      yPercent: 5, ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1.5 },
    });
  });
}

/* ---------- horizontal product reel (pinned) ---------- */
function initReel() {
  if (typeof ScrollTrigger === "undefined") return;
  document.querySelectorAll("[data-reel]").forEach((section) => {
    const track = section.querySelector("[data-reel-track]");
    if (!track) return;
    if (innerWidth < 768 || prefersReduced) return;
    const distance = track.scrollWidth - innerWidth + 120;
    if (distance <= 0) return;
    gsap.to(track, { x: -distance, ease: "none", scrollTrigger: { trigger: section, start: "top top", end: () => "+=" + distance, pin: true, scrub: 1, invalidateOnRefresh: true } });
  });
}

export function initAnimations() {
  initImageFallback();

  if (typeof gsap === "undefined") {
    document.querySelectorAll("[data-reveal]").forEach((el) => { el.style.opacity = "1"; el.style.transform = "none"; });
    document.querySelectorAll("[data-split] .word, [data-hero-line]").forEach((el) => (el.style.transform = "none"));
    document.querySelectorAll(".counter").forEach((el) => (el.textContent = el.dataset.target || el.textContent));
    initNavbar(); initScrollHud(); initRail(); initSceneFade();
    return;
  }
  if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

  initLenis();
  initCursor();
  initScrollHud();
  initSceneFade();
  initNavbar();
  initRail();
  initSplitText();
  initHeroIntro();
  initReveals();
  initCounters();
  initMagnetic();
  initParallax();
  initScrollMotion();
  initReel();

  if (typeof ScrollTrigger !== "undefined") {
    addEventListener("load", () => ScrollTrigger.refresh());
    setTimeout(() => ScrollTrigger.refresh(), 700);
  }
}
