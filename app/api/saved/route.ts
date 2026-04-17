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

  const { data, error } = await supabase
    .from("saved_properties")
    .select(`
      id,
      created_at,
      property:properties(
        id,
        title,
        slug,
        price,
        property_type,
        listing_type,
        bedrooms,
        bathrooms,
        area_sqft,
        images,
        status,
        is_verified,
        city:cities(name)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ saved: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { property_id } = body

  if (!property_id) {
    return NextResponse.json(
      { error: "Property ID is required" },
      { status: 400 }
    )
  }

  // Check if already saved
  const { data: existing } = await supabase
    .from("saved_properties")
    .select("id")
    .eq("user_id", user.id)
    .eq("property_id", property_id)
    .single()

  if (existing) {
    return NextResponse.json(
      { error: "Property already saved" },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from("saved_properties")
    .insert({
      user_id: user.id,
      property_id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ saved: data }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const propertyId = searchParams.get("property_id")

  if (!propertyId) {
    return NextResponse.json(
      { error: "Property ID is required" },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from("saved_properties")
    .delete()
    .eq("user_id", user.id)
    .eq("property_id", propertyId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
