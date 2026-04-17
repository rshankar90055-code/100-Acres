'use client'

import { useCallback, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js'
import { createSubscriptionCheckout, createFeaturedListingCheckout } from '@/app/actions/stripe'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

interface SubscriptionCheckoutProps {
  planId: string
  buttonText?: string
  className?: string
}

export function SubscriptionCheckout({ 
  planId, 
  buttonText = 'Subscribe Now',
  className 
}: SubscriptionCheckoutProps) {
  const [showCheckout, setShowCheckout] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchClientSecret = useCallback(async () => {
    const result = await createSubscriptionCheckout(planId)
    if (result.error) {
      setError(result.error)
      throw new Error(result.error)
    }
    return result.clientSecret!
  }, [planId])

  if (error) {
    return (
      <div className="text-center">
        <p className="mb-2 text-sm text-destructive">{error}</p>
        <Button variant="outline" onClick={() => setError(null)}>
          Try Again
        </Button>
      </div>
    )
  }

  if (!showCheckout) {
    return (
      <Button 
        className={className} 
        onClick={() => setShowCheckout(true)}
      >
        {buttonText}
      </Button>
    )
  }

  return (
    <div id="checkout" className="w-full">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}

interface FeaturedListingCheckoutProps {
  packageId: string
  propertyId: string
  buttonText?: string
  className?: string
}

export function FeaturedListingCheckout({ 
  packageId, 
  propertyId,
  buttonText = 'Boost Listing',
  className 
}: FeaturedListingCheckoutProps) {
  const [showCheckout, setShowCheckout] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchClientSecret = useCallback(async () => {
    setLoading(true)
    const result = await createFeaturedListingCheckout(packageId, propertyId)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      throw new Error(result.error)
    }
    return result.clientSecret!
  }, [packageId, propertyId])

  if (error) {
    return (
      <div className="text-center">
        <p className="mb-2 text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={() => setError(null)}>
          Try Again
        </Button>
      </div>
    )
  }

  if (!showCheckout) {
    return (
      <Button 
        className={className} 
        size="sm"
        onClick={() => setShowCheckout(true)}
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {buttonText}
      </Button>
    )
  }

  return (
    <div id="checkout" className="w-full">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
