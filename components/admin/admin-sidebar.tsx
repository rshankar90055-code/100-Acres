'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  MapPin, 
  Settings,
  Shield,
  BarChart3
} from 'lucide-react'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/properties', icon: Building2, label: 'Properties' },
  { href: '/admin/agents', icon: Users, label: 'Agents' },
  { href: '/admin/cities', icon: MapPin, label: 'Cities' },
  { href: '/admin/users', icon: Shield, label: 'Users' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Card className="h-fit w-full lg:w-64">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Admin Panel</h2>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href))
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
      </CardContent>
    </Card>
  )
}
