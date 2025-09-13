# Dynamic Difficulty Adjustment Architecture
## MELLOWISE-010: FSRS-Inspired Adaptive Learning System

**Architect**: Winston  
**Version**: 1.0  
**Date**: January 12, 2025  
**Epic**: Epic 2 - AI & Personalization Features  

---

## Executive Summary

This document defines the architecture for MELLOWISE-010's Dynamic Difficulty Adjustment (DDA) system, implementing an FSRS-inspired algorithm for practice modes while preserving competitive integrity in Survival Mode. The system maintains optimal challenge levels (70-80% success rate) through intelligent difficulty adaptation based on user performance patterns and learning style profiles.

## Architecture Principles

### 1. **Mode Separation Architecture**
- **Practice Mode**: Dynamic difficulty with FSRS-inspired adaptation
- **Survival Mode**: Static competitive difficulty for fair leaderboards
- **Clear UI/UX distinction** between adaptive and competitive modes

### 2. **FSRS Algorithm Adaptation**
- **Card Difficulty**: Per-question inherent difficulty (1-10 scale)
- **User Stability**: Topic-specific performance stability tracking
- **Confidence Intervals**: Prevents dramatic difficulty swings
- **Time Decay**: Performance confidence decreases over time
- **Success Rate Targeting**: Maintains 70-80% optimal challenge zone

### 3. **Topic-Specific Intelligence**
- **Per-Category Tracking**: Logic Games, Reading Comprehension, Logical Reasoning
- **Independent Difficulty States**: Each topic maintains separate difficulty profile
- **Cross-Topic Learning**: Performance insights inform other categories

---

## Database Schema Extensions

### 1. Practice Difficulty Tracking

```sql
-- Practice difficulty state per user per topic
CREATE TABLE practice_difficulty_state (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  topic_type TEXT NOT NULL CHECK (topic_type IN ('logical_reasoning', 'logic_games', 'reading_comprehension')),
  
  -- FSRS-inspired difficulty tracking
  current_difficulty DECIMAL(4,2) DEFAULT 5.0 CHECK (current_difficulty >= 1.0 AND current_difficulty <= 10.0),
  stability_score DECIMAL(4,2) DEFAULT 50.0 CHECK (stability_score >= 0.0 AND stability_score <= 100.0),
  confidence_interval DECIMAL(3,2) DEFAULT 2.0 CHECK (confidence_interval >= 0.5 AND confidence_interval <= 5.0),
  
  -- Performance tracking
  success_rate_target DECIMAL(3,2) DEFAULT 0.75 CHECK (success_rate_target >= 0.5 AND success_rate_target <= 0.9),
  current_success_rate DECIMAL(3,2) DEFAULT 0.5,
  sessions_analyzed INTEGER DEFAULT 0,
  questions_attempted INTEGER DEFAULT 0,
  
  -- Manual overrides
  manual_difficulty_override DECIMAL(4,2) NULL,
  manual_override_enabled BOOLEAN DEFAULT false,
  manual_override_set_at TIMESTAMP WITH TIME ZONE NULL,
  
  -- Timestamps
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_session_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Practice session difficulty tracking
CREATE TABLE practice_session_difficulty (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  topic_type TEXT NOT NULL,
  
  -- Session difficulty metrics
  start_difficulty DECIMAL(4,2) NOT NULL,
  end_difficulty DECIMAL(4,2) NOT NULL,
  avg_question_difficulty DECIMAL(4,2) NOT NULL,
  difficulty_adjustments_made INTEGER DEFAULT 0,
  
  -- Session performance
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  session_success_rate DECIMAL(3,2) DEFAULT 0.0,
  avg_response_time INTEGER NULL, -- milliseconds
  
  -- FSRS algorithm data
  stability_change DECIMAL(4,2) DEFAULT 0.0,
  confidence_change DECIMAL(3,2) DEFAULT 0.0,
  algorithm_confidence DECIMAL(3,2) DEFAULT 50.0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Practice question difficulty adjustments log
CREATE TABLE practice_difficulty_adjustments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES public.game_sessions(id) ON DELETE SET NULL,
  topic_type TEXT NOT NULL,
  
  -- Adjustment details
  previous_difficulty DECIMAL(4,2) NOT NULL,
  new_difficulty DECIMAL(4,2) NOT NULL,
  adjustment_reason TEXT NOT NULL, -- 'performance_based', 'manual_override', 'stability_correction'
  trigger_performance_rate DECIMAL(3,2) NULL,
  
  -- Algorithm confidence
  algorithm_confidence DECIMAL(3,2) DEFAULT 50.0,
  stability_factor DECIMAL(4,2) DEFAULT 0.0,
  
  -- Context data
  questions_in_context INTEGER DEFAULT 1,
  adjustment_magnitude DECIMAL(3,2) NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 2. Enhanced Question Attempts Tracking

```sql
-- Add practice mode tracking to existing question_attempts
ALTER TABLE public.question_attempts 
ADD COLUMN practice_difficulty_at_attempt DECIMAL(4,2) NULL,
ADD COLUMN stability_factor_at_attempt DECIMAL(4,2) NULL,
ADD COLUMN expected_success_rate DECIMAL(3,2) NULL,
ADD COLUMN difficulty_adjustment_applied BOOLEAN DEFAULT false;

-- Create composite index for practice mode queries
CREATE INDEX idx_question_attempts_practice_tracking 
ON public.question_attempts(user_id, attempted_at DESC) 
WHERE practice_difficulty_at_attempt IS NOT NULL;
```

### 3. Indexes and Performance Optimization

```sql
-- Performance indexes for difficulty system
CREATE INDEX idx_practice_difficulty_state_user_topic 
ON practice_difficulty_state(user_id, topic_type);

CREATE INDEX idx_practice_difficulty_state_last_session 
ON practice_difficulty_state(user_id, last_session_at DESC);

CREATE INDEX idx_practice_session_difficulty_user_topic_date 
ON practice_session_difficulty(user_id, topic_type, created_at DESC);

CREATE INDEX idx_practice_difficulty_adjustments_user_topic 
ON practice_difficulty_adjustments(user_id, topic_type, created_at DESC);

-- Support for difficulty range queries
CREATE INDEX idx_questions_practice_difficulty_range 
ON public.questions(question_type, difficulty) 
WHERE is_active = true;
```

---

## FSRS-Inspired Algorithm Architecture

### 1. **Core Algorithm Engine**

```typescript
interface FSRSDifficultyEngine {
  // FSRS core parameters
  stability: number           // Memory retention strength (0-100)
  difficulty: number          // Current difficulty level (1-10)  
  confidence: number          // Algorithm confidence (0-100)
  successRate: number         // Target success rate (0.7-0.8)
  
  // Adjustment methods
  calculateNextDifficulty(performance: PerformanceData): number
  updateStability(results: QuestionResult[]): number
  adjustConfidenceInterval(variance: number): number
  getOptimalQuestionDifficulty(): number
}
```

### 2. **Difficulty Calculation Algorithm**

The FSRS-inspired algorithm uses the following core formula:

```typescript
// Core difficulty adjustment formula
function calculateDifficultyAdjustment(
  currentDifficulty: number,
  recentSuccessRate: number,
  targetSuccessRate: number,
  stabilityScore: number,
  confidenceInterval: number
): number {
  // Base adjustment from performance delta
  const performanceDelta = recentSuccessRate - targetSuccessRate
  
  // Stability modifier (higher stability = smaller adjustments)
  const stabilityModifier = Math.min(1.0, stabilityScore / 100)
  
  // Confidence interval constraint (prevents wild swings)
  const maxAdjustment = confidenceInterval * 0.5
  
  // Calculate raw adjustment
  const rawAdjustment = performanceDelta * -3.0 // Inverse relationship
  
  // Apply constraints and stability
  const constrainedAdjustment = Math.max(
    -maxAdjustment,
    Math.min(maxAdjustment, rawAdjustment * (1 - stabilityModifier))
  )
  
  // Ensure result stays within bounds
  return Math.max(1.0, Math.min(10.0, currentDifficulty + constrainedAdjustment))
}
```

### 3. **Stability Score Calculation**

```typescript
function calculateStabilityScore(
  sessionsAnalyzed: number,
  performanceVariance: number,
  timeDecayFactor: number
): number {
  // Base stability from consistent performance
  const baseStability = Math.max(0, 100 - (performanceVariance * 200))
  
  // Experience modifier (more sessions = higher stability)
  const experienceModifier = Math.min(1.0, sessionsAnalyzed / 20)
  
  // Time decay (performance confidence decreases over time)
  const timeAdjustedStability = baseStability * timeDecayFactor
  
  return timeAdjustedStability * experienceModifier
}
```

---

## API Architecture

### 1. **Practice Mode Endpoints**

```typescript
// Initialize practice session with difficulty
POST /api/practice/sessions/start
{
  topicType: 'logical_reasoning' | 'logic_games' | 'reading_comprehension',
  manualDifficulty?: number, // Optional manual override
  targetSuccessRate?: number // Optional target adjustment
}

// Get next question with dynamic difficulty
GET /api/practice/questions/next?sessionId={sessionId}&topicType={topicType}
Response: {
  question: Question,
  difficultyLevel: number,
  expectedSuccessRate: number,
  algorithmConfidence: number
}

// Submit answer and get difficulty adjustment
POST /api/practice/questions/{questionId}/answer
{
  sessionId: string,
  selectedAnswer: string,
  responseTime: number
}
Response: {
  isCorrect: boolean,
  difficultyAdjustment: number,
  newDifficultyLevel: number,
  algorithmExplanation: string
}

// Manual difficulty override
POST /api/practice/difficulty/override
{
  topicType: string,
  newDifficulty: number,
  reason: string
}
```

### 2. **Difficulty Analytics Endpoints**

```typescript
// Get user's difficulty progression
GET /api/practice/analytics/difficulty-progression?topicType={topicType}&days={days}
Response: {
  difficultyHistory: DifficultyPoint[],
  stabilityTrend: number[],
  successRateHistory: number[],
  algorithmPerformance: AlgorithmMetrics
}

// Get current difficulty state
GET /api/practice/difficulty/current
Response: {
  topics: {
    [topicType]: {
      currentDifficulty: number,
      stabilityScore: number,
      confidenceInterval: number,
      targetSuccessRate: number,
      recentPerformance: number,
      recommendedSessionLength: number
    }
  }
}
```

### 3. **Integration with Learning Style Profiles**

```typescript
// Enhanced profile service with difficulty preferences
interface LearningStyleDifficultyProfile {
  learningStyle: LearningStyleKey,
  difficultyPreferences: {
    preferredStartingDifficulty: number,
    adaptationSpeed: 'conservative' | 'moderate' | 'aggressive',
    targetSuccessRate: number,
    confidenceThreshold: number
  },
  topicAffinities: {
    [topicType]: {
      naturalDifficulty: number,
      learningSpeed: number,
      stabilityFactor: number
    }
  }
}
```

---

## Service Layer Architecture

### 1. **Dynamic Difficulty Service**

```typescript
// /src/lib/practice/dynamic-difficulty-service.ts
export class DynamicDifficultyService {
  private fsrsEngine: FSRSDifficultyEngine
  private profileService: LearningProfileService
  private analyticsService: AnalyticsService
  
  // Core difficulty management
  async initializeUserDifficulty(userId: string, topicType: string): Promise<DifficultyState>
  async calculateSessionDifficulty(userId: string, sessionData: SessionContext): Promise<number>
  async updateDifficultyAfterAnswer(answerData: AnswerSubmission): Promise<DifficultyAdjustment>
  
  // Manual overrides
  async setManualDifficultyOverride(userId: string, topicType: string, difficulty: number): Promise<void>
  async removeManualOverride(userId: string, topicType: string): Promise<void>
  
  // Analytics and insights
  async getDifficultyProgression(userId: string, topicType: string): Promise<DifficultyProgression>
  async getOptimalSessionRecommendations(userId: string): Promise<SessionRecommendations>
}
```

### 2. **FSRS Algorithm Engine**

```typescript
// /src/lib/practice/fsrs-engine.ts
export class FSRSAlgorithmEngine {
  private readonly DEFAULT_DIFFICULTY = 5.0
  private readonly TARGET_SUCCESS_RATE = 0.75
  private readonly MIN_CONFIDENCE_THRESHOLD = 0.3
  
  // Core FSRS calculations
  calculateNextDifficulty(context: DifficultyContext): DifficultyCalculation
  updateStabilityScore(performanceHistory: PerformancePoint[]): number
  adjustConfidenceInterval(varianceData: VarianceMetrics): number
  
  // Question selection optimization
  selectOptimalQuestionDifficulty(availableDifficulties: number[], targetDifficulty: number): number
  predictPerformanceProbability(questionDifficulty: number, userState: UserDifficultyState): number
}
```

### 3. **Practice Session Manager**

```typescript
// /src/lib/practice/session-manager.ts
export class PracticeSessionManager {
  private difficultyService: DynamicDifficultyService
  private questionService: QuestionService
  private sessionAnalytics: SessionAnalyticsService
  
  // Session lifecycle
  async startPracticeSession(config: PracticeSessionConfig): Promise<PracticeSession>
  async getNextQuestion(sessionId: string): Promise<QuestionWithDifficulty>
  async submitAnswer(submission: AnswerSubmission): Promise<AnswerResult>
  async endSession(sessionId: string): Promise<SessionSummary>
  
  // Real-time difficulty adjustment
  async adjustDifficultyMidSession(sessionId: string, trigger: AdjustmentTrigger): Promise<void>
  async provideSessionGuidance(sessionId: string): Promise<SessionGuidance>
}
```

---

## UI/UX Integration Architecture

### 1. **Practice Mode Distinction**

```typescript
// Clear visual separation between modes
interface PracticeModeUI {
  modeIndicator: 'ADAPTIVE_PRACTICE' | 'COMPETITIVE_SURVIVAL'
  difficultyDisplay: {
    currentLevel: number,
    trend: 'increasing' | 'stable' | 'decreasing',
    adaptationExplanation: string
  }
  confidenceIndicator: {
    algorithmConfidence: number,
    stabilityScore: number,
    recommendedAction: string
  }
}
```

### 2. **Difficulty Visualization Components**

```typescript
// /src/components/practice/DifficultyTracker.tsx
interface DifficultyTrackerProps {
  currentDifficulty: number
  targetSuccessRate: number
  recentPerformance: number
  stabilityScore: number
  showAdjustmentHistory: boolean
  allowManualOverride: boolean
}

// /src/components/practice/AdaptiveDifficultyCard.tsx  
interface AdaptiveDifficultyCardProps {
  questionDifficulty: number
  expectedSuccessRate: number
  algorithmConfidence: number
  previousAdjustments: DifficultyAdjustment[]
}
```

### 3. **Manual Override Interface**

```typescript
// /src/components/practice/DifficultyOverridePanel.tsx
interface DifficultyOverridePanelProps {
  currentDifficulty: number
  allowedRange: [number, number]
  onOverrideSet: (difficulty: number, reason: string) => void
  onOverrideRemove: () => void
  overrideHistory: OverrideEvent[]
}
```

---

## Integration Points

### 1. **Learning Style Profile Integration**

The difficulty system integrates with MELLOWISE-009's learning style profiles:

```typescript
// Enhanced profile with difficulty preferences
interface EnhancedLearningProfile extends LearningProfile {
  difficultyPreferences: {
    adaptationSpeed: 'conservative' | 'moderate' | 'aggressive',
    preferredChallengeLevel: 'comfort' | 'stretch' | 'challenge',
    stabilityPreference: number, // 0.0-1.0
    manualOverrideFrequency: number
  }
}
```

### 2. **Performance Insights Integration**

MELLOWISE-012's insights system provides difficulty-aware analytics:

```typescript
// Enhanced insights with difficulty context
interface DifficultyAwareInsight extends PerformanceInsight {
  difficultyContext: {
    avgDifficultyDuringPeriod: number,
    difficultyVariance: number,
    algorithmPerformance: number,
    stabilityTrend: 'improving' | 'stable' | 'declining'
  }
}
```

### 3. **Question Selection Integration**

Enhanced question selection with difficulty targeting:

```typescript
// /src/lib/questions/adaptive-selector.ts
export class AdaptiveQuestionSelector {
  async selectNextQuestion(criteria: QuestionSelectionCriteria): Promise<Question> {
    const targetDifficulty = await this.difficultyService.getTargetDifficulty(criteria.userId, criteria.topicType)
    const availableQuestions = await this.getQuestionsInDifficultyRange(targetDifficulty, criteria.confidenceInterval)
    return this.selectOptimalQuestion(availableQuestions, criteria.learningStyle)
  }
}
```

---

## Performance Monitoring & Analytics

### 1. **Algorithm Performance Metrics**

```typescript
interface AlgorithmPerformanceMetrics {
  // Accuracy metrics
  successRateAccuracy: number    // How close to target success rate
  difficultyPredictionAccuracy: number  // How well difficulty predicts performance
  stabilityMaintenance: number   // How stable difficulty adjustments are
  
  // User experience metrics
  engagementMaintenance: number  // Session completion rates
  frustrationMinimization: number // Low consecutive failures
  progressPerception: number     // User-reported progress feeling
  
  // Algorithm efficiency
  adjustmentFrequency: number    // How often adjustments are made
  convergenceTime: number        // Time to reach stable difficulty
  overrideFrequency: number      // How often users override
}
```

### 2. **Real-time Monitoring Dashboard**

```typescript
// Admin dashboard for monitoring algorithm performance
interface DifficultySystemDashboard {
  globalMetrics: {
    avgSuccessRate: number,
    algorithmsStability: number,
    userSatisfaction: number
  }
  topicBreakdown: {
    [topicType]: TopicDifficultyMetrics
  }
  alerting: {
    performanceDeviations: Alert[],
    systemAnomalies: Alert[],
    userReports: UserFeedback[]
  }
}
```

---

## Testing Strategy

### 1. **Algorithm Testing**

```typescript
// Unit tests for FSRS engine
describe('FSRSAlgorithmEngine', () => {
  test('maintains target success rate within 5% tolerance')
  test('prevents extreme difficulty swings')
  test('adapts to different learning styles')
  test('handles edge cases (perfect/zero performance)')
})

// Integration tests for full system
describe('DynamicDifficultyIntegration', () => {
  test('end-to-end practice session with difficulty adaptation')
  test('manual override behavior and restoration')
  test('cross-topic learning transfer')
})
```

### 2. **Performance Testing**

```typescript
// Load testing for difficulty calculations
describe('DifficultySystemPerformance', () => {
  test('handles 1000+ concurrent difficulty calculations')
  test('real-time adjustment response time < 100ms')
  test('database query optimization for difficulty lookups')
})
```

---

## Security & Privacy Considerations

### 1. **Data Privacy**
- **FERPA Compliance**: All difficulty data encrypted at rest
- **User Consent**: Clear explanation of adaptive algorithm
- **Data Minimization**: Only necessary performance data stored
- **Audit Logging**: All difficulty adjustments logged for transparency

### 2. **Algorithm Transparency**
- **Explainable AI**: Users can see why difficulty changed
- **Manual Override Rights**: Users maintain control over their experience
- **Performance Visibility**: Clear metrics on algorithm effectiveness

---

## Migration Strategy

### 1. **Phase 1: Foundation (Week 1)**
- Database schema deployment
- Core FSRS engine implementation
- Basic difficulty tracking

### 2. **Phase 2: Integration (Week 2)**  
- Learning style profile integration
- Practice mode UI components
- Manual override functionality

### 3. **Phase 3: Optimization (Week 3)**
- Performance monitoring
- Algorithm tuning based on real data
- Advanced analytics integration

### 4. **Phase 4: Enhancement (Week 4)**
- Cross-topic learning insights
- Advanced user preferences
- Comprehensive testing and optimization

---

## Success Metrics

### 1. **Primary KPIs**
- **Target Success Rate Achievement**: 70-80% success rate maintained
- **User Engagement**: 15% increase in practice session completion
- **Learning Efficiency**: Reduced time to topic mastery
- **User Satisfaction**: Positive feedback on adaptive difficulty

### 2. **Technical KPIs**
- **Algorithm Stability**: Difficulty adjustments converge within 5 sessions
- **Performance**: Real-time calculations < 100ms response time
- **Accuracy**: 90%+ prediction accuracy for performance outcomes
- **Reliability**: 99.9% system uptime for difficulty calculations

---

## Future Enhancements

### 1. **Advanced FSRS Features**
- **Memory Strength Modeling**: Implement full FSRS memory curves
- **Optimal Scheduling**: Question timing optimization
- **Forgetting Curve Integration**: Time-based difficulty decay

### 2. **Machine Learning Integration**
- **Neural Network Enhancement**: Replace rule-based with learned patterns
- **Transfer Learning**: Cross-user difficulty pattern recognition
- **Predictive Modeling**: Advanced performance prediction algorithms

### 3. **Personalization Expansion**
- **Individual Learning Curves**: Per-user algorithm customization
- **Micro-Learning Adaptation**: Sub-topic difficulty granularity
- **Emotional State Integration**: Mood-aware difficulty adjustment

---

**Document Status**: Final Architecture Design  
**Review Status**: Ready for Implementation  
**Next Steps**: Database migration creation and service layer development