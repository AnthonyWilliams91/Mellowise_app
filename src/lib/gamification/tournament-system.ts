/**
 * Tournament System
 * MELLOWISE-026: Competitive tournament and leaderboard system
 */

import type {
  Tournament,
  TournamentType,
  TournamentFormat,
  TournamentStatus,
  TournamentRule,
  TournamentPrize,
  TournamentParticipant,
  TournamentMatch,
  Leaderboard,
  LeaderboardEntry
} from '@/types/gamification';

export class TournamentSystemService {
  private tournaments: Map<string, Tournament> = new Map();
  private participants: Map<string, TournamentParticipant[]> = new Map();
  private matches: Map<string, TournamentMatch[]> = new Map();
  private leaderboards: Map<string, Leaderboard> = new Map();

  constructor() {
    this.initializeDefaultTournaments();
  }

  /**
   * Create a new tournament
   */
  async createTournament(tournamentData: Omit<Tournament, 'id'>): Promise<Tournament> {
    const tournament: Tournament = {
      ...tournamentData,
      id: this.generateTournamentId(),
      currentParticipants: 0
    };

    this.tournaments.set(tournament.id, tournament);
    this.participants.set(tournament.id, []);
    this.matches.set(tournament.id, []);

    await this.saveTournament(tournament);

    console.log(`🏟️ Created tournament: ${tournament.name}`);
    return tournament;
  }

  /**
   * Join a tournament
   */
  async joinTournament(userId: string, tournamentId: string): Promise<boolean> {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      console.warn(`Tournament ${tournamentId} not found`);
      return false;
    }

    // Check tournament status
    if (tournament.status !== 'registration') {
      console.warn(`Tournament ${tournamentId} is not accepting registrations`);
      return false;
    }

    // Check if already registered
    const participants = this.participants.get(tournamentId) || [];
    if (participants.some(p => p.userId === userId)) {
      console.warn(`User ${userId} already registered for tournament ${tournamentId}`);
      return false;
    }

    // Check capacity
    if (participants.length >= tournament.maxParticipants) {
      console.warn(`Tournament ${tournamentId} is full`);
      return false;
    }

    // Check entry fee (in real app, would validate currency)
    if (tournament.entryFee > 0) {
      const canAfford = await this.checkEntryFee(userId, tournament.entryFee);
      if (!canAfford) {
        console.warn(`User ${userId} cannot afford entry fee for tournament ${tournamentId}`);
        return false;
      }
    }

    // Create participant
    const participant: TournamentParticipant = {
      userId,
      username: await this.getUserName(userId),
      registeredAt: new Date(),
      currentScore: 0,
      currentRank: participants.length + 1,
      matches: [],
      eliminated: false
    };

    // Add participant
    participants.push(participant);
    this.participants.set(tournamentId, participants);

    // Update tournament participant count
    tournament.currentParticipants = participants.length;
    this.tournaments.set(tournamentId, tournament);

    // Deduct entry fee
    if (tournament.entryFee > 0) {
      await this.deductEntryFee(userId, tournament.entryFee);
    }

    await this.saveTournament(tournament);

    console.log(`🎯 User ${userId} joined tournament ${tournament.name}`);
    return true;
  }

  /**
   * Update tournament score for a participant
   */
  async updateTournamentScore(userId: string, tournamentId: string, score: number): Promise<void> {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament || tournament.status !== 'active') {
      console.warn(`Tournament ${tournamentId} not found or not active`);
      return;
    }

    const participants = this.participants.get(tournamentId) || [];
    const participant = participants.find(p => p.userId === userId);

    if (!participant) {
      console.warn(`User ${userId} not found in tournament ${tournamentId}`);
      return;
    }

    // Update score
    participant.currentScore += score;

    // Recalculate rankings
    await this.updateTournamentRankings(tournamentId);

    console.log(`📊 Updated score for ${userId} in tournament ${tournament.name}: +${score}`);
  }

  /**
   * Get tournament leaderboard
   */
  async getTournamentLeaderboard(tournamentId: string): Promise<Leaderboard> {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      throw new Error(`Tournament ${tournamentId} not found`);
    }

    const participants = this.participants.get(tournamentId) || [];

    // Sort by score (descending)
    const sortedParticipants = participants
      .slice()
      .sort((a, b) => b.currentScore - a.currentScore);

    // Create leaderboard entries
    const entries: LeaderboardEntry[] = sortedParticipants.map((participant, index) => ({
      rank: index + 1,
      userId: participant.userId,
      username: participant.username,
      score: participant.currentScore,
      change: participant.currentRank - (index + 1), // Rank change
      trend: this.calculateTrend(participant.currentRank, index + 1),
      level: await this.getUserLevel(participant.userId)
    }));

    const leaderboard: Leaderboard = {
      tournamentId,
      type: this.mapTournamentTypeToLeaderboardType(tournament.type),
      timeframe: 'all-time',
      entries,
      lastUpdated: new Date(),
      totalPlayers: participants.length
    };

    this.leaderboards.set(tournamentId, leaderboard);
    return leaderboard;
  }

  /**
   * Start a tournament
   */
  async startTournament(tournamentId: string): Promise<void> {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      console.warn(`Tournament ${tournamentId} not found`);
      return;
    }

    if (tournament.status !== 'registration') {
      console.warn(`Tournament ${tournamentId} cannot be started from status ${tournament.status}`);
      return;
    }

    const participants = this.participants.get(tournamentId) || [];
    if (participants.length < 2) {
      console.warn(`Tournament ${tournamentId} needs at least 2 participants to start`);
      return;
    }

    // Update status
    tournament.status = 'active';
    tournament.startDate = new Date();
    this.tournaments.set(tournamentId, tournament);

    // Generate matches based on format
    await this.generateMatches(tournamentId);

    await this.saveTournament(tournament);

    console.log(`🚀 Started tournament: ${tournament.name} with ${participants.length} participants`);
  }

  /**
   * End a tournament and distribute prizes
   */
  async endTournament(tournamentId: string): Promise<void> {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      console.warn(`Tournament ${tournamentId} not found`);
      return;
    }

    tournament.status = 'completed';
    tournament.endDate = new Date();
    this.tournaments.set(tournamentId, tournament);

    // Get final leaderboard
    const leaderboard = await this.getTournamentLeaderboard(tournamentId);

    // Distribute prizes
    await this.distributePrizes(tournament, leaderboard.entries);

    await this.saveTournament(tournament);

    console.log(`🏁 Ended tournament: ${tournament.name}`);
  }

  /**
   * Get all tournaments
   */
  getAllTournaments(): Tournament[] {
    return Array.from(this.tournaments.values());
  }

  /**
   * Get tournaments by status
   */
  getTournamentsByStatus(status: TournamentStatus): Tournament[] {
    return Array.from(this.tournaments.values())
      .filter(tournament => tournament.status === status);
  }

  /**
   * Get global leaderboard
   */
  async getGlobalLeaderboard(
    type: Leaderboard['type'],
    timeframe: Leaderboard['timeframe']
  ): Promise<Leaderboard> {
    // In real app, would aggregate from database
    // For now, create a mock global leaderboard

    const mockEntries: LeaderboardEntry[] = [
      {
        rank: 1,
        userId: 'user1',
        username: 'TopPlayer',
        score: 12450,
        change: 0,
        trend: 'stable',
        level: 35
      },
      {
        rank: 2,
        userId: 'user2',
        username: 'SecondPlace',
        score: 11800,
        change: 1,
        trend: 'up',
        level: 32
      }
      // ... more entries
    ];

    return {
      type,
      timeframe,
      entries: mockEntries,
      lastUpdated: new Date(),
      totalPlayers: 1000 // Mock total
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Generate unique tournament ID
   */
  private generateTournamentId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `tournament_${timestamp}_${random}`;
  }

  /**
   * Update tournament rankings
   */
  private async updateTournamentRankings(tournamentId: string): Promise<void> {
    const participants = this.participants.get(tournamentId) || [];

    // Sort by score and update ranks
    participants.sort((a, b) => b.currentScore - a.currentScore);

    participants.forEach((participant, index) => {
      participant.currentRank = index + 1;
    });

    this.participants.set(tournamentId, participants);
  }

  /**
   * Calculate trend direction
   */
  private calculateTrend(oldRank: number, newRank: number): 'up' | 'down' | 'stable' {
    if (newRank < oldRank) return 'up';
    if (newRank > oldRank) return 'down';
    return 'stable';
  }

  /**
   * Map tournament type to leaderboard type
   */
  private mapTournamentTypeToLeaderboardType(tournamentType: TournamentType): Leaderboard['type'] {
    const mapping: Record<TournamentType, Leaderboard['type']> = {
      'speed': 'speed',
      'accuracy': 'accuracy',
      'endurance': 'xp',
      'improvement': 'improvement',
      'mixed': 'xp'
    };
    return mapping[tournamentType];
  }

  /**
   * Generate matches based on tournament format
   */
  private async generateMatches(tournamentId: string): Promise<void> {
    const tournament = this.tournaments.get(tournamentId);
    const participants = this.participants.get(tournamentId) || [];

    if (!tournament || participants.length === 0) return;

    const matches: TournamentMatch[] = [];

    switch (tournament.format) {
      case 'leaderboard':
        // No specific matches needed - just track scores
        break;

      case 'elimination':
        matches.push(...this.generateEliminationMatches(tournamentId, participants));
        break;

      case 'round-robin':
        matches.push(...this.generateRoundRobinMatches(tournamentId, participants));
        break;

      case 'bracket':
        matches.push(...this.generateBracketMatches(tournamentId, participants));
        break;
    }

    this.matches.set(tournamentId, matches);
  }

  /**
   * Generate elimination matches
   */
  private generateEliminationMatches(tournamentId: string, participants: TournamentParticipant[]): TournamentMatch[] {
    const matches: TournamentMatch[] = [];
    const shuffled = [...participants].sort(() => Math.random() - 0.5);

    // Create first round matches
    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        matches.push({
          id: `${tournamentId}_match_${matches.length + 1}`,
          tournamentId,
          round: 1,
          participants: [shuffled[i].userId, shuffled[i + 1].userId],
          scores: {},
          status: 'scheduled',
          startTime: new Date()
        });
      }
    }

    return matches;
  }

  /**
   * Generate round-robin matches
   */
  private generateRoundRobinMatches(tournamentId: string, participants: TournamentParticipant[]): TournamentMatch[] {
    const matches: TournamentMatch[] = [];

    // Every participant plays every other participant
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        matches.push({
          id: `${tournamentId}_match_${matches.length + 1}`,
          tournamentId,
          round: 1,
          participants: [participants[i].userId, participants[j].userId],
          scores: {},
          status: 'scheduled',
          startTime: new Date()
        });
      }
    }

    return matches;
  }

  /**
   * Generate bracket matches
   */
  private generateBracketMatches(tournamentId: string, participants: TournamentParticipant[]): TournamentMatch[] {
    // Similar to elimination but with bracket structure
    return this.generateEliminationMatches(tournamentId, participants);
  }

  /**
   * Distribute prizes to winners
   */
  private async distributePrizes(tournament: Tournament, entries: LeaderboardEntry[]): Promise<void> {
    for (const prize of tournament.prizePool) {
      const winners = this.getWinnersByRank(entries, prize.rank);

      for (const winner of winners) {
        console.log(`🏆 Awarding prizes to ${winner.username} (rank ${winner.rank})`);

        for (const reward of prize.rewards) {
          await this.awardPrize(winner.userId, reward);
        }
      }
    }
  }

  /**
   * Get winners by rank string
   */
  private getWinnersByRank(entries: LeaderboardEntry[], rankString: string): LeaderboardEntry[] {
    if (rankString === '1st') return entries.filter(e => e.rank === 1);
    if (rankString === '2nd') return entries.filter(e => e.rank === 2);
    if (rankString === '3rd') return entries.filter(e => e.rank === 3);
    if (rankString.includes('Top')) {
      const percent = parseInt(rankString.replace('Top ', '').replace('%', ''));
      const threshold = Math.ceil(entries.length * (percent / 100));
      return entries.filter(e => e.rank <= threshold);
    }
    return [];
  }

  /**
   * Award prize to user
   */
  private async awardPrize(userId: string, prize: any): Promise<void> {
    console.log(`🎁 Awarding ${prize.quantity}x ${prize.item} to ${userId}`);

    // In real app, would integrate with reward systems
    switch (prize.type) {
      case 'xp':
        // await xpSystem.awardXP(userId, 'tournament-win', prize.quantity);
        break;
      case 'currency':
        // await currencySystem.award(userId, prize.item, prize.quantity);
        break;
      case 'power-up':
        // await powerUpSystem.grant(userId, prize.item, prize.quantity);
        break;
    }
  }

  /**
   * Check if user can afford entry fee
   */
  private async checkEntryFee(userId: string, fee: number): Promise<boolean> {
    // In real app, would check user's currency balance
    return true; // Mock: always affordable
  }

  /**
   * Deduct entry fee from user
   */
  private async deductEntryFee(userId: string, fee: number): Promise<void> {
    console.log(`💰 Deducted ${fee} coins from ${userId} for tournament entry`);
    // In real app, would update user's currency balance
  }

  /**
   * Get user name
   */
  private async getUserName(userId: string): Promise<string> {
    // In real app, would fetch from user profile
    return `Player_${userId.slice(-4)}`;
  }

  /**
   * Get user level
   */
  private async getUserLevel(userId: string): Promise<number> {
    // In real app, would fetch from XP system
    return Math.floor(Math.random() * 50) + 1; // Mock level 1-50
  }

  /**
   * Save tournament to storage
   */
  private async saveTournament(tournament: Tournament): Promise<void> {
    try {
      localStorage.setItem(`mellowise_tournament_${tournament.id}`, JSON.stringify(tournament));
    } catch (error) {
      console.error('Failed to save tournament:', error);
    }
  }

  /**
   * Initialize default tournaments
   */
  private initializeDefaultTournaments(): void {
    const defaultTournaments: Omit<Tournament, 'id'>[] = [
      {
        name: 'Daily Speed Challenge',
        description: 'Answer questions as fast as possible with accuracy',
        type: 'speed',
        format: 'leaderboard',
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        registrationEnd: new Date(Date.now() + 23 * 60 * 60 * 1000), // 23 hours
        status: 'registration',
        maxParticipants: 100,
        currentParticipants: 0,
        entryFee: 0,
        prizePool: [
          {
            rank: '1st',
            rewards: [
              { type: 'currency', item: 'gems', quantity: 10 },
              { type: 'xp', item: 'bonus', quantity: 500 }
            ]
          },
          {
            rank: 'Top 10%',
            rewards: [
              { type: 'currency', item: 'coins', quantity: 500 },
              { type: 'xp', item: 'bonus', quantity: 200 }
            ]
          }
        ],
        rules: [
          { rule: 'Speed matters', description: 'Faster correct answers earn more points' },
          { rule: 'Accuracy required', description: 'Wrong answers deduct points' }
        ],
        categories: ['logical-reasoning', 'reading-comprehension', 'logic-games']
      },
      {
        name: 'Weekly Accuracy Championship',
        description: 'Compete for the highest accuracy rate',
        type: 'accuracy',
        format: 'leaderboard',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        registrationEnd: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days
        status: 'registration',
        maxParticipants: 200,
        currentParticipants: 0,
        entryFee: 100,
        prizePool: [
          {
            rank: '1st',
            rewards: [
              { type: 'currency', item: 'gems', quantity: 25 },
              { type: 'title', item: 'accuracy_champion', quantity: 1 }
            ]
          },
          {
            rank: '2nd',
            rewards: [
              { type: 'currency', item: 'gems', quantity: 15 }
            ]
          },
          {
            rank: '3rd',
            rewards: [
              { type: 'currency', item: 'gems', quantity: 10 }
            ]
          }
        ],
        rules: [
          { rule: 'Minimum questions', description: 'Must answer at least 50 questions to qualify' },
          { rule: 'Accuracy focus', description: 'Only accuracy matters, speed is not scored' }
        ],
        categories: ['logical-reasoning', 'reading-comprehension', 'logic-games']
      }
    ];

    // Create default tournaments
    defaultTournaments.forEach(async (tournamentData) => {
      await this.createTournament(tournamentData);
    });
  }
}

// Export singleton instance
export const tournamentSystem = new TournamentSystemService();