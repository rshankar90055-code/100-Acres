import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await createClient()
  const { slug } = await params

  const { data, error } = await supabase
    .from("properties")
    .select(`
      *,
      city:cities(id, name, slug, state),
      agent:agents(
        id,
        agency_name,
        phone,
        whatsapp_number,
        is_verified,
        rating,
        total_reviews,
        profile:profiles(full_name, avatar_url, email)
      )
    `)
    .eq("slug", slug)
    .single()

  if (error) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 })
  }

  // Track view
  const { data: { user } } = await supabase.auth.getUser()
  if (data) {
    await supabase.from("property_views").insert({
      property_id: data.id,
      user_id: user?.id || null,
    })
  }

  return NextResponse.json({ property: data })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await createClient()
  const { slug } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get the property
  const { data: property } = await supabase
    .from("properties")
    .select("*, agent:agents(user_id)")
    .eq("slug", slug)
    .single()

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 })
  }

  // Check if user is the agent who owns this property or an admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const isOwner = property.agent?.user_id === user.id
  const isAdmin = profile?.role === "admin"

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()

  // If not admin, prevent changing verification status
  if (!isAdmin) {
    delete body.is_verified
    delete body.status
  }

  const { data, error } = await supabase
    .from("properties")
    .update(body)
    .eq("slug", slug)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ property: data })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await createClient()
  const { slug } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get the property
  const { data: property } = await supabase
    .from("properties")
    .select("*, agent:agents(user_id)")
    .eq("slug", slug)
    .single()

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 })
  }

  // Check if user is the agent who owns this property or an admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const isOwner = property.agent?.user_id === user.id
  const isAdmin = profile?.role === "admin"

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { error } = await supabase.from("properties").delete().eq("slug", slug)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
