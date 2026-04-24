const fallbackSiteUrl = 'https://100-acres.vercel.app'

function normalizeSiteUrl(siteUrl?: string | null) {
  const value = siteUrl?.trim()

  if (!value) {
    return fallbackSiteUrl
  }

  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`
  return withProtocol.replace(/\/$/, '')
}

export const siteConfig = {
  name: '100acres',
  title: '100acres - Local Marketplace for Property and Listing Videos',
  description:
    'Discover verified properties, listing videos, and local marketplace activity on 100acres. Start with real estate today and grow into community buying and selling.',
  keywords: [
    'real estate',
    'local marketplace',
    'listing videos',
    'buy sell app',
    'Karnataka property',
    'verified property listings',
    'Mysuru real estate',
    'Hubli properties',
    'Davangere homes',
    'trusted local agents',
  ],
  siteUrl: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
}

export function toAbsoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${siteConfig.siteUrl}${normalizedPath}`
}
