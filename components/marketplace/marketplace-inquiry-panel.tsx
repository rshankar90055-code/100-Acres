'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { MessageCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface MarketplaceInquiryPanelProps {
  listingId: string
  title: string
}

export function MarketplaceInquiryPanel({
  listingId,
  title,
}: MarketplaceInquiryPanelProps) {
  const router = useRouter()
  const supabase = createClient()
  const [message, setMessage] = useState(`Hi, I am interested in "${title}". Is it still available?`)
  const [isLoading, setIsLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [existingInquiryId, setExistingInquiryId] = useState<string | null>(null)

  useEffect(() => {
    const loadState = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setCurrentUserId(user?.id || null)

      if (!user) return

      const response = await fetch(`/api/marketplace/inquiries?listing_id=${listingId}`)
      if (!response.ok) return
      const payload = (await response.json()) as { inquiries?: { id: string }[] }
      setExistingInquiryId(payload.inquiries?.[0]?.id || null)
    }

    void loadState()
  }, [listingId, supabase])

  const handleStartConversation = async () => {
    if (!currentUserId) {
      toast.error('Please sign in to send a marketplace message.')
      router.push('/auth/login')
      return
    }

    if (!message.trim()) {
      toast.error('Enter a message first.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/marketplace/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listing_id: listingId,
          message: message.trim(),
        }),
      })

      const payload = (await response.json()) as { error?: string; inquiry?: { id: string } }
      if (!response.ok || !payload.inquiry) {
        throw new Error(payload.error || 'Could not start marketplace conversation.')
      }

      toast.success('Conversation started.')
      router.push(`/marketplace-inquiries/${payload.inquiry.id}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not start marketplace conversation.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Chat With Seller
        </CardTitle>
        <CardDescription>
          Ask questions, negotiate, and keep your marketplace conversation inside the app.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {existingInquiryId ? (
          <Link href={`/marketplace-inquiries/${existingInquiryId}`}>
            <Button className="w-full">Open Existing Conversation</Button>
          </Link>
        ) : (
          <>
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              placeholder="Ask about price, condition, availability, pickup, or anything else."
            />
            <Button className="w-full" onClick={() => void handleStartConversation()} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                'Start Conversation'
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
