import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MAKHARINSKIY',
    short_name: 'MAKHARINSKIY',
    description: 'Shopping, schedule, tasks and chat for the Makharinskiy family.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    icons: [
      { src: '/logo-icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/logo-icon.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
