import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MarketplaceThread } from '@/components/marketplace/marketplace-thread'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function UserMarketplaceInquiryThreadPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: inquiry } = await supabase
    .from('marketplace_inquiries')
    .select('id, listing:marketplace_listings(title)')
    .eq('id', id)
    .eq('buyer_user_id', user?.id || '')
    .single()

  if (!inquiry) notFound()
  const listing = Array.isArray(inquiry.listing) ? inquiry.listing[0] : inquiry.listing

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Seller Conversation</h1>
        <p className="text-muted-foreground">{listing?.title || 'Marketplace listing'}</p>
      </div>
      <MarketplaceThread
        inquiryId={id}
        endpoint="/api/marketplace/inquiries"
        title="Conversation"
        description="Keep the conversation in the app and follow up whenever the seller replies."
      />
    </div>
  )
}
