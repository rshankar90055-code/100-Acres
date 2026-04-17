import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Bed, 
  Bath, 
  Maximize, 
  Layers, 
  Compass,
  Calendar,
  Sofa,
  Building
} from 'lucide-react'
import type { Property } from '@/lib/types'

interface PropertyDetailsProps {
  property: Property
}

const furnishingLabels: Record<string, string> = {
  unfurnished: 'Unfurnished',
  'semi-furnished': 'Semi-Furnished',
  'fully-furnished': 'Fully Furnished',
}

export function PropertyDetails({ property }: PropertyDetailsProps) {
  const details = [
    {
      icon: Bed,
      label: 'Bedrooms',
      value: property.bedrooms ? `${property.bedrooms} BHK` : null,
    },
    {
      icon: Bath,
      label: 'Bathrooms',
      value: property.bathrooms ? `${property.bathrooms}` : null,
    },
    {
      icon: Maximize,
      label: 'Super Built-up Area',
      value: property.area_sqft ? `${property.area_sqft.toLocaleString()} sqft` : null,
    },
    {
      icon: Layers,
      label: 'Floor',
      value: property.floor_number 
        ? `${property.floor_number} of ${property.total_floors || '?'} floors`
        : null,
    },
    {
      icon: Compass,
      label: 'Facing',
      value: property.facing,
    },
    {
      icon: Calendar,
      label: 'Age of Property',
      value: property.age_of_property,
    },
    {
      icon: Sofa,
      label: 'Furnishing',
      value: property.furnishing 
        ? furnishingLabels[property.furnishing] || property.furnishing
        : null,
    },
    {
      icon: Building,
      label: 'Property Type',
      value: property.property_type 
        ? property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)
        : null,
    },
  ].filter((item) => item.value)

  if (details.length === 0) {
    return null
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Property Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {details.map((detail, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <detail.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{detail.label}</p>
                <p className="font-medium text-foreground">{detail.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
