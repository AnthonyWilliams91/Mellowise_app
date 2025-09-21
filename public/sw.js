/**
 * Service Worker for Mellowise Web Push Notifications
 * MELLOWISE-015: Advanced push notification handling with rich media and actions
 */

const CACHE_NAME = 'mellowise-v1';
const STATIC_ASSETS = [
  '/',
  '/static/icons/icon-192x192.png',
  '/static/icons/icon-512x512.png',
  '/offline.html'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Service worker installed successfully');
        return self.skipWaiting();
      })
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
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all tabs
      self.clients.claim()
    ])
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  let notificationData = {
    title: 'Mellowise Reminder',
    message: 'Time to continue your learning journey!',
    icon: '/static/icons/icon-192x192.png',
    badge: '/static/icons/badge-72x72.png',
    type: 'study_reminder',
    priority: 'medium',
    data: {}
  };

  // Parse notification data if present
  if (event.data) {
    try {
      notificationData = { ...notificationData, ...event.data.json() };
    } catch (error) {
      console.error('[SW] Error parsing push data:', error);
      notificationData.message = event.data.text() || notificationData.message;
    }
  }

  const notificationOptions = buildNotificationOptions(notificationData);

  event.waitUntil(
    Promise.all([
      // Show notification
      self.registration.showNotification(notificationData.title, notificationOptions),
      // Store notification for analytics
      storeNotificationAnalytics(notificationData),
      // Check if user is currently active
      updateUserEngagement(notificationData)
    ])
  );
});

// Notification click event - handle user interactions
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);

  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  // Close notification
  notification.close();

  // Handle different actions
  event.waitUntil(
    handleNotificationClick(action, data, notification)
  );
});

// Notification close event - track dismissals
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification dismissed:', event);

  const notification = event.notification;
  const data = notification.data || {};

  // Track dismissal for analytics
  event.waitUntil(
    trackNotificationDismissal(data.notificationId, data.type)
  );
});

/**
 * Build notification options based on notification type and data
 */
function buildNotificationOptions(notificationData) {
  const baseOptions = {
    body: notificationData.message,
    icon: notificationData.icon || '/static/icons/icon-192x192.png',
    badge: notificationData.badge || '/static/icons/badge-72x72.png',
    image: notificationData.image,
    tag: notificationData.type + '_' + (notificationData.data.userId || 'anonymous'),
    requireInteraction: notificationData.priority === 'critical',
    silent: notificationData.priority === 'low',
    timestamp: Date.now(),
    data: {
      notificationId: notificationData.id,
      type: notificationData.type,
      priority: notificationData.priority,
      userId: notificationData.data.userId,
      metadata: notificationData.data
    }
  };

  // Add type-specific options
  switch (notificationData.type) {
    case 'study_reminder':
      return {
        ...baseOptions,
        actions: [
          {
            action: 'start_practice',
            title: '🚀 Start Practice',
            icon: '/static/icons/practice-icon.png'
          },
          {
            action: 'snooze',
            title: '⏰ Remind me in 1 hour',
            icon: '/static/icons/snooze-icon.png'
          }
        ],
        renotify: true,
        vibrate: [200, 100, 200]
      };

    case 'goal_deadline':
      return {
        ...baseOptions,
        actions: [
          {
            action: 'view_goal',
            title: '📊 View Progress',
            icon: '/static/icons/goal-icon.png'
          },
          {
            action: 'start_practice',
            title: '🎯 Work on Goal',
            icon: '/static/icons/practice-icon.png'
          }
        ],
        requireInteraction: true,
        vibrate: [300, 100, 300, 100, 300]
      };

    case 'streak_maintenance':
      return {
        ...baseOptions,
        actions: [
          {
            action: 'maintain_streak',
            title: '🔥 Keep Streak Alive',
            icon: '/static/icons/streak-icon.png'
          },
          {
            action: 'view_stats',
            title: '📈 View Stats',
            icon: '/static/icons/stats-icon.png'
          }
        ],
        vibrate: [100, 50, 100, 50, 100, 50, 100]
      };

    case 'achievement':
      return {
        ...baseOptions,
        actions: [
          {
            action: 'view_achievement',
            title: '🎉 View Achievement',
            icon: '/static/icons/trophy-icon.png'
          },
          {
            action: 'share_achievement',
            title: '📱 Share',
            icon: '/static/icons/share-icon.png'
          }
        ],
        vibrate: [200, 100, 200, 100, 200],
        image: notificationData.data.achievementBadge
      };

    case 'break_reminder':
      return {
        ...baseOptions,
        actions: [
          {
            action: 'take_break',
            title: '🌟 Take a Break',
            icon: '/static/icons/break-icon.png'
          },
          {
            action: 'continue_studying',
            title: '📚 Continue Studying',
            icon: '/static/icons/study-icon.png'
          }
        ],
        vibrate: [100, 100, 100]
      };

    case 'performance_alert':
      return {
        ...baseOptions,
        actions: [
          {
            action: 'view_insights',
            title: '📊 View Insights',
            icon: '/static/icons/insights-icon.png'
          },
          {
            action: 'adjust_difficulty',
            title: '⚙️ Adjust Settings',
            icon: '/static/icons/settings-icon.png'
          }
        ],
        vibrate: [150, 100, 150]
      };

    default:
      return {
        ...baseOptions,
        actions: [
          {
            action: 'open_app',
            title: '📖 Open Mellowise',
            icon: '/static/icons/app-icon.png'
          }
        ]
      };
  }
}

/**
 * Handle notification click events with appropriate actions
 */
async function handleNotificationClick(action, data, notification) {
  let targetUrl = '/dashboard';

  // Determine target URL based on action and notification type
  switch (action) {
    case 'start_practice':
      targetUrl = data.metadata?.topicId
        ? `/practice?topic=${data.metadata.topicId}`
        : '/practice';
      break;

    case 'view_goal':
      targetUrl = data.metadata?.goalId
        ? `/goals/${data.metadata.goalId}`
        : '/goals';
      break;

    case 'view_achievement':
      targetUrl = data.metadata?.achievementId
        ? `/achievements/${data.metadata.achievementId}`
        : '/achievements';
      break;

    case 'view_insights':
      targetUrl = '/insights';
      break;

    case 'view_stats':
      targetUrl = '/stats';
      break;

    case 'maintain_streak':
      targetUrl = '/practice?mode=streak';
      break;

    case 'take_break':
      // Don't open app, just acknowledge break
      await trackNotificationAction('break_taken', data.notificationId, data.type);
      return;

    case 'snooze':
      // Schedule snooze notification
      await scheduleSnoozeNotification(data);
      return;

    case 'share_achievement':
      // Handle sharing
      if (navigator.share && data.metadata?.achievementTitle) {
        await navigator.share({
          title: `🎉 Achievement Unlocked!`,
          text: `I just earned: ${data.metadata.achievementTitle} on Mellowise!`,
          url: `${self.location.origin}/achievements/${data.metadata.achievementId}`
        });
      }
      targetUrl = '/achievements';
      break;

    case 'adjust_difficulty':
      targetUrl = '/settings/difficulty';
      break;

    default:
      // Default click behavior
      if (data.type === 'goal_deadline') {
        targetUrl = '/goals';
      } else if (data.type === 'study_reminder') {
        targetUrl = '/practice';
      }
      break;
  }

  // Track click analytics
  await trackNotificationAction(action || 'click', data.notificationId, data.type);

  // Focus existing tab or open new one
  return focusOrOpenTab(targetUrl);
}

/**
 * Focus existing tab with URL or open new tab
 */
async function focusOrOpenTab(url) {
  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  });

  // Try to find existing tab with the URL
  for (const client of clients) {
    if (client.url.includes(url.split('?')[0])) {
      await client.focus();
      if (url.includes('?')) {
        // Navigate to specific URL with query params
        client.postMessage({
          type: 'navigate',
          url: url
        });
      }
      return;
    }
  }

  // Try to find any Mellowise tab to reuse
  for (const client of clients) {
    if (client.url.includes(self.location.origin)) {
      await client.focus();
      client.postMessage({
        type: 'navigate',
        url: url
      });
      return;
    }
  }

  // Open new tab
  return self.clients.openWindow(url);
}

/**
 * Store notification analytics for tracking
 */
async function storeNotificationAnalytics(notificationData) {
  try {
    // Store analytics in IndexedDB for later sync
    const analyticsData = {
      notificationId: notificationData.id,
      type: notificationData.type,
      priority: notificationData.priority,
      userId: notificationData.data?.userId,
      shownAt: new Date().toISOString(),
      metadata: notificationData.data
    };

    await storeInIndexedDB('notification_analytics', analyticsData);
  } catch (error) {
    console.error('[SW] Error storing notification analytics:', error);
  }
}

/**
 * Track notification user actions
 */
async function trackNotificationAction(action, notificationId, type) {
  try {
    const actionData = {
      notificationId,
      type,
      action,
      timestamp: new Date().toISOString()
    };

    await storeInIndexedDB('notification_actions', actionData);

    // Try to sync immediately if online
    if (navigator.onLine) {
      syncAnalytics();
    }
  } catch (error) {
    console.error('[SW] Error tracking notification action:', error);
  }
}

/**
 * Track notification dismissals
 */
async function trackNotificationDismissal(notificationId, type) {
  try {
    const dismissalData = {
      notificationId,
      type,
      action: 'dismiss',
      timestamp: new Date().toISOString()
    };

    await storeInIndexedDB('notification_actions', dismissalData);
  } catch (error) {
    console.error('[SW] Error tracking notification dismissal:', error);
  }
}

/**
 * Schedule snooze notification
 */
async function scheduleSnoozeNotification(originalData) {
  try {
    // Schedule notification in 1 hour
    const snoozeTime = Date.now() + (60 * 60 * 1000); // 1 hour

    const snoozeData = {
      ...originalData.metadata,
      snoozedFrom: originalData.notificationId,
      scheduledFor: new Date(snoozeTime).toISOString()
    };

    await storeInIndexedDB('snoozed_notifications', snoozeData);

    // Send to server for proper scheduling
    if (navigator.onLine) {
      await fetch('/api/notifications/push/snooze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snoozeData)
      });
    }

    await trackNotificationAction('snooze', originalData.notificationId, originalData.type);
  } catch (error) {
    console.error('[SW] Error scheduling snooze:', error);
  }
}

/**
 * Update user engagement metrics
 */
async function updateUserEngagement(notificationData) {
  try {
    const engagementData = {
      userId: notificationData.data?.userId,
      notificationType: notificationData.type,
      timestamp: new Date().toISOString(),
      isActive: await isUserCurrentlyActive()
    };

    await storeInIndexedDB('user_engagement', engagementData);
  } catch (error) {
    console.error('[SW] Error updating user engagement:', error);
  }
}

/**
 * Check if user is currently active in the app
 */
async function isUserCurrentlyActive() {
  try {
    const clients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    // Check if any Mellowise tabs are focused
    for (const client of clients) {
      if (client.url.includes(self.location.origin) && client.focused) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('[SW] Error checking user activity:', error);
    return false;
  }
}

/**
 * Store data in IndexedDB
 */
async function storeInIndexedDB(storeName, data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MellowiseNotifications', 1);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create stores if they don't exist
      const storeNames = ['notification_analytics', 'notification_actions', 'snoozed_notifications', 'user_engagement'];

      storeNames.forEach(name => {
        if (!db.objectStoreNames.contains(name)) {
          const store = db.createObjectStore(name, { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          if (name === 'notification_analytics' || name === 'notification_actions') {
            store.createIndex('notificationId', 'notificationId', { unique: false });
          }
        }
      });
    };

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const addRequest = store.add({
        ...data,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });

      addRequest.onsuccess = () => resolve(addRequest.result);
      addRequest.onerror = () => reject(addRequest.error);
    };
  });
}

/**
 * Sync analytics to server when online
 */
async function syncAnalytics() {
  try {
    if (!navigator.onLine) return;

    const analyticsData = await getAllFromIndexedDB('notification_analytics');
    const actionsData = await getAllFromIndexedDB('notification_actions');
    const engagementData = await getAllFromIndexedDB('user_engagement');

    if (analyticsData.length > 0 || actionsData.length > 0 || engagementData.length > 0) {
      const response = await fetch('/api/notifications/analytics/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analytics: analyticsData,
          actions: actionsData,
          engagement: engagementData
        })
      });

      if (response.ok) {
        // Clear synced data
        await clearIndexedDBStore('notification_analytics');
        await clearIndexedDBStore('notification_actions');
        await clearIndexedDBStore('user_engagement');
      }
    }
  } catch (error) {
    console.error('[SW] Error syncing analytics:', error);
  }
}

/**
 * Get all data from IndexedDB store
 */
async function getAllFromIndexedDB(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MellowiseNotifications', 1);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => resolve(getAllRequest.result || []);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear IndexedDB store
 */
async function clearIndexedDBStore(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MellowiseNotifications', 1);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    };

    request.onerror = () => reject(request.error);
  });
}

// Background sync for analytics
self.addEventListener('sync', (event) => {
  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics());
  }
});

// Online event - sync when connection restored
self.addEventListener('online', () => {
  console.log('[SW] Connection restored, syncing analytics...');
  syncAnalytics();
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_ANALYTICS') {
    syncAnalytics();
  }
});

console.log('[SW] Service worker script loaded');