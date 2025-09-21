/**
 * MELLOWISE-017: Advanced Question Search API
 * Multi-criteria search with performance optimization and faceted filtering
 *
 * @epic Epic 3.1 - Comprehensive LSAT Question System
 * @author Dev Agent Marcus (BMad Team)
 * @created 2025-09-18
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type {
  QuestionSearchFilters,
  QuestionSearchResult,
  SearchFacets,
  EnhancedQuestionUniversal
} from '@/types/question-library'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const SearchFiltersSchema = z.object({
  // Basic filters
  exam_type_slug: z.string().optional(),
  category_slug: z.string().optional(),
  difficulty_min: z.number().int().min(1).max(10).default(1),
  difficulty_max: z.number().int().min(1).max(10).default(10),

  // Advanced filters
  skill_levels: z.array(z.string()).optional(),
  concept_tags: z.array(z.string()).optional(),
  bloom_taxonomy_levels: z.array(z.string()).optional(),
  cognitive_levels: z.array(z.string()).optional(),

  // Quality filters
  min_quality_score: z.number().min(0).max(10).default(0),
  min_community_rating: z.number().min(0).max(5).default(0),
  min_usage_count: z.number().int().min(0).optional(),
  max_usage_count: z.number().int().min(0).optional(),

  // Content filters
  search_text: z.string().optional(),
  question_types: z.array(z.string()).optional(),
  has_explanation: z.boolean().optional(),
  has_source_attribution: z.boolean().optional(),

  // Status filters
  review_status: z.array(z.string()).optional(),
  validation_status: z.array(z.string()).optional(),
  license_types: z.array(z.string()).optional(),

  // Date filters
  created_after: z.string().optional(),
  created_before: z.string().optional(),
  last_used_after: z.string().optional(),
  last_used_before: z.string().optional(),

  // Pagination and sorting
  limit: z.number().int().min(1).max(100).default(25),
  offset: z.number().int().min(0).default(0),
  sort_by: z.enum(['quality_score', 'community_rating', 'usage_count', 'difficulty', 'created_at', 'relevance']).default('quality_score'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),

  // Additional options
  include_facets: z.boolean().default(true),
  include_analytics: z.boolean().default(false)
})

// ============================================================================
// SEARCH SERVICE
// ============================================================================

class QuestionSearchService {
  private supabase: any
  private tenantId: string

  constructor(supabase: any, tenantId: string) {
    this.supabase = supabase
    this.tenantId = tenantId
  }

  async search(filters: QuestionSearchFilters): Promise<QuestionSearchResult> {
    // Build the main search query
    const { data: questions, error: searchError, count } = await this.buildSearchQuery(filters)

    if (searchError) {
      throw new Error(`Search failed: ${searchError.message}`)
    }

    // Get facets if requested
    const facets = filters.include_facets ? await this.getFacets(filters) : {
      categories: [],
      difficulty_levels: [],
      skill_levels: [],
      question_types: [],
      concept_tags: [],
      quality_ranges: []
    }

    // Calculate pagination
    const totalCount = count || 0
    const pageSize = filters.limit || 25
    const currentPage = Math.floor((filters.offset || 0) / pageSize) + 1
    const totalPages = Math.ceil(totalCount / pageSize)

    return {
      questions: questions || [],
      total_count: totalCount,
      filtered_count: totalCount,
      facets,
      pagination: {
        current_page: currentPage,
        total_pages: totalPages,
        page_size: pageSize,
        has_next: currentPage < totalPages,
        has_previous: currentPage > 1
      }
    }
  }

  private async buildSearchQuery(filters: QuestionSearchFilters) {
    let query = this.supabase
      .from('questions_universal')
      .select(`
        *,
        exam_categories!inner(
          id,
          name,
          slug,
          exam_types!inner(
            id,
            name,
            slug
          )
        )
      `, { count: 'exact' })
      .eq('tenant_id', this.tenantId)
      .eq('is_active', true)

    // Basic filters
    if (filters.exam_type_slug) {
      query = query.eq('exam_categories.exam_types.slug', filters.exam_type_slug)
    }

    if (filters.category_slug) {
      query = query.eq('exam_categories.slug', filters.category_slug)
    }

    // Difficulty range
    query = query
      .gte('difficulty', filters.difficulty_min || 1)
      .lte('difficulty', filters.difficulty_max || 10)

    // Quality filters
    if (filters.min_quality_score && filters.min_quality_score > 0) {
      query = query.gte('quality_score', filters.min_quality_score)
    }

    if (filters.min_community_rating && filters.min_community_rating > 0) {
      query = query.gte('community_rating', filters.min_community_rating)
    }

    // Usage count filters
    if (filters.min_usage_count !== undefined) {
      query = query.gte('usage_count', filters.min_usage_count)
    }

    if (filters.max_usage_count !== undefined) {
      query = query.lte('usage_count', filters.max_usage_count)
    }

    // Array filters
    if (filters.skill_levels && filters.skill_levels.length > 0) {
      query = query.in('skill_level', filters.skill_levels)
    }

    if (filters.cognitive_levels && filters.cognitive_levels.length > 0) {
      query = query.in('cognitive_level', filters.cognitive_levels)
    }

    if (filters.bloom_taxonomy_levels && filters.bloom_taxonomy_levels.length > 0) {
      query = query.in('bloom_taxonomy', filters.bloom_taxonomy_levels)
    }

    if (filters.question_types && filters.question_types.length > 0) {
      query = query.in('question_type', filters.question_types)
    }

    if (filters.review_status && filters.review_status.length > 0) {
      query = query.in('review_status', filters.review_status)
    }

    if (filters.validation_status && filters.validation_status.length > 0) {
      query = query.in('validation_status', filters.validation_status)
    }

    if (filters.license_types && filters.license_types.length > 0) {
      query = query.in('license_type', filters.license_types)
    }

    // Concept tags filter (array contains)
    if (filters.concept_tags && filters.concept_tags.length > 0) {
      query = query.overlaps('concept_tags', filters.concept_tags)
    }

    // Boolean filters
    if (filters.has_explanation !== undefined) {
      if (filters.has_explanation) {
        query = query.not('explanation', 'is', null).neq('explanation', '')
      } else {
        query = query.or('explanation.is.null,explanation.eq.')
      }
    }

    if (filters.has_source_attribution !== undefined) {
      if (filters.has_source_attribution) {
        query = query.not('source_attribution', 'is', null).neq('source_attribution', '')
      } else {
        query = query.or('source_attribution.is.null,source_attribution.eq.')
      }
    }

    // Date filters
    if (filters.created_after) {
      query = query.gte('created_at', filters.created_after)
    }

    if (filters.created_before) {
      query = query.lte('created_at', filters.created_before)
    }

    if (filters.last_used_after) {
      query = query.gte('last_used_at', filters.last_used_after)
    }

    if (filters.last_used_before) {
      query = query.lte('last_used_at', filters.last_used_before)
    }

    // Text search (full-text search on content)
    if (filters.search_text) {
      const searchTerm = filters.search_text.trim()
      if (searchTerm.length > 0) {
        // Use ilike for partial matching across multiple fields
        query = query.or(`content.ilike.%${searchTerm}%, explanation.ilike.%${searchTerm}%, concept_tags.cs.{${searchTerm}}`)
      }
    }

    // Sorting
    const sortOrder = { ascending: filters.sort_order === 'asc' }

    switch (filters.sort_by) {
      case 'quality_score':
        query = query.order('quality_score', sortOrder)
        break
      case 'community_rating':
        query = query.order('community_rating', sortOrder).order('rating_count', { ascending: false })
        break
      case 'usage_count':
        query = query.order('usage_count', sortOrder)
        break
      case 'difficulty':
        query = query.order('difficulty', sortOrder)
        break
      case 'created_at':
        query = query.order('created_at', sortOrder)
        break
      case 'relevance':
        // For relevance, prioritize quality + community rating + usage
        query = query.order('quality_score', { ascending: false })
                    .order('community_rating', { ascending: false })
                    .order('usage_count', { ascending: false })
        break
      default:
        query = query.order('quality_score', { ascending: false })
    }

    // Pagination
    query = query.range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 25) - 1)

    return query
  }

  private async getFacets(filters: QuestionSearchFilters): Promise<SearchFacets> {
    // Build base query for facet counts (without pagination)
    const baseFilters = { ...filters }
    delete baseFilters.limit
    delete baseFilters.offset

    // Categories facet
    const categoriesPromise = this.getCategoriesFacet(baseFilters)

    // Difficulty levels facet
    const difficultyPromise = this.getDifficultyLevelsFacet(baseFilters)

    // Skill levels facet
    const skillLevelsPromise = this.getSkillLevelsFacet(baseFilters)

    // Question types facet
    const questionTypesPromise = this.getQuestionTypesFacet(baseFilters)

    // Top concept tags facet
    const conceptTagsPromise = this.getConceptTagsFacet(baseFilters)

    // Quality ranges facet
    const qualityRangesPromise = this.getQualityRangesFacet(baseFilters)

    const [categories, difficultyLevels, skillLevels, questionTypes, conceptTags, qualityRanges] = await Promise.all([
      categoriesPromise,
      difficultyPromise,
      skillLevelsPromise,
      questionTypesPromise,
      conceptTagsPromise,
      qualityRangesPromise
    ])

    return {
      categories: categories || [],
      difficulty_levels: difficultyLevels || [],
      skill_levels: skillLevels || [],
      question_types: questionTypes || [],
      concept_tags: conceptTags || [],
      quality_ranges: qualityRanges || []
    }
  }

  private async getCategoriesFacet(filters: QuestionSearchFilters) {
    const { data } = await this.supabase
      .from('questions_universal')
      .select(`
        exam_categories!inner(slug, name),
        count:id.count()
      `)
      .eq('tenant_id', this.tenantId)
      .eq('is_active', true)
      // Apply relevant filters but exclude category filter for faceting
      .gte('difficulty', filters.difficulty_min || 1)
      .lte('difficulty', filters.difficulty_max || 10)

    if (!data) return []

    // Group by category and count
    const categoryGroups = data.reduce((acc: any, row: any) => {
      const category = row.exam_categories
      if (category) {
        const key = category.slug
        if (!acc[key]) {
          acc[key] = { slug: category.slug, name: category.name, count: 0 }
        }
        acc[key].count += 1
      }
      return acc
    }, {})

    return Object.values(categoryGroups)
  }

  private async getDifficultyLevelsFacet(filters: QuestionSearchFilters) {
    const { data } = await this.supabase
      .from('questions_universal')
      .select('difficulty_level, count:id.count()')
      .eq('tenant_id', this.tenantId)
      .eq('is_active', true)
      // Apply relevant filters but exclude difficulty filters for faceting
      .not('difficulty_level', 'is', null)

    if (!data) return []

    return data.map((row: any) => ({
      level: row.difficulty_level,
      count: row.count || 0
    })).filter((item: any) => item.count > 0)
  }

  private async getSkillLevelsFacet(filters: QuestionSearchFilters) {
    const { data } = await this.supabase
      .from('questions_universal')
      .select('skill_level, count:id.count()')
      .eq('tenant_id', this.tenantId)
      .eq('is_active', true)
      .not('skill_level', 'is', null)

    if (!data) return []

    return data.map((row: any) => ({
      level: row.skill_level,
      count: row.count || 0
    })).filter((item: any) => item.count > 0)
  }

  private async getQuestionTypesFacet(filters: QuestionSearchFilters) {
    const { data } = await this.supabase
      .from('questions_universal')
      .select('question_type, count:id.count()')
      .eq('tenant_id', this.tenantId)
      .eq('is_active', true)

    if (!data) return []

    return data.map((row: any) => ({
      type: row.question_type,
      count: row.count || 0
    })).filter((item: any) => item.count > 0)
  }

  private async getConceptTagsFacet(filters: QuestionSearchFilters) {
    // This is more complex due to array fields - would need custom query or processing
    const { data } = await this.supabase
      .from('questions_universal')
      .select('concept_tags')
      .eq('tenant_id', this.tenantId)
      .eq('is_active', true)
      .not('concept_tags', 'is', null)
      .limit(1000) // Limit to avoid processing too much data

    if (!data) return []

    // Flatten and count tags
    const tagCounts: Record<string, number> = {}
    data.forEach((row: any) => {
      if (row.concept_tags && Array.isArray(row.concept_tags)) {
        row.concept_tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }
    })

    // Return top 20 most common tags
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
  }

  private async getQualityRangesFacet(filters: QuestionSearchFilters) {
    const ranges = [
      { label: '9.0 - 10.0 (Excellent)', min: 9.0, max: 10.0 },
      { label: '7.0 - 8.9 (Good)', min: 7.0, max: 8.9 },
      { label: '5.0 - 6.9 (Average)', min: 5.0, max: 6.9 },
      { label: '3.0 - 4.9 (Below Average)', min: 3.0, max: 4.9 },
      { label: '0.0 - 2.9 (Poor)', min: 0.0, max: 2.9 }
    ]

    const results = []

    for (const range of ranges) {
      const { count } = await this.supabase
        .from('questions_universal')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', this.tenantId)
        .eq('is_active', true)
        .gte('quality_score', range.min)
        .lte('quality_score', range.max)

      results.push({
        range: range.label,
        count: count || 0
      })
    }

    return results.filter(r => r.count > 0)
  }
}

// ============================================================================
// API HANDLERS
// ============================================================================

export async function GET(request: NextRequest) {
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

    const tenantId = user.user_metadata?.tenant_id
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID not found' },
        { status: 400 }
      )
    }

    // Parse and validate search parameters
    const { searchParams } = new URL(request.url)
    const filters: Record<string, any> = {}

    // Convert search params to filter object
    for (const [key, value] of searchParams.entries()) {
      if (value) {
        // Handle array parameters
        if (['skill_levels', 'concept_tags', 'bloom_taxonomy_levels', 'cognitive_levels', 'question_types', 'review_status', 'validation_status', 'license_types'].includes(key)) {
          filters[key] = value.split(',').map(v => v.trim())
        }
        // Handle boolean parameters
        else if (['has_explanation', 'has_source_attribution', 'include_facets', 'include_analytics'].includes(key)) {
          filters[key] = value.toLowerCase() === 'true'
        }
        // Handle numeric parameters
        else if (['difficulty_min', 'difficulty_max', 'min_quality_score', 'min_community_rating', 'min_usage_count', 'max_usage_count', 'limit', 'offset'].includes(key)) {
          filters[key] = parseInt(value, 10)
        }
        else {
          filters[key] = value
        }
      }
    }

    // Validate filters
    const validationResult = SearchFiltersSchema.safeParse(filters)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid search filters',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const validatedFilters = validationResult.data

    // Perform search
    const searchService = new QuestionSearchService(supabase, tenantId)
    const results = await searchService.search(validatedFilters)

    return NextResponse.json(results)

  } catch (error) {
    console.error('Question search error:', error)
    return NextResponse.json(
      {
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST method for complex search with request body
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

    const tenantId = user.user_metadata?.tenant_id
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID not found' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Validate filters
    const validationResult = SearchFiltersSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid search filters',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const filters = validationResult.data

    // Perform search
    const searchService = new QuestionSearchService(supabase, tenantId)
    const results = await searchService.search(filters)

    return NextResponse.json(results)

  } catch (error) {
    console.error('Question search error:', error)
    return NextResponse.json(
      {
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}