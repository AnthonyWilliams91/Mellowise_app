/**
 * MELLOWISE-013: Question Generation Admin Dashboard
 * Comprehensive interface for AI-powered question generation and review
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Sparkles,
  FileText,
  Clock,
  TrendingUp,
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Edit,
  Trash,
  ChevronRight,
  Brain,
  Zap,
  Shield,
  Target
} from 'lucide-react';
import {
  GeneratedQuestion,
  GenerateQuestionRequest,
  GenerationBatch,
  QualityValidation,
  ReviewAction,
  GenerationAnalytics
} from '@/types/question-generation';

export function QuestionGenerationDashboard() {
  const [activeTab, setActiveTab] = useState('generate');
  const [generationInProgress, setGenerationInProgress] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<GenerationBatch | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<GeneratedQuestion | null>(null);
  const [validation, setValidation] = useState<QualityValidation | null>(null);
  const [analytics, setAnalytics] = useState<GenerationAnalytics | null>(null);

  // Generation form state
  const [generateForm, setGenerateForm] = useState<GenerateQuestionRequest>({
    sectionType: 'logical_reasoning',
    difficulty: 5,
    quantity: 5,
    creativity: 0.7,
    formatStrict: true
  });

  // Load mock analytics data
  useEffect(() => {
    loadMockAnalytics();
    loadMockQuestions();
  }, []);

  const loadMockAnalytics = () => {
    setAnalytics({
      periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      periodEnd: new Date(),
      totalGenerated: 245,
      totalApproved: 198,
      totalRejected: 47,
      averageQualityScore: 82,
      validationPassRate: 0.81,
      humanApprovalRate: 0.89,
      averageGenerationTime: 3200,
      averageReviewTime: 45000,
      costPerQuestion: 0.12,
      questionsUsedInPractice: 156,
      averageUserRating: 4.3,
      averageCorrectRate: 0.68,
      bySection: {
        logical_reasoning: {
          generated: 120,
          approved: 102,
          avgQuality: 84,
          avgDifficulty: 5.2
        },
        logic_games: {
          generated: 75,
          approved: 58,
          avgQuality: 78,
          avgDifficulty: 6.1
        },
        reading_comprehension: {
          generated: 50,
          approved: 38,
          avgQuality: 81,
          avgDifficulty: 4.8
        }
      }
    });
  };

  const loadMockQuestions = () => {
    const mockQuestions: GeneratedQuestion[] = [
      {
        id: 'q_001',
        sectionType: 'logical_reasoning',
        difficulty: 5,
        stimulus: 'Recent studies have shown that employees who work from home report higher job satisfaction than those who work in offices. This increased satisfaction correlates with improved productivity metrics. Therefore, companies should adopt permanent remote work policies.',
        question: 'Which one of the following, if true, most weakens the argument?',
        answerChoices: [
          { id: 'a1', label: 'A', text: 'The studies did not account for employee collaboration effectiveness', isCorrect: true },
          { id: 'a2', label: 'B', text: 'Remote work reduces commute time for employees', isCorrect: false },
          { id: 'a3', label: 'C', text: 'Some employees prefer working from offices', isCorrect: false },
          { id: 'a4', label: 'D', text: 'Technology enables effective remote communication', isCorrect: false },
          { id: 'a5', label: 'E', text: 'Office spaces are expensive to maintain', isCorrect: false }
        ],
        correctAnswer: 'a1',
        explanation: 'Answer A weakens the argument by introducing a crucial factor (collaboration) that was not considered in the studies, potentially undermining the conclusion about adopting remote work policies.',
        generationId: 'batch_001',
        modelUsed: 'claude-3-sonnet',
        generatedAt: new Date(),
        generationTime: 2800,
        tokensUsed: { input: 450, output: 320 },
        validationStatus: 'approved',
        humanReviewed: true,
        timesUsed: 23,
        averageTimeToAnswer: 85000,
        averageCorrectRate: 0.65,
        qualityScore: 88
      },
      {
        id: 'q_002',
        sectionType: 'logic_games',
        difficulty: 7,
        stimulus: 'Six students—A, B, C, D, E, and F—must present their projects over three days: Monday, Tuesday, and Wednesday. Each day, exactly two students present. The following conditions apply: A presents before D. B and E cannot present on the same day. C presents on Tuesday.',
        question: 'If F presents on Monday, which one of the following must be true?',
        answerChoices: [
          { id: 'b1', label: 'A', text: 'A presents on Monday', isCorrect: false },
          { id: 'b2', label: 'B', text: 'D presents on Wednesday', isCorrect: true },
          { id: 'b3', label: 'C', text: 'B presents with C', isCorrect: false },
          { id: 'b4', label: 'D', text: 'E presents on Tuesday', isCorrect: false },
          { id: 'b5', label: 'E', text: 'A and B present on the same day', isCorrect: false }
        ],
        correctAnswer: 'b2',
        explanation: 'Given that F presents on Monday and C must present on Tuesday, we need to place A, B, D, and E. Since A must present before D, and with limited slots, D must be on Wednesday.',
        generationId: 'batch_001',
        modelUsed: 'claude-3-opus',
        generatedAt: new Date(),
        generationTime: 3500,
        tokensUsed: { input: 520, output: 410 },
        validationStatus: 'needs_review',
        humanReviewed: false,
        timesUsed: 0,
        qualityScore: 75
      }
    ];
    setGeneratedQuestions(mockQuestions);
  };

  const handleGenerate = async () => {
    setGenerationInProgress(true);
    
    // Simulate generation process
    const batch: GenerationBatch = {
      id: `batch_${Date.now()}`,
      userId: 'admin',
      status: 'processing',
      createdAt: new Date(),
      requests: [generateForm],
      totalQuestions: generateForm.quantity,
      generatedQuestions: [],
      progress: {
        requested: generateForm.quantity,
        generated: 0,
        validated: 0,
        approved: 0,
        rejected: 0
      },
      cost: {
        tokens: { input: 0, output: 0 },
        estimatedCost: generateForm.quantity * 12 // 12 cents per question
      }
    };
    
    setCurrentBatch(batch);

    // Simulate progress
    for (let i = 0; i < generateForm.quantity; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      batch.progress.generated++;
      batch.progress.validated++;
      if (Math.random() > 0.2) {
        batch.progress.approved++;
      } else {
        batch.progress.rejected++;
      }
      setCurrentBatch({ ...batch });
    }

    batch.status = 'completed';
    batch.completedAt = new Date();
    setCurrentBatch(batch);
    setGenerationInProgress(false);

    // Add new questions to list
    loadMockQuestions();
  };

  const handleValidate = (question: GeneratedQuestion) => {
    // Mock validation
    const validation: QualityValidation = {
      questionId: question.id,
      validationRules: [],
      overallScore: question.qualityScore || 75,
      passed: (question.qualityScore || 75) >= 70,
      issues: [],
      suggestions: [],
      formatValid: true,
      difficultyAppropriate: true,
      answerChoicesValid: true,
      explanationClear: true,
      topicRelevant: true,
      noAmbiguity: true,
      factuallyAccurate: true,
      culturallySensitive: true
    };

    if (validation.overallScore < 80) {
      validation.issues.push({
        ruleId: 'quality_score',
        severity: 'warning',
        message: 'Quality score below optimal threshold',
        suggestion: 'Review answer choices for clarity'
      });
    }

    setValidation(validation);
  };

  const handleApprove = (question: GeneratedQuestion) => {
    const updated = generatedQuestions.map(q => 
      q.id === question.id 
        ? { ...q, validationStatus: 'approved' as const, humanReviewed: true }
        : q
    );
    setGeneratedQuestions(updated);
  };

  const handleReject = (question: GeneratedQuestion) => {
    const updated = generatedQuestions.map(q => 
      q.id === question.id 
        ? { ...q, validationStatus: 'rejected' as const, humanReviewed: true }
        : q
    );
    setGeneratedQuestions(updated);
  };

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="review">
            <Eye className="w-4 h-4 mr-2" />
            Review
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Generation Form */}
            <Card>
              <CardHeader>
                <CardTitle>Generate Questions</CardTitle>
                <CardDescription>
                  Configure parameters for AI question generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Section Type</Label>
                  <Select 
                    value={generateForm.sectionType}
                    onValueChange={(value: any) => 
                      setGenerateForm({ ...generateForm, sectionType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="logical_reasoning">Logical Reasoning</SelectItem>
                      <SelectItem value="logic_games">Logic Games</SelectItem>
                      <SelectItem value="reading_comprehension">Reading Comprehension</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Difficulty (1-10)</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[generateForm.difficulty]}
                      onValueChange={([value]) => 
                        setGenerateForm({ ...generateForm, difficulty: value })
                      }
                      min={1}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-12 text-center font-semibold">
                      {generateForm.difficulty}
                    </span>
                  </div>
                </div>

                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={generateForm.quantity}
                    onChange={(e) => 
                      setGenerateForm({ ...generateForm, quantity: parseInt(e.target.value) || 1 })
                    }
                    min={1}
                    max={20}
                  />
                </div>

                <div>
                  <Label>Topic Focus (Optional)</Label>
                  <Input
                    placeholder="e.g., causal reasoning, assumptions"
                    value={generateForm.topicFocus || ''}
                    onChange={(e) => 
                      setGenerateForm({ ...generateForm, topicFocus: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Creativity Level</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[generateForm.creativity || 0.7]}
                      onValueChange={([value]) => 
                        setGenerateForm({ ...generateForm, creativity: value })
                      }
                      min={0}
                      max={1}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">
                      {(generateForm.creativity || 0.7).toFixed(1)}
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={handleGenerate}
                  disabled={generationInProgress}
                  className="w-full"
                >
                  {generationInProgress ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Questions
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generation Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Generation Status</CardTitle>
                <CardDescription>
                  Current batch progress and statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentBatch ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Batch ID</span>
                      <span className="text-sm text-muted-foreground">
                        {currentBatch.id.slice(-8)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>
                          {currentBatch.progress.generated}/{currentBatch.totalQuestions}
                        </span>
                      </div>
                      <Progress 
                        value={(currentBatch.progress.generated / currentBatch.totalQuestions) * 100}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Generated</p>
                        <p className="text-2xl font-bold">
                          {currentBatch.progress.generated}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Validated</p>
                        <p className="text-2xl font-bold">
                          {currentBatch.progress.validated}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Approved</p>
                        <p className="text-2xl font-bold text-green-600">
                          {currentBatch.progress.approved}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Rejected</p>
                        <p className="text-2xl font-bold text-red-600">
                          {currentBatch.progress.rejected}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Estimated Cost</span>
                        <span className="font-semibold">
                          ${(currentBatch.cost.estimatedCost / 100).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tokens Used</span>
                        <span>
                          {currentBatch.cost.tokens.input + currentBatch.cost.tokens.output}
                        </span>
                      </div>
                    </div>

                    {currentBatch.status === 'completed' && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Batch completed successfully!
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No active generation batch
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Generations */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Generations</CardTitle>
              <CardDescription>
                Latest AI-generated questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {generatedQuestions.map((question) => (
                    <div
                      key={question.id}
                      className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedQuestion(question)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {question.sectionType.replace('_', ' ')}
                            </Badge>
                            <Badge variant="secondary">
                              Difficulty: {question.difficulty}
                            </Badge>
                            {question.validationStatus === 'approved' && (
                              <Badge className="bg-green-500">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approved
                              </Badge>
                            )}
                            {question.validationStatus === 'rejected' && (
                              <Badge variant="destructive">
                                <XCircle className="w-3 h-3 mr-1" />
                                Rejected
                              </Badge>
                            )}
                            {question.validationStatus === 'needs_review' && (
                              <Badge variant="warning">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Needs Review
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium line-clamp-2">
                            {question.stimulus.slice(0, 150)}...
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {question.question}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          {selectedQuestion ? (
            <div className="grid gap-6 md:grid-cols-3">
              {/* Question Details */}
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Question Review</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleValidate(selectedQuestion)}
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Validate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600"
                          onClick={() => handleApprove(selectedQuestion)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleReject(selectedQuestion)}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Stimulus</h3>
                      <p className="text-sm">{selectedQuestion.stimulus}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Question</h3>
                      <p className="text-sm">{selectedQuestion.question}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Answer Choices</h3>
                      <RadioGroup value={selectedQuestion.correctAnswer}>
                        {selectedQuestion.answerChoices.map((choice) => (
                          <div key={choice.id} className="flex items-start space-x-2 py-2">
                            <RadioGroupItem value={choice.id} disabled />
                            <Label className="flex items-start space-x-2">
                              <span className="font-semibold">{choice.label}.</span>
                              <span className={choice.isCorrect ? 'text-green-600 font-medium' : ''}>
                                {choice.text}
                              </span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Explanation</h3>
                      <p className="text-sm">{selectedQuestion.explanation}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Validation Results */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">ID</span>
                      <span className="font-mono">{selectedQuestion.id.slice(-8)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Model</span>
                      <span>{selectedQuestion.modelUsed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Generation Time</span>
                      <span>{selectedQuestion.generationTime}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tokens</span>
                      <span>
                        {selectedQuestion.tokensUsed.input + selectedQuestion.tokensUsed.output}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Times Used</span>
                      <span>{selectedQuestion.timesUsed}</span>
                    </div>
                    {selectedQuestion.averageCorrectRate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Success Rate</span>
                        <span>
                          {(selectedQuestion.averageCorrectRate * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {validation && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Validation Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Quality Score</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">
                            {validation.overallScore}
                          </span>
                          <span className="text-sm text-muted-foreground">/100</span>
                        </div>
                      </div>

                      <Progress value={validation.overallScore} />

                      <div className="space-y-2">
                        {validation.formatValid ? (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Format Valid</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm">
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span>Format Issues</span>
                          </div>
                        )}

                        {validation.difficultyAppropriate ? (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Difficulty Appropriate</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                            <span>Difficulty Mismatch</span>
                          </div>
                        )}

                        {validation.noAmbiguity ? (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Clear & Unambiguous</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                            <span>Potential Ambiguity</span>
                          </div>
                        )}
                      </div>

                      {validation.issues.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Issues</h4>
                            <div className="space-y-2">
                              {validation.issues.map((issue, idx) => (
                                <Alert key={idx} variant="destructive">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription>
                                    {issue.message}
                                    {issue.suggestion && (
                                      <p className="mt-1 text-xs">
                                        💡 {issue.suggestion}
                                      </p>
                                    )}
                                  </AlertDescription>
                                </Alert>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4" />
                  <p>Select a question from the Generate tab to review</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <>
              {/* Overview Cards */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Generated</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalGenerated}</div>
                    <p className="text-xs text-muted-foreground">Last 30 days</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Approval Rate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(analytics.humanApprovalRate * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.totalApproved} approved
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Avg Quality Score</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.averageQualityScore}</div>
                    <p className="text-xs text-muted-foreground">Out of 100</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Cost per Question</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${analytics.costPerQuestion.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">Avg generation cost</p>
                  </CardContent>
                </Card>
              </div>

              {/* Section Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Section Performance</CardTitle>
                  <CardDescription>
                    Generation metrics by question type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(analytics.bySection).map(([section, data]) => (
                      <div key={section} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">
                            {section.replace('_', ' ')}
                          </span>
                          <div className="flex gap-4 text-sm">
                            <span>
                              {data.generated} generated
                            </span>
                            <span className="text-green-600">
                              {data.approved} approved
                            </span>
                            <span>
                              Quality: {data.avgQuality}/100
                            </span>
                          </div>
                        </div>
                        <Progress 
                          value={(data.approved / data.generated) * 100}
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Generation Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Avg Generation Time
                      </span>
                      <span className="font-semibold">
                        {(analytics.averageGenerationTime / 1000).toFixed(1)}s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Avg Review Time
                      </span>
                      <span className="font-semibold">
                        {(analytics.averageReviewTime / 60000).toFixed(1)} min
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Validation Pass Rate
                      </span>
                      <span className="font-semibold">
                        {(analytics.validationPassRate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Usage Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Questions in Practice
                      </span>
                      <span className="font-semibold">
                        {analytics.questionsUsedInPractice}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Avg User Rating
                      </span>
                      <span className="font-semibold">
                        {analytics.averageUserRating.toFixed(1)} / 5.0
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Avg Correct Rate
                      </span>
                      <span className="font-semibold">
                        {(analytics.averageCorrectRate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generation Settings</CardTitle>
              <CardDescription>
                Configure AI model and generation parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>AI Model</Label>
                  <Select defaultValue="claude-3-sonnet">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Temperature</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      defaultValue={[0.7]}
                      min={0}
                      max={1}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">0.7</span>
                  </div>
                </div>

                <div>
                  <Label>Max Retries</Label>
                  <Input type="number" defaultValue={3} min={1} max={5} />
                </div>

                <div>
                  <Label>Rate Limit (per minute)</Label>
                  <Input type="number" defaultValue={20} min={5} max={60} />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Quality Thresholds</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Min Quality Score</Label>
                    <Input type="number" defaultValue={70} min={50} max={100} />
                  </div>
                  <div>
                    <Label>Auto-Approve Score</Label>
                    <Input type="number" defaultValue={90} min={80} max={100} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Settings className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}