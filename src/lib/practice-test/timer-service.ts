/**
 * Practice Test Timer Service
 * Manages section timing, warnings, breaks, and timer synchronization
 */

import {
  SectionTimer,
  BreakTimer,
  TestTimer,
  TimerWarning,
  TestEvent,
  LSATSection,
  PracticeTestSession
} from '@/types/practice-test';
import { v4 as uuidv4 } from 'uuid';

export class PracticeTestTimerService {
  private static instances: Map<string, PracticeTestTimerService> = new Map();
  private timerId: NodeJS.Timeout | null = null;
  private testId: string;
  private listeners: Set<(timer: TestTimer) => void> = new Set();
  private eventListeners: Set<(event: TestEvent) => void> = new Set();

  private constructor(testId: string) {
    this.testId = testId;
  }

  /**
   * Get or create timer service instance for a test
   */
  static getInstance(testId: string): PracticeTestTimerService {
    if (!this.instances.has(testId)) {
      this.instances.set(testId, new PracticeTestTimerService(testId));
    }
    return this.instances.get(testId)!;
  }

  /**
   * Initialize timer for a new test session
   */
  initializeTimer(session: PracticeTestSession): TestTimer {
    const sectionTimers: SectionTimer[] = session.config.sections.map(section => ({
      sectionId: section.id,
      startTime: null,
      endTime: null,
      pausedTime: 0,
      remainingTimeSeconds: section.timeAllowedMinutes * 60,
      warnings: ['five_minutes', 'one_minute', 'thirty_seconds'],
      warningsTriggered: [],
      isActive: false,
      isPaused: false
    }));

    const timer: TestTimer = {
      testId: this.testId,
      currentSectionIndex: 0,
      sectionTimers,
      totalTestTime: 0,
      totalBreakTime: 0
    };

    return timer;
  }

  /**
   * Start timing for a specific section
   */
  startSectionTimer(timer: TestTimer, sectionIndex: number, userId: string): TestTimer {
    const updatedTimer = { ...timer };
    const sectionTimer = updatedTimer.sectionTimers[sectionIndex];

    if (!sectionTimer) {
      throw new Error(`Section ${sectionIndex} not found`);
    }

    // End previous section if active
    if (timer.currentSectionIndex !== sectionIndex) {
      const previousSection = updatedTimer.sectionTimers[timer.currentSectionIndex];
      if (previousSection && previousSection.isActive) {
        previousSection.isActive = false;
        previousSection.endTime = new Date();
      }
    }

    // Start new section
    sectionTimer.startTime = new Date();
    sectionTimer.isActive = true;
    sectionTimer.isPaused = false;
    updatedTimer.currentSectionIndex = sectionIndex;

    // Start the timer interval
    this.startTimerInterval(updatedTimer);

    // Emit start event
    this.emitEvent({
      id: uuidv4(),
      testId: this.testId,
      userId,
      eventType: 'start_section',
      timestamp: new Date(),
      sectionId: sectionTimer.sectionId
    });

    return updatedTimer;
  }

  /**
   * Pause the current active section timer
   */
  pauseTimer(timer: TestTimer, userId: string): TestTimer {
    const updatedTimer = { ...timer };
    const currentSectionTimer = updatedTimer.sectionTimers[timer.currentSectionIndex];

    if (currentSectionTimer && currentSectionTimer.isActive && !currentSectionTimer.isPaused) {
      currentSectionTimer.isPaused = true;
      this.stopTimerInterval();

      this.emitEvent({
        id: uuidv4(),
        testId: this.testId,
        userId,
        eventType: 'break_start',
        timestamp: new Date(),
        sectionId: currentSectionTimer.sectionId
      });
    }

    return updatedTimer;
  }

  /**
   * Resume the current paused section timer
   */
  resumeTimer(timer: TestTimer, userId: string): TestTimer {
    const updatedTimer = { ...timer };
    const currentSectionTimer = updatedTimer.sectionTimers[timer.currentSectionIndex];

    if (currentSectionTimer && currentSectionTimer.isActive && currentSectionTimer.isPaused) {
      currentSectionTimer.isPaused = false;
      this.startTimerInterval(updatedTimer);

      this.emitEvent({
        id: uuidv4(),
        testId: this.testId,
        userId,
        eventType: 'break_end',
        timestamp: new Date(),
        sectionId: currentSectionTimer.sectionId
      });
    }

    return updatedTimer;
  }

  /**
   * Start break timer between sections
   */
  startBreakTimer(timer: TestTimer, durationMinutes: number = 15): TestTimer {
    const updatedTimer = { ...timer };

    updatedTimer.breakTimer = {
      startTime: new Date(),
      durationMinutes,
      remainingTimeSeconds: durationMinutes * 60,
      isActive: true
    };

    // Start break countdown
    this.startBreakInterval(updatedTimer);

    return updatedTimer;
  }

  /**
   * Complete the current section and move to next
   */
  completeSection(timer: TestTimer, sectionIndex: number, userId: string): TestTimer {
    const updatedTimer = { ...timer };
    const sectionTimer = updatedTimer.sectionTimers[sectionIndex];

    if (sectionTimer) {
      sectionTimer.isActive = false;
      sectionTimer.isPaused = false;
      sectionTimer.endTime = new Date();
      sectionTimer.remainingTimeSeconds = 0;
    }

    this.stopTimerInterval();

    this.emitEvent({
      id: uuidv4(),
      testId: this.testId,
      userId,
      eventType: 'complete_test',
      timestamp: new Date(),
      sectionId: sectionTimer?.sectionId
    });

    return updatedTimer;
  }

  /**
   * Start the main timer interval
   */
  private startTimerInterval(timer: TestTimer): void {
    this.stopTimerInterval(); // Clear any existing interval

    this.timerId = setInterval(() => {
      const currentSectionTimer = timer.sectionTimers[timer.currentSectionIndex];

      if (!currentSectionTimer || !currentSectionTimer.isActive || currentSectionTimer.isPaused) {
        return;
      }

      // Decrement remaining time
      currentSectionTimer.remainingTimeSeconds = Math.max(0, currentSectionTimer.remainingTimeSeconds - 1);

      // Check for warnings
      this.checkAndTriggerWarnings(currentSectionTimer);

      // Check if time is up
      if (currentSectionTimer.remainingTimeSeconds === 0) {
        this.handleTimeExpired(timer, timer.currentSectionIndex);
      }

      // Update total test time
      timer.totalTestTime += 1000; // Add 1 second in milliseconds

      // Notify listeners
      this.notifyListeners(timer);
    }, 1000);
  }

  /**
   * Start break timer interval
   */
  private startBreakInterval(timer: TestTimer): void {
    if (!timer.breakTimer) return;

    const breakTimerId = setInterval(() => {
      if (!timer.breakTimer || !timer.breakTimer.isActive) {
        clearInterval(breakTimerId);
        return;
      }

      timer.breakTimer.remainingTimeSeconds = Math.max(0, timer.breakTimer.remainingTimeSeconds - 1);
      timer.totalBreakTime += 1000;

      if (timer.breakTimer.remainingTimeSeconds === 0) {
        timer.breakTimer.isActive = false;
        clearInterval(breakTimerId);

        // Auto-start next section if applicable
        if (timer.currentSectionIndex < timer.sectionTimers.length - 1) {
          // This would trigger the next section start in the UI
          this.emitEvent({
            id: uuidv4(),
            testId: this.testId,
            userId: 'system',
            eventType: 'start_section',
            timestamp: new Date(),
            data: { autoStart: true, nextSectionIndex: timer.currentSectionIndex + 1 }
          });
        }
      }

      this.notifyListeners(timer);
    }, 1000);
  }

  /**
   * Stop the timer interval
   */
  private stopTimerInterval(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Check and trigger time warnings
   */
  private checkAndTriggerWarnings(sectionTimer: SectionTimer): void {
    const remainingSeconds = sectionTimer.remainingTimeSeconds;
    const warningTimes = {
      'five_minutes': 300,
      'one_minute': 60,
      'thirty_seconds': 30,
      'ten_seconds': 10
    };

    for (const [warning, seconds] of Object.entries(warningTimes)) {
      const warningType = warning as TimerWarning;

      if (
        remainingSeconds === seconds &&
        sectionTimer.warnings.includes(warningType) &&
        !sectionTimer.warningsTriggered.includes(warningType)
      ) {
        sectionTimer.warningsTriggered.push(warningType);

        this.emitEvent({
          id: uuidv4(),
          testId: this.testId,
          userId: 'system',
          eventType: 'timer_warning',
          timestamp: new Date(),
          sectionId: sectionTimer.sectionId,
          data: { warning: warningType, remainingSeconds }
        });
      }
    }
  }

  /**
   * Handle when section time expires
   */
  private handleTimeExpired(timer: TestTimer, sectionIndex: number): void {
    const sectionTimer = timer.sectionTimers[sectionIndex];
    if (!sectionTimer) return;

    sectionTimer.isActive = false;
    sectionTimer.endTime = new Date();
    this.stopTimerInterval();

    this.emitEvent({
      id: uuidv4(),
      testId: this.testId,
      userId: 'system',
      eventType: 'complete_test',
      timestamp: new Date(),
      sectionId: sectionTimer.sectionId,
      data: { reason: 'time_expired' }
    });
  }

  /**
   * Calculate actual time spent in section (excluding pauses)
   */
  getActualSectionTime(sectionTimer: SectionTimer): number {
    if (!sectionTimer.startTime) return 0;

    const endTime = sectionTimer.endTime || new Date();
    const totalTime = endTime.getTime() - sectionTimer.startTime.getTime();

    return Math.max(0, totalTime - sectionTimer.pausedTime);
  }

  /**
   * Get time management score (0-100) based on optimal timing
   */
  getTimeManagementScore(sectionTimer: SectionTimer, questionCount: number): number {
    const actualTime = this.getActualSectionTime(sectionTimer);
    const allocatedTime = sectionTimer.remainingTimeSeconds * 1000 + actualTime;
    const optimalTimePerQuestion = allocatedTime / questionCount;
    const actualTimePerQuestion = actualTime / questionCount;

    // Score based on how close to optimal timing
    const efficiency = Math.min(1, optimalTimePerQuestion / actualTimePerQuestion);
    return Math.round(efficiency * 100);
  }

  /**
   * Add timer listener
   */
  addTimerListener(listener: (timer: TestTimer) => void): void {
    this.listeners.add(listener);
  }

  /**
   * Remove timer listener
   */
  removeTimerListener(listener: (timer: TestTimer) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Add event listener
   */
  addEventListener(listener: (event: TestEvent) => void): void {
    this.eventListeners.add(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: (event: TestEvent) => void): void {
    this.eventListeners.delete(listener);
  }

  /**
   * Notify all timer listeners
   */
  private notifyListeners(timer: TestTimer): void {
    this.listeners.forEach(listener => listener(timer));
  }

  /**
   * Emit timer event
   */
  private emitEvent(event: TestEvent): void {
    this.eventListeners.forEach(listener => listener(event));
  }

  /**
   * Get timer statistics for analysis
   */
  getTimerStats(timer: TestTimer): {
    totalTestDuration: number;
    totalBreakDuration: number;
    sectionStats: Array<{
      sectionId: string;
      duration: number;
      pausedTime: number;
      activeTime: number;
      warningsTriggered: TimerWarning[];
      completed: boolean;
    }>;
  } {
    const sectionStats = timer.sectionTimers.map(sectionTimer => ({
      sectionId: sectionTimer.sectionId,
      duration: this.getActualSectionTime(sectionTimer) + sectionTimer.pausedTime,
      pausedTime: sectionTimer.pausedTime,
      activeTime: this.getActualSectionTime(sectionTimer),
      warningsTriggered: [...sectionTimer.warningsTriggered],
      completed: sectionTimer.endTime !== null
    }));

    return {
      totalTestDuration: timer.totalTestTime,
      totalBreakDuration: timer.totalBreakTime,
      sectionStats
    };
  }

  /**
   * Sync timer with server time (for accuracy)
   */
  async syncWithServer(timer: TestTimer): Promise<TestTimer> {
    try {
      // This would make an API call to get server time
      // For now, using local time adjustment
      const serverTime = new Date().getTime();
      const localTime = Date.now();
      const timeDrift = serverTime - localTime;

      // Adjust current section timer if active
      const currentSection = timer.sectionTimers[timer.currentSectionIndex];
      if (currentSection && currentSection.isActive && !currentSection.isPaused) {
        // Apply time drift correction
        const driftSeconds = Math.floor(timeDrift / 1000);
        currentSection.remainingTimeSeconds = Math.max(0, currentSection.remainingTimeSeconds - driftSeconds);
      }

      return timer;
    } catch (error) {
      console.warn('Timer sync failed:', error);
      return timer;
    }
  }

  /**
   * Cleanup timer service instance
   */
  destroy(): void {
    this.stopTimerInterval();
    this.listeners.clear();
    this.eventListeners.clear();
    PracticeTestTimerService.instances.delete(this.testId);
  }

  /**
   * Validate timer state
   */
  static validateTimer(timer: TestTimer): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if current section index is valid
    if (timer.currentSectionIndex < 0 || timer.currentSectionIndex >= timer.sectionTimers.length) {
      errors.push('Invalid current section index');
    }

    // Check section timer consistency
    timer.sectionTimers.forEach((sectionTimer, index) => {
      if (sectionTimer.remainingTimeSeconds < 0) {
        errors.push(`Section ${index} has negative remaining time`);
      }

      if (sectionTimer.isActive && sectionTimer.endTime) {
        errors.push(`Section ${index} marked as active but has end time`);
      }

      if (!sectionTimer.isActive && sectionTimer.remainingTimeSeconds > 0 && !sectionTimer.endTime) {
        errors.push(`Section ${index} not active but has remaining time and no end time`);
      }
    });

    // Check for multiple active sections
    const activeSections = timer.sectionTimers.filter(s => s.isActive).length;
    if (activeSections > 1) {
      errors.push('Multiple sections marked as active');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}