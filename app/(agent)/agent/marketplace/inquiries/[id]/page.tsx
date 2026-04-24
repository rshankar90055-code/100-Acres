import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MarketplaceThread } from '@/components/marketplace/marketplace-thread'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AgentMarketplaceInquiryThreadPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: agent } = await supabase.from('agents').select('id').eq('user_id', user?.id).single()
  if (!agent) notFound()

  const { data: inquiry } = await supabase
    .from('marketplace_inquiries')
    .select('id, listing:marketplace_listings(title)')
    .eq('id', id)
    .eq('agent_id', agent.id)
    .single()

  if (!inquiry) notFound()
  const listing = Array.isArray(inquiry.listing) ? inquiry.listing[0] : inquiry.listing

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Marketplace Conversation</h1>
        <p className="text-muted-foreground">{listing?.title || 'Marketplace listing'}</p>
      </div>
      <MarketplaceThread
        inquiryId={id}
        endpoint="/api/marketplace/inquiries"
        title="Buyer Conversation"
        description="Reply quickly to keep high-intent buyers engaged."
      />
    </div>
  )
}
