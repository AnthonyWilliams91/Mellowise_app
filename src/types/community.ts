/**
 * Community Features Types
 * MELLOWISE-028: Complete type definitions for study buddy community system
 */

// ============================================================================
// USER PROFILES & IDENTITY
// ============================================================================

/**
 * Anonymous user profile for privacy
 */
export interface AnonymousProfile {
  id: string;
  userId: string; // Internal reference, not exposed
  displayName: string;
  avatar: Avatar;
  studyStreak: number;
  joinDate: Date;
  lastActive: Date;
  reputation: number;
  badges: Badge[];
  preferences: ProfilePreferences;
  stats: ProfileStats;
}

/**
 * Avatar customization options
 */
export interface Avatar {
  type: 'generated' | 'icon' | 'custom';
  backgroundColor: string;
  iconName?: string;
  customImageUrl?: string;
  accessories: AvatarAccessory[];
}

/**
 * Avatar accessories (earned through achievements)
 */
export interface AvatarAccessory {
  id: string;
  name: string;
  type: 'hat' | 'glasses' | 'badge' | 'background' | 'frame';
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

/**
 * User profile preferences
 */
export interface ProfilePreferences {
  showStats: boolean;
  showBadges: boolean;
  allowDirectMessages: boolean;
  studyReminders: boolean;
  groupNotifications: boolean;
  anonymousMode: boolean;
  timezone: string;
}

/**
 * Profile statistics
 */
export interface ProfileStats {
  questionsAttempted: number;
  questionsCorrect: number;
  studyHours: number;
  groupsJoined: number;
  helpfulAnswers: number;
  forumPosts: number;
  currentStreak: number;
  longestStreak: number;
}

// ============================================================================
// STUDY GROUPS
// ============================================================================

/**
 * Study group with shared goals
 */
export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  privacy: 'public' | 'private' | 'invite-only';
  category: StudyCategory;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  memberCount: number;
  maxMembers: number;
  isActive: boolean;
  goals: GroupGoal[];
  schedule: GroupSchedule;
  stats: GroupStats;
  tags: string[];
}

/**
 * Study categories
 */
export type StudyCategory =
  | 'lsat-general'
  | 'logical-reasoning'
  | 'reading-comprehension'
  | 'logic-games'
  | 'test-prep'
  | 'accountability'
  | 'beginners'
  | 'advanced';

/**
 * Group goals and tracking
 */
export interface GroupGoal {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'collective';
  targetValue: number;
  currentValue: number;
  unit: string; // 'questions', 'hours', 'points', etc.
  deadline?: Date;
  createdAt: Date;
  completedAt?: Date;
  isActive: boolean;
  participants: GoalParticipant[];
}

/**
 * Goal participation tracking
 */
export interface GoalParticipant {
  profileId: string;
  joinedAt: Date;
  progress: number;
  lastUpdated: Date;
  isCompleted: boolean;
}

/**
 * Group scheduling
 */
export interface GroupSchedule {
  studySessions: StudySession[];
  meetingTimes: MeetingTime[];
  timezone: string;
  defaultDuration: number; // minutes
}

/**
 * Scheduled study session
 */
export interface StudySession {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  duration: number;
  type: 'practice' | 'review' | 'discussion' | 'test';
  host: string;
  attendees: string[];
  maxAttendees: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  resources: SessionResource[];
}

/**
 * Session resources
 */
export interface SessionResource {
  id: string;
  type: 'document' | 'link' | 'question-set' | 'video';
  title: string;
  url?: string;
  description: string;
  addedBy: string;
  addedAt: Date;
}

/**
 * Regular meeting times
 */
export interface MeetingTime {
  dayOfWeek: number; // 0-6, Sunday = 0
  startTime: string; // "HH:MM" format
  duration: number; // minutes
  recurring: boolean;
  description: string;
}

/**
 * Group statistics
 */
export interface GroupStats {
  totalStudyHours: number;
  questionsCompleted: number;
  averageScore: number;
  sessionsHeld: number;
  activeMembers: number;
  helpfulPosts: number;
  achievedGoals: number;
}

// ============================================================================
// DISCUSSION FORUMS
// ============================================================================

/**
 * Forum discussion thread
 */
export interface ForumThread {
  id: string;
  title: string;
  content: string;
  authorId: string;
  category: ForumCategory;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
  replyCount: number;
  viewCount: number;
  upvotes: number;
  downvotes: number;
  isPinned: boolean;
  isLocked: boolean;
  isSolved: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  questionType?: string;
}

/**
 * Forum categories
 */
export type ForumCategory =
  | 'general-discussion'
  | 'study-strategies'
  | 'logical-reasoning'
  | 'reading-comprehension'
  | 'logic-games'
  | 'practice-tests'
  | 'motivation'
  | 'resources'
  | 'technical-help';

/**
 * Forum reply/comment
 */
export interface ForumReply {
  id: string;
  threadId: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  upvotes: number;
  downvotes: number;
  isAcceptedAnswer: boolean;
  parentReplyId?: string; // For nested replies
  depth: number;
  attachments: ForumAttachment[];
}

/**
 * Forum attachments
 */
export interface ForumAttachment {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

// ============================================================================
// PEER EXPLANATIONS
// ============================================================================

/**
 * Alternative explanation submitted by peers
 */
export interface PeerExplanation {
  id: string;
  questionId: string;
  authorId: string;
  title: string;
  explanation: string;
  approach: ExplanationApproach;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
  updatedAt: Date;
  upvotes: number;
  downvotes: number;
  isVerified: boolean;
  verifiedBy?: string;
  helpfulCount: number;
  comments: ExplanationComment[];
  tags: string[];
}

/**
 * Explanation approaches
 */
export type ExplanationApproach =
  | 'step-by-step'
  | 'visual-diagram'
  | 'analogy'
  | 'elimination'
  | 'shortcut'
  | 'conceptual';

/**
 * Comments on peer explanations
 */
export interface ExplanationComment {
  id: string;
  explanationId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  upvotes: number;
  isHelpful: boolean;
}

// ============================================================================
// STUDY PARTNER MATCHING
// ============================================================================

/**
 * Study partner match profile
 */
export interface PartnerProfile {
  profileId: string;
  studyGoals: StudyGoal[];
  availability: Availability;
  studyStyle: StudyStyle;
  experience: ExperienceLevel;
  preferences: PartnerPreferences;
  compatibility: CompatibilityFactors;
}

/**
 * Study goals for matching
 */
export interface StudyGoal {
  type: 'target-score' | 'test-date' | 'daily-hours' | 'weekly-questions';
  value: number | string;
  deadline?: Date;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Availability schedule
 */
export interface Availability {
  timezone: string;
  weekdays: TimeSlot[];
  weekends: TimeSlot[];
  preferredDuration: number; // minutes
  flexibility: 'strict' | 'moderate' | 'flexible';
}

/**
 * Time slot for availability
 */
export interface TimeSlot {
  startTime: string; // "HH:MM" format
  endTime: string;   // "HH:MM" format
  dayOfWeek?: number; // Optional specific day
}

/**
 * Study style preferences
 */
export interface StudyStyle {
  approach: 'competitive' | 'collaborative' | 'supportive';
  pace: 'intensive' | 'moderate' | 'relaxed';
  communication: 'frequent' | 'regular' | 'minimal';
  accountability: 'high' | 'medium' | 'low';
}

/**
 * Experience level indicators
 */
export interface ExperienceLevel {
  overall: 'beginner' | 'intermediate' | 'advanced';
  logicalReasoning: number; // 0-10 scale
  readingComprehension: number;
  logicGames: number;
  studyMonths: number;
  previousTests: number;
}

/**
 * Partner matching preferences
 */
export interface PartnerPreferences {
  experienceMatch: 'similar' | 'any' | 'mentor' | 'mentee';
  goalAlignment: 'exact' | 'similar' | 'complementary';
  timeZoneFlexibility: number; // hours difference acceptable
  groupSize: 'one-on-one' | 'small-group' | 'any';
  communicationStyle: 'text' | 'voice' | 'video' | 'any';
}

/**
 * Compatibility factors for matching algorithm
 */
export interface CompatibilityFactors {
  goalSimilarity: number; // 0-1 scale
  scheduleOverlap: number;
  studyStyleMatch: number;
  experienceCompatibility: number;
  communicationCompatibility: number;
  overallScore: number;
}

/**
 * Study partnership
 */
export interface StudyPartnership {
  id: string;
  participants: string[];
  matchedAt: Date;
  status: 'active' | 'paused' | 'ended';
  compatibilityScore: number;
  sharedGoals: StudyGoal[];
  meetingSchedule: PartnershipSchedule;
  progress: PartnershipProgress;
  lastActivity: Date;
}

/**
 * Partnership scheduling
 */
export interface PartnershipSchedule {
  regularMeetings: MeetingTime[];
  upcomingSessions: StudySession[];
  missedSessions: number;
  totalSessions: number;
}

/**
 * Partnership progress tracking
 */
export interface PartnershipProgress {
  duration: number; // days
  goalsAchieved: number;
  mutualHelpCount: number;
  satisfactionRating: number; // 1-5 scale
  wouldRecommend: boolean;
}

// ============================================================================
// GROUP CHALLENGES & COMPETITIONS
// ============================================================================

/**
 * Group challenge or competition
 */
export interface GroupChallenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  participants: ChallengeParticipant[];
  maxParticipants?: number;
  rewards: ChallengeReward[];
  rules: ChallengeRule[];
  leaderboard: LeaderboardEntry[];
  isTeamBased: boolean;
  createdBy: string;
  category: string;
}

/**
 * Challenge types
 */
export type ChallengeType =
  | 'daily-streak'
  | 'question-marathon'
  | 'accuracy-contest'
  | 'speed-challenge'
  | 'improvement-race'
  | 'team-collaboration'
  | 'knowledge-trivia';

/**
 * Challenge participant
 */
export interface ChallengeParticipant {
  profileId: string;
  joinedAt: Date;
  currentScore: number;
  rank: number;
  progress: ChallengeProgress;
  isActive: boolean;
  teamId?: string;
}

/**
 * Challenge progress tracking
 */
export interface ChallengeProgress {
  questionsAttempted: number;
  questionsCorrect: number;
  timeSpent: number;
  milestones: ChallengeMilestone[];
  lastActivity: Date;
  streakDays: number;
  bonusPoints: number;
}

/**
 * Challenge milestone
 */
export interface ChallengeMilestone {
  id: string;
  title: string;
  description: string;
  requirement: number;
  achieved: boolean;
  achievedAt?: Date;
  points: number;
}

/**
 * Challenge reward
 */
export interface ChallengeReward {
  id: string;
  rank: number; // 1st, 2nd, 3rd, etc. or 0 for participation
  type: 'badge' | 'avatar-accessory' | 'title' | 'points' | 'feature-unlock';
  value: string | number;
  name: string;
  description: string;
  icon: string;
}

/**
 * Challenge rule
 */
export interface ChallengeRule {
  id: string;
  description: string;
  priority: number;
  isRequired: boolean;
  penaltyPoints?: number;
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  rank: number;
  profileId: string;
  displayName: string;
  score: number;
  progress: number; // percentage
  badges: Badge[];
  isCurrentUser: boolean;
  teamName?: string;
  trend: 'up' | 'down' | 'stable';
}

// ============================================================================
// MODERATION & SAFETY
// ============================================================================

/**
 * Content report
 */
export interface ContentReport {
  id: string;
  reporterProfileId: string;
  contentType: 'thread' | 'reply' | 'explanation' | 'comment' | 'profile';
  contentId: string;
  reason: ReportReason;
  description: string;
  createdAt: Date;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: string;
  reviewedAt?: Date;
  action?: ModerationAction;
}

/**
 * Report reasons
 */
export type ReportReason =
  | 'inappropriate-content'
  | 'harassment'
  | 'spam'
  | 'misinformation'
  | 'copyright'
  | 'privacy-violation'
  | 'off-topic'
  | 'duplicate-content';

/**
 * Moderation action
 */
export interface ModerationAction {
  type: 'warning' | 'content-removal' | 'temporary-ban' | 'permanent-ban' | 'no-action';
  reason: string;
  duration?: number; // days for temporary bans
  notificationSent: boolean;
  appealable: boolean;
}

/**
 * User badge system
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: Date;
  criteria: BadgeCriteria;
  isVisible: boolean;
}

/**
 * Badge categories
 */
export type BadgeCategory =
  | 'achievement'
  | 'participation'
  | 'helping-others'
  | 'consistency'
  | 'expertise'
  | 'leadership'
  | 'special-event';

/**
 * Badge unlock criteria
 */
export interface BadgeCriteria {
  type: 'single' | 'cumulative' | 'streak';
  metric: string;
  threshold: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all-time';
  description: string;
}

// ============================================================================
// PRIVACY & SETTINGS
// ============================================================================

/**
 * Privacy settings
 */
export interface PrivacySettings {
  profileId: string;
  showRealName: boolean;
  showStats: boolean;
  showBadges: boolean;
  showActivity: boolean;
  allowDirectMessages: boolean;
  allowGroupInvites: boolean;
  allowPartnerMatching: boolean;
  dataSharingLevel: 'minimal' | 'standard' | 'full';
  analyticsOptOut: boolean;
}

/**
 * Communication preferences
 */
export interface CommunicationPreferences {
  profileId: string;
  emailNotifications: EmailNotificationSettings;
  pushNotifications: PushNotificationSettings;
  inAppNotifications: InAppNotificationSettings;
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
}

/**
 * Email notification settings
 */
export interface EmailNotificationSettings {
  enabled: boolean;
  groupInvites: boolean;
  partnerRequests: boolean;
  challengeResults: boolean;
  weeklyDigest: boolean;
  achievementUnlocks: boolean;
  forumReplies: boolean;
}

/**
 * Push notification settings
 */
export interface PushNotificationSettings {
  enabled: boolean;
  studyReminders: boolean;
  groupActivity: boolean;
  partnerMessages: boolean;
  challengeUpdates: boolean;
  quietHours: QuietHours;
}

/**
 * In-app notification settings
 */
export interface InAppNotificationSettings {
  enabled: boolean;
  showBadgePopups: boolean;
  showProgressToasts: boolean;
  showSocialActivity: boolean;
  soundEffects: boolean;
}

/**
 * Quiet hours configuration
 */
export interface QuietHours {
  enabled: boolean;
  startTime: string; // "HH:MM" format
  endTime: string;
  timezone: string;
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

/**
 * Default profile preferences
 */
export const DEFAULT_PROFILE_PREFERENCES: ProfilePreferences = {
  showStats: true,
  showBadges: true,
  allowDirectMessages: true,
  studyReminders: true,
  groupNotifications: true,
  anonymousMode: false,
  timezone: 'UTC'
};

/**
 * Default privacy settings
 */
export const DEFAULT_PRIVACY_SETTINGS: Omit<PrivacySettings, 'profileId'> = {
  showRealName: false,
  showStats: true,
  showBadges: true,
  showActivity: true,
  allowDirectMessages: true,
  allowGroupInvites: true,
  allowPartnerMatching: true,
  dataSharingLevel: 'standard',
  analyticsOptOut: false
};

/**
 * Common study group categories with descriptions
 */
export const STUDY_CATEGORIES: Record<StudyCategory, { name: string; description: string }> = {
  'lsat-general': {
    name: 'LSAT General',
    description: 'General LSAT preparation and discussion'
  },
  'logical-reasoning': {
    name: 'Logical Reasoning',
    description: 'Focus on LR questions and strategies'
  },
  'reading-comprehension': {
    name: 'Reading Comprehension',
    description: 'RC passage analysis and techniques'
  },
  'logic-games': {
    name: 'Logic Games',
    description: 'Logic games practice and methods'
  },
  'test-prep': {
    name: 'Test Preparation',
    description: 'Test-taking strategies and schedules'
  },
  'accountability': {
    name: 'Accountability',
    description: 'Mutual support and progress tracking'
  },
  'beginners': {
    name: 'Beginners',
    description: 'New to LSAT preparation'
  },
  'advanced': {
    name: 'Advanced',
    description: 'High scorers and advanced strategies'
  }
};

// ============================================================================
// TYPE GUARDS & UTILITIES
// ============================================================================

/**
 * Type guard for AnonymousProfile
 */
export function isAnonymousProfile(obj: any): obj is AnonymousProfile {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.displayName === 'string' &&
    obj.joinDate instanceof Date &&
    typeof obj.reputation === 'number';
}

/**
 * Type guard for StudyGroup
 */
export function isStudyGroup(obj: any): obj is StudyGroup {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.privacy === 'string' &&
    obj.createdAt instanceof Date;
}

/**
 * Type guard for ForumThread
 */
export function isForumThread(obj: any): obj is ForumThread {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.content === 'string' &&
    obj.createdAt instanceof Date;
}