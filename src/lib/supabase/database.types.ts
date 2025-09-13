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
    }
    Views: {
      [_ in never]: never
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