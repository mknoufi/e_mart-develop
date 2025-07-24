// E Mart Service Worker for PWA functionality
// Provides offline support, caching, and background sync

const CACHE_NAME = 'e-mart-v1.0.0';
const STATIC_CACHE_NAME = 'e-mart-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'e-mart-dynamic-v1.0.0';

// Cache strategy configuration
const CACHE_STRATEGIES = {
  static: [
    '/assets/e_mart/css/e_mart.css',
    '/assets/e_mart/js/e_mart.js',
    '/assets/frappe/css/frappe-web.css',
    '/assets/frappe/js/frappe-web.min.js',
    '/app',
    '/app/workspace/home',
    '/app/workspace'
  ],
  dynamic: [
    '/api/method/e_mart.e_mart.doctype.e_mart_settings.e_mart_settings.get_e_mart_settings',
    '/api/method/e_mart.e_mart.doctype.e_mart_settings.e_mart_settings.get_ui_config'
  ],
  images: [
    '/assets/e_mart/images/'
  ]
};

// Network timeout for cache fallback
const NETWORK_TIMEOUT = 3000;

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static resources');
        return cache.addAll(CACHE_STRATEGIES.static);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Claim all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Apply different strategies based on request type
  if (isStaticResource(request)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
  } else if (isAPIRequest(request)) {
    event.respondWith(networkFirstWithTimeout(request, DYNAMIC_CACHE_NAME));
  } else if (isImageRequest(request)) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
  } else if (isPageRequest(request)) {
    event.respondWith(networkFirstWithFallback(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-forms') {
    event.waitUntil(syncFormData());
  } else if (event.tag === 'background-sync-settings') {
    event.waitUntil(syncSettings());
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push message received');
  
  let options = {
    body: 'You have a new notification',
    icon: '/assets/e_mart/images/icon-192x192.png',
    badge: '/assets/e_mart/images/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/assets/e_mart/images/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/assets/e_mart/images/action-dismiss.png'
      }
    ],
    requireInteraction: true
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      options.title = data.title || 'E Mart Notification';
      options.body = data.body || options.body;
      options.data = { ...options.data, ...data };
    } catch (e) {
      console.warn('[SW] Could not parse push data:', e);
      options.title = 'E Mart Notification';
    }
  } else {
    options.title = 'E Mart Notification';
  }
  
  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/app')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes('/app') && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow('/app');
        }
      })
    );
  }
});

// Message handling for client communication
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CACHE_CLEAR') {
    clearAllCaches().then(() => {
      event.ports[0].postMessage({ success: true });
    });
  } else if (event.data && event.data.type === 'CACHE_UPDATE') {
    updateCache(event.data.url).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

// Helper functions

function isStaticResource(request) {
  return CACHE_STRATEGIES.static.some(pattern => 
    request.url.includes(pattern) || 
    request.url.match(/\.(css|js|woff2?|ttf|otf)(\?.*)?$/)
  );
}

function isAPIRequest(request) {
  return request.url.includes('/api/method/') || 
         request.url.includes('/api/resource/');
}

function isImageRequest(request) {
  return request.url.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)(\?.*)?$/);
}

function isPageRequest(request) {
  return request.headers.get('accept').includes('text/html');
}

// Caching strategies

async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Cache hit:', request.url);
      return cachedResponse;
    }
    
    console.log('[SW] Cache miss, fetching:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    return new Response('Network error', { status: 408 });
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 408 });
  }
}

async function networkFirstWithTimeout(request, cacheName, timeout = NETWORK_TIMEOUT) {
  try {
    const networkPromise = fetch(request);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Network timeout')), timeout)
    );
    
    const networkResponse = await Promise.race([networkPromise, timeoutPromise]);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network timeout/failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 408 });
  }
}

async function networkFirstWithFallback(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.log('[SW] Network failed for page, trying cache:', request.url);
    const cachedResponse = await caches.match(request) || 
                          await caches.match('/app') ||
                          await caches.match('/offline.html');
    
    return cachedResponse || new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Offline - E Mart</title>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                 text-align: center; padding: 50px 20px; background: #f8fafc; }
          .offline-container { max-width: 400px; margin: 0 auto; }
          .offline-icon { font-size: 4em; color: #64748b; margin-bottom: 20px; }
          h1 { color: #1e293b; margin-bottom: 10px; }
          p { color: #64748b; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="offline-container">
          <div class="offline-icon">📡</div>
          <h1>You're Offline</h1>
          <p>Please check your internet connection and try again.</p>
          <button onclick="window.location.reload()" 
                  style="background: #2563eb; color: white; border: none; 
                         padding: 12px 24px; border-radius: 6px; cursor: pointer; 
                         font-size: 16px; margin-top: 20px;">
            Try Again
          </button>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
      status: 200
    });
  }
}

// Background sync functions

async function syncFormData() {
  console.log('[SW] Syncing offline form data...');
  
  try {
    const db = await openDB('e-mart-offline', 1);
    const tx = db.transaction('forms', 'readonly');
    const store = tx.objectStore('forms');
    const allForms = await store.getAll();
    
    for (const formData of allForms) {
      try {
        const response = await fetch(formData.url, {
          method: formData.method || 'POST',
          headers: formData.headers || { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData.data)
        });
        
        if (response.ok) {
          // Remove successfully synced data
          const deleteTx = db.transaction('forms', 'readwrite');
          const deleteStore = deleteTx.objectStore('forms');
          await deleteStore.delete(formData.id);
          console.log('[SW] Form data synced:', formData.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync form:', formData.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Sync forms failed:', error);
  }
}

async function syncSettings() {
  console.log('[SW] Syncing settings...');
  // Implementation for syncing settings changes
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

async function updateCache(url) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const response = await fetch(url);
  if (response.ok) {
    await cache.put(url, response);
  }
}

// IndexedDB helper (simple implementation)
function openDB(name, version) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('forms')) {
        db.createObjectStore('forms', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

console.log('[SW] Service Worker loaded successfully');