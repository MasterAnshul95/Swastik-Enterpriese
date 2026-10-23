/* ============================================================
   main.js — single entry for every page.
   Pages arrive fully rendered (see build.mjs); this only reads
   the small data island and wires up behaviour.
   ============================================================ */
import { pages } from "./pages.js";
import { initQuote } from "./quote.js";
import { initPalette } from "./palette.js";
import { initMotion } from "./motion.js";
import { initPhysics } from "./physics.js";

function boot() {
  window.__booted = true;
  const data = JSON.parse(document.getElementById("site-data").textContent);
  const page = document.documentElement.dataset.page;
  initQuote(data);
  initPalette(data);
  pages[page]?.init?.(data);
  initMotion(data);
  if (page === "home") {
    // Matter.js is deferred; wait for it without blocking anything else.
    if (window.Matter) initPhysics();
    else document.querySelector("script[data-matter]")?.addEventListener("load", initPhysics, { once: true });
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
