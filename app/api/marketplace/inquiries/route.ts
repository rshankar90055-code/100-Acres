import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const listingId = searchParams.get('listing_id')

  const [{ data: profile }, { data: agent }] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', user.id).single(),
    supabase.from('agents').select('id').eq('user_id', user.id).single(),
  ])

  let query = supabase
    .from('marketplace_inquiries')
    .select('*, listing:marketplace_listings(*, city:cities(*)), buyer:profiles!marketplace_inquiries_buyer_user_id_fkey(full_name, phone)')
    .order('updated_at', { ascending: false })

  if (profile?.role !== 'admin') {
    if (agent) {
      query = query.eq('agent_id', agent.id)
    } else {
      query = query.eq('buyer_user_id', user.id)
    }
  }

  if (listingId) {
    query = query.eq('listing_id', listingId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ inquiries: data || [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Please sign in to start a conversation.' }, { status: 401 })
  }

  const body = await request.json()
  const { listing_id, message } = body

  if (!listing_id || !message) {
    return NextResponse.json({ error: 'Listing and message are required.' }, { status: 400 })
  }

  const [{ data: listing }, { data: profile }] = await Promise.all([
    supabase
      .from('marketplace_listings')
      .select('id, agent_id, title')
      .eq('id', listing_id)
      .single(),
    supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('id', user.id)
      .single(),
  ])

  if (!listing) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
  }

  const { data: existing } = await supabase
    .from('marketplace_inquiries')
    .select('id')
    .eq('listing_id', listing_id)
    .eq('buyer_user_id', user.id)
    .maybeSingle()

  let inquiryId = existing?.id

  if (!inquiryId) {
    const { data: createdInquiry, error: inquiryError } = await supabase
      .from('marketplace_inquiries')
      .insert({
        listing_id,
        agent_id: listing.agent_id,
        buyer_user_id: user.id,
        buyer_name: profile?.full_name || 'Buyer',
        buyer_phone: profile?.phone || null,
        status: 'new',
        buyer_last_read_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (inquiryError || !createdInquiry) {
      return NextResponse.json({ error: inquiryError?.message || 'Could not create inquiry.' }, { status: 500 })
    }

    inquiryId = createdInquiry.id
  }

  const { data: createdMessage, error: messageError } = await supabase
    .from('marketplace_messages')
    .insert({
      inquiry_id: inquiryId,
      sender_user_id: user.id,
      sender_role: 'buyer',
      message,
    })
    .select()
    .single()

  if (messageError) {
    return NextResponse.json({ error: messageError.message }, { status: 500 })
  }

  await supabase
    .from('marketplace_inquiries')
    .update({
      status: 'new',
      updated_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
      buyer_last_read_at: new Date().toISOString(),
    })
    .eq('id', inquiryId)

  return NextResponse.json({ inquiry: { id: inquiryId }, message: createdMessage }, { status: 201 })
}
