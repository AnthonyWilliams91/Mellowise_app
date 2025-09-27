/**
 * Achievement System
 * MELLOWISE-026: Comprehensive achievement and badge system with 30+ achievements
 */

import type {
  Achievement,
  AchievementCategory,
  AchievementType,
  AchievementRequirement,
  AchievementReward,
  PlayerAchievement,
  AchievementProgress,
  RequirementProgress
} from '@/types/gamification';

export class AchievementSystemService {
  private achievements: Map<string, Achievement> = new Map();
  private playerAchievements: Map<string, PlayerAchievement[]> = new Map();
  private achievementProgress: Map<string, Map<string, AchievementProgress>> = new Map();

  constructor() {
    this.initializeAchievements();
  }

  /**
   * Check for achievement unlocks after an action
   */
  async checkAchievements(
    userId: string,
    action: string,
    data: Record<string, any>
  ): Promise<Achievement[]> {
    const unlockedAchievements: Achievement[] = [];
    const playerAchievements = await this.getPlayerAchievements(userId);
    const unlockedIds = new Set(playerAchievements.map(pa => pa.achievementId));

    for (const [achievementId, achievement] of this.achievements) {
      // Skip if already unlocked
      if (unlockedIds.has(achievementId)) continue;

      // Skip if hidden and not ready to show
      if (achievement.hidden && !this.shouldShowHiddenAchievement(achievement, data)) continue;

      // Check if requirements are met
      const progress = await this.calculateProgress(userId, achievement, data);
      if (progress.isCompleted) {
        await this.unlockAchievement(userId, achievementId);
        unlockedAchievements.push(achievement);
      } else {
        // Update progress
        await this.updateProgress(userId, achievementId, progress);
      }
    }

    return unlockedAchievements;
  }

  /**
   * Unlock an achievement for a player
   */
  async unlockAchievement(userId: string, achievementId: string): Promise<boolean> {
    const achievement = this.achievements.get(achievementId);
    if (!achievement) {
      console.warn(`Achievement ${achievementId} not found`);
      return false;
    }

    // Check if already unlocked
    const existing = await this.getPlayerAchievements(userId);
    if (existing.some(pa => pa.achievementId === achievementId)) {
      console.warn(`Achievement ${achievementId} already unlocked for ${userId}`);
      return false;
    }

    // Create player achievement
    const playerAchievement: PlayerAchievement = {
      achievementId,
      unlockedAt: new Date(),
      progress: 100,
      notified: false,
      shareCount: 0,
      rarity: await this.calculateRarity(achievementId)
    };

    // Add to player's achievements
    const playerAchievements = existing || [];
    playerAchievements.push(playerAchievement);
    this.playerAchievements.set(userId, playerAchievements);

    // Save to storage
    await this.savePlayerAchievements(userId, playerAchievements);

    // Award achievement rewards
    await this.awardAchievementRewards(userId, achievement);

    console.log(`🏆 Achievement unlocked: ${achievement.name} for ${userId}`);

    // Trigger achievement celebration
    this.triggerAchievementCelebration(userId, achievement);

    return true;
  }

  /**
   * Get all achievements for a player
   */
  async getPlayerAchievements(userId: string): Promise<PlayerAchievement[]> {
    const cached = this.playerAchievements.get(userId);
    if (cached) return cached;

    // Load from storage
    try {
      const stored = localStorage.getItem(`mellowise_achievements_${userId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const achievements = parsed.map((pa: any) => ({
          ...pa,
          unlockedAt: new Date(pa.unlockedAt)
        }));
        this.playerAchievements.set(userId, achievements);
        return achievements;
      }
    } catch (error) {
      console.warn('Error loading player achievements:', error);
    }

    return [];
  }

  /**
   * Get achievement progress for a specific achievement
   */
  async getAchievementProgress(userId: string, achievementId: string): Promise<AchievementProgress | null> {
    const userProgress = this.achievementProgress.get(userId);
    if (!userProgress) return null;

    return userProgress.get(achievementId) || null;
  }

  /**
   * Get all available achievements
   */
  getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return Array.from(this.achievements.values())
      .filter(achievement => achievement.category === category);
  }

  /**
   * Get achievement statistics
   */
  async getAchievementStats(userId: string): Promise<{
    totalAchievements: number;
    unlockedAchievements: number;
    completionRate: number;
    rareAchievements: number;
    categoryCounts: Record<AchievementCategory, number>;
  }> {
    const allAchievements = this.getAllAchievements();
    const playerAchievements = await this.getPlayerAchievements(userId);

    const rareAchievements = playerAchievements.filter(pa => pa.rarity < 0.1).length;

    const categoryCounts = allAchievements.reduce((counts, achievement) => {
      counts[achievement.category] = (counts[achievement.category] || 0) + 1;
      return counts;
    }, {} as Record<AchievementCategory, number>);

    return {
      totalAchievements: allAchievements.length,
      unlockedAchievements: playerAchievements.length,
      completionRate: (playerAchievements.length / allAchievements.length) * 100,
      rareAchievements,
      categoryCounts
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Calculate achievement progress
   */
  private async calculateProgress(
    userId: string,
    achievement: Achievement,
    data: Record<string, any>
  ): Promise<AchievementProgress> {
    const requirements: RequirementProgress[] = [];
    let overallProgress = 0;

    for (const requirement of achievement.requirements) {
      const reqProgress = await this.calculateRequirementProgress(userId, requirement, data);
      requirements.push(reqProgress);
    }

    // Calculate overall progress (all requirements must be met)
    const completedRequirements = requirements.filter(r => r.completed).length;
    overallProgress = (completedRequirements / requirements.length) * 100;

    const isCompleted = completedRequirements === requirements.length;
    const canComplete = requirements.every(r => r.percentage >= 90); // 90% threshold

    return {
      achievementId: achievement.id,
      progress: overallProgress,
      requirements,
      isCompleted,
      canComplete
    };
  }

  /**
   * Calculate progress for a single requirement
   */
  private async calculateRequirementProgress(
    userId: string,
    requirement: AchievementRequirement,
    data: Record<string, any>
  ): Promise<RequirementProgress> {
    let current = 0;
    const target = requirement.value;

    // Get current value based on metric
    switch (requirement.metric) {
      case 'questions_answered':
        current = await this.getUserStat(userId, 'totalQuestions', requirement.timeframe);
        break;

      case 'correct_answers':
        current = await this.getUserStat(userId, 'correctAnswers', requirement.timeframe);
        break;

      case 'accuracy_rate':
        current = await this.getUserStat(userId, 'accuracyRate', requirement.timeframe);
        break;

      case 'streak_length':
        current = data.currentStreak || 0;
        break;

      case 'study_days':
        current = await this.getUserStat(userId, 'studyDays', requirement.timeframe);
        break;

      case 'perfect_scores':
        current = await this.getUserStat(userId, 'perfectScores', requirement.timeframe);
        break;

      case 'tournaments_won':
        current = await this.getUserStat(userId, 'tournamentsWon', requirement.timeframe);
        break;

      case 'level_reached':
        current = data.currentLevel || 1;
        break;

      case 'xp_earned':
        current = await this.getUserStat(userId, 'xpEarned', requirement.timeframe);
        break;

      case 'section_mastery':
        current = await this.getUserStat(userId, `${requirement.section}_mastery`, requirement.timeframe);
        break;

      default:
        console.warn(`Unknown requirement metric: ${requirement.metric}`);
    }

    // Apply operator
    let completed = false;
    switch (requirement.operator) {
      case 'equals':
        completed = current === target;
        break;
      case 'greater_than':
        completed = current > target;
        break;
      case 'greater_equal':
        completed = current >= target;
        break;
      case 'less_than':
        completed = current < target;
        break;
      case 'less_equal':
        completed = current <= target;
        break;
    }

    const percentage = Math.min(100, (current / target) * 100);

    return {
      metric: requirement.metric,
      current,
      target,
      percentage,
      completed
    };
  }

  /**
   * Get user statistic
   */
  private async getUserStat(userId: string, stat: string, timeframe?: string): Promise<number> {
    // In real app, would query database with proper timeframe filtering
    // For now, return mock data based on localStorage

    try {
      const statsKey = `mellowise_stats_${userId}`;
      const stats = JSON.parse(localStorage.getItem(statsKey) || '{}');
      return stats[stat] || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Update achievement progress
   */
  private async updateProgress(userId: string, achievementId: string, progress: AchievementProgress): Promise<void> {
    let userProgress = this.achievementProgress.get(userId);
    if (!userProgress) {
      userProgress = new Map();
      this.achievementProgress.set(userId, userProgress);
    }

    userProgress.set(achievementId, progress);

    // Save to storage
    try {
      const progressData = Object.fromEntries(userProgress);
      localStorage.setItem(`mellowise_progress_${userId}`, JSON.stringify(progressData));
    } catch (error) {
      console.warn('Error saving achievement progress:', error);
    }
  }

  /**
   * Calculate achievement rarity
   */
  private async calculateRarity(achievementId: string): Promise<number> {
    // In real app, would calculate based on all players
    // For now, return mock rarity based on achievement difficulty

    const achievement = this.achievements.get(achievementId);
    if (!achievement) return 1.0;

    const rarityMap: Record<string, number> = {
      'bronze': 0.8,
      'silver': 0.6,
      'gold': 0.4,
      'platinum': 0.2,
      'legendary': 0.05
    };

    return rarityMap[achievement.difficulty] || 0.5;
  }

  /**
   * Award achievement rewards
   */
  private async awardAchievementRewards(userId: string, achievement: Achievement): Promise<void> {
    for (const reward of achievement.rewards) {
      await this.awardReward(userId, reward);
    }
  }

  /**
   * Award individual reward
   */
  private async awardReward(userId: string, reward: AchievementReward): Promise<void> {
    console.log(`🎁 Awarding ${reward.quantity}x ${reward.item} to ${userId}`);

    // In real app, would integrate with currency/item systems
    switch (reward.type) {
      case 'xp':
        // await xpSystem.awardXP(userId, 'achievement-unlock', reward.quantity);
        break;
      case 'currency':
        // await currencySystem.award(userId, reward.item, reward.quantity);
        break;
      case 'power-up':
        // await powerUpSystem.grant(userId, reward.item, reward.quantity);
        break;
      case 'cosmetic':
        // await cosmeticSystem.unlock(userId, reward.item);
        break;
    }
  }

  /**
   * Save player achievements to storage
   */
  private async savePlayerAchievements(userId: string, achievements: PlayerAchievement[]): Promise<void> {
    try {
      localStorage.setItem(`mellowise_achievements_${userId}`, JSON.stringify(achievements));
    } catch (error) {
      console.error('Failed to save achievements:', error);
    }
  }

  /**
   * Trigger achievement celebration
   */
  private triggerAchievementCelebration(userId: string, achievement: Achievement): void {
    // In real app, would trigger UI celebration animation
    console.log(`🎉 ACHIEVEMENT UNLOCKED: ${achievement.name}!`);

    // Store celebration for UI to display
    const celebration = {
      type: 'achievement',
      achievementId: achievement.id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      rarity: achievement.difficulty,
      timestamp: new Date()
    };

    try {
      const celebrationsKey = `mellowise_celebrations_${userId}`;
      const existing = JSON.parse(localStorage.getItem(celebrationsKey) || '[]');
      existing.push(celebration);
      localStorage.setItem(celebrationsKey, JSON.stringify(existing.slice(-10))); // Keep last 10
    } catch (error) {
      console.warn('Error storing celebration:', error);
    }
  }

  /**
   * Check if hidden achievement should be shown
   */
  private shouldShowHiddenAchievement(achievement: Achievement, data: Record<string, any>): boolean {
    // Custom logic for revealing hidden achievements
    // For example, show streak achievements when player has a streak

    if (achievement.id.includes('streak') && data.currentStreak >= 3) {
      return true;
    }

    if (achievement.id.includes('perfectionist') && data.perfectScore) {
      return true;
    }

    return false;
  }

  /**
   * Initialize all achievements
   */
  private initializeAchievements(): void {
    const achievements: Achievement[] = [
      // PERFORMANCE CATEGORY
      {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Answer your first question correctly',
        category: 'performance',
        type: 'single-event',
        difficulty: 'bronze',
        requirements: [
          { metric: 'correct_answers', operator: 'greater_equal', value: 1 }
        ],
        rewards: [
          { type: 'xp', item: 'bonus', quantity: 50 },
          { type: 'currency', item: 'coins', quantity: 100 }
        ],
        icon: '🎯',
        hidden: false,
        rare: false,
        order: 1
      },
      {
        id: 'quick_learner',
        name: 'Quick Learner',
        description: 'Answer 10 questions correctly',
        category: 'performance',
        type: 'cumulative',
        difficulty: 'bronze',
        requirements: [
          { metric: 'correct_answers', operator: 'greater_equal', value: 10 }
        ],
        rewards: [
          { type: 'xp', item: 'bonus', quantity: 100 },
          { type: 'currency', item: 'coins', quantity: 200 }
        ],
        icon: '🧠',
        hidden: false,
        rare: false,
        order: 2
      },
      {
        id: 'century_club',
        name: 'Century Club',
        description: 'Answer 100 questions correctly',
        category: 'performance',
        type: 'cumulative',
        difficulty: 'silver',
        requirements: [
          { metric: 'correct_answers', operator: 'greater_equal', value: 100 }
        ],
        rewards: [
          { type: 'xp', item: 'bonus', quantity: 500 },
          { type: 'currency', item: 'coins', quantity: 1000 },
          { type: 'badge', item: 'century_badge', quantity: 1 }
        ],
        icon: '💯',
        hidden: false,
        rare: false,
        order: 3
      },
      {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Achieve 100% accuracy in a practice session',
        category: 'performance',
        type: 'single-event',
        difficulty: 'gold',
        requirements: [
          { metric: 'accuracy_rate', operator: 'equals', value: 100 }
        ],
        rewards: [
          { type: 'xp', item: 'bonus', quantity: 300 },
          { type: 'currency', item: 'gems', quantity: 5 },
          { type: 'power-up', item: 'perfect_score_boost', quantity: 1 }
        ],
        icon: '⭐',
        hidden: true,
        rare: true,
        order: 4
      },

      // CONSISTENCY CATEGORY
      {
        id: 'daily_grind',
        name: 'Daily Grind',
        description: 'Study for 7 consecutive days',
        category: 'consistency',
        type: 'streak',
        difficulty: 'silver',
        requirements: [
          { metric: 'study_days', operator: 'greater_equal', value: 7, timeframe: 'week' }
        ],
        rewards: [
          { type: 'xp', item: 'bonus', quantity: 400 },
          { type: 'currency', item: 'coins', quantity: 500 }
        ],
        icon: '📅',
        hidden: false,
        rare: false,
        order: 5
      },
      {
        id: 'streak_master',
        name: 'Streak Master',
        description: 'Maintain a 10-question correct streak',
        category: 'consistency',
        type: 'streak',
        difficulty: 'gold',
        requirements: [
          { metric: 'streak_length', operator: 'greater_equal', value: 10 }
        ],
        rewards: [
          { type: 'xp', item: 'bonus', quantity: 600 },
          { type: 'power-up', item: 'streak_protector', quantity: 1 }
        ],
        icon: '🔥',
        hidden: true,
        rare: false,
        order: 6
      },

      // IMPROVEMENT CATEGORY
      {
        id: 'rising_star',
        name: 'Rising Star',
        description: 'Improve accuracy by 20% in a week',
        category: 'improvement',
        type: 'comparative',
        difficulty: 'silver',
        requirements: [
          { metric: 'accuracy_rate', operator: 'greater_equal', value: 20 }
        ],
        rewards: [
          { type: 'xp', item: 'bonus', quantity: 350 },
          { type: 'currency', item: 'coins', quantity: 400 }
        ],
        icon: '📈',
        hidden: false,
        rare: false,
        order: 7
      },

      // MASTERY CATEGORY
      {
        id: 'logic_games_novice',
        name: 'Logic Games Novice',
        description: 'Achieve 70% mastery in Logic Games',
        category: 'mastery',
        type: 'milestone',
        difficulty: 'bronze',
        requirements: [
          { metric: 'section_mastery', operator: 'greater_equal', value: 70, section: 'logic-games' }
        ],
        rewards: [
          { type: 'xp', item: 'bonus', quantity: 250 },
          { type: 'badge', item: 'logic_games_badge', quantity: 1 }
        ],
        icon: '🧩',
        hidden: false,
        rare: false,
        order: 8
      },
      {
        id: 'reasoning_expert',
        name: 'Reasoning Expert',
        description: 'Achieve 85% mastery in Logical Reasoning',
        category: 'mastery',
        type: 'milestone',
        difficulty: 'gold',
        requirements: [
          { metric: 'section_mastery', operator: 'greater_equal', value: 85, section: 'logical-reasoning' }
        ],
        rewards: [
          { type: 'xp', item: 'bonus', quantity: 500 },
          { type: 'currency', item: 'gems', quantity: 8 },
          { type: 'title', item: 'reasoning_expert', quantity: 1 }
        ],
        icon: '🎓',
        hidden: false,
        rare: true,
        order: 9
      },
      {
        id: 'triple_threat',
        name: 'Triple Threat',
        description: 'Achieve 80% mastery in all three sections',
        category: 'mastery',
        type: 'milestone',
        difficulty: 'platinum',
        requirements: [
          { metric: 'section_mastery', operator: 'greater_equal', value: 80, section: 'logical-reasoning' },
          { metric: 'section_mastery', operator: 'greater_equal', value: 80, section: 'reading-comprehension' },
          { metric: 'section_mastery', operator: 'greater_equal', value: 80, section: 'logic-games' }
        ],
        rewards: [
          { type: 'xp', item: 'bonus', quantity: 1000 },
          { type: 'currency', item: 'gems', quantity: 20 },
          { type: 'title', item: 'triple_threat', quantity: 1 },
          { type: 'cosmetic', item: 'platinum_theme', quantity: 1 }
        ],
        icon: '👑',
        hidden: false,
        rare: true,
        order: 10
      },

      // SOCIAL CATEGORY
      {
        id: 'tournament_debut',
        name: 'Tournament Debut',
        description: 'Participate in your first tournament',
        category: 'social',
        type: 'single-event',
        difficulty: 'bronze',
        requirements: [
          { metric: 'tournaments_participated', operator: 'greater_equal', value: 1 }
        ],
        rewards: [
          { type: 'xp', item: 'bonus', quantity: 200 },
          { type: 'currency', item: 'coins', quantity: 300 }
        ],
        icon: '🏟️',
        hidden: false,
        rare: false,
        order: 11
      },
      {
        id: 'champion',
        name: 'Champion',
        description: 'Win your first tournament',
        category: 'social',
        type: 'single-event',
        difficulty: 'gold',
        requirements: [
          { metric: 'tournaments_won', operator: 'greater_equal', value: 1 }
        ],
        rewards: [
          { type: 'xp', item: 'bonus', quantity: 800 },
          { type: 'currency', item: 'gems', quantity: 15 },
          { type: 'title', item: 'champion', quantity: 1 }
        ],
        icon: '🏆',
        hidden: false,
        rare: true,
        order: 12
      },

      // EXPLORATION CATEGORY
      {
        id: 'power_user',
        name: 'Power User',
        description: 'Use your first power-up',
        category: 'exploration',
        type: 'single-event',
        difficulty: 'bronze',
        requirements: [
          { metric: 'power_ups_used', operator: 'greater_equal', value: 1 }
        ],
        rewards: [
          { type: 'xp', item: 'bonus', quantity: 150 },
          { type: 'power-up', item: 'random', quantity: 1 }
        ],
        icon: '⚡',
        hidden: false,
        rare: false,
        order: 13
      },

      // DEDICATION CATEGORY
      {
        id: 'level_up',
        name: 'Level Up!',
        description: 'Reach level 10',
        category: 'dedication',
        type: 'milestone',
        difficulty: 'silver',
        requirements: [
          { metric: 'level_reached', operator: 'greater_equal', value: 10 }
        ],
        rewards: [
          { type: 'xp', item: 'bonus', quantity: 400 },
          { type: 'currency', item: 'coins', quantity: 500 },
          { type: 'badge', item: 'level_10_badge', quantity: 1 }
        ],
        icon: '🆙',
        hidden: false,
        rare: false,
        order: 14
      },
      {
        id: 'veteran',
        name: 'Veteran',
        description: 'Reach level 25',
        category: 'dedication',
        type: 'milestone',
        difficulty: 'gold',
        requirements: [
          { metric: 'level_reached', operator: 'greater_equal', value: 25 }
        ],
        rewards: [
          { type: 'xp', item: 'bonus', quantity: 750 },
          { type: 'currency', item: 'gems', quantity: 12 },
          { type: 'title', item: 'veteran', quantity: 1 }
        ],
        icon: '⭐',
        hidden: false,
        rare: true,
        order: 15
      },

      // SPECIAL CATEGORY
      {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Complete a study session before 8 AM',
        category: 'special',
        type: 'single-event',
        difficulty: 'bronze',
        requirements: [
          { metric: 'early_session', operator: 'greater_equal', value: 1 }
        ],
        rewards: [
          { type: 'xp', item: 'bonus', quantity: 200 },
          { type: 'currency', item: 'coins', quantity: 250 }
        ],
        icon: '🌅',
        hidden: false,
        rare: false,
        order: 16
      },
      {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Complete a study session after 10 PM',
        category: 'special',
        type: 'single-event',
        difficulty: 'bronze',
        requirements: [
          { metric: 'late_session', operator: 'greater_equal', value: 1 }
        ],
        rewards: [
          { type: 'xp', item: 'bonus', quantity: 200 },
          { type: 'currency', item: 'coins', quantity: 250 }
        ],
        icon: '🦉',
        hidden: false,
        rare: false,
        order: 17
      },
      {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Answer 5 questions correctly in under 3 minutes',
        category: 'special',
        type: 'timed',
        difficulty: 'gold',
        requirements: [
          { metric: 'speed_challenge', operator: 'greater_equal', value: 1 }
        ],
        rewards: [
          { type: 'xp', item: 'bonus', quantity: 600 },
          { type: 'power-up', item: 'time_bonus', quantity: 2 },
          { type: 'title', item: 'speed_demon', quantity: 1 }
        ],
        icon: '💨',
        hidden: true,
        rare: true,
        order: 18
      },
      {
        id: 'legendary_scholar',
        name: 'Legendary Scholar',
        description: 'Reach level 50 and achieve 95% overall accuracy',
        category: 'special',
        type: 'milestone',
        difficulty: 'legendary',
        requirements: [
          { metric: 'level_reached', operator: 'greater_equal', value: 50 },
          { metric: 'accuracy_rate', operator: 'greater_equal', value: 95 }
        ],
        rewards: [
          { type: 'xp', item: 'bonus', quantity: 2000 },
          { type: 'currency', item: 'gems', quantity: 50 },
          { type: 'title', item: 'legendary_scholar', quantity: 1 },
          { type: 'cosmetic', item: 'legendary_theme', quantity: 1 },
          { type: 'cosmetic', item: 'crown_avatar', quantity: 1 }
        ],
        icon: '🏅',
        hidden: false,
        rare: true,
        order: 19
      }
    ];

    // Add achievements to map
    achievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });

    console.log(`🏆 Initialized ${achievements.length} achievements`);
  }
}

// Export singleton instance
export const achievementSystem = new AchievementSystemService();