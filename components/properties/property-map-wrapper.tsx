import { createClient } from '@/lib/supabase/server'
import { PropertyMapView } from './property-map-view'

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
  const supabase = await createClient()

  // Build query - same as PropertyGrid but without pagination
  let query = supabase
    .from('properties')
    .select(`
      *,
      city:cities(*),
      agent:agents(*, profile:profiles(*))
    `)
    .eq('is_active', true)
    .eq('status', 'available')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .limit(100) // Limit for performance

  // Apply filters
  if (searchParams.q) {
    query = query.or(
      `title.ilike.%${searchParams.q}%,locality.ilike.%${searchParams.q}%,address.ilike.%${searchParams.q}%`
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
    if (beds >= 5) {
      query = query.gte('bedrooms', 5)
    } else {
      query = query.eq('bedrooms', beds)
    }
  }

  if (searchParams.price) {
    const [min, max] = searchParams.price.split('-').map(Number)
    if (min) query = query.gte('price', min)
    if (max) query = query.lte('price', max)
  }

  // Apply sorting
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

  const { data: properties } = await query

  return <PropertyMapView properties={properties || []} />
}
