'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface MarketplaceSaveButtonProps {
  listingId: string
  size?: 'default' | 'sm' | 'icon'
  variant?: 'default' | 'outline' | 'ghost'
  showLabel?: boolean
}

export function MarketplaceSaveButton({
  listingId,
  size = 'icon',
  variant = 'ghost',
  showLabel = false,
}: MarketplaceSaveButtonProps) {
  const supabase = createClient()
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecked, setIsChecked] = useState(false)

  useEffect(() => {
    const checkSavedStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setIsChecked(true)
        return
      }

      const { data } = await supabase
        .from('saved_marketplace_listings')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', listingId)
        .maybeSingle()

      setIsSaved(Boolean(data))
      setIsChecked(true)
    }

    void checkSavedStatus()
  }, [listingId, supabase])

  const handleToggle = async (event?: React.MouseEvent) => {
    event?.preventDefault()
    event?.stopPropagation()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error('Please sign in to save marketplace listings.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        isSaved ? `/api/saved/marketplace?listing_id=${listingId}` : '/api/saved/marketplace',
        {
          method: isSaved ? 'DELETE' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: isSaved ? undefined : JSON.stringify({ listing_id: listingId }),
        },
      )

      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(payload.error || 'Could not update saved marketplace listings.')
      }

      setIsSaved(!isSaved)
      toast.success(isSaved ? 'Removed from saved listings.' : 'Saved to your marketplace list.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update saved marketplace listings.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={(event) => void handleToggle(event)}
      disabled={isLoading || !isChecked}
      className={isSaved ? 'text-rose-500' : ''}
    >
      <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
      {showLabel ? <span>{isSaved ? 'Saved' : 'Save'}</span> : null}
    </Button>
  )
}
