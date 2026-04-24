import { createClient } from '@/lib/supabase/server'
import { MarketplaceForm } from '@/components/marketplace/marketplace-form'
import { getCreatorAccessLabel, hasCreatorAccess } from '@/lib/access'

export default async function NewMarketplacePage() {
  const supabase = await createClient()
  const { data: cities } = await supabase.from('cities').select('*').eq('is_active', true).order('name')
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const [{ data: agent }, { data: profile }] = await Promise.all([
    supabase.from('agents').select('*').eq('user_id', user?.id || '').single(),
    supabase.from('profiles').select('*').eq('id', user?.id || '').single(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Marketplace Listing</h1>
        <p className="text-muted-foreground">List a car, bike, electronic device, or appliance for your local buyers.</p>
      </div>
      <MarketplaceForm
        cities={cities || []}
        canManageMedia={hasCreatorAccess(agent, profile)}
        mediaAccessLabel={getCreatorAccessLabel(agent, profile)}
      />
    </div>
  )
}
