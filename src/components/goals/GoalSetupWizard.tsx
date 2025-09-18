/**
 * MELLOWISE-016: Goal Setup Wizard Component
 * Guided goal creation with intelligent defaults and validation
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Target,
  Calendar,
  Clock,
  Brain,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import type { CreateGoalRequest } from '@/types/goals';

interface GoalSetupWizardProps {
  onComplete: (goal: CreateGoalRequest) => void;
  onCancel?: () => void;
  className?: string;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

export function GoalSetupWizard({ onComplete, onCancel, className }: GoalSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [goalData, setGoalData] = useState<Partial<CreateGoalRequest>>({
    studyHoursPerWeek: 15,
    preferredStudyTimes: ['evening'],
    sectionPriorities: {
      logicalReasoning: 1,
      logicGames: 1,
      readingComprehension: 1
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps: WizardStep[] = [
    {
      id: 'target',
      title: 'Set Your Target',
      description: 'What LSAT score are you aiming for?',
      component: TargetScoreStep
    },
    {
      id: 'timeline',
      title: 'Choose Timeline',
      description: 'When do you plan to take the LSAT?',
      component: TimelineStep
    },
    {
      id: 'schedule',
      title: 'Study Schedule',
      description: 'How much time can you dedicate to studying?',
      component: ScheduleStep
    },
    {
      id: 'priorities',
      title: 'Section Focus',
      description: 'Which sections need the most attention?',
      component: PrioritiesStep
    },
    {
      id: 'review',
      title: 'Review & Create',
      description: 'Review your goal and create your study plan',
      component: ReviewStep
    }
  ];

  const currentStepData = steps[currentStep];
  const StepComponent = currentStepData.component;

  const updateGoalData = (updates: Partial<CreateGoalRequest>) => {
    setGoalData(prev => ({ ...prev, ...updates }));
    setErrors({}); // Clear errors when data changes
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Target Score
        if (!goalData.targetScore) {
          newErrors.targetScore = 'Target score is required';
        } else if (goalData.targetScore < 120 || goalData.targetScore > 180) {
          newErrors.targetScore = 'Target score must be between 120 and 180';
        }
        break;

      case 1: // Timeline
        if (!goalData.targetDate) {
          newErrors.targetDate = 'Target date is required';
        } else {
          const targetDate = new Date(goalData.targetDate);
          const minDate = new Date();
          minDate.setDate(minDate.getDate() + 30); // At least 30 days from now

          if (targetDate < minDate) {
            newErrors.targetDate = 'Target date must be at least 30 days from now';
          }
        }
        break;

      case 2: // Schedule
        if (!goalData.studyHoursPerWeek || goalData.studyHoursPerWeek < 1) {
          newErrors.studyHoursPerWeek = 'Study hours per week must be at least 1';
        } else if (goalData.studyHoursPerWeek > 60) {
          newErrors.studyHoursPerWeek = 'Study hours per week cannot exceed 60';
        }

        if (!goalData.preferredStudyTimes || goalData.preferredStudyTimes.length === 0) {
          newErrors.preferredStudyTimes = 'Please select at least one preferred study time';
        }
        break;

      case 3: // Priorities
        const priorities = goalData.sectionPriorities;
        if (!priorities || (priorities.logicalReasoning + priorities.logicGames + priorities.readingComprehension) === 0) {
          newErrors.sectionPriorities = 'Please set priorities for at least one section';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      await onComplete(goalData as CreateGoalRequest);
    } catch (error) {
      console.error('Goal creation failed:', error);
      setErrors({ submit: 'Failed to create goal. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Create Your LSAT Goal</h2>
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="p-2 bg-primary/10 rounded-full mr-3">
              <Target className="h-5 w-5 text-primary" />
            </div>
            {currentStepData.title}
          </CardTitle>
          <CardDescription>{currentStepData.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <StepComponent
            data={goalData}
            updateData={updateGoalData}
            errors={errors}
          />

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={currentStep === 0 ? onCancel : handlePrevious}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 0 ? 'Cancel' : 'Previous'}
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext} className="flex items-center">
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Create Goal
                  </>
                )}
              </Button>
            )}
          </div>

          {errors.submit && (
            <div className="flex items-center text-destructive text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              {errors.submit}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step Indicators */}
      <div className="flex justify-center mt-6 space-x-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`h-2 w-8 rounded-full transition-colors ${
              index <= currentStep ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Step Components

function TargetScoreStep({ data, updateData, errors }: any) {
  const [customScore, setCustomScore] = useState(data.targetScore?.toString() || '');

  const commonTargets = [
    { score: 160, description: 'Good Law Schools', percentile: '80th' },
    { score: 165, description: 'Top Law Schools', percentile: '92nd' },
    { score: 170, description: 'Elite Law Schools', percentile: '97th' },
    { score: 175, description: 'Top 3 Law Schools', percentile: '99th+' }
  ];

  const handleScoreSelect = (score: number) => {
    setCustomScore(score.toString());
    updateData({ targetScore: score });
  };

  const handleCustomScore = (value: string) => {
    setCustomScore(value);
    const score = parseInt(value);
    if (!isNaN(score)) {
      updateData({ targetScore: score });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {commonTargets.map((target) => (
          <Card
            key={target.score}
            className={`cursor-pointer transition-colors ${
              data.targetScore === target.score
                ? 'border-primary bg-primary/5'
                : 'hover:border-primary/50'
            }`}
            onClick={() => handleScoreSelect(target.score)}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{target.score}</div>
                <div className="text-sm font-medium">{target.description}</div>
                <div className="text-xs text-muted-foreground">{target.percentile} percentile</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom-score">Custom Target Score</Label>
        <Input
          id="custom-score"
          type="number"
          min="120"
          max="180"
          value={customScore}
          onChange={(e) => handleCustomScore(e.target.value)}
          placeholder="Enter your target score (120-180)"
        />
        {errors.targetScore && (
          <p className="text-sm text-destructive">{errors.targetScore}</p>
        )}
      </div>

      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
          <div>
            <p className="text-sm font-medium text-blue-900">Score Selection Tips</p>
            <p className="text-xs text-blue-700 mt-1">
              Choose a target that's challenging but achievable. Most students improve 10-15 points
              with dedicated study. Consider your timeline and current skill level.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineStep({ data, updateData, errors }: any) {
  const testDates = [
    { date: '2024-06-15', month: 'June', description: 'Summer Test' },
    { date: '2024-08-24', month: 'August', description: 'Fall Prep' },
    { date: '2024-10-12', month: 'October', description: 'Fall Test' },
    { date: '2024-12-14', month: 'December', description: 'Winter Test' }
  ];

  const calculateStudyWeeks = (targetDate: string) => {
    const weeks = Math.ceil((new Date(targetDate).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000));
    return Math.max(0, weeks);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testDates.map((testDate) => {
          const weeks = calculateStudyWeeks(testDate.date);
          const isRecommended = weeks >= 12 && weeks <= 26; // 3-6 months is ideal

          return (
            <Card
              key={testDate.date}
              className={`cursor-pointer transition-colors ${
                data.targetDate === testDate.date
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-primary/50'
              } ${isRecommended ? 'ring-2 ring-green-200' : ''}`}
              onClick={() => updateData({ targetDate: testDate.date })}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-lg font-bold">{testDate.month}</div>
                  <div className="text-sm text-muted-foreground">{testDate.description}</div>
                  <div className="text-xs mt-2">
                    <Badge variant={isRecommended ? "default" : "secondary"}>
                      {weeks} weeks to study
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom-date">Custom Test Date</Label>
        <Input
          id="custom-date"
          type="date"
          value={data.targetDate || ''}
          onChange={(e) => updateData({ targetDate: e.target.value })}
          min={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
        />
        {errors.targetDate && (
          <p className="text-sm text-destructive">{errors.targetDate}</p>
        )}
      </div>

      {data.targetDate && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-900">Study Timeline</p>
              <p className="text-xs text-green-700 mt-1">
                You have {calculateStudyWeeks(data.targetDate)} weeks to prepare.
                {calculateStudyWeeks(data.targetDate) < 12 && ' This is a tight timeline - consider increasing study intensity.'}
                {calculateStudyWeeks(data.targetDate) >= 12 && calculateStudyWeeks(data.targetDate) <= 26 && ' This gives you a good amount of time to prepare thoroughly.'}
                {calculateStudyWeeks(data.targetDate) > 26 && ' You have plenty of time - consider a structured long-term approach.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScheduleStep({ data, updateData, errors }: any) {
  const studyTimeOptions = [
    { hours: 5, description: 'Light Study', commitment: 'Casual learner' },
    { hours: 10, description: 'Moderate Study', commitment: 'Balanced approach' },
    { hours: 15, description: 'Intensive Study', commitment: 'Serious preparation' },
    { hours: 20, description: 'Full-time Study', commitment: 'Maximum effort' }
  ];

  const timeSlots = [
    { id: 'morning', label: 'Morning (6-11 AM)', icon: '🌅' },
    { id: 'afternoon', label: 'Afternoon (12-5 PM)', icon: '☀️' },
    { id: 'evening', label: 'Evening (6-10 PM)', icon: '🌆' },
    { id: 'night', label: 'Night (11 PM+)', icon: '🌙' }
  ];

  const toggleTimeSlot = (slotId: string) => {
    const current = data.preferredStudyTimes || [];
    const updated = current.includes(slotId)
      ? current.filter((id: string) => id !== slotId)
      : [...current, slotId];
    updateData({ preferredStudyTimes: updated });
  };

  return (
    <div className="space-y-6">
      {/* Study Hours per Week */}
      <div className="space-y-4">
        <Label>Weekly Study Hours</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {studyTimeOptions.map((option) => (
            <Card
              key={option.hours}
              className={`cursor-pointer transition-colors ${
                data.studyHoursPerWeek === option.hours
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => updateData({ studyHoursPerWeek: option.hours })}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-xl font-bold">{option.hours} hrs/week</div>
                  <div className="text-sm font-medium">{option.description}</div>
                  <div className="text-xs text-muted-foreground">{option.commitment}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Hours Slider */}
        <div className="space-y-2">
          <Label>Custom Hours: {data.studyHoursPerWeek || 15} per week</Label>
          <Slider
            value={[data.studyHoursPerWeek || 15]}
            onValueChange={(value) => updateData({ studyHoursPerWeek: value[0] })}
            max={40}
            min={1}
            step={1}
            className="w-full"
          />
        </div>

        {errors.studyHoursPerWeek && (
          <p className="text-sm text-destructive">{errors.studyHoursPerWeek}</p>
        )}
      </div>

      {/* Preferred Study Times */}
      <div className="space-y-4">
        <Label>Preferred Study Times (select all that apply)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {timeSlots.map((slot) => (
            <Card
              key={slot.id}
              className={`cursor-pointer transition-colors ${
                data.preferredStudyTimes?.includes(slot.id)
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => toggleTimeSlot(slot.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{slot.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{slot.label}</div>
                    </div>
                  </div>
                  <Checkbox
                    checked={data.preferredStudyTimes?.includes(slot.id) || false}
                    readOnly
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {errors.preferredStudyTimes && (
          <p className="text-sm text-destructive">{errors.preferredStudyTimes}</p>
        )}
      </div>
    </div>
  );
}

function PrioritiesStep({ data, updateData, errors }: any) {
  const sections = [
    {
      id: 'logicalReasoning',
      name: 'Logical Reasoning',
      description: 'Arguments, assumptions, and logical patterns',
      questions: '~26 questions',
      weight: '50% of score'
    },
    {
      id: 'logicGames',
      name: 'Logic Games',
      description: 'Analytical reasoning and rule-based puzzles',
      questions: '~23 questions',
      weight: '25% of score'
    },
    {
      id: 'readingComprehension',
      name: 'Reading Comprehension',
      description: 'Passage analysis and inference questions',
      questions: '~27 questions',
      weight: '25% of score'
    }
  ];

  const priorityLabels = ['Low Priority', 'Medium Priority', 'High Priority'];

  const updatePriority = (section: string, priority: number) => {
    const current = data.sectionPriorities || {};
    updateData({
      sectionPriorities: {
        ...current,
        [section]: priority
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {sections.map((section) => {
          const priority = data.sectionPriorities?.[section.id] || 1;

          return (
            <Card key={section.id}>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{section.name}</h4>
                      <p className="text-sm text-muted-foreground">{section.description}</p>
                      <div className="flex space-x-4 text-xs text-muted-foreground mt-1">
                        <span>{section.questions}</span>
                        <span>{section.weight}</span>
                      </div>
                    </div>
                    <Badge variant={priority === 2 ? "default" : "secondary"}>
                      {priorityLabels[priority]}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Priority Level</Label>
                    <Slider
                      value={[priority]}
                      onValueChange={(value) => updatePriority(section.id, value[0])}
                      max={2}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {errors.sectionPriorities && (
        <p className="text-sm text-destructive">{errors.sectionPriorities}</p>
      )}

      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <Brain className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
          <div>
            <p className="text-sm font-medium text-blue-900">Priority Recommendations</p>
            <p className="text-xs text-blue-700 mt-1">
              Logical Reasoning typically offers the best score improvement opportunity due to its weight.
              Logic Games can provide quick wins with pattern recognition. Reading Comprehension
              improvements tend to be more gradual.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ data, errors }: any) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateStudyWeeks = () => {
    if (!data.targetDate) return 0;
    return Math.ceil((new Date(data.targetDate).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000));
  };

  const getSectionPriorityLabel = (priority: number) => {
    return ['Low', 'Medium', 'High'][priority] || 'Medium';
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Review Your Goal</h3>
        <p className="text-sm text-muted-foreground">
          Make sure everything looks correct before creating your personalized study plan
        </p>
      </div>

      <div className="grid gap-4">
        {/* Target Score */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="h-5 w-5 text-primary mr-3" />
                <div>
                  <p className="font-medium">Target Score</p>
                  <p className="text-sm text-muted-foreground">Your LSAT goal</p>
                </div>
              </div>
              <div className="text-2xl font-bold">{data.targetScore}</div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-primary mr-3" />
                <div>
                  <p className="font-medium">Test Date</p>
                  <p className="text-sm text-muted-foreground">{calculateStudyWeeks()} weeks to prepare</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{data.targetDate ? formatDate(data.targetDate) : 'Not set'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Schedule */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-primary mr-3" />
                <div>
                  <p className="font-medium">Study Schedule</p>
                  <p className="text-sm text-muted-foreground">
                    {data.preferredStudyTimes?.length || 0} time slots selected
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{data.studyHoursPerWeek} hrs/week</div>
                <div className="text-xs text-muted-foreground">
                  {data.preferredStudyTimes?.join(', ') || 'None selected'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Priorities */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center mb-3">
              <TrendingUp className="h-5 w-5 text-primary mr-3" />
              <div>
                <p className="font-medium">Section Priorities</p>
                <p className="text-sm text-muted-foreground">Focus areas for your study plan</p>
              </div>
            </div>
            <div className="space-y-2">
              {Object.entries(data.sectionPriorities || {}).map(([section, priority]) => (
                <div key={section} className="flex items-center justify-between">
                  <span className="text-sm capitalize">
                    {section.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <Badge variant={priority === 2 ? "default" : "secondary"}>
                    {getSectionPriorityLabel(priority as number)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-start">
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
          <div>
            <p className="text-sm font-medium text-green-900">Ready to Create Your Goal</p>
            <p className="text-xs text-green-700 mt-1">
              Your personalized study plan will be generated with AI-powered recommendations,
              progress tracking, and adaptive milestones based on your preferences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}