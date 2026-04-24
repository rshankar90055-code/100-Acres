'use client'

import { useEffect, useRef, useState } from 'react'
import { Heart, MessageCircle, RefreshCcw, Share2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { shareContent } from '@/lib/share'
import { toast } from 'sonner'
import type { Reel } from '@/lib/types'

interface ReelComment {
  id: string
  comment: string
  created_at: string
  profile?: {
    full_name: string | null
  } | null
}

interface AppHomeVideoFeedProps {
  initialReels: Reel[]
}

export function AppHomeVideoFeed({ initialReels }: AppHomeVideoFeedProps) {
  const supabase = createClient()
  const [reels, setReels] = useState(initialReels)
  const [activeReelId, setActiveReelId] = useState(initialReels[0]?.id ?? null)
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({})
  const [repostedReels, setRepostedReels] = useState<Record<string, boolean>>({})
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})
  const [commentsByReel, setCommentsByReel] = useState<Record<string, ReelComment[]>>({})
  const [commentsOpenFor, setCommentsOpenFor] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }

    void loadUser()
  }, [supabase])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement
          const reelId = video.dataset.reelId

          if (!reelId) return

          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            setActiveReelId(reelId)
            void video.play().catch(() => undefined)
          } else {
            video.pause()
          }
        })
      },
      { threshold: [0.35, 0.6, 0.8] },
    )

    Object.values(videoRefs.current).forEach((video) => {
      if (video) observer.observe(video)
    })

    return () => observer.disconnect()
  }, [reels])

  const loadComments = async (reelId: string) => {
    const { data } = await supabase
      .from('reel_comments')
      .select('*, profile:profiles(full_name)')
      .eq('reel_id', reelId)
      .order('created_at', { ascending: false })

    setCommentsByReel((prev) => ({ ...prev, [reelId]: (data as ReelComment[]) || [] }))
  }

  const toggleLike = async (reel: Reel) => {
    if (!currentUserId) {
      toast.error('Please sign in to like videos.')
      return
    }

    const alreadyLiked = likedReels[reel.id]
    setLikedReels((prev) => ({ ...prev, [reel.id]: !alreadyLiked }))
    setReels((prev) =>
      prev.map((item) =>
        item.id === reel.id
          ? { ...item, like_count: item.like_count + (alreadyLiked ? -1 : 1) }
          : item,
      ),
    )

    const operation = alreadyLiked
      ? supabase.from('reel_likes').delete().eq('reel_id', reel.id).eq('user_id', currentUserId)
      : supabase.from('reel_likes').insert({ reel_id: reel.id, user_id: currentUserId })

    const { error } = await operation

    if (error) {
      setLikedReels((prev) => ({ ...prev, [reel.id]: alreadyLiked }))
      setReels((prev) =>
        prev.map((item) =>
          item.id === reel.id
            ? { ...item, like_count: item.like_count + (alreadyLiked ? 1 : -1) }
            : item,
        ),
      )
      toast.error('Could not update like.')
    }
  }

  const addComment = async (reelId: string) => {
    const draft = commentDrafts[reelId]?.trim()
    if (!draft) return
    if (!currentUserId) {
      toast.error('Please sign in to comment.')
      return
    }

    const { data, error } = await supabase
      .from('reel_comments')
      .insert({ reel_id: reelId, user_id: currentUserId, comment: draft })
      .select('*, profile:profiles(full_name)')
      .single()

    if (error) {
      toast.error('Could not post comment.')
      return
    }

    setCommentDrafts((prev) => ({ ...prev, [reelId]: '' }))
    setCommentsByReel((prev) => ({
      ...prev,
      [reelId]: [data as ReelComment, ...(prev[reelId] || [])],
    }))
    setReels((prev) =>
      prev.map((item) =>
        item.id === reelId ? { ...item, comment_count: item.comment_count + 1 } : item,
      ),
    )
  }

  const handleRepost = async (reel: Reel) => {
    if (!currentUserId) {
      toast.error('Please sign in to repost.')
      return
    }

    const nextValue = !repostedReels[reel.id]
    setRepostedReels((prev) => ({ ...prev, [reel.id]: nextValue }))
    toast.success(nextValue ? 'Reposted to your activity.' : 'Removed repost.')
  }

  const handleShare = async (reel: Reel) => {
    const result = await shareContent({
      title: reel.title || 'Marketplace video',
      text: reel.caption || 'Check out this video on 100acres.',
      url: `${window.location.origin}/reels#${reel.id}`,
    })

    if (result === 'copied') {
      toast.success('Video link copied.')
    }
  }

  return (
    <>
      <div className="flex-1 space-y-4">
        {reels.map((reel) => (
          <article
            key={reel.id}
            className="relative overflow-hidden rounded-[32px] bg-slate-950 shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
          >
            <video
              ref={(node) => {
                videoRefs.current[reel.id] = node
              }}
              data-reel-id={reel.id}
              src={reel.video_url}
              muted
              loop
              playsInline
              controls={activeReelId === reel.id}
              className="aspect-[9/15] w-full object-cover"
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-black/75" />

            <div className="absolute inset-0 flex items-end justify-between p-4">
              <div className="max-w-[75%] text-white">
                <p className="text-sm font-semibold">
                  @{reel.agent?.agency_name?.replace(/\s+/g, '').toLowerCase() || 'seller'}
                </p>
                <h2 className="mt-1 text-lg font-semibold leading-tight">
                  {reel.title || reel.agent?.agency_name || 'Marketplace video'}
                </h2>
                {reel.caption ? (
                  <p className="mt-2 line-clamp-3 text-sm text-white/82">{reel.caption}</p>
                ) : null}
              </div>

              <div className="pointer-events-auto flex flex-col items-center gap-4 pb-2 text-white">
                <button
                  type="button"
                  onClick={() => void toggleLike(reel)}
                  className="flex flex-col items-center gap-1"
                >
                  <span className={`flex h-12 w-12 items-center justify-center rounded-full backdrop-blur ${
                    likedReels[reel.id] ? 'bg-rose-500 text-white' : 'bg-white/14'
                  }`}>
                    <Heart className={`h-5 w-5 ${likedReels[reel.id] ? 'fill-current' : ''}`} />
                  </span>
                  <span className="text-[11px] font-medium">{reel.like_count}</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setCommentsOpenFor(reel.id)
                    if (!commentsByReel[reel.id]) {
                      await loadComments(reel.id)
                    }
                  }}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/14 backdrop-blur">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <span className="text-[11px] font-medium">{reel.comment_count}</span>
                </button>

                <button
                  type="button"
                  onClick={() => void handleRepost(reel)}
                  className="flex flex-col items-center gap-1"
                >
                  <span className={`flex h-12 w-12 items-center justify-center rounded-full backdrop-blur ${
                    repostedReels[reel.id] ? 'bg-emerald-500 text-white' : 'bg-white/14'
                  }`}>
                    <RefreshCcw className="h-5 w-5" />
                  </span>
                  <span className="text-[11px] font-medium">Repost</span>
                </button>

                <button
                  type="button"
                  onClick={() => void handleShare(reel)}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/14 backdrop-blur">
                    <Share2 className="h-5 w-5" />
                  </span>
                  <span className="text-[11px] font-medium">{reel.share_count}</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Sheet
        open={Boolean(commentsOpenFor)}
        onOpenChange={(open) => {
          if (!open) setCommentsOpenFor(null)
        }}
      >
        <SheetContent side="bottom" className="rounded-t-[30px] px-0 pb-0">
          <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-slate-200" />
          <SheetHeader className="px-5 pb-2 pt-4">
            <SheetTitle>Comments</SheetTitle>
            <SheetDescription>Jump into the conversation instantly.</SheetDescription>
          </SheetHeader>
          <div className="max-h-[60vh] overflow-y-auto px-5 pb-4">
            <div className="space-y-3">
              {(commentsByReel[commentsOpenFor || ''] || []).map((comment) => (
                <div key={comment.id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">
                    {comment.profile?.full_name || 'User'}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{comment.comment}</p>
                </div>
              ))}
              {!commentsByReel[commentsOpenFor || '']?.length ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                  No comments yet.
                </div>
              ) : null}
            </div>
          </div>
          {commentsOpenFor ? (
            <SheetFooter className="border-t border-slate-200 bg-white px-5 pb-5 pt-4">
              <div className="flex gap-3">
                <Input
                  value={commentDrafts[commentsOpenFor] || ''}
                  onChange={(event) =>
                    setCommentDrafts((prev) => ({
                      ...prev,
                      [commentsOpenFor]: event.target.value,
                    }))
                  }
                  placeholder="Add a comment"
                  className="h-12 rounded-2xl"
                />
                <Button
                  type="button"
                  className="h-12 rounded-2xl px-5"
                  onClick={() => void addComment(commentsOpenFor)}
                >
                  Post
                </Button>
              </div>
            </SheetFooter>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  )
}
