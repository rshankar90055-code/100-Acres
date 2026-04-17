import { createClient } from '@/lib/supabase/server'
import { PropertyForm } from '@/components/agent/property-form'

export default async function NewPropertyPage() {
  const supabase = await createClient()

  // Fetch cities for dropdown
  const { data: cities } = await supabase
    .from('cities')
    .select('*')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Add New Property</h1>
        <p className="text-muted-foreground">
          Fill in the details to list your property
        </p>
      </div>

      <PropertyForm cities={cities || []} />
    </div>
  )
}
