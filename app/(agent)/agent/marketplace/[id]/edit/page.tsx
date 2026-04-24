import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { MarketplaceForm } from '@/components/marketplace/marketplace-form'
import { getCreatorAccessLabel, hasCreatorAccess } from '@/lib/access'
import type { MarketplaceListing } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditMarketplacePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const [{ data: cities }, { data: listing }, { data: agent }, { data: profile }] = await Promise.all([
    supabase.from('cities').select('*').eq('is_active', true).order('name'),
    supabase.from('marketplace_listings').select('*').eq('id', id).single(),
    supabase.from('agents').select('*').eq('user_id', user?.id || '').single(),
    supabase.from('profiles').select('*').eq('id', user?.id || '').single(),
  ])

  if (!listing) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Marketplace Listing</h1>
        <p className="text-muted-foreground">Update media, price, and category specs.</p>
      </div>
      <MarketplaceForm
        cities={cities || []}
        listing={listing as MarketplaceListing}
        canManageMedia={hasCreatorAccess(agent, profile)}
        mediaAccessLabel={getCreatorAccessLabel(agent, profile)}
      />
    </div>
  )
}
