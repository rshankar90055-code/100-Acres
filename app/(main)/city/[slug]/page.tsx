import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PropertyFilters } from '@/components/properties/property-filters'
import { PropertyGrid } from '@/components/properties/property-grid'
import { Badge } from '@/components/ui/badge'
import { MapPin, Building2, Users, Shield } from 'lucide-react'
import { getDemoCities, getDemoCityBySlug, hasSupabaseEnv } from '@/lib/site-data'
import { getCitySlugCandidates } from '@/lib/city-aliases'
import type { City } from '@/lib/types'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const canonicalPath = `/city/${slug}`

  if (!hasSupabaseEnv) {
    const city = getDemoCityBySlug(slug)

    return city
      ? {
          title: `Properties in ${city.name}, ${city.state} | 100Acres`,
          description:
            city.description ||
            `Find verified properties for sale and rent in ${city.name}, ${city.state}.`,
          alternates: {
            canonical: canonicalPath,
          },
          openGraph: {
            title: `Properties in ${city.name}, ${city.state} | 100Acres`,
            description:
              city.description ||
              `Find verified properties for sale and rent in ${city.name}, ${city.state}.`,
            url: canonicalPath,
          },
        }
      : { title: 'City Not Found' }
  }

  try {
    const supabase = await createClient()
    const slugCandidates = getCitySlugCandidates(slug)
    const { data: city } = await supabase
      .from('cities')
      .select('name, state, description')
      .in('slug', slugCandidates)
      .limit(1)
      .maybeSingle()

    if (!city) return { title: 'City Not Found' }

    return {
      title: `Properties in ${city.name}, ${city.state} | 100Acres`,
      description:
        city.description ||
        `Find verified properties for sale and rent in ${city.name}, ${city.state}. Browse houses, apartments, plots, and commercial spaces with trusted local agents.`,
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        title: `Properties in ${city.name}, ${city.state} | 100Acres`,
        description:
          city.description ||
          `Find verified properties for sale and rent in ${city.name}, ${city.state}. Browse houses, apartments, plots, and commercial spaces with trusted local agents.`,
        url: canonicalPath,
      },
    }
  } catch {
    return { title: 'City Not Found' }
  }
}
function CityHero({
  cityName,
  cityState,
  cityDescription,
  propertyCount,
  verifiedCount,
  agentCount,
  badgeLabel,
}: {
  cityName: string
  cityState: string
  cityDescription: string | null
  propertyCount: number
  verifiedCount: number
  agentCount: number
  badgeLabel: string
}) {
  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <Badge variant="secondary" className="font-medium">
                {badgeLabel}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Properties in {cityName}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {cityState} • {cityDescription || 'Find your perfect property'}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 rounded-xl bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{propertyCount}</p>
                <p className="text-sm text-muted-foreground">Properties</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{verifiedCount}</p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{agentCount}</p>
                <p className="text-sm text-muted-foreground">Agents</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default async function CityPage({ params, searchParams }: Props) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams

  if (!hasSupabaseEnv) {
    const city = getDemoCityBySlug(slug)
    if (!city) notFound()

    return (
      <div className="min-h-screen bg-background">
        <CityHero
          cityName={city.name}
          cityState={city.state}
          cityDescription={city.description}
          propertyCount={city.property_count}
          verifiedCount={city.property_count}
          agentCount={city.agent_count}
          badgeLabel="Trusted Local Network"
        />

        <section className="container mx-auto px-4 py-8">
          <PropertyFilters cities={getDemoCities()} showViewToggle />
          <div className="mt-6">
            <PropertyGrid searchParams={{ ...resolvedSearchParams, city: slug } as Record<string, string>} />
          </div>
        </section>
      </div>
    )
  }

  try {
    const supabase = await createClient()
    const slugCandidates = getCitySlugCandidates(slug)
    const { data: city, error: cityError } = await supabase
      .from('cities')
      .select('*')
      .in('slug', slugCandidates)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()

    if (cityError || !city) {
      notFound()
    }

    const [{ count: propertyCount }, { count: agentCount }, { count: verifiedCount }, { data: cities }] =
      await Promise.all([
        supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('city_id', city.id)
          .eq('is_verified', true)
          .eq('status', 'available'),
        supabase
          .from('agents')
          .select('*', { count: 'exact', head: true })
          .eq('city_id', city.id)
          .eq('is_verified', true),
        supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('city_id', city.id)
          .eq('is_verified', true)
          .eq('status', 'available'),
        supabase.from('cities').select('*').eq('is_active', true).order('name'),
      ])

    return (
      <div className="min-h-screen bg-background">
        <CityHero
          cityName={city.name}
          cityState={city.state}
          cityDescription={city.description}
          propertyCount={propertyCount || 0}
          verifiedCount={verifiedCount || 0}
          agentCount={agentCount || 0}
          badgeLabel={`Tier ${city.tier} City`}
        />

        <section className="container mx-auto px-4 py-8">
          <PropertyFilters cities={(cities as City[]) || []} showViewToggle />
          <div className="mt-6">
            <PropertyGrid searchParams={{ ...resolvedSearchParams, city: slug } as Record<string, string>} />
          </div>
        </section>
      </div>
    )
  } catch {
    notFound()
  }
}
