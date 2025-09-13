/**
 * Stripe Customer Portal API
 * 
 * Creates customer portal sessions for subscription management
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { returnUrl } = body

    // Get user profile to find Stripe customer ID
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    const stripeCustomerId = userProfile?.subscription_data?.stripe_customer_id

    if (!stripeCustomerId) {
      return NextResponse.json({ 
        error: 'No subscription found. Please subscribe first.' 
      }, { status: 404 })
    }

    // Verify customer exists in Stripe
    let customer
    try {
      customer = await stripe.customers.retrieve(stripeCustomerId)
      if (customer.deleted) {
        throw new Error('Customer deleted')
      }
    } catch (error) {
      return NextResponse.json({ 
        error: 'Invalid customer. Please contact support.' 
      }, { status: 400 })
    }

    // Create customer portal session
    const origin = request.headers.get('origin') || 'http://localhost:3000'
    const defaultReturnUrl = `${origin}/dashboard/settings`
    
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl || defaultReturnUrl,
      locale: 'en' // Could be made configurable based on user preferences
    })

    return NextResponse.json({
      url: portalSession.url
    })

  } catch (error) {
    console.error('Customer portal creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create portal session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to check if user has access to customer portal
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to check subscription status
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('subscription_tier, subscription_data')
      .eq('id', session.user.id)
      .single()

    const hasStripeCustomer = !!userProfile?.subscription_data?.stripe_customer_id
    const isPaidTier = userProfile?.subscription_tier && userProfile.subscription_tier !== 'free'

    return NextResponse.json({
      hasAccess: hasStripeCustomer && isPaidTier,
      subscriptionTier: userProfile?.subscription_tier || 'free',
      hasStripeCustomer
    })

  } catch (error) {
    console.error('Portal access check error:', error)
    return NextResponse.json({ 
      error: 'Failed to check portal access' 
    }, { status: 500 })
  }
}