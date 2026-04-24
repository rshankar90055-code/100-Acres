'use client'

import { useEffect, useMemo, useState } from 'react'
import { Heart, MessageCircle, PlaySquare, Send, Share2, Upload, Video, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import {
  buildStoragePath,
  formatFileSize,
  REEL_VIDEOS_BUCKET,
  uploadFileWithProgress,
} from '@/lib/media'
import { shareContent } from '@/lib/share'
import { toast } from 'sonner'
import type { Agent, Property, Reel } from '@/lib/types'

interface ReelComment {
  id: string
  comment: string
  created_at: string
  profile?: {
    full_name: string | null
  } | null
}

interface ReelsFeedProps {
  initialReels: Reel[]
  agent: Agent | null
  properties: Property[]
  canCreateReels: boolean
  accessLabel: string
}

export function ReelsFeed({
  initialReels,
  agent,
  properties,
  canCreateReels,
  accessLabel,
}: ReelsFeedProps) {
  const supabase = createClient()
  const [reels, setReels] = useState<Reel[]>(initialReels)
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const [caption, setCaption] = useState('')
  const [title, setTitle] = useState('')
  const [pendingVideo, setPendingVideo] = useState<{ file: File; previewUrl: string } | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})
  const [commentsByReel, setCommentsByReel] = useState<Record<string, ReelComment[]>>({})
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({})
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({})
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const propertyMap = useMemo(
    () => new Map(properties.map((property) => [property.id, property])),
    [properties],
  )

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }

    void loadUser()
  }, [supabase])

  const handleVideoPick = (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith('video/')) {
      toast.error('Please choose a video file.')
      return
    }
    if (pendingVideo) {
      URL.revokeObjectURL(pendingVideo.previewUrl)
    }
    setPendingVideo({
      file,
      previewUrl: URL.createObjectURL(file),
    })
    setUploadProgress(0)
  }

  const publishReel = async () => {
    if (!agent) {
      toast.error('Become an agent before posting reels.')
      return
    }
    if (!canCreateReels) {
      toast.error(accessLabel)
      return
    }
    if (!pendingVideo) {
      toast.error('Choose a reel video first.')
      return
    }

    setIsUploading(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }

      const storagePath = buildStoragePath(agent.user_id, pendingVideo.file, 'reels')
      await uploadFileWithProgress(
        pendingVideo.file,
        REEL_VIDEOS_BUCKET,
        storagePath,
        session.access_token,
        setUploadProgress,
      )

      const { data: publicUrl } = supabase.storage.from(REEL_VIDEOS_BUCKET).getPublicUrl(storagePath)
      const selectedProperty = propertyMap.get(selectedPropertyId)

      const { data: createdReel, error } = await supabase
        .from('property_reels')
        .insert({
          agent_id: agent.id,
          property_id: selectedProperty?.id || null,
          city_id: selectedProperty?.city_id || agent.city_id || null,
          locality: selectedProperty?.locality || null,
          title: title || selectedProperty?.title || null,
          caption: caption || null,
          video_url: publicUrl.publicUrl,
          contact_phone: agent.profile?.phone || null,
          contact_whatsapp: agent.whatsapp_number || null,
        })
        .select('*, city:cities(*), agent:agents(*, profile:profiles(*))')
        .single()

      if (error) throw error

      setReels((prev) => [createdReel as Reel, ...prev])
      setTitle('')
      setCaption('')
      setSelectedPropertyId('')
      URL.revokeObjectURL(pendingVideo.previewUrl)
      setPendingVideo(null)
      toast.success('Reel posted successfully.')
    } catch (error) {
      console.error('Error publishing reel:', error)
      toast.error('Could not publish reel.')
    } finally {
      setIsUploading(false)
    }
  }

  const toggleLike = async (reel: Reel) => {
    if (!currentUserId) {
      toast.error('Please sign in to like videos.')
      return
    }

    const isLiked = likedReels[reel.id]
    setLikedReels((prev) => ({ ...prev, [reel.id]: !isLiked }))
    setReels((prev) =>
      prev.map((item) =>
        item.id === reel.id
          ? { ...item, like_count: item.like_count + (isLiked ? -1 : 1) }
          : item,
      ),
    )

    const operation = isLiked
      ? supabase.from('reel_likes').delete().eq('reel_id', reel.id).eq('user_id', currentUserId)
      : supabase.from('reel_likes').insert({ reel_id: reel.id, user_id: currentUserId })

    const { error } = await operation

    if (error) {
      setLikedReels((prev) => ({ ...prev, [reel.id]: isLiked }))
      setReels((prev) =>
        prev.map((item) =>
          item.id === reel.id
            ? { ...item, like_count: item.like_count + (isLiked ? 1 : -1) }
            : item,
        ),
      )
      toast.error('Could not update like.')
    }
  }

  const loadComments = async (reelId: string) => {
    const { data } = await supabase
      .from('reel_comments')
      .select('*, profile:profiles(full_name)')
      .eq('reel_id', reelId)
      .order('created_at', { ascending: false })

    setCommentsByReel((prev) => ({ ...prev, [reelId]: (data as ReelComment[]) || [] }))
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
      .insert({
        reel_id: reelId,
        user_id: currentUserId,
        comment: draft,
      })
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
        item.id === reelId
          ? { ...item, comment_count: item.comment_count + 1 }
          : item,
      ),
    )
  }

  const shareReel = async (reel: Reel) => {
    try {
      const shareUrl = `${window.location.origin}/reels#${reel.id}`
      const result = await shareContent({
        title: reel.title || 'Marketplace Video',
        text: reel.caption || 'Check out this listing video on 100acres',
        url: shareUrl,
      })

      if (result === 'cancelled') {
        return
      }

      if (result === 'copied') {
        toast.success('Video link copied.')
      }

      await supabase
        .from('property_reels')
        .update({ share_count: reel.share_count + 1 })
        .eq('id', reel.id)
      setReels((prev) =>
        prev.map((item) =>
          item.id === reel.id ? { ...item, share_count: item.share_count + 1 } : item,
        ),
      )
    } catch {
      toast.error('Could not share this video.')
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlaySquare className="h-5 w-5" />
            Property Reels
          </CardTitle>
          <CardDescription>
            Short-form marketplace videos for discovery, local buzz, and fast buyer-seller conversations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="reel-title">Reel Title</Label>
              <Input id="reel-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Luxury apartment walkthrough" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="reel-property">Property Link</Label>
              <select
                id="reel-property"
                className="mt-1.5 flex h-10 w-full rounded-md border bg-transparent px-3 text-sm"
                value={selectedPropertyId}
                onChange={(event) => setSelectedPropertyId(event.target.value)}
              >
                <option value="">Optional property reference</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="reel-caption">Caption</Label>
            <Textarea
              id="reel-caption"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              className="mt-1.5"
              placeholder="Tell people what you are selling, showcasing, or promoting."
            />
          </div>
          <div className="rounded-xl border border-dashed p-4">
            <Label htmlFor="reel-video" className="flex cursor-pointer flex-col items-center gap-2 text-center">
              <Video className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">Upload reel video</p>
                <p className="text-sm text-muted-foreground">{accessLabel}</p>
              </div>
            </Label>
            <Input
              id="reel-video"
              type="file"
              accept="video/*"
              className="mt-4"
              disabled={!canCreateReels}
              onChange={(event) => {
                handleVideoPick(event.target.files?.[0] || null)
                event.target.value = ''
              }}
            />
          </div>
          {pendingVideo ? (
            <div className="space-y-2 rounded-lg border p-3">
              <video src={pendingVideo.previewUrl} controls className="max-h-96 w-full rounded-lg bg-black" />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{pendingVideo.file.name}</span>
                <span>{isUploading ? `${uploadProgress}%` : formatFileSize(pendingVideo.file.size)}</span>
              </div>
              {isUploading ? <Progress value={uploadProgress} /> : null}
              <div className="flex gap-2">
                <Button onClick={publishReel} disabled={isUploading || !canCreateReels}>
                  {isUploading ? <Upload className="mr-2 h-4 w-4" /> : null}
                  Publish Reel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    URL.revokeObjectURL(pendingVideo.previewUrl)
                    setPendingVideo(null)
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {reels.map((reel) => (
          <Card key={reel.id} id={reel.id} className="overflow-hidden">
            <CardContent className="space-y-4 p-4">
              <video src={reel.video_url} controls className="aspect-[9/16] w-full rounded-xl bg-black object-cover" />
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{reel.title || reel.agent?.agency_name || 'Property Reel'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {reel.locality}
                      {reel.city?.name ? `, ${reel.city.name}` : ''}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(reel.created_at).toLocaleDateString()}</p>
                </div>
                {reel.caption ? <p className="text-sm text-muted-foreground">{reel.caption}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => void toggleLike(reel)}>
                  <Heart className="mr-2 h-4 w-4" />
                  {reel.like_count}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const nextValue = !expandedComments[reel.id]
                    setExpandedComments((prev) => ({ ...prev, [reel.id]: nextValue }))
                    if (nextValue && !commentsByReel[reel.id]) {
                      void loadComments(reel.id)
                    }
                  }}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {reel.comment_count}
                </Button>
                <Button variant="outline" size="sm" onClick={() => void shareReel(reel)}>
                  <Share2 className="mr-2 h-4 w-4" />
                  {reel.share_count}
                </Button>
              </div>
              {(reel.contact_phone || reel.contact_whatsapp) ? (
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <p className="font-medium">Contact</p>
                  {reel.contact_phone ? <p>{reel.contact_phone}</p> : null}
                  {reel.contact_whatsapp ? <p>WhatsApp: {reel.contact_whatsapp}</p> : null}
                </div>
              ) : null}
              {expandedComments[reel.id] ? (
                <div className="space-y-3 border-t pt-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a comment"
                      value={commentDrafts[reel.id] || ''}
                      onChange={(event) =>
                        setCommentDrafts((prev) => ({ ...prev, [reel.id]: event.target.value }))
                      }
                    />
                    <Button size="icon" onClick={() => void addComment(reel.id)}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(commentsByReel[reel.id] || []).map((comment) => (
                      <div key={comment.id} className="rounded-lg border p-3">
                        <p className="text-sm font-medium">{comment.profile?.full_name || 'User'}</p>
                        <p className="text-sm text-muted-foreground">{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
