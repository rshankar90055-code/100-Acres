'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface CityStatusToggleProps {
  cityId: string
  isActive: boolean
}

export function CityStatusToggle({ cityId, isActive }: CityStatusToggleProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [active, setActive] = useState(isActive)

  const handleToggle = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('cities')
        .update({ is_active: !active })
        .eq('id', cityId)

      if (error) throw error

      setActive(!active)
      toast.success(active ? 'City deactivated' : 'City activated')
      router.refresh()
    } catch (error) {
      console.error('Error updating city:', error)
      toast.error('Failed to update city')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Switch
            id={`city-${cityId}`}
            checked={active}
            onCheckedChange={handleToggle}
          />
          <Label htmlFor={`city-${cityId}`} className="text-sm">
            {active ? 'Active' : 'Inactive'}
          </Label>
        </>
      )}
    </div>
  )
}
