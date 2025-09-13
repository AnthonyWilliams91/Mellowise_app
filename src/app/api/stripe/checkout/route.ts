/**
 * Stripe Checkout API
 * 
 * Creates Stripe Checkout sessions for subscription payments
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { stripe, SUBSCRIPTION_TIERS, STRIPE_METADATA } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tier, returnUrl } = body

    if (!tier || !SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS]) {
      return NextResponse.json({ 
        error: 'Invalid subscription tier' 
      }, { status: 400 })
    }

    const subscriptionTier = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS]
    
    // Free tier doesn't need checkout
    if (tier === 'FREE') {
      return NextResponse.json({ 
        error: 'Free tier does not require payment' 
      }, { status: 400 })
    }

    // Get or create Stripe customer
    let customer
    
    // First, check if user already has a Stripe customer ID
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (userProfile?.subscription_data?.stripe_customer_id) {
      // Retrieve existing customer
      customer = await stripe.customers.retrieve(userProfile.subscription_data.stripe_customer_id)
    } else {
      // Create new customer
      customer = await stripe.customers.create({
        email: session.user.email!,
        name: userProfile?.full_name || session.user.user_metadata?.full_name,
        metadata: {
          [STRIPE_METADATA.USER_ID]: session.user.id,
          [STRIPE_METADATA.CREATED_AT]: new Date().toISOString()
        }
      })

      // Update user profile with Stripe customer ID
      await supabase
        .from('user_profiles')
        .update({
          subscription_data: {
            ...userProfile?.subscription_data,
            stripe_customer_id: customer.id
          }
        })
        .eq('id', session.user.id)
    }

    // Create Checkout session
    const origin = request.headers.get('origin') || 'http://localhost:3000'
    const successUrl = returnUrl || `${origin}/dashboard?payment=success`
    const cancelUrl = `${origin}/pricing?payment=cancelled`

    const sessionParams: any = {
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: subscriptionTier.name,
            description: `Mellowise ${subscriptionTier.name} Plan`,
            metadata: {
              tier: tier,
              features: subscriptionTier.features.join(', ')
            }
          },
          unit_amount: subscriptionTier.price
        },
        quantity: 1
      }],
      metadata: {
        [STRIPE_METADATA.USER_ID]: session.user.id,
        [STRIPE_METADATA.SUBSCRIPTION_TIER]: tier
      },
      success_url: successUrl + '&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto'
      }
    }

    // Handle subscription vs one-time payment
    if (tier === 'EARLY_ADOPTER') {
      // One-time payment for lifetime access
      sessionParams.mode = 'payment'
      sessionParams.invoice_creation = {
        enabled: true,
        invoice_data: {
          description: 'Mellowise Early Adopter - Lifetime Access',
          metadata: {
            tier: tier,
            type: 'lifetime'
          }
        }
      }
    } else {
      // Recurring subscription
      sessionParams.mode = 'subscription'
      sessionParams.line_items[0].price_data.recurring = {
        interval: subscriptionTier.interval || 'month'
      }
      
      // Add trial period if configured
      if (process.env.NODE_ENV === 'development') {
        sessionParams.subscription_data = {
          trial_period_days: 7, // 7-day trial for testing
          metadata: {
            [STRIPE_METADATA.USER_ID]: session.user.id,
            [STRIPE_METADATA.SUBSCRIPTION_TIER]: tier
          }
        }
      }
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    })

  } catch (error) {
    console.error('Checkout session creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ 
        error: 'Session ID required' 
      }, { status: 400 })
    }

    // Retrieve checkout session details
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer', 'subscription']
    })

    return NextResponse.json({
      session: {
        id: checkoutSession.id,
        status: checkoutSession.status,
        payment_status: checkoutSession.payment_status,
        amount_total: checkoutSession.amount_total,
        currency: checkoutSession.currency,
        customer: checkoutSession.customer,
        subscription: checkoutSession.subscription,
        metadata: checkoutSession.metadata
      }
    })

  } catch (error) {
    console.error('Checkout session retrieval error:', error)
    return NextResponse.json({ 
      error: 'Failed to retrieve checkout session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}