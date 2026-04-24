import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ReelsFeed } from '@/components/reels/reels-feed'
import { createClient } from '@/lib/supabase/server'
import { getCreatorAccessLabel, hasCreatorAccess } from '@/lib/access'
import type { Agent, Property, Reel } from '@/lib/types'

export default async function ReelsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: profile }, { data: agent }, { data: reels }] = await Promise.all([
    user ? supabase.from('profiles').select('*').eq('id', user.id).single() : Promise.resolve({ data: null }),
    user ? supabase.from('agents').select('*, profile:profiles(*)').eq('user_id', user.id).single() : Promise.resolve({ data: null }),
    supabase
      .from('property_reels')
      .select('*, city:cities(*), agent:agents(*, profile:profiles(*))')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const { data: properties } =
    user && agent
      ? await supabase
          .from('properties')
          .select('*')
          .eq('agent_id', agent.id)
          .order('created_at', { ascending: false })
      : { data: [] }

  const canCreateReels = hasCreatorAccess(agent, profile)
  const accessLabel = canCreateReels
    ? 'Free creator access is live. You can publish videos now.'
    : `${getCreatorAccessLabel(agent, profile)}.`

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight">Video Marketplace</h1>
          <p className="mt-2 text-muted-foreground">
            Discover quick listing clips, local showcases, walkthroughs, and community buy-sell videos in one scrolling feed.
          </p>
        </div>
        <ReelsFeed
          initialReels={(reels || []) as Reel[]}
          agent={(agent || null) as Agent | null}
          properties={(properties || []) as Property[]}
          canCreateReels={canCreateReels}
          accessLabel={accessLabel}
        />
      </main>
      <Footer />
    </div>
  )
}
