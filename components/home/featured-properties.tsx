import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Bed, 
  Bath, 
  Maximize, 
  ArrowRight,
  BadgeCheck,
  Heart
} from 'lucide-react'
import type { Property } from '@/lib/types'

interface FeaturedPropertiesProps {
  properties: Property[]
}

function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `${(price / 10000000).toFixed(2)} Cr`
  } else if (price >= 100000) {
    return `${(price / 100000).toFixed(2)} L`
  }
  return price.toLocaleString()
}

function PropertyCard({ property }: { property: Property }) {
  const propertyTypeLabels: Record<string, string> = {
    apartment: 'Apartment',
    house: 'House',
    villa: 'Villa',
    plot: 'Plot',
    commercial: 'Commercial',
    pg: 'PG/Hostel',
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
          </div>

          {/* Favorite Button */}
          <button className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-muted-foreground transition-colors hover:bg-white hover:text-red-500">
            <Heart className="h-5 w-5" />
          </button>

          {/* Price Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-8">
            <div className="text-2xl font-bold text-white">
              Rs. {formatPrice(property.price)}
              {property.listing_type === 'rent' && (
                <span className="text-base font-normal">/month</span>
              )}
            </div>
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
          <div className="flex items-center gap-4 border-t border-border pt-4 text-sm text-muted-foreground">
            {property.bedrooms && (
              <div className="flex items-center gap-1.5">
                <Bed className="h-4 w-4" />
                <span>{property.bedrooms} Beds</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1.5">
                <Bath className="h-4 w-4" />
                <span>{property.bathrooms} Baths</span>
              </div>
            )}
            {property.area_sqft && (
              <div className="flex items-center gap-1.5">
                <Maximize className="h-4 w-4" />
                <span>{property.area_sqft.toLocaleString()} sqft</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function FeaturedProperties({ properties }: FeaturedPropertiesProps) {
  if (properties.length === 0) {
    return (
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Featured Properties
            </h2>
            <p className="text-muted-foreground">
              Premium listings handpicked by our team
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <Maximize className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              No featured properties available at the moment.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Featured Properties
            </h2>
            <p className="max-w-2xl text-muted-foreground">
              Premium listings handpicked by our team. Every property is verified 
              and ready for immediate viewing.
            </p>
          </div>
          <Link href="/properties?featured=true">
            <Button variant="outline" className="gap-2">
              View all
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Property Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  )
}
