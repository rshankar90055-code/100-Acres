'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, Home, Plus, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { hasSupabaseEnv } from '@/lib/site-data'
import { useMarketplaceUnreadCount } from '@/lib/hooks/use-marketplace-unread-count'

export function MobileBottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [dashboardHref, setDashboardHref] = useState('/dashboard')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const { unreadCount } = useMarketplaceUnreadCount()

  useEffect(() => {
    if (!hasSupabaseEnv) {
      return
    }

    const supabase = createClient()

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setIsLoggedIn(Boolean(user))

      if (!user) {
        setDashboardHref('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'admin') {
        setDashboardHref('/admin')
      } else if (profile?.role === 'agent') {
        setDashboardHref('/agent/dashboard')
      } else {
        setDashboardHref('/dashboard')
      }

      const { data: notifications } = await supabase
        .from('notifications')
        .select('id, is_read')
        .order('created_at', { ascending: false })
        .limit(20)

      setNotificationCount(
        ((notifications as { is_read: boolean }[] | null) || []).filter((item) => !item.is_read).length,
      )
    }

    void loadUser()
  }, [])

  const totalNotifications = notificationCount + unreadCount
  const items = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/', label: 'Search', icon: Search, action: 'search' as const },
  ]

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/96 backdrop-blur md:hidden">
        <div className="mx-auto grid h-20 max-w-3xl grid-cols-5 items-center px-3">
          {items.slice(0, 2).map((item) => {
            const active = pathname === item.href && item.action !== 'search'

            if (item.action === 'search') {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    if (pathname === '/') {
                      window.dispatchEvent(new Event('open-home-search'))
                    } else {
                      router.push('/?openSearch=1')
                    }
                  }}
                  className="flex flex-col items-center gap-1 text-[11px] text-slate-500"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              )
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center gap-1 text-[11px] ${
                  active ? 'text-slate-950' : 'text-slate-500'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="flex h-16 w-16 -translate-y-5 items-center justify-center rounded-[24px] bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.32)]"
              aria-label="Create"
            >
              <Plus className="h-7 w-7" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (pathname === '/') {
                window.dispatchEvent(new Event('open-mobile-notifications'))
              } else {
                router.push('/?openNotifications=1')
              }
            }}
            className="relative flex flex-col items-center gap-1 text-[11px] text-slate-500"
          >
            <Bell className="h-5 w-5" />
            {totalNotifications > 0 ? (
              <span className="absolute right-5 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white">
                {totalNotifications}
              </span>
            ) : null}
            <span>Notifications</span>
          </button>

          <Link
            href={dashboardHref}
            className={`flex flex-col items-center gap-1 text-[11px] ${
              pathname.startsWith('/dashboard') || pathname.startsWith('/agent') || pathname.startsWith('/admin')
                ? 'text-slate-950'
                : 'text-slate-500'
            }`}
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </Link>
        </div>
      </nav>

      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent side="bottom" className="rounded-t-[30px] px-0 pb-0">
          <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-slate-200" />
          <SheetHeader className="px-5 pb-2 pt-4">
            <SheetTitle>Create</SheetTitle>
            <SheetDescription>Post content or publish a new listing fast.</SheetDescription>
          </SheetHeader>
          <div className="space-y-3 px-5 pb-6">
            <Link href={isLoggedIn ? '/reels' : '/auth/login'} onClick={() => setIsCreateOpen(false)}>
              <Button className="h-14 w-full justify-start rounded-2xl bg-slate-950 text-white">
                <Plus className="mr-3 h-5 w-5" />
                Create video reel
              </Button>
            </Link>
            <Link
              href={isLoggedIn ? '/agent/marketplace/new' : '/auth/login'}
              onClick={() => setIsCreateOpen(false)}
            >
              <Button variant="outline" className="h-14 w-full justify-start rounded-2xl">
                <Plus className="mr-3 h-5 w-5" />
                Upload marketplace listing
              </Button>
            </Link>
            <Link
              href={isLoggedIn ? '/agent/properties/new' : '/auth/login'}
              onClick={() => setIsCreateOpen(false)}
            >
              <Button variant="outline" className="h-14 w-full justify-start rounded-2xl">
                <Plus className="mr-3 h-5 w-5" />
                Add property listing
              </Button>
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
