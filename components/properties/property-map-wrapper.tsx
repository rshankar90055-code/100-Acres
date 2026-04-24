import { createClient } from '@/lib/supabase/server'
import { PropertyMapView } from './property-map-view'
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
  sort?: string
}

export async function PropertyMapWrapper({ searchParams }: { searchParams: SearchParams }) {
  let properties: Property[] = []

  if (!hasSupabaseEnv) {
    properties = filterDemoProperties(searchParams)
      .filter((property) => property.latitude && property.longitude)
      .slice(0, 100)
  } else {
    try {
      const supabase = await createClient()

      let query = supabase
        .from('properties')
        .select(`
          *,
          city:cities(*),
          agent:agents(*, profile:profiles(*))
        `)
        .eq('is_active', true)
        .eq('is_verified', true)
        .eq('status', 'available')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .limit(100)

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

      const result = await query
      properties = (result.data as Property[]) || []
    } catch {
      properties = filterDemoProperties(searchParams)
        .filter((property) => property.latitude && property.longitude)
        .slice(0, 100)
    }
  }

  return <PropertyMapView properties={properties} />
}
