/**
 * XP and Leveling System
 * MELLOWISE-026: Comprehensive experience points and level progression system
 */

import type {
  ExperiencePoints,
  XPSource,
  XPActionType,
  LevelDefinition,
  PlayerLevel,
  XP_VALUES
} from '@/types/gamification';

export class XPSystemService {
  private levelDefinitions: LevelDefinition[] = [];
  private xpMultipliers: Map<string, number> = new Map();
  private streakBonuses: Map<string, number> = new Map();

  constructor() {
    this.initializeLevelSystem();
    this.initializeMultipliers();
  }

  /**
   * Award XP to a player
   */
  async awardXP(
    userId: string,
    action: XPActionType,
    customAmount?: number,
    sessionId?: string,
    context?: Record<string, any>
  ): Promise<ExperiencePoints> {
    const baseAmount = customAmount ?? XP_VALUES[action];
    const multiplier = this.calculateMultiplier(action, context);
    const finalAmount = Math.floor(baseAmount * multiplier);

    // Get current XP
    const currentXP = await this.getPlayerXP(userId);

    // Create XP source entry
    const xpSource: XPSource = {
      action,
      amount: finalAmount,
      timestamp: new Date(),
      multiplier,
      description: this.getActionDescription(action, context),
      sessionId
    };

    // Update total XP
    const newTotalXP = currentXP.total + finalAmount;
    const newLevel = this.calculateLevelFromXP(newTotalXP);
    const levelChanged = newLevel.currentLevel > currentXP.currentLevel;

    // Create updated XP object
    const updatedXP: ExperiencePoints = {
      total: newTotalXP,
      currentLevel: newLevel.currentLevel,
      currentLevelXP: newLevel.currentLevelXP,
      nextLevelXP: newLevel.nextLevelXP,
      xpToNextLevel: newLevel.nextLevelXP - newLevel.currentLevelXP,
      weeklyXP: currentXP.weeklyXP + finalAmount,
      monthlyXP: currentXP.monthlyXP + finalAmount,
      source: [...currentXP.source, xpSource].slice(-100) // Keep last 100 sources
    };

    // Save to storage (in real app, this would be database)
    await this.savePlayerXP(userId, updatedXP);

    // Handle level up
    if (levelChanged) {
      await this.handleLevelUp(userId, currentXP.currentLevel, newLevel.currentLevel);
    }

    console.log(`🎉 Awarded ${finalAmount} XP to ${userId} for ${action}`);

    return updatedXP;
  }

  /**
   * Get player's current XP data
   */
  async getPlayerXP(userId: string): Promise<ExperiencePoints> {
    // In real app, fetch from database
    const stored = localStorage.getItem(`mellowise_xp_${userId}`);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        parsed.source = parsed.source.map((s: any) => ({
          ...s,
          timestamp: new Date(s.timestamp)
        }));
        return parsed;
      } catch (error) {
        console.warn('Error parsing stored XP data:', error);
      }
    }

    // Return default XP structure
    return {
      total: 0,
      currentLevel: 1,
      currentLevelXP: 0,
      nextLevelXP: this.getXPRequiredForLevel(2),
      xpToNextLevel: this.getXPRequiredForLevel(2),
      weeklyXP: 0,
      monthlyXP: 0,
      source: []
    };
  }

  /**
   * Calculate player level from total XP
   */
  calculateLevelFromXP(totalXP: number): PlayerLevel {
    let currentLevel = 1;
    let xpForCurrentLevel = 0;

    // Find the highest level the player can reach
    for (let level = 1; level <= this.levelDefinitions.length; level++) {
      const levelDef = this.levelDefinitions[level - 1];
      if (totalXP >= levelDef.totalXPRequired) {
        currentLevel = level;
        xpForCurrentLevel = levelDef.totalXPRequired;
      } else {
        break;
      }
    }

    // Calculate XP within current level
    const nextLevel = Math.min(currentLevel + 1, this.levelDefinitions.length);
    const nextLevelXP = this.getXPRequiredForLevel(nextLevel);
    const currentLevelXP = totalXP - xpForCurrentLevel;

    const progressToNext = nextLevel > this.levelDefinitions.length ? 100 :
      ((currentLevelXP) / (nextLevelXP - xpForCurrentLevel)) * 100;

    const levelDef = this.levelDefinitions[currentLevel - 1];

    return {
      currentLevel,
      xp: totalXP,
      title: levelDef?.title || 'Student',
      progressToNext: Math.min(100, progressToNext),
      recentlyLeveledUp: false
    };
  }

  /**
   * Get XP required for a specific level
   */
  getXPRequiredForLevel(level: number): number {
    if (level <= 1) return 0;
    if (level > this.levelDefinitions.length) {
      return this.levelDefinitions[this.levelDefinitions.length - 1].totalXPRequired;
    }

    return this.levelDefinitions[level - 1].totalXPRequired;
  }

  /**
   * Get level definition by level number
   */
  getLevelDefinition(level: number): LevelDefinition | null {
    if (level < 1 || level > this.levelDefinitions.length) return null;
    return this.levelDefinitions[level - 1];
  }

  /**
   * Calculate XP multiplier based on context
   */
  private calculateMultiplier(action: XPActionType, context?: Record<string, any>): number {
    let multiplier = 1.0;

    // Base multiplier for action type
    const baseMultiplier = this.xpMultipliers.get(action) || 1.0;
    multiplier *= baseMultiplier;

    if (!context) return multiplier;

    // Difficulty multiplier
    if (context.difficulty) {
      const difficultyMultiplier = Math.max(0.5, Math.min(2.0, context.difficulty / 5));
      multiplier *= difficultyMultiplier;
    }

    // Streak bonus
    if (context.streak && context.streak > 1) {
      const streakBonus = Math.min(0.5, (context.streak - 1) * 0.1); // Max 50% bonus
      multiplier += streakBonus;
    }

    // Speed bonus (answered quickly)
    if (context.timeSpent && context.timeUnder && context.timeSpent < context.timeUnder) {
      const speedBonus = 0.2; // 20% bonus for fast answers
      multiplier += speedBonus;
    }

    // Perfect score bonus
    if (context.perfectScore) {
      multiplier *= 1.5; // 50% bonus
    }

    // First attempt bonus
    if (context.firstAttempt) {
      multiplier += 0.1; // 10% bonus
    }

    return Math.round(multiplier * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get description for XP action
   */
  private getActionDescription(action: XPActionType, context?: Record<string, any>): string {
    const descriptions: Record<XPActionType, string> = {
      'correct-answer': 'Correct answer',
      'incorrect-answer': 'Learning from mistake',
      'streak-bonus': 'Answer streak bonus',
      'daily-goal': 'Daily goal completed',
      'weekly-challenge': 'Weekly challenge completed',
      'achievement-unlock': 'Achievement unlocked',
      'tournament-win': 'Tournament victory',
      'tournament-participation': 'Tournament participation',
      'perfect-score': 'Perfect score achieved',
      'improvement-bonus': 'Performance improvement',
      'consistency-bonus': 'Consistent practice',
      'milestone-reached': 'Milestone reached',
      'power-up-purchase': 'Power-up purchased'
    };

    let description = descriptions[action] || 'Unknown action';

    // Add context details
    if (context) {
      if (context.streak > 1) {
        description += ` (${context.streak}x streak)`;
      }
      if (context.difficulty) {
        description += ` (difficulty ${context.difficulty})`;
      }
      if (context.section) {
        description += ` in ${context.section}`;
      }
    }

    return description;
  }

  /**
   * Handle player level up
   */
  private async handleLevelUp(userId: string, oldLevel: number, newLevel: number): Promise<void> {
    console.log(`🎉 Player ${userId} leveled up: ${oldLevel} → ${newLevel}`);

    // Get level definition for rewards
    const levelDef = this.getLevelDefinition(newLevel);
    if (!levelDef) return;

    // Award level up rewards
    for (const reward of levelDef.rewards) {
      await this.awardLevelReward(userId, reward);
    }

    // Unlock new features
    for (const feature of levelDef.unlockedFeatures) {
      await this.unlockFeature(userId, feature);
    }

    // Award level up XP bonus
    await this.awardXP(userId, 'milestone-reached', 100, undefined, {
      milestone: `Level ${newLevel}`,
      levelUp: true
    });

    // Store level up notification
    await this.storeLevelUpNotification(userId, newLevel, levelDef);
  }

  /**
   * Award level rewards
   */
  private async awardLevelReward(userId: string, reward: any): Promise<void> {
    console.log(`🎁 Awarding ${reward.quantity}x ${reward.item} to ${userId}`);

    // In real app, would update user's currency/items
    switch (reward.type) {
      case 'currency':
        // await currencyService.award(userId, reward.item, reward.quantity);
        break;
      case 'power-up':
        // await powerUpService.grant(userId, reward.item, reward.quantity);
        break;
      case 'badge':
        // await badgeService.award(userId, reward.item);
        break;
    }
  }

  /**
   * Unlock feature for user
   */
  private async unlockFeature(userId: string, feature: string): Promise<void> {
    console.log(`🔓 Unlocked ${feature} for ${userId}`);

    // Store unlocked features
    const unlockedKey = `mellowise_unlocked_${userId}`;
    const existing = JSON.parse(localStorage.getItem(unlockedKey) || '[]');
    if (!existing.includes(feature)) {
      existing.push(feature);
      localStorage.setItem(unlockedKey, JSON.stringify(existing));
    }
  }

  /**
   * Store level up notification
   */
  private async storeLevelUpNotification(userId: string, newLevel: number, levelDef: LevelDefinition): Promise<void> {
    const notification = {
      type: 'level-up',
      level: newLevel,
      title: levelDef.title,
      rewards: levelDef.rewards,
      features: levelDef.unlockedFeatures,
      timestamp: new Date()
    };

    // Store notification (in real app, would use proper notification system)
    const notifKey = `mellowise_notifications_${userId}`;
    const existing = JSON.parse(localStorage.getItem(notifKey) || '[]');
    existing.push(notification);
    localStorage.setItem(notifKey, JSON.stringify(existing.slice(-50))); // Keep last 50
  }

  /**
   * Save player XP data
   */
  private async savePlayerXP(userId: string, xpData: ExperiencePoints): Promise<void> {
    try {
      localStorage.setItem(`mellowise_xp_${userId}`, JSON.stringify(xpData));
    } catch (error) {
      console.error('Failed to save XP data:', error);
    }
  }

  /**
   * Initialize level system with 50 levels
   */
  private initializeLevelSystem(): void {
    this.levelDefinitions = [];

    for (let level = 1; level <= 50; level++) {
      const baseXP = 1000;
      const multiplier = 1.5;
      const xpRequired = Math.floor(baseXP * Math.pow(multiplier, (level - 1) * 0.3));
      const totalXPRequired = level === 1 ? 0 : this.levelDefinitions.reduce((sum, def) => sum + def.xpRequired, xpRequired);

      const levelDef: LevelDefinition = {
        level,
        xpRequired,
        totalXPRequired,
        title: this.getLevelTitle(level),
        description: `Reach level ${level} mastery`,
        rewards: this.generateLevelRewards(level),
        unlockedFeatures: this.getLevelFeatures(level),
        badge: `/badges/level-${Math.ceil(level / 10) * 10}.svg`
      };

      this.levelDefinitions.push(levelDef);
    }

    console.log(`📊 Initialized ${this.levelDefinitions.length} level definitions`);
  }

  /**
   * Get level title based on level number
   */
  private getLevelTitle(level: number): string {
    if (level <= 5) return 'Novice Scholar';
    if (level <= 10) return 'Apprentice Thinker';
    if (level <= 15) return 'Skilled Student';
    if (level <= 20) return 'Advanced Learner';
    if (level <= 25) return 'Expert Analyst';
    if (level <= 30) return 'Master Reasoner';
    if (level <= 35) return 'Elite Scholar';
    if (level <= 40) return 'Legendary Thinker';
    if (level <= 45) return 'Supreme Master';
    return 'Grandmaster Scholar';
  }

  /**
   * Generate rewards for each level
   */
  private generateLevelRewards(level: number): any[] {
    const rewards: any[] = [];

    // Currency rewards (coins)
    rewards.push({
      type: 'currency',
      item: 'coins',
      quantity: level * 50,
      description: `${level * 50} coins`
    });

    // Special rewards at milestone levels
    if (level % 5 === 0) {
      rewards.push({
        type: 'power-up',
        item: 'time-bonus',
        quantity: 1,
        description: 'Time Bonus Power-up'
      });

      if (level >= 10) {
        rewards.push({
          type: 'currency',
          item: 'gems',
          quantity: Math.floor(level / 5),
          description: `${Math.floor(level / 5)} gems`
        });
      }
    }

    // Badge rewards at every 10th level
    if (level % 10 === 0) {
      rewards.push({
        type: 'badge',
        item: `level-${level}-master`,
        quantity: 1,
        description: `Level ${level} Master Badge`
      });
    }

    // Special cosmetic rewards
    if (level === 25) {
      rewards.push({
        type: 'cosmetic',
        item: 'golden-theme',
        quantity: 1,
        description: 'Golden Theme Unlock'
      });
    }

    if (level === 50) {
      rewards.push({
        type: 'cosmetic',
        item: 'grandmaster-title',
        quantity: 1,
        description: 'Grandmaster Title'
      });
    }

    return rewards;
  }

  /**
   * Get features unlocked at each level
   */
  private getLevelFeatures(level: number): string[] {
    const features: string[] = [];

    if (level >= 3) features.push('hints');
    if (level >= 5) features.push('daily-challenges');
    if (level >= 8) features.push('progress-tracking');
    if (level >= 10) features.push('tournaments');
    if (level >= 12) features.push('advanced-analytics');
    if (level >= 15) features.push('power-up-store');
    if (level >= 18) features.push('study-groups');
    if (level >= 20) features.push('social-sharing');
    if (level >= 25) features.push('custom-themes');
    if (level >= 30) features.push('advanced-challenges');
    if (level >= 35) features.push('mentor-mode');
    if (level >= 40) features.push('expert-tournaments');
    if (level >= 45) features.push('teaching-tools');
    if (level >= 50) features.push('legend-status');

    return features;
  }

  /**
   * Initialize XP multipliers
   */
  private initializeMultipliers(): void {
    this.xpMultipliers.set('correct-answer', 1.0);
    this.xpMultipliers.set('incorrect-answer', 0.2);
    this.xpMultipliers.set('streak-bonus', 1.0);
    this.xpMultipliers.set('daily-goal', 2.0);
    this.xpMultipliers.set('weekly-challenge', 3.0);
    this.xpMultipliers.set('achievement-unlock', 1.5);
    this.xpMultipliers.set('tournament-win', 5.0);
    this.xpMultipliers.set('tournament-participation', 1.0);
    this.xpMultipliers.set('perfect-score', 2.0);
    this.xpMultipliers.set('improvement-bonus', 1.2);
    this.xpMultipliers.set('consistency-bonus', 1.3);
    this.xpMultipliers.set('milestone-reached', 2.0);
    this.xpMultipliers.set('power-up-purchase', 0.0); // No bonus XP for spending
  }
}

// Export singleton instance
export const xpSystem = new XPSystemService();