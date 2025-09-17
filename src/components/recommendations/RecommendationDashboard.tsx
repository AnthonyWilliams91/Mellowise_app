/**
 * MELLOWISE-011: Recommendation Dashboard Component
 * Displays intelligent content recommendations and study plans
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Brain, Clock, Target, TrendingUp, Zap } from 'lucide-react';
import type { RecommendationResponse, RecommendedItem, StudyPlan } from '@/types/recommendation';

interface RecommendationDashboardProps {
  className?: string;
}

export function RecommendationDashboard({ className }: RecommendationDashboardProps) {
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week'>('today');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recommendations?maxItems=10');
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (questionId: string, helpful: boolean) => {
    try {
      await fetch('/api/recommendations/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          recommendationId: `rec_${Date.now()}`,
          feedback: {
            helpful,
            difficulty: 'just_right',
            timing: 'perfect'
          },
          performance: {
            correct: true,
            timeSpent: 120,
            confidence: 0.8
          }
        })
      });
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading recommendations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center text-destructive">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Error loading recommendations: {error}</span>
          </div>
          <Button onClick={fetchRecommendations} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No recommendations available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Smart Recommendations</h2>
          <p className="text-muted-foreground">
            AI-powered study suggestions based on your learning profile
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center">
            <Brain className="h-3 w-3 mr-1" />
            Confidence: {Math.round(recommendations.metadata.confidenceScore * 100)}%
          </Badge>
          <Button onClick={fetchRecommendations} size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Session Suggestion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Today's Study Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">
                  {recommendations.sessionSuggestion.optimalDuration} minutes
                </div>
                <div className="text-sm text-muted-foreground">Optimal duration</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium capitalize">
                  {recommendations.sessionSuggestion.focusMode.replace('_', ' ')}
                </div>
                <div className="text-sm text-muted-foreground">Focus mode</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">
                  {recommendations.sessionSuggestion.energyAlignment ? 'Aligned' : 'Misaligned'}
                </div>
                <div className="text-sm text-muted-foreground">Energy match</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedTimeframe} onValueChange={(value) => setSelectedTimeframe(value as 'today' | 'week')}>
        <TabsList>
          <TabsTrigger value="today">Today's Recommendations</TabsTrigger>
          <TabsTrigger value="week">This Week's Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <RecommendationList
            recommendations={recommendations.recommendations}
            onFeedback={submitFeedback}
          />
        </TabsContent>

        <TabsContent value="week">
          {recommendations.studyPlan && (
            <StudyPlanView studyPlan={recommendations.studyPlan} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RecommendationList({
  recommendations,
  onFeedback
}: {
  recommendations: RecommendedItem[];
  onFeedback: (questionId: string, helpful: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      {recommendations.map((rec, index) => (
        <RecommendationCard
          key={rec.questionId}
          recommendation={rec}
          rank={index + 1}
          onFeedback={onFeedback}
        />
      ))}
    </div>
  );
}

function RecommendationCard({
  recommendation,
  rank,
  onFeedback
}: {
  recommendation: RecommendedItem;
  rank: number;
  onFeedback: (questionId: string, helpful: boolean) => void;
}) {
  const getReasonColor = (type: string) => {
    switch (type) {
      case 'weakness': return 'destructive';
      case 'strength_building': return 'default';
      case 'review': return 'secondary';
      case 'high_yield': return 'default';
      default: return 'outline';
    }
  };

  const getReasonIcon = (type: string) => {
    switch (type) {
      case 'weakness': return <AlertCircle className="h-3 w-3" />;
      case 'strength_building': return <TrendingUp className="h-3 w-3" />;
      case 'review': return <Clock className="h-3 w-3" />;
      case 'high_yield': return <Target className="h-3 w-3" />;
      default: return <Brain className="h-3 w-3" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                {rank}
              </div>
              <Badge
                variant={getReasonColor(recommendation.reason.type)}
                className="flex items-center"
              >
                {getReasonIcon(recommendation.reason.type)}
                <span className="ml-1 capitalize">
                  {recommendation.reason.type.replace('_', ' ')}
                </span>
              </Badge>
              <Badge variant="outline">
                Difficulty: {recommendation.expectedDifficulty}/10
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="font-medium">Question {recommendation.questionId}</div>

              {recommendation.topicPath.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {recommendation.topicPath.join(' → ')}
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                {recommendation.reason.description}
              </div>

              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span>~{recommendation.estimatedTime} min</span>
                <span>Impact: {Math.round(recommendation.reason.impactScore * 100)}%</span>
                <span>Confidence: {Math.round(recommendation.reason.confidenceLevel * 100)}%</span>
              </div>

              {recommendation.reviewOptimal && (
                <Badge variant="secondary" className="text-xs">
                  Optimal review time
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-2 ml-4">
            <Button
              size="sm"
              onClick={() => onFeedback(recommendation.questionId, true)}
            >
              Start Question
            </Button>
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onFeedback(recommendation.questionId, true)}
              >
                👍
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onFeedback(recommendation.questionId, false)}
              >
                👎
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StudyPlanView({ studyPlan }: { studyPlan: StudyPlan }) {
  const today = new Date().toDateString();
  const todayGoal = studyPlan.dailyGoals.find(
    goal => new Date(goal.date).toDateString() === today
  );

  return (
    <div className="space-y-6">
      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle>This Week's Targets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold">
                {studyPlan.weeklyTargets.targetMinutes} min
              </div>
              <div className="text-sm text-muted-foreground">Target study time</div>
              <Progress
                value={(studyPlan.weeklyTargets.progressTracking.minutesCompleted / studyPlan.weeklyTargets.targetMinutes) * 100}
                className="mt-2"
              />
            </div>

            <div>
              <div className="text-2xl font-bold">
                {studyPlan.weeklyTargets.targetQuestions}
              </div>
              <div className="text-sm text-muted-foreground">Target questions</div>
              <Progress
                value={(studyPlan.weeklyTargets.progressTracking.questionsCompleted / studyPlan.weeklyTargets.targetQuestions) * 100}
                className="mt-2"
              />
            </div>

            <div>
              <div className="text-2xl font-bold">
                {Math.round(studyPlan.weeklyTargets.progressTracking.averageAccuracy * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Average accuracy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Goal */}
      {todayGoal && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Study Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Target: {todayGoal.recommendedMinutes} minutes</span>
                <span>Progress: {todayGoal.completionStatus.actualMinutes} min</span>
              </div>
              <Progress
                value={(todayGoal.completionStatus.actualMinutes / todayGoal.recommendedMinutes) * 100}
              />

              <div>
                <div className="font-medium mb-2">Focus Topics:</div>
                <div className="flex flex-wrap gap-2">
                  {todayGoal.focusTopics.map((topic, index) => (
                    <Badge key={index} variant="secondary">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Goals */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Study Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {studyPlan.dailyGoals.map((goal, index) => {
              const isToday = new Date(goal.date).toDateString() === today;
              const isPast = new Date(goal.date) < new Date();

              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    isToday ? 'border-primary bg-primary/5' :
                    isPast ? 'border-muted' : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {new Date(goal.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                        {isToday && <Badge className="ml-2">Today</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {goal.recommendedMinutes} min • {goal.recommendedQuestions.length} questions
                      </div>
                    </div>
                    <div className="text-right">
                      {goal.completionStatus.completed ? (
                        <Badge variant="default">Completed</Badge>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {goal.completionStatus.actualMinutes}/{goal.recommendedMinutes} min
                        </div>
                      )}
                    </div>
                  </div>

                  {goal.focusTopics.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {goal.focusTopics.map((topic, topicIndex) => (
                        <Badge key={topicIndex} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}