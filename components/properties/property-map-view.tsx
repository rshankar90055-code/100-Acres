'use client'

import { useState } from 'react'
import { PropertyMap } from './property-map'
import { PropertyCard } from './property-card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Property } from '@/lib/types'

interface PropertyMapViewProps {
  properties: Property[]
}

export function PropertyMapView({ properties }: PropertyMapViewProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)

  // Filter properties with coordinates
  const propertiesWithCoords = properties.filter(
    (p) => p.latitude && p.longitude
  )

  const propertiesWithoutCoords = properties.filter(
    (p) => !p.latitude || !p.longitude
  )

  return (
    <div className="relative flex h-[calc(100vh-300px)] min-h-[500px] overflow-hidden rounded-xl border border-border">
      {/* Sidebar with property list */}
      <div
        className={`absolute left-0 top-0 z-10 h-full bg-background transition-transform duration-300 md:relative ${
          showSidebar ? 'translate-x-0' : '-translate-x-full md:-translate-x-full'
        }`}
        style={{ width: showSidebar ? '350px' : '0' }}
      >
        {showSidebar && (
          <div className="flex h-full w-[350px] flex-col border-r border-border">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div>
                <h3 className="font-semibold text-foreground">
                  {propertiesWithCoords.length} properties on map
                </h3>
                {propertiesWithoutCoords.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {propertiesWithoutCoords.length} without location
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSidebar(false)}
                className="md:flex"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-3 p-4">
                {propertiesWithCoords.map((property) => (
                  <button
                    key={property.id}
                    onClick={() => setSelectedProperty(property)}
                    className={`w-full text-left transition-all ${
                      selectedProperty?.id === property.id
                        ? 'ring-2 ring-primary ring-offset-2'
                        : ''
                    }`}
                  >
                    <PropertyCard property={property} showSaveButton={false} />
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Toggle sidebar button */}
      {!showSidebar && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowSidebar(true)}
          className="absolute left-4 top-4 z-20 gap-1 shadow-lg"
        >
          <ChevronRight className="h-4 w-4" />
          Show List
        </Button>
      )}

      {/* Map */}
      <div className="flex-1">
        {propertiesWithCoords.length > 0 ? (
          <PropertyMap
            properties={propertiesWithCoords}
            selectedPropertyId={selectedProperty?.id}
            onPropertySelect={setSelectedProperty}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">No properties with location data</p>
              <p className="text-sm text-muted-foreground">
                Properties need latitude/longitude to appear on the map
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile selected property card */}
      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 z-20 md:hidden">
          <div className="relative rounded-xl bg-background p-2 shadow-xl">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedProperty(null)}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background shadow-md"
            >
              <X className="h-3 w-3" />
            </Button>
            <PropertyCard property={selectedProperty} showSaveButton={false} />
          </div>
        </div>
      )}
    </div>
  )
}
