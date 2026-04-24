'use client'

import { PropertySaveButton } from '@/components/properties/property-save-button'
import { ShareMenu } from '@/components/shared/share-menu'

interface PropertyActionBarProps {
  propertyId: string
  propertySlug: string
  propertyTitle: string
}

export function PropertyActionBar({
  propertyId,
  propertySlug,
  propertyTitle,
}: PropertyActionBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <PropertySaveButton propertyId={propertyId} variant="outline" size="sm" showLabel />
      <ShareMenu
        title={propertyTitle}
        text="Check out this property listing on 100acres."
        url={typeof window !== 'undefined' ? `${window.location.origin}/properties/${propertySlug}` : `/properties/${propertySlug}`}
      />
    </div>
  )
}
