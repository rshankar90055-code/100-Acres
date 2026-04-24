'use client'

import { Button } from '@/components/ui/button'
import { Phone } from 'lucide-react'
import { toast } from 'sonner'
import { MarketplaceSaveButton } from '@/components/marketplace/marketplace-save-button'
import { ShareMenu } from '@/components/shared/share-menu'

interface MarketplaceDetailActionsProps {
  listingId: string
  title: string
  slug: string
  contactPhone?: string | null
}

export function MarketplaceDetailActions({
  listingId,
  title,
  slug,
  contactPhone,
}: MarketplaceDetailActionsProps) {
  return (
    <div className="mt-6 flex gap-3">
      <MarketplaceSaveButton
        listingId={listingId}
        variant="outline"
        size="default"
        showLabel
      />
      <Button
        type="button"
        className="flex-1 gap-2"
        onClick={() => {
          if (!contactPhone) {
            toast.error('Seller phone number is not available yet.')
            return
          }

          window.location.href = `tel:${contactPhone}`
        }}
      >
        <Phone className="h-4 w-4" />
        Call Seller
      </Button>
      <ShareMenu
        title={title}
        text="Check out this marketplace listing on 100acres."
        url={typeof window !== 'undefined' ? `${window.location.origin}/marketplace/${slug}` : `/marketplace/${slug}`}
      />
    </div>
  )
}
