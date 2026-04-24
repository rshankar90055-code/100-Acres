import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { MarketplaceCard } from '@/components/marketplace/marketplace-card'
import { MarketplaceFilterBar } from '@/components/marketplace/marketplace-filter-bar'
import { marketplaceCategories, marketplaceConditionOptions } from '@/lib/marketplace'
import type { MarketplaceListing } from '@/lib/types'

interface SearchParams {
  q?: string
  category?: string
  city?: string
  condition?: string
  minPrice?: string
  maxPrice?: string
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const [{ data: cities }, listingsResult] = await Promise.all([
    supabase.from('cities').select('id, name').eq('is_active', true).order('name'),
    (async () => {
      let query = supabase
        .from('marketplace_listings')
        .select('*, city:cities(*), agent:agents(*, profile:profiles(*))')
        .eq('is_active', true)
        .eq('is_verified', true)
        .eq('status', 'available')
        .order('created_at', { ascending: false })

      if (params.q) {
        query = query.or(`title.ilike.%${params.q}%,description.ilike.%${params.q}%,brand.ilike.%${params.q}%,model.ilike.%${params.q}%`)
      }
      if (params.category && params.category !== 'all') query = query.eq('category', params.category)
      if (params.city && params.city !== 'all') query = query.eq('city_id', params.city)
      if (params.condition && params.condition !== 'all') query = query.eq('condition', params.condition)
      if (params.minPrice) query = query.gte('price', Number(params.minPrice))
      if (params.maxPrice) query = query.lte('price', Number(params.maxPrice))

      return query
    })(),
  ])

  const listings = (listingsResult.data || []) as MarketplaceListing[]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
          <p className="mt-2 text-muted-foreground">
            Explore local cars, bikes, electronics, and appliances in one clean marketplace feed.
          </p>
        </div>

        <div className="mb-6">
          <MarketplaceFilterBar
            cities={((cities || []) as { id: string; name: string }[])}
          />
        </div>

        <form className="mb-8 grid gap-4 rounded-2xl border bg-card p-4 md:grid-cols-5">
          <input name="q" defaultValue={params.q || ''} placeholder="Search title, brand, model..." className="h-10 rounded-md border bg-background px-3 text-sm" />
          <select name="category" defaultValue={params.category || 'all'} className="h-10 rounded-md border bg-background px-3 text-sm">
            <option value="all">All categories</option>
            {marketplaceCategories.map((category) => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
          <select name="city" defaultValue={params.city || 'all'} className="h-10 rounded-md border bg-background px-3 text-sm">
            <option value="all">All cities</option>
            {(cities || []).map((city) => (
              <option key={city.id} value={city.id}>{city.name}</option>
            ))}
          </select>
          <select name="condition" defaultValue={params.condition || 'all'} className="h-10 rounded-md border bg-background px-3 text-sm">
            <option value="all">Any condition</option>
            {marketplaceConditionOptions.map((condition) => (
              <option key={condition.value} value={condition.value}>{condition.label}</option>
            ))}
          </select>
          <button type="submit" className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
            Apply Filters
          </button>
        </form>

        {listings.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <MarketplaceCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-card p-12 text-center text-muted-foreground">
            No marketplace listings match these filters yet.
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
