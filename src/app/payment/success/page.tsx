'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react'

interface CheckoutSession {
  id: string
  status: string
  payment_status: string
  amount_total: number
  currency: string
  metadata: {
    subscription_tier: string
  }
}

export default function PaymentSuccessPage() {
  const [session, setSession] = useState<CheckoutSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      verifyPayment(sessionId)
    } else {
      setError('No session ID found')
      setLoading(false)
    }
  }, [searchParams])

  const verifyPayment = async (sessionId: string) => {
    try {
      // Verify the user is authenticated
      const { data: { session: userSession } } = await supabase.auth.getSession()
      if (!userSession) {
        router.push('/auth/login')
        return
      }

      // Get session details from Stripe
      const response = await fetch(`/api/stripe/checkout?session_id=${sessionId}`)
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setSession(data.session)
      
      // Refresh user profile to get updated subscription status
      await new Promise(resolve => setTimeout(resolve, 2000)) // Brief delay for webhook processing
      
    } catch (err) {
      console.error('Error verifying payment:', err)
      setError(err instanceof Error ? err.message : 'Payment verification failed')
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100)
  }

  const getTierDisplayName = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'premium': return 'Premium'
      case 'early_adopter': return 'Early Adopter'
      default: return tier
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600 text-center">Verifying your payment...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Payment Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{error}</p>
            <div className="space-x-3">
              <Button onClick={() => router.push('/pricing')} variant="outline">
                Try Again
              </Button>
              <Button onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-4">
        {/* Success Card */}
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="text-center py-12">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Payment Successful!
              </h1>
              <p className="text-lg text-gray-600">
                Welcome to your new subscription plan
              </p>
            </div>

            {session && (
              <div className="bg-white rounded-lg p-6 mb-6">
                <div className="grid md:grid-cols-2 gap-4 text-left">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Plan</h3>
                    <p className="text-lg font-semibold text-gray-900">
                      {getTierDisplayName(session.metadata.subscription_tier)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Amount Paid</h3>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatAmount(session.amount_total, session.currency)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Payment Status</h3>
                    <p className="text-lg font-semibold text-green-600 capitalize">
                      {session.payment_status.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Session ID</h3>
                    <p className="text-sm text-gray-600 font-mono break-all">
                      {session.id}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
              >
                Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <div>
                <Button
                  onClick={() => router.push('/dashboard/settings')}
                  variant="outline"
                  className="mr-3"
                >
                  Manage Subscription
                </Button>
                <Button
                  onClick={() => router.push('/practice')}
                  variant="outline"
                >
                  Start Practicing
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Next Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 rounded-full p-2 text-sm font-bold min-w-[32px] h-8 flex items-center justify-center">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Explore Your Dashboard</h3>
                  <p className="text-gray-600 text-sm">Check out your new features and analytics</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 rounded-full p-2 text-sm font-bold min-w-[32px] h-8 flex items-center justify-center">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Start with Survival Mode</h3>
                  <p className="text-gray-600 text-sm">Jump into our gamified practice experience</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 rounded-full p-2 text-sm font-bold min-w-[32px] h-8 flex items-center justify-center">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Track Your Progress</h3>
                  <p className="text-gray-600 text-sm">Monitor your improvement with detailed analytics</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}