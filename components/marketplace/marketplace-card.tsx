'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getMarketplaceCategoryLabel, formatMarketplacePrice } from '@/lib/marketplace'
import { Car, Bike, Laptop, Refrigerator, MapPin, Share2 } from 'lucide-react'
import type { MarketplaceListing } from '@/lib/types'
import { shareContent } from '@/lib/share'
import { toast } from 'sonner'
import { MarketplaceSaveButton } from '@/components/marketplace/marketplace-save-button'

const categoryIcons = {
  car: Car,
  bike: Bike,
  electronics: Laptop,
  appliance: Refrigerator,
}

export function MarketplaceCard({ listing }: { listing: MarketplaceListing }) {
  const Icon = categoryIcons[listing.category as keyof typeof categoryIcons] || Laptop

  return (
    <Link href={`/marketplace/${listing.slug}`}>
      <Card className="group h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {listing.images?.[0] ? (
            <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
              <Icon className="h-12 w-12 text-primary/60" />
            </div>
          )}
          <div className="absolute left-3 top-3 flex gap-2">
            <Badge>{getMarketplaceCategoryLabel(listing.category)}</Badge>
            {listing.subcategory ? <Badge variant="secondary">{listing.subcategory}</Badge> : null}
          </div>
          <div className="absolute right-3 top-3">
            <MarketplaceSaveButton listingId={listing.id} />
          </div>
        </div>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="line-clamp-2 text-lg font-semibold">{listing.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{listing.brand} {listing.model}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={async (event) => {
                event.preventDefault()
                event.stopPropagation()
                try {
                  const result = await shareContent({
                    title: listing.title,
                    text: 'Check out this marketplace listing on 100acres.',
                    url: `${window.location.origin}/marketplace/${listing.slug}`,
                  })
                  if (result === 'copied') {
                    toast.success('Listing link copied.')
                  }
                } catch {
                  toast.error('Could not share this listing.')
                }
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-2xl font-bold text-primary">Rs. {formatMarketplacePrice(listing.price)}</div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{listing.locality}{listing.city?.name ? `, ${listing.city.name}` : ''}</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {listing.condition ? <span className="rounded-full bg-muted px-2 py-1">{listing.condition.replace('_', ' ')}</span> : null}
            {listing.year ? <span className="rounded-full bg-muted px-2 py-1">{listing.year}</span> : null}
            {listing.mileage_km ? <span className="rounded-full bg-muted px-2 py-1">{listing.mileage_km.toLocaleString()} km</span> : null}
            {listing.warranty_months ? <span className="rounded-full bg-muted px-2 py-1">{listing.warranty_months} mo warranty</span> : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
