import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { MarketplaceDetailActions } from '@/components/marketplace/marketplace-detail-actions'
import { MarketplaceInquiryPanel } from '@/components/marketplace/marketplace-inquiry-panel'
import { Badge } from '@/components/ui/badge'
import { getMarketplaceCategoryLabel, formatMarketplacePrice } from '@/lib/marketplace'
import { MapPin, Calendar, Gauge, Fuel, Cog } from 'lucide-react'
import { toAbsoluteUrl } from '@/lib/site-config'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: listing } = await supabase
    .from('marketplace_listings')
    .select('title, description, images')
    .eq('slug', slug)
    .single()

  if (!listing) return { title: 'Marketplace Listing Not Found | 100acres' }

  return {
    title: `${listing.title} | 100acres Marketplace`,
    description: listing.description || 'Marketplace listing on 100acres',
    openGraph: {
      title: listing.title,
      description: listing.description || 'Marketplace listing on 100acres',
      images: listing.images?.length ? [listing.images[0]] : [toAbsoluteUrl('/placeholder-logo.png')],
    },
  }
}

export default async function MarketplaceDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: listing } = await supabase
    .from('marketplace_listings')
    .select('*, city:cities(*), agent:agents(*, profile:profiles(*))')
    .eq('slug', slug)
    .single()

  if (!listing) notFound()

  void supabase
    .from('marketplace_listings')
    .update({ view_count: (listing.view_count || 0) + 1 })
    .eq('id', listing.id)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="overflow-hidden rounded-2xl border bg-card">
              {listing.images?.[0] ? (
                <img src={listing.images[0]} alt={listing.title} className="aspect-[16/10] w-full object-cover" />
              ) : (
                <div className="aspect-[16/10] w-full bg-muted" />
              )}
            </div>
            {listing.images?.length > 1 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {listing.images.slice(1).map((image: string) => (
                  <img key={image} src={image} alt={listing.title} className="aspect-square w-full rounded-xl border object-cover" />
                ))}
              </div>
            ) : null}
            {listing.video_url ? (
              <div className="overflow-hidden rounded-2xl border bg-card p-4">
                <video src={listing.video_url} controls className="max-h-[32rem] w-full rounded-xl bg-black" />
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border bg-card p-6">
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge>{getMarketplaceCategoryLabel(listing.category)}</Badge>
                {listing.subcategory ? <Badge variant="secondary">{listing.subcategory}</Badge> : null}
                {listing.condition ? <Badge variant="outline">{listing.condition.replace('_', ' ')}</Badge> : null}
              </div>
              <h1 className="text-3xl font-bold">{listing.title}</h1>
              <p className="mt-3 text-3xl font-bold text-primary">Rs. {formatMarketplacePrice(listing.price)}</p>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{listing.locality}{listing.city?.name ? `, ${listing.city.name}` : ''}</span>
              </div>

              <div className="mt-6 grid gap-3 text-sm">
                {listing.year ? <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> {listing.year}</div> : null}
                {listing.mileage_km ? <div className="flex items-center gap-2"><Gauge className="h-4 w-4 text-primary" /> {listing.mileage_km.toLocaleString()} km</div> : null}
                {listing.fuel_type ? <div className="flex items-center gap-2"><Fuel className="h-4 w-4 text-primary" /> {listing.fuel_type}</div> : null}
                {listing.transmission ? <div className="flex items-center gap-2"><Cog className="h-4 w-4 text-primary" /> {listing.transmission}</div> : null}
              </div>

              <MarketplaceDetailActions
                listingId={listing.id}
                title={listing.title}
                slug={listing.slug}
                contactPhone={listing.contact_phone}
              />
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="mt-3 whitespace-pre-wrap text-muted-foreground">{listing.description}</p>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <h2 className="text-lg font-semibold">Seller Contact</h2>
              <div className="mt-3 space-y-2 text-sm">
                {listing.contact_phone ? <p>{listing.contact_phone}</p> : null}
                {listing.contact_whatsapp ? <p>WhatsApp: {listing.contact_whatsapp}</p> : null}
                <p className="text-muted-foreground">{listing.agent?.agency_name || listing.agent?.profile?.full_name || 'Verified seller'}</p>
              </div>
            </div>
            <MarketplaceInquiryPanel listingId={listing.id} title={listing.title} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
