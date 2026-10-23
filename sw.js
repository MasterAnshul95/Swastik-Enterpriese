/* Service worker: offline-capable, always fresh.
   The site's own files (pages, CSS, JS, data): network first, cached copy when offline.
   Fonts, photos, CDN scripts: served from cache, refreshed in the background. */
const VERSION = "swastik-v3";
const CORE = ["./", "index.html", "catalog.html", "contact.html", "assets/css/style.css", "js/main.js", "favicon.svg", "assets/placeholder.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (req.mode === "navigate" || url.origin === location.origin) {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then((r) => r || (req.mode === "navigate" ? caches.match("index.html") : Response.error())))
    );
    return;
  }

  const cacheable = /images\.unsplash\.com|fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com/.test(url.host);
  if (!cacheable) return;
  e.respondWith(
    caches.open(VERSION).then((cache) =>
      cache.match(req).then((hit) => {
        const fresh = fetch(req).then((res) => { if (res.ok || res.type === "opaque") cache.put(req, res.clone()); return res; }).catch(() => hit);
        return hit || fresh;
      })
    )
  );
});
