import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PropertyCard } from '@/components/properties/property-card'
import { MarketplaceCard } from '@/components/marketplace/marketplace-card'
import { Button } from '@/components/ui/button'
import { Bookmark, Heart, Search } from 'lucide-react'
import type { MarketplaceListing, Property } from '@/lib/types'

export default async function SavedPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const params = await searchParams
  const activeTab = params.tab === 'marketplace' ? 'marketplace' : 'properties'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch saved properties with full property details
  const [{ data: savedProperties }, { data: savedMarketplace }] = await Promise.all([
    supabase
      .from('saved_properties')
      .select(`
        id,
        created_at,
        property:properties(
          *,
          city:cities(*),
          agent:agents(*, profile:profiles(*))
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('saved_marketplace_listings')
      .select(`
        id,
        created_at,
        listing:marketplace_listings(
          *,
          city:cities(*),
          agent:agents(*, profile:profiles(*))
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const properties = (savedProperties
    ?.map((savedProperty) =>
      Array.isArray(savedProperty.property)
        ? savedProperty.property[0]
        : savedProperty.property,
    )
    .filter((property): property is Property => Boolean(property)) || [])

  const marketplaceListings = (savedMarketplace
    ?.map((savedItem) =>
      Array.isArray(savedItem.listing)
        ? savedItem.listing[0]
        : savedItem.listing,
    )
    .filter((listing): listing is MarketplaceListing => Boolean(listing)) || [])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground">
          <Heart className="h-8 w-8 text-red-500" />
          Saved Listings
        </h1>
        <p className="text-muted-foreground">
          {properties.length} properties saved and {marketplaceListings.length} marketplace listings saved
        </p>
      </div>

      <div className="mb-8 flex gap-3">
        <Link href="/saved">
          <Button variant={activeTab === 'properties' ? 'default' : 'outline'} className="gap-2">
            <Heart className="h-4 w-4" />
            Saved Properties
          </Button>
        </Link>
        <Link href="/saved?tab=marketplace">
          <Button variant={activeTab === 'marketplace' ? 'default' : 'outline'} className="gap-2">
            <Bookmark className="h-4 w-4" />
            Saved Marketplace
          </Button>
        </Link>
      </div>

      {/* Properties Grid */}
      {activeTab === 'properties' && properties.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.map((property) => (
            <PropertyCard 
              key={property.id} 
              property={property}
              showSaveButton={true}
            />
          ))}
        </div>
      ) : activeTab === 'marketplace' && marketplaceListings.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {marketplaceListings.map((listing) => (
            <MarketplaceCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          {activeTab === 'properties' ? (
            <Heart className="mb-4 h-16 w-16 text-muted-foreground/50" />
          ) : (
            <Bookmark className="mb-4 h-16 w-16 text-muted-foreground/50" />
          )}
          <h3 className="mb-2 text-xl font-semibold text-foreground">
            {activeTab === 'properties' ? 'No saved properties yet' : 'No saved marketplace listings yet'}
          </h3>
          <p className="mb-6 max-w-md text-muted-foreground">
            {activeTab === 'properties'
              ? "Start browsing properties and click the heart icon to save your favorites. They'll appear here for easy access."
              : "Start browsing cars, bikes, electronics, and appliances and save the ones you want to revisit."}
          </p>
          <Link href={activeTab === 'properties' ? '/properties' : '/marketplace'}>
            <Button className="gap-2">
              <Search className="h-4 w-4" />
              {activeTab === 'properties' ? 'Browse Properties' : 'Browse Marketplace'}
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
