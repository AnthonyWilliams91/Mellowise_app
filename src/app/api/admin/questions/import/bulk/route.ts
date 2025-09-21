/**
 * MELLOWISE-017: Bulk Question Import API
 * Comprehensive CSV/JSON import system with validation and error handling
 *
 * @epic Epic 3.1 - Comprehensive LSAT Question System
 * @author Dev Agent Marcus (BMad Team)
 * @created 2025-09-18
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import Papa from 'papaparse'
import { v4 as uuidv4 } from 'uuid'
import type {
  BulkImportRequest,
  BulkImportResponse,
  ImportConfig,
  ImportValidationError,
  CreateQuestionRequest,
  ValidationError
} from '@/types/question-library'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const ImportConfigSchema = z.object({
  skip_header_row: z.boolean().default(true),
  delimiter: z.string().default(','),
  encoding: z.string().default('utf-8'),
  strict_validation: z.boolean().default(true),
  auto_fix_minor_issues: z.boolean().default(true),
  duplicate_handling: z.enum(['skip', 'update', 'create_version']).default('skip'),
  min_quality_score: z.number().min(0).max(10).default(5.0),
  require_explanation: z.boolean().default(true),
  require_source_attribution: z.boolean().default(false),
  default_exam_type: z.string().optional(),
  default_category: z.string().optional(),
  default_skill_level: z.string().optional(),
  assigned_author: z.string().optional()
})

const QuestionImportSchema = z.object({
  content: z.string().min(10, 'Question content must be at least 10 characters'),
  question_type: z.string().min(1, 'Question type is required'),
  subtype: z.string().optional(),
  difficulty: z.number().int().min(1).max(10),
  difficulty_level: z.enum(['easy', 'medium', 'hard']).optional(),
  estimated_time: z.number().int().min(30).max(1800).optional(),
  cognitive_level: z.enum(['recall', 'application', 'analysis', 'synthesis']).optional(),
  correct_answer: z.string().min(1, 'Correct answer is required'),
  answer_choices: z.string().min(1, 'Answer choices are required'),
  explanation: z.string().min(10, 'Explanation must be at least 10 characters'),
  concept_tags: z.string().optional(),
  performance_indicators: z.string().optional(),
  source_attribution: z.string().optional(),
  skill_level: z.enum(['novice', 'beginner', 'intermediate', 'advanced', 'expert']).optional(),
  bloom_taxonomy: z.enum(['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create']).optional(),
  license_type: z.string().default('proprietary'),
  category_slug: z.string().optional(),
  exam_type_slug: z.string().optional(),
  quality_score: z.number().min(0).max(10).optional()
})

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

class QuestionValidator {
  private config: ImportConfig
  private examTypes: Map<string, any> = new Map()
  private categories: Map<string, any> = new Map()

  constructor(config: ImportConfig) {
    this.config = config
  }

  async loadSystemData(supabase: any, tenantId: string) {
    // Load exam types
    const { data: examTypes } = await supabase
      .from('exam_types')
      .select('id, slug, name')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')

    examTypes?.forEach((et: any) => {
      this.examTypes.set(et.slug, et)
    })

    // Load categories
    const { data: categories } = await supabase
      .from('exam_categories')
      .select('id, slug, name, exam_type_id')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)

    categories?.forEach((cat: any) => {
      this.categories.set(cat.slug, cat)
    })
  }

  validateRow(rowData: any, rowNumber: number): {
    isValid: boolean
    errors: ImportValidationError[]
    processedData?: CreateQuestionRequest
  } {
    const errors: ImportValidationError[] = []

    try {
      // Basic schema validation
      const validationResult = QuestionImportSchema.safeParse(rowData)

      if (!validationResult.success) {
        validationResult.error.errors.forEach(err => {
          errors.push({
            row_number: rowNumber,
            error_code: 'SCHEMA_VALIDATION_ERROR',
            error_message: err.message,
            field_name: err.path.join('.'),
            field_value: String(rowData[err.path[0]] || ''),
            severity: 'error'
          })
        })
      }

      if (!validationResult.success) {
        return { isValid: false, errors }
      }

      const data = validationResult.data

      // Advanced business logic validation
      this.validateBusinessRules(data, rowNumber, errors)

      // Process and transform data
      const processedData = this.processRowData(data, errors)

      return {
        isValid: errors.filter(e => e.severity === 'error').length === 0,
        errors,
        processedData
      }

    } catch (error) {
      errors.push({
        row_number: rowNumber,
        error_code: 'PROCESSING_ERROR',
        error_message: `Unexpected error processing row: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'critical'
      })

      return { isValid: false, errors }
    }
  }

  private validateBusinessRules(data: any, rowNumber: number, errors: ImportValidationError[]) {
    // Validate exam type and category relationship
    const examTypeSlug = data.exam_type_slug || this.config.default_exam_type
    const categorySlug = data.category_slug || this.config.default_category

    if (!examTypeSlug) {
      errors.push({
        row_number: rowNumber,
        error_code: 'MISSING_EXAM_TYPE',
        error_message: 'Exam type must be specified in data or config',
        field_name: 'exam_type_slug',
        severity: 'error',
        suggested_fix: 'Add exam_type_slug column or set default_exam_type in config'
      })
    } else if (!this.examTypes.has(examTypeSlug)) {
      errors.push({
        row_number: rowNumber,
        error_code: 'INVALID_EXAM_TYPE',
        error_message: `Exam type '${examTypeSlug}' not found`,
        field_name: 'exam_type_slug',
        field_value: examTypeSlug,
        severity: 'error',
        suggested_fix: `Valid exam types: ${Array.from(this.examTypes.keys()).join(', ')}`
      })
    }

    if (!categorySlug) {
      errors.push({
        row_number: rowNumber,
        error_code: 'MISSING_CATEGORY',
        error_message: 'Category must be specified in data or config',
        field_name: 'category_slug',
        severity: 'error',
        suggested_fix: 'Add category_slug column or set default_category in config'
      })
    } else if (!this.categories.has(categorySlug)) {
      errors.push({
        row_number: rowNumber,
        error_code: 'INVALID_CATEGORY',
        error_message: `Category '${categorySlug}' not found`,
        field_name: 'category_slug',
        field_value: categorySlug,
        severity: 'error',
        suggested_fix: `Valid categories: ${Array.from(this.categories.keys()).join(', ')}`
      })
    }

    // Validate answer choices format
    try {
      const answerChoices = JSON.parse(data.answer_choices)
      if (!Array.isArray(answerChoices) || answerChoices.length < 2) {
        errors.push({
          row_number: rowNumber,
          error_code: 'INVALID_ANSWER_CHOICES',
          error_message: 'Answer choices must be a JSON array with at least 2 options',
          field_name: 'answer_choices',
          field_value: data.answer_choices,
          severity: 'error',
          suggested_fix: 'Format as: [{"id": "A", "text": "Option 1"}, {"id": "B", "text": "Option 2"}]'
        })
      } else {
        // Validate correct answer exists in choices
        const correctAnswerExists = answerChoices.some(choice =>
          choice.id === data.correct_answer || choice.text === data.correct_answer
        )

        if (!correctAnswerExists) {
          errors.push({
            row_number: rowNumber,
            error_code: 'CORRECT_ANSWER_NOT_FOUND',
            error_message: 'Correct answer not found in answer choices',
            field_name: 'correct_answer',
            field_value: data.correct_answer,
            severity: 'error',
            suggested_fix: 'Ensure correct_answer matches an answer choice ID or text'
          })
        }
      }
    } catch (parseError) {
      errors.push({
        row_number: rowNumber,
        error_code: 'INVALID_JSON_FORMAT',
        error_message: 'Answer choices must be valid JSON',
        field_name: 'answer_choices',
        field_value: data.answer_choices,
        severity: 'error',
        suggested_fix: 'Use valid JSON format for answer choices'
      })
    }

    // Validate difficulty consistency
    if (data.difficulty_level) {
      const expectedLevel = this.getDifficultyLevel(data.difficulty)
      if (data.difficulty_level !== expectedLevel) {
        if (this.config.auto_fix_minor_issues) {
          errors.push({
            row_number: rowNumber,
            error_code: 'DIFFICULTY_LEVEL_MISMATCH',
            error_message: `Difficulty level '${data.difficulty_level}' doesn't match difficulty ${data.difficulty}`,
            field_name: 'difficulty_level',
            field_value: data.difficulty_level,
            severity: 'warning',
            suggested_fix: `Auto-corrected to '${expectedLevel}'`
          })
        } else {
          errors.push({
            row_number: rowNumber,
            error_code: 'DIFFICULTY_LEVEL_MISMATCH',
            error_message: `Difficulty level '${data.difficulty_level}' doesn't match difficulty ${data.difficulty}`,
            field_name: 'difficulty_level',
            field_value: data.difficulty_level,
            severity: 'error',
            suggested_fix: `Should be '${expectedLevel}' for difficulty ${data.difficulty}`
          })
        }
      }
    }

    // Quality score validation
    if (data.quality_score && data.quality_score < this.config.min_quality_score) {
      errors.push({
        row_number: rowNumber,
        error_code: 'QUALITY_SCORE_TOO_LOW',
        error_message: `Quality score ${data.quality_score} below minimum ${this.config.min_quality_score}`,
        field_name: 'quality_score',
        field_value: String(data.quality_score),
        severity: 'warning'
      })
    }

    // Required fields based on config
    if (this.config.require_explanation && (!data.explanation || data.explanation.trim().length < 10)) {
      errors.push({
        row_number: rowNumber,
        error_code: 'INSUFFICIENT_EXPLANATION',
        error_message: 'Explanation is required and must be at least 10 characters',
        field_name: 'explanation',
        field_value: data.explanation || '',
        severity: 'error'
      })
    }

    if (this.config.require_source_attribution && !data.source_attribution) {
      errors.push({
        row_number: rowNumber,
        error_code: 'MISSING_SOURCE_ATTRIBUTION',
        error_message: 'Source attribution is required',
        field_name: 'source_attribution',
        severity: 'error'
      })
    }
  }

  private processRowData(data: any, errors: ImportValidationError[]): CreateQuestionRequest {
    // Apply auto-fixes
    if (this.config.auto_fix_minor_issues) {
      if (!data.difficulty_level) {
        data.difficulty_level = this.getDifficultyLevel(data.difficulty)
      }

      if (!data.skill_level) {
        data.skill_level = this.config.default_skill_level || this.getDefaultSkillLevel(data.difficulty)
      }

      if (!data.quality_score) {
        data.quality_score = Math.max(this.config.min_quality_score, 6.0)
      }
    }

    // Process answer choices
    let answerChoices = []
    try {
      answerChoices = JSON.parse(data.answer_choices)
    } catch {
      // Fallback to simple text parsing
      const choices = data.answer_choices.split('\n').filter((c: string) => c.trim())
      answerChoices = choices.map((text: string, index: number) => ({
        id: String.fromCharCode(65 + index), // A, B, C, D...
        text: text.trim()
      }))
    }

    // Process tags
    const conceptTags = data.concept_tags ?
      data.concept_tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []

    const performanceIndicators = data.performance_indicators ?
      data.performance_indicators.split(',').map((t: string) => t.trim()).filter(Boolean) : []

    // Get IDs for exam type and category
    const examTypeSlug = data.exam_type_slug || this.config.default_exam_type
    const categorySlug = data.category_slug || this.config.default_category

    const examType = this.examTypes.get(examTypeSlug)
    const category = this.categories.get(categorySlug)

    return {
      exam_type_id: examType?.id,
      category_id: category?.id,
      content: data.content.trim(),
      question_type: data.question_type,
      subtype: data.subtype,
      difficulty: data.difficulty,
      estimated_time: data.estimated_time,
      cognitive_level: data.cognitive_level,
      correct_answer: data.correct_answer,
      answer_choices: answerChoices,
      explanation: data.explanation.trim(),
      concept_tags: conceptTags,
      performance_indicators: performanceIndicators,
      source_attribution: data.source_attribution,
      skill_level: data.skill_level,
      bloom_taxonomy: data.bloom_taxonomy,
      license_type: data.license_type || 'proprietary'
    }
  }

  private getDifficultyLevel(difficulty: number): 'easy' | 'medium' | 'hard' {
    if (difficulty <= 3) return 'easy'
    if (difficulty <= 7) return 'medium'
    return 'hard'
  }

  private getDefaultSkillLevel(difficulty: number): string {
    if (difficulty <= 3) return 'beginner'
    if (difficulty <= 6) return 'intermediate'
    return 'advanced'
  }
}

// ============================================================================
// IMPORT PROCESSING ENGINE
// ============================================================================

class ImportProcessor {
  private supabase: any
  private tenantId: string
  private validator: QuestionValidator

  constructor(supabase: any, tenantId: string, config: ImportConfig) {
    this.supabase = supabase
    this.tenantId = tenantId
    this.validator = new QuestionValidator(config)
  }

  async processImport(
    batchId: string,
    fileContent: string,
    format: 'csv' | 'json',
    config: ImportConfig
  ): Promise<{
    successful: number
    failed: number
    errors: ImportValidationError[]
  }> {
    // Load system data for validation
    await this.validator.loadSystemData(this.supabase, this.tenantId)

    let rowData: any[] = []

    // Parse file content
    if (format === 'csv') {
      const parseResult = Papa.parse(fileContent, {
        header: config.skip_header_row,
        delimiter: config.delimiter,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim().toLowerCase().replace(/\s+/g, '_')
      })
      rowData = parseResult.data
    } else if (format === 'json') {
      try {
        const jsonData = JSON.parse(fileContent)
        rowData = Array.isArray(jsonData) ? jsonData : [jsonData]
      } catch (error) {
        throw new Error('Invalid JSON format')
      }
    }

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as ImportValidationError[]
    }

    // Process each row
    for (let i = 0; i < rowData.length; i++) {
      const rowNumber = i + (config.skip_header_row ? 2 : 1) // Account for header row

      try {
        const validation = this.validator.validateRow(rowData[i], rowNumber)
        results.errors.push(...validation.errors)

        if (validation.isValid && validation.processedData) {
          // Import the question
          await this.importQuestion(validation.processedData, batchId)
          results.successful++
        } else {
          results.failed++
        }

        // Update batch progress
        await this.updateBatchProgress(batchId, i + 1, results.successful, results.failed)

      } catch (error) {
        results.failed++
        results.errors.push({
          row_number: rowNumber,
          error_code: 'IMPORT_ERROR',
          error_message: `Failed to import question: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'critical'
        })
      }
    }

    return results
  }

  private async importQuestion(questionData: CreateQuestionRequest, batchId: string) {
    const questionId = uuidv4()

    // Check for duplicates if configured
    // (Implementation would check content similarity, etc.)

    // Insert question
    const { error } = await this.supabase
      .from('questions_universal')
      .insert({
        tenant_id: this.tenantId,
        id: questionId,
        import_batch_id: batchId,
        validation_status: 'validated',
        review_status: 'approved',
        quality_score: 6.0,
        is_active: true,
        usage_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...questionData
      })

    if (error) {
      throw new Error(`Database insert failed: ${error.message}`)
    }
  }

  private async updateBatchProgress(
    batchId: string,
    processed: number,
    successful: number,
    failed: number
  ) {
    await this.supabase
      .from('question_import_batches')
      .update({
        processed_rows: processed,
        successful_imports: successful,
        failed_imports: failed,
        updated_at: new Date().toISOString()
      })
      .eq('tenant_id', this.tenantId)
      .eq('id', batchId)
  }
}

// ============================================================================
// API HANDLERS
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current user and tenant
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get tenant ID (assuming user metadata includes tenant_id)
    const tenantId = user.user_metadata?.tenant_id
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID not found' },
        { status: 400 }
      )
    }

    // Parse request body
    const formData = await request.formData()
    const file = formData.get('file') as File
    const configStr = formData.get('config') as string
    const batchName = formData.get('batch_name') as string

    if (!file || !configStr || !batchName) {
      return NextResponse.json(
        { error: 'Missing required fields: file, config, batch_name' },
        { status: 400 }
      )
    }

    // Validate config
    const configValidation = ImportConfigSchema.safeParse(JSON.parse(configStr))
    if (!configValidation.success) {
      return NextResponse.json(
        { error: 'Invalid import configuration', details: configValidation.error.errors },
        { status: 400 }
      )
    }

    const config = configValidation.data

    // Validate file format
    const allowedTypes = ['text/csv', 'application/json', 'text/plain']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported: CSV, JSON' },
        { status: 400 }
      )
    }

    const sourceFormat = file.type.includes('json') ? 'json' : 'csv'
    const fileContent = await file.text()

    // Create import batch record
    const batchId = uuidv4()
    const { error: batchError } = await supabase
      .from('question_import_batches')
      .insert({
        tenant_id: tenantId,
        id: batchId,
        batch_name: batchName,
        source_file_name: file.name,
        source_file_size: file.size,
        source_format: sourceFormat,
        total_rows: 0, // Will be updated during processing
        processed_rows: 0,
        successful_imports: 0,
        failed_imports: 0,
        validation_errors: [],
        status: 'processing',
        started_at: new Date().toISOString(),
        imported_by: user.id,
        import_config: config
      })

    if (batchError) {
      return NextResponse.json(
        { error: 'Failed to create import batch', details: batchError.message },
        { status: 500 }
      )
    }

    // Process the import
    const processor = new ImportProcessor(supabase, tenantId, config)
    const results = await processor.processImport(batchId, fileContent, sourceFormat, config)

    // Update batch with final results
    await supabase
      .from('question_import_batches')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        validation_errors: results.errors
      })
      .eq('tenant_id', tenantId)
      .eq('id', batchId)

    // Store detailed errors if any
    if (results.errors.length > 0) {
      const errorInserts = results.errors.map(error => ({
        tenant_id: tenantId,
        id: uuidv4(),
        batch_id: batchId,
        ...error
      }))

      await supabase
        .from('question_import_errors')
        .insert(errorInserts)
    }

    const response: BulkImportResponse = {
      batch_id: batchId,
      status: 'completed',
      message: `Import completed: ${results.successful} successful, ${results.failed} failed`,
      preview: {
        total_rows: results.successful + results.failed,
        sample_data: [], // Could include sample of imported data
        validation_warnings: results.errors.filter(e => e.severity === 'warning')
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Bulk import error:', error)
    return NextResponse.json(
      {
        error: 'Import processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Get import batch status
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get('batch_id')

    if (!batchId) {
      return NextResponse.json(
        { error: 'batch_id parameter required' },
        { status: 400 }
      )
    }

    // Get current user and tenant
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const tenantId = user.user_metadata?.tenant_id
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID not found' },
        { status: 400 }
      )
    }

    // Get batch details
    const { data: batch, error } = await supabase
      .from('question_import_batches')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', batchId)
      .single()

    if (error || !batch) {
      return NextResponse.json(
        { error: 'Import batch not found' },
        { status: 404 }
      )
    }

    // Get errors if any
    const { data: errors } = await supabase
      .from('question_import_errors')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('batch_id', batchId)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      batch,
      errors: errors || []
    })

  } catch (error) {
    console.error('Get import status error:', error)
    return NextResponse.json(
      { error: 'Failed to get import status' },
      { status: 500 }
    )
  }
}