import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageCircle, ArrowRight } from 'lucide-react'

export default async function UserMarketplaceInquiriesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: inquiries } = await supabase
    .from('marketplace_inquiries')
    .select('*, listing:marketplace_listings(title, slug), agent:agents(agency_name)')
    .eq('buyer_user_id', user?.id || '')
    .order('updated_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Marketplace Conversations</h1>
        <p className="text-muted-foreground">Track your chats with marketplace sellers.</p>
      </div>

      {inquiries?.length ? (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <Card key={inquiry.id}>
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-2 flex gap-2">
                    <Badge>{inquiry.status}</Badge>
                    <Badge variant="secondary">{inquiry.listing?.title || 'Listing'}</Badge>
                    {!inquiry.buyer_last_read_at ||
                    new Date(inquiry.last_message_at).getTime() > new Date(inquiry.buyer_last_read_at).getTime() ? (
                      <Badge variant="default">New reply</Badge>
                    ) : null}
                  </div>
                  <p className="font-semibold">{inquiry.agent?.agency_name || 'Seller'}</p>
                  <p className="text-sm text-muted-foreground">
                    Updated {new Date(inquiry.updated_at).toLocaleString()}
                  </p>
                </div>
                <Link href={`/marketplace-inquiries/${inquiry.id}`}>
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
            <CardTitle>No marketplace conversations yet</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Start a conversation from any marketplace listing and it will appear here.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
