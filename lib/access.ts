import type { Agent, Profile } from '@/lib/types'

export function hasActiveTrial(agent: Pick<Agent, 'trial_expires_at'> | null | undefined) {
  if (!agent?.trial_expires_at) return false
  return new Date(agent.trial_expires_at).getTime() > Date.now()
}

export function hasPaidSubscription(
  agent: Pick<Agent, 'subscription_tier' | 'subscription_expires_at'> | null | undefined,
) {
  if (!agent) return false
  if (agent.subscription_tier === 'free') return false
  if (!agent.subscription_expires_at) return true
  return new Date(agent.subscription_expires_at).getTime() > Date.now()
}

export function hasCreatorAccess(agent: Agent | null | undefined, profile?: Profile | null) {
  if (profile?.role === 'admin') return true
  return Boolean(agent)
}

export function getCreatorAccessLabel(agent: Agent | null | undefined, profile?: Profile | null) {
  if (profile?.role === 'admin') return 'Owner access'
  if (agent) return 'Free creator access enabled'
  return 'Become an agent to start posting'
}
