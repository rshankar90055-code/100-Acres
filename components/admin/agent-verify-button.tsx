'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BadgeCheck, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface AgentVerifyButtonProps {
  agentId: string
  isVerified: boolean
}

export function AgentVerifyButton({ agentId, isVerified }: AgentVerifyButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleVerification = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('agents')
        .update({ 
          is_verified: !isVerified,
          updated_at: new Date().toISOString()
        })
        .eq('id', agentId)

      if (error) throw error

      toast.success(
        isVerified 
          ? 'Agent verification removed' 
          : 'Agent verified successfully'
      )
      router.refresh()
    } catch (error) {
      console.error('Error updating agent:', error)
      toast.error('Failed to update agent')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={isVerified ? 'outline' : 'default'}
      size="sm"
      onClick={handleToggleVerification}
      disabled={isLoading}
      className={isVerified ? '' : 'bg-green-600 hover:bg-green-700'}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isVerified ? (
        <X className="mr-2 h-4 w-4" />
      ) : (
        <BadgeCheck className="mr-2 h-4 w-4" />
      )}
      {isVerified ? 'Remove Verification' : 'Verify Agent'}
    </Button>
  )
}
