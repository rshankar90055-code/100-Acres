'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Phone, MessageCircle, Calendar, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface LeadFormProps {
  propertyId: string
  agentId: string
  propertyTitle: string
}

type LeadType = 'callback' | 'whatsapp' | 'visit'

export function LeadForm({ propertyId, agentId, propertyTitle }: LeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    leadType: 'callback' as LeadType,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const supabase = createClient()

    try {
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase.from('leads').insert({
        property_id: propertyId,
        agent_id: agentId,
        user_id: user?.id || null,
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        message: formData.message || `Interested in: ${propertyTitle}`,
        lead_type: formData.leadType,
        status: 'new',
      })

      if (error) throw error

      setIsSubmitted(true)
      toast.success('Your enquiry has been submitted! The agent will contact you soon.')
    } catch (error) {
      console.error('Error submitting lead:', error)
      toast.error('Failed to submit enquiry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            Enquiry Submitted!
          </h3>
          <p className="text-sm text-muted-foreground">
            The agent will contact you within 30 minutes during business hours.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Get in Touch</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Lead Type */}
          <div>
            <Label className="mb-3 block text-sm font-medium">I want to:</Label>
            <RadioGroup
              value={formData.leadType}
              onValueChange={(value) => 
                setFormData({ ...formData, leadType: value as LeadType })
              }
              className="grid grid-cols-3 gap-2"
            >
              <Label
                htmlFor="callback"
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-3 text-center text-xs transition-colors ${
                  formData.leadType === 'callback'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="callback" id="callback" className="sr-only" />
                <Phone className="h-5 w-5" />
                <span>Get a Call</span>
              </Label>
              <Label
                htmlFor="whatsapp"
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-3 text-center text-xs transition-colors ${
                  formData.leadType === 'whatsapp'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="whatsapp" id="whatsapp" className="sr-only" />
                <MessageCircle className="h-5 w-5" />
                <span>WhatsApp</span>
              </Label>
              <Label
                htmlFor="visit"
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-3 text-center text-xs transition-colors ${
                  formData.leadType === 'visit'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="visit" id="visit" className="sr-only" />
                <Calendar className="h-5 w-5" />
                <span>Site Visit</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              className="mt-1.5"
            />
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="mt-1.5"
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
              className="mt-1.5"
            />
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Any specific questions or preferred time to contact?"
              className="mt-1.5"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Enquiry'
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            By submitting, you agree to be contacted by the property agent.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
