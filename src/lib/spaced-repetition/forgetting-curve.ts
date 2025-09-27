/**
 * Forgetting Curve Analysis
 * MELLOWISE-029: Advanced Spaced Repetition System
 *
 * Implementation of forgetting curve models for predicting retention over time
 * Based on Ebbinghaus forgetting curve and modern research
 */

import type {
  ForgettingCurve,
  RetentionDataPoint,
  SpacedRepetitionCard,
  ForgettingCurveAnalysis
} from '@/types/spaced-repetition';

/**
 * Forgetting Curve Service
 * Analyzes and predicts memory retention over time
 */
export class ForgettingCurveService {
  private curves: Map<string, ForgettingCurve> = new Map();

  /**
   * Create or update forgetting curve for a user-concept pair
   */
  public updateForgettingCurve(
    userId: string,
    conceptId: string,
    dataPoint: Omit<RetentionDataPoint, 'timestamp'>
  ): ForgettingCurve {
    const curveKey = `${userId}-${conceptId}`;
    let curve = this.curves.get(curveKey);

    if (!curve) {
      curve = this.initializeForgettingCurve(userId, conceptId);
      this.curves.set(curveKey, curve);
    }

    // Add new data point
    const newDataPoint: RetentionDataPoint = {
      ...dataPoint,
      timestamp: new Date().toISOString()
    };
    curve.dataPoints.push(newDataPoint);

    // Keep only last 100 data points for performance
    if (curve.dataPoints.length > 100) {
      curve.dataPoints = curve.dataPoints.slice(-100);
    }

    // Recalculate curve parameters
    this.recalculateCurveParameters(curve);

    curve.lastUpdated = new Date().toISOString();

    return curve;
  }

  /**
   * Initialize new forgetting curve
   */
  private initializeForgettingCurve(userId: string, conceptId: string): ForgettingCurve {
    return {
      conceptId,
      userId,
      model: 'exponential',
      parameters: {
        initialRetention: 1.0,
        decayRate: 0.1,
        stabilityFactor: 1.0,
        retrievabilityThreshold: 0.9
      },
      dataPoints: [],
      lastUpdated: new Date().toISOString(),
      confidence: 0.1
    };
  }

  /**
   * Recalculate curve parameters based on data points
   */
  private recalculateCurveParameters(curve: ForgettingCurve): void {
    if (curve.dataPoints.length < 3) {
      return; // Need at least 3 points for meaningful calculation
    }

    const points = curve.dataPoints.slice(-50); // Use last 50 points

    switch (curve.model) {
      case 'exponential':
        this.fitExponentialCurve(curve, points);
        break;
      case 'power':
        this.fitPowerCurve(curve, points);
        break;
      case 'logarithmic':
        this.fitLogarithmicCurve(curve, points);
        break;
    }

    // Update confidence based on data quality
    curve.confidence = this.calculateConfidence(points);
  }

  /**
   * Fit exponential decay curve: R(t) = R0 * e^(-αt)
   */
  private fitExponentialCurve(curve: ForgettingCurve, points: RetentionDataPoint[]): void {
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    const n = points.length;

    // Use logarithmic transformation for linear regression
    points.forEach(point => {
      const x = point.timeElapsed;
      const y = Math.max(0.01, point.retention); // Avoid log(0)
      const logY = Math.log(y);

      sumX += x;
      sumY += logY;
      sumXY += x * logY;
      sumXX += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    curve.parameters.initialRetention = Math.exp(intercept);
    curve.parameters.decayRate = -slope;

    // Ensure reasonable bounds
    curve.parameters.initialRetention = Math.min(1.0, Math.max(0.5, curve.parameters.initialRetention));
    curve.parameters.decayRate = Math.min(0.5, Math.max(0.01, curve.parameters.decayRate));
  }

  /**
   * Fit power law curve: R(t) = R0 * t^(-α)
   */
  private fitPowerCurve(curve: ForgettingCurve, points: RetentionDataPoint[]): void {
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    const n = points.length;

    // Use log-log transformation
    points.forEach(point => {
      const x = Math.max(0.1, point.timeElapsed); // Avoid log(0)
      const y = Math.max(0.01, point.retention);
      const logX = Math.log(x);
      const logY = Math.log(y);

      sumX += logX;
      sumY += logY;
      sumXY += logX * logY;
      sumXX += logX * logX;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    curve.parameters.initialRetention = Math.exp(intercept);
    curve.parameters.decayRate = -slope;

    // Ensure reasonable bounds
    curve.parameters.initialRetention = Math.min(1.0, Math.max(0.5, curve.parameters.initialRetention));
    curve.parameters.decayRate = Math.min(2.0, Math.max(0.1, curve.parameters.decayRate));
  }

  /**
   * Fit logarithmic curve: R(t) = R0 - α * log(t + 1)
   */
  private fitLogarithmicCurve(curve: ForgettingCurve, points: RetentionDataPoint[]): void {
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    const n = points.length;

    points.forEach(point => {
      const x = Math.log(point.timeElapsed + 1);
      const y = point.retention;

      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    curve.parameters.initialRetention = intercept;
    curve.parameters.decayRate = -slope;

    // Ensure reasonable bounds
    curve.parameters.initialRetention = Math.min(1.0, Math.max(0.5, curve.parameters.initialRetention));
    curve.parameters.decayRate = Math.min(0.5, Math.max(0.01, curve.parameters.decayRate));
  }

  /**
   * Calculate confidence in curve fit
   */
  private calculateConfidence(points: RetentionDataPoint[]): number {
    if (points.length < 3) return 0.1;

    // Calculate R-squared as a measure of fit quality
    const actualValues = points.map(p => p.retention);
    const mean = actualValues.reduce((a, b) => a + b, 0) / actualValues.length;

    const totalSumSquares = actualValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);

    // This is a simplified calculation - in practice, you'd use predicted values
    const residualSumSquares = actualValues.reduce((sum, val) => {
      const predicted = this.estimateRetentionFromMean(val, points);
      return sum + Math.pow(val - predicted, 2);
    }, 0);

    const rSquared = 1 - (residualSumSquares / totalSumSquares);

    // Convert R-squared to confidence (0-1 range)
    return Math.max(0.1, Math.min(1.0, rSquared));
  }

  /**
   * Simple retention estimation (placeholder for more complex calculation)
   */
  private estimateRetentionFromMean(actualValue: number, points: RetentionDataPoint[]): number {
    // This is a simplified approach - in practice, use the fitted curve
    const mean = points.reduce((sum, p) => sum + p.retention, 0) / points.length;
    return mean;
  }

  /**
   * Predict retention at a specific time point
   */
  public predictRetention(
    userId: string,
    conceptId: string,
    timeElapsed: number
  ): { retention: number; confidence: number } {
    const curveKey = `${userId}-${conceptId}`;
    const curve = this.curves.get(curveKey);

    if (!curve || curve.dataPoints.length < 2) {
      return { retention: 0.5, confidence: 0.1 };
    }

    let retention: number;

    switch (curve.model) {
      case 'exponential':
        retention = curve.parameters.initialRetention *
                   Math.exp(-curve.parameters.decayRate * timeElapsed);
        break;

      case 'power':
        retention = curve.parameters.initialRetention *
                   Math.pow(Math.max(0.1, timeElapsed), -curve.parameters.decayRate);
        break;

      case 'logarithmic':
        retention = curve.parameters.initialRetention -
                   curve.parameters.decayRate * Math.log(timeElapsed + 1);
        break;

      default:
        retention = 0.5;
    }

    // Ensure retention is within valid bounds
    retention = Math.max(0.01, Math.min(1.0, retention));

    return {
      retention,
      confidence: curve.confidence
    };
  }

  /**
   * Find optimal review time for target retention
   */
  public findOptimalReviewTime(
    userId: string,
    conceptId: string,
    targetRetention: number = 0.9
  ): { timeHours: number; confidence: number } {
    const curveKey = `${userId}-${conceptId}`;
    const curve = this.curves.get(curveKey);

    if (!curve || curve.dataPoints.length < 2) {
      return { timeHours: 24, confidence: 0.1 };
    }

    // Binary search for optimal time
    let low = 0.1;
    let high = 8760; // 1 year in hours
    let bestTime = 24;

    for (let i = 0; i < 20; i++) { // Max 20 iterations
      const mid = (low + high) / 2;
      const prediction = this.predictRetention(userId, conceptId, mid);

      if (Math.abs(prediction.retention - targetRetention) < 0.01) {
        bestTime = mid;
        break;
      }

      if (prediction.retention > targetRetention) {
        low = mid;
      } else {
        high = mid;
      }

      bestTime = mid;
    }

    return {
      timeHours: bestTime,
      confidence: curve.confidence
    };
  }

  /**
   * Analyze forgetting patterns for a user
   */
  public analyzeForgettingPatterns(userId: string): ForgettingCurveAnalysis {
    const userCurves = Array.from(this.curves.values()).filter(c => c.userId === userId);

    if (userCurves.length === 0) {
      return this.getDefaultAnalysis();
    }

    // Calculate average model accuracy
    const totalConfidence = userCurves.reduce((sum, curve) => sum + curve.confidence, 0);
    const modelAccuracy = totalConfidence / userCurves.length;

    // Find optimal review timing across all concepts
    const optimalTimes = userCurves.map(curve => {
      const result = this.findOptimalReviewTime(userId, curve.conceptId, 0.9);
      return result.timeHours;
    });

    const optimalReviewTiming = optimalTimes.reduce((sum, time) => sum + time, 0) / optimalTimes.length;

    // Analyze personal factors
    const personalizedFactors = this.analyzePersonalFactors(userCurves);

    // Generate recommendations
    const recommendations = this.generateRecommendations(userCurves, personalizedFactors);

    return {
      modelAccuracy,
      optimalReviewTiming,
      personalizedFactors,
      recommendations
    };
  }

  /**
   * Analyze personal learning factors
   */
  private analyzePersonalFactors(curves: ForgettingCurve[]): ForgettingCurveAnalysis['personalizedFactors'] {
    // Calculate average decay rate
    const avgDecayRate = curves.reduce((sum, curve) => sum + curve.parameters.decayRate, 0) / curves.length;

    // Determine if user is a fast forgetter (higher decay rate)
    const fastForgetter = avgDecayRate > 0.15;

    // Analyze learning style based on performance patterns
    // This is simplified - in practice, would analyze response patterns
    const learningStyle = 'mixed'; // Placeholder

    // Calculate personal optimal interval
    const optimalInterval = fastForgetter ? 12 : 24; // hours

    return {
      fastForgetter,
      learningStyle,
      optimalInterval
    };
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(
    curves: ForgettingCurve[],
    factors: ForgettingCurveAnalysis['personalizedFactors']
  ): string[] {
    const recommendations: string[] = [];

    if (factors.fastForgetter) {
      recommendations.push('Consider shorter review intervals due to faster forgetting rate');
      recommendations.push('Focus on spaced repetition with frequent initial reviews');
    } else {
      recommendations.push('You have good retention - can use longer review intervals');
      recommendations.push('Focus on understanding concepts deeply before spacing out reviews');
    }

    // Analyze confidence levels
    const avgConfidence = curves.reduce((sum, curve) => sum + curve.confidence, 0) / curves.length;

    if (avgConfidence < 0.5) {
      recommendations.push('More consistent review practice needed to improve predictions');
    }

    if (factors.optimalInterval < 18) {
      recommendations.push('Consider morning review sessions for better retention');
    }

    return recommendations;
  }

  /**
   * Get default analysis when no data available
   */
  private getDefaultAnalysis(): ForgettingCurveAnalysis {
    return {
      modelAccuracy: 0.5,
      optimalReviewTiming: 24,
      personalizedFactors: {
        fastForgetter: false,
        learningStyle: 'mixed',
        optimalInterval: 24
      },
      recommendations: [
        'Complete more reviews to enable personalized analysis',
        'Focus on understanding concepts before memorization',
        'Try reviewing cards 24 hours after initial learning'
      ]
    };
  }

  /**
   * Update curve model based on performance
   */
  public optimizeCurveModel(userId: string, conceptId: string): void {
    const curveKey = `${userId}-${conceptId}`;
    const curve = this.curves.get(curveKey);

    if (!curve || curve.dataPoints.length < 10) {
      return;
    }

    // Test different models and pick the best fit
    const models: ForgettingCurve['model'][] = ['exponential', 'power', 'logarithmic'];
    let bestModel = curve.model;
    let bestConfidence = curve.confidence;

    models.forEach(model => {
      const testCurve = { ...curve, model };
      this.recalculateCurveParameters(testCurve);

      if (testCurve.confidence > bestConfidence) {
        bestModel = model;
        bestConfidence = testCurve.confidence;
      }
    });

    if (bestModel !== curve.model) {
      curve.model = bestModel;
      this.recalculateCurveParameters(curve);
    }
  }

  /**
   * Export forgetting curve data
   */
  public exportCurveData(userId: string, conceptId: string): ForgettingCurve | null {
    const curveKey = `${userId}-${conceptId}`;
    return this.curves.get(curveKey) || null;
  }

  /**
   * Import forgetting curve data
   */
  public importCurveData(curve: ForgettingCurve): void {
    const curveKey = `${curve.userId}-${curve.conceptId}`;
    this.curves.set(curveKey, curve);
  }

  /**
   * Get curve statistics
   */
  public getCurveStatistics(): {
    totalCurves: number;
    averageConfidence: number;
    averageDataPoints: number;
  } {
    const curves = Array.from(this.curves.values());

    return {
      totalCurves: curves.length,
      averageConfidence: curves.reduce((sum, c) => sum + c.confidence, 0) / curves.length || 0,
      averageDataPoints: curves.reduce((sum, c) => sum + c.dataPoints.length, 0) / curves.length || 0
    };
  }

  /**
   * Clear old curve data
   */
  public cleanup(olderThanDays: number = 180): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    let removedCount = 0;

    this.curves.forEach((curve, key) => {
      const lastUpdate = new Date(curve.lastUpdated);
      if (lastUpdate < cutoffDate && curve.dataPoints.length < 5) {
        this.curves.delete(key);
        removedCount++;
      }
    });

    return removedCount;
  }
}