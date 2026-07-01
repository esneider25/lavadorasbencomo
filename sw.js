self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          console.log('Destruyendo caché:', cache);
          return caches.delete(cache);
        })
      );
    }).then(() => {
      self.clients.claim();
      self.registration.unregister();
    })
  );
});

self.addEventListener('fetch', event => {
  // Evitar la caché por completo, siempre ir a la red
  event.respondWith(fetch(event.request));
});
