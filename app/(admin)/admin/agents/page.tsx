import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  BadgeCheck, 
  Star, 
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import { AgentVerifyButton } from '@/components/admin/agent-verify-button'

export default async function AdminAgentsPage() {
  const supabase = await createClient()

  const { data: agents } = await supabase
    .from('agents')
    .select(`
      *,
      profile:profiles(full_name, email, phone),
      city:cities(name)
    `)
    .order('created_at', { ascending: false })

  const tierColors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-800',
    basic: 'bg-blue-100 text-blue-800',
    premium: 'bg-amber-100 text-amber-800',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manage Agents</h1>
        <p className="text-muted-foreground">
          Review and verify agent applications
        </p>
      </div>

      {/* Agents List */}
      {agents && agents.length > 0 ? (
        <div className="space-y-4">
          {agents.map((agent) => (
            <Card key={agent.id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  {/* Agent Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {agent.agency_name || agent.profile?.full_name || 'Agent'}
                      </h3>
                      {agent.is_verified && (
                        <BadgeCheck className="h-5 w-5 text-green-500" />
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge 
                        variant={agent.is_verified ? 'default' : 'outline'}
                        className={agent.is_verified ? 'bg-green-500' : 'border-amber-500 text-amber-600'}
                      >
                        {agent.is_verified ? 'Verified' : 'Pending Verification'}
                      </Badge>
                      <Badge className={tierColors[agent.subscription_tier] || tierColors.free}>
                        {agent.subscription_tier?.toUpperCase()} Plan
                      </Badge>
                      {!agent.is_active && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {agent.profile?.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {agent.profile.email}
                        </div>
                      )}
                      {(agent.profile?.phone || agent.whatsapp_number) && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {agent.whatsapp_number || agent.profile.phone}
                        </div>
                      )}
                      {agent.city?.name && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {agent.city.name}
                        </div>
                      )}
                    </div>

                    {agent.license_number && (
                      <p className="text-sm text-muted-foreground">
                        License: {agent.license_number}
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {agent.properties_sold}
                      </p>
                      <p className="text-xs text-muted-foreground">Properties Sold</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {agent.experience_years}
                      </p>
                      <p className="text-xs text-muted-foreground">Years Exp</p>
                    </div>
                    {agent.rating > 0 && (
                      <div>
                        <p className="flex items-center gap-1 text-2xl font-bold text-foreground">
                          {agent.rating.toFixed(1)}
                          <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                        </p>
                        <p className="text-xs text-muted-foreground">Rating</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <AgentVerifyButton 
                      agentId={agent.id} 
                      isVerified={agent.is_verified} 
                    />
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(agent.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="mb-4 h-16 w-16 text-muted-foreground/50" />
            <h3 className="mb-2 text-xl font-semibold text-foreground">
              No agents yet
            </h3>
            <p className="text-muted-foreground">
              Agents will appear here when they register
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
