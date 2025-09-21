/**
 * MELLOWISE-015: Smart Notification System - Analytics Component
 *
 * Comprehensive notification analytics dashboard featuring:
 * - Engagement metrics (open rates, click rates, response rates)
 * - Channel performance comparison (email, push, in-app, SMS)
 * - Response trends and patterns over time
 * - SMS-specific analytics and cost tracking
 * - User segmentation and performance insights
 * - A/B testing results for notification optimization
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Bell,
  Mail,
  Smartphone,
  MessageCircle,
  Clock,
  Target,
  DollarSign,
  Eye,
  MousePointer,
  MessageSquare,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Info,
  Zap,
  Globe
} from 'lucide-react';

// Recharts imports for data visualization
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';

// Types for notification analytics
interface ChannelMetrics {
  channel: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  responseRate: number;
  cost?: number;
  costPerEngagement?: number;
}

interface EngagementTrend {
  date: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  responded: number;
}

interface NotificationTypeMetrics {
  type: string;
  category: string;
  sent: number;
  engagement: number;
  responseTime: number; // average response time in minutes
  effectivenessScore: number; // 0-100
}

interface UserSegmentMetrics {
  segment: string;
  userCount: number;
  notificationsSent: number;
  engagementRate: number;
  preferredChannel: string;
  avgResponseTime: number;
}

interface ABTestResult {
  testId: string;
  name: string;
  status: 'running' | 'completed' | 'paused';
  startDate: Date;
  endDate?: Date;
  variants: {
    id: string;
    name: string;
    sent: number;
    engaged: number;
    converted: number;
    engagementRate: number;
    conversionRate: number;
  }[];
  winner?: string;
  confidenceLevel: number;
}

interface AnalyticsSummary {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  overallDeliveryRate: number;
  overallOpenRate: number;
  overallClickRate: number;
  totalCost: number;
  avgCostPerEngagement: number;
  topPerformingChannel: string;
  topPerformingType: string;
}

interface NotificationAnalyticsData {
  summary: AnalyticsSummary;
  channelMetrics: ChannelMetrics[];
  engagementTrends: EngagementTrend[];
  typeMetrics: NotificationTypeMetrics[];
  userSegments: UserSegmentMetrics[];
  abTests: ABTestResult[];
  timeframe: string;
  dateRange: { start: string; end: string };
}

interface NotificationAnalyticsProps {
  className?: string;
  timeframe?: string;
  onTimeframeChange?: (timeframe: string) => void;
}

export function NotificationAnalytics({
  className,
  timeframe = '30d',
  onTimeframeChange
}: NotificationAnalyticsProps) {
  const [data, setData] = useState<NotificationAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/notifications/analytics?timeframe=${timeframe}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notification analytics');
      }

      const analyticsData = await response.json();
      setData(analyticsData);

    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      // Use mock data for development
      setData(getMockAnalyticsData());
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
  };

  const handleTimeframeChange = (newTimeframe: string) => {
    onTimeframeChange?.(newTimeframe);
  };

  const exportData = () => {
    if (!data) return;

    const exportData = {
      exportDate: new Date().toISOString(),
      timeframe: data.timeframe,
      dateRange: data.dateRange,
      summary: data.summary,
      channelMetrics: data.channelMetrics,
      typeMetrics: data.typeMetrics
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notification-analytics-${data.timeframe}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notification Analytics</h1>
            <p className="text-gray-600">Performance insights and engagement metrics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <BarChart3 className="w-16 h-16 mx-auto opacity-50" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Analytics</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notification Analytics</h1>
          <p className="text-gray-600">
            Performance insights for {data.dateRange.start} to {data.dateRange.end}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Timeframe Selector */}
          <div className="flex items-center space-x-1">
            {['7d', '30d', '90d', 'all'].map(period => (
              <Button
                key={period}
                variant={timeframe === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTimeframeChange(period)}
                className="text-xs"
              >
                {period === 'all' ? 'All Time' : period.toUpperCase()}
              </Button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Sent"
          value={data.summary.totalSent.toLocaleString()}
          icon={<Bell className="w-4 h-4" />}
          color="bg-blue-500"
          change="+12%"
          trend="up"
        />
        <MetricCard
          title="Delivery Rate"
          value={`${(data.summary.overallDeliveryRate * 100).toFixed(1)}%`}
          icon={<CheckCircle2 className="w-4 h-4" />}
          color="bg-green-500"
          change="+2.3%"
          trend="up"
        />
        <MetricCard
          title="Open Rate"
          value={`${(data.summary.overallOpenRate * 100).toFixed(1)}%`}
          icon={<Eye className="w-4 h-4" />}
          color="bg-purple-500"
          change="-1.2%"
          trend="down"
        />
        <MetricCard
          title="Click Rate"
          value={`${(data.summary.overallClickRate * 100).toFixed(1)}%`}
          icon={<MousePointer className="w-4 h-4" />}
          color="bg-orange-500"
          change="+3.1%"
          trend="up"
        />
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="types">Types</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="testing">A/B Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewDashboard data={data} />
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <ChannelPerformance data={data.channelMetrics} />
        </TabsContent>

        <TabsContent value="types" className="space-y-6">
          <NotificationTypeAnalysis data={data.typeMetrics} />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <EngagementTrends data={data.engagementTrends} />
        </TabsContent>

        <TabsContent value="segments" className="space-y-6">
          <UserSegmentAnalysis data={data.userSegments} />
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <ABTestResults data={data.abTests} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  color,
  change,
  trend,
  description
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  change?: string;
  trend?: 'up' | 'down';
  description?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold">{value}</p>
              {change && (
                <div className={`flex items-center text-sm ${
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {change}
                </div>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className={`p-2 rounded-full ${color} text-white`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewDashboard({ data }: { data: NotificationAnalyticsData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Channel Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Channel Performance</CardTitle>
          <CardDescription>
            Engagement rates by notification channel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.channelMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="channel" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="openRate" fill="#8884d8" name="Open Rate %" />
              <Bar dataKey="clickRate" fill="#82ca9d" name="Click Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cost Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Efficiency</CardTitle>
          <CardDescription>
            Cost per engagement by channel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data.channelMetrics.filter(c => c.cost)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="channel" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="cost" fill="#ffc658" name="Total Cost ($)" />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="costPerEngagement"
                stroke="#ff7300"
                name="Cost per Engagement ($)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Performing Types */}
      <Card>
        <CardHeader>
          <CardTitle>Top Notification Types</CardTitle>
          <CardDescription>
            Best performing notification categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.typeMetrics
              .sort((a, b) => b.effectivenessScore - a.effectivenessScore)
              .slice(0, 5)
              .map((type, index) => (
                <div key={type.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium capitalize">
                        {type.type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">
                        {type.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{type.effectivenessScore}%</p>
                    <p className="text-sm text-gray-600">
                      {type.sent.toLocaleString()} sent
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>
            Important metrics and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Best Channel</span>
              </div>
              <span className="text-sm text-green-700">
                {data.summary.topPerformingChannel}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Best Type</span>
              </div>
              <span className="text-sm text-blue-700 capitalize">
                {data.summary.topPerformingType.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Avg Cost per Engagement</span>
              </div>
              <span className="text-sm text-purple-700">
                ${data.summary.avgCostPerEngagement.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ChannelPerformance({ data }: { data: ChannelMetrics[] }) {
  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'push':
        return <Smartphone className="w-4 h-4" />;
      case 'sms':
        return <MessageCircle className="w-4 h-4" />;
      case 'in-app':
        return <Bell className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Channel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.map((channel) => (
          <Card key={channel.channel}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg capitalize flex items-center">
                  {getChannelIcon(channel.channel)}
                  <span className="ml-2">{channel.channel}</span>
                </CardTitle>
                <Badge variant={channel.deliveryRate > 0.9 ? "default" : "secondary"}>
                  {(channel.deliveryRate * 100).toFixed(1)}% delivered
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sent</span>
                  <span className="font-medium">{channel.sent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Opened</span>
                  <span className="font-medium">{channel.opened.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Clicked</span>
                  <span className="font-medium">{channel.clicked.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Open Rate</span>
                  <span className="font-medium">{(channel.openRate * 100).toFixed(1)}%</span>
                </div>
                <Progress value={channel.openRate * 100} className="h-2" />

                <div className="flex justify-between text-sm">
                  <span>Click Rate</span>
                  <span className="font-medium">{(channel.clickRate * 100).toFixed(1)}%</span>
                </div>
                <Progress value={channel.clickRate * 100} className="h-2" />
              </div>

              {channel.cost && (
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Total Cost</span>
                    <span className="font-medium">${channel.cost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Cost per Engagement</span>
                    <span className="font-medium">${channel.costPerEngagement?.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Channel Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Channel Performance Comparison</CardTitle>
          <CardDescription>
            Detailed metrics comparison across all channels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="channel" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="sent" fill="#8884d8" name="Sent" />
              <Bar yAxisId="left" dataKey="delivered" fill="#82ca9d" name="Delivered" />
              <Line yAxisId="right" type="monotone" dataKey="openRate" stroke="#ff7300" name="Open Rate" />
              <Line yAxisId="right" type="monotone" dataKey="clickRate" stroke="#ffc658" name="Click Rate" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationTypeAnalysis({ data }: { data: NotificationTypeMetrics[] }) {
  return (
    <div className="space-y-6">
      {/* Type Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((type) => (
          <Card key={type.type}>
            <CardHeader>
              <CardTitle className="text-lg capitalize">
                {type.type.replace('_', ' ')}
              </CardTitle>
              <CardDescription className="capitalize">
                {type.category} notification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Effectiveness</span>
                  <Badge variant={type.effectivenessScore > 70 ? "default" : "secondary"}>
                    {type.effectivenessScore}%
                  </Badge>
                </div>
                <Progress value={type.effectivenessScore} className="h-2" />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Sent</span>
                    <p className="font-medium">{type.sent.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Engagement</span>
                    <p className="font-medium">{type.engagement.toLocaleString()}</p>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="text-gray-600">Avg Response Time</span>
                  <p className="font-medium">{type.responseTime} minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Type Effectiveness Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Type Effectiveness</CardTitle>
          <CardDescription>
            Performance scores across different notification types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="type"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="effectivenessScore" fill="#8884d8" name="Effectiveness %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function EngagementTrends({ data }: { data: EngagementTrend[] }) {
  return (
    <div className="space-y-6">
      {/* Engagement Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Trends Over Time</CardTitle>
          <CardDescription>
            Notification performance metrics tracking over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sent" stroke="#8884d8" name="Sent" />
              <Line type="monotone" dataKey="delivered" stroke="#82ca9d" name="Delivered" />
              <Line type="monotone" dataKey="opened" stroke="#ffc658" name="Opened" />
              <Line type="monotone" dataKey="clicked" stroke="#ff7300" name="Clicked" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>
            How users progress through the notification journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="sent"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
                name="Sent"
              />
              <Area
                type="monotone"
                dataKey="delivered"
                stackId="2"
                stroke="#82ca9d"
                fill="#82ca9d"
                name="Delivered"
              />
              <Area
                type="monotone"
                dataKey="opened"
                stackId="3"
                stroke="#ffc658"
                fill="#ffc658"
                name="Opened"
              />
              <Area
                type="monotone"
                dataKey="clicked"
                stackId="4"
                stroke="#ff7300"
                fill="#ff7300"
                name="Clicked"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function UserSegmentAnalysis({ data }: { data: UserSegmentMetrics[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Segment Performance</CardTitle>
        <CardDescription>
          Notification engagement by user segments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((segment) => (
            <div key={segment.segment} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium capitalize">{segment.segment}</h4>
                <Badge variant="outline">
                  {segment.userCount.toLocaleString()} users
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Notifications Sent</span>
                  <p className="font-medium">{segment.notificationsSent.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Engagement Rate</span>
                  <p className="font-medium">{(segment.engagementRate * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <span className="text-gray-600">Preferred Channel</span>
                  <p className="font-medium capitalize">{segment.preferredChannel}</p>
                </div>
                <div>
                  <span className="text-gray-600">Avg Response Time</span>
                  <p className="font-medium">{segment.avgResponseTime} min</p>
                </div>
              </div>

              <div className="mt-3">
                <Progress value={segment.engagementRate * 100} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ABTestResults({ data }: { data: ABTestResult[] }) {
  return (
    <div className="space-y-6">
      {data.map((test) => (
        <Card key={test.testId}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{test.name}</CardTitle>
                <CardDescription>
                  {test.startDate.toLocaleDateString()} - {test.endDate?.toLocaleDateString() || 'Ongoing'}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={test.status === 'completed' ? 'default' : test.status === 'running' ? 'secondary' : 'outline'}>
                  {test.status}
                </Badge>
                {test.winner && (
                  <Badge variant="default">
                    Winner: {test.winner}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {test.variants.map((variant) => (
                <div key={variant.id} className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">{variant.name}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Sent</span>
                      <span className="font-medium">{variant.sent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Engaged</span>
                      <span className="font-medium">{variant.engaged.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Converted</span>
                      <span className="font-medium">{variant.converted.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Engagement Rate</span>
                      <span className="font-medium">{(variant.engagementRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conversion Rate</span>
                      <span className="font-medium">{(variant.conversionRate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <Progress value={variant.engagementRate * 100} className="h-2 mt-3" />
                </div>
              ))}
            </div>
            {test.status === 'completed' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-green-700">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    Test completed with {test.confidenceLevel}% confidence level
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Mock data for development
function getMockAnalyticsData(): NotificationAnalyticsData {
  const now = new Date();

  return {
    timeframe: '30d',
    dateRange: {
      start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      end: now.toLocaleDateString()
    },
    summary: {
      totalSent: 12500,
      totalDelivered: 11875,
      totalOpened: 4275,
      totalClicked: 1438,
      overallDeliveryRate: 0.95,
      overallOpenRate: 0.36,
      overallClickRate: 0.115,
      totalCost: 156.75,
      avgCostPerEngagement: 0.109,
      topPerformingChannel: 'Email',
      topPerformingType: 'achievement'
    },
    channelMetrics: [
      {
        channel: 'email',
        sent: 5000,
        delivered: 4850,
        opened: 1940,
        clicked: 679,
        deliveryRate: 0.97,
        openRate: 0.40,
        clickRate: 0.14,
        responseRate: 0.35,
        cost: 25.00,
        costPerEngagement: 0.037
      },
      {
        channel: 'push',
        sent: 4500,
        delivered: 4320,
        opened: 1512,
        clicked: 432,
        deliveryRate: 0.96,
        openRate: 0.35,
        clickRate: 0.10,
        responseRate: 0.29,
        cost: 0,
        costPerEngagement: 0
      },
      {
        channel: 'in-app',
        sent: 2500,
        delivered: 2500,
        opened: 750,
        clicked: 275,
        deliveryRate: 1.0,
        openRate: 0.30,
        clickRate: 0.11,
        responseRate: 0.42,
        cost: 0,
        costPerEngagement: 0
      },
      {
        channel: 'sms',
        sent: 500,
        delivered: 485,
        opened: 73,
        clicked: 52,
        deliveryRate: 0.97,
        openRate: 0.15,
        clickRate: 0.11,
        responseRate: 0.71,
        cost: 131.75,
        costPerEngagement: 1.80
      }
    ],
    engagementTrends: [
      { date: 'Week 1', sent: 3125, delivered: 2969, opened: 1069, clicked: 360, responded: 267 },
      { date: 'Week 2', sent: 3000, delivered: 2850, opened: 997, clicked: 329, responded: 263 },
      { date: 'Week 3', sent: 3200, delivered: 3040, opened: 1094, clicked: 371, responded: 281 },
      { date: 'Week 4', sent: 3175, delivered: 3016, opened: 1115, clicked: 378, responded: 289 }
    ],
    typeMetrics: [
      {
        type: 'study_reminder',
        category: 'study',
        sent: 4000,
        engagement: 1400,
        responseTime: 15,
        effectivenessScore: 78
      },
      {
        type: 'achievement',
        category: 'achievement',
        sent: 2500,
        engagement: 1950,
        responseTime: 5,
        effectivenessScore: 89
      },
      {
        type: 'goal_progress',
        category: 'achievement',
        sent: 2000,
        engagement: 1200,
        responseTime: 12,
        effectivenessScore: 72
      },
      {
        type: 'performance_insight',
        category: 'analytics',
        sent: 1500,
        engagement: 825,
        responseTime: 45,
        effectivenessScore: 65
      },
      {
        type: 'streak_alert',
        category: 'study',
        sent: 2500,
        engagement: 2000,
        responseTime: 8,
        effectivenessScore: 85
      }
    ],
    userSegments: [
      {
        segment: 'new_users',
        userCount: 450,
        notificationsSent: 2700,
        engagementRate: 0.42,
        preferredChannel: 'push',
        avgResponseTime: 18
      },
      {
        segment: 'active_users',
        userCount: 1200,
        notificationsSent: 7200,
        engagementRate: 0.38,
        preferredChannel: 'email',
        avgResponseTime: 12
      },
      {
        segment: 'power_users',
        userCount: 150,
        notificationsSent: 1800,
        engagementRate: 0.65,
        preferredChannel: 'in-app',
        avgResponseTime: 5
      },
      {
        segment: 'inactive_users',
        userCount: 300,
        notificationsSent: 800,
        engagementRate: 0.15,
        preferredChannel: 'email',
        avgResponseTime: 120
      }
    ],
    abTests: [
      {
        testId: 'test_001',
        name: 'Study Reminder Time Optimization',
        status: 'completed',
        startDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        variants: [
          {
            id: 'variant_a',
            name: 'Morning (9 AM)',
            sent: 1000,
            engaged: 380,
            converted: 152,
            engagementRate: 0.38,
            conversionRate: 0.152
          },
          {
            id: 'variant_b',
            name: 'Evening (7 PM)',
            sent: 1000,
            engaged: 420,
            converted: 189,
            engagementRate: 0.42,
            conversionRate: 0.189
          }
        ],
        winner: 'variant_b',
        confidenceLevel: 95
      }
    ]
  };
}