/**
 * Stripe Webhook Handler
 * 
 * Processes Stripe webhook events for subscription management
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, STRIPE_METADATA, getSubscriptionTierFromPriceId } from '@/lib/stripe'
import Stripe from 'stripe'

// Use service role key for webhook operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('No Stripe signature found')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return NextResponse.json({ 
        error: 'Invalid signature' 
      }, { status: 400 })
    }

    console.log(`Processing webhook event: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ 
      error: 'Webhook processing failed' 
    }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('Processing checkout completion:', session.id)

    const userId = session.metadata?.[STRIPE_METADATA.USER_ID]
    const subscriptionTier = session.metadata?.[STRIPE_METADATA.SUBSCRIPTION_TIER]

    if (!userId || !subscriptionTier) {
      console.error('Missing metadata in checkout session:', { userId, subscriptionTier })
      return
    }

    // Update user subscription status
    const updates: any = {
      subscription_tier: subscriptionTier.toLowerCase(),
      subscription_data: {
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        checkout_session_id: session.id,
        payment_status: session.payment_status,
        last_payment_at: new Date().toISOString()
      }
    }

    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)

    if (error) {
      console.error('Failed to update user subscription:', error)
      return
    }

    // Create subscription record
    if (session.subscription) {
      await createOrUpdateSubscription(session.subscription as string, userId, subscriptionTier)
    }

    // Log successful checkout
    await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action: 'subscription_checkout_completed',
        table_name: 'subscriptions',
        new_values: {
          session_id: session.id,
          tier: subscriptionTier,
          amount: session.amount_total
        }
      })

    console.log('Checkout completed successfully processed')

  } catch (error) {
    console.error('Error handling checkout completion:', error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    console.log('Processing subscription created:', subscription.id)

    const userId = subscription.metadata[STRIPE_METADATA.USER_ID]
    const tier = subscription.metadata[STRIPE_METADATA.SUBSCRIPTION_TIER]

    if (!userId) {
      console.error('Missing user ID in subscription metadata')
      return
    }

    await createOrUpdateSubscription(subscription.id, userId, tier, subscription)
    console.log('Subscription created successfully processed')

  } catch (error) {
    console.error('Error handling subscription creation:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    console.log('Processing subscription updated:', subscription.id)

    const userId = subscription.metadata[STRIPE_METADATA.USER_ID]
    
    if (!userId) {
      console.error('Missing user ID in subscription metadata')
      return
    }

    // Update subscription status in database
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      console.error('Failed to update subscription:', error)
      return
    }

    // If subscription is cancelled or past due, update user tier
    if (subscription.status === 'canceled' || subscription.status === 'past_due') {
      await supabase
        .from('user_profiles')
        .update({
          subscription_tier: 'free',
          subscription_data: {
            ...subscription.metadata,
            status: subscription.status,
            cancelled_at: new Date().toISOString()
          }
        })
        .eq('id', userId)
    }

    console.log('Subscription updated successfully processed')

  } catch (error) {
    console.error('Error handling subscription update:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    console.log('Processing subscription deleted:', subscription.id)

    const userId = subscription.metadata[STRIPE_METADATA.USER_ID]
    
    if (!userId) {
      console.error('Missing user ID in subscription metadata')
      return
    }

    // Update subscription status and user tier
    await Promise.all([
      supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id),
      
      supabase
        .from('user_profiles')
        .update({
          subscription_tier: 'free',
          subscription_data: {
            ...subscription.metadata,
            status: 'canceled',
            cancelled_at: new Date().toISOString()
          }
        })
        .eq('id', userId)
    ])

    console.log('Subscription deleted successfully processed')

  } catch (error) {
    console.error('Error handling subscription deletion:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log('Processing payment succeeded:', invoice.id)

    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
      const userId = subscription.metadata[STRIPE_METADATA.USER_ID]

      if (userId) {
        // Update last payment date
        await supabase
          .from('user_profiles')
          .update({
            subscription_data: {
              last_payment_at: new Date().toISOString(),
              last_invoice_id: invoice.id
            }
          })
          .eq('id', userId)

        console.log('Payment succeeded successfully processed')
      }
    }

  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log('Processing payment failed:', invoice.id)

    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
      const userId = subscription.metadata[STRIPE_METADATA.USER_ID]

      if (userId) {
        // Log payment failure
        await supabase
          .from('audit_logs')
          .insert({
            user_id: userId,
            action: 'payment_failed',
            table_name: 'subscriptions',
            new_values: {
              invoice_id: invoice.id,
              amount: invoice.total,
              attempt_count: invoice.attempt_count
            }
          })

        console.log('Payment failed successfully processed')
      }
    }

  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  try {
    console.log('Processing trial will end:', subscription.id)

    const userId = subscription.metadata[STRIPE_METADATA.USER_ID]
    
    if (userId) {
      // Could trigger an email notification here
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'trial_ending_soon',
          table_name: 'subscriptions',
          new_values: {
            subscription_id: subscription.id,
            trial_end: new Date(subscription.trial_end! * 1000).toISOString()
          }
        })

      console.log('Trial will end successfully processed')
    }

  } catch (error) {
    console.error('Error handling trial will end:', error)
  }
}

async function createOrUpdateSubscription(
  subscriptionId: string,
  userId: string,
  tier?: string,
  subscriptionData?: Stripe.Subscription
) {
  try {
    const subscription = subscriptionData || await stripe.subscriptions.retrieve(subscriptionId)
    
    const subscriptionRecord = {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      plan_type: tier?.toLowerCase() || 'premium',
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('subscriptions')
      .upsert(subscriptionRecord, {
        onConflict: 'stripe_subscription_id'
      })

    if (error) {
      console.error('Failed to create/update subscription:', error)
    }

  } catch (error) {
    console.error('Error in createOrUpdateSubscription:', error)
  }
}