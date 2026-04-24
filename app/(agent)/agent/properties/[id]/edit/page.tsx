import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PropertyForm } from '@/components/agent/property-form'
import { getCreatorAccessLabel, hasCreatorAccess } from '@/lib/access'

interface EditPropertyPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { data: agent } = await supabase
    .from('agents')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!agent) {
    notFound()
  }

  const [{ data: cities }, { data: property }, { data: profile }] = await Promise.all([
    supabase.from('cities').select('*').eq('is_active', true).order('name'),
    supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .eq('agent_id', agent.id)
      .single(),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
  ])

  if (!property) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Property</h1>
        <p className="text-muted-foreground">
          Update listing details, location, media, and availability.
        </p>
      </div>

      <PropertyForm
        cities={cities || []}
        property={property}
        canManageMedia={hasCreatorAccess(agent, profile)}
        mediaAccessLabel={getCreatorAccessLabel(agent, profile)}
      />
    </div>
  )
}
