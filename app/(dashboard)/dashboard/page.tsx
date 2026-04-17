import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  Eye, 
  Phone, 
  Settings, 
  ArrowRight,
  Building2,
  UserPlus
} from 'lucide-react'

export default async function UserDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Redirect agents/admins to their respective dashboards
  if (profile?.role === 'agent') {
    redirect('/agent/dashboard')
  }
  if (profile?.role === 'admin') {
    redirect('/admin')
  }

  // Fetch saved properties count
  const { count: savedCount } = await supabase
    .from('saved_properties')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Fetch user's enquiries
  const { data: enquiries, count: enquiryCount } = await supabase
    .from('leads')
    .select(`
      *,
      property:properties(title, slug, images)
    `, { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch recent property views
  const { data: recentViews } = await supabase
    .from('property_views')
    .select(`
      *,
      property:properties(id, title, slug, images, price, listing_type)
    `)
    .eq('user_id', user.id)
    .order('viewed_at', { ascending: false })
    .limit(5)

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatPrice = (price: number): string => {
    if (price >= 10000000) {
      return `${(price / 10000000).toFixed(2)} Cr`
    } else if (price >= 100000) {
      return `${(price / 100000).toFixed(2)} L`
    }
    return price.toLocaleString()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
              {getInitials(profile?.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {profile?.full_name || 'User'}!
            </h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/settings">
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
          <Link href="/become-agent">
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Become an Agent
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{savedCount || 0}</p>
              <p className="text-sm text-muted-foreground">Saved Properties</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{enquiryCount || 0}</p>
              <p className="text-sm text-muted-foreground">Total Enquiries</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{recentViews?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Recently Viewed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Enquiries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Enquiries</CardTitle>
            <Link href="/dashboard/enquiries">
              <Button variant="ghost" size="sm" className="gap-1">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {enquiries && enquiries.length > 0 ? (
              <div className="space-y-4">
                {enquiries.map((enquiry) => (
                  <div
                    key={enquiry.id}
                    className="flex items-center gap-4 rounded-lg border border-border p-4"
                  >
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                      {enquiry.property?.images?.[0] ? (
                        <img
                          src={enquiry.property.images[0]}
                          alt={enquiry.property.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/properties/${enquiry.property?.slug}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {enquiry.property?.title || 'Property'}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {new Date(enquiry.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        enquiry.status === 'new'
                          ? 'default'
                          : enquiry.status === 'contacted'
                          ? 'secondary'
                          : enquiry.status === 'converted'
                          ? 'default'
                          : 'outline'
                      }
                    >
                      {enquiry.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Phone className="mx-auto mb-2 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">No enquiries yet</p>
                <Link href="/properties">
                  <Button variant="link">Browse properties</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Saved Properties Quick Access */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Saved Properties</CardTitle>
            <Link href="/saved">
              <Button variant="ghost" size="sm" className="gap-1">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {savedCount && savedCount > 0 ? (
              <div className="text-center py-8">
                <Heart className="mx-auto mb-4 h-12 w-12 text-red-500" />
                <p className="text-2xl font-bold text-foreground">{savedCount}</p>
                <p className="mb-4 text-muted-foreground">saved properties</p>
                <Link href="/saved">
                  <Button>View Saved Properties</Button>
                </Link>
              </div>
            ) : (
              <div className="py-8 text-center">
                <Heart className="mx-auto mb-2 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">No saved properties yet</p>
                <Link href="/properties">
                  <Button variant="link">Browse and save properties</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
