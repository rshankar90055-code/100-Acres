'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Camera, Loader2, Phone, Shield, Trash2, Upload, User, X } from 'lucide-react'
import {
  buildStoragePath,
  formatFileSize,
  PROFILE_IMAGES_BUCKET,
  uploadFileWithProgress,
} from '@/lib/media'
import { formatPhoneForDisplay } from '@/lib/phone'
import type { Profile } from '@/lib/types'

const MAX_PROFILE_IMAGE_SIZE_BYTES = 10 * 1024 * 1024

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarUploadProgress, setAvatarUploadProgress] = useState(0)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  })
  const [pendingAvatar, setPendingAvatar] = useState<{ file: File; previewUrl: string } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser({ id: user.id })

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setProfile(profile)
        setFormData({
          full_name: profile.full_name || '',
          phone: profile.phone || '',
        })
      }
      setIsLoading(false)
    }

    fetchData()
  }, [router, supabase])

  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleAvatarFile = (file: File | null) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file for your profile photo.')
      return
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
      toast.error('Profile image must be 10 MB or less.')
      return
    }

    if (pendingAvatar) {
      URL.revokeObjectURL(pendingAvatar.previewUrl)
    }

    setPendingAvatar({
      file,
      previewUrl: URL.createObjectURL(file),
    })
    setAvatarUploadProgress(0)
  }

  const handleAvatarUpload = async () => {
    if (!user || !pendingAvatar) return

    setIsUploadingAvatar(true)
    setAvatarUploadProgress(0)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }

      const storagePath = buildStoragePath(user.id, pendingAvatar.file, 'avatars')
      await uploadFileWithProgress(
        pendingAvatar.file,
        PROFILE_IMAGES_BUCKET,
        storagePath,
        session.access_token,
        setAvatarUploadProgress,
      )

      const { data } = supabase.storage.from(PROFILE_IMAGES_BUCKET).getPublicUrl(storagePath)
      const avatarUrl = data.publicUrl

      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(updatedProfile)
      URL.revokeObjectURL(pendingAvatar.previewUrl)
      setPendingAvatar(null)
      toast.success('Profile photo updated successfully')
    } catch (error) {
      console.error('Error uploading profile image:', error)
      const errorMessage = error instanceof Error ? error.message.toLowerCase() : ''
      const message =
        errorMessage.includes('bucket') ||
        errorMessage.includes('storage') ||
        errorMessage.includes('row-level security')
          ? 'Profile image storage is not ready yet. Run the storage SQL script in Supabase first.'
          : 'Failed to upload profile photo.'
      toast.error(message)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleRemovePendingAvatar = () => {
    if (pendingAvatar) {
      URL.revokeObjectURL(pendingAvatar.previewUrl)
    }
    setPendingAvatar(null)
    setAvatarUploadProgress(0)
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground">
        Settings
      </h1>

      {/* Profile Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={pendingAvatar?.previewUrl || profile?.avatar_url || undefined}
                alt={formData.full_name || 'User'}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                {getInitials(formData.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <p className="font-medium text-foreground">
                {formData.full_name || 'User'}
              </p>
              <p className="text-sm text-muted-foreground">
                {profile?.phone ? formatPhoneForDisplay(profile.phone) : 'Phone account'}
              </p>
              <div className="space-y-3 rounded-xl border border-dashed border-border/80 bg-muted/20 p-4">
                <Label htmlFor="avatar-upload" className="flex cursor-pointer items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-sm">
                    <Camera className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Choose profile photo</p>
                    <p className="text-sm text-muted-foreground">Upload an image up to 10 MB.</p>
                  </div>
                </Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    handleAvatarFile(event.target.files?.[0] || null)
                    event.target.value = ''
                  }}
                />

                {pendingAvatar ? (
                  <div className="space-y-2 rounded-lg border bg-card p-3">
                    <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                      <span className="truncate">{pendingAvatar.file.name}</span>
                      <span>{isUploadingAvatar ? `${avatarUploadProgress}%` : formatFileSize(pendingAvatar.file.size)}</span>
                    </div>
                    {isUploadingAvatar ? <Progress value={avatarUploadProgress} /> : null}
                    <div className="flex gap-2">
                      <Button type="button" size="sm" onClick={handleAvatarUpload} disabled={isUploadingAvatar}>
                        {isUploadingAvatar ? (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Uploading...
                          </>
                        ) : (
                          'Upload Photo'
                        )}
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={handleRemovePendingAvatar} disabled={isUploadingAvatar}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <Separator />

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                placeholder="Enter your full name"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="phone">Verified Mobile Number</Label>
              <div className="relative mt-1.5">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+91 98765 43210"
                  className="pl-10"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                This number is used for OTP login and creator access checks.
              </p>
            </div>
          </div>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your session and verified phone account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sign Out</p>
              <p className="text-sm text-muted-foreground">
                Sign out of your phone-authenticated account
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
