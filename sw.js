/* Winterdorf-Quiz - Service Worker. VERSION muss mit VERSION in index.html uebereinstimmen. */
const VERSION = "1.6.7";
const CACHE = "winterdorf-" + VERSION;
const CORE = ["./", "index.html", "manifest.webmanifest"];
const OPTIONAL = ["favicon.png", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "flags/de.svg", "flags/en.svg", "flags/swg.svg"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).then(() => Promise.allSettled(OPTIONAL.map(u => c.add(u)))))); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n.startsWith("winterdorf-") && n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener("message", e => { if(e.data === "SKIP_WAITING") self.skipWaiting(); });
const timeout = (p, ms) => new Promise((res, rej) => { const t = setTimeout(() => rej(new Error("timeout")), ms); p.then(v => { clearTimeout(t); res(v); }, e => { clearTimeout(t); rej(e); }); });
self.addEventListener("fetch", e => {
  const r = e.request; if(r.method !== "GET") return; const u = new URL(r.url); if(u.origin !== location.origin) return;
  if(r.mode === "navigate"){
    e.respondWith(timeout(fetch(r), 4000).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put("index.html", cp)); return res; }).catch(() => caches.match("index.html", {ignoreSearch:true}).then(x => x || caches.match("./"))));
    return;
  }
  e.respondWith(caches.match(r, {ignoreSearch:true}).then(hit => {
    const net = fetch(r).then(res => { if(res && res.ok){ const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; }).catch(() => hit);
    return hit || net;
  }));
});
