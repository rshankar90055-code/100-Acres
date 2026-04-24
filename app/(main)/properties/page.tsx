import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PropertyFilters } from '@/components/properties/property-filters'
import { PropertyGrid } from '@/components/properties/property-grid'
import { PropertyGridSkeleton } from '@/components/properties/property-grid-skeleton'
import { PropertyMapWrapper } from '@/components/properties/property-map-wrapper'
import { getDemoCities, hasSupabaseEnv } from '@/lib/site-data'
import type { City } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Verified Properties in Karnataka | 100acres',
  description:
    'Browse verified properties for sale and rent across Karnataka with city filters, local agent support, and map-based discovery.',
  alternates: {
    canonical: '/properties',
  },
  openGraph: {
    title: 'Verified Properties in Karnataka | 100acres',
    description:
      'Browse verified properties for sale and rent across Karnataka with city filters, local agent support, and map-based discovery.',
    url: '/properties',
  },
}

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
  let cities: City[] = getDemoCities()

  if (hasSupabaseEnv) {
    try {
      const supabase = await createClient()
      const { data } = await supabase
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (data?.length) {
        cities = data as City[]
      }
    } catch {
      // Keep demo cities for public browsing.
    }
  }

  const isMapView = params.view === 'map'

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Find Your Perfect Property
          </h1>
          <p className="text-muted-foreground">
            Browse verified listings across Karnataka&apos;s growing cities
          </p>
        </div>

        <PropertyFilters cities={cities} showViewToggle />

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