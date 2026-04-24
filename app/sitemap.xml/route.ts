import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { getDemoCities, getFeaturedDemoProperties } from '@/lib/site-data'
import { siteConfig } from '@/lib/site-config'

export const runtime = 'nodejs'
export const revalidate = 3600

type SitemapEntry = {
  url: string
  lastModified: string
  changeFrequency: 'daily' | 'weekly'
  priority: number
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toIsoString(value: string | Date) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

function createStaticEntries(now: Date): SitemapEntry[] {
  return [
    {
      url: siteConfig.siteUrl,
      lastModified: now.toISOString(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteConfig.siteUrl}/properties`,
      lastModified: now.toISOString(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]
}

function createFallbackEntries(): SitemapEntry[] {
  return [
    ...getDemoCities().map((city) => ({
      url: `${siteConfig.siteUrl}/city/${city.slug}`,
      lastModified: toIsoString(city.created_at),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...getFeaturedDemoProperties().map((property) => ({
      url: `${siteConfig.siteUrl}/properties/${property.slug}`,
      lastModified: toIsoString(property.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]
}

async function createDatabaseEntries(now: Date): Promise<SitemapEntry[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return createFallbackEntries()
  }

  try {
    const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    const [{ data: cities }, { data: properties }] = await Promise.all([
      supabase.from('cities').select('slug, created_at').eq('is_active', true),
      supabase
        .from('properties')
        .select('slug, updated_at')
        .eq('is_active', true)
        .eq('is_verified', true)
        .eq('status', 'available'),
    ])

    return [
      ...(cities || []).map((city) => ({
        url: `${siteConfig.siteUrl}/city/${city.slug}`,
        lastModified: city.created_at ? toIsoString(city.created_at) : now.toISOString(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      })),
      ...(properties || []).map((property) => ({
        url: `${siteConfig.siteUrl}/properties/${property.slug}`,
        lastModified: property.updated_at ? toIsoString(property.updated_at) : now.toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    ]
  } catch {
    return createFallbackEntries()
  }
}

function buildXml(entries: SitemapEntry[]) {
  const uniqueEntries = Array.from(
    new Map(entries.map((entry) => [entry.url, entry])).values(),
  )

  const body = uniqueEntries
    .map(
      (entry) => `  <url>\n    <loc>${escapeXml(entry.url)}</loc>\n    <lastmod>${entry.lastModified}</lastmod>\n    <changefreq>${entry.changeFrequency}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`
}

export async function GET() {
  const now = new Date()
  const entries = [
    ...createStaticEntries(now),
    ...(await createDatabaseEntries(now)),
  ]

  return new Response(buildXml(entries), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
