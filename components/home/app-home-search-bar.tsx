'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Bike, Car, Home, Laptop, MapPin, Refrigerator, Search, SlidersHorizontal, Trees } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

type SearchCategory =
  | 'all'
  | 'car'
  | 'bike'
  | 'electronics'
  | 'appliance'
  | 'house'
  | 'villa'
  | 'plot'

const categories: {
  value: SearchCategory
  label: string
  icon: typeof Search
}[] = [
  { value: 'all', label: 'Anything', icon: Search },
  { value: 'car', label: 'Cars', icon: Car },
  { value: 'bike', label: 'Bikes', icon: Bike },
  { value: 'electronics', label: 'Electronics', icon: Laptop },
  { value: 'appliance', label: 'Appliances', icon: Refrigerator },
  { value: 'house', label: 'Houses', icon: Home },
  { value: 'villa', label: 'Villas', icon: Home },
  { value: 'plot', label: 'Plots', icon: Trees },
]

export function AppHomeSearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [category, setCategory] = useState<SearchCategory>('all')

  useEffect(() => {
    const handleOpenSearch = () => setIsSearchOpen(true)
    window.addEventListener('open-home-search', handleOpenSearch)
    return () => window.removeEventListener('open-home-search', handleOpenSearch)
  }, [])

  useEffect(() => {
    if (searchParams.get('openSearch') === '1') {
      setIsSearchOpen(true)
      router.replace('/')
    }
  }, [router, searchParams])

  const previewText = [query.trim(), location.trim()].filter(Boolean).join(' • ')

  const applySearch = () => {
    const combinedSearch = [query.trim(), location.trim()].filter(Boolean).join(' ')

    if (category === 'house' || category === 'villa' || category === 'plot') {
      const params = new URLSearchParams()
      if (combinedSearch) params.set('q', combinedSearch)
      if (category !== 'house') params.set('type', category)
      if (minPrice) params.set('minPrice', minPrice)
      if (maxPrice) params.set('maxPrice', maxPrice)
      router.push(`/properties${params.toString() ? `?${params.toString()}` : ''}`)
      setIsSearchOpen(false)
      return
    }

    const params = new URLSearchParams()
    if (combinedSearch) params.set('q', combinedSearch)
    if (category !== 'all') params.set('category', category)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    router.push(`/marketplace${params.toString() ? `?${params.toString()}` : ''}`)
    setIsSearchOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsSearchOpen(true)}
        className="mb-4 flex h-14 w-full items-center gap-3 rounded-[24px] border border-slate-200 bg-white px-4 text-left shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <Search className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm ${previewText ? 'text-slate-900' : 'text-slate-400'}`}>
            {previewText || 'Search anything…'}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <SlidersHorizontal className="h-4 w-4" />
        </div>
      </button>

      <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <SheetContent side="bottom" className="rounded-t-[30px] px-0 pb-0">
          <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-slate-200" />
          <SheetHeader className="space-y-2 px-5 pb-2 pt-4">
            <SheetTitle className="text-xl">Search filters</SheetTitle>
            <SheetDescription>Search fast and jump straight into results.</SheetDescription>
          </SheetHeader>
          <div className="max-h-[76vh] overflow-y-auto px-5 pb-4">
            <div className="space-y-5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search anything…"
                  className="h-14 rounded-2xl border-slate-200 bg-slate-50 pl-11 text-base"
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-900">Category</p>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((item) => {
                    const Icon = item.icon
                    const active = category === item.value
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setCategory(item.value)}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium ${
                          active
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${
                          active ? 'bg-emerald-100' : 'bg-slate-100'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-900">Price range</p>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    inputMode="numeric"
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                    placeholder="Min price"
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50"
                  />
                  <Input
                    inputMode="numeric"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    placeholder="Max price"
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-900">Location</p>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="City, area, locality..."
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-11"
                  />
                </div>
              </div>
            </div>
          </div>
          <SheetFooter className="border-t border-slate-200 bg-white px-5 pb-5 pt-4">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 flex-1 rounded-2xl"
                onClick={() => {
                  setQuery('')
                  setLocation('')
                  setMinPrice('')
                  setMaxPrice('')
                  setCategory('all')
                }}
              >
                Reset
              </Button>
              <Button type="button" className="h-12 flex-1 rounded-2xl" onClick={applySearch}>
                Apply filters
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
