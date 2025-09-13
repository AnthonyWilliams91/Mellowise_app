/**
 * Stripe Configuration
 * 
 * Server-side and client-side Stripe configuration
 */

import { loadStripe, Stripe } from '@stripe/stripe-js'
import StripeNode from 'stripe'

// Server-side Stripe instance
export const stripe = new StripeNode(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
  appInfo: {
    name: 'Mellowise LSAT Prep',
    version: '1.0.0',
    url: 'https://mellowise.com'
  }
})

// Client-side Stripe instance (singleton pattern)
let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

// Subscription tier configuration matching PRD requirements
export const SUBSCRIPTION_TIERS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '10 practice questions per day',
      'Basic performance tracking',
      'Limited survival mode access'
    ],
    limits: {
      questionsPerDay: 10,
      survivalModeAttempts: 3
    }
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 3900, // $39.00 in cents
    priceId: 'price_premium_monthly', // Will be updated with actual Stripe price ID
    interval: 'month',
    features: [
      'Unlimited practice questions',
      'Full survival mode access',
      'Detailed analytics and progress tracking',
      'AI-powered personalized recommendations',
      'All question categories (LR, LG, RC)',
      'Export progress data',
      'Email support'
    ],
    limits: {
      questionsPerDay: -1, // unlimited
      survivalModeAttempts: -1 // unlimited
    }
  },
  EARLY_ADOPTER: {
    id: 'early_adopter',
    name: 'Early Adopter',
    price: 3000, // $30.00 in cents - special lifetime pricing
    priceId: 'price_early_adopter_lifetime', // Will be updated with actual Stripe price ID
    interval: null, // one-time payment
    badge: 'Limited Time',
    features: [
      'All Premium features',
      'Lifetime access (one-time payment)',
      'Early access to new features',
      'Priority support',
      'Exclusive community access'
    ],
    limits: {
      questionsPerDay: -1, // unlimited
      survivalModeAttempts: -1 // unlimited
    }
  }
} as const

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS

// Webhook event types we handle
export const STRIPE_WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.trial_will_end',
  'invoice.payment_succeeded',
  'invoice.payment_failed'
] as const

export type StripeWebhookEvent = typeof STRIPE_WEBHOOK_EVENTS[number]

// Helper function to get subscription tier from Stripe price ID
export function getSubscriptionTierFromPriceId(priceId: string): SubscriptionTier | null {
  for (const [tier, config] of Object.entries(SUBSCRIPTION_TIERS)) {
    if (config.priceId === priceId) {
      return tier as SubscriptionTier
    }
  }
  return null
}

// Helper function to format price for display
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(cents / 100)
}

// Stripe customer metadata keys
export const STRIPE_METADATA = {
  USER_ID: 'user_id',
  SUBSCRIPTION_TIER: 'subscription_tier',
  CREATED_AT: 'created_at'
} as const