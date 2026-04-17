import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const agentId = searchParams.get("agent_id")

  // Check if user is admin or agent
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const { data: agent } = await supabase
    .from("agents")
    .select("id")
    .eq("user_id", user.id)
    .single()

  const isAdmin = profile?.role === "admin"
  const isAgent = !!agent

  if (!isAdmin && !isAgent) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let query = supabase
    .from("leads")
    .select(`
      *,
      property:properties(id, title, slug, city:cities(name)),
      agent:agents(id, agency_name, profile:profiles(full_name))
    `)
    .order("created_at", { ascending: false })

  // Agents can only see their own leads
  if (!isAdmin && agent) {
    query = query.eq("agent_id", agent.id)
  } else if (agentId) {
    query = query.eq("agent_id", agentId)
  }

  if (status && status !== "all") {
    query = query.eq("status", status)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ leads: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const body = await request.json()
  const { property_id, name, phone, email, message, lead_type } = body

  if (!property_id || !name || !phone) {
    return NextResponse.json(
      { error: "Property ID, name, and phone are required" },
      { status: 400 }
    )
  }

  // Get property to find agent
  const { data: property } = await supabase
    .from("properties")
    .select("agent_id")
    .eq("id", property_id)
    .single()

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 })
  }

  // Get current user if logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const leadData = {
    property_id,
    agent_id: property.agent_id,
    user_id: user?.id || null,
    name,
    phone,
    email: email || null,
    message: message || null,
    lead_type: lead_type || "callback",
    status: "new",
  }

  const { data, error } = await supabase
    .from("leads")
    .insert(leadData)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ lead: data }, { status: 201 })
}
