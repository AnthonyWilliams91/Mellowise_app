/**
 * MELLOWISE-016: Goal Setting & Progress Tracking Dashboard
 * Comprehensive analytics dashboard with Recharts visualizations
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Target,
  TrendingUp,
  Calendar,
  Award,
  Clock,
  Brain,
  BarChart3,
  Settings,
  Trophy,
  Zap,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

// Recharts imports for visualizations
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
  RadialBarChart,
  RadialBar
} from 'recharts';

import type {
  LSATGoal,
  GoalAnalyticsData,
  ProgressChartData,
  AccuracyChartData,
  StudyTimeChartData,
  MilestoneProgressData,
  Achievement
} from '@/types/goals';

interface GoalDashboardProps {
  className?: string;
}

export function GoalDashboard({ className }: GoalDashboardProps) {
  const [currentGoal, setCurrentGoal] = useState<LSATGoal | null>(null);
  const [analyticsData, setAnalyticsData] = useState<GoalAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGoalData();
  }, []);

  const fetchGoalData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/goals/current');
      if (!response.ok) {
        throw new Error('Failed to fetch goal data');
      }
      const data = await response.json();
      setCurrentGoal(data.goal);
      setAnalyticsData(data.analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Mock data for development
      setCurrentGoal(getMockGoal());
      setAnalyticsData(getMockAnalytics());
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading goal dashboard...</span>
      </div>
    );
  }

  if (error && !currentGoal) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center text-destructive">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Error loading goal data: {error}</span>
          </div>
          <Button onClick={fetchGoalData} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentGoal) {
    return <GoalSetupWizard onGoalCreated={fetchGoalData} className={className} />;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Goal Dashboard</h2>
          <p className="text-muted-foreground">
            Track your LSAT preparation progress and milestones
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={fetchGoalData} size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Goal Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GoalOverviewCard
          title="Target Score"
          value={currentGoal.targetScore}
          current={currentGoal.currentScore || 145}
          icon={<Target className="h-4 w-4" />}
          color="bg-blue-500"
        />
        <GoalOverviewCard
          title="Days Remaining"
          value={analyticsData?.summary.daysToTarget || 0}
          icon={<Calendar className="h-4 w-4" />}
          color="bg-green-500"
        />
        <GoalOverviewCard
          title="Success Probability"
          value={`${Math.round((analyticsData?.summary.probabilityOfSuccess || 0.75) * 100)}%`}
          icon={<TrendingUp className="h-4 w-4" />}
          color="bg-purple-500"
        />
        <GoalOverviewCard
          title="Study Streak"
          value="12 days"
          icon={<Zap className="h-4 w-4" />}
          color="bg-orange-500"
        />
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          <ProgressOverview goal={currentGoal} analytics={analyticsData} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsCharts analytics={analyticsData} />
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <MilestonesView goal={currentGoal} />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <AchievementsView achievements={currentGoal.achievements} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GoalOverviewCard({
  title,
  value,
  current,
  icon,
  color,
  description
}: {
  title: string;
  value: number | string;
  current?: number;
  icon: React.ReactNode;
  color: string;
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
              {current && (
                <p className="text-sm text-muted-foreground">/ {current}</p>
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

function ProgressOverview({
  goal,
  analytics
}: {
  goal: LSATGoal;
  analytics: GoalAnalyticsData | null;
}) {
  const progressData = analytics?.progressTrend || getMockProgressData();
  const currentScore = goal.currentScore || 145;
  const progressPercentage = ((currentScore - 120) / (goal.targetScore - 120)) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Current Score: {currentScore}</span>
              <span>Target: {goal.targetScore}</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="text-sm text-muted-foreground">
              {progressPercentage.toFixed(1)}% of target reached
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Section Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(goal.sectionGoals).map(([section, sectionGoal]) => (
              <div key={section} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {section.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-sm">
                    {Math.round(sectionGoal.accuracy * 100)}%
                  </span>
                </div>
                <Progress
                  value={sectionGoal.accuracy * 100}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Trend Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Progress Trend</CardTitle>
          <CardDescription>
            Your score progression over time with target trajectory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[120, 180]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="overall"
                stroke="#8884d8"
                strokeWidth={2}
                name="Current Score"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#82ca9d"
                strokeDasharray="5 5"
                name="Target Trajectory"
              />
              <Line
                type="monotone"
                dataKey="logicalReasoning"
                stroke="#ffc658"
                strokeWidth={1}
                name="Logical Reasoning"
              />
              <Line
                type="monotone"
                dataKey="logicGames"
                stroke="#ff7300"
                strokeWidth={1}
                name="Logic Games"
              />
              <Line
                type="monotone"
                dataKey="readingComprehension"
                stroke="#387908"
                strokeWidth={1}
                name="Reading Comprehension"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function AnalyticsCharts({ analytics }: { analytics: GoalAnalyticsData | null }) {
  const accuracyData = analytics?.sectionAccuracy || getMockAccuracyData();
  const studyTimeData = analytics?.studyTimeAnalysis || getMockStudyTimeData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Section Accuracy Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Section Accuracy Analysis</CardTitle>
          <CardDescription>
            Current vs target accuracy by section
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={accuracyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="topic" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="current" fill="#8884d8" name="Current" />
              <Bar dataKey="target" fill="#82ca9d" name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Study Time Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Study Time Analysis</CardTitle>
          <CardDescription>
            Planned vs actual study hours over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={studyTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="planned"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
                name="Planned Hours"
              />
              <Area
                type="monotone"
                dataKey="actual"
                stackId="2"
                stroke="#82ca9d"
                fill="#82ca9d"
                name="Actual Hours"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Distribution</CardTitle>
          <CardDescription>
            Score distribution across difficulty levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Easy (1-3)', value: 85, fill: '#0088FE' },
                  { name: 'Medium (4-6)', value: 70, fill: '#00C49F' },
                  { name: 'Hard (7-10)', value: 45, fill: '#FFBB28' }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Goal Progress Radial */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Completion</CardTitle>
          <CardDescription>
            Overall progress toward target score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={[
              { name: 'Progress', value: 65, fill: '#8884d8' }
            ]}>
              <RadialBar
                minAngle={15}
                label={{ position: 'insideStart', fill: '#fff' }}
                background
                clockwise
                dataKey="value"
              />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function MilestonesView({ goal }: { goal: LSATGoal }) {
  const milestones = goal.milestones || getMockMilestones();

  return (
    <div className="space-y-4">
      {milestones.map((milestone) => (
        <Card key={milestone.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    milestone.isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {milestone.isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    ) : (
                      <Target className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">{milestone.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {milestone.description}
                    </p>
                  </div>
                </div>

                <div className="mt-3 ml-11">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">
                      {milestone.current} / {milestone.target}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round((milestone.current / milestone.target) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(milestone.current / milestone.target) * 100}
                    className="h-2"
                  />
                </div>
              </div>

              <div className="ml-4 text-right">
                <Badge variant={milestone.isCompleted ? "default" : "secondary"}>
                  {milestone.isCompleted ? "Completed" : "In Progress"}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Due: {new Date(milestone.targetDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AchievementsView({ achievements }: { achievements: Achievement[] }) {
  const displayAchievements = achievements || getMockAchievements();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayAchievements.map((achievement) => (
        <Card key={achievement.id} className="relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] ${
            achievement.rarity === 'legendary' ? 'border-t-yellow-400' :
            achievement.rarity === 'epic' ? 'border-t-purple-500' :
            achievement.rarity === 'rare' ? 'border-t-blue-500' : 'border-t-gray-400'
          }`} />

          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{achievement.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {achievement.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="capitalize">
                    {achievement.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function GoalSetupWizard({
  onGoalCreated,
  className
}: {
  onGoalCreated: () => void;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Set Your LSAT Goal
        </CardTitle>
        <CardDescription>
          Create a personalized study plan to reach your target score
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Button onClick={onGoalCreated} size="lg">
            <Trophy className="h-4 w-4 mr-2" />
            Start Goal Setup
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Mock data functions for development
function getMockGoal(): LSATGoal {
  return {
    id: 'goal_1',
    userId: 'user_1',
    targetScore: 165,
    currentScore: 155,
    targetDate: new Date('2024-06-15'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    isActive: true,
    sectionGoals: {
      logicalReasoning: {
        sectionName: 'logicalReasoning',
        targetScore: 24,
        currentScore: 20,
        questionsCorrect: 180,
        questionsTotal: 250,
        accuracy: 0.72,
        averageTime: 85,
        targetTime: 75,
        currentDifficulty: 6,
        targetDifficulty: 8,
        focusAreas: ['assumption', 'strengthen'],
        weakTopics: ['parallel reasoning'],
        strongTopics: ['must be true']
      },
      logicGames: {
        sectionName: 'logicGames',
        targetScore: 22,
        currentScore: 18,
        questionsCorrect: 140,
        questionsTotal: 200,
        accuracy: 0.70,
        averageTime: 110,
        targetTime: 90,
        currentDifficulty: 5,
        targetDifficulty: 7,
        focusAreas: ['sequencing', 'grouping'],
        weakTopics: ['hybrid games'],
        strongTopics: ['basic linear']
      },
      readingComprehension: {
        sectionName: 'readingComprehension',
        targetScore: 25,
        currentScore: 22,
        questionsCorrect: 160,
        questionsTotal: 220,
        accuracy: 0.73,
        averageTime: 95,
        targetTime: 85,
        currentDifficulty: 6,
        targetDifficulty: 7,
        focusAreas: ['main point', 'inference'],
        weakTopics: ['comparative reading'],
        strongTopics: ['science passages']
      }
    },
    studyHoursPerWeek: 15,
    preferredStudyTimes: ['morning', 'evening'],
    milestones: getMockMilestones(),
    achievements: getMockAchievements(),
    predictedScore: 162,
    confidenceLevel: 0.78,
    recommendedAdjustments: [
      'Increase Logic Games practice time',
      'Focus on speed improvement in Logical Reasoning'
    ]
  };
}

function getMockAnalytics(): GoalAnalyticsData {
  return {
    progressTrend: getMockProgressData(),
    sectionAccuracy: getMockAccuracyData(),
    studyTimeAnalysis: getMockStudyTimeData(),
    milestoneProgress: [],
    summary: {
      daysToTarget: 89,
      currentTrajectory: 'on_track',
      probabilityOfSuccess: 0.78,
      recommendedActions: [
        'Maintain current study schedule',
        'Focus on Logic Games improvement',
        'Review weak areas in Logical Reasoning'
      ]
    }
  };
}

function getMockProgressData(): ProgressChartData[] {
  return [
    { date: 'Week 1', overall: 145, logicalReasoning: 18, logicGames: 15, readingComprehension: 20, target: 148 },
    { date: 'Week 2', overall: 147, logicalReasoning: 19, logicGames: 16, readingComprehension: 21, target: 150 },
    { date: 'Week 3', overall: 150, logicalReasoning: 19, logicGames: 17, readingComprehension: 21, target: 152 },
    { date: 'Week 4', overall: 152, logicalReasoning: 20, logicGames: 17, readingComprehension: 22, target: 154 },
    { date: 'Week 5', overall: 155, logicalReasoning: 20, logicGames: 18, readingComprehension: 22, target: 156 }
  ];
}

function getMockAccuracyData(): AccuracyChartData[] {
  return [
    { topic: 'Logical Reasoning', current: 72, target: 85, improvement: 8 },
    { topic: 'Logic Games', current: 70, target: 80, improvement: 12 },
    { topic: 'Reading Comp', current: 73, target: 82, improvement: 6 }
  ];
}

function getMockStudyTimeData(): StudyTimeChartData[] {
  return [
    { week: 'Week 1', planned: 15, actual: 12, efficiency: 80 },
    { week: 'Week 2', planned: 15, actual: 16, efficiency: 107 },
    { week: 'Week 3', planned: 15, actual: 14, efficiency: 93 },
    { week: 'Week 4', planned: 15, actual: 15, efficiency: 100 },
    { week: 'Week 5', planned: 15, actual: 17, efficiency: 113 }
  ];
}

function getMockMilestones() {
  return [
    {
      id: 'milestone_1',
      goalId: 'goal_1',
      title: 'Logic Games Mastery',
      description: 'Achieve 80% accuracy in Logic Games section',
      targetDate: new Date('2024-03-15'),
      type: 'accuracy' as const,
      target: 80,
      current: 70,
      isCompleted: false
    },
    {
      id: 'milestone_2',
      goalId: 'goal_1',
      title: 'Speed Improvement',
      description: 'Complete LR section in under 30 minutes',
      targetDate: new Date('2024-04-01'),
      type: 'speed' as const,
      target: 30,
      current: 32,
      isCompleted: false
    }
  ];
}

function getMockAchievements(): Achievement[] {
  return [
    {
      id: 'ach_1',
      userId: 'user_1',
      title: 'First Perfect Game',
      description: 'Solved a Logic Game with 100% accuracy',
      unlockedAt: new Date('2024-01-20'),
      category: 'accuracy',
      rarity: 'rare',
      isVisible: true,
      showInProfile: true,
      requirements: [{ metric: 'logic_games_accuracy', threshold: 100, achieved: 100 }]
    },
    {
      id: 'ach_2',
      userId: 'user_1',
      title: 'Speed Demon',
      description: 'Completed 10 LR questions in under 10 minutes',
      unlockedAt: new Date('2024-01-25'),
      category: 'speed',
      rarity: 'epic',
      isVisible: true,
      showInProfile: true,
      requirements: [{ metric: 'lr_speed', threshold: 60, achieved: 58 }]
    }
  ];
}