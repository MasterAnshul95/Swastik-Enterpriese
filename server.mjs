/* Zero-dependency dev server (Node built-ins only).
   Run with:  node server.mjs   →  http://localhost:5173
   Builds the site on start and rebuilds whenever data/, js/ or
   build.mjs change, so edits to content.json show up on refresh. */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { watch } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { join, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const PORT = process.env.PORT || 5173;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
};

/* ---------- build on start + on change ---------- */
spawnSync(process.execPath, ["build.mjs"], { cwd: ROOT, stdio: "inherit" });
let timer = null;
let building = false;
const rebuild = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    if (building) return rebuild();
    building = true;
    spawn(process.execPath, ["build.mjs"], { cwd: ROOT, stdio: "inherit" }).on("close", () => (building = false));
  }, 150);
};
for (const dir of ["data", "js"]) watch(join(ROOT, dir), { recursive: true }, rebuild);
watch(join(ROOT, "build.mjs"), rebuild);

/* ---------- static files ---------- */
const server = createServer(async (req, res) => {
  let urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (urlPath.endsWith("/")) urlPath += "index.html";
  let filePath = resolve(join(ROOT, urlPath));
  if (!filePath.startsWith(resolve(ROOT) + sep) && filePath !== resolve(ROOT)) {
    res.writeHead(403);
    return res.end();
  }
  try {
    const info = await stat(filePath).catch(() => null);
    if (info?.isDirectory()) filePath = join(filePath, "index.html");
    const data = await readFile(filePath);
    res.writeHead(200, { "Content-Type": TYPES[extname(filePath).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-cache" });
    res.end(data);
  } catch {
    const notFound = urlPath.startsWith("/hi/") ? "hi/404.html" : "404.html";
    const page = await readFile(join(ROOT, notFound)).catch(() => "<h1>404 — Not found</h1>");
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end(page);
  }
});

server.listen(PORT, () => {
  console.log(`\n  Swastik Enterprises running →  http://localhost:${PORT}   (Hindi: /hi/)\n`);
});
