'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { PracticeTestSession, TestInterfaceState, QuestionPanelState, TestStatus, SectionStatus } from '@/types/practice-test';
import { Clock, Flag, ChevronLeft, ChevronRight, Pause, Play, RotateCcw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

interface PracticeTestInterfaceProps {
  session: PracticeTestSession;
  onAnswerSubmit: (questionId: string, answer: string) => void;
  onFlagQuestion: (questionId: string, flagged: boolean) => void;
  onNavigateToQuestion: (questionIndex: number) => void;
  onPauseTest: () => void;
  onResumeTest: () => void;
  onCompleteSection: () => void;
  onCompleteTest: () => void;
}

export default function PracticeTestInterface({
  session,
  onAnswerSubmit,
  onFlagQuestion,
  onNavigateToQuestion,
  onPauseTest,
  onResumeTest,
  onCompleteSection,
  onCompleteTest
}: PracticeTestInterfaceProps) {
  const [interfaceState, setInterfaceState] = useState<TestInterfaceState>({
    currentView: 'section',
    showTimer: true,
    showProgress: true,
    showFlagged: false,
    isFullscreen: false,
    fontSize: 16,
    theme: 'light',
    sidebarCollapsed: false
  });

  const [questionPanelState, setQuestionPanelState] = useState<QuestionPanelState>({
    currentQuestionIndex: 0,
    selectedAnswer: null,
    isFlagged: false,
    showExplanation: false,
    eliminatedAnswers: new Set(),
    noteText: ''
  });

  const currentSection = session.config.sections[session.currentSectionIndex];
  const currentQuestion = currentSection?.questions[questionPanelState.currentQuestionIndex];
  const sectionTimer = session.timer.sectionTimers[session.currentSectionIndex];

  // Calculate progress
  const totalQuestions = currentSection?.questions.length || 0;
  const answeredQuestions = session.responses.filter(r =>
    r.sectionId === currentSection?.id && r.selectedAnswer !== null
  ).length;
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if current question is answered
  const currentResponse = session.responses.find(r => r.questionId === currentQuestion?.id);
  const isAnswered = currentResponse?.selectedAnswer !== null;

  // Handle answer selection
  const handleAnswerSelect = useCallback((answer: string) => {
    if (!currentQuestion) return;

    setQuestionPanelState(prev => ({
      ...prev,
      selectedAnswer: answer
    }));

    onAnswerSubmit(currentQuestion.id, answer);
  }, [currentQuestion, onAnswerSubmit]);

  // Handle question navigation
  const handleNavigateQuestion = useCallback((direction: 'prev' | 'next') => {
    const newIndex = direction === 'next'
      ? Math.min(questionPanelState.currentQuestionIndex + 1, totalQuestions - 1)
      : Math.max(questionPanelState.currentQuestionIndex - 1, 0);

    setQuestionPanelState(prev => ({
      ...prev,
      currentQuestionIndex: newIndex,
      selectedAnswer: null,
      eliminatedAnswers: new Set()
    }));

    onNavigateToQuestion(newIndex);
  }, [questionPanelState.currentQuestionIndex, totalQuestions, onNavigateToQuestion]);

  // Handle flag toggle
  const handleFlagToggle = useCallback(() => {
    if (!currentQuestion) return;

    const newFlagState = !questionPanelState.isFlagged;
    setQuestionPanelState(prev => ({
      ...prev,
      isFlagged: newFlagState
    }));

    onFlagQuestion(currentQuestion.id, newFlagState);
  }, [currentQuestion, questionPanelState.isFlagged, onFlagQuestion]);

  // Update question panel state when question changes
  useEffect(() => {
    if (currentQuestion) {
      const response = session.responses.find(r => r.questionId === currentQuestion.id);
      setQuestionPanelState(prev => ({
        ...prev,
        selectedAnswer: response?.selectedAnswer || null,
        isFlagged: response?.isFlagged || false
      }));
    }
  }, [currentQuestion, session.responses]);

  // Timer warning effects
  useEffect(() => {
    if (sectionTimer?.remainingTimeSeconds <= 60 && sectionTimer?.remainingTimeSeconds > 0) {
      // Flash warning for last minute
      document.body.style.animation = 'flash 1s infinite';
    } else {
      document.body.style.animation = 'none';
    }

    return () => {
      document.body.style.animation = 'none';
    };
  }, [sectionTimer?.remainingTimeSeconds]);

  if (!currentSection || !currentQuestion) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Loading Test...</h2>
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Test Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Section {currentSection.sectionNumber}: {currentSection.type.replace('_', ' ').toUpperCase()}
              </h1>
              <p className="text-sm text-gray-600">
                Question {questionPanelState.currentQuestionIndex + 1} of {totalQuestions}
                {currentSection.isExperimental && (
                  <Badge variant="secondary" className="ml-2">Experimental</Badge>
                )}
              </p>
            </div>

            {interfaceState.showProgress && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Progress:</span>
                <div className="w-32">
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {answeredQuestions}/{totalQuestions}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Timer */}
            {interfaceState.showTimer && sectionTimer && (
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                sectionTimer.remainingTimeSeconds <= 300
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono text-lg font-semibold">
                  {formatTime(sectionTimer.remainingTimeSeconds)}
                </span>
              </div>
            )}

            {/* Test Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={sectionTimer?.isPaused ? onResumeTest : onPauseTest}
                disabled={session.status !== 'in_progress'}
              >
                {sectionTimer?.isPaused ? (
                  <>
                    <Play className="w-4 h-4 mr-1" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </>
                )}
              </Button>

              {questionPanelState.currentQuestionIndex === totalQuestions - 1 && (
                <Button
                  variant="default"
                  onClick={onCompleteSection}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Complete Section
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Question Panel */}
        <div className="flex-1 p-6">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Question {questionPanelState.currentQuestionIndex + 1}
                </span>
                <Badge variant="outline">
                  Difficulty: {currentQuestion.difficulty}/10
                </Badge>
                {currentQuestion.topic && (
                  <Badge variant="secondary">
                    {currentQuestion.topic.replace('_', ' ')}
                  </Badge>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleFlagToggle}
                className={questionPanelState.isFlagged ? 'text-amber-600' : 'text-gray-400'}
              >
                <Flag className={`w-4 h-4 ${questionPanelState.isFlagged ? 'fill-current' : ''}`} />
              </Button>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Question Content */}
              <div className="prose max-w-none">
                <p className="text-lg leading-relaxed text-gray-900">
                  {currentQuestion.content}
                </p>
              </div>

              {/* Answer Choices */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const letter = String.fromCharCode(65 + index); // A, B, C, D, E
                  const isSelected = questionPanelState.selectedAnswer === letter;
                  const isEliminated = questionPanelState.eliminatedAnswers.has(letter);

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(letter)}
                      disabled={isEliminated}
                      className={`w-full p-4 text-left border rounded-lg transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : isEliminated
                            ? 'border-gray-200 bg-gray-50 opacity-50 line-through'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 text-gray-700'
                        }`}>
                          {letter}
                        </span>
                        <span className="text-gray-900 leading-relaxed">
                          {option}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Navigation Sidebar */}
        {!interfaceState.sidebarCollapsed && (
          <div className="w-80 border-l border-gray-200 bg-white p-6">
            <div className="space-y-6">
              {/* Section Overview */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Section Overview</h3>
                <div className="grid grid-cols-5 gap-2">
                  {currentSection.questions.map((q, index) => {
                    const response = session.responses.find(r => r.questionId === q.id);
                    const isCurrentQuestion = index === questionPanelState.currentQuestionIndex;
                    const isAnswered = response?.selectedAnswer !== null;
                    const isFlagged = response?.isFlagged || false;

                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          setQuestionPanelState(prev => ({
                            ...prev,
                            currentQuestionIndex: index
                          }));
                          onNavigateToQuestion(index);
                        }}
                        className={`relative w-10 h-10 text-sm font-medium border rounded-lg transition-all ${
                          isCurrentQuestion
                            ? 'border-blue-500 bg-blue-500 text-white ring-2 ring-blue-200'
                            : isAnswered
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {index + 1}
                        {isFlagged && (
                          <Flag className="absolute -top-1 -right-1 w-3 h-3 text-amber-500 fill-current" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Quick Stats */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Quick Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Answered:</span>
                    <span className="font-medium">{answeredQuestions}/{totalQuestions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Flagged:</span>
                    <span className="font-medium">
                      {session.responses.filter(r => r.sectionId === currentSection.id && r.isFlagged).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Remaining:</span>
                    <span className={`font-medium ${
                      (sectionTimer?.remainingTimeSeconds || 0) <= 300 ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {sectionTimer ? formatTime(sectionTimer.remainingTimeSeconds) : '--:--'}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Navigation Controls */}
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigateQuestion('prev')}
                    disabled={questionPanelState.currentQuestionIndex === 0}
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigateQuestion('next')}
                    disabled={questionPanelState.currentQuestionIndex === totalQuestions - 1}
                    className="flex-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                {/* Show flagged questions toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInterfaceState(prev => ({
                    ...prev,
                    showFlagged: !prev.showFlagged
                  }))}
                  className="w-full justify-start"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  {interfaceState.showFlagged ? 'Hide' : 'Show'} Flagged Questions
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Warning Overlays */}
      {sectionTimer?.remainingTimeSeconds === 300 && ( // 5-minute warning
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">5 Minutes Remaining</h3>
              <p className="text-gray-600 mb-4">
                You have 5 minutes left in this section. Make sure to answer all questions.
              </p>
              <Button onClick={() => {}}>Continue</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}