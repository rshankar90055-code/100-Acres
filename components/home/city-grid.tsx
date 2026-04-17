import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Building2, ArrowRight } from 'lucide-react'
import type { City } from '@/lib/types'

interface CityGridProps {
  cities: City[]
}

// City images mapping (using placeholder colors for now)
const cityColors: Record<string, string> = {
  'mysuru': 'from-emerald-500/20 to-emerald-600/30',
  'mangaluru': 'from-blue-500/20 to-blue-600/30',
  'hubli': 'from-amber-500/20 to-amber-600/30',
  'dharwad': 'from-rose-500/20 to-rose-600/30',
  'belgaum': 'from-violet-500/20 to-violet-600/30',
  'davangere': 'from-cyan-500/20 to-cyan-600/30',
  'ballari': 'from-orange-500/20 to-orange-600/30',
  'gulbarga': 'from-pink-500/20 to-pink-600/30',
  'shimoga': 'from-teal-500/20 to-teal-600/30',
  'tumkur': 'from-indigo-500/20 to-indigo-600/30',
  'udupi': 'from-lime-500/20 to-lime-600/30',
  'hassan': 'from-fuchsia-500/20 to-fuchsia-600/30',
}

export function CityGrid({ cities }: CityGridProps) {
  if (cities.length === 0) {
    return null
  }

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Explore Properties by City
            </h2>
            <p className="max-w-2xl text-muted-foreground">
              Browse verified listings in Karnataka&apos;s fastest-growing cities. 
              Each property is checked by our trusted local agents.
            </p>
          </div>
          <Link 
            href="/properties" 
            className="group flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            View all cities
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* City Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {cities.map((city) => (
            <Link key={city.id} href={`/city/${city.slug}`}>
              <Card className="group relative overflow-hidden border-border transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cityColors[city.slug] || 'from-primary/10 to-primary/20'} opacity-50 transition-opacity group-hover:opacity-70`} />
                
                <CardContent className="relative p-6">
                  {/* City Icon */}
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MapPin className="h-6 w-6" />
                  </div>

                  {/* City Name */}
                  <h3 className="mb-1 text-xl font-semibold text-foreground group-hover:text-primary">
                    {city.name}
                  </h3>
                  
                  {/* State */}
                  <p className="mb-4 text-sm text-muted-foreground">{city.state}</p>

                  {/* Stats */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {city.property_count}
                      </span>
                      <span className="text-muted-foreground">properties</span>
                    </div>
                  </div>

                  {/* Active Badge */}
                  {city.agent_count > 0 && (
                    <Badge variant="secondary" className="absolute right-4 top-4">
                      {city.agent_count} agents
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
