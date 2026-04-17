import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Building2, 
  Eye, 
  Edit, 
  Trash2,
  MapPin
} from 'lucide-react'
import { DeletePropertyButton } from '@/components/agent/delete-property-button'

export default async function AgentPropertiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch agent
  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('user_id', user?.id)
    .single()

  if (!agent) {
    return <div>Agent not found</div>
  }

  // Fetch properties
  const { data: properties } = await supabase
    .from('properties')
    .select(`
      *,
      city:cities(name)
    `)
    .eq('agent_id', agent.id)
    .order('created_at', { ascending: false })

  const formatPrice = (price: number): string => {
    if (price >= 10000000) {
      return `${(price / 10000000).toFixed(2)} Cr`
    } else if (price >= 100000) {
      return `${(price / 100000).toFixed(2)} L`
    }
    return price.toLocaleString()
  }

  const statusColors: Record<string, string> = {
    available: 'bg-green-100 text-green-800',
    pending: 'bg-amber-100 text-amber-800',
    sold: 'bg-blue-100 text-blue-800',
    rented: 'bg-purple-100 text-purple-800',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Properties</h1>
          <p className="text-muted-foreground">
            Manage your property listings
          </p>
        </div>
        <Link href="/agent/properties/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Property
          </Button>
        </Link>
      </div>

      {/* Properties List */}
      {properties && properties.length > 0 ? (
        <div className="space-y-4">
          {properties.map((property) => (
            <Card key={property.id}>
              <CardContent className="p-0">
                <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
                  {/* Image */}
                  <div className="h-32 w-full flex-shrink-0 overflow-hidden rounded-lg bg-muted md:w-40">
                    {property.images?.[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Building2 className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge className={statusColors[property.status] || 'bg-gray-100 text-gray-800'}>
                        {property.status}
                      </Badge>
                      <Badge variant="outline">
                        {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                      </Badge>
                      {!property.is_active && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>

                    <h3 className="mb-1 text-lg font-semibold text-foreground">
                      {property.title}
                    </h3>
                    
                    <div className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {property.locality}, {property.city?.name}
                    </div>

                    <p className="text-xl font-bold text-primary">
                      Rs. {formatPrice(property.price)}
                      {property.listing_type === 'rent' && (
                        <span className="text-sm font-normal text-muted-foreground">/month</span>
                      )}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {property.view_count} views
                    </div>
                    <p>
                      Listed {new Date(property.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 md:flex-col">
                    <Link href={`/agent/properties/${property.id}/edit`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/properties/${property.slug}`} target="_blank">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    <DeletePropertyButton propertyId={property.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="mb-4 h-16 w-16 text-muted-foreground/50" />
            <h3 className="mb-2 text-xl font-semibold text-foreground">
              No properties yet
            </h3>
            <p className="mb-6 text-muted-foreground">
              Start by adding your first property listing
            </p>
            <Link href="/agent/properties/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Property
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
