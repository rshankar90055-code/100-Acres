'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Plus, 
  Settings,
  BadgeCheck,
  Star,
  Store,
  MessageCircle
} from 'lucide-react'
import type { Agent } from '@/lib/types'

interface AgentSidebarProps {
  agent: Agent
}

const navItems = [
  { href: '/agent/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/agent/properties', icon: Building2, label: 'My Properties' },
  { href: '/agent/properties/new', icon: Plus, label: 'Add Property' },
  { href: '/agent/marketplace', icon: Store, label: 'Marketplace' },
  { href: '/agent/marketplace/new', icon: Plus, label: 'Add Listing' },
  { href: '/agent/marketplace/inquiries', icon: MessageCircle, label: 'Market Chats' },
  { href: '/agent/leads', icon: Users, label: 'Leads' },
  { href: '/agent/settings', icon: Settings, label: 'Settings' },
]

export function AgentSidebar({ agent }: AgentSidebarProps) {
  const pathname = usePathname()

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'A'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <Card className="h-fit w-full lg:w-64">
      <CardContent className="p-6">
        {/* Agent Profile */}
        <div className="mb-6 text-center">
          <Avatar className="mx-auto mb-4 h-20 w-20">
            <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
              {getInitials(agent.agency_name)}
            </AvatarFallback>
          </Avatar>
          <h2 className="flex items-center justify-center gap-2 font-semibold text-foreground">
            {agent.agency_name || 'Agent'}
            {agent.is_verified && (
              <BadgeCheck className="h-5 w-5 text-green-500" />
            )}
          </h2>
          {agent.rating > 0 && (
            <div className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {agent.rating.toFixed(1)}
            </div>
          )}
          <Badge 
            variant="outline" 
            className="mt-2 border-primary/50 text-primary"
          >
            {agent.subscription_tier === 'premium' 
              ? 'Premium' 
              : agent.subscription_tier === 'basic' 
              ? 'Basic' 
              : 'Free'}
          </Badge>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {agent.properties_sold}
            </p>
            <p className="text-xs text-muted-foreground">Properties Sold</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {agent.experience_years}
            </p>
            <p className="text-xs text-muted-foreground">Years Exp</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
