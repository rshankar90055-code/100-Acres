import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { PropertyFilters } from "@/components/properties/property-filters"
import { PropertyGrid } from "@/components/properties/property-grid"
import { Badge } from "@/components/ui/badge"
import { MapPin, Building2, Users, Shield } from "lucide-react"

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient()
  const { slug } = await params

  const { data: city } = await supabase
    .from("cities")
    .select("name, state, description")
    .eq("slug", slug)
    .single()

  if (!city) {
    return {
      title: "City Not Found",
    }
  }

  return {
    title: `Properties in ${city.name}, ${city.state} | 100Acres`,
    description:
      city.description ||
      `Find verified properties for sale and rent in ${city.name}, ${city.state}. Browse houses, apartments, plots, and commercial spaces with trusted local agents.`,
  }
}

export default async function CityPage({ params, searchParams }: Props) {
  const supabase = await createClient()
  const { slug } = await params
  const resolvedSearchParams = await searchParams

  // Get city details
  const { data: city, error: cityError } = await supabase
    .from("cities")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (cityError || !city) {
    notFound()
  }

  // Get stats for this city
  const { count: propertyCount } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("city_id", city.id)
    .eq("status", "available")

  const { count: agentCount } = await supabase
    .from("agents")
    .select("*", { count: "exact", head: true })
    .eq("city_id", city.id)
    .eq("is_verified", true)

  const { count: verifiedCount } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("city_id", city.id)
    .eq("is_verified", true)
    .eq("status", "available")

  // Get all cities for filter
  const { data: cities } = await supabase
    .from("cities")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name")

  return (
    <div className="min-h-screen bg-background">
      {/* City Hero */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <Badge variant="secondary" className="font-medium">
                  Tier {city.tier} City
                </Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Properties in {city.name}
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                {city.state} &bull; {city.description || "Find your perfect property"}
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 rounded-xl bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{propertyCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Properties</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{verifiedCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Verified</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{agentCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Agents</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Grid */}
      <section className="container mx-auto px-4 py-8">
        <PropertyFilters
          cities={cities || []}
          initialCity={city.id}
          searchParams={resolvedSearchParams}
        />

        <div className="mt-6">
          <PropertyGrid
            cityId={city.id}
            searchParams={resolvedSearchParams}
          />
        </div>
      </section>
    </div>
  )
}
