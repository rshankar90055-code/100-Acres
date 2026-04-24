'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'
import { toast } from 'sonner'

interface ThreadMessage {
  id: string
  message: string
  sender_role: 'buyer' | 'agent'
  created_at: string
}

interface ThreadProps {
  inquiryId: string
  endpoint: string
  title: string
  description: string
}

export function MarketplaceThread({
  inquiryId,
  endpoint,
  title,
  description,
}: ThreadProps) {
  const [messages, setMessages] = useState<ThreadMessage[]>([])
  const [draft, setDraft] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const loadMessages = async () => {
    const response = await fetch(`${endpoint}/${inquiryId}/messages`)
    if (!response.ok) return
    const payload = (await response.json()) as { messages?: ThreadMessage[] }
    setMessages(payload.messages || [])
  }

  useEffect(() => {
    void loadMessages()
  }, [inquiryId])

  const sendMessage = async () => {
    if (!draft.trim()) return
    setIsLoading(true)
    try {
      const response = await fetch(`${endpoint}/${inquiryId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: draft.trim() }),
      })
      const payload = (await response.json()) as { error?: string; message?: ThreadMessage }
      if (!response.ok || !payload.message) {
        throw new Error(payload.error || 'Could not send message.')
      }
      setMessages((prev) => [...prev, payload.message as ThreadMessage])
      setDraft('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not send message.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
          {messages.length ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  message.sender_role === 'agent'
                    ? 'ml-auto bg-primary text-primary-foreground'
                    : 'bg-background'
                }`}
              >
                <p>{message.message}</p>
                <p className={`mt-2 text-[11px] ${message.sender_role === 'agent' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {new Date(message.created_at).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No messages yet. Start the conversation below.</p>
          )}
        </div>
        <div className="flex gap-3">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
            placeholder="Write your message..."
          />
          <Button onClick={() => void sendMessage()} disabled={isLoading} className="self-end">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
