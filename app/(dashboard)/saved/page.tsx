import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PropertyCard } from '@/components/properties/property-card'
import { Button } from '@/components/ui/button'
import { Heart, Search } from 'lucide-react'

export default async function SavedPropertiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch saved properties with full property details
  const { data: savedProperties } = await supabase
    .from('saved_properties')
    .select(`
      id,
      created_at,
      property:properties(
        *,
        city:cities(*),
        agent:agents(*, profile:profiles(*))
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const properties = savedProperties
    ?.map((sp) => sp.property)
    .filter((p) => p !== null)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground">
          <Heart className="h-8 w-8 text-red-500" />
          Saved Properties
        </h1>
        <p className="text-muted-foreground">
          {properties?.length || 0} properties saved
        </p>
      </div>

      {/* Properties Grid */}
      {properties && properties.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.map((property) => (
            <PropertyCard 
              key={property.id} 
              property={property}
              showSaveButton={true}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Heart className="mb-4 h-16 w-16 text-muted-foreground/50" />
          <h3 className="mb-2 text-xl font-semibold text-foreground">
            No saved properties yet
          </h3>
          <p className="mb-6 max-w-md text-muted-foreground">
            Start browsing properties and click the heart icon to save your favorites. 
            They&apos;ll appear here for easy access.
          </p>
          <Link href="/properties">
            <Button className="gap-2">
              <Search className="h-4 w-4" />
              Browse Properties
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
