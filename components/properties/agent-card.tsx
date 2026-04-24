'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Phone, 
  MessageCircle, 
  Star, 
  BadgeCheck,
  Building2,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { AgentReviews } from '@/components/agents/agent-reviews'
import type { Agent } from '@/lib/types'

interface AgentCardProps {
  agent: Agent
  propertyId: string
  showReviews?: boolean
  showContactActions?: boolean
}

export function AgentCard({
  agent,
  propertyId,
  showReviews = false,
  showContactActions = true,
}: AgentCardProps) {
  const [reviewsExpanded, setReviewsExpanded] = useState(false)
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'A'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleWhatsApp = () => {
    if (agent.whatsapp_number) {
      const message = encodeURIComponent(
        `Hi, I'm interested in the property you listed. Property ID: ${propertyId}`
      )
      window.open(
        `https://wa.me/${agent.whatsapp_number}?text=${message}`,
        '_blank'
      )
    }
  }

  const handleCall = () => {
    if (agent.profile?.phone) {
      window.open(`tel:${agent.profile.phone}`, '_self')
    } else if (agent.whatsapp_number) {
      window.open(`tel:${agent.whatsapp_number}`, '_self')
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Listed By</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Agent Info */}
        <div className="mb-4 flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {getInitials(agent.profile?.full_name || agent.agency_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">
                {agent.profile?.full_name || agent.agency_name || 'Agent'}
              </h3>
              {agent.is_verified && (
                <BadgeCheck className="h-5 w-5 text-green-500" />
              )}
            </div>
            {agent.agency_name && agent.profile?.full_name && (
              <p className="text-sm text-muted-foreground">{agent.agency_name}</p>
            )}
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              {agent.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>{agent.rating.toFixed(1)}</span>
                  {agent.review_count > 0 && (
                    <span>({agent.review_count})</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Agent Stats */}
        <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>{agent.properties_sold}+ properties sold</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{agent.experience_years}+ years exp</span>
          </div>
        </div>

        {/* Subscription Badge */}
        {agent.subscription_tier !== 'free' && (
          <Badge 
            variant="outline" 
            className="mb-4 w-full justify-center border-amber-500 text-amber-600"
          >
            {agent.subscription_tier === 'premium' ? 'Premium Agent' : 'Verified Agent'}
          </Badge>
        )}

        {/* Contact Buttons */}
        {showContactActions ? (
          <div className="space-y-2">
            <Button 
              className="w-full gap-2" 
              size="lg"
              onClick={handleCall}
            >
              <Phone className="h-5 w-5" />
              Call Now
            </Button>
            {agent.whatsapp_number && (
              <Button 
                variant="outline" 
                className="w-full gap-2 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700" 
                size="lg"
                onClick={handleWhatsApp}
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Contact details unlock for creators on an active paid plan or free trial.
          </div>
        )}

        {/* Reviews Toggle */}
        {showReviews && (
          <div className="mt-4 border-t border-border pt-4">
            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={() => setReviewsExpanded(!reviewsExpanded)}
            >
              <span className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                View Reviews ({agent.review_count || 0})
              </span>
              {reviewsExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </CardContent>

      {/* Reviews Section */}
      {showReviews && reviewsExpanded && (
        <div className="border-t border-border">
          <AgentReviews agentId={agent.id} agentUserId={agent.user_id} />
        </div>
      )}
    </Card>
  )
}
