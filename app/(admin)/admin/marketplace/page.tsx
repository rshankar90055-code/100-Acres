'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye, Laptop, Search } from 'lucide-react'
import { MarketplaceVerifyButton } from '@/components/admin/marketplace-verify-button'
import { MarketplaceStatusSelect } from '@/components/admin/marketplace-status-select'
import { formatMarketplacePrice, getMarketplaceCategoryLabel } from '@/lib/marketplace'

type MarketplaceAdminRow = {
  id: string
  title: string
  slug: string
  category: string
  subcategory: string | null
  price: number
  status: 'available' | 'pending' | 'sold'
  is_verified: boolean
  created_at: string
  city: { name: string } | null
  agent: {
    agency_name: string | null
    profile: { full_name: string | null } | null
  } | null
}

type MarketplaceQueryRow = {
  id: string
  title: string
  slug: string
  category: string
  subcategory: string | null
  price: number
  status: 'available' | 'pending' | 'sold'
  is_verified: boolean
  created_at: string
  city: { name: string }[] | { name: string } | null
  agent:
    | {
        agency_name: string | null
        profile: { full_name: string | null }[] | { full_name: string | null } | null
      }[]
    | {
        agency_name: string | null
        profile: { full_name: string | null }[] | { full_name: string | null } | null
      }
    | null
}

export default function AdminMarketplacePage() {
  const supabase = createClient()
  const [rows, setRows] = useState<MarketplaceAdminRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [verificationFilter, setVerificationFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    void fetchRows()
  }, [statusFilter, verificationFilter, categoryFilter])

  const fetchRows = async () => {
    setLoading(true)
    let query = supabase
      .from('marketplace_listings')
      .select(`
        id,
        title,
        slug,
        category,
        subcategory,
        price,
        status,
        is_verified,
        created_at,
        city:cities(name),
        agent:agents(
          agency_name,
          profile:profiles(full_name)
        )
      `)
      .order('created_at', { ascending: false })

    if (statusFilter !== 'all') query = query.eq('status', statusFilter)
    if (verificationFilter !== 'all') query = query.eq('is_verified', verificationFilter === 'verified')
    if (categoryFilter !== 'all') query = query.eq('category', categoryFilter)

    const { data } = await query
    const normalized = ((data || []) as MarketplaceQueryRow[]).map((row) => {
      const city = Array.isArray(row.city) ? row.city[0] : row.city
      const agent = Array.isArray(row.agent) ? row.agent[0] : row.agent
      const profile = agent?.profile ? (Array.isArray(agent.profile) ? agent.profile[0] : agent.profile) : null

      return {
        ...row,
        city: city || null,
        agent: agent
          ? {
              ...agent,
              profile,
            }
          : null,
      }
    })

    setRows(normalized)
    setLoading(false)
  }

  const filteredRows = rows.filter((row) => {
    const haystack = `${row.title} ${row.city?.name || ''} ${row.agent?.agency_name || ''}`.toLowerCase()
    return haystack.includes(searchQuery.toLowerCase())
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Marketplace Listings</h1>
        <p className="text-muted-foreground">Review, verify, and moderate non-property marketplace categories.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Laptop className="h-5 w-5" />
            Marketplace Moderation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search title, seller, city..."
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="car">Cars</SelectItem>
                <SelectItem value="bike">Bikes</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="appliance">Appliances</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="available">Available</SelectItem>
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
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Listing</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Listed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="max-w-xs">
                        <div className="truncate font-medium">{row.title}</div>
                        {row.subcategory ? <div className="text-xs text-muted-foreground">{row.subcategory}</div> : null}
                      </TableCell>
                      <TableCell>{getMarketplaceCategoryLabel(row.category)}</TableCell>
                      <TableCell>{row.city?.name || 'N/A'}</TableCell>
                      <TableCell>Rs. {formatMarketplacePrice(row.price)}</TableCell>
                      <TableCell>{row.agent?.profile?.full_name || row.agent?.agency_name || 'N/A'}</TableCell>
                      <TableCell>
                        <MarketplaceStatusSelect listingId={row.id} currentStatus={row.status} />
                      </TableCell>
                      <TableCell>
                        {row.is_verified ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge> : <Badge variant="secondary">Pending</Badge>}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/marketplace/${row.slug}`}>
                            <button className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background">
                              <Eye className="h-4 w-4" />
                            </button>
                          </Link>
                          <MarketplaceVerifyButton listingId={row.id} isVerified={row.is_verified} />
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
