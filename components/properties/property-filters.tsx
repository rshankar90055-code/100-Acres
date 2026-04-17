'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Search, SlidersHorizontal, X, MapPin, LayoutGrid, Map } from 'lucide-react'
import type { City } from '@/lib/types'

interface PropertyFiltersProps {
  cities: City[]
  showViewToggle?: boolean
}

const propertyTypes = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'plot', label: 'Plot' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'pg', label: 'PG/Hostel' },
]

const bedroomOptions = [
  { value: '1', label: '1 BHK' },
  { value: '2', label: '2 BHK' },
  { value: '3', label: '3 BHK' },
  { value: '4', label: '4 BHK' },
  { value: '5', label: '5+ BHK' },
]

const priceRanges = [
  { value: '0-2000000', label: 'Under 20 Lakhs' },
  { value: '2000000-5000000', label: '20L - 50L' },
  { value: '5000000-10000000', label: '50L - 1 Cr' },
  { value: '10000000-20000000', label: '1 Cr - 2 Cr' },
  { value: '20000000-999999999', label: 'Above 2 Cr' },
]

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'area_high', label: 'Area: High to Low' },
]

export function PropertyFilters({ cities, showViewToggle = false }: PropertyFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  const currentFilters = {
    q: searchParams.get('q') || '',
    city: searchParams.get('city') || '',
    type: searchParams.get('type') || '',
    listing: searchParams.get('listing') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    price: searchParams.get('price') || '',
    sort: searchParams.get('sort') || 'newest',
    view: searchParams.get('view') || 'grid',
  }

  const activeFilterCount = Object.values(currentFilters).filter(
    (v) => v && v !== 'newest'
  ).length

  const updateFilters = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page') // Reset page when filters change
      router.push(`/properties?${params.toString()}`)
    },
    [router, searchParams]
  )

  const clearAllFilters = () => {
    router.push('/properties')
    setSearchQuery('')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters('q', searchQuery)
  }

  return (
    <div className="mb-8 space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by city, locality, or landmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-10 text-base"
          />
        </div>
        <Button type="submit" size="lg" className="h-12 gap-2 px-6">
          <Search className="h-5 w-5" />
          Search
        </Button>
      </form>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Desktop Filters */}
        <div className="hidden flex-wrap items-center gap-3 md:flex">
          {/* Listing Type */}
          <Select
            value={currentFilters.listing}
            onValueChange={(v) => updateFilters('listing', v)}
          >
            <SelectTrigger className="h-10 w-32">
              <SelectValue placeholder="Buy/Rent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sale">Buy</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
            </SelectContent>
          </Select>

          {/* City */}
          <Select
            value={currentFilters.city}
            onValueChange={(v) => updateFilters('city', v)}
          >
            <SelectTrigger className="h-10 w-40">
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.slug}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Property Type */}
          <Select
            value={currentFilters.type}
            onValueChange={(v) => updateFilters('type', v)}
          >
            <SelectTrigger className="h-10 w-36">
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Bedrooms */}
          <Select
            value={currentFilters.bedrooms}
            onValueChange={(v) => updateFilters('bedrooms', v)}
          >
            <SelectTrigger className="h-10 w-28">
              <SelectValue placeholder="Bedrooms" />
            </SelectTrigger>
            <SelectContent>
              {bedroomOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Price Range */}
          <Select
            value={currentFilters.price}
            onValueChange={(v) => updateFilters('price', v)}
          >
            <SelectTrigger className="h-10 w-36">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              {priceRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mobile Filter Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" className="h-10 gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              {/* Mobile Listing Type */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Looking to
                </label>
                <Select
                  value={currentFilters.listing}
                  onValueChange={(v) => updateFilters('listing', v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Buy or Rent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Buy</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mobile City */}
              <div>
                <label className="mb-2 block text-sm font-medium">City</label>
                <Select
                  value={currentFilters.city}
                  onValueChange={(v) => updateFilters('city', v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.slug}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mobile Property Type */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Property Type
                </label>
                <Select
                  value={currentFilters.type}
                  onValueChange={(v) => updateFilters('type', v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mobile Bedrooms */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Bedrooms
                </label>
                <Select
                  value={currentFilters.bedrooms}
                  onValueChange={(v) => updateFilters('bedrooms', v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Bedrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    {bedroomOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mobile Price Range */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Price Range
                </label>
                <Select
                  value={currentFilters.price}
                  onValueChange={(v) => updateFilters('price', v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => setIsOpen(false)} className="w-full">
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* View Toggle */}
        {showViewToggle && (
          <div className="ml-auto flex items-center rounded-lg border border-border p-1">
            <Button
              variant={currentFilters.view === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 gap-1.5 px-3"
              onClick={() => updateFilters('view', 'grid')}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
            <Button
              variant={currentFilters.view === 'map' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 gap-1.5 px-3"
              onClick={() => updateFilters('view', 'map')}
            >
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">Map</span>
            </Button>
          </div>
        )}

        {/* Sort */}
        <Select
          value={currentFilters.sort}
          onValueChange={(v) => updateFilters('sort', v)}
        >
          <SelectTrigger className={`h-10 w-44 ${!showViewToggle ? 'ml-auto' : ''}`}>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="gap-1 text-muted-foreground"
          >
            <X className="h-4 w-4" />
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {currentFilters.q && (
            <Badge variant="secondary" className="gap-1">
              Search: {currentFilters.q}
              <button onClick={() => updateFilters('q', '')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentFilters.city && (
            <Badge variant="secondary" className="gap-1">
              {cities.find((c) => c.slug === currentFilters.city)?.name ||
                currentFilters.city}
              <button onClick={() => updateFilters('city', '')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentFilters.type && (
            <Badge variant="secondary" className="gap-1">
              {propertyTypes.find((t) => t.value === currentFilters.type)
                ?.label || currentFilters.type}
              <button onClick={() => updateFilters('type', '')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentFilters.listing && (
            <Badge variant="secondary" className="gap-1">
              {currentFilters.listing === 'sale' ? 'Buy' : 'Rent'}
              <button onClick={() => updateFilters('listing', '')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentFilters.bedrooms && (
            <Badge variant="secondary" className="gap-1">
              {currentFilters.bedrooms} BHK
              <button onClick={() => updateFilters('bedrooms', '')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
