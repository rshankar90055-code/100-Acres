import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  Building2, 
  Users, 
  Eye, 
  Phone, 
  Plus,
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react'

export default async function AgentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch agent
  const { data: agent } = await supabase
    .from('agents')
    .select('*')
    .eq('user_id', user?.id)
    .single()

  if (!agent) {
    return <div>Agent not found</div>
  }

  // Fetch stats
  const { count: totalProperties } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', agent.id)

  const { count: activeProperties } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', agent.id)
    .eq('is_active', true)
    .eq('status', 'available')

  const { count: totalLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', agent.id)

  const { count: newLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', agent.id)
    .eq('status', 'new')

  // Fetch total views
  const { data: properties } = await supabase
    .from('properties')
    .select('view_count')
    .eq('agent_id', agent.id)

  const totalViews = properties?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0

  // Fetch recent leads
  const { data: recentLeads } = await supabase
    .from('leads')
    .select(`
      *,
      property:properties(title, slug)
    `)
    .eq('agent_id', agent.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch recent properties
  const { data: recentProperties } = await supabase
    .from('properties')
    .select('id, title, slug, images, price, status, view_count, created_at')
    .eq('agent_id', agent.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const formatPrice = (price: number): string => {
    if (price >= 10000000) {
      return `${(price / 10000000).toFixed(2)} Cr`
    } else if (price >= 100000) {
      return `${(price / 100000).toFixed(2)} L`
    }
    return price.toLocaleString()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agent Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your properties and leads
          </p>
        </div>
        <Link href="/agent/properties/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Property
          </Button>
        </Link>
      </div>

      {/* Verification Warning */}
      {!agent.is_verified && (
        <Card className="border-amber-500/50 bg-amber-50">
          <CardContent className="flex items-center gap-4 p-4">
            <Clock className="h-8 w-8 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">Verification Pending</p>
              <p className="text-sm text-amber-700">
                Your account is pending verification. Some features may be limited.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeProperties || 0}</p>
              <p className="text-sm text-muted-foreground">Active Listings</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{newLeads || 0}</p>
              <p className="text-sm text-muted-foreground">New Leads</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalViews}</p>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalProperties || 0}</p>
              <p className="text-sm text-muted-foreground">Total Properties</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Leads
            </CardTitle>
            <Link href="/agent/leads">
              <Button variant="ghost" size="sm" className="gap-1">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentLeads && recentLeads.length > 0 ? (
              <div className="space-y-4">
                {recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div>
                      <p className="font-medium text-foreground">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {lead.property?.title || 'Property'}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {lead.phone}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          lead.status === 'new'
                            ? 'default'
                            : lead.status === 'contacted'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {lead.status}
                      </Badge>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Users className="mx-auto mb-2 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">No leads yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Properties */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Your Properties
            </CardTitle>
            <Link href="/agent/properties">
              <Button variant="ghost" size="sm" className="gap-1">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentProperties && recentProperties.length > 0 ? (
              <div className="space-y-4">
                {recentProperties.map((property) => (
                  <Link
                    key={property.id}
                    href={`/agent/properties/${property.id}/edit`}
                    className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                      {property.images?.[0] ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{property.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Rs. {formatPrice(property.price)}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {property.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {property.view_count} views
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Building2 className="mx-auto mb-2 h-12 w-12 text-muted-foreground/50" />
                <p className="mb-4 text-muted-foreground">No properties listed yet</p>
                <Link href="/agent/properties/new">
                  <Button>Add Your First Property</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
