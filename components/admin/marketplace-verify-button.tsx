'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BadgeCheck, Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface MarketplaceVerifyButtonProps {
  listingId: string
  isVerified: boolean
}

export function MarketplaceVerifyButton({
  listingId,
  isVerified,
}: MarketplaceVerifyButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update({
          is_verified: !isVerified,
          status: !isVerified ? 'available' : 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', listingId)

      if (error) throw error

      toast.success(isVerified ? 'Marketplace verification removed.' : 'Marketplace listing verified.')
      router.refresh()
    } catch (error) {
      console.error('Error updating marketplace listing:', error)
      toast.error('Failed to update marketplace listing.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant={isVerified ? 'outline' : 'default'}
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      className={isVerified ? '' : 'bg-green-600 hover:bg-green-700'}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isVerified ? (
        <X className="h-4 w-4" />
      ) : (
        <BadgeCheck className="h-4 w-4" />
      )}
    </Button>
  )
}
