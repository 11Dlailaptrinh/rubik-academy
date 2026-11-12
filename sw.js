/* Sinh tự động bởi tools/build-web.js */
const CACHE = 'rubik-academy-7262b838fd';
const FILES = [
 "./",
 "index.html",
 "manifest.webmanifest",
 "css/style.css",
 "js/app.js",
 "js/bigcube.js",
 "js/cube.js",
 "js/data-basics.js",
 "js/data-big.js",
 "js/data-f2l.js",
 "js/data-last-layer.js",
 "js/data-special.js",
 "js/data-wv.js",
 "js/data-zbll.js",
 "js/pwa.js",
 "js/render.js",
 "js/solver.js",
 "icons/icon-180.png",
 "icons/icon-192.png",
 "icons/icon-512.png"
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// ưu tiên bộ nhớ đệm (chạy offline, mở nhanh); bản mới được tải về khi có mạng và dùng ở lần mở sau
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
