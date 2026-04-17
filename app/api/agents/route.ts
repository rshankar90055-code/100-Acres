import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const cityId = searchParams.get("city_id")
  const verified = searchParams.get("verified")

  let query = supabase
    .from("agents")
    .select(`
      *,
      profile:profiles(full_name, avatar_url, email),
      city:cities(id, name, slug)
    `)
    .order("rating", { ascending: false })

  if (cityId) {
    query = query.eq("city_id", cityId)
  }

  if (verified === "true") {
    query = query.eq("is_verified", true)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ agents: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user is already an agent
  const { data: existingAgent } = await supabase
    .from("agents")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (existingAgent) {
    return NextResponse.json(
      { error: "You are already registered as an agent" },
      { status: 400 }
    )
  }

  const body = await request.json()
  const {
    agency_name,
    phone,
    whatsapp_number,
    city_id,
    areas_served,
    experience_years,
    rera_number,
    bio,
    languages,
  } = body

  if (!phone || !city_id) {
    return NextResponse.json(
      { error: "Phone and city are required" },
      { status: 400 }
    )
  }

  const agentData = {
    user_id: user.id,
    agency_name: agency_name || null,
    phone,
    whatsapp_number: whatsapp_number || phone,
    city_id,
    areas_served: areas_served || [],
    experience_years: experience_years || 0,
    rera_number: rera_number || null,
    bio: bio || null,
    languages: languages || ["English"],
    is_verified: false,
    subscription_status: "free",
    rating: 0,
    total_reviews: 0,
    total_properties: 0,
    total_leads: 0,
  }

  const { data, error } = await supabase
    .from("agents")
    .insert(agentData)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update user profile role to agent
  await supabase
    .from("profiles")
    .update({ role: "agent" })
    .eq("id", user.id)

  return NextResponse.json({ agent: data }, { status: 201 })
}
