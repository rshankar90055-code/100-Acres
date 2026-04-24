import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const city = searchParams.get("city")
  const type = searchParams.get("type")
  const listingType = searchParams.get("listing_type")
  const minPrice = searchParams.get("min_price")
  const maxPrice = searchParams.get("max_price")
  const minBedrooms = searchParams.get("min_bedrooms")
  const verified = searchParams.get("verified")
  const status = searchParams.get("status") || "available"
  const limit = parseInt(searchParams.get("limit") || "20")
  const offset = parseInt(searchParams.get("offset") || "0")
  const featured = searchParams.get("featured")

  let query = supabase
    .from("properties")
    .select(`
      *,
      city:cities(id, name, slug, state),
      agent:agents(
        id,
        user_id,
        agency_name,
        whatsapp_number,
        is_verified,
        review_count,
        properties_sold
      )
    `, { count: "exact" })
    .eq("is_verified", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (city) {
    query = query.eq("city_id", city)
  }

  if (type && type !== "all") {
    query = query.eq("property_type", type)
  }

  if (listingType && listingType !== "all") {
    query = query.eq("listing_type", listingType)
  }

  if (minPrice) {
    query = query.gte("price", parseInt(minPrice))
  }

  if (maxPrice) {
    query = query.lte("price", parseInt(maxPrice))
  }

  if (minBedrooms) {
    query = query.gte("bedrooms", parseInt(minBedrooms))
  }

  if (verified === "true") {
    query = query.eq("is_verified", true)
  }

  if (status && status !== "all") {
    query = query.eq("status", status)
  }

  if (featured === "true") {
    query = query.eq("is_featured", true)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    properties: data,
    total: count,
    limit,
    offset,
  })
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
      { error: "Only agents can create properties" },
      { status: 403 }
    )
  }

  const body = await request.json()

  // Generate slug from title
  const slug = body.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") +
    "-" +
    Date.now().toString(36)

  const propertyData = {
    ...body,
    slug,
    agent_id: agent.id,
    is_verified: false, // All properties start unverified
    status: "pending",
  }

  const { data, error } = await supabase
    .from("properties")
    .insert(propertyData)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (data?.id) {
    const { error: verificationError } = await supabase
      .from("property_verifications")
      .insert({
        property_id: data.id,
        agent_id: agent.id,
        status: "pending",
      })

    if (verificationError) {
      console.warn("Property verification workflow setup failed:", verificationError)
    }
  }

  return NextResponse.json({ property: data }, { status: 201 })
}
