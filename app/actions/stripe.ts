'use server'

import { stripe } from '@/lib/stripe'
import { getSubscriptionPlan, getFeaturedPackage } from '@/lib/products'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

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
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
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
      customer_email: user.email,
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
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
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
      customer_email: user.email,
      metadata: {
        userId: user.id,
        packageId: pkg.id,
        propertyId: propertyId,
        durationDays: pkg.durationDays.toString(),
        type: 'featured_listing',
      },
      return_url: `${origin}/agent/listings?featured=success&session_id={CHECKOUT_SESSION_ID}`,
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
