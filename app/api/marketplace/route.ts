import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const q = searchParams.get('q')
  const category = searchParams.get('category')
  const city = searchParams.get('city')
  const minPrice = searchParams.get('min_price')
  const maxPrice = searchParams.get('max_price')
  const condition = searchParams.get('condition')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  let query = supabase
    .from('marketplace_listings')
    .select('*, city:cities(*), agent:agents(*, profile:profiles(*))', { count: 'exact' })
    .eq('is_active', true)
    .eq('is_verified', true)
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,brand.ilike.%${q}%,model.ilike.%${q}%`)
  }
  if (category && category !== 'all') query = query.eq('category', category)
  if (city && city !== 'all') query = query.eq('city_id', city)
  if (condition && condition !== 'all') query = query.eq('condition', condition)
  if (minPrice) query = query.gte('price', parseInt(minPrice))
  if (maxPrice) query = query.lte('price', parseInt(maxPrice))

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ listings: data, total: count, limit, offset })
}
