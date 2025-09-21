/**
 * MELLOWISE-015: Smart Notification System - In-App Notification Panel
 *
 * Real-time in-app notification panel featuring:
 * - Notification list with read/unread states
 * - Mark as read, dismiss, and click actions
 * - Unread count badge and visual indicators
 * - Real-time updates with auto-refresh
 * - Notification categories and filtering
 * - Interactive notification actions
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  BellDot,
  Check,
  X,
  ExternalLink,
  Trash2,
  MarkAsRead,
  Filter,
  Settings,
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Target,
  Trophy,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Info,
  Calendar,
  MessageSquare
} from 'lucide-react';

// Types for in-app notifications
interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'study_reminder' | 'goal_progress' | 'streak_alert' | 'achievement' | 'performance_insight' | 'system';
  category: 'study' | 'achievement' | 'analytics' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  isDismissed: boolean;
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  icon?: React.ReactNode;
}

interface NotificationStats {
  total: number;
  unread: number;
  dismissed: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
}

interface InAppNotificationPanelProps {
  className?: string;
  maxHeight?: string;
  showHeader?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onNotificationClick?: (notification: InAppNotification) => void;
  onNotificationAction?: (notification: InAppNotification, action: string) => void;
}

export function InAppNotificationPanel({
  className,
  maxHeight = '400px',
  showHeader = true,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
  onNotificationClick,
  onNotificationAction
}: InAppNotificationPanelProps) {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const response = await fetch('/api/notifications/in-app');
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data.notifications);
      setStats(data.stats);

    } catch (err) {
      console.error('Notifications fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
      // Use mock data for development
      const mockData = getMockNotifications();
      setNotifications(mockData.notifications);
      setStats(mockData.stats);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto refresh
  useEffect(() => {
    fetchNotifications(true);

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchNotifications(false);
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [fetchNotifications, autoRefresh, refreshInterval]);

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications(false);
    setRefreshing(false);
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/in-app/${notificationId}/read`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true, readAt: new Date() }
            : notification
        )
      );

      // Update stats
      setStats(prev => prev ? {
        ...prev,
        unread: Math.max(0, prev.unread - 1)
      } : prev);

    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  // Dismiss notification
  const dismissNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/in-app/${notificationId}/dismiss`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to dismiss notification');
      }

      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );

      // Update stats
      setStats(prev => prev ? {
        ...prev,
        total: prev.total - 1,
        dismissed: prev.dismissed + 1
      } : prev);

    } catch (err) {
      console.error('Dismiss notification error:', err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/in-app/mark-all-read', {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      setNotifications(prev =>
        prev.map(notification => ({
          ...notification,
          isRead: true,
          readAt: new Date()
        }))
      );

      setStats(prev => prev ? { ...prev, unread: 0 } : prev);

    } catch (err) {
      console.error('Mark all as read error:', err);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: InAppNotification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    onNotificationClick?.(notification);

    // Navigate to action URL if provided
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank');
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return notification.category === filter;
  });

  // Get notification icon
  const getNotificationIcon = (notification: InAppNotification) => {
    if (notification.icon) return notification.icon;

    switch (notification.type) {
      case 'study_reminder':
        return <BookOpen className="w-4 h-4" />;
      case 'goal_progress':
        return <Target className="w-4 h-4" />;
      case 'streak_alert':
        return <Zap className="w-4 h-4" />;
      case 'achievement':
        return <Trophy className="w-4 h-4" />;
      case 'performance_insight':
        return <TrendingUp className="w-4 h-4" />;
      case 'system':
        return <Settings className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-blue-500';
      case 'low':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get time ago string
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <CardTitle className="text-lg">Notifications</CardTitle>
            </div>
            <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-3 p-3 border rounded">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                {stats && stats.unread > 0 ? (
                  <BellDot className="w-5 h-5 text-blue-600" />
                ) : (
                  <Bell className="w-5 h-5" />
                )}
                {stats && stats.unread > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {stats.unread > 99 ? '99+' : stats.unread}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">Notifications</CardTitle>
              {stats && (
                <Badge variant="secondary" className="text-xs">
                  {stats.total}
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {isExpanded && (
            <div className="flex items-center justify-between pt-2">
              {/* Filter Buttons */}
              <div className="flex items-center space-x-1">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'unread', label: 'Unread' },
                  { value: 'study', label: 'Study' },
                  { value: 'achievement', label: 'Achievements' },
                  { value: 'analytics', label: 'Analytics' }
                ].map((filterOption) => (
                  <Button
                    key={filterOption.value}
                    variant={filter === filterOption.value ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(filterOption.value)}
                    className="text-xs h-7"
                  >
                    {filterOption.label}
                  </Button>
                ))}
              </div>

              {/* Actions */}
              {stats && stats.unread > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
          )}
        </CardHeader>
      )}

      {isExpanded && (
        <CardContent className="pt-0">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span>{error}</span>
              </div>
            </div>
          )}

          <ScrollArea className="h-full" style={{ maxHeight }}>
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {filter === 'all' ? "You're all caught up!" : 'Try changing the filter'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`group p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      !notification.isRead ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {/* Priority Indicator */}
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                          <div className={`p-2 rounded-full ${
                            !notification.isRead ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {getNotificationIcon(notification)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-medium truncate ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-2 ml-2">
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                              )}
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {getTimeAgo(notification.createdAt)}
                              </span>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>

                          {/* Action Button */}
                          {notification.actionText && notification.actionUrl && (
                            <div className="mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNotificationAction?.(notification, 'action');
                                }}
                              >
                                {notification.actionText}
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </Button>
                            </div>
                          )}

                          {/* Category Badge */}
                          <div className="mt-2 flex items-center justify-between">
                            <Badge variant="outline" className="text-xs capitalize">
                              {notification.category}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="h-6 w-6 p-0"
                            title="Mark as read"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(notification.id);
                          }}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          title="Dismiss"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
}

// Mock data for development
function getMockNotifications() {
  const now = new Date();
  const notifications: InAppNotification[] = [
    {
      id: 'notif_1',
      userId: 'user_1',
      title: 'Daily Study Reminder',
      message: 'Time for your daily LSAT practice! You have a 7-day study streak.',
      type: 'study_reminder',
      category: 'study',
      priority: 'medium',
      isRead: false,
      isDismissed: false,
      createdAt: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
      actionUrl: '/practice',
      actionText: 'Start Practice'
    },
    {
      id: 'notif_2',
      userId: 'user_1',
      title: 'Achievement Unlocked!',
      message: 'Congratulations! You have achieved "Logic Games Master" badge.',
      type: 'achievement',
      category: 'achievement',
      priority: 'high',
      isRead: false,
      isDismissed: false,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      actionUrl: '/achievements',
      actionText: 'View Achievement'
    },
    {
      id: 'notif_3',
      userId: 'user_1',
      title: 'Goal Progress Update',
      message: 'You are 65% towards your target score of 165. Keep up the great work!',
      type: 'goal_progress',
      category: 'achievement',
      priority: 'medium',
      isRead: true,
      isDismissed: false,
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
      readAt: new Date(now.getTime() - 20 * 60 * 60 * 1000),
      actionUrl: '/goals',
      actionText: 'View Goals'
    },
    {
      id: 'notif_4',
      userId: 'user_1',
      title: 'Weekly Performance Report',
      message: 'Your performance analysis is ready. You improved by 8% this week!',
      type: 'performance_insight',
      category: 'analytics',
      priority: 'low',
      isRead: false,
      isDismissed: false,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      actionUrl: '/analytics',
      actionText: 'View Report'
    },
    {
      id: 'notif_5',
      userId: 'user_1',
      title: 'Streak Alert',
      message: 'Warning: Your 14-day study streak will break if you don\'t practice today.',
      type: 'streak_alert',
      category: 'study',
      priority: 'high',
      isRead: true,
      isDismissed: false,
      createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
      readAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      actionUrl: '/practice',
      actionText: 'Practice Now'
    }
  ];

  const stats: NotificationStats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    dismissed: notifications.filter(n => n.isDismissed).length,
    byCategory: {
      study: 2,
      achievement: 2,
      analytics: 1,
      system: 0
    },
    byPriority: {
      urgent: 0,
      high: 2,
      medium: 2,
      low: 1
    }
  };

  return { notifications, stats };
}