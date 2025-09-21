/**
 * Notification Preferences API
 * MELLOWISE-015: CRUD operations for user notification preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { UpdatePreferencesRequest } from '@/types/notifications';

/**
 * GET /api/notifications/preferences
 * Get user's notification preferences
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's tenant
    const { data: userProfile } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Set tenant context
    await supabase.rpc('set_tenant_id', { tenant_id: userProfile.tenant_id });

    // Get or create notification preferences
    let { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Create default preferences if none exist
    if (!preferences) {
      const defaultPreferences = {
        tenant_id: userProfile.tenant_id,
        user_id: user.id,
        email_enabled: true,
        push_enabled: true,
        in_app_enabled: true,
        sms_enabled: false,
        study_reminders_enabled: true,
        goal_deadlines_enabled: true,
        streak_maintenance_enabled: true,
        achievements_enabled: true,
        break_reminders_enabled: true,
        performance_alerts_enabled: true,
        quiet_hours_enabled: true,
        quiet_hours_start: '22:00:00',
        quiet_hours_end: '08:00:00',
        timezone: 'America/New_York',
        study_reminder_frequency: 'daily',
        goal_deadline_frequency: 'adaptive',
        max_daily_notifications: 5,
        use_optimal_timing: true,
        adapt_to_performance: true,
        spaced_repetition_enabled: true,
      };

      const { data: created, error: createError } = await supabase
        .from('notification_preferences')
        .insert(defaultPreferences)
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      preferences = created;
    }

    return NextResponse.json({
      success: true,
      preferences: {
        id: preferences.id,
        userId: preferences.user_id,
        channels: {
          email: preferences.email_enabled,
          push: preferences.push_enabled,
          inApp: preferences.in_app_enabled,
          sms: preferences.sms_enabled,
        },
        types: {
          studyReminders: preferences.study_reminders_enabled,
          goalDeadlines: preferences.goal_deadlines_enabled,
          streakMaintenance: preferences.streak_maintenance_enabled,
          achievements: preferences.achievements_enabled,
          breakReminders: preferences.break_reminders_enabled,
          performanceAlerts: preferences.performance_alerts_enabled,
        },
        quietHours: {
          enabled: preferences.quiet_hours_enabled,
          startTime: preferences.quiet_hours_start,
          endTime: preferences.quiet_hours_end,
          timezone: preferences.timezone,
        },
        frequency: {
          studyReminders: preferences.study_reminder_frequency,
          goalDeadlines: preferences.goal_deadline_frequency,
          maxDailyNotifications: preferences.max_daily_notifications,
        },
        smartDefaults: {
          useOptimalTiming: preferences.use_optimal_timing,
          adaptToPerformance: preferences.adapt_to_performance,
          spacedRepetition: preferences.spaced_repetition_enabled,
        },
        createdAt: preferences.created_at,
        updatedAt: preferences.updated_at,
      },
    });
  } catch (error) {
    console.error('GET preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications/preferences
 * Update user's notification preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const updates: UpdatePreferencesRequest = await request.json();

    // Get user's tenant
    const { data: userProfile } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Set tenant context
    await supabase.rpc('set_tenant_id', { tenant_id: userProfile.tenant_id });

    // Build update object
    const updateData: any = {};

    if (updates.channels) {
      if (updates.channels.email !== undefined) updateData.email_enabled = updates.channels.email;
      if (updates.channels.push !== undefined) updateData.push_enabled = updates.channels.push;
      if (updates.channels.inApp !== undefined) updateData.in_app_enabled = updates.channels.inApp;
      if (updates.channels.sms !== undefined) updateData.sms_enabled = updates.channels.sms;
    }

    if (updates.types) {
      if (updates.types.studyReminders !== undefined) updateData.study_reminders_enabled = updates.types.studyReminders;
      if (updates.types.goalDeadlines !== undefined) updateData.goal_deadlines_enabled = updates.types.goalDeadlines;
      if (updates.types.streakMaintenance !== undefined) updateData.streak_maintenance_enabled = updates.types.streakMaintenance;
      if (updates.types.achievements !== undefined) updateData.achievements_enabled = updates.types.achievements;
      if (updates.types.breakReminders !== undefined) updateData.break_reminders_enabled = updates.types.breakReminders;
      if (updates.types.performanceAlerts !== undefined) updateData.performance_alerts_enabled = updates.types.performanceAlerts;
    }

    if (updates.quietHours) {
      if (updates.quietHours.enabled !== undefined) updateData.quiet_hours_enabled = updates.quietHours.enabled;
      if (updates.quietHours.startTime !== undefined) updateData.quiet_hours_start = updates.quietHours.startTime;
      if (updates.quietHours.endTime !== undefined) updateData.quiet_hours_end = updates.quietHours.endTime;
      if (updates.quietHours.timezone !== undefined) updateData.timezone = updates.quietHours.timezone;
    }

    if (updates.frequency) {
      if (updates.frequency.studyReminders !== undefined) updateData.study_reminder_frequency = updates.frequency.studyReminders;
      if (updates.frequency.goalDeadlines !== undefined) updateData.goal_deadline_frequency = updates.frequency.goalDeadlines;
      if (updates.frequency.maxDailyNotifications !== undefined) updateData.max_daily_notifications = updates.frequency.maxDailyNotifications;
    }

    if (updates.smartDefaults) {
      if (updates.smartDefaults.useOptimalTiming !== undefined) updateData.use_optimal_timing = updates.smartDefaults.useOptimalTiming;
      if (updates.smartDefaults.adaptToPerformance !== undefined) updateData.adapt_to_performance = updates.smartDefaults.adaptToPerformance;
      if (updates.smartDefaults.spacedRepetition !== undefined) updateData.spaced_repetition_enabled = updates.smartDefaults.spacedRepetition;
    }

    // Update preferences
    const { data: updated, error: updateError } = await supabase
      .from('notification_preferences')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: updated,
    });
  } catch (error) {
    console.error('PUT preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/preferences
 * Reset preferences to defaults
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's tenant
    const { data: userProfile } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Set tenant context
    await supabase.rpc('set_tenant_id', { tenant_id: userProfile.tenant_id });

    // Delete existing preferences (will trigger default creation on next GET)
    const { error: deleteError } = await supabase
      .from('notification_preferences')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: 'Preferences reset to defaults',
    });
  } catch (error) {
    console.error('DELETE preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to reset preferences' },
      { status: 500 }
    );
  }
}