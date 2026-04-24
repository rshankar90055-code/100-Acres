import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Eye, Edit, Car, Bike, Laptop, Refrigerator, MapPin } from 'lucide-react'
import { formatMarketplacePrice, getMarketplaceCategoryLabel } from '@/lib/marketplace'

const categoryIcons = {
  car: Car,
  bike: Bike,
  electronics: Laptop,
  appliance: Refrigerator,
}

export default async function AgentMarketplacePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: agent } = await supabase.from('agents').select('id').eq('user_id', user?.id).single()
  if (!agent) return <div>Agent not found</div>

  const { data: listings } = await supabase
    .from('marketplace_listings')
    .select('*, city:cities(name)')
    .eq('agent_id', agent.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Marketplace Listings</h1>
          <p className="text-muted-foreground">Manage cars, bikes, electronics, and appliance listings.</p>
        </div>
        <Link href="/agent/marketplace/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Marketplace Listing
          </Button>
        </Link>
      </div>

      {listings?.length ? (
        <div className="space-y-4">
          {listings.map((listing) => {
            const Icon = categoryIcons[listing.category as keyof typeof categoryIcons] || Laptop
            return (
              <Card key={listing.id}>
                <CardContent className="p-0">
                  <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
                    <div className="h-32 w-full overflow-hidden rounded-lg bg-muted md:w-40">
                      {listing.images?.[0] ? (
                        <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Icon className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <Badge>{getMarketplaceCategoryLabel(listing.category)}</Badge>
                        {listing.subcategory ? <Badge variant="secondary">{listing.subcategory}</Badge> : null}
                        <Badge variant="outline">{listing.status}</Badge>
                      </div>
                      <h3 className="mb-1 text-lg font-semibold">{listing.title}</h3>
                      <div className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {listing.locality}, {listing.city?.name}
                      </div>
                      <p className="text-xl font-bold text-primary">Rs. {formatMarketplacePrice(listing.price)}</p>
                    </div>
                    <div className="flex gap-2 md:flex-col">
                      <Link href={`/agent/marketplace/${listing.id}/edit`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/marketplace/${listing.slug}`} target="_blank">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Laptop className="mb-4 h-16 w-16 text-muted-foreground/50" />
            <h3 className="mb-2 text-xl font-semibold">No marketplace listings yet</h3>
            <p className="mb-6 text-muted-foreground">Start publishing your first marketplace category listing.</p>
            <Link href="/agent/marketplace/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Listing
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
