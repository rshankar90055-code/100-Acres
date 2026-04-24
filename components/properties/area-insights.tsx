import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Droplets, 
  Zap, 
  Shield, 
  Car, 
  Route,
  GraduationCap,
  Stethoscope,
  ShoppingBag,
  Bus
} from 'lucide-react'
import type { AreaInsight } from '@/lib/types'

interface AreaInsightsProps {
  insights: AreaInsight
}

function RatingBar({ label, rating, icon: Icon }: { 
  label: string
  rating: number | null
  icon: typeof Droplets 
}) {
  if (rating === null) return null
  
  const getRatingColor = (r: number) => {
    if (r >= 4) return 'bg-green-500'
    if (r >= 3) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getRatingLabel = (r: number) => {
    if (r >= 4) return 'Excellent'
    if (r >= 3) return 'Good'
    if (r >= 2) return 'Average'
    return 'Poor'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{label}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {getRatingLabel(rating)}
        </span>
      </div>
      <Progress 
        value={rating * 20} 
        className="h-2"
      />
    </div>
  )
}

export function AreaInsights({ insights }: AreaInsightsProps) {
  const hasRatings = 
    insights.water_supply_rating || 
    insights.power_supply_rating || 
    insights.electricity_rating ||
    insights.safety_rating || 
    insights.connectivity_rating ||
    insights.road_rating

  const hasNearby = 
    (insights.schools_nearby && insights.schools_nearby.length > 0) ||
    (insights.hospitals_nearby && insights.hospitals_nearby.length > 0) ||
    (insights.markets_nearby && insights.markets_nearby.length > 0) ||
    (insights.public_transport && insights.public_transport.length > 0)

  if (!hasRatings && !hasNearby) {
    return null
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Local Intelligence
          <Badge variant="secondary" className="font-normal">
            {insights.locality}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Ratings */}
        {hasRatings && (
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <RatingBar 
              label="Water Supply" 
              rating={insights.water_supply_rating} 
              icon={Droplets}
            />
            <RatingBar 
              label="Power Supply" 
              rating={insights.power_supply_rating ?? insights.electricity_rating ?? null} 
              icon={Zap}
            />
            <RatingBar 
              label="Safety" 
              rating={insights.safety_rating} 
              icon={Shield}
            />
            <RatingBar 
              label="Connectivity" 
              rating={insights.connectivity_rating} 
              icon={Car}
            />
            <RatingBar 
              label="Road Conditions" 
              rating={insights.road_rating ?? null} 
              icon={Route}
            />
          </div>
        )}

        {/* Nearby Places */}
        {hasNearby && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Nearby</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              {insights.schools_nearby && insights.schools_nearby.length > 0 && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <GraduationCap className="h-4 w-4 text-blue-500" />
                    Schools
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {insights.schools_nearby.map((school, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {school}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {insights.hospitals_nearby && insights.hospitals_nearby.length > 0 && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Stethoscope className="h-4 w-4 text-red-500" />
                    Hospitals
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {insights.hospitals_nearby.map((hospital, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {hospital}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {insights.markets_nearby && insights.markets_nearby.length > 0 && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <ShoppingBag className="h-4 w-4 text-amber-500" />
                    Markets
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {insights.markets_nearby.map((market, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {market}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {insights.public_transport && insights.public_transport.length > 0 && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Bus className="h-4 w-4 text-green-500" />
                    Public Transport
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {insights.public_transport.map((transport, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {transport}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Price Insights */}
        {(insights.average_rent || insights.average_price_sqft) && (
          <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
            {insights.average_rent && (
              <div>
                <p className="text-sm text-muted-foreground">Average Rent</p>
                <p className="text-lg font-semibold">
                  Rs. {insights.average_rent.toLocaleString()}/month
                </p>
              </div>
            )}
            {insights.average_price_sqft && (
              <div>
                <p className="text-sm text-muted-foreground">Average Price</p>
                <p className="text-lg font-semibold">
                  Rs. {insights.average_price_sqft.toLocaleString()}/sqft
                </p>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {insights.notes && (
          <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-sm text-muted-foreground">{insights.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
