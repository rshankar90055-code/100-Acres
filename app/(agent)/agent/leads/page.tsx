import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Phone, 
  Mail, 
  MessageCircle, 
  Calendar,
  Building2,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { LeadStatusSelect } from '@/components/agent/lead-status-select'

export default async function AgentLeadsPage() {
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

  // Fetch leads
  const { data: leads } = await supabase
    .from('leads')
    .select(`
      *,
      property:properties(id, title, slug, images)
    `)
    .eq('agent_id', agent.id)
    .order('created_at', { ascending: false })

  const leadTypeIcons = {
    callback: Phone,
    whatsapp: MessageCircle,
    visit: Calendar,
  }

  const leadTypeLabels = {
    callback: 'Request Callback',
    whatsapp: 'WhatsApp',
    visit: 'Site Visit',
  }

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-amber-100 text-amber-800',
    converted: 'bg-green-100 text-green-800',
    lost: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Leads</h1>
        <p className="text-muted-foreground">
          Manage enquiries from potential buyers
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {['new', 'contacted', 'converted', 'lost'].map((status) => {
          const count = leads?.filter((l) => l.status === status).length || 0
          return (
            <Card key={status}>
              <CardContent className="p-4">
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm capitalize text-muted-foreground">{status}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Leads List */}
      {leads && leads.length > 0 ? (
        <div className="space-y-4">
          {leads.map((lead) => {
            const LeadIcon = leadTypeIcons[lead.lead_type as keyof typeof leadTypeIcons] || Phone
            return (
              <Card key={lead.id}>
                <CardContent className="p-0">
                  <div className="flex flex-col gap-4 p-4 md:flex-row md:items-start">
                    {/* Property Image */}
                    <div className="h-24 w-full flex-shrink-0 overflow-hidden rounded-lg bg-muted md:w-32">
                      {lead.property?.images?.[0] ? (
                        <img
                          src={lead.property.images[0]}
                          alt={lead.property.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Building2 className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Lead Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={statusColors[lead.status] || 'bg-gray-100 text-gray-800'}>
                          {lead.status}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <LeadIcon className="h-3 w-3" />
                          {leadTypeLabels[lead.lead_type as keyof typeof leadTypeLabels]}
                        </Badge>
                      </div>

                      <h3 className="font-semibold text-foreground">{lead.name}</h3>

                      {lead.property && (
                        <Link
                          href={`/properties/${lead.property.slug}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {lead.property.title}
                        </Link>
                      )}

                      {lead.message && (
                        <p className="text-sm text-muted-foreground">
                          &quot;{lead.message}&quot;
                        </p>
                      )}

                      {/* Contact Info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <a href={`tel:${lead.phone}`} className="hover:text-primary">
                            {lead.phone}
                          </a>
                        </div>
                        {lead.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            <a href={`mailto:${lead.email}`} className="hover:text-primary">
                              {lead.email}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <LeadStatusSelect leadId={lead.id} currentStatus={lead.status} />
                      <div className="flex gap-2">
                        <Button size="sm" asChild>
                          <a href={`tel:${lead.phone}`}>
                            <Phone className="mr-1 h-4 w-4" />
                            Call
                          </a>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a
                            href={`https://wa.me/${lead.phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="mr-1 h-4 w-4" />
                            WhatsApp
                          </a>
                        </Button>
                      </div>
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
            <Users className="mb-4 h-16 w-16 text-muted-foreground/50" />
            <h3 className="mb-2 text-xl font-semibold text-foreground">
              No leads yet
            </h3>
            <p className="text-muted-foreground">
              When buyers enquire about your properties, they&apos;ll appear here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
