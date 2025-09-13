'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SignInForm from '@/components/auth/SignInForm'
import SignUpForm from '@/components/auth/SignUpForm'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const router = useRouter()

  const handleAuthSuccess = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mellowise</h1>
          <p className="text-gray-600">Master the LSAT with adaptive learning</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {mode === 'signin' ? (
          <SignInForm
            onSuccess={handleAuthSuccess}
            onSwitchToSignUp={() => setMode('signup')}
          />
        ) : (
          <SignUpForm
            onSuccess={() => {
              // For signup, we'll show a message to check email
              // The actual redirect will happen after email confirmation
            }}
            onSwitchToSignIn={() => setMode('signin')}
          />
        )}
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          By signing up, you agree to our{' '}
          <a href="/terms" className="text-blue-600 hover:text-blue-500">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-blue-600 hover:text-blue-500">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}