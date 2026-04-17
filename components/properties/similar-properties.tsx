import { PropertyCard } from '@/components/properties/property-card'
import type { Property } from '@/lib/types'

interface SimilarPropertiesProps {
  properties: Property[]
}

export function SimilarProperties({ properties }: SimilarPropertiesProps) {
  if (properties.length === 0) {
    return null
  }

  return (
    <section className="mt-12 border-t border-border pt-12">
      <h2 className="mb-6 text-2xl font-bold text-foreground">
        Similar Properties
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  )
}
