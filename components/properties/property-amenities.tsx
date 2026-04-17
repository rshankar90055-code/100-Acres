import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Car, 
  Dumbbell, 
  Waves, 
  TreePine, 
  Shield, 
  Wifi,
  Zap,
  Droplets,
  Wind,
  Tv,
  UtensilsCrossed,
  Baby,
  Dog,
  Building,
  CheckCircle2
} from 'lucide-react'

interface PropertyAmenitiesProps {
  amenities: string[]
}

const amenityIcons: Record<string, typeof Car> = {
  parking: Car,
  gym: Dumbbell,
  pool: Waves,
  'swimming pool': Waves,
  garden: TreePine,
  security: Shield,
  '24x7 security': Shield,
  wifi: Wifi,
  'power backup': Zap,
  'water supply': Droplets,
  ac: Wind,
  'air conditioning': Wind,
  tv: Tv,
  'modular kitchen': UtensilsCrossed,
  'kids play area': Baby,
  'pet friendly': Dog,
  lift: Building,
  elevator: Building,
}

export function PropertyAmenities({ amenities }: PropertyAmenitiesProps) {
  if (amenities.length === 0) {
    return null
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Amenities & Features</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {amenities.map((amenity, index) => {
            const IconComponent = amenityIcons[amenity.toLowerCase()] || CheckCircle2
            return (
              <Badge
                key={index}
                variant="secondary"
                className="gap-2 px-3 py-2 text-sm"
              >
                <IconComponent className="h-4 w-4" />
                {amenity}
              </Badge>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
