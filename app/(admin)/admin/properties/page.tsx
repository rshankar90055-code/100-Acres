"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Check, X, Eye, Search, Building2 } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

type PropertyWithAgent = {
  id: string
  title: string
  slug: string
  property_type: string
  listing_type: string
  price: number
  status: string
  is_verified: boolean
  created_at: string
  city: { name: string } | null
  agent: { 
    id: string
    agency_name: string | null
    profile: { full_name: string } | null
  } | null
}

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<PropertyWithAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [verificationFilter, setVerificationFilter] = useState<string>("all")
  const supabase = createClient()

  useEffect(() => {
    fetchProperties()
  }, [statusFilter, verificationFilter])

  async function fetchProperties() {
    setLoading(true)
    let query = supabase
      .from("properties")
      .select(`
        id,
        title,
        slug,
        property_type,
        listing_type,
        price,
        status,
        is_verified,
        created_at,
        city:cities(name),
        agent:agents(
          id,
          agency_name,
          profile:profiles(full_name)
        )
      `)
      .order("created_at", { ascending: false })

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter)
    }
    if (verificationFilter !== "all") {
      query = query.eq("is_verified", verificationFilter === "verified")
    }

    const { data, error } = await query

    if (!error && data) {
      setProperties(data as unknown as PropertyWithAgent[])
    }
    setLoading(false)
  }

  async function handleVerify(propertyId: string, verify: boolean) {
    const { error } = await supabase
      .from("properties")
      .update({ 
        is_verified: verify,
        status: verify ? "available" : "pending"
      })
      .eq("id", propertyId)

    if (!error) {
      fetchProperties()
    }
  }

  async function handleStatusChange(propertyId: string, status: string) {
    const { error } = await supabase
      .from("properties")
      .update({ status })
      .eq("id", propertyId)

    if (!error) {
      fetchProperties()
    }
  }

  const filteredProperties = properties.filter(
    (property) =>
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`
    }
    return `₹${price.toLocaleString("en-IN")}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Available</Badge>
      case "sold":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Sold</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground">
            Manage and verify property listings
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            All Properties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-muted-foreground">
              <Building2 className="mb-2 h-12 w-12" />
              <p>No properties found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Listed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProperties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {property.title}
                      </TableCell>
                      <TableCell>{property.city?.name || "N/A"}</TableCell>
                      <TableCell className="capitalize">
                        {property.property_type?.replace("_", " ")}
                      </TableCell>
                      <TableCell>{formatPrice(property.price)}</TableCell>
                      <TableCell>
                        {property.agent?.profile?.full_name || 
                         property.agent?.agency_name || 
                         "N/A"}
                      </TableCell>
                      <TableCell>{getStatusBadge(property.status)}</TableCell>
                      <TableCell>
                        {property.is_verified ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <Check className="mr-1 h-3 w-3" />
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <X className="mr-1 h-3 w-3" />
                            No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(property.created_at), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/properties/${property.slug}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {!property.is_verified && (
                            <Button
                              size="sm"
                              onClick={() => handleVerify(property.id, true)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          {property.is_verified && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleVerify(property.id, false)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
