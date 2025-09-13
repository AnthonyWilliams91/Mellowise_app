/**
 * Learning Style Profile API Endpoint
 * 
 * GET: Fetch user's learning style profile
 * PUT: Update learning style profile (manual override)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { 
  LearningProfile,
  LearningStyleOverrideRequest 
} from '@/types/learning-style'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user's learning profile
    const { data: profile, error: profileError } = await supabase
      .from('learning_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      if (profileError.code === 'PGRST116') { // No rows returned
        return NextResponse.json({ 
          profile: null,
          hasProfile: false 
        })
      }
      console.error('Error fetching learning profile:', profileError)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    return NextResponse.json({ 
      profile: profile as LearningProfile,
      hasProfile: true 
    })

  } catch (error) {
    console.error('Learning profile GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body: LearningStyleOverrideRequest = await request.json()
    const { primary_style, secondary_style } = body

    if (!primary_style) {
      return NextResponse.json({ error: 'Primary style is required' }, { status: 400 })
    }

    // Get current profile
    const { data: currentProfile, error: currentError } = await supabase
      .from('learning_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (currentError || !currentProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Update profile with manual override
    const updateData = {
      manual_override_enabled: true,
      manual_primary_style: primary_style,
      manual_secondary_style: secondary_style || null,
      override_set_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from('learning_profiles')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError || !updatedProfile) {
      console.error('Error updating learning profile:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    // Record refinement history
    const refinementData = {
      user_id: user.id,
      trigger_type: 'manual_override' as const,
      trigger_data: {
        previous_primary: currentProfile.manual_override_enabled 
          ? currentProfile.manual_primary_style 
          : currentProfile.primary_learning_style,
        previous_secondary: currentProfile.manual_override_enabled
          ? currentProfile.manual_secondary_style
          : currentProfile.secondary_learning_style,
        new_primary: primary_style,
        new_secondary: secondary_style || null
      },
      previous_scores: {
        visual_analytical: currentProfile.visual_analytical_score,
        fast_methodical: currentProfile.fast_methodical_score,
        conceptual_detail: currentProfile.conceptual_detail_score
      },
      new_scores: {
        visual_analytical: currentProfile.visual_analytical_score, // Scores don't change with manual override
        fast_methodical: currentProfile.fast_methodical_score,
        conceptual_detail: currentProfile.conceptual_detail_score
      },
      confidence_changes: {
        manual_override: true // Flag that this was a manual change
      },
      significant_change: true, // Manual overrides are always significant
      analysis_notes: `Manual override: ${primary_style}${secondary_style ? ` with ${secondary_style} secondary` : ''}`
    }

    const { error: refinementError } = await supabase
      .from('learning_style_refinements')
      .insert(refinementData)

    if (refinementError) {
      console.error('Error recording refinement:', refinementError)
      // Don't fail the request for this
    }

    return NextResponse.json({ 
      profile: updatedProfile as LearningProfile,
      success: true 
    })

  } catch (error) {
    console.error('Learning profile PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current profile
    const { data: currentProfile, error: currentError } = await supabase
      .from('learning_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (currentError || !currentProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Remove manual override (revert to AI-determined style)
    const updateData = {
      manual_override_enabled: false,
      manual_primary_style: null,
      manual_secondary_style: null,
      override_set_at: null,
      updated_at: new Date().toISOString()
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from('learning_profiles')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError || !updatedProfile) {
      console.error('Error removing override:', updateError)
      return NextResponse.json({ error: 'Failed to remove override' }, { status: 500 })
    }

    // Record refinement history
    const refinementData = {
      user_id: user.id,
      trigger_type: 'manual_override' as const,
      trigger_data: {
        action: 'removed_override',
        reverted_to_ai: true,
        previous_override_primary: currentProfile.manual_primary_style,
        previous_override_secondary: currentProfile.manual_secondary_style
      },
      previous_scores: {
        visual_analytical: currentProfile.visual_analytical_score,
        fast_methodical: currentProfile.fast_methodical_score,
        conceptual_detail: currentProfile.conceptual_detail_score
      },
      new_scores: {
        visual_analytical: currentProfile.visual_analytical_score,
        fast_methodical: currentProfile.fast_methodical_score,
        conceptual_detail: currentProfile.conceptual_detail_score
      },
      confidence_changes: {
        manual_override_removed: true
      },
      significant_change: true,
      analysis_notes: 'Manual override removed, reverted to AI-determined learning style'
    }

    const { error: refinementError } = await supabase
      .from('learning_style_refinements')
      .insert(refinementData)

    if (refinementError) {
      console.error('Error recording refinement:', refinementError)
      // Don't fail the request for this
    }

    return NextResponse.json({ 
      profile: updatedProfile as LearningProfile,
      success: true 
    })

  } catch (error) {
    console.error('Learning profile DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}