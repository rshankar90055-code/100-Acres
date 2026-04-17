import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PropertyFilters } from '@/components/properties/property-filters'
import { PropertyGrid } from '@/components/properties/property-grid'
import { PropertyGridSkeleton } from '@/components/properties/property-grid-skeleton'
import { PropertyMapWrapper } from '@/components/properties/property-map-wrapper'
import type { City } from '@/lib/types'

interface SearchParams {
  q?: string
  city?: string
  type?: string
  listing?: string
  minPrice?: string
  maxPrice?: string
  bedrooms?: string
  page?: string
  sort?: string
  view?: string
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Fetch cities for filter dropdown
  const { data: cities } = await supabase
    .from('cities')
    .select('*')
    .eq('is_active', true)
    .order('name')

  const isMapView = params.view === 'map'

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Find Your Perfect Property
          </h1>
          <p className="text-muted-foreground">
            Browse verified listings across Karnataka&apos;s growing cities
          </p>
        </div>

        {/* Filters with View Toggle */}
        <PropertyFilters cities={(cities as City[]) || []} showViewToggle />

        {/* Property Grid or Map View */}
        {isMapView ? (
          <Suspense fallback={<div className="h-[500px] animate-pulse rounded-xl bg-muted" />}>
            <PropertyMapWrapper searchParams={params} />
          </Suspense>
        ) : (
          <Suspense fallback={<PropertyGridSkeleton />}>
            <PropertyGrid searchParams={params} />
          </Suspense>
        )}
      </main>
      <Footer />
    </div>
  )
}
