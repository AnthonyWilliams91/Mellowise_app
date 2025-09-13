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

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
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