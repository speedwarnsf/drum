/**
 * Service Worker for Drum Practice App
 * Enables offline functionality, caching, and PWA features
 */

const CACHE_NAME = 'drum-practice-v1.0.0';
const STATIC_CACHE_NAME = 'drum-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'drum-dynamic-v1.0.0';

// Files to cache immediately (static assets)
const STATIC_FILES = [
  '/',
  '/drum',
  '/drum/today',
  '/drum/practice-enhanced',
  '/drum/patterns',
  '/drum/progress',
  '/drum/journal',
  '/manifest.json',
  '/media/repodrumlogo.gif',
  // Add more static assets as needed
];

// Files to cache dynamically (user data, API responses)
const DYNAMIC_FILES = [
  '/api/lesson/generate',
  '/api/credits/use',
  // Add API endpoints that should be cached
];

// Files that should always come from network
const NETWORK_ONLY = [
  '/api/auth/',
  '/api/admin/',
];

self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE_NAME && 
                     cacheName !== DYNAMIC_CACHE_NAME &&
                     cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // Claim clients immediately
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests (except for same-site)
  if (url.origin !== location.origin) {
    return;
  }
  
  // Handle different types of requests
  if (isStaticFile(url.pathname)) {
    event.respondWith(handleStaticFile(request));
  } else if (isDynamicFile(url.pathname)) {
    event.respondWith(handleDynamicFile(request));
  } else if (isNetworkOnly(url.pathname)) {
    event.respondWith(handleNetworkOnly(request));
  } else {
    event.respondWith(handleDefault(request));
  }
});

// Check if file should be cached statically
function isStaticFile(pathname) {
  return STATIC_FILES.some(file => pathname.startsWith(file)) ||
         pathname.includes('/drum/') ||
         pathname.includes('/_next/static/') ||
         pathname.endsWith('.css') ||
         pathname.endsWith('.js') ||
         pathname.endsWith('.png') ||
         pathname.endsWith('.jpg') ||
         pathname.endsWith('.gif') ||
         pathname.endsWith('.svg') ||
         pathname.endsWith('.ico');
}

// Check if file should be cached dynamically
function isDynamicFile(pathname) {
  return DYNAMIC_FILES.some(file => pathname.startsWith(file)) ||
         pathname.startsWith('/api/');
}

// Check if file should always come from network
function isNetworkOnly(pathname) {
  return NETWORK_ONLY.some(file => pathname.startsWith(file));
}

// Handle static files (cache first strategy)
async function handleStaticFile(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
      console.log('[SW] Serving from cache:', request.url);
      
      // Return cached version and update in background
      fetch(request).then((response) => {
        if (response && response.status === 200) {
          cache.put(request, response.clone());
        }
      }).catch(() => {}); // Ignore network errors
      
      return cached;
    }
    
    // Not in cache, fetch from network
    console.log('[SW] Fetching from network:', request.url);
    const response = await fetch(request);
    
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Error handling static file:', error);
    
    // Return offline fallback for HTML pages
    if (request.destination === 'document') {
      return caches.match('/drum/offline');
    }
    
    throw error;
  }
}

// Handle dynamic files (network first, cache fallback)
async function handleDynamicFile(request) {
  try {
    console.log('[SW] Fetching dynamic content:', request.url);
    const response = await fetch(request);
    
    if (response && response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Return offline response for API requests
    if (request.url.includes('/api/')) {
      return new Response(JSON.stringify({
        error: 'offline',
        message: 'This feature requires an internet connection'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}

// Handle network-only files (never cache)
async function handleNetworkOnly(request) {
  console.log('[SW] Network only:', request.url);
  return fetch(request);
}

// Handle default requests
async function handleDefault(request) {
  try {
    // Try cache first for performance
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
      console.log('[SW] Serving default from cache:', request.url);
      return cached;
    }
    
    // Fetch from network
    console.log('[SW] Fetching default from network:', request.url);
    const response = await fetch(request);
    
    // Cache successful responses
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Error handling default request:', error);
    
    // Return app shell for navigation requests
    if (request.destination === 'document') {
      const cache = await caches.open(STATIC_CACHE_NAME);
      return cache.match('/drum/today') || cache.match('/drum');
    }
    
    throw error;
  }
}

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'practice-session-sync') {
    event.waitUntil(syncPracticeSessions());
  } else if (event.tag === 'achievement-sync') {
    event.waitUntil(syncAchievements());
  }
});

// Sync practice sessions when back online
async function syncPracticeSessions() {
  try {
    console.log('[SW] Syncing practice sessions...');
    
    // Get offline sessions from IndexedDB (would need to implement)
    const offlineSessions = await getOfflinePracticeSessions();
    
    for (const session of offlineSessions) {
      try {
        const response = await fetch('/api/sessions/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(session)
        });
        
        if (response.ok) {
          await removeOfflinePracticeSession(session.id);
          console.log('[SW] Synced session:', session.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync session:', session.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Sync achievements when back online
async function syncAchievements() {
  try {
    console.log('[SW] Syncing achievements...');
    
    // Implementation would sync local achievement data with server
    const achievements = await getOfflineAchievements();
    
    if (achievements.length > 0) {
      const response = await fetch('/api/achievements/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(achievements)
      });
      
      if (response.ok) {
        await clearOfflineAchievements();
        console.log('[SW] Synced achievements');
      }
    }
  } catch (error) {
    console.error('[SW] Achievement sync failed:', error);
  }
}

// Push notifications for practice reminders
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  const options = {
    body: 'Time for your daily drum practice! 🥁',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {
      url: '/drum/today',
      action: 'practice'
    },
    actions: [
      {
        action: 'practice',
        title: 'Start Practice',
        icon: '/icons/action-practice.png'
      },
      {
        action: 'remind',
        title: 'Remind Later',
        icon: '/icons/action-remind.png'
      }
    ],
    requireInteraction: false,
    silent: false,
    renotify: false,
    tag: 'practice-reminder'
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      options.body = data.message || options.body;
      options.data = { ...options.data, ...data };
    } catch (error) {
      console.warn('[SW] Invalid push data:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification('Drum Practice Reminder', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  const action = event.action || 'practice';
  const data = event.notification.data || {};
  
  if (action === 'practice') {
    const url = data.url || '/drum/today';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Focus existing tab if open
          for (const client of clientList) {
            if (client.url.includes('/drum') && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Open new tab
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  } else if (action === 'remind') {
    // Schedule another reminder (would need server API)
    console.log('[SW] Scheduling reminder...');
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event);
  
  // Track notification dismissals for analytics
  trackNotificationEvent('dismissed', event.notification.data);
});

// Message handling for client communication
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  const { type, payload } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'CACHE_PRACTICE_SESSION':
      cachePracticeSession(payload).then((success) => {
        event.ports[0].postMessage({ success });
      });
      break;
      
    default:
      console.warn('[SW] Unknown message type:', type);
  }
});

// Utility functions
async function getOfflinePracticeSessions() {
  // Would implement IndexedDB access
  return [];
}

async function removeOfflinePracticeSession(id) {
  // Would implement IndexedDB removal
}

async function getOfflineAchievements() {
  // Would implement IndexedDB access
  return [];
}

async function clearOfflineAchievements() {
  // Would implement IndexedDB clearing
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
}

async function cachePracticeSession(session) {
  try {
    // Store session in IndexedDB for offline access
    console.log('[SW] Caching practice session:', session);
    return true;
  } catch (error) {
    console.error('[SW] Failed to cache session:', error);
    return false;
  }
}

function trackNotificationEvent(action, data) {
  // Would implement analytics tracking
  console.log('[SW] Notification event:', action, data);
}

// Periodic background tasks
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);
  
  if (event.tag === 'practice-reminder') {
    event.waitUntil(scheduleReminderNotification());
  } else if (event.tag === 'cache-cleanup') {
    event.waitUntil(cleanupOldCaches());
  }
});

async function scheduleReminderNotification() {
  // Check if user has practiced today
  const lastPracticeDate = await getLastPracticeDate();
  const today = new Date().toDateString();
  
  if (lastPracticeDate !== today) {
    // Send practice reminder
    const options = {
      body: "Don't break your streak! Time to practice drums 🔥",
      icon: '/icons/icon-192x192.png',
      tag: 'daily-reminder',
      requireInteraction: true
    };
    
    self.registration.showNotification('Daily Practice Reminder', options);
  }
}

async function cleanupOldCaches() {
  // Remove old cached data to free up space
  const dynamicCache = await caches.open(DYNAMIC_CACHE_NAME);
  const keys = await dynamicCache.keys();
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  for (const request of keys) {
    const response = await dynamicCache.match(request);
    if (response) {
      const dateHeader = response.headers.get('date');
      if (dateHeader && new Date(dateHeader).getTime() < oneWeekAgo) {
        await dynamicCache.delete(request);
      }
    }
  }
}

async function getLastPracticeDate() {
  // Would implement localStorage or IndexedDB check
  return localStorage.getItem('lastPracticeDate');
}

console.log('[SW] Service Worker loaded successfully');