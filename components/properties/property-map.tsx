'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Property } from '@/lib/types'

interface PropertyMapProps {
  properties: Property[]
  center?: [number, number]
  zoom?: number
  selectedPropertyId?: string
  onPropertySelect?: (property: Property) => void
}

function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `${(price / 10000000).toFixed(1)} Cr`
  } else if (price >= 100000) {
    return `${(price / 100000).toFixed(0)} L`
  }
  return price.toLocaleString()
}

export function PropertyMap({
  properties,
  center = [12.9716, 77.5946], // Default to Bangalore
  zoom = 12,
  selectedPropertyId,
  onPropertySelect,
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !mapRef.current || mapInstanceRef.current) return

    // Initialize map
    const map = L.map(mapRef.current).setView(center, zoom)
    mapInstanceRef.current = map

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isClient, center, zoom])

  useEffect(() => {
    if (!mapInstanceRef.current || !isClient) return

    const map = mapInstanceRef.current

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current.clear()

    // Filter properties with valid coordinates
    const propertiesWithCoords = properties.filter(
      (p) => p.latitude && p.longitude
    )

    if (propertiesWithCoords.length === 0) return

    // Create custom icon
    const createIcon = (isSelected: boolean, price: number) => {
      const color = isSelected ? '#16a34a' : '#0f766e'
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background: ${color};
            color: white;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            border: 2px solid white;
            cursor: pointer;
            transform: translateX(-50%);
          ">
            ₹${formatPrice(price)}
          </div>
        `,
        iconSize: [80, 30],
        iconAnchor: [40, 30],
      })
    }

    // Add markers for each property
    propertiesWithCoords.forEach((property) => {
      const isSelected = property.id === selectedPropertyId
      const marker = L.marker([property.latitude!, property.longitude!], {
        icon: createIcon(isSelected, property.price),
      }).addTo(map)

      // Create popup content
      const popupContent = `
        <div style="min-width: 200px; font-family: system-ui, sans-serif;">
          ${
            property.images && property.images[0]
              ? `<img src="${property.images[0]}" alt="${property.title}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 6px; margin-bottom: 8px;" />`
              : ''
          }
          <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 4px 0; color: #1f2937;">${property.title}</h3>
          <p style="font-size: 12px; color: #6b7280; margin: 0 0 8px 0;">${property.locality || ''}${property.city?.name ? `, ${property.city.name}` : ''}</p>
          <div style="font-size: 16px; font-weight: 700; color: #0f766e;">₹${formatPrice(property.price)}</div>
          <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">
            ${property.bedrooms ? `${property.bedrooms} BHK` : ''} 
            ${property.area_sqft ? `• ${property.area_sqft} sqft` : ''}
          </div>
          <a href="/properties/${property.slug}" style="
            display: block;
            text-align: center;
            background: #0f766e;
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 12px;
            font-weight: 500;
            margin-top: 8px;
          ">View Details</a>
        </div>
      `

      marker.bindPopup(popupContent, {
        maxWidth: 250,
        className: 'property-popup',
      })

      marker.on('click', () => {
        if (onPropertySelect) {
          onPropertySelect(property)
        }
      })

      markersRef.current.set(property.id, marker)
    })

    // Fit bounds to show all markers
    if (propertiesWithCoords.length > 0) {
      const bounds = L.latLngBounds(
        propertiesWithCoords.map((p) => [p.latitude!, p.longitude!])
      )
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [properties, selectedPropertyId, onPropertySelect, isClient])

  // Update marker icon when selection changes
  useEffect(() => {
    if (!isClient) return

    markersRef.current.forEach((marker, id) => {
      const property = properties.find((p) => p.id === id)
      if (property) {
        const isSelected = id === selectedPropertyId
        const createIcon = (isSelected: boolean, price: number) => {
          const color = isSelected ? '#16a34a' : '#0f766e'
          return L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                background: ${color};
                color: white;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                border: 2px solid white;
                cursor: pointer;
                transform: translateX(-50%);
              ">
                ₹${formatPrice(property.price)}
              </div>
            `,
            iconSize: [80, 30],
            iconAnchor: [40, 30],
          })
        }
        marker.setIcon(createIcon(isSelected, property.price))
      }
    })
  }, [selectedPropertyId, properties, isClient])

  if (!isClient) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted rounded-xl">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    )
  }

  return (
    <div 
      ref={mapRef} 
      className="h-full w-full rounded-xl"
      style={{ minHeight: '400px' }}
    />
  )
}
