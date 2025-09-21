/**
 * MELLOWISE-013: Quality Assurance Pipeline
 * Validation rules and quality checks for generated LSAT questions
 */

import {
  GeneratedQuestion,
  QualityValidation,
  ValidationRule,
  ValidationResult,
  ValidationIssue
} from '@/types/question-generation';

/**
 * Format validation rules
 */
const formatValidationRules: ValidationRule[] = [
  {
    id: 'format_stimulus_length',
    name: 'Stimulus Length Check',
    type: 'format',
    severity: 'error',
    check: (question: GeneratedQuestion): ValidationResult => {
      const minLength = question.sectionType === 'reading_comprehension' ? 300 : 50;
      const maxLength = question.sectionType === 'reading_comprehension' ? 600 : 200;

      const length = question.stimulus.length;
      if (length < minLength || length > maxLength) {
        return {
          passed: false,
          score: 0,
          issues: [`Stimulus length (${length}) outside valid range (${minLength}-${maxLength})`]
        };
      }

      return { passed: true, score: 100 };
    }
  },
  {
    id: 'format_answer_count',
    name: 'Answer Choice Count',
    type: 'format',
    severity: 'error',
    check: (question: GeneratedQuestion): ValidationResult => {
      if (question.answerChoices.length !== 5) {
        return {
          passed: false,
          score: 0,
          issues: [`Must have exactly 5 answer choices, found ${question.answerChoices.length}`]
        };
      }
      return { passed: true, score: 100 };
    }
  },
  {
    id: 'format_correct_answer',
    name: 'Single Correct Answer',
    type: 'format',
    severity: 'error',
    check: (question: GeneratedQuestion): ValidationResult => {
      const correctCount = question.answerChoices.filter(ac => ac.isCorrect).length;
      if (correctCount !== 1) {
        return {
          passed: false,
          score: 0,
          issues: [`Must have exactly 1 correct answer, found ${correctCount}`]
        };
      }
      return { passed: true, score: 100 };
    }
  },
  {
    id: 'format_answer_labels',
    name: 'Answer Choice Labels',
    type: 'format',
    severity: 'warning',
    check: (question: GeneratedQuestion): ValidationResult => {
      const expectedLabels = ['A', 'B', 'C', 'D', 'E'];
      const actualLabels = question.answerChoices.map(ac => ac.label);

      const labelsCorrect = expectedLabels.every((label, index) =>
        actualLabels[index] === label
      );

      if (!labelsCorrect) {
        return {
          passed: false,
          score: 50,
          issues: ['Answer choice labels not in correct A-E order'],
          suggestions: ['Fix answer choice labels to A, B, C, D, E']
        };
      }
      return { passed: true, score: 100 };
    }
  },
  {
    id: 'format_answer_length_balance',
    name: 'Answer Choice Length Balance',
    type: 'format',
    severity: 'warning',
    check: (question: GeneratedQuestion): ValidationResult => {
      const lengths = question.answerChoices.map(ac => ac.text.length);
      const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      const maxDeviation = Math.max(...lengths.map(l => Math.abs(l - avgLength)));

      if (maxDeviation > avgLength * 0.5) {
        return {
          passed: false,
          score: 70,
          issues: ['Answer choices have significantly different lengths'],
          suggestions: ['Balance answer choice lengths for better test validity']
        };
      }
      return { passed: true, score: 100 };
    }
  }
];

/**
 * Content validation rules
 */
const contentValidationRules: ValidationRule[] = [
  {
    id: 'content_no_ambiguity',
    name: 'Ambiguity Check',
    type: 'content',
    severity: 'error',
    check: (question: GeneratedQuestion): ValidationResult => {
      const ambiguousTerms = [
        'arguably', 'possibly', 'might be', 'could be considered',
        'some might say', 'it depends'
      ];

      const questionLower = question.question.toLowerCase();
      const foundTerms = ambiguousTerms.filter(term => questionLower.includes(term));

      if (foundTerms.length > 0) {
        return {
          passed: false,
          score: 40,
          issues: [`Question contains ambiguous terms: ${foundTerms.join(', ')}`],
          suggestions: ['Remove ambiguous language for clarity']
        };
      }
      return { passed: true, score: 100 };
    }
  },
  {
    id: 'content_factual_accuracy',
    name: 'Factual Accuracy',
    type: 'content',
    severity: 'error',
    check: (question: GeneratedQuestion): ValidationResult => {
      // Check for obviously false statements
      const falseIndicators = [
        'all lawyers must', 'every scientist believes',
        'no one has ever', 'it is impossible to'
      ];

      const stimulusLower = question.stimulus.toLowerCase();
      const foundIndicators = falseIndicators.filter(ind => stimulusLower.includes(ind));

      if (foundIndicators.length > 0) {
        return {
          passed: false,
          score: 30,
          issues: ['Stimulus may contain overgeneralized or false statements'],
          suggestions: ['Review for factual accuracy and avoid absolute statements']
        };
      }
      return { passed: true, score: 100 };
    }
  },
  {
    id: 'content_cultural_sensitivity',
    name: 'Cultural Sensitivity',
    type: 'content',
    severity: 'warning',
    check: (question: GeneratedQuestion): ValidationResult => {
      const sensitiveTerms = [
        'minority', 'foreign', 'exotic', 'primitive',
        'third-world', 'oriental', 'ethnic'
      ];

      const fullText = (question.stimulus + ' ' + question.question).toLowerCase();
      const foundTerms = sensitiveTerms.filter(term => fullText.includes(term));

      if (foundTerms.length > 0) {
        return {
          passed: false,
          score: 60,
          issues: [`Contains potentially sensitive terms: ${foundTerms.join(', ')}`],
          suggestions: ['Review for cultural sensitivity and use neutral language']
        };
      }
      return { passed: true, score: 100 };
    }
  },
  {
    id: 'content_explanation_quality',
    name: 'Explanation Quality',
    type: 'content',
    severity: 'warning',
    check: (question: GeneratedQuestion): ValidationResult => {
      const explanation = question.explanation;

      if (explanation.length < 50) {
        return {
          passed: false,
          score: 30,
          issues: ['Explanation too brief'],
          suggestions: ['Provide more detailed explanation of the correct answer']
        };
      }

      // Check if explanation addresses wrong answers
      const mentionsWrongAnswers =
        explanation.includes('incorrect') ||
        explanation.includes('wrong') ||
        explanation.includes('distractor') ||
        question.answerChoices.some(ac =>
          !ac.isCorrect && explanation.includes(ac.label)
        );

      if (!mentionsWrongAnswers) {
        return {
          passed: false,
          score: 70,
          issues: ['Explanation does not address why other answers are incorrect'],
          suggestions: ['Explain why each distractor is wrong']
        };
      }

      return { passed: true, score: 100 };
    }
  }
];

/**
 * Difficulty validation rules
 */
const difficultyValidationRules: ValidationRule[] = [
  {
    id: 'difficulty_appropriate_complexity',
    name: 'Complexity Matches Difficulty',
    type: 'difficulty',
    severity: 'warning',
    check: (question: GeneratedQuestion): ValidationResult => {
      const difficulty = question.difficulty;
      const stimulusComplexity = calculateTextComplexity(question.stimulus);

      // Expected complexity ranges for difficulty levels
      const expectedComplexity = {
        min: Math.max(0, (difficulty - 2) * 10),
        max: Math.min(100, (difficulty + 2) * 10)
      };

      if (stimulusComplexity < expectedComplexity.min ||
          stimulusComplexity > expectedComplexity.max) {
        return {
          passed: false,
          score: 60,
          issues: [`Text complexity (${stimulusComplexity}) doesn't match difficulty ${difficulty}`],
          suggestions: ['Adjust text complexity to match intended difficulty']
        };
      }

      return { passed: true, score: 100 };
    }
  },
  {
    id: 'difficulty_distractor_quality',
    name: 'Distractor Quality for Difficulty',
    type: 'difficulty',
    severity: 'warning',
    check: (question: GeneratedQuestion): ValidationResult => {
      const difficulty = question.difficulty;

      // Higher difficulty should have more subtle distractors
      if (difficulty >= 7) {
        const distractors = question.answerChoices.filter(ac => !ac.isCorrect);
        const subtleDistractors = distractors.filter(d =>
          d.distractorType === 'partial' || d.distractorType === 'misinterpretation'
        );

        if (subtleDistractors.length < 2) {
          return {
            passed: false,
            score: 70,
            issues: ['High difficulty questions need more subtle distractors'],
            suggestions: ['Create distractors that are partially correct or based on misinterpretations']
          };
        }
      }

      return { passed: true, score: 100 };
    }
  }
];

/**
 * Quality validation rules
 */
const qualityValidationRules: ValidationRule[] = [
  {
    id: 'quality_originality',
    name: 'Question Originality',
    type: 'quality',
    severity: 'warning',
    check: (question: GeneratedQuestion): ValidationResult => {
      // Check for common LSAT clichés
      const cliches = [
        'all roses are flowers',
        'socrates is mortal',
        'if it rains then',
        'john is taller than mary'
      ];

      const fullText = question.stimulus.toLowerCase();
      const foundCliches = cliches.filter(cliche => fullText.includes(cliche));

      if (foundCliches.length > 0) {
        return {
          passed: false,
          score: 50,
          issues: ['Question uses common logic puzzle clichés'],
          suggestions: ['Create more original scenarios']
        };
      }

      return { passed: true, score: 100 };
    }
  },
  {
    id: 'quality_educational_value',
    name: 'Educational Value',
    type: 'quality',
    severity: 'info',
    check: (question: GeneratedQuestion): ValidationResult => {
      // Check if question tests a clear skill
      const skillIndicators = [
        'strengthen', 'weaken', 'assumption', 'flaw',
        'conclusion', 'inference', 'principle', 'parallel'
      ];

      const questionLower = question.question.toLowerCase();
      const hasSkillFocus = skillIndicators.some(skill => questionLower.includes(skill));

      if (!hasSkillFocus && question.sectionType === 'logical_reasoning') {
        return {
          passed: false,
          score: 80,
          issues: ['Question type not clearly identified'],
          suggestions: ['Clarify what reasoning skill is being tested']
        };
      }

      return { passed: true, score: 100 };
    }
  }
];

/**
 * All validation rules combined
 */
const allValidationRules: ValidationRule[] = [
  ...formatValidationRules,
  ...contentValidationRules,
  ...difficultyValidationRules,
  ...qualityValidationRules
];

/**
 * Run quality validation on a generated question
 */
export function validateQuestion(question: GeneratedQuestion): QualityValidation {
  const issues: ValidationIssue[] = [];
  const suggestions: string[] = [];
  let totalScore = 0;
  let ruleCount = 0;

  // Run all validation rules
  for (const rule of allValidationRules) {
    const result = rule.check(question);
    ruleCount++;
    totalScore += result.score;

    if (!result.passed) {
      issues.push({
        ruleId: rule.id,
        severity: rule.severity,
        message: result.issues?.[0] || 'Validation failed',
        suggestion: result.suggestions?.[0]
      });

      if (result.suggestions) {
        suggestions.push(...result.suggestions);
      }
    }
  }

  const overallScore = Math.round(totalScore / ruleCount);
  const passed = issues.filter(i => i.severity === 'error').length === 0 && overallScore >= 70;

  // Specific format checks
  const formatValid = formatValidationRules.every(rule =>
    rule.check(question).passed || rule.severity !== 'error'
  );

  const difficultyAppropriate = difficultyValidationRules.every(rule =>
    rule.check(question).passed || rule.severity !== 'error'
  );

  const answerChoicesValid = question.answerChoices.length === 5 &&
    question.answerChoices.filter(ac => ac.isCorrect).length === 1;

  const explanationClear = question.explanation.length >= 50;

  // Content checks
  const topicRelevant = true; // Would need topic database to verify
  const noAmbiguity = !issues.some(i => i.ruleId === 'content_no_ambiguity');
  const factuallyAccurate = !issues.some(i => i.ruleId === 'content_factual_accuracy');
  const culturallySensitive = !issues.some(i => i.ruleId === 'content_cultural_sensitivity');

  return {
    questionId: question.id,
    validationRules: allValidationRules,
    overallScore,
    passed,
    issues,
    suggestions: [...new Set(suggestions)], // Remove duplicates
    formatValid,
    difficultyAppropriate,
    answerChoicesValid,
    explanationClear,
    topicRelevant,
    noAmbiguity,
    factuallyAccurate,
    culturallySensitive
  };
}

/**
 * Calculate text complexity score (0-100)
 */
function calculateTextComplexity(text: string): number {
  const words = text.split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  // Average words per sentence
  const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);

  // Complex word ratio (words > 6 characters)
  const complexWords = words.filter(w => w.length > 6).length;
  const complexWordRatio = complexWords / Math.max(words.length, 1);

  // Subordinate clause indicators
  const clauseIndicators = ['which', 'that', 'although', 'because', 'since', 'while'];
  const clauseCount = clauseIndicators.reduce((count, indicator) =>
    count + text.toLowerCase().split(indicator).length - 1, 0
  );
  const clauseRatio = clauseCount / Math.max(sentences.length, 1);

  // Calculate complexity score
  const sentenceComplexity = Math.min(avgWordsPerSentence * 3, 60);
  const wordComplexity = complexWordRatio * 100;
  const structureComplexity = Math.min(clauseRatio * 40, 40);

  return Math.round((sentenceComplexity + wordComplexity + structureComplexity) / 3);
}

/**
 * Batch validate multiple questions
 */
export function batchValidate(questions: GeneratedQuestion[]): {
  results: QualityValidation[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    averageScore: number;
    commonIssues: string[];
  };
} {
  const results = questions.map(q => validateQuestion(q));

  const passed = results.filter(r => r.passed).length;
  const totalScore = results.reduce((sum, r) => sum + r.overallScore, 0);

  // Find common issues
  const issueCount: { [key: string]: number } = {};
  results.forEach(r => {
    r.issues.forEach(issue => {
      issueCount[issue.ruleId] = (issueCount[issue.ruleId] || 0) + 1;
    });
  });

  const commonIssues = Object.entries(issueCount)
    .filter(([_, count]) => count > questions.length * 0.3)
    .map(([ruleId]) => {
      const rule = allValidationRules.find(r => r.id === ruleId);
      return rule?.name || ruleId;
    });

  return {
    results,
    summary: {
      total: questions.length,
      passed,
      failed: questions.length - passed,
      averageScore: Math.round(totalScore / questions.length),
      commonIssues
    }
  };
}

/**
 * Auto-fix common issues in generated questions
 */
export function autoFixQuestion(question: GeneratedQuestion): GeneratedQuestion {
  const fixed = { ...question };

  // Fix answer labels
  const expectedLabels: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
  fixed.answerChoices = fixed.answerChoices.map((ac, index) => ({
    ...ac,
    label: expectedLabels[index]
  }));

  // Ensure exactly one correct answer
  const correctCount = fixed.answerChoices.filter(ac => ac.isCorrect).length;
  if (correctCount === 0) {
    // Make the first answer correct if none are
    fixed.answerChoices[0].isCorrect = true;
    fixed.correctAnswer = fixed.answerChoices[0].id;
  } else if (correctCount > 1) {
    // Keep only the first correct answer
    let foundFirst = false;
    fixed.answerChoices = fixed.answerChoices.map(ac => {
      if (ac.isCorrect) {
        if (!foundFirst) {
          foundFirst = true;
          return ac;
        }
        return { ...ac, isCorrect: false };
      }
      return ac;
    });
  }

  // Trim whitespace
  fixed.stimulus = fixed.stimulus.trim();
  fixed.question = fixed.question.trim();
  fixed.explanation = fixed.explanation.trim();
  fixed.answerChoices = fixed.answerChoices.map(ac => ({
    ...ac,
    text: ac.text.trim()
  }));

  return fixed;
}