'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, MapPin, Home, Building2, TrendingUp } from 'lucide-react'

interface HeroSectionProps {
  stats: {
    properties: number
    agents: number
    cities: number
  }
}

export function HeroSection({ stats }: HeroSectionProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [propertyType, setPropertyType] = useState<string>('')
  const [listingType, setListingType] = useState<string>('sale')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (propertyType) params.set('type', propertyType)
    if (listingType) params.set('listing', listingType)
    router.push(`/properties?${params.toString()}`)
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,var(--border)_50%,transparent_51%,transparent_100%)] bg-[length:80px_80px] opacity-30" />
      
      <div className="container relative mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <TrendingUp className="h-4 w-4" />
            Trusted by 10,000+ families in Karnataka
          </div>
          
          {/* Headline */}
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Find Your Dream Home in{' '}
            <span className="text-primary">Karnataka&apos;s</span>{' '}
            Growing Cities
          </h1>
          
          {/* Subheadline */}
          <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            Every property verified by local agents. Real-time updates. 
            No outdated listings. Your trusted partner for homes in Tier-2 and Tier-3 cities.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="mx-auto mb-12 max-w-3xl">
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-lg md:flex-row md:items-center md:gap-2">
              {/* Location Search */}
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter city, locality or landmark..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 border-0 bg-transparent pl-10 text-base shadow-none focus-visible:ring-0"
                />
              </div>

              {/* Divider */}
              <div className="hidden h-8 w-px bg-border md:block" />

              {/* Property Type */}
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="h-12 w-full border-0 bg-transparent shadow-none focus:ring-0 md:w-40">
                  <Home className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="plot">Plot</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="pg">PG/Hostel</SelectItem>
                </SelectContent>
              </Select>

              {/* Divider */}
              <div className="hidden h-8 w-px bg-border md:block" />

              {/* Listing Type */}
              <Select value={listingType} onValueChange={setListingType}>
                <SelectTrigger className="h-12 w-full border-0 bg-transparent shadow-none focus:ring-0 md:w-32">
                  <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="For" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">Buy</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                </SelectContent>
              </Select>

              {/* Search Button */}
              <Button type="submit" size="lg" className="h-12 gap-2 px-6">
                <Search className="h-5 w-5" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </div>
          </form>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground md:text-4xl">
                {stats.properties.toLocaleString()}+
              </div>
              <div className="text-sm text-muted-foreground">Verified Properties</div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground md:text-4xl">
                {stats.agents.toLocaleString()}+
              </div>
              <div className="text-sm text-muted-foreground">Local Agents</div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground md:text-4xl">
                {stats.cities}+
              </div>
              <div className="text-sm text-muted-foreground">Cities Covered</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
