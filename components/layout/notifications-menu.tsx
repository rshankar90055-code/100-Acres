'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Notification } from '@/lib/types'

export function NotificationsMenu() {
  const supabase = createClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const loadNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8)

      setNotifications((data as Notification[]) || [])
      setUnreadCount(((data as Notification[]) || []).filter((item) => !item.is_read).length)
    }

    void loadNotifications()
  }, [supabase])

  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === notificationId ? { ...item, is_read: true } : item)),
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))

    await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            notification.link ? (
              <DropdownMenuItem
                key={notification.id}
                className="items-start"
                onSelect={() => {
                  void markAsRead(notification.id)
                }}
                asChild
              >
                <Link href={notification.link} className="flex flex-col gap-1">
                  <span className="font-medium">{notification.title}</span>
                  {notification.body ? (
                    <span className="line-clamp-2 text-xs text-muted-foreground">{notification.body}</span>
                  ) : null}
                </Link>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                key={notification.id}
                className="items-start"
                onSelect={() => {
                  void markAsRead(notification.id)
                }}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{notification.title}</span>
                  {notification.body ? (
                    <span className="line-clamp-2 text-xs text-muted-foreground">{notification.body}</span>
                  ) : null}
                </div>
              </DropdownMenuItem>
            )
          ))
        ) : (
          <div className="px-2 py-4 text-sm text-muted-foreground">No notifications yet.</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
