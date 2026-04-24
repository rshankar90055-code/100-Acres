import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '100acres',
    short_name: '100acres',
    description:
      'Verified properties in Karnataka with trusted local agents and city-based discovery.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafaf7',
    theme_color: '#4d8b62',
    icons: [
      {
        src: '/icon-light-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}