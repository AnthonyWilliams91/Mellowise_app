'use client'

import React, { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CreditCard, Calendar, ExternalLink, Check, Crown, Star } from 'lucide-react'
import { SUBSCRIPTION_TIERS, formatPrice } from '@/lib/stripe'

interface Subscription {
  id: string
  stripe_subscription_id: string
  plan_type: string
  status: string
  current_period_start: string
  current_period_end: string
}

interface UserProfile {
  id: string
  subscription_tier: string
  subscription_data?: {
    stripe_customer_id?: string
    last_payment_at?: string
    status?: string
  }
}

export default function SubscriptionManager() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadSubscriptionData()
  }, [])

  const loadSubscriptionData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) return

      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setUserProfile(profile)

      // Get subscription details if user has paid tier
      if (profile?.subscription_tier && profile.subscription_tier !== 'free') {
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        setSubscription(subscriptionData)
      }
    } catch (error) {
      console.error('Error loading subscription data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true)
      
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          returnUrl: window.location.href
        })
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.url) {
        window.open(data.url, '_blank')
      }
    } catch (error) {
      console.error('Error opening customer portal:', error)
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    )
  }

  if (!userProfile) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-gray-500">Unable to load subscription information</p>
        </CardContent>
      </Card>
    )
  }

  const currentTier = userProfile.subscription_tier || 'free'
  const tierConfig = SUBSCRIPTION_TIERS[currentTier.toUpperCase() as keyof typeof SUBSCRIPTION_TIERS] || SUBSCRIPTION_TIERS.FREE

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'free': return <AlertCircle className="w-5 h-5 text-gray-500" />
      case 'premium': return <Star className="w-5 h-5 text-blue-500" />
      case 'early_adopter': return <Crown className="w-5 h-5 text-purple-500" />
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-gray-100 text-gray-800'
      case 'premium': return 'bg-blue-100 text-blue-800'
      case 'early_adopter': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'trialing': return 'bg-blue-100 text-blue-800'
      case 'past_due': return 'bg-yellow-100 text-yellow-800'
      case 'canceled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getTierIcon(currentTier)}
              <div>
                <CardTitle className="text-xl">Current Plan</CardTitle>
                <CardDescription>Your subscription details and status</CardDescription>
              </div>
            </div>
            <Badge className={getTierColor(currentTier)}>
              {tierConfig.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Plan Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Plan Type</h4>
              <p className="text-lg font-semibold text-gray-900">{tierConfig.name}</p>
              {tierConfig.price > 0 && (
                <p className="text-sm text-gray-600">
                  {formatPrice(tierConfig.price)}
                  {tierConfig.interval && ` per ${tierConfig.interval}`}
                </p>
              )}
            </div>
            
            {subscription && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
                <Badge className={getStatusColor(subscription.status)}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </Badge>
                {subscription.status === 'active' && (
                  <p className="text-xs text-gray-600 mt-1">
                    <Check className="w-3 h-3 inline mr-1" />
                    Active subscription
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Billing Information */}
          {subscription && subscription.current_period_end && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Billing Information</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Current period ends:</span>
                  <p className="font-medium">
                    {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                {userProfile.subscription_data?.last_payment_at && (
                  <div>
                    <span className="text-gray-600">Last payment:</span>
                    <p className="font-medium">
                      {new Date(userProfile.subscription_data.last_payment_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Plan Features */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">What's included:</h4>
            <div className="grid md:grid-cols-2 gap-2">
              {tierConfig.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-4 flex space-x-3">
            {currentTier !== 'free' && userProfile.subscription_data?.stripe_customer_id && (
              <Button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="flex items-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>{portalLoading ? 'Opening...' : 'Manage Subscription'}</span>
                <ExternalLink className="w-3 h-3" />
              </Button>
            )}
            
            {currentTier === 'free' && (
              <Button
                onClick={() => window.location.href = '/pricing'}
                className="flex items-center space-x-2"
              >
                <Star className="w-4 h-4" />
                <span>Upgrade Plan</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Usage Overview</span>
          </CardTitle>
          <CardDescription>Your activity and plan limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Questions per day:</span>
                <span className="font-medium">
                  {tierConfig.limits.questionsPerDay === -1 ? 'Unlimited' : `${tierConfig.limits.questionsPerDay} per day`}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Survival mode attempts:</span>
                <span className="font-medium">
                  {tierConfig.limits.survivalModeAttempts === -1 ? 'Unlimited' : `${tierConfig.limits.survivalModeAttempts} per session`}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Analytics access:</span>
                <span className="font-medium">
                  {currentTier === 'free' ? 'Basic' : 'Advanced'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Data export:</span>
                <span className="font-medium">
                  {currentTier === 'free' ? 'Not available' : 'Available'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}