/**
 * Pricing Card Component
 * 
 * Displays subscription tier options with features and pricing
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Star, Crown } from 'lucide-react'
import { SUBSCRIPTION_TIERS, formatPrice } from '@/lib/stripe'

interface PricingCardProps {
  tier: keyof typeof SUBSCRIPTION_TIERS
  currentTier?: string
  onSelectTier: (tier: string) => Promise<void>
  loading?: boolean
  className?: string
}

const TIER_ICONS = {
  FREE: Zap,
  PREMIUM: Star,
  EARLY_ADOPTER: Crown
} as const

const TIER_COLORS = {
  FREE: 'border-gray-200',
  PREMIUM: 'border-blue-200 bg-blue-50/30',
  EARLY_ADOPTER: 'border-purple-200 bg-purple-50/30 relative overflow-hidden'
} as const

export default function PricingCard({ 
  tier, 
  currentTier, 
  onSelectTier, 
  loading = false,
  className = '' 
}: PricingCardProps) {
  const [selecting, setSelecting] = useState(false)
  const config = SUBSCRIPTION_TIERS[tier]
  const Icon = TIER_ICONS[tier]
  const isCurrentTier = currentTier?.toLowerCase() === config.id
  const isUpgrade = currentTier === 'free' && tier !== 'FREE'
  
  const handleSelect = async () => {
    if (isCurrentTier || selecting) return
    
    try {
      setSelecting(true)
      await onSelectTier(config.id)
    } catch (error) {
      console.error('Failed to select tier:', error)
    } finally {
      setSelecting(false)
    }
  }

  const getButtonText = () => {
    if (isCurrentTier) return 'Current Plan'
    if (tier === 'FREE') return 'Continue with Free'
    if (tier === 'EARLY_ADOPTER') return 'Get Lifetime Access'
    return 'Upgrade to Premium'
  }

  const getButtonVariant = () => {
    if (isCurrentTier) return 'outline' as const
    if (tier === 'EARLY_ADOPTER') return 'default' as const
    return 'default' as const
  }

  return (
    <Card className={`${TIER_COLORS[tier]} transition-all duration-200 hover:shadow-lg ${className}`}>
      {tier === 'EARLY_ADOPTER' && (
        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
          Limited Time
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center mb-3">
          <div className={`p-3 rounded-full ${
            tier === 'FREE' ? 'bg-gray-100' :
            tier === 'PREMIUM' ? 'bg-blue-100' : 
            'bg-purple-100'
          }`}>
            <Icon className={`w-6 h-6 ${
              tier === 'FREE' ? 'text-gray-600' :
              tier === 'PREMIUM' ? 'text-blue-600' : 
              'text-purple-600'
            }`} />
          </div>
        </div>
        
        <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
          {config.name}
          {config.badge && (
            <Badge variant="secondary" className="text-xs">
              {config.badge}
            </Badge>
          )}
        </CardTitle>
        
        <div className="text-center">
          {tier === 'FREE' ? (
            <div className="text-2xl font-bold text-gray-900">Free</div>
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900">
                {formatPrice(config.price)}
              </div>
              <div className="text-sm text-gray-600">
                {config.interval ? `per ${config.interval}` : 'one-time payment'}
              </div>
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Features List */}
        <div className="space-y-3">
          {config.features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
        
        {/* Usage Limits */}
        {tier !== 'FREE' && (
          <div className="pt-3 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">What you get:</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>• Unlimited practice questions</div>
              <div>• Full survival mode access</div>
              <div>• Advanced analytics</div>
              {tier === 'EARLY_ADOPTER' && (
                <>
                  <div>• Priority support</div>
                  <div>• Exclusive community</div>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Action Button */}
        <Button
          onClick={handleSelect}
          disabled={isCurrentTier || selecting || loading}
          variant={getButtonVariant()}
          className={`w-full ${
            tier === 'EARLY_ADOPTER' 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
              : ''
          }`}
        >
          {selecting ? 'Processing...' : getButtonText()}
        </Button>
        
        {isCurrentTier && (
          <div className="text-center">
            <Badge variant="outline" className="text-green-600 border-green-300">
              <Check className="w-3 h-3 mr-1" />
              Active Plan
            </Badge>
          </div>
        )}
        
        {isUpgrade && tier !== 'FREE' && (
          <div className="text-center">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              ⬆️ Upgrade Available
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}