'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Loader2, Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { City, Property } from '@/lib/types'

interface PropertyFormProps {
  cities: City[]
  property?: Property
}

const propertyTypes = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'plot', label: 'Plot' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'pg', label: 'PG/Hostel' },
]

const listingTypes = [
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
]

const furnishingOptions = [
  { value: 'unfurnished', label: 'Unfurnished' },
  { value: 'semi-furnished', label: 'Semi-Furnished' },
  { value: 'fully-furnished', label: 'Fully Furnished' },
]

const facingOptions = [
  'North', 'South', 'East', 'West', 
  'North-East', 'North-West', 'South-East', 'South-West'
]

const commonAmenities = [
  'Parking', 'Gym', 'Swimming Pool', 'Garden', '24x7 Security',
  'Power Backup', 'Water Supply', 'Lift', 'Kids Play Area', 
  'Clubhouse', 'Intercom', 'CCTV', 'Fire Safety', 'Visitor Parking'
]

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36)
}

export function PropertyForm({ cities, property }: PropertyFormProps) {
  const router = useRouter()
  const isEditing = !!property
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: property?.title || '',
    description: property?.description || '',
    property_type: property?.property_type || '',
    listing_type: property?.listing_type || 'sale',
    price: property?.price?.toString() || '',
    city_id: property?.city_id || '',
    locality: property?.locality || '',
    address: property?.address || '',
    landmark: property?.landmark || '',
    bedrooms: property?.bedrooms?.toString() || '',
    bathrooms: property?.bathrooms?.toString() || '',
    area_sqft: property?.area_sqft?.toString() || '',
    floor_number: property?.floor_number?.toString() || '',
    total_floors: property?.total_floors?.toString() || '',
    furnishing: property?.furnishing || '',
    facing: property?.facing || '',
    age_of_property: property?.age_of_property || '',
    amenities: property?.amenities || [],
    is_active: property?.is_active ?? true,
  })
  const [imageUrls, setImageUrls] = useState<string[]>(property?.images || [])
  const [newImageUrl, setNewImageUrl] = useState('')

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const handleAddImage = () => {
    if (newImageUrl && !imageUrls.includes(newImageUrl)) {
      setImageUrls([...imageUrls, newImageUrl])
      setNewImageUrl('')
    }
  }

  const handleRemoveImage = (url: string) => {
    setImageUrls(imageUrls.filter((u) => u !== url))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get agent
      const { data: agent } = await supabase
        .from('agents')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!agent) throw new Error('Agent not found')

      const price = parseFloat(formData.price)
      const areaSqft = parseFloat(formData.area_sqft) || null

      const propertyData = {
        title: formData.title,
        slug: property?.slug || generateSlug(formData.title),
        description: formData.description || null,
        property_type: formData.property_type,
        listing_type: formData.listing_type,
        price,
        price_per_sqft: areaSqft ? Math.round(price / areaSqft) : null,
        city_id: formData.city_id || null,
        locality: formData.locality,
        address: formData.address || null,
        landmark: formData.landmark || null,
        bedrooms: parseInt(formData.bedrooms) || null,
        bathrooms: parseInt(formData.bathrooms) || null,
        area_sqft: areaSqft,
        floor_number: parseInt(formData.floor_number) || null,
        total_floors: parseInt(formData.total_floors) || null,
        furnishing: formData.furnishing || null,
        facing: formData.facing || null,
        age_of_property: formData.age_of_property || null,
        amenities: formData.amenities,
        images: imageUrls,
        is_active: formData.is_active,
        agent_id: agent.id,
      }

      if (isEditing) {
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', property.id)

        if (error) throw error
        toast.success('Property updated successfully')
      } else {
        const { error } = await supabase
          .from('properties')
          .insert({
            ...propertyData,
            status: 'available',
            view_count: 0,
            is_verified: false,
            is_featured: false,
          })

        if (error) throw error
        toast.success('Property listed successfully')
      }

      router.push('/agent/properties')
      router.refresh()
    } catch (error) {
      console.error('Error saving property:', error)
      toast.error('Failed to save property. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Property title and description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Property Title *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Spacious 2BHK Apartment in Whitefield"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your property..."
              className="mt-1.5"
              rows={4}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="property_type">Property Type *</Label>
              <Select
                value={formData.property_type}
                onValueChange={(value) => setFormData({ ...formData, property_type: value })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="listing_type">Listing Type *</Label>
              <Select
                value={formData.listing_type}
                onValueChange={(value) => setFormData({ ...formData, listing_type: value })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {listingTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="price">
              Price (Rs.) *
              {formData.listing_type === 'rent' && ' per month'}
            </Label>
            <Input
              id="price"
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="e.g., 5000000"
              className="mt-1.5"
            />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
          <CardDescription>Where is the property located?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="city_id">City *</Label>
              <Select
                value={formData.city_id}
                onValueChange={(value) => setFormData({ ...formData, city_id: value })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="locality">Locality/Area *</Label>
              <Input
                id="locality"
                required
                value={formData.locality}
                onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                placeholder="e.g., Whitefield"
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Full Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Building name, street address"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="landmark">Nearby Landmark</Label>
            <Input
              id="landmark"
              value={formData.landmark}
              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              placeholder="e.g., Near Phoenix Mall"
              className="mt-1.5"
            />
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
          <CardDescription>Size, configuration, and features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                min="0"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                placeholder="e.g., 2"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                min="0"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                placeholder="e.g., 2"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="area_sqft">Area (sq.ft)</Label>
              <Input
                id="area_sqft"
                type="number"
                min="0"
                value={formData.area_sqft}
                onChange={(e) => setFormData({ ...formData, area_sqft: e.target.value })}
                placeholder="e.g., 1200"
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="floor_number">Floor Number</Label>
              <Input
                id="floor_number"
                type="number"
                min="0"
                value={formData.floor_number}
                onChange={(e) => setFormData({ ...formData, floor_number: e.target.value })}
                placeholder="e.g., 5"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="total_floors">Total Floors</Label>
              <Input
                id="total_floors"
                type="number"
                min="0"
                value={formData.total_floors}
                onChange={(e) => setFormData({ ...formData, total_floors: e.target.value })}
                placeholder="e.g., 12"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="age_of_property">Age of Property</Label>
              <Input
                id="age_of_property"
                value={formData.age_of_property}
                onChange={(e) => setFormData({ ...formData, age_of_property: e.target.value })}
                placeholder="e.g., 3 years"
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="furnishing">Furnishing</Label>
              <Select
                value={formData.furnishing}
                onValueChange={(value) => setFormData({ ...formData, furnishing: value })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select furnishing" />
                </SelectTrigger>
                <SelectContent>
                  {furnishingOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="facing">Facing</Label>
              <Select
                value={formData.facing}
                onValueChange={(value) => setFormData({ ...formData, facing: value })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select facing" />
                </SelectTrigger>
                <SelectContent>
                  {facingOptions.map((facing) => (
                    <SelectItem key={facing} value={facing}>
                      {facing}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader>
          <CardTitle>Amenities</CardTitle>
          <CardDescription>Select available amenities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {commonAmenities.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity}
                  checked={formData.amenities.includes(amenity)}
                  onCheckedChange={() => handleAmenityToggle(amenity)}
                />
                <Label htmlFor={amenity} className="cursor-pointer text-sm">
                  {amenity}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
          <CardDescription>Add image URLs for your property</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Enter image URL"
              className="flex-1"
            />
            <Button type="button" onClick={handleAddImage} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {imageUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {imageUrls.map((url, index) => (
                <div key={index} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
                  <img
                    src={url}
                    alt={`Property image ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(url)}
                    className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, is_active: checked as boolean })
              }
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Make this listing active and visible to buyers
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? 'Updating...' : 'Publishing...'}
            </>
          ) : isEditing ? (
            'Update Property'
          ) : (
            'Publish Property'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
