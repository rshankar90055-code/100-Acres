import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface Params {
  params: Promise<{ id: string }>
}

async function ensureAccess(inquiryId: string, userId: string) {
  const supabase = await createClient()

  const [{ data: profile }, { data: agent }, { data: inquiry }] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', userId).single(),
    supabase.from('agents').select('id').eq('user_id', userId).single(),
    supabase.from('marketplace_inquiries').select('id, buyer_user_id, agent_id').eq('id', inquiryId).single(),
  ])

  if (!inquiry) return { allowed: false as const, inquiry: null, isAgentParticipant: false }
  if (profile?.role === 'admin') return { allowed: true as const, inquiry, isAgentParticipant: false }
  if (inquiry.buyer_user_id === userId) return { allowed: true as const, inquiry, isAgentParticipant: false }
  if (agent?.id && inquiry.agent_id === agent.id) return { allowed: true as const, inquiry, isAgentParticipant: true }
  return { allowed: false as const, inquiry, isAgentParticipant: false }
}

export async function GET(_request: NextRequest, context: Params) {
  const { id } = await context.params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const access = await ensureAccess(id, user.id)
  if (!access.allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('marketplace_messages')
    .select('*')
    .eq('inquiry_id', id)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (access.isAgentParticipant) {
    await supabase
      .from('marketplace_inquiries')
      .update({ agent_last_read_at: new Date().toISOString() })
      .eq('id', id)
  } else if (access.inquiry?.buyer_user_id === user.id) {
    await supabase
      .from('marketplace_inquiries')
      .update({ buyer_last_read_at: new Date().toISOString() })
      .eq('id', id)
  }

  return NextResponse.json({ messages: data || [] })
}

export async function POST(request: NextRequest, context: Params) {
  const { id } = await context.params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!message) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
  }

  const access = await ensureAccess(id, user.id)
  if (!access.allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const senderRole = access.isAgentParticipant ? 'agent' : 'buyer'

  const { data, error } = await supabase
    .from('marketplace_messages')
    .insert({
      inquiry_id: id,
      sender_user_id: user.id,
      sender_role: senderRole,
      message,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase
    .from('marketplace_inquiries')
    .update({
      status: senderRole === 'agent' ? 'replied' : 'new',
      updated_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
      ...(senderRole === 'agent'
        ? { agent_last_read_at: new Date().toISOString() }
        : { buyer_last_read_at: new Date().toISOString() }),
    })
    .eq('id', id)

  return NextResponse.json({ message: data }, { status: 201 })
}
