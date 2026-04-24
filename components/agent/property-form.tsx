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
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { ImagePlus, Loader2, Upload, Video, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  buildStoragePath,
  formatFileSize,
  PROPERTY_IMAGES_BUCKET,
  PROPERTY_VIDEOS_BUCKET,
  uploadFileWithProgress,
} from '@/lib/media'
import type { City, Property } from '@/lib/types'

interface PropertyFormProps {
  cities: City[]
  property?: Property
  canManageMedia?: boolean
  mediaAccessLabel?: string
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

const MAX_IMAGES = 10
const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024
const MAX_VIDEO_SIZE_BYTES = 250 * 1024 * 1024

interface PendingUploadFile {
  id: string
  file: File
  previewUrl: string
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36)
}

export function PropertyForm({
  cities,
  property,
  canManageMedia = false,
  mediaAccessLabel = 'Upgrade or start your free trial to add images and videos.',
}: PropertyFormProps) {
  const router = useRouter()
  const isEditing = !!property
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [imageUploadProgress, setImageUploadProgress] = useState<Record<string, number>>({})
  const [videoUploadProgress, setVideoUploadProgress] = useState(0)
  const [isDraggingImages, setIsDraggingImages] = useState(false)
  const [isDraggingVideo, setIsDraggingVideo] = useState(false)
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
    latitude: property?.latitude?.toString() || '',
    longitude: property?.longitude?.toString() || '',
    bedrooms: property?.bedrooms?.toString() || '',
    bathrooms: property?.bathrooms?.toString() || '',
    area_sqft: property?.area_sqft?.toString() || '',
    floor_number: property?.floor_number?.toString() || '',
    total_floors: property?.total_floors?.toString() || '',
    furnishing: property?.furnishing || '',
    facing: property?.facing || '',
    age_of_property: property?.age_of_property || '',
    video_url: property?.video_url || '',
    amenities: property?.amenities || [],
    is_active: property?.is_active ?? true,
  })
  const [imageUrls, setImageUrls] = useState<string[]>(property?.images || [])
  const [pendingImages, setPendingImages] = useState<PendingUploadFile[]>([])
  const [pendingVideo, setPendingVideo] = useState<PendingUploadFile | null>(null)

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const addImageFiles = (files: File[]) => {
    if (!canManageMedia) {
      toast.error('Only paid or free-trial creator accounts can upload property images.')
      return
    }
    if (files.length === 0) return

    const selectedImages = files.filter((file) => file.type.startsWith('image/'))
    if (selectedImages.length !== files.length) {
      toast.error('Only image files can be added in the image section.')
    }

    const oversizedImage = selectedImages.find((file) => file.size > MAX_IMAGE_SIZE_BYTES)
    if (oversizedImage) {
      toast.error(`"${oversizedImage.name}" is larger than 20 MB.`)
      return
    }

    const availableSlots = MAX_IMAGES - imageUrls.length - pendingImages.length
    if (availableSlots <= 0) {
      toast.error(`You can upload up to ${MAX_IMAGES} images per property.`)
      return
    }

    const imagesToAdd = selectedImages.slice(0, availableSlots).map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }))

    if (selectedImages.length > availableSlots) {
      toast.error(`Only ${availableSlots} more image(s) can be added.`)
    }

    setPendingImages((prev) => [...prev, ...imagesToAdd])
  }

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    addImageFiles(files)
    event.target.value = ''
  }

  const handleRemoveImage = (url: string) => {
    setImageUrls(imageUrls.filter((u) => u !== url))
  }

  const handleRemovePendingImage = (previewUrl: string) => {
    setPendingImages((prev) => {
      const imageToRemove = prev.find((image) => image.previewUrl === previewUrl)
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl)
      }
      return prev.filter((image) => image.previewUrl !== previewUrl)
    })
    setImageUploadProgress((prev) => {
      const next = { ...prev }
      const target = pendingImages.find((image) => image.previewUrl === previewUrl)
      if (target) {
        delete next[target.id]
      }
      return next
    })
  }

  const setVideoFile = (file: File | null) => {
    if (!canManageMedia) {
      toast.error('Only paid or free-trial creator accounts can upload property videos.')
      return
    }
    if (!file) return

    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file.')
      return
    }

    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      toast.error('Video file size must be 250 MB or less.')
      return
    }

    if (pendingVideo) {
      URL.revokeObjectURL(pendingVideo.previewUrl)
    }

    setPendingVideo({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    })
    setVideoUploadProgress(0)
    setFormData((prev) => ({ ...prev, video_url: '' }))
  }

  const handleVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setVideoFile(file)
    event.target.value = ''
  }

  const handleRemoveVideo = () => {
    if (pendingVideo) {
      URL.revokeObjectURL(pendingVideo.previewUrl)
    }
    setPendingVideo(null)
    setVideoUploadProgress(0)
    setFormData((prev) => ({ ...prev, video_url: '' }))
  }

  const uploadMediaFiles = async (userId: string) => {
    const supabase = createClient()

    setIsUploadingMedia(true)
    setImageUploadProgress({})
    setVideoUploadProgress(0)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }

      const uploadedImageUrls: string[] = []

      for (const image of pendingImages) {
        const storagePath = buildStoragePath(userId, image.file, 'listings')
        await uploadFileWithProgress(
          image.file,
          PROPERTY_IMAGES_BUCKET,
          storagePath,
          session.access_token,
          (progress) => {
            setImageUploadProgress((prev) => ({ ...prev, [image.id]: progress }))
          },
        )

        const { data } = supabase.storage.from(PROPERTY_IMAGES_BUCKET).getPublicUrl(storagePath)
        uploadedImageUrls.push(data.publicUrl)
      }

      let uploadedVideoUrl = formData.video_url || null
      if (pendingVideo) {
        const storagePath = buildStoragePath(userId, pendingVideo.file, 'tours')
        await uploadFileWithProgress(
          pendingVideo.file,
          PROPERTY_VIDEOS_BUCKET,
          storagePath,
          session.access_token,
          setVideoUploadProgress,
        )

        const { data } = supabase.storage.from(PROPERTY_VIDEOS_BUCKET).getPublicUrl(storagePath)
        uploadedVideoUrl = data.publicUrl
      }

      return {
        uploadedImageUrls,
        uploadedVideoUrl,
      }
    } finally {
      setIsUploadingMedia(false)
    }
  }

  const handleImageDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDraggingImages(false)
    addImageFiles(Array.from(event.dataTransfer.files || []))
  }

  const handleVideoDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDraggingVideo(false)
    setVideoFile(event.dataTransfer.files?.[0] || null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (!canManageMedia && (pendingImages.length > 0 || pendingVideo)) {
        throw new Error('Media uploads are available only for active paid or trial creator accounts.')
      }

      // Get agent
      const { data: agent } = await supabase
        .from('agents')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!agent) throw new Error('Agent not found')

      const { uploadedImageUrls, uploadedVideoUrl } = await uploadMediaFiles(user.id)

      const price = parseFloat(formData.price)
      const areaSqft = parseFloat(formData.area_sqft) || null
      const latitude = formData.latitude ? parseFloat(formData.latitude) : null
      const longitude = formData.longitude ? parseFloat(formData.longitude) : null

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
        latitude: Number.isFinite(latitude) ? latitude : null,
        longitude: Number.isFinite(longitude) ? longitude : null,
        bedrooms: parseInt(formData.bedrooms) || null,
        bathrooms: parseInt(formData.bathrooms) || null,
        area_sqft: areaSqft,
        floor_number: parseInt(formData.floor_number) || null,
        total_floors: parseInt(formData.total_floors) || null,
        furnishing: formData.furnishing || null,
        facing: formData.facing || null,
        age_of_property: formData.age_of_property || null,
        video_url: uploadedVideoUrl,
        amenities: formData.amenities,
        images: [...imageUrls, ...uploadedImageUrls],
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
        const { data: createdProperty, error } = await supabase
          .from('properties')
          .insert({
            ...propertyData,
            status: 'pending',
            view_count: 0,
            is_verified: false,
            is_featured: false,
          })
          .select('id')
          .single()

        if (error) throw error

        if (createdProperty?.id) {
          const { error: verificationError } = await supabase
            .from('property_verifications')
            .insert({
              property_id: createdProperty.id,
              agent_id: agent.id,
              status: 'pending',
            })

          if (verificationError) {
            console.warn('Property verification workflow setup failed:', verificationError)
          }
        }

        toast.success('Property submitted for verification')
      }

      pendingImages.forEach((image) => URL.revokeObjectURL(image.previewUrl))
      if (pendingVideo) {
        URL.revokeObjectURL(pendingVideo.previewUrl)
      }
      setPendingImages([])
      setPendingVideo(null)

      router.push('/agent/properties')
      router.refresh()
    } catch (error) {
      console.error('Error saving property:', error)
      const errorMessage = error instanceof Error ? error.message.toLowerCase() : ''
      const message =
        errorMessage.includes('bucket') ||
        errorMessage.includes('storage') ||
        errorMessage.includes('row-level security')
          ? 'Media storage is not ready yet. Run the new storage SQL script in Supabase first.'
          : errorMessage.includes('creator accounts')
            ? 'Only paid or free-trial creator accounts can upload property media.'
          : 'Failed to save property. Please try again.'
      toast.error(message)
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
                onValueChange={(value) =>
                  setFormData({ ...formData, property_type: value as Property['property_type'] })
                }
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
                onValueChange={(value) =>
                  setFormData({ ...formData, listing_type: value as Property['listing_type'] })
                }
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

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="e.g., 12.9716"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="e.g., 77.5946"
                className="mt-1.5"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Add map coordinates so your listing appears in location-based browsing.
          </p>
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
                onValueChange={(value) =>
                  setFormData({ ...formData, furnishing: value as NonNullable<Property['furnishing']> })
                }
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
          <CardDescription>Upload property photos directly from your device</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDragOver={(event) => {
              event.preventDefault()
              setIsDraggingImages(true)
            }}
            onDragLeave={(event) => {
              event.preventDefault()
              setIsDraggingImages(false)
            }}
            onDrop={handleImageDrop}
            className={`rounded-xl border border-dashed p-4 transition-colors ${
              isDraggingImages
                ? 'border-primary bg-primary/10'
                : 'border-border/80 bg-muted/20'
            }`}
          >
            <Label htmlFor="property-images" className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm">
                <ImagePlus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Drag and drop property images here</p>
                <p className="text-sm text-muted-foreground">
                  Or click to browse. Upload up to {MAX_IMAGES} images, 20 MB each.
                </p>
              </div>
            </Label>
            <Input
              id="property-images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageFileChange}
              className="mt-4"
              disabled={!canManageMedia}
            />
          </div>
          <p className="text-sm text-muted-foreground">{mediaAccessLabel}</p>

          {(imageUrls.length > 0 || pendingImages.length > 0) && (
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
              {pendingImages.map((image, index) => (
                <div
                  key={image.previewUrl}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-dashed border-primary/40 bg-muted"
                >
                  <img
                    src={image.previewUrl}
                    alt={`New property image ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-2 top-2 rounded-full bg-primary/85 px-2 py-1 text-[11px] font-medium text-primary-foreground">
                    New
                  </div>
                  {isUploadingMedia && (
                    <div className="absolute inset-x-2 bottom-2 rounded-md bg-background/95 p-2 shadow-sm">
                      <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="truncate pr-2">{image.file.name}</span>
                        <span>{imageUploadProgress[image.id] ?? 0}%</span>
                      </div>
                      <Progress value={imageUploadProgress[image.id] ?? 0} />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemovePendingImage(image.previewUrl)}
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

      {/* Video */}
      <Card>
        <CardHeader>
          <CardTitle>Video Tour</CardTitle>
          <CardDescription>Upload a walkthrough video directly from your device</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDragOver={(event) => {
              event.preventDefault()
              setIsDraggingVideo(true)
            }}
            onDragLeave={(event) => {
              event.preventDefault()
              setIsDraggingVideo(false)
            }}
            onDrop={handleVideoDrop}
            className={`rounded-xl border border-dashed p-4 transition-colors ${
              isDraggingVideo
                ? 'border-primary bg-primary/10'
                : 'border-border/80 bg-muted/20'
            }`}
          >
            <Label htmlFor="property-video" className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Drag and drop a video here</p>
                <p className="text-sm text-muted-foreground">
                  Or click to browse. Upload 1 video up to 250 MB.
                </p>
              </div>
            </Label>
            <Input
              id="property-video"
              type="file"
              accept="video/*"
              onChange={handleVideoFileChange}
              className="mt-4"
              disabled={!canManageMedia}
            />
          </div>
          <p className="text-sm text-muted-foreground">{mediaAccessLabel}</p>

          {(formData.video_url || pendingVideo) && (
            <div className="space-y-3 rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">Current video</p>
                  <p className="text-sm text-muted-foreground">
                    {pendingVideo ? pendingVideo.file.name : 'Saved video will remain attached to this property.'}
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleRemoveVideo}>
                  <X className="mr-2 h-4 w-4" />
                  Remove video
                </Button>
              </div>

              {pendingVideo ? (
                <>
                  <video src={pendingVideo.previewUrl} controls className="max-h-64 w-full rounded-lg bg-black" />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{pendingVideo.file.name}</span>
                      <span>{isUploadingMedia ? `${videoUploadProgress}%` : formatFileSize(pendingVideo.file.size)}</span>
                    </div>
                    {isUploadingMedia ? <Progress value={videoUploadProgress} /> : null}
                  </div>
                </>
              ) : formData.video_url ? (
                <video src={formData.video_url} controls className="max-h-64 w-full rounded-lg bg-black" />
              ) : null}
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
        <Button type="submit" size="lg" disabled={isSubmitting || isUploadingMedia}>
          {isSubmitting ? (
            <>
              {isUploadingMedia ? (
                <Upload className="mr-2 h-4 w-4" />
              ) : (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isUploadingMedia
                ? 'Uploading media...'
                : isEditing
                  ? 'Updating...'
                  : 'Publishing...'}
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
