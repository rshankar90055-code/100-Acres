'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, Heart, Home } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { Notification } from '@/lib/types'

interface AppHomeHeaderProps {
  savedHref: string
  notifications: Notification[]
}

export function AppHomeHeader({ savedHref, notifications }: AppHomeHeaderProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const unreadNotificationCount = notifications.filter((item) => !item.is_read).length

  return (
    <>
      <header className="mb-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0f172a] text-white shadow-[0_14px_40px_rgba(15,23,42,0.22)]">
            <Home className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-950">100acres</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={savedHref}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm"
          >
            <Heart className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(true)}
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm"
          >
            <Bell className="h-4 w-4" />
            {unreadNotificationCount > 0 ? (
              <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white">
                {unreadNotificationCount}
              </span>
            ) : null}
          </button>
        </div>
      </header>

      <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <SheetContent side="bottom" className="rounded-t-[30px] px-0 pb-0">
          <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-slate-200" />
          <SheetHeader className="px-5 pb-2 pt-4">
            <SheetTitle>Notifications</SheetTitle>
            <SheetDescription>Everything new, without leaving the feed.</SheetDescription>
          </SheetHeader>
          <div className="max-h-[65vh] overflow-y-auto px-5 pb-5">
            <div className="space-y-3">
              {notifications.length ? (
                notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={notification.link || '#'}
                    onClick={() => setIsNotificationsOpen(false)}
                    className="block rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                        {notification.body ? (
                          <p className="mt-1 text-sm text-slate-500">{notification.body}</p>
                        ) : null}
                      </div>
                      {!notification.is_read ? (
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      ) : null}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                  No notifications yet.
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
