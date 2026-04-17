import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const cityId = searchParams.get("city_id")
  const area = searchParams.get("area")

  if (!cityId) {
    return NextResponse.json(
      { error: "City ID is required" },
      { status: 400 }
    )
  }

  let query = supabase
    .from("area_insights")
    .select(`
      *,
      city:cities(name),
      agent:agents(
        agency_name,
        profile:profiles(full_name)
      )
    `)
    .eq("city_id", cityId)

  if (area) {
    query = query.eq("area_name", area)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ insights: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user is an agent
  const { data: agent } = await supabase
    .from("agents")
    .select("id, is_verified")
    .eq("user_id", user.id)
    .single()

  if (!agent) {
    return NextResponse.json(
      { error: "Only agents can add area insights" },
      { status: 403 }
    )
  }

  const body = await request.json()
  const {
    city_id,
    area_name,
    water_rating,
    safety_rating,
    connectivity_rating,
    road_rating,
    electricity_rating,
    water_notes,
    safety_notes,
    connectivity_notes,
    nearby_schools,
    nearby_hospitals,
    nearby_markets,
  } = body

  if (!city_id || !area_name) {
    return NextResponse.json(
      { error: "City and area name are required" },
      { status: 400 }
    )
  }

  const insightData = {
    city_id,
    area_name,
    agent_id: agent.id,
    water_rating: water_rating || 0,
    safety_rating: safety_rating || 0,
    connectivity_rating: connectivity_rating || 0,
    road_rating: road_rating || 0,
    electricity_rating: electricity_rating || 0,
    water_notes: water_notes || null,
    safety_notes: safety_notes || null,
    connectivity_notes: connectivity_notes || null,
    nearby_schools: nearby_schools || [],
    nearby_hospitals: nearby_hospitals || [],
    nearby_markets: nearby_markets || [],
  }

  const { data, error } = await supabase
    .from("area_insights")
    .upsert(insightData, {
      onConflict: "city_id,area_name",
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ insight: data }, { status: 201 })
}
