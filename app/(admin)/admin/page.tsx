import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  Building2, 
  Users, 
  MapPin, 
  Phone, 
  TrendingUp,
  Eye,
  ArrowRight,
  UserPlus,
  BadgeCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch counts
  const { count: totalProperties } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })

  const { count: activeProperties } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .eq('status', 'available')

  const { count: totalAgents } = await supabase
    .from('agents')
    .select('*', { count: 'exact', head: true })

  const { count: verifiedAgents } = await supabase
    .from('agents')
    .select('*', { count: 'exact', head: true })
    .eq('is_verified', true)

  const { count: pendingAgents } = await supabase
    .from('agents')
    .select('*', { count: 'exact', head: true })
    .eq('is_verified', false)

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: totalLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })

  const { count: newLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new')

  const { count: totalCities } = await supabase
    .from('cities')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // Total views
  const { data: properties } = await supabase
    .from('properties')
    .select('view_count')

  const totalViews = properties?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0

  // Recent properties
  const { data: recentProperties } = await supabase
    .from('properties')
    .select(`
      id, title, slug, created_at, is_verified,
      agent:agents(agency_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // Pending verification agents
  const { data: pendingAgentsList } = await supabase
    .from('agents')
    .select(`
      *,
      profile:profiles(full_name, email)
    `)
    .eq('is_verified', false)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your real estate platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalProperties || 0}</p>
              <p className="text-sm text-muted-foreground">Total Properties</p>
              <p className="text-xs text-green-600">{activeProperties} active</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalAgents || 0}</p>
              <p className="text-sm text-muted-foreground">Agents</p>
              <p className="text-xs text-amber-600">{pendingAgents} pending</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalLeads || 0}</p>
              <p className="text-sm text-muted-foreground">Total Leads</p>
              <p className="text-xs text-blue-600">{newLeads} new</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers || 0}</p>
              </div>
              <UserPlus className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Cities</p>
                <p className="text-2xl font-bold">{totalCities || 0}</p>
              </div>
              <MapPin className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified Agents</p>
                <p className="text-2xl font-bold">{verifiedAgents || 0}</p>
              </div>
              <BadgeCheck className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Pending Agents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Pending Agent Verifications
            </CardTitle>
            <Link href="/admin/agents">
              <Button variant="ghost" size="sm" className="gap-1">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingAgentsList && pendingAgentsList.length > 0 ? (
              <div className="space-y-4">
                {pendingAgentsList.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {agent.agency_name || agent.profile?.full_name || 'Agent'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {agent.profile?.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Applied {new Date(agent.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-amber-500 text-amber-600">
                      Pending
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <BadgeCheck className="mx-auto mb-2 h-12 w-12 text-green-500/50" />
                <p className="text-muted-foreground">All agents verified!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Properties */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Recent Properties
            </CardTitle>
            <Link href="/admin/properties">
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
                  <div
                    key={property.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div>
                      <p className="font-medium text-foreground">{property.title}</p>
                      <p className="text-sm text-muted-foreground">
                        by {property.agent?.agency_name || 'Agent'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(property.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge 
                      variant={property.is_verified ? 'default' : 'outline'}
                      className={property.is_verified ? 'bg-green-500' : ''}
                    >
                      {property.is_verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Building2 className="mx-auto mb-2 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">No properties yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
