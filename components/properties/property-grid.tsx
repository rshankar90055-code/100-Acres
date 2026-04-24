import { createClient } from '@/lib/supabase/server'
import { PropertyCard } from '@/components/properties/property-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, SearchX } from 'lucide-react'
import { filterDemoProperties, hasSupabaseEnv } from '@/lib/site-data'
import type { Property } from '@/lib/types'

interface SearchParams {
  q?: string
  city?: string
  type?: string
  listing?: string
  minPrice?: string
  maxPrice?: string
  bedrooms?: string
  price?: string
  page?: string
  sort?: string
}

const ITEMS_PER_PAGE = 12

export async function PropertyGrid({ searchParams }: { searchParams: SearchParams }) {
  const page = parseInt(searchParams.page || '1')
  const offset = (page - 1) * ITEMS_PER_PAGE

  let properties: Property[] = []
  let count = 0

  if (!hasSupabaseEnv) {
    const filtered = filterDemoProperties(searchParams)
    properties = filtered.slice(offset, offset + ITEMS_PER_PAGE)
    count = filtered.length
  } else {
    try {
      const supabase = await createClient()

      let query = supabase
        .from('properties')
        .select(
          `
            *,
            city:cities(*),
            agent:agents(*, profile:profiles(*))
          `,
          { count: 'exact' },
        )
        .eq('is_active', true)
        .eq('is_verified', true)
        .eq('status', 'available')

      if (searchParams.q) {
        query = query.or(
          `title.ilike.%${searchParams.q}%,locality.ilike.%${searchParams.q}%,address.ilike.%${searchParams.q}%`,
        )
      }

      if (searchParams.city) {
        const { data: city } = await supabase
          .from('cities')
          .select('id')
          .eq('slug', searchParams.city)
          .single()

        if (city) {
          query = query.eq('city_id', city.id)
        }
      }

      if (searchParams.type) {
        query = query.eq('property_type', searchParams.type)
      }

      if (searchParams.listing) {
        query = query.eq('listing_type', searchParams.listing)
      }

      if (searchParams.bedrooms) {
        const beds = parseInt(searchParams.bedrooms)
        query = beds >= 5 ? query.gte('bedrooms', 5) : query.eq('bedrooms', beds)
      }

      if (searchParams.price) {
        const [min, max] = searchParams.price.split('-').map(Number)
        if (min) query = query.gte('price', min)
        if (max) query = query.lte('price', max)
      }

      switch (searchParams.sort) {
        case 'price_low':
          query = query.order('price', { ascending: true })
          break
        case 'price_high':
          query = query.order('price', { ascending: false })
          break
        case 'area_high':
          query = query.order('area_sqft', { ascending: false })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      const result = await query.range(offset, offset + ITEMS_PER_PAGE - 1)
      properties = (result.data as Property[]) || []
      count = result.count || 0
    } catch {
      const filtered = filterDemoProperties(searchParams)
      properties = filtered.slice(offset, offset + ITEMS_PER_PAGE)
      count = filtered.length
    }
  }

  const totalPages = Math.ceil(count / ITEMS_PER_PAGE)

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <SearchX className="mb-4 h-16 w-16 text-muted-foreground/50" />
        <h3 className="mb-2 text-xl font-semibold text-foreground">
          No properties found
        </h3>
        <p className="mb-6 max-w-md text-muted-foreground">
          We couldn&apos;t find any properties matching your criteria.
          Try adjusting your filters or search in a different area.
        </p>
        <Link href="/properties">
          <Button>Clear all filters</Button>
        </Link>
      </div>
    )
  }

  const buildPageUrl = (pageNum: number) => {
    const params = new URLSearchParams()
    if (searchParams.q) params.set('q', searchParams.q)
    if (searchParams.city) params.set('city', searchParams.city)
    if (searchParams.type) params.set('type', searchParams.type)
    if (searchParams.listing) params.set('listing', searchParams.listing)
    if (searchParams.bedrooms) params.set('bedrooms', searchParams.bedrooms)
    if (searchParams.price) params.set('price', searchParams.price)
    if (searchParams.sort) params.set('sort', searchParams.sort)
    params.set('page', pageNum.toString())
    return `/properties?${params.toString()}`
  }

  return (
    <div>
      <div className="mb-6 text-sm text-muted-foreground">
        Showing {offset + 1}-{Math.min(offset + ITEMS_PER_PAGE, count)} of{' '}
        {count.toLocaleString()} properties
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <Link href={buildPageUrl(page - 1)}>
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1}
              className="h-10 w-10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>

          <div className="flex items-center gap-1">
            {page > 3 && (
              <>
                <Link href={buildPageUrl(1)}>
                  <Button variant="ghost" size="sm">
                    1
                  </Button>
                </Link>
                {page > 4 && <span className="px-2 text-muted-foreground">...</span>}
              </>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((currentPage) => currentPage >= page - 2 && currentPage <= page + 2)
              .map((currentPage) => (
                <Link key={currentPage} href={buildPageUrl(currentPage)}>
                  <Button
                    variant={currentPage === page ? 'default' : 'ghost'}
                    size="sm"
                    className="min-w-[40px]"
                  >
                    {currentPage}
                  </Button>
                </Link>
              ))}

            {page < totalPages - 2 && (
              <>
                {page < totalPages - 3 && (
                  <span className="px-2 text-muted-foreground">...</span>
                )}
                <Link href={buildPageUrl(totalPages)}>
                  <Button variant="ghost" size="sm">
                    {totalPages}
                  </Button>
                </Link>
              </>
            )}
          </div>

          <Link href={buildPageUrl(page + 1)}>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages}
              className="h-10 w-10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
