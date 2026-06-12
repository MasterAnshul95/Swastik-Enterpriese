/* Zero-dependency static file server (Node built-ins only).
   Run with:  node server.mjs   →  http://localhost:5173
   Exists because the site loads content.json via fetch(), which browsers
   block on the file:// protocol. No npm install required. */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const PORT = process.env.PORT || 5173;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

const server = createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (urlPath === "/") urlPath = "/index.html";

    // Prevent path traversal.
    const safePath = normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
    let filePath = join(ROOT, safePath);

    let info;
    try {
      info = await stat(filePath);
    } catch {
      info = null;
    }
    if (info && info.isDirectory()) {
      filePath = join(filePath, "index.html");
    }

    const data = await readFile(filePath);
    const type = TYPES[extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>404 — Not found</h1>");
  }
});

server.listen(PORT, () => {
  console.log(`\n  Swastik Enterprises running →  http://localhost:${PORT}\n`);
});
