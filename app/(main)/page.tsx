import { AppHomeHeader } from '@/components/home/app-home-header'
import { AppHomeSearchBar } from '@/components/home/app-home-search-bar'
import { AppHomeVideoFeed } from '@/components/home/app-home-video-feed'
import { createClient } from '@/lib/supabase/server'
import type { Notification, Reel } from '@/lib/types'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: profile }, { data: reels }, { data: notifications }] = await Promise.all([
    user ? supabase.from('profiles').select('role').eq('id', user.id).single() : Promise.resolve({ data: null }),
    supabase
      .from('property_reels')
      .select('*, city:cities(*), agent:agents(*, profile:profiles(*))')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20),
    user
      ? supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(8)
      : Promise.resolve({ data: [] }),
  ])

  const savedHref = user
    ? profile?.role === 'agent' || profile?.role === 'admin'
      ? '/saved?tab=marketplace'
      : '/saved'
    : '/auth/login'

  return (
    <main className="min-h-screen bg-[#f6f7f3]">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 pb-28 pt-4 md:px-6 md:pt-6">
        <AppHomeHeader
          savedHref={savedHref}
          notifications={((notifications || []) as Notification[])}
        />
        <AppHomeSearchBar />
        <AppHomeVideoFeed initialReels={(reels || []) as Reel[]} />
      </div>
    </main>
  )
}
