/**
 * Push Notifications Hook
 * MELLOWISE-015: Client-side push notification management with subscription handling
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface PushSubscriptionInfo {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationStatus {
  supported: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
  subscription: PushSubscriptionInfo | null;
  loading: boolean;
  error: string | null;
}

export interface UsePushNotificationsReturn {
  status: PushNotificationStatus;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  requestPermission: () => Promise<NotificationPermission>;
  testNotification: (type?: string) => Promise<boolean>;
  refreshStatus: () => Promise<void>;
  sendTestPush: (message?: string) => Promise<boolean>;
}

/**
 * Hook for managing push notifications
 */
export function usePushNotifications(): UsePushNotificationsReturn {
  const [status, setStatus] = useState<PushNotificationStatus>({
    supported: false,
    permission: 'default',
    subscribed: false,
    subscription: null,
    loading: true,
    error: null,
  });

  // Check if push notifications are supported
  const isPushSupported = useCallback(() => {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }, []);

  // Initialize push notification status
  const initializePushStatus = useCallback(async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));

      if (!isPushSupported()) {
        setStatus(prev => ({
          ...prev,
          supported: false,
          loading: false,
          error: 'Push notifications are not supported in this browser'
        }));
        return;
      }

      // Register service worker if not already registered
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        await navigator.serviceWorker.ready;
      }

      // Get current subscription
      const subscription = await registration.pushManager.getSubscription();
      const permission = Notification.permission;

      setStatus(prev => ({
        ...prev,
        supported: true,
        permission,
        subscribed: !!subscription,
        subscription: subscription ? subscriptionToInfo(subscription) : null,
        loading: false
      }));

    } catch (error) {
      console.error('Error initializing push notifications:', error);
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize push notifications'
      }));
    }
  }, [isPushSupported]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    try {
      if (!isPushSupported()) {
        throw new Error('Push notifications are not supported');
      }

      const permission = await Notification.requestPermission();

      setStatus(prev => ({ ...prev, permission }));

      // Track permission request
      try {
        await fetch('/api/notifications/analytics/permission', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            permission,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          })
        });
      } catch (error) {
        console.warn('Failed to track permission analytics:', error);
      }

      return permission;
    } catch (error) {
      console.error('Error requesting permission:', error);
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to request permission'
      }));
      return 'denied';
    }
  }, [isPushSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));

      if (!isPushSupported()) {
        throw new Error('Push notifications are not supported');
      }

      if (status.permission !== 'granted') {
        const permission = await requestPermission();
        if (permission !== 'granted') {
          throw new Error('Permission denied for notifications');
        }
      }

      const registration = await navigator.serviceWorker.ready;

      // Get VAPID public key from server
      const vapidResponse = await fetch('/api/notifications/push/vapid-key');
      if (!vapidResponse.ok) {
        throw new Error('Failed to get VAPID key');
      }

      const { publicKey } = await vapidResponse.json();

      // Subscribe to push service
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      // Send subscription to server
      const subscribeResponse = await fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscriptionToInfo(subscription),
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      });

      if (!subscribeResponse.ok) {
        throw new Error('Failed to save subscription to server');
      }

      setStatus(prev => ({
        ...prev,
        subscribed: true,
        subscription: subscriptionToInfo(subscription),
        loading: false
      }));

      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to subscribe to push notifications'
      }));
      return false;
    }
  }, [isPushSupported, status.permission, requestPermission]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));

      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        throw new Error('Service worker not found');
      }

      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        setStatus(prev => ({
          ...prev,
          subscribed: false,
          subscription: null,
          loading: false
        }));
        return true;
      }

      // Unsubscribe from push service
      await subscription.unsubscribe();

      // Remove subscription from server
      await fetch('/api/notifications/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          timestamp: new Date().toISOString()
        })
      });

      setStatus(prev => ({
        ...prev,
        subscribed: false,
        subscription: null,
        loading: false
      }));

      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to unsubscribe from push notifications'
      }));
      return false;
    }
  }, []);

  // Test local notification (not push)
  const testNotification = useCallback(async (type: string = 'test'): Promise<boolean> => {
    try {
      if (!isPushSupported()) {
        throw new Error('Notifications are not supported');
      }

      if (status.permission !== 'granted') {
        const permission = await requestPermission();
        if (permission !== 'granted') {
          throw new Error('Permission denied for notifications');
        }
      }

      const notificationOptions = getTestNotificationOptions(type);

      new Notification(notificationOptions.title, {
        body: notificationOptions.body,
        icon: notificationOptions.icon,
        badge: notificationOptions.badge,
        tag: 'test-notification',
        requireInteraction: false,
        silent: false
      });

      return true;
    } catch (error) {
      console.error('Error showing test notification:', error);
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to show test notification'
      }));
      return false;
    }
  }, [isPushSupported, status.permission, requestPermission]);

  // Send test push notification from server
  const sendTestPush = useCallback(async (message?: string): Promise<boolean> => {
    try {
      if (!status.subscribed) {
        throw new Error('Not subscribed to push notifications');
      }

      const response = await fetch('/api/notifications/push/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message || 'This is a test push notification from Mellowise! 🚀',
          type: 'test'
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to send test push notification');
      }

      return true;
    } catch (error) {
      console.error('Error sending test push notification:', error);
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to send test push notification'
      }));
      return false;
    }
  }, [status.subscribed]);

  // Refresh current status
  const refreshStatus = useCallback(async (): Promise<void> => {
    await initializePushStatus();
  }, [initializePushStatus]);

  // Initialize on mount
  useEffect(() => {
    initializePushStatus();
  }, [initializePushStatus]);

  // Listen for service worker updates
  useEffect(() => {
    if (!isPushSupported()) return;

    const handleServiceWorkerUpdate = () => {
      console.log('Service worker updated, refreshing push status...');
      refreshStatus();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleServiceWorkerUpdate);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleServiceWorkerUpdate);
    };
  }, [isPushSupported, refreshStatus]);

  // Listen for permission changes
  useEffect(() => {
    if (!isPushSupported()) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Check if permission changed while tab was hidden
        if (Notification.permission !== status.permission) {
          setStatus(prev => ({ ...prev, permission: Notification.permission }));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPushSupported, status.permission]);

  return {
    status,
    subscribe,
    unsubscribe,
    requestPermission,
    testNotification,
    refreshStatus,
    sendTestPush
  };
}

/**
 * Helper functions
 */

function subscriptionToInfo(subscription: PushSubscription): PushSubscriptionInfo {
  const key = subscription.getKey('p256dh');
  const authKey = subscription.getKey('auth');

  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: key ? arrayBufferToBase64(key) : '',
      auth: authKey ? arrayBufferToBase64(authKey) : ''
    }
  };
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

function getTestNotificationOptions(type: string) {
  const baseOptions = {
    icon: '/static/icons/icon-192x192.png',
    badge: '/static/icons/badge-72x72.png'
  };

  switch (type) {
    case 'study_reminder':
      return {
        ...baseOptions,
        title: '📚 Study Time!',
        body: 'Ready to boost your learning? Let\'s practice some questions!'
      };

    case 'goal_deadline':
      return {
        ...baseOptions,
        title: '🎯 Goal Deadline Approaching',
        body: 'You have 3 days left to reach your LSAT practice goal!'
      };

    case 'streak_maintenance':
      return {
        ...baseOptions,
        title: '🔥 Keep Your Streak Alive!',
        body: 'Don\'t break your 7-day learning streak. Practice now!'
      };

    case 'achievement':
      return {
        ...baseOptions,
        title: '🎉 Achievement Unlocked!',
        body: 'Congratulations! You\'ve mastered Logic Games fundamentals!'
      };

    case 'break_reminder':
      return {
        ...baseOptions,
        title: '🌟 Time for a Break',
        body: 'You\'ve been studying for 2 hours. Take a well-deserved break!'
      };

    default:
      return {
        ...baseOptions,
        title: '🚀 Mellowise Test Notification',
        body: 'This is a test notification to verify push notifications are working!'
      };
  }
}

/**
 * Utility hook for checking browser support
 */
export function usePushNotificationSupport() {
  const [support, setSupport] = useState({
    serviceWorker: false,
    pushManager: false,
    notifications: false,
    supported: false
  });

  useEffect(() => {
    const serviceWorker = 'serviceWorker' in navigator;
    const pushManager = 'PushManager' in window;
    const notifications = 'Notification' in window;

    setSupport({
      serviceWorker,
      pushManager,
      notifications,
      supported: serviceWorker && pushManager && notifications
    });
  }, []);

  return support;
}