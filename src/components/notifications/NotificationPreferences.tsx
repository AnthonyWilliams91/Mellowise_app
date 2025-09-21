/**
 * MELLOWISE-015: Smart Notification System - User Preferences Component
 *
 * Comprehensive notification preferences interface allowing users to configure:
 * - Notification channels (email, push, in-app, SMS)
 * - Notification types and categories
 * - Quiet hours with timezone support
 * - Frequency settings and smart defaults
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Bell,
  BellOff,
  Mail,
  Smartphone,
  MessageSquare,
  MessageCircle,
  Clock,
  Settings,
  Save,
  RotateCcw,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Calendar,
  Trophy,
  Target,
  Zap,
  BookOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';

// Types for notification preferences
interface NotificationChannel {
  id: string;
  name: string;
  enabled: boolean;
  icon: React.ReactNode;
  description: string;
  requiresSetup?: boolean;
  isConfigured?: boolean;
}

interface NotificationType {
  id: string;
  name: string;
  description: string;
  category: string;
  channels: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    sms: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly' | 'disabled';
  icon: React.ReactNode;
}

interface QuietHours {
  enabled: boolean;
  startTime: string;
  endTime: string;
  timezone: string;
  days: string[];
}

interface NotificationPreferences {
  channels: NotificationChannel[];
  types: NotificationType[];
  quietHours: QuietHours;
  globalEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

interface NotificationPreferencesProps {
  className?: string;
  onPreferencesChange?: (preferences: NotificationPreferences) => void;
}

export function NotificationPreferences({
  className,
  onPreferencesChange
}: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/notifications/preferences');
      if (!response.ok) {
        throw new Error('Failed to fetch notification preferences');
      }

      const data = await response.json();
      setPreferences(data.preferences);

    } catch (err) {
      console.error('Preferences fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
      // Use mock data for development
      setPreferences(getMockPreferences());
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      });

      if (!response.ok) {
        throw new Error('Failed to save notification preferences');
      }

      setHasChanges(false);
      onPreferencesChange?.(preferences);

      // Show success feedback
      setTimeout(() => {
        // Could add toast notification here
      }, 100);

    } catch (err) {
      console.error('Preferences save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setPreferences(getMockPreferences());
    setHasChanges(true);
  };

  const updateChannelStatus = (channelId: string, enabled: boolean) => {
    if (!preferences) return;

    const updatedPreferences = {
      ...preferences,
      channels: preferences.channels.map(channel =>
        channel.id === channelId ? { ...channel, enabled } : channel
      )
    };

    setPreferences(updatedPreferences);
    setHasChanges(true);
  };

  const updateNotificationType = (typeId: string, updates: Partial<NotificationType>) => {
    if (!preferences) return;

    const updatedPreferences = {
      ...preferences,
      types: preferences.types.map(type =>
        type.id === typeId ? { ...type, ...updates } : type
      )
    };

    setPreferences(updatedPreferences);
    setHasChanges(true);
  };

  const updateQuietHours = (updates: Partial<QuietHours>) => {
    if (!preferences) return;

    const updatedPreferences = {
      ...preferences,
      quietHours: { ...preferences.quietHours, ...updates }
    };

    setPreferences(updatedPreferences);
    setHasChanges(true);
  };

  const toggleGlobalNotifications = () => {
    if (!preferences) return;

    const updatedPreferences = {
      ...preferences,
      globalEnabled: !preferences.globalEnabled
    };

    setPreferences(updatedPreferences);
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notification Preferences</h1>
            <p className="text-gray-600">Configure how you receive notifications</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && !preferences) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <AlertCircle className="w-16 h-16 mx-auto opacity-50" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Preferences</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchPreferences} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notification Preferences</h1>
          <p className="text-gray-600">
            Customize how and when you receive notifications
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {hasChanges && (
            <Badge variant="secondary" className="animate-pulse">
              Unsaved Changes
            </Badge>
          )}

          <Button variant="outline" size="sm" onClick={resetToDefaults}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>

          <Button
            onClick={savePreferences}
            disabled={saving || !hasChanges}
            size="sm"
          >
            <Save className={`w-4 h-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Global Settings
          </CardTitle>
          <CardDescription>
            Master controls for all notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {preferences.globalEnabled ? (
                <Bell className="w-5 h-5 text-green-600" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <Label className="text-base font-medium">
                  Enable Notifications
                </Label>
                <p className="text-sm text-gray-600">
                  Turn off to disable all notifications
                </p>
              </div>
            </div>
            <Button
              variant={preferences.globalEnabled ? "default" : "outline"}
              size="sm"
              onClick={toggleGlobalNotifications}
            >
              {preferences.globalEnabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {preferences.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-blue-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
                <Label>Sound Effects</Label>
              </div>
              <Button
                variant={preferences.soundEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setPreferences(prev => prev ? { ...prev, soundEnabled: !prev.soundEnabled } : prev);
                  setHasChanges(true);
                }}
              >
                {preferences.soundEnabled ? 'On' : 'Off'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-purple-600" />
                <Label>Vibration</Label>
              </div>
              <Button
                variant={preferences.vibrationEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setPreferences(prev => prev ? { ...prev, vibrationEnabled: !prev.vibrationEnabled } : prev);
                  setHasChanges(true);
                }}
              >
                {preferences.vibrationEnabled ? 'On' : 'Off'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {preferences.channels.map((channel) => (
              <div
                key={channel.id}
                className={`p-4 border rounded-lg transition-colors ${
                  channel.enabled ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      channel.enabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {channel.icon}
                    </div>
                    <div>
                      <h4 className="font-medium">{channel.name}</h4>
                      <p className="text-sm text-gray-600">{channel.description}</p>
                    </div>
                  </div>
                  <Button
                    variant={channel.enabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateChannelStatus(channel.id, !channel.enabled)}
                    disabled={!preferences.globalEnabled}
                  >
                    {channel.enabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                {channel.requiresSetup && !channel.isConfigured && channel.enabled && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <div className="flex items-center text-yellow-700">
                      <Info className="w-4 h-4 mr-1" />
                      Setup required to receive {channel.name.toLowerCase()} notifications
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notification Types
          </CardTitle>
          <CardDescription>
            Configure when to receive different types of notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Group by category */}
            {Object.entries(
              preferences.types.reduce((acc, type) => {
                if (!acc[type.category]) acc[type.category] = [];
                acc[type.category].push(type);
                return acc;
              }, {} as Record<string, NotificationType[]>)
            ).map(([category, types]) => (
              <div key={category} className="space-y-3">
                <h4 className="font-medium text-gray-900 capitalize border-b pb-2">
                  {category} Notifications
                </h4>

                <div className="space-y-3">
                  {types.map((type) => (
                    <div
                      key={type.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-full text-gray-600">
                          {type.icon}
                        </div>
                        <div>
                          <h5 className="font-medium">{type.name}</h5>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Frequency Selector */}
                        <select
                          value={type.frequency}
                          onChange={(e) => updateNotificationType(type.id, {
                            frequency: e.target.value as NotificationType['frequency']
                          })}
                          className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={!preferences.globalEnabled}
                        >
                          <option value="immediate">Immediate</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="disabled">Disabled</option>
                        </select>

                        {/* Channel toggles for this type */}
                        <div className="flex items-center space-x-1">
                          {preferences.channels.filter(ch => ch.enabled).map((channel) => {
                            const isEnabled = type.channels[channel.id as keyof typeof type.channels];
                            return (
                              <Button
                                key={channel.id}
                                variant={isEnabled ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateNotificationType(type.id, {
                                  channels: {
                                    ...type.channels,
                                    [channel.id]: !isEnabled
                                  }
                                })}
                                disabled={!preferences.globalEnabled || type.frequency === 'disabled'}
                                className="h-6 w-6 p-0"
                                title={`${channel.name} notifications`}
                              >
                                <div className="w-3 h-3">{channel.icon}</div>
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Moon className="w-5 h-5 mr-2" />
            Quiet Hours
          </CardTitle>
          <CardDescription>
            Set times when you don't want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Enable Quiet Hours</Label>
              <p className="text-sm text-gray-600">
                Notifications will be muted during these hours
              </p>
            </div>
            <Button
              variant={preferences.quietHours.enabled ? "default" : "outline"}
              size="sm"
              onClick={() => updateQuietHours({ enabled: !preferences.quietHours.enabled })}
            >
              {preferences.quietHours.enabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          {preferences.quietHours.enabled && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <input
                    id="startTime"
                    type="time"
                    value={preferences.quietHours.startTime}
                    onChange={(e) => updateQuietHours({ startTime: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <input
                    id="endTime"
                    type="time"
                    value={preferences.quietHours.endTime}
                    onChange={(e) => updateQuietHours({ endTime: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    value={preferences.quietHours.timezone}
                    onChange={(e) => updateQuietHours({ timezone: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Days of Week</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                    const isSelected = preferences.quietHours.days.includes(day);
                    return (
                      <Button
                        key={day}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const days = isSelected
                            ? preferences.quietHours.days.filter(d => d !== day)
                            : [...preferences.quietHours.days, day];
                          updateQuietHours({ days });
                        }}
                      >
                        {day.slice(0, 3)}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-700">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Mock data for development
function getMockPreferences(): NotificationPreferences {
  return {
    globalEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    channels: [
      {
        id: 'email',
        name: 'Email',
        enabled: true,
        icon: <Mail className="w-4 h-4" />,
        description: 'Receive notifications via email',
        isConfigured: true
      },
      {
        id: 'push',
        name: 'Push Notifications',
        enabled: true,
        icon: <Smartphone className="w-4 h-4" />,
        description: 'Browser and mobile push notifications',
        isConfigured: true
      },
      {
        id: 'inApp',
        name: 'In-App',
        enabled: true,
        icon: <Bell className="w-4 h-4" />,
        description: 'Notifications within the application',
        isConfigured: true
      },
      {
        id: 'sms',
        name: 'SMS',
        enabled: false,
        icon: <MessageCircle className="w-4 h-4" />,
        description: 'Text message notifications',
        requiresSetup: true,
        isConfigured: false
      }
    ],
    types: [
      {
        id: 'study_reminder',
        name: 'Study Reminders',
        description: 'Reminders to practice and study',
        category: 'study',
        channels: { email: true, push: true, inApp: true, sms: false },
        frequency: 'daily',
        icon: <BookOpen className="w-4 h-4" />
      },
      {
        id: 'goal_progress',
        name: 'Goal Progress',
        description: 'Updates on goal milestones and progress',
        category: 'achievement',
        channels: { email: true, push: true, inApp: true, sms: false },
        frequency: 'weekly',
        icon: <Target className="w-4 h-4" />
      },
      {
        id: 'streak_alerts',
        name: 'Streak Alerts',
        description: 'Notifications about study streaks',
        category: 'achievement',
        channels: { email: false, push: true, inApp: true, sms: false },
        frequency: 'immediate',
        icon: <Zap className="w-4 h-4" />
      },
      {
        id: 'performance_insights',
        name: 'Performance Insights',
        description: 'Weekly performance analysis and recommendations',
        category: 'analytics',
        channels: { email: true, push: false, inApp: true, sms: false },
        frequency: 'weekly',
        icon: <TrendingUp className="w-4 h-4" />
      },
      {
        id: 'achievements',
        name: 'Achievements',
        description: 'New badges and milestone completions',
        category: 'achievement',
        channels: { email: true, push: true, inApp: true, sms: false },
        frequency: 'immediate',
        icon: <Trophy className="w-4 h-4" />
      }
    ],
    quietHours: {
      enabled: true,
      startTime: '22:00',
      endTime: '08:00',
      timezone: 'America/New_York',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }
  };
}