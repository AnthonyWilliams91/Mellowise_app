'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from '@supabase/supabase-js'
import PricingCard from '@/components/payments/PricingCard'
import { SUBSCRIPTION_TIERS } from '@/lib/stripe'
import { Button } from '@/components/ui/button'
import { ArrowRight, Check, Star, Crown, Zap, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface UserProfile {
  id: string
  subscription_tier: string
  subscription_data?: any
}

function PricingContent() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingTier, setProcessingTier] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        
        // Get user profile with subscription info
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        setUserProfile(profile)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTier = async (tierId: string) => {
    if (!user) {
      router.push('/auth/login?returnUrl=/pricing')
      return
    }

    if (tierId === 'free') {
      // Handle free tier selection
      try {
        const { error } = await supabase
          .from('user_profiles')
          .update({ subscription_tier: 'free' })
          .eq('id', user.id)
        
        if (!error) {
          setUserProfile(prev => prev ? { ...prev, subscription_tier: 'free' } : null)
          router.push('/dashboard?tier=free')
        }
      } catch (error) {
        console.error('Error updating to free tier:', error)
      }
      return
    }

    // Handle paid tiers via Stripe checkout
    try {
      setProcessingTier(tierId)
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tier: tierId.toUpperCase(),
          returnUrl: window.location.origin + '/dashboard?payment=success'
        })
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      setProcessingTier(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const paymentStatus = searchParams.get('payment')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="container mx-auto px-4 pt-20 pb-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose Your Learning Path
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Master the LSAT with our AI-powered survival mode. Choose the plan that fits your goals.
          </p>
          
          {paymentStatus === 'success' && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-8">
              <div className="flex items-center justify-center">
                <Check className="w-5 h-5 mr-2" />
                Payment successful! Welcome to your new plan.
              </div>
            </div>
          )}
          
          {paymentStatus === 'cancelled' && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-8">
              Payment was cancelled. You can try again anytime.
            </div>
          )}
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Object.entries(SUBSCRIPTION_TIERS).map(([tier, config]) => (
            <PricingCard
              key={tier}
              tier={tier as keyof typeof SUBSCRIPTION_TIERS}
              currentTier={userProfile?.subscription_tier}
              onSelectTier={handleSelectTier}
              loading={processingTier === config.id}
              className={tier === 'PREMIUM' ? 'transform scale-105' : ''}
            />
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need to Succeed
          </h2>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-4 gap-0">
              {/* Feature Labels Column */}
              <div className="bg-gray-50 p-6 border-r border-gray-200">
                <div className="h-12 mb-6"></div>
                {[
                  'Practice Questions per Day',
                  'Survival Mode Access',
                  'Question Categories',
                  'Progress Analytics',
                  'AI Recommendations',
                  'Export Data',
                  'Support Level',
                  'Community Access'
                ].map((feature) => (
                  <div key={feature} className="py-4 text-sm font-medium text-gray-900 border-b border-gray-200 last:border-b-0">
                    {feature}
                  </div>
                ))}
              </div>

              {/* Free Tier Column */}
              <div className="p-6 border-r border-gray-200">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="w-6 h-6 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Free</h3>
                </div>
                {[
                  '10 per day',
                  'Limited',
                  'Basic',
                  'Basic',
                  '—',
                  '—',
                  'Community',
                  '—'
                ].map((value, index) => (
                  <div key={index} className="py-4 text-sm text-center text-gray-600 border-b border-gray-200 last:border-b-0">
                    {value}
                  </div>
                ))}
              </div>

              {/* Premium Tier Column */}
              <div className="p-6 border-r border-gray-200 bg-blue-50">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <Star className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Premium</h3>
                </div>
                {[
                  'Unlimited',
                  'Full Access',
                  'All (LR, LG, RC)',
                  'Advanced',
                  '✓',
                  '✓',
                  'Email',
                  '—'
                ].map((value, index) => (
                  <div key={index} className="py-4 text-sm text-center font-medium text-gray-900 border-b border-gray-200 last:border-b-0">
                    {value === '✓' ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : value}
                  </div>
                ))}
              </div>

              {/* Early Adopter Column */}
              <div className="p-6 bg-purple-50">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <Crown className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Early Adopter</h3>
                </div>
                {[
                  'Unlimited',
                  'Full Access',
                  'All (LR, LG, RC)',
                  'Advanced',
                  '✓',
                  '✓',
                  'Priority',
                  'Exclusive'
                ].map((value, index) => (
                  <div key={index} className="py-4 text-sm text-center font-medium text-gray-900 border-b border-gray-200 last:border-b-0">
                    {value === '✓' ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : value}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What makes Mellowise different from other LSAT prep?
              </h3>
              <p className="text-gray-600">
                Our unique Survival Mode gamifies LSAT prep with real practice questions, adaptive difficulty, and AI-powered insights that help you identify and overcome your weak spots.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change my plan anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade, downgrade, or cancel your subscription at any time. Early Adopter is a lifetime plan with no recurring charges.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What's included in the Early Adopter plan?
              </h3>
              <p className="text-gray-600">
                Early Adopters get lifetime access to all premium features, priority support, early access to new features, and exclusive community access - all for a one-time payment.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Ace the LSAT?</h2>
            <p className="text-xl mb-6">Join thousands of students who are already improving their scores.</p>
            {!user && (
              <Button
                onClick={() => router.push('/auth/register')}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
              >
                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-full max-w-md mx-4">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600 text-center">Loading pricing information...</p>
          </div>
        </div>
      </div>
    }>
      <PricingContent />
    </Suspense>
  )
}