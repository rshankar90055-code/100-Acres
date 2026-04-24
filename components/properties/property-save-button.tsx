'use client'

import { useEffect, useState } from 'react'
import { Loader2, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { hasSupabaseEnv } from '@/lib/site-data'

interface PropertySaveButtonProps {
  propertyId: string
  initialSaved?: boolean
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'icon'
  showLabel?: boolean
  className?: string
  onToggle?: (nextSaved: boolean) => void
}

export function PropertySaveButton({
  propertyId,
  initialSaved = false,
  variant = 'outline',
  size = 'sm',
  showLabel = true,
  className,
  onToggle,
}: PropertySaveButtonProps) {
  const supabase = hasSupabaseEnv ? createClient() : null
  const [isSaved, setIsSaved] = useState(initialSaved)
  const [isChecking, setIsChecking] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!supabase) {
      setIsChecking(false)
      return
    }

    const checkSavedStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setIsChecking(false)
        return
      }

      const { data } = await supabase
        .from('saved_properties')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', propertyId)
        .maybeSingle()

      setIsSaved(Boolean(data))
      setIsChecking(false)
    }

    void checkSavedStatus()
  }, [propertyId, supabase])

  const handleToggle = async (event?: React.MouseEvent) => {
    event?.preventDefault()
    event?.stopPropagation()

    if (!supabase) {
      toast.info('Save is available after project credentials are connected.')
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error('Please sign in to save properties.')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(
        isSaved ? `/api/saved?property_id=${propertyId}` : '/api/saved',
        {
          method: isSaved ? 'DELETE' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: isSaved ? undefined : JSON.stringify({ property_id: propertyId }),
        },
      )

      const payload = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(payload.error || 'Could not update saved properties.')
      }

      const nextSaved = !isSaved
      setIsSaved(nextSaved)
      onToggle?.(nextSaved)
      toast.success(nextSaved ? 'Property saved successfully.' : 'Property removed from saved.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update saved properties.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={(event) => void handleToggle(event)}
      disabled={isSaving || isChecking}
      className={className}
      aria-label={isSaved ? 'Remove property from saved' : 'Save property'}
      aria-pressed={isSaved}
    >
      {isSaving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={`h-4 w-4 ${isSaved ? 'fill-current text-rose-500' : ''}`} />
      )}
      {showLabel ? <span>{isSaved ? 'Saved' : 'Save'}</span> : null}
    </Button>
  )
}
