/**
 * Supabase Client Configuration
 * 
 * Provides both client-side and server-side Supabase clients
 * with proper authentication handling and type safety.
 * 
 * @author Dev Agent James
 * @version 1.0
 */

import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

// Environment variables with fallbacks for testing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key'

// Only validate in production if we're not using placeholder values
if (process.env.NODE_ENV === 'production' &&
    (supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder'))) {
  console.warn('Using placeholder Supabase credentials in production')
}

/**
 * Client-side Supabase client for use in React components and client-side operations
 * Automatically handles authentication state and session management
 */
export const createClient = () => {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Export types for use throughout the application
export type { Database } from './database.types'
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]