import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, listingType?: 'sale' | 'rent'): string {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr${listingType === 'rent' ? '/mo' : ''}`
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L${listingType === 'rent' ? '/mo' : ''}`
  } else if (price >= 1000) {
    return `₹${(price / 1000).toFixed(1)}K${listingType === 'rent' ? '/mo' : ''}`
  }
  return `₹${price.toLocaleString('en-IN')}${listingType === 'rent' ? '/mo' : ''}`
}

export function formatArea(sqft: number): string {
  return `${sqft.toLocaleString('en-IN')} sq.ft`
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getPropertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    apartment: 'Apartment',
    house: 'House',
    villa: 'Villa',
    plot: 'Plot',
    commercial: 'Commercial',
    pg: 'PG/Hostel'
  }
  return labels[type] || type
}

export function getFurnishingLabel(furnishing: string | null): string {
  if (!furnishing) return 'N/A'
  const labels: Record<string, string> = {
    unfurnished: 'Unfurnished',
    'semi-furnished': 'Semi-Furnished',
    'fully-furnished': 'Fully Furnished'
  }
  return labels[furnishing] || furnishing
}

export function getTimeAgo(date: string): string {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`
  return past.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function getWhatsAppLink(phone: string, message?: string): string {
  const cleanPhone = phone.replace(/\D/g, '')
  const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`
  const encodedMessage = message ? encodeURIComponent(message) : ''
  return `https://wa.me/${formattedPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`
}
