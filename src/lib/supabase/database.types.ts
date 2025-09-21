/**
 * Supabase Database Types
 * 
 * Auto-generated TypeScript types for Mellowise database schema.
 * These types provide compile-time safety for database operations.
 * 
 * @author Dev Agent James
 * @version 1.0
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          table_name: string
          record_id: string | null
          old_values: Json | null
          new_values: Json | null
          created_at: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          table_name: string
          record_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          created_at?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          table_name?: string
          record_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          created_at?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      game_sessions: {
        Row: {
          id: string
          user_id: string
          session_type: string
          started_at: string
          ended_at: string | null
          final_score: number
          questions_answered: number
          correct_answers: number
          lives_remaining: number
          difficulty_level: number
          session_data: Json
        }
        Insert: {
          id?: string
          user_id: string
          session_type?: string
          started_at?: string
          ended_at?: string | null
          final_score?: number
          questions_answered?: number
          correct_answers?: number
          lives_remaining?: number
          difficulty_level?: number
          session_data?: Json
        }
        Update: {
          id?: string
          user_id?: string
          session_type?: string
          started_at?: string
          ended_at?: string | null
          final_score?: number
          questions_answered?: number
          correct_answers?: number
          lives_remaining?: number
          difficulty_level?: number
          session_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      question_attempts: {
        Row: {
          id: string
          user_id: string
          question_id: string
          session_id: string | null
          selected_answer: string
          is_correct: boolean
          response_time: number | null
          attempted_at: string
          hint_used: boolean
          difficulty_at_attempt: number | null
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          session_id?: string | null
          selected_answer: string
          is_correct: boolean
          response_time?: number | null
          attempted_at?: string
          hint_used?: boolean
          difficulty_at_attempt?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          session_id?: string | null
          selected_answer?: string
          is_correct?: boolean
          response_time?: number | null
          attempted_at?: string
          hint_used?: boolean
          difficulty_at_attempt?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "question_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_attempts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      questions: {
        Row: {
          id: string
          content: string
          question_type: string
          subtype: string | null
          difficulty: number
          estimated_time: number | null
          correct_answer: string
          answer_choices: Json
          explanation: string
          concept_tags: string[]
          source_attribution: string | null
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          content: string
          question_type: string
          subtype?: string | null
          difficulty: number
          estimated_time?: number | null
          correct_answer: string
          answer_choices: Json
          explanation: string
          concept_tags?: string[]
          source_attribution?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          content?: string
          question_type?: string
          subtype?: string | null
          difficulty?: number
          estimated_time?: number | null
          correct_answer?: string
          answer_choices?: Json
          explanation?: string
          concept_tags?: string[]
          source_attribution?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string | null
          plan_type: string
          status: string
          current_period_start: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id?: string | null
          plan_type: string
          status: string
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string | null
          plan_type?: string
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_analytics: {
        Row: {
          id: string
          user_id: string
          metric_type: string
          metric_data: Json
          date_recorded: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          metric_type: string
          metric_data: Json
          date_recorded?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          metric_type?: string
          metric_data?: Json
          date_recorded?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          target_test_date: string | null
          current_score: number | null
          subscription_tier: string
          created_at: string
          updated_at: string
          last_active: string | null
          preferences: Json
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          target_test_date?: string | null
          current_score?: number | null
          subscription_tier?: string
          created_at?: string
          updated_at?: string
          last_active?: string | null
          preferences?: Json
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          target_test_date?: string | null
          current_score?: number | null
          subscription_tier?: string
          created_at?: string
          updated_at?: string
          last_active?: string | null
          preferences?: Json
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      // ============================================================================
      // ANXIETY MANAGEMENT TABLES (MELLOWISE-014)
      // ============================================================================
      anxiety_detections: {
        Row: {
          id: string
          user_id: string
          anxiety_level: 'low' | 'moderate' | 'high' | 'severe'
          confidence_score: number
          indicators: Json
          triggers: string[]
          behavioral_patterns: string[]
          detection_timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          anxiety_level: 'low' | 'moderate' | 'high' | 'severe'
          confidence_score: number
          indicators?: Json
          triggers?: string[]
          behavioral_patterns?: string[]
          detection_timestamp?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          anxiety_level?: 'low' | 'moderate' | 'high' | 'severe'
          confidence_score?: number
          indicators?: Json
          triggers?: string[]
          behavioral_patterns?: string[]
          detection_timestamp?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "anxiety_detections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      confidence_metrics: {
        Row: {
          id: string
          user_id: string
          confidence_level: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'
          confidence_score: number
          trend_data: Json
          last_updated: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          confidence_level: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'
          confidence_score: number
          trend_data?: Json
          last_updated?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          confidence_level?: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'
          confidence_score?: number
          trend_data?: Json
          last_updated?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "confidence_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      mindfulness_sessions: {
        Row: {
          id: string
          user_id: string
          exercise_id: string
          started_at: string
          completed_at: string | null
          duration_completed: number
          effectiveness_rating: number | null
          anxiety_before: 'low' | 'moderate' | 'high' | 'severe' | null
          anxiety_after: 'low' | 'moderate' | 'high' | 'severe' | null
          session_context: 'before_practice' | 'during_break' | 'after_mistake' | 'general'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_id: string
          started_at: string
          completed_at?: string | null
          duration_completed?: number
          effectiveness_rating?: number | null
          anxiety_before?: 'low' | 'moderate' | 'high' | 'severe' | null
          anxiety_after?: 'low' | 'moderate' | 'high' | 'severe' | null
          session_context?: 'before_practice' | 'during_break' | 'after_mistake' | 'general'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_id?: string
          started_at?: string
          completed_at?: string | null
          duration_completed?: number
          effectiveness_rating?: number | null
          anxiety_before?: 'low' | 'moderate' | 'high' | 'severe' | null
          anxiety_after?: 'low' | 'moderate' | 'high' | 'severe' | null
          session_context?: 'before_practice' | 'during_break' | 'after_mistake' | 'general'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mindfulness_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      anxiety_interventions: {
        Row: {
          id: string
          user_id: string
          trigger_type: 'time_pressure' | 'difficult_questions' | 'performance_drop' | 'streak_break' | 'comparison' | 'unknown'
          intervention_type: 'immediate' | 'proactive' | 'educational' | 'celebration'
          strategies_offered: Json
          strategy_selected: string | null
          outcome_data: Json | null
          effectiveness_score: number | null
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trigger_type: 'time_pressure' | 'difficult_questions' | 'performance_drop' | 'streak_break' | 'comparison' | 'unknown'
          intervention_type: 'immediate' | 'proactive' | 'educational' | 'celebration'
          strategies_offered?: Json
          strategy_selected?: string | null
          outcome_data?: Json | null
          effectiveness_score?: number | null
          timestamp?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          trigger_type?: 'time_pressure' | 'difficult_questions' | 'performance_drop' | 'streak_break' | 'comparison' | 'unknown'
          intervention_type?: 'immediate' | 'proactive' | 'educational' | 'celebration'
          strategies_offered?: Json
          strategy_selected?: string | null
          outcome_data?: Json | null
          effectiveness_score?: number | null
          timestamp?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "anxiety_interventions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      coping_strategies: {
        Row: {
          id: string
          user_id: string
          trigger_type: 'time_pressure' | 'difficult_questions' | 'performance_drop' | 'streak_break' | 'comparison' | 'unknown'
          strategy_type: 'breathing_exercise' | 'positive_affirmation' | 'difficulty_reduction' | 'break_suggestion' | 'achievement_reminder'
          effectiveness_rating: number
          usage_count: number
          success_rate: number
          customizations: Json
          last_used: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trigger_type: 'time_pressure' | 'difficult_questions' | 'performance_drop' | 'streak_break' | 'comparison' | 'unknown'
          strategy_type: 'breathing_exercise' | 'positive_affirmation' | 'difficulty_reduction' | 'break_suggestion' | 'achievement_reminder'
          effectiveness_rating?: number
          usage_count?: number
          success_rate?: number
          customizations?: Json
          last_used?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          trigger_type?: 'time_pressure' | 'difficult_questions' | 'performance_drop' | 'streak_break' | 'comparison' | 'unknown'
          strategy_type?: 'breathing_exercise' | 'positive_affirmation' | 'difficulty_reduction' | 'break_suggestion' | 'achievement_reminder'
          effectiveness_rating?: number
          usage_count?: number
          success_rate?: number
          customizations?: Json
          last_used?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coping_strategies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      achievement_celebrations: {
        Row: {
          id: string
          user_id: string
          achievement_type: string
          description: string
          points_earned: number
          celebration_level: 'small' | 'medium' | 'large'
          visual_effects: string[]
          sound_effects: string[]
          message: string
          user_response: 'positive' | 'neutral' | 'negative' | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_type: string
          description: string
          points_earned?: number
          celebration_level?: 'small' | 'medium' | 'large'
          visual_effects?: string[]
          sound_effects?: string[]
          message: string
          user_response?: 'positive' | 'neutral' | 'negative' | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_type?: string
          description?: string
          points_earned?: number
          celebration_level?: 'small' | 'medium' | 'large'
          visual_effects?: string[]
          sound_effects?: string[]
          message?: string
          user_response?: 'positive' | 'neutral' | 'negative' | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievement_celebrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      success_visualizations: {
        Row: {
          id: string
          user_id: string
          visualization_type: 'progress_chart' | 'confidence_journey' | 'achievement_gallery' | 'future_success'
          data_points: Json
          milestone_markers: Json
          motivational_overlay: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          visualization_type: 'progress_chart' | 'confidence_journey' | 'achievement_gallery' | 'future_success'
          data_points?: Json
          milestone_markers?: Json
          motivational_overlay?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          visualization_type?: 'progress_chart' | 'confidence_journey' | 'achievement_gallery' | 'future_success'
          data_points?: Json
          milestone_markers?: Json
          motivational_overlay?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "success_visualizations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      // Anxiety management analytics views
      anxiety_trends: {
        Row: {
          user_id: string
          date: string
          anxiety_level: string
          avg_confidence_score: number
          detection_count: number
          common_triggers: string[]
        }
      }
      mindfulness_effectiveness: {
        Row: {
          user_id: string
          exercise_id: string
          session_count: number
          avg_effectiveness: number
          avg_duration: number
          completed_sessions: number
          high_effectiveness_sessions: number
        }
      }
      confidence_progression: {
        Row: {
          user_id: string
          confidence_level: string
          confidence_score: number
          last_updated: string
          previous_score: number | null
          score_change: number | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}