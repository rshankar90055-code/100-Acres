import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ unreadCount: 0 })
  }

  const [{ data: profile }, { data: agent }] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', user.id).single(),
    supabase.from('agents').select('id').eq('user_id', user.id).single(),
  ])

  if (profile?.role === 'admin') {
    return NextResponse.json({ unreadCount: 0, route: '/admin/marketplace' })
  }

  if (agent?.id) {
    const { data: inquiries, error } = await supabase
      .from('marketplace_inquiries')
      .select('last_message_at, agent_last_read_at')
      .eq('agent_id', agent.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const unreadCount = (inquiries || []).filter((inquiry) => {
      if (!inquiry.last_message_at) return false
      if (!inquiry.agent_last_read_at) return true
      return new Date(inquiry.last_message_at).getTime() > new Date(inquiry.agent_last_read_at).getTime()
    }).length

    return NextResponse.json({ unreadCount, route: '/agent/marketplace/inquiries' })
  }

  const { data: inquiries, error } = await supabase
    .from('marketplace_inquiries')
    .select('last_message_at, buyer_last_read_at')
    .eq('buyer_user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const unreadCount = (inquiries || []).filter((inquiry) => {
    if (!inquiry.last_message_at) return false
    if (!inquiry.buyer_last_read_at) return true
    return new Date(inquiry.last_message_at).getTime() > new Date(inquiry.buyer_last_read_at).getTime()
  }).length

  return NextResponse.json({ unreadCount, route: '/marketplace-inquiries' })
}
