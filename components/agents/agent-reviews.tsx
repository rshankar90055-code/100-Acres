'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Star, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import type { AgentReview, Profile } from '@/lib/types'

interface AgentReviewsProps {
  agentId: string
  agentUserId: string
}

interface ReviewWithProfile extends AgentReview {
  profile?: Profile
}

export function AgentReviews({ agentId, agentUserId }: AgentReviewsProps) {
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [hasReviewed, setHasReviewed] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true)
      
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      // Fetch reviews
      const { data: reviewsData, error } = await supabase
        .from('agent_reviews')
        .select(`
          *,
          profile:profiles(id, full_name, avatar_url)
        `)
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })

      if (!error && reviewsData) {
        setReviews(reviewsData as ReviewWithProfile[])
        
        // Check if current user has already reviewed
        if (currentUser) {
          const userReview = reviewsData.find(r => r.user_id === currentUser.id)
          setHasReviewed(!!userReview)
        }
      }

      setLoading(false)
    }

    fetchReviews()
  }, [agentId, supabase])

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to leave a review')
      return
    }

    if (user.id === agentUserId) {
      toast.error('You cannot review yourself')
      return
    }

    if (!review.trim()) {
      toast.error('Please write a review')
      return
    }

    setSubmitting(true)
    
    try {
      const { data, error } = await supabase
        .from('agent_reviews')
        .insert({
          agent_id: agentId,
          user_id: user.id,
          rating,
          review: review.trim(),
          is_verified: false,
        })
        .select(`
          *,
          profile:profiles(id, full_name, avatar_url)
        `)
        .single()

      if (error) throw error

      // Update agent rating
      const avgRating = [...reviews, data].reduce((acc, r) => acc + r.rating, 0) / (reviews.length + 1)
      await supabase
        .from('agents')
        .update({ 
          rating: Math.round(avgRating * 10) / 10,
          review_count: reviews.length + 1
        })
        .eq('id', agentId)

      setReviews([data as ReviewWithProfile, ...reviews])
      setReview('')
      setRating(5)
      setShowForm(false)
      setHasReviewed(true)
      toast.success('Review submitted successfully!')
    } catch (error) {
      toast.error('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Reviews ({reviews.length})
        </CardTitle>
        {user && !hasReviewed && user.id !== agentUserId && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            Write a Review
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Review Form */}
        {showForm && (
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h4 className="mb-3 font-medium text-foreground">Your Review</h4>
            
            {/* Rating */}
            <div className="mb-4">
              <label className="mb-2 block text-sm text-muted-foreground">
                Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`h-8 w-8 ${
                        star <= rating 
                          ? 'fill-amber-400 text-amber-400' 
                          : 'text-muted-foreground/30'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Text */}
            <div className="mb-4">
              <label className="mb-2 block text-sm text-muted-foreground">
                Your Experience
              </label>
              <Textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience working with this agent..."
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSubmit} 
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="h-3 w-full rounded bg-muted" />
                    <div className="h-3 w-3/4 rounded bg-muted" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                <div className="mb-2 flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {getInitials(r.profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">
                          {r.profile?.full_name || 'Anonymous'}
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`h-4 w-4 ${
                                  star <= r.rating 
                                    ? 'fill-amber-400 text-amber-400' 
                                    : 'text-muted-foreground/30'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(r.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {r.review && (
                  <p className="ml-13 text-sm text-muted-foreground">
                    {r.review}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <MessageSquare className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">No reviews yet</p>
            <p className="text-sm text-muted-foreground/70">
              Be the first to review this agent
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
