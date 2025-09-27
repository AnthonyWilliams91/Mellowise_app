/**
 * Smart Review Queue Component
 * Interactive interface for spaced repetition review system
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { format, differenceInDays } from 'date-fns';
import {
  Brain,
  Clock,
  Target,
  TrendingUp,
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Play,
  Pause,
  Settings,
  BarChart3,
  Lightbulb,
  Star
} from 'lucide-react';

import type {
  ReviewItem,
  ReviewQueue,
  ReviewSession,
  ReviewResponse,
  HintLevel,
  Hint
} from '@/types/review-queue';

// Mock data for demonstration
const MOCK_REVIEW_ITEMS: ReviewItem[] = [
  {
    id: 'review-1',
    questionId: 'q-101',
    userId: 'user-1',
    section: 'logical-reasoning',
    questionType: 'strengthen',
    difficulty: 6,
    incorrectAttempts: 2,
    lastAttempted: new Date('2025-01-19'),
    nextReview: new Date('2025-01-20'),
    interval: 1,
    easeFactor: 2.3,
    masteryLevel: 45,
    priority: 0.8,
    created: new Date('2025-01-15'),
    status: 'pending',
    tags: ['strengthen', 'argument-structure'],
    metadata: {
      originalError: 'confused scope of argument',
      errorPattern: 'scope-shifts',
      conceptTags: ['argument-structure', 'evidence'],
      relatedQuestions: ['q-102', 'q-103'],
      hintLevel: 1,
      timeSpent: 180,
      averageTime: 120,
      improvementTrend: 'improving'
    }
  },
  {
    id: 'review-2',
    questionId: 'q-205',
    userId: 'user-1',
    section: 'reading-comprehension',
    questionType: 'main-point',
    difficulty: 4,
    incorrectAttempts: 1,
    lastAttempted: new Date('2025-01-18'),
    nextReview: new Date('2025-01-20'),
    interval: 2,
    easeFactor: 2.5,
    masteryLevel: 65,
    priority: 0.6,
    created: new Date('2025-01-16'),
    status: 'active',
    tags: ['main-point', 'structure'],
    metadata: {
      originalError: 'focused on details instead of main argument',
      errorPattern: 'detail-focus',
      conceptTags: ['passage-structure', 'main-idea'],
      relatedQuestions: ['q-206', 'q-207'],
      hintLevel: 0,
      timeSpent: 90,
      averageTime: 85,
      improvementTrend: 'stable'
    }
  }
];

interface SmartReviewQueueProps {
  userId: string;
  className?: string;
}

interface ActiveReview {
  item: ReviewItem;
  startTime: Date;
  hintsUsed: number;
  currentHint?: Hint;
  showHint: boolean;
}

export default function SmartReviewQueue({
  userId,
  className = ''
}: SmartReviewQueueProps) {
  // Component state
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>(MOCK_REVIEW_ITEMS);
  const [activeReview, setActiveReview] = useState<ActiveReview | null>(null);
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    correct: 0,
    timeSpent: 0,
    hintsUsed: 0
  });
  const [showSettings, setShowSettings] = useState(false);
  const [sessionSettings, setSessionSettings] = useState({
    maxReviews: 20,
    enableHints: true,
    showProgress: true,
    autoAdvance: false
  });

  // Filtered and sorted items for review
  const dueItems = useMemo(() => {
    const now = new Date();
    return reviewItems
      .filter(item => new Date(item.nextReview) <= now && item.status !== 'mastered')
      .sort((a, b) => b.priority - a.priority)
      .slice(0, sessionSettings.maxReviews);
  }, [reviewItems, sessionSettings.maxReviews]);

  const upcomingItems = useMemo(() => {
    const now = new Date();
    return reviewItems
      .filter(item => new Date(item.nextReview) > now)
      .sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime())
      .slice(0, 10);
  }, [reviewItems]);

  // Start review session
  const startReview = useCallback((item: ReviewItem) => {
    setActiveReview({
      item,
      startTime: new Date(),
      hintsUsed: 0,
      showHint: false
    });
  }, []);

  // End current review
  const endReview = useCallback(() => {
    setActiveReview(null);
  }, []);

  // Show hint for current question
  const showHint = useCallback(async (level: HintLevel) => {
    if (!activeReview) return;

    // Mock hint - in real implementation, would fetch from HintSystemService
    const mockHint: Hint = {
      level,
      title: `Hint ${level + 1}`,
      content: `This is a level ${level} hint for ${activeReview.item.questionType} questions.`,
      type: 'strategy',
      spoilerLevel: level <= 1 ? 'none' : level <= 2 ? 'partial' : 'full',
      nextHintAvailable: level < 3
    };

    setActiveReview(prev => prev ? {
      ...prev,
      currentHint: mockHint,
      showHint: true,
      hintsUsed: Math.max(prev.hintsUsed, level + 1)
    } : null);
  }, [activeReview]);

  // Submit review response
  const submitResponse = useCallback((correct: boolean, confidence: 'low' | 'medium' | 'high') => {
    if (!activeReview) return;

    const timeSpent = (new Date().getTime() - activeReview.startTime.getTime()) / 1000;

    const response: ReviewResponse = {
      quality: correct ? (confidence === 'high' ? 5 : confidence === 'medium' ? 4 : 3) : (confidence === 'high' ? 2 : 1),
      timeSpent,
      hintsUsed: activeReview.hintsUsed,
      confidence,
      timestamp: new Date()
    };

    // Update session stats
    setSessionStats(prev => ({
      reviewed: prev.reviewed + 1,
      correct: prev.correct + (correct ? 1 : 0),
      timeSpent: prev.timeSpent + timeSpent,
      hintsUsed: prev.hintsUsed + activeReview.hintsUsed
    }));

    // Update item (mock - in real implementation would call ReviewQueueManager)
    setReviewItems(prev => prev.map(item =>
      item.id === activeReview.item.id
        ? {
            ...item,
            lastAttempted: new Date(),
            lastReviewed: new Date(),
            nextReview: new Date(Date.now() + (correct ? 2 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)),
            masteryLevel: Math.min(100, item.masteryLevel + (correct ? 10 : -5)),
            incorrectAttempts: correct ? item.incorrectAttempts : item.incorrectAttempts + 1,
            status: item.masteryLevel > 85 ? 'mastered' as const : 'active' as const
          }
        : item
    ));

    // Auto-advance to next item or end session
    if (sessionSettings.autoAdvance && sessionStats.reviewed < dueItems.length - 1) {
      const nextItemIndex = dueItems.findIndex(item => item.id === activeReview.item.id) + 1;
      if (nextItemIndex < dueItems.length) {
        setTimeout(() => startReview(dueItems[nextItemIndex]), 1000);
      } else {
        setTimeout(endReview, 1000);
      }
    } else {
      endReview();
    }
  }, [activeReview, sessionStats, dueItems, sessionSettings.autoAdvance, startReview, endReview]);

  // Calculate session progress
  const sessionProgress = useMemo(() => {
    if (dueItems.length === 0) return 100;
    return Math.round((sessionStats.reviewed / Math.min(dueItems.length, sessionSettings.maxReviews)) * 100);
  }, [sessionStats.reviewed, dueItems.length, sessionSettings.maxReviews]);

  if (activeReview) {
    return (
      <div className={`smart-review-queue review-mode ${className}`}>
        <ActiveReviewCard
          activeReview={activeReview}
          onSubmitResponse={submitResponse}
          onShowHint={showHint}
          onEndReview={endReview}
          sessionStats={sessionStats}
          progress={sessionProgress}
          enableHints={sessionSettings.enableHints}
        />
      </div>
    );
  }

  return (
    <div className={`smart-review-queue ${className} space-y-6`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-7 w-7 text-blue-600" />
            Smart Review Queue
          </h2>
          <p className="text-gray-600">Spaced repetition system for mastering missed questions</p>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {/* Session Settings */}
      {showSettings && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h3 className="font-medium text-gray-900">Session Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Reviews per Session
              </label>
              <input
                type="number"
                min="5"
                max="50"
                value={sessionSettings.maxReviews}
                onChange={(e) => setSessionSettings(prev => ({
                  ...prev,
                  maxReviews: parseInt(e.target.value) || 20
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={sessionSettings.enableHints}
                  onChange={(e) => setSessionSettings(prev => ({
                    ...prev,
                    enableHints: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Enable hints</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={sessionSettings.showProgress}
                  onChange={(e) => setSessionSettings(prev => ({
                    ...prev,
                    showProgress: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Show progress</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={sessionSettings.autoAdvance}
                  onChange={(e) => setSessionSettings(prev => ({
                    ...prev,
                    autoAdvance: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Auto-advance</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Session Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Due Today</p>
              <p className="text-2xl font-bold text-red-600">{dueItems.length}</p>
            </div>
            <Clock className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reviewed Today</p>
              <p className="text-2xl font-bold text-green-600">{sessionStats.reviewed}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accuracy</p>
              <p className="text-2xl font-bold text-blue-600">
                {sessionStats.reviewed > 0 ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100) : 0}%
              </p>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Time Spent</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(sessionStats.timeSpent / 60)}m
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Due Items */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-red-500" />
            Due for Review ({dueItems.length})
          </h3>
          <p className="text-sm text-gray-600">Questions ready for spaced repetition review</p>
        </div>

        <div className="divide-y divide-gray-200">
          {dueItems.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900">All caught up!</p>
              <p className="text-gray-600">No items due for review right now</p>
            </div>
          ) : (
            dueItems.map((item) => (
              <ReviewItemCard
                key={item.id}
                item={item}
                onStartReview={startReview}
              />
            ))
          )}
        </div>
      </div>

      {/* Upcoming Reviews */}
      {upcomingItems.length > 0 && (
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-blue-500" />
              Upcoming Reviews
            </h3>
            <p className="text-sm text-gray-600">Questions scheduled for future review</p>
          </div>

          <div className="divide-y divide-gray-200">
            {upcomingItems.map((item) => (
              <UpcomingReviewCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Review Item Card Component
function ReviewItemCard({
  item,
  onStartReview
}: {
  item: ReviewItem;
  onStartReview: (item: ReviewItem) => void;
}) {
  const daysOverdue = differenceInDays(new Date(), new Date(item.nextReview));
  const priorityColor = item.priority >= 0.8 ? 'red' : item.priority >= 0.6 ? 'yellow' : 'green';

  return (
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${priorityColor}-100 text-${priorityColor}-700`}>
              {item.section.replace('-', ' ').toUpperCase()}
            </span>
            <span className="text-sm text-gray-600">{item.questionType}</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.round(item.difficulty / 2) }).map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{item.masteryLevel}% mastery</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="h-4 w-4" />
              <span>{item.incorrectAttempts} incorrect</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                {daysOverdue > 0 ? `${daysOverdue}d overdue` : 'Due now'}
              </span>
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-600">
            <strong>Last error:</strong> {item.metadata.originalError}
          </div>
        </div>

        <button
          onClick={() => onStartReview(item)}
          className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Review
        </button>
      </div>
    </div>
  );
}

// Active Review Card Component
function ActiveReviewCard({
  activeReview,
  onSubmitResponse,
  onShowHint,
  onEndReview,
  sessionStats,
  progress,
  enableHints
}: {
  activeReview: ActiveReview;
  onSubmitResponse: (correct: boolean, confidence: 'low' | 'medium' | 'high') => void;
  onShowHint: (level: HintLevel) => void;
  onEndReview: () => void;
  sessionStats: any;
  progress: number;
  enableHints: boolean;
}) {
  const [selectedConfidence, setSelectedConfidence] = useState<'low' | 'medium' | 'high'>('medium');

  const handleResponse = (correct: boolean) => {
    onSubmitResponse(correct, selectedConfidence);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg border shadow-lg">
      {/* Progress Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onEndReview}
              className="text-gray-400 hover:text-gray-600"
            >
              ← Back
            </button>
            <div>
              <div className="text-sm text-gray-600">Progress: {progress}%</div>
              <div className="w-48 h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-blue-600 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Reviewed: {sessionStats.reviewed} | Accuracy: {sessionStats.reviewed > 0 ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              {activeReview.item.section.replace('-', ' ').toUpperCase()}
            </span>
            <span className="text-gray-600">{activeReview.item.questionType}</span>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{activeReview.item.masteryLevel}% mastery</span>
            </div>
          </div>
        </div>

        {/* Mock Question Display */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-medium text-gray-900 mb-4">Question #{activeReview.item.questionId}</h3>
          <div className="prose text-gray-700">
            <p>This is where the actual question content would be displayed. In a real implementation, this would fetch the question content based on the questionId.</p>
            <p className="text-sm text-gray-500 mt-4">
              <strong>Previous error:</strong> {activeReview.item.metadata.originalError}
            </p>
          </div>
        </div>

        {/* Hint Display */}
        {activeReview.showHint && activeReview.currentHint && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">{activeReview.currentHint.title}</h4>
                <p className="text-yellow-800 mt-1">{activeReview.currentHint.content}</p>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="space-y-6">
          {/* Hints */}
          {enableHints && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Need help?</h4>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((level) => (
                  <button
                    key={level}
                    onClick={() => onShowHint(level as HintLevel)}
                    disabled={activeReview.hintsUsed > level}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      activeReview.hintsUsed > level
                        ? 'bg-gray-100 text-gray-500 border-gray-200'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <HelpCircle className="h-4 w-4 inline mr-1" />
                    Hint {level + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Confidence Selection */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Confidence Level</h4>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedConfidence(level)}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    selectedConfidence === level
                      ? 'bg-blue-100 text-blue-700 border-blue-300'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Response Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleResponse(false)}
              className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              <XCircle className="h-5 w-5 inline mr-2" />
              Incorrect
            </button>
            <button
              onClick={() => handleResponse(true)}
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              <CheckCircle2 className="h-5 w-5 inline mr-2" />
              Correct
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Upcoming Review Card Component
function UpcomingReviewCard({ item }: { item: ReviewItem }) {
  const daysUntilDue = differenceInDays(new Date(item.nextReview), new Date());

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
            {item.section.replace('-', ' ').toUpperCase()}
          </span>
          <span className="text-sm text-gray-900">{item.questionType}</span>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Target className="h-4 w-4" />
            <span>{item.masteryLevel}%</span>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          {daysUntilDue === 0 ? 'Due today' :
           daysUntilDue === 1 ? 'Due tomorrow' :
           `Due in ${daysUntilDue} days`}
        </div>
      </div>
    </div>
  );
}