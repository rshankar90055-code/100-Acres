import type { Agent, AreaInsight, City, Property } from '@/lib/types'

export const hasSupabaseEnv = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)

const demoCities: City[] = [
  {
    id: 'city-davangere',
    name: 'Davangere',
    slug: 'davangere',
    state: 'Karnataka',
    is_active: true,
    hero_image_url: null,
    description: 'Fast-moving residential pockets with trusted local inventory and strong family demand.',
    property_count: 18,
    agent_count: 4,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'city-hubli',
    name: 'Hubballi',
    slug: 'hubli',
    state: 'Karnataka',
    is_active: true,
    hero_image_url: null,
    description: 'A business-forward city with plotted developments, apartments, and rental demand.',
    property_count: 26,
    agent_count: 6,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'city-mysuru',
    name: 'Mysuru',
    slug: 'mysuru',
    state: 'Karnataka',
    is_active: true,
    hero_image_url: null,
    description: 'Premium villas, family apartments, and plotted layouts backed by ground verification.',
    property_count: 31,
    agent_count: 8,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'city-shivamogga',
    name: 'Shivamogga',
    slug: 'shivamogga',
    state: 'Karnataka',
    is_active: true,
    hero_image_url: null,
    description: 'Trusted local agent network focused on ready-to-move homes and high-intent buyers.',
    property_count: 14,
    agent_count: 3,
    created_at: '2026-01-01T00:00:00.000Z',
  },
]

const demoAgents: Agent[] = [
  {
    id: 'agent-dvg-1',
    user_id: 'user-agent-dvg-1',
    city_id: 'city-davangere',
    agency_name: 'TrustLine Properties',
    license_number: 'KA-DVG-1001',
    experience_years: 8,
    specialization: ['plots', 'houses'],
    bio: 'Ground-verified specialist for family homes and investment plots in Davangere.',
    whatsapp_number: '919900000001',
    is_verified: true,
    is_active: true,
    rating: 4.8,
    review_count: 29,
    properties_sold: 63,
    subscription_tier: 'premium',
    subscription_expires_at: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    profile: {
      id: 'profile-agent-dvg-1',
      email: 'sunil@trustline.in',
      full_name: 'Sunil Kumar',
      phone: '+919900000001',
      avatar_url: null,
      role: 'agent',
      preferred_city_id: 'city-davangere',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    city: demoCities[0],
  },
  {
    id: 'agent-hbl-1',
    user_id: 'user-agent-hbl-1',
    city_id: 'city-hubli',
    agency_name: 'North Karnataka Homes',
    license_number: 'KA-HBL-2103',
    experience_years: 11,
    specialization: ['apartments', 'commercial'],
    bio: 'Known for quick response times and strong commercial property verification.',
    whatsapp_number: '919900000002',
    is_verified: true,
    is_active: true,
    rating: 4.9,
    review_count: 41,
    properties_sold: 88,
    subscription_tier: 'premium',
    subscription_expires_at: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    profile: {
      id: 'profile-agent-hbl-1',
      email: 'shreya@nkhomes.in',
      full_name: 'Shreya Patil',
      phone: '+919900000002',
      avatar_url: null,
      role: 'agent',
      preferred_city_id: 'city-hubli',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    city: demoCities[1],
  },
  {
    id: 'agent-mys-1',
    user_id: 'user-agent-mys-1',
    city_id: 'city-mysuru',
    agency_name: 'Mysuru Verified Realty',
    license_number: 'KA-MYS-3004',
    experience_years: 9,
    specialization: ['villa', 'apartment'],
    bio: 'Handles premium neighborhoods with strong local intelligence and buyer support.',
    whatsapp_number: '919900000003',
    is_verified: true,
    is_active: true,
    rating: 4.7,
    review_count: 35,
    properties_sold: 74,
    subscription_tier: 'basic',
    subscription_expires_at: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    profile: {
      id: 'profile-agent-mys-1',
      email: 'megha@mvr.in',
      full_name: 'Megha Rao',
      phone: '+919900000003',
      avatar_url: null,
      role: 'agent',
      preferred_city_id: 'city-mysuru',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    city: demoCities[2],
  },
]

const placeholderImage = '/placeholder.jpg'

const demoProperties: Property[] = [
  {
    id: 'property-dvg-1',
    agent_id: 'agent-dvg-1',
    city_id: 'city-davangere',
    title: 'Verified 3 BHK Family Home near MCC B Block',
    slug: 'verified-3bhk-family-home-davangere',
    description:
      'A ready-to-move independent home verified on-site by our Davangere agent. Strong water availability, calm street access, and schools within a short drive.',
    property_type: 'house',
    listing_type: 'sale',
    price: 7800000,
    price_per_sqft: 5200,
    area_sqft: 1500,
    bedrooms: 3,
    bathrooms: 3,
    furnishing: 'semi-furnished',
    floor_number: 1,
    total_floors: 2,
    facing: 'East',
    age_of_property: '3 years',
    amenities: ['Covered Parking', 'Borewell', 'CCTV', 'Terrace Access'],
    address: 'MCC B Block, Davangere',
    locality: 'MCC B Block',
    landmark: 'Near Bapuji Dental College',
    latitude: 14.4661,
    longitude: 75.9238,
    images: [placeholderImage],
    video_url: null,
    is_featured: true,
    is_verified: true,
    is_active: true,
    status: 'available',
    view_count: 146,
    lead_count: 17,
    created_at: '2026-03-14T00:00:00.000Z',
    updated_at: '2026-04-14T00:00:00.000Z',
    city: demoCities[0],
    agent: demoAgents[0],
  },
  {
    id: 'property-hbl-1',
    agent_id: 'agent-hbl-1',
    city_id: 'city-hubli',
    title: 'Premium 2 BHK Apartment in Vidyanagar',
    slug: 'premium-2bhk-apartment-vidyanagar-hubli',
    description:
      'Professionally maintained apartment with local verification, fast agent response, and excellent connectivity to schools and hospitals.',
    property_type: 'apartment',
    listing_type: 'sale',
    price: 6200000,
    price_per_sqft: 6100,
    area_sqft: 1015,
    bedrooms: 2,
    bathrooms: 2,
    furnishing: 'fully-furnished',
    floor_number: 4,
    total_floors: 8,
    facing: 'North',
    age_of_property: '2 years',
    amenities: ['Lift', 'Power Backup', 'Security', 'Children Play Area'],
    address: 'Vidyanagar Main Road, Hubballi',
    locality: 'Vidyanagar',
    landmark: 'Near BVB College',
    latitude: 15.3647,
    longitude: 75.1239,
    images: [placeholderImage],
    video_url: null,
    is_featured: true,
    is_verified: true,
    is_active: true,
    status: 'available',
    view_count: 211,
    lead_count: 23,
    created_at: '2026-03-28T00:00:00.000Z',
    updated_at: '2026-04-12T00:00:00.000Z',
    city: demoCities[1],
    agent: demoAgents[1],
  },
  {
    id: 'property-mys-1',
    agent_id: 'agent-mys-1',
    city_id: 'city-mysuru',
    title: 'Local-Agent Verified Villa in Vijayanagar 4th Stage',
    slug: 'verified-villa-vijayanagar-4th-stage-mysuru',
    description:
      'A bright corner villa with physical verification completed by our Mysuru partner. Strong road approach, good security perception, and premium neighborhood demand.',
    property_type: 'villa',
    listing_type: 'sale',
    price: 14500000,
    price_per_sqft: 7250,
    area_sqft: 2000,
    bedrooms: 4,
    bathrooms: 4,
    furnishing: 'semi-furnished',
    floor_number: 2,
    total_floors: 2,
    facing: 'West',
    age_of_property: '1 year',
    amenities: ['Garden', 'Covered Parking', 'Solar Water Heater', 'CCTV'],
    address: 'Vijayanagar 4th Stage, Mysuru',
    locality: 'Vijayanagar 4th Stage',
    landmark: 'Near Ring Road Junction',
    latitude: 12.2958,
    longitude: 76.6394,
    images: [placeholderImage],
    video_url: null,
    is_featured: true,
    is_verified: true,
    is_active: true,
    status: 'available',
    view_count: 318,
    lead_count: 31,
    created_at: '2026-04-03T00:00:00.000Z',
    updated_at: '2026-04-15T00:00:00.000Z',
    city: demoCities[2],
    agent: demoAgents[2],
  },
  {
    id: 'property-mys-2',
    agent_id: 'agent-mys-1',
    city_id: 'city-mysuru',
    title: 'Budget Plot with Verified Documents in Hootagalli',
    slug: 'budget-plot-verified-documents-hootagalli',
    description:
      'Agent-reviewed plot ideal for end users and investors. Updated with live availability and neighborhood notes.',
    property_type: 'plot',
    listing_type: 'sale',
    price: 3850000,
    price_per_sqft: 3200,
    area_sqft: 1200,
    bedrooms: null,
    bathrooms: null,
    furnishing: null,
    floor_number: null,
    total_floors: null,
    facing: 'South',
    age_of_property: null,
    amenities: ['Wide Road', 'Drainage', 'Layout Approval'],
    address: 'Hootagalli, Mysuru',
    locality: 'Hootagalli',
    landmark: 'Near Infosys Campus',
    latitude: 12.3463,
    longitude: 76.5822,
    images: [placeholderImage],
    video_url: null,
    is_featured: false,
    is_verified: true,
    is_active: true,
    status: 'available',
    view_count: 94,
    lead_count: 12,
    created_at: '2026-04-08T00:00:00.000Z',
    updated_at: '2026-04-15T00:00:00.000Z',
    city: demoCities[2],
    agent: demoAgents[2],
  },
  {
    id: 'property-svg-1',
    agent_id: 'agent-dvg-1',
    city_id: 'city-shivamogga',
    title: 'Fast-Moving 2 BHK Rental near Vinobanagar',
    slug: 'fast-moving-2bhk-rental-vinobanagar-shivamogga',
    description:
      'Live rental listing with verified condition report, nearby transport, and local support in Kannada and English.',
    property_type: 'house',
    listing_type: 'rent',
    price: 18000,
    price_per_sqft: 18,
    area_sqft: 980,
    bedrooms: 2,
    bathrooms: 2,
    furnishing: 'semi-furnished',
    floor_number: 1,
    total_floors: 2,
    facing: 'East',
    age_of_property: '4 years',
    amenities: ['Two-Wheeler Parking', 'Borewell', 'Modular Kitchen'],
    address: 'Vinobanagar, Shivamogga',
    locality: 'Vinobanagar',
    landmark: 'Near Kuvempu Road',
    latitude: 13.9381,
    longitude: 75.5756,
    images: [placeholderImage],
    video_url: null,
    is_featured: false,
    is_verified: true,
    is_active: true,
    status: 'available',
    view_count: 73,
    lead_count: 9,
    created_at: '2026-04-09T00:00:00.000Z',
    updated_at: '2026-04-15T00:00:00.000Z',
    city: demoCities[3],
    agent: demoAgents[0],
  },
]

const demoAreaInsights: AreaInsight[] = [
  {
    id: 'insight-dvg-1',
    city_id: 'city-davangere',
    locality: 'MCC B Block',
    water_supply_rating: 4,
    power_supply_rating: 4,
    electricity_rating: 4,
    safety_rating: 4,
    connectivity_rating: 4,
    road_rating: 4,
    schools_nearby: ['Bapuji School', 'National Public School'],
    hospitals_nearby: ['Bapuji Hospital', 'SS Hospital'],
    markets_nearby: ['MCC Market', 'Hadadi Road Retail Strip'],
    public_transport: ['City Bus Stop', 'Auto Stand'],
    average_rent: 16500,
    average_price_sqft: 5100,
    notes: 'Stable family neighborhood with good daily services and consistent water supply.',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-04-15T00:00:00.000Z',
  },
  {
    id: 'insight-hbl-1',
    city_id: 'city-hubli',
    locality: 'Vidyanagar',
    water_supply_rating: 4,
    power_supply_rating: 5,
    electricity_rating: 5,
    safety_rating: 4,
    connectivity_rating: 5,
    road_rating: 4,
    schools_nearby: ['KLE School', 'BVB Campus'],
    hospitals_nearby: ['KIMS', 'Suchirayu Hospital'],
    markets_nearby: ['Vidyanagar Market', 'Gokul Road Retail'],
    public_transport: ['BRTS Access', 'City Bus'],
    average_rent: 22000,
    average_price_sqft: 6200,
    notes: 'Strong buyer confidence due to connectivity, college belt demand, and commercial activity.',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-04-15T00:00:00.000Z',
  },
  {
    id: 'insight-mys-1',
    city_id: 'city-mysuru',
    locality: 'Vijayanagar 4th Stage',
    water_supply_rating: 5,
    power_supply_rating: 4,
    electricity_rating: 4,
    safety_rating: 5,
    connectivity_rating: 4,
    road_rating: 4,
    schools_nearby: ['St. Joseph Central School', 'JSS Public School'],
    hospitals_nearby: ['Apollo BGS', 'Manipal Hospital'],
    markets_nearby: ['Vijayanagar Shopping Street', 'Nearby Supermarkets'],
    public_transport: ['City Bus', 'Cab Availability'],
    average_rent: 28000,
    average_price_sqft: 7100,
    notes: 'Premium residential area with strong family demand, good roads, and stable civic services.',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-04-15T00:00:00.000Z',
  },
]

export const demoSiteData = {
  cities: demoCities,
  agents: demoAgents,
  properties: demoProperties,
  areaInsights: demoAreaInsights,
}

export interface PropertySearchParams {
  q?: string
  city?: string
  type?: string
  listing?: string
  bedrooms?: string
  price?: string
  sort?: string
}

export function getDemoCities() {
  return demoCities
}

export function getFeaturedDemoProperties() {
  return demoProperties.filter((property) => property.is_featured).slice(0, 6)
}

export function getDemoStats() {
  return {
    properties: demoCities.reduce((sum, city) => sum + city.property_count, 0),
    agents: demoCities.reduce((sum, city) => sum + city.agent_count, 0),
    cities: demoCities.length,
  }
}

export function getDemoCityBySlug(slug: string) {
  return demoCities.find((city) => city.slug === slug) ?? null
}

export function getDemoPropertyBySlug(slug: string) {
  return demoProperties.find((property) => property.slug === slug) ?? null
}

export function getDemoAreaInsight(cityId: string, locality: string | null) {
  if (!locality) return null
  return (
    demoAreaInsights.find(
      (insight) => insight.city_id === cityId && insight.locality.toLowerCase() === locality.toLowerCase(),
    ) ?? null
  )
}

export function getSimilarDemoProperties(property: Property) {
  return demoProperties
    .filter(
      (item) =>
        item.id !== property.id &&
        item.city_id === property.city_id &&
        item.property_type === property.property_type &&
        item.status === 'available',
    )
    .slice(0, 4)
}

export function filterDemoProperties(searchParams: PropertySearchParams, cityId?: string) {
  let properties = demoProperties.filter(
    (property) =>
      property.is_active && property.is_verified && property.status === 'available',
  )

  if (cityId) {
    properties = properties.filter((property) => property.city_id === cityId)
  }

  if (searchParams.city) {
    const city = demoCities.find((item) => item.slug === searchParams.city)
    properties = city ? properties.filter((property) => property.city_id === city.id) : []
  }

  if (searchParams.q) {
    const query = searchParams.q.toLowerCase()
    properties = properties.filter((property) =>
      [property.title, property.locality, property.address, property.landmark, property.city?.name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    )
  }

  if (searchParams.type) {
    properties = properties.filter((property) => property.property_type === searchParams.type)
  }

  if (searchParams.listing) {
    properties = properties.filter((property) => property.listing_type === searchParams.listing)
  }

  if (searchParams.bedrooms) {
    const beds = Number(searchParams.bedrooms)
    properties = properties.filter((property) =>
      beds >= 5 ? (property.bedrooms ?? 0) >= 5 : property.bedrooms === beds,
    )
  }

  if (searchParams.price) {
    const [min, max] = searchParams.price.split('-').map(Number)
    properties = properties.filter((property) => {
      const minPass = Number.isFinite(min) ? property.price >= min : true
      const maxPass = Number.isFinite(max) ? property.price <= max : true
      return minPass && maxPass
    })
  }

  switch (searchParams.sort) {
    case 'price_low':
      return [...properties].sort((a, b) => a.price - b.price)
    case 'price_high':
      return [...properties].sort((a, b) => b.price - a.price)
    case 'area_high':
      return [...properties].sort((a, b) => (b.area_sqft ?? 0) - (a.area_sqft ?? 0))
    default:
      return [...properties].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
  }
}
