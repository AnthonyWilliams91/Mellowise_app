/**
 * Email Template Utilities
 * MELLOWISE-015: Helper functions for email template processing and personalization
 */

import fs from 'fs';
import path from 'path';

// Type definitions for template variables
export interface BaseTemplateVariables {
  userName: string;
  userEmail: string;
  unsubscribeUrl: string;
  dashboardUrl: string;
  logoUrl: string;
  supportEmail: string;
  currentYear: number;
}

export interface StudyReminderVariables extends BaseTemplateVariables {
  streak: number;
  todayGoal: string;
  questionsRemaining: number;
  motivationalMessage: string;
  studyUrl: string;
  lastStudyDate?: string;
}

export interface GoalDeadlineVariables extends BaseTemplateVariables {
  goalTitle: string;
  daysRemaining: number;
  targetScore: number;
  currentScore: number;
  progressPercentage: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  actionUrl: string;
}

export interface StreakMaintenanceVariables extends BaseTemplateVariables {
  streakCount: number;
  streakType: 'current' | 'at_risk' | 'broken';
  nextMilestone: number;
  lastActivity: string;
  continueUrl: string;
  encouragementMessage: string;
}

export interface AchievementVariables extends BaseTemplateVariables {
  achievementType: string;
  achievementTitle: string;
  achievementDescription: string;
  badgeUrl: string;
  shareUrl: string;
  nextGoalTitle?: string;
  statisticsUrl: string;
}

export interface BreakReminderVariables extends BaseTemplateVariables {
  studyHoursToday: number;
  studyStreak: number;
  wellnessMessage: string;
  relaxationTips: string[];
  resumeStudyTime: string;
}

export interface PerformanceAlertVariables extends BaseTemplateVariables {
  performanceChange: 'improved' | 'declined' | 'stable';
  accuracyChange: number;
  strengthAreas: string[];
  improvementAreas: string[];
  recommendedActions: string[];
  insightsUrl: string;
}

/**
 * Load and process email template with variables
 */
export async function loadTemplate(templateName: string, variables: any): Promise<string> {
  try {
    const templatePath = path.join(process.cwd(), 'src/lib/notifications/email-templates', `${templateName}.html`);
    let template = fs.readFileSync(templatePath, 'utf-8');

    // Process template variables
    template = processTemplateVariables(template, variables);

    // Inline CSS styles
    template = await inlineStyles(template);

    return template;
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error);
    throw new Error(`Failed to load email template: ${templateName}`);
  }
}

/**
 * Process template variables using mustache-like syntax
 */
export function processTemplateVariables(template: string, variables: any): string {
  let processedTemplate = template;

  // Replace simple variables {{variableName}}
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    processedTemplate = processedTemplate.replace(regex, String(variables[key] || ''));
  });

  // Process conditional blocks {{#if condition}}...{{/if}}
  processedTemplate = processConditionals(processedTemplate, variables);

  // Process loops {{#each array}}...{{/each}}
  processedTemplate = processLoops(processedTemplate, variables);

  return processedTemplate;
}

/**
 * Process conditional template blocks
 */
function processConditionals(template: string, variables: any): string {
  const conditionalRegex = /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g;

  return template.replace(conditionalRegex, (match, condition, content) => {
    const value = variables[condition];
    return value ? content : '';
  });
}

/**
 * Process loop template blocks
 */
function processLoops(template: string, variables: any): string {
  const loopRegex = /{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g;

  return template.replace(loopRegex, (match, arrayName, content) => {
    const array = variables[arrayName];
    if (!Array.isArray(array)) return '';

    return array.map(item => {
      let itemContent = content;
      if (typeof item === 'string') {
        itemContent = itemContent.replace(/{{this}}/g, item);
      } else if (typeof item === 'object') {
        Object.keys(item).forEach(key => {
          const regex = new RegExp(`{{${key}}}`, 'g');
          itemContent = itemContent.replace(regex, String(item[key] || ''));
        });
      }
      return itemContent;
    }).join('');
  });
}

/**
 * Inline CSS styles for email compatibility
 */
async function inlineStyles(template: string): Promise<string> {
  try {
    const cssPath = path.join(process.cwd(), 'src/lib/notifications/email-templates/email-styles.css');
    const css = fs.readFileSync(cssPath, 'utf-8');

    // Simple CSS inlining (for production, consider using juice or similar)
    // This is a basic implementation - in production you'd use a proper CSS inliner
    const styleTag = `<style>${css}</style>`;

    if (template.includes('</head>')) {
      return template.replace('</head>', `${styleTag}</head>`);
    } else {
      return `${styleTag}${template}`;
    }
  } catch (error) {
    console.error('Error inlining styles:', error);
    return template;
  }
}

/**
 * Generate progress bar HTML
 */
export function generateProgressBar(percentage: number, color?: string): string {
  const safePercentage = Math.max(0, Math.min(100, percentage));
  const barColor = color || '#4f46e5';

  return `
    <div class="progress-container">
      <div class="progress-bar" style="width: ${safePercentage}%; background: ${barColor};"></div>
    </div>
  `;
}

/**
 * Generate badge HTML
 */
export function generateBadge(text: string, type: 'success' | 'warning' | 'info' | 'streak' = 'info'): string {
  return `<span class="badge badge-${type}">${text}</span>`;
}

/**
 * Generate stats section HTML
 */
export function generateStatsSection(stats: { label: string; value: string | number }[]): string {
  const statsHtml = stats.map(stat => `
    <div class="stat-item">
      <span class="stat-number">${stat.value}</span>
      <span class="stat-label">${stat.label}</span>
    </div>
  `).join('');

  return `
    <div class="stats-container">
      ${statsHtml}
    </div>
  `;
}

/**
 * Generate alert box HTML
 */
export function generateAlert(message: string, type: 'success' | 'warning' | 'urgent' | 'info' = 'info'): string {
  return `
    <div class="alert alert-${type}">
      ${message}
    </div>
  `;
}

/**
 * Format time duration for display
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Generate personalized greeting based on time of day
 */
export function getTimeBasedGreeting(userName: string): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return `Good morning, ${userName}!`;
  } else if (hour < 17) {
    return `Good afternoon, ${userName}!`;
  } else {
    return `Good evening, ${userName}!`;
  }
}

/**
 * Get motivational message based on context
 */
export function getMotivationalMessage(context: {
  streak: number;
  accuracy: number;
  lastStudy?: string;
}): string {
  const messages = {
    high_streak: [
      "You're on fire! Keep that momentum going!",
      "Amazing consistency! Your dedication is paying off.",
      "Your study streak is inspiring! Let's keep it rolling."
    ],
    good_accuracy: [
      "Your accuracy is improving! Great job staying focused.",
      "You're mastering these concepts! Keep up the excellent work.",
      "Your understanding is clearly growing. Well done!"
    ],
    comeback: [
      "Welcome back! Every expert was once a beginner.",
      "Ready to crush some questions? Let's get back in there!",
      "Time to turn that knowledge into points! You've got this."
    ],
    default: [
      "Every question is a step closer to your goal!",
      "Practice makes progress. Let's keep moving forward!",
      "Your future self will thank you for studying today!"
    ]
  };

  if (context.streak >= 7) {
    return messages.high_streak[Math.floor(Math.random() * messages.high_streak.length)];
  } else if (context.accuracy >= 80) {
    return messages.good_accuracy[Math.floor(Math.random() * messages.good_accuracy.length)];
  } else if (context.lastStudy && new Date(context.lastStudy) < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
    return messages.comeback[Math.floor(Math.random() * messages.comeback.length)];
  } else {
    return messages.default[Math.floor(Math.random() * messages.default.length)];
  }
}

/**
 * Get default template variables
 */
export function getBaseTemplateVariables(userEmail: string, userName: string): BaseTemplateVariables {
  return {
    userName,
    userEmail,
    unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(userEmail)}`,
    dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    logoUrl: `${process.env.NEXT_PUBLIC_APP_URL}/images/logo-email.png`,
    supportEmail: process.env.SUPPORT_EMAIL || 'support@mellowise.com',
    currentYear: new Date().getFullYear()
  };
}

/**
 * Validate email template variables
 */
export function validateTemplateVariables(variables: any, requiredFields: string[]): boolean {
  return requiredFields.every(field => variables[field] !== undefined && variables[field] !== null);
}

/**
 * Generate email tracking pixel
 */
export function generateTrackingPixel(userId: string, emailType: string, campaignId?: string): string {
  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/email-tracking/pixel`;
  const params = new URLSearchParams({
    user: userId,
    type: emailType,
    ...(campaignId && { campaign: campaignId })
  });

  return `<img src="${trackingUrl}?${params}" width="1" height="1" style="display:none;" alt="" />`;
}

/**
 * Generate CTA button with tracking
 */
export function generateCTAButton(
  text: string,
  url: string,
  userId: string,
  emailType: string,
  buttonType: 'primary' | 'secondary' = 'primary'
): string {
  const trackingParams = new URLSearchParams({
    utm_source: 'email',
    utm_medium: emailType,
    utm_campaign: 'notifications',
    user_id: userId
  });

  const trackedUrl = `${url}${url.includes('?') ? '&' : '?'}${trackingParams}`;
  const buttonClass = buttonType === 'primary' ? 'email-button' : 'email-button email-button-secondary';

  return `
    <a href="${trackedUrl}" class="${buttonClass}" style="text-decoration: none;">
      ${text}
    </a>
  `;
}