/* Lunática: permite instalarla como app y abrirla sin conexión.
   Siempre intenta descargar la última versión; solo usa la copia guardada si no hay internet. */
const CACHE = "lunatica-v1";
const BASICOS = ["./", "./index.html", "./manifest.webmanifest", "./icono-192.png", "./icono-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASICOS)).catch(() => {})); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  const propio = url.origin === location.origin, libreria = url.hostname === "unpkg.com";
  if (!propio && !libreria) return;
  e.respondWith(fetch(req).then(res => {
    if (res && res.ok){ const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
    return res;
  }).catch(() => caches.match(req).then(r => r || (req.mode === "navigate" ? caches.match("./index.html") : Response.error()))));
});
