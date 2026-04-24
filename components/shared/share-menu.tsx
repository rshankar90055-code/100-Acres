'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { copyText, shareContent } from '@/lib/share'
import { Mail, MessageCircle, Send, Share2, Link2, Facebook } from 'lucide-react'
import { toast } from 'sonner'

interface ShareMenuProps {
  title: string
  text: string
  url: string
  buttonLabel?: string
  buttonVariant?: 'default' | 'outline' | 'ghost'
  buttonSize?: 'default' | 'sm' | 'icon'
}

export function ShareMenu({
  title,
  text,
  url,
  buttonLabel = 'Share',
  buttonVariant = 'outline',
  buttonSize = 'sm',
}: ShareMenuProps) {
  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(`${text} ${url}`)

  const handleNativeShare = async () => {
    try {
      const result = await shareContent({ title, text, url })
      if (result === 'copied') {
        toast.success('Link copied to clipboard.')
      }
    } catch {
      toast.error('Could not share this link.')
    }
  }

  const openShareWindow = (target: string) => {
    window.open(target, '_blank', 'noopener,noreferrer')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className="gap-2">
          <Share2 className="h-4 w-4" />
          {buttonSize !== 'icon' ? buttonLabel : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => void handleNativeShare()}>
          <Share2 className="h-4 w-4" />
          Quick Share
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openShareWindow(`https://wa.me/?text=${encodedText}`)}>
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openShareWindow(`https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(text)}`)}>
          <Send className="h-4 w-4" />
          Telegram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)}>
          <Facebook className="h-4 w-4" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openShareWindow(`mailto:?subject=${encodeURIComponent(title)}&body=${encodedText}`)}>
          <Mail className="h-4 w-4" />
          Email
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={async () => {
            await copyText(url)
            toast.success('Link copied to clipboard.')
          }}
        >
          <Link2 className="h-4 w-4" />
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
