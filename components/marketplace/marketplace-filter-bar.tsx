'use client'

import { useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { marketplaceCategories, marketplaceConditionOptions } from '@/lib/marketplace'

interface FilterBarProps {
  cities: { id: string; name: string }[]
}

export function MarketplaceFilterBar({ cities }: FilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeFilters = useMemo(() => {
    const items: { key: string; label: string }[] = []
    const category = searchParams.get('category')
    const city = searchParams.get('city')
    const condition = searchParams.get('condition')
    const q = searchParams.get('q')

    if (q) items.push({ key: 'q', label: `Search: ${q}` })
    if (category && category !== 'all') {
      const match = marketplaceCategories.find((item) => item.value === category)
      items.push({ key: 'category', label: match?.label || category })
    }
    if (city && city !== 'all') {
      const match = cities.find((item) => item.id === city)
      items.push({ key: 'city', label: match?.name || city })
    }
    if (condition && condition !== 'all') {
      const match = marketplaceConditionOptions.find((item) => item.value === condition)
      items.push({ key: 'condition', label: match?.label || condition })
    }

    return items
  }, [cities, searchParams])

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(key)
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname)
  }

  const quickCategories = ['car', 'bike', 'electronics', 'appliance'] as const

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {quickCategories.map((category) => {
          const item = marketplaceCategories.find((value) => value.value === category)
          const active = searchParams.get('category') === category
          return (
            <Button
              key={category}
              type="button"
              variant={active ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateParam('category', active ? 'all' : category)}
            >
              {item?.label || category}
            </Button>
          )
        })}
      </div>
      {activeFilters.length ? (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter.key}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => removeFilter(filter.key)}
            >
              {filter.label} x
            </Badge>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={() => router.push(pathname)}>
            Clear all
          </Button>
        </div>
      ) : null}
    </div>
  )
}
