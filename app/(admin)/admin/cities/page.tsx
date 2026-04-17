import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Plus, 
  Building2,
  Users
} from 'lucide-react'
import { AddCityDialog } from '@/components/admin/add-city-dialog'
import { CityStatusToggle } from '@/components/admin/city-status-toggle'

export default async function AdminCitiesPage() {
  const supabase = await createClient()

  const { data: cities } = await supabase
    .from('cities')
    .select('*')
    .order('name')

  // Get property counts per city
  const cityCounts: Record<string, number> = {}
  if (cities) {
    for (const city of cities) {
      const { count } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('city_id', city.id)
        .eq('is_active', true)
      cityCounts[city.id] = count || 0
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Cities</h1>
          <p className="text-muted-foreground">
            Add and manage cities where properties can be listed
          </p>
        </div>
        <AddCityDialog />
      </div>

      {/* Cities Grid */}
      {cities && cities.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <Card key={city.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {city.image_url ? (
                      <div className="h-12 w-12 overflow-hidden rounded-lg">
                        <img
                          src={city.image_url}
                          alt={city.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <MapPin className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-foreground">{city.name}</h3>
                      <p className="text-sm text-muted-foreground">{city.slug}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={city.is_active ? 'default' : 'secondary'}
                    className={city.is_active ? 'bg-green-500' : ''}
                  >
                    {city.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{cityCounts[city.id] || 0} properties</span>
                  </div>
                  {city.state && (
                    <div className="text-sm text-muted-foreground">
                      {city.state}
                    </div>
                  )}
                </div>

                {city.description && (
                  <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
                    {city.description}
                  </p>
                )}

                <div className="mt-4">
                  <CityStatusToggle cityId={city.id} isActive={city.is_active} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="mb-4 h-16 w-16 text-muted-foreground/50" />
            <h3 className="mb-2 text-xl font-semibold text-foreground">
              No cities yet
            </h3>
            <p className="mb-4 text-muted-foreground">
              Add cities to enable property listings
            </p>
            <AddCityDialog />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
