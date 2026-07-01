// Ultra — service worker: network-first HTML so new deploys show up without clearing cache
const CACHE = 'ultra-v4';
const ASSETS = ['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-180.png','./photo.jpg'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // Strava / Supabase / fonts go straight to network
  const isHTML = e.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('/') || url.pathname.endsWith('index.html');
  if (isHTML) {
    // network-first: always try to get the freshest page, fall back to cache offline
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put('./index.html', copy)).catch(()=>{});
        return res;
      }).catch(() => caches.match('./index.html').then(h => h || caches.match('./')))
    );
  } else {
    // static assets: cache-first for speed
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
        return res;
      }).catch(()=>hit))
    );
  }
});
