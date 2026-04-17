'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, UserPlus, BadgeCheck, Building2, TrendingUp, Users } from 'lucide-react'
import type { City } from '@/lib/types'

const benefits = [
  {
    icon: BadgeCheck,
    title: 'Verified Badge',
    description: 'Get a verified agent badge to build trust with clients',
  },
  {
    icon: Building2,
    title: 'List Properties',
    description: 'List unlimited properties and reach thousands of buyers',
  },
  {
    icon: TrendingUp,
    title: 'Grow Your Business',
    description: 'Access leads and grow your real estate business',
  },
  {
    icon: Users,
    title: 'Join the Network',
    description: 'Become part of Karnataka\'s trusted agent network',
  },
]

export default function BecomeAgentPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cities, setCities] = useState<City[]>([])
  const [formData, setFormData] = useState({
    agency_name: '',
    license_number: '',
    experience_years: '',
    city_id: '',
    whatsapp_number: '',
    bio: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check if already an agent
      const { data: agent } = await supabase
        .from('agents')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (agent) {
        router.push('/agent/dashboard')
        return
      }

      // Fetch cities
      const { data: citiesData } = await supabase
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (citiesData) {
        setCities(citiesData)
      }

      setIsLoading(false)
    }

    fetchData()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create agent record
      const { error: agentError } = await supabase.from('agents').insert({
        user_id: user.id,
        city_id: formData.city_id || null,
        agency_name: formData.agency_name || null,
        license_number: formData.license_number || null,
        experience_years: parseInt(formData.experience_years) || 0,
        whatsapp_number: formData.whatsapp_number || null,
        bio: formData.bio || null,
        is_verified: false,
        is_active: true,
        rating: 0,
        review_count: 0,
        properties_sold: 0,
        subscription_tier: 'free',
      })

      if (agentError) throw agentError

      // Update profile role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'agent' })
        .eq('id', user.id)

      if (profileError) throw profileError

      toast.success('Application submitted! Your account is pending verification.')
      router.push('/agent/dashboard')
    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error('Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <UserPlus className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Become a 100acres Agent
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Join Karnataka&apos;s fastest-growing real estate network. 
          List properties, connect with buyers, and grow your business.
        </p>
      </div>

      {/* Benefits */}
      <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit, index) => (
          <Card key={index}>
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <benefit.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Application Form */}
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Agent Application</CardTitle>
          <CardDescription>
            Fill in your details to apply as a real estate agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="agency_name">Agency/Business Name</Label>
                <Input
                  id="agency_name"
                  value={formData.agency_name}
                  onChange={(e) =>
                    setFormData({ ...formData, agency_name: e.target.value })
                  }
                  placeholder="Your agency name"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="license_number">License Number (Optional)</Label>
                <Input
                  id="license_number"
                  value={formData.license_number}
                  onChange={(e) =>
                    setFormData({ ...formData, license_number: e.target.value })
                  }
                  placeholder="RERA number if available"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="city_id">Primary City *</Label>
                <Select
                  value={formData.city_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, city_id: value })
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="experience_years">Years of Experience *</Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  required
                  value={formData.experience_years}
                  onChange={(e) =>
                    setFormData({ ...formData, experience_years: e.target.value })
                  }
                  placeholder="e.g., 5"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="whatsapp_number">WhatsApp Number *</Label>
              <Input
                id="whatsapp_number"
                type="tel"
                required
                value={formData.whatsapp_number}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp_number: e.target.value })
                }
                placeholder="+91 98765 43210"
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Clients will contact you on this number
              </p>
            </div>

            <div>
              <Label htmlFor="bio">About You</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Tell us about your experience and expertise..."
                className="mt-1.5"
                rows={4}
              />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              By applying, you agree to our terms and conditions
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
