import { createClient } from '../supabase/client'
import type { AuthError, Session, User } from '@supabase/supabase-js'

export interface AuthResult {
  user: User | null
  session: Session | null
  error: AuthError | null
}

export interface SignUpData {
  email: string
  password: string
  fullName?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface ResetPasswordData {
  email: string
  redirectTo?: string
}

/**
 * Sign up a new user with email and password
 * Context7-verified pattern from Supabase docs
 */
export const signUpWithEmail = async (data: SignUpData): Promise<AuthResult> => {
  const supabase = createClient()
  
  try {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
        },
      },
    })

    return {
      user: authData.user,
      session: authData.session,
      error,
    }
  } catch (error) {
    return {
      user: null,
      session: null,
      error: error as AuthError,
    }
  }
}

/**
 * Sign in a user with email and password
 * Context7-verified pattern from Supabase docs
 */
export const signInWithEmail = async (data: SignInData): Promise<AuthResult> => {
  const supabase = createClient()
  
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    return {
      user: authData.user,
      session: authData.session,
      error,
    }
  } catch (error) {
    return {
      user: null,
      session: null,
      error: error as AuthError,
    }
  }
}

/**
 * Sign in with OAuth provider (Google, Apple)
 * Context7-verified pattern from Supabase docs
 */
export const signInWithOAuth = async (provider: 'google' | 'apple') => {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  return { data, error }
}

/**
 * Send password reset email
 * Context7-verified pattern using resetPasswordForEmail
 */
export const resetPassword = async (data: ResetPasswordData): Promise<{ error: AuthError | null }> => {
  const supabase = createClient()
  
  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: data.redirectTo || `${window.location.origin}/auth/reset-password`,
  })

  return { error }
}

/**
 * Update user password
 */
export const updatePassword = async (newPassword: string): Promise<{ error: AuthError | null }> => {
  const supabase = createClient()
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  return { error }
}

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<{ error: AuthError | null }> => {
  const supabase = createClient()
  
  const { error } = await supabase.auth.signOut()
  
  return { error }
}

/**
 * Get current user session
 */
export const getCurrentSession = async (): Promise<{ session: Session | null; error: AuthError | null }> => {
  const supabase = createClient()
  
  const { data: { session }, error } = await supabase.auth.getSession()
  
  return { session, error }
}

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<{ user: User | null; error: AuthError | null }> => {
  const supabase = createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  return { user, error }
}

/**
 * Verify OTP for email confirmation
 * Context7-verified pattern using verifyOTP
 */
export const verifyEmailOTP = async (email: string, token: string): Promise<AuthResult> => {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    })

    return {
      user: data.user,
      session: data.session,
      error,
    }
  } catch (error) {
    return {
      user: null,
      session: null,
      error: error as AuthError,
    }
  }
}

/**
 * Resend confirmation email
 */
export const resendConfirmation = async (email: string): Promise<{ error: AuthError | null }> => {
  const supabase = createClient()
  
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  })

  return { error }
}