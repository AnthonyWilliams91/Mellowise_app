/**
 * MELLOWISE-013: LSAT Question Templates
 * Template system for generating authentic LSAT-format questions
 */

import { QuestionTemplate } from '@/types/question-generation';

// Logical Reasoning Templates
export const logicalReasoningTemplates: QuestionTemplate[] = [
  {
    id: 'lr_strengthen_001',
    sectionType: 'logical_reasoning',
    templateName: 'Strengthen the Argument',
    structure: {
      stimulus: {
        type: 'generated',
        placeholder: 'argument_passage',
        constraints: {
          minLength: 50,
          maxLength: 150,
          requiredElements: ['premise', 'conclusion'],
          format: 'argumentative'
        },
        examples: [
          'Recent studies show that students who take handwritten notes retain information better than those who type. This suggests that the physical act of writing engages neural pathways that enhance memory formation. Therefore, schools should encourage handwritten note-taking over digital methods.'
        ]
      },
      question: {
        type: 'static',
        content: 'Which one of the following, if true, most strengthens the argument?'
      },
      answerChoices: [
        {
          type: 'generated',
          placeholder: 'strengthening_statement',
          constraints: {
            minLength: 20,
            maxLength: 60
          }
        },
        {
          type: 'generated',
          placeholder: 'weakening_statement',
          constraints: {
            minLength: 20,
            maxLength: 60
          }
        },
        {
          type: 'generated',
          placeholder: 'irrelevant_statement',
          constraints: {
            minLength: 20,
            maxLength: 60
          }
        },
        {
          type: 'generated',
          placeholder: 'partial_support_statement',
          constraints: {
            minLength: 20,
            maxLength: 60
          }
        },
        {
          type: 'generated',
          placeholder: 'out_of_scope_statement',
          constraints: {
            minLength: 20,
            maxLength: 60
          }
        }
      ],
      explanation: {
        type: 'generated',
        placeholder: 'explanation_text',
        constraints: {
          minLength: 50,
          maxLength: 200,
          requiredElements: ['correct_reasoning', 'distractor_analysis']
        }
      }
    },
    difficulty_range: [3, 7],
    topics: ['causal_reasoning', 'evidence_evaluation', 'argument_structure'],
    frequency: 0.15,
    successRate: 0.65
  },
  {
    id: 'lr_assumption_001',
    sectionType: 'logical_reasoning',
    templateName: 'Necessary Assumption',
    structure: {
      stimulus: {
        type: 'generated',
        placeholder: 'argument_with_gap',
        constraints: {
          minLength: 60,
          maxLength: 140,
          requiredElements: ['premise', 'conclusion', 'logical_gap'],
          format: 'argumentative'
        }
      },
      question: {
        type: 'static',
        content: 'The argument depends on which one of the following assumptions?'
      },
      answerChoices: [
        {
          type: 'generated',
          placeholder: 'necessary_assumption',
          constraints: {
            minLength: 15,
            maxLength: 50
          }
        },
        {
          type: 'generated',
          placeholder: 'sufficient_not_necessary',
          constraints: {
            minLength: 15,
            maxLength: 50
          }
        },
        {
          type: 'generated',
          placeholder: 'tempting_but_wrong',
          constraints: {
            minLength: 15,
            maxLength: 50
          }
        },
        {
          type: 'generated',
          placeholder: 'opposite_assumption',
          constraints: {
            minLength: 15,
            maxLength: 50
          }
        },
        {
          type: 'generated',
          placeholder: 'irrelevant_assumption',
          constraints: {
            minLength: 15,
            maxLength: 50
          }
        }
      ],
      explanation: {
        type: 'generated',
        placeholder: 'assumption_explanation',
        constraints: {
          minLength: 60,
          maxLength: 180,
          requiredElements: ['negation_test', 'gap_analysis']
        }
      }
    },
    difficulty_range: [4, 8],
    topics: ['assumptions', 'logical_gaps', 'conditional_reasoning'],
    frequency: 0.18,
    successRate: 0.58
  },
  {
    id: 'lr_flaw_001',
    sectionType: 'logical_reasoning',
    templateName: 'Flaw in Reasoning',
    structure: {
      stimulus: {
        type: 'generated',
        placeholder: 'flawed_argument',
        constraints: {
          minLength: 70,
          maxLength: 150,
          requiredElements: ['premise', 'flawed_conclusion', 'logical_error'],
          format: 'argumentative'
        }
      },
      question: {
        type: 'variable',
        content: 'The reasoning in the argument is most vulnerable to criticism on the grounds that it',
        placeholder: 'completion_phrase'
      },
      answerChoices: [
        {
          type: 'generated',
          placeholder: 'correct_flaw_description',
          constraints: {
            minLength: 25,
            maxLength: 70
          }
        },
        {
          type: 'generated',
          placeholder: 'different_flaw',
          constraints: {
            minLength: 25,
            maxLength: 70
          }
        },
        {
          type: 'generated',
          placeholder: 'not_a_flaw',
          constraints: {
            minLength: 25,
            maxLength: 70
          }
        },
        {
          type: 'generated',
          placeholder: 'mischaracterization',
          constraints: {
            minLength: 25,
            maxLength: 70
          }
        },
        {
          type: 'generated',
          placeholder: 'overly_specific',
          constraints: {
            minLength: 25,
            maxLength: 70
          }
        }
      ],
      explanation: {
        type: 'generated',
        placeholder: 'flaw_analysis',
        constraints: {
          minLength: 70,
          maxLength: 200,
          requiredElements: ['flaw_identification', 'why_wrong', 'distractor_explanation']
        }
      }
    },
    difficulty_range: [3, 9],
    topics: ['logical_fallacies', 'argument_flaws', 'critical_thinking'],
    frequency: 0.20,
    successRate: 0.62
  }
];

// Logic Games Templates
export const logicGamesTemplates: QuestionTemplate[] = [
  {
    id: 'lg_ordering_001',
    sectionType: 'logic_games',
    templateName: 'Linear Ordering Game',
    structure: {
      stimulus: {
        type: 'generated',
        placeholder: 'ordering_scenario',
        constraints: {
          minLength: 100,
          maxLength: 200,
          requiredElements: ['entities', 'positions', 'rules'],
          format: 'game_setup'
        },
        examples: [
          'Seven students—F, G, H, J, K, L, and M—are scheduled to give presentations on consecutive days from Monday through Sunday. Each student gives exactly one presentation. The following conditions apply:\nF presents before both G and H.\nJ presents on Thursday.\nK presents at least two days after L.\nM presents either first or last.'
        ]
      },
      question: {
        type: 'variable',
        placeholder: 'ordering_question',
        content: 'If [condition], which one of the following must be true?'
      },
      answerChoices: [
        {
          type: 'generated',
          placeholder: 'valid_ordering',
          constraints: {
            minLength: 10,
            maxLength: 40,
            format: 'ordering_statement'
          }
        },
        {
          type: 'generated',
          placeholder: 'possible_not_must',
          constraints: {
            minLength: 10,
            maxLength: 40,
            format: 'ordering_statement'
          }
        },
        {
          type: 'generated',
          placeholder: 'violates_rule',
          constraints: {
            minLength: 10,
            maxLength: 40,
            format: 'ordering_statement'
          }
        },
        {
          type: 'generated',
          placeholder: 'could_be_false',
          constraints: {
            minLength: 10,
            maxLength: 40,
            format: 'ordering_statement'
          }
        },
        {
          type: 'generated',
          placeholder: 'unrelated_ordering',
          constraints: {
            minLength: 10,
            maxLength: 40,
            format: 'ordering_statement'
          }
        }
      ],
      explanation: {
        type: 'generated',
        placeholder: 'game_solution',
        constraints: {
          minLength: 100,
          maxLength: 300,
          requiredElements: ['setup_analysis', 'deductions', 'answer_justification']
        }
      }
    },
    difficulty_range: [4, 9],
    topics: ['ordering', 'sequencing', 'conditional_rules'],
    frequency: 0.25,
    successRate: 0.55
  },
  {
    id: 'lg_grouping_001',
    sectionType: 'logic_games',
    templateName: 'Grouping Game',
    structure: {
      stimulus: {
        type: 'generated',
        placeholder: 'grouping_scenario',
        constraints: {
          minLength: 100,
          maxLength: 200,
          requiredElements: ['entities', 'groups', 'distribution_rules'],
          format: 'game_setup'
        }
      },
      question: {
        type: 'variable',
        placeholder: 'grouping_question',
        content: 'Which one of the following is an acceptable assignment of [entities] to [groups]?'
      },
      answerChoices: [
        {
          type: 'generated',
          placeholder: 'valid_grouping',
          constraints: {
            minLength: 20,
            maxLength: 60,
            format: 'grouping_list'
          }
        },
        {
          type: 'generated',
          placeholder: 'violates_distribution',
          constraints: {
            minLength: 20,
            maxLength: 60,
            format: 'grouping_list'
          }
        },
        {
          type: 'generated',
          placeholder: 'violates_conditional',
          constraints: {
            minLength: 20,
            maxLength: 60,
            format: 'grouping_list'
          }
        },
        {
          type: 'generated',
          placeholder: 'incomplete_grouping',
          constraints: {
            minLength: 20,
            maxLength: 60,
            format: 'grouping_list'
          }
        },
        {
          type: 'generated',
          placeholder: 'impossible_grouping',
          constraints: {
            minLength: 20,
            maxLength: 60,
            format: 'grouping_list'
          }
        }
      ],
      explanation: {
        type: 'generated',
        placeholder: 'grouping_analysis',
        constraints: {
          minLength: 80,
          maxLength: 250,
          requiredElements: ['rule_application', 'elimination_process']
        }
      }
    },
    difficulty_range: [3, 8],
    topics: ['grouping', 'distribution', 'team_selection'],
    frequency: 0.22,
    successRate: 0.60
  }
];

// Reading Comprehension Templates
export const readingComprehensionTemplates: QuestionTemplate[] = [
  {
    id: 'rc_main_point_001',
    sectionType: 'reading_comprehension',
    templateName: 'Main Point',
    structure: {
      stimulus: {
        type: 'generated',
        placeholder: 'passage_text',
        constraints: {
          minLength: 300,
          maxLength: 500,
          requiredElements: ['introduction', 'body', 'conclusion', 'thesis'],
          format: 'academic_passage'
        }
      },
      question: {
        type: 'static',
        content: 'Which one of the following most accurately expresses the main point of the passage?'
      },
      answerChoices: [
        {
          type: 'generated',
          placeholder: 'correct_main_point',
          constraints: {
            minLength: 30,
            maxLength: 80,
            requiredElements: ['thesis_capture']
          }
        },
        {
          type: 'generated',
          placeholder: 'too_narrow',
          constraints: {
            minLength: 30,
            maxLength: 80,
            requiredElements: ['partial_point']
          }
        },
        {
          type: 'generated',
          placeholder: 'too_broad',
          constraints: {
            minLength: 30,
            maxLength: 80,
            requiredElements: ['overgeneralization']
          }
        },
        {
          type: 'generated',
          placeholder: 'misinterpretation',
          constraints: {
            minLength: 30,
            maxLength: 80,
            requiredElements: ['distortion']
          }
        },
        {
          type: 'generated',
          placeholder: 'detail_not_main',
          constraints: {
            minLength: 30,
            maxLength: 80,
            requiredElements: ['minor_point']
          }
        }
      ],
      explanation: {
        type: 'generated',
        placeholder: 'main_point_explanation',
        constraints: {
          minLength: 60,
          maxLength: 200,
          requiredElements: ['thesis_location', 'scope_analysis']
        }
      }
    },
    difficulty_range: [2, 6],
    topics: ['main_idea', 'passage_structure', 'thesis_identification'],
    frequency: 0.15,
    successRate: 0.70
  },
  {
    id: 'rc_author_perspective_001',
    sectionType: 'reading_comprehension',
    templateName: 'Author\'s Perspective',
    structure: {
      stimulus: {
        type: 'generated',
        placeholder: 'opinionated_passage',
        constraints: {
          minLength: 350,
          maxLength: 550,
          requiredElements: ['author_stance', 'evidence', 'counterarguments'],
          format: 'argumentative_passage'
        }
      },
      question: {
        type: 'variable',
        placeholder: 'perspective_question',
        content: 'The author\'s attitude toward [topic] can best be described as'
      },
      answerChoices: [
        {
          type: 'generated',
          placeholder: 'correct_attitude',
          constraints: {
            minLength: 10,
            maxLength: 30,
            format: 'attitude_descriptor'
          }
        },
        {
          type: 'generated',
          placeholder: 'too_extreme',
          constraints: {
            minLength: 10,
            maxLength: 30,
            format: 'attitude_descriptor'
          }
        },
        {
          type: 'generated',
          placeholder: 'opposite_attitude',
          constraints: {
            minLength: 10,
            maxLength: 30,
            format: 'attitude_descriptor'
          }
        },
        {
          type: 'generated',
          placeholder: 'partial_attitude',
          constraints: {
            minLength: 10,
            maxLength: 30,
            format: 'attitude_descriptor'
          }
        },
        {
          type: 'generated',
          placeholder: 'neutral_when_not',
          constraints: {
            minLength: 10,
            maxLength: 30,
            format: 'attitude_descriptor'
          }
        }
      ],
      explanation: {
        type: 'generated',
        placeholder: 'tone_analysis',
        constraints: {
          minLength: 70,
          maxLength: 200,
          requiredElements: ['tone_evidence', 'word_choice_analysis']
        }
      }
    },
    difficulty_range: [3, 7],
    topics: ['author_tone', 'perspective', 'critical_analysis'],
    frequency: 0.18,
    successRate: 0.65
  }
];

// Combine all templates
export const allTemplates: QuestionTemplate[] = [
  ...logicalReasoningTemplates,
  ...logicGamesTemplates,
  ...readingComprehensionTemplates
];

// Template selection function
export function selectTemplate(
  sectionType: 'logical_reasoning' | 'logic_games' | 'reading_comprehension',
  difficulty: number,
  avoidIds?: string[]
): QuestionTemplate | null {
  const sectionTemplates = allTemplates.filter(
    t => t.sectionType === sectionType &&
    difficulty >= t.difficulty_range[0] &&
    difficulty <= t.difficulty_range[1] &&
    (!avoidIds || !avoidIds.includes(t.id))
  );

  if (sectionTemplates.length === 0) return null;

  // Weighted random selection based on frequency
  const totalFrequency = sectionTemplates.reduce((sum, t) => sum + t.frequency, 0);
  let random = Math.random() * totalFrequency;

  for (const template of sectionTemplates) {
    random -= template.frequency;
    if (random <= 0) return template;
  }

  return sectionTemplates[0];
}

// Template validation
export function validateTemplate(template: QuestionTemplate): string[] {
  const errors: string[] = [];

  if (!template.id) errors.push('Template must have an ID');
  if (!template.sectionType) errors.push('Template must specify section type');
  if (!template.templateName) errors.push('Template must have a name');

  if (!template.structure) {
    errors.push('Template must have a structure');
  } else {
    if (!template.structure.stimulus) errors.push('Template must have a stimulus');
    if (!template.structure.question) errors.push('Template must have a question');
    if (!template.structure.answerChoices || template.structure.answerChoices.length !== 5) {
      errors.push('Template must have exactly 5 answer choices');
    }
  }

  if (!template.difficulty_range || template.difficulty_range.length !== 2) {
    errors.push('Template must specify difficulty range [min, max]');
  }

  if (!template.topics || template.topics.length === 0) {
    errors.push('Template must specify at least one topic');
  }

  return errors;
}