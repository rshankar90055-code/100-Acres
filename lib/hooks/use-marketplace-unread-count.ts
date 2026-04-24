'use client'

import { useEffect, useState } from 'react'

interface MarketplaceUnreadPayload {
  unreadCount: number
  route?: string
}

export function useMarketplaceUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [route, setRoute] = useState('/marketplace-inquiries')

  useEffect(() => {
    let cancelled = false

    const loadUnread = async () => {
      try {
        const response = await fetch('/api/marketplace/inquiries/unread', {
          cache: 'no-store',
        })

        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as MarketplaceUnreadPayload
        if (cancelled) return
        setUnreadCount(payload.unreadCount || 0)
        if (payload.route) {
          setRoute(payload.route)
        }
      } catch {
        if (!cancelled) {
          setUnreadCount(0)
        }
      }
    }

    void loadUnread()
    const intervalId = window.setInterval(() => {
      void loadUnread()
    }, 30000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [])

  return { unreadCount, route }
}
