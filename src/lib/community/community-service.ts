/**
 * Community Service
 * MELLOWISE-028: Core community features with study groups, forums, and peer interactions
 */

import type {
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
  DEFAULT_PROFILE_PREFERENCES,
  DEFAULT_PRIVACY_SETTINGS
} from '@/types/community';

export class CommunityService {
  private profiles = new Map<string, AnonymousProfile>();
  private studyGroups = new Map<string, StudyGroup>();
  private forumThreads = new Map<string, ForumThread>();
  private forumReplies = new Map<string, ForumReply[]>();
  private peerExplanations = new Map<string, PeerExplanation[]>();
  private partnerships = new Map<string, StudyPartnership>();
  private challenges = new Map<string, GroupChallenge>();

  // ============================================================================
  // PROFILE MANAGEMENT
  // ============================================================================

  /**
   * Create anonymous profile for user
   */
  async createProfile(userId: string, displayName: string): Promise<AnonymousProfile> {
    const profileId = this.generateProfileId();

    const profile: AnonymousProfile = {
      id: profileId,
      userId,
      displayName: displayName || this.generateRandomName(),
      avatar: this.generateDefaultAvatar(),
      studyStreak: 0,
      joinDate: new Date(),
      lastActive: new Date(),
      reputation: 0,
      badges: [],
      preferences: { ...DEFAULT_PROFILE_PREFERENCES },
      stats: {
        questionsAttempted: 0,
        questionsCorrect: 0,
        studyHours: 0,
        groupsJoined: 0,
        helpfulAnswers: 0,
        forumPosts: 0,
        currentStreak: 0,
        longestStreak: 0
      }
    };

    this.profiles.set(profileId, profile);
    return profile;
  }

  /**
   * Get profile by ID
   */
  async getProfile(profileId: string): Promise<AnonymousProfile | null> {
    return this.profiles.get(profileId) || null;
  }

  /**
   * Update profile preferences
   */
  async updateProfilePreferences(
    profileId: string,
    preferences: Partial<ProfilePreferences>
  ): Promise<boolean> {
    const profile = this.profiles.get(profileId);
    if (!profile) return false;

    profile.preferences = { ...profile.preferences, ...preferences };
    return true;
  }

  /**
   * Update profile avatar
   */
  async updateAvatar(profileId: string, avatar: Partial<typeof AnonymousProfile.prototype.avatar>): Promise<boolean> {
    const profile = this.profiles.get(profileId);
    if (!profile) return false;

    profile.avatar = { ...profile.avatar, ...avatar };
    return true;
  }

  /**
   * Award badge to profile
   */
  async awardBadge(profileId: string, badge: Badge): Promise<boolean> {
    const profile = this.profiles.get(profileId);
    if (!profile) return false;

    // Check if badge already exists
    const existingBadge = profile.badges.find(b => b.id === badge.id);
    if (existingBadge) return false;

    profile.badges.push(badge);
    profile.reputation += this.getBadgeReputationValue(badge);

    return true;
  }

  // ============================================================================
  // STUDY GROUPS
  // ============================================================================

  /**
   * Create new study group
   */
  async createStudyGroup(
    creatorProfileId: string,
    groupData: {
      name: string;
      description: string;
      category: StudyCategory;
      privacy: 'public' | 'private' | 'invite-only';
      maxMembers?: number;
      goals?: Partial<GroupGoal>[];
    }
  ): Promise<StudyGroup> {
    const groupId = this.generateGroupId();

    const studyGroup: StudyGroup = {
      id: groupId,
      name: groupData.name,
      description: groupData.description,
      privacy: groupData.privacy,
      category: groupData.category,
      createdBy: creatorProfileId,
      createdAt: new Date(),
      updatedAt: new Date(),
      memberCount: 1, // Creator is first member
      maxMembers: groupData.maxMembers || 50,
      isActive: true,
      goals: groupData.goals?.map(goal => this.createGroupGoal(goal)) || [],
      schedule: {
        studySessions: [],
        meetingTimes: [],
        timezone: 'UTC',
        defaultDuration: 60
      },
      stats: {
        totalStudyHours: 0,
        questionsCompleted: 0,
        averageScore: 0,
        sessionsHeld: 0,
        activeMembers: 1,
        helpfulPosts: 0,
        achievedGoals: 0
      },
      tags: []
    };

    this.studyGroups.set(groupId, studyGroup);

    // Add creator as first member (this would be handled by membership service)
    console.log(`Created study group ${groupId} by ${creatorProfileId}`);

    return studyGroup;
  }

  /**
   * Search study groups by criteria
   */
  async searchStudyGroups(criteria: {
    category?: StudyCategory;
    query?: string;
    privacy?: 'public' | 'private' | 'invite-only';
    hasOpenSlots?: boolean;
    tags?: string[];
    limit?: number;
  }): Promise<StudyGroup[]> {
    let groups = Array.from(this.studyGroups.values());

    // Filter by criteria
    if (criteria.category) {
      groups = groups.filter(group => group.category === criteria.category);
    }

    if (criteria.privacy) {
      groups = groups.filter(group => group.privacy === criteria.privacy);
    }

    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      groups = groups.filter(group =>
        group.name.toLowerCase().includes(query) ||
        group.description.toLowerCase().includes(query) ||
        group.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (criteria.hasOpenSlots) {
      groups = groups.filter(group => group.memberCount < group.maxMembers);
    }

    if (criteria.tags?.length) {
      groups = groups.filter(group =>
        criteria.tags!.some(tag => group.tags.includes(tag))
      );
    }

    // Sort by relevance (member count, activity, etc.)
    groups = groups.sort((a, b) => {
      // Prioritize active groups with recent activity
      const aScore = a.memberCount + (a.isActive ? 10 : 0) + a.stats.activeMembers;
      const bScore = b.memberCount + (b.isActive ? 10 : 0) + b.stats.activeMembers;
      return bScore - aScore;
    });

    return groups.slice(0, criteria.limit || 20);
  }

  /**
   * Join study group
   */
  async joinStudyGroup(groupId: string, profileId: string): Promise<{ success: boolean; message: string }> {
    const group = this.studyGroups.get(groupId);
    if (!group) {
      return { success: false, message: 'Study group not found' };
    }

    if (!group.isActive) {
      return { success: false, message: 'Study group is no longer active' };
    }

    if (group.memberCount >= group.maxMembers) {
      return { success: false, message: 'Study group is full' };
    }

    if (group.privacy === 'private') {
      return { success: false, message: 'This is a private group - invitation required' };
    }

    // Add member (in real implementation, this would be handled by membership service)
    group.memberCount += 1;
    group.stats.activeMembers += 1;
    group.updatedAt = new Date();

    // Update user's profile stats
    const profile = this.profiles.get(profileId);
    if (profile) {
      profile.stats.groupsJoined += 1;
    }

    return { success: true, message: 'Successfully joined study group!' };
  }

  /**
   * Get group goals and progress
   */
  async getGroupGoals(groupId: string): Promise<GroupGoal[]> {
    const group = this.studyGroups.get(groupId);
    return group?.goals || [];
  }

  /**
   * Update goal progress
   */
  async updateGoalProgress(
    goalId: string,
    profileId: string,
    progress: number
  ): Promise<boolean> {
    // Find the goal across all groups
    for (const group of this.studyGroups.values()) {
      const goal = group.goals.find(g => g.id === goalId);
      if (goal) {
        const participant = goal.participants.find(p => p.profileId === profileId);
        if (participant) {
          participant.progress = progress;
          participant.lastUpdated = new Date();

          if (progress >= goal.targetValue) {
            participant.isCompleted = true;
          }

          // Update goal's overall progress
          this.updateGoalOverallProgress(goal);
          return true;
        }
      }
    }

    return false;
  }

  // ============================================================================
  // FORUM SYSTEM
  // ============================================================================

  /**
   * Create new forum thread
   */
  async createForumThread(
    authorId: string,
    threadData: {
      title: string;
      content: string;
      category: typeof ForumThread.prototype.category;
      tags?: string[];
      questionType?: string;
      difficulty?: 'beginner' | 'intermediate' | 'advanced';
    }
  ): Promise<ForumThread> {
    const threadId = this.generateThreadId();

    const thread: ForumThread = {
      id: threadId,
      title: threadData.title,
      content: threadData.content,
      authorId,
      category: threadData.category,
      tags: threadData.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivityAt: new Date(),
      replyCount: 0,
      viewCount: 0,
      upvotes: 0,
      downvotes: 0,
      isPinned: false,
      isLocked: false,
      isSolved: false,
      difficulty: threadData.difficulty,
      questionType: threadData.questionType
    };

    this.forumThreads.set(threadId, thread);
    this.forumReplies.set(threadId, []); // Initialize empty replies array

    // Update author stats
    const profile = this.profiles.get(authorId);
    if (profile) {
      profile.stats.forumPosts += 1;
    }

    return thread;
  }

  /**
   * Reply to forum thread
   */
  async replyToThread(
    threadId: string,
    authorId: string,
    content: string,
    parentReplyId?: string
  ): Promise<ForumReply> {
    const thread = this.forumThreads.get(threadId);
    if (!thread || thread.isLocked) {
      throw new Error('Cannot reply to this thread');
    }

    const replyId = this.generateReplyId();
    const depth = parentReplyId ? this.getReplyDepth(threadId, parentReplyId) + 1 : 0;

    const reply: ForumReply = {
      id: replyId,
      threadId,
      content,
      authorId,
      createdAt: new Date(),
      updatedAt: new Date(),
      upvotes: 0,
      downvotes: 0,
      isAcceptedAnswer: false,
      parentReplyId,
      depth: Math.min(depth, 3), // Max nesting depth
      attachments: []
    };

    const replies = this.forumReplies.get(threadId) || [];
    replies.push(reply);
    this.forumReplies.set(threadId, replies);

    // Update thread stats
    thread.replyCount += 1;
    thread.lastActivityAt = new Date();
    thread.updatedAt = new Date();

    // Update author stats
    const profile = this.profiles.get(authorId);
    if (profile) {
      profile.stats.forumPosts += 1;
    }

    return reply;
  }

  /**
   * Get forum threads with pagination
   */
  async getForumThreads(
    category?: typeof ForumThread.prototype.category,
    page: number = 1,
    limit: number = 20
  ): Promise<{ threads: ForumThread[]; totalCount: number; hasMore: boolean }> {
    let threads = Array.from(this.forumThreads.values());

    if (category) {
      threads = threads.filter(thread => thread.category === category);
    }

    // Sort by pinned first, then by last activity
    threads = threads.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.lastActivityAt.getTime() - a.lastActivityAt.getTime();
    });

    const totalCount = threads.length;
    const startIndex = (page - 1) * limit;
    const paginatedThreads = threads.slice(startIndex, startIndex + limit);

    return {
      threads: paginatedThreads,
      totalCount,
      hasMore: startIndex + limit < totalCount
    };
  }

  /**
   * Get thread replies with nested structure
   */
  async getThreadReplies(threadId: string): Promise<ForumReply[]> {
    // Increment view count
    const thread = this.forumThreads.get(threadId);
    if (thread) {
      thread.viewCount += 1;
    }

    return this.forumReplies.get(threadId) || [];
  }

  /**
   * Vote on thread or reply
   */
  async vote(
    contentType: 'thread' | 'reply',
    contentId: string,
    profileId: string,
    voteType: 'up' | 'down'
  ): Promise<{ success: boolean; newScore: number }> {
    // In a real implementation, would track user votes to prevent double-voting
    if (contentType === 'thread') {
      const thread = this.forumThreads.get(contentId);
      if (!thread) return { success: false, newScore: 0 };

      if (voteType === 'up') {
        thread.upvotes += 1;
      } else {
        thread.downvotes += 1;
      }

      return { success: true, newScore: thread.upvotes - thread.downvotes };
    } else {
      // Find reply across all threads
      for (const replies of this.forumReplies.values()) {
        const reply = replies.find(r => r.id === contentId);
        if (reply) {
          if (voteType === 'up') {
            reply.upvotes += 1;
          } else {
            reply.downvotes += 1;
          }
          return { success: true, newScore: reply.upvotes - reply.downvotes };
        }
      }
    }

    return { success: false, newScore: 0 };
  }

  // ============================================================================
  // PEER EXPLANATIONS
  // ============================================================================

  /**
   * Submit peer explanation for a question
   */
  async submitPeerExplanation(
    authorId: string,
    explanationData: {
      questionId: string;
      title: string;
      explanation: string;
      approach: typeof PeerExplanation.prototype.approach;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      tags?: string[];
    }
  ): Promise<PeerExplanation> {
    const explanationId = this.generateExplanationId();

    const peerExplanation: PeerExplanation = {
      id: explanationId,
      questionId: explanationData.questionId,
      authorId,
      title: explanationData.title,
      explanation: explanationData.explanation,
      approach: explanationData.approach,
      difficulty: explanationData.difficulty,
      createdAt: new Date(),
      updatedAt: new Date(),
      upvotes: 0,
      downvotes: 0,
      isVerified: false,
      helpfulCount: 0,
      comments: [],
      tags: explanationData.tags || []
    };

    // Store by question ID
    const questionExplanations = this.peerExplanations.get(explanationData.questionId) || [];
    questionExplanations.push(peerExplanation);
    this.peerExplanations.set(explanationData.questionId, questionExplanations);

    // Update author stats
    const profile = this.profiles.get(authorId);
    if (profile) {
      profile.stats.helpfulAnswers += 1;
    }

    return peerExplanation;
  }

  /**
   * Get peer explanations for a question
   */
  async getPeerExplanations(questionId: string): Promise<PeerExplanation[]> {
    const explanations = this.peerExplanations.get(questionId) || [];

    // Sort by verification status first, then by votes
    return explanations.sort((a, b) => {
      if (a.isVerified && !b.isVerified) return -1;
      if (!a.isVerified && b.isVerified) return 1;

      const aScore = a.upvotes - a.downvotes;
      const bScore = b.upvotes - b.downvotes;
      return bScore - aScore;
    });
  }

  /**
   * Mark explanation as helpful
   */
  async markExplanationHelpful(explanationId: string, profileId: string): Promise<boolean> {
    for (const explanations of this.peerExplanations.values()) {
      const explanation = explanations.find(exp => exp.id === explanationId);
      if (explanation) {
        explanation.helpfulCount += 1;
        explanation.upvotes += 1;

        // Award reputation to explanation author
        const authorProfile = this.profiles.get(explanation.authorId);
        if (authorProfile) {
          authorProfile.reputation += 5; // 5 points for helpful explanation
        }

        return true;
      }
    }

    return false;
  }

  // ============================================================================
  // STUDY PARTNER MATCHING
  // ============================================================================

  /**
   * Create partner profile for matching
   */
  async createPartnerProfile(
    profileId: string,
    partnerData: Omit<PartnerProfile, 'profileId'>
  ): Promise<PartnerProfile> {
    const partnerProfile: PartnerProfile = {
      profileId,
      ...partnerData
    };

    // In real implementation, would store in separate partner profiles collection
    console.log(`Created partner profile for ${profileId}`);

    return partnerProfile;
  }

  /**
   * Find compatible study partners
   */
  async findStudyPartners(
    profileId: string,
    preferences: Partial<PartnerProfile['preferences']>,
    limit: number = 10
  ): Promise<PartnerProfile[]> {
    // This would implement sophisticated matching algorithm
    // For now, returning simulated matches

    const mockPartners: PartnerProfile[] = [];

    // Generate mock compatible partners
    for (let i = 0; i < Math.min(limit, 5); i++) {
      mockPartners.push({
        profileId: `partner_${i}`,
        studyGoals: [
          {
            type: 'target-score',
            value: 165 + Math.floor(Math.random() * 10),
            priority: 'high'
          }
        ],
        availability: {
          timezone: 'UTC',
          weekdays: [{ startTime: '18:00', endTime: '21:00' }],
          weekends: [{ startTime: '09:00', endTime: '17:00' }],
          preferredDuration: 90,
          flexibility: 'moderate'
        },
        studyStyle: {
          approach: 'collaborative',
          pace: 'moderate',
          communication: 'regular',
          accountability: 'high'
        },
        experience: {
          overall: 'intermediate',
          logicalReasoning: 7,
          readingComprehension: 6,
          logicGames: 5,
          studyMonths: 3,
          previousTests: 1
        },
        preferences: {
          experienceMatch: 'similar',
          goalAlignment: 'similar',
          timeZoneFlexibility: 3,
          groupSize: 'one-on-one',
          communicationStyle: 'text'
        },
        compatibility: {
          goalSimilarity: 0.85,
          scheduleOverlap: 0.7,
          studyStyleMatch: 0.8,
          experienceCompatibility: 0.75,
          communicationCompatibility: 0.9,
          overallScore: 0.8
        }
      });
    }

    return mockPartners;
  }

  // ============================================================================
  // GROUP CHALLENGES
  // ============================================================================

  /**
   * Create group challenge
   */
  async createChallenge(
    creatorId: string,
    challengeData: {
      title: string;
      description: string;
      type: typeof GroupChallenge.prototype.type;
      difficulty: 'easy' | 'medium' | 'hard' | 'expert';
      duration: number; // days
      maxParticipants?: number;
      isTeamBased: boolean;
    }
  ): Promise<GroupChallenge> {
    const challengeId = this.generateChallengeId();
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + challengeData.duration * 24 * 60 * 60 * 1000);

    const challenge: GroupChallenge = {
      id: challengeId,
      title: challengeData.title,
      description: challengeData.description,
      type: challengeData.type,
      difficulty: challengeData.difficulty,
      startDate,
      endDate,
      status: 'upcoming',
      participants: [],
      maxParticipants: challengeData.maxParticipants,
      rewards: this.generateChallengeRewards(challengeData.difficulty),
      rules: [],
      leaderboard: [],
      isTeamBased: challengeData.isTeamBased,
      createdBy: creatorId,
      category: this.getChallengeCategory(challengeData.type)
    };

    this.challenges.set(challengeId, challenge);
    return challenge;
  }

  /**
   * Join challenge
   */
  async joinChallenge(challengeId: string, profileId: string): Promise<boolean> {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) return false;

    if (challenge.maxParticipants && challenge.participants.length >= challenge.maxParticipants) {
      return false;
    }

    // Check if already participating
    const existingParticipant = challenge.participants.find(p => p.profileId === profileId);
    if (existingParticipant) return false;

    const participant: ChallengeParticipant = {
      profileId,
      joinedAt: new Date(),
      currentScore: 0,
      rank: challenge.participants.length + 1,
      progress: {
        questionsAttempted: 0,
        questionsCorrect: 0,
        timeSpent: 0,
        milestones: [],
        lastActivity: new Date(),
        streakDays: 0,
        bonusPoints: 0
      },
      isActive: true
    };

    challenge.participants.push(participant);
    return true;
  }

  /**
   * Get active challenges
   */
  async getActiveChallenges(limit: number = 10): Promise<GroupChallenge[]> {
    const now = new Date();

    return Array.from(this.challenges.values())
      .filter(challenge =>
        challenge.status === 'active' ||
        (challenge.status === 'upcoming' && challenge.startDate <= now)
      )
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, limit);
  }

  /**
   * Update challenge participant progress
   */
  async updateChallengeProgress(
    challengeId: string,
    profileId: string,
    progress: Partial<ChallengeParticipant['progress']>
  ): Promise<boolean> {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) return false;

    const participant = challenge.participants.find(p => p.profileId === profileId);
    if (!participant) return false;

    participant.progress = { ...participant.progress, ...progress };
    participant.progress.lastActivity = new Date();

    // Recalculate score and rank
    this.updateChallengeLeaderboard(challenge);

    return true;
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private generateProfileId(): string {
    return `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateGroupId(): string {
    return `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateThreadId(): string {
    return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReplyId(): string {
    return `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateExplanationId(): string {
    return `explanation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateChallengeId(): string {
    return `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRandomName(): string {
    const adjectives = ['Studious', 'Focused', 'Determined', 'Brilliant', 'Logical', 'Analytical'];
    const nouns = ['Scholar', 'Learner', 'Thinker', 'Student', 'Ace', 'Pro'];

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 1000);

    return `${adj}${noun}${number}`;
  }

  private generateDefaultAvatar(): AnonymousProfile['avatar'] {
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4'];
    const icons = ['user', 'academic-cap', 'book-open', 'light-bulb', 'star', 'trophy'];

    return {
      type: 'icon',
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      iconName: icons[Math.floor(Math.random() * icons.length)],
      accessories: []
    };
  }

  private createGroupGoal(goalData: Partial<GroupGoal>): GroupGoal {
    return {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: goalData.title || 'Study Goal',
      description: goalData.description || '',
      type: goalData.type || 'collective',
      targetValue: goalData.targetValue || 100,
      currentValue: 0,
      unit: goalData.unit || 'questions',
      deadline: goalData.deadline,
      createdAt: new Date(),
      isActive: true,
      participants: []
    };
  }

  private updateGoalOverallProgress(goal: GroupGoal): void {
    if (goal.type === 'collective') {
      goal.currentValue = goal.participants.reduce((sum, p) => sum + p.progress, 0);
    } else {
      // For individual goals, current value is the average progress
      const totalProgress = goal.participants.reduce((sum, p) => sum + p.progress, 0);
      goal.currentValue = goal.participants.length > 0 ? totalProgress / goal.participants.length : 0;
    }

    if (goal.currentValue >= goal.targetValue && !goal.completedAt) {
      goal.completedAt = new Date();
      goal.isActive = false;
    }
  }

  private getReplyDepth(threadId: string, parentReplyId: string): number {
    const replies = this.forumReplies.get(threadId) || [];
    const parentReply = replies.find(r => r.id === parentReplyId);
    return parentReply ? parentReply.depth : 0;
  }

  private getBadgeReputationValue(badge: Badge): number {
    const reputationValues = {
      'common': 5,
      'rare': 15,
      'epic': 50,
      'legendary': 100
    };
    return reputationValues[badge.rarity] || 5;
  }

  private generateChallengeRewards(difficulty: 'easy' | 'medium' | 'hard' | 'expert'): GroupChallenge['rewards'] {
    const baseRewards = {
      easy: [10, 5, 3],
      medium: [25, 15, 10],
      hard: [50, 30, 20],
      expert: [100, 60, 40]
    };

    const points = baseRewards[difficulty] || baseRewards.easy;

    return [
      {
        id: 'first_place',
        rank: 1,
        type: 'points',
        value: points[0],
        name: 'First Place',
        description: `${points[0]} reputation points`,
        icon: 'trophy'
      },
      {
        id: 'second_place',
        rank: 2,
        type: 'points',
        value: points[1],
        name: 'Second Place',
        description: `${points[1]} reputation points`,
        icon: 'medal'
      },
      {
        id: 'third_place',
        rank: 3,
        type: 'points',
        value: points[2],
        name: 'Third Place',
        description: `${points[2]} reputation points`,
        icon: 'medal'
      }
    ];
  }

  private getChallengeCategory(type: GroupChallenge['type']): string {
    const categories = {
      'daily-streak': 'consistency',
      'question-marathon': 'endurance',
      'accuracy-contest': 'precision',
      'speed-challenge': 'speed',
      'improvement-race': 'progress',
      'team-collaboration': 'teamwork',
      'knowledge-trivia': 'knowledge'
    };
    return categories[type] || 'general';
  }

  private updateChallengeLeaderboard(challenge: GroupChallenge): void {
    // Calculate scores and update leaderboard
    challenge.participants.forEach(participant => {
      const progress = participant.progress;
      participant.currentScore =
        progress.questionsCorrect * 10 +
        progress.streakDays * 5 +
        progress.bonusPoints;
    });

    // Sort participants by score
    challenge.participants.sort((a, b) => b.currentScore - a.currentScore);

    // Update ranks
    challenge.participants.forEach((participant, index) => {
      participant.rank = index + 1;
    });

    // Update leaderboard display
    challenge.leaderboard = challenge.participants.slice(0, 10).map(participant => {
      const profile = this.profiles.get(participant.profileId);
      return {
        rank: participant.rank,
        profileId: participant.profileId,
        displayName: profile?.displayName || 'Anonymous',
        score: participant.currentScore,
        progress: Math.min(100, (participant.currentScore / 1000) * 100), // Assuming 1000 is max score
        badges: profile?.badges || [],
        isCurrentUser: false, // Would be determined by current user context
        trend: 'stable' as const // Would be calculated based on previous rankings
      };
    });
  }
}