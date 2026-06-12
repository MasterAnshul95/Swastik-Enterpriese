/* ============================================================
   main.js — orchestrator (single entry for every page).
   loads JSON -> mounts HUD + chrome -> builds page -> 3D + motion.
   ============================================================ */
import { navbar, footer, hudFrame } from "./components.js";
import { builders } from "./pages.js";
import { initAnimations } from "./animations.js";

function currentPath() {
  let p = location.pathname;
  if (p === "/" || p.endsWith("/")) p += "index.html";
  return p;
}
function mount(id, html) {
  const el = document.querySelector(`[data-component="${id}"]`);
  if (el) el.innerHTML = html;
}

function handleForm() {
  const form = document.getElementById("quote-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const status = document.getElementById("form-status");
    const name = (form.querySelector('[name="name"]') || {}).value || "there";
    if (status) {
      status.textContent = `Thanks, ${name.split(" ")[0]} — your enquiry is in. We'll reply within one working day.`;
      status.classList.remove("hidden");
    }
    form.reset();
  });
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch (e) { return false; }
}

async function loadScene(page) {
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !hasWebGL()) return;
  try {
    const { initScene3d } = await import("./scene3d.js");
    initScene3d({ mode: page === "home" ? "center" : "accent" });
  } catch (err) {
    console.warn("3D scene unavailable — continuing without it.", err);
  }
}

async function boot() {
  const page = document.body.dataset.page;
  let content;
  try {
    const res = await fetch("/data/content.json", { cache: "no-cache" });
    content = await res.json();
  } catch (err) {
    console.error("Could not load content.json — run via a local server (see README).", err);
    const root = document.querySelector("[data-page-root]");
    if (root) root.innerHTML = `<div class="bleed py-40 text-center text-steel-300"><p class="label-mono mb-3">Content failed to load</p><p>Please run the site through a local server (npm run dev), not by opening the file directly.</p></div>`;
    return;
  }

  document.title = (content[page] && content[page].seo && content[page].seo.title) || document.title;

  mount("hud", hudFrame(content));
  mount("navbar", navbar(content, currentPath()));
  mount("footer", footer(content));

  const build = builders[page];
  const root = document.querySelector("[data-page-root]");
  if (build && root) root.innerHTML = build(content);

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  handleForm();
  initAnimations();
  // 3D scene retired in the light theme (kept for reference): loadScene(page);
  void loadScene;
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
