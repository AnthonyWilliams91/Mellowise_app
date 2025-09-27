/**
 * Question Type Heat Map Service
 * Interactive heat map visualization for question type accuracy analysis
 */

import {
  QuestionTypeHeatMapData,
  HeatMapConfig,
  HeatMapCell,
  DateRange,
  ANALYTICS_CONSTANTS
} from '@/types/analytics-dashboard';

interface QuestionData {
  id: string;
  date: Date;
  sectionType: 'logical_reasoning' | 'reading_comprehension' | 'logic_games';
  questionType: string;
  topic: string;
  difficulty: number; // 1-10
  timeSpent: number; // seconds
  correct: boolean;
  wasGuessed: boolean;
}

export class HeatMapService {
  // Question type mappings for each section
  private static readonly QUESTION_TYPE_MAPPINGS = {
    logical_reasoning: [
      'assumption', 'strengthen', 'weaken', 'inference', 'main_point',
      'flaw', 'principle', 'parallel', 'evaluate', 'resolve',
      'method', 'role', 'disagree', 'conform', 'complete'
    ],
    reading_comprehension: [
      'main_point', 'primary_purpose', 'author_attitude', 'tone',
      'strengthen', 'weaken', 'inference', 'detail', 'vocabulary',
      'function', 'parallel', 'application', 'continue', 'organization', 'comparative'
    ],
    logic_games: [
      'sequencing', 'grouping', 'matching', 'hybrid',
      'assignment', 'selection', 'ordering', 'distribution'
    ]
  };

  /**
   * Generate heat map data for question types
   */
  static generateHeatMapData(
    questions: QuestionData[],
    config: HeatMapConfig
  ): QuestionTypeHeatMapData[] {
    const filteredQuestions = this.applyFilters(questions, config.filters);
    const groupedData = this.groupQuestions(filteredQuestions, config.grouping);

    return this.calculateHeatMapMetrics(groupedData, config);
  }

  /**
   * Generate 2D heat map cells for grid visualization
   */
  static generateHeatMapCells(
    questions: QuestionData[],
    config: HeatMapConfig
  ): HeatMapCell[][] {
    const heatMapData = this.generateHeatMapData(questions, config);

    switch (config.grouping) {
      case 'by_section':
        return this.createSectionTypeGrid(heatMapData, config);
      case 'by_difficulty':
        return this.createDifficultyGrid(heatMapData, config);
      case 'by_topic':
        return this.createTopicGrid(heatMapData, config);
      default:
        return this.createFlatGrid(heatMapData, config);
    }
  }

  /**
   * Apply filters to question data
   */
  private static applyFilters(questions: QuestionData[], filters: HeatMapConfig['filters']): QuestionData[] {
    return questions.filter(q => {
      // Date range filter
      if (q.date < filters.dateRange.start || q.date > filters.dateRange.end) {
        return false;
      }

      // Section type filter
      if (filters.sectionTypes.length > 0 && !filters.sectionTypes.includes(q.sectionType)) {
        return false;
      }

      // Difficulty range filter
      if (q.difficulty < filters.difficultyRange[0] || q.difficulty > filters.difficultyRange[1]) {
        return false;
      }

      return true;
    });
  }

  /**
   * Group questions based on grouping strategy
   */
  private static groupQuestions(
    questions: QuestionData[],
    grouping: HeatMapConfig['grouping']
  ): Map<string, QuestionData[]> {
    const groups = new Map<string, QuestionData[]>();

    questions.forEach(q => {
      let key: string;

      switch (grouping) {
        case 'by_section':
          key = `${q.sectionType}:${q.questionType}`;
          break;
        case 'by_difficulty':
          key = `${this.getDifficultyBucket(q.difficulty)}:${q.questionType}`;
          break;
        case 'by_topic':
          key = `${q.topic}:${q.questionType}`;
          break;
        default:
          key = q.questionType;
      }

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(q);
    });

    return groups;
  }

  /**
   * Calculate heat map metrics for grouped data
   */
  private static calculateHeatMapMetrics(
    groupedData: Map<string, QuestionData[]>,
    config: HeatMapConfig
  ): QuestionTypeHeatMapData[] {
    const results: QuestionTypeHeatMapData[] = [];

    groupedData.forEach((questions, key) => {
      if (questions.length < config.filters.minAttempts) {
        return; // Skip groups with insufficient data
      }

      const correctAnswers = questions.filter(q => q.correct).length;
      const accuracy = (correctAnswers / questions.length) * 100;

      const averageTime = questions.reduce((sum, q) => sum + q.timeSpent, 0) / questions.length;

      const averageDifficulty = questions.reduce((sum, q) => sum + q.difficulty, 0) / questions.length;

      // Calculate recent trend (last 30 days vs previous period)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentQuestions = questions.filter(q => q.date >= thirtyDaysAgo);
      const olderQuestions = questions.filter(q => q.date < thirtyDaysAgo);

      let recentTrend: 'improving' | 'declining' | 'stable' = 'stable';

      if (recentQuestions.length >= 3 && olderQuestions.length >= 3) {
        const recentAccuracy = (recentQuestions.filter(q => q.correct).length / recentQuestions.length) * 100;
        const olderAccuracy = (olderQuestions.filter(q => q.correct).length / olderQuestions.length) * 100;

        const difference = recentAccuracy - olderAccuracy;
        if (difference > 5) recentTrend = 'improving';
        else if (difference < -5) recentTrend = 'declining';
      }

      const color = this.getHeatMapColor(accuracy, config.colorScale);
      const priority = this.determinePriority(accuracy, recentTrend);

      results.push({
        questionType: key,
        accuracy: Math.round(accuracy * 10) / 10,
        attemptCount: questions.length,
        averageTime: Math.round(averageTime),
        difficulty: Math.round(averageDifficulty * 10) / 10,
        recentTrend,
        color,
        priority
      });
    });

    return results.sort((a, b) => {
      // Sort by priority first, then by accuracy (lowest first for focus areas)
      const priorityOrder = { focus_needed: 0, maintain: 1, strong: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      return priorityDiff !== 0 ? priorityDiff : a.accuracy - b.accuracy;
    });
  }

  /**
   * Create section type grid layout
   */
  private static createSectionTypeGrid(
    data: QuestionTypeHeatMapData[],
    config: HeatMapConfig
  ): HeatMapCell[][] {
    const sections = ['logical_reasoning', 'reading_comprehension', 'logic_games'];
    const grid: HeatMapCell[][] = [];

    sections.forEach(section => {
      const sectionData = data.filter(d => d.questionType.startsWith(section));
      const questionTypes = this.QUESTION_TYPE_MAPPINGS[section as keyof typeof this.QUESTION_TYPE_MAPPINGS];

      const row: HeatMapCell[] = questionTypes.map(questionType => {
        const key = `${section}:${questionType}`;
        const cellData = sectionData.find(d => d.questionType === key);

        if (!cellData) {
          return {
            x: questionType,
            y: section.replace('_', ' '),
            value: 0,
            displayValue: 'N/A',
            tooltip: 'No data available',
            color: '#f5f5f5'
          };
        }

        return {
          x: questionType.replace('_', ' '),
          y: section.replace('_', ' '),
          value: cellData.accuracy,
          displayValue: `${cellData.accuracy}%`,
          tooltip: `${cellData.questionType}: ${cellData.accuracy}% accuracy (${cellData.attemptCount} attempts)`,
          color: cellData.color
        };
      });

      grid.push(row);
    });

    return grid;
  }

  /**
   * Create difficulty-based grid layout
   */
  private static createDifficultyGrid(
    data: QuestionTypeHeatMapData[],
    config: HeatMapConfig
  ): HeatMapCell[][] {
    const difficultyBuckets = ['Easy (1-3)', 'Medium (4-6)', 'Hard (7-10)'];
    const allQuestionTypes = new Set<string>();

    // Collect all question types
    data.forEach(d => {
      const [_, questionType] = d.questionType.split(':');
      allQuestionTypes.add(questionType);
    });

    const questionTypes = Array.from(allQuestionTypes).sort();
    const grid: HeatMapCell[][] = [];

    difficultyBuckets.forEach(bucket => {
      const row: HeatMapCell[] = questionTypes.map(questionType => {
        const key = `${bucket}:${questionType}`;
        const cellData = data.find(d => d.questionType === key);

        if (!cellData) {
          return {
            x: questionType.replace('_', ' '),
            y: bucket,
            value: 0,
            displayValue: 'N/A',
            tooltip: 'No data available',
            color: '#f5f5f5'
          };
        }

        return {
          x: questionType.replace('_', ' '),
          y: bucket,
          value: cellData.accuracy,
          displayValue: `${cellData.accuracy}%`,
          tooltip: `${cellData.questionType}: ${cellData.accuracy}% accuracy (${cellData.attemptCount} attempts)`,
          color: cellData.color
        };
      });

      grid.push(row);
    });

    return grid;
  }

  /**
   * Create topic-based grid layout
   */
  private static createTopicGrid(
    data: QuestionTypeHeatMapData[],
    config: HeatMapConfig
  ): HeatMapCell[][] {
    // Group by topic
    const topicGroups = new Map<string, QuestionTypeHeatMapData[]>();

    data.forEach(d => {
      const [topic, questionType] = d.questionType.split(':');
      if (!topicGroups.has(topic)) {
        topicGroups.set(topic, []);
      }
      topicGroups.get(topic)!.push(d);
    });

    const grid: HeatMapCell[][] = [];
    const allQuestionTypes = new Set<string>();

    // Collect all question types
    data.forEach(d => {
      const [_, questionType] = d.questionType.split(':');
      allQuestionTypes.add(questionType);
    });

    const questionTypes = Array.from(allQuestionTypes).sort();

    Array.from(topicGroups.keys()).sort().forEach(topic => {
      const topicData = topicGroups.get(topic)!;

      const row: HeatMapCell[] = questionTypes.map(questionType => {
        const cellData = topicData.find(d => d.questionType.endsWith(`:${questionType}`));

        if (!cellData) {
          return {
            x: questionType.replace('_', ' '),
            y: topic.replace('_', ' '),
            value: 0,
            displayValue: 'N/A',
            tooltip: 'No data available',
            color: '#f5f5f5'
          };
        }

        return {
          x: questionType.replace('_', ' '),
          y: topic.replace('_', ' '),
          value: cellData.accuracy,
          displayValue: `${cellData.accuracy}%`,
          tooltip: `${cellData.questionType}: ${cellData.accuracy}% accuracy (${cellData.attemptCount} attempts)`,
          color: cellData.color
        };
      });

      grid.push(row);
    });

    return grid;
  }

  /**
   * Create flat grid layout (single row)
   */
  private static createFlatGrid(
    data: QuestionTypeHeatMapData[],
    config: HeatMapConfig
  ): HeatMapCell[][] {
    const row: HeatMapCell[] = data.map(d => ({
      x: d.questionType.replace('_', ' '),
      y: 'Performance',
      value: d.accuracy,
      displayValue: `${d.accuracy}%`,
      tooltip: `${d.questionType}: ${d.accuracy}% accuracy (${d.attemptCount} attempts, ${d.averageTime}s avg)`,
      color: d.color
    }));

    return [row];
  }

  /**
   * Get heat map color based on accuracy
   */
  private static getHeatMapColor(accuracy: number, colorScale: HeatMapConfig['colorScale']): string {
    if (accuracy >= ANALYTICS_CONSTANTS.SCORE_RANGES.EXCELLENT) {
      return colorScale.excellent;
    } else if (accuracy >= ANALYTICS_CONSTANTS.SCORE_RANGES.GOOD) {
      return colorScale.good;
    } else if (accuracy >= ANALYTICS_CONSTANTS.SCORE_RANGES.AVERAGE) {
      return colorScale.average;
    } else {
      return colorScale.needs_work;
    }
  }

  /**
   * Determine priority level based on accuracy and trend
   */
  private static determinePriority(
    accuracy: number,
    trend: 'improving' | 'declining' | 'stable'
  ): QuestionTypeHeatMapData['priority'] {
    if (accuracy < ANALYTICS_CONSTANTS.SCORE_RANGES.AVERAGE || trend === 'declining') {
      return 'focus_needed';
    } else if (accuracy >= ANALYTICS_CONSTANTS.SCORE_RANGES.EXCELLENT && trend !== 'declining') {
      return 'strong';
    } else {
      return 'maintain';
    }
  }

  /**
   * Get difficulty bucket label
   */
  private static getDifficultyBucket(difficulty: number): string {
    if (difficulty <= 3) return 'Easy (1-3)';
    if (difficulty <= 6) return 'Medium (4-6)';
    return 'Hard (7-10)';
  }

  /**
   * Generate insights from heat map data
   */
  static generateHeatMapInsights(data: QuestionTypeHeatMapData[]): {
    topWeaknesses: string[];
    topStrengths: string[];
    improvingAreas: string[];
    decliningAreas: string[];
    recommendations: string[];
  } {
    const focusNeeded = data.filter(d => d.priority === 'focus_needed').slice(0, 5);
    const strengths = data.filter(d => d.priority === 'strong').slice(0, 5);
    const improving = data.filter(d => d.recentTrend === 'improving').slice(0, 3);
    const declining = data.filter(d => d.recentTrend === 'declining').slice(0, 3);

    const recommendations: string[] = [];

    // Generate contextual recommendations
    if (focusNeeded.length > 3) {
      recommendations.push('Consider focusing practice on your weakest question types before moving to new material');
    }

    if (declining.length > 0) {
      recommendations.push('Recent performance decline detected in some areas - review fundamental concepts');
    }

    if (improving.length > declining.length) {
      recommendations.push('Great progress in several areas! Consider increasing practice intensity to capitalize on momentum');
    }

    const avgAccuracy = data.reduce((sum, d) => sum + d.accuracy, 0) / data.length;
    if (avgAccuracy < 65) {
      recommendations.push('Overall accuracy below target - focus on untimed practice to build solid foundation');
    } else if (avgAccuracy > 80) {
      recommendations.push('Strong overall performance - focus on timing and consistency in practice tests');
    }

    return {
      topWeaknesses: focusNeeded.map(d => d.questionType.replace('_', ' ')),
      topStrengths: strengths.map(d => d.questionType.replace('_', ' ')),
      improvingAreas: improving.map(d => d.questionType.replace('_', ' ')),
      decliningAreas: declining.map(d => d.questionType.replace('_', ' ')),
      recommendations
    };
  }

  /**
   * Create default heat map configuration
   */
  static createDefaultConfig(): HeatMapConfig {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    return {
      colorScale: {
        excellent: ANALYTICS_CONSTANTS.CHART_COLORS.SUCCESS,
        good: ANALYTICS_CONSTANTS.CHART_COLORS.PRIMARY,
        average: ANALYTICS_CONSTANTS.CHART_COLORS.WARNING,
        needs_work: ANALYTICS_CONSTANTS.CHART_COLORS.DANGER
      },
      filters: {
        dateRange: {
          start: thirtyDaysAgo,
          end: new Date(),
          preset: 'last_month'
        },
        sectionTypes: [],
        difficultyRange: [1, 10],
        minAttempts: 3
      },
      grouping: 'by_section'
    };
  }

  /**
   * Export heat map data for external analysis
   */
  static exportHeatMapData(
    data: QuestionTypeHeatMapData[],
    format: 'csv' | 'json' = 'json'
  ): string {
    if (format === 'csv') {
      const headers = ['Question Type', 'Accuracy', 'Attempts', 'Avg Time', 'Difficulty', 'Trend', 'Priority'];
      const rows = data.map(d => [
        d.questionType,
        d.accuracy.toString(),
        d.attemptCount.toString(),
        d.averageTime.toString(),
        d.difficulty.toString(),
        d.recentTrend,
        d.priority
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    } else {
      return JSON.stringify(data, null, 2);
    }
  }
}