/**
 * MELLOWISE-015: Smart Notification System - Component Exports
 *
 * Barrel export file for all notification-related UI components.
 * Provides clean imports for the notification system components.
 */

// Core notification components
export { NotificationPreferences } from './NotificationPreferences';
export { InAppNotificationPanel } from './InAppNotificationPanel';
export { NotificationAnalytics } from './NotificationAnalytics';

// Type exports for external usage
export type {
  // From NotificationPreferences
  NotificationChannel,
  NotificationType,
  QuietHours,
  NotificationPreferences as NotificationPreferencesType
} from './NotificationPreferences';

export type {
  // From InAppNotificationPanel
  InAppNotification,
  NotificationStats
} from './InAppNotificationPanel';

export type {
  // From NotificationAnalytics
  ChannelMetrics,
  EngagementTrend,
  NotificationTypeMetrics,
  UserSegmentMetrics,
  ABTestResult,
  AnalyticsSummary,
  NotificationAnalyticsData
} from './NotificationAnalytics';

// Component prop types for external usage
export type { NotificationPreferencesProps } from './NotificationPreferences';
export type { InAppNotificationPanelProps } from './InAppNotificationPanel';
export type { NotificationAnalyticsProps } from './NotificationAnalytics';