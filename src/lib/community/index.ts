/**
 * Community Features Module
 * MELLOWISE-028: Export all community services and utilities
 */

// Core service
export { CommunityService } from './community-service';

// Types and interfaces
export type {
  AnonymousProfile,
  StudyGroup,
  ForumThread,
  ForumReply,
  PeerExplanation,
  PartnerProfile,
  StudyPartnership,
  GroupChallenge,
  Badge,
  StudyCategory,
  ProfilePreferences,
  GroupGoal,
  ChallengeParticipant,
  Avatar,
  ProfileStats,
  StudySession,
  MeetingTime,
  ForumCategory,
  ExplanationApproach,
  PartnerPreferences,
  ChallengeType,
  LeaderboardEntry,
  ContentReport,
  ReportReason,
  ModerationAction,
  PrivacySettings,
  CommunicationPreferences,
  DEFAULT_PROFILE_PREFERENCES,
  DEFAULT_PRIVACY_SETTINGS,
  STUDY_CATEGORIES
} from '@/types/community';

// Type guards
export {
  isAnonymousProfile,
  isStudyGroup,
  isForumThread
} from '@/types/community';