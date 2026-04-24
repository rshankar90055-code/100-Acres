'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ImagePlus, Loader2, Upload, Video, X } from 'lucide-react'
import type { City, MarketplaceListing } from '@/lib/types'
import {
  categoryLabels,
  generateMarketplaceSlug,
  marketplaceCategories,
  marketplaceConditionOptions,
  subcategoriesByCategory,
  vehicleFuelOptions,
  vehicleTransmissionOptions,
} from '@/lib/marketplace'
import {
  buildStoragePath,
  formatFileSize,
  PROPERTY_IMAGES_BUCKET,
  PROPERTY_VIDEOS_BUCKET,
  uploadFileWithProgress,
} from '@/lib/media'

interface MarketplaceFormProps {
  cities: City[]
  listing?: MarketplaceListing
  canManageMedia?: boolean
  mediaAccessLabel?: string
}

interface PendingUploadFile {
  id: string
  file: File
  previewUrl: string
}

const MAX_IMAGES = 10
const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024
const MAX_VIDEO_SIZE_BYTES = 250 * 1024 * 1024

export function MarketplaceForm({
  cities,
  listing,
  canManageMedia = false,
  mediaAccessLabel = 'Become an agent to add marketplace media.',
}: MarketplaceFormProps) {
  const router = useRouter()
  const isEditing = Boolean(listing)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [imageUploadProgress, setImageUploadProgress] = useState<Record<string, number>>({})
  const [videoUploadProgress, setVideoUploadProgress] = useState(0)
  const [isDraggingImages, setIsDraggingImages] = useState(false)
  const [isDraggingVideo, setIsDraggingVideo] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>(listing?.images || [])
  const [pendingImages, setPendingImages] = useState<PendingUploadFile[]>([])
  const [pendingVideo, setPendingVideo] = useState<PendingUploadFile | null>(null)
  const [formData, setFormData] = useState({
    title: listing?.title || '',
    description: listing?.description || '',
    category: listing?.category || '',
    subcategory: listing?.subcategory || '',
    listing_type: listing?.listing_type || 'sale',
    condition: listing?.condition || 'good',
    price: listing?.price?.toString() || '',
    city_id: listing?.city_id || '',
    locality: listing?.locality || '',
    address: listing?.address || '',
    brand: listing?.brand || '',
    model: listing?.model || '',
    year: listing?.year?.toString() || '',
    mileage_km: listing?.mileage_km?.toString() || '',
    fuel_type: listing?.fuel_type || '',
    transmission: listing?.transmission || '',
    owner_count: listing?.owner_count?.toString() || '',
    warranty_months: listing?.warranty_months?.toString() || '',
    contact_phone: listing?.contact_phone || '',
    contact_whatsapp: listing?.contact_whatsapp || '',
    is_active: listing?.is_active ?? true,
  })

  const category = formData.category as keyof typeof subcategoriesByCategory
  const availableSubcategories = useMemo(
    () => (category ? subcategoriesByCategory[category] || [] : []),
    [category],
  )
  const isVehicle = category === 'car' || category === 'bike'
  const isTech = category === 'electronics' || category === 'appliance'

  const addImageFiles = (files: File[]) => {
    if (!canManageMedia) {
      toast.error('Marketplace media upload is available for agent accounts.')
      return
    }
    const selectedImages = files.filter((file) => file.type.startsWith('image/'))
    const oversizedImage = selectedImages.find((file) => file.size > MAX_IMAGE_SIZE_BYTES)
    if (oversizedImage) {
      toast.error(`"${oversizedImage.name}" is larger than 20 MB.`)
      return
    }
    const availableSlots = MAX_IMAGES - imageUrls.length - pendingImages.length
    if (availableSlots <= 0) {
      toast.error(`You can upload up to ${MAX_IMAGES} images.`)
      return
    }
    const imagesToAdd = selectedImages.slice(0, availableSlots).map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }))
    setPendingImages((prev) => [...prev, ...imagesToAdd])
  }

  const setVideoFile = (file: File | null) => {
    if (!canManageMedia) {
      toast.error('Marketplace media upload is available for agent accounts.')
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
        const storagePath = buildStoragePath(userId, image.file, 'marketplace')
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

      let uploadedVideoUrl = listing?.video_url || null
      if (pendingVideo) {
        const storagePath = buildStoragePath(userId, pendingVideo.file, 'marketplace-videos')
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

      return { uploadedImageUrls, uploadedVideoUrl }
    } finally {
      setIsUploadingMedia(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: agent } = await supabase
        .from('agents')
        .select('id, whatsapp_number')
        .eq('user_id', user.id)
        .single()

      if (!agent) throw new Error('Agent account not found')

      const { uploadedImageUrls, uploadedVideoUrl } = await uploadMediaFiles(user.id)

      const payload = {
        title: formData.title,
        slug: listing?.slug || generateMarketplaceSlug(formData.title),
        description: formData.description || null,
        category: formData.category,
        subcategory: formData.subcategory || null,
        listing_type: formData.listing_type,
        condition: formData.condition || null,
        price: Number(formData.price),
        city_id: formData.city_id || null,
        locality: formData.locality || null,
        address: formData.address || null,
        brand: formData.brand || null,
        model: formData.model || null,
        year: formData.year ? Number(formData.year) : null,
        mileage_km: formData.mileage_km ? Number(formData.mileage_km) : null,
        fuel_type: formData.fuel_type || null,
        transmission: formData.transmission || null,
        owner_count: formData.owner_count ? Number(formData.owner_count) : null,
        warranty_months: formData.warranty_months ? Number(formData.warranty_months) : null,
        contact_phone: formData.contact_phone || null,
        contact_whatsapp: formData.contact_whatsapp || agent.whatsapp_number || null,
        images: [...imageUrls, ...uploadedImageUrls],
        video_url: uploadedVideoUrl,
        is_active: formData.is_active,
        agent_id: agent.id,
      }

      if (isEditing && listing) {
        const { error } = await supabase.from('marketplace_listings').update(payload).eq('id', listing.id)
        if (error) throw error
        toast.success('Marketplace listing updated.')
      } else {
        const { error } = await supabase.from('marketplace_listings').insert({
          ...payload,
          is_verified: false,
          is_featured: false,
          status: 'pending',
          view_count: 0,
        })
        if (error) throw error
        toast.success('Marketplace listing submitted.')
      }

      router.push('/agent/marketplace')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save marketplace listing.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Listing Basics</CardTitle>
          <CardDescription>Create a marketplace listing for cars, bikes, electronics, or appliances.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input id="title" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="mt-1.5" placeholder="e.g., 2022 Hyundai i20 Sportz in excellent condition" />
          </div>
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1.5" rows={4} placeholder="Tell buyers what makes this listing worth checking out." />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as MarketplaceListing['category'], subcategory: '' })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  {marketplaceCategories.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subcategory</Label>
              <Select value={formData.subcategory} onValueChange={(value) => setFormData({ ...formData, subcategory: value })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Choose subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubcategories.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Listing Type</Label>
              <Select value={formData.listing_type} onValueChange={(value) => setFormData({ ...formData, listing_type: value as MarketplaceListing['listing_type'] })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Condition</Label>
              <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value as NonNullable<MarketplaceListing['condition']> })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {marketplaceConditionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price">Price (Rs.) *</Label>
              <Input id="price" type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="mt-1.5" placeholder="e.g., 450000" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location & Contact</CardTitle>
          <CardDescription>Make the listing discoverable in the right locality.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>City *</Label>
              <Select value={formData.city_id} onValueChange={(value) => setFormData({ ...formData, city_id: value })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Choose city" />
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
              <Label htmlFor="locality">Locality</Label>
              <Input id="locality" value={formData.locality} onChange={(e) => setFormData({ ...formData, locality: e.target.value })} className="mt-1.5" placeholder="e.g., Kuvempunagar" />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="mt-1.5" placeholder="Street, landmark, pickup area" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input id="contact_phone" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="mt-1.5" placeholder="+91..." />
            </div>
            <div>
              <Label htmlFor="contact_whatsapp">WhatsApp</Label>
              <Input id="contact_whatsapp" value={formData.contact_whatsapp} onChange={(e) => setFormData({ ...formData, contact_whatsapp: e.target.value })} className="mt-1.5" placeholder="+91..." />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{category ? categoryLabels[category] : 'Category'} Specs</CardTitle>
          <CardDescription>Show the key details buyers compare first.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="mt-1.5" placeholder="e.g., Samsung, Hyundai, Bajaj" />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input id="model" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} className="mt-1.5" placeholder="e.g., i20, Galaxy S23, LG Front Load" />
            </div>
          </div>

          {(isVehicle || isTech) ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="year">{isTech ? 'Purchase Year' : 'Manufacturing Year'}</Label>
                <Input id="year" type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="mt-1.5" placeholder="e.g., 2022" />
              </div>
              {isVehicle ? (
                <div>
                  <Label htmlFor="mileage_km">Mileage / KM Run</Label>
                  <Input id="mileage_km" type="number" value={formData.mileage_km} onChange={(e) => setFormData({ ...formData, mileage_km: e.target.value })} className="mt-1.5" placeholder="e.g., 42000" />
                </div>
              ) : (
                <div>
                  <Label htmlFor="warranty_months">Warranty Left (months)</Label>
                  <Input id="warranty_months" type="number" value={formData.warranty_months} onChange={(e) => setFormData({ ...formData, warranty_months: e.target.value })} className="mt-1.5" placeholder="e.g., 8" />
                </div>
              )}
              <div>
                <Label htmlFor="owner_count">{isVehicle ? 'Owner Count' : 'Used By'}</Label>
                <Input id="owner_count" type="number" value={formData.owner_count} onChange={(e) => setFormData({ ...formData, owner_count: e.target.value })} className="mt-1.5" placeholder="e.g., 1" />
              </div>
            </div>
          ) : null}

          {isVehicle ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Fuel Type</Label>
                <Select value={formData.fuel_type} onValueChange={(value) => setFormData({ ...formData, fuel_type: value })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Choose fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleFuelOptions.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Transmission</Label>
                <Select value={formData.transmission} onValueChange={(value) => setFormData({ ...formData, transmission: value })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Choose transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTransmissionOptions.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
          <CardDescription>Upload listing photos directly from your device.</CardDescription>
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
            onDrop={(event) => {
              event.preventDefault()
              setIsDraggingImages(false)
              addImageFiles(Array.from(event.dataTransfer.files || []))
            }}
            className={`rounded-xl border border-dashed p-4 transition-colors ${
              isDraggingImages ? 'border-primary bg-primary/10' : 'border-border/80 bg-muted/20'
            }`}
          >
            <Label htmlFor="marketplace-images" className="flex cursor-pointer flex-col items-center gap-2 text-center">
              <ImagePlus className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">Drag and drop listing images here</p>
                <p className="text-sm text-muted-foreground">Upload up to {MAX_IMAGES} images, 20 MB each.</p>
              </div>
            </Label>
            <Input id="marketplace-images" type="file" accept="image/*" multiple className="mt-4" disabled={!canManageMedia} onChange={(event) => {
              addImageFiles(Array.from(event.target.files || []))
              event.target.value = ''
            }} />
          </div>
          <p className="text-sm text-muted-foreground">{mediaAccessLabel}</p>
          {(imageUrls.length > 0 || pendingImages.length > 0) ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {imageUrls.map((url) => (
                <div key={url} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
                  <img src={url} alt="Marketplace listing" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setImageUrls((prev) => prev.filter((item) => item !== url))} className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {pendingImages.map((image) => (
                <div key={image.id} className="group relative aspect-square overflow-hidden rounded-lg border border-dashed border-primary/40 bg-muted">
                  <img src={image.previewUrl} alt="Pending marketplace upload" className="h-full w-full object-cover" />
                  {isUploadingMedia ? (
                    <div className="absolute inset-x-2 bottom-2 rounded-md bg-background/95 p-2 shadow-sm">
                      <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="truncate pr-2">{image.file.name}</span>
                        <span>{imageUploadProgress[image.id] ?? 0}%</span>
                      </div>
                      <Progress value={imageUploadProgress[image.id] ?? 0} />
                    </div>
                  ) : null}
                  <button type="button" onClick={() => {
                    URL.revokeObjectURL(image.previewUrl)
                    setPendingImages((prev) => prev.filter((item) => item.id !== image.id))
                  }} className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Video</CardTitle>
          <CardDescription>Add a quick walkthrough or demo clip for the listing.</CardDescription>
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
            onDrop={(event) => {
              event.preventDefault()
              setIsDraggingVideo(false)
              setVideoFile(event.dataTransfer.files?.[0] || null)
            }}
            className={`rounded-xl border border-dashed p-4 transition-colors ${
              isDraggingVideo ? 'border-primary bg-primary/10' : 'border-border/80 bg-muted/20'
            }`}
          >
            <Label htmlFor="marketplace-video" className="flex cursor-pointer flex-col items-center gap-2 text-center">
              <Video className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">Drag and drop a video here</p>
                <p className="text-sm text-muted-foreground">Upload 1 video up to 250 MB.</p>
              </div>
            </Label>
            <Input id="marketplace-video" type="file" accept="video/*" className="mt-4" disabled={!canManageMedia} onChange={(event) => {
              setVideoFile(event.target.files?.[0] || null)
              event.target.value = ''
            }} />
          </div>
          {(listing?.video_url || pendingVideo) ? (
            <div className="space-y-2 rounded-lg border bg-card p-4">
              {pendingVideo ? (
                <>
                  <video src={pendingVideo.previewUrl} controls className="max-h-72 w-full rounded-lg bg-black" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{pendingVideo.file.name}</span>
                    <span>{isUploadingMedia ? `${videoUploadProgress}%` : formatFileSize(pendingVideo.file.size)}</span>
                  </div>
                  {isUploadingMedia ? <Progress value={videoUploadProgress} /> : null}
                </>
              ) : listing?.video_url ? (
                <video src={listing.video_url} controls className="max-h-72 w-full rounded-lg bg-black" />
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-3 p-6">
          <Checkbox id="marketplace-active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })} />
          <Label htmlFor="marketplace-active">Keep this listing active and visible</Label>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" size="lg" disabled={isSubmitting || isUploadingMedia}>
          {isSubmitting ? (
            <>
              {isUploadingMedia ? <Upload className="mr-2 h-4 w-4" /> : <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploadingMedia ? 'Uploading media...' : isEditing ? 'Updating...' : 'Publishing...'}
            </>
          ) : isEditing ? (
            'Update Listing'
          ) : (
            'Publish Listing'
          )}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
