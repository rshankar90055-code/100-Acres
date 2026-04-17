import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Check if user is also an agent
  const { data: agent } = await supabase
    .from("agents")
    .select(`
      *,
      city:cities(id, name, slug)
    `)
    .eq("user_id", user.id)
    .single()

  return NextResponse.json({
    profile,
    agent: agent || null,
    email: user.email,
  })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { full_name, phone, avatar_url, preferred_city_id } = body

  const updateData: Record<string, unknown> = {}
  if (full_name !== undefined) updateData.full_name = full_name
  if (phone !== undefined) updateData.phone = phone
  if (avatar_url !== undefined) updateData.avatar_url = avatar_url
  if (preferred_city_id !== undefined)
    updateData.preferred_city_id = preferred_city_id

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile: data })
}
