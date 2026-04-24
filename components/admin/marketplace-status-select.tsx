'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface MarketplaceStatusSelectProps {
  listingId: string
  currentStatus: 'available' | 'pending' | 'sold'
}

export function MarketplaceStatusSelect({
  listingId,
  currentStatus,
}: MarketplaceStatusSelectProps) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusChange = async (nextStatus: string) => {
    setStatus(nextStatus as typeof currentStatus)
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update({
          status: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', listingId)

      if (error) throw error

      toast.success('Marketplace listing status updated.')
      router.refresh()
    } catch (error) {
      console.error('Error updating marketplace listing status:', error)
      toast.error('Failed to update marketplace listing status.')
      setStatus(currentStatus)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Select value={status} onValueChange={(value) => void handleStatusChange(value)} disabled={isLoading}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="available">Available</SelectItem>
        <SelectItem value="sold">Sold</SelectItem>
      </SelectContent>
    </Select>
  )
}
