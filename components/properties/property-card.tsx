'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Bed, 
  Bath, 
  Maximize, 
  BadgeCheck,
  Phone,
  Share2
} from 'lucide-react'
import { ShareMenu } from '@/components/shared/share-menu'
import { PropertySaveButton } from '@/components/properties/property-save-button'
import { toast } from 'sonner'
import type { Property } from '@/lib/types'

interface PropertyCardProps {
  property: Property
  showSaveButton?: boolean
  initialSaved?: boolean
}

function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `${(price / 10000000).toFixed(2)} Cr`
  } else if (price >= 100000) {
    return `${(price / 100000).toFixed(2)} L`
  }
  return price.toLocaleString()
}

const propertyTypeLabels: Record<string, string> = {
  apartment: 'Apartment',
  house: 'House',
  villa: 'Villa',
  plot: 'Plot',
  commercial: 'Commercial',
  pg: 'PG/Hostel',
}

export function PropertyCard({ property, showSaveButton = true, initialSaved = false }: PropertyCardProps) {
  const handleContact = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (property.agent?.whatsapp_number) {
      const message = encodeURIComponent(
        `Hi, I'm interested in the property: ${property.title} (${window.location.origin}/properties/${property.slug})`
      )
      window.open(
        `https://wa.me/${property.agent.whatsapp_number}?text=${message}`,
        '_blank'
      )
    } else {
      toast.info('Agent contact details not available')
    }
  }

  return (
    <Link href={`/properties/${property.slug}`}>
      <Card className="group h-full overflow-hidden border-border transition-all duration-300 hover:border-primary/50 hover:shadow-xl">
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {property.images && property.images.length > 0 ? (
            <img
              src={property.images[0]}
              alt={property.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
              <Maximize className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Badge className="bg-primary text-primary-foreground">
              {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
            </Badge>
            {property.is_verified && (
              <Badge variant="secondary" className="gap-1 bg-green-500/90 text-white">
                <BadgeCheck className="h-3 w-3" />
                Verified
              </Badge>
            )}
            {property.is_featured && (
              <Badge variant="secondary" className="bg-amber-500/90 text-white">
                Featured
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute right-3 top-3 flex gap-2">
            {showSaveButton && (
              <PropertySaveButton
                propertyId={property.id}
                initialSaved={initialSaved}
                variant="outline"
                size="icon"
                showLabel={false}
                className="h-9 w-9 rounded-full bg-white/95 shadow-sm hover:bg-white"
              />
            )}
            <ShareMenu
              title={property.title}
              text="Check out this property listing on 100acres."
              url={typeof window !== 'undefined' ? `${window.location.origin}/properties/${property.slug}` : `/properties/${property.slug}`}
              buttonVariant="outline"
              buttonSize="icon"
            />
          </div>

          {/* Price Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-8">
            <div className="text-2xl font-bold text-white">
              Rs. {formatPrice(property.price)}
              {property.listing_type === 'rent' && (
                <span className="text-base font-normal">/month</span>
              )}
            </div>
            {property.price_per_sqft && (
              <div className="text-sm text-white/80">
                Rs. {property.price_per_sqft.toLocaleString()}/sqft
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          {/* Property Type */}
          <div className="mb-2">
            <Badge variant="outline" className="text-xs">
              {propertyTypeLabels[property.property_type] || property.property_type}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-foreground group-hover:text-primary">
            {property.title}
          </h3>

          {/* Location */}
          <div className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">
              {property.locality}
              {property.city?.name && `, ${property.city.name}`}
            </span>
          </div>

          {/* Features */}
          <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
            {property.bedrooms && (
              <div className="flex items-center gap-1.5">
                <Bed className="h-4 w-4" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1.5">
                <Bath className="h-4 w-4" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            {property.area_sqft && (
              <div className="flex items-center gap-1.5">
                <Maximize className="h-4 w-4" />
                <span>{property.area_sqft.toLocaleString()} sqft</span>
              </div>
            )}
          </div>

          {/* Contact Button */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-2"
              onClick={handleContact}
            >
              <Phone className="h-4 w-4" />
              Contact Agent
            </Button>
            <ShareMenu
              title={property.title}
              text="Check out this property listing on 100acres."
              url={typeof window !== 'undefined' ? `${window.location.origin}/properties/${property.slug}` : `/properties/${property.slug}`}
              buttonVariant="outline"
              buttonSize="icon"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
