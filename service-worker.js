// Minimal service worker — optional. Keeps shell cached for offline load of basic UI.
const CACHE_NAME = 'mdt-shell-v1';
const FILES = ['/', '/index.html', '/css/style.css', '/js/app.js', '/js/api.js', '/js/config.js'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(FILES)));
});
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(r=>r||fetch(event.request)));
});
