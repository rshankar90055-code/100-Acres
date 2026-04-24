export const PROFILE_IMAGES_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_PROFILE_IMAGES_BUCKET || 'profile-images'
export const PROPERTY_IMAGES_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_PROPERTY_IMAGES_BUCKET || 'property-images'
export const PROPERTY_VIDEOS_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_PROPERTY_VIDEOS_BUCKET || 'property-videos'
export const REEL_VIDEOS_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_REEL_VIDEOS_BUCKET || 'reel-videos'

export function sanitizeFileName(fileName: string) {
  return fileName.toLowerCase().replace(/[^a-z0-9.-]+/g, '-')
}

export function buildStoragePath(userId: string, file: File, folder?: string) {
  const prefix = folder ? `${folder}/` : ''
  return `${userId}/${prefix}${Date.now()}-${crypto.randomUUID()}-${sanitizeFileName(file.name)}`
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export async function uploadFileWithProgress(
  file: File,
  bucket: string,
  storagePath: string,
  accessToken: string,
  onProgress: (progress: number) => void,
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are missing.')
  }

  const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${storagePath}`

  await new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('POST', uploadUrl)
    request.setRequestHeader('apikey', supabaseAnonKey)
    request.setRequestHeader('Authorization', `Bearer ${accessToken}`)
    request.setRequestHeader('x-upsert', 'false')
    request.setRequestHeader('content-type', file.type || 'application/octet-stream')

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) return
      onProgress(Math.round((event.loaded / event.total) * 100))
    }

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress(100)
        resolve()
        return
      }

      reject(new Error(request.responseText || `Upload failed with status ${request.status}`))
    }

    request.onerror = () => reject(new Error('Upload failed. Please check your connection and try again.'))
    request.send(file)
  })
}
