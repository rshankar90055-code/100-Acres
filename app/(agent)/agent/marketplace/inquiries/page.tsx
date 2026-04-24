import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageCircle, ArrowRight } from 'lucide-react'

export default async function AgentMarketplaceInquiriesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: agent } = await supabase.from('agents').select('id').eq('user_id', user?.id).single()
  if (!agent) return <div>Agent not found</div>

  const { data: inquiries } = await supabase
    .from('marketplace_inquiries')
    .select('*, listing:marketplace_listings(title, slug), buyer:profiles!marketplace_inquiries_buyer_user_id_fkey(full_name, phone)')
    .eq('agent_id', agent.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Marketplace Inquiries</h1>
        <p className="text-muted-foreground">Reply to buyers directly inside the app.</p>
      </div>

      {inquiries?.length ? (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <Card key={inquiry.id}>
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge>{inquiry.status}</Badge>
                    <Badge variant="secondary">{inquiry.listing?.title || 'Marketplace listing'}</Badge>
                    {!inquiry.agent_last_read_at ||
                    new Date(inquiry.last_message_at).getTime() > new Date(inquiry.agent_last_read_at).getTime() ? (
                      <Badge variant="default">Unread</Badge>
                    ) : null}
                  </div>
                  <h3 className="font-semibold">{inquiry.buyer?.full_name || inquiry.buyer_name || 'Buyer'}</h3>
                  <p className="text-sm text-muted-foreground">
                    {inquiry.buyer?.phone || inquiry.buyer_phone || 'No phone saved'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Updated {new Date(inquiry.updated_at).toLocaleString()}
                  </p>
                </div>
                <Link href={`/agent/marketplace/inquiries/${inquiry.id}`}>
                  <Button className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Open Thread
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No marketplace inquiries yet</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Once buyers start conversations from marketplace listings, they will appear here.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
