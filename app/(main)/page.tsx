import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { HeroSection } from '@/components/home/hero-section'
import { CityGrid } from '@/components/home/city-grid'
import { FeaturedProperties } from '@/components/home/featured-properties'
import { TrustIndicators } from '@/components/home/trust-indicators'
import { HowItWorks } from '@/components/home/how-it-works'
import { Footer } from '@/components/layout/footer'
import type { City, Property } from '@/lib/types'

export default async function HomePage() {
  const supabase = await createClient()
  
  // Fetch active cities
  const { data: cities } = await supabase
    .from('cities')
    .select('*')
    .eq('is_active', true)
    .order('property_count', { ascending: false })
    .limit(12)
  
  // Fetch featured properties
  const { data: featuredProperties } = await supabase
    .from('properties')
    .select(`
      *,
      city:cities(*),
      agent:agents(*, profile:profiles(*))
    `)
    .eq('is_featured', true)
    .eq('is_active', true)
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(6)
  
  // Get stats
  const { count: totalProperties } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
  
  const { count: totalAgents } = await supabase
    .from('agents')
    .select('*', { count: 'exact', head: true })
    .eq('is_verified', true)
  
  const { count: totalCities } = await supabase
    .from('cities')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection 
          stats={{
            properties: totalProperties || 0,
            agents: totalAgents || 0,
            cities: totalCities || 0
          }}
        />
        <CityGrid cities={(cities as City[]) || []} />
        <FeaturedProperties properties={(featuredProperties as Property[]) || []} />
        <TrustIndicators />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}
