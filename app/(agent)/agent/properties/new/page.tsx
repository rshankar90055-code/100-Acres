import { createClient } from '@/lib/supabase/server'
import { PropertyForm } from '@/components/agent/property-form'
import { getCreatorAccessLabel, hasCreatorAccess } from '@/lib/access'

export default async function NewPropertyPage() {
  const supabase = await createClient()

  // Fetch cities for dropdown
  const { data: cities } = await supabase
    .from('cities')
    .select('*')
    .eq('is_active', true)
    .order('name')

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
        <h1 className="text-2xl font-bold text-foreground">Add New Property</h1>
        <p className="text-muted-foreground">
          Fill in the details to list your property
        </p>
      </div>

      <PropertyForm
        cities={cities || []}
        canManageMedia={hasCreatorAccess(agent, profile)}
        mediaAccessLabel={getCreatorAccessLabel(agent, profile)}
      />
    </div>
  )
}
