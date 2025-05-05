const CACHE_NAME = 'pwa-task-app-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/pwa192.png',
    '/manifest.json',
];

// ✅ Install event: cache app shell
self.addEventListener('install', (event) => {
    console.log('[SW] Installed');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting(); // ✅ Activate new SW immediately
});

// ✅ Activate event: clean old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activated');
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', key);
                        return caches.delete(key);
                    }
                })
            ).then(() => self.clients.claim()) // ✅ Take control of all clients
        )
    );
});

// ✅ Fetch event: try cache first, fallback to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cached) => {
            return cached || fetch(event.request);
        }).catch(() => caches.match('/')) // fallback if fetch fails
    );
});

// ✅ Handle message from client
self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') {
        console.log('[SW] SKIP_WAITING received');
        self.skipWaiting();
    }
});

// ✅ Notification click (optional)
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
            if (clientsArr.length > 0) {
                clientsArr[0].navigate(clientsArr[0].url);
                clientsArr[0].focus();
            } else {
                clients.openWindow('/');
            }
        })
    );
});
