import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PropertyGallery } from '@/components/properties/property-gallery'
import { PropertyDetails } from '@/components/properties/property-details'
import { PropertyAmenities } from '@/components/properties/property-amenities'
import { AgentCard } from '@/components/properties/agent-card'
import { LeadForm } from '@/components/properties/lead-form'
import { AreaInsights } from '@/components/properties/area-insights'
import { SimilarProperties } from '@/components/properties/similar-properties'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  BadgeCheck, 
  Eye,
  Share2,
  Heart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: property } = await supabase
    .from('properties')
    .select('title, description, locality, city:cities(name)')
    .eq('slug', slug)
    .single()

  if (!property) {
    return { title: 'Property Not Found | 100acres' }
  }

  return {
    title: `${property.title} | 100acres`,
    description: property.description || `${property.title} in ${property.locality}, ${property.city?.name}`,
  }
}

function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `${(price / 10000000).toFixed(2)} Cr`
  } else if (price >= 100000) {
    return `${(price / 100000).toFixed(2)} L`
  }
  return price.toLocaleString()
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch property with related data
  const { data: property, error } = await supabase
    .from('properties')
    .select(`
      *,
      city:cities(*),
      agent:agents(*, profile:profiles(*))
    `)
    .eq('slug', slug)
    .single()

  if (error || !property) {
    notFound()
  }

  // Increment view count
  await supabase
    .from('properties')
    .update({ view_count: property.view_count + 1 })
    .eq('id', property.id)

  // Fetch area insights if available
  const { data: areaInsights } = await supabase
    .from('area_insights')
    .select('*')
    .eq('city_id', property.city_id)
    .eq('locality', property.locality)
    .single()

  // Fetch similar properties
  const { data: similarProperties } = await supabase
    .from('properties')
    .select(`
      *,
      city:cities(*),
      agent:agents(*, profile:profiles(*))
    `)
    .eq('city_id', property.city_id)
    .eq('property_type', property.property_type)
    .eq('is_active', true)
    .eq('status', 'available')
    .neq('id', property.id)
    .limit(4)

  const propertyTypeLabels: Record<string, string> = {
    apartment: 'Apartment',
    house: 'House',
    villa: 'Villa',
    plot: 'Plot',
    commercial: 'Commercial',
    pg: 'PG/Hostel',
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <ol className="flex items-center gap-2">
            <li><a href="/" className="hover:text-primary">Home</a></li>
            <li>/</li>
            <li><a href="/properties" className="hover:text-primary">Properties</a></li>
            <li>/</li>
            {property.city && (
              <>
                <li>
                  <a href={`/city/${property.city.slug}`} className="hover:text-primary">
                    {property.city.name}
                  </a>
                </li>
                <li>/</li>
              </>
            )}
            <li className="text-foreground">{property.title}</li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Gallery */}
            <PropertyGallery 
              images={property.images || []} 
              title={property.title} 
              videoUrl={property.video_url}
            />

            {/* Header */}
            <div className="mb-6 mt-6">
              {/* Badges */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge className="bg-primary text-primary-foreground">
                  {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                </Badge>
                <Badge variant="outline">
                  {propertyTypeLabels[property.property_type] || property.property_type}
                </Badge>
                {property.is_verified && (
                  <Badge variant="secondary" className="gap-1 bg-green-500/90 text-white">
                    <BadgeCheck className="h-3 w-3" />
                    Verified by Local Agent
                  </Badge>
                )}
                {property.is_featured && (
                  <Badge variant="secondary" className="bg-amber-500/90 text-white">
                    Featured
                  </Badge>
                )}
                {property.status !== 'available' && (
                  <Badge variant="destructive">
                    {property.status === 'sold' ? 'Sold' : property.status === 'rented' ? 'Rented' : 'Pending'}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
                {property.title}
              </h1>

              {/* Location */}
              <div className="mb-4 flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-5 w-5 shrink-0" />
                <span>
                  {property.address || property.locality}
                  {property.landmark && `, near ${property.landmark}`}
                  {property.city?.name && `, ${property.city.name}`}
                </span>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="text-3xl font-bold text-primary">
                  Rs. {formatPrice(property.price)}
                  {property.listing_type === 'rent' && (
                    <span className="text-lg font-normal text-muted-foreground">/month</span>
                  )}
                </div>
                {property.price_per_sqft && (
                  <div className="text-sm text-muted-foreground">
                    Rs. {property.price_per_sqft.toLocaleString()}/sqft
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" size="sm" className="gap-2">
                  <Heart className="h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  {property.view_count} views
                </div>
              </div>
            </div>

            {/* Property Details */}
            <PropertyDetails property={property} />

            {/* Description */}
            {property.description && (
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                  About This Property
                </h2>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <p className="whitespace-pre-wrap">{property.description}</p>
                </div>
              </div>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <PropertyAmenities amenities={property.amenities} />
            )}

            {/* Area Insights */}
            {areaInsights && <AreaInsights insights={areaInsights} />}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Agent Card */}
              {property.agent && (
                <AgentCard agent={property.agent} propertyId={property.id} showReviews />
              )}

              {/* Lead Form */}
              <LeadForm 
                propertyId={property.id} 
                agentId={property.agent_id}
                propertyTitle={property.title}
              />
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties && similarProperties.length > 0 && (
          <SimilarProperties properties={similarProperties} />
        )}
      </main>
      <Footer />
    </div>
  )
}
