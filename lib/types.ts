export interface City {
  id: string
  name: string
  slug: string
  state: string
  is_active: boolean
  hero_image_url: string | null
  description: string | null
  property_count: number
  agent_count: number
  created_at: string
}

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: 'user' | 'agent' | 'admin'
  preferred_city_id: string | null
  created_at: string
  updated_at: string
}

export interface Agent {
  id: string
  user_id: string
  city_id: string | null
  agency_name: string | null
  license_number: string | null
  experience_years: number
  specialization: string[] | null
  bio: string | null
  whatsapp_number: string | null
  is_verified: boolean
  is_active: boolean
  rating: number
  review_count: number
  properties_sold: number
  subscription_tier: 'free' | 'basic' | 'premium'
  subscription_expires_at: string | null
  created_at: string
  updated_at: string
  profile?: Profile
  city?: City
}

export interface Property {
  id: string
  agent_id: string
  city_id: string | null
  title: string
  slug: string
  description: string | null
  property_type: 'apartment' | 'house' | 'villa' | 'plot' | 'commercial' | 'pg'
  listing_type: 'sale' | 'rent'
  price: number
  price_per_sqft: number | null
  area_sqft: number | null
  bedrooms: number | null
  bathrooms: number | null
  furnishing: 'unfurnished' | 'semi-furnished' | 'fully-furnished' | null
  floor_number: number | null
  total_floors: number | null
  facing: string | null
  age_of_property: string | null
  amenities: string[] | null
  address: string | null
  locality: string | null
  landmark: string | null
  latitude: number | null
  longitude: number | null
  images: string[] | null
  video_url: string | null
  is_featured: boolean
  is_verified: boolean
  is_active: boolean
  status: 'available' | 'sold' | 'rented' | 'pending'
  view_count: number
  lead_count: number
  created_at: string
  updated_at: string
  agent?: Agent
  city?: City
}

export interface Lead {
  id: string
  property_id: string | null
  agent_id: string
  user_id: string | null
  name: string
  email: string | null
  phone: string
  message: string | null
  lead_type: 'callback' | 'whatsapp' | 'visit'
  status: 'new' | 'contacted' | 'interested' | 'converted' | 'closed'
  notes: string | null
  created_at: string
  updated_at: string
  property?: Property
}

export interface SavedProperty {
  id: string
  user_id: string
  property_id: string
  created_at: string
  property?: Property
}

export interface AreaInsight {
  id: string
  city_id: string
  locality: string
  water_supply_rating: number | null
  power_supply_rating: number | null
  safety_rating: number | null
  connectivity_rating: number | null
  schools_nearby: string[] | null
  hospitals_nearby: string[] | null
  markets_nearby: string[] | null
  public_transport: string[] | null
  average_rent: number | null
  average_price_sqft: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AgentReview {
  id: string
  agent_id: string
  user_id: string
  rating: number
  review: string | null
  is_verified: boolean
  created_at: string
  profile?: Profile
}

export type PropertyType = Property['property_type']
export type ListingType = Property['listing_type']
export type FurnishingType = Property['furnishing']
export type LeadStatus = Lead['status']
export type UserRole = Profile['role']
