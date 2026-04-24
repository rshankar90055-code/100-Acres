'use server'

import { stripe } from '@/lib/stripe'
import { getSubscriptionPlan, getFeaturedPackage } from '@/lib/products'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

function mapPlanIdToTier(planId: string) {
  if (planId === 'starter') return 'basic'
  return 'premium'
}

export async function createSubscriptionCheckout(planId: string) {
  const plan = getSubscriptionPlan(planId)
  if (!plan) {
    return { error: 'Invalid plan selected' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Please sign in to subscribe' }
  }

  const headersList = await headers()
  const origin = headersList.get('origin') || 'http://localhost:3000'

  try {
    const customerEmail = user.email ?? undefined
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded' as any,
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `${plan.name} Plan`,
              description: plan.description,
            },
            unit_amount: plan.priceInCents,
            recurring: {
              interval: plan.interval,
            },
          },
          quantity: 1,
        },
      ],
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      metadata: {
        userId: user.id,
        planId: plan.id,
        type: 'subscription',
      },
      return_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
    })

    return { clientSecret: session.client_secret }
  } catch (error) {
    console.error('Error creating subscription checkout:', error)
    return { error: 'Failed to create checkout session' }
  }
}

export async function startFreeTrial() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Please sign in first' }
  }

  const [{ data: profile }, { data: agent }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('agents').select('*').eq('user_id', user.id).single(),
  ])

  if (profile?.role === 'admin') {
    return { success: true, message: 'Owner access already unlocked.' }
  }

  if (!agent) {
    return { error: 'Become an agent before starting the free trial.' }
  }

  if (agent.has_used_trial) {
    return { error: 'Free trial has already been used for this account.' }
  }

  const now = new Date()
  const trialExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('agents')
    .update({
      trial_started_at: now.toISOString(),
      trial_expires_at: trialExpiresAt,
      has_used_trial: true,
      updated_at: now.toISOString(),
    })
    .eq('id', agent.id)

  if (error) {
    console.error('Error starting free trial:', error)
    return { error: 'Failed to start free trial.' }
  }

  return { success: true, expiresAt: trialExpiresAt }
}

export async function createFeaturedListingCheckout(
  packageId: string,
  propertyId: string
) {
  const pkg = getFeaturedPackage(packageId)
  if (!pkg) {
    return { error: 'Invalid package selected' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Please sign in to purchase' }
  }

  // Verify the property belongs to the user
  const { data: property } = await supabase
    .from('properties')
    .select('id, title')
    .eq('id', propertyId)
    .eq('owner_id', user.id)
    .single()

  if (!property) {
    return { error: 'Property not found or unauthorized' }
  }

  const headersList = await headers()
  const origin = headersList.get('origin') || 'http://localhost:3000'

  try {
    const customerEmail = user.email ?? undefined
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded' as any,
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `${pkg.name} - ${property.title}`,
              description: pkg.description,
            },
            unit_amount: pkg.priceInCents,
          },
          quantity: 1,
        },
      ],
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      metadata: {
        userId: user.id,
        packageId: pkg.id,
        propertyId: propertyId,
        durationDays: pkg.durationDays.toString(),
        type: 'featured_listing',
      },
      return_url: `${origin}/agent/properties?featured=success&session_id={CHECKOUT_SESSION_ID}`,
    })

    return { clientSecret: session.client_secret }
  } catch (error) {
    console.error('Error creating featured listing checkout:', error)
    return { error: 'Failed to create checkout session' }
  }
}

export async function getCheckoutSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return {
      status: session.status,
      customerEmail: session.customer_details?.email,
      metadata: session.metadata,
    }
  } catch (error) {
    console.error('Error retrieving checkout session:', error)
    return { error: 'Failed to retrieve session' }
  }
}

export async function finalizeCheckoutSession(sessionId: string) {
  const supabase = await createClient()

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.status !== 'complete') {
      return { error: 'Checkout not completed yet.' }
    }

    const userId = session.metadata?.userId
    const planId = session.metadata?.planId
    const paymentType = session.metadata?.type

    if (!userId || paymentType !== 'subscription' || !planId) {
      return { success: true }
    }

    const { data: agent } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!agent) {
      return { error: 'Agent account not found for this subscription.' }
    }

    const plan = getSubscriptionPlan(planId)
    if (!plan) {
      return { error: 'Unknown subscription plan.' }
    }

    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 1)

    const nowIso = new Date().toISOString()
    const tier = mapPlanIdToTier(plan.id)

    const { error: agentError } = await supabase
      .from('agents')
      .update({
        subscription_tier: tier,
        subscription_expires_at: expiresAt.toISOString(),
        updated_at: nowIso,
      })
      .eq('id', agent.id)

    if (agentError) throw agentError

    await supabase.from('subscriptions').insert({
      agent_id: agent.id,
      tier,
      amount: plan.priceInCents / 100,
      payment_id: session.payment_intent,
      starts_at: nowIso,
      expires_at: expiresAt.toISOString(),
      is_active: true,
    })

    await supabase.from('payments').upsert({
      agent_id: agent.id,
      stripe_payment_id: session.payment_intent,
      stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
      stripe_session_id: session.id,
      amount: plan.priceInCents / 100,
      currency: 'inr',
      payment_type: 'subscription',
      plan_tier: tier,
      status: 'succeeded',
      metadata: {
        planId: plan.id,
      },
      updated_at: nowIso,
    }, { onConflict: 'stripe_session_id' })

    return { success: true }
  } catch (error) {
    console.error('Error finalizing checkout session:', error)
    return { error: 'Failed to activate subscription.' }
  }
}
